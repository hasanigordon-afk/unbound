import React, { useState } from "react";

const STATUS_CONFIG = {
  at_risk:         { label: "At Risk",         color: "#EF4444" },
  needs_attention: { label: "Needs Attention", color: "#F59E0B" },
  stable:          { label: "Stable",          color: "#22C55E" },
  new:             { label: "New",             color: "#3B82F6" },
  inactive:        { label: "Inactive",        color: "#94A3B8" },
};

function Bar({ value, color = "#3B82F6", max = 100 }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div style={{ background: "#F1F5F9", borderRadius: 8, height: 8, overflow: "hidden", flex: 1 }}>
      <div style={{ background: color, width: `${pct}%`, height: "100%", borderRadius: 8, transition: "width 0.4s" }} />
    </div>
  );
}

function ClientProgressRow({ client }) {
  const cfg = STATUS_CONFIG[client.status] || STATUS_CONFIG.stable;
  const moodPct = Math.round((client.avgMood / 5) * 100);
  const cravingInverse = Math.round(((5 - client.avgCraving) / 5) * 100);
  const lastSeen = client.lastCheckIn
    ? `${Math.floor((new Date() - new Date(client.lastCheckIn)) / 86400000)}d ago`
    : "Never";

  return (
    <div style={{ background: "#FFF", border: "1px solid #E2E8F0", borderRadius: 12, padding: "18px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: "#3B82F6" }}>{client.displayName.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 14, color: "#0F172A" }}>{client.displayName}</p>
            <p style={{ fontSize: 11, color: "#94A3B8" }}>Last seen {lastSeen} · {client.totalCheckIns} check-ins total</p>
          </div>
        </div>
        <span style={{ background: `${cfg.color}18`, border: `1px solid ${cfg.color}40`, color: cfg.color, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>
          {cfg.label}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <ProgressMetric label="Check-In Rate (7d)" value={client.engagement} color="#3B82F6" />
        <ProgressMetric label="Avg Mood" value={moodPct} color="#22C55E" />
        <ProgressMetric label="Craving Stability" value={cravingInverse} color="#F59E0B" hint="Higher = more stable" />
      </div>
    </div>
  );
}

function ProgressMetric({ label, value, color, hint }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <p style={{ fontSize: 12, color: "#64748B" }}>{label}{hint ? <span style={{ color: "#CBD5E1", marginLeft: 6 }}>({hint})</span> : ""}</p>
        <p style={{ fontSize: 12, fontWeight: 700, color }}>{value}%</p>
      </div>
      <Bar value={value} color={color} />
    </div>
  );
}

export default function PortalProgress({ participants }) {
  const [sortBy, setSortBy] = useState("engagement");

  const sorted = [...participants].sort((a, b) => {
    if (sortBy === "engagement") return b.engagement - a.engagement;
    if (sortBy === "name") return a.displayName.localeCompare(b.displayName);
    if (sortBy === "status") {
      const o = { at_risk: 0, needs_attention: 1, new: 2, stable: 3, inactive: 4 };
      return (o[a.status] ?? 5) - (o[b.status] ?? 5);
    }
    return 0;
  });

  const avgEngagement = participants.length
    ? Math.round(participants.reduce((s, p) => s + p.engagement, 0) / participants.length)
    : 0;

  const stableCount = participants.filter(p => p.status === "stable").length;
  const risky = participants.filter(p => p.status === "at_risk" || p.status === "needs_attention").length;

  return (
    <div style={{ padding: "28px 28px 40px", maxWidth: 960, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0F172A", marginBottom: 4 }}>Progress</h1>
        <p style={{ color: "#64748B", fontSize: 14 }}>Track engagement and recovery progress across all your clients.</p>
      </div>

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 28 }}>
        {[
          { label: "Avg Check-In Rate", value: `${avgEngagement}%`, color: "#3B82F6" },
          { label: "Stable", value: stableCount, color: "#22C55E" },
          { label: "Need Attention", value: risky, color: "#F59E0B" },
        ].map(s => (
          <div key={s.label} style={{ background: "#FFF", border: "1px solid #E2E8F0", borderRadius: 12, padding: "18px 20px" }}>
            <p style={{ fontSize: 30, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</p>
            <p style={{ fontSize: 11, color: "#94A3B8", marginTop: 5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Sort */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          style={{ height: 36, border: "1px solid #E2E8F0", borderRadius: 8, padding: "0 12px", fontSize: 13, color: "#1E293B", background: "#FFF", outline: "none" }}>
          <option value="engagement">Sort by Engagement</option>
          <option value="status">Sort by Status</option>
          <option value="name">Sort by Name</option>
        </select>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {sorted.map(c => <ClientProgressRow key={c.id} client={c} />)}
        {sorted.length === 0 && (
          <div style={{ background: "#FFF", border: "1px solid #E2E8F0", borderRadius: 12, padding: 48, textAlign: "center" }}>
            <p style={{ color: "#94A3B8", fontSize: 14 }}>No clients to show.</p>
          </div>
        )}
      </div>
    </div>
  );
}