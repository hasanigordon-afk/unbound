/**
 * useCurrentUser — central hook for accessing the authenticated user
 * and their role/permission state throughout the app.
 */
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { isStaff, isAdmin, isCounselor, isParticipant, hasPermission, isSupportUser, isClientRole } from "@/lib/roles";
import { appParams } from "@/lib/app-params";
import { hasBase44AppId } from "@/lib/demoRoutes";

export function useCurrentUser() {
  const canQueryUser = hasBase44AppId(appParams.appId);
  const { data: user, isLoading, error, refetch } = useQuery({
    queryKey: ["current-user"],
    queryFn: () => canQueryUser ? base44.auth.me() : null,
    enabled: canQueryUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  return {
    user,
    isLoading,
    error,
    refetch,
    // Role shortcuts
    isStaff:       isStaff(user),
    isAdmin:       isAdmin(user),
    isCounselor:   isCounselor(user),
    isParticipant: isParticipant(user),
    isSupportUser: isSupportUser(user),
    isClientRole:  isClientRole(user),
    // Permission checker
    can: (permission) => hasPermission(user, permission),
    // Auth state
    isAuthenticated: !!user,
    role: user?.role || "user",
  };
}