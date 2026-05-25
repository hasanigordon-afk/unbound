import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import ReZilientLogo from "@/components/shared/ReZilientLogo";
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Building2,
  HeartHandshake,
  Home,
  ShieldCheck,
  Sparkles,
  Star,
  UserRound,
  Users,
} from "lucide-react";

const ROLE_OPTIONS = [
  {
    id: "client",
    label: "Client / Participant",
    destination: "/Home",
    icon: UserRound,
    focus: "Daily structure, appointments, goals, check-ins, meetings and support circle.",
    permissions: ["Own plan", "Daily check-ins", "Resources", "Messages"],
  },
  {
    id: "counselor",
    label: "Counselor",
    destination: "/SEESuperAgent",
    icon: HeartHandshake,
    focus: "Build aftercare before discharge with S.E.E. and monitor client progress.",
    permissions: ["Aftercare builder", "Risk review", "Calendar", "Messaging"],
  },
  {
    id: "sponsor",
    label: "Sponsor",
    destination: "/InnerCircle",
    icon: ShieldCheck,
    focus: "Stay connected with encouragement, meeting support and permission-based updates.",
    permissions: ["Encouragement", "Milestones", "Check-in visibility"],
  },
  {
    id: "mentor",
    label: "Mentor",
    destination: "/Mentors",
    icon: Star,
    focus: "Support purpose, career, habits, learning and healthy accountability.",
    permissions: ["Growth goals", "Messages", "Wins"],
  },
  {
    id: "probation_officer",
    label: "Probation Officer",
    destination: "/ProbationOfficerDashboard",
    icon: BadgeCheck,
    focus: "Track court dates, compliance tasks, verified activity and support needs.",
    permissions: ["Compliance", "Court calendar", "Reports"],
  },
  {
    id: "family_supporter",
    label: "Family Supporter",
    destination: "/SupportUserDashboard",
    icon: Users,
    focus: "Offer safe encouragement and see positive progress with consent.",
    permissions: ["Encouragement", "Wins", "Safe messaging"],
  },
  {
    id: "facility_admin",
    label: "Facility Admin",
    destination: "/FacilityPilotDashboard",
    icon: Building2,
    focus: "Manage staff, facility clients, outcomes, resources and discharge readiness.",
    permissions: ["Facility overview", "Staff", "Outcomes", "Resources"],
  },
  {
    id: "veteran",
    label: "Veteran",
    destination: "/VeteranSupportHub",
    icon: ShieldCheck,
    focus: "VA help, benefits, housing, military mentorship and transition support.",
    permissions: ["VA resources", "Mentors", "Housing", "Benefits"],
  },
  {
    id: "returning_citizen",
    label: "Returning Citizen",
    destination: "/RecoveryMapFinder",
    icon: Home,
    focus: "Reentry support for housing, ID, jobs, transportation, food and legal aid.",
    permissions: ["Reentry map", "ID help", "Jobs", "Legal"],
  },
  {
    id: "person_seeking_help",
    label: "Person Seeking Help",
    destination: "/HelpHub",
    icon: Sparkles,
    focus: "Immediate non-judgmental help, calm tools, local resources and next steps.",
    permissions: ["Find help", "Calm mode", "Ask AI", "Resources"],
  },
];

export default function RoleSelect() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState("client");
  const [saving, setSaving] = useState(false);
  const activeRole = ROLE_OPTIONS.find((role) => role.id === selectedRole) || ROLE_OPTIONS[0];

  const continueWithRole = async (role = activeRole) => {
    setSaving(true);
    sessionStorage.setItem("unbound_role", role.id);
    try {
      await base44.auth.updateMe({ role: role.id, rezilient_role: role.id });
    } catch {
      // Preview and logged-out paths still keep the selected role locally.
    }
    setSaving(false);
    navigate(role.destination);
  };

  return (
    <main className="role-select-shell">
      <section className="role-select-hero">
        <div className="role-brand">
          <ReZilientLogo size={64} className="h-16 w-16" />
          <div>
            <p>ReZilient onboarding</p>
            <span>Built For Life's Biggest Comebacks.</span>
          </div>
        </div>
        <div className="role-copy">
          <span>Help · Hope · Healing</span>
          <h1>Who are you here as today?</h1>
          <p>ReZilient changes the dashboard, permissions, language and next steps for each person in the recovery and reentry ecosystem.</p>
        </div>
        <button onClick={() => continueWithRole()} className="btn-primary role-primary" disabled={saving}>
          Continue as {activeRole.label} <ArrowRight size={18} />
        </button>
      </section>

      <section className="role-grid-section">
        <div className="role-grid">
          {ROLE_OPTIONS.map((role) => {
            const Icon = role.icon;
            const active = role.id === selectedRole;
            return (
              <button key={role.id} onClick={() => setSelectedRole(role.id)} onDoubleClick={() => continueWithRole(role)} className={active ? "role-card active" : "role-card"}>
                <div className="role-icon"><Icon size={23} /></div>
                <strong>{role.label}</strong>
                <span>{role.focus}</span>
                <div>{role.permissions.map((permission) => <small key={permission}>{permission}</small>)}</div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="role-summary-card">
        <Briefcase size={22} />
        <div>
          <h2>{activeRole.label} dashboard</h2>
          <p>{activeRole.focus}</p>
        </div>
        <button onClick={() => continueWithRole()} disabled={saving}>Open dashboard</button>
      </section>

      <style>{`
        .role-select-shell { min-height: 100vh; max-width: 1180px; margin: 0 auto; padding: clamp(16px, 3vw, 34px) clamp(12px, 3vw, 28px) 120px; color: var(--text); }
        .role-select-hero { min-height: 520px; display: flex; flex-direction: column; justify-content: space-between; border-radius: 38px; padding: clamp(22px, 5vw, 52px); background: radial-gradient(circle at 18% 10%, rgba(91,141,239,.36), transparent 34%), radial-gradient(circle at 82% 18%, rgba(240,183,83,.22), transparent 32%), linear-gradient(145deg, rgba(255,255,255,.13), rgba(7,10,20,.76)); border: 1px solid rgba(190,225,255,.20); box-shadow: 0 34px 100px rgba(0,0,0,.48), inset 0 1px 0 rgba(255,255,255,.12); backdrop-filter: blur(30px) saturate(170%); }
        .role-brand { display: flex; align-items: center; gap: 14px; }
        .role-brand p { margin: 0; text-transform: uppercase; letter-spacing: .22em; color: #dbeafe; font-size: 12px; font-weight: 950; }
        .role-brand span, .role-copy > span { color: var(--gold); font-weight: 950; }
        .role-copy { max-width: 760px; margin: 64px 0 28px; }
        .role-copy > span { text-transform: uppercase; letter-spacing: .18em; font-size: 11px; }
        .role-copy h1 { margin: 12px 0 0; font-size: clamp(48px, 9vw, 104px); line-height: .88; letter-spacing: -.06em; }
        .role-copy p { max-width: 700px; color: var(--text-muted); font-size: clamp(16px, 2vw, 20px); line-height: 1.62; }
        .role-primary { width: fit-content; display: inline-flex; align-items: center; gap: 9px; }
        .role-grid-section { margin-top: 18px; }
        .role-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; }
        .role-card { min-height: 232px; text-align: left; border-radius: 28px; padding: 16px; color: var(--text); background: linear-gradient(145deg, rgba(255,255,255,.08), rgba(13,18,32,.58)); border: 1px solid rgba(255,255,255,.12); box-shadow: 0 18px 46px rgba(0,0,0,.24); }
        .role-card.active { border-color: rgba(240,183,83,.48); background: linear-gradient(145deg, rgba(240,183,83,.20), rgba(91,141,239,.14)); box-shadow: 0 0 42px rgba(240,183,83,.16), 0 18px 46px rgba(0,0,0,.28); }
        .role-icon { width: 52px; height: 52px; border-radius: 20px; display: grid; place-items: center; color: #07101f; background: linear-gradient(135deg, #f0b753, #67e8f9); margin-bottom: 14px; }
        .role-card strong, .role-card span { display: block; }
        .role-card strong { font-size: 16px; }
        .role-card span { margin-top: 9px; color: var(--text-muted); line-height: 1.45; font-size: 13px; }
        .role-card div:last-child { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 13px; }
        .role-card small { border-radius: 999px; padding: 6px 8px; background: rgba(255,255,255,.075); border: 1px solid rgba(255,255,255,.10); color: #dbeafe; font-weight: 900; font-size: 10px; }
        .role-summary-card { margin-top: 18px; display: grid; grid-template-columns: 46px 1fr auto; gap: 14px; align-items: center; border-radius: 30px; padding: 18px; background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.12); }
        .role-summary-card svg { color: var(--gold); }
        .role-summary-card h2 { margin: 0; font-size: 28px; }
        .role-summary-card p { margin: 5px 0 0; color: var(--text-muted); line-height: 1.55; }
        .role-summary-card button { min-height: 46px; border-radius: 999px; padding: 0 18px; color: #07101f; background: #fff; border: 0; font-weight: 950; }
        @media (max-width: 980px) { .role-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .role-summary-card { grid-template-columns: 1fr; } }
        @media (max-width: 560px) { .role-select-shell { padding-inline: 10px; } .role-select-hero { min-height: auto; } .role-copy { margin: 46px 0 24px; } .role-primary { width: 100%; justify-content: center; } .role-grid { grid-template-columns: 1fr; } }
      `}</style>
    </main>
  );
}
