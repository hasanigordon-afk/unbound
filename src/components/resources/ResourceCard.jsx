import React from 'react';
import { Bookmark, ExternalLink, Flag, MapPinned, Phone, Share2 } from 'lucide-react';
import { openStatus } from './resourceUtils';

export default function ResourceCard({ resource, saved, onSave, onUnsave, onReport }) {
  const status = openStatus(resource.hours_json || resource.hours);
  const mapsQuery = [resource.address, resource.city, resource.state, resource.zip].filter(Boolean).join(', ');
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery || resource.name)}`;
  const share = async () => {
    const text = `${resource.name}${mapsQuery ? ` - ${mapsQuery}` : ''}`;
    if (navigator.share) await navigator.share({ title: resource.name, text, url: resource.website || window.location.href });
    else await navigator.clipboard.writeText(resource.website || text);
  };

  return (
    <article className="rounded-[30px] border border-white/12 bg-white/10 p-5 shadow-xl backdrop-blur-2xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-200/80">{resource.category}</p>
          <h3 className="mt-1 font-sans text-2xl font-black text-white">{resource.name}</h3>
          <p className="mt-1 text-sm font-bold text-slate-300">{resource.distance?.toFixed(1)} miles away</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-black ${status.verified ? (status.open ? 'bg-emerald-400 text-slate-950' : 'bg-slate-700 text-white') : 'bg-amber-300/15 text-amber-100'}`}>
          {status.verified ? (status.open ? 'Open' : 'Closed') : 'Hours not verified'}
        </span>
      </div>
      <div className="mt-4 space-y-2 text-sm font-bold text-slate-300">
        {resource.description && <p>{resource.description}</p>}
        <p>{mapsQuery || 'Address not verified'}</p>
        <p>{status.label}{resource.hours_text ? ` · ${resource.hours_text}` : ''}</p>
        {resource.phone && <p>{resource.phone}</p>}
        <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Source: {resource.source_name || 'Admin database'} · {resource.verification_status || 'needs_review'}</p>
        {resource.website && <a href={resource.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-blue-200"><ExternalLink className="h-4 w-4" /> Website</a>}
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-5">
        <a href={mapsUrl} target="_blank" rel="noreferrer" className="flex min-h-12 items-center justify-center gap-1 rounded-2xl bg-white text-xs font-black text-slate-950"><MapPinned className="h-4 w-4" /> Directions</a>
        {resource.phone ? <a href={`tel:${resource.phone}`} className="flex min-h-12 items-center justify-center gap-1 rounded-2xl border border-white/12 bg-white/10 text-xs font-black text-white"><Phone className="h-4 w-4" /> Call</a> : <span className="flex min-h-12 items-center justify-center rounded-2xl border border-white/12 bg-white/5 text-xs font-black text-slate-500">No phone</span>}
        <button onClick={() => (saved ? onUnsave(resource) : onSave(resource))} className={`flex min-h-12 items-center justify-center gap-1 rounded-2xl text-xs font-black ${saved ? 'bg-amber-300 text-slate-950' : 'border border-white/12 bg-white/10 text-white'}`}><Bookmark className="h-4 w-4" /> {saved ? 'Saved' : 'Save'}</button>
        <button onClick={share} className="flex min-h-12 items-center justify-center gap-1 rounded-2xl border border-white/12 bg-white/10 text-xs font-black text-white"><Share2 className="h-4 w-4" /> Share</button>
        <button onClick={() => onReport(resource)} className="flex min-h-12 items-center justify-center gap-1 rounded-2xl border border-white/12 bg-white/10 text-xs font-black text-white"><Flag className="h-4 w-4" /> Report</button>
      </div>
    </article>
  );
}