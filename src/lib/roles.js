/**
 * UNBOUND Role & Permission System
 * Central source of truth for all role definitions and access control.
 */

// ── Role Definitions ─────────────────────────────────────────────────────────
export const ROLES = {
  ADMIN:       "admin",
  COUNSELOR:   "counselor",
  STAFF:       "staff",
  PARTICIPANT: "user",       // default Base44 role for participants
  PROBATION:   "probation",
  FAMILY:      "family",
  MENTOR:      "mentor",
};

// ── Role Groups ───────────────────────────────────────────────────────────────
export const STAFF_ROLES    = [ROLES.ADMIN, ROLES.COUNSELOR, ROLES.STAFF];
export const CLINICAL_ROLES = [ROLES.ADMIN, ROLES.COUNSELOR];
export const ALL_ROLES      = Object.values(ROLES);

// ── Permission Map ────────────────────────────────────────────────────────────
export const PERMISSIONS = {
  // Participant data
  VIEW_OWN_DATA:          ALL_ROLES,
  VIEW_ALL_PARTICIPANTS:  STAFF_ROLES,
  EDIT_PARTICIPANT:       CLINICAL_ROLES,
  VIEW_PARTICIPANT_NOTES: CLINICAL_ROLES,
  CREATE_ALERTS:          STAFF_ROLES,

  // Facility management
  MANAGE_FACILITY:        [ROLES.ADMIN],
  VIEW_FACILITY_REPORTS:  STAFF_ROLES,
  MANAGE_STAFF:           [ROLES.ADMIN],

  // Content
  MODERATE_CONTENT:       [ROLES.ADMIN, ROLES.COUNSELOR],
  PUBLISH_ARTICLES:       [ROLES.ADMIN],

  // Discharge plans
  CREATE_DISCHARGE_PLAN:  CLINICAL_ROLES,
  VIEW_DISCHARGE_PLAN:    [...CLINICAL_ROLES, ROLES.PARTICIPANT],

  // Messaging
  MESSAGE_PARTICIPANTS:   STAFF_ROLES,
  MESSAGE_STAFF:          ALL_ROLES,
};

// ── Role Helpers ──────────────────────────────────────────────────────────────
export function isStaff(user) {
  return STAFF_ROLES.includes(user?.role);
}

export function isAdmin(user) {
  return user?.role === ROLES.ADMIN;
}

export function isCounselor(user) {
  return user?.role === ROLES.COUNSELOR || user?.role === ROLES.ADMIN;
}

export function isParticipant(user) {
  return user?.role === ROLES.PARTICIPANT || !user?.role;
}

export function hasPermission(user, permission) {
  const allowed = PERMISSIONS[permission];
  if (!allowed) return false;
  return allowed.includes(user?.role) || allowed.includes("*");
}

// ── Default Landing Pages per Role ───────────────────────────────────────────
export function getDefaultPage(user) {
  switch (user?.role) {
    case ROLES.ADMIN:
      return "StaffDashboard";
    case ROLES.COUNSELOR:
    case ROLES.STAFF:
      return "CounselorPortal";
    case ROLES.PROBATION:
      return "ProbationDashboard";
    case ROLES.FAMILY:
      return "FamilyView";
    default:
      return "Home";
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