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
import React from "react";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { STAFF_ROLES } from "@/lib/roles";

export default function RoleGate({ children, fallback = null, roles, staff, admin, participant, counselor }) {
  const { user, isLoading } = useCurrentUser();

  if (isLoading) return null;

  const role = user?.role || "user";

  // Explicit role list
  if (roles && !roles.includes(role)) return fallback;

  // Convenience flags
  if (staff && !STAFF_ROLES.includes(role)) return fallback;
  if (admin && role !== "admin") return fallback;
  if (counselor && !["admin", "counselor"].includes(role)) return fallback;
  if (participant && STAFF_ROLES.includes(role)) return fallback;

  return children;
}