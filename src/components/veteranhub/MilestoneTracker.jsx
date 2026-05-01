import React from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { MILESTONES, VH_COLORS as C } from "./vetHubData";

export default function MilestoneTracker({ completedKeys, onToggle, saving }) {
  const completed = completedKeys.length;
  const total = MILESTONES.length;
  const pct = Math.round((completed / total) * 100);

  return (
    <div style={{
      background: "linear-gradient(180deg,#fff 0%,#FBF7EE 100%)",
      border: `1px solid ${C.border}`, borderRadius: 18, padding: 16,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <p style={{ fontFamily: "'Lora', Georgia, serif",
          fontSize: 18, fontWeight: 700, color: C.text }}>Your progress</p>
        <span style={{ fontSize: 12, fontWeight: 800, color: C.gold }}>{completed}/{total}</span>
      </div>
      <p style={{ fontSize: 12, color: C.dim, marginBottom: 12 }}>
        Tap a milestone when you complete it. Small wins, real progress.
      </p>

      {/* Progress bar */}
      <div style={{ height: 6, borderRadius: 3, background: C.border, overflow: "hidden", marginBottom: 14 }}>
        <div style={{
          height: "100%", width: `${pct}%`,
          background: `linear-gradient(90deg, ${C.gold} 0%, ${C.olive} 100%)`,
          transition: "width .35s ease",
        }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {MILESTONES.map((m) => {
          const done = completedKeys.includes(m.key);
          return (
            <button key={m.key} onClick={() => !saving && onToggle(m.key, done)}
              style={{
                background: done ? "rgba(91,110,72,0.10)" : "#fff",
                border: `1px solid ${done ? "rgba(91,110,72,0.32)" : C.border}`,
                borderRadius: 12, padding: "10px 11px", cursor: saving ? "wait" : "pointer",
                display: "flex", alignItems: "center", gap: 9, textAlign: "left",
                fontFamily: "'DM Sans', sans-serif",
              }}>
              {done
                ? <CheckCircle2 style={{ width: 16, height: 16, color: C.olive, flexShrink: 0 }} />
                : <Circle style={{ width: 16, height: 16, color: C.dim, flexShrink: 0 }} />}
              <span style={{ fontSize: 12.5, fontWeight: 700,
                color: done ? C.olive : C.text, lineHeight: 1.3 }}>
                <span style={{ marginRight: 5 }}>{m.emoji}</span>{m.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}