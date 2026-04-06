import React from "react";

const ACTIVITIES = {
  gym:     { emoji: "🏋️", color: "#F59E0B" },
  walk:    { emoji: "🚶", color: "#34D399" },
  run:     { emoji: "🏃", color: "#F87171" },
  bike:    { emoji: "🚴", color: "#60A5FA" },
  swim:    { emoji: "🏊", color: "#22D3EE" },
  yoga:    { emoji: "🧘", color: "#A78BFA" },
  stretch: { emoji: "🤸", color: "#FB923C" },
  sports:  { emoji: "⚽", color: "#4ADE80" },
  other:   { emoji: "⚡", color: "#94A3B8" },
};

const INTENSITY_DOTS = { light: 1, moderate: 2, intense: 3 };
const MOODS = ["😫","😕","😐","🙂","😄"];

// 30-day heatmap
function Heatmap({ logs }) {
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const ds = d.toISOString().split("T")[0];
    const dayLogs = logs.filter(l => l.log_date === ds);
    const count = dayLogs.length;
    days.push({ ds, count, dayLogs });
  }

  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", marginBottom: 10,
        textTransform: "uppercase", letterSpacing: ".07em" }}>30-Day Activity</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 4 }}>
        {days.map(({ ds, count }) => (
          <div key={ds} title={ds}
            style={{ aspectRatio: "1", borderRadius: 5,
              background: count === 0 ? "rgba(255,255,255,0.06)"
                : count === 1 ? "rgba(245,158,11,0.35)"
                : "rgba(245,158,11,0.7)",
              border: ds === new Date().toISOString().split("T")[0]
                ? "1.5px solid rgba(245,158,11,0.8)" : "none" }} />
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
        <div style={{ width: 10, height: 10, borderRadius: 3, background: "rgba(255,255,255,0.06)" }} />
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginRight: 8 }}>None</span>
        <div style={{ width: 10, height: 10, borderRadius: 3, background: "rgba(245,158,11,0.4)" }} />
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginRight: 8 }}>1 session</span>
        <div style={{ width: 10, height: 10, borderRadius: 3, background: "rgba(245,158,11,0.7)" }} />
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>2+ sessions</span>
      </div>
    </div>
  );
}

export default function ActivityFeed({ logs }) {
  const recent = [...logs]
    .sort((a, b) => new Date(b.log_date) - new Date(a.log_date))
    .slice(0, 20);

  return (
    <div>
      <Heatmap logs={logs} />

      {recent.length === 0 ? (
        <div style={{ textAlign: "center", padding: "24px 0",
          background: "rgba(255,255,255,0.03)", borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.07)" }}>
          <p style={{ fontSize: 24, marginBottom: 8 }}>🌱</p>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>No activity yet — log your first session!</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {recent.map(log => {
            const a = ACTIVITIES[log.activity_type] || ACTIVITIES.other;
            const dots = INTENSITY_DOTS[log.intensity] || 2;
            return (
              <div key={log.id} style={{ display: "flex", alignItems: "center", gap: 12,
                padding: "13px 16px", borderRadius: 16,
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div style={{ width: 42, height: 42, borderRadius: 14, flexShrink: 0,
                  background: a.color + "18", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22 }}>
                  {a.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", textTransform: "capitalize" }}>
                      {log.activity_type}
                    </p>
                    <div style={{ display: "flex", gap: 2 }}>
                      {[1,2,3].map(d => (
                        <div key={d} style={{ width: 5, height: 5, borderRadius: "50%",
                          background: d <= dots ? a.color : "rgba(255,255,255,0.1)" }} />
                      ))}
                    </div>
                  </div>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                    {log.duration_mins ? `${log.duration_mins} min` : ""}
                    {log.steps ? ` · ${log.steps.toLocaleString()} steps` : ""}
                    {log.notes ? ` · ${log.notes}` : ""}
                  </p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  {log.mood_after && <p style={{ fontSize: 16 }}>{MOODS[log.mood_after - 1]}</p>}
                  <p style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 2 }}>
                    {new Date(log.log_date + "T12:00:00").toLocaleDateString("en", { month: "short", day: "numeric" })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}