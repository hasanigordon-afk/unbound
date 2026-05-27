/**
 * UNBOUND Role & Permission System
 * Central source of truth for all role definitions and access control.
 */

// ── Role Definitions ─────────────────────────────────────────────────────────
export const ROLES = {
  ADMIN:             "admin",
  CLIENT:            "client",
  COUNSELOR:         "counselor",
  SPONSOR:           "sponsor",
  MENTOR:            "mentor",
  PROBATION_OFFICER: "probation_officer",
  VETERAN:           "veteran",
  FAMILY_SUPPORT:    "family_support",
  FACILITY_ADMIN:    "facility_admin",

  // Legacy aliases retained for existing pages and stored users.
  STAFF:             "staff",
  PARTICIPANT:       "user",
  PARTICIPANT_ALT:   "participant",
  PROBATION:         "probation",
  FAMILY:            "family",
  SUPPORT_USER:      "support_user",
};

export const ROLE_ALIASES = {
  [ROLES.PARTICIPANT]: ROLES.CLIENT,
  [ROLES.PARTICIPANT_ALT]: ROLES.CLIENT,
  [ROLES.SUPPORT_USER]: ROLES.SPONSOR,
  [ROLES.FAMILY]: ROLES.FAMILY_SUPPORT,
  [ROLES.PROBATION]: ROLES.PROBATION_OFFICER,
  [ROLES.STAFF]: ROLES.COUNSELOR,
  [ROLES.ADMIN]: ROLES.FACILITY_ADMIN,
};

export const DASHBOARD_ROLES = [
  ROLES.CLIENT,
  ROLES.COUNSELOR,
  ROLES.SPONSOR,
  ROLES.MENTOR,
  ROLES.PROBATION_OFFICER,
  ROLES.VETERAN,
  ROLES.FAMILY_SUPPORT,
  ROLES.FACILITY_ADMIN,
];

// ── Role Groups ───────────────────────────────────────────────────────────────
export const STAFF_ROLES = [
  ROLES.ADMIN,
  ROLES.COUNSELOR,
  ROLES.FACILITY_ADMIN,
  ROLES.PROBATION_OFFICER,
  ROLES.STAFF,
];
export const CLINICAL_ROLES = [ROLES.ADMIN, ROLES.COUNSELOR, ROLES.FACILITY_ADMIN];
export const SUPPORT_ROLES = [ROLES.SPONSOR, ROLES.MENTOR, ROLES.FAMILY_SUPPORT, ROLES.SUPPORT_USER, ROLES.FAMILY];
export const ALL_ROLES = Object.values(ROLES);

// ── Permission Map ────────────────────────────────────────────────────────────
export const PERMISSIONS = {
  // Participant data
  VIEW_OWN_DATA:          [ROLES.CLIENT, ROLES.VETERAN],
  VIEW_ASSIGNED_CLIENTS:  [ROLES.COUNSELOR, ROLES.SPONSOR, ROLES.MENTOR, ROLES.PROBATION_OFFICER, ROLES.FAMILY_SUPPORT, ROLES.FACILITY_ADMIN],
  VIEW_ALL_PARTICIPANTS:  [ROLES.FACILITY_ADMIN, ROLES.ADMIN],
  EDIT_PARTICIPANT:       [ROLES.COUNSELOR, ROLES.FACILITY_ADMIN],
  VIEW_PARTICIPANT_NOTES: [ROLES.COUNSELOR, ROLES.PROBATION_OFFICER, ROLES.FACILITY_ADMIN],
  CREATE_ALERTS:          [ROLES.COUNSELOR, ROLES.PROBATION_OFFICER, ROLES.FACILITY_ADMIN],

  // Facility management
  MANAGE_FACILITY:        [ROLES.FACILITY_ADMIN, ROLES.ADMIN],
  VIEW_FACILITY_REPORTS:  [ROLES.COUNSELOR, ROLES.PROBATION_OFFICER, ROLES.FACILITY_ADMIN, ROLES.ADMIN],
  MANAGE_STAFF:           [ROLES.FACILITY_ADMIN, ROLES.ADMIN],

  // Content
  MODERATE_CONTENT:       [ROLES.COUNSELOR, ROLES.FACILITY_ADMIN, ROLES.ADMIN],
  PUBLISH_ARTICLES:       [ROLES.FACILITY_ADMIN, ROLES.ADMIN],

  // Discharge plans
  CREATE_DISCHARGE_PLAN:  [ROLES.COUNSELOR, ROLES.FACILITY_ADMIN],
  VIEW_DISCHARGE_PLAN:    [ROLES.CLIENT, ROLES.COUNSELOR, ROLES.PROBATION_OFFICER, ROLES.FACILITY_ADMIN, ROLES.VETERAN],

  // Messaging
  MESSAGE_PARTICIPANTS:   [ROLES.COUNSELOR, ROLES.SPONSOR, ROLES.MENTOR, ROLES.PROBATION_OFFICER, ROLES.FACILITY_ADMIN],
  MESSAGE_STAFF:          DASHBOARD_ROLES,
  SEND_ENCOURAGEMENT:     [ROLES.SPONSOR, ROLES.MENTOR, ROLES.FAMILY_SUPPORT],
  VIEW_COMPLIANCE:        [ROLES.PROBATION_OFFICER, ROLES.FACILITY_ADMIN],
  VIEW_FAMILY_SUMMARY:    [ROLES.FAMILY_SUPPORT],
  MANAGE_MENTOR_MATCHES:  [ROLES.MENTOR, ROLES.FACILITY_ADMIN],
  VIEW_VETERAN_RESOURCES: [ROLES.VETERAN],
};

// ── Role Helpers ──────────────────────────────────────────────────────────────
export function normalizeRole(role) {
  return ROLE_ALIASES[role] || role || ROLES.CLIENT;
}

export function resolveRoleForUser(user) {
  return normalizeRole(user?.role);
}

export function isStaff(user) {
  return STAFF_ROLES.includes(user?.role) || STAFF_ROLES.includes(resolveRoleForUser(user));
}

export function isAdmin(user) {
  return user?.role === ROLES.ADMIN || resolveRoleForUser(user) === ROLES.FACILITY_ADMIN;
}

export function isCounselor(user) {
  const role = resolveRoleForUser(user);
  return role === ROLES.COUNSELOR || role === ROLES.FACILITY_ADMIN;
}

export function isParticipant(user) {
  return resolveRoleForUser(user) === ROLES.CLIENT;
}

export function isSupportUser(user) {
  return SUPPORT_ROLES.includes(user?.role) || SUPPORT_ROLES.includes(resolveRoleForUser(user));
}

export function isClientRole(user) {
  return resolveRoleForUser(user) === ROLES.CLIENT;
}

export function hasPermission(user, permission) {
  const allowed = PERMISSIONS[permission];
  if (!allowed) return false;
  const role = resolveRoleForUser(user);
  return allowed.includes(role) || allowed.includes(user?.role) || allowed.includes("*");
}

// ── Default Landing Pages per Role ───────────────────────────────────────────
export function getDefaultPage(user) {
  switch (resolveRoleForUser(user)) {
    case ROLES.FACILITY_ADMIN:
      return "StaffDashboard";
    case ROLES.COUNSELOR:
      return "CounselorPortal";
    case ROLES.SPONSOR:
      return "SponsorDashboard";
    case ROLES.MENTOR:
      return "MentorDashboard";
    case ROLES.PROBATION_OFFICER:
      return "ProbationDashboard";
    case ROLES.VETERAN:
      return "VeteransDashboard";
    case ROLES.FAMILY_SUPPORT:
      return "FamilySupportDashboard";
    case ROLES.CLIENT:
    default:
      return "ClientDashboard";
  }
}

export function getDashboardPathForRole(role) {
  switch (normalizeRole(role)) {
    case ROLES.COUNSELOR:
      return "/CounselorDashboard";
    case ROLES.SPONSOR:
      return "/SponsorDashboard";
    case ROLES.MENTOR:
      return "/MentorDashboard";
    case ROLES.PROBATION_OFFICER:
      return "/ProbationDashboard";
    case ROLES.VETERAN:
      return "/VeteransDashboard";
    case ROLES.FAMILY_SUPPORT:
      return "/FamilySupportDashboard";
    case ROLES.FACILITY_ADMIN:
      return "/FacilityAdminDashboard";
    case ROLES.CLIENT:
    default:
      return "/ClientDashboard";
  }
}

// ── Protected Route Page Lists ────────────────────────────────────────────────
export const STAFF_ONLY_PAGES = [
  "StaffDashboard", "CounselorPortal", "AftercareMonitoring",
  "FacilityAdmin", "FacilityDashboard", "ModerationQueue", "ContentAdmin",
  "ComplianceReports", "BillingDashboard", "EHRIntegration",
  "PatientSummaryDashboard", "CounselorMessaging",
];

export const ADMIN_ONLY_PAGES = [
  "FacilityAdmin", "PlatformAdmin", "BillingDashboard",
  "ComplianceReports", "ContentAdmin", "ModerationQueue",
];