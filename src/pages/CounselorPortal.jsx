import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  Users, TrendingUp, AlertTriangle, Download, Search, MessageSquare, Bell,
  ChevronRight, Activity, Calendar, Target, Shield, Clock, CheckCircle2,
  Loader2, BarChart3, Phone, Filter, ArrowUpRight, User, XCircle, RefreshCw
} from "lucide-react";
import MessagingPanel from "../components/counselor/MessagingPanel";
import LifelineEventsTab from "../components/counselor/LifelineEventsTab";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";

// ── Design tokens ──────────────────────────────────────────────────────────
const C = {
  blue:    "#3B82F6",
  green:   "#10B981",
  amber:   "#F59E0B",
  red:     "#EF4444",
  navy:    "#0F172A",
  slate:   "#64748B",
  muted:   "#94A3B8",
  border:  "#E2E8F0",
  bg:      "#F8FAFC",
  white:   "#FFFFFF",
};

const TABS = [
  { id: "overview",     label: "Overview",      icon: BarChart3 },
  { id: "clients",      label: "Clients",        icon: Users },
  { id: "alerts",       label: "Alerts",         icon: AlertTriangle },
  { id: "calendar",     label: "Schedule",       icon: Calendar },
  { id: "messaging",    label: "Messages",       icon: MessageSquare },
];

function StatCard({ label, value, sub, color = C.blue, icon: IconComp }) {
  return (
    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, padding: "20px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: `${color}10` }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: C.slate, textTransform: "uppercase", letterSpacing: ".06em" }}>{label}</p>
        {IconComp && <IconComp style={{ width: 16, height: 16, color }} strokeWidth={1.5} />}
      </div>
      <p style={{ fontSize: 32, fontWeight: 800, color: C.navy, lineHeight: 1, marginBottom: 4 }}>{value}</p>
      {sub && <p style={{ fontSize: 12, color: C.muted }}>{sub}</p>}
    </div>
  );
}

function RiskBadge({ level }) {
  const cfg = {
    high:   { bg: "#FEF2F2", color: C.red,   border: "#FECACA", label: "High Risk" },
    medium: { bg: "#FFFBEB", color: C.amber,  border: "#FDE68A", label: "Moderate" },
    low:    { bg: "#F0FDF4", color: C.green,  border: "#BBF7D0", label: "Stable" },
  }[level] || { bg: "#F1F5F9", color: C.slate, border: C.border, label: "Unknown" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 20,
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, fontSize: 11, fontWeight: 700 }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.color, flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
}

function EngagementBar({ value }) {
  const color = value >= 70 ? C.green : value >= 40 ? C.amber : C.red;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 6, borderRadius: 3, background: "#F1F5F9", overflow: "hidden" }}>
        <div style={{ height: "100%", borderRadius: 3, width: `${value}%`, background: color, transition: "width .4s ease" }} />
      </div>
      <p style={{ fontSize: 12, fontWeight: 700, color, minWidth: 32 }}>{value}%</p>
    </div>
  );
}

function ClientCard({ participant, onMessage, onAlert, onView }) {
  const daysSince = participant.lastCheckIn
    ? Math.floor((new Date() - new Date(participant.lastCheckIn)) / 86400000) : null;

  return (
    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, padding: "18px 20px",
      transition: "box-shadow .15s ease", cursor: "pointer" }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.07)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
      onClick={() => onView?.(participant)}
      onKeyDown={e => e.key === "Enter" && onView?.(participant)}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        {/* Avatar */}
        <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: "#EEF2FF",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
          {participant.risk === "high" ? "🔴" : participant.risk === "medium" ? "🟡" : "🟢"}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: C.navy, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {participant.participant_email?.split("@")[0] || "Participant"}
              </p>
              <RiskBadge level={participant.risk} />
            </div>
            <ChevronRight style={{ width: 14, height: 14, color: C.muted, flexShrink: 0 }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px 16px", marginBottom: 10 }}>
            <div>
              <p style={{ fontSize: 10, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 2 }}>Last Check-In</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: daysSince > 3 ? C.red : C.navy }}>
                {daysSince === null ? "Never" : daysSince === 0 ? "Today" : daysSince === 1 ? "Yesterday" : `${daysSince}d ago`}
              </p>
            </div>
            <div>
              <p style={{ fontSize: 10, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 2 }}>Phase</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{participant.phase}</p>
            </div>
            <div>
              <p style={{ fontSize: 10, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 2 }}>Plan Progress</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: participant.forwardPlan.hasGoals ? C.blue : C.muted }}>
                {participant.forwardPlan.hasGoals ? `${participant.forwardPlan.completion}%` : "Not started"}
              </p>
            </div>
          </div>

          <EngagementBar value={participant.engagement} />
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 8, marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.border}` }}
        onClick={e => e.stopPropagation()}>
        <button
          onClick={() => onMessage?.(participant)}
          style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            padding: "8px", borderRadius: 10, background: "#EFF6FF", border: "1px solid #BFDBFE",
            color: C.blue, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
          <MessageSquare style={{ width: 13, height: 13 }} /> Message
        </button>
        <button
          onClick={() => onAlert?.(participant)}
          style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            padding: "8px", borderRadius: 10, background: participant.risk === "high" ? "#FEF2F2" : "#F1F5F9",
            border: `1px solid ${participant.risk === "high" ? "#FECACA" : C.border}`,
            color: participant.risk === "high" ? C.red : C.slate, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
          <Bell style={{ width: 13, height: 13 }} /> {participant.risk === "high" ? "Flag" : "Alert"}
        </button>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function CounselorPortal() {
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [messagingTab, setMessagingTab] = useState(null);

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: counselorProfile } = useQuery({
    queryKey: ["counselor-profile", user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.CounselorProfile.filter({ counselor_email: user.email });
      return profiles[0];
    },
    enabled: !!user,
  });

  const { data: facility } = useQuery({
    queryKey: ["facility", counselorProfile?.facility_id],
    queryFn: async () => {
      const facilities = await base44.entities.Facility.filter({ id: counselorProfile.facility_id });
      return facilities[0];
    },
    enabled: !!counselorProfile?.facility_id,
  });

  const { data: participants = [], isLoading: participantsLoading } = useQuery({
    queryKey: ["facility-participants", facility?.id],
    queryFn: () => base44.entities.ParticipantProfile.filter({ facility_id: facility.id }),
    enabled: !!facility?.id,
  });

  const { data: allCheckIns = [] } = useQuery({
    queryKey: ["facility-checkins", facility?.id],
    queryFn: async () => {
      const all = await base44.entities.DailyCheckIn.list("-check_in_date", 500);
      const emails = participants.map(p => p.participant_email);
      return all.filter(c => emails.includes(c.participant_email));
    },
    enabled: !!facility?.id && participants.length > 0,
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ["facility-alerts", facility?.id],
    queryFn: async () => {
      const all = await base44.entities.EngagementAlert.filter({ status: "active" });
      const emails = participants.map(p => p.participant_email);
      return all.filter(a => emails.includes(a.participant_email));
    },
    enabled: !!facility?.id && participants.length > 0,
  });

  const { data: phaseCompletions = [] } = useQuery({
    queryKey: ["all-phase-completions", facility?.id],
    queryFn: async () => {
      const all = await base44.entities.PhaseCompletion.list();
      const emails = participants.map(p => p.participant_email);
      return all.filter(c => emails.includes(c.participant_email));
    },
    enabled: !!facility?.id && participants.length > 0,
  });

  const { data: forwardPlans = [] } = useQuery({
    queryKey: ["all-forward-plans", facility?.id],
    queryFn: async () => {
      const all = await base44.entities.ForwardPlan.list();
      const emails = participants.map(p => p.participant_email);
      return all.filter(p => emails.includes(p.participant_email));
    },
    enabled: !!facility?.id && participants.length > 0,
  });

  // ── Computed metrics ───────────────────────────────────────────
  const participantsWithMetrics = useMemo(() => {
    return participants.map(p => {
      const email = p.participant_email;
      const checkIns = allCheckIns.filter(c => c.participant_email === email);
      const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const last7 = checkIns.filter(c => new Date(c.check_in_date) >= sevenDaysAgo);
      const lastCI = checkIns.sort((a,b) => new Date(b.check_in_date) - new Date(a.check_in_date))[0];
      const engagement = Math.round((last7.length / 7) * 100);
      const hasAlert = alerts.some(a => a.participant_email === email);
      const risk = (hasAlert || engagement < 40) ? "high" : engagement < 70 ? "medium" : "low";
      const completions = phaseCompletions.filter(c => c.participant_email === email);
      const phase = ["Phase 1","Phase 2","Phase 3","Complete"][Math.min(completions.length, 3)];
      const plan = forwardPlans.find(fp => fp.participant_email === email);
      return {
        ...p,
        engagement,
        lastCheckIn: lastCI?.check_in_date || null,
        phase,
        risk,
        forwardPlan: plan ? { completion: plan.overall_completion_percentage || 0, hasGoals: !!(plan.housing_goal || plan.employment_goal) } : { completion: 0, hasGoals: false },
      };
    });
  }, [participants, allCheckIns, alerts, phaseCompletions, forwardPlans]);

  const filteredParticipants = useMemo(() => {
    return participantsWithMetrics.filter(p => {
      const matchSearch = !searchQuery || p.participant_email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchRisk = riskFilter === "all" || p.risk === riskFilter;
      return matchSearch && matchRisk;
    });
  }, [participantsWithMetrics, searchQuery, riskFilter]);

  // ── Summary stats ──────────────────────────────────────────────
  const totalActive = participants.length;
  const highRiskCount = participantsWithMetrics.filter(p => p.risk === "high").length;
  const avgEngagement = totalActive > 0
    ? Math.round(participantsWithMetrics.reduce((s, p) => s + p.engagement, 0) / totalActive) : 0;
  const checkedInToday = allCheckIns.filter(c => c.check_in_date === new Date().toISOString().split("T")[0]).length;
  const activeAlerts = alerts.length;

  const exportReport = () => {
    const report = { facility: facility?.name, generated: new Date().toISOString(), totalActive, avgEngagement, highRiskCount, activeAlerts,
      participants: filteredParticipants.map(p => ({ email: p.participant_email, engagement: p.engagement, lastCheckIn: p.lastCheckIn, phase: p.phase, risk: p.risk })) };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    Object.assign(document.createElement("a"), { href: url, download: `report-${new Date().toISOString().split("T")[0]}.json` }).click();
  };

  const isDemo = !user;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, paddingBottom: 60 }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <div style={{ background: C.navy, color: "#fff", position: "sticky", top: 0, zIndex: 40 }}>
        {isDemo && (
          <div style={{ background: "#1E3A5F", borderBottom: "1px solid rgba(255,255,255,0.1)", padding: "8px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.65)" }}>👁 Demo mode — showing all participants</p>
            <button onClick={() => base44.auth.redirectToLogin()} style={{ fontSize: 12, fontWeight: 700, color: C.blue, background: "none", border: "none", cursor: "pointer" }}>Sign in →</button>
          </div>
        )}
        <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(62,207,191,0.8)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 4 }}>UNBOUND · Staff Portal</p>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>
              {facility?.name || "Counselor Dashboard"}
            </h1>
            {user && <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{user.full_name} · {user.email}</p>}
          </div>
          <Link to={createPageUrl("AftercareMonitoring")} style={{ textDecoration: "none" }}>
            <div style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: "8px 14px", display: "flex", alignItems: "center", gap: 6 }}>
              <Activity style={{ width: 14, height: 14, color: "#3ECFBF" }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>Live Monitor</span>
              <ArrowUpRight style={{ width: 12, height: 12, color: "rgba(255,255,255,0.4)" }} />
            </div>
          </Link>
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", paddingLeft: 16, overflowX: "auto", scrollbarWidth: "none", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            const badge = id === "alerts" ? activeAlerts : 0;
            return (
              <button key={id} onClick={() => setActiveTab(id)} style={{
                display: "flex", alignItems: "center", gap: 6, padding: "12px 16px", whiteSpace: "nowrap",
                background: "none", border: "none", cursor: "pointer",
                borderBottom: active ? "2px solid #3ECFBF" : "2px solid transparent",
                color: active ? "#fff" : "rgba(255,255,255,0.45)", fontWeight: active ? 700 : 500, fontSize: 13,
              }}>
                <Icon style={{ width: 14, height: 14 }} strokeWidth={1.5} />
                {label}
                {badge > 0 && <span style={{ background: C.red, color: "#fff", fontSize: 10, fontWeight: 800, padding: "1px 6px", borderRadius: 20 }}>{badge}</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px" }}>

        {/* ── OVERVIEW TAB ─────────────────────────────────────── */}
        {activeTab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {/* Stats grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
              <StatCard label="Active Clients" value={totalActive} sub="in your caseload" color={C.blue} icon={Users} />
              <StatCard label="High Risk" value={highRiskCount} sub="need attention today" color={C.red} icon={AlertTriangle} />
              <StatCard label="Avg Engagement" value={`${avgEngagement}%`} sub="7-day check-in rate" color={C.green} icon={Activity} />
              <StatCard label="Checked In Today" value={checkedInToday} sub="of {totalActive} total" color="#8B5CF6" icon={CheckCircle2} />
              <StatCard label="Active Alerts" value={activeAlerts} sub="require follow-up" color={C.amber} icon={Bell} />
            </div>

            {/* High risk clients callout */}
            {highRiskCount > 0 && (
              <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 16, padding: "20px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <AlertTriangle style={{ width: 18, height: 18, color: C.red }} />
                  <p style={{ fontSize: 15, fontWeight: 800, color: C.red }}>{highRiskCount} client{highRiskCount > 1 ? "s" : ""} need immediate attention</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {participantsWithMetrics.filter(p => p.risk === "high").slice(0, 3).map(p => (
                    <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                      background: "#fff", borderRadius: 10, padding: "12px 16px", border: "1px solid #FCA5A5" }}>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>{p.participant_email?.split("@")[0]}</p>
                        <p style={{ fontSize: 12, color: C.slate }}>
                          {p.lastCheckIn ? `Last seen: ${Math.floor((new Date() - new Date(p.lastCheckIn)) / 86400000)}d ago` : "No check-ins"}
                          {" · "}{p.engagement}% engagement
                        </p>
                      </div>
                      <button onClick={() => { setMessagingTab(p); }}
                        style={{ padding: "7px 14px", borderRadius: 8, background: C.red, color: "#fff", border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                        Reach Out
                      </button>
                    </div>
                  ))}
                </div>
                {highRiskCount > 3 && (
                  <button onClick={() => { setRiskFilter("high"); setActiveTab("clients"); }}
                    style={{ marginTop: 10, fontSize: 13, color: C.red, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
                    View all {highRiskCount} high-risk clients →
                  </button>
                )}
              </div>
            )}

            {/* Engagement breakdown */}
            <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, padding: "24px" }}>
              <p style={{ fontSize: 15, fontWeight: 800, color: C.navy, marginBottom: 16 }}>Engagement Overview</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                {[
                  { label: "Stable (70%+)", count: participantsWithMetrics.filter(p => p.engagement >= 70).length, color: C.green, bg: "#F0FDF4" },
                  { label: "Moderate (40–69%)", count: participantsWithMetrics.filter(p => p.engagement >= 40 && p.engagement < 70).length, color: C.amber, bg: "#FFFBEB" },
                  { label: "Low Risk (<40%)", count: participantsWithMetrics.filter(p => p.engagement < 40).length, color: C.red, bg: "#FEF2F2" },
                ].map(seg => (
                  <div key={seg.label} style={{ background: seg.bg, borderRadius: 12, padding: "16px", textAlign: "center" }}>
                    <p style={{ fontSize: 32, fontWeight: 900, color: seg.color, lineHeight: 1 }}>{seg.count}</p>
                    <p style={{ fontSize: 12, color: C.slate, marginTop: 6, lineHeight: 1.4 }}>{seg.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
              {[
                { icon: "📋", label: "View All Clients", action: () => setActiveTab("clients") },
                { icon: "🔔", label: "Check Alerts", action: () => setActiveTab("alerts") },
                { icon: "📅", label: "Schedule", action: () => setActiveTab("calendar") },
                { icon: "📤", label: "Export Report", action: exportReport },
              ].map(a => (
                <button key={a.label} onClick={a.action} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
                  padding: "20px 16px", background: C.white, border: `1px solid ${C.border}`, borderRadius: 14,
                  cursor: "pointer", transition: "all .15s ease" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#F8FAFF"; e.currentTarget.style.borderColor = C.blue; }}
                  onMouseLeave={e => { e.currentTarget.style.background = C.white; e.currentTarget.style.borderColor = C.border; }}>
                  <span style={{ fontSize: 28 }}>{a.icon}</span>
                  <p style={{ fontSize: 13, fontWeight: 700, color: C.navy, textAlign: "center" }}>{a.label}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── CLIENTS TAB ──────────────────────────────────────── */}
        {activeTab === "clients" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Search & filter bar */}
            <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 20px", display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
              <div style={{ flex: "1 1 220px", position: "relative" }}>
                <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 15, height: 15, color: C.muted }} />
                <input placeholder="Search by email or name…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  style={{ width: "100%", padding: "9px 12px 9px 36px", border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 14, color: C.navy, background: C.bg, outline: "none" }} />
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {["all", "high", "medium", "low"].map(r => (
                  <button key={r} onClick={() => setRiskFilter(r)} style={{
                    padding: "8px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer", border: "1px solid",
                    background: riskFilter === r ? C.navy : C.bg,
                    color: riskFilter === r ? "#fff" : C.slate,
                    borderColor: riskFilter === r ? C.navy : C.border,
                  }}>
                    {r === "all" ? "All" : r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: 13, color: C.muted, marginLeft: "auto" }}>{filteredParticipants.length} of {totalActive}</p>
            </div>

            {participantsLoading ? (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <Loader2 style={{ width: 28, height: 28, color: C.blue, margin: "0 auto 12px", display: "block" }} className="animate-spin" />
                <p style={{ fontSize: 14, color: C.muted }}>Loading client data…</p>
              </div>
            ) : filteredParticipants.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", background: C.white, borderRadius: 16, border: `1px solid ${C.border}` }}>
                <p style={{ fontSize: 40, marginBottom: 12 }}>🔍</p>
                <p style={{ fontSize: 16, fontWeight: 700, color: C.navy, marginBottom: 6 }}>No clients found</p>
                <p style={{ fontSize: 14, color: C.muted }}>Try adjusting your search or filters</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 14 }}>
                {filteredParticipants.map(p => (
                  <ClientCard
                    key={p.id}
                    participant={p}
                    onMessage={setMessagingTab}
                    onAlert={setMessagingTab}
                    onView={setSelectedParticipant}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ALERTS TAB ───────────────────────────────────────── */}
        {activeTab === "alerts" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {alerts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0", background: C.white, borderRadius: 16, border: `1px solid ${C.border}` }}>
                <p style={{ fontSize: 40, marginBottom: 12 }}>✅</p>
                <p style={{ fontSize: 18, fontWeight: 800, color: C.navy, marginBottom: 6 }}>All Clear</p>
                <p style={{ fontSize: 14, color: C.muted }}>No active alerts right now. Your caseload is stable.</p>
              </div>
            ) : alerts.map(alert => (
              <div key={alert.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 20px",
                borderLeft: `4px solid ${C.red}` }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>{alert.participant_email?.split("@")[0]}</p>
                  <span style={{ fontSize: 11, fontWeight: 600, color: C.muted }}>{new Date(alert.created_date).toLocaleDateString()}</span>
                </div>
                <p style={{ fontSize: 13, color: C.slate, lineHeight: 1.55, marginBottom: 12 }}>{alert.alert_message || alert.reason || "Engagement alert triggered"}</p>
                <button onClick={() => setMessagingTab(participantsWithMetrics.find(p => p.participant_email === alert.participant_email))}
                  style={{ padding: "7px 16px", borderRadius: 8, background: "#EFF6FF", border: "1px solid #BFDBFE", color: C.blue, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                  Message Participant
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ── MESSAGING TAB ────────────────────────────────────── */}
        {activeTab === "messaging" && (
          <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, padding: "24px" }}>
            <p style={{ fontSize: 16, fontWeight: 800, color: C.navy, marginBottom: 16 }}>Messages</p>
            {participantsWithMetrics.length === 0 ? (
              <p style={{ fontSize: 14, color: C.muted, textAlign: "center", padding: "40px 0" }}>No participants in your caseload yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {participantsWithMetrics.slice(0, 10).map(p => (
                  <button key={p.id} onClick={() => setMessagingTab(p)}
                    style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
                      background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12,
                      cursor: "pointer", textAlign: "left" }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 18 }}>
                      {p.risk === "high" ? "🔴" : p.risk === "medium" ? "🟡" : "🟢"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>{p.participant_email?.split("@")[0]}</p>
                      <p style={{ fontSize: 12, color: C.muted }}>Tap to open thread</p>
                    </div>
                    <ChevronRight style={{ width: 14, height: 14, color: C.muted }} />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── CALENDAR TAB ─────────────────────────────────────── */}
        {activeTab === "calendar" && (
          <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, padding: "24px" }}>
            <p style={{ fontSize: 16, fontWeight: 800, color: C.navy, marginBottom: 4 }}>Schedule</p>
            <p style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>Manage appointments, sessions, and group meetings</p>
            <Link to={createPageUrl("AftercareMonitoring")} style={{ textDecoration: "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px",
                background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 12 }}>
                <Calendar style={{ width: 22, height: 22, color: C.blue }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: C.navy }}>Open Full Calendar</p>
                  <p style={{ fontSize: 12, color: C.muted }}>View and schedule all appointments</p>
                </div>
                <ArrowUpRight style={{ width: 16, height: 16, color: C.blue }} />
              </div>
            </Link>
          </div>
        )}

      </div>

      {/* ── Messaging overlay ─────────────────────────────────── */}
      {(messagingTab || selectedParticipant) && (
        <MessagingPanel
          participant={messagingTab || selectedParticipant}
          counselorEmail={user?.email}
          facilityId={facility?.id}
          onClose={() => { setMessagingTab(null); setSelectedParticipant(null); }}
        />
      )}
    </div>
  );
}