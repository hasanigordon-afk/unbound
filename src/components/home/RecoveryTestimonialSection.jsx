import React from "react";
import { Quote, Star } from "lucide-react";

export default function RecoveryTestimonialSection() {
  return (
    <section className="card" style={{ padding: 20, marginTop: 18, background: "linear-gradient(145deg, rgba(240,183,83,0.11), rgba(91,141,239,0.08))" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <Quote style={{ width: 18, height: 18, color: "var(--gold)" }} />
        <p className="section-label" style={{ color: "var(--gold)", margin: 0, flex: 1 }}>Real recovery</p>
      </div>
      <p style={{ fontFamily: "'Lora', Georgia, serif", fontSize: 19, lineHeight: 1.45, color: "var(--text)", marginBottom: 14 }}>
        “What changed everything was having recovery, support, and real-life rebuilding tools in one place — not scattered everywhere.”
      </p>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 800, color: "var(--text)" }}>Community member</p>
          <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Recovery + reentry journey</p>
        </div>
        <div style={{ display: "flex", gap: 2, color: "var(--gold)" }}>
          {[0,1,2,3,4].map(i => <Star key={i} style={{ width: 14, height: 14, fill: "currentColor" }} />)}
        </div>
      </div>
    </section>
  );
}