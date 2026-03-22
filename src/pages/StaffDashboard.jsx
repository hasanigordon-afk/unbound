import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import {
  Users, AlertTriangle, Activity, Calendar, MessageSquare, BarChart3,
  Shield, FileText, Settings, ArrowRight, Loader2, Building2, ChevronRight
} from "lucide-react";

const C = {
  blue:   "#3B82F6",
  green:  "#10B981",
  amber:  "#F59E0B",
  red:    "#EF4444",
  navy:   "#0F172A",
  slate:  "#64748B",
  muted:  "#94A3B8",
  border: "#E2E8F0",
  bg:     "#F8FAFC",
  white:  "#FFFFFF",
};

const ROLE_PORTALS = {
  counselor: [
    { icon: "👥", label: "My Caseload",        sub: "View all assigned clients",         href: "CounselorPortal",      color: C.blue  },
    { icon: "⚡", label: "Live Risk Monitor",   sub: "Real-time engagement alerts",       href: "AftercareMonitoring",  color: C.red   },
    { icon: "📅", label: "Schedule",            sub: "Appointments & group sessions",     href: "AftercareMonitoring",  color: "#8B5CF6" },
    { icon: "💬", label: "Messages",            sub: "Participant communications",        href: "CounselorMessaging",   color: C.green },
    { icon: "📋", label: "Discharge Planning",  sub: "Create & manage plans",            href: "DischargePlan",        color: C.amber },
    { icon: "📊", label: "Reports",             sub: "Engagement & outcome data",        href: "ComplianceReports",    color: C.slate },
  ],
  admin: [
    { icon: "🏥", label: "Facility Dashboard",  sub: "Org overview & settings",          href: "FacilityDashboard",    color: C.blue  },
    { icon: "👥", label: "Manage Staff",         sub: "Invite, assign & configure roles", href: "FacilityAdmin",        color: "#8B5CF6" },
    { icon: "📊", label: "Analytics",           sub: "Platform-wide usage & outcomes",   href: "ComplianceReports",    color: C.green },
    { icon: "📝", label: "Content Admin",        sub: "Announcements, articles, groups",  href: "ContentAdmin",         color: C.amber },
    { icon: "🔔", label: "Moderation Queue",    sub: "Flagged content & reports",        href: "ModerationQueue",      color: C.red   },
    { icon: "⚙️", label: "Platform Settings",   sub: "Integrations & configuration",     href: "FacilityAdmin",        color: C.slate },
  ],
};

function PortalCard({ icon, label, sub, href, color }) {
  return (
    <Link to={createPageUrl(href)} style={{ textDecoration: "none" }}>
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, padding: "20px",
        transition: "all .15s ease", cursor: "pointer" }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.07)"; e.currentTarget.style.borderColor = color; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = C.border; }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: `${color}15`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
            {icon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: C.navy, marginBottom: 3 }}>{label}</p>
            <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.4 }}>{sub}</p>
          </div>
          <ChevronRight style={{ width: 16, height: 16, color: C.muted, flexShrink: 0 }} />
        </div>
      </div>
    </Link>
  );
}

export default function StaffDashboard() {
  const { data: user, isLoading } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: counselorProfile } = useQuery({
    queryKey: ["counselor-profile-staff", user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.CounselorProfile.filter({ counselor_email: user.email });
      return profiles[0];
    },
    enabled: !!user,
  });

  const { data: participants = [] } = useQuery({
    queryKey: ["staff-participants", counselorProfile?.facility_id],
    queryFn: () => base44.entities.ParticipantProfile.filter({ facility_id: counselorProfile.facility_id }),
    enabled: !!counselorProfile?.facility_id,
  });

  const { data: activeAlerts = [] } = useQuery({
    queryKey: ["staff-alerts"],
    queryFn: () => base44.entities.EngagementAlert.filter({ status: "active" }),
    enabled: !!user,
  });

  const { data: facility } = useQuery({
    queryKey: ["facility-staff", counselorProfile?.facility_id],
    queryFn: async () => {
      const facilities = await base44.entities.Facility.filter({ id: counselorProfile.facility_id });
      return facilities[0];
    },
    enabled: !!counselorProfile?.facility_id,
  });

  if (isLoading) {
    return (
      <div style={{ background: C.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 style={{ width: 28, height: 28, color: C.blue }} className="animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ background: C.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ maxWidth: 400, textAlign: "center" }}>
          <p style={{ fontSize: 40, marginBottom: 16 }}>🔒</p>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.navy, marginBottom: 8 }}>Sign In Required</h2>
          <p style={{ fontSize: 14, color: C.slate, marginBottom: 24, lineHeight: 1.6 }}>Access to the staff portal requires authentication.</p>
          <button onClick={() => base44.auth.redirectToLogin()}
            style={{ padding: "13px 32px", borderRadius: 12, background: C.navy, color: "#fff", border: "none", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
            Sign In to Continue
          </button>
        </div>
      </div>
    );
  }

  const isAdmin = user.role === "admin";
  const portals = ROLE_PORTALS[isAdmin ? "admin" : "counselor"];
  const firstName = user.full_name?.split(" ")[0] || "there";

  const today = new Date().toISOString().split("T")[0];

  return (
    <div style={{ background: C.bg, minHeight: "100vh", paddingBottom: 60 }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <div style={{ background: C.navy, padding: "28px 24px 24px" }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(62,207,191,0.8)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 6 }}>UNBOUND · Staff Portal</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: "#fff", lineHeight: 1.2, marginBottom: 4 }}>
              Welcome back, {firstName}
            </h1>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
              {facility?.name || "Staff Portal"} · {isAdmin ? "Administrator" : "Counselor/Case Manager"}
            </p>
          </div>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(255,255,255,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
            {isAdmin ? "🏥" : "👩‍⚕️"}
          </div>
        </div>

        {/* Quick stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 20 }}>
          {[
            { label: "Clients",       value: participants.length, color: "#60A5FA" },
            { label: "Active Alerts", value: activeAlerts.length, color: activeAlerts.length > 0 ? "#F87171" : "#34D399" },
            { label: "Today",         value: new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }), color: "rgba(255,255,255,0.5)", small: true },
          ].map(stat => (
            <div key={stat.label} style={{ background: "rgba(255,255,255,0.07)", borderRadius: 12, padding: "12px", textAlign: "center" }}>
              <p style={{ fontSize: stat.small ? 12 : 22, fontWeight: 900, color: stat.color, lineHeight: 1, marginBottom: 4 }}>{stat.value}</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em" }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 20px" }}>

        {/* Active alerts banner */}
        {activeAlerts.length > 0 && (
          <Link to={createPageUrl("AftercareMonitoring")} style={{ textDecoration: "none", display: "block", marginBottom: 16 }}>
            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 14, padding: "14px 18px",
              display: "flex", alignItems: "center", gap: 12 }}>
              <AlertTriangle style={{ width: 20, height: 20, color: C.red, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: C.red }}>{activeAlerts.length} alert{activeAlerts.length > 1 ? "s" : ""} require your attention</p>
                <p style={{ fontSize: 12, color: "#7F1D1D", marginTop: 2 }}>Tap to view and respond to active flags</p>
              </div>
              <ChevronRight style={{ width: 16, height: 16, color: C.red }} />
            </div>
          </Link>
        )}

        {/* Portal navigation */}
        <div style={{ marginBottom: 8 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 14 }}>
            {isAdmin ? "Administration" : "My Caseload Tools"}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
            {portals.map(p => <PortalCard key={p.href} {...p} />)}
          </div>
        </div>

        {/* Switch to participant view */}
        <div style={{ marginTop: 24, padding: "16px 20px", background: C.white, border: `1px solid ${C.border}`, borderRadius: 14,
          display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 20 }}>🔄</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>Switch to Participant View</p>
            <p style={{ fontSize: 12, color: C.muted }}>See what your clients experience in the app</p>
          </div>
          <Link to={createPageUrl("Home")} style={{ textDecoration: "none" }}>
            <button style={{ padding: "8px 16px", borderRadius: 10, background: C.bg, border: `1px solid ${C.border}`, color: C.navy, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              View →
            </button>
          </Link>
        </div>

        {/* Sign out */}
        <button onClick={() => base44.auth.logout()} style={{ marginTop: 16, width: "100%", padding: "13px", borderRadius: 12,
          background: "transparent", border: `1px solid ${C.border}`, color: C.slate, fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
          Sign Out
        </button>
      </div>
    </div>
  );
}