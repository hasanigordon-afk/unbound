import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, Mic, ArrowRight } from "lucide-react";

export default function DashAIMentor() {
  // Open the global AI Stein bubble (already mounted)
  const openMentor = () => {
    const bubble = document.querySelector('[aria-label="Open AI Stein"]');
    if (bubble) bubble.click();
  };

  return (
    <div className="fade-up" style={{
      position: "relative",
      background: "linear-gradient(135deg, var(--bg-2) 0%, rgba(91,141,239,0.08) 100%)",
      border: "1px solid var(--border-glow)",
      borderRadius: 24,
      padding: "22px",
      backdropFilter: "blur(22px) saturate(160%)",
      WebkitBackdropFilter: "blur(22px) saturate(160%)",
      boxShadow: "var(--glow), var(--shadow-card)",
      overflow: "hidden",
    }}>
      {/* Ambient glow */}
      <div aria-hidden style={{
        position: "absolute", top: -60, right: -60, width: 220, height: 220,
        borderRadius: "50%",
        background: "radial-gradient(circle, var(--ambient-2) 0%, transparent 70%)",
        filter: "blur(20px)", pointerEvents: "none",
      }} />

      <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 14 }}>
        {/* Avatar with halo + waveform */}
        <div style={{ position: "relative", width: 60, height: 60, flexShrink: 0 }}>
          <div style={{
            position: "absolute", inset: -10, borderRadius: "50%",
            background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)",
            opacity: 0.6, filter: "blur(8px)",
            animation: "mentorHalo 2.6s ease-in-out infinite",
          }} />
          <div style={{
            position: "relative",
            width: 60, height: 60, borderRadius: 18,
            background: "linear-gradient(135deg, var(--accent), var(--purple))",
            display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
            boxShadow: "var(--glow)",
          }}>
            <Sparkles style={{ width: 26, height: 26 }} strokeWidth={2.2} />
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: 10.5, fontWeight: 700, color: "var(--accent)",
            letterSpacing: ".18em", textTransform: "uppercase",
            fontFamily: "'Space Grotesk', 'DM Sans', sans-serif",
            marginBottom: 4,
          }}>AI Mentor</p>
          <p style={{
            fontFamily: "'Lora', Georgia, serif",
            fontSize: 17, fontWeight: 600, color: "var(--text)",
            lineHeight: 1.3, marginBottom: 4,
          }}>
            What do you need today?
          </p>
          <p style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5 }}>
            Talk it out. I'm here for the hard moments and the small wins.
          </p>
        </div>
      </div>

      {/* Animated waveform */}
      <div style={{
        marginTop: 14, padding: "10px 12px",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 3, height: 22, flex: 1 }}>
          {[0,1,2,3,4,5,6,7,8,9,10,11,12,13].map(i => (
            <div key={i} style={{
              width: 3, borderRadius: 2, height: 6,
              background: "linear-gradient(180deg, var(--accent), var(--purple))",
              animation: "mentorWave 1.4s ease-in-out infinite",
              animationDelay: `${i * 0.06}s`,
              boxShadow: "0 0 6px var(--accent)",
            }} />
          ))}
        </div>
        <span style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "'Space Grotesk', 'DM Sans', sans-serif", letterSpacing: ".08em" }}>
          ready
        </span>
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <button onClick={openMentor} style={{
          flex: 1,
          background: "linear-gradient(135deg, var(--accent), var(--purple))",
          color: "#fff", border: "none",
          padding: "12px 16px", borderRadius: 999,
          fontSize: 13.5, fontWeight: 700, cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif",
          display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
          boxShadow: "var(--glow)",
        }}>
          <Mic style={{ width: 14, height: 14 }} /> Talk to mentor
        </button>
        <Link to="/SuperAgentHistory" style={{ textDecoration: "none" }}>
          <button style={{
            background: "var(--surface)",
            color: "var(--text)",
            border: "1px solid var(--border)",
            padding: "12px 16px", borderRadius: 999,
            fontSize: 13.5, fontWeight: 600, cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            display: "inline-flex", alignItems: "center", gap: 6,
            backdropFilter: "blur(12px)",
          }}>
            History <ArrowRight style={{ width: 13, height: 13 }} />
          </button>
        </Link>
      </div>

      <style>{`
        @keyframes mentorHalo {
          0%,100% { transform: scale(1); opacity: .55; }
          50%     { transform: scale(1.18); opacity: .85; }
        }
        @keyframes mentorWave {
          0%,100% { height: 6px;  opacity: .45; }
          50%     { height: 22px; opacity: 1;   }
        }
      `}</style>
    </div>
  );
}