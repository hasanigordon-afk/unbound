import React, { useState } from "react";
import { Plus, Loader2, CheckCircle2 } from "lucide-react";

const ACTIVITIES = [
  { id: "gym",     label: "Gym",      emoji: "🏋️", color: "#F59E0B" },
  { id: "walk",    label: "Walk",     emoji: "🚶", color: "#34D399" },
  { id: "run",     label: "Run",      emoji: "🏃", color: "#F87171" },
  { id: "bike",    label: "Bike",     emoji: "🚴", color: "#60A5FA" },
  { id: "swim",    label: "Swim",     emoji: "🏊", color: "#22D3EE" },
  { id: "yoga",    label: "Yoga",     emoji: "🧘", color: "#A78BFA" },
  { id: "stretch", label: "Stretch",  emoji: "🤸", color: "#FB923C" },
  { id: "sports",  label: "Sports",   emoji: "⚽", color: "#4ADE80" },
  { id: "other",   label: "Other",    emoji: "⚡", color: "#94A3B8" },
];

const INTENSITIES = [
  { id: "light",    label: "Light",    emoji: "🌱" },
  { id: "moderate", label: "Moderate", emoji: "🔥" },
  { id: "intense",  label: "Intense",  emoji: "💪" },
];

const MOODS = ["😫","😕","😐","🙂","😄"];

export default function ActivityLogger({ onSave, isSaving, todayLogged }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("walk");
  const [duration, setDuration] = useState("30");
  const [steps, setSteps] = useState("");
  const [intensity, setIntensity] = useState("moderate");
  const [mood, setMood] = useState(null);
  const [notes, setNotes] = useState("");

  const handleSave = async () => {
    await onSave({ activity_type: type, duration_mins: Number(duration) || null, steps: steps ? Number(steps) : null,
      intensity, mood_after: mood, notes: notes.trim() || null });
    setOpen(false);
    setDuration("30"); setSteps(""); setNotes(""); setMood(null);
  };

  if (!open) return (
    <div>
      {todayLogged.length > 0 && (
        <div style={{ marginBottom: 12, borderRadius: 14, padding: "12px 16px",
          background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)",
          display: "flex", alignItems: "center", gap: 10 }}>
          <CheckCircle2 style={{ color: "#10B981", width: 18, height: 18, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#10B981" }}>Activity logged today!</p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
              {todayLogged.map(l => ACTIVITIES.find(a => a.id === l.activity_type)?.emoji + " " + l.activity_type).join("  ·  ")}
            </p>
          </div>
        </div>
      )}
      <button onClick={() => setOpen(true)}
        style={{ width: "100%", padding: "15px", borderRadius: 16, border: "none", cursor: "pointer",
          background: "linear-gradient(135deg,#F59E0B,#D97706)",
          color: "#fff", fontWeight: 800, fontSize: 15,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          boxShadow: "0 8px 24px rgba(245,158,11,0.25)" }}>
        <Plus style={{ width: 18, height: 18 }} /> Log Activity
      </button>
    </div>
  );

  return (
    <div style={{ borderRadius: 20, padding: "20px", background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(245,158,11,0.2)" }}>
      <p style={{ fontSize: 14, fontWeight: 800, color: "#F59E0B", marginBottom: 16 }}>Log Activity</p>

      {/* Activity type */}
      <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", marginBottom: 8,
        textTransform: "uppercase", letterSpacing: ".06em" }}>Activity Type</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
        {ACTIVITIES.map(a => (
          <button key={a.id} onClick={() => setType(a.id)}
            style={{ padding: "8px 12px", borderRadius: 12, border: "none", cursor: "pointer",
              background: type === a.id ? a.color + "20" : "rgba(255,255,255,0.05)",
              border: `1.5px solid ${type === a.id ? a.color + "60" : "rgba(255,255,255,0.08)"}`,
              color: type === a.id ? a.color : "rgba(255,255,255,0.5)",
              fontSize: 12, fontWeight: 700 }}>
            {a.emoji} {a.label}
          </button>
        ))}
      </div>

      {/* Duration & Steps */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", marginBottom: 6,
            textTransform: "uppercase", letterSpacing: ".06em" }}>Duration (mins)</p>
          <input type="number" value={duration} onChange={e => setDuration(e.target.value)}
            placeholder="30"
            style={{ width: "100%", padding: "11px 14px", borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.06)",
              color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box" }} />
        </div>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", marginBottom: 6,
            textTransform: "uppercase", letterSpacing: ".06em" }}>Steps (optional)</p>
          <input type="number" value={steps} onChange={e => setSteps(e.target.value)}
            placeholder="e.g. 4200"
            style={{ width: "100%", padding: "11px 14px", borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.06)",
              color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box" }} />
        </div>
      </div>

      {/* Intensity */}
      <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", marginBottom: 8,
        textTransform: "uppercase", letterSpacing: ".06em" }}>Intensity</p>
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {INTENSITIES.map(i => (
          <button key={i.id} onClick={() => setIntensity(i.id)}
            style={{ flex: 1, padding: "10px 6px", borderRadius: 12, border: "none", cursor: "pointer",
              background: intensity === i.id ? "rgba(245,158,11,0.12)" : "rgba(255,255,255,0.05)",
              border: `1.5px solid ${intensity === i.id ? "rgba(245,158,11,0.4)" : "rgba(255,255,255,0.08)"}` }}>
            <p style={{ fontSize: 16 }}>{i.emoji}</p>
            <p style={{ fontSize: 11, fontWeight: 700,
              color: intensity === i.id ? "#F59E0B" : "rgba(255,255,255,0.4)", marginTop: 2 }}>{i.label}</p>
          </button>
        ))}
      </div>

      {/* Mood after */}
      <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", marginBottom: 8,
        textTransform: "uppercase", letterSpacing: ".06em" }}>How do you feel after? (optional)</p>
      <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
        {MOODS.map((m, i) => (
          <button key={i} onClick={() => setMood(mood === i + 1 ? null : i + 1)}
            style={{ flex: 1, padding: "8px", borderRadius: 12, border: "none", cursor: "pointer", fontSize: 20,
              background: mood === i + 1 ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)",
              border: `1.5px solid ${mood === i + 1 ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.07)"}` }}>
            {m}
          </button>
        ))}
      </div>

      {/* Notes */}
      <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Quick note (optional)…"
        style={{ width: "100%", padding: "11px 14px", borderRadius: 12, marginBottom: 16,
          border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.06)",
          color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }} />

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => setOpen(false)}
          style={{ flex: 1, padding: "13px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)",
            background: "transparent", color: "rgba(255,255,255,0.4)", fontWeight: 700, cursor: "pointer" }}>
          Cancel
        </button>
        <button onClick={handleSave} disabled={isSaving}
          style={{ flex: 2, padding: "13px", borderRadius: 12, border: "none", cursor: "pointer",
            background: "linear-gradient(135deg,#F59E0B,#D97706)",
            color: "#fff", fontWeight: 800, fontSize: 14,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {isSaving ? <Loader2 style={{ width: 15, height: 15 }} className="animate-spin" /> : null}
          Save Activity
        </button>
      </div>
    </div>
  );
}