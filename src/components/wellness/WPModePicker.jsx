import React from "react";
import { WP_COLORS as C, WP_MODES } from "@/lib/wellnessConfig";

export default function WPModePicker({ value, onChange }) {
  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 800, color: C.gold,
        textTransform: "uppercase", letterSpacing: ".14em", marginBottom: 10 }}>
        Choose your tone
      </p>
      <h2 style={{
        fontFamily: "'Lora', Georgia, serif", fontSize: 22, fontWeight: 700,
        color: C.text, lineHeight: 1.25, marginBottom: 18,
      }}>
        How should this plan speak to you?
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {WP_MODES.map(m => {
          const sel = value === m.key;
          return (
            <button key={m.key} onClick={() => onChange(m.key)}
              style={{
                textAlign: "left", padding: "14px 16px", borderRadius: 14,
                background: sel ? C.navy : "#fff",
                color: sel ? "#fff" : C.text,
                border: `1.5px solid ${sel ? C.navy : C.border}`,
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              }}>
              <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 3 }}>{m.label}</p>
              <p style={{ fontSize: 12, color: sel ? "rgba(255,255,255,0.7)" : C.dim }}>{m.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}