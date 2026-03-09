import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { AlertTriangle, Check, MessageSquare, FileText, User } from "lucide-react";

const ALERT_CONFIG = {
  missed_checkin_3_days:  { icon: "📅", label: "Missed Check-Ins",      bg: "#FFFBEB", border: "#FDE68A", text: "#92400E" },
  low_engagement:         { icon: "📉", label: "Low Engagement",         bg: "#FEF2F2", border: "#FECACA", text: "#DC2626" },
  low_mood_trend:         { icon: "😔", label: "Low Mood Trend",         bg: "#FEF2F2", border: "#FECACA", text: "#DC2626" },
  high_craving_trend:     { icon: "⚠️", label: "High Craving Trend",     bg: "#FEF2F2", border: "#FECACA", text: "#DC2626" },
  missed_meetings:        { icon: "🤝", label: "Missing Meetings",        bg: "#FFFBEB", border: "#FDE68A", text: "#92400E" },
  no_sponsor_contact:     { icon: "📵", label: "No Sponsor Contact",     bg: "#FFFBEB", border: "#FDE68A", text: "#92400E" },
  composite_high_risk:    { icon: "🔴", label: "High Risk",              bg: "#FEF2F2", border: "#FECACA", text: "#DC2626" },
  composite_medium_risk:  { icon: "🟡", label: "Medium Risk",            bg: "#FFFBEB", border: "#FDE68A", text: "#92400E" },
  rapid_mood_decline:     { icon: "📉", label: "Rapid Mood Decline",     bg: "#FEF2F2", border: "#FECACA", text: "#DC2626" },
};

export default function PortalAlerts({ activeAlerts, participants, onSelectClient, onRefresh }) {
  const [filter, setFilter] = useState("all");

  const clientMap = Object.fromEntries(participants.map(p => [p.participant_email, p]));

  const acknowledge = useMutation({
    mutationFn: (alertId) => base44.entities.EngagementAlert.update(alertId, { status: "acknowledged" }),
    onSuccess: () => onRefresh(),
  });

  const filtered = activeAlerts.filter(a => filter === "all" || a.risk_level === filter);

  return (
    <div style={{ padding: "28px 28px 40px", maxWidth: 880, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0F172A", marginBottom: 4 }}>Alerts</h1>
        <p style={{ color: "#64748B", fontSize: 14 }}>
          {activeAlerts.length} active alert{activeAlerts.length !== 1 ? "s" : ""} — people who may need your attention.
        </p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {["all", "critical", "high", "medium", "low"].map(level => {
          const count = level === "all" ? activeAlerts.length : activeAlerts.filter(a => a.risk_level === level).length;
          return (
            <button key={level} onClick={() => setFilter(level)}
              style={{
                border: `1px solid ${filter === level ? "#3B82F6" : "#E2E8F0"}`,
                background: filter === level ? "#EFF6FF" : "#FFF",
                color: filter === level ? "#3B82F6" : "#475569",
                borderRadius: 20, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer",
              }}>
              {level.charAt(0).toUpperCase() + level.slice(1)} {count > 0 && `(${count})`}
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.length === 0 && (
          <div style={{ background: "#FFF", border: "1px solid #E2E8F0", borderRadius: 12, padding: 48, textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>✅</div>
            <p style={{ color: "#0F172A", fontSize: 15, fontWeight: 600, marginBottom: 6 }}>No alerts right now.</p>
            <p style={{ color: "#94A3B8", fontSize: 13 }}>All assigned clients are in good standing.</p>
          </div>
        )}
        {filtered.map(alert => {
          const cfg = ALERT_CONFIG[alert.alert_type] || { icon: "⚠️", label: alert.alert_type, bg: "#FFFBEB", border: "#FDE68A", text: "#92400E" };
          const client = clientMap[alert.participant_email];
          return (
            <div key={alert.id} style={{ background: "#FFF", border: "1px solid #E2E8F0", borderRadius: 12, padding: "18px 20px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14, flexWrap: "wrap" }}>
                <div style={{ fontSize: 24, flexShrink: 0, lineHeight: 1, marginTop: 2 }}>{cfg.icon}</div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                    <p style={{ fontWeight: 700, fontSize: 15, color: "#0F172A" }}>
                      {client?.displayName || alert.participant_email}
                    </p>
                    <span style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.text, borderRadius: 20, padding: "2px 9px", fontSize: 11, fontWeight: 700 }}>
                      {cfg.label}
                    </span>
                  </div>
                  {alert.contributing_factors?.length > 0 && (
                    <p style={{ fontSize: 13, color: "#64748B", marginBottom: 4, lineHeight: 1.5 }}>
                      {alert.contributing_factors.join(" · ")}
                    </p>
                  )}
                  <p style={{ fontSize: 11, color: "#94A3B8" }}>
                    {alert.alert_date ? new Date(alert.alert_date).toLocaleDateString() : ""}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 8, flexShrink: 0, flexWrap: "wrap" }}>
                  {client && (
                    <button onClick={() => onSelectClient(client)}
                      style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, color: "#475569", cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                      <User className="w-3 h-3" /> View
                    </button>
                  )}
                  <button onClick={() => acknowledge.mutate(alert.id)} disabled={acknowledge.isPending}
                    style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, color: "#166534", cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                    <Check className="w-3 h-3" /> Reviewed
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}