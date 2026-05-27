import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, ShieldCheck, Sparkles, Trophy, Users } from 'lucide-react';
import PilotShell from '@/components/pilot/PilotShell';

export default function CommunityHub() {
  const cards = [
    { title: 'Ah Ha Moments', icon: Sparkles, to: '/AhHaMoments', description: 'Read, submit, save, and react with Inspired, Respect, Powerful, Needed This, and Proud Of You.' },
    { title: 'Support Circle', icon: Users, to: '/Profile#support', description: 'Counselors, sponsors, mentors, family, friends, POs, and peers stay connected to your plan.' },
    { title: 'Encouragement', icon: Heart, to: '/PositiveProgressHub', description: 'Progress, wins, support activity, and positive messages connect back to the dashboard.' },
    { title: 'Moderation', icon: ShieldCheck, to: '/AhHaMomentsAdmin', description: 'Public posts are reviewed before approval so the space stays hopeful and non-toxic.' },
    { title: 'Peer Momentum', icon: Trophy, to: '/AhHaCommunity', description: 'The deeper community feed supports comments, reports, saves, and private/public sharing.' },
    { title: 'Messages', icon: MessageCircle, to: '/CounselorMessaging', description: 'Care-team messaging links support activity to counselor workflows.' },
  ];

  return (
    <PilotShell title="Community" subtitle="Ah Ha Moments, support circles, encouragement, and moderated peer connection.">
      <div className="space-y-5">
        <Link to="/AhHaMoments" className="block rounded-[36px] border border-emerald-300/20 bg-emerald-400/10 p-5 text-left shadow-2xl backdrop-blur-2xl">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-100">Help. Hope. Healing.</p>
          <h2 className="mt-2 font-sans text-3xl font-black text-white">Open Ah Ha Moments</h2>
          <p className="mt-2 text-sm font-bold text-slate-300">Text, audio, video, anonymous, public, private, and moderated community insight in one real workflow.</p>
        </Link>
        <div className="grid gap-4 md:grid-cols-2">
          {cards.map(({ title, icon: Icon, to, description }) => (
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