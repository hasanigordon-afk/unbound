import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HeartHandshake, Home, MapPinned, MessageSquare, Route, Smartphone, UserRound } from 'lucide-react';
import ReZilientLogo from '@/components/shared/ReZilientLogo';
import MobileSlideOutMenu from '@/components/navigation/MobileSlideOutMenu';

const tabs = [
  { label: 'Home', to: '/', icon: Home },
  { label: 'Journey', to: '/Journey', icon: Route },
  { label: 'Resources', to: '/ResourceHub', icon: MapPinned },
  { label: 'Community', to: '/Community', icon: MessageSquare },
  { label: 'Support', to: '/AICompanion', icon: HeartHandshake },
];

export default function PilotShell({ children, title = 'ReZilient', subtitle }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-transparent text-white pb-28">
      <header className="sticky top-0 z-30 px-4 pt-[calc(14px+env(safe-area-inset-top))] pb-3 backdrop-blur-2xl bg-[#07101f]/80 border-b border-white/10">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <MobileSlideOutMenu />
            <ReZilientLogo className="h-12 w-12" />
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-blue-200/70 font-bold">ReZilient</p>
              <h1 className="text-2xl font-semibold tracking-tight font-sans">{title}</h1>
              {subtitle && <p className="text-sm text-slate-300 mt-1">{subtitle}</p>}
            </div>
          </div>
          <Link to="/AddToHomeScreen" className="w-12 h-12 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center active:scale-95 transition">
            <Smartphone className="w-5 h-5" />
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-5">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-[calc(10px+env(safe-area-inset-bottom))] pt-2 bg-[#07101f]/85 backdrop-blur-2xl border-t border-white/10">
        <div className="max-w-md mx-auto grid grid-cols-5 gap-1 rounded-[28px] bg-white/8 border border-white/10 p-1.5 shadow-2xl">
          {tabs.map(({ label, to, icon: Icon }) => {
            const active = location.pathname === to || (to === '/' && location.pathname === '/');
            return (
              <Link key={to} to={to} className={`min-h-[58px] rounded-3xl flex flex-col items-center justify-center gap-1 text-[10px] font-bold transition active:scale-95 ${active ? 'bg-white text-slate-950 shadow-lg' : 'text-slate-300'}`}>
                <Icon className="w-5 h-5" />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}