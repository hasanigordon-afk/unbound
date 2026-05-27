import React, { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Bell,
  Bot,
  Briefcase,
  CalendarDays,
  Car,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Clock,
  FileHeart,
  HeartPulse,
  Home,
  LifeBuoy,
  Lock,
  MapPinned,
  Menu,
  MessageCircle,
  Moon,
  NotebookPen,
  Presentation,
  Shield,
  Sparkles,
  Target,
  Trophy,
  UserRound,
  Users,
  Utensils,
  Wind,
  X,
} from 'lucide-react';
import ReZilientLogo from '@/components/shared/ReZilientLogo';

const menuGroups = [
  { title: 'Home', icon: Home, to: '/', items: [] },
  { title: 'Pilot Demo', icon: Presentation, to: '/PilotDemo', items: [
    ['Counselor Dashboard', '/FacilityPilotDashboard', ClipboardList], ['Client Intake', '/PilotClientIntake', UserRound], ['Aftercare Example', '/AftercarePlanView', FileHeart], ['Privacy-Safe Messages', '/ParticipantMessages', MessageCircle],
  ]},
  { title: 'Profile', icon: UserRound, to: '/Profile', items: [
    ['Overview', '/Profile#overview', UserRound], ['My Progress', '/Profile#progress', Trophy], ['Recovery Score', '/Profile#score', CheckCircle2], ['Goals', '/Profile#goals', Target], ['Roadmap', '/Profile#roadmap', CalendarDays], ['Achievements', '/Profile#achievements', Trophy], ['Journal', '/Profile#journal', NotebookPen], ['Timeline', '/Profile#timeline', Clock], ['Support Circle', '/Profile#support', Users], ['Settings', '/Profile#settings', Lock],
  ]},
  { title: 'Daily Structure', icon: CalendarDays, to: '/JourneyRoadmap', items: [
    ['Today’s Itinerary', '/JourneyRoadmap', Clock], ['Calendar', '/JourneyRoadmap', CalendarDays], ['Reminders', '/JourneyRoadmap', Bell], ['Transportation Help', '/JourneyRoadmap', Car],
  ]},
  { title: 'Recovery Support', icon: LifeBuoy, to: '/JourneyRoadmap', items: [
    ['Daily Check-In', '/WellnessCenter', HeartPulse], ['Meeting Tracker', '/JourneyRoadmap', Users], ['Sponsor / Mentor Contact', '/Community', UserRound], ['Craving Log', '/WellnessCenter', Shield], ['Relapse Prevention Plan', '/WellnessCenter', FileHeart],
  ]},
  { title: 'Resources', icon: MapPinned, to: '/ResourceHub', items: [
    ['Shelters', '/ResourceHub', Shield], ['Food Pantries', '/ResourceHub', Utensils], ['Rehab / IOP', '/ResourceHub', HeartPulse], ['Jobs & Staffing', '/ResourceHub', Briefcase], ['Transportation', '/ResourceHub', Car], ['Veterans Resources', '/ResourceHub', Users],
  ]},
  { title: 'Mental Wellness', icon: Moon, to: '/WellnessCenter', items: [
    ['Meditation', '/WellnessCenter', Sparkles], ['Breathing Tools', '/WellnessCenter', Wind], ['Binaural Beats', '/WellnessCenter', HeartPulse], ['Journaling', '/WellnessCenter', NotebookPen],
  ]},
  { title: 'Community', icon: MessageCircle, to: '/Community', items: [
    ['Ah Ha Moments', '/Community', Sparkles], ['How’d You Do It?', '/Community', MessageCircle], ['Peer Groups', '/Community', Users], ['Encouragement Feed', '/Community', Trophy],
  ]},
  { title: 'Support', icon: Bot, to: '/WellnessCenter', items: [
    ['Wellness Center', '/WellnessCenter', HeartPulse], ['My Aftercare Plan', '/AftercarePlanView', ClipboardList], ['Shared Progress', '/PositiveProgressHub', Trophy], ['Messages', '/ParticipantMessages', MessageCircle],
  ]},

];

export default function MobileSlideOutMenu() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState({ Profile: true });
  const location = useLocation();

  const activeGroup = useMemo(() => menuGroups.find((group) => group.to === location.pathname || group.items.some(([, to]) => to === location.pathname)), [location.pathname]);

  const toggleGroup = (title) => setExpanded((prev) => ({ ...prev, [title]: !prev[title] }));
  const closeMenu = () => setOpen(false);

  return (
    <>
      <button onClick={() => setOpen(true)} aria-label="Open navigation menu" className="h-12 w-12 shrink-0 rounded-2xl border border-amber-300/25 bg-white/10 p-0 text-amber-100 shadow-[0_0_22px_rgba(240,183,83,0.16)]">
        <Menu className="mx-auto h-5 w-5" />
      </button>

      {open && <button aria-label="Close navigation overlay" onClick={closeMenu} className="fixed inset-0 z-50 h-auto min-h-0 rounded-none bg-black/55 p-0 backdrop-blur-sm" />}

      <aside className={`fixed left-0 top-0 z-[60] h-dvh w-[88vw] max-w-[390px] border-r border-amber-200/15 bg-[#07101f]/95 shadow-[18px_0_70px_rgba(0,0,0,0.55)] backdrop-blur-2xl transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-full flex-col">
          <div className="border-b border-white/10 p-5 pt-[calc(18px+env(safe-area-inset-top))]">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <ReZilientLogo className="h-11 w-11" />
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-200/75">ReZilient</p>
                  <h2 className="font-sans text-xl font-black text-white">Navigation</h2>
                </div>
              </div>
              <button onClick={closeMenu} aria-label="Close navigation menu" className="h-11 w-11 rounded-2xl border border-white/10 bg-white/10 p-0 text-slate-200">
                <X className="mx-auto h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto px-4 py-4 pb-[calc(22px+env(safe-area-inset-bottom))]">
            {menuGroups.map((group) => {
              const Icon = group.icon;
              const active = activeGroup?.title === group.title;
              const isExpanded = expanded[group.title];
              const hasItems = group.items.length > 0;

              return (
                <div key={group.title} className={`rounded-[24px] border transition ${active ? 'border-amber-300/65 bg-amber-300/10 shadow-[0_0_24px_rgba(240,183,83,0.16)]' : 'border-white/10 bg-white/[0.055]'}`}>
                  <div className="flex items-center gap-2 p-2">
                    <Link onClick={closeMenu} to={group.to} className="flex min-h-[50px] flex-1 items-center gap-3 rounded-[20px] px-3 text-left active:scale-[0.98]">
                      <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${active ? 'bg-amber-300 text-slate-950' : 'bg-white/10 text-amber-100'}`}><Icon className="h-5 w-5" /></span>
                      <span className="font-sans text-sm font-black text-white">{group.title}</span>
                    </Link>
                    {hasItems && (
                      <button onClick={() => toggleGroup(group.title)} aria-label={`Toggle ${group.title}`} className="h-10 w-10 rounded-2xl border border-white/10 bg-white/10 p-0 text-slate-200">
                        <ChevronDown className={`mx-auto h-4 w-4 transition-transform ${isExpanded ? 'rotate-180 text-amber-200' : ''}`} />
                      </button>
                    )}
                  </div>

                  {hasItems && isExpanded && (
                    <div className="space-y-1 px-4 pb-3">
                      {group.items.map(([label, to, ItemIcon]) => {
                        const itemActive = location.pathname === to;
                        return (
                          <Link key={label} onClick={closeMenu} to={to} className={`flex min-h-[42px] items-center gap-3 rounded-2xl px-3 text-sm font-bold transition active:scale-[0.98] ${itemActive ? 'border border-amber-300/50 bg-amber-300/10 text-amber-100 shadow-[0_0_16px_rgba(240,183,83,0.12)]' : 'text-slate-300 hover:bg-white/8'}`}>
                            <ItemIcon className="h-4 w-4 text-amber-200/80" />
                            {label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </aside>
    </>
  );
}