import React from "react";
import { ChevronRight, Shield, MessageSquare, Calendar } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";

const RISK_CONFIG = {
  red:    { label: "High Risk", bg: "#FEF2F2", border: "#FECACA", text: "#DC2626", dot: "#EF4444" },
  yellow: { label: "Monitor",   bg: "#FFFBEB", border: "#FDE68A", text: "#92400E", dot: "#F59E0B" },
  green:  { label: "Stable",    bg: "#F0FDF4", border: "#BBF7D0", text: "#166534", dot: "#22C55E" },
};

function TriggerTag({ label, color }) {
  return (
    <span style={{ background: color + "20", color, borderRadius: 20, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>
      {label}
    </span>
  );
}

function ClientRiskCard({ m, counselorEmail, onSelectClient }) {
  const cfg = RISK_CONFIG[m.riskColor || "green"];

  const messageMutation = useMutation({
    mutationFn: async (msg) => {
      await base44.entities.CounselorMessage.create({
        facility_id: "aftercare",
        counselor_email: counselorEmail,
        participant_email: m.email,
        message: msg,
        message_type: "notification",
      });
    },
  });

  return (
    <div style={{
      background: "#FFF",
      border: `1px solid ${cfg.border}`,
      borderLeft: `4px solid ${cfg.dot}`,
      borderRadius: 12,
      padding: "16px",
    }}>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
            <p style={{ fontWeight: 700, fontSize: 14, color: "#1E1E1E" }}>{m.email}</p>
            <span style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.text, borderRadius: 20, padding: "2px 8px", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
              {cfg.label}
            </span>
          </div>

          {/* Key metrics */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 16px", fontSize: 12, color: "#5A5A5A" }}>
            {m.latestCraving !== null && (
              <span>
                🔥 Craving:&nbsp;
                <strong style={{ color: m.latestCraving >= 8 ? "#DC2626" : m.latestCraving >= 6 ? "#EA580C" : "#374151" }}>
                  {m.latestCraving}/10
                </strong>
              </span>
            )}
            {m.latestStress !== null && (
              <span>
                💭 Stress:&nbsp;
                <strong style={{ color: m.latestStress >= 8 ? "#DC2626" : m.latestStress >= 6 ? "#EA580C" : "#374151" }}>
                  {m.latestStress}/10
                </strong>
              </span>
            )}
            {m.avgMood !== null && <span>😊 Avg mood: <strong>{m.avgMood}/5</strong></span>}
            <span>📅 {m.lastCheckIn ? `${m.daysSinceCheckIn}d ago` : "Never checked in"}</span>
          </div>
        </div>
        <button
          onClick={() => onSelectClient(m)}
          style={{ background: "none", border: "none", cursor: "pointer", color: "#4A90E2", display: "flex", alignItems: "center", fontSize: 12, fontWeight: 600, flexShrink: 0 }}
        >
          View <ChevronRight style={{ width: 14, height: 14 }} />
        </button>
      </div>

      {/* Alert triggers */}
      {(m.relapseFlag || m.highCravingImmediate || m.moderateCravingPattern || m.moodDropPattern || m.isolationFlag || m.missedCheckIns) && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
          {m.relapseFlag           && <TriggerTag label="⚡ Relapse flag raised"     color="#DC2626" />}
          {m.highCravingImmediate  && <TriggerTag label={`🔥 Craving ${m.latestCraving}/10`} color="#EF4444" />}
          {m.moderateCravingPattern && <TriggerTag label="↑ Elevated cravings 3+ days" color="#EA580C" />}
          {m.moodDropPattern       && <TriggerTag label="↓ Low mood 3+ days"         color="#F59E0B" />}
          {m.isolationFlag         && <TriggerTag label="🚪 Isolation pattern"        color="#F59E0B" />}
          {m.missedCheckIns        && <TriggerTag label="📋 Missed check-ins"         color="#8E8E93" />}
        </div>
      )}

      {/* Meeting & sponsor info */}
      <div style={{ display: "flex", gap: 20, fontSize: 11, color: "#8E8E93", padding: "8px 0", borderTop: "1px solid #F3F4F6", marginBottom: 10 }}>
        <span>Meetings this week: <strong style={{ color: "#1E1E1E" }}>{m.weeklyMeetings}</strong></span>
        <span>Sponsor contacts: <strong style={{ color: "#1E1E1E" }}>{m.sponsorContacts}</strong></span>
        {m.sobrietyDays !== null && <span>🏅 <strong style={{ color: "#22C55E" }}>{m.sobrietyDays}d sober</strong></span>}
      </div>

      {/* Quick action buttons */}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={() => messageMutation.mutate(
            m.relapseFlag
              ? "Your counselor is here for you right now. Please reach out — we want to help you through this."
              : "Checking in with you. Please reach out if you need support today."
          )}
          disabled={messageMutation.isPending || messageMutation.isSuccess}
          style={{ flex: 1, background: messageMutation.isSuccess ? "#F0FDF4" : "#EBF3FD", border: "none", borderRadius: 8, padding: "8px 10px", fontSize: 12, fontWeight: 600, color: messageMutation.isSuccess ? "#16A34A" : "#4A90E2", cursor: messageMutation.isPending ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}
        >
          <MessageSquare style={{ width: 13, height: 13 }} />
          {messageMutation.isSuccess ? "Sent ✓" : "Message"}
        </button>
        <button
          onClick={() => messageMutation.mutate("Can we schedule a check-in call? Please reply with your availability — I'd like to connect with you this week.")}
          style={{ flex: 1, background: "#F5F3FF", border: "none", borderRadius: 8, padding: "8px 10px", fontSize: 12, fontWeight: 600, color: "#7C3AED", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}
        >
          <Calendar style={{ width: 13, height: 13 }} />
          Schedule
        </button>
        <button
          onClick={() => onSelectClient(m)}
          style={{ flex: 1, background: "#F0F0F3", border: "none", borderRadius: 8, padding: "8px 10px", fontSize: 12, fontWeight: 600, color: "#5A5A5A", cursor: "pointer" }}
        >
          History
        </button>
      </div>
    </div>
  );
}

export default function CravingAlertPanel({ clientMetrics, counselorEmail, onSelectClient }) {
  const sorted = [...clientMetrics].sort((a, b) => {
    const order = { red: 0, yellow: 1, green: 2 };
    return (order[a.riskColor || "green"] ?? 2) - (order[b.riskColor || "green"] ?? 2);
  });

  const redCount    = sorted.filter(m => m.riskColor === "red").length;
  const yellowCount = sorted.filter(m => m.riskColor === "yellow").length;
  const greenCount  = sorted.filter(m => m.riskColor === "green").length;

  if (sorted.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "64px 0", color: "#8E8E93" }}>
        <Shield style={{ width: 40, height: 40, margin: "0 auto 12px", opacity: 0.3 }} />
        <p style={{ fontSize: 14, fontWeight: 600 }}>No clients to monitor</p>
        <p style={{ fontSize: 12, marginTop: 4 }}>Clients will appear here once assigned to you</p>
      </div>
    );
  }

  return (
    <div>
      {/* Summary bar */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
        {[
          { label: "High Risk", count: redCount,    color: "#EF4444", bg: "#FEF2F2", sub: "Immediate attention" },
          { label: "Monitor",   count: yellowCount, color: "#F59E0B", bg: "#FFFBEB", sub: "Review recommended" },
          { label: "Stable",    count: greenCount,  color: "#22C55E", bg: "#F0FDF4", sub: "On track" },
        ].map(item => (
          <div key={item.label} style={{ background: item.bg, borderRadius: 10, padding: "14px 10px", textAlign: "center" }}>
            <p style={{ fontSize: 26, fontWeight: 800, color: item.color, lineHeight: 1 }}>{item.count}</p>
            <p style={{ fontSize: 11, color: item.color, marginTop: 4, fontWeight: 700 }}>{item.label}</p>
            <p style={{ fontSize: 10, color: item.color, opacity: 0.7, marginTop: 2 }}>{item.sub}</p>
          </div>
        ))}
      </div>

      {/* Privacy note */}
      <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 12, color: "#1D4ED8" }}>
        ℹ️ Alerts are supportive — users are informed that this system helps counselors reach out when they may be struggling.
      </div>

      {/* Client cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {sorted.map(m => (
          <ClientRiskCard
            key={m.email}
            m={m}
            counselorEmail={counselorEmail}
            onSelectClient={onSelectClient}
          />
        ))}
      </div>
    </div>
  );
}