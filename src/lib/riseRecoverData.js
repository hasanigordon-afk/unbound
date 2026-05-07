// Curated seed videos for Rise & Recover. All YouTube embed URLs — public,
// inspirational, recovery-positive talks and interviews. No glorification of use.

export const RR_CATEGORIES = [
  { key: "celebrity_recovery",   label: "Celebrity Recovery",     emoji: "⭐", accent: "var(--gold)",   blurb: "Honest stories from people you know — sobriety, healing, comebacks." },
  { key: "redemption",           label: "Redemption Stories",     emoji: "🔑", accent: "var(--accent)", blurb: "Prison to purpose. Rock bottom to rebuilt. Real second chances." },
  { key: "addiction_education",  label: "Addiction Education",    emoji: "🧠", accent: "var(--purple)", blurb: "Understand what's happening — neuroscience, healing, prevention." },
  { key: "motivation_discipline",label: "Motivation & Discipline",emoji: "🔥", accent: "var(--gold)",   blurb: "Speeches and reminders to keep building, even on hard days." },
  { key: "veteran_recovery",     label: "Veteran Recovery",       emoji: "🛡️", accent: "var(--accent)", blurb: "PTSD, transition, brotherhood — veterans rebuilding." },
  { key: "ahha_moments",         label: "Ah Ha Moments",          emoji: "✨", accent: "var(--purple)", blurb: "The exact moment everything changed for someone." },
];

export const RR_SEED_VIDEOS = [
  // ── Celebrity Recovery ───────────────────────────────────────
  {
    title: "Robert Downey Jr. on Sobriety & Second Chances",
    speaker: "Robert Downey Jr.",
    description: "A candid look at how the fight for sobriety became the foundation for rebuilding everything else.",
    category: "celebrity_recovery",
    video_url: "https://www.youtube.com/embed/Ji7nlcwSqsg",
    thumbnail_url: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80",
    duration_seconds: 540,
    emotional_themes: ["redemption", "hope", "transformation"],
    inspirational_quote: "Recovery is not the absence of struggle — it's the presence of choice.",
    stage_targets: ["any", "rebuilding", "early_recovery"],
    is_featured: true,
  },
  {
    title: "Eminem on Getting Sober & Finding His Voice Again",
    speaker: "Eminem",
    description: "On nearly losing it all to addiction — and what coming back actually felt like.",
    category: "celebrity_recovery",
    video_url: "https://www.youtube.com/embed/zQ-tEvXYStE",
    thumbnail_url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
    duration_seconds: 420,
    emotional_themes: ["resilience", "hope"],
    inspirational_quote: "I had to give up to win.",
    stage_targets: ["any", "newly_sober"],
  },
  {
    title: "Demi Lovato on Healing After Relapse",
    speaker: "Demi Lovato",
    description: "An honest conversation about relapse, shame, and the long road back to yourself.",
    category: "celebrity_recovery",
    video_url: "https://www.youtube.com/embed/T8VbDVPsPdo",
    thumbnail_url: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=800&q=80",
    duration_seconds: 600,
    emotional_themes: ["healing", "growth"],
    inspirational_quote: "I'm not broken. I'm becoming.",
    stage_targets: ["any", "rebuilding", "discouraged"],
  },

  // ── Redemption ───────────────────────────────────────────────
  {
    title: "From Prison to Purpose — Coss Marte's Story",
    speaker: "Coss Marte",
    description: "How a prison sentence became the launching pad for an entire new life.",
    category: "redemption",
    video_url: "https://www.youtube.com/embed/wK4w8j3aDvM",
    thumbnail_url: "https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=800&q=80",
    duration_seconds: 720,
    emotional_themes: ["redemption", "transformation"],
    inspirational_quote: "What broke me became what built me.",
    stage_targets: ["any", "rebuilding"],
    is_featured: true,
  },
  {
    title: "Homeless to CEO — Khalil Rafati",
    speaker: "Khalil Rafati",
    description: "Heroin addiction, skid row, and the long climb to building a multi-million dollar wellness brand.",
    category: "redemption",
    video_url: "https://www.youtube.com/embed/JL3yk5pK8Hc",
    thumbnail_url: "https://images.unsplash.com/photo-1551817958-d9d86fb29431?w=800&q=80",
    duration_seconds: 1500,
    emotional_themes: ["redemption", "resilience", "transformation"],
    inspirational_quote: "Rock bottom became the solid foundation I rebuilt my life on.",
    stage_targets: ["any", "rebuilding", "discouraged"],
  },
  {
    title: "Second Chances — Shaka Senghor",
    speaker: "Shaka Senghor",
    description: "19 years in prison. A book that changed his life. And what redemption really means.",
    category: "redemption",
    video_url: "https://www.youtube.com/embed/W1ighatcrEU",
    thumbnail_url: "https://images.unsplash.com/photo-1532635241-17e820acc59f?w=800&q=80",
    duration_seconds: 900,
    emotional_themes: ["redemption", "growth"],
    inspirational_quote: "You are more than the worst thing you've ever done.",
    stage_targets: ["any", "rebuilding"],
  },

  // ── Addiction Education ──────────────────────────────────────
  {
    title: "The Neuroscience of Addiction — Dr. Anna Lembke",
    speaker: "Dr. Anna Lembke",
    description: "Why addiction hijacks the brain, and what actually helps it heal.",
    category: "addiction_education",
    video_url: "https://www.youtube.com/embed/p_ZdkfTBHGw",
    thumbnail_url: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80",
    duration_seconds: 1080,
    emotional_themes: ["healing", "growth"],
    inspirational_quote: "The opposite of addiction isn't sobriety — it's connection.",
    stage_targets: ["any", "newly_sober", "early_recovery"],
  },
  {
    title: "Trauma & The Body — Dr. Gabor Maté",
    speaker: "Dr. Gabor Maté",
    description: "Why trauma lives in the body, and how compassion is part of healing.",
    category: "addiction_education",
    video_url: "https://www.youtube.com/embed/66cYcSak6nE",
    thumbnail_url: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&q=80",
    duration_seconds: 1200,
    emotional_themes: ["healing", "hope"],
    inspirational_quote: "Don't ask why the addiction. Ask why the pain.",
    stage_targets: ["any"],
    is_featured: true,
  },

  // ── Motivation & Discipline ──────────────────────────────────
  {
    title: "Discipline Equals Freedom — Jocko Willink",
    speaker: "Jocko Willink",
    description: "Why structure isn't a cage — it's the floor you rebuild your life on.",
    category: "motivation_discipline",
    video_url: "https://www.youtube.com/embed/IdTMDpizis8",
    thumbnail_url: "https://images.unsplash.com/photo-1517960413843-0aee8e2b3285?w=800&q=80",
    duration_seconds: 600,
    emotional_themes: ["discipline", "resilience"],
    inspirational_quote: "Discipline equals freedom.",
    stage_targets: ["any", "rebuilding"],
  },
  {
    title: "How Bad Do You Want It? — Eric Thomas",
    speaker: "Eric Thomas",
    description: "A motivational shake-down about wanting your future more than your past.",
    category: "motivation_discipline",
    video_url: "https://www.youtube.com/embed/lsSC2vx7zFQ",
    thumbnail_url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80",
    duration_seconds: 480,
    emotional_themes: ["resilience", "growth"],
    inspirational_quote: "When you want to succeed as bad as you want to breathe — you'll be successful.",
    stage_targets: ["any", "discouraged"],
    is_featured: true,
    is_daily_pick: true,
  },
  {
    title: "Make Your Bed — Adm. William McRaven",
    speaker: "Admiral William McRaven",
    description: "A Navy SEAL's commencement speech on the power of small daily wins.",
    category: "motivation_discipline",
    video_url: "https://www.youtube.com/embed/pxBQLFLei70",
    thumbnail_url: "https://images.unsplash.com/photo-1507120366498-2f6fb4c0e8a4?w=800&q=80",
    duration_seconds: 1140,
    emotional_themes: ["discipline", "hope"],
    inspirational_quote: "If you want to change the world, start by making your bed.",
    stage_targets: ["any"],
  },

  // ── Veteran Recovery ─────────────────────────────────────────
  {
    title: "Coming Home — A Veteran's Story of PTSD & Healing",
    speaker: "Marcus Luttrell",
    description: "On survival, survivor's guilt, and finding purpose after war.",
    category: "veteran_recovery",
    video_url: "https://www.youtube.com/embed/9j8iDaMdOLg",
    thumbnail_url: "https://images.unsplash.com/photo-1597176116047-876a32798fcc?w=800&q=80",
    duration_seconds: 960,
    emotional_themes: ["healing", "resilience"],
    inspirational_quote: "Brotherhood didn't end at the door. Healing starts where you stand.",
    stage_targets: ["veteran", "any"],
    is_featured: true,
  },
  {
    title: "Mission Continued — Jake Wood",
    speaker: "Jake Wood",
    description: "How veterans rebuild purpose by serving again — at home this time.",
    category: "veteran_recovery",
    video_url: "https://www.youtube.com/embed/JdHTQ3GRkE8",
    thumbnail_url: "https://images.unsplash.com/photo-1541872703-74c5e44368f4?w=800&q=80",
    duration_seconds: 720,
    emotional_themes: ["transformation", "growth"],
    inspirational_quote: "The mission doesn't end. It evolves.",
    stage_targets: ["veteran"],
  },

  // ── Ah Ha Moments ────────────────────────────────────────────
  {
    title: "The Day I Decided To Live — Russell Brand",
    speaker: "Russell Brand",
    description: "The exact moment recovery became non-negotiable.",
    category: "ahha_moments",
    video_url: "https://www.youtube.com/embed/dyEhpBl7Pw8",
    thumbnail_url: "https://images.unsplash.com/photo-1500964757637-c85e8a162699?w=800&q=80",
    duration_seconds: 660,
    emotional_themes: ["transformation", "hope"],
    inspirational_quote: "The pain of staying the same finally outweighed the pain of changing.",
    stage_targets: ["any", "newly_sober"],
  },
  {
    title: "Wake-Up Call — A Father's Promise",
    speaker: "Tony A.",
    description: "When his daughter asked one question, everything changed.",
    category: "ahha_moments",
    video_url: "https://www.youtube.com/embed/Hzgzim5m7oU",
    thumbnail_url: "https://images.unsplash.com/photo-1504439468489-c8920d796a29?w=800&q=80",
    duration_seconds: 360,
    emotional_themes: ["transformation", "redemption"],
    inspirational_quote: "She didn't need a perfect dad. She needed a present one.",
    stage_targets: ["any", "rebuilding"],
  },
];

// AI recommendation engine — pick top videos for a user's emotional state
export function recommendVideos({ videos, stage = "any", isVeteran = false, mood = null, limit = 6 }) {
  if (!videos?.length) return [];
  const scored = videos.map(v => {
    let score = 0;
    if (v.stage_targets?.includes(stage)) score += 30;
    if (v.stage_targets?.includes("any")) score += 5;
    if (isVeteran && v.category === "veteran_recovery") score += 40;
    if (mood === "discouraged" && v.emotional_themes?.includes("hope")) score += 25;
    if (mood === "discouraged" && v.emotional_themes?.includes("resilience")) score += 20;
    if (mood === "fired_up" && v.emotional_themes?.includes("discipline")) score += 20;
    if (mood === "reflective" && v.category === "ahha_moments") score += 25;
    if (v.is_featured) score += 8;
    score += Math.random() * 5; // small variation
    return { v, score };
  });
  return scored.sort((a, b) => b.score - a.score).slice(0, limit).map(x => x.v);
}

export function pickDailyVideo(videos) {
  if (!videos?.length) return null;
  const daily = videos.filter(v => v.is_daily_pick);
  const pool = daily.length ? daily : videos.filter(v => v.is_featured);
  if (!pool.length) return videos[0];
  // Stable per-day pick
  const dayIdx = new Date().getDate();
  return pool[dayIdx % pool.length];
}

export const CAT_BY_KEY = Object.fromEntries(RR_CATEGORIES.map(c => [c.key, c]));