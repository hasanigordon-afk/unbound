import React from "react";
import { Flame, Clock, CheckCircle2, AlertTriangle, TrendingUp, ChevronRight } from "lucide-react";

const C = {
  teal:    "#2DD4BF",
  amber:   "#F59E0B",
  emerald: "#10B981",
  red:     "#EF4444",
  indigo:  "#6366F1",
  glass:   { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" },
};

function getStatusConfig(client) {
  if (client.inactiveDays >= 2) return { label: "No Recent Engagement", color: C.red,    bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.2)"   };
  if (client.streak >= 7)       return { label: "Strong Momentum",      color: C.emerald,bg: "rgba(16,185,129,0.08)",  border: "rgba(16,185,129,0.2)"  };
  if (client.checkedToday)      return { label: "Active Today",          color: C.teal,   bg: "rgba(45,212,191,0.06)",  border: "rgba(45,212,191,0.15)" };
  return                               { label: "Needs Attention",       color: C.amber,  bg: "rgba(245,158,11,0.07)",  border: "rgba(245,158,11,0.18)" };
}

function engagementColor(pct) {
  if (pct >= 70) return C.emerald;
  if (pct >= 40) return C.amber;
  return C.red;
}

export default function ClientStatusBoard({ clients, onSelect, filterStatus }) {
  const filtered = filterStatus === "all"
    ? clients
    : clients.filter(c => {
        const st = getStatusConfig(c).label;
        if (filterStatus === "active")    return st === "Active Today";
        if (filterStatus === "attention") return st === "Needs Attention" || st === "No Recent Engagement";
        if (filterStatus === "strong")    return st === "Strong Momentum";
        return true;
      });

  if (filtered.length === 0) {
    return (
      <div style={{ ...C.glass, borderRadius: 16, padding: "32px 20px", textAlign: "center" }}>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>No clients match this filter.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {filtered.map(client => {
        const status = getStatusConfig(client);
        const engColor = engagementColor(client.weeklyEngagement);
        return (
          <div key={client.email}
            onClick={() => onSelect(client)}
            style={{ borderRadius: 16, padding: "14px 16px", cursor: "pointer",
              background: status.bg, border: `1px solid ${status.border}`,
              display: "flex", alignItems: "center", gap: 12 }}>

            {/* Avatar */}
            <div style={{ width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
              background: `${status.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 16 }}>👤</span>
            </div>

            {/* Main info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                <p style={{ fontSize: 14, fontWeight: 800, color: "#fff",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {client.displayName || client.email?.split("@")[0]}
                </p>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, flexShrink: 0,
                  background: `${status.color}20`, color: status.color }}>
                  {status.label}
                </span>
              </div>

              {/* Metrics row */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <Flame style={{ width: 11, height: 11, color: C.teal }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: C.teal }}>{client.streak}d</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <TrendingUp style={{ width: 11, height: 11, color: engColor }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: engColor }}>{client.weeklyEngagement}%</span>
                </div>
                {client.checkedToday
                  ? <CheckCircle2 style={{ width: 12, height: 12, color: C.emerald }} />
                  : <Clock style={{ width: 12, height: 12, color: "rgba(255,255,255,0.25)" }} />}
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>
                  {client.inactiveDays === 0 ? "today" : `${client.inactiveDays}d ago`}
                </span>
                {client.openAlerts > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <AlertTriangle style={{ width: 11, height: 11, color: C.red }} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: C.red }}>{client.openAlerts}</span>
                  </div>
                )}
              </div>
            </div>

            <ChevronRight style={{ color: "rgba(255,255,255,0.2)", width: 16, height: 16, flexShrink: 0 }} />
          </div>
        );
      })}
    </div>
  );
}