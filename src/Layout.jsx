import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./pages/utils";
import { Home, Compass, Users, MessageCircle, User, Sparkles, LayoutDashboard } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

const PARTICIPANT_NAV = [
  { name: "Home",       icon: Home,            page: "Home" },
  { name: "Resources",  icon: Compass,         page: "FindHelpNow" },
  { name: "Create",     icon: Sparkles,        page: "EachOneTeachOne" },
  { name: "Community",  icon: Users,           page: "VoicesOfRecovery" },
  { name: "Profile",    icon: User,            page: "Profile" },
];

const STAFF_NAV = [
  { name: "Dashboard",  icon: LayoutDashboard, page: "StaffDashboard" },
  { name: "Caseload",   icon: Users,           page: "CounselorPortal" },
  { name: "Monitor",    icon: Home,            page: "AftercareMonitoring" },
  { name: "Messages",   icon: MessageCircle,   page: "CounselorMessaging" },
  { name: "Profile",    icon: User,            page: "Profile" },
];

const HIDE_NAV_PAGES = [
  "Splash","RoleSelect","GuidedProfileSetup","CounselorGuide","CounselorDashboard",
  "ProbationDashboard","FamilyView","Onboarding","UrgentHelp","ProfessionalPortal",
  "CravingControlCenter","DailyCheckIn","TelehealthHub","EmploymentOpportunities",
  "HousingAssistance","BenefitsAssistance","ComplianceReports","BillingDashboard",
  "EHRIntegration","NJTreatmentFacilities","FacilityAdmin","ResourceHub",
  "VoicesOfRecovery","ContentAdmin","EachOneTeachOne",
];

const STAFF_PAGES = [
  "StaffDashboard","CounselorPortal","AftercareMonitoring","CounselorMessaging",
  "FacilityDashboard","FacilityAdmin","ModerationQueue","ContentAdmin","ComplianceReports",
  "PatientSummaryDashboard","ProbationDashboard",
];

export default function Layout({ children, currentPageName }) {
  const showNav = !HIDE_NAV_PAGES.includes(currentPageName);
  const isStaffPage = STAFF_PAGES.includes(currentPageName);

  const { data: user } = useQuery({
    queryKey: ["layout-user"],
    queryFn: () => base44.auth.me(),
    staleTime: 60_000,
    retry: false,
  });

  const isStaff = user?.role === "admin" || user?.role === "counselor" || user?.role === "staff";
  const navItems = (isStaff || isStaffPage) ? STAFF_NAV : PARTICIPANT_NAV;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0A0F1E' }}>
      <style>{`
        .top-nav-safe { padding-top: env(safe-area-inset-top, 0px); }
      `}</style>
      <style>{`
        :root {
          --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif;
          --primary: #4A90E2;
          --accent: #D4A574;
          --text-primary: #1E1E1E;
          --text-secondary: #5A5A5A;
          --text-muted: #8E8E93;
          --bg-primary: #F5F5F7;
          --bg-secondary: #FFFFFF;
          --bg-card: #FFFFFF;
          --border: #D1D1D6;
          --radius: 6px;
          --spacing-section: 32px;
          --spacing-card: 24px;
          --shadow-subtle: 0 1px 3px rgba(0,0,0,0.04);
        }
        
        * { font-family: var(--font-sans); }
        
        body {
          font-family: var(--font-sans);
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          background: var(--bg-primary);
          color: var(--text-primary);
        }
        
        h1 { font-size: 24px; font-weight: 600; line-height: 1.3; color: var(--text-primary); }
        h2 { font-size: 20px; font-weight: 600; line-height: 1.3; color: var(--text-primary); }
        h3 { font-size: 17px; font-weight: 600; line-height: 1.4; color: var(--text-primary); }
        h4 { font-size: 15px; font-weight: 600; line-height: 1.4; color: var(--text-primary); }
        
        .card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: var(--spacing-card);
          box-shadow: var(--shadow-subtle);
        }
        
        .metric-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 20px;
          box-shadow: var(--shadow-subtle);
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .metric-card .metric-value {
          font-size: 32px;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1;
        }
        .metric-card .metric-label {
          font-size: 13px;
          font-weight: 500;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .btn-primary {
          background: var(--primary);
          color: #FFFFFF;
          border: none;
          border-radius: var(--radius);
          font-weight: 500;
          font-size: 14px;
          padding: 10px 20px;
          transition: opacity 0.15s ease;
          box-shadow: none;
        }
        .btn-primary:hover:not(:disabled) { opacity: 0.85; }
        
        .btn-secondary {
          background: transparent;
          color: var(--text-primary);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          font-weight: 500;
          font-size: 14px;
          padding: 10px 20px;
          transition: background 0.15s ease;
          box-shadow: none;
        }
        .btn-secondary:hover:not(:disabled) { background: rgba(0,0,0,0.03); }
        
        *, *::before, *::after {
          animation-duration: 0s !important;
          transition-duration: 0.15s !important;
        }
        
        svg { stroke-width: 1.5; }
      `}</style>

      {showNav && (
        <nav className="fixed bottom-0 left-0 right-0 z-50" style={{
          background: isStaff || isStaffPage ? 'rgba(15,23,42,0.96)' : 'rgba(10,15,30,0.92)',
          borderTop: isStaff || isStaffPage ? '1px solid rgba(59,130,246,0.2)' : '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)'
        }}>
          {/* Staff mode indicator */}
          {(isStaff || isStaffPage) && (
            <div style={{ background: "rgba(59,130,246,0.1)", borderBottom: "1px solid rgba(59,130,246,0.15)",
              padding: "4px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p style={{ fontSize: 10, color: "rgba(96,165,250,0.8)", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase" }}>
                Staff Portal
              </p>
              <Link to={createPageUrl("Home")} style={{ fontSize: 10, color: "rgba(96,165,250,0.6)", textDecoration: "none" }}>
                Switch to Participant View
              </Link>
            </div>
          )}
          <div className="max-w-lg mx-auto flex">
            {navItems.map(({ name, icon: Icon, page }) => {
              const isActive = currentPageName === page;
              const activeColor = isStaff || isStaffPage ? '#60A5FA' : '#3B82F6';
              return (
                <Link
                  key={page}
                  to={createPageUrl(page)}
                  className="flex-1 flex flex-col items-center gap-1 py-3"
                  style={{ color: isActive ? activeColor : 'rgba(255,255,255,0.4)', textDecoration: 'none' }}
                >
                  <div style={{
                    padding: '4px 12px',
                    borderRadius: 10,
                    background: isActive ? `${activeColor}20` : 'transparent',
                    transition: 'background 0.15s ease',
                  }}>
                    <Icon className="w-5 h-5" strokeWidth={isActive ? 2 : 1.5} />
                  </div>
                  <span className="text-[10px] font-medium">{name}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}

      <div className="flex-1 pb-16">
        {children}
      </div>

      {showNav && (
        <footer className="border-t py-4 px-6 text-center" style={{ background: 'rgba(10,15,30,0.8)', borderColor: 'rgba(255,255,255,0.08)' }}>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Unbound is a support tool, not a medical provider. In an emergency, call 911 or 988.
          </p>
        </footer>
      )}
    </div>
  );
}