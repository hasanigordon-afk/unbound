import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, Building2, Car, Church, Dumbbell, HeartHandshake, Home, MapPinned, MessageCircle, Search, Trophy, Users, Utensils } from 'lucide-react';
import HomeSectionHeader from './HomeSectionHeader';

const wins = ['Completed meetings', 'Achievements', 'Goals reached', 'Appointments completed', 'Community contributions', 'Milestones', 'Family progress', 'Growth moments'];
const circle = [
  ['Counselor', 'Available'], ['Sponsor', 'Online'], ['Family', 'Recently active'], ['Mentor', 'Available'], ['Community', 'Online'],
];
const resources = [
  ['Food', Utensils], ['Housing', Home], ['Meetings', Users], ['Transportation', Car], ['Staffing agencies', Building2], ['Support services', HeartHandshake], ['Churches', Church], ['Gyms', Dumbbell],
];

export default function WinsSupportAIResources() {
  return (
    <div className="space-y-5">
      <section className="card p-5">
        <HomeSectionHeader eyebrow="My Wins" title="Positive progress only." subtitle="No shame metrics. Just proof that forward movement is happening." />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {wins.map((win, index) => (
            <Link to="/PositiveProgressHub" key={win} className="rounded-[26px] border border-emerald-200/14 bg-emerald-300/10 p-4 transition hover:-translate-y-1 active:scale-95">
              <Trophy className="mb-3 h-5 w-5 text-emerald-200" />
              <p className="font-sans text-2xl font-black text-white">{index + 1}</p>
              <p className="text-xs font-bold text-emerald-100/80">{win}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="card p-5">
          <HomeSectionHeader eyebrow="Support Circle" title="Your people, one tap away." />
          <div className="space-y-3">
            {circle.map(([name, status]) => (
              <div key={name} className="flex items-center gap-3 rounded-[24px] bg-white/8 p-3">
                <span className="h-3 w-3 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(52,211,153,.7)]" />
                <div className="flex-1"><p className="font-black text-white">{name}</p><p className="text-xs font-bold text-slate-400">{status}</p></div>
                <Link to="/SuperAgentChat" className="rounded-full bg-white px-4 py-2 text-xs font-black text-slate-950 active:scale-95 transition"><MessageCircle className="mr-1 inline h-3 w-3" />Message</Link>
              </div>
            ))}
          </div>
        </div>

        <div className="card-glow p-5">
          <HomeSectionHeader eyebrow="Ask AI" title="Ask anything." subtitle="Recovery, jobs, resources, transportation, life guidance, wellness, or reentry." />
          <Link to="/SuperAgentChat" className="flex min-h-[120px] items-center gap-4 rounded-[30px] bg-white p-5 text-slate-950 transition hover:-translate-y-1 active:scale-95">
            <div className="rounded-3xl bg-slate-950 p-4 text-white"><Bot className="h-7 w-7" /></div>
            <div><p className="font-sans text-2xl font-black">What do you need next?</p><p className="text-sm font-bold text-slate-500">Get a clear step, not a wall of advice.</p></div>
          </Link>
        </div>
      </section>

      <section className="card p-5">
        <HomeSectionHeader eyebrow="Local Help Near Me" title="Real-world support close by." subtitle="Food, housing, meetings, transportation, staffing agencies, support services, churches, and gyms." />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {resources.map(([label, Icon]) => (
            <Link key={label} to="/RecoveryMapFinder" className="rounded-[26px] border border-white/10 bg-white/8 p-4 text-center transition hover:-translate-y-1 active:scale-95">
              <Icon className="mx-auto mb-3 h-6 w-6 text-blue-200" />
              <p className="text-xs font-black text-slate-200">{label}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}