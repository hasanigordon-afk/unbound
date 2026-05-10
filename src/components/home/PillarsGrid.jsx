import React from "react";
import { Sun, Hammer, Film, Sprout, Lock } from "lucide-react";

const PILLARS = [
  {
    key: "daily",
    label: "Daily",
    icon: Sun,
    accent: "var(--accent)",
    desc: "Structure, accountability, and focus — one day at a time.",
  },
  {
    key: "rebuild",
    label: "Rebuild",
    icon: Hammer,
    accent: "var(--gold)",
    desc: "Real-world resources to rebuild stability and independence.",
  },
  {
    key: "stories",
    label: "Stories",
    icon: Film,
    accent: "var(--purple)",
    desc: "Real comeback stories that remind you you're not alone.",
  },
  {
    key: "growth",
    label: "Growth",
    icon: Sprout,
    accent: "var(--green)",
    desc: "Wellness, education, and tools for becoming stronger.",
  },
];

export default function PillarsGrid() {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12,
    }}>
      {PILLARS.map((p, i) => {
        const Icon = p.icon;
        return (
          <div
            key={p.key}
            className="fade-up"
            style={{
              position: "relative",
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 20,
              padding: "16px 14px",
              backdropFilter: "blur(18px)",
              WebkitBackdropFilter: "blur(18px)",
              animationDelay: `${i * 0.06}s`,
              opacity: 0.86,
              cursor: "default",
              overflow: "hidden",
            }}
          >
            {/* Coming Soon badge */}
            <div style={{
              position: "absolute", top: 10, right: 10,
              display: "inline-flex", alignItems: "center", gap: 3,
              padding: "2px 7px", borderRadius: 999,
              background: "var(--surface)",
              border: "1px solid var(--border)",
              fontSize: 8.5, fontWeight: 700, letterSpacing: ".1em",
              color: "var(--text-dim)", textTransform: "uppercase",
            }}>
              <Lock style={{ width: 8, height: 8 }} /> Soon
            </div>

            {/* Glow accent */}
            <div aria-hidden style={{
              position: "absolute", top: -30, left: -30, width: 100, height: 100,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${p.accent} 0%, transparent 70%)`,
              opacity: 0.18, filter: "blur(20px)", pointerEvents: "none",
            }} />

            <div style={{
              position: "relative",
              width: 38, height: 38, borderRadius: 12,
              background: "var(--surface)",
              border: `1px solid ${p.accent}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: p.accent, marginBottom: 10,
              boxShadow: `0 0 14px ${p.accent}33`,
            }}>
              <Icon style={{ width: 18, height: 18 }} strokeWidth={2.2} />
            </div>

            <p style={{
              position: "relative",
              fontFamily: "'Lora', Georgia, serif",
              fontSize: 16, fontWeight: 600, color: "var(--text)",
              marginBottom: 4,
            }}>
              {p.label}
            </p>
            <p style={{
              position: "relative",
              fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.45,
            }}>
              {p.desc}
            </p>
          </div>
        );
      })}
    </div>
  );
}