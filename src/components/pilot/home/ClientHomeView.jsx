import React from 'react';
import { CalendarDays, CheckCircle2, Compass, HeartPulse, Home, LifeBuoy, MapPinned, Shield, Target, Users } from 'lucide-react';
import HomeSummaryCard from './HomeSummaryCard';

const pillars = [
  { title: 'Daily Structure', description: 'What needs to happen today: itinerary, reminders, appointments, and rides.', icon: CalendarDays, to: '/JourneyRoadmap', accent: 'blue' },
  { title: 'Recovery Support', description: 'Check-ins, meetings, sponsor support, cravings, and relapse prevention.', icon: Shield, to: '/JourneyRoadmap', accent: 'green' },
  { title: 'Resources', description: 'Shelter, food, rehab, jobs, transportation, and veteran support.', icon: MapPinned, to: '/ResourceHub', accent: 'violet' },
  { title: 'Mental Wellness', description: 'Meditation, breathing, binaural beats, journaling, and quick calm tools.', icon: LifeBuoy, to: '/WellnessCenter', accent: 'rose' },
];

export default function ClientHomeView() {
  return (
    <div className="space-y-5">
      <section className="rounded-[34px] border border-white/12 bg-white/10 p-6 shadow-2xl backdrop-blur-2xl">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-200/80">Today’s command center</p>
        <h2 className="mt-3 font-sans text-4xl font-black leading-tight text-white">What do you need today?</h2>
        <p className="mt-3 text-sm font-bold leading-relaxed text-slate-300">Your most important recovery structure is organized here first, then everything else is grouped in the menu.</p>
      </section>

      <HomeSummaryCard title="Weekly Itinerary" description="Appointments, meetings, reminders, transportation, and daily structure for the week." icon={CalendarDays} to="/JourneyRoadmap" accent="blue" />

      <HomeSummaryCard title="Recovery Score" description="See streaks, goals, check-ins, meetings attended, mood trends, and weekly progress." icon={CheckCircle2} to="/Progress" accent="green" />

      <HomeSummaryCard title="Top 5 Non-Negotiables" description="Keep your family, employment, housing, health, and education priorities visible." icon={Target} to="/MyMissionBoard" accent="gold" />

      <HomeSummaryCard title="Roadmap" description="A simple next-step plan that connects today’s tasks to your bigger recovery goals." icon={Compass} to="/JourneyRoadmap" accent="violet" />

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3 px-1">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-200/70">Four pillars</p>
            <h3 className="font-sans text-2xl font-black text-white">Support at a glance</h3>
          </div>
          <Users className="h-5 w-5 text-amber-200/80" />
        </div>
        <div className="-mx-4 overflow-x-auto px-4 pb-3 no-scrollbar">
          <div className="flex snap-x snap-mandatory gap-4">
            {pillars.map((item) => (
              <div key={item.title} className="min-w-[82%] snap-start sm:min-w-[420px] lg:min-w-[360px]">
                <HomeSummaryCard {...item} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}