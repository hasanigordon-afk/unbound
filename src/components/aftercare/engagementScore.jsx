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

  // Recent records within the relevant windows
  const last24hCheckIns = checkIns.filter((c) => {
    const ts = c.timestamp ? new Date(c.timestamp) : new Date(c.date);
    return ts >= cutoff24h;
  });

  const last7dCheckIns = checkIns.filter((c) => {
    const ts = c.timestamp ? new Date(c.timestamp) : new Date(c.date);
    return ts >= cutoff7d;
  });

  // -10: no check-in in 24 hours
  if (last24hCheckIns.length === 0) {
    score -= 10;
    deductions.push("No check-in in last 24 hours (-10)");
  }

  // -20: no meeting logged in 7 days
  const hadMeeting = last7dCheckIns.some((c) => c.meetings_attended > 0);
  if (!hadMeeting) {
    score -= 20;
    deductions.push("No meeting logged in last 7 days (-20)");
  }

  // -15: no sponsor contact in 7 days
  const hadSponsor = last7dCheckIns.some((c) => c.sponsor_contact === true);
  if (!hadSponsor) {
    score -= 15;
    deductions.push("No sponsor contact in last 7 days (-15)");
  }

  // -25: craving level above 4 reported in 7 days
  const highCraving = last7dCheckIns.some((c) => c.craving_level > 4);
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