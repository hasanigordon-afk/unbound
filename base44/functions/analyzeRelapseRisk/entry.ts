import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * Relapse Risk Scoring Engine
 *
 * Scoring weights (total = 100 points of risk):
 *  - Check-in absence:        0-25 pts  (0 check-ins in 7d = 25)
 *  - Low mood trend:          0-25 pts  (avg mood <= 2 = 25, declining trend adds more)
 *  - High craving trend:      0-20 pts  (avg craving >= 4 = 20, rising trend adds more)
 *  - Meeting absence:         0-15 pts  (0 meetings in 7d = 15)
 *  - No sponsor contact:      0-15 pts  (0 sponsor contacts in 7d = 15)
 *
 * Risk levels:
 *  0-24:  low
 *  25-49: medium
 *  50-74: high
 *  75+:   critical
 */

function scoreParticipant(checkIns) {
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const fourteenDaysAgo = new Date(now);
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const recent = checkIns.filter(c => new Date(c.check_in_date) >= sevenDaysAgo);
  const prior = checkIns.filter(c => {
    const d = new Date(c.check_in_date);
    return d >= fourteenDaysAgo && d < sevenDaysAgo;
  });

  const factors = [];
  let score = 0;

  // --- 1. Check-in absence (0-25 pts) ---
  const checkinRate = recent.length / 7;
  if (recent.length === 0) {
    score += 25;
    factors.push("No check-ins in the last 7 days");
  } else if (recent.length <= 2) {
    const pts = Math.round((1 - checkinRate) * 25);
    score += pts;
    factors.push(`Low check-in frequency: ${recent.length}/7 days`);
  }

  // --- 2. Mood trend (0-25 pts) ---
  const moodsRecent = recent.filter(c => c.mood_rating != null).map(c => c.mood_rating);
  const moodsPrior = prior.filter(c => c.mood_rating != null).map(c => c.mood_rating);
  const avgMoodRecent = moodsRecent.length ? moodsRecent.reduce((a, b) => a + b, 0) / moodsRecent.length : null;
  const avgMoodPrior = moodsPrior.length ? moodsPrior.reduce((a, b) => a + b, 0) / moodsPrior.length : null;

  if (avgMoodRecent !== null) {
    // Base score: scale 1-5 mood inversely. mood=1 → 25pts, mood=5 → 0pts
    const moodBasePts = Math.round(Math.max(0, (3.5 - avgMoodRecent) / 2.5) * 20);
    score += moodBasePts;

    // Trend bonus: if declining vs prior week
    if (avgMoodPrior !== null && avgMoodRecent < avgMoodPrior - 0.5) {
      const trendPts = Math.min(5, Math.round((avgMoodPrior - avgMoodRecent) * 3));
      score += trendPts;
      factors.push(`Declining mood trend: ${avgMoodPrior.toFixed(1)} → ${avgMoodRecent.toFixed(1)}`);
    } else if (avgMoodRecent <= 2) {
      factors.push(`Low average mood: ${avgMoodRecent.toFixed(1)}/5`);
    }
  }

  // --- 3. Craving trend (0-20 pts) ---
  const cravingsRecent = recent.filter(c => c.craving_intensity != null).map(c => c.craving_intensity);
  const cravingsPrior = prior.filter(c => c.craving_intensity != null).map(c => c.craving_intensity);
  const avgCravingRecent = cravingsRecent.length ? cravingsRecent.reduce((a, b) => a + b, 0) / cravingsRecent.length : null;
  const avgCravingPrior = cravingsPrior.length ? cravingsPrior.reduce((a, b) => a + b, 0) / cravingsPrior.length : null;

  if (avgCravingRecent !== null) {
    // Scale: craving=5 → 16pts, craving=1 → 0pts
    const cravingBasePts = Math.round(Math.max(0, (avgCravingRecent - 2) / 3) * 16);
    score += cravingBasePts;

    if (avgCravingPrior !== null && avgCravingRecent > avgCravingPrior + 0.5) {
      const trendPts = Math.min(4, Math.round((avgCravingRecent - avgCravingPrior) * 2));
      score += trendPts;
      factors.push(`Rising craving trend: ${avgCravingPrior.toFixed(1)} → ${avgCravingRecent.toFixed(1)}`);
    } else if (avgCravingRecent >= 4) {
      factors.push(`High average craving level: ${avgCravingRecent.toFixed(1)}/5`);
    }
  }

  // --- 4. Meeting attendance (0-15 pts) ---
  const meetingsAttended = recent.filter(c => c.attended_meeting).length;
  const meetingRate = meetingsAttended / Math.max(recent.length, 1);
  if (meetingsAttended === 0 && recent.length > 0) {
    score += 15;
    factors.push("No meeting attendance in last 7 days");
  } else if (meetingRate < 0.4 && recent.length >= 3) {
    const pts = Math.round((1 - meetingRate) * 10);
    score += pts;
    factors.push(`Low meeting attendance: ${meetingsAttended}/${recent.length} check-in days`);
  }

  // --- 5. Sponsor contact (0-15 pts) ---
  const sponsorContacts = recent.filter(c => c.connected_with_sponsor).length;
  const sponsorRate = sponsorContacts / Math.max(recent.length, 1);
  if (sponsorContacts === 0 && recent.length > 0) {
    score += 15;
    factors.push("No sponsor/support contact in last 7 days");
  } else if (sponsorRate < 0.3 && recent.length >= 3) {
    const pts = Math.round((1 - sponsorRate) * 8);
    score += pts;
    factors.push(`Low sponsor contact rate: ${sponsorContacts}/${recent.length} check-in days`);
  }

  const finalScore = Math.min(100, score);

  let riskLevel = "low";
  if (finalScore >= 75) riskLevel = "critical";
  else if (finalScore >= 50) riskLevel = "high";
  else if (finalScore >= 25) riskLevel = "medium";

  let alertType = "low_engagement";
  if (finalScore >= 75) alertType = "composite_high_risk";
  else if (finalScore >= 50) alertType = "composite_medium_risk";
  else if (avgMoodRecent !== null && avgMoodPrior !== null && avgMoodRecent < avgMoodPrior - 1) alertType = "rapid_mood_decline";
  else if (avgCravingRecent !== null && avgCravingRecent >= 4) alertType = "high_craving_trend";
  else if (meetingsAttended === 0 && recent.length > 0) alertType = "missed_meetings";
  else if (sponsorContacts === 0 && recent.length > 0) alertType = "no_sponsor_contact";
  else if (recent.length === 0) alertType = "missed_checkin_3_days";

  return {
    score: finalScore,
    riskLevel,
    alertType,
    factors,
    metrics: {
      checkin_rate_7d: parseFloat(checkinRate.toFixed(2)),
      mood_avg_7d: avgMoodRecent !== null ? parseFloat(avgMoodRecent.toFixed(2)) : null,
      craving_avg_7d: avgCravingRecent !== null ? parseFloat(avgCravingRecent.toFixed(2)) : null,
      meeting_rate_7d: parseFloat(meetingRate.toFixed(2)),
      sponsor_contact_rate_7d: parseFloat(sponsorRate.toFixed(2)),
    }
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = req.method === 'POST' ? await req.json() : {};
    const { facility_id, participant_email } = body;

    // Fetch all check-ins (last 14 days for trend analysis)
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    // Get participants in scope
    let participants = [];
    if (participant_email) {
      participants = [{ participant_email }];
    } else if (facility_id) {
      const profiles = await base44.asServiceRole.entities.ParticipantProfile.filter({ facility_id });
      participants = profiles;
    } else {
      const profiles = await base44.asServiceRole.entities.ParticipantProfile.list();
      participants = profiles;
    }

    if (participants.length === 0) {
      return Response.json({ alerts: [], scores: [] });
    }

    // Fetch check-ins for all participants
    const allCheckIns = await base44.asServiceRole.entities.DailyCheckIn.list("-check_in_date", 5000);
    const today = new Date().toISOString().split("T")[0];

    const results = [];
    const newAlerts = [];

    for (const p of participants) {
      const email = p.participant_email || p.email;
      if (!email) continue;

      const pCheckIns = allCheckIns.filter(c => c.participant_email === email);
      if (pCheckIns.length === 0) continue;

      const result = scoreParticipant(pCheckIns);
      results.push({ email, ...result });

      // Only create alerts for medium risk and above
      if (result.score >= 25 && result.factors.length > 0) {
        // Check if we already have an active alert today for this participant
        const existingAlerts = await base44.asServiceRole.entities.EngagementAlert.filter({
          participant_email: email,
          alert_date: today,
          status: "active"
        });

        if (existingAlerts.length === 0) {
          const alertData = {
            participant_email: email,
            alert_type: result.alertType,
            risk_score: result.score,
            risk_level: result.riskLevel,
            alert_date: today,
            contributing_factors: result.factors,
            mood_avg_7d: result.metrics.mood_avg_7d,
            craving_avg_7d: result.metrics.craving_avg_7d,
            meeting_rate_7d: result.metrics.meeting_rate_7d,
            sponsor_contact_rate_7d: result.metrics.sponsor_contact_rate_7d,
            checkin_rate_7d: result.metrics.checkin_rate_7d,
            status: "active",
          };

          if (facility_id) alertData.facility_id = facility_id;
          else if (p.facility_id) alertData.facility_id = p.facility_id;

          const created = await base44.asServiceRole.entities.EngagementAlert.create(alertData);
          newAlerts.push(created);
        }
      }
    }

    return Response.json({
      scores: results,
      new_alerts_created: newAlerts.length,
      participants_analyzed: results.length,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});