import React, { useState } from "react";
import { AlertTriangle, ChevronRight, Search } from "lucide-react";

function StabilityBadge({ score, label, color }) {
  const bg =
    score >= 80 ? "rgba(16,185,129,0.1)" :
    score >= 50 ? "rgba(245,158,11,0.1)" :
                  "rgba(239,68,68,0.1)";
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: bg, border: `1.5px solid ${color}40`,
      borderRadius: 10, padding: "4px 10px",
    }}>
      <div style={{ width: 7, height: 7, borderRadius: "50%", background: color, boxShadow: `0 0 6px ${color}` }} />
      <span style={{ fontSize: 12, fontWeight: 700, color }}>{score} · {label}</span>
    </div>
  );
}

function ScoreBar({ score, color }) {
  return (
    <div style={{ background: "#F0F0F3", borderRadius: 4, height: 5, overflow: "hidden" }}>
      <div style={{ width: `${score}%`, height: "100%", background: color, borderRadius: 4 }} />
    </div>
  );
}

const INDICATOR_DEFS = [
  { key: "streak",         label: "Streak",    icon: "🔥" },
  { key: "weeklyMeetings", label: "Meetings",  icon: "🤝" },
  { key: "sponsorContacts",label: "Sponsor",   icon: "📞" },
];

function IndicatorPill({ icon, label, value, good }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 5,
      background: good ? "#F0FDF4" : "#FEF9EC",
      border: `1px solid ${good ? "#BBF7D0" : "#FDE68A"}`,
      borderRadius: 8, padding: "4px 8px",
    }}>
      <span style={{ fontSize: 12 }}>{icon}</span>
      <span style={{ fontSize: 11, fontWeight: 600, color: good ? "#15803D" : "#92400E" }}>
        {label}: {value}
      </span>
    </div>
  );
}

const FILTERS = ["All", "High Risk", "At Risk", "Stable"];

export default function AftercareClientList({ clientMetrics, onSelectClient }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  if (clientMetrics.length === 0) {
    return (
      <div className="text-center py-16" style={{ color: "#8E8E93" }}>
        <p className="text-sm font-medium">No clients assigned</p>
        <p className="text-xs mt-1">Clients will appear here once assigned to you</p>
      </div>
    );
  }

  // Sort: High Risk first, then At Risk, then Stable
  const sorted = [...clientMetrics].sort((a, b) => a.stabilityScore - b.stabilityScore);

  const filtered = sorted.filter(m => {
    const matchSearch = !search || m.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "All" ? true :
      filter === "High Risk" ? m.stabilityScore < 50 :
      filter === "At Risk"   ? (m.stabilityScore >= 50 && m.stabilityScore < 80) :
                               m.stabilityScore >= 80;
    return matchSearch && matchFilter;
  });

  return (
    <div>
      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: "High Risk", count: sorted.filter(m => m.stabilityScore < 50).length, color: "#EF4444", bg: "#FEF2F2" },
          { label: "At Risk",   count: sorted.filter(m => m.stabilityScore >= 50 && m.stabilityScore < 80).length, color: "#F59E0B", bg: "#FFFBEB" },
          { label: "Stable",    count: sorted.filter(m => m.stabilityScore >= 80).length, color: "#10B981", bg: "#F0FDF4" },
        ].map(s => (
          <button key={s.label} onClick={() => setFilter(filter === s.label ? "All" : s.label)}
            style={{
              background: filter === s.label ? s.color : s.bg,
              border: `1px solid ${s.color}40`,
              borderRadius: 10, padding: "10px 6px", textAlign: "center",
            }}>
            <p style={{ fontSize: 20, fontWeight: 900, color: filter === s.label ? "#fff" : s.color, lineHeight: 1 }}>{s.count}</p>
            <p style={{ fontSize: 10, fontWeight: 600, color: filter === s.label ? "rgba(255,255,255,0.8)" : "#5A5A5A", marginTop: 2 }}>{s.label}</p>
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 12 }}>
        <Search className="w-3.5 h-3.5" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#8E8E93" }} />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search clients…"
          style={{ width: "100%", paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8, fontSize: 13, background: "#FFF", border: "1px solid #E5E7EB", borderRadius: 10, outline: "none", color: "#1E1E1E", boxSizing: "border-box" }}
        />
      </div>

      {/* Client cards */}
      <div className="flex flex-col gap-3">
        {filtered.map((m) => {
          const { stabilityScore: ss, stabilityLabel: sl, stabilityColor: sc } = m;
          const hasAlert = m.relapseFlag || m.highCravingImmediate || m.missedCheckIns;
          const leftBorderColor = sc;

          return (
            <button
              key={m.email}
              onClick={() => onSelectClient(m)}
              style={{
                width: "100%", textAlign: "left",
                background: "#FFF",
                border: `1px solid #E5E7EB`,
                borderLeft: `4px solid ${leftBorderColor}`,
                borderRadius: 12, padding: "14px 14px 12px",
                boxShadow: hasAlert ? `0 0 0 1px ${sc}30` : "none",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#1E1E1E", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {m.profile?.full_name || m.email}
                    </p>
                    {hasAlert && <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#EF4444" }} />}
                  </div>
                  <p style={{ fontSize: 11, color: "#8E8E93" }}>
                    {m.lastCheckIn ? `Last check-in: ${m.daysSinceCheckIn}d ago` : "No check-ins"}
                    {m.sobrietyDays !== null ? ` · ${m.sobrietyDays}d sober` : ""}
                  </p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                  <StabilityBadge score={ss} label={sl} color={sc} />
                  <ChevronRight className="w-4 h-4" style={{ color: "#D1D1D6" }} />
                </div>
              </div>

              {/* Score bar */}
              <ScoreBar score={ss} color={sc} />

              {/* 5 Indicator pills */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
                <IndicatorPill icon="🔥" label="Streak" value={`${m.streak}d`} good={m.streak >= 3} />
                <IndicatorPill icon="🤝" label="Meetings" value={m.weeklyMeetings} good={m.weeklyMeetings > 0} />
                <IndicatorPill icon="📞" label="Sponsor" value={m.sponsorContacts} good={m.sponsorContacts > 0} />
                <IndicatorPill icon="🏠" label="Housing" value={m.profile?.housing_status || "—"} good={!!m.profile?.housing_status} />
                <IndicatorPill icon="💼" label="Employed" value={m.profile?.employment_status || "—"} good={m.profile?.employment_status === "employed"} />
              </div>

              {/* Alert tags */}
              {hasAlert && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10, paddingTop: 10, borderTop: "1px solid #FEE2E2" }}>
                  {m.relapseFlag && (
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, background: "#FEF2F2", color: "#EF4444", fontWeight: 600 }}>
                      🚨 Relapse Risk
                    </span>
                  )}
                  {m.missedCheckIns && (
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, background: "#FEF2F2", color: "#EF4444", fontWeight: 600 }}>
                      ⚠ Missed Check-Ins
                    </span>
                  )}
                  {m.noMeetings && (
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, background: "#FFF7ED", color: "#D97706", fontWeight: 600 }}>
                      ⚠ No Meetings
                    </span>
                  )}
                  {!m.sponsorContacts && (
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, background: "#FFF7ED", color: "#D97706", fontWeight: 600 }}>
                      ⚠ No Mentor Contact
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}

        {filtered.length === 0 && (
          <p style={{ textAlign: "center", color: "#8E8E93", fontSize: 13, padding: "24px 0" }}>
            No clients match this filter.
          </p>
        )}
      </div>
    </div>
  );
}