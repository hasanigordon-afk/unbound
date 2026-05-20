import React from "react";
import { PRIMARY_ACTIONS } from "./vetHubData";

export default function PrimaryActionGrid({ onPick }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 }}>
      {PRIMARY_ACTIONS.map((a) => (
        <button
          key={a.key}
          onClick={() => onPick(a)}
          style={{
            background: "linear-gradient(145deg, rgba(255,255,255,.10), rgba(13,18,32,.72))",
            border: `1px solid ${a.color}55`,
            borderRadius: 22, cursor: "pointer",
            padding: "18px 10px",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
            boxShadow: `0 0 24px ${a.color}18, 0 18px 42px rgba(0,0,0,.26), inset 0 1px 0 rgba(255,255,255,.10)`,
            backdropFilter: "blur(22px) saturate(155%)",
            transition: "transform .22s, box-shadow .22s, border-color .22s",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: `${a.color}22`, border: `1px solid ${a.color}44`, boxShadow: `0 0 22px ${a.color}22`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
          }}>
            {a.emoji}
          </div>
          <p style={{ fontSize: 12, fontWeight: 900, color: a.color, textAlign: "center", lineHeight: 1.2 }}>
            {a.label}
          </p>
        </button>
      ))}
    </div>
  );
}