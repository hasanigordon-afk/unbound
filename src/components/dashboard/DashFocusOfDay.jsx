import React, { useState } from "react";
import { Volume2, RefreshCw, Target } from "lucide-react";

const FOCUSES = [
  { focus: "Structure creates freedom.",       action: "Complete one productive action before noon." },
  { focus: "Discipline > motivation.",          action: "Move your body for 10 minutes today." },
  { focus: "One conversation can change a day.",action: "Reach out to one person who supports you." },
  { focus: "Clarity comes after action.",       action: "Write down one thing you're avoiding — then start it." },
  { focus: "Healing happens in small wins.",    action: "Check in. Hydrate. Step outside." },
  { focus: "You are not your worst day.",        action: "Practice 4-7-8 breathing for two minutes." },
  { focus: "Momentum is built one rep at a time.", action: "Do the next right thing — then the next." },
];

export default function DashFocusOfDay() {
  const [seed, setSeed] = useState(() => new Date().getDate());
  const idx = seed % FOCUSES.length;
  const item = FOCUSES[idx];

  const speak = () => {
    if (!("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(`Today's focus: ${item.focus}. ${item.action}`);
    u.rate = 0.95; u.pitch = 1.05;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

  return (
    <div className="fade-up" style={{
      position: "relative",
      background: "var(--card)",
      border: "1px solid var(--border-glow)",
      borderRadius: 24,
      padding: "22px 22px 20px",
      backdropFilter: "blur(20px) saturate(160%)",
      WebkitBackdropFilter: "blur(20px) saturate(160%)",
      boxShadow: "var(--glow), var(--shadow-card)",
      overflow: "hidden",
      animation: "dashFocusGlow 6s ease-in-out infinite",
    }}>
      {/* Animated glow border accent */}
      <div aria-hidden style={{
        position: "absolute", inset: -1, borderRadius: 24,
        padding: 1,
        background: "linear-gradient(135deg, var(--accent), transparent 40%, var(--purple) 80%, transparent)",
        WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
        WebkitMaskComposite: "xor",
        maskComposite: "exclude",
        opacity: 0.5,
        pointerEvents: "none",
      }} />

      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 14,
      }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: "var(--navy-dim)",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            boxShadow: "var(--glow)",
          }}>
            <Target style={{ width: 14, height: 14, color: "var(--accent)" }} />
          </div>
          <span style={{
            fontSize: 10.5, fontWeight: 700, color: "var(--accent)",
            letterSpacing: ".18em", textTransform: "uppercase",
            fontFamily: "'Space Grotesk', 'DM Sans', sans-serif",
          }}>
            Today's Focus
          </span>
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={speak} aria-label="Play focus" style={iconBtn()}>
            <Volume2 style={{ width: 14, height: 14 }} />
          </button>
          <button onClick={() => setSeed(s => s + 1)} aria-label="Refresh focus" style={iconBtn()}>
            <RefreshCw style={{ width: 14, height: 14 }} />
          </button>
        </div>
      </div>

      <h3 style={{
        fontFamily: "'Lora', Georgia, serif",
        fontSize: 22, fontWeight: 600, color: "var(--text)",
        lineHeight: 1.25, letterSpacing: "-.01em",
        marginBottom: 10,
      }}>
        {item.focus}
      </h3>

      <div style={{
        display: "flex", alignItems: "flex-start", gap: 10,
        padding: "12px 14px", borderRadius: 14,
        background: "var(--tint-blue)",
        border: "1px solid var(--border)",
      }}>
        <div style={{
          width: 6, height: 6, borderRadius: "50%",
          background: "var(--green)",
          boxShadow: "0 0 10px var(--green)",
          marginTop: 8, flexShrink: 0,
        }} />
        <p style={{ fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.6 }}>
          <span style={{ color: "var(--text)", fontWeight: 600 }}>Suggested action — </span>
          {item.action}
        </p>
      </div>

      <style>{`
        @keyframes dashFocusGlow {
          0%,100% { box-shadow: 0 0 24px rgba(91,141,239,0.20), var(--shadow-card); }
          50%     { box-shadow: 0 0 38px rgba(139,92,246,0.32), var(--shadow-card); }
        }
      `}</style>
    </div>
  );
}

function iconBtn() {
  return {
    width: 32, height: 32, borderRadius: 10,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    color: "var(--text-muted)",
    cursor: "pointer",
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    backdropFilter: "blur(10px)",
    transition: "all .18s",
  };
}