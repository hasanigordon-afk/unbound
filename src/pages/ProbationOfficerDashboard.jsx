import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  Shield,
  AlertTriangle,
  TrendingDown,
  CheckSquare,
  Calendar,
  ChevronDown,
  ChevronRight,
  Activity,
  Users,
  Bell,
} from "lucide-react";

const TABS = [
  { id: "overview", label: "Overview", icon: Users },
  { id: "reports", label: "Engagement Reports", icon: Activity },
  { id: "attendance", label: "Attendance Logs", icon: Calendar },
  { id: "checkins", label: "Check-In History", icon: CheckSquare },
  { id: "alerts", label: "Alerts", icon: Bell },
];

function RiskBadge({ score }) {
  const level = score >= 80 ? "Stable" : score >= 60 ? "Moderate" : "High Risk";
  const color = score >= 80 ? "#22C55E" : score >= 60 ? "#F59E0B" : "#EF4444";
  const bg = score >= 80 ? "#F0FDF4" : score >= 60 ? "#FFFBEB" : "#FEF2F2";
  return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ color, background: bg }}>
      {level}
    </span>
  );
}

function EngagementBar({ score }) {
  const color = score >= 80 ? "#22C55E" : score >= 60 ? "#F59E0B" : "#EF4444";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full" style={{ background: "#F0F0F3" }}>
        <div className="h-1.5 rounded-full transition-all" style={{ width: `${Math.min(score, 100)}%`, background: color }} />
      </div>
      <span className="text-xs font-semibold w-8 text-right" style={{ color }}>{score}</span>
    </div>
  );
}

export default function ProbationOfficerDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedClient, setExpandedClient] = useState(null);

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: participants = [] } = useQuery({
    queryKey: ["po-participants"],
    queryFn: () => base44.entities.ParticipantProfile.list("-created_date", 100),
    enabled: !!user,
  });

  const { data: allCheckIns = [] } = useQuery({
    queryKey: ["po-checkins"],
    queryFn: () => base44.entities.ClientCheckins.list("-date", 1000),
    enabled: participants.length > 0,
  });

  const { data: meetingAttendance = [] } = useQuery({
    queryKey: ["po-attendance"],
    queryFn: () => base44.entities.MeetingAttendance.list("-created_date", 500),
    enabled: !!user,
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ["po-alerts"],
    queryFn: () => base44.entities.EngagementAlert.list("-alert_date", 200),
    enabled: !!user,
  });

  const sevenDaysAgo = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d;
  }, []);

  const clientMetrics = useMemo(() => {
    return participants.map((p) => {
      const email = p.participant_email;
      const clientCheckIns = allCheckIns.filter((c) => c.client_id === email || c.participant_email === email);
      const recent7d = clientCheckIns.filter((c) => new Date(c.date) >= sevenDaysAgo);

      let score = 100;
      const last24h = clientCheckIns.filter((c) => {
        const ts = c.timestamp ? new Date(c.timestamp) : new Date(c.date);
        return ts >= new Date(Date.now() - 86400000);
      });
      if (last24h.length === 0) score -= 10;
      if (!recent7d.some((c) => c.meetings_attended > 0)) score -= 20;
      if (!recent7d.some((c) => c.sponsor_contact)) score -= 15;
      if (recent7d.some((c) => c.craving_level > 4)) score -= 25;
      score = Math.max(0, score);

      const avgMood = recent7d.length
        ? (recent7d.reduce((s, c) => s + (c.mood_rating || 0), 0) / recent7d.length).toFixed(1)
        : null;
      const avgCraving = recent7d.length
        ? (recent7d.reduce((s, c) => s + (c.craving_level || 0), 0) / recent7d.length).toFixed(1)
        : null;

      const clientAttendance = meetingAttendance.filter((a) => a.participant_email === email || a.created_by === email);
      const clientAlerts = alerts.filter((a) => a.participant_email === email && a.status === "active");

      return { ...p, email, score, avgMood, avgCraving, checkInCount7d: recent7d.length, clientAlerts, clientAttendance, allCheckIns: clientCheckIns };
    });
  }, [participants, allCheckIns, meetingAttendance, alerts, sevenDaysAgo]);

  const activeAlerts = alerts.filter((a) => a.status === "active");

  return (
    <div className="min-h-screen" style={{ background: "#F7F7F8" }}>
      {/* Header */}
      <div className="px-6 pt-8 pb-5" style={{ background: "#FFF", borderBottom: "1px solid #D1D1D6" }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#EEF2FF" }}>
            <Shield className="w-4 h-4" style={{ color: "#4F46E5" }} />
          </div>
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#8E8E93" }}>Probation Officer Portal</p>
            <h1 className="text-xl font-semibold" style={{ color: "#1E1E1E" }}>{user?.full_name || "Officer Dashboard"}</h1>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto px-4" style={{ background: "#FFF", borderBottom: "1px solid #D1D1D6" }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className="flex items-center gap-1.5 px-3 py-3 text-sm font-medium whitespace-nowrap"
            style={{
              color: activeTab === t.id ? "#4F46E5" : "#8E8E93",
              borderBottom: activeTab === t.id ? "2px solid #4F46E5" : "2px solid transparent",
              background: "none",
            }}
          >
            <t.icon className="w-4 h-4" strokeWidth={1.5} />
            {t.label}
            {t.id === "alerts" && activeAlerts.length > 0 && (
              <span className="ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#EF4444", color: "#FFF" }}>
                {activeAlerts.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="px-4 py-6 max-w-4xl mx-auto">

        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <div>
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="p-4 rounded-xl text-center" style={{ background: "#FFF", border: "1px solid #D1D1D6" }}>
                <p className="text-2xl font-bold" style={{ color: "#1E1E1E" }}>{participants.length}</p>
                <p className="text-xs mt-1" style={{ color: "#8E8E93" }}>Total Clients</p>
              </div>
              <div className="p-4 rounded-xl text-center" style={{ background: "#FEF2F2", border: "1px solid #FCA5A5" }}>
                <p className="text-2xl font-bold" style={{ color: "#EF4444" }}>
                  {clientMetrics.filter((m) => m.score < 60).length}
                </p>
                <p className="text-xs mt-1" style={{ color: "#EF4444" }}>High Risk</p>
              </div>
              <div className="p-4 rounded-xl text-center" style={{ background: "#FFFBEB", border: "1px solid #FCD34D" }}>
                <p className="text-2xl font-bold" style={{ color: "#F59E0B" }}>{activeAlerts.length}</p>
                <p className="text-xs mt-1" style={{ color: "#F59E0B" }}>Active Alerts</p>
              </div>
            </div>

            <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "#8E8E93" }}>All Clients</p>
            <div className="flex flex-col gap-3">
              {clientMetrics.map((m) => (
                <div key={m.id} style={{ background: "#FFF", border: `1px solid ${m.score < 60 ? "#FCA5A5" : "#D1D1D6"}`, borderRadius: "10px" }}>
                  <button
                    className="w-full flex items-center justify-between px-4 py-3 text-left"
                    onClick={() => setExpandedClient(expandedClient === m.id ? null : m.id)}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: "#1E1E1E" }}>{m.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <RiskBadge score={m.score} />
                          {m.clientAlerts.length > 0 && (
                            <span className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: "#EF4444" }}>
                              <AlertTriangle className="w-3 h-3" /> {m.clientAlerts.length} alert{m.clientAlerts.length > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="w-32">
                        <EngagementBar score={m.score} />
                      </div>
                    </div>
                    {expandedClient === m.id ? <ChevronDown className="w-4 h-4 ml-2 flex-shrink-0" style={{ color: "#8E8E93" }} /> : <ChevronRight className="w-4 h-4 ml-2 flex-shrink-0" style={{ color: "#8E8E93" }} />}
                  </button>

                  {expandedClient === m.id && (
                    <div className="px-4 pb-4" style={{ borderTop: "1px solid #F0F0F3" }}>
                      <div className="grid grid-cols-3 gap-3 mt-3 text-center">
                        <div className="p-3 rounded-lg" style={{ background: "#F7F7F8" }}>
                          <p className="text-lg font-bold" style={{ color: "#4A90E2" }}>{m.checkInCount7d}</p>
                          <p className="text-[11px]" style={{ color: "#8E8E93" }}>Check-ins (7d)</p>
                        </div>
                        <div className="p-3 rounded-lg" style={{ background: "#F7F7F8" }}>
                          <p className="text-lg font-bold" style={{ color: "#16A34A" }}>{m.avgMood ?? "—"}</p>
                          <p className="text-[11px]" style={{ color: "#8E8E93" }}>Avg Mood</p>
                        </div>
                        <div className="p-3 rounded-lg" style={{ background: "#F7F7F8" }}>
                          <p className="text-lg font-bold" style={{ color: "#F59E0B" }}>{m.avgCraving ?? "—"}</p>
                          <p className="text-[11px]" style={{ color: "#8E8E93" }}>Avg Craving</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ENGAGEMENT REPORTS */}
        {activeTab === "reports" && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: "#8E8E93" }}>Client Engagement Reports</p>
            <div className="flex flex-col gap-3">
              {clientMetrics.map((m) => (
                <div key={m.id} className="p-4 rounded-xl" style={{ background: "#FFF", border: "1px solid #D1D1D6" }}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold" style={{ color: "#1E1E1E" }}>{m.email}</p>
                    <RiskBadge score={m.score} />
                  </div>
                  <EngagementBar score={m.score} />
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    <div className="text-center p-2 rounded-lg" style={{ background: "#F7F7F8" }}>
                      <p className="text-base font-bold" style={{ color: "#4A90E2" }}>{m.checkInCount7d}/7</p>
                      <p className="text-[10px]" style={{ color: "#8E8E93" }}>Check-ins</p>
                    </div>
                    <div className="text-center p-2 rounded-lg" style={{ background: "#F7F7F8" }}>
                      <p className="text-base font-bold" style={{ color: "#16A34A" }}>{m.avgMood ?? "—"}</p>
                      <p className="text-[10px]" style={{ color: "#8E8E93" }}>Mood</p>
                    </div>
                    <div className="text-center p-2 rounded-lg" style={{ background: "#F7F7F8" }}>
                      <p className="text-base font-bold" style={{ color: "#F59E0B" }}>{m.avgCraving ?? "—"}</p>
                      <p className="text-[10px]" style={{ color: "#8E8E93" }}>Craving</p>
                    </div>
                    <div className="text-center p-2 rounded-lg" style={{ background: "#F7F7F8" }}>
                      <p className="text-base font-bold" style={{ color: "#8B5CF6" }}>{m.clientAlerts.length}</p>
                      <p className="text-[10px]" style={{ color: "#8E8E93" }}>Alerts</p>
                    </div>
                  </div>
                </div>
              ))}
              {clientMetrics.length === 0 && (
                <p className="text-sm text-center py-12" style={{ color: "#8E8E93" }}>No client data available.</p>
              )}
            </div>
          </div>
        )}

        {/* ATTENDANCE LOGS */}
        {activeTab === "attendance" && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: "#8E8E93" }}>
              {meetingAttendance.length} Attendance Records
            </p>
            {meetingAttendance.length === 0 ? (
              <p className="text-sm text-center py-12" style={{ color: "#8E8E93" }}>No attendance records found.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {meetingAttendance.slice(0, 100).map((a, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: "#FFF", border: "1px solid #D1D1D6" }}>
                    <div>
                      <p className="text-sm font-medium" style={{ color: "#1E1E1E" }}>{a.participant_email || a.created_by}</p>
                      <p className="text-xs mt-0.5" style={{ color: "#8E8E93" }}>
                        {a.meeting_title || "Meeting"} · {a.attendance_date || a.created_date?.split("T")[0] || "—"}
                      </p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{
                      background: a.attended ? "#F0FDF4" : "#FEF2F2",
                      color: a.attended ? "#22C55E" : "#EF4444"
                    }}>
                      {a.attended ? "Attended" : "Missed"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CHECK-IN HISTORY */}
        {activeTab === "checkins" && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: "#8E8E93" }}>
              {allCheckIns.length} Sobriety Check-In Records
            </p>
            {allCheckIns.length === 0 ? (
              <p className="text-sm text-center py-12" style={{ color: "#8E8E93" }}>No check-in records found.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {allCheckIns.slice(0, 100).map((c, i) => (
                  <div key={i} className="px-4 py-3 rounded-xl" style={{ background: "#FFF", border: "1px solid #D1D1D6" }}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium" style={{ color: "#1E1E1E" }}>{c.client_id || c.participant_email}</p>
                      <p className="text-xs" style={{ color: "#8E8E93" }}>{c.date}</p>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div>
                        <p className="text-sm font-bold" style={{ color: "#4A90E2" }}>{c.mood_rating ?? "—"}/5</p>
                        <p className="text-[10px]" style={{ color: "#8E8E93" }}>Mood</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold" style={{ color: c.craving_level > 3 ? "#EF4444" : "#22C55E" }}>{c.craving_level ?? "—"}/5</p>
                        <p className="text-[10px]" style={{ color: "#8E8E93" }}>Craving</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold" style={{ color: "#16A34A" }}>{c.meetings_attended ?? "—"}</p>
                        <p className="text-[10px]" style={{ color: "#8E8E93" }}>Meetings</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold" style={{ color: c.sponsor_contact ? "#22C55E" : "#8E8E93" }}>
                          {c.sponsor_contact ? "Yes" : "No"}
                        </p>
                        <p className="text-[10px]" style={{ color: "#8E8E93" }}>Sponsor</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ALERTS */}
        {activeTab === "alerts" && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: "#8E8E93" }}>
              {activeAlerts.length} Active Engagement Alert{activeAlerts.length !== 1 ? "s" : ""}
            </p>
            {activeAlerts.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: "#F0FDF4" }}>
                  <Shield className="w-6 h-6" style={{ color: "#22C55E" }} />
                </div>
                <p className="text-sm font-medium" style={{ color: "#1E1E1E" }}>No active alerts</p>
                <p className="text-xs mt-1" style={{ color: "#8E8E93" }}>All clients are currently within acceptable engagement ranges.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {activeAlerts.map((a, i) => {
                  const riskColor = a.risk_level === "critical" || a.risk_level === "high" ? "#EF4444" : a.risk_level === "medium" ? "#F59E0B" : "#22C55E";
                  const riskBg = a.risk_level === "critical" || a.risk_level === "high" ? "#FEF2F2" : a.risk_level === "medium" ? "#FFFBEB" : "#F0FDF4";
                  return (
                    <div key={i} className="p-4 rounded-xl" style={{ background: "#FFF", border: `1px solid ${riskColor}33` }}>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <p className="text-sm font-semibold" style={{ color: "#1E1E1E" }}>{a.participant_email}</p>
                          <p className="text-xs mt-0.5" style={{ color: "#8E8E93" }}>{a.alert_date}</p>
                        </div>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full capitalize" style={{ background: riskBg, color: riskColor }}>
                          {a.risk_level} risk
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <TrendingDown className="w-3.5 h-3.5" style={{ color: riskColor }} />
                        <p className="text-xs font-medium" style={{ color: riskColor }}>
                          Engagement score dropped to {a.risk_score}
                        </p>
                      </div>

                      {a.contributing_factors?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {a.contributing_factors.map((f, fi) => (
                            <span key={fi} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "#F0F0F3", color: "#5A5A5A" }}>
                              {f}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}