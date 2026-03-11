import React from "react";
import { ChevronRight, AlertTriangle } from "lucide-react";

const SCORE_META = (score) =>
  score >= 80
    ? { label: "Stable",    bg: "#F0FDF4", border: "#86EFAC", text: "#16A34A", bar: "#22C55E" }
    : score >= 50
    ? { label: "At Risk",   bg: "#FFFBEB", border: "#FDE68A", text: "#D97706", bar: "#F59E0B" }
    : { label: "High Risk", bg: "#FEF2F2", border: "#FCA5A5", text: "#DC2626", bar: "#EF4444" };

function ScoreBar({ score, color }) {
  return (
    <div style={{ height: 5, borderRadius: 3, background: "#F0F0F3", overflow: "hidden" }}>
      <div style={{ width: `${score}%`, height: "100%", background: color, borderRadius: 3 }} />
    </div>
  );
}

function Pill({ done, label }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20,
      background: done ? "#F0FDF4" : "#FEF2F2",
      color: done ? "#16A34A" : "#DC2626",
    }}>
      {done ? "✓" : "✗"} {label}
    </span>
  );
}

export default function AftercareClientList({ clientMetrics, onSelectClient }) {
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

  return (
    <div className="flex flex-col gap-3">
      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-2 mb-1">
        {[
          { label: "Stable",    count: clientMetrics.filter(m => m.stabilityScore >= 80).length, color: "#16A34A", bg: "#F0FDF4" },
          { label: "At Risk",   count: clientMetrics.filter(m => m.stabilityScore >= 50 && m.stabilityScore < 80).length, color: "#D97706", bg: "#FFFBEB" },
          { label: "High Risk", count: clientMetrics.filter(m => m.stabilityScore < 50).length, color: "#DC2626", bg: "#FEF2F2" },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.color}30`, borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
            <p style={{ fontSize: 22, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.count}</p>
            <p style={{ fontSize: 11, color: "#8E8E93", marginTop: 2 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {sorted.map((m) => {
        const meta = SCORE_META(m.stabilityScore);
        const isEmergency = m.relapseFlag || m.highCravingImmediate;
        const hasAlert = isEmergency || m.missedCheckIns || m.noMeetings || m.isolationFlag || m.stabilityScore < 50;
        const name = m.profile.full_name || m.email;

        // Housing / employment from profile (may not exist)
        const hasHousing    = !!m.profile.housing_status && m.profile.housing_status !== "none" && m.profile.housing_status !== "unstable";
        const hasEmployment = !!m.profile.employment_status && m.profile.employment_status !== "none" && m.profile.employment_status !== "unemployed";

        return (
          <button
            key={m.email}
            onClick={() => onSelectClient(m)}
            className="w-full text-left"
            style={{
              background: "#FFF",
              border: `1px solid ${hasAlert ? meta.border : "#E5E7EB"}`,
              borderLeft: `4px solid ${meta.bar}`,
              borderRadius: 12,
              padding: "16px",
            }}
          >
            {/* Row 1: Name + Score badge */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 min-w-0">
                {isEmergency && <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: "#EF4444" }} />}
                <p className="font-semibold text-sm truncate" style={{ color: "#1E1E1E" }}>{name}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div style={{
                  background: meta.bg, border: `1px solid ${meta.border}`,
                  borderRadius: 20, padding: "3px 10px",
                }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: meta.text }}>
                    {m.stabilityScore} · {meta.label}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4" style={{ color: "#D1D1D6" }} />
              </div>
            </div>

            {/* Score bar */}
            <ScoreBar score={m.stabilityScore} color={meta.bar} />

            {/* Row 2: Key metrics */}
            <div className="grid grid-cols-4 gap-1.5 mt-3 mb-3">
              <div className="text-center p-2 rounded-lg" style={{ background: "#F7F7F8" }}>
                <p className="text-base font-bold" style={{ color: m.streak > 0 ? "#F59E0B" : "#DC2626" }}>
                  {m.streak > 0 ? `🔥${m.streak}` : "—"}
                </p>
                <p className="text-xs" style={{ color: "#8E8E93" }}>Streak</p>
              </div>
              <div className="text-center p-2 rounded-lg" style={{ background: "#F7F7F8" }}>
                <p className="text-base font-bold" style={{ color: m.weeklyMeetings > 0 ? "#22C55E" : "#DC2626" }}>
                  {m.weeklyMeetings}
                </p>
                <p className="text-xs" style={{ color: "#8E8E93" }}>Meetings</p>
              </div>
              <div className="text-center p-2 rounded-lg" style={{ background: "#F7F7F8" }}>
                <p className="text-base font-bold" style={{ color: m.sponsorContacts > 0 ? "#22C55E" : "#DC2626" }}>
                  {m.sponsorContacts}
                </p>
                <p className="text-xs" style={{ color: "#8E8E93" }}>Sponsor</p>
              </div>
              <div className="text-center p-2 rounded-lg" style={{ background: "#F7F7F8" }}>
                <p className="text-base font-bold" style={{ color: m.daysSinceCheckIn <= 1 ? "#22C55E" : m.daysSinceCheckIn <= 3 ? "#F59E0B" : "#DC2626" }}>
                  {m.lastCheckIn ? `${m.daysSinceCheckIn}d` : "—"}
                </p>
                <p className="text-xs" style={{ color: "#8E8E93" }}>Last CI</p>
              </div>
            </div>

            {/* Row 3: Housing + Employment pills */}
            <div className="flex gap-1.5 flex-wrap">
              <Pill done={hasHousing}    label="Housing" />
              <Pill done={hasEmployment} label="Employment" />
              <Pill done={m.sponsorContacts > 0} label="Mentor Contact" />
            </div>

            {/* Alert tags */}
            {hasAlert && (
              <div className="flex gap-1.5 flex-wrap mt-2.5 pt-2.5" style={{ borderTop: `1px solid ${meta.border}` }}>
                {isEmergency        && <Tag color="#DC2626">⚡ Relapse risk</Tag>}
                {m.missedCheckIns   && <Tag color="#EF4444">⚠ Missed check-ins</Tag>}
                {m.noMeetings       && <Tag color="#F59E0B">No meetings this week</Tag>}
                {m.isolationFlag    && <Tag color="#F59E0B">Isolation pattern</Tag>}
                {m.stabilityScore < 50 && !isEmergency && <Tag color="#DC2626">Score dropped below 50</Tag>}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

function Tag({ color, children }) {
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 20, background: color + "18", color }}>
      {children}
    </span>
  );
}