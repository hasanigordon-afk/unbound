import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Brain, Briefcase, Bus, CheckSquare, HeartPulse, Home, LifeBuoy, MapPinned, Search, ShieldCheck, Target, Trophy, Utensils } from 'lucide-react';
import WeeklyRecoveryItinerary from './WeeklyRecoveryItinerary';

const pillars = [
  { title: 'Recovery Support', icon: HeartPulse, actions: ['Daily check-in', 'Meeting finder', 'Craving reset', 'Sponsor contact'] },
  { title: 'Reentry & Stability', icon: Home, actions: ['ID help', 'Housing leads', 'Benefits checklist', 'Legal reminders'] },
  { title: 'Mental Wellness', icon: Brain, actions: ['Breathing reset', 'Journal prompt', 'Mood tracker', 'Calming audio'] },
  { title: 'Growth & Accountability', icon: Target, actions: ['Top 5 goals', 'Task tracker', 'Progress streaks', 'Mentor follow-up'] },
];

const resources = [
  { label: 'Food', icon: Utensils },
  { label: 'Shelter', icon: Home },
  { label: 'Transportation', icon: Bus },
  { label: 'Job help', icon: Briefcase },
  { label: 'Treatment', icon: HeartPulse },
  { label: 'Veterans', icon: ShieldCheck },
];

export default function ClientHomeView() {
  const [goals, setGoals] = useState(['Stay consistent with recovery', 'Rebuild family trust', 'Find stable housing', 'Get back to work', 'Protect my peace']);

  const updateGoal = (index, value) => {
    setGoals((prev) => prev.map((goal, i) => (i === index ? value : goal)));
  };

  return (
    <div className="space-y-5">
      <WeeklyRecoveryItinerary />

      <Link to="/PositiveProgressHub" className="block rounded-[34px] border border-emerald-200/20 bg-gradient-to-br from-emerald-400/14 to-blue-400/10 p-5 shadow-2xl backdrop-blur-2xl active:scale-[0.99] transition">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/12"><Trophy className="h-6 w-6 text-emerald-200" /></div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-200">Positive progress</p>
            <h2 className="font-sans text-2xl font-black text-white">Share wins, not shame.</h2>
            <p className="mt-1 text-sm font-bold text-slate-300">Invite supporters, collect achievements, and celebrate steps forward.</p>
          </div>
        </div>
      </Link>

      <section className="rounded-[34px] border border-white/12 bg-white/10 p-5 shadow-2xl backdrop-blur-2xl">
        <p className="text-sm font-bold text-blue-200">Welcome back</p>
        <h2 className="mt-2 text-3xl font-black tracking-tight font-sans">Today is about one steady step.</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-300">Focus: protect your routine, reach out early, and complete one action that moves life forward.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button className="rounded-3xl bg-white px-4 py-4 text-left font-black text-slate-950 active:scale-95 transition">How are you feeling today?</button>
          <Link to="/MySafetyPlan" className="rounded-3xl border border-rose-300/20 bg-rose-400/15 px-4 py-4 font-black text-rose-100 active:scale-95 transition flex items-center gap-2">
            <LifeBuoy className="h-5 w-5" /> Emergency calming
          </Link>
        </div>
      </section>

      <section className="rounded-[34px] border border-white/12 bg-gradient-to-br from-white/95 to-blue-50 p-5 text-slate-950 shadow-2xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-2xl bg-slate-950/8 p-3"><Target className="h-5 w-5" /></div>
          <div>
            <h2 className="font-sans text-xl font-black">My Top 5 Non-Negotiable Goals</h2>
            <p className="text-xs font-bold text-slate-500">Long-term mission goals, not daily tasks.</p>
          </div>
        </div>
        <div className="space-y-3">
          {goals.map((goal, index) => (
            <input
              key={index}
              value={goal}
              onChange={(e) => updateGoal(index, e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 shadow-sm"
              placeholder={`Goal ${index + 1}`}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-sans text-xl font-black">Four Core Pillars</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {pillars.map(({ title, icon: Icon, actions }) => (
            <div key={title} className="rounded-[30px] border border-white/12 bg-white/10 p-5 backdrop-blur-2xl shadow-xl">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-2xl bg-blue-400/15 p-3 text-blue-100"><Icon className="h-5 w-5" /></div>
                <h3 className="font-sans text-lg font-black">{title}</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {actions.map((action) => <span key={action} className="rounded-2xl bg-white/8 px-3 py-2 text-xs font-bold text-slate-200">{action}</span>)}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[30px] border border-white/12 bg-white/10 p-5 backdrop-blur-2xl shadow-xl">
        <h2 className="mb-4 font-sans text-xl font-black">Today’s Accountability</h2>
        {['Daily check-in', 'Meeting reminder at 6:30 PM', 'Text sponsor or mentor', 'Journal entry', 'Complete 3 of 5 tasks'].map((item, index) => (
          <div key={item} className="mb-3 flex items-center gap-3 rounded-2xl bg-white/8 p-3 last:mb-0">
            <CheckSquare className={`h-5 w-5 ${index < 2 ? 'text-emerald-200' : 'text-slate-400'}`} />
            <span className="text-sm font-bold text-slate-200">{item}</span>
          </div>
        ))}
      </section>

      <section className="rounded-[30px] border border-white/12 bg-white/10 p-5 backdrop-blur-2xl shadow-xl">
        <div className="mb-4 flex items-center gap-3"><MapPinned className="h-5 w-5 text-blue-200" /><h2 className="font-sans text-xl font-black">Local Resources Near Me</h2></div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {resources.map(({ label, icon: Icon }) => (
            <Link key={label} to="/RecoveryMapFinder" className="rounded-3xl bg-white/8 p-4 text-center active:scale-95 transition">
              <Icon className="mx-auto mb-2 h-5 w-5 text-blue-200" />
              <p className="text-xs font-black text-slate-200">{label}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-[30px] border border-white/12 bg-white/10 p-4 backdrop-blur-2xl shadow-xl">
        <div className="flex items-center gap-3 rounded-3xl bg-white px-4 py-4 text-slate-950">
          <Search className="h-5 w-5 shrink-0" />
          <p className="text-sm font-bold text-slate-600">Ask anything about recovery, reentry, resources, goals, or getting through today.</p>
        </div>
      </section>
    </div>
  );
}