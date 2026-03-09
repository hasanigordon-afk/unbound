import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * Daily Risk Scan - Scheduled background function
 *
 * Combines check-in behavioral signals + journal sentiment analysis
 * to compute a composite risk score for every active participant.
 *
 * Scoring breakdown (max 100):
 *   Check-in signals:   up to 70 pts (absence, mood, cravings, meetings, sponsor)
 *   Journal sentiment:  up to 30 pts (negative/distress language in recent entries)
 *
 * Risk thresholds:
 *   0-24   → low
 *   25-49  → medium
 *   50-74  → high
 *   75+    → critical
 *
 * Actions:
 *   - Creates EngagementAlert for medium+ risk (if none exists today)
 *   - Emails assigned counselor when score is high or critical
 */

// ── Check-in scoring (0-70 pts) ─────────────────────────────────────────────
function scoreCheckIns(checkIns) {
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);
  const fourteenDaysAgo = new Date(now);
  fourteenDaysAgo.setDate(now.getDate() - 14);

  const recent = checkIns.filter(c => new Date(c.check_in_date) >= sevenDaysAgo);
  const prior = checkIns.filter(c => {
    const d = new Date(c.check_in_date);
    return d >= fourteenDaysAgo && d < sevenDaysAgo;
  });

  const factors = [];
  let score = 0;

  // 1. Check-in absence (0-20 pts)
  const checkinRate = recent.length / 7;
  if (recent.length === 0) {
    score += 20;
    factors.push("No check-ins in the last 7 days");
  } else if (recent.length <= 2) {
    score += Math.round((1 - checkinRate) * 20);
    factors.push(`Low check-in frequency: ${recent.length}/7 days`);
  }

  // 2. Mood trend (0-20 pts)
  const moodsR = recent.map(c => c.mood_rating).filter(Boolean);
  const moodsP = prior.map(c => c.mood_rating).filter(Boolean);
  const avgMoodR = moodsR.length ? moodsR.reduce((a, b) => a + b, 0) / moodsR.length : null;
  const avgMoodP = moodsP.length ? moodsP.reduce((a, b) => a + b, 0) / moodsP.length : null;

  if (avgMoodR !== null) {
    score += Math.round(Math.max(0, (3.5 - avgMoodR) / 2.5) * 15);
    if (avgMoodP !== null && avgMoodR < avgMoodP - 0.5) {
      score += Math.min(5, Math.round((avgMoodP - avgMoodR) * 3));
      factors.push(`Declining mood: ${avgMoodP.toFixed(1)} → ${avgMoodR.toFixed(1)}`);
    } else if (avgMoodR <= 2) {
      factors.push(`Persistently low mood: ${avgMoodR.toFixed(1)}/5`);
    }
  }

  // 3. Craving trend (0-15 pts)
  const cravR = recent.map(c => c.craving_intensity).filter(Boolean);
  const cravP = prior.map(c => c.craving_intensity).filter(Boolean);
  const avgCravR = cravR.length ? cravR.reduce((a, b) => a + b, 0) / cravR.length : null;
  const avgCravP = cravP.length ? cravP.reduce((a, b) => a + b, 0) / cravP.length : null;

  if (avgCravR !== null) {
    score += Math.round(Math.max(0, (avgCravR - 2) / 3) * 12);
    if (avgCravP !== null && avgCravR > avgCravP + 0.5) {
      score += Math.min(3, Math.round((avgCravR - avgCravP) * 2));
      factors.push(`Rising cravings: ${avgCravP.toFixed(1)} → ${avgCravR.toFixed(1)}`);
    } else if (avgCravR >= 4) {
      factors.push(`High craving level: ${avgCravR.toFixed(1)}/5`);
    }
  }

  // 4. Meeting attendance (0-10 pts)
  const meetingsR = recent.filter(c => c.attended_meeting).length;
  if (meetingsR === 0 && recent.length > 0) {
    score += 10;
    factors.push("No meeting attendance in last 7 days");
  } else if (recent.length >= 3 && (meetingsR / recent.length) < 0.4) {
    score += Math.round((1 - meetingsR / recent.length) * 7);
    factors.push(`Low meeting rate: ${meetingsR}/${recent.length} days`);
  }

  // 5. Sponsor contact (0-5 pts)
  const sponsorR = recent.filter(c => c.connected_with_sponsor).length;
  if (sponsorR === 0 && recent.length > 0) {
    score += 5;
    factors.push("No sponsor contact in last 7 days");
  }

  return {
    score: Math.min(70, score),
    factors,
    metrics: {
      checkin_rate_7d: parseFloat(checkinRate.toFixed(2)),
      mood_avg_7d: avgMoodR !== null ? parseFloat(avgMoodR.toFixed(2)) : null,
      craving_avg_7d: avgCravR !== null ? parseFloat(avgCravR.toFixed(2)) : null,
      meeting_rate_7d: recent.length ? parseFloat((meetingsR / recent.length).toFixed(2)) : 0,
      sponsor_contact_rate_7d: recent.length ? parseFloat((recent.filter(c => c.connected_with_sponsor).length / recent.length).toFixed(2)) : 0,
    }
  };
}

// ── Journal sentiment scoring via LLM (0-30 pts) ────────────────────────────
async function scoreJournalSentiment(base44, journalEntries) {
  if (!journalEntries || journalEntries.length === 0) {
    return { score: 0, factors: [], summary: null };
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentEntries = journalEntries
    .filter(e => new Date(e.created_date) >= sevenDaysAgo)
    .slice(0, 5); // cap to last 5 entries

  if (recentEntries.length === 0) {
    return { score: 0, factors: [], summary: null };
  }

  const entriesText = recentEntries
    .map(e => `[${e.tags?.join(', ') || 'no tags'}] ${e.content}`)
    .join('\n---\n');

  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: `You are analyzing journal entries from a person in addiction recovery. Assess the emotional risk level.

Journal entries (most recent first):
${entriesText}

Provide a JSON risk assessment:
- distress_score: 0-100 (0 = very positive/stable, 100 = crisis/severe distress)
- risk_factors: array of specific concerning signals found (max 3, each max 10 words). Empty array if none.
- one_line_summary: one sentence about the emotional tone (max 15 words)

Focus only on genuine risk signals: hopelessness, relapse ideation, self-harm, isolation, suicidal thoughts, severe craving language, or despair. Do NOT flag normal recovery struggles.`,
    response_json_schema: {
      type: "object",
      properties: {
        distress_score: { type: "number" },
        risk_factors: { type: "array", items: { type: "string" } },
        one_line_summary: { type: "string" }
      }
    }
  });

  const sentimentPts = Math.round((result.distress_score / 100) * 30);
  const factors = result.risk_factors?.map(f => `Journal: ${f}`) || [];

  return {
    score: Math.min(30, sentimentPts),
    factors,
    summary: result.one_line_summary || null
  };
}

// ── Main handler ─────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Allow both scheduled (no user) and manual admin calls
    const isAuthenticated = await base44.auth.isAuthenticated();
    if (isAuthenticated) {
      const user = await base44.auth.me();
      if (user?.role !== 'admin') {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const today = new Date().toISOString().split("T")[0];
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    // Fetch all active participants
    const profiles = await base44.asServiceRole.entities.ParticipantProfile.list();
    if (profiles.length === 0) {
      return Response.json({ message: "No participants found", processed: 0 });
    }

    // Batch fetch all check-ins and shared journal entries
    const [allCheckIns, allJournalEntries] = await Promise.all([
      base44.asServiceRole.entities.DailyCheckIn.list("-check_in_date", 5000),
      base44.asServiceRole.entities.JournalEntry.filter({ shared_with_facility: true }, "-created_date", 1000),
    ]);

    const results = [];
    const newAlerts = [];
    const emailsSent = [];

    for (const profile of profiles) {
      const email = profile.participant_email;
      if (!email) continue;

      const pCheckIns = allCheckIns.filter(c => c.participant_email === email);
      const pJournal = allJournalEntries.filter(e => e.created_by === email);

      // Skip if no data at all
      if (pCheckIns.length === 0 && pJournal.length === 0) continue;

      // Score check-ins
      const ciResult = scoreCheckIns(pCheckIns);

      // Score journal sentiment (only if they have shared entries)
      let sentimentResult = { score: 0, factors: [], summary: null };
      if (pJournal.length > 0) {
        sentimentResult = await scoreJournalSentiment(base44, pJournal);
      }

      // Composite score
      const totalScore = Math.min(100, ciResult.score + sentimentResult.score);
      const allFactors = [...ciResult.factors, ...sentimentResult.factors];

      let riskLevel = "low";
      if (totalScore >= 75) riskLevel = "critical";
      else if (totalScore >= 50) riskLevel = "high";
      else if (totalScore >= 25) riskLevel = "medium";

      let alertType = "low_engagement";
      if (totalScore >= 75) alertType = "composite_high_risk";
      else if (totalScore >= 50) alertType = "composite_medium_risk";
      else if (sentimentResult.score >= 20) alertType = "low_mood_trend";
      else if (ciResult.metrics.craving_avg_7d >= 4) alertType = "high_craving_trend";
      else if (ciResult.metrics.meeting_rate_7d === 0) alertType = "missed_meetings";
      else if (ciResult.metrics.checkin_rate_7d === 0) alertType = "missed_checkin_3_days";

      results.push({ email, score: totalScore, riskLevel, factors: allFactors });

      // Only act on medium risk or above
      if (totalScore < 25 || allFactors.length === 0) continue;

      // Skip if an alert already exists today for this participant
      const existingAlerts = await base44.asServiceRole.entities.EngagementAlert.filter({
        participant_email: email,
        alert_date: today,
        status: "active",
      });
      if (existingAlerts.length > 0) continue;

      // Create alert
      const alertData = {
        participant_email: email,
        alert_type: alertType,
        risk_score: totalScore,
        risk_level: riskLevel,
        alert_date: today,
        contributing_factors: allFactors,
        mood_avg_7d: ciResult.metrics.mood_avg_7d,
        craving_avg_7d: ciResult.metrics.craving_avg_7d,
        meeting_rate_7d: ciResult.metrics.meeting_rate_7d,
        sponsor_contact_rate_7d: ciResult.metrics.sponsor_contact_rate_7d,
        checkin_rate_7d: ciResult.metrics.checkin_rate_7d,
        status: "active",
        facility_id: profile.facility_id || undefined,
      };

      await base44.asServiceRole.entities.EngagementAlert.create(alertData);
      newAlerts.push({ email, score: totalScore, riskLevel });

      // Send email to assigned counselor for high/critical risk
      if ((riskLevel === "high" || riskLevel === "critical") && profile.assigned_counselor_email) {
        const riskColor = riskLevel === "critical" ? "#EF4444" : "#F59E0B";
        const riskLabel = riskLevel.toUpperCase();
        const factorsList = allFactors.map(f => `<li style="margin-bottom:6px;">${f}</li>`).join("");
        const sentimentNote = sentimentResult.summary
          ? `<p style="background:#FFF9C4;border-left:3px solid #F59E0B;padding:10px 14px;border-radius:4px;color:#78350F;font-size:14px;">
              <strong>Journal sentiment:</strong> ${sentimentResult.summary}
             </p>`
          : "";

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: profile.assigned_counselor_email,
          subject: `[${riskLabel} RISK] Engagement alert for ${email}`,
          body: `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:0 auto;color:#1E1E1E;">
  <div style="background:${riskColor};padding:16px 24px;border-radius:8px 8px 0 0;">
    <p style="color:#FFF;font-size:18px;font-weight:700;margin:0;">${riskLabel} RISK ALERT</p>
    <p style="color:rgba(255,255,255,0.85);font-size:14px;margin:4px 0 0;">Composite risk score: <strong>${totalScore}/100</strong></p>
  </div>
  <div style="background:#FFF;border:1px solid #E5E7EB;border-top:none;padding:24px;border-radius:0 0 8px 8px;">
    <p style="font-size:14px;color:#374151;">A daily risk scan flagged <strong>${email}</strong> as <strong>${riskLabel} RISK</strong> on ${today}.</p>

    ${sentimentNote}

    <div style="margin:16px 0;">
      <p style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#8E8E93;margin-bottom:8px;">Contributing Signals</p>
      <ul style="font-size:14px;color:#374151;padding-left:20px;margin:0;">
        ${factorsList}
      </ul>
    </div>

    <div style="background:#F7F7F8;padding:12px 16px;border-radius:6px;font-size:13px;color:#5A5A5A;">
      7-day check-in rate: <strong>${Math.round((ciResult.metrics.checkin_rate_7d || 0) * 100)}%</strong>
      &nbsp;·&nbsp;
      Avg mood: <strong>${ciResult.metrics.mood_avg_7d ?? "—"}/5</strong>
      &nbsp;·&nbsp;
      Avg craving: <strong>${ciResult.metrics.craving_avg_7d ?? "—"}/5</strong>
    </div>

    <p style="font-size:12px;color:#8E8E93;margin-top:20px;">This alert was generated automatically by Unbound's daily risk scan. Log in to review and acknowledge the alert on the counselor dashboard.</p>
  </div>
</div>`,
        });

        emailsSent.push(profile.assigned_counselor_email);
      }
    }

    return Response.json({
      date: today,
      participants_scanned: results.length,
      new_alerts_created: newAlerts.length,
      counselor_emails_sent: emailsSent.length,
      high_risk: results.filter(r => r.riskLevel === "high" || r.riskLevel === "critical").length,
      summary: newAlerts,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});