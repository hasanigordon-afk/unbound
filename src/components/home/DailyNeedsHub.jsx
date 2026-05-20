import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Brain,
  Briefcase,
  CalendarCheck,
  CheckCircle2,
  Compass,
  HeartHandshake,
  Home,
  Shield,
  Sparkles,
  Target,
  Users,
} from "lucide-react";

const PERSONA_LABELS = {
  recovery: "Recovery support",
  reentry: "Reentry stability",
  veteran: "Veteran support",
  need_support: "Immediate support",
  supporter: "Supporting someone",
};

const PILLARS = [
  {
    title: "Recovery & Accountability",
    subtitle: "Check-ins, meetings, plans, and relapse-aware support.",
    icon: Shield,
    accent: "#34D399",
    href: "/RecoveryPath",
    links: [
      ["Daily Check-In", "/DailyCheckIn"],
      ["Meetings", "/MeetingDirectory"],
      ["Recovery Path", "/RecoveryPath"],
    ],
  },
  {
    title: "Stability & Reentry",
    subtitle: "Housing, jobs, benefits, legal navigation, and resources.",
    icon: Briefcase,
    accent: "#22D3EE",
    href: "/RebuildHub",
    links: [
      ["Help Hub", "/HelpHub"],
      ["Justice Radar", "/JusticeRadar"],
      ["Veteran Hub", "/VeteranSupportHub"],
    ],
  },
  {
    title: "Mind & Wellness",
    subtitle: "Mental reset, nutrition, movement, grounding, and calm.",
    icon: Brain,
    accent: "#A78BFA",
    href: "/HealingHub",
    links: [
      ["Mental Reset", "/MentalReset"],
      ["Wellness Plan", "/WellnessPlan"],
      ["Mind Body", "/MindBodyRecovery"],
    ],
  },
  {
    title: "Community & Growth",
    subtitle: "Stories, mentors, wins, comeback energy, and purpose.",
    icon: Users,
    accent: "#F0B753",
    href: "/GrowthHub",
    links: [
      ["Stories", "/StoriesHub"],
      ["Community", "/AhHaCommunity"],
      ["Comebacks", "/ComebackPortal"],
    ],
  },
];

function PillarCard({ pillar }) {
  const Icon = pillar.icon;
  return (
    <article className="daily-pillar" style={{ "--accent": pillar.accent }}>
      <Link to={pillar.href} className="daily-pillar-main">
        <div className="daily-pillar-icon"><Icon size={22} /></div>
        <div>
          <h3>{pillar.title}</h3>
          <p>{pillar.subtitle}</p>
        </div>
        <ArrowRight size={18} />
      </Link>
      <div className="daily-pillar-links">
        {pillar.links.map(([label, href]) => <Link key={label} to={href}>{label}</Link>)}
      </div>
    </article>
  );
}

function RecoveryCompanionCompact({ streak, stability }) {
  const tasks = [
    { label: "Check in", href: "/DailyCheckIn", icon: CalendarCheck, done: true },
    { label: "Find support", href: "/MeetingDirectory", icon: HeartHandshake },
    { label: "Ask AI Stein", href: "/SuperAgent", icon: Sparkles },
  ];

  return (
    <section className="daily-card companion-compact">
      <div className="daily-section-head">
        <span>Recovery Companion</span>
        <strong>No shame. Next step.</strong>
      </div>
      <div className="companion-row">
        <div className="companion-score">
          <strong>{streak || 0}</strong>
          <span>day streak</span>
        </div>
        <div>
          <h2>Stay steady today</h2>
          <p>{stability ? `${stability}% stability signal based on recent check-ins.` : "A simple rhythm for support, reminders, and accountability."}</p>
        </div>
      </div>
      <div className="daily-action-row">
        {tasks.map(({ label, href, icon: Icon, done }) => (
          <Link key={label} to={href} className={done ? "done" : ""}>
            <Icon size={15} /> {label}
          </Link>
        ))}
      </div>
    </section>
  );
}

function MissionBoardCompact() {
  const missions = ["Family", "Health", "Stability", "Work", "Purpose"];
  return (
    <section className="daily-card mission-compact">
      <div className="daily-section-head">
        <span>Top 5 Mission Board</span>
        <Link to="/TopFiveNonNegotiables">Open board <ArrowRight size={14} /></Link>
      </div>
      <div className="mission-chips">
        {missions.map((mission, index) => (
          <Link key={mission} to="/TopFiveNonNegotiables">
            <strong>{index + 1}</strong><span>{mission}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function DailyNeedsHub({ firstName, streak, stability, profile }) {
  const goals = profile?.goals || [];
  const persona = goals.find((goal) => String(goal).startsWith("persona:"))?.replace("persona:", "") || goals.find((goal) => ["recovery", "reentry", "veteran", "need_support", "supporter"].includes(goal)) || "recovery";
  const primaryNeed = profile?.support_needs?.[0] || PERSONA_LABELS[persona] || "support";

  return (
    <main className="daily-hub-shell">
      <section className="daily-welcome card-glow">
        <div>
          <p className="section-label">What do you need today?</p>
          <h1>Welcome back, {firstName}.</h1>
          <p>Your home screen is now focused on daily support first. Everything else lives inside the four core pillars.</p>
        </div>
        <div className="daily-personalization">
          <Compass size={18} />
          <span>Personalized for</span>
          <strong>{primaryNeed}</strong>
        </div>
      </section>

      <section className="daily-grid-top">
        <RecoveryCompanionCompact streak={streak} stability={stability} />
        <MissionBoardCompact />
      </section>

      <section className="daily-pillars-section">
        <div className="daily-section-title">
          <span>Four Core Pillars</span>
          <h2>Choose the kind of help you need.</h2>
        </div>
        <div className="daily-pillars-grid">
          {PILLARS.map((pillar) => <PillarCard key={pillar.title} pillar={pillar} />)}
        </div>
      </section>

      <section className="daily-bottom-actions">
        <Link to="/HelpHub" className="urgent"><Home size={17} /> I need help now</Link>
        <Link to="/AIAftercareTeam"><Target size={17} /> Build my plan</Link>
        <Link to="/Profile"><CheckCircle2 size={17} /> Update my profile</Link>
      </section>

      <style>{`
        .daily-hub-shell { min-height: 100vh; padding: clamp(18px, 3vw, 34px) clamp(14px, 3vw, 30px) 120px; max-width: 1180px; margin: 0 auto; color: var(--text); }
        .daily-welcome { display: grid; grid-template-columns: 1fr auto; gap: 22px; align-items: end; padding: clamp(24px, 4vw, 42px); margin-bottom: 18px; }
        .daily-welcome h1 { font-size: clamp(40px, 7vw, 82px); line-height: .92; letter-spacing: -.055em; margin: 0; }
        .daily-welcome p:not(.section-label) { max-width: 690px; color: var(--text-muted); font-size: clamp(15px, 1.6vw, 18px); line-height: 1.65; margin-top: 14px; }
        .daily-personalization { min-width: 230px; border-radius: 24px; padding: 16px; background: rgba(255,255,255,.07); border: 1px solid rgba(34,211,238,.22); display: grid; gap: 5px; box-shadow: 0 0 26px rgba(34,211,238,.12); }
        .daily-personalization svg { color: #22D3EE; }
        .daily-personalization span { color: var(--text-dim); font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: .12em; }
        .daily-personalization strong { color: var(--text); font-size: 18px; }
        .daily-grid-top { display: grid; grid-template-columns: 1.15fr .85fr; gap: 16px; margin-bottom: 22px; }
        .daily-card, .daily-pillar { background: linear-gradient(145deg, rgba(255,255,255,.10), rgba(13,18,32,.72)); border: 1px solid rgba(190,225,255,.15); border-radius: 28px; box-shadow: 0 20px 54px rgba(0,0,0,.28), inset 0 1px 0 rgba(255,255,255,.10); backdrop-filter: blur(24px) saturate(160%); }
        .daily-card { padding: 22px; }
        .daily-section-head { display: flex; justify-content: space-between; gap: 12px; align-items: center; margin-bottom: 16px; }
        .daily-section-head span, .daily-section-title span { color: #22D3EE; font-size: 10px; font-weight: 950; text-transform: uppercase; letter-spacing: .14em; }
        .daily-section-head strong { color: var(--gold); font-size: 12px; }
        .daily-section-head a { color: var(--gold); text-decoration: none; display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 900; }
        .companion-row { display: grid; grid-template-columns: 92px 1fr; gap: 18px; align-items: center; }
        .companion-score { width: 92px; height: 92px; border-radius: 50%; display: grid; place-items: center; background: conic-gradient(#34D399 72%, rgba(255,255,255,.10) 0); position: relative; box-shadow: 0 0 30px rgba(52,211,153,.18); }
        .companion-score:before { content: ''; position: absolute; inset: 8px; border-radius: 50%; background: rgba(7,10,20,.88); }
        .companion-score strong, .companion-score span { position: relative; grid-area: 1/1; }
        .companion-score strong { font-size: 28px; transform: translateY(-7px); }
        .companion-score span { color: var(--text-muted); font-size: 10px; font-weight: 900; transform: translateY(17px); }
        .companion-row h2 { margin: 0; font-size: 28px; }
        .companion-row p { color: var(--text-muted); margin: 7px 0 0; line-height: 1.55; }
        .daily-action-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 9px; margin-top: 18px; }
        .daily-action-row a, .daily-bottom-actions a { min-height: 46px; border-radius: 999px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 0 14px; text-decoration: none; color: var(--text); background: rgba(255,255,255,.065); border: 1px solid rgba(255,255,255,.12); font-size: 13px; font-weight: 900; }
        .daily-action-row a.done { color: #07101f; background: linear-gradient(135deg, #34D399, #22D3EE); }
        .mission-chips { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
        .mission-chips a { text-decoration: none; min-height: 92px; border-radius: 20px; background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.11); padding: 12px; display: flex; flex-direction: column; justify-content: space-between; }
        .mission-chips strong { width: 28px; height: 28px; display: grid; place-items: center; border-radius: 50%; color: #07101f; background: linear-gradient(135deg, var(--gold), #22D3EE); font-size: 12px; }
        .mission-chips span { color: var(--text); font-weight: 900; font-size: 13px; }
        .daily-pillars-section { margin-top: 6px; }
        .daily-section-title { margin-bottom: 13px; }
        .daily-section-title h2 { margin: 6px 0 0; font-size: clamp(28px, 4vw, 46px); line-height: 1; }
        .daily-pillars-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
        .daily-pillar { padding: 16px; overflow: hidden; }
        .daily-pillar-main { text-decoration: none; color: var(--text); display: grid; grid-template-columns: 54px 1fr auto; gap: 14px; align-items: center; }
        .daily-pillar-icon { width: 54px; height: 54px; border-radius: 18px; display: grid; place-items: center; color: var(--accent); background: color-mix(in srgb, var(--accent) 16%, transparent); border: 1px solid color-mix(in srgb, var(--accent) 35%, transparent); box-shadow: 0 0 24px color-mix(in srgb, var(--accent) 16%, transparent); }
        .daily-pillar h3 { margin: 0; font-size: 21px; }
        .daily-pillar p { color: var(--text-muted); margin: 5px 0 0; line-height: 1.45; font-size: 13px; }
        .daily-pillar-links { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
        .daily-pillar-links a { color: var(--text-muted); text-decoration: none; font-size: 11px; font-weight: 900; border-radius: 999px; padding: 7px 10px; background: rgba(255,255,255,.055); border: 1px solid rgba(255,255,255,.10); }
        .daily-bottom-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 18px; }
        .daily-bottom-actions .urgent { color: #fff; background: linear-gradient(135deg, rgba(248,113,113,.92), rgba(127,29,29,.72)); border-color: rgba(255,210,210,.20); }
        @media (max-width: 860px) { .daily-welcome, .daily-grid-top, .daily-pillars-grid { grid-template-columns: 1fr; } .daily-personalization { min-width: 0; } }
        @media (max-width: 560px) { .daily-hub-shell { padding-inline: 12px; } .daily-action-row, .mission-chips { grid-template-columns: 1fr; } .companion-row { grid-template-columns: 1fr; } .daily-pillar-main { grid-template-columns: 46px 1fr; } .daily-pillar-main > svg { display: none; } }
      `}</style>
    </main>
  );
}