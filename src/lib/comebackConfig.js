/* ── Comeback Media Portal — categories & search seeds ────────────────── */

export const COMEBACK_CATEGORIES = [
  {
    key: "recovery_stories",
    label: "Recovery Stories",
    emoji: "🌱",
    color: "var(--green)",
    blurb: "Real people who walked out of addiction and rebuilt.",
    keywords: [
      "addiction recovery testimony",
      "sober journey story",
      "how I got sober motivational",
      "long term sobriety story",
      "recovery success real story",
    ],
  },
  {
    key: "celebrity_comebacks",
    label: "Celebrity Comebacks",
    emoji: "🌟",
    color: "var(--gold)",
    blurb: "Famous voices on hitting bottom and bouncing back.",
    keywords: [
      "celebrity comeback story interview",
      "famous people recovery story",
      "celebrity overcame addiction interview",
      "celebrity redemption story",
    ],
  },
  {
    key: "veteran_motivation",
    label: "Veteran Motivation",
    emoji: "🎖️",
    color: "var(--accent)",
    blurb: "Veterans rebuilding after service.",
    keywords: [
      "veteran transition story",
      "veteran ptsd recovery",
      "veteran motivational speech",
      "veteran rebuild life",
    ],
  },
  {
    key: "reentry_success",
    label: "Reentry Success",
    emoji: "🔑",
    color: "var(--purple)",
    blurb: "From incarceration to a new life.",
    keywords: [
      "reentry success story",
      "ex felon rebuilt life",
      "out of prison motivational",
      "second chance story",
    ],
  },
  {
    key: "never_give_up",
    label: "Never Give Up",
    emoji: "🔥",
    color: "var(--red)",
    blurb: "Pure motivation when you need to keep going.",
    keywords: [
      "never give up motivational",
      "powerful motivational speech",
      "keep going inspirational",
      "do not quit motivation",
    ],
  },
  {
    key: "mental_health_wins",
    label: "Mental Health Wins",
    emoji: "💙",
    color: "var(--accent)",
    blurb: "Beating depression, anxiety, trauma.",
    keywords: [
      "depression recovery story",
      "anxiety recovery testimony",
      "mental health comeback",
      "trauma healing journey",
    ],
  },
  {
    key: "rock_bottom_to_rebuild",
    label: "Rock Bottom to Rebuild",
    emoji: "⛰️",
    color: "var(--gold)",
    blurb: "From the lowest point to a rebuilt life.",
    keywords: [
      "rock bottom turnaround story",
      "lost everything rebuild story",
      "homeless to success story",
    ],
  },
  {
    key: "faith_hope",
    label: "Faith & Hope",
    emoji: "✨",
    color: "var(--purple)",
    blurb: "Stories of hope, faith, and redemption.",
    keywords: [
      "faith testimony recovery",
      "redemption story hope",
      "spiritual transformation story",
    ],
  },
  {
    key: "fitness_comebacks",
    label: "Fitness Comebacks",
    emoji: "💪",
    color: "var(--green)",
    blurb: "Body, discipline, and mind rebuilt.",
    keywords: [
      "fitness transformation story",
      "addiction to fitness story",
      "weight loss comeback motivation",
      "discipline transformation",
    ],
  },
  {
    key: "everyday_heroes",
    label: "Everyday Heroes",
    emoji: "🤝",
    color: "var(--accent)",
    blurb: "Ordinary people doing extraordinary work.",
    keywords: [
      "ordinary people inspiring story",
      "everyday hero story",
      "regular person rebuilt life",
    ],
  },
];

export const COMEBACK_CATEGORY_BY_KEY = Object.fromEntries(
  COMEBACK_CATEGORIES.map(c => [c.key, c])
);

/* Words that should immediately reject a video */
export const HARD_REJECT_TERMS = [
  "how to score", "drug deal", "trap house", "plug", "drug tutorial",
  "best high", "how to use", "snort", "shoot up",
  "glorify", "glorifying drugs", "still using", "fentanyl high",
  "kill yourself", "suicide method", "how to die",
];