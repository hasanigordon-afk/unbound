import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function InstitutionWorkflowCard({ to, icon: Icon, title, desc, color = "var(--accent)" }) {
  return (
    <Link to={to} style={{ textDecoration: "none" }}>
      <div className="card-soft fade-up" style={{ padding: 18, minHeight: 150 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 13 }}>
          <div style={{ width: 44, height: 44, borderRadius: 15, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color, background: `${color}16`, border: `1px solid ${color}55` }}>
            <Icon style={{ width: 21, height: 21 }} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 18, lineHeight: 1.15, marginBottom: 7 }}>{title}</h3>
            <p style={{ color: "var(--text-muted)", fontSize: 13.5, lineHeight: 1.55 }}>{desc}</p>
          </div>
          <ArrowRight style={{ width: 16, height: 16, color: "var(--text-dim)", flexShrink: 0 }} />
        </div>
      </div>
    </Link>
  );
}