import React, { useState, useEffect, useRef } from "react";
import { AlertCircle, Wind, Heart } from "lucide-react";

const GROUNDING_STEPS = [
  { emoji: "👁️", sense: "SEE", count: 5, prompt: "Name 5 things you can see right now." },
  { emoji: "✋", sense: "TOUCH", count: 4, prompt: "Name 4 things you can physically feel or touch." },
  { emoji: "👂", sense: "HEAR", count: 3, prompt: "Name 3 things you can hear in this room." },
  { emoji: "👃", sense: "SMELL", count: 2, prompt: "Name 2 things you can smell." },
  { emoji: "👅", sense: "TASTE", count: 1, prompt: "Name 1 thing you can taste." },
];

const RECOVERY_AFFIRMATIONS = [
  "You have survived 100% of your hardest days so far.",
  "This craving will pass. It always does.",
  "You are stronger than this moment.",
  "Your sobriety is worth protecting.",
  "You are not alone in this fight.",
];

export default function CccEmergencyCalm({ profile, checkIns = [] }) {
  const [phase, setPhase] = useState("idle"); // idle | breathing | grounding | affirmation
  const [breathPhase, setBreathPhase] = useState("inhale");
  const [breathCount, setBreathCount] = useState(0);
  const [groundStep, setGroundStep] = useState(0);
  const [affirm, setAffirm] = useState(0);
  const [circleSize, setCircleSize] = useState(100);
  const intervalRef = useRef(null);

  const streak = (() => {
    if (!checkIns.length) return 0;
    const sorted = [...checkIns].sort((a, b) => new Date(b.check_in_date) - new Date(a.check_in_date));
    let count = 0; let cur = new Date(); cur.setHours(0,0,0,0);
    for (const c of sorted) {
      const d = new Date(c.check_in_date); d.setHours(0,0,0,0);
      if (Math.round((cur - d) / 86400000) <= 1) { count++; cur = d; } else break;
    }
    return count;
  })();

  const startEmergency = () => {
    setPhase("breathing");
    setBreathPhase("inhale");
    setBreathCount(0);
    setCircleSize(80);
    runBreathing();
  };

  const runBreathing = () => {
    let count = 0;
    let phase = "inhale";
    intervalRef.current = setInterval(() => {
      if (phase === "inhale") {
        setCircleSize(160);
        setBreathPhase("inhale");
        setTimeout(() => { phase = "exhale"; setBreathPhase("exhale"); setCircleSize(80); }, 4000);
      }
      count++;
      setBreathCount(count);
      if (count >= 6) {
        clearInterval(intervalRef.current);
        setTimeout(() => setPhase("grounding"), 1000);
      }
    }, 8000);
  };

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  const reset = () => {
    clearInterval(intervalRef.current);
    setPhase("idle");
    setBreathCount(0);
    setGroundStep(0);
    setCircleSize(100);
  };

  if (phase === "breathing") {
    return (
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 16, padding: "14px 20px", marginBottom: 28 }}>
          <p style={{ color: "#DC2626", fontWeight: 700, fontSize: 14 }}>Emergency Calm — Activated</p>
        </div>
        <p style={{ fontSize: 18, fontWeight: 700, color: "#1E3A5F", marginBottom: 4 }}>
          {breathPhase === "inhale" ? "Breathe In..." : "Breathe Out..."}
        </p>
        <p style={{ color: "#5A7A9A", fontSize: 13, marginBottom: 40 }}>Breath {breathCount + 1} of 6</p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 40, height: 200 }}>
          <div style={{
            width: circleSize,
            height: circleSize,
            borderRadius: "50%",
            background: breathPhase === "inhale" ? "#BFDBFE" : "#BBF7D0",
            border: `4px solid ${breathPhase === "inhale" ? "#3B82F6" : "#10B981"}`,
            transition: "all 4s ease-in-out",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <Wind className="w-8 h-8" style={{ color: breathPhase === "inhale" ? "#3B82F6" : "#10B981" }} />
          </div>
        </div>

        <p style={{ fontSize: 13, color: "#94A3B8" }}>Follow the circle. Breathe with it.</p>
        <button onClick={reset} style={{ marginTop: 16, padding: "10px 20px", borderRadius: 10, border: "1px solid #CBD5E1", background: "#FFF", color: "#64748B", cursor: "pointer", fontSize: 13 }}>
          Stop
        </button>
      </div>
    );
  }

  if (phase === "grounding") {
    const step = GROUNDING_STEPS[groundStep];
    return (
      <div>
        <div style={{ background: "#F0F9FF", border: "1px solid #BAE6FD", borderRadius: 16, padding: "14px 20px", marginBottom: 24 }}>
          <p style={{ color: "#0369A1", fontWeight: 700, fontSize: 14 }}>Good. You're still here. Now let's ground you.</p>
        </div>

        <div style={{ textAlign: "center", padding: "28px", background: "#FFFFFF", borderRadius: 20, border: "1px solid #E2E8F0", marginBottom: 20 }}>
          <p style={{ fontSize: 48, marginBottom: 12 }}>{step.emoji}</p>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.1em", marginBottom: 8 }}>
            {groundStep + 1} / {GROUNDING_STEPS.length}
          </p>
          <p style={{ fontSize: 22, fontWeight: 800, color: "#3B82F6", marginBottom: 12 }}>
            {step.count} things you can {step.sense}
          </p>
          <p style={{ fontSize: 16, color: "#374151", lineHeight: 1.6 }}>{step.prompt}</p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          {groundStep < GROUNDING_STEPS.length - 1 ? (
            <button onClick={() => setGroundStep(s => s + 1)} style={{ flex: 1, padding: "14px", borderRadius: 12, background: "#1E4A72", color: "#FFF", border: "none", fontWeight: 700, cursor: "pointer" }}>
              Done → Next
            </button>
          ) : (
            <button onClick={() => setPhase("affirmation")} style={{ flex: 1, padding: "14px", borderRadius: 12, background: "#10B981", color: "#FFF", border: "none", fontWeight: 700, cursor: "pointer" }}>
              I'm Grounded ✓
            </button>
          )}
        </div>
      </div>
    );
  }

  if (phase === "affirmation") {
    const quote = RECOVERY_AFFIRMATIONS[affirm % RECOVERY_AFFIRMATIONS.length];
    return (
      <div>
        <div style={{ background: "#F0FDF4", border: "1px solid #86EFAC", borderRadius: 16, padding: "14px 20px", marginBottom: 24 }}>
          <p style={{ color: "#15803D", fontWeight: 700, fontSize: 14 }}>You made it through the hard part.</p>
        </div>

        <div style={{ textAlign: "center", padding: "32px 24px", background: "linear-gradient(135deg, #1B3A5C, #1E4A72)", borderRadius: 20, marginBottom: 20 }}>
          <Heart className="w-8 h-8" style={{ color: "#7DD3FC", margin: "0 auto 16px" }} />
          <p style={{ fontSize: 18, fontWeight: 700, color: "#FFFFFF", lineHeight: 1.6, fontStyle: "italic" }}>
            "{quote}"
          </p>
        </div>

        {streak > 0 && (
          <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 14, padding: "14px 20px", marginBottom: 16, textAlign: "center" }}>
            <p style={{ color: "#92400E", fontWeight: 700 }}>🔥 {streak} days of sobriety</p>
            <p style={{ color: "#B45309", fontSize: 13, marginTop: 4 }}>That's real. That's yours. Protect it.</p>
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => setAffirm(a => a + 1)} style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1px solid #CBD5E1", background: "#FFFFFF", color: "#475569", fontWeight: 600, cursor: "pointer" }}>
            Another →
          </button>
          <button onClick={reset} style={{ flex: 1, padding: "12px", borderRadius: 12, background: "#1E4A72", color: "#FFF", border: "none", fontWeight: 700, cursor: "pointer" }}>
            I'm okay now ✓
          </button>
        </div>
      </div>
    );
  }

  // IDLE state
  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1E3A5F", marginBottom: 4 }}>Emergency Calm</h2>
      <p style={{ color: "#5A7A9A", fontSize: 14, marginBottom: 24 }}>
        Press this when you feel overwhelmed. It will walk you through breathing, grounding, and recovery reminders.
      </p>

      <button
        onClick={startEmergency}
        style={{
          width: "100%",
          padding: "28px",
          borderRadius: 20,
          border: "none",
          background: "linear-gradient(135deg, #DC2626, #B91C1C)",
          cursor: "pointer",
          textAlign: "center",
          boxShadow: "0 8px 32px rgba(220,38,38,0.3)",
          marginBottom: 24,
        }}
      >
        <AlertCircle className="w-12 h-12" style={{ color: "#FFFFFF", margin: "0 auto 12px", display: "block" }} strokeWidth={1.5} />
        <p style={{ color: "#FFFFFF", fontWeight: 800, fontSize: 22, marginBottom: 6 }}>I Need Calm Now</p>
        <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 14 }}>Tap to start guided emergency protocol</p>
      </button>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 20 }}>🌬️</span>
          <div>
            <p style={{ fontWeight: 600, fontSize: 14, color: "#1E293B" }}>Step 1: Guided Breathing</p>
            <p style={{ fontSize: 12, color: "#64748B" }}>6 deep breaths to calm your nervous system</p>
          </div>
        </div>
        <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 20 }}>🔍</span>
          <div>
            <p style={{ fontWeight: 600, fontSize: 14, color: "#1E293B" }}>Step 2: Grounding Technique</p>
            <p style={{ fontSize: 12, color: "#64748B" }}>5-4-3-2-1 sensory grounding to anchor you here</p>
          </div>
        </div>
        <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 20 }}>💙</span>
          <div>
            <p style={{ fontWeight: 600, fontSize: 14, color: "#1E293B" }}>Step 3: Recovery Affirmations</p>
            <p style={{ fontSize: 12, color: "#64748B" }}>Reminders of your strength and sobriety goals</p>
          </div>
        </div>
      </div>
    </div>
  );
}