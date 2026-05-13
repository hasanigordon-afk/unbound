import React from "react";
import { Link } from "react-router-dom";
import { BriefcaseBusiness, CalendarCheck, Dumbbell, Users } from "lucide-react";

const missions = [
  { label: "Daily Check-In", icon: CalendarCheck, done: true, to: "/DailyCheckIn" },
  { label: "Meeting", icon: Users, done: false, to: "/MeetingDirectory" },
  { label: "Job Applications", icon: BriefcaseBusiness, done: false, to: "/RebuildHub" },
  { label: "Exercise", icon: Dumbbell, done: false, to: "/WellnessPlan" },
];

export default function DailyFocusWidget({ firstName = "there", todayComplete = false }) {
  const completed = missions.filter((item) => item.done || (item.label === "Daily Check-In" && todayComplete)).length;
  const percent = Math.round((completed / missions.length) * 100);

  return (
    <section className="card-glow" style={{ padding: "clamp(24px, 4vw, 36px)", marginBottom: 28 }}>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, .8fr) minmax(280px, 1.2fr)", gap: 26, alignItems: "center" }}>
        <div>
          <p className="section-label" style={{ marginBottom: 12 }}>Daily Focus</p>
          <h2 style={{ fontSize: "clamp(30px, 4vw, 48px)", lineHeight: 1, margin: 0 }}>Good Morning {firstName}</h2>
          <p style={{ color: "var(--text-muted)", marginTop: 12, lineHeight: 1.6 }}>Today’s Mission: complete the simple actions that keep your comeback moving.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "130px 1fr", gap: 20, alignItems: "center" }}>
          <div style={{ width: 126, height: 126, borderRadius: "50%", display: "grid", placeItems: "center", background: `conic-gradient(var(--accent) ${percent}%, rgba(255,255,255,0.08) 0)`, boxShadow: "var(--glow)" }}>
            <div style={{ width: 94, height: 94, borderRadius: "50%", background: "var(--bg-2)", display: "grid", placeItems: "center", border: "1px solid var(--border)" }}>
              <strong style={{ fontSize: 27 }}>{percent}%</strong>
            </div>
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {missions.map(({ label, icon: Icon, done, to }) => {
              const checked = done || (label === "Daily Check-In" && todayComplete);
              return (
                <Link key={label} to={to} style={{ textDecoration: "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 14px", borderRadius: 18, background: checked ? "rgba(52,211,153,0.12)" : "rgba(255,255,255,0.045)", border: checked ? "1px solid rgba(52,211,153,0.28)" : "1px solid var(--border)", color: "var(--text)" }}>
                    <Icon size={17} style={{ color: checked ? "var(--green)" : "var(--accent)" }} />
                    <span style={{ fontWeight: 800, fontSize: 14 }}>{label}</span>
                    <span style={{ marginLeft: "auto", color: checked ? "var(--green)" : "var(--text-dim)", fontSize: 12, fontWeight: 900 }}>{checked ? "Done" : "Open"}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
      <style>{`@media (max-width: 860px) { section [style*="grid-template-columns: minmax(0, .8fr)"] { grid-template-columns: 1fr !important; } section [style*="grid-template-columns: 130px"] { grid-template-columns: 1fr !important; } }`}</style>
    </section>
  );
}