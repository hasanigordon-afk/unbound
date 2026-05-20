import React from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { MILESTONES, VH_COLORS as C } from "./vetHubData";

export default function MilestoneTracker({ completedKeys, onToggle, saving }) {
  const completed = completedKeys.length;
  const total = MILESTONES.length;
  const pct = Math.round((completed / total) * 100);

  return (
    <div style={{
      background: "linear-gradient(145deg, rgba(255,255,255,.10), rgba(13,18,32,.74))",
      border: "1px solid rgba(190,225,255,.15)", borderRadius: 26, padding: 20,
      boxShadow: "0 20px 54px rgba(0,0,0,.30), inset 0 1px 0 rgba(255,255,255,.10)", backdropFilter: "blur(24px) saturate(160%)",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <p style={{ fontFamily: "'Lora', Georgia, serif",
          fontSize: 22, fontWeight: 700, color: "var(--text)" }}>Your progress</p>
        <span style={{ fontSize: 12, fontWeight: 900, color: "var(--gold)" }}>{completed}/{total}</span>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginBottom: 14 }}>
        Tap a milestone when you complete it. Small wins, real progress.
      </p>

      {/* Progress bar */}
      <div style={{ height: 7, borderRadius: 999, background: "rgba(255,255,255,.10)", overflow: "hidden", marginBottom: 16 }}>
        <div style={{
          height: "100%", width: `${pct}%`,
          background: "linear-gradient(90deg, var(--gold) 0%, #34D399 100%)", boxShadow: "0 0 18px rgba(52,211,153,.26)",
          transition: "width .35s ease",
        }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {MILESTONES.map((m) => {
          const done = completedKeys.includes(m.key);
          return (
            <button key={m.key} onClick={() => !saving && onToggle(m.key, done)}
              style={{
                background: done ? "rgba(52,211,153,0.10)" : "rgba(255,255,255,.055)",
                border: done ? "1px solid rgba(52,211,153,.30)" : "1px solid rgba(255,255,255,.10)",
                borderRadius: 12, padding: "10px 11px", cursor: saving ? "wait" : "pointer",
                display: "flex", alignItems: "center", gap: 9, textAlign: "left",
                fontFamily: "'DM Sans', sans-serif",
              }}>
              {done
                ? <CheckCircle2 style={{ width: 16, height: 16, color: "#34D399", flexShrink: 0 }} />
                : <Circle style={{ width: 16, height: 16, color: "var(--text-dim)", flexShrink: 0 }} />}
              <span style={{ fontSize: 12.5, fontWeight: 700,
                color: done ? "#34D399" : "var(--text)", lineHeight: 1.3 }}>
                <span style={{ marginRight: 5 }}>{m.emoji}</span>{m.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}