import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Headphones, Heart, Loader2, PenLine, Play, Square, Wind } from 'lucide-react';
import PilotShell from '@/components/pilot/PilotShell';
import { getCurrentUser } from '@/services/serviceUtils';
import { getBreathingExercises, getWellnessContent, saveJournalEntry, trackWellnessActivity } from '@/services/wellnessService';

export default function WellnessCenter() {
  const queryClient = useQueryClient();
  const [journal, setJournal] = useState('');
  const [activeExercise, setActiveExercise] = useState(null);
  const [remaining, setRemaining] = useState(0);
  const userQuery = useQuery({ queryKey: ['current-user'], queryFn: getCurrentUser });
  const mediaQuery = useQuery({ queryKey: ['wellness-content'], queryFn: getWellnessContent });
  const exercises = useMemo(() => getBreathingExercises(), []);

  useEffect(() => {
    if (!remaining) return undefined;
    const timer = window.setInterval(() => setRemaining((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [remaining]);

  const trackMutation = useMutation({ mutationFn: (activity) => trackWellnessActivity(userQuery.data, activity), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['today-dashboard'] }) });
  const journalMutation = useMutation({
    mutationFn: () => saveJournalEntry(userQuery.data, { body: journal, tags: ['wellness'] }),
    onSuccess: () => { setJournal(''); queryClient.invalidateQueries({ queryKey: ['journal'] }); },
  });

  const startExercise = (exercise) => {
    setActiveExercise(exercise);
    setRemaining((exercise.inhale + exercise.hold + exercise.exhale) * exercise.rounds);
    trackMutation.mutate({ activity: exercise.name, notes: `Started ${exercise.name}` });
  };

  const approvedMedia = mediaQuery.data || [];
  const calmingMedia = approvedMedia.filter((item) => ['music', 'meditation', 'binaural', 'breathing'].includes(item.media_type));

  return (
    <PilotShell title="Wellness" subtitle="Real journal saves, breathing timers, and database-powered wellness media.">
      <div className="space-y-5">
        <section className="rounded-[34px] border border-white/12 bg-white/10 p-5 shadow-2xl backdrop-blur-2xl">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-200/80">Calm button</p>
          <h2 className="mt-2 font-sans text-3xl font-black text-white">Start a real breathing reset.</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {exercises.map((exercise) => (
              <button key={exercise.id} onClick={() => startExercise(exercise)} className="rounded-3xl border border-white/10 bg-white/8 p-4 text-left active:scale-95">
                <Wind className="h-5 w-5 text-emerald-200" />
                <p className="mt-2 font-black text-white">{exercise.name}</p>
                <p className="text-sm font-bold text-slate-300">Inhale {exercise.inhale}s · hold {exercise.hold}s · exhale {exercise.exhale}s</p>
              </button>
            ))}
          </div>
          {activeExercise && (
            <div className="mt-4 rounded-3xl border border-emerald-300/25 bg-emerald-300/10 p-5 text-center">
              <p className="text-sm font-black text-emerald-100">{activeExercise.name}</p>
              <p className="mt-2 font-sans text-5xl font-black text-white">{remaining}s</p>
              <button onClick={() => { setRemaining(0); setActiveExercise(null); }} className="btn-ghost mt-4"><Square className="mr-2 inline h-4 w-4" /> Stop</button>
            </div>
          )}
        </section>

        <section className="rounded-[34px] border border-white/12 bg-white/10 p-5 shadow-2xl backdrop-blur-2xl">
          <h3 className="font-sans text-2xl font-black text-white"><PenLine className="mr-2 inline h-5 w-5" /> Journal</h3>
          <textarea value={journal} onChange={(event) => setJournal(event.target.value)} placeholder="Write a private wellness journal entry..." className="mt-4 min-h-[140px] w-full rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-sm font-bold text-white placeholder:text-slate-500" />
          <button onClick={() => journal.trim() && journalMutation.mutate()} disabled={journalMutation.isPending} className="btn-primary mt-3">{journalMutation.isPending ? 'Saving...' : 'Save journal entry'}</button>
          {journalMutation.isSuccess && <p className="mt-3 rounded-2xl border border-emerald-300/30 bg-emerald-400/10 p-3 text-sm font-black text-emerald-100">Journal saved to your database.</p>}
        </section>

        <section className="rounded-[34px] border border-white/12 bg-white/10 p-5 shadow-2xl backdrop-blur-2xl">
          <h3 className="font-sans text-2xl font-black text-white"><Headphones className="mr-2 inline h-5 w-5" /> Wellness media</h3>
          {mediaQuery.isLoading ? <p className="mt-4 flex items-center gap-2 text-sm font-bold text-slate-300"><Loader2 className="h-4 w-4 animate-spin" /> Loading media...</p> : calmingMedia.length ? (
            <div className="mt-4 grid gap-3">
              {calmingMedia.map((item) => (
                <a key={item.id} href={item.source_url} target="_blank" rel="noreferrer" className="rounded-2xl border border-white/10 bg-white/8 p-4">
                  <p className="font-black text-white"><Play className="mr-2 inline h-4 w-4" />{item.title}</p>
                  <p className="text-sm font-bold text-slate-300">{item.description}</p>
                </a>
              ))}
            </div>
          ) : (
            <p className="mt-4 rounded-2xl border border-amber-200/25 bg-amber-300/10 p-4 text-sm font-bold text-amber-100">No approved wellness media is connected yet. Add real audio/video/article records in Admin Data Management.</p>
          )}
        </section>

        <section className="rounded-[30px] border border-white/12 bg-white/10 p-5 text-sm font-bold text-slate-300">
          <Heart className="mr-2 inline h-4 w-4 text-rose-200" /> ReZilient is not emergency services, medical advice, diagnosis, or treatment. Call local emergency services or 988 if you are in immediate danger.
        </section>
      </div>
    </PilotShell>
  );
}