import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { MessageSquare, Send } from 'lucide-react';
import PilotShell from '@/components/pilot/PilotShell';

export default function PilotFeedback() {
  const [form, setForm] = useState({ role: 'client', rating: '5', what_worked: '', what_was_confusing: '', improvement_request: '' });
  const [saved, setSaved] = useState(false);
  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const submit = async (e) => {
    e.preventDefault();
    await base44.entities.PilotFeedback.create({ ...form, rating: Number(form.rating) });
    setSaved(true);
    setForm({ role: 'client', rating: '5', what_worked: '', what_was_confusing: '', improvement_request: '' });
  };

  return (
    <PilotShell title="Pilot Feedback" subtitle="Fast feedback from clients, counselors, mentors, and facility leaders.">
      <form onSubmit={submit} className="rounded-[34px] bg-white/10 border border-white/12 p-5 backdrop-blur-2xl shadow-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-violet-400/15 flex items-center justify-center"><MessageSquare className="w-6 h-6" /></div>
          <div><h2 className="text-xl font-bold font-sans">Help improve the pilot</h2><p className="text-sm text-slate-300">Designed to take under two minutes.</p></div>
        </div>
        <select value={form.role} onChange={(e) => update('role', e.target.value)} className="w-full min-h-[56px]">
          <option value="client">Client</option><option value="counselor">Counselor</option><option value="mentor">Sponsor / mentor</option><option value="admin">Facility admin</option>
        </select>
        <select value={form.rating} onChange={(e) => update('rating', e.target.value)} className="w-full min-h-[56px]">
          <option value="5">5 — Excellent</option><option value="4">4 — Good</option><option value="3">3 — Okay</option><option value="2">2 — Needs work</option><option value="1">1 — Not ready</option>
        </select>
        <textarea value={form.what_worked} onChange={(e) => update('what_worked', e.target.value)} placeholder="What worked well?" className="w-full min-h-[110px]" />
        <textarea value={form.what_was_confusing} onChange={(e) => update('what_was_confusing', e.target.value)} placeholder="What felt confusing or too much?" className="w-full min-h-[110px]" />
        <textarea value={form.improvement_request} onChange={(e) => update('improvement_request', e.target.value)} placeholder="What should we improve before launch?" className="w-full min-h-[110px]" />
        <button type="submit" className="w-full min-h-[58px] rounded-3xl bg-white text-slate-950 font-black flex items-center justify-center gap-2 active:scale-95 transition"><Send className="w-5 h-5" /> Submit feedback</button>
        {saved && <p className="text-sm text-emerald-200 font-bold text-center">Thank you — feedback saved.</p>}
      </form>
    </PilotShell>
  );
}