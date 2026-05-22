import React from 'react';
import { BrainCircuit, CalendarCheck, ShieldCheck } from 'lucide-react';

const stats = [
  { label: 'Roadmap build', value: '5–10 min' },
  { label: 'Calendar sync', value: 'Live' },
  { label: 'Review mode', value: 'On' },
];

export default function SEEMobileHero() {
  return (
    <section className="relative overflow-hidden rounded-[38px] border border-white/12 bg-gradient-to-br from-white/16 via-blue-400/12 to-violet-400/12 p-5 shadow-2xl backdrop-blur-2xl sm:p-6">
      <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-300/20 blur-3xl" />
      <div className="absolute -bottom-20 left-6 h-44 w-44 rounded-full bg-violet-300/15 blur-3xl" />

      <div className="relative">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200/20 bg-blue-300/10 px-3 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-blue-100">
          <BrainCircuit className="h-4 w-4" /> S.E.E. Super Agent
        </div>

        <h1 className="font-sans text-[2.45rem] font-black leading-[0.95] tracking-tight sm:text-5xl">
          Turn one note into a client-ready recovery roadmap.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
          Simplify counselor notes, execute the schedule, and empower the client with reminders, goals, transportation, and follow-up actions.
        </p>

        <div className="mt-6 grid grid-cols-3 gap-2">
          {stats.map((item) => (
            <div key={item.label} className="rounded-[22px] border border-white/10 bg-white/10 p-3 text-center backdrop-blur-xl">
              <p className="text-base font-black text-white">{item.value}</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-slate-300">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-[24px] border border-emerald-200/15 bg-emerald-300/10 p-3">
            <ShieldCheck className="h-5 w-5 text-emerald-100" />
            <span className="text-sm font-bold text-emerald-50">Counselor approval before save</span>
          </div>
          <div className="flex items-center gap-3 rounded-[24px] border border-blue-200/15 bg-blue-300/10 p-3">
            <CalendarCheck className="h-5 w-5 text-blue-100" />
            <span className="text-sm font-bold text-blue-50">Facility + client calendar sync</span>
          </div>
        </div>
      </div>
    </section>
  );
}