import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  Briefcase,
  Car,
  CheckCircle2,
  ChevronRight,
  Church,
  ClipboardCheck,
  Compass,
  Dumbbell,
  Flame,
  Heart,
  HeartHandshake,
  Home,
  MapPin,
  Mic,
  Mountain,
  Music2,
  Phone,
  Play,
  Shield,
  ShieldCheck,
  Star,
  Users,
  Utensils,
  Waves,
} from "lucide-react";
import ReZilientLogo from "@/components/shared/ReZilientLogo";

const roles = [
  { id: "client", label: "Client / Participant", dashboard: "Daily structure and support", permissions: "Own plan, check-ins, messages, resources" },
  { id: "counselor", label: "Counselor", dashboard: "Caseload and S.E.E. planner", permissions: "Create plans, review risk, message clients" },
  { id: "sponsor", label: "Sponsor", dashboard: "Support circle", permissions: "Encouragement, milestones, check-in visibility" },
  { id: "mentor", label: "Mentor", dashboard: "Growth coaching", permissions: "Goals, habits, career and purpose support" },
  { id: "probation", label: "Probation Officer", dashboard: "Compliance overview", permissions: "Court dates, requirements, verified activity" },
  { id: "family", label: "Family Supporter", dashboard: "Family connection", permissions: "Encouragement, safe messaging, wins" },
  { id: "facility_admin", label: "Facility Admin", dashboard: "Facility command center", permissions: "Staff, clients, outcomes, resources" },
  { id: "veteran", label: "Veteran", dashboard: "Veteran hub", permissions: "VA benefits, military mentors, housing support" },
  { id: "returning_citizen", label: "Returning Citizen", dashboard: "Reentry roadmap", permissions: "Housing, ID, jobs, legal and transportation" },
  { id: "seeking_help", label: "Person Seeking Help", dashboard: "Immediate help", permissions: "Find help now, calm mode, local support" },
];

const weeklyItems = [
  { day: "Mon", time: "3:00 PM", title: "Therapy", meta: "Video session", icon: HeartHandshake, tone: "blue" },
  { day: "Tue", time: "7:00 PM", title: "NA meeting", meta: "Riverside Hall", icon: Users, tone: "green" },
  { day: "Wed", time: "10:00 AM", title: "Job search", meta: "2 applications", icon: Briefcase, tone: "gold" },
  { day: "Thu", time: "8:30 AM", title: "Court check-in", meta: "Ride needed", icon: ShieldCheck, tone: "rose" },
  { day: "Fri", time: "7:00 PM", title: "NA meeting", meta: "Sponsor attends", icon: Users, tone: "green" },
];

const roadmap = [
  { label: "Days 1-14", title: "Stabilization", progress: 82 },
  { label: "Days 15-30", title: "Structure", progress: 54 },
  { label: "Days 31-60", title: "Rebuild", progress: 22 },
  { label: "Days 61-90", title: "Growth", progress: 8 },
  { label: "6 month", title: "Momentum", progress: 0 },
  { label: "1 year", title: "Purpose", progress: 0 },
  { label: "5 year", title: "Vision", progress: 0 },
];

const pillars = [
  {
    title: "Recovery",
    icon: Shield,
    href: "/RecoveryPath",
    accent: "emerald",
    summary: "Daily check-ins, meetings, cravings, journaling, meditation, breathing, mood, triggers, gratitude, streaks and recovery score.",
    actions: [["Daily Strength Check", "/DailyCheckIn"], ["Meetings", "/MeetingDirectory"], ["Calm reset", "/MentalReset"], ["Audio vault", "/AudioVault"]],
  },
  {
    title: "Reentry",
    icon: Home,
    href: "/RecoveryMapFinder",
    accent: "blue",
    summary: "Housing, food, jobs, benefits, legal, transportation, shelters, education, ID assistance and government help.",
    actions: [["Resource map", "/RecoveryMapFinder"], ["Housing", "/HousingAssistance"], ["Jobs", "/EmploymentOpportunities"], ["ID help", "/IdentityBridge"]],
  },
  {
    title: "Community",
    icon: Users,
    href: "/AhHaCommunity",
    accent: "violet",
    summary: "Ah Ha Moments, support circles, stories, groups, peer interaction, mentor matching and safe encouragement.",
    actions: [["Ah Ha Moment", "/AhHaMoment"], ["Support circle", "/InnerCircle"], ["Mentors", "/Mentors"], ["Stories", "/StoriesHub"]],
  },
  {
    title: "Growth",
    icon: Mountain,
    href: "/GrowthHub",
    accent: "gold",
    summary: "Fitness, habits, books, career, education, purpose, learning and personal growth that creates a future.",
    actions: [["Goals", "/GoalBoard"], ["Fitness", "/MindBodyRecovery"], ["Learning", "/LearnRecovery"], ["Future You", "/FutureYou"]],
  },
];

const resources = [
  { category: "food", name: "Community Food Pantry", distance: "0.7 mi", meta: "Open until 6 PM", icon: Utensils },
  { category: "shelters", name: "Safe Rest Shelter", distance: "1.4 mi", meta: "Beds available", icon: Home },
  { category: "rehabs", name: "Recovery IOP Center", distance: "2.1 mi", meta: "Medicaid accepted", icon: Heart },
  { category: "employment", name: "Second Chance Staffing", distance: "1.8 mi", meta: "Walk-ins today", icon: Briefcase },
  { category: "transportation", name: "Transit Support Desk", distance: "0.4 mi", meta: "Bus passes", icon: Car },
  { category: "churches", name: "Hope Fellowship", distance: "0.9 mi", meta: "Dinner tonight", icon: Church },
  { category: "government help", name: "Benefits Enrollment Office", distance: "2.7 mi", meta: "SNAP and ID assistance", icon: BadgeCheck },
  { category: "legal aid", name: "Reentry Legal Clinic", distance: "3.2 mi", meta: "Free consults", icon: ShieldCheck },
];

const supportCircle = [
  { role: "Counselor", name: "Dana R.", last: "Today", activity: "Reviewed weekly plan", icon: ClipboardCheck },
  { role: "Sponsor", name: "Mike T.", last: "2h ago", activity: "Sent encouragement", icon: HeartHandshake },
  { role: "Mentor", name: "Alicia M.", last: "Yesterday", activity: "Career goal updated", icon: Star },
  { role: "Family", name: "Mom", last: "3d ago", activity: "Proud of your consistency", icon: Heart },
  { role: "PO", name: "Officer Lane", last: "Fri", activity: "Court reminder confirmed", icon: ShieldCheck },
];

const audioCollections = [
  "NA audio",
  "AA speakers",
  "Motivation",
  "Meditation",
  "Calming frequencies",
  "Binaural beats",
  "Success stories",
  "Podcasts",
];

function answerFor(prompt) {
  const normalized = prompt.toLowerCase();
  if (normalized.includes("housing")) return "Start with the Resource Map housing filter, save two options, then message your counselor to confirm eligibility and transportation.";
  if (normalized.includes("food")) return "I found nearby food support. Prioritize the pantry open today, then save the church dinner option as backup.";
  if (normalized.includes("calm") || normalized.includes("panic")) return "Put both feet on the floor. Breathe in for 4, hold for 4, out for 6. Use the reset button if the feeling keeps rising.";
  if (normalized.includes("meeting")) return "Tonight has a 7 PM NA meeting on your itinerary. Leave 30 minutes early and confirm your ride now.";
  if (normalized.includes("job")) return "Open your employment task, apply to one realistic listing, then log the win. One honest step counts today.";
  return "Your next best step is to complete the Daily Strength Check, review your next appointment, and choose one mission board action.";
}

function RoleSelectionPanel({ activeRole, onSelect }) {
  return (
    <section className="rez-section" id="roles">
      <div className="rez-section-head">
        <span>Onboarding</span>
        <h2>Choose the role that matches your path.</h2>
        <p>Each role gets a unique dashboard, permissions, language, and support model.</p>
      </div>
      <div className="rez-role-grid">
        {roles.map((role) => (
          <button key={role.id} onClick={() => onSelect(role.id)} className={`rez-role-card ${activeRole === role.id ? "active" : ""}`}>
            <strong>{role.label}</strong>
            <span>{role.dashboard}</span>
            <small>{role.permissions}</small>
          </button>
        ))}
      </div>
    </section>
  );
}

function ItineraryCard() {
  return (
    <section className="rez-card rez-itinerary">
      <div className="rez-card-head">
        <div>
          <span>Weekly Itinerary</span>
          <h2>What do I need today?</h2>
        </div>
        <Link to="/AftercarePlanView">Full plan <ChevronRight size={16} /></Link>
      </div>
      <div className="rez-timeline">
        {weeklyItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link to="/AftercarePlanView" key={`${item.day}-${item.title}`} className={`rez-time-row ${item.tone}`}>
              <div className="rez-day">{item.day}</div>
              <div className="rez-time-icon"><Icon size={18} /></div>
              <div>
                <strong>{item.title}</strong>
                <span>{item.time} · {item.meta}</span>
              </div>
              <ArrowRight size={16} />
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function MissionBoard() {
  const [missions, setMissions] = useState(["Get custody back", "Stay sober", "Employment", "Housing", "Family"]);
  return (
    <section className="rez-card rez-mission">
      <div className="rez-card-head">
        <div>
          <span>Top 5 Mission Board</span>
          <h2>Non-negotiables</h2>
        </div>
        <Link to="/TopFiveNonNegotiables">Open board <ChevronRight size={16} /></Link>
      </div>
      <div className="rez-whiteboard">
        {missions.map((mission, index) => (
          <label key={index}>
            <small>{index + 1}</small>
            <input value={mission} onChange={(event) => setMissions((prev) => prev.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} />
          </label>
        ))}
      </div>
    </section>
  );
}

function RoadmapTimeline() {
  return (
    <section className="rez-section">
      <div className="rez-section-head compact">
        <span>My Roadmap</span>
        <h2>From stabilization to vision.</h2>
      </div>
      <div className="rez-roadmap-scroll">
        {roadmap.map((phase) => (
          <div key={phase.label} className="rez-roadmap-card">
            <small>{phase.label}</small>
            <strong>{phase.title}</strong>
            <div className="rez-progress"><i style={{ width: `${phase.progress}%` }} /></div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PillarsGrid() {
  return (
    <section className="rez-section">
      <div className="rez-section-head">
        <span>Help · Hope · Healing</span>
        <h2>The four systems that rebuild life.</h2>
        <p>Recovery is one pillar. ReZilient also handles reentry, community, purpose, and practical stability.</p>
      </div>
      <div className="rez-pillars-grid">
        {pillars.map((pillar) => {
          const Icon = pillar.icon;
          return (
            <article key={pillar.title} className={`rez-pillar ${pillar.accent}`}>
              <Link to={pillar.href} className="rez-pillar-main">
                <div className="rez-pillar-icon"><Icon size={26} /></div>
                <div>
                  <p>{pillar.title}</p>
                  <h3>{pillar.summary}</h3>
                </div>
              </Link>
              <div className="rez-action-chips">
                {pillar.actions.map(([label, href]) => <Link key={label} to={href}>{label}</Link>)}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function AskAI() {
  const [prompt, setPrompt] = useState("How do I get housing?");
  const answer = useMemo(() => answerFor(prompt), [prompt]);
  const prompts = ["How do I get housing?", "Find food near me", "Help me calm down", "What meetings tonight?", "What jobs near me?"];
  return (
    <section className="rez-card rez-ai">
      <div className="rez-ai-orb"><Bot size={34} /></div>
      <div>
        <span>Ask ReZilient AI</span>
        <h2>Context-aware support in plain English.</h2>
        <p>Ask about housing, food, meetings, transportation, jobs, calm mode, goals, or what to do next.</p>
      </div>
      <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} aria-label="Ask ReZilient AI" />
      <div className="rez-prompt-row">
        {prompts.map((item) => <button key={item} onClick={() => setPrompt(item)}>{item}</button>)}
      </div>
      <div className="rez-ai-answer">
        <strong>S.E.E. recommends</strong>
        <p>{answer}</p>
      </div>
      <Link className="btn-primary rez-full-link" to="/SuperAgentChat">Open full AI companion</Link>
    </section>
  );
}

function SEEPlanner() {
  const [notes, setNotes] = useState("John attends NA every Tuesday and Friday at 7pm. Job search every weekday. Therapy Mondays at 3pm. Wants gym three times weekly.");
  const plan = useMemo(() => {
    const hasNA = /na|meeting/i.test(notes);
    const hasJob = /job|work|employment/i.test(notes);
    const hasTherapy = /therapy|counsel/i.test(notes);
    const hasGym = /gym|fitness|workout/i.test(notes);
    return [
      hasTherapy && "Calendar: Therapy Mondays at 3 PM with 1-hour reminder",
      hasNA && "Recurring meetings: Tuesday and Friday at 7 PM",
      hasJob && "Daily tasks: Weekday job search block with progress check",
      hasGym && "Goal: Gym 3x weekly with transportation review",
      "Roadmap: 30/60/90 day milestones and risk indicators",
      "Notifications: Daily check-in and weekly counselor review",
    ].filter(Boolean);
  }, [notes]);
  return (
    <section className="rez-card rez-see">
      <div className="rez-card-head">
        <div>
          <span>S.E.E. Super AI</span>
          <h2>Structure. Engagement. Empowerment.</h2>
        </div>
        <Link to="/SEESuperAgent">Counselor planner <ChevronRight size={16} /></Link>
      </div>
      <textarea value={notes} onChange={(event) => setNotes(event.target.value)} aria-label="S.E.E. planner input" />
      <div className="rez-see-output">
        {plan.map((item) => <div key={item}><CheckCircle2 size={16} />{item}</div>)}
      </div>
    </section>
  );
}

function ResourceMapPreview() {
  const [filter, setFilter] = useState("food");
  const categories = ["food", "shelters", "rehabs", "IOP", "employment", "transportation", "churches", "YMCA", "government help", "Goodwill", "Salvation Army", "legal aid"];
  const visible = resources.filter((item) => item.category === filter || (filter === "IOP" && item.category === "rehabs") || !resources.some((resource) => resource.category === filter)).slice(0, 4);
  return (
    <section className="rez-section">
      <div className="rez-section-head compact">
        <span>Local Resource Map</span>
        <h2>Practical help near me.</h2>
      </div>
      <div className="rez-filter-row">
        {categories.map((category) => <button key={category} onClick={() => setFilter(category)} className={filter === category ? "active" : ""}>{category}</button>)}
      </div>
      <div className="rez-resource-grid">
        {visible.map((resource) => {
          const Icon = resource.icon;
          return (
            <article key={resource.name} className="rez-resource-card">
              <div><Icon size={21} /></div>
              <strong>{resource.name}</strong>
              <span>{resource.distance} · {resource.meta}</span>
              <div>
                <Link to="/RecoveryMapFinder"><MapPin size={14} /> Directions</Link>
                <a href="tel:+18005550199"><Phone size={14} /> Call</a>
                <button><Star size={14} /> Save</button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function AccountabilityPanel() {
  const [check, setCheck] = useState({ mood: 7, stress: 4, energy: 6, cravings: 2, sleep: 7, meetings: true });
  const engagement = Math.round((check.mood + (10 - check.stress) + check.energy + (10 - check.cravings) + check.sleep + (check.meetings ? 10 : 4)) / 6 * 10);
  const risk = check.cravings > 6 || check.stress > 7 ? "Needs support" : check.energy < 4 ? "Watch energy" : "Steady";
  return (
    <section className="rez-card">
      <div className="rez-card-head">
        <div>
          <span>Daily Strength Check</span>
          <h2>Accountability without shame.</h2>
        </div>
        <strong className="rez-score">{engagement}</strong>
      </div>
      <div className="rez-slider-grid">
        {["mood", "stress", "energy", "cravings", "sleep"].map((key) => (
          <label key={key}>
            <span>{key}</span>
            <input type="range" min="0" max="10" value={check[key]} onChange={(event) => setCheck({ ...check, [key]: Number(event.target.value) })} />
            <small>{check[key]}/10</small>
          </label>
        ))}
      </div>
      <button className={`rez-toggle ${check.meetings ? "active" : ""}`} onClick={() => setCheck({ ...check, meetings: !check.meetings })}>Meeting attended today</button>
      <div className="rez-metric-row">
        <span>Streak: 18 days</span>
        <span>Consistency: 86%</span>
        <span>Risk: {risk}</span>
        <span>Badge: Structure Builder</span>
      </div>
    </section>
  );
}

function SupportCircle() {
  return (
    <section className="rez-section">
      <div className="rez-section-head compact">
        <span>Support Circle</span>
        <h2>Your people stay close.</h2>
      </div>
      <div className="rez-support-grid">
        {supportCircle.map((person) => {
          const Icon = person.icon;
          return (
            <Link key={person.role} to="/InnerCircle" className="rez-support-card">
              <Icon size={20} />
              <strong>{person.role}</strong>
              <span>{person.name} · {person.last}</span>
              <small>{person.activity}</small>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function AhHaFeature() {
  const reactions = ["Respect", "Powerful", "Needed This", "Proud Of You", "Inspired"];
  return (
    <section className="rez-card rez-ahha">
      <div>
        <span>Flagship Feature</span>
        <h2>Ah Ha Moment</h2>
        <p>The exact moment life changed, captured privately or shared safely with moderation and supportive reactions only.</p>
      </div>
      <div className="rez-media-options">
        <button><Mic size={16} /> Audio</button>
        <button><Play size={16} /> Video</button>
        <button><ShieldCheck size={16} /> Private</button>
        <button><Users size={16} /> Moderated public</button>
      </div>
      <textarea placeholder="What was the moment you knew life had to change?" />
      <div className="rez-reactions">{reactions.map((reaction) => <span key={reaction}>{reaction}</span>)}</div>
      <Link className="btn-gold rez-full-link" to="/AhHaMoment">Create my Ah Ha Moment</Link>
    </section>
  );
}

function AudioVaultPreview() {
  return (
    <section className="rez-card">
      <div className="rez-card-head">
        <div>
          <span>Recovery Audio Vault</span>
          <h2>Calm, motivation, and voices that help.</h2>
        </div>
        <Link to="/AudioVault">Open vault <ChevronRight size={16} /></Link>
      </div>
      <div className="rez-audio-grid">
        {audioCollections.map((item, index) => (
          <Link to="/AudioVault" key={item} className="rez-audio-card">
            {index % 3 === 0 ? <Music2 size={19} /> : index % 3 === 1 ? <Waves size={19} /> : <Mic size={19} />}
            <strong>{item}</strong>
          </Link>
        ))}
      </div>
    </section>
  );
}

function VeteranAndProfile() {
  return (
    <section className="rez-split">
      <article className="rez-card">
        <span>Veteran Hub</span>
        <h2>Built for transition, benefits, housing, VA help, and military mentorship.</h2>
        <div className="rez-action-chips">
          <Link to="/VeteranSupportHub">VA help</Link>
          <Link to="/VeteranResourceMap">Veteran map</Link>
          <Link to="/VeteranMode">Military mentorship</Link>
        </div>
      </article>
      <article className="rez-card">
        <span>Positive Growth Profile</span>
        <h2>Wins, milestones, goals, favorite memories, hobbies, support network, and improvement graphs.</h2>
        <p className="rez-muted">ReZilient shows forward movement only. No shame walls. No clinical scoreboard.</p>
        <Link className="btn-ghost rez-full-link" to="/Profile">Open profile</Link>
      </article>
    </section>
  );
}

function CounselorDashboardPreview({ role }) {
  const isProfessional = ["counselor", "probation", "facility_admin"].includes(role);
  return (
    <section className={`rez-card rez-counselor ${isProfessional ? "active" : ""}`}>
      <div className="rez-card-head">
        <div>
          <span>Counselor Dashboard</span>
          <h2>Aftercare is ready before discharge.</h2>
        </div>
        <Link to="/SEESuperAgent">Launch S.E.E. <ChevronRight size={16} /></Link>
      </div>
      <div className="rez-dashboard-grid">
        {[
          ["Client overview", "42 active"],
          ["Progress", "86% engaged"],
          ["Risk level", "6 need review"],
          ["Roadmaps", "19 live"],
          ["Messages", "12 unread"],
          ["Calendar", "31 events"],
        ].map(([label, value]) => <div key={label}><small>{label}</small><strong>{value}</strong></div>)}
      </div>
      <p className="rez-muted">Counselors can type plain English notes, review AI-generated plans, create calendar events, transportation needs, goals, tasks, notifications, check-ins and risk indicators.</p>
    </section>
  );
}

export default function ReZilientHome() {
  const [activeRole, setActiveRole] = useState(() => sessionStorage.getItem("unbound_role") || "client");
  const selectedRole = roles.find((role) => role.id === activeRole) || roles[0];
  const selectRole = (roleId) => {
    sessionStorage.setItem("unbound_role", roleId);
    setActiveRole(roleId);
  };

  return (
    <main className="rez-app-shell">
      <section className="rez-hero">
        <div className="rez-hero-brand">
          <ReZilientLogo className="h-16 w-16" />
          <div>
            <p>ReZilient</p>
            <span>Built For Life's Biggest Comebacks.</span>
          </div>
        </div>
        <div className="rez-hero-copy">
          <span>Help · Hope · Healing</span>
          <h1>The operating system for rebuilding your life.</h1>
          <p>AI-powered digital recovery, aftercare, accountability, and reentry support for life after treatment, incarceration, homelessness, trauma, military transition, or a major setback.</p>
        </div>
        <div className="rez-hero-actions">
          <a className="btn-primary" href="#today">Show me today</a>
          <Link className="btn-gold" to="/RoleSelect">Start onboarding</Link>
          <Link className="btn-ghost" to="/SEESuperAgent">Counselor S.E.E.</Link>
        </div>
        <div className="rez-role-pill">
          <Compass size={18} />
          <span>Current role</span>
          <strong>{selectedRole.label}</strong>
        </div>
      </section>

      <RoleSelectionPanel activeRole={activeRole} onSelect={selectRole} />

      <section className="rez-today-grid" id="today">
        <ItineraryCard />
        <MissionBoard />
      </section>

      <RoadmapTimeline />
      <PillarsGrid />

      <section className="rez-duo-grid">
        <AskAI />
        <SEEPlanner />
      </section>

      <ResourceMapPreview />

      <section className="rez-duo-grid">
        <AccountabilityPanel />
        <AhHaFeature />
      </section>

      <SupportCircle />

      <section className="rez-duo-grid">
        <AudioVaultPreview />
        <CounselorDashboardPreview role={activeRole} />
      </section>

      <VeteranAndProfile />

      <section className="rez-closing-card">
        <Flame size={28} />
        <h2>This app actually understands me.</h2>
        <p>Structure when the day is confusing. Support when things get heavy. Purpose when the future feels far away.</p>
      </section>

      <style>{`
        .rez-app-shell { max-width: 1180px; margin: 0 auto; padding: clamp(16px, 3vw, 34px) clamp(12px, 3vw, 28px) 124px; color: var(--text); }
        .rez-hero { position: relative; overflow: hidden; border: 1px solid rgba(190,225,255,.20); border-radius: 38px; padding: clamp(22px, 5vw, 54px); min-height: 620px; display: flex; flex-direction: column; justify-content: space-between; background: radial-gradient(circle at 18% 12%, rgba(91,141,239,.42), transparent 34%), radial-gradient(circle at 76% 28%, rgba(240,183,83,.20), transparent 32%), linear-gradient(145deg, rgba(255,255,255,.13), rgba(7,10,20,.76)); box-shadow: 0 34px 100px rgba(0,0,0,.48), inset 0 1px 0 rgba(255,255,255,.12); backdrop-filter: blur(30px) saturate(170%); }
        .rez-hero:after { content: ""; position: absolute; inset: auto -14% -32% 28%; height: 420px; border-radius: 999px; background: linear-gradient(90deg, rgba(52,211,153,.18), rgba(91,141,239,.26), rgba(167,139,250,.14)); filter: blur(16px); transform: rotate(-8deg); }
        .rez-hero > * { position: relative; z-index: 1; }
        .rez-hero-brand { display: flex; align-items: center; gap: 14px; }
        .rez-hero-brand p { margin: 0; text-transform: uppercase; letter-spacing: .24em; color: #dbeafe; font-weight: 950; font-size: 12px; }
        .rez-hero-brand span { color: var(--gold); font-weight: 900; }
        .rez-hero-copy { max-width: 790px; margin: 72px 0 34px; }
        .rez-hero-copy > span, .rez-section-head > span, .rez-card span:first-child, .rez-ai > div:nth-child(2) > span, .rez-ahha > div:first-child span { color: #8bdcff; text-transform: uppercase; letter-spacing: .18em; font-weight: 950; font-size: 11px; }
        .rez-hero h1 { margin: 12px 0 0; font-size: clamp(48px, 9vw, 112px); line-height: .88; letter-spacing: -.065em; }
        .rez-hero-copy p { max-width: 720px; margin: 22px 0 0; color: var(--text-muted); font-size: clamp(16px, 2vw, 20px); line-height: 1.65; }
        .rez-hero-actions { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }
        .rez-role-pill { position: absolute; right: clamp(18px, 4vw, 44px); bottom: clamp(18px, 4vw, 44px); min-width: 250px; border-radius: 26px; padding: 16px; display: grid; gap: 4px; background: rgba(255,255,255,.09); border: 1px solid rgba(255,255,255,.14); box-shadow: inset 0 1px 0 rgba(255,255,255,.10); }
        .rez-role-pill svg { color: var(--gold); }
        .rez-role-pill span { color: var(--text-dim); text-transform: uppercase; letter-spacing: .14em; font-size: 10px; font-weight: 950; }
        .rez-role-pill strong { font-size: 18px; }
        .rez-section { margin-top: 22px; }
        .rez-section-head { margin-bottom: 16px; max-width: 780px; }
        .rez-section-head.compact { margin-bottom: 12px; }
        .rez-section-head h2, .rez-card h2, .rez-closing-card h2 { margin: 7px 0 0; font-size: clamp(28px, 4vw, 48px); line-height: 1; letter-spacing: -.035em; }
        .rez-section-head p, .rez-card p, .rez-muted { color: var(--text-muted); line-height: 1.58; }
        .rez-role-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 10px; }
        .rez-role-card { min-height: 150px; border-radius: 26px; padding: 16px; text-align: left; background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.12); color: var(--text); box-shadow: none; }
        .rez-role-card.active { background: linear-gradient(145deg, rgba(240,183,83,.22), rgba(91,141,239,.14)); border-color: rgba(240,183,83,.44); box-shadow: 0 0 32px rgba(240,183,83,.15); }
        .rez-role-card strong, .rez-role-card span, .rez-role-card small { display: block; }
        .rez-role-card strong { font-size: 15px; }
        .rez-role-card span { color: var(--gold); margin-top: 8px; font-size: 12px; font-weight: 950; }
        .rez-role-card small { color: var(--text-muted); margin-top: 7px; line-height: 1.45; }
        .rez-today-grid, .rez-duo-grid, .rez-split { display: grid; grid-template-columns: minmax(0, 1.08fr) minmax(0, .92fr); gap: 16px; margin-top: 22px; }
        .rez-card { border: 1px solid rgba(190,225,255,.16); border-radius: 32px; padding: clamp(18px, 3vw, 28px); background: linear-gradient(145deg, rgba(255,255,255,.105), rgba(13,18,32,.66)); box-shadow: 0 24px 70px rgba(0,0,0,.34), inset 0 1px 0 rgba(255,255,255,.10); backdrop-filter: blur(26px) saturate(165%); }
        .rez-card-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 18px; }
        .rez-card-head a { color: var(--gold); text-decoration: none; font-weight: 950; display: inline-flex; align-items: center; gap: 3px; white-space: nowrap; }
        .rez-timeline { display: grid; gap: 10px; }
        .rez-time-row { display: grid; grid-template-columns: 48px 44px 1fr 18px; align-items: center; gap: 12px; min-height: 76px; border-radius: 24px; padding: 12px; text-decoration: none; color: var(--text); background: rgba(255,255,255,.065); border: 1px solid rgba(255,255,255,.10); }
        .rez-day, .rez-time-icon { display: grid; place-items: center; border-radius: 16px; font-weight: 950; }
        .rez-day { height: 44px; background: rgba(255,255,255,.09); color: #dbeafe; }
        .rez-time-icon { height: 44px; color: #07101f; }
        .rez-time-row.blue .rez-time-icon { background: #93c5fd; } .rez-time-row.green .rez-time-icon { background: #6ee7b7; } .rez-time-row.gold .rez-time-icon { background: #fbbf24; } .rez-time-row.rose .rez-time-icon { background: #fda4af; }
        .rez-time-row strong, .rez-time-row span { display: block; } .rez-time-row span { color: var(--text-muted); margin-top: 3px; font-size: 13px; }
        .rez-whiteboard { display: grid; gap: 10px; }
        .rez-whiteboard label { display: grid; grid-template-columns: 38px 1fr; align-items: center; gap: 10px; border-radius: 20px; padding: 10px; background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.10); }
        .rez-whiteboard small { width: 34px; height: 34px; display: grid; place-items: center; border-radius: 999px; background: linear-gradient(135deg, var(--gold), #67e8f9); color: #07101f; font-weight: 950; }
        .rez-whiteboard input, .rez-card textarea, .rez-card input[type="range"] { width: 100%; }
        .rez-whiteboard input, .rez-card textarea { min-height: 48px; border: 0; outline: 0; border-radius: 16px; padding: 12px 14px; background: rgba(7,10,20,.42); color: var(--text); font-weight: 850; }
        .rez-card textarea { min-height: 150px; resize: vertical; border: 1px solid rgba(255,255,255,.12); }
        .rez-roadmap-scroll { display: grid; grid-auto-flow: column; grid-auto-columns: minmax(210px, 1fr); gap: 12px; overflow-x: auto; padding-bottom: 8px; scroll-snap-type: x mandatory; }
        .rez-roadmap-card { scroll-snap-align: start; min-height: 144px; border-radius: 28px; padding: 18px; background: linear-gradient(145deg, rgba(255,255,255,.09), rgba(91,141,239,.09)); border: 1px solid rgba(255,255,255,.12); }
        .rez-roadmap-card small { color: var(--gold); font-weight: 950; text-transform: uppercase; letter-spacing: .12em; }
        .rez-roadmap-card strong { display: block; margin-top: 10px; font-size: 22px; }
        .rez-progress { height: 9px; margin-top: 20px; border-radius: 999px; overflow: hidden; background: rgba(255,255,255,.09); }
        .rez-progress i { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #34d399, #67e8f9, #f0b753); }
        .rez-pillars-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
        .rez-pillar { border-radius: 32px; padding: 18px; border: 1px solid rgba(255,255,255,.13); background: linear-gradient(145deg, rgba(255,255,255,.095), rgba(7,10,20,.50)); box-shadow: 0 20px 58px rgba(0,0,0,.28); }
        .rez-pillar-main { display: grid; grid-template-columns: 62px 1fr; gap: 16px; text-decoration: none; color: var(--text); }
        .rez-pillar-icon { width: 62px; height: 62px; display: grid; place-items: center; border-radius: 22px; color: #07101f; }
        .rez-pillar.emerald .rez-pillar-icon { background: #6ee7b7; } .rez-pillar.blue .rez-pillar-icon { background: #93c5fd; } .rez-pillar.violet .rez-pillar-icon { background: #c4b5fd; } .rez-pillar.gold .rez-pillar-icon { background: #fbbf24; }
        .rez-pillar p { margin: 0; color: var(--gold); font-weight: 950; text-transform: uppercase; letter-spacing: .14em; font-size: 11px; }
        .rez-pillar h3 { margin: 8px 0 0; font-family: 'DM Sans', sans-serif; font-size: 16px; line-height: 1.45; color: var(--text); }
        .rez-action-chips, .rez-prompt-row, .rez-filter-row, .rez-media-options, .rez-reactions, .rez-metric-row { display: flex; flex-wrap: wrap; gap: 9px; margin-top: 16px; }
        .rez-action-chips a, .rez-prompt-row button, .rez-filter-row button, .rez-media-options button, .rez-reactions span, .rez-metric-row span, .rez-toggle { min-height: 38px; border-radius: 999px; padding: 9px 12px; text-decoration: none; color: var(--text); background: rgba(255,255,255,.075); border: 1px solid rgba(255,255,255,.12); font-size: 12px; font-weight: 950; box-shadow: none; }
        .rez-filter-row button.active, .rez-toggle.active { color: #07101f; background: linear-gradient(135deg, #f0b753, #67e8f9); }
        .rez-ai { display: grid; gap: 15px; }
        .rez-ai-orb { width: 78px; height: 78px; display: grid; place-items: center; border-radius: 28px; color: #07101f; background: linear-gradient(135deg, #67e8f9, #c4b5fd); box-shadow: 0 0 42px rgba(103,232,249,.28); }
        .rez-ai-answer, .rez-see-output div { border-radius: 22px; padding: 14px; background: rgba(255,255,255,.075); border: 1px solid rgba(255,255,255,.10); }
        .rez-ai-answer strong { color: var(--gold); }
        .rez-full-link { width: 100%; text-align: center; justify-content: center; display: inline-flex; align-items: center; }
        .rez-see-output { display: grid; gap: 9px; margin-top: 14px; }
        .rez-see-output div { display: flex; align-items: center; gap: 10px; color: var(--text-muted); font-weight: 800; }
        .rez-see-output svg { color: #6ee7b7; flex: 0 0 auto; }
        .rez-resource-grid, .rez-support-grid, .rez-audio-grid, .rez-dashboard-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
        .rez-resource-card, .rez-support-card, .rez-audio-card, .rez-dashboard-grid div { min-height: 150px; border-radius: 26px; padding: 16px; background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.12); color: var(--text); text-decoration: none; }
        .rez-resource-card > div:first-child, .rez-support-card svg, .rez-audio-card svg { color: var(--gold); }
        .rez-resource-card strong, .rez-resource-card span, .rez-support-card strong, .rez-support-card span, .rez-support-card small, .rez-audio-card strong, .rez-dashboard-grid small, .rez-dashboard-grid strong { display: block; }
        .rez-resource-card span, .rez-support-card span, .rez-support-card small { color: var(--text-muted); margin-top: 6px; }
        .rez-resource-card > div:last-child { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 14px; }
        .rez-resource-card a, .rez-resource-card button { min-height: 32px; border-radius: 999px; padding: 7px 9px; display: inline-flex; align-items: center; gap: 5px; color: var(--text); background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.10); text-decoration: none; font-size: 11px; font-weight: 950; }
        .rez-score { width: 64px; height: 64px; display: grid; place-items: center; border-radius: 50%; color: #07101f; background: conic-gradient(#34d399 86%, rgba(255,255,255,.14) 0); }
        .rez-slider-grid { display: grid; gap: 12px; }
        .rez-slider-grid label { display: grid; grid-template-columns: 82px 1fr 48px; gap: 10px; align-items: center; color: var(--text-muted); font-weight: 900; text-transform: capitalize; }
        .rez-ahha { display: grid; gap: 16px; background: radial-gradient(circle at 24% 8%, rgba(240,183,83,.18), transparent 36%), linear-gradient(145deg, rgba(255,255,255,.11), rgba(13,18,32,.66)); }
        .rez-reactions span { color: #07101f; background: #f0b753; }
        .rez-audio-card { min-height: 98px; display: flex; flex-direction: column; justify-content: space-between; }
        .rez-dashboard-grid div { min-height: 110px; }
        .rez-dashboard-grid small { color: var(--text-muted); text-transform: uppercase; letter-spacing: .12em; font-weight: 950; }
        .rez-dashboard-grid strong { margin-top: 12px; font-size: 24px; }
        .rez-counselor.active { border-color: rgba(52,211,153,.34); box-shadow: 0 0 40px rgba(52,211,153,.12), 0 24px 70px rgba(0,0,0,.34); }
        .rez-closing-card { margin-top: 24px; text-align: center; border-radius: 34px; padding: 34px 20px; background: linear-gradient(135deg, rgba(240,183,83,.16), rgba(91,141,239,.15)); border: 1px solid rgba(255,255,255,.14); }
        .rez-closing-card svg { color: var(--gold); margin: 0 auto 10px; }
        @media (max-width: 980px) { .rez-role-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .rez-today-grid, .rez-duo-grid, .rez-split, .rez-pillars-grid { grid-template-columns: 1fr; } .rez-resource-grid, .rez-support-grid, .rez-audio-grid, .rez-dashboard-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .rez-role-pill { position: static; margin-top: 18px; } }
        @media (max-width: 600px) { .rez-app-shell { padding-inline: 10px; } .rez-hero { min-height: auto; } .rez-hero-copy { margin: 46px 0 24px; } .rez-hero-actions a { width: 100%; justify-content: center; } .rez-role-grid, .rez-resource-grid, .rez-support-grid, .rez-audio-grid, .rez-dashboard-grid { grid-template-columns: 1fr; } .rez-card-head { flex-direction: column; } .rez-time-row { grid-template-columns: 42px 40px 1fr; } .rez-time-row > svg { display: none; } .rez-slider-grid label { grid-template-columns: 1fr; } }
      `}</style>
    </main>
  );
}
