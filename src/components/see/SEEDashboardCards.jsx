import React from 'react';
import { Bell, Bus, CalendarDays, CheckCircle2, Clock3, TrendingUp } from 'lucide-react';

const cards = [
  { label: 'Calendar population', value: '8 events', detail: 'IOP, probation, meetings', icon: CalendarDays, pct: 92 },
  { label: 'Daily reminders', value: '14 queued', detail: 'Morning, evening, medication', icon: Bell, pct: 84 },
  { label: 'Transportation plan', value: '3 rides', detail: 'Bus routes + pickup windows', icon: Bus, pct: 68 },
  { label: 'Accountability score', value: '76%', detail: 'Follow-up readiness', icon: TrendingUp, pct: 76 },
];

export default function SEEDashboardCards() {
  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ label, value, detail, icon: Icon, pct }) => (
        <div key={label} className="rounded-[30px] border border-white/12 bg-white/10 p-5 shadow-xl backdrop-blur-2xl">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-400/15 text-blue-100"><Icon className="h-5 w-5" /></div>
            <CheckCircle2 className="h-5 w-5 text-emerald-200" />
          </div>
          <p className="font-sans text-3xl font-black">{value}</p>
          <p className="mt-1 text-sm font-black text-white">{label}</p>
          <p className="mt-1 text-xs text-slate-300">{detail}</p>
          <div className="mt-4 h-2 rounded-full bg-white/10"><div className="h-2 rounded-full bg-blue-300" style={{ width: `${pct}%` }} /></div>
        </div>
      ))}
      <div className="rounded-[30px] border border-emerald-300/20 bg-emerald-400/10 p-5 shadow-xl backdrop-blur-2xl md:col-span-2 xl:col-span-4">
        <div className="flex items-center gap-3">
          <Clock3 className="h-6 w-6 text-emerald-200" />
          <div>
            <p className="text-sm font-bold text-emerald-100">Onboarding time comparison</p>
            <h3 className="font-sans text-2xl font-black">Traditional: 45–60 minutes vs ReZilient S.E.E.: 5–10 minutes</h3>
          </div>
        </div>
      </div>
    </section>
  );
}