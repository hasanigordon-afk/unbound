import React from "react";
import { AlertTriangle, ChevronRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const ALERT_RULES = [
  { key: "missedCheckIns", label: "Missed 3+ check-ins", severity: "high", color: "#EF4444" },
  { key: "highCravings", label: "High craving intensity", severity: "high", color: "#EF4444" },
  { key: "noMeetings", label: "No meetings this week", severity: "medium", color: "#F59E0B" },
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
    (m) => m.missedCheckIns || m.highCravings || m.noMeetings || m.flagged
  );

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

      {alertedClients.map((m) => (
        <div
          key={m.email}
          className="p-4 rounded-xl"
          style={{ background: "#FFF", border: "1px solid #FCA5A5", borderRadius: "12px" }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-sm" style={{ color: "#1E1E1E" }}>{m.email}</p>
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

          {/* Actions */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() =>
                messageMutation.mutate({
                  toEmail: m.email,
                  content: "Hi, your counselor is checking in. Please complete your daily check-in and reach out if you need support.",
                })
              }
              className="flex-1 text-xs font-medium py-2 px-3 rounded-lg text-center"
              style={{ background: "#EBF3FD", color: "#4A90E2" }}
            >
              📨 Send Check-In Message
            </button>
            <button
              onClick={() =>
                flagMutation.mutate({ email: m.email, alertType: "composite_high_risk" })
              }
              className="flex-1 text-xs font-medium py-2 px-3 rounded-lg text-center"
              style={{ background: "#FEF2F2", color: "#EF4444" }}
            >
              🚩 Flag for Concern
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}