// Veteran Mode — shared config and palette (military-inspired, calm tone)
export const VM = {
  bg:        "#12140F",
  surface:   "#1C1F18",
  surface2:  "#25281F",
  border:    "#323628",
  text:      "#E8E4D8",
  muted:     "#A8A396",
  dim:       "#6F6B5E",
  olive:     "#8A9A5B",
  oliveSoft: "rgba(138,154,91,0.14)",
  gold:      "#C9A961",
  red:       "#C96F5C",
};

export const BRANCHES = [
  { key: "army",           label: "Army" },
  { key: "navy",           label: "Navy" },
  { key: "marines",        label: "Marines" },
  { key: "air_force",      label: "Air Force" },
  { key: "coast_guard",    label: "Coast Guard" },
  { key: "space_force",    label: "Space Force" },
  { key: "national_guard", label: "National Guard" },
  { key: "reserves",       label: "Reserves" },
];

export const SUPPORT_STYLES = [
  { key: "independent", label: "Independent", sub: "Minimal interaction" },
  { key: "guided",      label: "Guided",       sub: "Light suggestions" },
  { key: "connected",   label: "Connected",    sub: "Community + support" },
];

export const FOCUS_OPTIONS = [
  { key: "sober",    label: "Staying sober",             emoji: "🌿" },
  { key: "mental",   label: "Mental stability",           emoji: "🧠" },
  { key: "work",     label: "Finding work",               emoji: "💼" },
  { key: "routine",  label: "Building routine",           emoji: "📋" },
  { key: "physical", label: "Physical health",            emoji: "💪" },
  { key: "housing",  label: "Housing stability",          emoji: "🏠" },
  { key: "family",   label: "Reconnecting with family",   emoji: "❤️" },
];

export const NOTIFICATION_TONES = [
  { key: "silent",       label: "Silent",       sub: "No push notifications" },
  { key: "motivational", label: "Motivational", sub: "Encouragement & wins" },
  { key: "direct",       label: "Direct",       sub: "Mission-style briefings" },
];

export const RESOURCE_PRIORITIES = [
  { key: "va",       label: "VA services",          emoji: "🏥" },
  { key: "jobs",     label: "Jobs & training",      emoji: "💼" },
  { key: "housing",  label: "Housing",              emoji: "🏠" },
  { key: "food",     label: "Food access",          emoji: "🥫" },
  { key: "support",  label: "Support groups",       emoji: "🤝" },
  { key: "fitness",  label: "Fitness & wellness",   emoji: "💪" },
];

// Simple rotating mission pool — pulls based on focus area
export const OBJECTIVES_BY_FOCUS = {
  sober:    ["Make it through today — one hour at a time.", "Reach out to one person who gets it.", "Remove one trigger from your environment."],
  mental:   ["Take 10 minutes of quiet. No phone.", "Write down one thing weighing on you.", "Step outside for 15 minutes."],
  work:     ["Update one line of your resume.", "Apply to one opportunity today.", "Reach out to one contact from your network."],
  routine:  ["Wake up at the same time tomorrow.", "Make your bed before you leave it.", "Plan tomorrow's first 3 hours tonight."],
  physical: ["Move for 20 minutes — walk, lift, stretch.", "Drink 8 glasses of water.", "Get to bed 30 minutes earlier."],
  housing:  ["Call one housing resource today.", "Organize your current living space.", "Review your housing plan for the week."],
  family:   ["Send a short message to someone you've lost touch with.", "Listen without defending for one conversation.", "Share one honest update with a family member."],
  default:  ["Show up for yourself today. That's the mission."],
};

export const getTodaysObjective = (focusList = []) => {
  const pool = focusList.length > 0
    ? focusList.flatMap(f => OBJECTIVES_BY_FOCUS[f] || [])
    : OBJECTIVES_BY_FOCUS.default;
  const idx = Math.floor(Date.now() / 86400000) % Math.max(pool.length, 1);
  return pool[idx] || OBJECTIVES_BY_FOCUS.default[0];
};