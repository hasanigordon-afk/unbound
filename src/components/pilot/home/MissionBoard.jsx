import React, { useState } from 'react';
import { Target } from 'lucide-react';
import HomeSectionHeader from './HomeSectionHeader';

const examples = ['Reconnect with daughter', 'Find stable housing', 'Attend meetings', 'Apply for jobs', 'Improve health'];

export default function MissionBoard() {
  const [goals, setGoals] = useState(examples);

  return (
    <section className="rounded-[36px] border border-white/70 bg-gradient-to-br from-white to-blue-50 p-5 text-slate-950 shadow-2xl">
      <div className="mb-4 flex items-start gap-3">
        <div className="rounded-3xl bg-slate-950 p-3 text-white"><Target className="h-5 w-5" /></div>
        <div className="flex-1">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">Top 5 Mission Board</p>
          <h2 className="font-sans text-3xl font-black">My Non-Negotiables</h2>
          <p className="text-sm font-bold text-slate-500">Long-term mission goals that guide the daily roadmap.</p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-5">
        {goals.map((goal, index) => (
          <label key={index} className="rounded-[26px] border border-slate-200 bg-white/90 p-3 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
            <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Goal {index + 1}</span>
            <textarea value={goal} onChange={(e) => setGoals((prev) => prev.map((g, i) => i === index ? e.target.value : g))} className="min-h-[88px] w-full resize-none border-0 bg-transparent p-0 text-sm font-black leading-snug text-slate-950 shadow-none focus:ring-0" />
          </label>
        ))}
      </div>
    </section>
  );
}