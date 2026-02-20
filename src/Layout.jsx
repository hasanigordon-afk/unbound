import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./pages/utils";
import { Home, Users, MapPin, MessageCircle, User, BookOpen, Bot, Sparkles } from "lucide-react";

const NAV_ITEMS = [
  { name: "Home", icon: Home, page: "Home" },
  { name: "Discover", icon: Sparkles, page: "Discover" },
  { name: "Community", icon: Users, page: "Community" },
  { name: "Resources", icon: MapPin, page: "Resources" },
  { name: "Profile", icon: User, page: "Profile" },
];

const HIDE_NAV_PAGES = ["Splash"];

export default function Layout({ children, currentPageName }) {
  const showNav = !HIDE_NAV_PAGES.includes(currentPageName);

  return (
    <div className="min-h-screen" style={{ background: '#0B0F1F' }}>
      <style>{`
        :root {
          --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
          --primary: #2FF3E0;
          --secondary: #7B5CFF;
          --accent: #F4D35E;
          --text-primary: #FFFFFF;
          --text-secondary: rgba(255,255,255,0.7);
          --text-muted: rgba(255,255,255,0.5);
          --bg-primary: #0B0F1F;
          --bg-secondary: #1A1F3A;
          --bg-card: #0F1628;
          --border: rgba(255,255,255,0.1);
          --radius: 12px;
          --spacing-section: 24px;
          --spacing-card: 20px;
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
        h1 { font-size: 28px; font-weight: 700; line-height: 1.2; }
        h2 { font-size: 22px; font-weight: 600; line-height: 1.3; }
        h3 { font-size: 18px; font-weight: 600; line-height: 1.4; }
        h4 { font-size: 16px; font-weight: 600; line-height: 1.4; }
        
        /* Card Styles */
        .card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: var(--spacing-card);
        }
        
        /* Button Styles */
        .btn-primary {
          background: var(--primary);
          color: var(--bg-primary);
          border: none;
          border-radius: var(--radius);
          font-weight: 500;
          transition: opacity 0.15s ease;
        }
        .btn-primary:hover:not(:disabled) { opacity: 0.9; }
        
        .btn-secondary {
          background: transparent;
          color: var(--text-primary);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          font-weight: 500;
          transition: background 0.15s ease;
        }
        .btn-secondary:hover:not(:disabled) { background: rgba(255,255,255,0.05); }
        
        /* Remove animations */
        *, *::before, *::after {
          animation-duration: 0s !important;
          transition-duration: 0.15s !important;
        }
      `}</style>

      {children}

      {showNav && (
        <nav className="fixed bottom-0 left-0 right-0 border-t z-50 pb-safe" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
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
                  <Icon className="w-5 h-5" strokeWidth={2} />
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