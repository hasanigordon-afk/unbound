import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, TrendingDown, Users, Bell, CheckCircle2, Loader2, ChevronRight } from "lucide-react";
import { calcEarlyWarningScore } from "@/components/aftercare/engagementScore";
import { toast } from "sonner";

const RISK_ORDER = { "High Risk": 0, "Moderate Risk": 1, "Low Risk": 2 };

const SIGNAL_COLORS = {
  "High Risk":     { color: "#EF4444", bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.2)"  },
  "Moderate Risk": { color: "#F59E0B", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.2)" },
  "Low Risk":      { color: "#10B981", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.15)"},
};

function RiskBadge({ level }) {
  const s = SIGNAL_COLORS[level] || SIGNAL_COLORS["Low Risk"];
  return (
    <span style={{
      fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: 20,
      background: s.bg, border: `1px solid ${s.border}`, color: s.color,
      textTransform: "uppercase", letterSpacing: ".06em",
    }}>
      {level}
    </span>
  );
}

function ScoreBar({ score, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${score}%`, background: color, borderRadius: 3 }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color, minWidth: 32, textAlign: "right" }}>{score}</span>
    </div>
  );
}

function ClientWarningCard({ client, onSelect, onAlert }) {
  const { email, profile, checkIns = [] } = client;
  const { score, level, color, signals } = client.earlyWarning;
  const s = SIGNAL_COLORS[level];
  const name = email.split("@")[0];

  return (
    <div style={{
      background: s.bg, border: `1px solid ${s.border}`,
      borderRadius: 16, padding: "14px 16px", marginBottom: 10,
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 11, flexShrink: 0,
            background: `${color}20`, display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {level === "High Risk"
              ? <AlertTriangle style={{ width: 18, height: 18, color }} />
              : level === "Moderate Risk"
              ? <TrendingDown style={{ width: 18, height: 18, color }} />
              : <CheckCircle2 style={{ width: 18, height: 18, color }} />
            }
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginBottom: 2 }}>{name}</p>
            <RiskBadge level={level} />
          </div>
        </div>
        <button
          onClick={() => onSelect(client)}
          style={{
            padding: "6px 12px", borderRadius: 10, border: "none", cursor: "pointer",
            background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)",
            fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 4,
          }}
        >
          View <ChevronRight style={{ width: 12, height: 12 }} />
        </button>
      </div>

      <ScoreBar score={score} color={color} />

      {/* Negative signals */}
      {signals.negative.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 10 }}>
          {signals.negative.map((sig, i) => (
            <span key={i} style={{
              fontSize: 11, padding: "3px 8px", borderRadius: 20,
              background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)",
            }}>
              ⚠ {sig}
            </span>
          ))}
        </div>
      )}

      {/* Quick actions */}
      {level !== "Low Risk" && (
        <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
          <button
            onClick={() => onAlert(client)}
            style={{
              flex: 1, padding: "8px", borderRadius: 10, border: "none", cursor: "pointer",
              background: `${color}20`, color, fontWeight: 700, fontSize: 11,
            }}
          >
            🔔 Alert Assigned Team
          </button>
          <button
            onClick={() => onSelect(client)}
            style={{
              flex: 1, padding: "8px", borderRadius: 10, border: "none", cursor: "pointer",
              background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.55)", fontWeight: 700, fontSize: 11,
            }}
          >
            📋 View Full Profile
          </button>
        </div>
      )}
    </div>
  );
}

export default function EarlyWarningDashboard({ clientMetrics = [], counselorEmail, onSelectClient }) {
  const queryClient = useQueryClient();
  const [filterLevel, setFilterLevel] = useState("all");

  // Attach early warning scores to each client
  const enriched = useMemo(() => {
    return clientMetrics.map(m => ({
      ...m,
      email: m.email,
      checkIns: m.checkIns || [],
      earlyWarning: calcEarlyWarningScore({
        checkIns: m.checkIns || [],
        journalCount: 0,
        communityPostCount: 0,
        cravingPostCount: (m.checkIns || []).filter(c => c.craving_intensity >= 7).length,
      }),
    })).sort((a, b) => (RISK_ORDER[a.earlyWarning.level] ?? 2) - (RISK_ORDER[b.earlyWarning.level] ?? 2));
  }, [clientMetrics]);

  const highRisk     = enriched.filter(c => c.earlyWarning.level === "High Risk");
  const moderateRisk = enriched.filter(c => c.earlyWarning.level === "Moderate Risk");
  const lowRisk      = enriched.filter(c => c.earlyWarning.level === "Low Risk");

  const displayed = filterLevel === "all" ? enriched
    : filterLevel === "high"     ? highRisk
    : filterLevel === "moderate" ? moderateRisk
    : lowRisk;

  const alertMutation = useMutation({
    mutationFn: async (client) => {
      return base44.entities.EngagementAlert.create({
        participant_email: client.email,
        alert_type: client.earlyWarning.level === "High Risk" ? "composite_high_risk" : "composite_medium_risk",
        risk_score: client.earlyWarning.score,
        risk_level: client.earlyWarning.level === "High Risk" ? "high" : "medium",
        alert_date: new Date().toISOString().split("T")[0],
        contributing_factors: client.earlyWarning.signals.negative,
        status: "active",
        checkin_rate_7d: (client.checkIns?.filter(c => {
          const d = new Date(c.check_in_date);
          return (new Date() - d) <= 7 * 86400000;
        }).length || 0) / 7,
      });
    },
    onSuccess: (_, client) => {
      toast.success(`Alert created for ${client.email.split("@")[0]}`);
      queryClient.invalidateQueries(["aftercare-alerts"]);
    },
  });

  if (enriched.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px", background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20 }}>
        <p style={{ fontSize: 28, marginBottom: 10 }}>✅</p>
        <p style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>No clients to monitor yet.</p>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>
          Assign participants to your caseload to see early warning signals.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Summary tiles */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
        {[
          { count: highRisk.length,     label: "High Risk",     color: "#EF4444", bg: "rgba(239,68,68,0.1)",   filter: "high"     },
          { count: moderateRisk.length, label: "Moderate",      color: "#F59E0B", bg: "rgba(245,158,11,0.1)",  filter: "moderate" },
          { count: lowRisk.length,      label: "Stable",        color: "#10B981", bg: "rgba(16,185,129,0.08)", filter: "low"      },
        ].map(s => (
          <button
            key={s.filter}
            onClick={() => setFilterLevel(filterLevel === s.filter ? "all" : s.filter)}
            style={{
              background: filterLevel === s.filter ? s.bg : "rgba(255,255,255,0.04)",
              border: `1px solid ${filterLevel === s.filter ? s.color + "50" : "rgba(255,255,255,0.08)"}`,
              borderRadius: 14, padding: "12px 8px", textAlign: "center", cursor: "pointer",
            }}
          >
            <p style={{ fontSize: 26, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.count}</p>
            <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", marginTop: 4, textTransform: "uppercase", letterSpacing: ".05em" }}>
              {s.label}
            </p>
          </button>
        ))}
      </div>

      {/* Explanation banner */}
      <div style={{
        background: "rgba(62,207,191,0.06)", border: "1px solid rgba(62,207,191,0.2)",
        borderRadius: 14, padding: "12px 16px", marginBottom: 16,
      }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "#3ECFBF", marginBottom: 4 }}>
          📊 Relapse Early Warning System
        </p>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
          Scores 0–100 based on check-ins (+10/day), meetings (+8/day), mentor contacts (+5/day),
          journals (+4), community posts (+3), minus missed signals and risk indicators.
          Clients below 45 are automatically flagged.
        </p>
      </div>

      {/* Client list */}
      {displayed.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 20px",
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16 }}>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>No clients at this risk level.</p>
        </div>
      ) : (
        displayed.map(client => (
          <ClientWarningCard
            key={client.email}
            client={client}
            onSelect={m => onSelectClient({ email: m.email })}
            onAlert={c => alertMutation.mutate(c)}
          />
        ))
      )}

      {/* Scoring legend */}
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 16, padding: "16px 18px", marginTop: 8 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 12, textTransform: "uppercase", letterSpacing: ".07em" }}>
          Scoring Reference
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {[
            { pts: "+10", label: "Daily check-in",         color: "#10B981" },
            { pts: "+8",  label: "Meeting attended",        color: "#10B981" },
            { pts: "+5",  label: "Mentor / sponsor contact",color: "#10B981" },
            { pts: "+4",  label: "Journal entry",           color: "#10B981" },
            { pts: "+3",  label: "Community interaction",   color: "#10B981" },
            { pts: "-10", label: "Missed check-in today",   color: "#EF4444" },
            { pts: "-8",  label: "Low meeting attendance",  color: "#EF4444" },
            { pts: "-6",  label: "Craving post reported",   color: "#EF4444" },
            { pts: "-5",  label: "Isolation behavior",      color: "#F59E0B" },
            { pts: "-4",  label: "Negative mood streak",    color: "#F59E0B" },
          ].map(r => (
            <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: r.color, minWidth: 28 }}>{r.pts}</span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{r.label}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          {[
            { label: "70–100 Low Risk",    color: "#10B981" },
            { label: "45–69 Moderate",     color: "#F59E0B" },
            { label: "0–44 High Risk",     color: "#EF4444" },
          ].map(r => (
            <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: r.color }} />
              <span style={{ fontSize: 10, color: r.color, fontWeight: 700 }}>{r.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}