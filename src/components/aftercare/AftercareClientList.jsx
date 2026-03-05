import React from "react";
import { AlertTriangle, ChevronRight } from "lucide-react";
import { engagementLevelColor, engagementLevelBg } from "@/components/aftercare/engagementScore";

function EngagementBar({ score }) {
  const color = score >= 70 ? "#22C55E" : score >= 40 ? "#F59E0B" : "#EF4444";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full" style={{ background: "#F0F0F3" }}>
        <div className="h-1.5 rounded-full" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="text-xs font-semibold w-8 text-right" style={{ color }}>{score}</span>
    </div>
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

  return (
    <div className="flex flex-col gap-3">
      {clientMetrics.map((m) => {
        const hasAlert = m.missedCheckIns || m.highCravings || m.noMeetings || m.flagged;
        return (
          <button
            key={m.email}
            onClick={() => onSelectClient(m)}
            className="w-full text-left p-4 rounded-xl"
            style={{ background: "#FFF", border: `1px solid ${hasAlert ? "#FCA5A5" : "#E5E7EB"}`, borderRadius: "12px" }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-sm truncate" style={{ color: "#1E1E1E" }}>
                    {m.profile.participant_email}
                  </p>
                  {hasAlert && (
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#EF4444" }} />
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs mb-3" style={{ color: "#8E8E93" }}>
                  <span>
                    {m.lastCheckIn
                      ? `Last check-in: ${m.daysSinceCheckIn}d ago`
                      : "No check-ins yet"}
                  </span>
                  {m.sobrietyDays !== null && (
                    <span style={{ color: "#22C55E" }}>🏅 {m.sobrietyDays}d sober</span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                  <div className="text-center p-2 rounded-lg" style={{ background: "#F0F4FA" }}>
                    <p className="font-semibold" style={{ color: "#4A90E2" }}>{m.weeklyMeetings}</p>
                    <p style={{ color: "#8E8E93" }}>Meetings</p>
                  </div>
                  <div className="text-center p-2 rounded-lg" style={{ background: "#F0FDF4" }}>
                    <p className="font-semibold" style={{ color: "#16A34A" }}>{m.sponsorContacts}</p>
                    <p style={{ color: "#8E8E93" }}>Sponsor</p>
                  </div>
                  <div className="text-center p-2 rounded-lg" style={{ background: "#FFF7ED" }}>
                    <p className="font-semibold" style={{ color: "#D97706" }}>{m.avgMood ?? "—"}</p>
                    <p style={{ color: "#8E8E93" }}>Avg Mood</p>
                  </div>
                </div>
                <EngagementBar score={m.engagementScore} />
              </div>
              <ChevronRight className="w-4 h-4 flex-shrink-0 mt-1" style={{ color: "#D1D1D6" }} />
            </div>

            {/* Alert tags */}
            {hasAlert && (
              <div className="flex gap-1.5 flex-wrap mt-3 pt-3" style={{ borderTop: "1px solid #FEE2E2" }}>
                {m.missedCheckIns && (
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#FEF2F2", color: "#EF4444" }}>
                    ⚠ Missed 3+ check-ins
                  </span>
                )}
                {m.highCravings && (
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#FEF2F2", color: "#EF4444" }}>
                    ⚠ High cravings
                  </span>
                )}
                {m.noMeetings && (
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#FFF7ED", color: "#D97706" }}>
                    ⚠ No meetings this week
                  </span>
                )}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}