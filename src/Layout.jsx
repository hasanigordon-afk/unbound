import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./pages/utils";
import { Home, Users, MapPin, User, Sparkles, Phone } from "lucide-react";

const NAV_ITEMS = [
  { name: "Home", icon: Home, page: "Home" },
  { name: "Community", icon: Users, page: "Community" },
  { name: "Lifeline", icon: Phone, page: "Lifeline", isLifeline: true },
  { name: "Resources", icon: MapPin, page: "Resources" },
  { name: "Profile", icon: User, page: "Profile" },
];

const HIDE_NAV_PAGES = ["Splash"];

export default function Layout({ children, currentPageName }) {
  const showNav = !HIDE_NAV_PAGES.includes(currentPageName);
  const showFooter = !HIDE_NAV_PAGES.includes(currentPageName);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F5F5F7' }}>
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

      <div className="flex-1 pb-20">
        {children}
      </div>

      {showFooter && (
        <footer className="border-t py-4 px-6 text-center" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', marginTop: 'auto' }}>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Unbound is a behavioral engagement platform. It does not provide medical treatment.
          </p>
        </footer>
      )}

      {showNav && (
        <nav className="fixed bottom-0 left-0 right-0 border-t z-50 pb-safe" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
          <div className="max-w-lg mx-auto flex">
            {NAV_ITEMS.map(({ name, icon: Icon, page, isLifeline }) => {
              const isActive = currentPageName === page;
              if (isLifeline) {
                return (
                  <Link
                    key={page}
                    to={createPageUrl(page)}
                    className="flex-1 flex flex-col items-center gap-1 py-2"
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center -mt-5"
                      style={{ background: isActive ? '#c0392b' : '#E85D4C', boxShadow: '0 4px 14px rgba(232,93,76,0.5)' }}
                    >
                      <Icon className="w-5 h-5 text-white" strokeWidth={2} />
                    </div>
                    <span className="text-[10px] font-semibold" style={{ color: '#E85D4C' }}>{name}</span>
                  </Link>
                );
              }
              return (
                <Link
                  key={page}
                  to={createPageUrl(page)}
                  className="flex-1 flex flex-col items-center gap-1 py-3"
                  style={{ color: isActive ? 'var(--primary)' : 'var(--text-muted)' }}
                >
                  <Icon className="w-5 h-5" strokeWidth={1.5} />
                  <span className="text-[10px] font-medium">{name}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}