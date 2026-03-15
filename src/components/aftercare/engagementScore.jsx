/**
 * Calculates the engagement score for a client based on their recent check-in history.
 *
 * Rules:
 *   Start = 100
 *   -10  if no check-in in the last 24 hours
 *   -20  if no meeting logged in the last 7 days
 *   -15  if sponsor contact not logged in the last 7 days
 *   -25  if any craving level reported above 4 in the last 7 days
 *
 * Levels:
 *   80–100  → Stable
 *   60–79   → Moderate Risk
 *   < 60    → High Risk
 *
 * @param {Array} checkIns - Array of ClientCheckins records for a single client,
 *                           sorted newest-first (or any order).
 * @returns {{ score: number, level: string, deductions: string[] }}
 */
export function calcEngagementScore(checkIns = []) {
  let score = 100;
  const deductions = [];

  const now = new Date();
  const cutoff24h = new Date(now - 24 * 60 * 60 * 1000);
  const cutoff7d  = new Date(now - 7  * 24 * 60 * 60 * 1000);

  const last24hCheckIns = checkIns.filter((c) => {
    const ts = c.timestamp ? new Date(c.timestamp) : new Date(c.date);
    return ts >= cutoff24h;
  });

  const last7dCheckIns = checkIns.filter((c) => {
    const ts = c.timestamp ? new Date(c.timestamp) : new Date(c.date);
    return ts >= cutoff7d;
  });

  if (last24hCheckIns.length === 0) {
    score -= 10;
    deductions.push("No check-in in last 24 hours (-10)");
  }

  const hadMeeting = last7dCheckIns.some((c) => c.meetings_attended > 0 || c.attended_meeting);
  if (!hadMeeting) {
    score -= 20;
    deductions.push("No meeting logged in last 7 days (-20)");
  }

  const hadSponsor = last7dCheckIns.some((c) => c.sponsor_contact === true || c.connected_with_sponsor);
  if (!hadSponsor) {
    score -= 15;
    deductions.push("No sponsor contact in last 7 days (-15)");
  }

  const highCraving = last7dCheckIns.some((c) => (c.craving_level ?? c.craving_intensity ?? 0) > 4);
  if (highCraving) {
    score -= 25;
    deductions.push("Craving level above 4 reported (-25)");
  }

  score = Math.max(0, score);

  const level =
    score >= 80 ? "Stable" :
    score >= 60 ? "Moderate Risk" :
                  "High Risk";

  return { score, level, deductions };
}

/**
 * Relapse Early Warning Score (0–100)
 * Uses additive/subtractive model based on multiple engagement signals.
 *
 * Positive signals (weekly):
 *   +10 each daily check-in completed (out of 7)
 *   +8  each meeting attended (out of 7)
 *   +5  each mentor/sponsor contact (out of 7)
 *   +4  if at least 1 journal entry this week
 *   +3  if at least 1 community post/interaction this week
 *
 * Negative signals:
 *   -10 if no check-in today
 *   -8  if meeting attendance < 2 this week
 *   -6  if craving post in community this week
 *   -5  if isolation (no meeting + no sponsor 5+ days)
 *   -4  if negative mood streak (mood ≤ 2 for last 3 consecutive check-ins)
 */
export function calcEarlyWarningScore({
  checkIns = [],
  journalCount = 0,
  communityPostCount = 0,
  cravingPostCount = 0,
}) {
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
  const signals = { positive: [], negative: [] };

  // ── Positive signals ────────────────────────────────────────
  const checkinDays = last7.length;
  const checkinPts = Math.min(checkinDays, 7) * 10;
  if (checkinPts > 0) signals.positive.push(`${checkinDays} check-in${checkinDays !== 1 ? "s" : ""} (+${checkinPts})`);
  score += checkinPts;

  const meetingDays = last7.filter(c => c.attended_meeting).length;
  const meetingPts = Math.min(meetingDays, 7) * 8;
  if (meetingPts > 0) signals.positive.push(`${meetingDays} meeting${meetingDays !== 1 ? "s" : ""} (+${meetingPts})`);
  score += meetingPts;

  const mentorDays = last7.filter(c => c.connected_with_sponsor).length;
  const mentorPts = Math.min(mentorDays, 7) * 5;
  if (mentorPts > 0) signals.positive.push(`${mentorDays} sponsor contact${mentorDays !== 1 ? "s" : ""} (+${mentorPts})`);
  score += mentorPts;

  if (journalCount > 0) {
    score += 4;
    signals.positive.push(`Journal entries (+4)`);
  }
  if (communityPostCount > 0) {
    score += 3;
    signals.positive.push(`Community posts (+3)`);
  }

  // ── Negative signals ────────────────────────────────────────
  const checkedInToday = checkIns.some(c => c.check_in_date === today);
  if (!checkedInToday) {
    score -= 10;
    signals.negative.push("No check-in today (-10)");
  }

  if (meetingDays < 2) {
    score -= 8;
    signals.negative.push("Low meeting attendance (-8)");
  }

  if (cravingPostCount > 0) {
    score -= 6 * Math.min(cravingPostCount, 3);
    signals.negative.push(`${cravingPostCount} craving post${cravingPostCount !== 1 ? "s" : ""} (-${6 * Math.min(cravingPostCount, 3)})`);
  }

  const isolationFlag = last5.length >= 5 && last5.every(c => !c.attended_meeting) && last5.every(c => !c.connected_with_sponsor);
  if (isolationFlag) {
    score -= 5;
    signals.negative.push("Isolation pattern (-5)");
  }

  const negativeMoodStreak = last3.length >= 3 && last3.every(c => c.mood_rating !== null && c.mood_rating <= 2);
  if (negativeMoodStreak) {
    score -= 4;
    signals.negative.push("Negative mood streak (-4)");
  }

  score = Math.max(0, Math.min(100, score));

  const level =
    score >= 70 ? "Low Risk" :
    score >= 45 ? "Moderate Risk" :
                  "High Risk";

  const color =
    score >= 70 ? "#10B981" :
    score >= 45 ? "#F59E0B" :
                  "#EF4444";

  return { score, level, color, signals };
}

/**
 * Returns a color hex string for a given engagement level.
 */
export function engagementLevelColor(level) {
  switch (level) {
    case "Stable":        return "#22C55E";
    case "Moderate Risk": return "#F59E0B";
    case "High Risk":     return "#EF4444";
    default:              return "#8E8E93";
  }
}

/**
 * Returns a background color for a given engagement level.
 */
export function engagementLevelBg(level) {
  switch (level) {
    case "Stable":        return "#F0FDF4";
    case "Moderate Risk": return "#FFFBEB";
    case "High Risk":     return "#FEF2F2";
    default:              return "#F7F7F8";
  }
}