import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * Relapse Early Warning Score (server-side version, 0–100)
 */
function calcEarlyWarningScore(checkIns = [], cravingPostCount = 0) {
  const now = new Date();
  const sevenAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const today = now.toISOString().split("T")[0];

  const last7 = checkIns
    .filter(c => new Date(c.check_in_date) >= sevenAgo)
    .sort((a, b) => new Date(b.check_in_date) - new Date(a.check_in_date));
  const last3 = [...checkIns]
    .sort((a, b) => new Date(b.check_in_date) - new Date(a.check_in_date))
    .slice(0, 3);
  const last5 = [...checkIns]
    .sort((a, b) => new Date(b.check_in_date) - new Date(a.check_in_date))
    .slice(0, 5);

  let score = 0;
  const negativeSignals = [];

  // Positive
  score += Math.min(last7.length, 7) * 10;
  score += last7.filter(c => c.attended_meeting).length * 8;
  score += last7.filter(c => c.connected_with_sponsor).length * 5;

  // Negative
  const checkedInToday = checkIns.some(c => c.check_in_date === today);
  if (!checkedInToday) { score -= 10; negativeSignals.push("missed_checkin_today"); }

  const meetingDays = last7.filter(c => c.attended_meeting).length;
  if (meetingDays < 2) { score -= 8; negativeSignals.push("low_meeting_attendance"); }

  if (cravingPostCount > 0) {
    const pts = 6 * Math.min(cravingPostCount, 3);
    score -= pts;
    negativeSignals.push(`craving_posts_${cravingPostCount}`);
  }

  const isolationFlag = last5.length >= 5 &&
    last5.every(c => !c.attended_meeting) &&
    last5.every(c => !c.connected_with_sponsor);
  if (isolationFlag) { score -= 5; negativeSignals.push("isolation_behavior"); }

  const negativeMoodStreak = last3.length >= 3 &&
    last3.every(c => c.mood_rating !== null && c.mood_rating <= 2);
  if (negativeMoodStreak) { score -= 4; negativeSignals.push("negative_mood_streak"); }

  score = Math.max(0, Math.min(100, score));

  const level = score >= 70 ? "low" : score >= 45 ? "medium" : "high";
  return { score, level, negativeSignals };
}

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

      const cravingPostCount = myCheckIns
        .filter(c => {
          const d = new Date(c.check_in_date);
          return (new Date() - d) <= 7 * 86400000;
        })
        .filter(c => (c.craving_intensity ?? 0) >= 7).length;

      const { score, level, negativeSignals } = calcEarlyWarningScore(myCheckIns, cravingPostCount);

      // Only alert on medium or high risk
      if (level === "low" || negativeSignals.length === 0) continue;

      // Dedupe: skip if already alerted today
      const alreadyAlerted = existingAlerts.some(
        a => a.participant_email === email && a.alert_date === today
      );
      if (alreadyAlerted) continue;

      const sevenAgo = new Date(Date.now() - 7 * 86400000);
      const last7 = myCheckIns.filter(c => new Date(c.check_in_date) >= sevenAgo);

      await base44.asServiceRole.entities.EngagementAlert.create({
        participant_email: email,
        alert_type: level === 'high' ? 'composite_high_risk' : 'composite_medium_risk',
        risk_score: score,
        risk_level: level,
        alert_date: today,
        contributing_factors: negativeSignals,
        status: 'active',
        checkin_rate_7d: last7.length / 7,
        meeting_rate_7d: last7.length ? last7.filter(c => c.attended_meeting).length / last7.length : 0,
        sponsor_contact_rate_7d: last7.length ? last7.filter(c => c.connected_with_sponsor).length / last7.length : 0,
        craving_avg_7d: last7.length
          ? parseFloat((last7.reduce((s, c) => s + (c.craving_intensity ?? 0), 0) / last7.length).toFixed(1))
          : 0,
        facility_id: profile.facility_id || null,
      });

      created++;
      results.push({ email, score, level, negativeSignals });
    }

    return Response.json({ success: true, alerts_created: created, details: results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});