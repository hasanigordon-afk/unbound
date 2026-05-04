import React from "react";
import { SA_COLORS as C, SA_STARTER_PROMPTS, SA_CATEGORY_MAP } from "@/lib/superAgentConfig";

export default function SAStarterPrompts({ onPick }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <p style={{ fontSize: 10.5, fontWeight: 800, color: C.dim,
        textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 4 }}>
        Try one of these
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {SA_STARTER_PROMPTS.map(p => {
          const cat = SA_CATEGORY_MAP[p.category];
          const Icon = cat?.icon;
          return (
            <button key={p.key} onClick={() => onPick(p.text)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                padding: "10px 14px", borderRadius: 999,
                background: "#fff", border: `1px solid ${C.border}`,
                color: C.text, fontSize: 13, fontWeight: 600,
                cursor: "pointer", textAlign: "left",
                fontFamily: "'DM Sans', sans-serif",
                boxShadow: "0 1px 3px rgba(15,30,61,0.04)",
              }}>
              {Icon && <Icon style={{ width: 13, height: 13, color: cat.color }} strokeWidth={2.2} />}
              {p.text}
            </button>
          );
        })}
      </div>
    </div>
  );
}