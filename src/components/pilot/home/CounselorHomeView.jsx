import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CalendarCheck, ClipboardList, FileText, Home, MessageSquare, Sparkles, Target, TrendingUp, UsersRound } from 'lucide-react';

const overview = [
  { label: 'Active clients', value: '42', icon: UsersRound, tone: 'text-blue-100 bg-blue-400/15' },
  { label: 'Recent check-ins', value: '31', icon: CalendarCheck, tone: 'text-emerald-100 bg-emerald-400/15' },
  { label: 'Missed check-ins', value: '7', icon: AlertTriangle, tone: 'text-amber-100 bg-amber-400/15' },
  { label: 'Need follow-up', value: '5', icon: MessageSquare, tone: 'text-rose-100 bg-rose-400/15' },
];

const progress = [
  { label: 'Check-in streak', value: '12 days', pct: 80 },
  { label: 'Mood trend', value: 'Improving', pct: 68 },
  { label: 'Meeting attendance', value: '4 / week', pct: 72 },
  { label: 'Completed goals', value: '9', pct: 60 },
  { label: 'Missed tasks', value: '3', pct: 25 },
  { label: 'Resource usage', value: 'High', pct: 76 },
];

const tasks = [
  { label: 'Attend meeting', to: '/MeetingDirectory' },
  { label: 'Call sponsor', to: '/SuperAgentChat' },
  { label: 'Complete journal', to: '/Journal' },
  { label: 'Apply for ID', to: '/IdentityBridge' },
  { label: 'Apply for benefits', to: '/BenefitsAssistance' },
  { label: 'Contact housing resource', to: '/NJHousingSearch' },
  { label: 'Job search task', to: '/EmploymentOpportunities' },
];
const referrals = [
  { label: 'Rehab / IOP', to: '/RecoveryMapFinder' },
  { label: 'Shelter', to: '/NJHousingSearch' },
  { label: 'Food pantry', to: '/RecoveryMapFinder' },
  { label: 'Job agency', to: '/EmploymentOpportunities' },
  { label: 'Veteran support', to: '/VeteranSupportHub' },
  { label: 'Transportation', to: '/RecoveryMapFinder' },
  { label: 'Legal aid', to: '/JusticeRadar' },
];

export default function CounselorHomeView() {
  const [plan, setPlan] = useState({ client: 'Marcus J.', discharge: '2026-05-28', goals: 'Maintain outpatient care, attend meetings, stabilize housing.', notes: 'Client responds well to clear daily structure and morning reminders.' });

  const update = (field, value) => setPlan((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="space-y-5">
      <section className="rounded-[34px] border border-white/12 bg-gradient-to-br from-blue-400/15 to-violet-400/10 p-5 shadow-2xl backdrop-blur-2xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-200">New AI workflow</p>
            <h2 className="mt-2 font-sans text-2xl font-black">S.E.E. Super Agent</h2>
            <p className="mt-2 text-sm text-slate-300">Turn natural-language aftercare notes into calendars, reminders, referrals, and accountability steps.</p>
          </div>
          <Link to="/SEESuperAgent" className="inline-flex min-h-[54px] items-center justify-center gap-2 rounded-3xl bg-white px-5 font-black text-slate-950 active:scale-95 transition">
            <Sparkles className="h-5 w-5" /> Open S.E.E.
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {overview.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="rounded-[28px] border border-white/12 bg-white/10 p-4 shadow-xl backdrop-blur-2xl">
            <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl ${tone}`}><Icon className="h-5 w-5" /></div>
            <p className="font-sans text-3xl font-black">{value}</p>
            <p className="mt-1 text-xs text-slate-300">{label}</p>
          </div>
        ))}
      </section>

      <section className="rounded-[34px] border border-white/12 bg-white/10 p-5 shadow-2xl backdrop-blur-2xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-2xl bg-blue-400/15 p-3 text-blue-100"><ClipboardList className="h-5 w-5" /></div>
          <div>
            <h2 className="font-sans text-xl font-black">Client Treatment / Aftercare Plan Builder</h2>
            <p className="text-sm text-slate-300">Planning support for discharge continuity.</p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <input value={plan.client} onChange={(e) => update('client', e.target.value)} placeholder="Client name" className="min-h-[54px]" />
          <input type="date" value={plan.discharge} onChange={(e) => update('discharge', e.target.value)} className="min-h-[54px]" />
          {['Recovery goals', 'Housing needs', 'Employment needs', 'Transportation needs', 'Legal/probation requirements', 'Meeting schedule', 'Medication reminders', 'Support contacts'].map((label) => (
            <input key={label} placeholder={label} className="min-h-[54px]" />
          ))}
        </div>
        <textarea value={plan.notes} onChange={(e) => update('notes', e.target.value)} placeholder="Custom notes" className="mt-3 min-h-[110px] w-full" />
      </section>

      <section className="rounded-[30px] border border-white/12 bg-white/10 p-5 backdrop-blur-2xl shadow-xl">
        <div className="mb-4 flex items-center gap-3"><TrendingUp className="h-5 w-5 text-emerald-200" /><h2 className="font-sans text-xl font-black">Client Progress Snapshot</h2></div>
        <div className="grid gap-3 md:grid-cols-2">
          {progress.map((item) => (
            <div key={item.label} className="rounded-3xl bg-white/8 p-4">
              <div className="mb-2 flex items-center justify-between gap-3"><p className="text-sm font-bold text-slate-200">{item.label}</p><p className="text-sm font-black text-white">{item.value}</p></div>
              <div className="h-2 rounded-full bg-white/10"><div className="h-2 rounded-full bg-blue-300" style={{ width: `${item.pct}%` }} /></div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-[30px] border border-white/12 bg-white/10 p-5 backdrop-blur-2xl shadow-xl">
          <div className="mb-4 flex items-center gap-3"><Target className="h-5 w-5 text-violet-200" /><h2 className="font-sans text-xl font-black">Assign Support Tasks</h2></div>
          <div className="grid grid-cols-2 gap-2">{tasks.map((task) => <Link key={task.label} to={task.to} className="rounded-2xl bg-white/8 px-3 py-3 text-left text-xs font-black text-slate-200 active:scale-95 transition">{task.label}</Link>)}</div>
        </div>
        <div className="rounded-[30px] border border-white/12 bg-white/10 p-5 backdrop-blur-2xl shadow-xl">
          <div className="mb-4 flex items-center gap-3"><Home className="h-5 w-5 text-sky-200" /><h2 className="font-sans text-xl font-black">Resource Referral Panel</h2></div>
          <div className="grid grid-cols-2 gap-2">{referrals.map((item) => <Link key={item.label} to={item.to} className="rounded-2xl bg-white/8 px-3 py-3 text-left text-xs font-black text-slate-200 active:scale-95 transition">Send {item.label}</Link>)}</div>
        </div>
      </section>

      <section className="rounded-[30px] border border-white/12 bg-white/10 p-5 backdrop-blur-2xl shadow-xl">
        <div className="mb-4 flex items-center gap-3"><FileText className="h-5 w-5 text-amber-200" /><h2 className="font-sans text-xl font-black">Counselor Notes</h2></div>
        <textarea className="min-h-[130px] w-full" placeholder="Private counselor notes only visible in Counselor View." />
      </section>
    </div>
  );
}