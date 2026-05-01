import React from "react";
import { Link } from "react-router-dom";
import { Home, LifeBuoy, Star, Heart, User } from "lucide-react";
import { useCurrentUser } from "@/lib/useCurrentUser";
import DonateButton from "@/components/donate/DonateButton";
import AhHaLogo from "@/components/shared/AhHaLogo";
import EmergencyFAB from "@/components/shared/EmergencyFAB";
import DonateFAB from "@/components/shared/DonateFAB";

const PARTICIPANT_NAV = [
  { name: "Home",    icon: Home,     page: "Home",       href: "/" },
  { name: "Help",    icon: LifeBuoy, page: "HelpHub",    href: "/HelpHub" },
  { name: "Hope",    icon: Star,     page: "HopeHub",    href: "/HopeHub" },
  { name: "Healing", icon: Heart,    page: "HealingHub", href: "/HealingHub" },
  { name: "Profile", icon: User,     page: "Profile",    href: "/Profile" },
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
  const { user } = useCurrentUser();
  const navItems = PARTICIPANT_NAV;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)" }}>

      <div className="flex-1 pb-20">
        {children}
      </div>

      {showNav && <EmergencyFAB />}
      <DonateFAB />

      {showNav && (
        <nav style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
          background: "rgba(255,255,255,0.97)",
          borderTop: "1px solid #E5EEF1",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}>
          <div style={{ maxWidth: 480, margin: "0 auto", display: "flex" }}>
            {navItems.map(({ name, icon: Icon, page, href }) => {
              const isActive = currentPageName === page;
              return (
                <Link
                  key={page}
                  to={href || "/"}
                  style={{
                    flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
                    gap: 4, paddingTop: 10, paddingBottom: 10,
                    color: isActive ? "var(--amber)" : "var(--text-dim)", textDecoration: "none",
                  }}
                >
                  <div style={{
                    padding: "5px 14px", borderRadius: 10,
                    background: isActive ? "var(--sand-dim)" : "transparent",
                    transition: "all 0.2s ease",
                  }}>
                    <Icon style={{ width: 20, height: 20 }} strokeWidth={isActive ? 2 : 1.5} />
                  </div>
                  <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500, letterSpacing: ".03em", fontFamily: "'DM Sans', sans-serif" }}>{name}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}

      {showNav && (
        <footer style={{
          borderTop: "1px solid var(--border)", padding: "16px 24px",
          textAlign: "center", background: "var(--bg)", paddingBottom: 90,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
            <AhHaLogo size={28} />
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
            <DonateButton variant="ghost" label="Support the Mission" />
          </div>
          <p style={{ fontSize: 11, color: "var(--text-dim)", lineHeight: 1.6 }}>
            Re-siliant — Rebuild. Recover. Rise.<br/>
            Support tool only. In a crisis, call 911 or 988.
          </p>
        </footer>
      )}
    </div>
  );
}