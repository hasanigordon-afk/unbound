import React, { useState } from "react";
import { Moon, CheckCircle2, Loader2, Edit2 } from "lucide-react";

const RATINGS = [
  { v: 1, emoji: "😔", label: "Rough" },
  { v: 2, emoji: "😕", label: "Hard" },
  { v: 3, emoji: "😐", label: "Okay" },
  { v: 4, emoji: "🙂", label: "Good" },
  { v: 5, emoji: "😊", label: "Great" },
];

const PROMPTS = [
  "What's one thing from today I want to carry forward?",
  "What did I handle better than I expected?",
  "What am I grateful for from today?",
  "What does tomorrow's me need to hear right now?",
];

export default function NightReflection({ entry, onSave, isSaving, tasksComplete }) {
  const [editing, setEditing] = useState(!entry?.reflection_done);
  const [text, setText] = useState(entry?.reflection || "");
  const [rating, setRating] = useState(entry?.reflection_rating || null);
  const prompt = PROMPTS[(new Date().getDay() + 1) % PROMPTS.length];

  const hour = new Date().getHours();
  const isEvening = hour >= 17 || hour < 5;

  const handleSave = () => {
    if (!text.trim() || !rating) return;
    onSave({ reflection: text.trim(), reflection_rating: rating, reflection_done: true });
    setEditing(false);
  };

  if (!editing && entry?.reflection_done) {
    const r = RATINGS.find(r => r.v === entry.reflection_rating);
    return (
      <div style={{ borderRadius: 18, padding: "18px 20px",
        background: "linear-gradient(135deg,rgba(99,102,241,0.08),rgba(139,92,246,0.05))",
        border: "1px solid rgba(139,92,246,0.2)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <Moon style={{ color: "#A78BFA", width: 18, height: 18 }} />
          <p style={{ fontSize: 12, fontWeight: 800, color: "#A78BFA", textTransform: "uppercase", letterSpacing: ".08em" }}>
            Night Reflection ✓
          </p>
          <span style={{ marginLeft: 4, fontSize: 16 }}>{r?.emoji}</span>
          <button onClick={() => setEditing(true)}
            style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", padding: 4 }}>
            <Edit2 style={{ color: "rgba(255,255,255,0.25)", width: 13, height: 13 }} />
          </button>
        </div>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.65)", fontStyle: "italic",
          lineHeight: 1.6, borderLeft: "3px solid rgba(139,92,246,0.4)", paddingLeft: 12 }}>
          "{entry.reflection}"
        </p>
      </div>
    );
  }

  return (
    <div style={{ borderRadius: 18, padding: "18px 20px",
      background: "rgba(255,255,255,0.04)", border: `1px solid ${isEvening ? "rgba(139,92,246,0.25)" : "rgba(255,255,255,0.08)"}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <Moon style={{ color: "#A78BFA", width: 18, height: 18 }} />
        <p style={{ fontSize: 13, fontWeight: 800, color: "#A78BFA" }}>Night Reflection</p>
        {!isEvening && (
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", fontStyle: "italic" }}>
            (available any time)
          </span>
        )}
      </div>

      {tasksComplete && (
        <div style={{ marginBottom: 12, padding: "8px 12px", borderRadius: 10,
          background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)" }}>
          <p style={{ fontSize: 12, color: "#6EE7B7" }}>✨ You completed all your tasks today. Take a moment to reflect.</p>
        </div>
      )}

      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 14, fontStyle: "italic" }}>
        {prompt}
      </p>

      {/* Rating */}
      <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", marginBottom: 8,
        textTransform: "uppercase", letterSpacing: ".06em" }}>How did today feel?</p>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {RATINGS.map(r => (
          <button key={r.v} onClick={() => setRating(r.v)}
            style={{ flex: 1, padding: "10px 4px", borderRadius: 12, border: "none", cursor: "pointer",
              background: rating === r.v ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.04)",
              border: `1.5px solid ${rating === r.v ? "rgba(139,92,246,0.5)" : "rgba(255,255,255,0.07)"}`,
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 20 }}>{r.emoji}</span>
            <span style={{ fontSize: 9, fontWeight: 700,
              color: rating === r.v ? "#A78BFA" : "rgba(255,255,255,0.25)" }}>{r.label}</span>
          </button>
        ))}
      </div>

      <textarea value={text} onChange={e => setText(e.target.value)}
        placeholder="Write what comes to mind…" rows={3}
        style={{ width: "100%", padding: "12px 14px", borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)",
          color: "#fff", fontSize: 14, resize: "none", outline: "none",
          boxSizing: "border-box", lineHeight: 1.6, marginBottom: 12 }} />

      <button onClick={handleSave} disabled={!text.trim() || !rating || isSaving}
        style={{ width: "100%", padding: "12px", borderRadius: 12, border: "none",
          cursor: (text.trim() && rating) ? "pointer" : "not-allowed",
          background: (text.trim() && rating) ? "linear-gradient(135deg,#8B5CF6,#7C3AED)" : "rgba(255,255,255,0.07)",
          color: (text.trim() && rating) ? "#fff" : "rgba(255,255,255,0.3)",
          fontWeight: 800, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        {isSaving ? <Loader2 style={{ width: 15, height: 15 }} className="animate-spin" />
          : <CheckCircle2 style={{ width: 15, height: 15 }} />}
        Close Out Today
      </button>
    </div>
  );
}