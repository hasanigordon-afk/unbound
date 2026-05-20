import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { UserRound, ShieldCheck } from 'lucide-react';
import PilotShell from '@/components/pilot/PilotShell';

const initial = { full_name: '', email: '', phone: '', recovery_focus: '', housing_status: '', primary_support: '', urgent_needs: '', preferred_checkin_time: '' };

export default function PilotClientIntake() {
  const [form, setForm] = useState(initial);
  const [saved, setSaved] = useState(false);
  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const save = async (e) => {
    e.preventDefault();
    await base44.entities.PilotClientIntake.create(form);
    setForm(initial);
    setSaved(true);
  };

  return (
    <PilotShell title="Client Intake" subtitle="A light profile that keeps the client experience simple after discharge.">
      <form onSubmit={save} className="rounded-[34px] bg-white/10 border border-white/12 p-5 backdrop-blur-2xl shadow-2xl space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-400/15 flex items-center justify-center"><UserRound className="w-6 h-6" /></div>
          <div>
            <h2 className="text-xl font-bold font-sans">Basic support profile</h2>
            <p className="text-sm text-slate-300">Only the essentials for pilot onboarding.</p>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          <input required value={form.full_name} onChange={(e) => update('full_name', e.target.value)} placeholder="Full name" className="w-full min-h-[56px]" />
          <input required type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="Email" className="w-full min-h-[56px]" />
          <input value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="Phone" className="w-full min-h-[56px]" />
          <input type="time" value={form.preferred_checkin_time} onChange={(e) => update('preferred_checkin_time', e.target.value)} className="w-full min-h-[56px]" />
        </div>
        <textarea value={form.recovery_focus} onChange={(e) => update('recovery_focus', e.target.value)} placeholder="Recovery focus" className="w-full min-h-[100px]" />
        <textarea value={form.housing_status} onChange={(e) => update('housing_status', e.target.value)} placeholder="Housing / sober living status" className="w-full min-h-[100px]" />
        <textarea value={form.primary_support} onChange={(e) => update('primary_support', e.target.value)} placeholder="Sponsor, mentor, family, or support contact" className="w-full min-h-[100px]" />
        <textarea value={form.urgent_needs} onChange={(e) => update('urgent_needs', e.target.value)} placeholder="Urgent needs before discharge" className="w-full min-h-[100px]" />
        <button type="submit" className="w-full min-h-[58px] rounded-3xl bg-white text-slate-950 font-black flex items-center justify-center gap-2 active:scale-95 transition">
          <ShieldCheck className="w-5 h-5" /> Save intake
        </button>
        {saved && <p className="text-sm text-emerald-200 font-bold text-center">Client intake saved.</p>}
      </form>
    </PilotShell>
  );
}