import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, CheckCircle2, Pin } from 'lucide-react';

export default function HomeSummaryCard({
  title,
  description,
  icon: Icon,
  to,
  accent = 'blue',
  sectionTitle,
  moduleState,
  activityCount = 0,
  sampleStatus = 'active today',
  sampleOpens = 3,
  sampleUpdates = 2,
  onTrack,
  onTogglePin,
}) {
  const accentClass = accent === 'green' ? 'from-emerald-400/25 via-teal-500/10 to-slate-950/70' : accent === 'gold' ? 'from-amber-300/30 via-orange-500/12 to-slate-950/70' : accent === 'rose' ? 'from-rose-400/25 via-pink-500/10 to-slate-950/70' : accent === 'violet' ? 'from-violet-400/25 via-fuchsia-500/10 to-slate-950/70' : 'from-blue-400/25 via-cyan-500/10 to-slate-950/70';
  const displayStatus = moduleState?.status?.replace('_', ' ') || sampleStatus;
  const displayOpens = moduleState?.open_count || sampleOpens;
  const displayUpdates = activityCount || sampleUpdates;

  return (
    <Link to={to} onClick={() => onTrack?.(sectionTitle, { title }, 'opened')} className={`group relative block overflow-hidden rounded-[32px] border border-white/12 bg-gradient-to-br ${accentClass} p-5 shadow-[0_22px_60px_rgba(0,0,0,.42)] backdrop-blur-2xl active:scale-[.98] transition`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,.20),transparent_24%),linear-gradient(160deg,rgba(255,255,255,.08),transparent_46%)]" />
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-200/10 blur-2xl" />
      <div className="relative z-10 flex min-h-[178px] flex-col justify-between">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-[24px] bg-white/16 shadow-inner ring-1 ring-white/10">
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
            <span className="rounded-full bg-white/10 px-3 py-1">{displayStatus}</span>
            <span className="rounded-full bg-white/10 px-3 py-1">{displayOpens} opens</span>
            <span className="rounded-full bg-white/10 px-3 py-1">{displayUpdates} updates</span>
          </div>
          <button type="button" onClick={(event) => { event.preventDefault(); onTrack?.(sectionTitle, { title }, 'completed'); }} className="mt-3 min-h-0 rounded-full bg-white/14 px-4 py-2 text-xs font-black text-white ring-1 ring-white/10">
            Mark complete
          </button>
        </div>
      </div>
    </Link>
  );
}