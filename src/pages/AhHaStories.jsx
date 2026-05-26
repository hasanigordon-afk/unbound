import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Send, Sparkles } from 'lucide-react';
import PilotShell from '@/components/pilot/PilotShell';
import { getApprovedStories, submitStory } from '@/services/ahhaStoryService';
import { getCurrentUser } from '@/services/serviceUtils';

export default function AhHaStories() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ title: '', turning_point: '', display_name_mode: 'anonymous', visibility_type: 'anonymous_review' });
  const userQuery = useQuery({ queryKey: ['current-user'], queryFn: getCurrentUser });
  const storiesQuery = useQuery({ queryKey: ['approved-ahha-stories'], queryFn: getApprovedStories });
  const submitMutation = useMutation({
    mutationFn: () => submitStory(userQuery.data, form),
    onSuccess: () => {
      setForm({ title: '', turning_point: '', display_name_mode: 'anonymous', visibility_type: 'anonymous_review' });
      queryClient.invalidateQueries({ queryKey: ['approved-ahha-stories'] });
    },
  });

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  return (
    <PilotShell title="AhHa Stories" subtitle="Real submitted stories with privacy and moderation states.">
      <div className="space-y-5">
        <section className="rounded-[34px] border border-white/12 bg-white/10 p-5 shadow-2xl backdrop-blur-2xl">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-100/80">Submit for moderation</p>
          <h2 className="mt-2 font-sans text-3xl font-black text-white">Share an AhHa moment</h2>
          <div className="mt-4 grid gap-3">
            <input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Story title" className="rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-sm font-bold text-white placeholder:text-slate-500" />
            <textarea value={form.turning_point} onChange={(e) => set('turning_point', e.target.value)} placeholder="What happened that made things clear?" className="min-h-[120px] rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-sm font-bold text-white placeholder:text-slate-500" />
            <div className="grid gap-3 sm:grid-cols-2">
              <select value={form.display_name_mode} onChange={(e) => set('display_name_mode', e.target.value)} className="rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-sm font-bold text-white">
                <option value="anonymous">Anonymous</option>
                <option value="first_name">First name only</option>
                <option value="private_only">Private draft only</option>
              </select>
              <select value={form.visibility_type} onChange={(e) => set('visibility_type', e.target.value)} className="rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-sm font-bold text-white">
                <option value="private">Private draft</option>
                <option value="anonymous_review">Anonymous review</option>
                <option value="first_name_review">First-name review</option>
              </select>
            </div>
            <button onClick={() => form.title.trim() && form.turning_point.trim() && submitMutation.mutate()} disabled={submitMutation.isPending} className="btn-primary"><Send className="mr-2 inline h-4 w-4" /> Submit for review</button>
            {submitMutation.isSuccess && <p className="rounded-2xl border border-emerald-300/30 bg-emerald-400/10 p-3 text-sm font-black text-emerald-100">Story saved as pending review.</p>}
          </div>
        </section>

        <section className="rounded-[34px] border border-white/12 bg-white/10 p-5 shadow-2xl backdrop-blur-2xl">
          <h3 className="font-sans text-2xl font-black text-white"><Sparkles className="mr-2 inline h-5 w-5" /> Approved stories</h3>
          {storiesQuery.isLoading ? <p className="mt-4 flex items-center gap-2 text-sm font-bold text-slate-300"><Loader2 className="h-4 w-4 animate-spin" /> Loading stories...</p> : storiesQuery.data?.length ? (
            <div className="mt-4 grid gap-3">
              {storiesQuery.data.map((story) => (
                <article key={story.id} className="rounded-2xl border border-white/10 bg-white/8 p-4">
                  <p className="font-black text-white">{story.title}</p>
                  <p className="mt-2 text-sm font-bold text-slate-300">{story.story_preview || story.turning_point}</p>
                  <p className="mt-3 text-xs font-black uppercase tracking-[0.14em] text-slate-500">{story.display_name_mode === 'first_name' ? story.first_name_display || 'First name only' : 'Anonymous'} · moderated</p>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-4 rounded-2xl border border-amber-200/25 bg-amber-300/10 p-4 text-sm font-bold text-amber-100">No approved stories yet. Submitted stories stay pending until a moderator approves them.</p>
          )}
        </section>
      </div>
    </PilotShell>
  );
}
