import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function HubFeatureCard({ to, icon: Icon, label, desc, accent = "var(--accent)" }) {
  return (
    <Link to={to} style={{ textDecoration: "none", display: "block" }}>
      <div style={{
        position: "relative",
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 18,
        padding: "14px 14px",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        display: "flex", alignItems: "center", gap: 12,
        transition: "all .18s",
        overflow: "hidden",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = accent;
        e.currentTarget.style.boxShadow = `0 0 18px ${accent}33`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.boxShadow = "none";
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12, flexShrink: 0,
          background: "var(--surface)",
          border: `1px solid ${accent}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: accent,
          boxShadow: `0 0 12px ${accent}22`,
        }}>
          <Icon style={{ width: 18, height: 18 }} strokeWidth={2.2} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontFamily: "'Lora', Georgia, serif",
            fontSize: 14.5, fontWeight: 600, color: "var(--text)",
            lineHeight: 1.25, marginBottom: 2,
          }}>{label}</p>
          {desc && (
            <p style={{ fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.4 }}>
              {desc}
            </p>
          )}
        </div>
        <ArrowRight style={{ width: 14, height: 14, color: "var(--text-dim)", flexShrink: 0 }} />
      </div>
    </Link>
  );
}