import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { ClipboardList, Save } from 'lucide-react';
import PilotShell from '@/components/pilot/PilotShell';

const initial = { client_name: '', client_email: '', discharge_date: '', diagnosis_summary: '', treatment_goals: '', medications: '', relapse_triggers: '', required_aftercare_tasks: '', counselor_notes: '' };

export default function PilotTreatmentPlan() {
  const [form, setForm] = useState(initial);
  const [saved, setSaved] = useState(false);

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const savePlan = async (e) => {
    e.preventDefault();
    await base44.entities.PilotTreatmentPlan.create({
      ...form,
      required_aftercare_tasks: form.required_aftercare_tasks.split('\n').map((item) => item.trim()).filter(Boolean),
      status: 'draft',
    });
    setSaved(true);
    setForm(initial);
  };

  return (
    <PilotShell title="Treatment Plan Input" subtitle="Counselors capture the essentials before discharge so clients start with a lighter app experience.">
      <form onSubmit={savePlan} className="rounded-[34px] bg-white/10 border border-white/12 p-5 backdrop-blur-2xl shadow-2xl space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-400/15 flex items-center justify-center"><ClipboardList className="w-6 h-6" /></div>
          <div>
            <h2 className="text-xl font-bold font-sans">Pre-discharge essentials</h2>
            <p className="text-sm text-slate-300">Keep this brief and clinically useful.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <input required value={form.client_name} onChange={(e) => update('client_name', e.target.value)} placeholder="Client name" className="w-full min-h-[56px]" />
          <input required type="email" value={form.client_email} onChange={(e) => update('client_email', e.target.value)} placeholder="Client email" className="w-full min-h-[56px]" />
          <input type="date" value={form.discharge_date} onChange={(e) => update('discharge_date', e.target.value)} className="w-full min-h-[56px]" />
          <input value={form.medications} onChange={(e) => update('medications', e.target.value)} placeholder="Medication notes" className="w-full min-h-[56px]" />
        </div>

        <textarea value={form.diagnosis_summary} onChange={(e) => update('diagnosis_summary', e.target.value)} placeholder="Clinical summary / focus areas" className="w-full min-h-[110px]" />
        <textarea value={form.treatment_goals} onChange={(e) => update('treatment_goals', e.target.value)} placeholder="Treatment goals" className="w-full min-h-[110px]" />
        <textarea value={form.relapse_triggers} onChange={(e) => update('relapse_triggers', e.target.value)} placeholder="Known triggers and warning signs" className="w-full min-h-[110px]" />
        <textarea value={form.required_aftercare_tasks} onChange={(e) => update('required_aftercare_tasks', e.target.value)} placeholder={'Required aftercare tasks, one per line\nExample: Attend IOP intake\nSchedule MAT follow-up\nCall sponsor daily'} className="w-full min-h-[140px]" />
        <textarea value={form.counselor_notes} onChange={(e) => update('counselor_notes', e.target.value)} placeholder="Counselor notes for follow-up" className="w-full min-h-[110px]" />

        <button type="submit" className="w-full min-h-[58px] rounded-3xl bg-white text-slate-950 font-black flex items-center justify-center gap-2 active:scale-95 transition">
          <Save className="w-5 h-5" /> Save pilot plan
        </button>
        {saved && <p className="text-sm text-emerald-200 font-bold text-center">Plan saved for pilot follow-up.</p>}
      </form>
    </PilotShell>
  );
}