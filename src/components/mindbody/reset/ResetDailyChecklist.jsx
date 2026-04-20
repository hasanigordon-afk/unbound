import React from "react";
import { Check, Activity, Apple, Droplet, Timer, Brain } from "lucide-react";

const BASE_TASKS = [
  { key: "moved_body",     label: "Movement completed",     icon: Activity, color: "#7A9E7E" },
  { key: "ate_clean",      label: "Clean food logged",      icon: Apple,    color: "#5F9E8A" },
  { key: "hydrated",       label: "Hydration goal met",     icon: Droplet,  color: "#7B8FA8" },
  { key: "fasting_goal_met", label: "Fasting goal",         icon: Timer,    color: "#B8823A", fastingOnly: true },
  { key: "mental_checkin", label: "Mood check-in",          icon: Brain,    color: "#9B8AB8" },
];

export default function ResetDailyChecklist({ log, fastingEnabled, onToggle }) {
  const tasks = BASE_TASKS.filter(t => !t.fastingOnly || fastingEnabled);

  return (
    <div style={{ background: "#FDFAF6", border: "1px solid #E8E2D9", borderRadius: 16, overflow: "hidden" }}>
      {tasks.map((t, i) => {
        const done = !!log?.[t.key];
        const Icon = t.icon;
        return (
          <button
            key={t.key}
            onClick={() => onToggle(t.key, !done)}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 14,
              padding: "13px 16px", background: "none", border: "none",
              borderBottom: i < tasks.length - 1 ? "1px solid #E8E2D9" : "none",
              cursor: "pointer", textAlign: "left",
            }}
          >
            <div style={{
              width: 30, height: 30, borderRadius: 8, flexShrink: 0,
              background: done ? t.color : `${t.color}15`,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.2s ease",
            }}>
              {done
                ? <Check style={{ width: 15, height: 15, color: "#fff" }} strokeWidth={2.5} />
                : <Icon style={{ width: 14, height: 14, color: t.color }} strokeWidth={1.8} />}
            </div>
            <p style={{
              flex: 1, fontSize: 13, fontWeight: 600,
              color: done ? "#9B8E83" : "#1C1410",
              textDecoration: done ? "line-through" : "none",
            }}>
              {t.label}
            </p>
          </button>
        );
      })}
    </div>
  );
}