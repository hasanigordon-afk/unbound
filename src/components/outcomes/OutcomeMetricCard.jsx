import React from "react";
import { TrendingUp } from "lucide-react";

export default function OutcomeMetricCard({ icon: Icon = TrendingUp, label, value, detail, color = "var(--accent)" }) {
  return (
    <div className="card" style={{ padding: 18, minHeight: 138 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
        <div>
          <p style={{ color: "var(--text-muted)", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em" }}>{label}</p>
          <h3 style={{ fontSize: 34, marginTop: 10, marginBottom: 4 }}>{value}</h3>
          <p style={{ color: "var(--text-muted)", fontSize: 13, lineHeight: 1.45 }}>{detail}</p>
        </div>
        <div style={{ width: 44, height: 44, borderRadius: 16, background: `${color}22`, border: `1px solid ${color}55`, display: "flex", alignItems: "center", justifyContent: "center", color }}>
          <Icon style={{ width: 21, height: 21 }} />
        </div>
      </div>
    </div>
  );
}