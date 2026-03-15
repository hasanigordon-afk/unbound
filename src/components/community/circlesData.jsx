export const CIRCLE_CATEGORIES = [
  { id: "substance",     label: "Substance",    emoji: "💊", color: "#F87171" },
  { id: "reentry",       label: "Reentry",      emoji: "🗺️", color: "#818CF8" },
  { id: "early",         label: "Early Recovery",emoji: "🌱", color: "#10B981" },
  { id: "lifestyle",     label: "Lifestyle",    emoji: "🌟", color: "#FBBF24" },
  { id: "reintegration", label: "Reintegration",emoji: "🏗️", color: "#60A5FA" },
  { id: "trauma",        label: "Trauma & Healing", emoji: "💜", color: "#A78BFA" },
];

export const CIRCLES = [
  // ── Substance-Specific ─────────────────────────────────────
  {
    id: "opiate_recovery",
    category: "substance",
    name: "Opiate Recovery",
    emoji: "💊",
    color: "#F87171",
    tagline: "Heroin, fentanyl, oxycodone & opioid recovery",
    desc: "A circle for people recovering from opioid addiction. Share experiences, cravings, milestones, and support each other through the physical and emotional challenges of opioid recovery.",
    topics: ["Withdrawal", "MAT / Suboxone", "Cravings", "Fentanyl", "Daily wins"],
    prompt: "What's one thing that helped you get through a craving today?",
    sensitive: true,
  },
  {
    id: "stimulant_recovery",
    category: "substance",
    name: "Stimulant Recovery",
    emoji: "⚡",
    color: "#FB923C",
    tagline: "Cocaine, crack, meth & stimulant recovery",
    desc: "Support for those recovering from stimulant addiction. Topics include sleep, mood swings, cravings, and rebuilding a stable life.",
    topics: ["Sleep recovery", "Mood", "Cravings", "Mental clarity", "Rebuilding"],
    prompt: "How are you managing your energy and sleep today?",
    sensitive: true,
  },
  {
    id: "alcohol_recovery",
    category: "substance",
    name: "Alcohol Recovery",
    emoji: "🍃",
    color: "#34D399",
    tagline: "Alcohol dependency & sobriety support",
    desc: "A safe space for those recovering from alcohol use disorder. Share what's working, what's hard, and everything in between.",
    topics: ["AA", "Social triggers", "Cravings", "Withdrawal", "Sober milestones"],
    prompt: "What situation felt hardest to navigate sober this week?",
    sensitive: false,
  },
  {
    id: "benzo_recovery",
    category: "substance",
    name: "Benzo Recovery",
    emoji: "🧘",
    color: "#A78BFA",
    tagline: "Benzodiazepine & sedative recovery",
    desc: "Recovery from benzodiazepines is uniquely difficult. This circle is for support, information, and community through the taper and beyond.",
    topics: ["Tapering", "Anxiety", "PAWS", "Sleep", "Symptoms"],
    prompt: "What has been the most unexpected part of benzo recovery for you?",
    sensitive: true,
  },
  {
    id: "polysubstance",
    category: "substance",
    name: "Polysubstance Recovery",
    emoji: "🔗",
    color: "#F472B6",
    tagline: "Recovery from multiple substance dependencies",
    desc: "For those managing recovery from more than one substance. This circle understands the complexity of polysubstance addiction.",
    topics: ["Multiple substances", "Complexity", "Triggers", "Cravings", "Support"],
    prompt: "What does a strong recovery day look like for you?",
    sensitive: true,
  },
  {
    id: "marijuana_recovery",
    category: "substance",
    name: "Marijuana Dependency",
    emoji: "🌿",
    color: "#6EE7B7",
    tagline: "Cannabis use disorder & dependency support",
    desc: "Marijuana dependency is real and often misunderstood. This is a judgment-free space for those working on reducing or stopping cannabis use.",
    topics: ["Dependency", "Motivation", "Anxiety", "Sleep", "Clarity"],
    prompt: "How are you managing the boredom or anxiety that comes with cutting back?",
    sensitive: false,
  },

  // ── Reentry ─────────────────────────────────────────────────
  {
    id: "recently_released",
    category: "reentry",
    name: "Recently Released",
    emoji: "🚪",
    color: "#818CF8",
    tagline: "First steps after incarceration",
    desc: "For people newly released from prison or jail. A safe space to share the challenges and wins of reentering society — housing, ID, supervision, and reconnecting with family.",
    topics: ["Housing", "ID & documents", "Supervision", "Employment", "Family"],
    prompt: "What has been the hardest thing about being home so far?",
    sensitive: true,
  },
  {
    id: "probation_parole",
    category: "reentry",
    name: "Probation & Parole",
    emoji: "⚖️",
    color: "#C084FC",
    tagline: "Navigating supervision requirements",
    desc: "Support for those on probation or parole. Staying compliant, understanding requirements, and managing the stress of supervision.",
    topics: ["Compliance", "Drug testing", "Check-ins", "Violations", "Court dates"],
    prompt: "What's been the most stressful supervision requirement for you this week?",
    sensitive: true,
  },
  {
    id: "first_year_release",
    category: "reentry",
    name: "First Year After Release",
    emoji: "📅",
    color: "#60A5FA",
    tagline: "The critical first year of freedom",
    desc: "The first year after release is statistically the most vulnerable. This circle provides intensive peer support and practical guidance.",
    topics: ["Goals", "Employment", "Housing stability", "Triggers", "Milestones"],
    prompt: "What are you most proud of accomplishing since your release?",
    sensitive: false,
  },
  {
    id: "long_term_reentry",
    category: "reentry",
    name: "Long-Term Incarceration Reentry",
    emoji: "🌅",
    color: "#FCD34D",
    tagline: "Reentry after 5+ years incarcerated",
    desc: "Reentry after long-term incarceration brings unique challenges — technology, relationships, society. This circle understands what others may not.",
    topics: ["Technology gap", "Relationships", "Identity", "Society changes", "Housing"],
    prompt: "What part of modern life has been most overwhelming to adjust to?",
    sensitive: true,
  },

  // ── Early Recovery ───────────────────────────────────────────
  {
    id: "first_7_days",
    category: "early",
    name: "First 7 Days Clean",
    emoji: "🕯️",
    color: "#10B981",
    tagline: "The hardest week — you're not alone",
    desc: "For people in their very first week of sobriety. This circle provides moment-by-moment support, distraction, and encouragement to get through each day.",
    topics: ["Withdrawal", "Urges", "Accountability", "Daily check-in", "Hour by hour"],
    prompt: "What hour are you on right now? We're with you.",
    sensitive: true,
  },
  {
    id: "first_30_days",
    category: "early",
    name: "First 30 Days Clean",
    emoji: "🌱",
    color: "#34D399",
    tagline: "Building your foundation",
    desc: "The first month of sobriety is about building habits and getting stable. Share your daily wins, struggles, and stay connected.",
    topics: ["Routine", "Cravings", "Meetings", "Sleep", "Day counts"],
    prompt: "What's one new habit you're building this week?",
    sensitive: false,
  },
  {
    id: "first_90_days",
    category: "early",
    name: "First 90 Days Clean",
    emoji: "🏗️",
    color: "#6EE7B7",
    tagline: "The 90-day foundation milestone",
    desc: "Working toward or celebrating the 90-day milestone. Share your progress, what's working, and support others on the same path.",
    topics: ["Progress", "Milestones", "Triggers", "Planning", "Next steps"],
    prompt: "How has your life started to change in the last 90 days?",
    sensitive: false,
  },
  {
    id: "post_rehab",
    category: "early",
    name: "Post-Rehab Transition",
    emoji: "🏠",
    color: "#A7F3D0",
    tagline: "Life after treatment — making it stick",
    desc: "Leaving treatment is a vulnerable transition. This circle supports people applying what they learned in rehab to real life.",
    topics: ["Aftercare", "IOP", "Triggers at home", "New routines", "Sponsor"],
    prompt: "What's the biggest difference between treatment and real life that you weren't prepared for?",
    sensitive: false,
  },

  // ── Lifestyle & Identity ─────────────────────────────────────
  {
    id: "parents_recovery",
    category: "lifestyle",
    name: "Parents in Recovery",
    emoji: "👨‍👧",
    color: "#FBBF24",
    tagline: "Recovery and parenting together",
    desc: "Parenting while in recovery is one of the most demanding journeys. Share the joy, guilt, growth, and progress of being a parent in recovery.",
    topics: ["Custody", "Guilt", "Parenting wins", "Rebuilding trust", "Support"],
    prompt: "What did you do as a parent today that you're proud of?",
    sensitive: false,
  },
  {
    id: "mens_recovery",
    category: "lifestyle",
    name: "Men in Recovery",
    emoji: "💪",
    color: "#60A5FA",
    tagline: "A safe space for men on this journey",
    desc: "Men face unique challenges in recovery — stigma, masculinity pressure, relationships. This is a space to be real without judgment.",
    topics: ["Stigma", "Relationships", "Mental health", "Accountability", "Brotherhood"],
    prompt: "What's something you've been carrying alone that you're ready to put down?",
    sensitive: false,
  },
  {
    id: "womens_recovery",
    category: "lifestyle",
    name: "Women in Recovery",
    emoji: "🌸",
    color: "#F472B6",
    tagline: "A safe space for women on this journey",
    desc: "Women face specific challenges in addiction and recovery — trauma, relationships, childcare, stigma. This circle is yours.",
    topics: ["Trauma", "Relationships", "Childcare", "Body image", "Sisterhood"],
    prompt: "What does feeling safe look like for you today?",
    sensitive: true,
  },
  {
    id: "young_adults",
    category: "lifestyle",
    name: "Young Adults in Recovery",
    emoji: "🎓",
    color: "#A78BFA",
    tagline: "Recovery in your 18–30s",
    desc: "Recovery as a young adult means navigating school, careers, relationships, and identity while staying sober. You're not alone in this.",
    topics: ["College", "Career", "Identity", "Social pressure", "Relationships"],
    prompt: "How do you handle social situations where drinking or using is expected?",
    sensitive: false,
  },
  {
    id: "over_40",
    category: "lifestyle",
    name: "Over 40 Recovery",
    emoji: "🌿",
    color: "#C9A96E",
    tagline: "Recovery after decades of use",
    desc: "Recovery later in life brings its own mix of wisdom, health challenges, and regret. This circle is for those starting over with decades of experience.",
    topics: ["Health", "Family repair", "Retirement", "Regret", "New beginnings"],
    prompt: "What would you tell your younger self about this journey?",
    sensitive: false,
  },
  {
    id: "lgbtq_recovery",
    category: "lifestyle",
    name: "LGBTQ+ Recovery",
    emoji: "🏳️‍🌈",
    color: "#F9A8D4",
    tagline: "LGBTQ+ affirming recovery support",
    desc: "The intersection of LGBTQ+ identity and addiction comes with unique barriers and strengths. This is an affirming, safe space.",
    topics: ["Identity", "Coming out", "Trauma", "Community", "Affirmation"],
    prompt: "How has your identity shaped your recovery journey?",
    sensitive: true,
  },

  // ── Reintegration ─────────────────────────────────────────────
  {
    id: "job_search",
    category: "reintegration",
    name: "Job Search & Employment",
    emoji: "💼",
    color: "#60A5FA",
    tagline: "Finding work with a record or gap in employment",
    desc: "Job searching in recovery — especially with a criminal record — takes persistence. Share leads, interview tips, second-chance employers, and wins.",
    topics: ["Second chance", "Interviews", "Resume", "Background checks", "Wins"],
    prompt: "Share a job search tip or resource that helped you.",
    sensitive: false,
  },
  {
    id: "housing_stability",
    category: "reintegration",
    name: "Housing & Stability",
    emoji: "🏠",
    color: "#34D399",
    tagline: "Finding and keeping safe housing",
    desc: "Stable housing is the foundation of recovery. Share resources, experiences, and support for finding and maintaining housing.",
    topics: ["Sober living", "Vouchers", "Landlords", "Transitional housing", "Resources"],
    prompt: "What housing resource or program made a difference for you?",
    sensitive: false,
  },
  {
    id: "financial_recovery",
    category: "reintegration",
    name: "Financial Recovery",
    emoji: "💵",
    color: "#C9A96E",
    tagline: "Rebuilding financial stability",
    desc: "Addiction often leaves financial wreckage. This circle focuses on debt, budgeting, building credit, and working toward financial freedom.",
    topics: ["Debt", "Budgeting", "Credit", "Benefits", "Goals"],
    prompt: "What's one financial goal you're working toward right now?",
    sensitive: false,
  },
  {
    id: "education_skills",
    category: "reintegration",
    name: "Education & Trade Skills",
    emoji: "🎓",
    color: "#818CF8",
    tagline: "Investing in your future through learning",
    desc: "Whether it's GED, college, trade school, or certifications — education is a powerful path in recovery. Share resources and progress.",
    topics: ["GED", "College", "Trades", "Certifications", "Scholarships"],
    prompt: "What are you learning or studying right now?",
    sensitive: false,
  },

  // ── Trauma & Healing ────────────────────────────────────────
  {
    id: "ptsd_recovery",
    category: "trauma",
    name: "PTSD & Recovery",
    emoji: "💜",
    color: "#A78BFA",
    tagline: "Healing trauma alongside addiction",
    desc: "PTSD and addiction are deeply connected. This circle addresses both — the triggers, the flashbacks, the healing work, and the resilience.",
    topics: ["Triggers", "Therapy", "EMDR", "Grounding", "Safety"],
    prompt: "What grounding technique helps you most when triggered?",
    sensitive: true,
  },
  {
    id: "grief_loss",
    category: "trauma",
    name: "Grief & Loss Support",
    emoji: "🕊️",
    color: "#94A3B8",
    tagline: "Processing grief without substances",
    desc: "Many people use substances to cope with grief. This circle supports processing loss — of people, time, relationships, and identity — without using.",
    topics: ["Grief", "Coping", "Loss", "Relationships", "Healing"],
    prompt: "What or who are you grieving right now, and how are you honoring that loss?",
    sensitive: true,
  },
  {
    id: "dv_survivors",
    category: "trauma",
    name: "Domestic Violence Survivors",
    emoji: "🛡️",
    color: "#F472B6",
    tagline: "Healing from abuse in recovery",
    desc: "Survivors of domestic violence often use substances to cope with trauma. This circle is a safe, private space to share healing and recovery.",
    topics: ["Safety planning", "Healing", "Boundaries", "Rebuilding", "Support"],
    prompt: "What does safety look like in your life today?",
    sensitive: true,
  },
];

// Smart recommendation logic
export function getRecommendedCircles(profile) {
  const recs = [];
  if (!profile) return CIRCLES.slice(0, 4);

  const { program_type, sobriety_start_date } = profile;

  // Sobriety stage
  if (sobriety_start_date) {
    const days = Math.floor((Date.now() - new Date(sobriety_start_date)) / 86400000);
    if (days <= 7)  recs.push("first_7_days");
    else if (days <= 30) recs.push("first_30_days");
    else if (days <= 90) recs.push("first_90_days");
    else recs.push("post_rehab");
  }

  // Program type
  if (program_type === "post_incarceration") {
    recs.push("recently_released");
    recs.push("probation_parole");
  }
  if (program_type === "housing_transition") {
    recs.push("housing_stability");
  }

  // Always suggest a substance + lifestyle circle
  if (!recs.includes("opiate_recovery")) recs.push("opiate_recovery");
  if (!recs.includes("mens_recovery"))   recs.push("mens_recovery");

  return CIRCLES.filter(c => recs.includes(c.id)).slice(0, 4);
}