import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, CheckCircle2, Pin } from 'lucide-react';

export default function HomeSummaryCard({ title, description, icon: Icon, to, accent = 'blue', sectionTitle, moduleState, activityCount = 0, onTrack, onTogglePin }) {
  const accentClass = accent === 'green' ? 'from-emerald-400/25 to-teal-500/10' : accent === 'gold' ? 'from-amber-300/25 to-orange-500/10' : accent === 'rose' ? 'from-rose-400/25 to-pink-500/10' : accent === 'violet' ? 'from-violet-400/25 to-fuchsia-500/10' : 'from-blue-400/25 to-cyan-500/10';

  return (
    <Link to={to} onClick={() => onTrack?.(sectionTitle, { title }, 'opened')} className={`group relative overflow-hidden rounded-[30px] border border-white/12 bg-gradient-to-br ${accentClass} p-5 shadow-2xl backdrop-blur-2xl active:scale-[.98] transition`}>
      <div className="absolute inset-0 bg-white/6" />
      <div className="relative z-10 flex min-h-[150px] flex-col justify-between">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/16 shadow-inner">
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="flex items-center gap-2">
            {moduleState?.status === 'completed' && <CheckCircle2 className="h-5 w-5 text-emerald-200" />}
            <button type="button" onClick={(event) => { event.preventDefault(); onTogglePin?.(sectionTitle, { title }); }} className={`min-h-0 rounded-full p-2 ${moduleState?.pinned ? 'bg-amber-300/25 text-amber-100' : 'bg-white/10 text-white/70'}`}>
              <Pin className="h-4 w-4" />
            </button>
            <ArrowUpRight className="h-5 w-5 text-white/70 transition group-hover:translate-x-1 group-hover:-translate-y-1" />
          </div>
        </div>
        <div>
          <h3 className="font-sans text-xl font-black text-white">{title}</h3>
          <p className="mt-2 text-sm font-bold leading-relaxed text-slate-300">{description}</p>
          <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-black uppercase tracking-[0.12em] text-white/75">
            <span className="rounded-full bg-white/10 px-3 py-1">{moduleState?.status?.replace('_', ' ') || 'not started'}</span>
            <span className="rounded-full bg-white/10 px-3 py-1">{moduleState?.open_count || 0} opens</span>
            <span className="rounded-full bg-white/10 px-3 py-1">{activityCount} updates</span>
          </div>
          <button type="button" onClick={(event) => { event.preventDefault(); onTrack?.(sectionTitle, { title }, 'completed'); }} className="mt-3 min-h-0 rounded-full bg-white/14 px-4 py-2 text-xs font-black text-white">
            Mark complete
          </button>
        </div>
      </div>
    </Link>
  );
}