import React, { useState, useRef } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";

const SESSIONS = [
  {
    id: "urge-5",
    title: "Urge Surfing",
    duration: "5 min",
    desc: "Ride the wave without acting on it. Cravings always pass.",
    color: "#3B82F6",
    instructions: [
      "Find a comfortable position and close your eyes.",
      "Notice the urge or craving in your body — where do you feel it?",
      "Imagine the craving as an ocean wave. It rises, peaks, and falls.",
      "Don't fight it. Observe it from a distance, like a surfer riding the wave.",
      "Breathe slowly. In through the nose, out through the mouth.",
      "The wave is already passing. You don't have to act on it.",
      "With each breath, notice the intensity softening.",
    ],
  },
  {
    id: "grounding-10",
    title: "Grounding",
    duration: "10 min",
    desc: "Come back to the present moment. Anchor yourself here.",
    color: "#10B981",
    instructions: [
      "Take a slow breath in, hold for 2 seconds, release.",
      "Name 5 things you can see in this room right now.",
      "Name 4 things you can physically touch.",
      "Name 3 things you can hear.",
      "Name 2 things you can smell or taste.",
      "Name 1 thing you are grateful for right now.",
      "You are safe. You are here. This moment is manageable.",
    ],
  },
  {
    id: "stress-15",
    title: "Stress Release",
    duration: "15 min",
    desc: "Let tension leave your body. You deserve rest.",
    color: "#8B5CF6",
    instructions: [
      "Lie down or sit with your back fully supported.",
      "Start at the top of your head and release every muscle.",
      "Relax your forehead, eyes, jaw, neck, and shoulders.",
      "Feel your chest and belly soften with each breath.",
      "Release your hands, arms, and back.",
      "Let your legs and feet go heavy against the surface below you.",
      "You have done enough today. Rest is part of recovery.",
    ],
  },
];

export default function CccMeditation() {
  const [selected, setSelected] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [step, setStep] = useState(0);
  const intervalRef = useRef(null);

  const start = (session) => {
    setSelected(session);
    setStep(0);
    setPlaying(true);
    intervalRef.current = setInterval(() => {
      setStep(s => {
        if (s >= session.instructions.length - 1) {
          clearInterval(intervalRef.current);
          setPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, 8000);
  };

  const stop = () => {
    clearInterval(intervalRef.current);
    setPlaying(false);
    setSelected(null);
    setStep(0);
  };

  if (selected) {
    return (
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1E3A5F", marginBottom: 4 }}>
          {selected.title}
        </h2>
        <p style={{ color: "#5A7A9A", fontSize: 14, marginBottom: 24 }}>{selected.duration} · Recovery Meditation</p>

        <div style={{
          background: `linear-gradient(135deg, ${selected.color}18 0%, ${selected.color}08 100%)`,
          border: `1px solid ${selected.color}30`,
          borderRadius: 20,
          padding: "36px 28px",
          textAlign: "center",
          marginBottom: 20,
          minHeight: 180,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}>
          {playing && (
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: `${selected.color}20`, border: `2px solid ${selected.color}50`, marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: selected.color, animation: "pulse 2s infinite" }} />
            </div>
          )}
          <p style={{ fontSize: 17, color: "#1E3A5F", lineHeight: 1.7, fontWeight: 500, maxWidth: 440 }}>
            {selected.instructions[step]}
          </p>
          <p style={{ color: "#9CA3AF", fontSize: 12, marginTop: 16 }}>
            {step + 1} / {selected.instructions.length}
          </p>
          <div style={{ display: "flex", gap: 4, marginTop: 12 }}>
            {selected.instructions.map((_, i) => (
              <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: i === step ? selected.color : "#D1D5DB" }} />
            ))}
          </div>
        </div>

        {!playing && step === selected.instructions.length - 1 && (
          <div style={{ background: "#F0FDF4", border: "1px solid #86EFAC", borderRadius: 14, padding: "16px 20px", marginBottom: 16, textAlign: "center" }}>
            <p style={{ color: "#15803D", fontWeight: 700 }}>Session complete 🌿</p>
            <p style={{ color: "#16A34A", fontSize: 13, marginTop: 4 }}>Well done. How do you feel?</p>
          </div>
        )}

        <button onClick={stop} style={{ width: "100%", padding: "14px", borderRadius: 12, border: "1px solid #CBD5E1", background: "#FFFFFF", color: "#475569", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
          ← Back to Sessions
        </button>

        <style>{`@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(1.3)} }`}</style>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1E3A5F", marginBottom: 4 }}>Meditation</h2>
      <p style={{ color: "#5A7A9A", fontSize: 14, marginBottom: 24 }}>Guided sessions to quiet the noise and settle your mind.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {SESSIONS.map(s => (
          <button
            key={s.id}
            onClick={() => start(s)}
            style={{
              background: "#FFFFFF",
              border: `1px solid ${s.color}30`,
              borderLeft: `4px solid ${s.color}`,
              borderRadius: 14,
              padding: "20px 22px",
              textAlign: "left",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: 16, color: "#1E3A5F", marginBottom: 4 }}>{s.title}</p>
              <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.5 }}>{s.desc}</p>
            </div>
            <div style={{ flexShrink: 0 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: s.color, background: `${s.color}15`, padding: "4px 10px", borderRadius: 20 }}>{s.duration}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}