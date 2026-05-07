import React from "react";
import { Sparkles } from "lucide-react";

/**
 * Premium hero greeting — personalized, dynamic, emotionally supportive.
 * Floats over the ambient background with glow accents.
 */
const TIME_GREETINGS = {
  morning:   ["Rise with intention.", "A new day. A new step forward.", "Small steps become life-changing momentum."],
  afternoon: ["Keep building.", "You're doing the work.", "Progress compounds with every choice."],
  evening:   ["Reflect. Reset. Rebuild.", "Today mattered.", "End the day stronger than you started."],
  night:     ["Rest is part of the rebuild.", "Tomorrow is yours.", "You showed up today."],
};

function pickPhrase(hour) {
  let bucket = "morning";
  if (hour >= 5  && hour < 12) bucket = "morning";
  else if (hour >= 12 && hour < 17) bucket = "afternoon";
  else if (hour >= 17 && hour < 21) bucket = "evening";
  else bucket = "night";
  const arr = TIME_GREETINGS[bucket];
  // Stable pick per day so it doesn't jitter on re-render
  const day = new Date().getDate();
  return arr[day % arr.length];
}

export default function DashHeroGreeting({ firstName = "there", stage }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : hour < 21 ? "Good evening" : "Late night";
  const motiv = pickPhrase(hour);

  return (
    <div className="fade-up" style={{
      position: "relative",
      padding: "32px 4px 12px",
    }}>
      {/* Ambient glow behind text */}
      <div aria-hidden style={{
        position: "absolute", top: 10, left: -40, width: 200, height: 200,
        borderRadius: "50%",
        background: "radial-gradient(circle, var(--ambient-1) 0%, transparent 70%)",
        filter: "blur(20px)", pointerEvents: "none",
      }} />

      {/* Status chip */}
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        padding: "5px 12px", borderRadius: 999,
        background: "var(--surface)",
        border: "1px solid var(--border-glow)",
        backdropFilter: "blur(14px)",
        marginBottom: 16,
        boxShadow: "var(--glow)",
      }}>
        <Sparkles style={{ width: 12, height: 12, color: "var(--accent)" }} />
        <span style={{
          fontSize: 10.5, fontWeight: 700, color: "var(--accent)",
          letterSpacing: ".18em", textTransform: "uppercase",
          fontFamily: "'Space Grotesk', 'DM Sans', sans-serif",
        }}>
          {greeting} · {stage || "Rebuilding"}
        </span>
      </div>

      {/* Greeting headline */}
      <h1 style={{
        fontFamily: "'Lora', Georgia, serif",
        fontSize: 36, fontWeight: 700,
        lineHeight: 1.1, letterSpacing: "-.02em",
        marginBottom: 10,
        color: "var(--text)",
      }}>
        Welcome back,<br/>
        <span style={{
          background: "linear-gradient(90deg, var(--accent) 0%, var(--purple) 50%, var(--accent) 100%)",
          backgroundSize: "200% 100%",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          animation: "shimmer 6s ease-in-out infinite",
        }}>{firstName}.</span>
      </h1>

      {/* Motivational line */}
      <p style={{
        fontSize: 15.5, color: "var(--text-muted)",
        lineHeight: 1.65, maxWidth: 380,
        fontFamily: "'Lora', Georgia, serif",
        fontStyle: "italic",
      }}>
        {motiv}
      </p>
    </div>
  );
}