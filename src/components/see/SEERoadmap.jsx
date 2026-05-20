import React from 'react';
import { Bell, Bus, CalendarDays, CheckSquare, ShieldCheck, Target, UsersRound } from 'lucide-react';

const iconMap = {
  appointments: CalendarDays,
  meetings: UsersRound,
  probation: ShieldCheck,
  transportation: Bus,
  goals: Target,
  reminders: Bell,
  actions: CheckSquare,
};

const labels = {
  appointments: 'Appointments',
  meetings: 'Meeting Schedule',
  probation: 'Probation Requirements',
  transportation: 'Transportation Needs',
  goals: 'Client Goals',
  reminders: 'Daily Reminders',
  actions: 'Accountability Actions',
};

export default function SEERoadmap({ roadmap }) {
  return (
    <section className="rounded-[34px] border border-white/12 bg-white/10 p-5 shadow-2xl backdrop-blur-2xl">
      <div className="mb-5">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-200">Organized recovery roadmap</p>
        <h2 className="mt-2 font-sans text-2xl font-black">Generated plan</h2>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {Object.entries(labels).map(([key, label]) => {
          const Icon = iconMap[key];
          const items = roadmap[key] || [];
          return (
            <div key={key} className="rounded-[26px] border border-white/10 bg-white/8 p-4">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-blue-100"><Icon className="h-5 w-5" /></div>
                <h3 className="font-sans font-black">{label}</h3>
              </div>
              <div className="space-y-2">
                {items.map((item) => <p key={item} className="rounded-2xl bg-white/8 px-3 py-2 text-sm text-slate-200">{item}</p>)}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}