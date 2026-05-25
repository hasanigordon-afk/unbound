import React from 'react';
import { CalendarDays, Compass, Target, Trophy, UserRound } from 'lucide-react';
import PilotShell from '@/components/pilot/PilotShell';
import HomeSummaryCard from '@/components/pilot/home/HomeSummaryCard';

const journeyItems = [
  { title: 'Profile', description: 'Your personal details, preferences, contacts, and recovery identity in one place.', icon: UserRound, to: '/Profile', accent: 'gold' },
  { title: 'Progress', description: 'Track recovery score, streaks, milestones, meetings, and weekly growth.', icon: Trophy, to: '/Progress', accent: 'green' },
  { title: 'Goals', description: 'Keep your top non-negotiables and personal priorities visible.', icon: Target, to: '/MyMissionBoard', accent: 'blue' },
  { title: 'Roadmap', description: 'See today’s structure, appointments, reminders, and next steps.', icon: Compass, to: '/JourneyRoadmap', accent: 'violet' },
];

export default function JourneyHub() {
  return (
    <PilotShell title="My Journey" subtitle="Your profile, progress, goals, and roadmap together.">
      <div className="space-y-5">
        <section className="rounded-[34px] border border-white/12 bg-white/10 p-6 shadow-2xl backdrop-blur-2xl">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-200/80">Primary personal hub</p>
          <h2 className="mt-3 font-sans text-4xl font-black leading-tight text-white">My Journey</h2>
          <p className="mt-3 text-sm font-bold leading-relaxed text-slate-300">Start with Profile, then continue into progress, goals, and your roadmap.</p>
        </section>

        <div className="grid gap-4 md:grid-cols-2">
          {journeyItems.map((item) => <HomeSummaryCard key={item.title} {...item} />)}
        </div>
      </div>
    </PilotShell>
  );
}