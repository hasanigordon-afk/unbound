import React from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  Bell,
  CalendarCheck,
  ClipboardCheck,
  FileCheck2,
  HeartPulse,
  LayoutDashboard,
  LockKeyhole,
  Network,
  ShieldCheck,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import InstitutionMetricCard from "@/components/institutional/InstitutionMetricCard";
import InstitutionWorkflowCard from "@/components/institutional/InstitutionWorkflowCard";

const workflows = [
  { to: "/FacilityDashboard", icon: LayoutDashboard, title: "Facility Dashboard", desc: "A command center for caseload visibility, alerts, client status, and staff workflows.", color: "var(--accent)" },
  { to: "/PatientSummaryDashboard", icon: Activity, title: "Client Engagement Analytics", desc: "Monitor check-ins, app activity, resource usage, and early disengagement signals.", color: "var(--green)" },
  { to: "/ClientProgress", icon: TrendingUp, title: "Recovery Outcome Tracking", desc: "Track stabilization progress, goals, milestones, treatment engagement, and long-term outcomes.", color: "var(--gold)" },
  { to: "/FacilityAdmin", icon: UserPlus, title: "Onboarding Management", desc: "Invite clients, assign counselors, organize cohorts, and guide participants into the right tools.", color: "var(--purple)" },
  { to: "/Meetings", icon: CalendarCheck, title: "Appointment Reminders", desc: "Support upcoming appointments, groups, meetings, and accountability touchpoints.", color: "var(--accent)" },
  { to: "/ComplianceReports", icon: ClipboardCheck, title: "Compliance Tracking", desc: "Document participation, reports, tasks, signoffs, and program requirements in one place.", color: "var(--gold)" },
  { to: "/RebuildHub", icon: Network, title: "Community Resource Coordination", desc: "Coordinate housing, food, legal, employment, veteran, and mental health resources.", color: "var(--green)" },
];

export default function InstitutionalPortal() {
  return (
    <main style={{ minHeight: "100vh", padding: "30px 18px 150px", color: "var(--text)" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <section className="card-glow fade-up" style={{ position: "relative", overflow: "hidden", padding: "34px clamp(22px, 5vw, 52px)", marginBottom: 20 }}>
          <div aria-hidden style={{ position: "absolute", top: -140, right: -100, width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle, rgba(91,141,239,.26), transparent 68%)", filter: "blur(28px)" }} />
          <div style={{ position: "relative", display: "grid", gridTemplateColumns: "minmax(0, 1.25fr) minmax(280px, .75fr)", gap: 28, alignItems: "center" }}>
            <div>
              <div className="pill" style={{ color: "var(--accent)", background: "var(--navy-dim)", border: "1px solid var(--navy-border)", marginBottom: 16 }}>
                <ShieldCheck style={{ width: 13, marginRight: 6 }} /> Institutional Re-silient
              </div>
              <h1 style={{ fontSize: "clamp(36px, 6vw, 64px)", lineHeight: 1, marginBottom: 16 }}>Recovery operations for teams who care.</h1>
              <p style={{ color: "var(--text-muted)", fontSize: 17, lineHeight: 1.65, maxWidth: 720 }}>
                A professional workspace for rehab centers, sober living homes, probation programs, hospitals, and nonprofits to coordinate care, monitor engagement, and support measurable recovery outcomes.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 24 }}>
                <Link to="/FacilityDashboard" className="btn-primary" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 9 }}><LayoutDashboard style={{ width: 18 }} /> Open Facility Dashboard</Link>
                <Link to="/FacilityAdmin" className="btn-ghost" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 9 }}><UserPlus style={{ width: 18 }} /> Manage Onboarding</Link>
              </div>
            </div>
            <div className="card-soft" style={{ padding: 20 }}>
              <LockKeyhole style={{ width: 30, height: 30, color: "var(--green)", marginBottom: 12 }} />
              <h2 style={{ fontSize: 24, marginBottom: 8 }}>Privacy-first care coordination</h2>
              <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.6 }}>Designed with a HIPAA-conscious, role-aware feel: clear access points, restrained data surfaces, and counselor-friendly workflows.</p>
            </div>
          </div>
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 22 }}>
          <InstitutionMetricCard icon={Users} label="Active clients" value="128" detail="Caseload visibility across programs and assigned staff." />
          <InstitutionMetricCard icon={HeartPulse} label="Engagement" value="82%" detail="Recent check-ins, activity, and recovery tool usage." color="var(--green)" />
          <InstitutionMetricCard icon={FileCheck2} label="Compliance" value="94%" detail="Tasks, appointments, and documentation completion." color="var(--gold)" />
          <InstitutionMetricCard icon={Bell} label="Priority alerts" value="7" detail="Clients needing staff review or support follow-up." color="var(--red)" />
        </section>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 330px", gap: 20 }}>
          <section>
            <p className="section-label">Institutional Workflows</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
              {workflows.map(item => <InstitutionWorkflowCard key={item.title} {...item} />)}
            </div>
          </section>

          <aside style={{ display: "grid", gap: 14, alignContent: "start" }}>
            <div className="card" style={{ padding: 18 }}>
              <p className="section-label" style={{ marginTop: 0 }}>Today’s Staff Focus</p>
              {["Review high-priority engagement alerts", "Confirm appointment reminders", "Coordinate housing and food referrals", "Complete pending compliance notes"].map((item, index) => (
                <div key={item} style={{ display: "flex", gap: 11, padding: "11px 0", borderTop: index ? "1px solid var(--border)" : "none" }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", display: "grid", placeItems: "center", background: "var(--navy-dim)", color: "var(--accent)", fontSize: 12, fontWeight: 900 }}>{index + 1}</div>
                  <p style={{ color: "var(--text-muted)", fontSize: 13.5, lineHeight: 1.45 }}>{item}</p>
                </div>
              ))}
            </div>

            <div className="card-glow" style={{ padding: 20, background: "linear-gradient(145deg, rgba(52,211,153,.14), rgba(255,255,255,.035))" }}>
              <Network style={{ width: 30, height: 30, color: "var(--green)", marginBottom: 12 }} />
              <h3 style={{ fontSize: 22, marginBottom: 8 }}>Resource coordination layer</h3>
              <p style={{ color: "var(--text-muted)", fontSize: 13.5, lineHeight: 1.55, marginBottom: 16 }}>Connect client needs to trusted community supports for housing, food, work, legal help, veteran services, and mental health.</p>
              <Link to="/RebuildHub" className="btn-primary" style={{ width: "100%", justifyContent: "center", display: "inline-flex", textDecoration: "none" }}>Open Resource Hub</Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}