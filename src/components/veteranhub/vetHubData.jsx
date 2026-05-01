// Veteran Support Hub — content config (icon-driven, scalable)

export const VH_COLORS = {
  navy:    "#0F1E3D",
  gold:    "#C8932F",
  olive:   "#5B6E48",
  red:     "#B5483D",
  cream:   "#F6F4EF",
  surface: "#FFFFFF",
  border:  "#E4DFD3",
  text:    "#1A1F2C",
  muted:   "#4A5260",
  dim:     "#6B7280",
};

// Top primary action panel (large tappable buttons)
export const PRIMARY_ACTIONS = [
  { key: "crisis",        label: "Crisis Help",     emoji: "🆘", color: "#B5483D", section: "crisis"     },
  { key: "housing",       label: "Housing",         emoji: "🏠", color: "#0F1E3D", section: "housing"    },
  { key: "jobs",          label: "Jobs & Careers",  emoji: "💼", color: "#5B6E48", section: "employment" },
  { key: "mental_health", label: "Mental Health",   emoji: "🧠", color: "#6B5B8E", section: "mental"     },
  { key: "financial",     label: "Financial Help",  emoji: "💵", color: "#C8932F", section: "financial"  },
  { key: "community",     label: "Community",       emoji: "🤝", color: "#1E88E5", section: "community"  },
];

// Resource categories — each contains a list of curated resources.
// Resources can be (a) external links, (b) phone calls, or (c) in-app routes.
export const CATEGORIES = [
  {
    key: "va_benefits",
    title: "VA Benefits",
    emoji: "🎖️",
    color: "#0F1E3D",
    needs: ["benefits"],
    items: [
      { label: "Disability Compensation", desc: "VA disability claim info & rates",        href: "https://www.va.gov/disability/",                            ext: true },
      { label: "GI Bill",                  desc: "Education benefits for veterans",         href: "https://www.va.gov/education/about-gi-bill-benefits/",      ext: true },
      { label: "Pension Programs",         desc: "Need-based pension for wartime vets",     href: "https://www.va.gov/pension/",                               ext: true },
      { label: "Claims Assistance",        desc: "Get help filing or appealing a claim",    href: "https://www.va.gov/disability/file-disability-claim-form-21-526ez/", ext: true },
    ],
  },
  {
    key: "mental",
    title: "Mental Health & Recovery",
    emoji: "🧠",
    color: "#6B5B8E",
    needs: ["recovery", "mental_health"],
    items: [
      { label: "PTSD Support",             desc: "VA's National Center for PTSD",            href: "https://www.ptsd.va.gov/",                                  ext: true },
      { label: "Addiction Recovery",       desc: "VA substance use treatment programs",      href: "https://www.mentalhealth.va.gov/substance-use/",            ext: true },
      { label: "Peer Support Groups",      desc: "Connect with vets who've been there",      route: "/AhHaCommunity"                                            },
      { label: "Counseling Access",        desc: "Vet Centers — free, confidential",         href: "https://www.vetcenter.va.gov/",                             ext: true },
    ],
  },
  {
    key: "housing",
    title: "Housing Assistance",
    emoji: "🏠",
    color: "#0F1E3D",
    needs: ["housing"],
    items: [
      { label: "HUD-VASH",                 desc: "Housing vouchers + VA case management",   href: "https://www.va.gov/homeless/hud-vash.asp",                   ext: true },
      { label: "Transitional Housing",     desc: "Grant & Per Diem program",                 href: "https://www.va.gov/homeless/gpd.asp",                        ext: true },
      { label: "Shelters Near You",        desc: "National Call Center for Homeless Vets",  href: "tel:18774244357",                                            phone: true },
      { label: "Sober Living",             desc: "Find recovery housing options",            route: "/RecoveryMapFinder"                                         },
    ],
  },
  {
    key: "employment",
    title: "Employment Services",
    emoji: "💼",
    color: "#5B6E48",
    needs: ["jobs"],
    items: [
      { label: "Resume Builder",           desc: "Translate military skills to civilian",   href: "https://www.onetonline.org/crosswalk/MOC/",                  ext: true },
      { label: "Job Listings",             desc: "Veterans.gov job board",                   href: "https://www.va.gov/careers-employment/",                     ext: true },
      { label: "Skill Certifications",     desc: "VET TEC tech training",                    href: "https://www.va.gov/education/about-gi-bill-benefits/how-to-use-benefits/vettec-high-tech-program/", ext: true },
      { label: "Apprenticeships",          desc: "On-the-job training under GI Bill",        href: "https://www.va.gov/education/about-gi-bill-benefits/how-to-use-benefits/on-the-job-training-apprenticeships/", ext: true },
    ],
  },
  {
    key: "education",
    title: "Education & Training",
    emoji: "🎓",
    color: "#1E88E5",
    needs: ["education"],
    items: [
      { label: "Trade Schools",            desc: "GI Bill-approved trade programs",          href: "https://www.va.gov/education/gi-bill-comparison-tool/",      ext: true },
      { label: "Online Certifications",    desc: "VET TEC + LinkedIn Learning for vets",     href: "https://www.va.gov/education/about-gi-bill-benefits/how-to-use-benefits/vettec-high-tech-program/", ext: true },
      { label: "Entrepreneurship",         desc: "VA's Boots to Business program",           href: "https://sbavets.force.com/s/",                              ext: true },
    ],
  },
  {
    key: "legal",
    title: "Legal Assistance",
    emoji: "⚖️",
    color: "#3A3A3A",
    needs: ["legal"],
    items: [
      { label: "Discharge Upgrade",        desc: "Upgrade your discharge status",            href: "https://www.va.gov/discharge-upgrade-instructions/",         ext: true },
      { label: "Criminal Record Help",     desc: "Veterans Treatment Court directory",       href: "https://justiceforvets.org/",                                ext: true },
      { label: "Benefits Appeals",         desc: "Appeal a VA decision",                     href: "https://www.va.gov/decision-reviews/",                       ext: true },
    ],
  },
  {
    key: "financial",
    title: "Financial Support",
    emoji: "💵",
    color: "#C8932F",
    needs: ["financial"],
    items: [
      { label: "Emergency Grants",         desc: "VFW Unmet Needs · 1-800-VFW-1899",        href: "https://www.vfw.org/assistance/financial-grants",            ext: true },
      { label: "Budgeting Tools",          desc: "Veterans Benefits Banking Program",        href: "https://veteransbenefitsbanking.org/",                       ext: true },
      { label: "Debt Relief",              desc: "VA financial counseling",                  href: "tel:18008271000",                                            phone: true },
    ],
  },
  {
    key: "physical",
    title: "Physical Health & Wellness",
    emoji: "💪",
    color: "#5B6E48",
    needs: ["fitness"],
    items: [
      { label: "VA Hospitals",             desc: "Find a VA medical center",                 href: "https://www.va.gov/find-locations/",                         ext: true },
      { label: "Fitness Programs",         desc: "Mind-Body Recovery in-app",                route: "/MindBodyRecovery"                                          },
      { label: "Nutrition Plans",          desc: "VA MOVE! weight management",               href: "https://www.move.va.gov/",                                   ext: true },
    ],
  },
  {
    key: "community",
    title: "Community",
    emoji: "🤝",
    color: "#1E88E5",
    needs: ["community"],
    items: [
      { label: "Veteran Feed",             desc: "Stories & posts from vets",                route: "/VeteransDashboard"                                         },
      { label: "Share an Ah Ha Moment",    desc: "Tell your turning-point story",            route: "/SubmitAhHa"                                                },
      { label: "Peer Connections",         desc: "Connect 1-on-1 with another vet",          route: "/InnerCircle"                                               },
    ],
  },
];

// Smart filter: needs (matches CATEGORY.needs)
export const NEED_OPTIONS = [
  { key: "all",          label: "All needs" },
  { key: "housing",      label: "Housing" },
  { key: "jobs",         label: "Jobs" },
  { key: "recovery",     label: "Recovery" },
  { key: "mental_health",label: "Mental Health" },
  { key: "benefits",     label: "Benefits" },
  { key: "legal",        label: "Legal" },
  { key: "financial",    label: "Financial" },
  { key: "education",    label: "Education" },
  { key: "fitness",      label: "Fitness" },
  { key: "community",    label: "Community" },
];

// Milestones tracked
export const MILESTONES = [
  { key: "found_housing",            label: "Found housing",            emoji: "🏠" },
  { key: "applied_to_jobs",          label: "Applied to jobs",          emoji: "💼" },
  { key: "attended_support_meeting", label: "Attended support meeting", emoji: "🤝" },
  { key: "started_va_claim",         label: "Started a VA claim",       emoji: "📋" },
  { key: "connected_with_peer",      label: "Connected with a peer",    emoji: "💬" },
  { key: "completed_resume",         label: "Completed resume",         emoji: "📄" },
  { key: "enrolled_in_education",    label: "Enrolled in education",    emoji: "🎓" },
  { key: "received_financial_help",  label: "Received financial help",  emoji: "💵" },
];