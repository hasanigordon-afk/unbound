import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Briefcase, HeartPulse, Home, MessageCircle, PenLine, ShieldCheck, Sparkles, Trophy, Users } from 'lucide-react';
import HomeSectionHeader from './HomeSectionHeader';

const pillars = [
  { title: 'Recovery & Accountability', icon: HeartPulse, stat: '4 steady actions today', progress: 76, actions: [['Daily check-in', '/RecoveryPath'], ['Positive achievements', '/PositiveProgressHub'], ['Roadmap progress', '/RecoveryPath'], ['Sponsor support', '/InnerCircle']] },
  { title: 'Reentry & Stability', icon: Home, stat: 'Resources ready nearby', progress: 62, actions: [['Housing', '/NJHousingSearch'], ['Jobs', '/EmploymentOpportunities'], ['Transportation', '/RecoveryMapFinder'], ['Food resources', '/RecoveryMapFinder'], ['Legal support', '/JusticeRadar']] },
  { title: 'Community & Relationships', icon: Users, stat: '3 supporters active', progress: 68, actions: [['Community', '/AhHaCommunity'], ['Family support', '/InnerCircle'], ['Mentors', '/Mentors'], ['Sober friendships', '/MeetingDirectory'], ['Ah Ha stories', '/AhHaMoment']] },
  { title: 'Growth & Future Building', icon: Sparkles, stat: 'Momentum building', progress: 71, actions: [['Fitness', '/MindBodyRecovery'], ['Wellness', '/MentalReset'], ['Meditation', '/Meditation'], ['Education', '/LearnRecovery'], ['Journaling', '/Journal'], ['Goals', '/TopFiveNonNegotiables']] },
];

export default function CorePillarsGrid() {
  return (
    <section>
      <HomeSectionHeader eyebrow="The 4 Core Pillars" title="Everything connected, nothing random." subtitle="Each pillar feeds your roadmap, wins, support circle, and next best step." />
      <div className="grid gap-4 lg:grid-cols-2">
        {pillars.map(({ title, icon: Icon, stat, progress, actions }) => (
          <div key={title} className="card p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-3xl bg-blue-300/15 p-3 text-blue-100"><Icon className="h-6 w-6" /></div>
              <div className="flex-1">
                <h3 className="font-sans text-xl font-black text-white">{title}</h3>
                <p className="text-sm font-bold text-slate-300">{stat}</p>
              </div>
            </div>
            <div className="mb-4 h-3 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-emerald-300 via-blue-300 to-amber-300 transition-all duration-700" style={{ width: `${progress}%` }} /></div>
            <div className="flex flex-wrap gap-2">
              {actions.map(([label, to]) => <Link key={label} to={to} className="rounded-full border border-white/10 bg-white/8 px-3 py-2 text-xs font-black text-slate-200 transition active:scale-95 hover:bg-white/12">{label}</Link>)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}