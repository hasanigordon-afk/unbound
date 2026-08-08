/** Central milestone thresholds and spoken encouragement scripts. */

export const STREAK_MILESTONES = [3, 7, 14, 30, 60, 90];

export const STREAK_LABELS = {
  3: '3 days strong',
  7: '1 week locked in',
  14: '2 weeks. You are building something real.',
  30: '30 days. This is recovery.',
  60: '60 days. You are becoming who you wanted to be.',
  90: '90 days. Phoenix.',
};

export const STREAK_SPOKEN = {
  3: 'Three days strong. You showed up again. That matters more than you know.',
  7: 'One full week. You are building momentum one day at a time. Keep going.',
  14: 'Two weeks in. You are proving to yourself that change is possible.',
  30: 'Thirty days. This is real recovery. Be proud of what you have built.',
  60: 'Sixty days. You are becoming the person you wanted to be. Stay with it.',
  90: 'Ninety days. Phoenix rising. You did not quit on yourself.',
};

export const GOAL_SPOKEN = {
  default: 'Goal completed. That is a win worth celebrating. You moved forward today.',
  streak: 'Another step forward on your comeback mission. You are doing the work.',
};

export const ACHIEVEMENT_SPOKEN = {
  default: 'Achievement unlocked. Your progress is real, and it deserves to be seen.',
  vault: 'This win is now in your Achievement Vault. You earned this moment.',
};

export const CHECKIN_SPOKEN = {
  default: 'You checked in today. Showing up is the hardest part, and you did it.',
  milestone: (days) => `You checked in today. That is ${days} days in a row. You did not quit on yourself.`,
};

export function getStreakMilestoneScript(days) {
  return STREAK_SPOKEN[days] || `Day ${days} on your path. Keep building.`;
}

export function getStreakMilestoneLabel(days) {
  return STREAK_LABELS[days] || `${days} days strong`;
}

export function isStreakMilestone(days) {
  return STREAK_MILESTONES.includes(days);
}
