import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./pages/utils";
import { Home, Users, MapPin, MessageCircle, User } from "lucide-react";

const NAV_ITEMS = [
  { name: "Home", icon: Home, page: "Home" },
  { name: "Mentors", icon: Users, page: "Mentors" },
  { name: "Resources", icon: MapPin, page: "Resources" },
  { name: "Messages", icon: MessageCircle, page: "Messages" },
  { name: "Profile", icon: User, page: "Profile" },
];

const HIDE_NAV_PAGES = ["Onboarding"];

export default function Layout({ children, currentPageName }) {
  const showNav = !HIDE_NAV_PAGES.includes(currentPageName);

  return (
    <div className="min-h-screen bg-slate-50">
      <style>{`
        :root {
          --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        body {
          font-family: var(--font-sans);
          -webkit-font-smoothing: antialiased;
        }
      `}</style>

      {children}

      {showNav && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-200 z-50 pb-safe">
          <div className="max-w-lg mx-auto flex">
            {NAV_ITEMS.map(({ name, icon: Icon, page }) => {
              const isActive = currentPageName === page;
              return (
                <Link
                  key={page}
                  to={createPageUrl(page)}
                  className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
                    isActive ? "text-teal-600" : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                  <span className={`text-[10px] font-medium ${isActive ? "text-teal-600" : "text-slate-400"}`}>
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