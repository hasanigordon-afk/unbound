import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Car, CheckCircle2, Clock, ListChecks, MapPinned, Target, Users } from 'lucide-react';
import PilotShell from '@/components/pilot/PilotShell';

const phases = [
  { title: 'Days 1-14', name: 'Stabilization', tasks: ['Daily check-in', 'Confirm safe housing', 'Attend first meetings'], to: '/DailyCheckIn' },
  { title: 'Days 15-30', name: 'Structure', tasks: ['Weekly itinerary', 'Transportation plan', 'Support circle cadence'], to: '/SEESuperAgent' },
  { title: 'Days 31-60', name: 'Rebuild', tasks: ['Job applications', 'Benefits follow-up', 'Milestone review'], to: '/ResourceHub' },
  { title: 'Days 61-90', name: 'Growth', tasks: ['Mentor rhythm', 'Family support', 'Habit consistency'], to: '/MyMissionBoard' },
  { title: '6 Months', name: 'Stability', tasks: ['Housing renewal', 'Employment progress', 'Recovery score trend'], to: '/Progress' },
  { title: '1 Year', name: 'Leadership', tasks: ['Give back safely', 'Sponsor/mentor readiness', 'Long-term goals'], to: '/AhHaMoments' },
  { title: '5 Year Vision', name: 'Purpose', tasks: ['Career path', 'Community role', 'Family and wellness vision'], to: '/MyMissionBoard' },
];

const actionCards = [
  { title: 'Aftercare Plan', icon: CalendarDays, to: '/AftercarePlanView', description: 'Review the counselor-built plan that feeds tasks, events, support, and risk monitoring.' },
  { title: 'Meetings', icon: Users, to: '/ResourceHub?category=Recovery%20Programs', description: 'Find recovery meetings and support commitments nearby.' },
  { title: 'Daily reminders', icon: Clock, to: '/DailyCheckIn', description: 'Keep morning, afternoon, and night structure anchored.' },
  { title: 'Tasks', icon: ListChecks, to: '/SEESuperAgent', description: 'S.E.E. AI turns plans into tasks, reminders, and check-ins.' },
  { title: 'Transportation', icon: Car, to: '/ResourceHub?category=Transportation', description: 'Plan rides and reduce missed appointments.' },
  { title: 'Goals', icon: Target, to: '/MyMissionBoard', description: 'Connect roadmap work to the Top 5 Mission Board.' },
  { title: 'Daily Check-In', icon: CheckCircle2, to: '/DailyCheckIn', description: 'Save mood, cravings, meeting attendance, support contact, and notes.' },
  { title: 'Map support', icon: MapPinned, to: '/ResourceHub', description: 'Open nearby resources when the plan needs real-world help.' },
];

export default function JourneyRoadmap() {
  return (
    <PilotShell title="Journey Roadmap" subtitle="Your daily and weekly structure in one place.">
      <div className="space-y-5">
        <section className="rounded-[36px] border border-white/12 bg-white/10 p-5 shadow-2xl backdrop-blur-2xl">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-200/70">Horizontal Roadmap</p>
          <h2 className="mt-2 font-sans text-3xl font-black text-white">Each phase unlocks goals, tasks, reminders, and support actions.</h2>
          <div className="no-scrollbar mt-5 flex gap-4 overflow-x-auto pb-2">
            {phases.map((phase, index) => (
              <Link key={phase.title} to={phase.to} className="min-w-[250px] rounded-[30px] border border-white/12 bg-white/10 p-5 shadow-xl">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-100">Phase {index + 1}</p>
                <h3 className="mt-2 font-sans text-2xl font-black text-white">{phase.title}</h3>
                <p className="mt-1 text-sm font-black text-blue-100">{phase.name}</p>
                <ul className="mt-4 space-y-2">
                  {phase.tasks.map((task) => <li key={task} className="text-sm font-bold text-slate-300">• {task}</li>)}
                </ul>
              </Link>
            ))}
          </div>
        </section>
        <div className="grid gap-4 md:grid-cols-2">
          {actionCards.map(({ title, icon: Icon, to, description }) => (
            <Link key={title} to={to} className="rounded-[30px] border border-white/12 bg-white/10 p-5 shadow-xl backdrop-blur-2xl transition hover:-translate-y-1 active:scale-[.99]">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/14"><Icon className="h-6 w-6 text-white" /></div>
              <h3 className="font-sans text-xl font-black text-white">{title}</h3>
              <p className="mt-2 text-sm font-bold leading-relaxed text-slate-300">{description}</p>
            </Link>
          ))}
        </div>
      </div>
    </PilotShell>
  );
}