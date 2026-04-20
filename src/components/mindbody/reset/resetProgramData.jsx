// 90-Day Mind-Body Reset — phase config and daily workout rotation

export const PHASES = [
  {
    id: "reset",
    label: "RESET",
    range: [1, 30],
    tagline: "Just show up. That's the win.",
    goal: "Stabilize routine. Reduce chaos. Build consistency.",
    color: "#7A9E7E",
    emoji: "🌱",
    fitness: [
      "Walking 10–20 min",
      "Light core (planks 20–30s)",
      "Stretching",
    ],
    nutrition: [
      "Introduce gut-friendly foods",
      "Hydration focus",
      "Reduce processed foods — no strict dieting",
    ],
    fasting: "Optional 12-hour window",
  },
  {
    id: "build",
    label: "BUILD",
    range: [31, 60],
    tagline: "You're building momentum now.",
    goal: "Increase strength, discipline, and structure.",
    color: "#B8823A",
    emoji: "🔥",
    fitness: [
      "Walking / jogging 20–30 min",
      "Core work (45–60s planks)",
      "Push-ups, squats, lunges",
    ],
    nutrition: [
      "Increase alkaline foods",
      "More intentional meals",
      "Track clean meals",
    ],
    fasting: "Option: 14–16 hour window",
    weeklyChallenge: "Complete 5 workouts this week",
  },
  {
    id: "lockin",
    label: "LOCK-IN",
    range: [61, 90],
    tagline: "This is who you are now.",
    goal: "Solidify habits into lifestyle.",
    color: "#9B8AB8",
    emoji: "💎",
    fitness: [
      "30+ min daily movement",
      "Stronger core routines",
      "Optional swimming",
    ],
    nutrition: [
      "Consistent clean eating",
      "High alkaline focus",
      "Better portion awareness",
    ],
    fasting: "Maintain consistent schedule (optional)",
    weeklyChallenge: "3 Discipline Days — full completion",
  },
];

export const DAILY_WORKOUTS = {
  reset: [
    { name: "Walk",            detail: "10–15 min steady walk", minutes: 12 },
    { name: "Walk + Plank",    detail: "10 min walk + 3×20s plank", minutes: 15 },
    { name: "Stretch + Core",  detail: "5 min stretch + 3×20s plank", minutes: 10 },
    { name: "Walk",            detail: "15–20 min walk", minutes: 18 },
    { name: "Stretch",         detail: "Full body stretch, 10 min", minutes: 10 },
    { name: "Walk + Plank",    detail: "15 min walk + 3×30s plank", minutes: 18 },
    { name: "Rest / Gentle",   detail: "Light movement, 5 min", minutes: 5 },
  ],
  build: [
    { name: "Walk/Jog",        detail: "25 min mixed pace", minutes: 25 },
    { name: "Full Body",       detail: "Push-ups, squats, lunges — 3 rounds", minutes: 20 },
    { name: "Core",            detail: "3×45s planks + 20 sit-ups × 3", minutes: 15 },
    { name: "Walk/Jog",        detail: "30 min", minutes: 30 },
    { name: "Full Body",       detail: "Push-ups, squats, lunges — 4 rounds", minutes: 25 },
    { name: "Stretch + Core",  detail: "10 min stretch + 4×45s plank", minutes: 18 },
    { name: "Rest / Walk",     detail: "Easy walk or rest", minutes: 15 },
  ],
  lockin: [
    { name: "Walk/Jog",        detail: "30+ min brisk movement", minutes: 35 },
    { name: "Full Body",       detail: "Push-ups, squats, lunges — 4 rounds", minutes: 30 },
    { name: "Core Circuit",    detail: "4×60s planks + 30 sit-ups × 4", minutes: 20 },
    { name: "Swim (optional)", detail: "25–40 min swim or full body workout", minutes: 35 },
    { name: "Full Body",       detail: "Advanced bodyweight — 5 rounds", minutes: 35 },
    { name: "Mobility + Core", detail: "Flow + 4×60s plank", minutes: 25 },
    { name: "Active Recovery", detail: "Easy walk, stretch", minutes: 20 },
  ],
};

export const BADGES = [
  { key: "streak_7",    label: "7-Day Streak",        desc: "One week in a row",         threshold: 7,  type: "streak" },
  { key: "reset_30",    label: "30-Day Reset",        desc: "Phase 1 complete",          threshold: 30, type: "day" },
  { key: "builder_60",  label: "60-Day Builder",      desc: "Phase 2 complete",          threshold: 60, type: "day" },
  { key: "lockin_90",   label: "90-Day Locked In",    desc: "Full program complete",     threshold: 90, type: "day" },
];

export function getPhaseForDay(day) {
  if (day <= 30) return PHASES[0];
  if (day <= 60) return PHASES[1];
  return PHASES[2];
}

export function getCurrentDay(startedAt) {
  const start = new Date(startedAt + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((now - start) / 86400000) + 1;
  return Math.max(1, Math.min(90, diffDays));
}

export function getWorkoutForDay(day) {
  const phase = getPhaseForDay(day);
  const rotation = DAILY_WORKOUTS[phase.id];
  return rotation[(day - 1) % rotation.length];
}