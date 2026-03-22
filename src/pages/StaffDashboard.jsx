import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "./utils";
import {
  Users, AlertTriangle, BarChart2, Settings, MessageCircle,
  CalendarDays, Shield, FileText, TrendingUp, Home, ChevronRight,
  Bell, Activity, BookOpen,
} from "lucide-react";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import EmptyState from "@/components/shared/EmptyState";

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  blue:   "#3B82F6",
  teal:   "#3ECFBF",
  amber:  "#F59E0B",
  red:    "#EF4444",
  emerald:"#10B981",
  indigo: "#6366F1",
  white:  "#FFFFFF",
  navy:   "#0B1220",
  card:   "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.09)",
};

// ── Counselor nav cards ───────────────────────────────────────────────────────
const COUNSELOR_TOOLS = [
  { icon: Users,        label: "My Caseload",        sub: "Participants assigned to me", href: "CounselorPortal",      color: C.blue   },
  { icon: Activity,     label: "Aftercare Monitor",  sub: "Engagement & risk tracking", href: "AftercareMonitoring",  color: C.teal   },
  { icon: CalendarDays, label: "Sessions",           sub: "Schedule & telehealth",      href: "TelehealthHub",        color: C.indigo },
  { icon: MessageCircle,label: "Messages",           sub: "Participant messaging",       href: "CounselorMessaging",   color: C.emerald},
  { icon: FileText,     label: "Discharge Plans",    sub: "Create & manage plans",      href: "DischargePlan",        color: C.amber  },
  { icon: Shield,       label: "Safety Plans",       sub: "Review safety protocols",    href: "MySafetyPlan",         color: C.red    },
];

const ADMIN_TOOLS = [
  { icon: Settings,     label: "Facility Admin",     sub: "Staff, settings & billing",  href: "FacilityAdmin",        color: C.indigo },
  { icon: BarChart2,    label: "Reports",            sub: "Compliance & outcomes",      href: "ComplianceReports",    color: C.blue   },
  { icon: BookOpen,     label: "Content Admin",      sub: "Articles & moderation",      href: "ContentAdmin",         color: C.teal   },
  { icon: AlertTriangle,label: "Moderation",         sub: "Flagged content & reports",  href: "ModerationQueue",      color: C.amber  },
  { icon: TrendingUp,   label: "Analytics",          sub: "Platform-wide metrics",      href: "PlatformAdmin",        color: C.emerald},
  { icon: Users,        label: "All Participants",   sub: "Platform participant list",   href: "AftercareMonitoring",  color: C.red    },
];

function PortalCard({ icon: Icon, label, sub, href, color }) {
  return (
    <Link to={createPageUrl(href)} style={{ textDecoration: "none" }}>
      <div style={{
        background: C.card, border: `1px solid ${C.border}`,
        borderRadius: 16, padding: "18px 16px",
        transition: "all 0.15s ease", cursor: "pointer",
        display: "flex", flexDirection: "column", gap: 10,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: `${color}18`, color,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon style={{ width: 18, height: 18 }} />
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginBottom: 2 }}>{label}</p>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", lineHeight: 1.3 }}>{sub}</p>
        </div>
      </div>
    </Link>
  );
}

function StatCard({ label, value, sub, color = C.blue }) {
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`,
      borderRadius: 14, padding: "16px",
    }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase",
        letterSpacing: ".08em", marginBottom: 8 }}>{label}</p>
      <p style={{ fontSize: 28, fontWeight: 900, color, lineHeight: 1, marginBottom: 4 }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{sub}</p>}
    </div>
  );
}

export default function StaffDashboard() {
  const navigate = useNavigate();
  const { user, isAdmin, isCounselor, isLoading: userLoading } = useCurrentUser();

  const { data: profiles = [], isLoading: profilesLoading } = useQuery({
    queryKey: ["staff-all-profiles"],
    queryFn: () => base44.entities.ParticipantProfile.list("-created_date", 100),
    enabled: !!user,
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ["staff-alerts"],
    queryFn: () => base44.entities.EngagementAlert.filter({ status: "active" }),
    enabled: !!user,
  });

  const { data: checkIns = [] } = useQuery({
    queryKey: ["staff-recent-checkins"],
    queryFn: () => base44.entities.DailyCheckIn.list("-check_in_date", 200),
    enabled: !!user,
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ["staff-upcoming-sessions"],
    queryFn: () => base44.entities.TelehealthSession.filter({ status: "scheduled" }, "scheduled_date", 20),
    enabled: !!user,
  });

  const stats = useMemo(() => {
    if (!profiles.length) return null;
    const today = new Date().toISOString().split("T")[0];
    const sevenAgo = new Date(); sevenAgo.setDate(sevenAgo.getDate() - 7);

    const activeToday = checkIns.filter(c => c.check_in_date === today).length;
    const recentCheckIns = checkIns.filter(c => new Date(c.check_in_date) >= sevenAgo);

    // At-risk: high craving (>=7) in recent check-ins per unique participant
    const atRiskEmails = new Set(
      recentCheckIns.filter(c => (c.craving_intensity ?? 0) >= 7 || c.relapse_risk_flag).map(c => c.participant_email)
    );

    // Missing check-ins (no check-in in 3+ days)
    const recentEmails = new Set(recentCheckIns.map(c => c.participant_email));
    const missedCount = profiles.filter(p => !recentEmails.has(p.participant_email)).length;

    return {
      total: profiles.length,
      activeToday,
      atRisk: atRiskEmails.size,
      missed: missedCount,
      openAlerts: alerts.length,
      upcomingSessions: sessions.length,
    };
  }, [profiles, checkIns, alerts, sessions]);

  if (userLoading) return (
    <div style={{ background: C.navy, minHeight: "100vh" }}>
      <PageLoader label="Loading staff dashboard…" />
    </div>
  );

  const firstName = user?.full_name?.split(" ")[0] || "there";

  return (
    <div style={{ background: `linear-gradient(170deg,${C.navy} 0%,#0E1A2E 100%)`, minHeight: "100vh", paddingBottom: 100 }}>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>

        {/* ── Header ── */}
        <div style={{
          background: "linear-gradient(150deg,#0E1D3A 0%,#081426 100%)",
          padding: "60px 24px 28px", position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: -80, right: -60, width: 300, height: 300, borderRadius: "50%",
            background: "radial-gradient(circle,rgba(59,130,246,0.12) 0%,transparent 70%)", pointerEvents: "none" }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(96,165,250,0.8)", letterSpacing: ".1em",
              textTransform: "uppercase", marginBottom: 4 }}>
              {isAdmin ? "Admin Portal" : "Staff Portal"}
            </p>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: "#fff", marginBottom: 4, lineHeight: 1.2 }}>
              Welcome, {firstName}
            </h1>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginBottom: 24 }}>
              {isAdmin ? "Full facility management access" : "Counselor & care coordination tools"}
            </p>

            {/* Quick stat row */}
            {stats && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                <StatCard label="Participants" value={stats.total}           color={C.blue}   />
                <StatCard label="Active Today" value={stats.activeToday}     color={C.emerald}/>
                <StatCard label="Open Alerts"  value={stats.openAlerts}      color={stats.openAlerts > 0 ? C.red : C.teal} />
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: "20px 16px" }}>

          {/* ── Active alerts banner ── */}
          {alerts.length > 0 && (
            <div style={{ borderRadius: 16, padding: "14px 16px", marginBottom: 16,
              background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <Bell style={{ color: C.red, width: 18, height: 18 }} />
                <p style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>
                  {alerts.length} Active Alert{alerts.length !== 1 ? "s" : ""}
                </p>
              </div>
              {alerts.slice(0, 3).map(alert => (
                <div key={alert.id} style={{ padding: "8px 10px", borderRadius: 10,
                  background: "rgba(239,68,68,0.08)", marginBottom: 6, display: "flex",
                  alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{alert.participant_email?.split("@")[0]}</p>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{alert.alert_type || "Engagement alert"}</p>
                  </div>
                  <ChevronRight style={{ color: "rgba(255,255,255,0.3)", width: 14, height: 14 }} />
                </div>
              ))}
              <Link to={createPageUrl("AftercareMonitoring")}
                style={{ fontSize: 12, color: C.red, fontWeight: 700, textDecoration: "none" }}>
                View all alerts →
              </Link>
            </div>
          )}

          {/* ── Second stat row ── */}
          {stats && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "14px 16px" }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase",
                  letterSpacing: ".08em", marginBottom: 6 }}>At Risk (7d)</p>
                <p style={{ fontSize: 26, fontWeight: 900, color: stats.atRisk > 0 ? C.amber : C.emerald, lineHeight: 1 }}>
                  {stats.atRisk}
                </p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>high craving or relapse flag</p>
              </div>
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "14px 16px" }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase",
                  letterSpacing: ".08em", marginBottom: 6 }}>Missed Check-In</p>
                <p style={{ fontSize: 26, fontWeight: 900, color: stats.missed > 0 ? C.amber : C.emerald, lineHeight: 1 }}>
                  {stats.missed}
                </p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>no check-in in 7 days</p>
              </div>
            </div>
          )}

          {/* ── Counselor tools ── */}
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase",
              letterSpacing: "1px", marginBottom: 10 }}>🩺 Care Tools</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {COUNSELOR_TOOLS.map(tool => <PortalCard key={tool.href} {...tool} />)}
            </div>
          </div>

          {/* ── Admin tools (admin only) ── */}
          {isAdmin && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase",
                letterSpacing: "1px", marginBottom: 10 }}>⚙️ Admin Controls</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {ADMIN_TOOLS.map(tool => <PortalCard key={tool.href} {...tool} />)}
              </div>
            </div>
          )}

          {/* ── Switch to participant view ── */}
          <Link to={createPageUrl("Home")} style={{ textDecoration: "none", display: "block" }}>
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
              <Home style={{ color: "rgba(255,255,255,0.3)", width: 18, height: 18 }} />
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", flex: 1 }}>Switch to Participant View</p>
              <ChevronRight style={{ color: "rgba(255,255,255,0.2)", width: 14, height: 14 }} />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}