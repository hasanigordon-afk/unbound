import React, { useMemo } from "react";
import { Link, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Database,
  Lock,
  Menu,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { ROLE_DASHBOARDS, getRoleDashboard } from "@/config/roleDashboards";
import { getDashboardPathForRole, hasPermission, resolveRoleForUser, ROLES } from "@/lib/roles";
import { useCurrentUser } from "@/lib/useCurrentUser";

const today = () => new Date().toISOString().split("T")[0];

async function safeFilter(entityName, filter, sort, limit) {
  try {
    const entity = base44.entities?.[entityName];
    if (!entity?.filter) return [];
    const args = [filter];
    if (sort) args.push(sort);
    if (limit) args.push(limit);
    return await entity.filter(...args);
  } catch (error) {
    console.warn(`Unable to load ${entityName}`, error);
    return [];
  }
}

function latestDate(items, field) {
  const dates = items.map(item => item?.[field]).filter(Boolean).sort().reverse();
  return dates[0] ? new Date(dates[0]).toLocaleDateString() : null;
}

async function fetchClientDashboard(user) {
  const [profiles, checkIns, goals] = await Promise.all([
    safeFilter("ParticipantProfile", { participant_email: user.email }),
    safeFilter("DailyCheckIn", { participant_email: user.email }, "-check_in_date", 60),
    safeFilter("Goal", { participant_email: user.email }),
  ]);
  return {
    checkIns: checkIns.length,
    activeGoals: goals.filter(goal => goal.status !== "completed").length,
    lastCheckIn: latestDate(checkIns, "check_in_date"),
    records: [...profiles, ...goals.slice(0, 3)],
  };
}

async function fetchCounselorDashboard(user) {
  const [profiles, staffRows, assigned] = await Promise.all([
    safeFilter("CounselorProfile", { counselor_email: user.email }),
    safeFilter("FacilityStaff", { user_email: user.email, is_active: true }),
    safeFilter("ParticipantProfile", { assigned_counselor_email: user.email }),
  ]);
  const counselor = profiles[0] || null;
  const staff = staffRows[0] || null;
  const facilityId = counselor?.facility_id || staff?.facility_id;
  const facilityClients = facilityId ? await safeFilter("ParticipantProfile", { facility_id: facilityId }) : [];
  const emails = new Set([...assigned, ...facilityClients].map(client => client.participant_email));
  const alerts = facilityId ? await safeFilter("EngagementAlert", { facility_id: facilityId, status: "active" }) : [];
  return {
    assignedClients: emails.size,
    activeAlerts: alerts.filter(alert => emails.has(alert.participant_email)).length,
    facilityName: counselor?.facility_name || staff?.facility_id || null,
    records: [...assigned, ...facilityClients].slice(0, 4),
  };
}

async function fetchSponsorDashboard(user) {
  const [accepted, pending] = await Promise.all([
    safeFilter("ClientConnection", { support_user_email: user.email, connection_status: "accepted" }),
    safeFilter("ClientConnection", { support_user_email: user.email, connection_status: "pending" }),
  ]);
  const sponsorConnections = accepted.filter(conn =>
    String(conn.support_user_role_label || "").toLowerCase().includes("sponsor") || accepted.length === 1
  );
  const checkInsByClient = await Promise.all(
    sponsorConnections.map(conn => safeFilter("DailyCheckIn", { participant_email: conn.client_email, check_in_date: today() }))
  );
  return {
    acceptedConnections: sponsorConnections.length,
    pendingConnections: pending.length,
    connectedToday: checkInsByClient.flat().length,
    records: [...sponsorConnections, ...pending].slice(0, 4),
  };
}

async function fetchMentorDashboard(user) {
  const [profiles, activeConversations, pendingConversations] = await Promise.all([
    safeFilter("MentorProfile", { created_by: user.email }),
    safeFilter("Conversation", { mentor_user_id: user.id, status: "active" }),
    safeFilter("Conversation", { mentor_user_id: user.id, status: "pending" }),
  ]);
  const profile = profiles[0] || null;
  return {
    mentorStatus: profile?.onboarding_complete ? "Ready" : profile ? "Draft" : null,
    activeConversations: activeConversations.length,
    pendingConversations: pendingConversations.length,
    records: [...activeConversations, ...pendingConversations].slice(0, 4),
  };
}

async function fetchProbationDashboard(user) {
  const [staffRows, messages] = await Promise.all([
    safeFilter("FacilityStaff", { user_email: user.email, role_type: "probation_support", is_active: true }),
    safeFilter("Message", { receiver_email: user.email, receiver_role: "probation_officer" }),
  ]);
  const staff = staffRows[0] || null;
  const assignments = staff?.facility_id
    ? await safeFilter("FacilityClientAssignment", { facility_id: staff.facility_id, assigned_staff_email: user.email, status: "active" })
    : [];
  const clientEmails = assignments.map(assignment => assignment.client_email);
  const appointmentLists = await Promise.all(
    clientEmails.map(email => safeFilter("ProbationAppointment", { participant_email: email, status: "scheduled" }))
  );
  const missedLists = await Promise.all(
    clientEmails.map(email => safeFilter("ProbationAppointment", { participant_email: email, status: "missed" }))
  );
  return {
    assignedClients: assignments.length,
    scheduledAppointments: appointmentLists.flat().length,
    missedAppointments: missedLists.flat().length,
    records: [...assignments, ...messages].slice(0, 4),
  };
}

async function fetchVeteranDashboard(user) {
  const [profiles, goals] = await Promise.all([
    safeFilter("VeteranProfile", { user_email: user.email }),
    safeFilter("VeteranGoal", { user_email: user.email }),
  ]);
  const profile = profiles[0] || null;
  return {
    veteranMode: profile?.veteran_mode_complete ? "Ready" : profile ? "Draft" : null,
    resourcePriorities: profile?.resource_priority?.length || 0,
    veteranGoals: goals.filter(goal => goal.status !== "completed").length,
    records: [...profiles, ...goals.slice(0, 3)],
  };
}

async function fetchFamilySupportDashboard(user) {
  const [contacts, permissions] = await Promise.all([
    safeFilter("FamilyContact", { contact_email: user.email, is_active: true }),
    safeFilter("ProgressSharePermission", { viewer_email: user.email, status: "approved" }),
  ]);
  return {
    approvedContacts: contacts.filter(contact => contact.can_view_dashboard).length,
    sharePermissions: permissions.length,
    weeklySummaries: contacts.filter(contact => contact.weekly_summary_enabled).length,
    records: [...contacts, ...permissions].slice(0, 4),
  };
}

async function fetchFacilityAdminDashboard(user) {
  const staffRows = await safeFilter("FacilityStaff", { user_email: user.email, role_type: "facility_admin", is_active: true });
  const staff = staffRows[0] || null;
  const facilityId = staff?.facility_id;
  const [assignments, facilityStaff, alerts] = facilityId
    ? await Promise.all([
        safeFilter("FacilityClientAssignment", { facility_id: facilityId, status: "active" }),
        safeFilter("FacilityStaff", { facility_id: facilityId, is_active: true }),
        safeFilter("ClientAlert", { facility_id: facilityId, alert_status: "new" }),
      ])
    : [[], [], []];
  return {
    facilityClients: assignments.length,
    staffCount: facilityStaff.length,
    openAlerts: alerts.length,
    records: [...facilityStaff, ...assignments].slice(0, 4),
  };
}

async function fetchDashboardData(role, user) {
  if (!user?.email) return {};
  switch (role) {
    case ROLES.COUNSELOR:
      return fetchCounselorDashboard(user);
    case ROLES.SPONSOR:
      return fetchSponsorDashboard(user);
    case ROLES.MENTOR:
      return fetchMentorDashboard(user);
    case ROLES.PROBATION_OFFICER:
      return fetchProbationDashboard(user);
    case ROLES.VETERAN:
      return fetchVeteranDashboard(user);
    case ROLES.FAMILY_SUPPORT:
      return fetchFamilySupportDashboard(user);
    case ROLES.FACILITY_ADMIN:
      return fetchFacilityAdminDashboard(user);
    case ROLES.CLIENT:
    default:
      return fetchClientDashboard(user);
  }
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#0F172A", color: "#FFF" }}>
      <div className="flex items-center gap-3">
        <Activity className="w-5 h-5 animate-pulse" />
        Loading role dashboard...
      </div>
    </div>
  );
}

function PermissionPill({ permission, enabled, color }) {
  return (
    <div className="flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
      style={{ background: enabled ? `${color}22` : "rgba(148,163,184,0.16)", color: enabled ? color : "#94A3B8" }}>
      {enabled ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
      {permission.replaceAll("_", " ").toLowerCase()}
    </div>
  );
}

function RecordPreview({ record, color }) {
  const title = record?.display_name || record?.client_email || record?.participant_email || record?.contact_email || record?.title || record?.id || "Scoped record";
  const subtitle = record?.status || record?.connection_status || record?.role_type || record?.relationship || record?.category || "Role-scoped";
  return (
    <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
      <p className="font-semibold truncate" style={{ color: "#FFF" }}>{title}</p>
      <p className="text-xs mt-1 capitalize" style={{ color }}>{String(subtitle).replaceAll("_", " ")}</p>
    </div>
  );
}

export default function RoleDashboard({ forcedRole }) {
  const { user, role, isLoading } = useCurrentUser();
  const resolvedRole = resolveRoleForUser({ role: forcedRole || role });
  const config = getRoleDashboard(resolvedRole);
  const requestedPath = forcedRole ? getDashboardPathForRole(forcedRole) : null;

  const unauthorized = forcedRole && role && role !== resolvedRole;

  const { data = {}, isLoading: dataLoading } = useQuery({
    queryKey: ["role-dashboard", resolvedRole, user?.email, user?.id],
    queryFn: () => fetchDashboardData(resolvedRole, user),
    enabled: !!user?.email,
    staleTime: 60 * 1000,
  });

  const availableDashboards = useMemo(() => Object.values(ROLE_DASHBOARDS), []);

  if (isLoading) return <LoadingScreen />;
  if (!user) return <Navigate to="/Resiliant" replace />;
  if (unauthorized) return <Navigate to={getDashboardPathForRole(role)} replace />;
  if (requestedPath && config.route !== requestedPath) return <Navigate to={config.route} replace />;

  const { theme } = config;

  return (
    <div className="min-h-screen" style={{ background: theme.bg, color: theme.text }}>
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col lg:flex-row">
        <aside className="lg:w-72 lg:min-h-screen p-5" style={{ background: "rgba(0,0,0,0.18)", borderRight: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="h-11 w-11 rounded-2xl flex items-center justify-center" style={{ background: `${theme.accent}22`, color: theme.accent }}>
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em]" style={{ color: theme.accent }}>Role dashboard</p>
              <h1 className="text-xl font-black">{config.label}</h1>
            </div>
          </div>

          <nav className="space-y-2">
            {config.nav.map(item => {
              const enabled = hasPermission({ role: resolvedRole }, item.permission);
              return (
                <Link key={item.label} to={enabled ? item.path : config.route}
                  className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold"
                  style={{ background: enabled ? "rgba(255,255,255,0.08)" : "rgba(148,163,184,0.08)", color: enabled ? theme.text : "#94A3B8" }}>
                  <span className="flex items-center gap-2"><Menu className="w-4 h-4" />{item.label}</span>
                  {!enabled && <Lock className="w-4 h-4" />}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 rounded-3xl p-4" style={{ background: `${theme.accent}14`, border: `1px solid ${theme.accent}33` }}>
            <p className="text-xs uppercase tracking-[0.16em]" style={{ color: theme.accent }}>Other dashboards</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {availableDashboards.map(dashboard => (
                <span key={dashboard.route} className="rounded-full px-3 py-1 text-[11px] font-bold"
                  style={{ background: dashboard.route === config.route ? theme.accent : "rgba(255,255,255,0.08)", color: dashboard.route === config.route ? "#FFF" : "#CBD5E1" }}>
                  {dashboard.label}
                </span>
              ))}
            </div>
          </div>
        </aside>

        <main className="flex-1 p-5 lg:p-8">
          <section className="rounded-[2rem] p-6 lg:p-8" style={{ background: theme.panel, boxShadow: "0 24px 80px rgba(0,0,0,0.18)" }}>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.14em]"
                  style={{ background: `${theme.accent}22`, color: theme.accent }}>
                  <Sparkles className="w-3.5 h-3.5" />
                  {config.badge}
                </div>
                <h2 className="mt-4 text-3xl lg:text-5xl font-black tracking-tight">{config.label} dashboard</h2>
                <p className="mt-3 max-w-2xl text-sm lg:text-base" style={{ color: theme.text, opacity: 0.68 }}>
                  Navigation, permissions, data scope, and content are resolved from the authenticated user's role.
                </p>
              </div>
              <div className="rounded-3xl p-4 min-w-56" style={{ background: `${theme.accent}16`, border: `1px solid ${theme.accent}33` }}>
                <p className="text-xs font-bold uppercase tracking-[0.16em]" style={{ color: theme.accent }}>Signed in</p>
                <p className="mt-2 font-bold">{user.full_name || user.email}</p>
                <p className="text-xs mt-1" style={{ opacity: 0.62 }}>{user.email}</p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {config.stats.map(stat => (
                <div key={stat.key} className="rounded-3xl p-5" style={{ background: `${theme.accent}12`, border: `1px solid ${theme.accent}26` }}>
                  <BarChart3 className="w-5 h-5 mb-4" style={{ color: theme.accent }} />
                  <p className="text-3xl font-black">{dataLoading ? "..." : data[stat.key] || stat.empty}</p>
                  <p className="mt-1 text-sm font-bold">{stat.label}</p>
                  <p className="mt-2 text-xs" style={{ opacity: 0.6 }}>{stat.helper}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <section className="rounded-[2rem] p-6" style={{ background: "rgba(15,23,42,0.88)", color: "#FFF" }}>
              <div className="flex items-center gap-3 mb-5">
                <Users className="w-5 h-5" style={{ color: theme.accent }} />
                <h3 className="text-lg font-black">Dashboard content</h3>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {config.sections.map(section => (
                  <div key={section} className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <p className="font-bold">{section}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <div className="flex items-center gap-3 mb-3">
                  <Database className="w-5 h-5" style={{ color: theme.accent }} />
                  <h3 className="text-lg font-black">Scoped data access</h3>
                </div>
                <div className="space-y-2">
                  {config.dataAccess.map(scope => (
                    <div key={scope} className="flex items-start gap-2 rounded-2xl p-3 text-sm" style={{ background: "rgba(255,255,255,0.05)" }}>
                      <Lock className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: theme.accent }} />
                      {scope}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] p-6" style={{ background: "rgba(15,23,42,0.88)", color: "#FFF" }}>
              <div className="flex items-center gap-3 mb-5">
                <Lock className="w-5 h-5" style={{ color: theme.accent }} />
                <h3 className="text-lg font-black">Permissions</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {config.permissions.map(permission => (
                  <PermissionPill key={permission} permission={permission} enabled={hasPermission({ role: resolvedRole }, permission)} color={theme.accent} />
                ))}
              </div>

              <div className="mt-6">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5" style={{ color: theme.accent }} />
                  <h3 className="text-lg font-black">Live scoped records</h3>
                </div>
                <div className="space-y-3">
                  {(data.records || []).length > 0 ? (
                    data.records.map((record, index) => <RecordPreview key={record?.id || index} record={record} color={theme.accent} />)
                  ) : (
                    <div className="rounded-2xl p-4 text-sm" style={{ background: "rgba(255,255,255,0.06)", color: "#CBD5E1" }}>
                      No role-scoped records found for this account yet.
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
