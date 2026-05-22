import React from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, FileText, MessageCircle, Route, Sparkles, TrendingUp, Users } from 'lucide-react';
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
      <section className="card-glow p-5 sm:p-6">
        <HomeSectionHeader eyebrow="Rehab Owner / Counselor Command Center" title="Aftercare that continues after discharge." subtitle="Client overview, aftercare builder, progress, messaging, and roadmap creation in one connected system." />
        <Link to="/SEESuperAgent" className="inline-flex min-h-[54px] items-center gap-2 rounded-full bg-white px-6 font-black text-slate-950 transition hover:-translate-y-1 active:scale-95"><Sparkles className="h-5 w-5" />Create a client roadmap</Link>
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