/**
 * RoleGate — conditionally renders children based on user role.
 * Use this for inline role-based UI (showing/hiding elements).
 * 
 * Usage:
 *   <RoleGate roles={["admin","counselor"]}>
 *     <AdminPanel />
 *   </RoleGate>
 * 
 *   <RoleGate staff>
 *     <StaffOnlyButton />
 *   </RoleGate>
 * 
 *   <RoleGate participant fallback={<p>Staff only</p>}>
 *     ...
 *   </RoleGate>
 */
import { useCurrentUser } from "@/lib/useCurrentUser";
import { STAFF_ROLES, normalizeRole, ROLES } from "@/lib/roles";

export default function RoleGate({ children, fallback = null, roles, staff, admin, participant, counselor }) {
  const { user, isLoading } = useCurrentUser();

  if (isLoading) return null;

  const role = normalizeRole(user?.role);

  // Explicit role list
  if (roles && !roles.map(normalizeRole).includes(role)) return fallback;

  // Convenience flags
  if (staff && !STAFF_ROLES.map(normalizeRole).includes(role)) return fallback;
  if (admin && role !== ROLES.FACILITY_ADMIN) return fallback;
  if (counselor && ![ROLES.FACILITY_ADMIN, ROLES.COUNSELOR].includes(role)) return fallback;
  if (participant && role !== ROLES.CLIENT) return fallback;

  return children;
}