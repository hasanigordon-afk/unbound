import React from "react";
import { Link } from "react-router-dom";
import { Heart, ArrowRight, Quote } from "lucide-react";

const STORIES = [
  { name: "Marcus", days: 47, quote: "I stopped running. The freedom on this side is worth every hard day." },
  { name: "Sara",   days: 92, quote: "My kids see me show up now. That's what saved me." },
  { name: "James",  days: 31, quote: "Structure isn't a cage. It's the floor I rebuild on." },
];

export default function DashCommunityMomentum() {
  return (
    <div className="fade-up" style={{
      background: "var(--card)",
      border: "1px solid var(--border)",
      borderRadius: 24,
      padding: "20px",
      backdropFilter: "blur(18px) saturate(160%)",
      WebkitBackdropFilter: "blur(18px) saturate(160%)",
      boxShadow: "var(--shadow-card)",
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 14,
      }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <Heart style={{ width: 13, height: 13, color: "var(--gold)" }} fill="var(--gold)" />
          <span style={{
            fontSize: 10.5, fontWeight: 700, color: "var(--gold)",
            letterSpacing: ".18em", textTransform: "uppercase",
            fontFamily: "'Space Grotesk', 'DM Sans', sans-serif",
          }}>
            Community Momentum
          </span>
        </div>
        <Link to="/AhHaCommunity" style={{
          fontSize: 12, color: "var(--text-muted)", textDecoration: "none",
          display: "inline-flex", alignItems: "center", gap: 4, fontWeight: 600,
        }}>
          See all <ArrowRight style={{ width: 12, height: 12 }} />
        </Link>
      </div>

      <div style={{
        display: "flex", gap: 12, overflowX: "auto", paddingBottom: 4,
        scrollSnapType: "x mandatory",
      }}>
        {STORIES.map((s, i) => (
          <div key={i} style={{
            flex: "0 0 240px", scrollSnapAlign: "start",
            background: "var(--surface)",
            border: "1px solid var(--border-glow)",
            borderRadius: 18,
            padding: "16px 16px",
            backdropFilter: "blur(12px)",
            position: "relative", overflow: "hidden",
          }}>
            <Quote style={{
              position: "absolute", top: 10, right: 10,
              width: 22, height: 22, color: "var(--accent)", opacity: 0.25,
            }} />
            <p style={{
              fontFamily: "'Lora', Georgia, serif",
              fontSize: 14, color: "var(--text)", fontStyle: "italic",
              lineHeight: 1.55, marginBottom: 12,
              display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden",
            }}>
              "{s.quote}"
            </p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>{s.name}</span>
              <span style={{
                fontSize: 10, fontWeight: 700, color: "var(--green)",
                padding: "3px 9px", borderRadius: 999,
                background: "var(--tint-mint)",
                border: "1px solid rgba(52,211,153,0.32)",
                letterSpacing: ".06em",
              }}>
                {s.days} days strong
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}