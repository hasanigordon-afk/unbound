import React from 'react';
import { Bookmark, Heart, X } from 'lucide-react';

export default function VideoPlayerModal({ video, related = [], onClose, onSave, onHelpful, onOpenRelated }) {
  if (!video) return null;
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#050814]/95 p-4 backdrop-blur-2xl">
      <div className="mx-auto max-w-4xl space-y-4 pt-[env(safe-area-inset-top)]">
        <button onClick={onClose} className="rounded-full border border-white/10 bg-white/10 p-3 text-white"><X className="h-5 w-5" /></button>
        <div className="overflow-hidden rounded-[32px] border border-white/12 bg-black shadow-2xl">
          <iframe title={video.title} src={`https://www.youtube.com/embed/${video.youtube_video_id}`} className="aspect-video w-full" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
        </div>
        <div className="rounded-[30px] border border-white/12 bg-white/10 p-5">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-200">Help. Hope. Healing.</p>
          <h1 className="mt-2 font-sans text-3xl font-black text-white">{video.title}</h1>
          <p className="mt-2 text-sm font-bold text-amber-100/80">{video.channel_name || video.source_name}</p>
          <p className="mt-4 text-sm font-bold leading-relaxed text-slate-300">{video.description}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button onClick={() => onSave(video)} className="btn-primary inline-flex items-center gap-2"><Bookmark className="h-4 w-4" /> Save</button>
            <button onClick={() => onHelpful(video)} className="btn-ghost inline-flex items-center gap-2"><Heart className="h-4 w-4" /> I needed this today</button>
          </div>
        </div>
        {related.length > 0 && <div className="grid gap-3 sm:grid-cols-2">{related.map((item) => <button key={item.id} onClick={() => onOpenRelated(item)} className="rounded-3xl border border-white/10 bg-white/10 p-3 text-left"><p className="font-bold text-white">{item.title}</p><p className="text-xs font-bold text-slate-400">Related positive video</p></button>)}</div>}
      </div>
    </div>
  );
}