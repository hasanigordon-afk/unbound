import React from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileText,
  Gauge,
  MessageCircle,
  Route,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import HomeSectionHeader from './HomeSectionHeader';

const modules = [
  ['Client overview', 'See each person\'s roadmap, support circle, wins, and resource needs.', Users, '/FacilityPilotDashboard'],
  ['Aftercare builder', 'Turn discharge notes into a clear plan clients can actually follow.', ClipboardList, '/SEESuperAgent'],
  ['Client progress', 'Review positive momentum, goals reached, appointments completed, and milestones.', TrendingUp, '/PositiveProgressHub'],
  ['Message center', 'Stay connected with clients and support teams.', MessageCircle, '/CounselorMessaging'],
  ['Roadmap creator', 'Build connected weekly missions across recovery, reentry, wellness, and family.', Route, '/SEESuperAgent'],
  ['Quick notes', 'Capture counselor observations without making the client experience feel clinical.', FileText, '/CounselorPortal'],
];

const seeOutputs = [
  ['Calendar events', 'Therapy, meetings, court, work, reminders'],
  ['Transportation', 'Ride needs, bus routes, leave-time prompts'],
  ['Goals and tasks', 'Daily routine, job search, housing, family'],
  ['Risk indicators', 'Missing info, legal gaps, isolation, triggers'],
  ['Roadmaps', '30/60/90 plus 6 month, 1 year, 5 year vision'],
  ['Client launch', 'A ready-made app experience after discharge'],
];

const clients = [
  { name: 'Marcus J.', plan: 'Discharge Friday', engagement: '86%', risk: 'Moderate', next: 'IOP Mon 1 PM' },
  { name: 'Alyssa R.', plan: 'Week 3 Structure', engagement: '94%', risk: 'Low', next: 'Therapy today' },
  { name: 'Devon P.', plan: 'Housing pending', engagement: '61%', risk: 'High', next: 'Call shelter intake' },
];

export default function CounselorConnectedView() {
  return (
    <div className="space-y-5">
      <section className="card-glow relative overflow-hidden p-5 sm:p-7">
        <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-cyan-300/16 blur-3xl" />
        <div className="relative">
          <HomeSectionHeader
            eyebrow="Counselor command center"
            title="Build the plan before discharge. Let the client open structure on day one."
            subtitle="S.E.E. converts plain-English aftercare notes into calendars, reminders, roadmaps, tasks, transportation needs, check-ins, and risk review."
          />
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ['Active clients', '28', Users],
              ['Plans ready', '19', CheckCircle2],
              ['High risk', '3', AlertTriangle],
            ].map(([label, value, Icon]) => (
              <div key={label} className="rounded-[26px] border border-white/10 bg-white/8 p-4">
                <Icon className="h-5 w-5 text-blue-200" />
                <p className="mt-3 text-3xl font-black text-white">{value}</p>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">{label}</p>
              </div>
            ))}
          </div>
          <Link to="/SEESuperAgent" className="btn-primary mt-5 inline-flex min-h-[58px] items-center gap-2 px-6 text-sm">
            <Sparkles className="h-5 w-5" />
            Open S.E.E. planner
          </Link>
        </div>
      </section>

      <section className="card p-5 sm:p-6">
        <HomeSectionHeader
          eyebrow="S.E.E. super onboarding assistant"
          title="Plain English in. Complete aftercare structure out."
          subtitle="Example: John attends NA Tuesday and Friday at 7pm, job search weekdays, therapy Monday at 3pm, and gym three times weekly."
        />
        <div className="rounded-[28px] border border-white/10 bg-black/20 p-4">
          <p className="text-sm font-bold leading-relaxed text-slate-300">
            "John attends NA every Tuesday and Friday at 7pm. Job search every weekday. Therapy Mondays at 3pm. Wants gym three times weekly."
          </p>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {seeOutputs.map(([title, body]) => (
            <div key={title} className="rounded-[24px] border border-white/10 bg-white/8 p-4">
              <p className="font-black text-white">{title}</p>
              <p className="mt-1 text-sm font-bold leading-relaxed text-slate-300">{body}</p>
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
      <section className="card p-5 sm:p-6">
        <HomeSectionHeader eyebrow="Client overview" title="Progress, engagement, and risk without shame." subtitle="Staff see the signal they need while clients see positive growth, next steps, and support." />
        <div className="space-y-3">
          {clients.map((client) => (
            <div key={client.name} className="rounded-[26px] border border-white/10 bg-white/8 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-black text-white">{client.name}</p>
                  <p className="text-sm font-bold text-slate-300">{client.plan}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${client.risk === 'High' ? 'bg-rose-300/15 text-rose-100' : client.risk === 'Moderate' ? 'bg-amber-300/15 text-amber-100' : 'bg-emerald-300/15 text-emerald-100'}`}>{client.risk}</span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-2xl bg-white/8 p-3">
                  <Gauge className="mx-auto h-4 w-4 text-blue-200" />
                  <p className="mt-1 text-sm font-black text-white">{client.engagement}</p>
                  <p className="text-[10px] font-bold text-slate-400">Engagement</p>
                </div>
                <div className="rounded-2xl bg-white/8 p-3">
                  <CalendarDays className="mx-auto h-4 w-4 text-amber-200" />
                  <p className="mt-1 text-sm font-black text-white">Next</p>
                  <p className="truncate text-[10px] font-bold text-slate-400">{client.next}</p>
                </div>
                <Link to="/SEESuperAgent" className="rounded-2xl bg-white p-3 text-center text-slate-950">
                  <Sparkles className="mx-auto h-4 w-4" />
                  <p className="mt-1 text-xs font-black">Plan</p>
                </Link>
              </div>
            </div>
          ))}
        </div>
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