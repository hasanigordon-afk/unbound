import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, CalendarDays, Car, CheckCircle2, Dumbbell, GripVertical, HeartPulse, MessageCircle, Target, Users } from 'lucide-react';
import HomeSectionHeader from './HomeSectionHeader';

const starterMilestones = [
  { id: 'appointments', label: "Today's appointments", detail: 'Confirm time, location, and next step.', icon: CalendarDays, to: '/AftercarePlanView', done: true },
  { id: 'meetings', label: 'Meetings', detail: 'Find or attend a recovery meeting today.', icon: Users, to: '/MeetingDirectory', done: false },
  { id: 'recovery', label: 'Recovery activities', detail: 'Check in, reflect, and protect your routine.', icon: HeartPulse, to: '/RecoveryPath', done: false },
  { id: 'jobs', label: 'Job search tasks', detail: 'Apply, follow up, or prepare for work.', icon: Briefcase, to: '/EmploymentOpportunities', done: false },
  { id: 'family', label: 'Family goals', detail: 'Send one honest, steady message.', icon: MessageCircle, to: '/InnerCircle', done: false },
  { id: 'wellness', label: 'Wellness activities', detail: 'Move, breathe, journal, or meditate.', icon: Dumbbell, to: '/MindBodyRecovery', done: true },
  { id: 'counselor', label: 'Counselor tasks', detail: 'Complete the next aftercare action.', icon: CheckCircle2, to: '/SuperAgentChat', done: false },
  { id: 'transport', label: 'Transportation reminders', detail: 'Confirm your ride before you need it.', icon: Car, to: '/RecoveryMapFinder', done: false },
  { id: 'personal', label: 'Personal goals', detail: 'One small action toward your bigger mission.', icon: Target, to: '/TopFiveNonNegotiables', done: false },
];

export default function RoadmapCommandCenter() {
  const [items, setItems] = useState(starterMilestones);
  const [expanded, setExpanded] = useState('appointments');
  const [dragId, setDragId] = useState(null);

  const moveItem = (targetId) => {
    if (!dragId || dragId === targetId) return;
    setItems((current) => {
      const from = current.findIndex((item) => item.id === dragId);
      const to = current.findIndex((item) => item.id === targetId);
      const next = [...current];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const toggleDone = (id) => {
    setItems((current) => current.map((item) => item.id === id ? { ...item, done: !item.done } : item));
  };

  return (
    <section className="card-glow p-5 sm:p-6">
      <HomeSectionHeader eyebrow="Top Command Center" title="Your Roadmap" subtitle="Your week. Your plan. Your progress." />
      <div className="relative space-y-3 before:absolute before:left-7 before:top-8 before:bottom-8 before:w-1 before:rounded-full before:bg-gradient-to-b before:from-emerald-300/70 before:via-blue-300/45 before:to-amber-300/50">
        {items.map((item, index) => {
          const Icon = item.icon;
          const isOpen = expanded === item.id;
          return (
            <div
              key={item.id}
              draggable
              onDragStart={() => setDragId(item.id)}
              onDragOver={(e) => { e.preventDefault(); moveItem(item.id); }}
              onDragEnd={() => setDragId(null)}
              className={`relative rounded-[28px] border p-3 transition-all duration-300 active:scale-[0.99] ${item.done ? 'border-emerald-200/25 bg-emerald-300/12 shadow-[0_0_26px_rgba(52,211,153,.16)]' : 'border-white/12 bg-white/8 hover:bg-white/12'}`}
            >
              <button type="button" onClick={() => setExpanded(isOpen ? '' : item.id)} className="flex w-full items-center gap-3 text-left">
                <span className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950/55 ring-4 ring-[#07101f]">
                  <Icon className="h-5 w-5 text-blue-100" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-black uppercase tracking-[0.18em] text-slate-400">Mission {index + 1}</span>
                  <span className="block font-sans text-base font-black text-white">{item.label}</span>
                </span>
                <GripVertical className="h-5 w-5 text-slate-500" />
              </button>
              {isOpen && (
                <div className="ml-14 mt-3 rounded-3xl bg-slate-950/35 p-4 fade-up">
                  <p className="text-sm font-bold leading-relaxed text-slate-300">{item.detail}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button onClick={() => toggleDone(item.id)} className="min-h-[42px] rounded-full bg-white px-4 text-xs font-black text-slate-950 active:scale-95 transition">{item.done ? 'Celebrate again' : 'Mark complete'}</button>
                    <Link to={item.to} className="inline-flex min-h-[42px] items-center rounded-full border border-white/12 bg-white/8 px-4 text-xs font-black text-white active:scale-95 transition">Open tool</Link>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}