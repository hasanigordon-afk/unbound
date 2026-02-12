import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./pages/utils";
import { Home, Users, MapPin, MessageCircle, User, BookOpen, Bot } from "lucide-react";

const NAV_ITEMS = [
  { name: "Home", icon: Home, page: "Home" },
  { name: "Support", icon: Bot, page: "SupportChat" },
  { name: "Resources", icon: MapPin, page: "Resources" },
  { name: "Mentors", icon: Users, page: "Mentors" },
  { name: "Profile", icon: User, page: "Profile" },
];

const HIDE_NAV_PAGES = ["Onboarding"];

export default function Layout({ children, currentPageName }) {
  const showNav = !HIDE_NAV_PAGES.includes(currentPageName);

  return (
    <div className="min-h-screen" style={{ background: '#0B0F1F' }}>
      <style>{`
        :root {
          --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        body {
          font-family: var(--font-sans);
          -webkit-font-smoothing: antialiased;
          background: #0B0F1F;
          color: #FFFFFF;
        }
        .glass-card {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(20px);
          box-shadow: 0 0 40px rgba(123,92,255,0.25), 0 0 12px rgba(47,243,224,0.15);
          border-radius: 18px;
        }
      `}</style>

      {children}

      {showNav && (
        <nav className="fixed bottom-0 left-0 right-0 backdrop-blur-xl border-t z-50 pb-safe" style={{ background: 'rgba(26, 31, 58, 0.8)', borderColor: 'rgba(255,255,255,0.1)' }}>
          <div className="max-w-lg mx-auto flex">
            {NAV_ITEMS.map(({ name, icon: Icon, page }) => {
              const isActive = currentPageName === page;
              return (
                <Link
                  key={page}
                  to={createPageUrl(page)}
                  className="flex-1 flex flex-col items-center gap-1 py-3 transition-colors"
                  style={{ color: isActive ? '#2FF3E0' : 'rgba(255,255,255,0.5)' }}
                >
                  <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[10px] font-medium">
                    {name}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}