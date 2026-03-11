import React, { useState, useEffect, useRef } from "react";
import { Wind } from "lucide-react";

const MODES = [
  { id: "quick", label: "Quick Calm", duration: 60, in: 4, hold: 2, out: 4, desc: "1 minute · 4-2-4 breathing" },
  { id: "guided", label: "3 Min Guided", duration: 180, in: 5, hold: 2, out: 6, desc: "3 minutes · 5-2-6 breathing" },
  { id: "box", label: "Box Breathing", duration: 240, in: 4, hold: 4, out: 4, desc: "4 minutes · equal box rhythm" },
];

export default function BreathingResetSection() {
  const [selected, setSelected] = useState(null);
  const [phase, setPhase] = useState("inhale");
  const [countdown, setCountdown] = useState(0);
  const [totalLeft, setTotalLeft] = useState(0);
  const [done, setDone] = useState(false);
  const timerRef = useRef(null);
  const cycleRef = useRef(null);

  const start = (mode) => {
    setSelected(mode);
    setDone(false);
    setPhase("inhale");
    setCountdown(mode.in);
    setTotalLeft(mode.duration);
  };

  const stop = () => {
    clearInterval(timerRef.current);
    clearTimeout(cycleRef.current);
    setSelected(null);
    setDone(false);
  };

  useEffect(() => {
    if (!selected) return;
    const phases = ["inhale", "hold_in", "exhale", "hold_out"];
    const durations = [selected.in, selected.hold, selected.out, selected.hold > 0 ? selected.hold : 0].filter(d => d > 0);
    const phaseNames = phases.filter((_, i) => [selected.in, selected.hold, selected.out, selected.hold].filter(Boolean)[i] > 0);
    let pi = 0;

    const nextPhase = () => {
      pi = (pi + 1) % phaseNames.length;
      setPhase(phaseNames[pi]);
      setCountdown(durations[pi]);
    };

    setPhase(phaseNames[0]);
    setCountdown(durations[0]);

    // countdown each second
    timerRef.current = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { nextPhase(); return durations[(pi) % durations.length]; }
        return c - 1;
      });
      setTotalLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setDone(true);
          setSelected(null);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => { clearInterval(timerRef.current); };
  }, [selected?.id]);

  const phaseLabel = {
    inhale: "Breathe In", hold_in: "Hold", exhale: "Breathe Out", hold_out: "Hold",
  };

  const scale = phase === "inhale" || phase === "hold_in" ? 1.5 : 1;
  const circleColor = phase === "inhale" ? "#6EE7B7" : phase === "hold_in" ? "#A5F3FC" : phase === "exhale" ? "#93C5FD" : "#C4B5FD";

  if (done) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "70vh", padding: 32, textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🌿</div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: "#065F46", marginBottom: 8 }}>Well done.</h2>
        <p style={{ fontSize: 15, color: "#6B7280", marginBottom: 28 }}>Your nervous system is calmer. Take a moment to notice how you feel.</p>
        <button onClick={() => setDone(false)} style={{ background: "#065F46", color: "#FFF", border: "none", borderRadius: 14, padding: "14px 36px", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
          Breathe Again
        </button>
      </div>
    );
  }

  if (selected) {
    const progress = ((selected.duration - totalLeft) / selected.duration) * 100;
    const mins = Math.floor(totalLeft / 60);
    const secs = totalLeft % 60;
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh", padding: "32px 24px", textAlign: "center", background: "#F0FDF4" }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "#065F46", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 6 }}>
          {selected.label}
        </p>
        <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 40 }}>
          {mins}:{String(secs).padStart(2, "0")} remaining
        </p>

        {/* Animated circle */}
        <div style={{ position: "relative", marginBottom: 40 }}>
          <div style={{
            width: 160, height: 160, borderRadius: "50%",
            background: `radial-gradient(circle, ${circleColor}, ${circleColor}88)`,
            boxShadow: `0 0 0 20px ${circleColor}30, 0 0 0 40px ${circleColor}15`,
            display: "flex", alignItems: "center", justifyContent: "center",
            transform: `scale(${scale})`,
            transition: `transform ${phase === "inhale" ? selected.in : selected.out}s ease-in-out`,
          }}>
            <p style={{ fontSize: 28, fontWeight: 800, color: "#065F46" }}>{countdown}</p>
          </div>
        </div>

        <p style={{ fontSize: 26, fontWeight: 700, color: "#065F46", marginBottom: 8 }}>
          {phaseLabel[phase] || "Hold"}
        </p>

        {/* Progress bar */}
        <div style={{ width: "100%", maxWidth: 280, background: "#D1FAE5", borderRadius: 8, height: 6, overflow: "hidden", marginTop: 24 }}>
          <div style={{ height: "100%", background: "#059669", borderRadius: 8, width: `${progress}%`, transition: "width 1s linear" }} />
        </div>

        <button onClick={stop} style={{ marginTop: 28, background: "none", border: "1px solid #D1D5DB", borderRadius: 10, padding: "10px 24px", color: "#6B7280", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
          Stop
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "32px 24px", maxWidth: 520, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🌬️</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#1A3C2E", marginBottom: 6 }}>Breathing Reset</h2>
        <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.6 }}>
          Controlled breathing activates your body's calm response. Choose a session to begin.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {MODES.map(mode => (
          <button
            key={mode.id}
            onClick={() => start(mode)}
            style={{
              background: "#FFF", border: "1px solid #D4EAE1", borderRadius: 18,
              padding: "22px 24px", textAlign: "left", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 16,
            }}
          >
            <div style={{ background: "#E8F5E9", borderRadius: 14, padding: 14, flexShrink: 0 }}>
              <Wind className="w-6 h-6" style={{ color: "#2E7D5E" }} strokeWidth={1.5} />
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 16, color: "#1A3C2E", marginBottom: 3 }}>{mode.label}</p>
              <p style={{ fontSize: 13, color: "#6B7280" }}>{mode.desc}</p>
            </div>
            <span style={{ marginLeft: "auto", fontSize: 20, color: "#A3B5AD" }}>→</span>
          </button>
        ))}
      </div>

      <div style={{ marginTop: 24, background: "#F0FDF4", border: "1px solid #A7F3D0", borderRadius: 16, padding: 18 }}>
        <p style={{ fontSize: 13, color: "#065F46", lineHeight: 1.6 }}>
          💡 <strong>Why it works:</strong> Deep breathing activates your parasympathetic nervous system, signaling your body to stop the stress response and reduce cravings.
        </p>
      </div>
    </div>
  );
}