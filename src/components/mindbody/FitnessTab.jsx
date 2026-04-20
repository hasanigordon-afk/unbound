import React, { useState, useEffect } from "react";
import { Play, Pause, Check, Zap, X, Loader2 } from "lucide-react";
import { WORKOUT_CATEGORIES, WORKOUTS, LOW_ENERGY_ROUTINE } from "./workoutLibrary";

const LEVELS = [
  { key: "beginner",     label: "Beginner" },
  { key: "intermediate", label: "Intermediate" },
  { key: "advanced",     label: "Advanced" },
];

function WorkoutRunner({ workout, level, onComplete, onCancel }) {
  const data = workout.levels[level];
  const [secondsLeft, setSecondsLeft] = useState(data.duration * 60);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    if (!running || secondsLeft <= 0) return;
    const t = setInterval(() => setSecondsLeft(s => s - 1), 1000);
    return () => clearInterval(t);
  }, [running, secondsLeft]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const total = data.duration * 60;
  const progress = ((total - secondsLeft) / total) * 100;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100, background: "rgba(28,20,16,0.85)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      <div style={{ background: "#FDFAF6", borderRadius: 20, padding: "28px 24px", width: "100%", maxWidth: 380 }}>
        <button onClick={onCancel} style={{
          background: "none", border: "none", cursor: "pointer",
          color: "#9B8E83", padding: 4, float: "right",
        }}>
          <X style={{ width: 18, height: 18 }} />
        </button>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#B8823A", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 6 }}>
          {LEVELS.find(l => l.key === level)?.label}
        </p>
        <h2 style={{ fontFamily: "'Lora', serif", fontSize: 24, fontWeight: 600, color: "#1C1410", marginBottom: 8 }}>
          {workout.name}
        </h2>
        <p style={{ fontSize: 13, color: "#4A3F35", lineHeight: 1.6, marginBottom: 24 }}>
          {data.instruction}
        </p>

        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <p style={{ fontSize: 56, fontWeight: 800, color: "#B8823A", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
            {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
          </p>
        </div>

        <div style={{ height: 6, background: "#E8E2D9", borderRadius: 3, overflow: "hidden", marginBottom: 24 }}>
          <div style={{ width: `${progress}%`, height: "100%", background: "#B8823A", transition: "width 0.5s ease" }} />
        </div>

        {secondsLeft > 0 ? (
          <button onClick={() => setRunning(r => !r)} style={{
            width: "100%", padding: 14, borderRadius: 50, border: "none", cursor: "pointer",
            background: running ? "#F7F3EE" : "#B8823A",
            color: running ? "#4A3F35" : "#fff",
            fontWeight: 700, fontSize: 15,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            border: running ? "1px solid #E8E2D9" : "none",
          }}>
            {running ? <><Pause style={{ width: 15, height: 15 }} /> Pause</> : <><Play style={{ width: 15, height: 15 }} /> Resume</>}
          </button>
        ) : (
          <div style={{ textAlign: "center", padding: "10px 0 14px" }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: "#7A9E7E", marginBottom: 4 }}>
              ✓ Time's up
            </p>
            <p style={{ fontSize: 12, color: "#9B8E83" }}>You did it.</p>
          </div>
        )}

        <button onClick={() => onComplete(data.duration)} style={{
          width: "100%", padding: 14, borderRadius: 50, border: "none", cursor: "pointer",
          background: secondsLeft > 0 ? "#F7F3EE" : "#7A9E7E",
          color: secondsLeft > 0 ? "#4A3F35" : "#fff",
          fontWeight: 700, fontSize: 15, marginTop: 10,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          border: secondsLeft > 0 ? "1px solid #E8E2D9" : "none",
        }}>
          <Check style={{ width: 15, height: 15 }} /> Mark Complete
        </button>
      </div>
    </div>
  );
}

export default function FitnessTab({ onLogWorkout, askMood, saving }) {
  const [selectedCat, setSelectedCat] = useState(WORKOUT_CATEGORIES[0].id);
  const [selectedLevel, setSelectedLevel] = useState("beginner");
  const [activeWorkout, setActiveWorkout] = useState(null);

  const handleComplete = async (duration) => {
    const data = activeWorkout.levels[selectedLevel];
    await onLogWorkout({
      category: selectedCat,
      name: activeWorkout.name,
      level: selectedLevel,
      duration_min: duration,
      completed_at: new Date().toISOString(),
    });
    setActiveWorkout(null);
    askMood();
  };

  const handleLowEnergy = async () => {
    await onLogWorkout({
      category: "stretching",
      name: LOW_ENERGY_ROUTINE.name,
      level: "beginner",
      duration_min: LOW_ENERGY_ROUTINE.duration,
      completed_at: new Date().toISOString(),
    });
    askMood();
  };

  const workouts = WORKOUTS[selectedCat] || [];

  return (
    <div style={{ padding: "20px 16px" }}>

      {/* Category chips */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 16, paddingBottom: 4,
        scrollbarWidth: "none" }}>
        {WORKOUT_CATEGORIES.map(cat => {
          const sel = selectedCat === cat.id;
          return (
            <button key={cat.id} onClick={() => setSelectedCat(cat.id)} style={{
              padding: "10px 14px", borderRadius: 20, border: "none", cursor: "pointer",
              background: sel ? cat.color : "#FDFAF6",
              color: sel ? "#fff" : "#4A3F35",
              border: sel ? "none" : "1px solid #E8E2D9",
              fontSize: 12, fontWeight: 700, whiteSpace: "nowrap",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <span style={{ fontSize: 14 }}>{cat.emoji}</span>
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Level selector */}
      <div style={{
        background: "#FDFAF6", border: "1px solid #E8E2D9",
        borderRadius: 14, padding: 4, marginBottom: 16, display: "flex", gap: 4,
      }}>
        {LEVELS.map(l => {
          const sel = selectedLevel === l.key;
          return (
            <button key={l.key} onClick={() => setSelectedLevel(l.key)} style={{
              flex: 1, padding: "9px 8px", borderRadius: 10, border: "none",
              background: sel ? "#B8823A" : "transparent",
              color: sel ? "#fff" : "#4A3F35",
              fontWeight: 700, fontSize: 12, cursor: "pointer",
            }}>{l.label}</button>
          );
        })}
      </div>

      {/* Workout list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
        {workouts.map(w => {
          const data = w.levels[selectedLevel];
          return (
            <div key={w.name} style={{
              background: "#FDFAF6", border: "1px solid #E8E2D9",
              borderRadius: 14, padding: "16px 16px",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <h4 style={{ fontSize: 15, fontWeight: 700, color: "#1C1410" }}>{w.name}</h4>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#B8823A",
                  background: "rgba(184,130,58,.08)", padding: "3px 10px", borderRadius: 20 }}>
                  {data.duration} min
                </span>
              </div>
              <p style={{ fontSize: 12, color: "#4A3F35", lineHeight: 1.6, marginBottom: 12 }}>
                {data.instruction}
              </p>
              <button onClick={() => setActiveWorkout(w)} style={{
                width: "100%", padding: "10px", borderRadius: 50, border: "none", cursor: "pointer",
                background: "#B8823A", color: "#fff", fontWeight: 700, fontSize: 13,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}>
                <Play style={{ width: 13, height: 13 }} /> Start Workout
              </button>
            </div>
          );
        })}
      </div>

      {/* Low energy mode */}
      <div style={{
        background: "linear-gradient(135deg, rgba(155,138,184,.1), rgba(155,138,184,.04))",
        border: "1px solid rgba(155,138,184,.25)",
        borderRadius: 14, padding: "16px 18px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <Zap style={{ width: 16, height: 16, color: "#9B8AB8" }} />
          <p style={{ fontSize: 13, fontWeight: 700, color: "#1C1410" }}>Low Energy Mode</p>
        </div>
        <p style={{ fontSize: 12, color: "#4A3F35", lineHeight: 1.6, marginBottom: 12 }}>
          {LOW_ENERGY_ROUTINE.instruction}
        </p>
        <button
          onClick={handleLowEnergy}
          disabled={saving}
          style={{
            padding: "9px 18px", borderRadius: 50, border: "1px solid rgba(155,138,184,.4)",
            background: "transparent", color: "#9B8AB8", fontWeight: 700, fontSize: 12,
            cursor: saving ? "default" : "pointer",
            display: "inline-flex", alignItems: "center", gap: 6,
          }}
        >
          {saving ? <Loader2 style={{ width: 12, height: 12 }} className="animate-spin" /> : <Check style={{ width: 12, height: 12 }} />}
          Log 5-min reset
        </button>
      </div>

      {activeWorkout && (
        <WorkoutRunner
          workout={activeWorkout}
          level={selectedLevel}
          onComplete={handleComplete}
          onCancel={() => setActiveWorkout(null)}
        />
      )}
    </div>
  );
}