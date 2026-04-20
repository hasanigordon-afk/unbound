import React, { useMemo } from "react";
import { Award, Lock } from "lucide-react";

const BADGES = [
  { key: "consistency",   label: "Consistency Badge",   desc: "3 days in a row",      threshold: 3 },
  { key: "seven_day",     label: "7-Day Discipline",    desc: "1 week of routine",    threshold: 7 },
  { key: "locked_in",     label: "Mind-Body Locked In", desc: "30 days of showing up", threshold: 30 },
];

export default function ProgressTab({ logs, streak }) {
  const stats = useMemo(() => {
    const last7 = logs.slice(0, 7);
    const daysActive = last7.filter(l =>
      l.moved_body || l.ate_clean || l.hydrated || l.fasting_goal_met || l.mental_checkin
    ).length;
    const mealsLogged = logs.reduce((sum, l) => sum + (l.meals_logged?.length || 0), 0);
    const workoutsCompleted = logs.reduce((sum, l) => sum + (l.workouts_completed?.length || 0), 0);
    return { daysActive, mealsLogged, workoutsCompleted };
  }, [logs]);

  return (
    <div style={{ padding: "20px 16px" }}>

      {/* Streak hero */}
      <div style={{
        background: "linear-gradient(135deg, rgba(184,130,58,.12), rgba(184,130,58,.03))",
        border: "1px solid rgba(184,130,58,.3)",
        borderRadius: 16, padding: "28px 20px", marginBottom: 16, textAlign: "center",
      }}>
        <p style={{ fontSize: 56, fontWeight: 800, color: "#B8823A", lineHeight: 1 }}>{streak}</p>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#9B8E83", textTransform: "uppercase", letterSpacing: ".1em", marginTop: 6 }}>
          Day Streak
        </p>
        <p style={{ fontSize: 13, color: "#4A3F35", lineHeight: 1.6, marginTop: 10, fontStyle: "italic" }}>
          Control your body, control your life.
        </p>
      </div>

      {/* This week */}
      <p style={{ fontSize: 10, fontWeight: 700, color: "#9B8E83", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 12 }}>
        This week
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 20 }}>
        {[
          { label: "Days Active",  value: stats.daysActive,       suffix: "/7" },
          { label: "Workouts",      value: stats.workoutsCompleted, suffix: "" },
          { label: "Meals Logged",  value: stats.mealsLogged,      suffix: "" },
        ].map(s => (
          <div key={s.label} style={{
            background: "#FDFAF6", border: "1px solid #E8E2D9",
            borderRadius: 12, padding: "14px 10px", textAlign: "center",
          }}>
            <p style={{ fontSize: 24, fontWeight: 800, color: "#1C1410", lineHeight: 1 }}>
              {s.value}<span style={{ fontSize: 14, color: "#9B8E83", fontWeight: 600 }}>{s.suffix}</span>
            </p>
            <p style={{ fontSize: 10, color: "#9B8E83", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", marginTop: 6 }}>
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Badges */}
      <p style={{ fontSize: 10, fontWeight: 700, color: "#9B8E83", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 12 }}>
        Badges
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {BADGES.map(b => {
          const earned = streak >= b.threshold;
          return (
            <div key={b.key} style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "14px 16px", borderRadius: 14,
              background: "#FDFAF6",
              border: earned ? "1px solid rgba(184,130,58,.35)" : "1px solid #E8E2D9",
              opacity: earned ? 1 : 0.65,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: earned ? "rgba(184,130,58,.12)" : "#F7F3EE",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {earned
                  ? <Award style={{ width: 22, height: 22, color: "#B8823A" }} strokeWidth={1.8} />
                  : <Lock style={{ width: 18, height: 18, color: "#9B8E83" }} strokeWidth={1.8} />}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#1C1410", marginBottom: 2 }}>{b.label}</p>
                <p style={{ fontSize: 11, color: "#9B8E83" }}>{b.desc}</p>
              </div>
              {earned && (
                <span style={{
                  fontSize: 10, fontWeight: 700, color: "#B8823A",
                  background: "rgba(184,130,58,.1)", padding: "3px 9px", borderRadius: 20,
                  letterSpacing: ".04em", textTransform: "uppercase",
                }}>Earned</span>
              )}
            </div>
          );
        })}
      </div>

      <p style={{ fontSize: 11, color: "#9B8E83", textAlign: "center", marginTop: 20, fontStyle: "italic", lineHeight: 1.6 }}>
        A strong body supports a clear mind.
      </p>
    </div>
  );
}