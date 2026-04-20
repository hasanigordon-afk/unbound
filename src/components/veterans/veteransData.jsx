// Shared config for Veterans Hub — muted military palette
export const VET_COLORS = {
  olive:    "#5B6E48",
  oliveDim: "rgba(91,110,72,0.10)",
  navy:     "#2D4059",
  navyDim:  "rgba(45,64,89,0.10)",
  charcoal: "#3A3A3A",
  sand:     "#B8823A",
  red:      "#B85C5C",
  bg:       "#F7F3EE",
  surface:  "#FDFAF6",
  border:   "#E8E2D9",
  text:     "#1C1410",
  muted:    "#4A3F35",
  dim:      "#9B8E83",
};

export const BRANCHES = [
  { key: "army",          label: "Army",          emoji: "🪖" },
  { key: "navy",          label: "Navy",          emoji: "⚓" },
  { key: "marines",       label: "Marines",       emoji: "🎖️" },
  { key: "air_force",     label: "Air Force",     emoji: "✈️" },
  { key: "coast_guard",   label: "Coast Guard",   emoji: "🚤" },
  { key: "space_force",   label: "Space Force",   emoji: "🛰️" },
  { key: "national_guard",label: "National Guard",emoji: "🛡️" },
  { key: "reserves",      label: "Reserves",      emoji: "🎗️" },
];

export const getBranch = (key) => BRANCHES.find(b => b.key === key) || { label: "Veteran", emoji: "🇺🇸" };

export const RESOURCE_CATEGORIES = [
  { key: "crisis",           label: "Crisis",                     emoji: "🆘" },
  { key: "va_hospital",      label: "VA Hospitals",               emoji: "🏥" },
  { key: "mental_health",    label: "Mental Health",              emoji: "🧠" },
  { key: "substance_abuse",  label: "Substance Abuse",            emoji: "🌿" },
  { key: "housing",          label: "Housing",                    emoji: "🏠" },
  { key: "employment",       label: "Jobs",                       emoji: "💼" },
  { key: "food_emergency",   label: "Food",                       emoji: "🥫" },
  { key: "legal",            label: "Legal",                      emoji: "⚖️" },
];

export const getCategory = (key) => RESOURCE_CATEGORIES.find(c => c.key === key) || { label: key, emoji: "📍" };

export const POST_TAGS = [
  { key: "ptsd",                label: "PTSD" },
  { key: "addiction_recovery",  label: "Addiction Recovery" },
  { key: "transition",          label: "Transition to Civilian" },
  { key: "brotherhood_loss",    label: "Brotherhood / Loss" },
  { key: "purpose_found",       label: "Purpose Found" },
  { key: "family",              label: "Family" },
  { key: "employment",          label: "Employment" },
];

export const STORY_TAGS = [
  { key: "ptsd",                label: "PTSD" },
  { key: "addiction_recovery",  label: "Addiction Recovery" },
  { key: "transition",          label: "Transition to Civilian" },
  { key: "brotherhood_loss",    label: "Brotherhood / Loss" },
  { key: "purpose_found",       label: "Purpose Found" },
];

export const STORY_PROMPTS = [
  { key: "moment_changed",       question: "What moment changed everything for you?" },
  { key: "realized_need_support", question: "When did you realize you needed support?" },
  { key: "keeps_going",          question: "What keeps you going today?" },
];

export const GOAL_CATEGORIES = [
  { key: "employment", label: "Employment", emoji: "💼", color: "#2D4059" },
  { key: "fitness",    label: "Fitness",    emoji: "💪", color: "#5B6E48" },
  { key: "sobriety",   label: "Sobriety",   emoji: "🌿", color: "#7A9E7E" },
  { key: "family",     label: "Family",     emoji: "❤️", color: "#B85C5C" },
];

export const DAILY_MISSIONS = [
  "Take a 15-minute walk outside.",
  "Reach out to one battle buddy today.",
  "Write down 3 things you're grateful for.",
  "Cook one healthy meal for yourself.",
  "Complete one small task you've been putting off.",
  "Do 10 minutes of stretching or movement.",
  "Read 10 pages of a book.",
  "Attend a meeting — in person or online.",
  "Drink 8 glasses of water today.",
  "Go to bed 30 minutes earlier tonight.",
  "Help someone without expecting anything back.",
  "Spend 20 minutes outside without your phone.",
];

export const getTodayMission = () => {
  const idx = Math.floor(Date.now() / 86400000) % DAILY_MISSIONS.length;
  return DAILY_MISSIONS[idx];
};