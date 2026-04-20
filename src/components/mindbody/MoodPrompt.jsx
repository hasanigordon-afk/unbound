import React from "react";
import { X } from "lucide-react";

const OPTIONS = [
  { v: 1, emoji: "😞", label: "Rough" },
  { v: 2, emoji: "😕", label: "Meh" },
  { v: 3, emoji: "🙂", label: "Okay" },
  { v: 4, emoji: "😊", label: "Good" },
  { v: 5, emoji: "🤩", label: "Great" },
];

export default function MoodPrompt({ onSelect, onClose }) {
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
              Nice work
            </p>
            <h3 style={{ fontFamily: "'Lora', serif", fontSize: 22, fontWeight: 600, color: "#1C1410", lineHeight: 1.25 }}>
              How do you feel right now?
            </h3>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#9B8E83", padding: 4 }}>
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
          {OPTIONS.map(o => (
            <button key={o.v} onClick={() => onSelect(o.v)} style={{
              flex: 1, padding: "14px 4px", borderRadius: 14, cursor: "pointer",
              background: "#F7F3EE", border: "1px solid #E8E2D9",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
            }}>
              <span style={{ fontSize: 26 }}>{o.emoji}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#4A3F35" }}>{o.label}</span>
            </button>
          ))}
        </div>
        <p style={{ fontSize: 11, color: "#9B8E83", textAlign: "center", marginTop: 10 }}>
          Optional — tap to close
        </p>
      </div>
    </div>
  );
}