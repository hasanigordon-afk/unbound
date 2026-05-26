import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import PilotShell from '@/components/pilot/PilotShell';
import { Check, EyeOff, Search, Star, X } from 'lucide-react';

const queries = ['recovery story addiction hope', 'sobriety story transformation', 'inspirational recovery story', 'addiction recovery success story', 'life after addiction recovery story', 'sober motivation', 'recovery is possible story', 'second chance recovery story', 'mental health recovery story hope', 'reentry success story', 'veteran recovery story hope', 'overcoming addiction inspirational story', 'AA recovery speaker hope', 'NA recovery speaker hope', 'sober living success story'];

export default function TestimonialsAdmin() {
  const [query, setQuery] = useState(queries[0]);
  const [found, setFound] = useState([]);
  const [message, setMessage] = useState('');
  const [media, setMedia] = useState([]);
  const [readings, setReadings] = useState([]);
  const [reading, setReading] = useState({ title: '', summary: '', source_name: '', source_url: '', category: 'Hope & Healing', reading_time_minutes: 5 });

  const load = async () => {
    const [m, r] = await Promise.all([base44.entities.MediaItem.list('-updated_date', 100), base44.entities.ReadingItem.list('-updated_date', 100)]);
    setMedia(m); setReadings(r);
  };
  useEffect(() => { load(); }, []);

  const discover = async () => {
    const res = await base44.functions.invoke('discoverYoutubeRecoveryVideos', { query, maxResults: 8 });
    setMessage(res.data.message || 'Review these YouTube results before approving.');
    setFound(res.data.videos || []);
  };
  const importVideo = async (video) => { await base44.entities.MediaItem.create(video); await load(); };
  const updateMedia = async (item, data) => { await base44.entities.MediaItem.update(item.id, data); await load(); };
  const updateReading = async (item, data) => { await base44.entities.ReadingItem.update(item.id, data); await load(); };
  const addReading = async () => { await base44.entities.ReadingItem.create({ ...reading, media_type: 'article', tone: 'positive', moderation_status: 'pending_review', is_positive_content: true, tags: ['hope', 'recovery'] }); setReading({ title: '', summary: '', source_name: '', source_url: '', category: 'Hope & Healing', reading_time_minutes: 5 }); await load(); };

  return (
    <PilotShell title="Testimonials Admin" subtitle="Curate positive recovery videos, readings, and AhHa Stories.">
      <div className="space-y-6">
        <section className="rounded-[34px] border border-white/12 bg-white/10 p-5">
          <h2 className="font-sans text-2xl font-black text-white">YouTube discovery</h2>
          <p className="mt-2 text-sm font-bold text-slate-300">Search results stay pending until approved. Avoid unsafe, graphic, exploitative, or negative content.</p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row"><select value={query} onChange={(e) => setQuery(e.target.value)} className="flex-1">{queries.map((q) => <option key={q} value={q}>{q}</option>)}</select><button onClick={discover} className="btn-primary inline-flex items-center gap-2"><Search className="h-4 w-4" /> Search</button></div>
          {message && <p className="mt-3 rounded-2xl border border-white/10 bg-white/10 p-3 text-sm font-bold text-amber-100">{message}</p>}
          <div className="mt-4 grid gap-3 md:grid-cols-2">{found.map((video) => <div key={video.youtube_video_id} className="rounded-3xl border border-white/10 bg-white/10 p-3"><img src={video.thumbnail_url} alt="" className="h-36 w-full rounded-2xl object-cover" /><h3 className="mt-3 font-bold text-white">{video.title}</h3><p className="mt-1 text-xs font-bold text-slate-400">{video.channel_name}</p><button onClick={() => importVideo(video)} className="btn-ghost mt-3 min-h-0 px-4 py-2 text-xs">Import for review</button></div>)}</div>
        </section>

        <section className="rounded-[34px] border border-white/12 bg-white/10 p-5"><h2 className="font-sans text-2xl font-black text-white">Add positive reading</h2><div className="mt-4 grid gap-3"><input placeholder="Title" value={reading.title} onChange={(e) => setReading({ ...reading, title: e.target.value })} /><textarea placeholder="Short approved summary" value={reading.summary} onChange={(e) => setReading({ ...reading, summary: e.target.value })} /><input placeholder="Source name" value={reading.source_name} onChange={(e) => setReading({ ...reading, source_name: e.target.value })} /><input placeholder="Source link" value={reading.source_url} onChange={(e) => setReading({ ...reading, source_url: e.target.value })} /><button onClick={addReading} className="btn-primary">Add reading for review</button></div></section>

        <section className="space-y-3"><h2 className="font-sans text-2xl font-black text-white">Moderation queue</h2>{[...media.map((i) => ({ ...i, kind: 'video' })), ...readings.map((i) => ({ ...i, kind: 'reading' }))].map((item) => <div key={`${item.kind}-${item.id}`} className="rounded-3xl border border-white/10 bg-white/10 p-4"><p className="text-xs font-black uppercase text-amber-100">{item.kind} • {item.moderation_status}</p><h3 className="mt-1 font-bold text-white">{item.title}</h3><p className="mt-1 text-sm font-bold text-slate-300">{item.summary || item.description}</p><div className="mt-3 flex flex-wrap gap-2"><button onClick={() => item.kind === 'video' ? updateMedia(item, { moderation_status: 'approved' }) : updateReading(item, { moderation_status: 'approved' })} className="btn-ghost min-h-0 px-3 py-2 text-xs"><Check className="inline h-3 w-3" /> Approve</button><button onClick={() => item.kind === 'video' ? updateMedia(item, { moderation_status: 'rejected' }) : updateReading(item, { moderation_status: 'rejected' })} className="btn-ghost min-h-0 px-3 py-2 text-xs"><X className="inline h-3 w-3" /> Reject</button><button onClick={() => item.kind === 'video' ? updateMedia(item, { moderation_status: 'hidden' }) : updateReading(item, { moderation_status: 'hidden' })} className="btn-ghost min-h-0 px-3 py-2 text-xs"><EyeOff className="inline h-3 w-3" /> Hide</button><button onClick={() => item.kind === 'video' ? updateMedia(item, { is_featured: !item.is_featured }) : updateReading(item, { is_featured: !item.is_featured })} className="btn-ghost min-h-0 px-3 py-2 text-xs"><Star className="inline h-3 w-3" /> Feature</button></div></div>)}</section>
      </div>
    </PilotShell>
  );
}