/**
 * EmptyState — reusable empty/zero-data state component.
 */
import React from "react";

export default function EmptyState({
  icon = "📭",
  title = "Nothing here yet",
  description,
  action,
  actionLabel,
  compact = false,
}) {
  return (
    <div style={{
      textAlign: "center",
      padding: compact ? "24px 16px" : "48px 24px",
      borderRadius: 16,
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.07)",
    }}>
      <p style={{ fontSize: compact ? 28 : 40, marginBottom: 12 }}>{icon}</p>
      <p style={{ fontSize: compact ? 14 : 16, fontWeight: 700, color: "#fff", marginBottom: 6 }}>{title}</p>
      {description && (
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.55, marginBottom: action ? 16 : 0 }}>
          {description}
        </p>
      )}
      {action && actionLabel && (
        <button
          onClick={action}
          style={{
            padding: "10px 22px", borderRadius: 10,
            background: "rgba(62,207,191,0.15)",
            border: "1px solid rgba(62,207,191,0.3)",
            color: "#3ECFBF", fontWeight: 700, fontSize: 13, cursor: "pointer",
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}