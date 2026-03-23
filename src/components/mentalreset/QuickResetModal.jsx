import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";

const PHASES = [
  { label: "Breathe In", duration: 4000, color: "#8B5CF6", scale: 1.5 },
  { label: "Hold",       duration: 2000, color: "#6D28D9", scale: 1.5 },
  { label: "Breathe Out",duration: 4000, color: "#3ECFBF", scale: 1.0 },
  { label: "Rest",       duration: 2000, color: "#1E40AF", scale: 1.0 },
];

const AFFIRMATIONS = [
  "You're safe. This moment will pass.",
  "Breathe. You are stronger than this feeling.",
  "Let it go with each exhale.",
  "You've made it through hard moments before.",
  "One breath at a time. You've got this.",
];

export default function QuickResetModal({ onClose }) {
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [affIdx, setAffIdx] = useState(0);
  const intervalRef = useRef(null);
  const timerRef = useRef(null);
  const phaseTimeRef = useRef(0);
  const phaseRef = useRef(0);

  const MAX_SECONDS = 60;

  useEffect(() => {
    // Haptic if supported
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

    phaseRef.current = 0;
    phaseTimeRef.current = 0;

    timerRef.current = setInterval(() => {
      setTotalSeconds(s => {
        if (s + 1 >= MAX_SECONDS) {
          clearInterval(timerRef.current);
          clearInterval(intervalRef.current);
          return MAX_SECONDS;
        }
        return s + 1;
      });
    }, 1000);

    const tick = 50;
    intervalRef.current = setInterval(() => {
      phaseTimeRef.current += tick;
      const phase = PHASES[phaseRef.current];
      const pct = Math.min(phaseTimeRef.current / phase.duration, 1);
      setProgress(pct);

      if (phaseTimeRef.current >= phase.duration) {
        phaseTimeRef.current = 0;
        phaseRef.current = (phaseRef.current + 1) % PHASES.length;
        setPhaseIdx(phaseRef.current);
        if (navigator.vibrate) navigator.vibrate(40);
      }
    }, tick);

    const affTimer = setInterval(() => {
      setAffIdx(i => (i + 1) % AFFIRMATIONS.length);
    }, 5000);

    return () => {
      clearInterval(intervalRef.current);
      clearInterval(timerRef.current);
      clearInterval(affTimer);
    };
  }, []);

  const phase = PHASES[phaseIdx];
  const isDone = totalSeconds >= MAX_SECONDS;

  const circumference = 2 * Math.PI * 70;
  const strokeDash = circumference * progress;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(4,6,16,0.97)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: 24,
    }}>
      <style>{`
        @keyframes breathePulse {
          0%,100% { box-shadow: 0 0 40px rgba(139,92,246,0.3); }
          50%      { box-shadow: 0 0 80px rgba(139,92,246,0.6); }
        }
        @keyframes fadeInAff { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .aff-text { animation: fadeInAff 0.6s ease; }
      `}</style>

      {/* Close */}
      <button onClick={onClose} style={{
        position: "absolute", top: 52, right: 24, background: "rgba(255,255,255,0.08)",
        border: "none", borderRadius: "50%", width: 38, height: 38, cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <X style={{ width: 16, height: 16, color: "rgba(255,255,255,0.5)" }} />
      </button>

      {isDone ? (
        <div style={{ textAlign: "center", maxWidth: 300 }}>
          <p style={{ fontSize: 52, marginBottom: 16 }}>✨</p>
          <p style={{ fontSize: 22, fontWeight: 900, color: "#fff", marginBottom: 10 }}>Reset Complete</p>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, marginBottom: 28 }}>
            One full minute of mindful breathing. That took strength.
          </p>
          <button onClick={onClose} style={{
            padding: "14px 40px", borderRadius: 14, background: "linear-gradient(135deg,#7C3AED,#6D28D9)",
            border: "none", color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer",
          }}>Continue →</button>
        </div>
      ) : (
        <>
          {/* Total progress bar */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "rgba(255,255,255,0.06)" }}>
            <div style={{ height: "100%", width: `${(totalSeconds / MAX_SECONDS) * 100}%`,
              background: "linear-gradient(90deg,#7C3AED,#3ECFBF)", transition: "width 1s linear" }} />
          </div>

          <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase",
            letterSpacing: ".1em", marginBottom: 40 }}>
            {MAX_SECONDS - totalSeconds}s remaining
          </p>

          {/* Breathing circle */}
          <div style={{ position: "relative", width: 200, height: 200, marginBottom: 40 }}>
            {/* Outer glow */}
            <div style={{
              position: "absolute", inset: -20, borderRadius: "50%",
              background: `radial-gradient(circle,${phase.color}20,transparent 70%)`,
              animation: "breathePulse 2s ease-in-out infinite",
            }} />
            {/* SVG ring */}
            <svg width="200" height="200" style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
              <circle cx="100" cy="100" r="70" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
              <circle cx="100" cy="100" r="70" fill="none" stroke={phase.color} strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - strokeDash}
                strokeLinecap="round"
                style={{ transition: `stroke-dashoffset ${PHASES[phaseIdx].duration * 0.05}ms linear, stroke 0.5s ease` }}
              />
            </svg>
            {/* Inner circle breathing */}
            <div style={{
              position: "absolute", top: "50%", left: "50%",
              transform: `translate(-50%,-50%) scale(${0.5 + progress * (phase.scale - 1)})`,
              width: 100, height: 100, borderRadius: "50%",
              background: `radial-gradient(circle,${phase.color}60,${phase.color}20)`,
              transition: `transform ${phase.duration * 0.05}ms ease-in-out`,
            }} />
          </div>

          {/* Phase label */}
          <p style={{ fontSize: 28, fontWeight: 900, color: "#fff", marginBottom: 6, letterSpacing: "-.3px" }}>
            {phase.label}
          </p>
          <p style={{ fontSize: 32, fontWeight: 900, color: phase.color, lineHeight: 1, marginBottom: 36 }}>
            {Math.ceil((PHASES[phaseIdx].duration - phaseTimeRef.current) / 1000)}
          </p>

          {/* Affirmation */}
          <div className="aff-text" key={affIdx} style={{ textAlign: "center", maxWidth: 280 }}>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", lineHeight: 1.65, fontStyle: "italic" }}>
              "{AFFIRMATIONS[affIdx]}"
            </p>
          </div>
        </>
      )}
    </div>
  );
}