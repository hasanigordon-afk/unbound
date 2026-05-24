import React from 'react';
import { Bot, CheckCircle2, LifeBuoy, MapPinned, MessageCircle, Target } from 'lucide-react';
import HomeSummaryCard from './HomeSummaryCard';

const summaries = [
  { title: 'Today’s Roadmap', description: 'Appointments, meetings, reminders, tasks, transportation, goals, and daily structure.', icon: MapPinned, to: '/JourneyRoadmap', accent: 'blue' },
  { title: 'Top 5 Non-Negotiables', description: 'Your visible daily life missions: family, employment, housing, health, and education.', icon: Target, to: '/MyMissionBoard', accent: 'gold' },
  { title: 'Progress Snapshot', description: 'Current streak, days active, meetings attended, mood trends, goals, and milestones.', icon: CheckCircle2, to: '/Progress', accent: 'green' },
  { title: 'Nearby Resources', description: 'Food, transportation, housing, shelters, jobs, veteran support, and recovery help.', icon: MapPinned, to: '/ResourceHub', accent: 'violet' },
  { title: 'Wellness Quick Calm Button', description: 'Meditation, calming music, breathing, panic support, binaural beats, and journaling.', icon: LifeBuoy, to: '/WellnessCenter', accent: 'rose' },
  { title: 'Community Highlights', description: 'Ah Ha Moments, recovery stories, support groups, and encouragement.', icon: MessageCircle, to: '/Community', accent: 'blue' },
  { title: 'Ask AI Companion', description: 'Ask for focus, transportation, nearby meetings, local help, or help organizing the week.', icon: Bot, to: '/AICompanion', accent: 'green' },
];

export default function ClientHomeView() {
  return (
    <div className="space-y-5">
      <section className="rounded-[34px] border border-white/12 bg-white/10 p-6 shadow-2xl backdrop-blur-2xl">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-200/80">Life rebuilding companion</p>
        <h2 className="mt-3 font-sans text-4xl font-black leading-tight text-white">One calm place to rebuild life today.</h2>
        <p className="mt-3 text-sm font-bold leading-relaxed text-slate-300">ReZilient keeps recovery, accountability, structure, resources, wellness, and community organized without duplicate screens.</p>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        {summaries.map((item) => <HomeSummaryCard key={item.title} {...item} />)}
      </div>
    </div>
  );
}