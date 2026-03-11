import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Play, Pause, RotateCcw } from "lucide-react";

const SESSIONS = [
  {
    id: "urge-5", title: "Urge Surfing", duration: 300, emoji: "🌊",
    color: "#4F46E5", bg: "#EEF2FF", border: "#C7D2FE",
    script: [
      "Find a comfortable position and close your eyes.",
      "Notice the urge without judgment — just observe it.",
      "Like a wave, the urge will rise... and fall.",
      "You don't have to act on it. You can ride it.",
      "Watch the urge with curiosity, not fear.",
      "Breathe in... and breathe out slowly.",
      "The wave is cresting now. Stay with it.",
      "Feel it beginning to subside. You are in control.",
      "The urge is passing. You are safe and strong.",
      "Take a deep breath. You surfed the wave.",
    ],
  },
  {
    id: "grounding-10", title: "Grounding", duration: 600, emoji: "🌿",
    color: "#2E7D5E", bg: "#E8F5E9", border: "#A7F3D0",
    script: [
      "Feel your feet on the floor beneath you.",
      "Notice the weight of your body where you sit.",
      "Press your palms together gently.",
      "Feel the temperature of the air around you.",
      "You are here. You are present. You are safe.",
      "Take a slow breath in through your nose.",
      "Exhale fully and let tension release.",
      "You are rooted. Like a tree, you are grounded.",
      "Nothing outside this moment has power right now.",
      "You are present. You are whole.",
    ],
  },
  {
    id: "stress-15", title: "Stress Release", duration: 900, emoji: "🕊️",
    color: "#0F766E", bg: "#F0FDFA", border: "#99F6E4",
    script: [
      "Allow yourself to let go of everything outside this moment.",
      "Tense your shoulders... and release.",
      "Tense your arms... and release.",
      "Feel stress leaving your body with every exhale.",
      "You deserve peace. You are worthy of rest.",
      "Let thoughts float by like clouds.",
      "You do not have to hold everything right now.",
      "Your body knows how to heal. Trust it.",
      "You have come so far. Rest in that truth.",
      "Take this moment entirely for yourself.",
    ],
  },
];

const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export default function MeditationSection() {
  const [active, setActive] = useState(null);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [scriptIndex, setScriptIndex] = useState(0);
  const timerRef = useRef(null);

  const start = (session) => {
    setActive(session);
    setElapsed(0);
    setScriptIndex(0);
    setRunning(true);
  };

  const stop = () => {
    clearInterval(timerRef.current);
    setRunning(false);
    setActive(null);
  };

  useEffect(() => {
    if (!running || !active) return;
    timerRef.current = setInterval(() => {
      setElapsed(e => {
        const next = e + 1;
        if (next >= active.duration) { clearInterval(timerRef.current); setRunning(false); }
        const interval = Math.floor(active.duration / active.script.length);
        setScriptIndex(Math.min(Math.floor(next / interval), active.script.length - 1));
        return next;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [running, active?.id]);

  if (active) {
    const progress = (elapsed / active.duration) * 100;
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh", padding: "32px 24px", textAlign: "center", background: active.bg }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>{active.emoji}</div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1A3C2E", marginBottom: 4 }}>{active.title}</h2>
        <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 32 }}>{fmt(elapsed)} / {fmt(active.duration)}</p>

        <div style={{
          background: "#FFF", border: `1px solid ${active.border}`, borderRadius: 20,
          padding: "28px 24px", maxWidth: 380, marginBottom: 32,
          minHeight: 100, display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <p style={{ fontSize: 17, color: "#1A3C2E", lineHeight: 1.7, fontStyle: "italic", fontWeight: 500 }}>
            "{active.script[scriptIndex]}"
          </p>
        </div>

        {/* Progress bar */}
        <div style={{ width: "100%", maxWidth: 320, background: `${active.color}20`, borderRadius: 8, height: 6, overflow: "hidden", marginBottom: 28 }}>
          <div style={{ height: "100%", background: active.color, borderRadius: 8, width: `${progress}%`, transition: "width 1s linear" }} />
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => setRunning(r => !r)}
            style={{ background: active.color, color: "#FFF", border: "none", borderRadius: 50, width: 60, height: 60, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
          >
            {running ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </button>
          <button
            onClick={stop}
            style={{ background: "#FFF", border: "1px solid #D1D5DB", borderRadius: 50, width: 60, height: 60, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
          >
            <RotateCcw className="w-5 h-5" style={{ color: "#6B7280" }} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "32px 24px", maxWidth: 520, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>✨</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#1A3C2E", marginBottom: 6 }}>Guided Meditation</h2>
        <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.6 }}>Recovery-focused sessions to quiet your mind and reduce cravings.</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {SESSIONS.map(s => (
          <button key={s.id} onClick={() => start(s)} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 18, padding: "20px 22px", textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: 32, flexShrink: 0 }}>{s.emoji}</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: 16, color: "#1A3C2E", marginBottom: 2 }}>{s.title}</p>
              <p style={{ fontSize: 13, color: "#6B7280" }}>{fmt(s.duration)} · Guided session</p>
            </div>
            <Play className="w-5 h-5" style={{ color: s.color }} />
          </button>
        ))}
      </div>
    </div>
  );
}