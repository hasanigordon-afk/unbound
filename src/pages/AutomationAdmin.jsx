import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Play, Pause, Settings2, BarChart2, CheckCircle2, XCircle, Loader2, Clock, AlertTriangle } from "lucide-react";

const DEFAULT_AUTOMATIONS = [
  {
    automation_key: "daily_checkin_reminder",
    display_name: "Daily Check-In Reminder",
    description: "Reminds participants to complete their daily check-in. Respects user preferences.",
    category: "engagement",
    thresholds: {},
    channels: ["in_app"],
    is_enabled: true,
  },
  {
    automation_key: "missed_checkin_escalation",
    display_name: "Missed Check-In Escalation",
    description: "Sends re-engagement reminder after missed days, escalates to counselor after threshold.",
    category: "engagement",
    thresholds: { missed_days: 3, escalate_days: 5 },
    channels: ["in_app"],
    is_enabled: true,
  },
  {
    automation_key: "risk_trend_alerts",
    display_name: "Risk Trend Alerts",
    description: "Detects repeated low mood, high cravings, relapse flags, and isolation patterns.",
    category: "risk",
    thresholds: { min_data_days: 3 },
    channels: ["in_app"],
    is_enabled: true,
  },
  {
    automation_key: "appointment_reminders",
    display_name: "Appointment Reminders",
    description: "24-hour and same-day reminders for telehealth, therapy, and recovery sessions.",
    category: "reminders",
    thresholds: {},
    channels: ["in_app"],
    is_enabled: true,
  },
  {
    automation_key: "goal_reminders",
    display_name: "Goal & Task Reminders",
    description: "Surfaces stalled recovery plan goals and prompts participants to check in.",
    category: "engagement",
    thresholds: { stall_days: 3 },
    channels: ["in_app"],
    is_enabled: true,
  },
  {
    automation_key: "discharge_activation",
    display_name: "Discharge Activation Workflow",
    description: "Automatically activates first-week onboarding sequence when a participant is discharged.",
    category: "workflow",
    thresholds: {},
    channels: ["in_app", "email"],
    is_enabled: true,
  },
  {
    automation_key: "weekly_summary",
    display_name: "Weekly Progress Summary",
    description: "Generates participant and counselor summaries with streaks, risk flags, and follow-up needs.",
    category: "engagement",
    thresholds: {},
    channels: ["in_app", "email"],
    is_enabled: true,
  },
  {
    automation_key: "inactivity_reengagement",
    display_name: "Inactivity Re-Engagement",
    description: "Sends a supportive return message after extended absence. Non-punitive, encouraging tone.",
    category: "engagement",
    thresholds: { inactive_days: 7 },
    channels: ["in_app"],
    is_enabled: true,
  },
  {
    automation_key: "milestone_celebrations",
    display_name: "Milestone Celebrations",
    description: "Celebrates sobriety streaks at 1, 3, 7, 14, 30, 60, 90, 180, and 365 days.",
    category: "engagement",
    thresholds: {},
    channels: ["in_app"],
    is_enabled: true,
  },
  {
    automation_key: "community_moderation",
    display_name: "Community Moderation Scan",
    description: "Detects crisis language in community posts and queues content for moderator review.",
    category: "community",
    thresholds: {},
    channels: ["in_app"],
    is_enabled: true,
  },
  {
    automation_key: "consent_reminders",
    display_name: "Consent & Document Reminders",
    description: "Reminds participants with incomplete terms acceptance or missing profile setup.",
    category: "compliance",
    thresholds: {},
    channels: ["in_app"],
    is_enabled: true,
  },
];

const CATEGORY_COLORS = {
  engagement:  { bg: "rgba(62,207,191,0.1)",  border: "rgba(62,207,191,0.25)",  color: "#3ECFBF",  label: "Engagement"  },
  risk:        { bg: "rgba(239,68,68,0.08)",  border: "rgba(239,68,68,0.25)",   color: "#EF4444",  label: "Risk"        },
  reminders:   { bg: "rgba(99,102,241,0.1)",  border: "rgba(99,102,241,0.25)",  color: "#6366F1",  label: "Reminders"   },
  workflow:    { bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.25)",  color: "#F59E0B",  label: "Workflow"    },
  community:   { bg: "rgba(139,92,246,0.1)",  border: "rgba(139,92,246,0.25)", color: "#8B5CF6",   label: "Community"   },
  compliance:  { bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.25)", color: "#10B981",   label: "Compliance"  },
};

function ThresholdEditor({ thresholds, onChange }) {
  if (!thresholds || Object.keys(thresholds).length === 0) return null;
  return (
    <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10 }}>Thresholds</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {Object.entries(thresholds).map(([key, val]) => (
          <div key={key} style={{ flex: "1 1 120px", minWidth: 100 }}>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>{key.replace(/_/g, ' ')}</p>
            <input
              type="number"
              value={val}
              min={1}
              onChange={e => onChange({ ...thresholds, [key]: parseInt(e.target.value) || val })}
              style={{
                width: "100%", background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8,
                padding: "8px 10px", color: "#fff", fontSize: 14, fontFamily: "inherit", outline: "none",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AutomationAdmin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [expandedKey, setExpandedKey] = useState(null);
  const [filterCat, setFilterCat] = useState("all");

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: configs = [], isLoading } = useQuery({
    queryKey: ["automation-configs"],
    queryFn: () => base44.entities.AutomationConfig.list(),
  });

  const { data: logs = [] } = useQuery({
    queryKey: ["automation-logs"],
    queryFn: () => base44.entities.AutomationLog.list("-run_date", 50),
  });

  const { data: queueCounts } = useQuery({
    queryKey: ["staff-alert-queue-count"],
    queryFn: async () => {
      const all = await base44.entities.StaffAlertQueue.filter({ status: "new" });
      return { urgent: all.filter(a => a.priority === "urgent").length, medium: all.filter(a => a.priority === "medium").length, total: all.length };
    },
  });

  const upsertMutation = useMutation({
    mutationFn: async (cfg) => {
      const existing = configs.find(c => c.automation_key === cfg.automation_key);
      if (existing?.id) {
        return base44.entities.AutomationConfig.update(existing.id, cfg);
      }
      return base44.entities.AutomationConfig.create(cfg);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["automation-configs"] }),
  });

  // Merge defaults with saved configs
  const merged = DEFAULT_AUTOMATIONS.map(def => {
    const saved = configs.find(c => c.automation_key === def.automation_key);
    return saved ? { ...def, ...saved } : def;
  });

  const filtered = filterCat === "all" ? merged : merged.filter(a => a.category === filterCat);

  const toggle = (a) => upsertMutation.mutate({ ...a, is_enabled: !a.is_enabled, updated_by: user?.email });
  const saveThresholds = (a, thresholds) => upsertMutation.mutate({ ...a, thresholds, updated_by: user?.email });

  const lastLog = (key) => logs.filter(l => l.automation_key === key).sort((a, b) => b.run_date?.localeCompare(a.run_date))[0];

  return (
    <div style={{ minHeight: "100vh", background: "#0B1220", paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(155deg,#0E1D3A,#081426)", padding: "60px 20px 20px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(circle,rgba(99,102,241,0.12) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 640, margin: "0 auto" }}>
          <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", cursor: "pointer", marginBottom: 16, display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
            <ArrowLeft style={{ width: 16, height: 16 }} /> Back
          </button>
          <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(99,102,241,0.8)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 4 }}>Admin Settings</p>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: "#fff", marginBottom: 6, lineHeight: 1.2 }}>Automation Engine</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 20 }}>
            {merged.filter(a => a.is_enabled).length} of {merged.length} automations active
          </p>

          {/* Queue stats */}
          {queueCounts && queueCounts.total > 0 && (
            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              {queueCounts.urgent > 0 && (
                <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 12, padding: "10px 16px", display: "flex", alignItems: "center", gap: 8 }}>
                  <AlertTriangle style={{ color: "#EF4444", width: 15, height: 15 }} />
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#EF4444" }}>{queueCounts.urgent} Urgent Alerts</p>
                </div>
              )}
              <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "10px 16px" }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>{queueCounts.total} Total in Queue</p>
              </div>
            </div>
          )}

          {/* Category filter */}
          <div style={{ display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none" }}>
            {["all", ...Object.keys(CATEGORY_COLORS)].map(cat => (
              <button key={cat} onClick={() => setFilterCat(cat)} style={{
                padding: "7px 14px", borderRadius: 20, border: "none", cursor: "pointer", whiteSpace: "nowrap",
                background: filterCat === cat ? "#fff" : "rgba(255,255,255,0.06)",
                color: filterCat === cat ? "#0B1220" : "rgba(255,255,255,0.5)",
                fontWeight: filterCat === cat ? 800 : 600, fontSize: 12,
              }}>
                {cat === "all" ? "All" : CATEGORY_COLORS[cat]?.label || cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "16px 16px" }}>

        {/* Automation cards */}
        {filtered.map(a => {
          const cat = CATEGORY_COLORS[a.category] || CATEGORY_COLORS.engagement;
          const expanded = expandedKey === a.automation_key;
          const log = lastLog(a.automation_key);

          return (
            <div key={a.automation_key} style={{
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 16, marginBottom: 10, overflow: "hidden",
              borderLeft: `3px solid ${a.is_enabled ? cat.color : "rgba(255,255,255,0.1)"}`,
            }}>
              <div style={{ padding: "16px 18px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <p style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{a.display_name}</p>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                        background: cat.bg, color: cat.color, border: `1px solid ${cat.border}`,
                      }}>{cat.label}</span>
                    </div>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>{a.description}</p>

                    {log && (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
                        <Clock style={{ width: 10, height: 10, color: "rgba(255,255,255,0.2)" }} />
                        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>
                          Last run: {log.run_date} · {log.notifications_sent || 0} notifications · {log.status}
                        </p>
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    {Object.keys(a.thresholds || {}).length > 0 && (
                      <button
                        onClick={() => setExpandedKey(expanded ? null : a.automation_key)}
                        style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 8, padding: "6px 8px", cursor: "pointer" }}
                      >
                        <Settings2 style={{ width: 14, height: 14, color: "rgba(255,255,255,0.4)" }} />
                      </button>
                    )}
                    <button
                      onClick={() => toggle(a)}
                      disabled={upsertMutation.isPending}
                      style={{
                        display: "flex", alignItems: "center", gap: 6, padding: "7px 14px",
                        borderRadius: 10, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700,
                        background: a.is_enabled ? "rgba(16,185,129,0.12)" : "rgba(255,255,255,0.06)",
                        color: a.is_enabled ? "#10B981" : "rgba(255,255,255,0.4)",
                      }}
                    >
                      {a.is_enabled
                        ? <><CheckCircle2 style={{ width: 13, height: 13 }} /> Active</>
                        : <><XCircle style={{ width: 13, height: 13 }} /> Off</>
                      }
                    </button>
                  </div>
                </div>

                {expanded && (
                  <ThresholdEditor
                    thresholds={a.thresholds}
                    onChange={(t) => saveThresholds(a, t)}
                  />
                )}
              </div>
            </div>
          );
        })}

        {/* Recent run logs */}
        {logs.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>Recent Run History</p>
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, overflow: "hidden" }}>
              {logs.slice(0, 15).map((log, i) => (
                <div key={log.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "11px 16px",
                  borderBottom: i < Math.min(logs.length, 15) - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                }}>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>
                      {log.automation_key?.replace(/_/g, ' ')}
                    </p>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                      {log.run_date} · {log.participants_processed} participants · {log.notifications_sent} sent
                    </p>
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20,
                    background: log.status === 'success' ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.1)",
                    color: log.status === 'success' ? "#10B981" : "#EF4444",
                  }}>
                    {log.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}