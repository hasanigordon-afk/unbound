import React from "react";
import { Link } from "react-router-dom";
import { Award, Briefcase, CalendarCheck, HeartPulse, Home, LineChart, MessageCircle, ShieldCheck, Target, Users } from "lucide-react";
import OutcomeMetricCard from "@/components/outcomes/OutcomeMetricCard";
import ProgressReportPanel from "@/components/outcomes/ProgressReportPanel";

const metrics = [
  { label: "Recovery streak", value: "42 days", detail: "Long-term consistency trend", icon: Award, color: "#F0B753" },
  { label: "Daily engagement", value: "86%", detail: "Check-ins, tools, and app activity", icon: LineChart, color: "#5B8DEF" },
  { label: "Meetings attended", value: "18", detail: "Verified support participation", icon: CalendarCheck, color: "#34D399" },
  { label: "Goals completed", value: "12", detail: "Recovery and stabilization tasks", icon: Target, color: "#A78BFA" },
  { label: "Employment progress", value: "Active", detail: "Applications, interviews, training", icon: Briefcase, color: "#F59E0B" },
  { label: "Housing stability", value: "Stable", detail: "Current housing status trend", icon: Home, color: "#22D3EE" },
  { label: "Mentor interactions", value: "9", detail: "Support touches this month", icon: MessageCircle, color: "#818CF8" },
  { label: "Wellness activity", value: "23", detail: "Fitness, mindfulness, nutrition", icon: HeartPulse, color: "#F472B6" },
];

const stages = ["Engaged", "Stabilizing", "Building", "Sustaining"];

export default function OutcomesProgress() {
  return (
    <main style={{ minHeight: "100vh", padding: "28px 18px 150px", color: "var(--text)" }}>
      <div style={{ maxWidth: 1220, margin: "0 auto" }}>
        <section className="card-glow fade-up" style={{ padding: "32px clamp(20px, 5vw, 46px)", marginBottom: 20, position: "relative", overflow: "hidden" }}>
          <div aria-hidden style={{ position: "absolute", right: -90, top: -110, width: 330, height: 330, borderRadius: "50%", background: "radial-gradient(circle, rgba(52,211,153,.18), transparent 70%)", filter: "blur(26px)" }} />
          <div style={{ position: "relative", maxWidth: 780 }}>
            <div className="pill pill-teal" style={{ marginBottom: 16 }}><ShieldCheck style={{ width: 13, marginRight: 6 }} /> Outcomes & Progress</div>
            <h1 style={{ fontSize: "clamp(34px, 6vw, 62px)", lineHeight: 1, marginBottom: 14 }}>Measure recovery stabilization over time.</h1>
            <p style={{ color: "var(--text-muted)", fontSize: 17, lineHeight: 1.65 }}>Track the signals that matter: streaks, engagement, meetings, goals, employment, housing, mentorship, and wellness activity.</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 22 }}>
              <Link to="/InstitutionalPortal" className="btn-primary" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}><Users style={{ width: 17 }} /> Institutional View</Link>
              <Link to="/SavedResources" className="btn-ghost" style={{ textDecoration: "none" }}>Resource Coordination</Link>
            </div>
          </div>
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14, marginBottom: 20 }}>
          {metrics.map(metric => <OutcomeMetricCard key={metric.label} {...metric} />)}
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.2fr) minmax(300px, .8fr)", gap: 20 }}>
          <div className="card" style={{ padding: 22 }}>
            <p className="section-label">Long-Term Stabilization Path</p>
            <div style={{ display: "grid", gap: 16 }}>
              {stages.map((stage, index) => (
                <div key={stage} style={{ display: "grid", gridTemplateColumns: "42px 1fr", gap: 12, alignItems: "center" }}>
                  <div style={{ width: 42, height: 42, borderRadius: "50%", background: index < 3 ? "linear-gradient(135deg, var(--accent), var(--green))" : "var(--surface)", border: "1px solid var(--border-glow)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>{index + 1}</div>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 7 }}>
                      <strong>{stage}</strong><span style={{ color: "var(--text-muted)", fontSize: 12 }}>{index < 3 ? "On track" : "Next"}</span>
                    </div>
                    <div style={{ height: 9, borderRadius: 999, background: "var(--surface)", overflow: "hidden" }}>
                      <div style={{ width: `${Math.min(100, (index + 1) * 24)}%`, height: "100%", background: index < 3 ? "linear-gradient(90deg, var(--accent), var(--green))" : "var(--border)", borderRadius: 999 }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <ProgressReportPanel />
        </section>
      </div>
    </main>
  );
}