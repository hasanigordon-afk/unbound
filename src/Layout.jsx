import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./pages/utils";
import { Home, CalendarCheck, MessageCircle, TrendingUp, Settings } from "lucide-react";

const NAV_ITEMS = [
  { name: "Home",      icon: Home,          page: "Home" },
  { name: "Check In",  icon: CalendarCheck, page: "DailyCheckIn" },
  { name: "Progress",  icon: TrendingUp,    page: "ClientProgress" },
  { name: "Messages",  icon: MessageCircle, page: "ParticipantMessages" },
  { name: "Settings",  icon: Settings,      page: "ClientSettings" },
];



const HIDE_NAV_PAGES = ["Splash", "RoleSelect", "CounselorDashboard", "ProbationDashboard", "FamilyView", "Onboarding", "UrgentHelp", "ProfessionalPortal", "CravingControlCenter"];

export default function Layout({ children, currentPageName }) {
  const showNav = !HIDE_NAV_PAGES.includes(currentPageName);
  const showFooter = !HIDE_NAV_PAGES.includes(currentPageName);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F5F5F7' }}>
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
        <nav className="fixed bottom-0 left-0 right-0 border-t z-50" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
          <div className="max-w-lg mx-auto flex">
            {NAV_ITEMS.map(({ name, icon: Icon, page }) => {
              const isActive = currentPageName === page;
              return (
                <Link
                  key={page}
                  to={createPageUrl(page)}
                  className="flex-1 flex flex-col items-center gap-1 py-3"
                  style={{ color: isActive ? 'var(--primary)' : 'var(--text-muted)' }}
                >
                  <Icon className="w-5 h-5" strokeWidth={isActive ? 2 : 1.5} />
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
        <footer className="border-t py-4 px-6 text-center" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Unbound is a support tool, not a medical provider. In an emergency, call 911 or 988.
          </p>
        </footer>
      )}
    </div>
  );
}