import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bookmark, ExternalLink, Loader2 } from 'lucide-react';
import PilotShell from '@/components/pilot/PilotShell';
import { filterMediaByCategory, getMediaItems, getSavedMedia, saveMediaItem, unsaveMediaItem } from '@/services/mediaService';
import { getCurrentUser } from '@/services/serviceUtils';

const categories = ['All', 'video', 'audio', 'article', 'podcast', 'meditation', 'music', 'binaural', 'educational'];

export default function Media() {
  const [category, setCategory] = useState('All');
  const queryClient = useQueryClient();
  const userQuery = useQuery({ queryKey: ['current-user'], queryFn: getCurrentUser });
  const mediaQuery = useQuery({ queryKey: ['media-items'], queryFn: () => getMediaItems() });
  const savedQuery = useQuery({ queryKey: ['saved-media', userQuery.data?.email], queryFn: () => getSavedMedia(userQuery.data), enabled: !!userQuery.data?.email });
  const saveMutation = useMutation({ mutationFn: (item) => saveMediaItem(userQuery.data, item), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['saved-media'] }) });
  const unsaveMutation = useMutation({ mutationFn: (item) => unsaveMediaItem(userQuery.data, item), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['saved-media'] }) });

  const saved = savedQuery.data || [];
  const media = filterMediaByCategory(mediaQuery.data || [], category);

  return (
    <PilotShell title="Media" subtitle="Recovery videos, audio, podcasts, meditations, and education from approved database records.">
      <div className="space-y-5">
        <section className="rounded-[34px] border border-white/12 bg-white/10 p-5 shadow-2xl backdrop-blur-2xl">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-200/80">Database powered</p>
          <h2 className="mt-2 font-sans text-3xl font-black text-white">Approved media library</h2>
          <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
            {categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-black ${category === item ? 'bg-white text-slate-950' : 'border border-white/12 bg-white/10 text-white'}`}>{item}</button>)}
          </div>
        </section>

        {mediaQuery.isLoading ? (
          <section className="rounded-[30px] border border-white/12 bg-white/10 p-6 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin" /> Loading media...</section>
        ) : mediaQuery.error ? (
          <section className="rounded-[30px] border border-red-300/30 bg-red-400/10 p-6 text-center">Media could not load: {mediaQuery.error.message}</section>
        ) : media.length ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {media.map((item) => {
              const isSaved = saved.some((row) => row.media_id === item.id);
              return (
                <article key={item.id} className="rounded-[30px] border border-white/12 bg-white/10 p-5 shadow-xl backdrop-blur-2xl">
                  {item.thumbnail_url && <img src={item.thumbnail_url} alt="" className="mb-4 h-36 w-full rounded-2xl object-cover" />}
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-100/80">{item.media_type}</p>
                  <h3 className="mt-1 font-sans text-2xl font-black text-white">{item.title}</h3>
                  <p className="mt-2 text-sm font-bold text-slate-300">{item.description}</p>
                  <p className="mt-2 text-xs font-bold text-slate-500">Source: {item.source_name}</p>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <a href={item.source_url} target="_blank" rel="noreferrer" className="rounded-2xl bg-white px-4 py-3 text-center text-xs font-black text-slate-950"><ExternalLink className="mr-1 inline h-4 w-4" /> Open</a>
                    <button onClick={() => (isSaved ? unsaveMutation.mutate(item) : saveMutation.mutate(item))} className={`rounded-2xl px-4 py-3 text-xs font-black ${isSaved ? 'bg-amber-300 text-slate-950' : 'border border-white/12 bg-white/10 text-white'}`}><Bookmark className="mr-1 inline h-4 w-4" /> {isSaved ? 'Saved' : 'Save'}</button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <section className="rounded-[30px] border border-amber-200/25 bg-amber-300/10 p-6 text-center text-amber-100">
            <h3 className="font-sans text-2xl font-black">No approved media connected yet</h3>
            <p className="mt-2 text-sm font-bold">Add real MediaItem records through Admin Data Management. Placeholder media is hidden until real records exist.</p>
          </section>
        )}
      </div>
    </PilotShell>
  );
}
