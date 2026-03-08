/**
 * Predictive Risk Analysis
 *
 * Analyzes historical check-in trends to surface participants likely to
 * deteriorate BEFORE they breach the threshold that triggers a live alert.
 *
 * Signals analysed (all over a 14-day rolling window):
 *   1. Mood trajectory        – linear slope over 14 days (negative = warning)
 *   2. Craving trajectory     – linear slope over 14 days (positive = warning)
 *   3. Engagement score trend – slope of daily engagement scores (negative = warning)
 *   4. Check-in frequency     – drop in rate (last 7d vs prior 7d)
 *   5. Meeting attendance     – drop in rate (last 7d vs prior 7d)
 *   6. Sponsor contact        – drop in rate (last 7d vs prior 7d)
 *   7. Volatility             – high mood variance signals instability
 *
 * Each signal contributes a risk weight (0–100). The composite predictive
 * risk score is a weighted average.  Participants already "High Risk" in
 * current engagement are excluded (they already have live alerts).
 */

import { calcEngagementScore } from "./engagementScore";

// ─── helpers ────────────────────────────────────────────────────────────────

/** Simple OLS slope of y-values (x = index 0, 1, 2 …) */
function slope(values) {
  const n = values.length;
  if (n < 2) return 0;
  const xMean = (n - 1) / 2;
  const yMean = values.reduce((a, b) => a + b, 0) / n;
  let num = 0, den = 0;
  values.forEach((y, x) => {
    num += (x - xMean) * (y - yMean);
    den += (x - xMean) ** 2;
  });
  return den === 0 ? 0 : num / den;
}

function variance(values) {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

// ─── main export ────────────────────────────────────────────────────────────

/**
 * @param {Array} checkIns  All DailyCheckIn records for ONE client, any order.
 * @returns {{
 *   predictiveScore: number,          // 0 (safe) → 100 (imminent risk)
 *   predictiveLevel: string,          // "Watching" | "Emerging Risk" | "Pre-Alert"
 *   signals: Array<{label, weight, direction}>
 * }}
 */
export function calcPredictiveRisk(checkIns = []) {
  const now = new Date();
  const cut14d = new Date(now - 14 * 86400000);
  const cut7d  = new Date(now - 7  * 86400000);

  // Sort ascending for trend calculations
  const sorted14d = checkIns
    .filter((c) => new Date(c.check_in_date || c.date) >= cut14d)
    .sort((a, b) => new Date(a.check_in_date || a.date) - new Date(b.check_in_date || b.date));

  const last7d  = sorted14d.filter((c) => new Date(c.check_in_date || c.date) >= cut7d);
  const prior7d = sorted14d.filter((c) => new Date(c.check_in_date || c.date) < cut7d);

  const signals = [];

  // ── 1. Mood trajectory ──────────────────────────────────────────────────
  const moodValues = sorted14d.map((c) => c.mood_rating || 3);
  const moodSlope  = slope(moodValues);
  // Negative slope = declining mood; scale to 0-100
  const moodWeight = moodSlope < 0 ? clamp(Math.abs(moodSlope) * 40, 0, 100) : 0;
  if (moodWeight > 5) {
    signals.push({ label: "Declining mood trend", weight: moodWeight, direction: "down" });
  }

  // ── 2. Craving trajectory ────────────────────────────────────────────────
  const cravingValues = sorted14d.map((c) => c.craving_level || c.craving_intensity || 1);
  const cravingSlope  = slope(cravingValues);
  // Positive slope = rising cravings
  const cravingWeight = cravingSlope > 0 ? clamp(cravingSlope * 40, 0, 100) : 0;
  if (cravingWeight > 5) {
    signals.push({ label: "Rising craving trend", weight: cravingWeight, direction: "up" });
  }

  // ── 3. Engagement score trend ────────────────────────────────────────────
  // Compute daily engagement score for each day by building a running window
  const engScores = sorted14d.map((_, i) => {
    const window = sorted14d.slice(0, i + 1);
    return calcEngagementScore(window).score;
  });
  const engSlope  = slope(engScores);
  const engWeight = engSlope < 0 ? clamp(Math.abs(engSlope) * 5, 0, 100) : 0;
  if (engWeight > 5) {
    signals.push({ label: "Engagement score declining", weight: engWeight, direction: "down" });
  }

  // ── 4. Check-in frequency drop ───────────────────────────────────────────
  const ciRate7  = last7d.length  / 7;
  const ciRatePr = prior7d.length / 7;
  const ciDrop   = ciRatePr > 0 ? (ciRatePr - ciRate7) / ciRatePr : 0;
  const ciWeight = clamp(ciDrop * 80, 0, 100);
  if (ciWeight > 10) {
    signals.push({ label: "Check-in frequency dropping", weight: ciWeight, direction: "down" });
  }

  // ── 5. Meeting attendance drop ───────────────────────────────────────────
  const meetRate7  = last7d.filter((c) => (c.meetings_attended || 0) > 0).length  / Math.max(last7d.length, 1);
  const meetRatePr = prior7d.filter((c) => (c.meetings_attended || 0) > 0).length / Math.max(prior7d.length, 1);
  const meetDrop   = meetRatePr > 0 ? (meetRatePr - meetRate7) / meetRatePr : 0;
  const meetWeight = clamp(meetDrop * 70, 0, 100);
  if (meetWeight > 10) {
    signals.push({ label: "Meeting attendance dropping", weight: meetWeight, direction: "down" });
  }

  // ── 6. Sponsor contact drop ───────────────────────────────────────────────
  const spRate7  = last7d.filter((c) => c.sponsor_contact).length  / Math.max(last7d.length, 1);
  const spRatePr = prior7d.filter((c) => c.sponsor_contact).length / Math.max(prior7d.length, 1);
  const spDrop   = spRatePr > 0 ? (spRatePr - spRate7) / spRatePr : 0;
  const spWeight = clamp(spDrop * 60, 0, 100);
  if (spWeight > 10) {
    signals.push({ label: "Sponsor contact declining", weight: spWeight, direction: "down" });
  }

  // ── 7. Mood volatility ────────────────────────────────────────────────────
  const moodVar    = variance(moodValues);
  const varWeight  = clamp(moodVar * 15, 0, 100);
  if (varWeight > 10) {
    signals.push({ label: "High mood instability", weight: varWeight, direction: "volatile" });
  }

  // ── Composite score ───────────────────────────────────────────────────────
  // Weighted average of all signal weights; if no data → 0
  const allWeights = [moodWeight, cravingWeight, engWeight, ciWeight, meetWeight, spWeight, varWeight];
  const predictiveScore = allWeights.length > 0
    ? Math.round(allWeights.reduce((a, b) => a + b, 0) / allWeights.length)
    : 0;

  const predictiveLevel =
    predictiveScore >= 45 ? "Pre-Alert" :
    predictiveScore >= 22 ? "Emerging Risk" :
                            "Watching";

  return { predictiveScore, predictiveLevel, signals };
}