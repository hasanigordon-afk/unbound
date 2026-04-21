import React, { useState } from "react";
import { VM, FOCUS_OPTIONS } from "../vmData";

const MOODS = [
  { value: 1, emoji: "😔" },
  { value: 2, emoji: "😐" },
  { value: 3, emoji: "🙂" },
  { value: 4, emoji: "😊" },
  { value: 5, emoji: "💪" },
];

const ENERGY = ["Low", "Medium", "High"];

export default function VMDCheckinCard({ todaysCheckin, onSave, onViewHistory }) {
  const [mood, setMood] = useState(todaysCheckin?.mood_rating || null);
  const [energy, setEnergy] = useState(null);
  const [focus, setFocus] = useState("");
  const [note, setNote] = useState("");

  const canSave = mood !== null;

  const handleSave = () => {
    if (!canSave) return;
    onSave({ mood, energy, focus, note });
  };

  return (
    <div style={{
      background: VM.surface, border: `1px solid ${VM.border}`,
      borderRadius: 14, padding: "18px",
    }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: VM.dim, textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 14 }}>
        Daily Check-In
      </p>

      {/* Mood */}
      <p style={{ fontSize: 12, color: VM.muted, marginBottom: 8 }}>Mood</p>
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {MOODS.map(m => {
          const sel = mood === m.value;
          return (
            <button key={m.value} onClick={() => setMood(m.value)} style={{
              flex: 1, padding: "10px 4px", borderRadius: 10, cursor: "pointer",
              background: sel ? VM.oliveSoft : "transparent",
              border: `1px solid ${sel ? VM.olive : VM.border}`,
              fontSize: 22, fontFamily: "inherit",
            }}>
              {m.emoji}
            </button>
          );
        })}
      </div>

      {/* Energy */}
      <p style={{ fontSize: 12, color: VM.muted, marginBottom: 8 }}>Energy</p>
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {ENERGY.map(e => {
          const sel = energy === e;
          return (
            <button key={e} onClick={() => setEnergy(e)} style={{
              flex: 1, padding: "10px 6px", borderRadius: 10, cursor: "pointer",
              background: sel ? VM.oliveSoft : "transparent",
              border: `1px solid ${sel ? VM.olive : VM.border}`,
              color: sel ? VM.olive : VM.muted,
              fontSize: 12, fontWeight: 700, fontFamily: "inherit",
            }}>
              {e}
            </button>
          );
        })}
      </div>

      {/* Focus */}
      <p style={{ fontSize: 12, color: VM.muted, marginBottom: 8 }}>Focus today</p>
      <select value={focus} onChange={e => setFocus(e.target.value)} style={{
        width: "100%", padding: "12px 14px", borderRadius: 10,
        background: VM.bg, border: `1px solid ${VM.border}`,
        color: focus ? VM.text : VM.dim, fontSize: 13, outline: "none",
        marginBottom: 14, appearance: "none", boxSizing: "border-box",
        fontFamily: "inherit",
        backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none'><path d='M1 1l5 5 5-5' stroke='%23A8A396' stroke-width='1.5'/></svg>")`,
        backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center",
      }}>
        <option value="">Select focus…</option>
        {FOCUS_OPTIONS.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}
      </select>

      {/* Note */}
      <textarea
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="Optional note…"
        rows={2}
        style={{
          width: "100%", padding: "12px 14px", borderRadius: 10,
          background: VM.bg, border: `1px solid ${VM.border}`,
          color: VM.text, fontSize: 13, outline: "none",
          marginBottom: 14, boxSizing: "border-box", resize: "none",
          fontFamily: "inherit", lineHeight: 1.5,
        }}
      />

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={handleSave} disabled={!canSave} style={{
          flex: 1, padding: "11px", borderRadius: 10,
          cursor: canSave ? "pointer" : "not-allowed",
          background: canSave ? VM.olive : VM.border,
          border: "none", color: canSave ? "#12140F" : VM.dim,
          fontSize: 13, fontWeight: 700, fontFamily: "inherit",
        }}>
          Save Check-In
        </button>
        <button onClick={onViewHistory} style={{
          padding: "11px 14px", borderRadius: 10, cursor: "pointer",
          background: "transparent", border: `1px solid ${VM.border}`,
          color: VM.muted, fontSize: 13, fontWeight: 600, fontFamily: "inherit",
        }}>
          History
        </button>
      </div>
    </div>
  );
}