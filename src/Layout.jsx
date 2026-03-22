import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home, Compass, Users, MessageCircle, User, LayoutDashboard,
  Shield, Activity, Calendar, BookOpen, Sparkles
} from "lucide-react";
import { useCurrentUser } from "@/lib/useCurrentUser";

// ── Nav config ────────────────────────────────────────────────────────────────
const PARTICIPANT_NAV = [
  { label: "Home",      icon: Home,           path: "/" },
  { label: "Resources", icon: Compass,        path: "/FindHelpNow" },
  { label: "Create",    icon: Sparkles,       path: "/EachOneTeachOne" },
  { label: "Community", icon: Users,          path: "/VoicesOfRecovery" },
  { label: "Profile",   icon: User,           path: "/Profile" },
];

const STAFF_NAV = [
  { label: "Dashboard",  icon: LayoutDashboard, path: "/StaffDashboard" },
  { label: "Caseload",   icon: Users,           path: "/CounselorPortal" },
  { label: "Monitor",    icon: Activity,        path: "/AftercareMonitoring" },
  { label: "Messages",   icon: MessageCircle,   path: "/CounselorMessaging" },
  { label: "Profile",    icon: User,            path: "/Profile" },
];

// Pages that should hide the bottom nav
const HIDE_NAV_PAGES = new Set([
  "Splash","RoleSelect","GuidedProfileSetup","Onboarding",
  "UrgentHelp","CravingControlCenter","DailyCheckIn",
  "ProbationDashboard","FamilyView","ProfessionalPortal",
  "TelehealthHub","EmploymentOpportunities","HousingAssistance",
  "BenefitsAssistance","ComplianceReports","BillingDashboard",
  "EHRIntegration","NJTreatmentFacilities","FacilityAdmin",
  "ResourceHub","VoicesOfRecovery","ContentAdmin","EachOneTeachOne",
]);

// Pages that should use staff nav styling
const STAFF_PAGES = new Set([
  "StaffDashboard","CounselorPortal","AftercareMonitoring","CounselorMessaging",
  "FacilityDashboard","FacilityAdmin","ModerationQueue","ContentAdmin",
  "ComplianceReports","PatientSummaryDashboard","ProbationDashboard",
  "ProbationOfficerDashboard",
]);

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const { user, isStaff } = useCurrentUser();

  const showNav = !HIDE_NAV_PAGES.has(currentPageName);
  const isStaffPage = STAFF_PAGES.has(currentPageName);
  const useStaffNav = isStaff || isStaffPage;

  const navItems = useStaffNav ? STAFF_NAV : PARTICIPANT_NAV;

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const accentColor = useStaffNav ? "#60A5FA" : "#3ECFBF";

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0A0F1E" }}>
      {/* Global font smoothing */}
      <style>{`
        * { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
        body { background: #0A0F1E; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
      `}</style>

      {/* ── Bottom Nav ── */}
      {showNav && (
        <nav
          className="fixed bottom-0 left-0 right-0 z-50"
          style={{
            background: useStaffNav ? "rgba(10,20,40,0.97)" : "rgba(8,13,26,0.97)",
            borderTop: `1px solid ${useStaffNav ? "rgba(96,165,250,0.15)" : "rgba(62,207,191,0.12)"}`,
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
          }}
        >
          {useStaffNav && (
            <div style={{
              background: "rgba(59,130,246,0.08)",
              borderBottom: "1px solid rgba(59,130,246,0.12)",
              padding: "4px 20px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <p style={{ fontSize: 10, color: "rgba(96,165,250,0.7)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em" }}>
                Staff Portal
              </p>
              <Link to="/" style={{ fontSize: 10, color: "rgba(96,165,250,0.5)", textDecoration: "none" }}>
                Participant View
              </Link>
            </div>
          )}

          <div className="max-w-lg mx-auto flex">
            {navItems.map(({ label, icon: Icon, path }) => {
              const active = isActive(path);
              return (
                <Link
                  key={path}
                  to={path}
                  className="flex-1 flex flex-col items-center gap-0.5 py-2.5"
                  style={{
                    textDecoration: "none",
                    color: active ? accentColor : "rgba(255,255,255,0.35)",
                  }}
                >
                  <div style={{
                    padding: "4px 14px",
                    borderRadius: 10,
                    background: active ? `${accentColor}18` : "transparent",
                  }}>
                    <Icon className="w-5 h-5" strokeWidth={active ? 2 : 1.5} />
                  </div>
                  <span style={{ fontSize: 10, fontWeight: active ? 700 : 500 }}>{label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}

      {/* ── Page Content ── */}
      <div className="flex-1" style={{ paddingBottom: showNav ? 72 : 0 }}>
        {children}
      </div>

      {/* ── Disclaimer footer (only on nav pages) ── */}
      {showNav && (
        <footer
          className="fixed bottom-0 left-0 right-0"
          style={{ zIndex: 49, pointerEvents: "none" }}
        >
          {/* Handled by nav bar above */}
        </footer>
      )}
    </div>
  );
}