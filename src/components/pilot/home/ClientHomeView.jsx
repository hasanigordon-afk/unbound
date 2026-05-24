import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, CalendarDays, Car, CheckCircle2, Flame, HeartPulse, MessageCircle, Play, ShieldCheck, Star, Target, Trophy, Users } from 'lucide-react';
import {
  AICompanionCarouselSection,
  MissionCarouselSection,
  PillarsCarouselSection,
  ResourceCarouselSection,
  RoadmapCarouselSection,
  SupportCarouselSection,
  WinsCarouselSection,
} from './CarouselHomeSections';
import HomeSectionHeader from './HomeSectionHeader';

const roleCopy = {
  client: {
    name: 'Marcus',
    title: 'Your comeback is already in motion.',
    focus: 'Therapy at 10:30, job applications at 2:00, NA at 7:00.',
    score: 86,
    streak: 14,
    support: 'Sponsor Darnell checked in 22 min ago.',
  },
  sponsor: {
    name: 'Darnell',
    title: 'Support that shows up at the right time.',
    focus: 'Call Marcus after his evening meeting and celebrate the job application win.',
    score: 82,
    streak: 9,
    support: 'Two encouragement notes sent this week.',
  },
  po: {
    name: 'Officer Lee',
    title: 'Progress, structure, and accountability.',
    focus: 'Marcus has court transport confirmed and probation check-in Wednesday at 11:00.',
    score: 78,
    streak: 11,
    support: 'Compliance packet updated this morning.',
  },
  mentor: {
    name: 'Andre',
    title: 'Turn goals into practical next steps.',
    focus: 'Review resume draft, mock interview, and Goodwill workforce appointment.',
    score: 88,
    streak: 18,
    support: 'Career goal moved from planning to action.',
  },
  veteran: {
    name: 'Elena',
    title: 'Mission continues. Support is coordinated.',
    focus: 'VA benefits call at noon, peer group tonight, housing application follow-up.',
    score: 91,
    streak: 21,
    support: 'Veteran mentor group active today.',
  },
};

const focusItems = [
  { time: '10:30 AM', title: 'Outpatient therapy', meta: 'Riverfront Wellness · ride leaves 9:55', icon: CalendarDays },
  { time: '2:00 PM', title: 'Employment block', meta: 'Apply to Newark Works and call Integrity Staffing', icon: Target },
  { time: '7:00 PM', title: 'NA meeting', meta: 'Hope Hall, 212 Market St · saved route', icon: Users },
];

const seeConversions = [
  ['Calendar events', 'Therapy Monday 3 PM, NA Tue/Fri 7 PM'],
  ['Transportation', 'Ride requests and leave-time reminders'],
  ['Reminders', 'Push prompts before meetings and check-ins'],
  ['Tasks', 'Weekday job search and gym three times weekly'],
  ['Aftercare planning', 'Roadmap, milestones, risk flags, support loop'],
];

const progress = [
  ['Housing applications', 64],
  ['Meeting consistency', 92],
  ['Employment actions', 58],
  ['Support contact', 88],
];

function GlassStat({ icon: Icon, label, value, tone = 'blue' }) {
  const toneClass = tone === 'gold' ? 'text-amber-200' : tone === 'green' ? 'text-emerald-200' : 'text-blue-200';
  return (
    <div className="rounded-[26px] border border-white/10 bg-white/8 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.08)] backdrop-blur-2xl">
      <Icon className={`h-5 w-5 ${toneClass}`} />
      <p className="mt-3 font-sans text-3xl font-black text-white">{value}</p>
      <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">{label}</p>
    </div>
  );
}

function TodayFocusCard({ role }) {
  return (
    <section className="card-glow relative overflow-hidden p-5 sm:p-7">
      <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-amber-300/20 blur-3xl" />
      <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-cyan-300/14 blur-3xl" />
      <div className="relative">
        <p className="text-xs font-black uppercase tracking-[0.26em] text-amber-200">Today's Focus</p>
        <h1 className="mt-2 font-sans text-4xl font-black leading-[.98] tracking-tight text-white sm:text-6xl">{role.title}</h1>
        <p className="mt-4 max-w-2xl text-base font-bold leading-relaxed text-slate-300">{role.focus}</p>
        <div className="mt-6 grid grid-cols-3 gap-2">
          <GlassStat icon={HeartPulse} label="Recovery score" value={role.score} tone="green" />
          <GlassStat icon={Flame} label="Daily streak" value={`${role.streak}d`} tone="gold" />
          <GlassStat icon={ShieldCheck} label="Risk level" value="Low" />
        </div>
        <div className="mt-5 space-y-3">
          {focusItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex items-center gap-3 rounded-[24px] border border-white/10 bg-black/20 p-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10"><Icon className="h-5 w-5 text-white" /></div>
                <div className="min-w-0 flex-1">
                  <p className="font-black text-white">{item.time} · {item.title}</p>
                  <p className="truncate text-xs font-bold text-slate-400">{item.meta}</p>
                </div>
                <CheckCircle2 className="h-5 w-5 text-emerald-200" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function SeeCenterpiece() {
  return (
    <section className="card relative overflow-hidden p-5 sm:p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(240,183,83,.18),transparent_32%),radial-gradient(circle_at_100%_20%,rgba(91,141,239,.22),transparent_34%)]" />
      <div className="relative">
        <HomeSectionHeader eyebrow="S.E.E. AI" title="Describe your goals or schedule" subtitle="Structure · Engagement · Empowerment turns natural language into aftercare action." />
        <div className="rounded-[30px] border border-white/10 bg-[#050914]/70 p-4 shadow-inner">
          <p className="text-sm font-bold leading-relaxed text-slate-300">
            "NA Tuesday and Friday at 7pm. Therapy Monday at 3pm. Job search every weekday. Gym three times weekly. Need rides to court and IOP."
          </p>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-5">
          {seeConversions.map(([title, body]) => (
            <div key={title} className="rounded-[22px] border border-white/10 bg-white/8 p-3">
              <p className="text-sm font-black text-white">{title}</p>
              <p className="mt-1 text-xs font-bold leading-relaxed text-slate-400">{body}</p>
            </div>
          ))}
        </div>
        <Link to="/SEESuperAgent" className="btn-gold mt-5 inline-flex min-h-[58px] items-center gap-2 px-6 text-sm">
          <Bot className="h-5 w-5" />
          Build with S.E.E.
        </Link>
      </div>
    </section>
  );
}

function ProgressVisuals() {
  return (
    <section className="card p-5 sm:p-6">
      <HomeSectionHeader eyebrow="Momentum" title="Progress you can feel" subtitle="Warm, positive signals that show life rebuilding without shame." />
      <div className="grid gap-3 sm:grid-cols-2">
        {progress.map(([label, value]) => (
          <div key={label} className="rounded-[24px] border border-white/10 bg-white/8 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-black text-white">{label}</p>
              <p className="text-sm font-black text-amber-200">{value}%</p>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-amber-300 via-emerald-300 to-cyan-300 shadow-[0_0_18px_rgba(240,183,83,.28)]" style={{ width: `${value}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SpotifyStrip() {
  const cards = [
    ['Tonight at 7 PM', 'NA at Hope Hall', Users, '/MeetingDirectory'],
    ['Ride confirmed', 'Court check-in route', Car, '/RecoveryMapFinder'],
    ['Call Darnell', 'Sponsor touchpoint', MessageCircle, '/InnerCircle'],
    ['Proud moment', 'Fourteen-day streak', Trophy, '/PositiveProgressHub'],
    ['Play reset audio', 'Four-minute calm track', Play, '/ResetButton'],
    ['Next goal', 'Apply to Newark Works', Star, '/TopFiveNonNegotiables'],
  ];
  return (
    <section className="py-1">
      <HomeSectionHeader eyebrow="Comeback queue" title="Keep moving" subtitle="Spotify-style action cards with real next steps ready to tap." />
      <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2">
        {cards.map(([kicker, title, Icon, to]) => (
          <Link key={title} to={to} className="min-w-[178px] rounded-[28px] border border-white/10 bg-gradient-to-br from-white/14 to-white/5 p-4 shadow-[0_18px_48px_rgba(0,0,0,.28)] backdrop-blur-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/12"><Icon className="h-6 w-6 text-white" /></div>
            <p className="mt-4 text-[10px] font-black uppercase tracking-[0.18em] text-amber-200">{kicker}</p>
            <p className="mt-1 font-black leading-tight text-white">{title}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function ClientHomeView({ activeRole = 'client' }) {
  const role = roleCopy[activeRole] || roleCopy.client;
  return (
    <div className="space-y-7 overflow-hidden">
      <TodayFocusCard role={role} />
      <SeeCenterpiece />
      <ProgressVisuals />
      <SpotifyStrip />
      <RoadmapCarouselSection />
      <MissionCarouselSection />
      <PillarsCarouselSection />
      <WinsCarouselSection />
      <SupportCarouselSection />
      <AICompanionCarouselSection />
      <ResourceCarouselSection />
    </div>
  );
}