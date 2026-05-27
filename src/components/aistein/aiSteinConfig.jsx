// ReZilient AI — shared config, palette, routes, quick actions, crisis detection
export const AIS = {
  bg:        "#FDFAF6",
  surface:   "#FFFFFF",
  border:    "#E8E2D9",
  text:      "#1C1410",
  muted:     "#4A3F35",
  dim:       "#9B8E83",
  accent:    "#B8823A",
  accentDim: "rgba(184,130,58,0.10)",
  green:     "#7A9E7E",
  red:       "#C9534F",
};

export const TAGLINE = "Helping you find the next right step.";

// Quick action chips — map to concrete routes
export const QUICK_ACTIONS = [
  { key: "meetings",   label: "Meetings",   emoji: "🗓️", route: "/ResourceHub?category=Recovery%20Programs" },
  { key: "food",       label: "Food",       emoji: "🥫", route: "/ResourceHub?category=Food%20Resources" },
  { key: "shelter",    label: "Shelter",    emoji: "🏠", route: "/ResourceHub?category=Shelters" },
  { key: "jobs",       label: "Jobs",       emoji: "💼", route: "/ResourceHub?category=Jobs%20%2F%20Staffing%20Agencies" },
  { key: "veterans",   label: "Veterans",   emoji: "🎖️", route: "/ResourceHub?category=Veteran%20Services" },
  { key: "plan",       label: "My Plan",    emoji: "🧭", route: "/JourneyRoadmap" },
  { key: "journal",    label: "Journal",    emoji: "📓", route: "/DailyCheckIn" },
  { key: "checkin",    label: "Check-In",   emoji: "✅", route: "/DailyCheckIn" },
  { key: "motivation", label: "Motivation", emoji: "🔥", route: "/AhHaMoments" },
];

// Searchable app surface — keyword → route
export const PAGE_INDEX = [
  { name: "Home",                 route: "/",                     keywords: ["home", "dashboard", "main"] },
  { name: "Daily Check-In",       route: "/DailyCheckIn",          keywords: ["check in", "checkin", "mood", "today", "daily"] },
  { name: "Journal",              route: "/DailyCheckIn",          keywords: ["journal", "write", "reflect", "thoughts"] },
  { name: "Mission Board",        route: "/MyMissionBoard",        keywords: ["foundation", "home base", "my day", "mission", "top 5"] },
  { name: "Support Circle",       route: "/Profile#support",       keywords: ["support", "contacts", "people", "call someone", "inner circle", "support circle"] },
  { name: "Lifeline",             route: "/Lifeline",              keywords: ["crisis", "lifeline", "emergency", "hotline", "988"] },
  { name: "Meetings",             route: "/ResourceHub?category=Recovery%20Programs", keywords: ["meeting", "aa", "na", "groups"] },
  { name: "Recovery Map",         route: "/ResourceHub",           keywords: ["map", "find meeting", "nearby", "location"] },
  { name: "Housing",              route: "/ResourceHub?category=Shelters", keywords: ["housing", "shelter", "homeless", "place to stay"] },
  { name: "Jobs",                 route: "/ResourceHub?category=Jobs%20%2F%20Staffing%20Agencies", keywords: ["job", "work", "employment", "career"] },
  { name: "Benefits",             route: "/ResourceHub?category=Financial%20Assistance", keywords: ["benefits", "snap", "medicaid", "assistance"] },
  { name: "Veteran Resources",    route: "/ResourceHub?category=Veteran%20Services", keywords: ["veteran", "vet", "military", "service", "va"] },
  { name: "Mental Reset",         route: "/WellnessCenter",        keywords: ["reset", "calm", "breathing", "meditation", "anxious"] },
  { name: "Mind Body Recovery",   route: "/CravingControlCenter",  keywords: ["fitness", "workout", "body", "nutrition", "fasting", "health"] },
  { name: "90-Day Roadmap",       route: "/JourneyRoadmap",        keywords: ["90 day", "reset program", "sober"] },
  { name: "Forward Plan",         route: "/JourneyRoadmap",        keywords: ["plan", "goals", "my plan", "future", "roadmap"] },
  { name: "Goals",                route: "/MyMissionBoard",        keywords: ["goal", "goal board", "targets"] },
  { name: "Safety Plan",          route: "/MySafetyPlan",          keywords: ["safety plan", "safety", "safe"] },
  { name: "Hope",                 route: "/AhHaMoments",           keywords: ["hope", "motivation", "inspiration"] },
  { name: "Help",                 route: "/ResourceHub",           keywords: ["help", "resources", "support"] },
  { name: "Healing",              route: "/WellnessCenter",        keywords: ["healing", "recover", "therapy"] },
  { name: "Ah Ha Moments",        route: "/AhHaMoments",           keywords: ["ah ha", "community", "moments"] },
  { name: "S.E.E. Planner",       route: "/SEESuperAgent",         keywords: ["see", "planner", "counselor", "aftercare", "calendar"] },
  { name: "Notification Settings", route: "/NotificationSettings", keywords: ["notifications", "settings", "alerts"] },
  { name: "Profile",              route: "/Profile",               keywords: ["profile", "account", "me"] },
];

// Crisis language triggers
const CRISIS_TERMS = [
  "suicide", "kill myself", "end it", "end my life", "want to die",
  "hurt myself", "self harm", "cutting", "overdose", "can't go on",
  "no reason to live", "give up",
];

export const detectCrisis = (text = "") => {
  const t = text.toLowerCase();
  return CRISIS_TERMS.some(term => t.includes(term));
};

// Simple intent detection
export const detectIntent = (text = "") => {
  const t = text.toLowerCase().trim();
  if (!t) return "idle";
  if (detectCrisis(t)) return "support";
  // High-distress emotional markers
  if (/(anxious|panic|overwhelm|can't breathe|scared|hopeless|relaps|crav|urge|alone)/i.test(t)) return "support";
  // Search-style queries
  if (/(find|near|where|show|open|go to|look up|search)/i.test(t)) return "search";
  // Planning / guidance
  if (/(what should|help me|plan|next step|stuck|lost|don't know)/i.test(t)) return "guidance";
  return "search";
};

// Search across page index — returns ranked matches
export const searchPages = (query = "", limit = 5) => {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const scored = PAGE_INDEX.map(p => {
    let score = 0;
    if (p.name.toLowerCase().includes(q)) score += 10;
    p.keywords.forEach(k => {
      if (q.includes(k)) score += 6;
      else if (k.includes(q)) score += 3;
    });
    return { ...p, score };
  }).filter(r => r.score > 0);
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
};