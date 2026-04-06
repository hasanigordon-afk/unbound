import React, { useMemo } from "react";
import { categoryInfo } from "./RoutineSheet";

export default function ProgressTracker({ routines, logs }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Build last 30 days
  const days = useMemo(() => {
    const arr = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      arr.push(d);
    }
    return arr;
  }, []);

  const logSet = useMemo(() => {
    const s = new Set();
    logs.forEach(l => { if (l.completed) s.add(`${l.routine_id}_${l.log_date}`); });
    return s;
  }, [logs]);

  const dateStr = (d) => d.toISOString().split("T")[0];

  // Per-day completion %
  const dayStats = useMemo(() => days.map(d => {
    const dow = d.getDay();
    const scheduled = routines.filter(r => (r.days_of_week || []).includes(dow));
    if (!scheduled.length) return { d, pct: null, done: 0, total: 0 };
    const done = scheduled.filter(r => logSet.has(`${r.id}_${dateStr(d)}`)).length;
    return { d, pct: Math.round((done / scheduled.length) * 100), done, total: scheduled.length };
  }), [days, routines, logSet]);

  // Per-category stats (last 30 days)
  const categoryStats = useMemo(() => {
    const map = {};
    days.forEach(d => {
      const dow = d.getDay();
      const ds = dateStr(d);
      routines.forEach(r => {
        if (!(r.days_of_week || []).includes(dow)) return;
        if (!map[r.category]) map[r.category] = { scheduled: 0, done: 0 };
        map[r.category].scheduled++;
        if (logSet.has(`${r.id}_${ds}`)) map[r.category].done++;
      });
    });
    return Object.entries(map).map(([cat, v]) => ({
      cat, ...v, pct: Math.round((v.done / v.scheduled) * 100), ci: categoryInfo(cat)
    })).sort((a, b) => b.pct - a.pct);
  }, [days, routines, logSet]);

  // Overall streak
  const streak = useMemo(() => {
    let s = 0;
    const sorted = [...dayStats].reverse();
    for (const { d, pct, total } of sorted) {
      if (d > today) continue;
      if (total === 0) continue;
      if (pct !== null && pct >= 50) s++;
      else break;
    }
    return s;
  }, [dayStats]);

  const overallPct = useMemo(() => {
    const valid = dayStats.filter(s => s.total > 0 && s.d <= today);
    if (!valid.length) return 0;
    return Math.round(valid.reduce((acc, s) => acc + s.pct, 0) / valid.length);
  }, [dayStats]);

  function pctColor(p) {
    if (p === null) return "rgba(255,255,255,0.08)";
    if (p >= 80) return "#10B981";
    if (p >= 50) return "#F59E0B";
    if (p > 0)   return "#EF4444";
    return "rgba(255,255,255,0.08)";
  }

  return (
    <div>
      {/* Summary row */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[
          { label: "30-Day Avg",  value: `${overallPct}%`,  color: "#2DD4BF" },
          { label: "Day Streak",  value: `${streak}d`,      color: "#C9A96E" },
          { label: "Routines",    value: routines.length,   color: "#6366F1" },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, textAlign: "center", padding: "14px 8px", borderRadius: 14,
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <p style={{ fontSize: 22, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</p>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 4, fontWeight: 600,
              textTransform: "uppercase", letterSpacing: ".06em" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* 30-day heatmap */}
      <p style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.3)", textTransform: "uppercase",
        letterSpacing: "1px", marginBottom: 10 }}>30-Day Heatmap</p>
      <div style={{ display: "flex", gap: 3, flexWrap: "wrap", marginBottom: 20 }}>
        {dayStats.map(({ d, pct, total }, i) => {
          const isToday = d.toDateString() === new Date().toDateString();
          return (
            <div key={i} title={`${dateStr(d)}: ${total === 0 ? "Rest day" : `${pct}% (${dayStats[i].done}/${total})`}`}
              style={{ width: 28, height: 28, borderRadius: 6,
                background: pctColor(total === 0 ? null : pct),
                border: isToday ? "2px solid #2DD4BF" : "1.5px solid transparent",
                cursor: "default", position: "relative" }}>
              {isToday && (
                <div style={{ position: "absolute", bottom: -6, left: "50%", transform: "translateX(-50%)",
                  fontSize: 7, color: "#2DD4BF", fontWeight: 800 }}>•</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          { color: "#10B981", label: "≥80%" },
          { color: "#F59E0B", label: "50–79%" },
          { color: "#EF4444", label: "1–49%" },
          { color: "rgba(255,255,255,0.08)", label: "0% / rest" },
        ].map(l => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: l.color }} />
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 600 }}>{l.label}</span>
          </div>
        ))}
      </div>

      {/* Category breakdown */}
      {categoryStats.length > 0 && (
        <>
          <p style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.3)", textTransform: "uppercase",
            letterSpacing: "1px", marginBottom: 10 }}>By Category</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {categoryStats.map(({ cat, pct, done, scheduled, ci }) => (
              <div key={cat} style={{ borderRadius: 14, padding: "12px 16px",
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 16 }}>{ci.emoji}</span>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{ci.label}</p>
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 800, color: ci.color }}>{pct}%</p>
                </div>
                <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: 4, height: 6, overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: ci.color, borderRadius: 4, transition: "width 0.4s ease" }} />
                </div>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 5 }}>{done} of {scheduled} sessions completed</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}