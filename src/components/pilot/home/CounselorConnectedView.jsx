import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, ClipboardList, Gauge, MessageCircle, Route, Sparkles, TrendingUp, Users } from 'lucide-react';
import HomeSectionHeader from './HomeSectionHeader';

const modules = [
  ['Client overview', 'See each person’s roadmap, support circle, wins, and resource needs.', Users, '/FacilityPilotDashboard'],
  ['Aftercare builder', 'Turn discharge notes into a clear plan clients can actually follow.', ClipboardList, '/SEESuperAgent'],
  ['Client progress', 'Review positive momentum, goals reached, appointments completed, and milestones.', TrendingUp, '/PositiveProgressHub'],
  ['Message center', 'Stay connected with clients and support teams.', MessageCircle, '/CounselorMessaging'],
  ['Roadmap creator', 'Build connected weekly missions across recovery, reentry, wellness, and family.', Route, '/SEESuperAgent'],
];

export default function CounselorConnectedView() {
  return (
    <div className="space-y-5">
      <section className="card-glow relative overflow-hidden p-5 sm:p-7">
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-amber-300/16 blur-3xl" />
        <div className="relative">
          <HomeSectionHeader eyebrow="Counselor command center" title="Aftercare that continues after discharge." subtitle="Premium overview for plans, progress, risk, messages, and S.E.E. roadmap creation." />
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ['Active clients', '28', Users],
              ['Plans ready', '19', ClipboardList],
              ['Avg engagement', '84%', Gauge],
            ].map(([label, value, Icon]) => (
              <div key={label} className="rounded-[26px] border border-white/10 bg-white/8 p-4">
                <Icon className="h-5 w-5 text-amber-200" />
                <p className="mt-3 font-sans text-3xl font-black text-white">{value}</p>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">{label}</p>
              </div>
            ))}
          </div>
          <Link to="/SEESuperAgent" className="btn-gold mt-5 inline-flex min-h-[58px] items-center gap-2 px-6 text-sm"><Sparkles className="h-5 w-5" />Create a client roadmap</Link>
        </div>
      </section>
      <section className="card p-5 sm:p-6">
        <HomeSectionHeader eyebrow="Today's caseload focus" title="Real activity, no empty panels." subtitle="Sample dashboard data shows how the production experience should feel with live records." />
        <div className="space-y-3">
          {[
            ['Marcus Johnson', 'IOP Mon/Wed/Fri · NA Tue/Fri · ride needed tonight', 'Moderate', '86%'],
            ['Alyssa Rivera', 'Therapy today · 21-day streak · housing application complete', 'Low', '94%'],
            ['Devon Price', 'Court Wednesday · food resource saved · mentor call due', 'High', '68%'],
          ].map(([name, details, risk, engagement]) => (
            <div key={name} className="rounded-[26px] border border-white/10 bg-white/8 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-black text-white">{name}</p>
                  <p className="mt-1 text-sm font-bold leading-relaxed text-slate-300">{details}</p>
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-amber-100">{risk}</span>
              </div>
              <div className="mt-3 flex items-center gap-3 text-xs font-black text-slate-300">
                <CalendarDays className="h-4 w-4 text-blue-200" />
                <span>{engagement} engagement</span>
                <span className="h-1 w-1 rounded-full bg-slate-500" />
                <span>Next action assigned</span>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        {modules.map(([title, body, ModuleIcon, to]) => (
          <Link key={title} to={to} className="card p-5 transition hover:-translate-y-1 active:scale-[0.99]">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-3xl bg-blue-300/15 text-blue-100"><ModuleIcon className="h-6 w-6" /></div>
            <h3 className="font-sans text-xl font-black text-white">{title}</h3>
            <p className="mt-2 text-sm font-bold leading-relaxed text-slate-300">{body}</p>
          </Link>
        ))}
      </section>
      <section className="card p-5">
        <HomeSectionHeader eyebrow="Connected care loop" title="One plan, two views." subtitle="Counselors build the structure. Clients see the daily roadmap. Wins and support activity flow back into the overview." />
        <div className="grid gap-3 sm:grid-cols-3">
          {['Create roadmap', 'Client completes missions', 'Team sees progress'].map((step, index) => (
            <div key={step} className="rounded-[26px] bg-white/8 p-4"><p className="text-xs font-black uppercase tracking-[0.18em] text-blue-200">Step {index + 1}</p><p className="mt-2 font-black text-white">{step}</p></div>
          ))}
        </div>
      </section>
    </div>
  );
}