/**
 * PatientSummaryDashboard — Staff view of a single participant's full summary
 * Used by counselors, care managers, and facility staff
 */
import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronLeft, User, Activity, Target, Calendar,
  MessageCircle, Shield, FileText, TrendingUp,
  CheckCircle2, AlertTriangle, Clock, Heart
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "./utils";
import { Link } from "react-router-dom";

const C = {
  navy: "#0F172A", blue: "#3B82F6", green: "#10B981",
  red: "#EF4444", amber: "#F59E0B", indigo: "#6366F1",
  slate: "#64748B", muted: "#94A3B8", border: "#E2E8F0",
  bg: "#F8FAFC", white: "#FFFFFF",
};

const SECTION_TABS = [
  { id: "overview",  label: "Overview",   icon: Activity },
  { id: "checkins",  label: "Check-Ins",  icon: CheckCircle2 },
  { id: "goals",     label: "Goals",      icon: Target },
  { id: "sessions",  label: "Sessions",   icon: Calendar },
  { id: "plan",      label: "Plan",       icon: FileText },
];

function InfoRow({ label, value, color }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "9px 0", borderBottom: `1px solid ${C.border}` }}>
      <p style={{ fontSize: 13, color: C.slate }}>{label}</p>
      <p style={{ fontSize: 13, fontWeight: 700, color: color || C.navy }}>{value || "—"}</p>
    </div>
  );
}

export default function PatientSummaryDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  // Get participantEmail from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const participantEmail = urlParams.get("email") || urlParams.get("patient_email");

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: profiles = [] } = useQuery({
    queryKey: ["psd-profile", participantEmail],
    queryFn: () => base44.entities.ParticipantProfile.filter(
      participantEmail ? { participant_email: participantEmail } : {}
    ),
    enabled: !!user,
  });
  const profile = profiles[0] || null;

  const { data: checkIns = [] } = useQuery({
    queryKey: ["psd-checkins", participantEmail],
    queryFn: () => base44.entities.DailyCheckIn.filter(
      participantEmail ? { participant_email: participantEmail } : {},
      "-check_in_date", 90
    ),
    enabled: !!user,
  });

  const { data: goals = [] } = useQuery({
    queryKey: ["psd-goals", participantEmail],
    queryFn: () => base44.entities.Goal.filter(
      participantEmail ? { participant_email: participantEmail } : {}
    ),
    enabled: !!user,
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ["psd-sessions", participantEmail],
    queryFn: () => base44.entities.TelehealthSession.filter(
      participantEmail ? { participant_email: participantEmail } : {},
      "-scheduled_date", 30
    ),
    enabled: !!user,
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ["psd-alerts", participantEmail],
    queryFn: () => base44.entities.EngagementAlert.filter(
      participantEmail ? { participant_email: participantEmail, status: "active" } : { status: "active" }
    ),
    enabled: !!user,
  });

  const { data: forwardPlan } = useQuery({
    queryKey: ["psd-plan", participantEmail],
    queryFn: async () => {
      const plans = await base44.entities.ForwardPlan.filter(
        participantEmail ? { participant_email: participantEmail } : {}
      );
      return plans[0] || null;
    },
    enabled: !!user,
  });

  const metrics = useMemo(() => {
    const today = new Date();
    const sevenAgo = new Date(); sevenAgo.setDate(sevenAgo.getDate() - 7);
    const thirtyAgo = new Date(); thirtyAgo.setDate(thirtyAgo.getDate() - 30);

    const sorted = [...checkIns].sort((a,b) => new Date(b.check_in_date) - new Date(a.check_in_date));
    const last7 = sorted.filter(c => new Date(c.check_in_date) >= sevenAgo);
    const last30 = sorted.filter(c => new Date(c.check_in_date) >= thirtyAgo);
    const lastCI = sorted[0];
    const daysSince = lastCI ? Math.floor((today - new Date(lastCI.check_in_date)) / 86400000) : 99;

    let streak = 0;
    let cur = new Date(); cur.setHours(0,0,0,0);
    for (const c of sorted) {
      const d = new Date(c.check_in_date); d.setHours(0,0,0,0);
      if (Math.round((cur - d) / 86400000) <= 1) { streak++; cur = d; } else break;
    }

    const avgMood = last7.length ? (last7.reduce((s,c) => s + (c.mood_rating||0), 0) / last7.length).toFixed(1) : null;
    const avgCraving = last7.length ? (last7.reduce((s,c) => s + (c.craving_intensity||0), 0) / last7.length).toFixed(1) : null;
    const meetings7 = last7.filter(c => c.attended_meeting).length;
    const sponsor7 = last7.filter(c => c.connected_with_sponsor).length;

    const stability = last7.length > 0 ? Math.round(
      Math.min(last7.length/7,1)*25 +
      (last7.filter(c=>c.attended_meeting).length/last7.length)*25 +
      (last7.filter(c=>c.connected_with_sponsor).length/last7.length)*25 +
      Math.max(0,(10-(parseFloat(avgCraving)||5))/10)*25
    ) : null;

    const upcomingSessions = sessions.filter(s => s.status === "scheduled" && new Date(s.scheduled_date) >= today);
    const completedSessions = sessions.filter(s => s.status === "completed").length;

    const activeGoals = goals.filter(g => g.status === "active").length;
    const completedGoals = goals.filter(g => g.status === "completed").length;

    const sobrietyDays = profile?.sobriety_start_date
      ? Math.floor((today - new Date(profile.sobriety_start_date)) / 86400000)
      : null;

    return {
      daysSince, streak, avgMood, avgCraving, meetings7, sponsor7, stability,
      last7, last30, upcomingSessions, completedSessions,
      activeGoals, completedGoals, sobrietyDays,
    };
  }, [checkIns, sessions, goals, profile]);

  const displayName = participantEmail?.split("@")[0] || "Participant";
  const stabColor = !metrics.stability ? C.blue
    : metrics.stability >= 75 ? C.green
    : metrics.stability >= 50 ? C.amber
    : C.red;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ background: C.navy, color: "#fff", padding: "40px 24px 0" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <button onClick={() => navigate(-1)} style={{ display: "flex", alignItems: "center", gap: 6,
            background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer",
            fontSize: 13, marginBottom: 16, padding: 0 }}>
            <ChevronLeft style={{ width: 15, height: 15 }} /> Back
          </button>

          {/* Active alerts banner */}
          {alerts.length > 0 && (
            <div style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 10, padding: "10px 14px", marginBottom: 16,
              display: "flex", alignItems: "center", gap: 8 }}>
              <AlertTriangle style={{ width: 15, height: 15, color: C.red, flexShrink: 0 }} />
              <p style={{ fontSize: 13, fontWeight: 700, color: "#FCA5A5" }}>
                {alerts.length} active alert{alerts.length > 1 ? "s" : ""} — {alerts[0]?.alert_type || "Engagement concern"}
              </p>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 20 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(59,130,246,0.18)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <User style={{ width: 24, height: 24, color: C.blue }} />
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: 22, fontWeight: 900, color: "#fff", marginBottom: 2 }}>{displayName}</h1>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
                {profile?.program_type?.replace(/_/g, " ") || "Program not set"}
                {profile?.location_city ? ` · ${profile.location_city}` : ""}
                {profile?.assigned_counselor_email ? ` · Counselor: ${profile.assigned_counselor_email.split("@")[0]}` : ""}
              </p>
            </div>
            <Link to={`/ParticipantMessages?to=${participantEmail}`} style={{ textDecoration: "none" }}>
              <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 14px",
                background: "rgba(59,130,246,0.18)", border: "1px solid rgba(59,130,246,0.3)",
                borderRadius: 10, color: "#93C5FD", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                <MessageCircle style={{ width: 13, height: 13 }} /> Message
              </button>
            </Link>
          </div>

          {/* Key stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 20 }}>
            {[
              { label: "Stability", value: metrics.stability !== null ? `${metrics.stability}%` : "—", color: stabColor },
              { label: "Streak",    value: `${metrics.streak}d`,  color: "#A78BFA" },
              { label: "Avg Mood",  value: metrics.avgMood || "—", color: C.blue },
              { label: "Sober Days",value: metrics.sobrietyDays !== null ? metrics.sobrietyDays : "—", color: C.green },
            ].map(s => (
              <div key={s.label} style={{ background: "rgba(255,255,255,0.07)", borderRadius: 10, padding: "12px 10px", textAlign: "center" }}>
                <p style={{ fontSize: 20, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 3 }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.08)", overflowX: "auto", scrollbarWidth: "none" }}>
            {SECTION_TABS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveTab(id)} style={{
                display: "flex", alignItems: "center", gap: 6, padding: "12px 16px", whiteSpace: "nowrap",
                background: "none", border: "none", cursor: "pointer",
                borderBottom: activeTab === id ? "2px solid #3ECFBF" : "2px solid transparent",
                color: activeTab === id ? "#fff" : "rgba(255,255,255,0.4)",
                fontWeight: activeTab === id ? 700 : 500, fontSize: 13,
              }}>
                <Icon style={{ width: 13, height: 13 }} strokeWidth={1.5} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 20px" }}>

        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            {/* Profile info */}
            <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 20px" }}>
              <p style={{ fontSize: 14, fontWeight: 800, color: C.navy, marginBottom: 12 }}>Profile</p>
              <InfoRow label="Program Type" value={profile?.program_type?.replace(/_/g, " ")} />
              <InfoRow label="Location" value={[profile?.location_city, profile?.location_state].filter(Boolean).join(", ")} />
              <InfoRow label="Discharge Date" value={profile?.discharge_date} />
              <InfoRow label="Sobriety Start" value={profile?.sobriety_start_date} />
              <InfoRow label="Counselor" value={profile?.assigned_counselor_email?.split("@")[0]} />
            </div>

            {/* 7-day snapshot */}
            <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 20px" }}>
              <p style={{ fontSize: 14, fontWeight: 800, color: C.navy, marginBottom: 12 }}>7-Day Snapshot</p>
              <InfoRow label="Check-Ins" value={`${metrics.last7.length}/7`} color={metrics.last7.length >= 5 ? C.green : C.amber} />
              <InfoRow label="Avg Mood" value={metrics.avgMood ? `${metrics.avgMood}/5` : "—"} />
              <InfoRow label="Avg Cravings" value={metrics.avgCraving ? `${metrics.avgCraving}/10` : "—"} color={parseFloat(metrics.avgCraving) >= 7 ? C.red : C.navy} />
              <InfoRow label="Meetings Attended" value={`${metrics.meetings7}/7`} color={metrics.meetings7 >= 3 ? C.green : C.amber} />
              <InfoRow label="Sponsor Contacts" value={metrics.sponsor7} />
            </div>

            {/* Goals & plan */}
            <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 20px" }}>
              <p style={{ fontSize: 14, fontWeight: 800, color: C.navy, marginBottom: 12 }}>Goals & Plan</p>
              <InfoRow label="Active Goals" value={metrics.activeGoals} />
              <InfoRow label="Completed Goals" value={metrics.completedGoals} color={C.green} />
              <InfoRow label="Sessions Done" value={metrics.completedSessions} />
              <InfoRow label="Sessions Upcoming" value={metrics.upcomingSessions.length} />
              {forwardPlan && <InfoRow label="Plan Completion" value={`${forwardPlan.overall_completion_percentage || 0}%`} color={C.blue} />}
            </div>
          </div>
        )}

        {/* CHECK-INS */}
        {activeTab === "checkins" && (
          <div>
            <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
              {[
                { label: "30-Day Check-Ins", value: metrics.last30.length, color: C.blue },
                { label: "Avg Craving (7d)", value: metrics.avgCraving || "—", color: parseFloat(metrics.avgCraving) >= 7 ? C.red : C.navy },
                { label: "Avg Mood (7d)", value: metrics.avgMood || "—", color: C.green },
                { label: "Current Streak", value: `${metrics.streak}d`, color: "#A78BFA" },
              ].map(s => (
                <div key={s.label} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 16px", flex: "1 1 140px" }}>
                  <p style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 5 }}>{s.label}</p>
                  <p style={{ fontSize: 24, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</p>
                </div>
              ))}
            </div>

            <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
              <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}` }}>
                <p style={{ fontSize: 14, fontWeight: 800, color: C.navy }}>Check-In History (90 days)</p>
              </div>
              {checkIns.length === 0 ? (
                <p style={{ fontSize: 13, color: C.muted, textAlign: "center", padding: "40px 0" }}>No check-ins on record</p>
              ) : (
                <div>
                  {checkIns.slice(0, 30).map(ci => (
                    <div key={ci.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 18px",
                      borderBottom: `1px solid ${C.border}` }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                        background: ci.relapse_risk_flag ? "#FEF2F2" : "#F0FDF4",
                        display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {ci.relapse_risk_flag
                          ? <AlertTriangle style={{ width: 15, height: 15, color: C.red }} />
                          : <CheckCircle2 style={{ width: 15, height: 15, color: C.green }} />
                        }
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{ci.check_in_date}</p>
                        <p style={{ fontSize: 12, color: C.muted }}>
                          Mood: {ci.mood_rating}/5 · Cravings: {ci.craving_intensity ?? "—"}/10 · Stress: {ci.stress_level ?? "—"}/10
                        </p>
                      </div>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "flex-end" }}>
                        {ci.attended_meeting && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: "#F0FDF4", color: C.green, fontWeight: 700 }}>Meeting</span>}
                        {ci.connected_with_sponsor && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: "#EFF6FF", color: C.blue, fontWeight: 700 }}>Sponsor</span>}
                        {ci.relapse_risk_flag && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: "#FEF2F2", color: C.red, fontWeight: 700 }}>Risk Flag</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* GOALS */}
        {activeTab === "goals" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {goals.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", background: C.white, borderRadius: 14, border: `1px solid ${C.border}` }}>
                <Target style={{ width: 32, height: 32, color: C.muted, margin: "0 auto 10px", display: "block" }} strokeWidth={1} />
                <p style={{ fontSize: 15, fontWeight: 700, color: C.navy }}>No goals set yet</p>
              </div>
            ) : goals.map(goal => (
              <div key={goal.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>{goal.title}</p>
                  <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 700,
                    background: goal.status === "completed" ? "#F0FDF4" : goal.status === "paused" ? "#F1F5F9" : "#EFF6FF",
                    color: goal.status === "completed" ? C.green : goal.status === "paused" ? C.slate : C.blue,
                  }}>
                    {goal.status}
                  </span>
                </div>
                <p style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>{goal.category?.replace(/_/g, " ")} · {goal.target_date || "No target date"}</p>
                <div style={{ background: "#F1F5F9", borderRadius: 4, height: 6, overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 4, width: `${goal.progress_percentage || 0}%`, background: goal.status === "completed" ? C.green : C.blue }} />
                </div>
                <p style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{goal.progress_percentage || 0}% complete</p>
              </div>
            ))}
          </div>
        )}

        {/* SESSIONS */}
        {activeTab === "sessions" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {sessions.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", background: C.white, borderRadius: 14, border: `1px solid ${C.border}` }}>
                <Calendar style={{ width: 32, height: 32, color: C.muted, margin: "0 auto 10px", display: "block" }} strokeWidth={1} />
                <p style={{ fontSize: 15, fontWeight: 700, color: C.navy }}>No sessions on record</p>
              </div>
            ) : sessions.map(s => (
              <div key={s.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 18px",
                borderLeft: `4px solid ${s.status === "completed" ? C.green : s.status === "cancelled" ? C.red : C.blue}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>{s.title || s.session_type?.replace(/_/g, " ")}</p>
                  <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 700,
                    background: s.status === "completed" ? "#F0FDF4" : s.status === "cancelled" ? "#FEF2F2" : "#EFF6FF",
                    color: s.status === "completed" ? C.green : s.status === "cancelled" ? C.red : C.blue,
                  }}>{s.status}</span>
                </div>
                <p style={{ fontSize: 12, color: C.muted }}>
                  {s.scheduled_date} · {s.scheduled_time} · {s.duration_minutes || 50}min
                  {s.provider_name ? ` · ${s.provider_name}` : ""}
                </p>
                {s.session_notes && (
                  <p style={{ fontSize: 12, color: C.slate, marginTop: 8, padding: "8px 10px", background: "#F8FAFC", borderRadius: 8, lineHeight: 1.5 }}>
                    📝 {s.session_notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* PLAN */}
        {activeTab === "plan" && (
          <div>
            {!forwardPlan ? (
              <div style={{ textAlign: "center", padding: "60px 0", background: C.white, borderRadius: 14, border: `1px solid ${C.border}` }}>
                <FileText style={{ width: 32, height: 32, color: C.muted, margin: "0 auto 10px", display: "block" }} strokeWidth={1} />
                <p style={{ fontSize: 15, fontWeight: 700, color: C.navy }}>No forward plan created yet</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <p style={{ fontSize: 15, fontWeight: 800, color: C.navy }}>Forward Plan Overview</p>
                    <span style={{ fontSize: 16, fontWeight: 900, color: C.blue }}>{forwardPlan.overall_completion_percentage || 0}%</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 4, background: "#F1F5F9", overflow: "hidden", marginBottom: 16 }}>
                    <div style={{ height: "100%", borderRadius: 4, background: C.blue, width: `${forwardPlan.overall_completion_percentage || 0}%` }} />
                  </div>
                  {[
                    ["Housing Goal", forwardPlan.housing_goal],
                    ["Employment Goal", forwardPlan.employment_goal],
                    ["Education Goal", forwardPlan.education_goal],
                    ["Financial Goal", forwardPlan.financial_goal],
                    ["Health Goal", forwardPlan.health_goal],
                    ["Relationships Goal", forwardPlan.relationships_goal],
                    ["Legal Goal", forwardPlan.legal_goal],
                  ].filter(([, val]) => val).map(([label, val]) => (
                    <div key={label} style={{ padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
                      <p style={{ fontSize: 12, color: C.muted, fontWeight: 600, marginBottom: 3 }}>{label}</p>
                      <p style={{ fontSize: 13, color: C.navy, lineHeight: 1.5 }}>{val}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}