import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CalendarDays, CheckCircle2, Clock, Cog, HeartHandshake, NotebookPen, Route, Settings, Target, Trophy, UserRound } from 'lucide-react';
import ActionPanel from '@/components/pilot/ActionPanel';

const sections = [
  { key: 'overview', title: 'Overview', icon: UserRound, description: 'Your recovery snapshot, identity, and next best step.', options: ['Review profile', 'Update focus', 'Save note'] },
  { key: 'progress', title: 'My Progress', icon: Trophy, description: 'Streaks, meetings, check-ins, and weekly momentum.', options: ['Streaks', 'Meetings', 'Weekly progress'], to: '/Progress' },
  { key: 'score', title: 'Recovery Score', icon: CheckCircle2, description: 'A simple prototype score based on consistency and support actions.', options: ['Score: 82', 'Improve today', 'View trend'] },
  { key: 'goals', title: 'Goals', icon: Target, description: 'Top priorities and non-negotiables for rebuilding life.', options: ['Family', 'Work', 'Housing', 'Health'] },
  { key: 'roadmap', title: 'Roadmap', icon: Route, description: 'Appointments, reminders, tasks, meetings, and aftercare steps.', options: ['Today', 'This week', 'Aftercare plan'] },
  { key: 'achievements', title: 'Achievements', icon: Trophy, description: 'Wins and milestones worth remembering.', options: ['7 day streak', 'Meeting attended', 'Goal completed'] },
  { key: 'journal', title: 'Journal', icon: NotebookPen, description: 'Write and save reflections from your day.', options: ['Today I noticed...', 'I handled...', 'Tomorrow I need...'] },
  { key: 'timeline', title: 'Timeline', icon: Clock, description: 'A simple history of recovery actions and progress.', options: ['Today', 'This week', 'This month'] },
  { key: 'support', title: 'Support Circle', icon: HeartHandshake, description: 'People, mentors, counselors, and trusted contacts.', options: ['Sponsor', 'Counselor', 'Family', 'Peer'] },
  { key: 'settings', title: 'Settings', icon: Settings, description: 'Preferences, notifications, privacy, and app setup.', options: ['Notifications', 'Privacy', 'Preferences'], to: '/NotificationSettings' },
];

export default function ProfileHubSections() {
  const [active, setActive] = useState(null);

  if (active) {
    return <ActionPanel action={{ title: active.title, type: 'Profile hub', description: active.description, options: active.options, sample: { title: `${active.title} sample`, date: 'Today' } }} onBack={() => setActive(null)} />;
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[34px] border border-white/12 bg-white/10 p-6 shadow-2xl backdrop-blur-2xl">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-200/80">Personal hub</p>
        <h2 className="mt-3 font-sans text-4xl font-black leading-tight text-white">Profile</h2>
        <p className="mt-3 text-sm font-bold leading-relaxed text-slate-300">This is your recovery home base: progress, score, goals, roadmap, journal, support circle, and settings.</p>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        {sections.map((section) => {
          const Icon = section.icon;
          const card = (
            <>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/14">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-sans text-xl font-black text-white">{section.title}</h3>
                  <p className="text-xs font-bold text-amber-100/80">{section.to ? 'Open page' : 'Open section'}</p>
                </div>
              </div>
              <p className="text-sm font-bold leading-relaxed text-slate-300">{section.description}</p>
            </>
          );

          if (section.to) {
            return (
              <Link key={section.key} id={section.key} to={section.to} className="rounded-[30px] border border-white/12 bg-white/10 p-5 text-left shadow-xl backdrop-blur-2xl transition hover:bg-white/14">
                {card}
              </Link>
            );
          }

          return (
            <button key={section.key} id={section.key} onClick={() => setActive(section)} className="rounded-[30px] border border-white/12 bg-white/10 p-5 text-left shadow-xl backdrop-blur-2xl active:scale-[.98]">
              {card}
            </button>
          );
        })}
      </div>
    </div>
  );
}