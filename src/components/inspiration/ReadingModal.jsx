import React from 'react';
import { Bookmark, ExternalLink, Heart, X } from 'lucide-react';

export default function ReadingModal({ reading, related = [], onClose, onSave, onHelpful, onOpenRelated }) {
  if (!reading) return null;
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#050814]/95 p-4 backdrop-blur-2xl">
      <div className="mx-auto max-w-3xl space-y-4 pt-[env(safe-area-inset-top)]">
        <button onClick={onClose} className="rounded-full border border-white/10 bg-white/10 p-3 text-white"><X className="h-5 w-5" /></button>
        <article className="rounded-[34px] border border-white/12 bg-white/10 p-6 shadow-2xl">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-200">Positive reading</p>
          <h1 className="mt-2 font-sans text-4xl font-black text-white">{reading.title}</h1>
          <p className="mt-2 text-sm font-bold text-amber-100/80">{reading.source_name} • {reading.reading_time_minutes || 5} min read</p>
          <p className="mt-5 text-lg font-bold leading-relaxed text-slate-200">{reading.summary}</p>
          {reading.body && <div className="mt-5 whitespace-pre-wrap text-sm font-bold leading-7 text-slate-300">{reading.body}</div>}
          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={() => onSave(reading)} className="btn-primary inline-flex items-center gap-2"><Bookmark className="h-4 w-4" /> Save</button>
            <button onClick={() => onHelpful(reading)} className="btn-ghost inline-flex items-center gap-2"><Heart className="h-4 w-4" /> This helped me</button>
            {reading.source_url && <a href={reading.source_url} target="_blank" rel="noreferrer" className="btn-ghost inline-flex items-center gap-2"><ExternalLink className="h-4 w-4" /> Full source</a>}
          </div>
        </article>
        {related.length > 0 && <div className="grid gap-3">{related.map((item) => <button key={item.id} onClick={() => onOpenRelated(item)} className="rounded-3xl border border-white/10 bg-white/10 p-4 text-left"><p className="font-bold text-white">{item.title}</p><p className="text-xs font-bold text-slate-400">Related positive read</p></button>)}</div>}
      </div>
    </div>
  );
}