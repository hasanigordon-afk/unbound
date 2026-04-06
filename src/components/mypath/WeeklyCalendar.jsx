import React, { useMemo } from "react";
import { categoryInfo } from "./RoutineSheet";
import { Check, Circle } from "lucide-react";

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const TIMES_ORDER = ["morning", "afternoon", "evening", "anytime"];

export default function WeeklyCalendar({ routines, logs, onToggle, weekOffset = 0 }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Build week dates starting Sunday
  const weekDates = useMemo(() => {
    const arr = [];
    const sun = new Date(today);
    sun.setDate(today.getDate() - today.getDay() + weekOffset * 7);
    for (let i = 0; i < 7; i++) {
      const d = new Date(sun);
      d.setDate(sun.getDate() + i);
      arr.push(d);
    }
    return arr;
  }, [weekOffset]);

  const logSet = useMemo(() => {
    const s = new Set();
    logs.forEach(l => { if (l.completed) s.add(`${l.routine_id}_${l.log_date}`); });
    return s;
  }, [logs]);

  const isToday = (d) => d.toDateString() === today.toDateString();
  const isFuture = (d) => d > today;
  const dateStr = (d) => d.toISOString().split("T")[0];

  // Group routines by time slot
  const byTime = useMemo(() => {
    const map = {};
    TIMES_ORDER.forEach(t => { map[t] = []; });
    routines.forEach(r => {
      const slot = r.time_of_day || "anytime";
      if (map[slot]) map[slot].push(r);
    });
    return map;
  }, [routines]);

  const activeSlots = TIMES_ORDER.filter(t => byTime[t].length > 0);

  const TIME_LABELS = { morning: "🌅 Morning", afternoon: "☀️ Afternoon", evening: "🌙 Evening", anytime: "🔄 Anytime" };

  if (routines.length === 0) return (
    <div style={{ textAlign: "center", padding: "32px 0", color: "rgba(255,255,255,0.25)", fontSize: 14 }}>
      No routines yet — add one to get started.
    </div>
  );

  return (
    <div style={{ overflowX: "auto" }}>
      {/* Day header */}
      <div style={{ display: "grid", gridTemplateColumns: "72px repeat(7, 1fr)", gap: 4, marginBottom: 6 }}>
        <div />
        {weekDates.map((d, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: ".04em" }}>
              {DAYS_SHORT[i]}
            </p>
            <div style={{ width: 28, height: 28, borderRadius: "50%", margin: "4px auto 0",
              background: isToday(d) ? "#2DD4BF" : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center" }}>
              <p style={{ fontSize: 13, fontWeight: isToday(d) ? 900 : 600,
                color: isToday(d) ? "#07090F" : isFuture(d) ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.7)" }}>
                {d.getDate()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Rows per time slot */}
      {activeSlots.map(slot => (
        <div key={slot} style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.25)", marginBottom: 6,
            textTransform: "uppercase", letterSpacing: ".07em" }}>{TIME_LABELS[slot]}</p>
          {byTime[slot].map(r => {
            const ci = categoryInfo(r.category);
            return (
              <div key={r.id} style={{ display: "grid", gridTemplateColumns: "72px repeat(7, 1fr)", gap: 4, marginBottom: 4 }}>
                {/* Routine label */}
                <div style={{ display: "flex", alignItems: "center", gap: 5, paddingRight: 4, overflow: "hidden" }}>
                  <span style={{ fontSize: 12, flexShrink: 0 }}>{ci.emoji}</span>
                  <p style={{ fontSize: 10, fontWeight: 700, color: ci.color, whiteSpace: "nowrap",
                    overflow: "hidden", textOverflow: "ellipsis", lineHeight: 1.2 }}>{r.title}</p>
                </div>

                {/* Day cells */}
                {weekDates.map((d, di) => {
                  const scheduledToday = (r.days_of_week || []).includes(d.getDay());
                  const key = `${r.id}_${dateStr(d)}`;
                  const done = logSet.has(key);
                  const future = isFuture(d);

                  if (!scheduledToday) return (
                    <div key={di} style={{ height: 32 }} />
                  );

                  return (
                    <button key={di}
                      onClick={() => !future && onToggle(r, dateStr(d), done)}
                      disabled={future}
                      style={{ height: 32, borderRadius: 8, border: "none", cursor: future ? "default" : "pointer",
                        background: done ? ci.color + "25" : "rgba(255,255,255,0.04)",
                        border: `1.5px solid ${done ? ci.color + "60" : "rgba(255,255,255,0.08)"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        opacity: future ? 0.3 : 1, transition: "all 0.15s ease" }}>
                      {done
                        ? <Check style={{ width: 12, height: 12, color: ci.color }} />
                        : <Circle style={{ width: 10, height: 10, color: "rgba(255,255,255,0.2)" }} />}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}