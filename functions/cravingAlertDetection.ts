import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const participantEmail = body.participantEmail || user.email;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 10);
    const cutoffStr = cutoffDate.toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];

    const allCheckIns = await base44.asServiceRole.entities.DailyCheckIn.filter({ participant_email: participantEmail });
    const recent = allCheckIns
      .filter(c => c.check_in_date >= cutoffStr)
      .sort((a, b) => new Date(b.check_in_date) - new Date(a.check_in_date));

    const todayCI = recent.find(c => c.check_in_date === today);
    const last3 = recent.slice(0, 3);
    const last5 = recent.slice(0, 5);
    const last7 = recent.slice(0, 7);

    const triggers = [];
    let riskLevel = 'low';
    let riskScore = 0;
    let alertType = null;

    // Emergency: relapse risk flag
    if (todayCI?.relapse_risk_flag) {
      triggers.push('Emergency: User flagged potential relapse today');
      riskLevel = 'critical';
      riskScore = 95;
      alertType = 'composite_high_risk';
    }

    // High craving (8–10)
    if (todayCI?.craving_intensity >= 8) {
      triggers.push(`High craving intensity: ${todayCI.craving_intensity}/10`);
      if (riskLevel !== 'critical') { riskLevel = 'high'; riskScore = Math.max(riskScore, 85); }
      alertType = alertType || 'high_craving_trend';
    }

    // Craving > 6 for 3+ consecutive days
    if (last3.length >= 3 && last3.every(c => (c.craving_intensity || 0) > 6)) {
      triggers.push('Craving above 6 for 3 consecutive days');
      if (!['critical', 'high'].includes(riskLevel)) { riskLevel = 'medium'; riskScore = Math.max(riskScore, 70); }
      alertType = alertType || 'high_craving_trend';
    }

    // Low mood (1–2) for 3+ consecutive days
    if (last3.length >= 3 && last3.every(c => c.mood_rating != null && c.mood_rating <= 2)) {
      triggers.push('Low mood (1–2) for 3 consecutive days');
      if (!['critical', 'high'].includes(riskLevel)) { riskLevel = 'medium'; riskScore = Math.max(riskScore, 65); }
      alertType = alertType || 'low_mood_trend';
    }

    // No meeting attendance for 5 days
    if (last5.length >= 5 && last5.every(c => !c.attended_meeting)) {
      triggers.push('No meeting attendance for 5+ days');
      if (!['critical', 'high', 'medium'].includes(riskLevel)) { riskLevel = 'medium'; riskScore = Math.max(riskScore, 55); }
      alertType = alertType || 'missed_meetings';
    }

    // No sponsor contact for 5 days
    if (last5.length >= 5 && last5.every(c => !c.connected_with_sponsor)) {
      triggers.push('No sponsor contact for 5+ days');
      if (!['critical', 'high', 'medium'].includes(riskLevel)) { riskLevel = 'medium'; riskScore = Math.max(riskScore, 50); }
      alertType = alertType || 'no_sponsor_contact';
    }

    if (triggers.length === 0) {
      return Response.json({ triggered: false, riskLevel: 'low', message: 'No risk triggers detected' });
    }

    // Avoid duplicate alerts for today
    const existingToday = await base44.asServiceRole.entities.EngagementAlert.filter({
      participant_email: participantEmail,
      alert_date: today,
      status: 'active',
    });

    if (existingToday.length === 0) {
      const avg = (arr, field) => arr.length ? arr.reduce((s, c) => s + (c[field] || 0), 0) / arr.length : 0;

      await base44.asServiceRole.entities.EngagementAlert.create({
        participant_email: participantEmail,
        alert_type: alertType,
        alert_date: today,
        risk_score: riskScore,
        risk_level: riskLevel,
        status: 'active',
        contributing_factors: triggers,
        mood_avg_7d: avg(last7, 'mood_rating'),
        craving_avg_7d: avg(last7, 'craving_intensity'),
        checkin_rate_7d: last7.length / 7,
        meeting_rate_7d: last7.filter(c => c.attended_meeting).length / Math.max(last7.length, 1),
        sponsor_contact_rate_7d: last7.filter(c => c.connected_with_sponsor).length / Math.max(last7.length, 1),
      });
    }

    return Response.json({ triggered: true, riskLevel, riskScore, factors: triggers });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});