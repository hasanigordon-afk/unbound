import React from "react";

const STORIES = [
  { emoji: "🎨", name: "Marcus R.", win: "Sold first custom portrait commission" },
  { emoji: "✂️", name: "Andre B.", win: "Booked first mobile haircut client" },
  { emoji: "👕", name: "Tiana M.", win: "Landed first event shirt order" },
  { emoji: "🧹", name: "Eric D.", win: "Started cleaning business — first 3 customers" },
  { emoji: "📸", name: "Nia S.", win: "Turned photography into paid sessions" },
  { emoji: "📝", name: "Jasmine L.", win: "Turned artwork into a paid commission" },
];

export default function SuccessStoriesStrip() {
  return (
    <div style={{ marginBottom: 18 }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: ".09em", marginBottom: 10 }}>
        🏆 Recent Wins
      </p>
      <div style={{ display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 4 }}>
        {STORIES.map((s, i) => (
          <div key={i} style={{
            flexShrink: 0, minWidth: 160, padding: "12px 14px",
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16,
          }}>
            <p style={{ fontSize: 22, marginBottom: 6 }}>{s.emoji}</p>
            <p style={{ fontSize: 12, fontWeight: 800, color: "#fff", marginBottom: 4 }}>{s.name}</p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", lineHeight: 1.4 }}>{s.win}</p>
          </div>
        ))}
      </div>
    </div>
  );
}