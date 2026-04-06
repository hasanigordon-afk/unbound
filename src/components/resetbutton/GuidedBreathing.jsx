import React, { useState, useEffect, useRef } from "react";

const PATTERNS = [
  { id: "4-7-8",   label: "4-7-8",        desc: "Calms anxiety fast",     inhale: 4, hold: 7,  exhale: 8, holdOut: 0, color: "#2DD4BF" },
  { id: "box",     label: "Box",           desc: "Clears the mind",        inhale: 4, hold: 4,  exhale: 4, holdOut: 4, color: "#818CF8" },
  { id: "calm",    label: "2-1-4",         desc: "Gentle release",         inhale: 2, hold: 1,  exhale: 4, holdOut: 0, color: "#34D399" },
];

function getPhase(pattern, elapsed) {
  const cycle = pattern.inhale + pattern.hold + pattern.exhale + pattern.holdOut;
  const pos = elapsed % cycle;
  if (pos < pattern.inhale) return { phase: "Breathe in", progress: pos / pattern.inhale, duration: pattern.inhale };
  if (pos < pattern.inhale + pattern.hold) return { phase: "Hold", progress: (pos - pattern.inhale) / pattern.hold, duration: pattern.hold };
  if (pos < pattern.inhale + pattern.hold + pattern.exhale) return { phase: "Breathe out", progress: (pos - pattern.inhale - pattern.hold) / pattern.exhale, duration: pattern.exhale };
  return { phase: "Hold", progress: (pos - pattern.inhale - pattern.hold - pattern.exhale) / (pattern.holdOut || 1), duration: pattern.holdOut };
}

export default function GuidedBreathing() {
  const [selected, setSelected] = useState(PATTERNS[0]);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [cycles, setCycles] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setElapsed(e => {
          const cycle = selected.inhale + selected.hold + selected.exhale + selected.holdOut;
          if ((e + 1) % cycle === 0) setCycles(c => c + 1);
          return e + 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, selected]);

  const reset = () => { setRunning(false); setElapsed(0); setCycles(0); };

  const { phase, progress } = running || elapsed > 0 ? getPhase(selected, elapsed) : { phase: "Ready", progress: 0 };
  const scale = phase === "Breathe in" ? 1 + progress * 0.4 : phase === "Breathe out" ? 1.4 - progress * 0.4 : phase === "Hold" ? 1.4 : 1;

  return (
    <div>
      {/* Pattern selector */}
      <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
        {PATTERNS.map(p => (
          <button key={p.id} onClick={() => { setSelected(p); reset(); }}
            style={{ flex: 1, padding: "10px 6px", borderRadius: 14, border: "none", cursor: "pointer",
              background: selected.id === p.id ? p.color + "20" : "rgba(255,255,255,0.05)",
              border: `1.5px solid ${selected.id === p.id ? p.color + "60" : "rgba(255,255,255,0.08)"}` }}>
            <p style={{ fontSize: 12, fontWeight: 800, color: selected.id === p.id ? p.color : "rgba(255,255,255,0.5)" }}>{p.label}</p>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{p.desc}</p>
          </button>
        ))}
      </div>

      {/* Breathing circle */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 28 }}>
        <div style={{ position: "relative", width: 180, height: 180, marginBottom: 20 }}>
          {/* Outer ring */}
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%",
            border: `2px solid ${selected.color}20` }} />
          {/* Animated circle */}
          <div style={{ position: "absolute", inset: "50%", transform: `translate(-50%,-50%) scale(${scale})`,
            width: 120, height: 120, borderRadius: "50%",
            background: `radial-gradient(circle, ${selected.color}30 0%, ${selected.color}08 70%)`,
            border: `2px solid ${selected.color}50`,
            transition: "transform 1s ease-in-out",
            display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 15, fontWeight: 800, color: selected.color, lineHeight: 1 }}>{phase}</p>
              {running && <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>cycle {cycles + 1}</p>}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={() => setRunning(r => !r)}
            style={{ padding: "13px 32px", borderRadius: 14, border: "none", cursor: "pointer",
              background: running
                ? "rgba(255,255,255,0.08)"
                : `linear-gradient(135deg,${selected.color},${selected.color}CC)`,
              color: running ? "rgba(255,255,255,0.6)" : "#07090F",
              fontWeight: 800, fontSize: 15 }}>
            {running ? "Pause" : elapsed > 0 ? "Resume" : "Start"}
          </button>
          {elapsed > 0 && (
            <button onClick={reset}
              style={{ padding: "13px 20px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.1)",
                background: "transparent", color: "rgba(255,255,255,0.4)", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
              Reset
            </button>
          )}
        </div>

        {cycles > 0 && (
          <p style={{ marginTop: 14, fontSize: 13, color: "rgba(255,255,255,0.35)", fontStyle: "italic" }}>
            {cycles} {cycles === 1 ? "cycle" : "cycles"} complete · Keep going 🌊
          </p>
        )}
      </div>
    </div>
  );
}