import React, { useState } from "react";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { WP_COLORS as C } from "@/lib/wellnessConfig";

const Toggle = ({ label, value, onChange }) => (
  <button onClick={() => onChange(!value)} style={{
    display: "flex", alignItems: "center", gap: 10, width: "100%",
    background: value ? "rgba(107,143,113,0.10)" : "#fff",
    border: `1px solid ${value ? C.green + "55" : C.border}`,
    borderRadius: 12, padding: "11px 14px", cursor: "pointer", textAlign: "left",
    fontFamily: "'DM Sans', sans-serif",
  }}>
    {value
      ? <CheckCircle2 style={{ width: 18, height: 18, color: C.green, flexShrink: 0 }} />
      : <Circle style={{ width: 18, height: 18, color: C.dim, flexShrink: 0 }} />}
    <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{label}</span>
  </button>
);

const RatingRow = ({ label, value, onChange }) => (
  <div style={{ marginBottom: 10 }}>
    <p style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6 }}>{label}</p>
    <div style={{ display: "flex", gap: 6 }}>
      {[1,2,3,4,5].map(n => (
        <button key={n} onClick={() => onChange(n)} style={{
          flex: 1, padding: "8px 0", borderRadius: 8, cursor: "pointer",
          background: value === n ? C.navy : "#fff",
          color: value === n ? "#fff" : C.muted,
          border: `1px solid ${value === n ? C.navy : C.border}`,
          fontSize: 13, fontWeight: 700,
        }}>{n}</button>
      ))}
    </div>
  </div>
);

export default function WPCheckInCard({ existing, onSave, saving, mode = "standard" }) {
  const [meal,     setMeal]     = useState(!!existing?.meal_goal_completed);
  const [water,    setWater]    = useState(!!existing?.water_goal_completed);
  const [workout,  setWorkout]  = useState(!!existing?.workout_completed);
  const [mood,     setMood]     = useState(existing?.mood_rating || 0);
  const [energy,   setEnergy]   = useState(existing?.energy_rating || 0);
  const [discipline, setDiscipline] = useState(existing?.discipline_rating || 0);
  const [notes,    setNotes]    = useState(existing?.notes || "");

  const allDone = meal && water && workout;
  const missionLabel = mode === "veteran" ? "Mission Complete" : "Mark today complete";

  const handleSave = () => {
    onSave({
      meal_goal_completed: meal,
      water_goal_completed: water,
      workout_completed: workout,
      mood_rating: mood || undefined,
      energy_rating: energy || undefined,
      discipline_rating: discipline || undefined,
      mission_complete: allDone,
      notes,
    });
  };

  return (
    <div style={{
      background: "#fff", border: `1px solid ${C.border}`, borderRadius: 18,
      padding: "18px",
    }}>
      <p style={{ fontSize: 11, fontWeight: 800, color: C.gold,
        textTransform: "uppercase", letterSpacing: ".14em", marginBottom: 12 }}>
        {mode === "veteran" ? "Today's Standard" : "Today's check-in"}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
        <Toggle label={mode === "veteran" ? "Fuel Objective — clean meal eaten" : "Meal goal hit"}     value={meal}    onChange={setMeal} />
        <Toggle label="Hydration goal hit"      value={water}   onChange={setWater} />
        <Toggle label={mode === "veteran" ? "Movement Objective — workout done" : "Workout done"}      value={workout} onChange={setWorkout} />
      </div>

      <RatingRow label="Mood (1–5)"       value={mood}       onChange={setMood} />
      <RatingRow label="Energy (1–5)"     value={energy}     onChange={setEnergy} />
      <RatingRow label="Discipline (1–5)" value={discipline} onChange={setDiscipline} />

      <textarea
        value={notes} onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes on today (optional)…"
        rows={2}
        style={{
          width: "100%", border: `1px solid ${C.border}`, outline: "none", resize: "none",
          background: C.cream, color: C.text, fontSize: 13, padding: "10px 12px",
          borderRadius: 10, fontFamily: "inherit", lineHeight: 1.5, boxSizing: "border-box",
          marginBottom: 12,
        }}
      />

      <button onClick={handleSave} disabled={saving} style={{
        width: "100%", padding: "12px 18px", borderRadius: 999,
        background: allDone ? C.green : C.navy, color: "#fff", border: "none",
        fontSize: 14, fontWeight: 700, cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {saving && <Loader2 className="animate-spin" style={{ width: 14, height: 14 }} />}
        {allDone ? `${missionLabel} ✓` : "Save check-in"}
      </button>
    </div>
  );
}