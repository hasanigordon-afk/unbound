import React from "react";
import { AlertTriangle, ChevronRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const ALERT_RULES = [
  { key: "relapseFlag",            label: "⚡ Relapse risk flag raised",      color: "#DC2626" },
  { key: "highCravingImmediate",   label: "🔥 High craving intensity (8+/10)", color: "#EF4444" },
  { key: "missedCheckIns",         label: "📋 Missed 3+ check-ins",           color: "#EF4444" },
  { key: "moderateCravingPattern", label: "↑ Elevated cravings 3+ days",      color: "#EA580C" },
  { key: "moodDropPattern",        label: "↓ Low mood for 3+ days",           color: "#F59E0B" },
  { key: "isolationFlag",          label: "🚪 Isolation pattern detected",     color: "#F59E0B" },
  { key: "highCravings",           label: "⚠ High avg craving intensity",     color: "#F59E0B" },
  { key: "noMeetings",             label: "No meetings this week",             color: "#8E8E93" },
];

export default function AftercareAlerts({ clientMetrics, counselorEmail, onSelectClient }) {
  const queryClient = useQueryClient();

  const flagMutation = useMutation({
    mutationFn: async ({ email, alertType }) => {
      await base44.entities.EngagementAlert.create({
        participant_email: email,
        alert_type: alertType,
        alert_date: new Date().toISOString().split("T")[0],
        risk_score: 75,
        risk_level: "high",
        status: "active",
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["aftercare-alerts"] }),
  });

  const messageMutation = useMutation({
    mutationFn: async ({ toEmail, content }) => {
      await base44.entities.CounselorMessage.create({
        facility_id: "aftercare",
        counselor_email: counselorEmail,
        participant_email: toEmail,
        message: content,
        message_type: "notification",
      });
    },
  });

  const alertedClients = clientMetrics.filter(
    (m) =>
      m.missedCheckIns || m.highCravings || m.noMeetings || m.flagged ||
      m.relapseFlag || m.highCravingImmediate || m.moderateCravingPattern ||
      m.moodDropPattern || m.isolationFlag
  ).sort((a, b) => {
    // Sort: relapse flag first, then high craving, then others
    if (a.relapseFlag && !b.relapseFlag) return -1;
    if (!a.relapseFlag && b.relapseFlag) return 1;
    if (a.highCravingImmediate && !b.highCravingImmediate) return -1;
    if (!a.highCravingImmediate && b.highCravingImmediate) return 1;
    return 0;
  });

  if (alertedClients.length === 0) {
    return (
      <div className="text-center py-16" style={{ color: "#8E8E93" }}>
        <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ background: "#F0FDF4" }}>
          <AlertTriangle className="w-6 h-6" style={{ color: "#22C55E" }} />
        </div>
        <p className="text-sm font-medium">No active alerts</p>
        <p className="text-xs mt-1">All clients are on track</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#8E8E93" }}>
        {alertedClients.length} client{alertedClients.length !== 1 ? "s" : ""} need attention
      </p>

      {alertedClients.map((m) => {
        const isEmergency = m.relapseFlag || m.highCravingImmediate;
        return (
          <div
            key={m.email}
            style={{
              background: "#FFF",
              border: `1px solid ${isEmergency ? "#FCA5A5" : "#FDE68A"}`,
              borderLeft: `4px solid ${isEmergency ? "#EF4444" : "#F59E0B"}`,
              borderRadius: "12px",
              padding: "16px",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-semibold text-sm" style={{ color: "#1E1E1E" }}>{m.email}</p>
                {m.latestCraving !== null && (
                  <p className="text-xs mt-0.5" style={{ color: "#8E8E93" }}>
                    Latest craving: <strong style={{ color: m.latestCraving >= 8 ? "#DC2626" : "#5A5A5A" }}>{m.latestCraving}/10</strong>
                    {m.avgMood !== null && <> · Avg mood: <strong>{m.avgMood}/5</strong></>}
                  </p>
                )}
              </div>
              <button
                onClick={() => onSelectClient(m)}
                className="text-xs flex items-center gap-1"
                style={{ color: "#4A90E2" }}
              >
                View <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Alert tags */}
            <div className="flex flex-col gap-1.5 mb-4">
              {ALERT_RULES.map(({ key, label, color }) =>
                m[key] ? (
                  <div
                    key={key}
                    className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg"
                    style={{ background: color + "15", color }}
                  >
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                    {label}
                  </div>
                ) : null
              )}
            </div>

            {/* Engagement summary */}
            <div className="flex gap-3 text-xs mb-4 flex-wrap" style={{ color: "#8E8E93" }}>
              <span>Meetings this week: <strong style={{ color: "#1E1E1E" }}>{m.weeklyMeetings}</strong></span>
              <span>Sponsor contacts: <strong style={{ color: "#1E1E1E" }}>{m.sponsorContacts}</strong></span>
              <span>Last check-in: <strong style={{ color: "#1E1E1E" }}>{m.lastCheckIn ? `${m.daysSinceCheckIn}d ago` : "Never"}</strong></span>
            </div>

            {/* Actions */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() =>
                  messageMutation.mutate({
                    toEmail: m.email,
                    content: m.relapseFlag
                      ? "Your counselor is here for you right now. Please reach out — we want to support you through this."
                      : "Hi, your counselor is checking in. Please complete your daily check-in and reach out if you need support.",
                  })
                }
                className="flex-1 text-xs font-medium py-2 px-3 rounded-lg text-center"
                style={{ background: "#EBF3FD", color: "#4A90E2" }}
              >
                💬 Send Message
              </button>
              <button
                onClick={() =>
                  messageMutation.mutate({
                    toEmail: m.email,
                    content: "Can we schedule a check-in call? Please reply with your availability — I'd like to connect with you this week.",
                  })
                }
                className="flex-1 text-xs font-medium py-2 px-3 rounded-lg text-center"
                style={{ background: "#F5F3FF", color: "#7C3AED" }}
              >
                📅 Schedule Check-In
              </button>
              <button
                onClick={() => flagMutation.mutate({ email: m.email, alertType: isEmergency ? "composite_high_risk" : "composite_medium_risk" })}
                className="flex-1 text-xs font-medium py-2 px-3 rounded-lg text-center"
                style={{ background: "#FEF2F2", color: "#EF4444" }}
              >
                🚩 Flag
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}