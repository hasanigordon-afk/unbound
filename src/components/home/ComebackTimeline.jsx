import React from "react";

const phases = [
  ["Day 1–14", "Stabilize", "Safety, clarity, support, and the first daily rhythm."],
  ["Day 15–30", "Build Routine", "Create structure that lowers chaos and raises confidence."],
  ["Day 31–60", "Momentum", "Stack wins, repair trust, and move toward real-world goals."],
  ["Day 61–90", "Growth", "Turn consistency into identity and long-term direction."],
];

export default function ComebackTimeline() {
  return (
    <section className="card" style={{ padding: "clamp(30px, 5vw, 50px)", marginBottom: 74 }}>
      <p className="section-label">90 Day Comeback Path</p>
      <h2 style={{ fontSize: "clamp(30px, 4vw, 48px)", margin: 0 }}>A clear path from survival to momentum.</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginTop: 24 }}>
        {phases.map(([days, title, text], index) => (
          <div key={title} style={{ position: "relative", padding: 20, borderRadius: 24, background: "rgba(255,255,255,0.045)", border: "1px solid var(--border)" }}>
            <div style={{ color: "var(--gold)", fontSize: 12, fontWeight: 900, letterSpacing: ".12em", textTransform: "uppercase" }}>{days}</div>
            <h3 style={{ fontSize: 24, margin: "12px 0 8px" }}>{title}</h3>
            <p style={{ color: "var(--text-muted)", lineHeight: 1.6, fontSize: 13.5 }}>{text}</p>
            <div style={{ position: "absolute", top: 18, right: 18, color: "rgba(255,255,255,0.12)", fontSize: 42, fontWeight: 900 }}>0{index + 1}</div>
          </div>
        ))}
      </div>
      <style>{`@media (max-width: 900px) { section [style*="repeat(4, 1fr)"] { grid-template-columns: 1fr !important; } }`}</style>
    </section>
  );
}