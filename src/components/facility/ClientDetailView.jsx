import React from "react";
import { X, Flame, TrendingUp, Calendar, CheckCircle2 } from "lucide-react";
import StaffActionsPanel from "./StaffActionsPanel";

const C = {
  teal:    "#2DD4BF",
  amber:   "#F59E0B",
  emerald: "#10B981",
  red:     "#EF4444",
  indigo:  "#6366F1",
  purple:  "#8B5CF6",
  glass:   { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" },
};

const CATEGORIES = [
  { key: "recovery",        label: "Recovery",        color: C.teal   },
  { key: "productivity",    label: "Productivity",    color: C.indigo },
  { key: "physical_health", label: "Physical Health", color: C.emerald},
  { key: "relationships",   label: "Relationships",   color: C.amber  },
  { key: "mental_growth",   label: "Growth",          color: C.purple },
];

function StatBox({ label, value, color, sub }) {
  return (
    <div style={{ ...C.glass, borderRadius: 12, padding: "12px 14px", flex: 1, minWidth: 0 }}>
      <p style={{ fontSize: 22, fontWeight: 900, color, lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 3, fontWeight: 600,
        textTransform: "uppercase", letterSpacing: ".06em" }}>{label}</p>
      {sub && <p style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", marginTop: 2 }}>{sub}</p>}
    </div>
  );
}

function CategoryBar({ label, pct, color }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>{label}</p>
        <p style={{ fontSize: 12, fontWeight: 800, color }}>{pct}%</p>
      </div>
      <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 6, height: 6, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", borderRadius: 6, background: color,
          boxShadow: `0 0 8px ${color}60`, transition: "width 0.6s ease" }} />
      </div>
    </div>
  );
}

export default function ClientDetailView({ client, facilityId, staffEmail, staffRole, onClose }) {
  if (!client) return null;

  const displayName = client.displayName || client.email?.split("@")[0];
  const phase = client.daysSinceStart
    ? client.daysSinceStart <= 30 ? "Phase 1 · Foundation"
    : client.daysSinceStart <= 60 ? "Phase 2 · Building"
    : "Phase 3 · Integration"
    : "—";

  const engColor = client.weeklyEngagement >= 70 ? C.emerald : client.weeklyEngagement >= 40 ? C.amber : C.red;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "flex-end",
      background: "rgba(0,0,0,0.75)" }} onClick={onClose}>
      <div style={{ width: "100%", maxWidth: 480, margin: "0 auto", maxHeight: "92vh", overflowY: "auto",
        borderRadius: "24px 24px 0 0", background: "#0D1117", border: "1px solid rgba(255,255,255,0.08)" }}
        onClick={e => e.stopPropagation()}>

        {/* Handle + close */}
        <div style={{ padding: "12px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.1)" }} />
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer",
            color: "rgba(255,255,255,0.4)", padding: 4 }}>
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        <div style={{ padding: "16px 20px 40px" }}>
          {/* Client header */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ width: 46, height: 46, borderRadius: "50%", background: "rgba(45,212,191,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>👤</div>
            <div>
              <p style={{ fontSize: 18, fontWeight: 900, color: "#fff", lineHeight: 1.1 }}>{displayName}</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{phase}</p>
            </div>
          </div>

          {/* Key stats */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
            <StatBox label="Streak"    value={`${client.streak}d`}            color={C.teal}    />
            <StatBox label="Best"      value={`${client.longestStreak}d`}      color={C.amber}   />
            <StatBox label="Weekly"    value={`${client.weeklyEngagement}%`}   color={engColor}  />
            <StatBox label="Days In"   value={client.daysSinceStart ?? "—"}    color={C.indigo}  />
          </div>

          {/* Last check-in */}
          <div style={{ ...C.glass, borderRadius: 14, padding: "12px 16px", marginBottom: 20,
            display: "flex", alignItems: "center", gap: 10 }}>
            <Calendar style={{ color: C.teal, width: 16, height: 16, flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Last Check-In</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>
                {client.lastCheckInDate
                  ? `${client.inactiveDays === 0 ? "Today" : `${client.inactiveDays} day${client.inactiveDays !== 1 ? "s" : ""} ago`} · ${client.lastCheckInDate}`
                  : "No check-ins yet"}
              </p>
            </div>
          </div>

          {/* Category trends */}
          <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase",
            letterSpacing: "1px", marginBottom: 12 }}>Category Completion (7-day)</p>
          <div style={{ ...C.glass, borderRadius: 16, padding: "16px 18px", marginBottom: 20 }}>
            {CATEGORIES.map(cat => (
              <CategoryBar
                key={cat.key}
                label={cat.label}
                color={cat.color}
                pct={client.categoryCompletion?.[cat.key] ?? 0}
              />
            ))}
          </div>

          {/* Open alerts */}
          {client.alertList?.length > 0 && (
            <>
              <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(239,68,68,0.7)", textTransform: "uppercase",
                letterSpacing: "1px", marginBottom: 10 }}>⚠️ Active Alerts</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                {client.alertList.map(alert => (
                  <div key={alert.id} style={{ borderRadius: 12, padding: "10px 14px",
                    background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)" }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: C.red }}>
                      {alert.alert_type?.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                    {alert.detail && <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{alert.detail}</p>}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Staff actions */}
          <StaffActionsPanel
            client={client}
            facilityId={facilityId}
            staffEmail={staffEmail}
            staffRole={staffRole}
            onClose={onClose}
          />
        </div>
      </div>
    </div>
  );
}