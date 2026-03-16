import React, { useState } from "react";
import { Check } from "lucide-react";

export function WizardProgressBar({ step, totalSteps, stepLabels }) {
  return (
    <div style={{ background: "#fff", borderBottom: "1px solid #E5E7EB", padding: "16px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#8E8E93", textTransform: "uppercase", letterSpacing: ".08em" }}>
          Step {step + 1} of {totalSteps}
        </p>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#4A90E2" }}>{stepLabels[step]}</p>
      </div>
      <div style={{ height: 4, background: "#F0F0F3", borderRadius: 2, overflow: "hidden" }}>
        <div style={{
          height: "100%",
          width: `${((step + 1) / totalSteps) * 100}%`,
          background: "linear-gradient(90deg,#4A90E2,#7C3AED)",
          borderRadius: 2,
          transition: "width 0.3s ease",
        }} />
      </div>
      <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
        {stepLabels.map((label, i) => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 2,
            background: i <= step ? "#4A90E2" : "#E5E7EB",
          }} />
        ))}
      </div>
    </div>
  );
}

export function TagInput({ items, onChange, placeholder, color = "#4A90E2", suggestions = [] }) {
  const [input, setInput] = React.useState("");
  const [showSugg, setShowSugg] = React.useState(false);

  const add = (val) => {
    const v = (val || input).trim();
    if (v && !items.includes(v)) onChange([...items, v]);
    setInput("");
    setShowSugg(false);
  };

  const filtered = suggestions.filter(s => !items.includes(s) && s.toLowerCase().includes(input.toLowerCase()));

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <input
          value={input}
          onChange={e => { setInput(e.target.value); setShowSugg(true); }}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          onBlur={() => setTimeout(() => setShowSugg(false), 150)}
          placeholder={placeholder}
          style={{
            flex: 1, padding: "10px 12px", borderRadius: 10, fontSize: 13,
            border: "1px solid #D1D5DB", background: "#F9FAFB", outline: "none", color: "#1E1E1E",
          }}
        />
        <button
          onClick={() => add()}
          disabled={!input.trim()}
          style={{
            padding: "10px 14px", borderRadius: 10, border: "none", cursor: input.trim() ? "pointer" : "default",
            background: input.trim() ? color : "#E5E7EB",
            color: input.trim() ? "#fff" : "#9CA3AF", fontWeight: 700, fontSize: 14,
          }}
        >+</button>
      </div>

      {/* Suggestions dropdown */}
      {showSugg && filtered.length > 0 && (
        <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10, marginBottom: 8, overflow: "hidden" }}>
          {filtered.slice(0, 5).map((s, i) => (
            <button
              key={i}
              onMouseDown={() => add(s)}
              style={{
                display: "block", width: "100%", padding: "9px 12px", textAlign: "left",
                background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#374151",
                borderBottom: i < filtered.length - 1 ? "1px solid #F3F4F6" : "none",
              }}
            >
              💡 {s}
            </button>
          ))}
        </div>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {items.map((item, i) => (
          <span key={i} style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "5px 11px", borderRadius: 20, fontSize: 12, fontWeight: 600,
            background: color + "15", color, border: `1px solid ${color}30`,
          }}>
            {item}
            <button onClick={() => onChange(items.filter((_, j) => j !== i))}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color, opacity: 0.6, fontSize: 14, lineHeight: 1 }}>
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}