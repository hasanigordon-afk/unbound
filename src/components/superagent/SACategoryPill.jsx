import React from "react";
import { SA_CATEGORY_MAP } from "@/lib/superAgentConfig";

export default function SACategoryPill({ categoryKey, size = "sm" }) {
  const cat = SA_CATEGORY_MAP[categoryKey];
  if (!cat) return null;
  const Icon = cat.icon;
  const padding = size === "sm" ? "3px 9px" : "5px 12px";
  const fontSize = size === "sm" ? 10.5 : 12;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding, borderRadius: 999,
      background: cat.tint,
      border: `1px solid ${cat.color}33`,
      color: cat.color,
      fontSize, fontWeight: 700, letterSpacing: ".02em",
      whiteSpace: "nowrap",
    }}>
      <Icon style={{ width: 11, height: 11 }} strokeWidth={2.2} />
      {cat.label}
    </span>
  );
}