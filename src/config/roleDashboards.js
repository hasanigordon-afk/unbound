import { ROLES } from "../lib/roles.js";

export const ROLE_DASHBOARDS = {
  [ROLES.CLIENT]: {
    label: "Client",
    badge: "Personal recovery",
    route: "/ClientDashboard",
    theme: { accent: "#B8823A", bg: "#F7F3EE", panel: "#FDFAF6", text: "#1C1410" },
    nav: [
      { label: "Today", path: "/ClientDashboard", permission: "VIEW_OWN_DATA" },
      { label: "Goals", path: "/MyMissionBoard", permission: "VIEW_OWN_DATA" },
      { label: "Resources", path: "/ResourceHub", permission: "VIEW_OWN_DATA" },
      { label: "Privacy", path: "/PrivacySettings", permission: "VIEW_OWN_DATA" },
    ],
    permissions: ["VIEW_OWN_DATA", "VIEW_DISCHARGE_PLAN", "MESSAGE_STAFF"],
    dataAccess: [
      "Own ParticipantProfile by participant_email",
      "Own DailyCheckIn by participant_email",
      "Own Goal by participant_email",
    ],
    stats: [
      { key: "checkIns", label: "Check-ins", empty: "0", helper: "Your submitted daily check-ins" },
      { key: "activeGoals", label: "Active goals", empty: "0", helper: "Goals still in motion" },
      { key: "lastCheckIn", label: "Last check-in", empty: "None", helper: "Most recent recovery pulse" },
    ],
    sections: [
      "Daily recovery snapshot",
      "Goals and next best steps",
      "Private support and safety tools",
    ],
  },
  [ROLES.COUNSELOR]: {
    label: "Counselor",
    badge: "Clinical caseload",
    route: "/CounselorDashboard",
    theme: { accent: "#2563EB", bg: "#F8FAFC", panel: "#FFFFFF", text: "#0F172A" },
    nav: [
      { label: "Caseload", path: "/CounselorDashboard", permission: "VIEW_ASSIGNED_CLIENTS" },
      { label: "Alerts", path: "/CounselorDashboard?tab=alerts", permission: "CREATE_ALERTS" },
      { label: "Notes", path: "/CounselorDashboard?tab=notes", permission: "VIEW_PARTICIPANT_NOTES" },
      { label: "Resources", path: "/ResourceHub", permission: "MODERATE_CONTENT" },
    ],
    permissions: ["VIEW_ASSIGNED_CLIENTS", "EDIT_PARTICIPANT", "VIEW_PARTICIPANT_NOTES", "CREATE_ALERTS", "MESSAGE_PARTICIPANTS"],
    dataAccess: [
      "CounselorProfile by counselor_email",
      "ParticipantProfile by assigned_counselor_email",
      "Facility ParticipantProfile only after facility match",
    ],
    stats: [
      { key: "assignedClients", label: "Assigned clients", empty: "0", helper: "Scoped to counselor assignment" },
      { key: "activeAlerts", label: "Active alerts", empty: "0", helper: "Only assigned-client alerts" },
      { key: "facilityName", label: "Facility", empty: "Unassigned", helper: "Profile-linked facility" },
    ],
    sections: [
      "Clinical risk review",
      "Treatment notes",
      "Client messaging",
    ],
  },
  [ROLES.SPONSOR]: {
    label: "Sponsor",
    badge: "Peer accountability",
    route: "/SponsorDashboard",
    theme: { accent: "#10B981", bg: "#07130F", panel: "#0E1C17", text: "#F8FAFC" },
    nav: [
      { label: "Sponsees", path: "/SponsorDashboard", permission: "VIEW_ASSIGNED_CLIENTS" },
      { label: "Encourage", path: "/SponsorDashboard?tab=encourage", permission: "SEND_ENCOURAGEMENT" },
      { label: "Check-ins", path: "/SponsorDashboard?tab=checkins", permission: "VIEW_ASSIGNED_CLIENTS" },
    ],
    permissions: ["VIEW_ASSIGNED_CLIENTS", "SEND_ENCOURAGEMENT", "MESSAGE_PARTICIPANTS"],
    dataAccess: [
      "Accepted ClientConnection by support_user_email",
      "DailyCheckIn only for connected client emails",
      "No journals, clinical notes, or facility reports",
    ],
    stats: [
      { key: "acceptedConnections", label: "Sponsees", empty: "0", helper: "Accepted client connections" },
      { key: "pendingConnections", label: "Pending invites", empty: "0", helper: "Invites awaiting acceptance" },
      { key: "connectedToday", label: "Checked in today", empty: "0", helper: "Connected clients only" },
    ],
    sections: [
      "Sponsee recovery pulse",
      "Encouragement prompts",
      "Connection invitations",
    ],
  },
  [ROLES.MENTOR]: {
    label: "Mentor",
    badge: "Peer mentor",
    route: "/MentorDashboard",
    theme: { accent: "#8B5CF6", bg: "#100B1F", panel: "#1D1533", text: "#F8FAFC" },
    nav: [
      { label: "Mentees", path: "/MentorDashboard", permission: "VIEW_ASSIGNED_CLIENTS" },
      { label: "Matches", path: "/MentorDashboard?tab=matches", permission: "MANAGE_MENTOR_MATCHES" },
      { label: "Availability", path: "/MentorDashboard?tab=availability", permission: "MANAGE_MENTOR_MATCHES" },
    ],
    permissions: ["VIEW_ASSIGNED_CLIENTS", "SEND_ENCOURAGEMENT", "MANAGE_MENTOR_MATCHES", "MESSAGE_PARTICIPANTS"],
    dataAccess: [
      "MentorProfile by display identity",
      "Conversation by mentor_user_id",
      "Message metadata for active mentor conversations",
    ],
    stats: [
      { key: "mentorStatus", label: "Profile", empty: "Not set", helper: "Mentor profile readiness" },
      { key: "activeConversations", label: "Active chats", empty: "0", helper: "Mentor conversations" },
      { key: "pendingConversations", label: "Pending matches", empty: "0", helper: "Requests waiting for review" },
    ],
    sections: [
      "Mentee match queue",
      "Active support conversations",
      "Availability and boundaries",
    ],
  },
  [ROLES.PROBATION_OFFICER]: {
    label: "Probation Officer",
    badge: "Compliance supervision",
    route: "/ProbationDashboard",
    theme: { accent: "#F97316", bg: "#111827", panel: "#1F2937", text: "#F9FAFB" },
    nav: [
      { label: "Supervision", path: "/ProbationDashboard", permission: "VIEW_ASSIGNED_CLIENTS" },
      { label: "Compliance", path: "/ProbationDashboard?tab=compliance", permission: "VIEW_COMPLIANCE" },
      { label: "Messages", path: "/ProbationDashboard?tab=messages", permission: "MESSAGE_PARTICIPANTS" },
    ],
    permissions: ["VIEW_ASSIGNED_CLIENTS", "VIEW_PARTICIPANT_NOTES", "VIEW_COMPLIANCE", "CREATE_ALERTS", "MESSAGE_PARTICIPANTS"],
    dataAccess: [
      "ParticipantProfile by assigned probation officer or facility role",
      "ProbationAppointment by supervised participant_email",
      "LegalRequirements tied to supervised client IDs",
    ],
    stats: [
      { key: "assignedClients", label: "Supervised clients", empty: "0", helper: "Only assigned probation cases" },
      { key: "scheduledAppointments", label: "Upcoming appointments", empty: "0", helper: "Scheduled compliance touchpoints" },
      { key: "missedAppointments", label: "Missed", empty: "0", helper: "Requires follow-up" },
    ],
    sections: [
      "Compliance calendar",
      "Risk and missed appointment review",
      "Structured officer messaging",
    ],
  },
  [ROLES.VETERAN]: {
    label: "Veteran",
    badge: "Veteran support",
    route: "/VeteransDashboard",
    theme: { accent: "#3B82F6", bg: "#07111F", panel: "#102039", text: "#EFF6FF" },
    nav: [
      { label: "Mission", path: "/VeteransDashboard", permission: "VIEW_VETERAN_RESOURCES" },
      { label: "Resources", path: "/VeteransDashboard?tab=resources", permission: "VIEW_VETERAN_RESOURCES" },
      { label: "Map", path: "/VeteransDashboard?tab=map", permission: "VIEW_VETERAN_RESOURCES" },
    ],
    permissions: ["VIEW_OWN_DATA", "VIEW_DISCHARGE_PLAN", "VIEW_VETERAN_RESOURCES", "MESSAGE_STAFF"],
    dataAccess: [
      "VeteranProfile by user_email",
      "VeteranGoal by user_email",
      "Veteran resources filtered by selected priorities",
    ],
    stats: [
      { key: "veteranMode", label: "Mode", empty: "Not started", helper: "Veteran profile setup" },
      { key: "resourcePriorities", label: "Priorities", empty: "0", helper: "Selected support priorities" },
      { key: "veteranGoals", label: "Goals", empty: "0", helper: "Veteran-specific goals" },
    ],
    sections: [
      "Mission-focused recovery plan",
      "VA and community resources",
      "Service-aware wellness support",
    ],
  },
  [ROLES.FAMILY_SUPPORT]: {
    label: "Family Support",
    badge: "Approved family view",
    route: "/FamilySupportDashboard",
    theme: { accent: "#EC4899", bg: "#1F1020", panel: "#32162E", text: "#FDF2F8" },
    nav: [
      { label: "Loved ones", path: "/FamilySupportDashboard", permission: "VIEW_FAMILY_SUMMARY" },
      { label: "Updates", path: "/FamilySupportDashboard?tab=updates", permission: "VIEW_FAMILY_SUMMARY" },
      { label: "Encourage", path: "/FamilySupportDashboard?tab=encourage", permission: "SEND_ENCOURAGEMENT" },
    ],
    permissions: ["VIEW_ASSIGNED_CLIENTS", "VIEW_FAMILY_SUMMARY", "SEND_ENCOURAGEMENT"],
    dataAccess: [
      "Active FamilyContact by contact_email",
      "Approved ProgressSharePermission by viewer_email",
      "Only fields allowed by the share permission record",
    ],
    stats: [
      { key: "approvedContacts", label: "Approved contacts", empty: "0", helper: "Active family dashboard links" },
      { key: "sharePermissions", label: "Share grants", empty: "0", helper: "Approved progress permissions" },
      { key: "weeklySummaries", label: "Weekly summaries", empty: "0", helper: "Enabled family updates" },
    ],
    sections: [
      "Consent-approved progress summary",
      "Family encouragement tools",
      "Boundary-aware visibility",
    ],
  },
  [ROLES.FACILITY_ADMIN]: {
    label: "Facility Admin",
    badge: "Facility operations",
    route: "/FacilityAdminDashboard",
    theme: { accent: "#6366F1", bg: "#07090F", panel: "#111827", text: "#F8FAFC" },
    nav: [
      { label: "Overview", path: "/FacilityAdminDashboard", permission: "MANAGE_FACILITY" },
      { label: "Staff", path: "/FacilityAdminDashboard?tab=staff", permission: "MANAGE_STAFF" },
      { label: "Reports", path: "/FacilityAdminDashboard?tab=reports", permission: "VIEW_FACILITY_REPORTS" },
      { label: "Clients", path: "/FacilityAdminDashboard?tab=clients", permission: "VIEW_ALL_PARTICIPANTS" },
    ],
    permissions: ["VIEW_ALL_PARTICIPANTS", "MANAGE_FACILITY", "MANAGE_STAFF", "VIEW_FACILITY_REPORTS", "PUBLISH_ARTICLES"],
    dataAccess: [
      "FacilityStaff by user_email with role_type facility_admin",
      "FacilityClientAssignment by facility_id",
      "Facility reports and staff records for the same facility only",
    ],
    stats: [
      { key: "facilityClients", label: "Facility clients", empty: "0", helper: "Active facility assignments" },
      { key: "staffCount", label: "Staff", empty: "0", helper: "Active staff at facility" },
      { key: "openAlerts", label: "Open alerts", empty: "0", helper: "Facility-level alerts" },
    ],
    sections: [
      "Facility census and risk",
      "Staff and role management",
      "Program reports and content controls",
    ],
  },
};

export const ROLE_DASHBOARD_ROUTES = Object.fromEntries(
  Object.entries(ROLE_DASHBOARDS).map(([role, config]) => [config.route, role])
);

export function getRoleDashboard(role) {
  return ROLE_DASHBOARDS[role] || ROLE_DASHBOARDS[ROLES.CLIENT];
}
