import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./pages/utils";
import { Home, Compass, Users, User, Brain, LayoutDashboard, MessageCircle } from "lucide-react";
import { useCurrentUser } from "@/lib/useCurrentUser";

const PARTICIPANT_NAV = [
  { name: "Home",       icon: Home,            page: "Home" },
  { name: "Resources",  icon: Compass,         page: "FindHelpNow" },
  { name: "Reset",      icon: Brain,           page: "MentalReset" },
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

  const { user, isStaff } = useCurrentUser();
  const navItems = (isStaff || isStaffPage) ? STAFF_NAV : PARTICIPANT_NAV;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--rebos-bg, #07090F)' }}>
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
        body {
          font-family: var(--font-sans);
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          background: var(--rebos-bg);
          color: var(--rebos-text);
        }

        h1,h2,h3,h4,h5,h6 { font-family: var(--font-sans); letter-spacing: -0.02em; }

        .rebos-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          backdrop-filter: blur(12px);
        }

        .rebos-glow-teal {
          box-shadow: 0 0 24px rgba(45,212,191,0.2), 0 0 8px rgba(45,212,191,0.1);
        }

        .rebos-glow-blue {
          box-shadow: 0 0 24px rgba(99,102,241,0.25), 0 0 8px rgba(99,102,241,0.12);
        }

        .rebos-glow-purple {
          box-shadow: 0 0 24px rgba(139,92,246,0.25);
        }

        svg { stroke-width: 1.5; }
      `}</style>

      {showNav && (
        <nav className="fixed bottom-0 left-0 right-0 z-50" style={{
          background: 'rgba(7,9,15,0.96)',
          borderTop: isStaff || isStaffPage ? '1px solid rgba(99,102,241,0.2)' : '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}>
          {(isStaff || isStaffPage) && (
          <div style={{ background:"rgba(99,102,241,0.08)", borderBottom:"1px solid rgba(99,102,241,0.12)",
            padding:"4px 16px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <p style={{ fontSize:10, color:"rgba(139,92,246,0.8)", fontWeight:700, letterSpacing:".06em", textTransform:"uppercase" }}>
              Staff Portal · Rebos
            </p>
            <Link to={createPageUrl("Home")} style={{ fontSize:10, color:"rgba(139,92,246,0.5)", textDecoration:"none" }}>
              Participant View
            </Link>
          </div>
          )}
          <div className="max-w-lg mx-auto flex">
            {navItems.map(({ name, icon: Icon, page }) => {
              const isActive = currentPageName === page;
              const activeColor = isStaff || isStaffPage ? '#8B5CF6' : '#2DD4BF';
              return (
                <Link
                  key={page}
                  to={createPageUrl(page)}
                  className="flex-1 flex flex-col items-center gap-1 py-3"
                  style={{ color: isActive ? activeColor : 'rgba(255,255,255,0.3)', textDecoration: 'none' }}
                >
                  <div style={{
                    padding: '5px 14px',
                    borderRadius: 12,
                    background: isActive ? `${activeColor}18` : 'transparent',
                    boxShadow: isActive ? `0 0 14px ${activeColor}30` : 'none',
                    transition: 'all 0.2s ease',
                  }}>
                    <Icon className="w-5 h-5" strokeWidth={isActive ? 2.2 : 1.5} />
                  </div>
                  <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500, letterSpacing: '.03em' }}>{name}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}

      <div className="flex-1 pb-20">
        {children}
      </div>

      {showNav && (
        <footer className="border-t py-4 px-6 text-center" style={{ background: 'rgba(7,9,15,0.9)', borderColor: 'rgba(255,255,255,0.05)' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, marginBottom:4 }}>
            <span style={{ fontSize:13, fontWeight:800, color:'#2DD4BF', letterSpacing:'-.02em' }}>Rebos</span>
            <span style={{ fontSize:11, color:'rgba(255,255,255,0.2)', fontWeight:400 }}>by Unbound</span>
          </div>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Support tool only. Emergency: call 911 or 988.
          </p>
        </footer>
      )}
    </div>
  );
}