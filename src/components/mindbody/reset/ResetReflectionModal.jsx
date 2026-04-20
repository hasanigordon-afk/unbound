import React, { useState } from "react";
import { X, Check } from "lucide-react";

const MOODS = [
  { v: 1, emoji: "😞" },
  { v: 2, emoji: "😕" },
  { v: 3, emoji: "🙂" },
  { v: 4, emoji: "😊" },
  { v: 5, emoji: "🤩" },
];

export default function ResetReflectionModal({ day, onSave, onClose }) {
  const [text, setText] = useState("");
  const [mood, setMood] = useState(null);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(28,20,16,0.6)",
      display: "flex", alignItems: "flex-end",
    }}>
      <div style={{
        background: "#FDFAF6", width: "100%", maxWidth: 480, margin: "0 auto",
        borderRadius: "20px 20px 0 0", padding: "24px 20px 32px",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#B8823A", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 4 }}>
              Day {day} reflection
            </p>
            <h3 style={{ fontFamily: "'Lora', serif", fontSize: 20, fontWeight: 600, color: "#1C1410", lineHeight: 1.25 }}>
              How do you feel right now?
            </h3>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#9B8E83", padding: 4 }}>
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
          {MOODS.map(m => (
            <button key={m.v} onClick={() => setMood(m.v)} style={{
              flex: 1, padding: "14px 4px", borderRadius: 12, cursor: "pointer",
              background: mood === m.v ? "rgba(184,130,58,.12)" : "#F7F3EE",
              border: mood === m.v ? "1.5px solid #B8823A" : "1px solid #E8E2D9",
            }}>
              <span style={{ fontSize: 24 }}>{m.emoji}</span>
            </button>
          ))}
        </div>

        <p style={{ fontSize: 12, fontWeight: 700, color: "#4A3F35", marginBottom: 8 }}>
          What did you do well today? <span style={{ fontWeight: 400, color: "#9B8E83" }}>(optional)</span>
        </p>
        <textarea
          value={text}
          onChange={e => setText(e.target.value.slice(0, 400))}
          rows={3}
          placeholder="Anything. Even something small."
          style={{
            width: "100%", padding: "12px 14px", borderRadius: 12,
            border: "1px solid #E8E2D9", background: "#F7F3EE", color: "#1C1410",
            fontSize: 14, outline: "none", resize: "none",
            fontFamily: "inherit", lineHeight: 1.55, boxSizing: "border-box", marginBottom: 16,
          }}
        />

        <button
          onClick={() => onSave(text, mood)}
          disabled={!mood && !text.trim()}
          style={{
            width: "100%", padding: 14, borderRadius: 50, border: "none",
            cursor: (mood || text.trim()) ? "pointer" : "default",
            background: (mood || text.trim()) ? "#B8823A" : "#E8E2D9",
            color: "#fff", fontWeight: 700, fontSize: 14,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
        >
          <Check style={{ width: 14, height: 14 }} /> Save Reflection
        </button>
      </div>
    </div>
  );
}