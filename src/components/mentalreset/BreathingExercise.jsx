import React, { useState, useEffect, useRef } from "react";
import { Play, Square } from "lucide-react";

const TECHNIQUES = [
  {
    id: "box",
    name: "Box Breathing",
    description: "4-4-4-4 · Reduces stress fast",
    emoji: "⬜",
    color: "#3ECFBF",
    phases: [
      { label: "Inhale",  dur: 4, scale: 1.5 },
      { label: "Hold",    dur: 4, scale: 1.5 },
      { label: "Exhale",  dur: 4, scale: 1.0 },
      { label: "Hold",    dur: 4, scale: 1.0 },
    ],
  },
  {
    id: "478",
    name: "4-7-8 Breathing",
    description: "4-7-8 · Deep calm",
    emoji: "🌊",
    color: "#60A5FA",
    phases: [
      { label: "Inhale",  dur: 4, scale: 1.5 },
      { label: "Hold",    dur: 7, scale: 1.5 },
      { label: "Exhale",  dur: 8, scale: 1.0 },
    ],
  },
  {
    id: "panic",
    name: "Panic Control",
    description: "Quick reset for anxiety spikes",
    emoji: "🆘",
    color: "#F97316",
    phases: [
      { label: "Inhale",  dur: 3, scale: 1.5 },
      { label: "Hold",    dur: 2, scale: 1.5 },
      { label: "Exhale",  dur: 6, scale: 1.0 },
    ],
  },
  {
    id: "slow",
    name: "Slow Breathing",
    description: "Gentle, continuous rhythm",
    emoji: "🍃",
    color: "#A78BFA",
    phases: [
      { label: "Inhale",  dur: 5, scale: 1.5 },
      { label: "Exhale",  dur: 7, scale: 1.0 },
    ],
  },
];

const DURATIONS = [1, 3, 5];

export default function BreathingExercise() {
  const [selected, setSelected] = useState(null);
  const [duration, setDuration] = useState(3);
  const [running, setRunning] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef(null);
  const phaseTimeRef = useRef(0);
  const phaseIdxRef = useRef(0);
  const elapsedRef = useRef(0);

  const technique = selected ? TECHNIQUES.find(t => t.id === selected) : null;
  const totalSec = duration * 60;

  const stop = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setPhaseIdx(0);
    setPhaseProgress(0);
    setElapsed(0);
    phaseTimeRef.current = 0;
    phaseIdxRef.current = 0;
    elapsedRef.current = 0;
  };

  const start = () => {
    if (!technique) return;
    stop();
    setRunning(true);
    const TICK = 50;
    intervalRef.current = setInterval(() => {
      elapsedRef.current += TICK / 1000;
      if (elapsedRef.current >= totalSec) { stop(); return; }
      setElapsed(Math.floor(elapsedRef.current));

      phaseTimeRef.current += TICK / 1000;
      const phase = technique.phases[phaseIdxRef.current];
      const pct = Math.min(phaseTimeRef.current / phase.dur, 1);
      setPhaseProgress(pct);

      if (phaseTimeRef.current >= phase.dur) {
        phaseTimeRef.current = 0;
        phaseIdxRef.current = (phaseIdxRef.current + 1) % technique.phases.length;
        setPhaseIdx(phaseIdxRef.current);
        if (navigator.vibrate) navigator.vibrate(30);
      }
    }, TICK);
  };

  useEffect(() => () => clearInterval(intervalRef.current), []);

  const phase = technique?.phases[phaseIdx];
  const circumference = 2 * Math.PI * 60;

  return (
    <div>
      {/* Technique cards */}
      <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase",
        letterSpacing: "1px", marginBottom: 12 }}>Choose Technique</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
        {TECHNIQUES.map(t => {
          const isSelected = selected === t.id;
          return (
            <button key={t.id} onClick={() => { if (running) stop(); setSelected(t.id); }} style={{
              padding: "16px 14px", borderRadius: 16, textAlign: "left",
              background: isSelected ? `rgba(${t.color === "#3ECFBF" ? "62,207,191" : t.color === "#60A5FA" ? "96,165,250" : t.color === "#F97316" ? "249,115,22" : "167,139,250"},0.12)` : "rgba(255,255,255,0.04)",
              border: `1px solid ${isSelected ? t.color + "50" : "rgba(255,255,255,0.07)"}`,
              cursor: "pointer",
            }}>
              <p style={{ fontSize: 22, marginBottom: 6 }}>{t.emoji}</p>
              <p style={{ fontSize: 13, fontWeight: 800, color: isSelected ? t.color : "#fff", marginBottom: 2 }}>{t.name}</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", lineHeight: 1.3 }}>{t.description}</p>
            </button>
          );
        })}
      </div>

      {technique && (
        <>
          {/* Duration */}
          <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase",
            letterSpacing: "1px", marginBottom: 10 }}>Duration</p>
          <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
            {DURATIONS.map(d => (
              <button key={d} onClick={() => { if (running) stop(); setDuration(d); }} style={{
                flex: 1, padding: "10px", borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: "pointer",
                background: duration === d ? technique.color : "rgba(255,255,255,0.05)",
                color: duration === d ? "#000" : "rgba(255,255,255,0.5)",
                border: `1px solid ${duration === d ? technique.color : "rgba(255,255,255,0.08)"}`,
              }}>{d} min</button>
            ))}
          </div>

          {/* Animated circle */}
          {running && phase ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 28 }}>
              <div style={{ position: "relative", width: 160, height: 160, marginBottom: 20 }}>
                <svg width="160" height="160" style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
                  <circle cx="80" cy="80" r="60" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
                  <circle cx="80" cy="80" r="60" fill="none" stroke={technique.color} strokeWidth="5"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference - circumference * phaseProgress}
                    strokeLinecap="round"
                    style={{ transition: `stroke-dashoffset ${phase.dur * 40}ms linear` }}
                  />
                </svg>
                <div style={{
                  position: "absolute", top: "50%", left: "50%",
                  transform: `translate(-50%,-50%) scale(${0.6 + phaseProgress * (phase.scale - 0.6)})`,
                  width: 80, height: 80, borderRadius: "50%",
                  background: `radial-gradient(circle,${technique.color}70,${technique.color}20)`,
                  transition: `transform ${phase.dur * 40}ms ease-in-out`,
                }} />
              </div>
              <p style={{ fontSize: 24, fontWeight: 900, color: "#fff", marginBottom: 4 }}>{phase.label}</p>
              <p style={{ fontSize: 40, fontWeight: 900, color: technique.color, lineHeight: 1, marginBottom: 12 }}>
                {Math.max(0, Math.ceil(phase.dur - phaseTimeRef.current))}
              </p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
                {Math.floor((totalSec - elapsed) / 60)}:{String((totalSec - elapsed) % 60).padStart(2, "0")} left
              </p>
            </div>
          ) : null}

          {/* Start/Stop */}
          <button onClick={running ? stop : start} style={{
            width: "100%", padding: "16px", borderRadius: 18, cursor: "pointer",
            background: running
              ? "rgba(239,68,68,0.12)"
              : `linear-gradient(135deg,${technique.color},${technique.color}cc)`,
            border: running ? "1px solid rgba(239,68,68,0.3)" : "none",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          }}>
            {running
              ? <><Square style={{ width: 16, height: 16, color: "#F87171" }} /><span style={{ fontSize: 15, fontWeight: 800, color: "#F87171" }}>Stop</span></>
              : <><Play style={{ width: 16, height: 16, color: "#000" }} /><span style={{ fontSize: 15, fontWeight: 800, color: "#000" }}>Start {duration}-min Session</span></>
            }
          </button>
        </>
      )}

      {!technique && (
        <div style={{ textAlign: "center", padding: "32px 0", color: "rgba(255,255,255,0.25)" }}>
          <p style={{ fontSize: 28, marginBottom: 8 }}>☝️</p>
          <p style={{ fontSize: 14 }}>Pick a breathing technique above to begin</p>
        </div>
      )}
    </div>
  );
}