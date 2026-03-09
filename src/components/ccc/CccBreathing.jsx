import React, { useState, useEffect, useRef } from "react";

const MODES = [
  { id: "quick", label: "60-Second Calm", duration: 60, inhale: 4, hold: 0, exhale: 4, color: "#10B981" },
  { id: "guided", label: "3-Minute Reset", duration: 180, inhale: 4, hold: 4, exhale: 6, color: "#3B82F6" },
  { id: "box", label: "Box Breathing", duration: 240, inhale: 4, hold: 4, exhale: 4, color: "#8B5CF6" },
];

export default function CccBreathing() {
  const [mode, setMode] = useState(null);
  const [phase, setPhase] = useState("inhale"); // inhale | hold | exhale
  const [phaseTime, setPhaseTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [done, setDone] = useState(false);
  const intervalRef = useRef(null);

  const getPhaseMax = (m, p) => {
    if (p === "inhale") return m.inhale;
    if (p === "hold") return m.hold;
    return m.exhale;
  };

  const start = (m) => {
    setMode(m);
    setPhase("inhale");
    setPhaseTime(0);
    setTotalTime(0);
    setDone(false);
  };

  useEffect(() => {
    if (!mode || done) return;
    intervalRef.current = setInterval(() => {
      setTotalTime(t => {
        const next = t + 1;
        if (next >= mode.duration) {
          clearInterval(intervalRef.current);
          setDone(true);
          return next;
        }
        return next;
      });
      setPhaseTime(pt => {
        const max = getPhaseMax(mode, phase);
        if (pt + 1 >= max) {
          setPhase(p => {
            if (p === "inhale") return mode.hold > 0 ? "hold" : "exhale";
            if (p === "hold") return "exhale";
            return "inhale";
          });
          return 0;
        }
        return pt + 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [mode, phase, done]);

  const stop = () => {
    clearInterval(intervalRef.current);
    setMode(null);
    setDone(false);
  };

  if (mode) {
    const phaseMax = getPhaseMax(mode, phase);
    const progress = phaseMax > 0 ? phaseTime / phaseMax : 0;
    const circleSize = done ? 100 : phase === "inhale" ? 80 + progress * 60 : phase === "exhale" ? 140 - progress * 60 : 140;
    const phaseLabel = phase === "inhale" ? "Breathe In" : phase === "hold" ? "Hold" : "Breathe Out";
    const remaining = mode.duration - totalTime;

    return (
      <div>
        <button onClick={stop} style={{ color: "#5A7A9A", fontSize: 13, background: "none", border: "none", cursor: "pointer", marginBottom: 20, padding: 0, fontWeight: 600 }}>
          ← Stop Session
        </button>

        <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1E3A5F", marginBottom: 4, textAlign: "center" }}>{mode.label}</h3>
        <p style={{ color: "#5A7A9A", fontSize: 13, textAlign: "center", marginBottom: 32 }}>
          {done ? "Session complete 🌿" : `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")} remaining`}
        </p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 32, height: 200 }}>
          <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {/* Outer ring */}
            <div style={{
              width: circleSize + 40,
              height: circleSize + 40,
              borderRadius: "50%",
              border: `2px solid ${mode.color}25`,
              position: "absolute",
              transition: "all 1s ease-in-out",
            }} />
            {/* Main circle */}
            <div style={{
              width: circleSize,
              height: circleSize,
              borderRadius: "50%",
              background: `${mode.color}20`,
              border: `3px solid ${mode.color}60`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 1s ease-in-out",
            }}>
              <p style={{ fontSize: 16, fontWeight: 800, color: mode.color }}>{done ? "✓" : phaseLabel}</p>
              {!done && (
                <p style={{ fontSize: 24, fontWeight: 700, color: "#1E3A5F", marginTop: 4 }}>
                  {phaseMax - phaseTime}
                </p>
              )}
            </div>
          </div>
        </div>

        {!done && (
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "center", gap: 16, fontSize: 13, color: "#94A3B8" }}>
              <span style={{ color: phase === "inhale" ? mode.color : "#94A3B8", fontWeight: phase === "inhale" ? 700 : 400 }}>Inhale {mode.inhale}s</span>
              {mode.hold > 0 && <span style={{ color: phase === "hold" ? mode.color : "#94A3B8", fontWeight: phase === "hold" ? 700 : 400 }}>Hold {mode.hold}s</span>}
              <span style={{ color: phase === "exhale" ? mode.color : "#94A3B8", fontWeight: phase === "exhale" ? 700 : 400 }}>Exhale {mode.exhale}s</span>
            </div>
          </div>
        )}

        {done && (
          <div style={{ background: "#F0FDF4", border: "1px solid #86EFAC", borderRadius: 14, padding: "16px 20px", textAlign: "center" }}>
            <p style={{ color: "#15803D", fontWeight: 700, marginBottom: 4 }}>Well done. You did it.</p>
            <p style={{ color: "#16A34A", fontSize: 13 }}>Your nervous system is calmer now. Notice how you feel.</p>
            <button onClick={stop} style={{ marginTop: 12, padding: "10px 24px", borderRadius: 10, background: "#16A34A", color: "#FFF", border: "none", fontWeight: 700, cursor: "pointer" }}>
              Done
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1E3A5F", marginBottom: 4 }}>Breathing Reset</h2>
      <p style={{ color: "#5A7A9A", fontSize: 14, marginBottom: 12 }}>
        Controlled breathing is the fastest way to calm your nervous system. Pick a mode.
      </p>
      <p style={{ fontSize: 13, color: "#94A3B8", marginBottom: 24 }}>Watch the circle. Breathe with it.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {MODES.map(m => (
          <button
            key={m.id}
            onClick={() => start(m)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "20px",
              borderRadius: 16,
              border: `1px solid ${m.color}30`,
              background: "#FFFFFF",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <div style={{ width: 48, height: 48, borderRadius: "50%", border: `3px solid ${m.color}40`, background: `${m.color}10`, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: 15, color: "#1E293B", marginBottom: 3 }}>{m.label}</p>
              <p style={{ fontSize: 12, color: "#64748B" }}>
                In {m.inhale}s{m.hold ? ` · Hold ${m.hold}s` : ""} · Out {m.exhale}s · {Math.floor(m.duration / 60)} min
              </p>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: m.color, background: `${m.color}15`, padding: "4px 10px", borderRadius: 20, flexShrink: 0 }}>
              {Math.floor(m.duration / 60)} min
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}