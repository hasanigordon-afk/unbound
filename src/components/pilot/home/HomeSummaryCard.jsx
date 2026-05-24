import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

export default function HomeSummaryCard({ title, description, icon: Icon, to, accent = 'blue' }) {
  const accentClass = accent === 'green' ? 'from-emerald-400/25 to-teal-500/10' : accent === 'gold' ? 'from-amber-300/25 to-orange-500/10' : accent === 'rose' ? 'from-rose-400/25 to-pink-500/10' : accent === 'violet' ? 'from-violet-400/25 to-fuchsia-500/10' : 'from-blue-400/25 to-cyan-500/10';

  return (
    <Link to={to} className={`group relative overflow-hidden rounded-[30px] border border-white/12 bg-gradient-to-br ${accentClass} p-5 shadow-2xl backdrop-blur-2xl active:scale-[.98] transition`}>
      <div className="absolute inset-0 bg-white/6" />
      <div className="relative z-10 flex min-h-[150px] flex-col justify-between">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/16 shadow-inner">
            <Icon className="h-6 w-6 text-white" />
          </div>
          <ArrowUpRight className="h-5 w-5 text-white/70 transition group-hover:translate-x-1 group-hover:-translate-y-1" />
        </div>
        <div>
          <h3 className="font-sans text-xl font-black text-white">{title}</h3>
          <p className="mt-2 text-sm font-bold leading-relaxed text-slate-300">{description}</p>
        </div>
      </div>
    </Link>
  );
}