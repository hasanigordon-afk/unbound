import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin' && user.role !== 'counselor') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const profiles = await base44.asServiceRole.entities.ParticipantProfile.list();
    const today = new Date().toISOString().split('T')[0];
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 14);

    const allCheckIns = await base44.asServiceRole.entities.DailyCheckIn.list('-check_in_date', 2000);
    const existingAlerts = await base44.asServiceRole.entities.EngagementAlert.filter({ status: 'active' });

    let created = 0;
    const results = [];

    for (const profile of profiles) {
      const email = profile.participant_email;
      if (!email) continue;

      const myCheckIns = allCheckIns
        .filter(c => c.participant_email === email)
        .sort((a, b) => new Date(b.check_in_date) - new Date(a.check_in_date));

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const last7 = myCheckIns.filter(c => new Date(c.check_in_date) >= sevenDaysAgo);
      const last3 = myCheckIns.slice(0, 3);
      const last5 = myCheckIns.slice(0, 5);

      const lastCheckIn = myCheckIns[0]?.check_in_date || null;
      const daysSince = lastCheckIn
        ? Math.floor((new Date() - new Date(lastCheckIn)) / 86400000)
        : 99;

      const avgCraving = last7.length
        ? last7.reduce((s, c) => s + (c.craving_intensity ?? 5), 0) / last7.length
        : 5;

      // Recovery Stability Score
      const s1 = Math.min(last7.length / 7, 1) * 25;
      const s2 = last7.length ? (last7.filter(c => c.attended_meeting).length / last7.length) * 25 : 0;
      const s3 = last7.length ? (last7.filter(c => c.connected_with_sponsor).length / last7.length) * 25 : 0;
      const s4 = Math.max(0, (10 - avgCraving) / 10) * 25;
      const stabilityScore = Math.round(s1 + s2 + s3 + s4);

      const triggers = [];
      if (daysSince >= 3) triggers.push('missed_checkin_3_days');
      if (last7.length > 0 && last7.every(c => !c.attended_meeting)) triggers.push('no_meeting_attendance');
      if (last7.length > 0 && last7.every(c => !c.connected_with_sponsor)) triggers.push('no_mentor_contact');
      if (stabilityScore < 50) triggers.push('stability_score_critical');
      else if (stabilityScore < 80) triggers.push('stability_score_at_risk');
      if (last3.some(c => c.relapse_risk_flag)) triggers.push('relapse_risk_flag');

      if (triggers.length === 0) continue;

      // Dedupe: skip if an active alert of same type already exists for this client today
      const alreadyAlerted = existingAlerts.some(
        a => a.participant_email === email && a.alert_date === today
      );
      if (alreadyAlerted) continue;

      const riskLevel = stabilityScore < 50 ? 'high' : 'medium';
      const riskScore = 100 - stabilityScore;

      await base44.asServiceRole.entities.EngagementAlert.create({
        participant_email: email,
        alert_type: triggers.includes('relapse_risk_flag') ? 'composite_high_risk' : 'composite_medium_risk',
        risk_score: riskScore,
        risk_level: riskLevel,
        alert_date: today,
        contributing_factors: triggers,
        status: 'active',
        checkin_rate_7d: last7.length / 7,
        meeting_rate_7d: last7.length ? last7.filter(c => c.attended_meeting).length / last7.length : 0,
        sponsor_contact_rate_7d: last7.length ? last7.filter(c => c.connected_with_sponsor).length / last7.length : 0,
        craving_avg_7d: parseFloat(avgCraving.toFixed(1)),
      });

      created++;
      results.push({ email, triggers, stabilityScore, riskLevel });
    }

    return Response.json({ success: true, alerts_created: created, details: results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});