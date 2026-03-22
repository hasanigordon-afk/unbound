/**
 * UNBOUND Weekly Progress Summary
 * 
 * Runs every Sunday. Generates:
 * - Participant summary: streaks, goals, wins, encouragement
 * - Counselor summary: engagement rates, risk flags, follow-up list
 * 
 * Sends in-app notifications + email if opted in.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

function today() {
  return new Date().toISOString().split('T')[0];
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function getStreak(checkIns) {
  const sorted = [...checkIns].sort((a, b) => new Date(b.check_in_date) - new Date(a.check_in_date));
  let count = 0, cur = new Date(); cur.setHours(0, 0, 0, 0);
  for (const c of sorted) {
    const d = new Date(c.check_in_date); d.setHours(0, 0, 0, 0);
    if (Math.round((cur - d) / 86400000) <= 1) { count++; cur = d; } else break;
  }
  return count;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const isAuth = await base44.auth.isAuthenticated();
    if (isAuth) {
      const user = await base44.auth.me();
      if (user?.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const config = await base44.asServiceRole.entities.AutomationConfig.filter({ automation_key: 'weekly_summary' });
    if (config[0]?.is_enabled === false) {
      return Response.json({ skipped: true, reason: 'automation_disabled' });
    }

    const [profiles, allCheckIns, allGoals, prefs] = await Promise.all([
      base44.asServiceRole.entities.ParticipantProfile.list(),
      base44.asServiceRole.entities.DailyCheckIn.list('-check_in_date', 5000),
      base44.asServiceRole.entities.Goal.list('-created_date', 2000),
      base44.asServiceRole.entities.NotificationPreference.list(),
    ]);

    const sevenDaysAgo = daysAgo(7);
    let participantsSent = 0;
    const counselorData = {}; // keyed by counselor email

    for (const profile of profiles) {
      const email = profile.participant_email;
      const pref = prefs.find(p => p.user_email === email);
      if (pref && !pref.weekly_summary) continue;

      const myCheckIns = allCheckIns.filter(c => c.participant_email === email);
      const last7 = myCheckIns.filter(c => new Date(c.check_in_date) >= sevenDaysAgo);
      const streak = getStreak(myCheckIns);

      const completedGoals = allGoals.filter(g =>
        (g.participant_email === email || g.created_by === email) &&
        g.status === 'completed' &&
        new Date(g.updated_date) >= sevenDaysAgo
      );
      const activeGoals = allGoals.filter(g =>
        (g.participant_email === email || g.created_by === email) &&
        g.status === 'active'
      );

      const avgMood = last7.length
        ? (last7.reduce((s, c) => s + (c.mood_rating || 0), 0) / last7.length).toFixed(1)
        : null;

      const weeklyMeetings = last7.filter(c => c.attended_meeting).length;

      // Build encouraging message
      let highlight = '';
      if (streak >= 7) highlight = `🔥 You're on a ${streak}-day streak!`;
      else if (last7.length >= 5) highlight = `✅ You checked in ${last7.length} of 7 days this week — strong work!`;
      else if (completedGoals.length > 0) highlight = `🏆 You completed ${completedGoals.length} goal${completedGoals.length > 1 ? 's' : ''} this week!`;
      else highlight = `💙 Keep going — every day you show up matters.`;

      const bodyLines = [
        highlight,
        last7.length > 0 ? `Check-ins this week: ${last7.length}/7` : null,
        weeklyMeetings > 0 ? `Meetings attended: ${weeklyMeetings}` : null,
        avgMood ? `Average mood: ${avgMood}/5` : null,
        activeGoals.length > 0 ? `Active goals: ${activeGoals.length}` : null,
      ].filter(Boolean);

      await base44.asServiceRole.entities.InAppNotification.create({
        recipient_email: email,
        type: 'weekly_summary',
        title: "Your weekly progress summary 📊",
        body: bodyLines.join(' · '),
        action_url: '/Profile',
        action_label: 'View My Progress',
        priority: 'low',
        is_read: false,
        dismissed: false,
        automation_key: 'weekly_summary',
        expires_at: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      });
      participantsSent++;

      // Aggregate for counselor report
      if (profile.assigned_counselor_email) {
        const ce = profile.assigned_counselor_email;
        if (!counselorData[ce]) counselorData[ce] = { participants: [], high_risk: [], needs_followup: [] };
        const riskLevel = last7.length === 0 ? 'high' : last7.some(c => c.relapse_risk_flag) ? 'high' : 'low';
        counselorData[ce].participants.push({ email, checkins: last7.length, streak, avgMood, riskLevel });
        if (riskLevel === 'high') counselorData[ce].high_risk.push(email);
        if (last7.length < 3) counselorData[ce].needs_followup.push(email);
      }
    }

    // Send counselor weekly summaries
    let counselorsSent = 0;
    for (const [counselorEmail, data] of Object.entries(counselorData)) {
      const total = data.participants.length;
      const activeCount = data.participants.filter(p => p.checkins >= 3).length;
      const highRiskCount = data.high_risk.length;
      const followupCount = data.needs_followup.length;

      await base44.asServiceRole.entities.InAppNotification.create({
        recipient_email: counselorEmail,
        type: 'weekly_summary',
        title: `Weekly caseload summary — ${total} participants`,
        body: `Active (3+ check-ins): ${activeCount} · High risk: ${highRiskCount} · Needs follow-up: ${followupCount}`,
        action_url: '/AftercareMonitoring',
        action_label: 'View Caseload',
        priority: highRiskCount > 0 ? 'high' : 'medium',
        is_read: false,
        dismissed: false,
        automation_key: 'weekly_summary',
        expires_at: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      });

      // Email counselor if follow-up needed
      if (followupCount > 0) {
        const rows = data.needs_followup.slice(0, 10)
          .map(e => `<tr><td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;">${e.split('@')[0]}</td><td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;color:#EF4444;">Low engagement</td></tr>`)
          .join('');

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: counselorEmail,
          subject: `Unbound Weekly Summary — ${followupCount} participant${followupCount > 1 ? 's' : ''} need follow-up`,
          body: `
<div style="font-family:-apple-system,sans-serif;max-width:560px;margin:0 auto;color:#1E1E1E;">
  <div style="background:#0E1D3A;padding:20px 24px;border-radius:8px 8px 0 0;">
    <p style="color:#3ECFBF;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;margin:0 0 4px;">Unbound Weekly Summary</p>
    <p style="color:#fff;font-size:18px;font-weight:800;margin:0;">Your Caseload This Week</p>
  </div>
  <div style="background:#fff;border:1px solid #E5E7EB;border-top:none;padding:24px;border-radius:0 0 8px 8px;">
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:20px;">
      <div style="background:#F0FDF4;border-radius:8px;padding:14px;text-align:center;">
        <p style="font-size:28px;font-weight:900;color:#10B981;margin:0;">${activeCount}</p>
        <p style="font-size:12px;color:#6B7280;margin:4px 0 0;">Active</p>
      </div>
      <div style="background:${highRiskCount > 0 ? '#FEF2F2' : '#F0FDF4'};border-radius:8px;padding:14px;text-align:center;">
        <p style="font-size:28px;font-weight:900;color:${highRiskCount > 0 ? '#EF4444' : '#10B981'};margin:0;">${highRiskCount}</p>
        <p style="font-size:12px;color:#6B7280;margin:4px 0 0;">High Risk</p>
      </div>
      <div style="background:#FFFBEB;border-radius:8px;padding:14px;text-align:center;">
        <p style="font-size:28px;font-weight:900;color:#F59E0B;margin:0;">${followupCount}</p>
        <p style="font-size:12px;color:#6B7280;margin:4px 0 0;">Follow-up</p>
      </div>
    </div>
    <p style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#8E8E93;margin-bottom:8px;">Participants Needing Follow-Up</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">${rows}</table>
    <p style="font-size:12px;color:#8E8E93;margin-top:20px;">Log in to Unbound to view full details and take action.</p>
  </div>
</div>`,
        });
      }
      counselorsSent++;
    }

    await base44.asServiceRole.entities.AutomationLog.create({
      automation_key: 'weekly_summary',
      run_date: today(),
      status: 'success',
      participants_processed: profiles.length,
      notifications_sent: participantsSent + counselorsSent,
      alerts_created: 0,
      summary: { participantsSent, counselorsSent },
    });

    return Response.json({
      success: true,
      participants_sent: participantsSent,
      counselors_sent: counselorsSent,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});