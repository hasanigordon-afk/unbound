import React from 'react';
import { Bookmark, ExternalLink, MapPinned, Phone } from 'lucide-react';
import { openStatus } from './resourceUtils';

export default function ResourceCard({ resource, saved, onSave }) {
  const status = openStatus(resource.hours_json || resource.hours);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(resource.address)}`;

  return (
    <article className="rounded-[30px] border border-white/12 bg-white/10 p-5 shadow-xl backdrop-blur-2xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-200/80">{resource.category}</p>
          <h3 className="mt-1 font-sans text-2xl font-black text-white">{resource.name}</h3>
          <p className="mt-1 text-sm font-bold text-slate-300">{resource.distance?.toFixed(1)} miles away</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-black ${status.open ? 'bg-emerald-400 text-slate-950' : 'bg-red-400 text-white'}`}>{status.open ? 'Open' : 'Closed'}</span>
      </div>
      <div className="mt-4 space-y-2 text-sm font-bold text-slate-300">
        <p>{resource.address}</p>
        <p>{status.label} · {resource.hours_text}</p>
        <p>{resource.phone}</p>
        {resource.website && <a href={resource.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-blue-200"><ExternalLink className="h-4 w-4" /> Website</a>}
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2">
        <a href={mapsUrl} target="_blank" rel="noreferrer" className="flex min-h-12 items-center justify-center gap-1 rounded-2xl bg-white text-xs font-black text-slate-950"><MapPinned className="h-4 w-4" /> Directions</a>
        <a href={`tel:${resource.phone}`} className="flex min-h-12 items-center justify-center gap-1 rounded-2xl border border-white/12 bg-white/10 text-xs font-black text-white"><Phone className="h-4 w-4" /> Call</a>
        <button onClick={() => onSave(resource)} className={`flex min-h-12 items-center justify-center gap-1 rounded-2xl text-xs font-black ${saved ? 'bg-amber-300 text-slate-950' : 'border border-white/12 bg-white/10 text-white'}`}><Bookmark className="h-4 w-4" /> {saved ? 'Saved' : 'Save'}</button>
      </div>
    </article>
  );
}