import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BriefcaseBusiness, CalendarCheck, CheckCircle2, Dumbbell, Users } from "lucide-react";

const missions = [
  { label: "Daily Check-In", detail: "Log how you’re doing today", action: "Check in", icon: CalendarCheck, done: true, to: "/DailyCheckIn" },
  { label: "Meeting", detail: "Find support and stay connected", action: "Find meeting", icon: Users, done: false, to: "/MeetingDirectory" },
  { label: "Job Applications", detail: "Take one step toward stability", action: "Rebuild", icon: BriefcaseBusiness, done: false, to: "/RebuildHub" },
  { label: "Exercise", detail: "Move your body and reset", action: "Open plan", icon: Dumbbell, done: false, to: "/WellnessPlan" },
];

export default function DailyFocusWidget({ firstName = "there", todayComplete = false }) {
  const completed = missions.filter((item) => item.done || (item.label === "Daily Check-In" && todayComplete)).length;
  const percent = Math.round((completed / missions.length) * 100);

  return (
    <section className="card-glow" style={{ padding: "clamp(24px, 4vw, 42px)", marginBottom: 74 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 18, marginBottom: 24, flexWrap: "wrap" }}>
        <div>
          <p className="section-label" style={{ marginBottom: 12 }}>Daily Focus</p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", lineHeight: 1.04, margin: 0 }}>Good Morning {firstName}</h2>
          <p style={{ color: "var(--text-muted)", marginTop: 10, lineHeight: 1.6, maxWidth: 620 }}>Choose one card at a time. Small actions today keep your comeback moving.</p>
        </div>
        <div style={{ minWidth: 150, padding: "14px 16px", borderRadius: 22, background: "rgba(255,255,255,0.06)", border: "1px solid var(--border)", textAlign: "center" }}>
          <strong style={{ display: "block", fontSize: 30, color: "var(--accent)" }}>{percent}%</strong>
          <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--text-muted)" }}>Complete</span>
        </div>
      </div>

      <div style={{ height: 8, borderRadius: 999, background: "rgba(255,255,255,0.08)", overflow: "hidden", marginBottom: 18 }}>
        <div style={{ width: `${percent}%`, height: "100%", borderRadius: 999, background: "linear-gradient(90deg, var(--accent), var(--green))", boxShadow: "var(--glow)" }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 14 }}>
        {missions.map(({ label, detail, action, icon: Icon, done, to }) => {
          const checked = done || (label === "Daily Check-In" && todayComplete);
          return (
            <Link key={label} to={to} style={{ textDecoration: "none", color: "inherit" }}>
              <div style={{ minHeight: 178, height: "100%", display: "flex", flexDirection: "column", gap: 12, padding: 18, borderRadius: 24, background: checked ? "rgba(52,211,153,0.13)" : "rgba(255,255,255,0.055)", border: checked ? "1px solid rgba(52,211,153,0.32)" : "1px solid var(--border)", boxShadow: checked ? "0 0 24px rgba(52,211,153,0.12)" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 16, display: "grid", placeItems: "center", background: checked ? "rgba(52,211,153,0.16)" : "var(--navy-dim)", border: checked ? "1px solid rgba(52,211,153,0.30)" : "1px solid var(--navy-border)" }}>
                    <Icon size={20} style={{ color: checked ? "var(--green)" : "var(--accent)" }} />
                  </div>
                  {checked && <CheckCircle2 size={18} style={{ color: "var(--green)" }} />}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, lineHeight: 1.15 }}>{label}</h3>
                  <p style={{ margin: "8px 0 0", color: "var(--text-muted)", fontSize: 13, lineHeight: 1.45 }}>{detail}</p>
                </div>
                <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", color: checked ? "var(--green)" : "var(--accent)", fontSize: 12, fontWeight: 900, letterSpacing: ".04em", textTransform: "uppercase" }}>
                  <span>{checked ? "Completed" : action}</span>
                  <ArrowRight size={15} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      <style>{`@media (max-width: 980px) { section [style*="repeat(4"] { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; } } @media (max-width: 560px) { section [style*="repeat(4"], section [style*="repeat(2"] { grid-template-columns: 1fr !important; } }`}</style>
    </section>
  );
}