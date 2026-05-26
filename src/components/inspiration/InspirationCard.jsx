import React from 'react';
import { Bookmark, ExternalLink, Flag, Play, Share2 } from 'lucide-react';

export default function InspirationCard({ item, type, onOpen, onSave, onShare, onReport }) {
  const isVideo = type === 'video';
  return (
    <article className="min-w-[260px] max-w-[280px] rounded-[28px] border border-white/12 bg-white/10 p-3 shadow-xl backdrop-blur-2xl">
      {isVideo && item.thumbnail_url && (
        <button onClick={() => onOpen(item)} className="relative block w-full overflow-hidden rounded-3xl bg-black/30">
          <img src={item.thumbnail_url} alt={item.title} className="h-36 w-full object-cover" />
          <span className="absolute inset-0 flex items-center justify-center bg-black/20"><Play className="h-10 w-10 text-white" /></span>
        </button>
      )}
      <div className="p-2">
        <div className="mb-2 flex flex-wrap gap-2">
          <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-100">Positive</span>
          <span className="rounded-full bg-blue-400/15 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-blue-100">{item.category || 'Hope'}</span>
        </div>
        <h3 className="line-clamp-2 font-sans text-lg font-black text-white">{item.title}</h3>
        <p className="mt-2 line-clamp-3 text-xs font-bold leading-relaxed text-slate-300">{item.summary || item.description}</p>
        <p className="mt-3 text-xs font-black text-amber-100/80">{item.channel_name || item.source_name} {item.reading_time_minutes ? `• ${item.reading_time_minutes} min` : ''}</p>
        <div className="mt-4 grid grid-cols-4 gap-2">
          <button onClick={() => onOpen(item)} className="min-h-0 rounded-2xl bg-white px-2 py-2 text-xs font-black text-slate-950">{isVideo ? 'Watch' : 'Read'}</button>
          <button onClick={() => onSave(item)} className="min-h-0 rounded-2xl border border-white/10 bg-white/10 p-2 text-white"><Bookmark className="mx-auto h-4 w-4" /></button>
          <button onClick={() => onShare(item)} className="min-h-0 rounded-2xl border border-white/10 bg-white/10 p-2 text-white"><Share2 className="mx-auto h-4 w-4" /></button>
          <button onClick={() => onReport(item)} className="min-h-0 rounded-2xl border border-white/10 bg-white/10 p-2 text-white"><Flag className="mx-auto h-4 w-4" /></button>
        </div>
        {!isVideo && item.source_url && <a href={item.source_url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs font-black text-blue-200">Source <ExternalLink className="h-3 w-3" /></a>}
      </div>
    </article>
  );
}