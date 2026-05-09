import React from "react";
import { Link } from "react-router-dom";
import { Film, ArrowRight, Sparkles } from "lucide-react";

export default function ComebackPortalCard() {
  return (
    <Link to="/ComebackPortal" style={{ textDecoration: "none", display: "block" }}>
      <div className="fade-up" style={{
        position: "relative",
        background: "linear-gradient(135deg, rgba(240,183,83,0.14) 0%, rgba(139,92,246,0.14) 100%)",
        border: "1px solid var(--border-glow)",
        borderRadius: 22,
        padding: "20px 20px",
        backdropFilter: "blur(18px) saturate(160%)",
        WebkitBackdropFilter: "blur(18px) saturate(160%)",
        boxShadow: "var(--glow-gold), var(--shadow-card)",
        overflow: "hidden",
      }}>
        {/* Ambient glow */}
        <div aria-hidden style={{
          position: "absolute", top: -50, right: -50, width: 180, height: 180,
          borderRadius: "50%",
          background: "radial-gradient(circle, var(--ambient-4) 0%, transparent 70%)",
          filter: "blur(20px)", pointerEvents: "none",
        }} />

        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 54, height: 54, borderRadius: 16, flexShrink: 0,
            background: "linear-gradient(135deg, var(--gold), #E89A2A)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#1A1F2C",
            boxShadow: "var(--glow-gold)",
          }}>
            <Film style={{ width: 24, height: 24 }} strokeWidth={2.2} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              fontSize: 9.5, fontWeight: 700, color: "var(--gold)",
              letterSpacing: ".18em", textTransform: "uppercase",
              fontFamily: "'Space Grotesk', 'DM Sans', sans-serif",
              marginBottom: 4,
            }}>
              <Sparkles style={{ width: 10, height: 10 }} /> New
            </div>
            <p style={{
              fontFamily: "'Lora', Georgia, serif",
              fontSize: 17, fontWeight: 600, color: "var(--text)",
              lineHeight: 1.25, marginBottom: 3,
            }}>
              Comeback Media Portal
            </p>
            <p style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5 }}>
              Real comeback stories. Recovery, reentry, redemption.
            </p>
          </div>

          <ArrowRight style={{ width: 18, height: 18, color: "var(--gold)", flexShrink: 0 }} />
        </div>
      </div>
    </Link>
  );
}