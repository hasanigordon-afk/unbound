import React from 'react';
import { ArrowRight, CalendarDays, FileText, Sparkles } from 'lucide-react';

export default function SEEProcessingAnimation({ processing }) {
  return (
    <div className="rounded-[34px] border border-white/12 bg-white/10 p-5 shadow-2xl backdrop-blur-2xl overflow-hidden">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-200">AI transformation</p>
          <h2 className="mt-2 font-sans text-2xl font-black">Notes into roadmap</h2>
        </div>
        <Sparkles className={`h-7 w-7 text-blue-200 ${processing ? 'animate-pulse' : ''}`} />
      </div>
      <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="rounded-3xl bg-white/8 p-4 border border-white/10">
          <FileText className="mb-3 h-6 w-6 text-slate-300" />
          <p className="text-sm font-bold text-slate-300">Counselor notes</p>
          <div className="mt-4 space-y-2">
            <div className="h-2 rounded-full bg-white/15" />
            <div className="h-2 w-4/5 rounded-full bg-white/15" />
            <div className="h-2 w-2/3 rounded-full bg-white/15" />
          </div>
        </div>
        <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-blue-400/15 text-blue-100 border border-blue-200/20">
          <ArrowRight className="h-5 w-5" />
          {processing && <span className="absolute inset-0 rounded-full border border-blue-200/40 animate-ping" />}
        </div>
        <div className="rounded-3xl bg-white text-slate-950 p-4 shadow-xl">
          <CalendarDays className="mb-3 h-6 w-6" />
          <p className="text-sm font-black">Recovery roadmap</p>
          <div className="mt-4 space-y-2">
            <div className="h-2 rounded-full bg-blue-300" />
            <div className="h-2 w-4/5 rounded-full bg-emerald-300" />
            <div className="h-2 w-2/3 rounded-full bg-amber-300" />
          </div>
        </div>
      </div>
      {processing && <p className="mt-5 text-center text-sm font-bold text-blue-100">S.E.E. is simplifying, sequencing, and empowering the aftercare plan…</p>}
    </div>
  );
}