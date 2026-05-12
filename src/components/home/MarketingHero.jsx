import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Play, ArrowRight } from "lucide-react";

const QUOTES = [
  "Every comeback starts with one decision.",
  "You are not your past. You are your next move.",
  "Rebuilding is the bravest kind of building.",
  "Show up today. That's the whole secret.",
  "Hard chapters write the strongest stories.",
];

export default function MarketingHero() {
  const [quoteIdx, setQuoteIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setQuoteIdx(i => (i + 1) % QUOTES.length);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <section style={{
      position: "relative",
      borderRadius: 28,
      overflow: "hidden",
      padding: "44px 22px 36px",
      background: "linear-gradient(160deg, #070A14 0%, #0D1220 60%, rgba(91,141,239,0.10) 100%)",
      border: "1px solid var(--border-glow)",
      boxShadow: "var(--glow), var(--shadow-card)",
      marginTop: 12,
    }}>
      {/* Ambient orbs */}
      <div aria-hidden style={{
        position: "absolute", top: -80, right: -60, width: 240, height: 240, borderRadius: "50%",
        background: "radial-gradient(circle, var(--ambient-1) 0%, transparent 70%)",
        filter: "blur(30px)", pointerEvents: "none",
        animation: "heroOrb 7s ease-in-out infinite",
      }} />
      <div aria-hidden style={{
        position: "absolute", bottom: -100, left: -80, width: 280, height: 280, borderRadius: "50%",
        background: "radial-gradient(circle, var(--ambient-3) 0%, transparent 70%)",
        filter: "blur(34px)", pointerEvents: "none",
        animation: "heroOrb 9s ease-in-out infinite reverse",
      }} />

      {/* Drifting particles */}
      <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        {[0,1,2,3,4,5].map(i => (
          <span key={i} style={{
            position: "absolute",
            width: 4, height: 4, borderRadius: "50%",
            background: i % 2 ? "var(--gold)" : "var(--accent)",
            opacity: 0.5,
            top: `${15 + i * 13}%`,
            left: `${(i * 17) % 90}%`,
            filter: "blur(1px)",
            animation: `heroParticle ${6 + i}s ease-in-out infinite`,
            animationDelay: `${i * 0.7}s`,
          }} />
        ))}
      </div>

      {/* Status chip */}
      <div style={{ position: "relative", display: "flex", justifyContent: "center", marginBottom: 18 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "5px 13px", borderRadius: 999,
          background: "rgba(91,141,239,0.10)",
          border: "1px solid var(--border-glow)",
          fontSize: 10.5, fontWeight: 700, letterSpacing: ".18em",
          color: "var(--accent)", textTransform: "uppercase",
          fontFamily: "'Space Grotesk', 'DM Sans', sans-serif",
          backdropFilter: "blur(10px)",
        }}>
          <Sparkles style={{ width: 11, height: 11 }} />
          Re-siliant
        </div>
      </div>

      {/* Headline */}
      <h1 style={{
        position: "relative",
        fontFamily: "'Lora', Georgia, serif",
        fontSize: 32, fontWeight: 600, lineHeight: 1.12,
        letterSpacing: "-0.015em", color: "var(--text)",
        textAlign: "center", marginBottom: 12,
      }}>
        A Complete Support System<br />
        <span style={{
          background: "linear-gradient(135deg, var(--accent), var(--gold))",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}>
          For Rebuilding Life.
        </span>
      </h1>

      {/* Subheadline */}
      <p style={{
        position: "relative",
        fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6,
        textAlign: "center", maxWidth: 360, margin: "0 auto 22px",
      }}>
        Re-silient organizes recovery, reentry, community, mentorship, wellness, and future-building tools into one clear ecosystem for people and the institutions that support them.
      </p>

      {/* Rotating quote */}
      <div style={{
        position: "relative",
        textAlign: "center", marginBottom: 24,
        minHeight: 22,
      }}>
        <p key={quoteIdx} style={{
          fontFamily: "'Lora', Georgia, serif",
          fontSize: 13, fontStyle: "italic", color: "var(--text-dim)",
          animation: "heroQuoteFade 0.8s ease",
        }}>
          "{QUOTES[quoteIdx]}"
        </p>
      </div>

      {/* CTAs */}
      <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 10 }}>
        <Link to="/Onboarding" style={{ textDecoration: "none" }}>
          <button style={{
            width: "100%", minHeight: 50,
            background: "linear-gradient(135deg, var(--accent), var(--purple))",
            color: "#fff", border: "none", borderRadius: 999,
            fontSize: 15, fontWeight: 700,
            fontFamily: "'DM Sans', sans-serif",
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
            cursor: "pointer",
            boxShadow: "var(--glow)",
            transition: "transform .15s, filter .2s",
          }}
          onMouseEnter={e => e.currentTarget.style.filter = "brightness(1.08)"}
          onMouseLeave={e => e.currentTarget.style.filter = "brightness(1)"}>
            Start Your Journey <ArrowRight style={{ width: 16, height: 16 }} />
          </button>
        </Link>

        <Link to="/ComebackPortal" style={{ textDecoration: "none" }}>
          <button style={{
            width: "100%", minHeight: 50,
            background: "var(--surface)",
            color: "var(--text)",
            border: "1px solid var(--border-glow)",
            borderRadius: 999,
            fontSize: 14.5, fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif",
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
            cursor: "pointer",
            backdropFilter: "blur(12px)",
          }}>
            <Play style={{ width: 14, height: 14 }} /> Watch Real Stories
          </button>
        </Link>
      </div>

      <style>{`
        @keyframes heroOrb {
          0%,100% { transform: translate(0,0) scale(1); opacity: .8; }
          50%     { transform: translate(20px,-10px) scale(1.1); opacity: 1; }
        }
        @keyframes heroParticle {
          0%,100% { transform: translateY(0) translateX(0); opacity: .4; }
          50%     { transform: translateY(-30px) translateX(15px); opacity: .9; }
        }
        @keyframes heroQuoteFade {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}