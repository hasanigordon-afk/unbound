import React from 'react';
import { Sparkles } from 'lucide-react';

export default function SEENotesIntake({ notes, setNotes, onProcess, processing }) {
  return (
    <section className="rounded-[34px] border border-white/12 bg-white/10 p-5 shadow-2xl backdrop-blur-2xl">
      <div className="mb-4">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-200">Simplify • Execute • Empower</p>
        <h2 className="mt-2 font-sans text-2xl font-black">Counselor aftercare notes</h2>
        <p className="mt-2 text-sm text-slate-300">Paste natural-language notes once. S.E.E. organizes the next steps into a client-ready roadmap.</p>
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="min-h-[220px] w-full rounded-[28px] p-5 text-base leading-relaxed"
        placeholder="Example: Client has IOP Mondays and Wednesdays at 6 PM, probation check-in every Friday at 10 AM, needs bus support, NA meetings twice weekly, sponsor calls nightly, housing referral, job search goal, and medication reminders each morning."
      />
      <button onClick={onProcess} disabled={processing} className="mt-4 flex w-full items-center justify-center gap-2 rounded-3xl bg-white px-5 py-4 font-black text-slate-950 active:scale-95 transition disabled:opacity-70">
        <Sparkles className="h-5 w-5" /> {processing ? 'Processing notes…' : 'Generate S.E.E. roadmap'}
      </button>
    </section>
  );
}