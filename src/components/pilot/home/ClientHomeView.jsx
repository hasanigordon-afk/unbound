import React from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  BookOpen,
  Bot,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Church,
  Compass,
  Dumbbell,
  GraduationCap,
  HandHeart,
  Heart,
  HeartPulse,
  Home,
  MapPinned,
  MessageCircle,
  Mic2,
  Music2,
  Phone,
  PlayCircle,
  Shield,
  Sparkles,
  Star,
  Target,
  Trophy,
  Users,
  Utensils,
} from 'lucide-react';
import HomeSectionHeader from './HomeSectionHeader';

const itinerary = [
  { time: '9:00 AM', type: 'Check-in', title: 'Daily Strength Check', location: '2 minutes', ride: false, tone: 'emerald' },
  { time: '10:30 AM', type: 'Therapy', title: 'Outpatient therapy', location: 'Wellness Center', ride: true, tone: 'blue' },
  { time: '2:00 PM', type: 'Work', title: 'Job applications', location: 'Library lab', ride: false, tone: 'amber' },
  { time: '6:30 PM', type: 'Meeting', title: 'NA meeting', location: 'Hope Hall', ride: true, tone: 'violet' },
  { time: '8:30 PM', type: 'Circle', title: 'Sponsor call', location: 'Phone', ride: false, tone: 'rose' },
];

const missions = [
  { title: 'Get custody back', progress: 42, note: 'Show consistency every week.' },
  { title: 'Stay sober', progress: 76, note: 'Meetings, calls, check-ins.' },
  { title: 'Employment', progress: 38, note: 'Five applications this week.' },
  { title: 'Housing', progress: 55, note: 'Call two saved resources.' },
  { title: 'Family', progress: 63, note: 'One honest contact today.' },
];

const roadmap = [
  { label: 'Days 1-14', title: 'Stabilization', text: 'Safety, routine, meetings, transportation.' },
  { label: 'Days 15-30', title: 'Structure', text: 'Daily plan, appointments, housing steps.' },
  { label: 'Days 31-60', title: 'Rebuild', text: 'Work, family repair, support rhythm.' },
  { label: 'Days 61-90', title: 'Growth', text: 'Confidence, consistency, new purpose.' },
  { label: '6 months', title: 'Momentum', text: 'Longer goals and stronger identity.' },
  { label: '1 year', title: 'Foundation', text: 'Stable supports and relapse prevention.' },
  { label: '5 year', title: 'Vision', text: 'Career, family, service, freedom.' },
];

const pillars = [
  {
    title: 'Recovery',
    icon: HeartPulse,
    to: '/RecoveryPath',
    gradient: 'from-emerald-400/30 via-teal-400/10 to-white/5',
    features: ['Daily check-ins', 'Meetings', 'Cravings', 'Journaling', 'Meditation', 'Recovery score'],
  },
  {
    title: 'Reentry',
    icon: Home,
    to: '/RecoveryMapFinder',
    gradient: 'from-blue-400/30 via-cyan-400/10 to-white/5',
    features: ['Housing', 'Food', 'Jobs', 'Benefits', 'Legal', 'Transportation'],
  },
  {
    title: 'Community',
    icon: Users,
    to: '/AhHaCommunity',
    gradient: 'from-violet-400/30 via-fuchsia-400/10 to-white/5',
    features: ['Ah Ha Moments', 'Support circles', 'Stories', 'Groups', 'Mentors', 'Peers'],
  },
  {
    title: 'Growth',
    icon: Sparkles,
    to: '/MindBodyRecovery',
    gradient: 'from-amber-300/30 via-orange-400/10 to-white/5',
    features: ['Fitness', 'Goals', 'Habits', 'Books', 'Career', 'Purpose'],
  },
];

const aiPrompts = [
  'How do I get housing?',
  'Find food near me',
  'Help me calm down',
  'What meetings tonight?',
  'What jobs near me?',
];

const resources = [
  { title: 'Food pantry', icon: Utensils, distance: '0.7 mi', tag: 'Open today' },
  { title: 'Shelter intake', icon: Home, distance: '1.2 mi', tag: 'Call first' },
  { title: 'Staffing agency', icon: Briefcase, distance: '1.8 mi', tag: 'Hiring' },
  { title: 'Legal aid', icon: Shield, distance: '2.1 mi', tag: 'Free consult' },
  { title: 'YMCA', icon: Dumbbell, distance: '1.5 mi', tag: 'Wellness' },
  { title: 'Church support', icon: Church, distance: '0.9 mi', tag: 'Meal night' },
];

const supportCircle = [
  { role: 'Counselor', name: 'Rivera', status: 'Last contact today', icon: MessageCircle },
  { role: 'Sponsor', name: 'D.', status: 'Available tonight', icon: HeartPulse },
  { role: 'Mentor', name: 'Andre', status: 'Sent encouragement', icon: Star },
  { role: 'Family', name: 'Mom', status: 'Replied yesterday', icon: Heart },
  { role: 'PO', name: 'Officer Lee', status: 'Court reminder set', icon: Shield },
];

const audioVault = [
  { title: 'NA speakers', icon: Mic2, length: '42 min' },
  { title: 'Calming frequency', icon: Music2, length: '10 min' },
  { title: 'Breathing reset', icon: PlayCircle, length: '4 min' },
  { title: 'Success stories', icon: Trophy, length: '18 min' },
];

function MetricPill({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/8 px-3 py-2 text-center">
      <p className="text-lg font-black text-white">{value}</p>
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{label}</p>
    </div>
  );
}

function Section({ eyebrow, title, subtitle, children, className = '' }) {
  return (
    <section className={`card p-5 sm:p-6 ${className}`}>
      <HomeSectionHeader eyebrow={eyebrow} title={title} subtitle={subtitle} />
      {children}
    </section>
  );
}

function PillarCard({ pillar }) {
  const Icon = pillar.icon;
  return (
    <Link to={pillar.to} className={`rounded-[30px] border border-white/12 bg-gradient-to-br ${pillar.gradient} p-5 transition hover:-translate-y-1 active:scale-[0.99]`}>
      <div className="mb-5 flex items-center justify-between">
        <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white/12 text-white shadow-inner">
          <Icon className="h-7 w-7" />
        </div>
        <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-200">Open</span>
      </div>
      <h3 className="font-sans text-2xl font-black text-white">{pillar.title}</h3>
      <div className="mt-4 flex flex-wrap gap-2">
        {pillar.features.map((feature) => (
          <span key={feature} className="rounded-full border border-white/10 bg-black/16 px-3 py-1.5 text-xs font-bold text-slate-200">{feature}</span>
        ))}
      </div>
    </Link>
  );
}

export default function ClientHomeView() {
  return (
    <div className="space-y-5 overflow-hidden">
      <section className="card-glow relative overflow-hidden p-5 sm:p-7">
        <div className="absolute -right-16 -top-20 h-60 w-60 rounded-full bg-amber-300/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-14 h-56 w-56 rounded-full bg-cyan-300/16 blur-3xl" />
        <div className="relative">
          <p className="text-xs font-black uppercase tracking-[0.26em] text-amber-200">Built For Life's Biggest Comebacks.</p>
          <h1 className="mt-3 max-w-3xl font-sans text-4xl font-black leading-[0.98] tracking-tight text-white sm:text-6xl">
            What do I need today?
          </h1>
          <p className="mt-4 max-w-2xl text-base font-bold leading-relaxed text-slate-300">
            ReZilient keeps your plan, people, resources, reminders, and next best step in one warm companion.
          </p>
          <div className="mt-6 grid grid-cols-3 gap-2">
            <MetricPill label="Streak" value="14d" />
            <MetricPill label="Engage" value="86%" />
            <MetricPill label="Risk" value="Low" />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Link to="/DailyCheckIn" className="btn-primary flex min-h-[58px] items-center justify-center gap-2 px-4 text-sm"><CheckCircle2 className="h-5 w-5" /> Check in</Link>
            <Link to="/SuperAgentChat" className="btn-ghost flex min-h-[58px] items-center justify-center gap-2 px-4 text-sm"><Bot className="h-5 w-5" /> Ask AI</Link>
          </div>
        </div>
      </section>

      <Section eyebrow="Weekly itinerary" title="Today and this week" subtitle="Appointments, meetings, court, work, rides, and support in a clean timeline.">
        <div className="space-y-3">
          {itinerary.map((item) => (
            <div key={`${item.time}-${item.title}`} className="flex gap-3 rounded-[26px] border border-white/10 bg-white/8 p-4">
              <div className="w-20 shrink-0">
                <p className="text-sm font-black text-white">{item.time}</p>
                <p className="mt-1 text-[10px] font-black uppercase tracking-[0.14em] text-blue-200">{item.type}</p>
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-black text-white">{item.title}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-300">
                  <span>{item.location}</span>
                  {item.ride && <span className="rounded-full bg-amber-300/15 px-2 py-1 text-amber-100">Ride needed</span>}
                </div>
              </div>
              <CalendarDays className="h-5 w-5 shrink-0 text-slate-400" />
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Top 5 mission board" title="Non-negotiables" subtitle="A living whiteboard for the reasons you keep rebuilding.">
        <div className="grid gap-3 sm:grid-cols-2">
          {missions.map((mission, index) => (
            <Link key={mission.title} to="/TopFiveNonNegotiables" className="rounded-[26px] border border-white/10 bg-white/8 p-4 transition hover:bg-white/12">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-950 font-black">{index + 1}</div>
                <div className="min-w-0 flex-1">
                  <p className="font-black text-white">{mission.title}</p>
                  <p className="mt-1 text-sm font-bold text-slate-300">{mission.note}</p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-cyan-300" style={{ width: `${mission.progress}%` }} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      <Section eyebrow="My roadmap" title="From stabilization to vision" subtitle="A horizontal comeback timeline that expands beyond the first 90 days.">
        <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
          {roadmap.map((phase, index) => (
            <div key={phase.label} className="min-w-[210px] rounded-[28px] border border-white/10 bg-white/8 p-4">
              <div className="mb-4 flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full ${index <= 1 ? 'bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,.7)]' : 'bg-white/25'}`} />
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-200">{phase.label}</p>
              </div>
              <p className="font-black text-white">{phase.title}</p>
              <p className="mt-2 text-sm font-bold leading-relaxed text-slate-300">{phase.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <section className="grid gap-4 md:grid-cols-2">
        {pillars.map((pillar) => <PillarCard key={pillar.title} pillar={pillar} />)}
      </section>

      <Section eyebrow="Ask ReZilient AI" title="One clear next step" subtitle="Natural-language support that understands your plan, role, resources, and risk context.">
        <div className="grid gap-3">
          {aiPrompts.map((prompt) => (
            <Link key={prompt} to="/SuperAgentChat" className="flex items-center justify-between rounded-[24px] border border-white/10 bg-white/8 p-4 transition hover:bg-white/12">
              <span className="font-black text-white">{prompt}</span>
              <Bot className="h-5 w-5 text-cyan-200" />
            </Link>
          ))}
        </div>
      </Section>

      <Section eyebrow="Local resource map" title="Help near you" subtitle="Food, shelters, rehabs, IOP, employment, transportation, churches, YMCA, government help, Goodwill, Salvation Army, and legal aid.">
        <div className="grid gap-3 sm:grid-cols-2">
          {resources.map((resource) => {
            const Icon = resource.icon;
            return (
              <Link key={resource.title} to="/RecoveryMapFinder" className="rounded-[26px] border border-white/10 bg-white/8 p-4 transition hover:bg-white/12">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white"><Icon className="h-5 w-5" /></div>
                  <div className="min-w-0 flex-1">
                    <p className="font-black text-white">{resource.title}</p>
                    <p className="text-xs font-bold text-slate-400">{resource.distance} - {resource.tag}</p>
                  </div>
                  <MapPinned className="h-5 w-5 text-slate-400" />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px] font-black text-slate-200">
                  <span className="rounded-full bg-white/8 py-2">Directions</span>
                  <span className="rounded-full bg-white/8 py-2">Call</span>
                  <span className="rounded-full bg-white/8 py-2">Save</span>
                </div>
              </Link>
            );
          })}
        </div>
      </Section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Section eyebrow="Accountability" title="Daily Strength Check" subtitle="Mood, stress, energy, meetings, cravings, sleep, notes, streaks, milestones, and risk indicators.">
          <div className="grid grid-cols-2 gap-3">
            <MetricPill label="Mood" value="4/5" />
            <MetricPill label="Stress" value="3/10" />
            <MetricPill label="Sleep" value="6.5h" />
            <MetricPill label="Score" value="86" />
          </div>
          <Link to="/DailyCheckIn" className="btn-gold mt-4 flex min-h-[56px] items-center justify-center gap-2 text-sm"><Target className="h-5 w-5" /> Complete strength check</Link>
        </Section>

        <Section eyebrow="Support circle" title="Your people" subtitle="Counselor, sponsor, mentor, family, friends, PO, and peer support with last contact and encouragement.">
          <div className="space-y-3">
            {supportCircle.map((person) => {
              const Icon = person.icon;
              return (
                <Link key={`${person.role}-${person.name}`} to="/InnerCircle" className="flex items-center gap-3 rounded-[22px] border border-white/10 bg-white/8 p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10"><Icon className="h-5 w-5 text-white" /></div>
                  <div className="min-w-0 flex-1">
                    <p className="font-black text-white">{person.role}: {person.name}</p>
                    <p className="text-xs font-bold text-slate-400">{person.status}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </Section>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Section eyebrow="Ah Ha Moment" title="The moment life changed" subtitle="Text, audio, or video stories with anonymous/private options and supportive reactions only.">
          <div className="rounded-[28px] border border-amber-200/20 bg-amber-200/10 p-5">
            <p className="text-lg font-black text-white">"I realized I was not done. I was just starting again."</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['Respect', 'Powerful', 'Needed This', 'Proud Of You', 'Inspired'].map((reaction) => (
                <span key={reaction} className="rounded-full bg-white/10 px-3 py-2 text-xs font-black text-amber-100">{reaction}</span>
              ))}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Link to="/SubmitAhHa" className="btn-primary flex min-h-[54px] items-center justify-center text-sm">Share safely</Link>
            <Link to="/AhHaCommunity" className="btn-ghost flex min-h-[54px] items-center justify-center text-sm">Read stories</Link>
          </div>
        </Section>

        <Section eyebrow="Recovery audio vault" title="Sound for hard moments" subtitle="NA audio, AA speakers, motivation, meditation, calming frequencies, binaural beats, stories, and podcasts.">
          <div className="grid gap-3">
            {audioVault.map((track) => {
              const Icon = track.icon;
              return (
                <Link key={track.title} to="/ResetButton" className="flex items-center gap-3 rounded-[22px] border border-white/10 bg-white/8 p-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white"><Icon className="h-5 w-5" /></div>
                  <div className="flex-1">
                    <p className="font-black text-white">{track.title}</p>
                    <p className="text-xs font-bold text-slate-400">{track.length}</p>
                  </div>
                  <PlayCircle className="h-5 w-5 text-cyan-200" />
                </Link>
              );
            })}
          </div>
        </Section>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Section eyebrow="Veteran hub" title="Mission continues" subtitle="Benefits, VA help, military mentorship, housing, community, and veteran-specific resources.">
          <div className="grid grid-cols-2 gap-3">
            {[
              [Award, 'Benefits'],
              [HandHeart, 'VA support'],
              [Users, 'Mentorship'],
              [Home, 'Housing'],
            ].map(([Icon, label]) => (
              <Link key={label} to="/VeteranSupportHub" className="rounded-[24px] border border-white/10 bg-white/8 p-4 text-center">
                <Icon className="mx-auto h-6 w-6 text-emerald-200" />
                <p className="mt-2 text-sm font-black text-white">{label}</p>
              </Link>
            ))}
          </div>
        </Section>

        <Section eyebrow="Positive profile" title="Growth only" subtitle="Wins, milestones, goals, favorite memories, positive places, hobbies, support, and improvement graphs.">
          <div className="space-y-3">
            {[
              [Trophy, '7 wins saved this month'],
              [GraduationCap, 'Career learning in progress'],
              [Compass, 'Three positive places pinned'],
              [BookOpen, 'Purpose journal active'],
            ].map(([Icon, text]) => (
              <Link key={text} to="/Profile" className="flex items-center gap-3 rounded-[22px] border border-white/10 bg-white/8 p-3">
                <Icon className="h-5 w-5 text-amber-200" />
                <p className="font-black text-white">{text}</p>
              </Link>
            ))}
          </div>
        </Section>
      </section>

      <section className="card-glow p-5 text-center">
        <Phone className="mx-auto h-7 w-7 text-rose-200" />
        <h2 className="mt-3 font-sans text-2xl font-black text-white">Panic support is always one tap away.</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm font-bold leading-relaxed text-slate-300">Calming sound, breathing, grounding, emergency contacts, mentor access, and encouragement stay visible everywhere.</p>
      </section>
    </div>
  );
}