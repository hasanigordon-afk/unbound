import React from "react";
import { WP_COLORS as C } from "@/lib/wellnessConfig";

export default function WPListBlock({ title, items, accent = C.navy, icon }) {
  if (!items || items.length === 0) return null;
  return (
    <div style={{
      background: "#fff", border: `1px solid ${C.border}`, borderRadius: 16,
      padding: "16px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        {icon && <span style={{ fontSize: 18 }}>{icon}</span>}
        <p style={{ fontSize: 11, fontWeight: 800, color: accent,
          textTransform: "uppercase", letterSpacing: ".12em" }}>
          {title}
        </p>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {items.map((item, i) => (
          <span key={i} style={{
            fontSize: 12.5, color: C.text,
            background: C.cream, border: `1px solid ${C.border}`,
            padding: "5px 11px", borderRadius: 999, fontWeight: 600,
          }}>{item}</span>
        ))}
      </div>
    </div>
  );
}