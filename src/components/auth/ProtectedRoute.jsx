/**
 * ProtectedRoute — wraps pages that require a minimum role level.
 * Redirects unauthorized users to the appropriate page.
 */
import { Navigate } from "react-router-dom";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { STAFF_ROLES, getDashboardPathForRole, normalizeRole } from "@/lib/roles";

export function StaffRoute({ children }) {
  const { user, isLoading } = useCurrentUser();

  if (isLoading) return <LoadingScreen />;
  if (!user) {
    // Redirect to login
    import("@/api/base44Client").then(({ base44 }) => {
      base44.auth.redirectToLogin(window.location.href);
    });
    return <LoadingScreen />;
  }
  if (!STAFF_ROLES.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export function AdminRoute({ children }) {
  const { user, isLoading } = useCurrentUser();

  if (isLoading) return <LoadingScreen />;
  if (!user) {
    import("@/api/base44Client").then(({ base44 }) => {
      base44.auth.redirectToLogin(window.location.href);
    });
    return <LoadingScreen />;
  }
  if (user.role !== "admin") {
    return <Navigate to="/StaffDashboard" replace />;
  }
  return children;
}

export function AuthRoute({ children }) {
  const { user, isLoading } = useCurrentUser();

  if (isLoading) return <LoadingScreen />;
  if (!user) {
    import("@/api/base44Client").then(({ base44 }) => {
      base44.auth.redirectToLogin(window.location.href);
    });
    return <LoadingScreen />;
  }
  return children;
}

export function RoleRoute({ children, roles }) {
  const { user, role, isLoading } = useCurrentUser();

  if (isLoading) return <LoadingScreen />;
  if (!user) {
    import("@/api/base44Client").then(({ base44 }) => {
      base44.auth.redirectToLogin(window.location.href);
    });
    return <LoadingScreen />;
  }

  const allowedRoles = roles.map(normalizeRole);
  if (!allowedRoles.includes(role)) {
    return <Navigate to={getDashboardPathForRole(role)} replace />;
  }

  return children;
}

function LoadingScreen() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "#070D1C",
    }}>
      <div style={{
        width: 36, height: 36,
        border: "3px solid rgba(62,207,191,0.2)",
        borderTopColor: "#3ECFBF",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}