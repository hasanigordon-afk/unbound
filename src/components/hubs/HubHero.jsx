import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function HubHero({ pillar, title, subtitle, icon: Icon, accent }) {
  return (
    <>
      <Link to="/" style={{ textDecoration: "none" }}>
        <button style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "8px 14px", borderRadius: 999,
          background: "var(--surface)", border: "1px solid var(--border)",
          color: "var(--text-muted)", fontSize: 13, fontWeight: 600,
          cursor: "pointer", marginBottom: 16,
        }}>
          <ArrowLeft style={{ width: 14, height: 14 }} /> Home
        </button>
      </Link>

      <section style={{
        position: "relative",
        background: `linear-gradient(160deg, var(--bg-2) 0%, ${accent}15 100%)`,
        border: "1px solid var(--border-glow)",
        borderRadius: 24,
        padding: "26px 22px",
        marginBottom: 22,
        overflow: "hidden",
        boxShadow: `0 0 28px ${accent}22`,
      }}>
        <div aria-hidden style={{
          position: "absolute", top: -50, right: -50, width: 200, height: 200,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${accent}33 0%, transparent 70%)`,
          filter: "blur(28px)", pointerEvents: "none",
        }} />

        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: "var(--surface)",
            border: `1px solid ${accent}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: accent,
            boxShadow: `0 0 16px ${accent}44`,
          }}>
            <Icon style={{ width: 24, height: 24 }} strokeWidth={2.2} />
          </div>
          <div>
            <p style={{
              fontSize: 10, fontWeight: 700, letterSpacing: ".22em",
              color: accent, textTransform: "uppercase",
              fontFamily: "'Space Grotesk', 'DM Sans', sans-serif",
              marginBottom: 4,
            }}>{pillar}</p>
            <h1 style={{
              fontFamily: "'Lora', Georgia, serif",
              fontSize: 24, fontWeight: 600, color: "var(--text)",
              lineHeight: 1.15,
            }}>{title}</h1>
          </div>
        </div>

        <p style={{
          position: "relative",
          fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.55,
        }}>
          {subtitle}
        </p>
      </section>
    </>
  );
}