import React from "react";
import { Link } from "react-router-dom";

const NAV_ITEMS = [
  { label: "Recovery", to: "/DailyHub" },
  { label: "Reentry", to: "/RebuildHub" },
  { label: "Community", to: "/StoriesHub" },
  { label: "Growth", to: "/GrowthHub" },
];

export default function HomeTopNav() {
  return (
    <nav className="fade-in" style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      padding: "14px 4px 12px",
    }}>
      <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 9 }}>
        <div style={{
          width: 34,
          height: 34,
          borderRadius: 12,
          background: "linear-gradient(135deg, var(--accent), var(--purple))",
          boxShadow: "var(--glow)",
        }} />
        <div>
          <p style={{ color: "var(--text)", fontWeight: 900, fontSize: 14, letterSpacing: ".02em" }}>Re-silient</p>
          <p style={{ color: "var(--text-dim)", fontSize: 9.5, textTransform: "uppercase", letterSpacing: ".16em" }}>Recovery Infrastructure</p>
        </div>
      </Link>

      <div style={{ display: "flex", gap: 5, overflowX: "auto", scrollbarWidth: "none" }}>
        {NAV_ITEMS.map(item => (
          <Link key={item.label} to={item.to} style={{
            textDecoration: "none",
            color: "var(--text-muted)",
            fontSize: 10.5,
            fontWeight: 800,
            padding: "8px 9px",
            borderRadius: 999,
            border: "1px solid var(--border)",
            background: "var(--surface)",
            whiteSpace: "nowrap",
          }}>
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}