import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import {
  AlertTriangle, Activity, MessageSquare, ChevronDown, ChevronRight,
  CheckCircle, TrendingDown, Shield
} from "lucide-react";

const RISK_CONFIG = {
  critical: { label: "Emergency", bg: "#FEE2E2", border: "#FCA5A5", text: "#DC2626", dot: "#DC2626", icon: AlertTriangle },
  high:     { label: "High Risk",  bg: "#FEF2F2", border: "#FCA5A5", text: "#EF4444", dot: "#EF4444", icon: AlertTriangle },
  moderate: { label: "Monitor",   bg: "#FFFBEB", border: "#FCD34D", text: "#D97706", dot: "#F59E0B", icon: TrendingDown  },
  stable:   { label: "Stable",    bg: "#F0FDF4", border: "#86EFAC", text: "#16A34A", dot: "#22C55E", icon: CheckCircle   },
};

function computeRisk(participant, allCheckIns, activeAlerts) {
  const email = participant.participant_email;
  const mine = allCheckIns
    .filter(c => c.participant_email === email)
    .sort((a, b) => new Date(b.check_in_date) - new Date(a.check_in_date));

  const today = new Date().toISOString().split("T")[0];
  const todayCI = mine.find(c => c.check_in_date === today);
  const last3 = mine.slice(0, 3);
  const last5 = mine.slice(0, 5);
  const last7 = mine.slice(0, 7);

  const triggers = [];
  let riskLevel = "stable";

  if (todayCI?.relapse_risk_flag) {
    triggers.push("🚨 Relapse risk flagged by user");
    riskLevel = "critical";
  }
  if (todayCI?.craving_intensity >= 8) {
    triggers.push(`Craving: ${todayCI.craving_intensity}/10 today`);
    if (riskLevel !== "critical") riskLevel = "high";
  }
  if (last3.length >= 3 && last3.every(c => (c.craving_intensity || 0) > 6)) {
    triggers.push("Elevated craving 3+ days");
    if (!["critical", "high"].includes(riskLevel)) riskLevel = "moderate";
  }
  if (last3.length >= 3 && last3.every(c => c.mood_rating != null && c.mood_rating <= 2)) {
    triggers.push("Low mood 3+ days");
    if (!["critical", "high"].includes(riskLevel)) riskLevel = "moderate";
  }
  if (last5.length >= 5 && last5.every(c => !c.attended_meeting)) {
    triggers.push("No meetings 5+ days");
    if (!["critical", "high", "moderate"].includes(riskLevel)) riskLevel = "moderate";
  }
  if (last5.length >= 5 && last5.every(c => !c.connected_with_sponsor)) {
    triggers.push("No sponsor contact 5+ days");
    if (!["critical", "high", "moderate"].includes(riskLevel)) riskLevel = "moderate";
  }
  if (activeAlerts.some(a => a.participant_email === email && a.status === "active")) {
    if (riskLevel === "stable") riskLevel = "moderate";
  }

  const avgCraving = last7.length ? (last7.reduce((s, c) => s + (c.craving_intensity || 0), 0) / last7.length).toFixed(1) : "—";
  const avgMood = last7.length ? (last7.reduce((s, c) => s + (c.mood_rating || 3), 0) / last7.length).toFixed(1) : "—";
  const daysSince = mine[0] ? Math.floor((new Date() - new Date(mine[0].check_in_date)) / 86400000) : 99;

  return { riskLevel, triggers, avgCraving, avgMood, daysSince, recentCheckIns: last7 };
}

function ClientRiskCard({ participant, risk, counselorEmail, facilityId, onSelectClient }) {
  const [expanded, setExpanded] = useState(false);
  const [message, setMessage] = useState("");
  const cfg = RISK_CONFIG[risk.riskLevel] || RISK_CONFIG.stable;
  const Icon = cfg.icon;

  const sendMessageMutation = useMutation({
    mutationFn: (msg) => base44.entities.CounselorMessage.create({
      facility_id: facilityId,
      counselor_email: counselorEmail,
      participant_email: participant.participant_email,
      message: msg,
      message_type: "notification",
    }),
    onSuccess: () => setMessage(""),
  });

  return (
    <div style={{ background: "#FFF", border: `1px solid ${cfg.border}`, borderRadius: 14, overflow: "hidden" }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{ width: "100%", padding: "16px 20px", textAlign: "left", background: "none", border: "none", cursor: "pointer" }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: cfg.dot, flexShrink: 0, marginTop: 5 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
              <p style={{ fontWeight: 700, fontSize: 14, color: "#0F172A" }}>{participant.displayName}</p>
              <span style={{ background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}`, borderRadius: 20, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>
                {cfg.label}
              </span>
            </div>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: "#64748B" }}>
                Craving avg: <strong style={{ color: parseFloat(risk.avgCraving) >= 7 ? "#EF4444" : "#0F172A" }}>{risk.avgCraving}/10</strong>
              </span>
              <span style={{ fontSize: 12, color: "#64748B" }}>Mood avg: <strong>{risk.avgMood}/5</strong></span>
              <span style={{ fontSize: 12, color: "#64748B" }}>
                Last check-in: <strong>{risk.daysSince === 99 ? "Never" : `${risk.daysSince}d ago`}</strong>
              </span>
            </div>
            {risk.triggers.length > 0 && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                {risk.triggers.map((t, i) => (
                  <span key={i} style={{ background: cfg.bg, color: cfg.text, borderRadius: 20, padding: "2px 8px", fontSize: 11 }}>{t}</span>
                ))}
              </div>
            )}
          </div>
          {expanded
            ? <ChevronDown className="w-4 h-4 flex-shrink-0 mt-1" style={{ color: "#94A3B8" }} />
            : <ChevronRight className="w-4 h-4 flex-shrink-0 mt-1" style={{ color: "#94A3B8" }} />
          }
        </div>
      </button>

      {expanded && (
        <div style={{ borderTop: "1px solid #F1F5F9", padding: "16px 20px", background: "#FAFAFA" }}>
          {/* Craving sparkline */}
          {risk.recentCheckIns.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>
                Craving Intensity — Last 7 Check-Ins
              </p>
              <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 48 }}>
                {risk.recentCheckIns.map((ci, i) => {
                  const val = ci.craving_intensity || 0;
                  const pct = (val / 10) * 100;
                  const color = val >= 8 ? "#EF4444" : val >= 6 ? "#F59E0B" : "#22C55E";
                  return (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color }}>{val}</span>
                      <div style={{ width: "100%", background: "#E2E8F0", borderRadius: 4, height: 32, display: "flex", alignItems: "flex-end", overflow: "hidden" }}>
                        <div style={{ width: "100%", height: `${pct}%`, background: color, borderRadius: 4, minHeight: 3 }} />
                      </div>
                      <span style={{ fontSize: 9, color: "#94A3B8" }}>
                        {new Date(ci.check_in_date).toLocaleDateString("en-US", { weekday: "short" }).charAt(0)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <p style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 }}>
            Quick Actions
          </p>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <button
              onClick={() => onSelectClient && onSelectClient(participant)}
              style={{ flex: 1, background: "#EFF6FF", color: "#2563EB", border: "1px solid #BFDBFE", borderRadius: 8, padding: "8px 10px", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}
            >
              <Activity className="w-3.5 h-3.5" /> View History
            </button>
            <button
              onClick={() => sendMessageMutation.mutate("Hi, I'm checking in to see how you're doing today. Please reach out if you need anything — I'm here.")}
              disabled={sendMessageMutation.isPending}
              style={{ flex: 1, background: "#F0FDF4", color: "#16A34A", border: "1px solid #BBF7D0", borderRadius: 8, padding: "8px 10px", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}
            >
              <MessageSquare className="w-3.5 h-3.5" /> Send Check-In
            </button>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Send a personal message…"
              style={{ flex: 1, border: "1px solid #E2E8F0", borderRadius: 8, padding: "8px 12px", fontSize: 12, outline: "none", background: "#FFF" }}
            />
            <button
              onClick={() => message.trim() && sendMessageMutation.mutate(message)}
              disabled={!message.trim() || sendMessageMutation.isPending}
              style={{ background: "#3B82F6", color: "#FFF", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", opacity: !message.trim() ? 0.5 : 1 }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CravingAlertPanel({ participants, allCheckIns, activeAlerts, user, counselorProfile, facilityId, onSelectClient }) {
  const [filter, setFilter] = useState("all");

  const participantsWithRisk = useMemo(() =>
    participants.map(p => ({
      ...p,
      cravingRisk: computeRisk(p, allCheckIns, activeAlerts),
    })).sort((a, b) => {
      const order = { critical: 0, high: 1, moderate: 2, stable: 3 };
      return (order[a.cravingRisk.riskLevel] ?? 3) - (order[b.cravingRisk.riskLevel] ?? 3);
    }),
    [participants, allCheckIns, activeAlerts]
  );

  const counts = useMemo(() => ({
    critical: participantsWithRisk.filter(p => p.cravingRisk.riskLevel === "critical").length,
    high: participantsWithRisk.filter(p => p.cravingRisk.riskLevel === "high").length,
    moderate: participantsWithRisk.filter(p => p.cravingRisk.riskLevel === "moderate").length,
    stable: participantsWithRisk.filter(p => p.cravingRisk.riskLevel === "stable").length,
  }), [participantsWithRisk]);

  const filtered = filter === "all" ? participantsWithRisk : participantsWithRisk.filter(p => p.cravingRisk.riskLevel === filter);

  const STATS = [
    { key: "critical", label: "Emergency", color: "#DC2626", bg: "#FEE2E2", activeBorder: "#DC2626" },
    { key: "high",     label: "High Risk",  color: "#EF4444", bg: "#FEF2F2", activeBorder: "#EF4444" },
    { key: "moderate", label: "Monitor",   color: "#D97706", bg: "#FFFBEB", activeBorder: "#D97706" },
    { key: "stable",   label: "Stable",    color: "#16A34A", bg: "#F0FDF4", activeBorder: "#16A34A" },
  ];

  return (
    <div style={{ padding: "24px 28px", maxWidth: 880, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#0F172A", marginBottom: 4 }}>Risk Monitoring</h2>
        <p style={{ fontSize: 14, color: "#64748B" }}>
          Craving and mood risk tracking across your assigned clients. Click a card to filter by risk level.
        </p>
      </div>

      {/* Summary grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {STATS.map(s => (
          <button
            key={s.key}
            onClick={() => setFilter(filter === s.key ? "all" : s.key)}
            style={{
              background: filter === s.key ? s.bg : "#FFF",
              border: `2px solid ${filter === s.key ? s.activeBorder : "#E2E8F0"}`,
              borderRadius: 12, padding: "16px 8px", textAlign: "center", cursor: "pointer"
            }}
          >
            <p style={{ fontSize: 28, fontWeight: 800, color: s.color, lineHeight: 1 }}>{counts[s.key]}</p>
            <p style={{ fontSize: 11, fontWeight: 700, color: s.color, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.4px" }}>{s.label}</p>
          </button>
        ))}
      </div>

      {/* Privacy banner */}
      <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 10, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "flex-start", gap: 10 }}>
        <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#3B82F6" }} />
        <p style={{ fontSize: 13, color: "#1E40AF", lineHeight: 1.5 }}>
          Clients are informed that this system helps their counselor offer early support if they're struggling. All alerts are private and used only to enable compassionate, timely outreach — not discipline.
        </p>
      </div>

      {/* Client list */}
      {filtered.length === 0 ? (
        <div style={{ background: "#FFF", border: "1px solid #E2E8F0", borderRadius: 12, padding: 48, textAlign: "center" }}>
          <CheckCircle className="w-8 h-8 mx-auto mb-3" style={{ color: "#22C55E" }} />
          <p style={{ fontSize: 15, fontWeight: 600, color: "#0F172A", marginBottom: 4 }}>
            {filter === "all" ? "No clients assigned yet" : "No clients in this category"}
          </p>
          <p style={{ fontSize: 13, color: "#64748B" }}>
            {filter === "all" ? "Clients will appear here once assigned to your facility." : ""}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(p => (
            <ClientRiskCard
              key={p.participant_email}
              participant={p}
              risk={p.cravingRisk}
              counselorEmail={user?.email}
              facilityId={facilityId}
              onSelectClient={onSelectClient}
            />
          ))}
        </div>
      )}

      <p style={{ fontSize: 11, color: "#94A3B8", textAlign: "center", marginTop: 28, lineHeight: 1.6 }}>
        Risk levels are based on craving intensity, mood trends, meeting attendance, and sponsor contact patterns.<br />
        This is a supportive tool — not a clinical diagnosis.
      </p>
    </div>
  );
}