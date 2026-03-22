/**
 * LoadingSpinner — reusable loading indicator.
 */
import React from "react";

export default function LoadingSpinner({ size = 28, color = "#3ECFBF", label }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <div style={{
        width: size, height: size,
        border: `3px solid rgba(62,207,191,0.15)`,
        borderTopColor: color,
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
      {label && <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{label}</p>}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export function PageLoader({ label = "Loading…" }) {
  return (
    <div style={{
      minHeight: "60vh", display: "flex",
      alignItems: "center", justifyContent: "center",
    }}>
      <LoadingSpinner size={36} label={label} />
    </div>
  );
}