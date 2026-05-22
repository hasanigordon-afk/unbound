import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Car, ClipboardList, Repeat, Sparkles, Target } from 'lucide-react';
import HomeSectionHeader from './HomeSectionHeader';

const outputs = [
  ['Calendar schedule', CalendarDays],
  ['Roadmap tasks', ClipboardList],
  ['Reminders', Repeat],
  ['Transportation needs', Car],
  ['Support tasks', Sparkles],
  ['Weekly goals', Target],
];

export default function AIAftercareEngine() {
  return (
    <section className="card-glow p-5">
      <HomeSectionHeader eyebrow="AI Aftercare Engine" title="S.E.E. turns aftercare notes into action." subtitle="Simplify. Engage. Empower. Counselors enter plain words; ReZilient creates the connected plan." />
      <div className="grid gap-3 md:grid-cols-3">
        {outputs.map(([label, OutputIcon]) => (
          <div key={label} className="rounded-[26px] border border-white/10 bg-white/8 p-4">
            <OutputIcon className="mb-3 h-5 w-5 text-blue-200" />
            <p className="text-sm font-black text-white">{label}</p>
          </div>
        ))}
      </div>
      <Link to="/SEESuperAgent" className="mt-4 inline-flex min-h-[52px] items-center rounded-full bg-white px-6 font-black text-slate-950 transition hover:-translate-y-1 active:scale-95">Build an aftercare roadmap</Link>
    </section>
  );
}