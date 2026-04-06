import React from "react";
import { Check, Circle } from "lucide-react";
import { categoryInfo } from "@/components/mypath/RoutineSheet";

const TIME_ORDER = { morning: 0, afternoon: 1, evening: 2, anytime: 3 };
const TIME_LABELS = {
  morning:   { label: "🌅 Morning",   color: "#FB923C" },
  afternoon: { label: "☀️ Afternoon", color: "#FBBF24" },
  evening:   { label: "🌙 Evening",   color: "#818CF8" },
  anytime:   { label: "🔄 Anytime",   color: "#6B7280" },
};

function GentleNudge({ pct }) {
  if (pct === null || pct >= 50) return null;
  const msgs = [
    "No pressure — even one task is a win today.",
    "Start small. One thing done is momentum.",
    "Every step forward counts, no matter the size.",
  ];
  const msg = msgs[new Date().getHours() % msgs.length];
  return (
    <div style={{ borderRadius: 12, padding: "10px 14px", marginBottom: 14,
      background: "rgba(45,212,191,0.05)", border: "1px solid rgba(45,212,191,0.15)" }}>
      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", fontStyle: "italic" }}>💬 {msg}</p>
    </div>
  );
}

export default function TaskChecklist({ routines, logSet, onToggle, today }) {
  const dow = new Date(today + "T12:00:00").getDay();
  const todayTasks = routines
    .filter(r => (r.days_of_week || []).includes(dow))
    .sort((a, b) => (TIME_ORDER[a.time_of_day] ?? 3) - (TIME_ORDER[b.time_of_day] ?? 3));

  if (todayTasks.length === 0) {
    return (
      <div style={{ borderRadius: 16, padding: "20px", textAlign: "center",
        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}>
          No routines scheduled today.<br />
          <span style={{ fontSize: 12 }}>Rest is part of the path too. 🌿</span>
        </p>
      </div>
    );
  }

  const done = todayTasks.filter(r => logSet.has(`${r.id}_${today}`)).length;
  const pct = Math.round((done / todayTasks.length) * 100);

  // Group by time
  const byTime = {};
  todayTasks.forEach(r => {
    const t = r.time_of_day || "anytime";
    if (!byTime[t]) byTime[t] = [];
    byTime[t].push(r);
  });

  return (
    <div>
      {/* Progress bar */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)" }}>
            Today's Tasks
          </p>
          <p style={{ fontSize: 13, fontWeight: 800, color: done === todayTasks.length ? "#10B981" : "#2DD4BF" }}>
            {done}/{todayTasks.length} done
          </p>
        </div>
        <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 6, height: 6, overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", borderRadius: 6, transition: "width 0.4s ease",
            background: done === todayTasks.length
              ? "linear-gradient(90deg,#10B981,#059669)"
              : "linear-gradient(90deg,#2DD4BF,#22C5B0)" }} />
        </div>
      </div>

      <GentleNudge pct={done === 0 ? 0 : pct} />

      {/* Tasks grouped by time */}
      {Object.entries(byTime).map(([slot, tasks]) => {
        const tl = TIME_LABELS[slot] || TIME_LABELS.anytime;
        return (
          <div key={slot} style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: tl.color,
              textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 8 }}>{tl.label}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {tasks.map(r => {
                const isDone = logSet.has(`${r.id}_${today}`);
                const ci = categoryInfo(r.category);
                return (
                  <button key={r.id} onClick={() => onToggle(r, today, isDone)}
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px",
                      borderRadius: 14, border: "none", cursor: "pointer", textAlign: "left",
                      background: isDone ? `${ci.color}12` : "rgba(255,255,255,0.04)",
                      border: `1.5px solid ${isDone ? ci.color + "40" : "rgba(255,255,255,0.07)"}`,
                      transition: "all 0.2s ease" }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                      background: isDone ? ci.color + "25" : "rgba(255,255,255,0.06)",
                      display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {isDone
                        ? <Check style={{ color: ci.color, width: 14, height: 14 }} />
                        : <Circle style={{ color: "rgba(255,255,255,0.2)", width: 13, height: 13 }} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 14, fontWeight: isDone ? 600 : 700,
                        color: isDone ? "rgba(255,255,255,0.4)" : "#fff",
                        textDecoration: isDone ? "line-through" : "none", lineHeight: 1.2 }}>
                        {r.title}
                      </p>
                      {r.notes && !isDone && (
                        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 3 }}>{r.notes}</p>
                      )}
                    </div>
                    <span style={{ fontSize: 16, flexShrink: 0 }}>{ci.emoji}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {done === todayTasks.length && todayTasks.length > 0 && (
        <div style={{ borderRadius: 14, padding: "14px 16px", textAlign: "center",
          background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", marginTop: 4 }}>
          <p style={{ fontSize: 14, fontWeight: 800, color: "#10B981" }}>🎉 All done today!</p>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
            That's real progress. Come back tomorrow.
          </p>
        </div>
      )}
    </div>
  );
}