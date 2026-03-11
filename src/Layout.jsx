import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./pages/utils";
import { Home, Compass, Users, MessageCircle, User } from "lucide-react";

const NAV_ITEMS = [
  { name: "Home",       icon: Home,          page: "Home" },
  { name: "Map",        icon: Compass,       page: "SecondChanceMap" },
  { name: "Mentorship", icon: Users,         page: "Mentors" },
  { name: "Messages",   icon: MessageCircle, page: "ParticipantMessages" },
  { name: "Profile",    icon: User,          page: "Profile" },
];



const HIDE_NAV_PAGES = ["Splash", "RoleSelect", "CounselorDashboard", "ProbationDashboard", "FamilyView", "Onboarding", "UrgentHelp", "ProfessionalPortal", "CravingControlCenter", "DailyCheckIn"];

export default function Layout({ children, currentPageName }) {
  const showNav = !HIDE_NAV_PAGES.includes(currentPageName);
  const showFooter = !HIDE_NAV_PAGES.includes(currentPageName);

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
        
        * {
          font-family: var(--font-sans);
        }
        
        body {
          font-family: var(--font-sans);
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          background: var(--bg-primary);
          color: var(--text-primary);
        }
        
        /* Typography Scale */
        h1 { font-size: 24px; font-weight: 600; line-height: 1.3; color: var(--text-primary); }
        h2 { font-size: 20px; font-weight: 600; line-height: 1.3; color: var(--text-primary); }
        h3 { font-size: 17px; font-weight: 600; line-height: 1.4; color: var(--text-primary); }
        h4 { font-size: 15px; font-weight: 600; line-height: 1.4; color: var(--text-primary); }
        
        /* Card Styles */
        .card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: var(--spacing-card);
          box-shadow: var(--shadow-subtle);
        }
        
        /* Metric Card */
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
        
        /* Button Styles */
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
        
        /* Remove animations */
        *, *::before, *::after {
          animation-duration: 0s !important;
          transition-duration: 0.15s !important;
        }
        
        /* Icon standardization */
        svg {
          stroke-width: 1.5;
        }
      `}</style>

      {showNav && (
        <nav className="fixed bottom-0 left-0 right-0 z-50" style={{
          background: 'rgba(10,15,30,0.92)',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)'
        }}>
          <div className="max-w-lg mx-auto flex">
            {NAV_ITEMS.map(({ name, icon: Icon, page }) => {
              const isActive = currentPageName === page;
              return (
                <Link
                  key={page}
                  to={createPageUrl(page)}
                  className="flex-1 flex flex-col items-center gap-1 py-3"
                  style={{ color: isActive ? '#3B82F6' : 'rgba(255,255,255,0.4)', textDecoration: 'none' }}
                >
                  <div style={{
                    padding: '4px 12px',
                    borderRadius: 10,
                    background: isActive ? 'rgba(59,130,246,0.15)' : 'transparent',
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

      {showFooter && (
        <footer className="border-t py-4 px-6 text-center" style={{ background: 'rgba(10,15,30,0.8)', borderColor: 'rgba(255,255,255,0.08)' }}>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Unbound is a support tool, not a medical provider. In an emergency, call 911 or 988.
          </p>
        </footer>
      )}
    </div>
  );
}