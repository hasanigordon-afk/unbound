import React from "react";

export default function InstitutionMetricCard({ icon: Icon, label, value, detail, color = "var(--accent)" }) {
  return (
    <div className="card fade-up" style={{ padding: 18 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div>
          <p style={{ color: "var(--text-dim)", fontSize: 11, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase" }}>{label}</p>
          <p style={{ fontSize: 34, fontWeight: 950, lineHeight: 1.05, marginTop: 8 }}>{value}</p>
        </div>
        <div style={{ width: 48, height: 48, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", color, background: `${color}18`, border: `1px solid ${color}55` }}>
          <Icon style={{ width: 22, height: 22 }} />
        </div>
      </div>
      <p style={{ color: "var(--text-muted)", fontSize: 13, lineHeight: 1.5, marginTop: 12 }}>{detail}</p>
    </div>
  );
}