import React from "react";
import { PRIMARY_ACTIONS } from "./vetHubData";

export default function PrimaryActionGrid({ onPick }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
      {PRIMARY_ACTIONS.map((a) => (
        <button
          key={a.key}
          onClick={() => onPick(a)}
          style={{
            background: "#fff",
            border: `1px solid ${a.color}26`,
            borderRadius: 16, cursor: "pointer",
            padding: "16px 8px",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
            boxShadow: "0 2px 10px rgba(15,30,61,0.05)",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: `${a.color}14`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
          }}>
            {a.emoji}
          </div>
          <p style={{ fontSize: 12, fontWeight: 700, color: a.color, textAlign: "center", lineHeight: 1.2 }}>
            {a.label}
          </p>
        </button>
      ))}
    </div>
  );
}