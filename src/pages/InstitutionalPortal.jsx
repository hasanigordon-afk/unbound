import React from "react";
import { Link } from "react-router-dom";
import { BarChart3, Bell, Building2, CalendarClock, ClipboardCheck, FileCheck2, HeartHandshake, Shield, UserPlus, Users } from "lucide-react";
import OutcomeMetricCard from "@/components/outcomes/OutcomeMetricCard";

const modules = [
  { title: "Facility dashboard", body: "A clear operational view for rehab centers, sober living homes, hospitals, nonprofits, and probation programs.", icon: Building2, to: "/FacilityDashboard" },
  { title: "Client engagement analytics", body: "Spot participation trends, missed check-ins, and support opportunities before clients disengage.", icon: BarChart3, to: "/OutcomesProgress" },
  { title: "Recovery outcome tracking", body: "Measure streaks, goals, meetings, housing, employment, mentorship, and wellness activity.", icon: ClipboardCheck, to: "/OutcomesProgress" },
  { title: "Onboarding management", body: "Guide new clients through setup, consent, goals, reminders, and resource matching.", icon: UserPlus, to: "/GuidedProfileSetup" },
  { title: "Appointment reminders", body: "Keep clients connected to sessions, meetings, care teams, and required appointments.", icon: CalendarClock, to: "/MeetingDirectory" },
  { title: "Compliance tracking", body: "Professional reporting for attendance, tasks, participation, and recovery plan follow-through.", icon: FileCheck2, to: "/ComplianceReports" },
  { title: "Resource coordination", body: "Coordinate housing, food, transportation, legal support, employment, and veteran resources.", icon: HeartHandshake, to: "/RebuildHub" },
  { title: "Team collaboration", body: "Give counselors and administrators a calm, shared workspace for case visibility.", icon: Users, to: "/StaffDashboard" },
];

function ModuleCard({ item }) {
  const Icon = item.icon;
  return (
    <Link to={item.to} style={{ textDecoration: "none" }}>
      <div className="card" style={{ padding: 18, minHeight: 176 }}>
        <div style={{ width: 48, height: 48, borderRadius: 16, background: "var(--navy-dim)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
          <Icon style={{ width: 22 }} />
        </div>
        <h3 style={{ fontSize: 20, marginBottom: 8 }}>{item.title}</h3>
        <p style={{ color: "var(--text-muted)", fontSize: 13.5, lineHeight: 1.55 }}>{item.body}</p>
      </div>
    </Link>
  );
}

export default function InstitutionalPortal() {
  return (
    <main style={{ minHeight: "100vh", padding: "28px 18px 150px", color: "var(--text)" }}>
      <div style={{ maxWidth: 1220, margin: "0 auto" }}>
        <section className="card-glow fade-up" style={{ padding: "34px clamp(20px, 5vw, 48px)", marginBottom: 20, overflow: "hidden", position: "relative" }}>
          <div aria-hidden style={{ position: "absolute", right: -120, top: -120, width: 370, height: 370, borderRadius: "50%", background: "radial-gradient(circle, rgba(91,141,239,.22), transparent 70%)", filter: "blur(28px)" }} />
          <div style={{ position: "relative", maxWidth: 800 }}>
            <div className="pill pill-teal" style={{ marginBottom: 16 }}><Shield style={{ width: 13, marginRight: 6 }} /> Institutional Re-silient</div>
            <h1 style={{ fontSize: "clamp(34px, 6vw, 62px)", lineHeight: 1, marginBottom: 14 }}>A trusted recovery operations layer for care teams.</h1>
            <p style={{ color: "var(--text-muted)", fontSize: 17, lineHeight: 1.65 }}>Professional, HIPAA-conscious workflows for counselors, administrators, probation teams, hospitals, sober living homes, nonprofits, and treatment providers.</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 22 }}>
              <Link to="/FacilityDashboard" className="btn-primary" style={{ textDecoration: "none" }}>Open Facility Dashboard</Link>
              <Link to="/OutcomesProgress" className="btn-ghost" style={{ textDecoration: "none" }}>View Outcomes</Link>
            </div>
          </div>
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 20 }}>
          <OutcomeMetricCard icon={Users} label="Active clients" value="128" detail="Engagement monitored weekly" color="#5B8DEF" />
          <OutcomeMetricCard icon={BarChart3} label="Stability trend" value="+18%" detail="Improved long-term indicators" color="#34D399" />
          <OutcomeMetricCard icon={Bell} label="Reminder coverage" value="94%" detail="Appointments and meetings tracked" color="#F0B753" />
          <OutcomeMetricCard icon={FileCheck2} label="Compliance ready" value="Yes" detail="Reports organized for review" color="#A78BFA" />
        </section>

        <section>
          <p className="section-label">Institutional Tools</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 14 }}>
            {modules.map(item => <ModuleCard key={item.title} item={item} />)}
          </div>
        </section>
      </div>
    </main>
  );
}