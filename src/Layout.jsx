import React from "react";
import { Link } from "react-router-dom";
import { Home, Compass, Sparkles, Users, User } from "lucide-react";
import EmergencyFAB from "@/components/shared/EmergencyFAB";
import DonateFAB from "@/components/shared/DonateFAB";

const NAV = [
  { name: "Home",      icon: Home,     page: "Home",          href: "/" },
  { name: "Resources", icon: Compass,  page: "RecoveryHub",   href: "/RecoveryHub" },
  { name: "Mentor",    icon: Sparkles, page: "SuperAgent",    href: "/SuperAgent", center: true },
  { name: "Community", icon: Users,    page: "AhHaCommunity", href: "/AhHaCommunity" },
  { name: "Profile",   icon: User,     page: "Profile",       href: "/Profile" },
];

const HIDE_NAV_PAGES = [
  "Splash","RoleSelect","GuidedProfileSetup","CounselorGuide","CounselorDashboard",
  "ProbationDashboard","FamilyView","Onboarding","UrgentHelp","ProfessionalPortal",
  "CravingControlCenter","DailyCheckIn","TelehealthHub","EmploymentOpportunities",
  "HousingAssistance","BenefitsAssistance","ComplianceReports","BillingDashboard",
  "EHRIntegration","NJTreatmentFacilities","FacilityAdmin","ResourceHub",
  "VoicesOfRecovery","ContentAdmin","EachOneTeachOne",
];

export default function Layout({ children, currentPageName }) {
  const showNav = !HIDE_NAV_PAGES.includes(currentPageName);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "transparent" }}>

      <div className="flex-1" style={{ paddingBottom: showNav ? 110 : 24 }}>
        {children}
      </div>

      {showNav && <EmergencyFAB />}
      <DonateFAB />

      {showNav && (
        <nav aria-label="Primary" style={{
          position: "fixed",
          left: "50%", bottom: 18, transform: "translateX(-50%)",
          zIndex: 50,
          width: "calc(100% - 24px)", maxWidth: 460,
          padding: "10px 8px",
          background: "linear-gradient(180deg, rgba(20,26,45,0.78), rgba(13,18,32,0.70))",
          border: "1px solid var(--border-glow)",
          borderRadius: 999,
          backdropFilter: "blur(30px) saturate(170%)",
          WebkitBackdropFilter: "blur(30px) saturate(170%)",
          boxShadow: "var(--glow), 0 18px 44px rgba(0,0,0,0.52), inset 0 1px 0 rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          paddingBottom: "calc(10px + env(safe-area-inset-bottom, 0px))",
        }}>
          {NAV.map(({ name, icon: Icon, page, href, center }) => {
            const isActive = currentPageName === page;
            if (center) {
              return (
                <Link key={page} to={href} aria-label={name} style={{
                  textDecoration: "none",
                  flexShrink: 0,
                  marginTop: -28,
                }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: "50%",
                    background: "linear-gradient(135deg, var(--accent), var(--purple))",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff",
                    border: "1px solid var(--border-glow)",
                    boxShadow: "var(--glow), 0 8px 22px rgba(0,0,0,0.35)",
                    animation: "navCenterPulse 3s ease-in-out infinite",
                    position: "relative",
                  }}>
                    <span aria-hidden style={{
                      position: "absolute", inset: -6, borderRadius: "50%",
                      background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)",
                      opacity: 0.55, filter: "blur(6px)",
                      animation: "navCenterHalo 2.6s ease-in-out infinite",
                      pointerEvents: "none",
                    }} />
                    <Icon style={{ width: 22, height: 22, position: "relative" }} strokeWidth={2.2} />
                  </div>
                </Link>
              );
            }
            return (
              <Link
                key={page}
                to={href}
                aria-label={name}
                style={{
                  flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
                  gap: 3, padding: "6px 0",
                  textDecoration: "none",
                  color: isActive ? "var(--accent)" : "var(--text-muted)",
                  transition: "color .18s",
                  position: "relative",
                }}
              >
                <div style={{
                  padding: "5px 12px", borderRadius: 12,
                  background: isActive ? "var(--navy-dim)" : "transparent",
                  border: isActive ? "1px solid var(--border-glow)" : "1px solid transparent",
                  boxShadow: isActive ? "var(--glow)" : "none",
                  transition: "all .22s cubic-bezier(.22,1,.36,1)",
                }}>
                  <Icon style={{ width: 18, height: 18 }} strokeWidth={isActive ? 2.2 : 1.6} />
                </div>
                <span style={{
                  fontSize: 9.5,
                  fontWeight: isActive ? 700 : 500,
                  letterSpacing: ".08em",
                  textTransform: "uppercase",
                  fontFamily: "'Space Grotesk', 'DM Sans', sans-serif",
                }}>{name}</span>
              </Link>
            );
          })}

          <style>{`
            @keyframes navCenterPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05); } }
            @keyframes navCenterHalo  { 0%,100% { transform: scale(1); opacity: .55; } 50% { transform: scale(1.3); opacity: .85; } }
          `}</style>
        </nav>
      )}
    </div>
  );
}