import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, AlertCircle, CheckCircle, RefreshCw, ChevronDown, ChevronUp, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

const RISK_CONFIG = {
  critical: { label: "Critical", color: "#EF4444", bg: "#FEF2F2", border: "#FCA5A5", textColor: "#DC2626" },
  high:     { label: "High",     color: "#F97316", bg: "#FFF7ED", border: "#FED7AA", textColor: "#EA580C" },
  medium:   { label: "Medium",   color: "#F59E0B", bg: "#FFFBEB", border: "#FDE68A", textColor: "#D97706" },
  low:      { label: "Low",      color: "#22C55E", bg: "#F0FDF4", border: "#86EFAC", textColor: "#16A34A" },
};

const ALERT_LABELS = {
  composite_high_risk:   "Composite High Risk",
  composite_medium_risk: "Composite Risk",
  rapid_mood_decline:    "Rapid Mood Decline",
  high_craving_trend:    "High Craving Trend",
  missed_meetings:       "Missed Meetings",
  no_sponsor_contact:    "No Sponsor Contact",
  missed_checkin_3_days: "Missed Check-Ins",
  low_engagement:        "Low Engagement",
  low_mood_trend:        "Low Mood",
};

function RiskBadge({ level }) {
  const cfg = RISK_CONFIG[level] || RISK_CONFIG.low;
  return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: cfg.bg, color: cfg.textColor, border: `1px solid ${cfg.border}` }}>
      {cfg.label}
    </span>
  );
}

function AlertCard({ alert, onAcknowledge }) {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState("");
  const cfg = RISK_CONFIG[alert.risk_level] || RISK_CONFIG.medium;

  return (
    <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${cfg.border}`, background: cfg.bg }}>
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center" style={{ background: cfg.color }}>
            <AlertTriangle className="w-4 h-4 text-white" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate" style={{ color: "#1E1E1E" }}>{alert.participant_email}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <RiskBadge level={alert.risk_level} />
              <span className="text-xs" style={{ color: "#5A5A5A" }}>{ALERT_LABELS[alert.alert_type] || alert.alert_type}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-lg font-bold" style={{ color: cfg.textColor }}>{alert.risk_score}</span>
          <button onClick={() => setExpanded(!expanded)} style={{ color: "#8E8E93" }}>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t" style={{ borderColor: cfg.border }}>
          {/* Metrics */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            {alert.checkin_rate_7d != null && (
              <div className="text-xs p-2 rounded" style={{ background: "rgba(255,255,255,0.6)" }}>
                <p style={{ color: "#8E8E93" }}>Check-in Rate</p>
                <p className="font-semibold" style={{ color: "#1E1E1E" }}>{Math.round(alert.checkin_rate_7d * 100)}%</p>
              </div>
            )}
            {alert.mood_avg_7d != null && (
              <div className="text-xs p-2 rounded" style={{ background: "rgba(255,255,255,0.6)" }}>
                <p style={{ color: "#8E8E93" }}>Avg Mood</p>
                <p className="font-semibold" style={{ color: "#1E1E1E" }}>{alert.mood_avg_7d.toFixed(1)}/5</p>
              </div>
            )}
            {alert.craving_avg_7d != null && (
              <div className="text-xs p-2 rounded" style={{ background: "rgba(255,255,255,0.6)" }}>
                <p style={{ color: "#8E8E93" }}>Avg Craving</p>
                <p className="font-semibold" style={{ color: "#1E1E1E" }}>{alert.craving_avg_7d.toFixed(1)}/5</p>
              </div>
            )}
            {alert.meeting_rate_7d != null && (
              <div className="text-xs p-2 rounded" style={{ background: "rgba(255,255,255,0.6)" }}>
                <p style={{ color: "#8E8E93" }}>Meeting Rate</p>
                <p className="font-semibold" style={{ color: "#1E1E1E" }}>{Math.round(alert.meeting_rate_7d * 100)}%</p>
              </div>
            )}
            {alert.sponsor_contact_rate_7d != null && (
              <div className="text-xs p-2 rounded" style={{ background: "rgba(255,255,255,0.6)" }}>
                <p style={{ color: "#8E8E93" }}>Sponsor Contact</p>
                <p className="font-semibold" style={{ color: "#1E1E1E" }}>{Math.round(alert.sponsor_contact_rate_7d * 100)}%</p>
              </div>
            )}
          </div>

          {/* Contributing Factors */}
          {alert.contributing_factors?.length > 0 && (
            <div>
              <p className="text-xs font-semibold mb-1.5" style={{ color: "#5A5A5A" }}>Contributing Factors</p>
              <ul className="space-y-1">
                {alert.contributing_factors.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs" style={{ color: "#1E1E1E" }}>
                    <span className="mt-0.5 flex-shrink-0">•</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Acknowledge */}
          {alert.status === "active" && (
            <div className="space-y-2">
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Add a note before acknowledging..."
                rows={2}
                className="w-full text-xs p-2 rounded border resize-none outline-none"
                style={{ borderColor: cfg.border, background: "rgba(255,255,255,0.7)" }}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => onAcknowledge(alert.id, "acknowledged", notes)}
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded"
                  style={{ background: "#4A90E2", color: "#FFF" }}
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Acknowledge
                </button>
                <button
                  onClick={() => onAcknowledge(alert.id, "resolved", notes)}
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded"
                  style={{ background: "#22C55E", color: "#FFF" }}
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Resolve
                </button>
              </div>
            </div>
          )}

          {alert.status !== "active" && (
            <div className="flex items-center gap-2 text-xs" style={{ color: "#22C55E" }}>
              <CheckCircle className="w-3.5 h-3.5" />
              {alert.status === "resolved" ? "Resolved" : "Acknowledged"}
              {alert.acknowledged_by && <span style={{ color: "#8E8E93" }}>by {alert.acknowledged_by}</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function RelapseRiskPanel({ facilityId, participantEmail, compact = false }) {
  const [filter, setFilter] = useState("active");
  const [isRunning, setIsRunning] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ["engagement-alerts", facilityId, participantEmail, filter],
    queryFn: async () => {
      const q = {};
      if (participantEmail) q.participant_email = participantEmail;
      if (facilityId) q.facility_id = facilityId;
      if (filter !== "all") q.status = filter;
      return base44.entities.EngagementAlert.filter(q, "-alert_date", 100);
    },
    refetchInterval: 60000,
  });

  const acknowledgeAlert = async (alertId, status, notes) => {
    await base44.entities.EngagementAlert.update(alertId, {
      status,
      acknowledged_by: user?.email,
      notes,
    });
    queryClient.invalidateQueries({ queryKey: ["engagement-alerts"] });
  };

  const runAnalysis = async () => {
    setIsRunning(true);
    const payload = {};
    if (facilityId) payload.facility_id = facilityId;
    if (participantEmail) payload.participant_email = participantEmail;
    await base44.functions.invoke("analyzeRelapseRisk", payload);
    queryClient.invalidateQueries({ queryKey: ["engagement-alerts"] });
    setIsRunning(false);
  };

  const criticalCount = alerts.filter(a => a.risk_level === "critical" && a.status === "active").length;
  const highCount = alerts.filter(a => a.risk_level === "high" && a.status === "active").length;

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-base" style={{ color: "#1E1E1E" }}>
            {compact ? "Risk Alerts" : "Relapse Risk Detection"}
          </h3>
          {(criticalCount > 0 || highCount > 0) && (
            <p className="text-xs mt-0.5" style={{ color: "#EF4444" }}>
              {criticalCount > 0 && `${criticalCount} critical`}
              {criticalCount > 0 && highCount > 0 && ", "}
              {highCount > 0 && `${highCount} high risk`}
              {" "}require attention
            </p>
          )}
        </div>
        <button
          onClick={runAnalysis}
          disabled={isRunning}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded"
          style={{ background: "#EBF3FD", color: "#4A90E2", border: "1px solid #BFDBFE", opacity: isRunning ? 0.6 : 1 }}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? "animate-spin" : ""}`} />
          {isRunning ? "Analyzing..." : "Run Analysis"}
        </button>
      </div>

      {/* Summary badges */}
      {!compact && (
        <div className="grid grid-cols-4 gap-2">
          {["critical", "high", "medium", "low"].map(level => {
            const count = alerts.filter(a => a.risk_level === level).length;
            const cfg = RISK_CONFIG[level];
            return (
              <div key={level} className="p-3 rounded-lg text-center" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                <p className="text-xl font-bold" style={{ color: cfg.textColor }}>{count}</p>
                <p className="text-xs font-medium mt-0.5" style={{ color: cfg.textColor }}>{cfg.label}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 p-1 rounded-lg" style={{ background: "#F0F0F3" }}>
        {["active", "acknowledged", "resolved", "all"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="flex-1 text-xs font-medium py-1.5 rounded-md capitalize"
            style={{
              background: filter === f ? "#FFFFFF" : "transparent",
              color: filter === f ? "#1E1E1E" : "#8E8E93",
              boxShadow: filter === f ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Alert list */}
      {isLoading ? (
        <div className="py-8 text-center text-sm" style={{ color: "#8E8E93" }}>Loading alerts...</div>
      ) : alerts.length === 0 ? (
        <div className="py-8 text-center">
          <CheckCircle className="w-8 h-8 mx-auto mb-2" style={{ color: "#22C55E" }} strokeWidth={1.5} />
          <p className="text-sm font-medium" style={{ color: "#1E1E1E" }}>No {filter !== "all" ? filter : ""} alerts</p>
          <p className="text-xs mt-1" style={{ color: "#8E8E93" }}>Run analysis to check for new risks</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {alerts.map(alert => (
            <AlertCard key={alert.id} alert={alert} onAcknowledge={acknowledgeAlert} />
          ))}
        </div>
      )}
    </div>
  );
}