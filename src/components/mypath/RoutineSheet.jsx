import React, { useState } from "react";
import { X, CheckCircle2, Loader2 } from "lucide-react";

const CATEGORIES = [
  { value: "meeting",   label: "Meeting",    emoji: "🤝", color: "#2DD4BF" },
  { value: "work",      label: "Work",       emoji: "💼", color: "#6366F1" },
  { value: "gym",       label: "Gym",        emoji: "💪", color: "#F59E0B" },
  { value: "personal",  label: "Personal",   emoji: "🌱", color: "#10B981" },
  { value: "health",    label: "Health",     emoji: "🩺", color: "#F472B6" },
  { value: "family",    label: "Family",     emoji: "❤️", color: "#EF4444" },
  { value: "spiritual", label: "Spiritual",  emoji: "🙏", color: "#A78BFA" },
  { value: "other",     label: "Other",      emoji: "✨", color: "rgba(255,255,255,0.5)" },
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const TIMES = [
  { value: "morning",   label: "Morning",   emoji: "🌅" },
  { value: "afternoon", label: "Afternoon", emoji: "☀️" },
  { value: "evening",   label: "Evening",   emoji: "🌙" },
  { value: "anytime",   label: "Anytime",   emoji: "🔄" },
];

export function categoryInfo(cat) {
  return CATEGORIES.find(c => c.value === cat) || CATEGORIES[7];
}

export default function RoutineSheet({ routine, onClose, onSave, isSaving }) {
  const [form, setForm] = useState(routine || {
    title: "", category: "personal", days_of_week: [], time_of_day: "anytime", notes: ""
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleDay = (d) => {
    const days = form.days_of_week || [];
    set("days_of_week", days.includes(d) ? days.filter(x => x !== d) : [...days, d]);
  };

  const selCat = categoryInfo(form.category);
  const canSave = form.title.trim() && (form.days_of_week || []).length > 0;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "flex-end",
      background: "rgba(0,0,0,0.75)" }} onClick={onClose}>
      <div style={{ width: "100%", maxWidth: 480, margin: "0 auto", borderRadius: "24px 24px 0 0",
        background: "#0D1117", padding: "24px 20px 48px", border: "1px solid rgba(255,255,255,0.08)",
        maxHeight: "90vh", overflowY: "auto" }}
        onClick={e => e.stopPropagation()}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <p style={{ fontSize: 17, fontWeight: 900, color: "#fff" }}>
            {routine ? "Edit Routine" : "Add to My Path"}
          </p>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
            <X style={{ color: "rgba(255,255,255,0.4)", width: 18, height: 18 }} />
          </button>
        </div>

        {/* Title */}
        <p style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)", marginBottom: 6,
          textTransform: "uppercase", letterSpacing: ".06em" }}>What is it? *</p>
        <input value={form.title} onChange={e => set("title", e.target.value)}
          placeholder="e.g. AA Meeting, Morning Run, Journal…"
          style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: 14,
            outline: "none", boxSizing: "border-box", marginBottom: 18 }} />

        {/* Category */}
        <p style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)", marginBottom: 8,
          textTransform: "uppercase", letterSpacing: ".06em" }}>Category</p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>
          {CATEGORIES.map(c => (
            <button key={c.value} onClick={() => set("category", c.value)}
              style={{ padding: "7px 12px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700,
                background: form.category === c.value ? c.color + "22" : "rgba(255,255,255,0.05)",
                color: form.category === c.value ? c.color : "rgba(255,255,255,0.4)",
                border: `1.5px solid ${form.category === c.value ? c.color + "55" : "transparent"}` }}>
              {c.emoji} {c.label}
            </button>
          ))}
        </div>

        {/* Days */}
        <p style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)", marginBottom: 8,
          textTransform: "uppercase", letterSpacing: ".06em" }}>Which days? *</p>
        <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
          {DAYS.map((d, i) => {
            const sel = (form.days_of_week || []).includes(i);
            return (
              <button key={i} onClick={() => toggleDay(i)}
                style={{ flex: 1, padding: "10px 2px", borderRadius: 10, border: "none", cursor: "pointer",
                  background: sel ? selCat.color + "22" : "rgba(255,255,255,0.04)",
                  border: `1.5px solid ${sel ? selCat.color + "55" : "rgba(255,255,255,0.07)"}`,
                  color: sel ? selCat.color : "rgba(255,255,255,0.35)",
                  fontWeight: 800, fontSize: 10 }}>
                {d}
              </button>
            );
          })}
        </div>

        {/* Time of day */}
        <p style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)", marginBottom: 8,
          textTransform: "uppercase", letterSpacing: ".06em" }}>Time of day</p>
        <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
          {TIMES.map(t => (
            <button key={t.value} onClick={() => set("time_of_day", t.value)}
              style={{ flex: 1, padding: "9px 4px", borderRadius: 10, border: "none", cursor: "pointer",
                background: form.time_of_day === t.value ? "rgba(45,212,191,0.12)" : "rgba(255,255,255,0.04)",
                border: `1.5px solid ${form.time_of_day === t.value ? "rgba(45,212,191,0.4)" : "rgba(255,255,255,0.07)"}`,
                color: form.time_of_day === t.value ? "#2DD4BF" : "rgba(255,255,255,0.35)",
                fontWeight: 700, fontSize: 10, textAlign: "center" }}>
              <div>{t.emoji}</div>
              <div style={{ marginTop: 2 }}>{t.label}</div>
            </button>
          ))}
        </div>

        {/* Notes */}
        <p style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)", marginBottom: 6,
          textTransform: "uppercase", letterSpacing: ".06em" }}>Notes <span style={{ fontWeight: 400 }}>(optional)</span></p>
        <textarea value={form.notes || ""} onChange={e => set("notes", e.target.value)}
          placeholder="Any details, reminders, or intentions…" rows={2}
          style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: 13,
            outline: "none", resize: "none", boxSizing: "border-box", marginBottom: 20 }} />

        <button onClick={() => onSave(form)} disabled={!canSave || isSaving}
          style={{ width: "100%", padding: "15px", borderRadius: 14, border: "none", cursor: canSave ? "pointer" : "not-allowed",
            background: canSave ? "linear-gradient(135deg,#2DD4BF,#22C5B0)" : "rgba(255,255,255,0.07)",
            color: canSave ? "#07090F" : "rgba(255,255,255,0.3)",
            fontWeight: 800, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {isSaving ? <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" /> : <CheckCircle2 style={{ width: 16, height: 16 }} />}
          Save to My Path
        </button>
      </div>
    </div>
  );
}