import React from 'react';
import { Link } from 'react-router-dom';
import { Headphones, Heart, HeartPulse, LifeBuoy, Music, PenLine, Sparkles, Wind } from 'lucide-react';
import PilotShell from '@/components/pilot/PilotShell';

export default function WellnessCenter() {
  const tools = [
    { title: 'Daily check-in', icon: HeartPulse, to: '/DailyCheckIn', description: 'Save mood, craving intensity, meeting attendance, support contact, and notes.' },
    { title: 'Emergency calm', icon: LifeBuoy, to: '/CravingControlCenter', description: 'Breathing, grounding, craving support, meditation, music, and emergency contacts.' },
    { title: 'Breathing exercises', icon: Wind, to: '/CravingControlCenter', description: 'Use box breathing and reset timers when pressure rises.' },
    { title: 'Meditation', icon: Heart, to: '/CravingControlCenter', description: 'Short guided resets that bring the next right step back into reach.' },
    { title: 'Binaural beats', icon: Headphones, to: '/CravingControlCenter', description: 'Audio support for calm, focus, and rest.' },
    { title: 'Journal', icon: PenLine, to: '/DailyCheckIn', description: 'Capture the moment inside a check-in so counselors can spot risk patterns.' },
    { title: 'Music', icon: Music, to: '/CravingControlCenter', description: 'Calm and motivational audio connected to craving support.' },
    { title: 'Ask ReZilient AI', icon: Sparkles, to: '/AskReZilientAI', description: 'Ask for help calming down, finding meetings, or choosing one next step.' },
  ];

  return (
    <PilotShell title="Wellness Center" subtitle="Quick calming tools for the moment you are in.">
      <div className="space-y-5">
        <Link to="/CravingControlCenter" className="block rounded-[36px] border border-rose-300/20 bg-rose-400/10 p-5 shadow-2xl backdrop-blur-2xl">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-rose-100">Emergency Calm Button</p>
          <h2 className="mt-2 font-sans text-3xl font-black text-white">Open breathing, meditation, music, mentor access, grounding, and positive messages.</h2>
          <p className="mt-2 text-sm font-bold text-slate-300">This is wired to the full craving-control workflow and stays reachable globally from the floating reset button.</p>
        </Link>
        <div className="grid gap-4 md:grid-cols-2">
          {tools.map(({ title, icon: Icon, to, description }) => (
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