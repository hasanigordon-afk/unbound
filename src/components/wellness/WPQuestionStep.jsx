import React from "react";
import { WP_COLORS as C } from "@/lib/wellnessConfig";

export default function WPQuestionStep({ question, value, onChange }) {
  const isMulti = question.multi;

  const toggle = (opt) => {
    if (isMulti) {
      const arr = Array.isArray(value) ? value : [];
      const next = arr.includes(opt) ? arr.filter(x => x !== opt) : [...arr, opt];
      onChange(next);
    } else {
      onChange(opt);
    }
  };

  const isSelected = (opt) =>
    isMulti ? Array.isArray(value) && value.includes(opt) : value === opt;

  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 800, color: C.gold,
        textTransform: "uppercase", letterSpacing: ".14em", marginBottom: 10 }}>
        {isMulti ? "Pick all that apply" : "Pick one"}
      </p>
      <h2 style={{
        fontFamily: "'Lora', Georgia, serif", fontSize: 22, fontWeight: 700,
        color: C.text, lineHeight: 1.25, marginBottom: 18,
      }}>
        {question.q}
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {question.options.map((opt) => {
          const sel = isSelected(opt);
          return (
            <button key={opt} onClick={() => toggle(opt)}
              style={{
                textAlign: "left", padding: "13px 16px", borderRadius: 14,
                background: sel ? C.navy : "#fff",
                color: sel ? "#fff" : C.text,
                border: `1.5px solid ${sel ? C.navy : C.border}`,
                fontSize: 14, fontWeight: 600, cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                display: "flex", alignItems: "center", gap: 10,
                transition: "all .15s",
              }}>
              <span style={{
                width: 18, height: 18, borderRadius: isMulti ? 5 : "50%",
                border: `1.5px solid ${sel ? C.gold : C.border}`,
                background: sel ? C.gold : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                {sel && <span style={{ color: "#fff", fontSize: 12, fontWeight: 800 }}>✓</span>}
              </span>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}