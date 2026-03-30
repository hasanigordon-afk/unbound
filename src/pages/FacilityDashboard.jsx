import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Users, AlertTriangle, TrendingUp, Clock, Flame, UserPlus,
  CheckCircle2, Building2, ChevronDown, Loader2
} from "lucide-react";
import ClientStatusBoard from "@/components/facility/ClientStatusBoard";
import ClientDetailView from "@/components/facility/ClientDetailView";
import { PageLoader } from "@/components/shared/LoadingSpinner";

const C = {
  teal:    "#2DD4BF",
  amber:   "#F59E0B",
  emerald: "#10B981",
  red:     "#EF4444",
  indigo:  "#6366F1",
  glass:   { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" },
};

const STATUS_FILTERS = [
  { id: "all",       label: "All"          },
  { id: "active",    label: "Active Today" },
  { id: "attention", label: "Needs Attention" },
  { id: "strong",    label: "Strong Momentum" },
];

function SummaryCard({ label, value, color, icon: Icon, sub }) {
  return (
    <div style={{ ...C.glass, borderRadius: 14, padding: "14px 16px", flex: 1, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
        <Icon style={{ color, width: 13, height: 13 }} strokeWidth={2} />
        <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase",
          letterSpacing: ".07em" }}>{label}</p>
      </div>
      <p style={{ fontSize: 26, fontWeight: 900, color, lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 3 }}>{sub}</p>}
    </div>
  );
}

// ── Client metric computation ────────────────────────────────────────────────
function buildClientMetrics(assignment, allCheckIns, allAlerts, allFocusLogs) {
  const email = assignment.client_email;
  const clientCheckins = allCheckIns.filter(c => c.participant_email === email);
  const today = new Date().toISOString().split("T")[0];

  // Sort
  const sorted = [...clientCheckins].sort((a, b) => new Date(b.check_in_date) - new Date(a.check_in_date));
  const lastCheckIn = sorted[0] || null;
  const lastCheckInDate = lastCheckIn?.check_in_date || null;
  const inactiveDays = lastCheckInDate
    ? Math.floor((Date.now() - new Date(lastCheckInDate)) / 86400000)
    : 999;
  const checkedToday = inactiveDays === 0;

  // Streak
  let streak = 0;
  let cur = new Date(); cur.setHours(0, 0, 0, 0);
  for (const c of sorted) {
    const d = new Date(c.check_in_date); d.setHours(0, 0, 0, 0);
    if (Math.round((cur - d) / 86400000) <= 1) { streak++; cur = d; } else break;
  }

  // Longest streak (simple approximation)
  let longestStreak = streak;
  let tempStreak = 0;
  const allSorted = [...sorted].reverse();
  let prevDate = null;
  for (const c of allSorted) {
    const d = new Date(c.check_in_date); d.setHours(0, 0, 0, 0);
    if (prevDate && Math.round((d - prevDate) / 86400000) === 1) { tempStreak++; }
    else { tempStreak = 1; }
    if (tempStreak > longestStreak) longestStreak = tempStreak;
    prevDate = d;
  }

  // Weekly engagement
  const sevenAgo = new Date(); sevenAgo.setDate(sevenAgo.getDate() - 7);
  const last7 = clientCheckins.filter(c => new Date(c.check_in_date) >= sevenAgo);
  const weeklyEngagement = Math.round((last7.length / 7) * 100);

  // Days since start
  const daysSinceStart = assignment.start_date
    ? Math.floor((Date.now() - new Date(assignment.start_date)) / 86400000)
    : null;

  // Alerts
  const alertList = allAlerts.filter(a => a.client_email === email && a.alert_status === "new");

  // Category completion from focus logs
  const recentLogs = (allFocusLogs || []).filter(l =>
    l.user_email === email && new Date(l.log_date) >= sevenAgo
  );
  const categoryCompletion = {};
  ["recovery","productivity","physical_health","relationships","mental_growth"].forEach(cat => {
    const total = recentLogs.filter(l => l.category_key === cat).length;
    const done  = recentLogs.filter(l => l.category_key === cat && l.completed).length;
    categoryCompletion[cat] = total > 0 ? Math.round((done / total) * 100) : 0;
  });

  return {
    email,
    displayName: assignment.client_display_name || email?.split("@")[0],
    checkedToday,
    inactiveDays,
    streak,
    longestStreak,
    weeklyEngagement,
    lastCheckInDate,
    daysSinceStart,
    openAlerts: alertList.length,
    alertList,
    categoryCompletion,
    assignmentId: assignment.id,
    followUpNeeded: assignment.follow_up_needed,
  };
}

export default function FacilityDashboard() {
  const qc = useQueryClient();
  const [tab, setTab] = useState("clients");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedClient, setSelectedClient] = useState(null);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["current-user"],
    queryFn: () => base44.auth.me(),
  });

  // Resolve facility staff record
  const { data: staffRecord } = useQuery({
    queryKey: ["facility-staff-me", user?.email],
    queryFn: () => base44.entities.FacilityStaff.filter({ user_email: user.email, is_active: true }),
    enabled: !!user?.email,
    select: d => d[0] || null,
  });

  const facilityId = staffRecord?.facility_id;
  const staffRole  = staffRecord?.role_type || "counselor";

  // Assignments
  const { data: assignments = [], isLoading: assignLoading } = useQuery({
    queryKey: ["facility-assignments", facilityId, user?.email],
    queryFn: () => staffRole === "facility_admin"
      ? base44.entities.FacilityClientAssignment.filter({ facility_id: facilityId, status: "active" })
      : base44.entities.FacilityClientAssignment.filter({ facility_id: facilityId, assigned_staff_email: user.email, status: "active" }),
    enabled: !!facilityId,
  });

  // Check-ins (bulk)
  const { data: allCheckIns = [] } = useQuery({
    queryKey: ["facility-checkins-bulk", facilityId],
    queryFn: () => base44.entities.DailyCheckIn.list("-check_in_date", 1000),
    enabled: assignments.length > 0,
    select: d => d.filter(c => assignments.some(a => a.client_email === c.participant_email)),
  });

  // Alerts
  const { data: allAlerts = [] } = useQuery({
    queryKey: ["facility-client-alerts", facilityId],
    queryFn: () => base44.entities.ClientAlert.filter({ facility_id: facilityId, alert_status: "new" }),
    enabled: !!facilityId,
  });

  // Focus logs
  const { data: allFocusLogs = [] } = useQuery({
    queryKey: ["facility-focus-logs", facilityId],
    queryFn: () => base44.entities.DailyFocusLog.list("-log_date", 500),
    enabled: assignments.length > 0,
    select: d => d.filter(l => assignments.some(a => a.client_email === l.user_email)),
  });

  // Facility profile
  const { data: facilityProfile } = useQuery({
    queryKey: ["facility-profile", facilityId],
    queryFn: () => base44.entities.FacilityProfile.filter({ id: facilityId }),
    enabled: !!facilityId,
    select: d => d[0] || null,
  });

  // ── Computed client metrics ──────────────────────────────────────────────
  const clients = useMemo(() =>
    assignments.map(a => buildClientMetrics(a, allCheckIns, allAlerts, allFocusLogs)),
    [assignments, allCheckIns, allAlerts, allFocusLogs]
  );

  // ── Summary stats ────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const sevenAgo = new Date(); sevenAgo.setDate(sevenAgo.getDate() - 7);
    const oneWeekAgo = new Date(Date.now() - 7 * 86400000);

    const checkedInToday = clients.filter(c => c.checkedToday).length;
    const inactive48     = clients.filter(c => c.inactiveDays >= 2).length;
    const avgEngagement  = clients.length
      ? Math.round(clients.reduce((s, c) => s + c.weeklyEngagement, 0) / clients.length)
      : 0;
    const topStreak = clients.length ? Math.max(...clients.map(c => c.streak)) : 0;
    const newThisWeek = assignments.filter(a => a.start_date && new Date(a.start_date) >= oneWeekAgo).length;

    return { checkedInToday, inactive48, avgEngagement, topStreak, newThisWeek, total: clients.length };
  }, [clients, assignments]);

  const firstName = user?.full_name?.split(" ")[0] || "there";

  const handleInvite = async () => {
    if (!inviteEmail.includes("@") || !facilityId) return;
    setInviting(true);
    await base44.entities.FacilityClientAssignment.create({
      facility_id: facilityId,
      client_email: inviteEmail.trim().toLowerCase(),
      assigned_staff_email: user.email,
      status: "active",
      start_date: new Date().toISOString().split("T")[0],
    });
    qc.invalidateQueries({ queryKey: ["facility-assignments"] });
    setInviteEmail("");
    setShowInvite(false);
    setInviting(false);
  };

  if (userLoading || (!!user && assignLoading && !staffRecord)) return (
    <div style={{ background: "#07090F", minHeight: "100vh" }}>
      <PageLoader label="Loading facility dashboard…" />
    </div>
  );

  if (user && !facilityId && !assignLoading) return (
    <div style={{ background: "#07090F", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", padding: 32 }}>
        <Building2 style={{ color: "rgba(255,255,255,0.15)", width: 48, height: 48, margin: "0 auto 16px" }} />
        <p style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 8 }}>No facility assigned</p>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Ask your administrator to link your account to a facility.</p>
      </div>
    </div>
  );

  return (
    <div style={{ background: "linear-gradient(170deg,#07090F 0%,#0B0F1A 100%)", minHeight: "100vh", paddingBottom: 100 }}>
      <div style={{ maxWidth: 520, margin: "0 auto" }}>

        {/* ── Header ── */}
        <div style={{ background: "linear-gradient(150deg,#0D1020 0%,#08091A 100%)",
          padding: "60px 24px 28px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -60, right: -60, width: 260, height: 260, borderRadius: "50%",
            background: "radial-gradient(circle,rgba(99,102,241,0.1) 0%,transparent 70%)", pointerEvents: "none" }} />

          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 20,
            background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", marginBottom: 10 }}>
            <Building2 style={{ color: C.indigo, width: 11, height: 11 }} />
            <p style={{ fontSize: 10, fontWeight: 800, color: C.indigo, letterSpacing: ".08em", textTransform: "uppercase" }}>
              {staffRole.replace("_", " ")} · {facilityProfile?.facility_name || "Facility"}
            </p>
          </div>

          <h1 style={{ fontSize: 24, fontWeight: 900, color: "#fff", lineHeight: 1.1, marginBottom: 4 }}>
            Hi, {firstName}
          </h1>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 22 }}>
            {clients.length} active client{clients.length !== 1 ? "s" : ""} assigned to you
          </p>

          {/* Summary cards — 2-column grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            <SummaryCard label="Total"       value={stats.total}             color={C.indigo}  icon={Users}         />
            <SummaryCard label="Today"       value={stats.checkedInToday}    color={C.emerald} icon={CheckCircle2}  sub="checked in" />
            <SummaryCard label="Inactive 48h" value={stats.inactive48}       color={stats.inactive48 > 0 ? C.red : C.emerald} icon={Clock} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 8 }}>
            <SummaryCard label="Avg Engage"  value={`${stats.avgEngagement}%`} color={C.teal}  icon={TrendingUp}    sub="7-day" />
            <SummaryCard label="Top Streak"  value={`${stats.topStreak}d`}   color={C.amber}   icon={Flame}         />
            <SummaryCard label="New (7d)"    value={stats.newThisWeek}       color={C.teal}    icon={UserPlus}      />
          </div>
        </div>

        {/* ── Tabs ── */}
        <div style={{ display: "flex", padding: "10px 16px 0", gap: 4 }}>
          {[{ id: "clients", label: "Clients" }, { id: "alerts", label: `Alerts${allAlerts.length ? ` (${allAlerts.length})` : ""}` }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, padding: "10px 6px", borderRadius: "10px 10px 0 0", border: "none", cursor: "pointer",
              background: tab === t.id ? "rgba(255,255,255,0.04)" : "transparent",
              borderBottom: tab === t.id ? `2px solid ${C.indigo}` : "2px solid transparent",
              color: tab === t.id ? C.indigo : "rgba(255,255,255,0.35)",
              fontWeight: tab === t.id ? 700 : 500, fontSize: 14,
            }}>{t.label}</button>
          ))}
        </div>

        <div style={{ padding: "16px 16px" }}>

          {tab === "clients" && (
            <>
              {/* Filter chips */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                {STATUS_FILTERS.map(f => (
                  <button key={f.id} onClick={() => setFilterStatus(f.id)}
                    style={{ padding: "5px 12px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700,
                      background: filterStatus === f.id ? C.indigo : "rgba(255,255,255,0.05)",
                      color: filterStatus === f.id ? "#fff" : "rgba(255,255,255,0.4)" }}>
                    {f.label}
                  </button>
                ))}
                <button onClick={() => setShowInvite(true)}
                  style={{ marginLeft: "auto", padding: "5px 12px", borderRadius: 20, border: `1px solid rgba(45,212,191,0.3)`,
                    background: "rgba(45,212,191,0.07)", color: C.teal, fontSize: 11, fontWeight: 700, cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 4 }}>
                  <UserPlus style={{ width: 11, height: 11 }} /> Add Client
                </button>
              </div>

              {clients.length === 0 ? (
                <div style={{ ...C.glass, borderRadius: 18, padding: "40px 24px", textAlign: "center" }}>
                  <Users style={{ color: "rgba(255,255,255,0.15)", width: 40, height: 40, margin: "0 auto 12px" }} />
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 6 }}>No clients assigned yet</p>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Use "Add Client" to link clients to your caseload.</p>
                </div>
              ) : (
                <ClientStatusBoard
                  clients={clients}
                  filterStatus={filterStatus}
                  onSelect={setSelectedClient}
                />
              )}
            </>
          )}

          {tab === "alerts" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {allAlerts.length === 0 ? (
                <div style={{ borderRadius: 16, padding: "32px 20px", textAlign: "center",
                  background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)" }}>
                  <CheckCircle2 style={{ color: C.emerald, width: 28, height: 28, margin: "0 auto 10px" }} />
                  <p style={{ fontSize: 14, fontWeight: 700, color: C.emerald }}>No active alerts</p>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>All clients are within engagement thresholds.</p>
                </div>
              ) : allAlerts.map(alert => {
                const clientInfo = clients.find(c => c.email === alert.client_email);
                return (
                  <div key={alert.id} style={{ borderRadius: 14, padding: "14px 16px",
                    background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginBottom: 3 }}>
                          {clientInfo?.displayName || alert.client_email?.split("@")[0]}
                        </p>
                        <p style={{ fontSize: 11, fontWeight: 700, color: C.red }}>
                          {alert.alert_type?.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                        </p>
                        {alert.detail && <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 3 }}>{alert.detail}</p>}
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => clientInfo && setSelectedClient(clientInfo)}
                          style={{ padding: "5px 10px", borderRadius: 8, border: "1px solid rgba(45,212,191,0.2)",
                            background: "rgba(45,212,191,0.07)", color: C.teal, fontSize: 10, fontWeight: 700, cursor: "pointer" }}>
                          View
                        </button>
                        <button onClick={async () => {
                          await base44.entities.ClientAlert.update(alert.id, { alert_status: "resolved", resolved_by: user?.email, resolved_at: new Date().toISOString() });
                          qc.invalidateQueries({ queryKey: ["facility-client-alerts"] });
                        }} style={{ padding: "5px 10px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)",
                          background: "transparent", color: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>
                          Resolve
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Client detail sheet */}
      {selectedClient && (
        <ClientDetailView
          client={selectedClient}
          facilityId={facilityId}
          staffEmail={user?.email}
          staffRole={staffRole}
          onClose={() => setSelectedClient(null)}
        />
      )}

      {/* Add client modal */}
      {showInvite && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "flex-end",
          background: "rgba(0,0,0,0.7)" }} onClick={() => setShowInvite(false)}>
          <div style={{ width: "100%", maxWidth: 480, margin: "0 auto", borderRadius: "24px 24px 0 0",
            background: "#0D1117", padding: "24px 20px 40px", border: "1px solid rgba(255,255,255,0.08)" }}
            onClick={e => e.stopPropagation()}>
            <p style={{ fontSize: 17, fontWeight: 900, color: "#fff", marginBottom: 4 }}>Add Client to Caseload</p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 18 }}>
              Enter the client's email. They must already have a Rebos account.
            </p>
            <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
              placeholder="client@example.com"
              style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: 14,
                boxSizing: "border-box", outline: "none", marginBottom: 14 }} />
            <button onClick={handleInvite} disabled={!inviteEmail.includes("@") || inviting}
              style={{ width: "100%", padding: "15px", borderRadius: 14, border: "none", cursor: "pointer",
                background: inviteEmail.includes("@") ? `linear-gradient(135deg,${C.teal},#22C5B0)` : "rgba(255,255,255,0.08)",
                color: inviteEmail.includes("@") ? "#07090F" : "rgba(255,255,255,0.3)",
                fontWeight: 800, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              {inviting ? <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" /> : null}
              Add Client →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}