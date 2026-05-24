import React from 'react';
import { Bot, Briefcase, CalendarDays, Car, CheckCircle2, Church, Dumbbell, GraduationCap, Heart, HeartPulse, Home, MapPinned, MessageCircle, Sparkles, Star, Target, Trophy, Users, Utensils } from 'lucide-react';
import ImmersiveCarousel from './ImmersiveCarousel';

const gradients = {
  blue: 'from-blue-500/75 via-cyan-400/45 to-slate-950',
  green: 'from-emerald-500/70 via-teal-400/40 to-slate-950',
  gold: 'from-amber-400/75 via-orange-400/35 to-slate-950',
  violet: 'from-violet-500/75 via-fuchsia-400/35 to-slate-950',
  rose: 'from-rose-500/68 via-pink-400/34 to-slate-950',
  slate: 'from-slate-500/70 via-blue-400/24 to-slate-950',
};

export function RoadmapCarouselSection() {
  const items = [
    { title: 'Counseling', kicker: 'Today · 10:30 AM', subtitle: 'Talk through the next step and leave with one clear action.', meta: '⚡ Focus Now', status: 'Current', icon: MessageCircle, gradient: gradients.blue, to: '/SuperAgentChat', cta: 'Start session' },
    { title: 'Meeting', kicker: 'Tonight · 6:30 PM', subtitle: 'A steady place to stay connected and keep momentum.', meta: '🌙 Coming Up', status: 'Upcoming', icon: Users, gradient: gradients.green, to: '/MeetingDirectory', cta: 'Find meeting' },
    { title: 'Job Search', kicker: 'Today · 2 tasks', subtitle: 'Apply, follow up, or prepare for the next opportunity.', meta: '⚡ Focus Now', status: 'Priority', icon: Briefcase, gradient: gradients.gold, to: '/EmploymentOpportunities', cta: 'Open tasks' },
    { title: 'Workout', kicker: 'Wellness · 20 min', subtitle: 'Move your body and protect your mind today.', meta: '✨ Progress Made', status: 'Completed', icon: Dumbbell, gradient: gradients.violet, to: '/MindBodyRecovery', cta: 'Log win' },
    { title: 'Family Time', kicker: 'Connection · One message', subtitle: 'Send one honest, steady message to rebuild trust.', meta: '🌙 Coming Up', status: 'Upcoming', icon: Heart, gradient: gradients.rose, to: '/InnerCircle', cta: 'Message' },
    { title: 'Transportation', kicker: 'Ride · Confirm', subtitle: 'Check your ride before the appointment window.', meta: '⚡ Focus Now', status: 'Current', icon: Car, gradient: gradients.slate, to: '/RecoveryMapFinder', cta: 'Confirm ride' },
    { title: 'Education', kicker: 'Future · Learn', subtitle: 'One lesson, one certificate, one stronger option.', meta: '🌙 Coming Up', status: 'Upcoming', icon: GraduationCap, gradient: gradients.blue, to: '/LearnRecovery', cta: 'Keep learning' },
  ];
  return <ImmersiveCarousel eyebrow="Weekly Journey Roadmap" title="Weekly Journey Roadmap" subtitle="Your structured path for this week with appointments, goals, reminders, meetings, transportation, and progress." items={items} viewAllTo="/RecoveryPath" />;
}

export function MissionCarouselSection() {
  const items = [
    ['Reconnect with daughter', Heart, gradients.rose], ['Find stable housing', Home, gradients.blue], ['Attend meetings', Users, gradients.green], ['Apply for jobs', Briefcase, gradients.gold], ['Improve health', Dumbbell, gradients.violet],
  ].map(([title, icon, gradient]) => ({ title, kicker: 'Life Mission', subtitle: 'One of the top 5 life goals that remains visible every day and guides decision making.', meta: 'Top 5 life goal', icon, gradient, to: '/TopFiveNonNegotiables', cta: 'Refine mission' }));
  return <ImmersiveCarousel eyebrow="My Non-Negotiables" title="My Non-Negotiables" subtitle="The top 5 life goals that remain visible every day and guide decision making." items={items} />;
}

export function PillarsCarouselSection() {
  const items = [
    { title: 'Attend meeting', icon: Users, gradient: gradients.green, subtitle: 'Show up for one recovery support meeting today.', meta: 'Today action', to: '/MeetingDirectory' },
    { title: 'Apply to jobs', icon: Briefcase, gradient: gradients.gold, subtitle: 'Complete one job search step that moves stability forward.', meta: 'Life stability', to: '/EmploymentOpportunities' },
    { title: 'Journal', icon: Sparkles, gradient: gradients.violet, subtitle: 'Write down what happened, what helped, and the next right step.', meta: 'Reflection', to: '/DailyFlow' },
    { title: 'Call sponsor', icon: HeartPulse, gradient: gradients.blue, subtitle: 'Reach out before pressure builds and stay connected.', meta: 'Support', to: '/SuperAgentChat' },
    { title: 'Exercise', icon: Dumbbell, gradient: gradients.rose, subtitle: 'Move your body to support mood, sleep, and recovery.', meta: 'Wellness', to: '/MindBodyRecovery' },
    { title: 'Meditate', icon: Heart, gradient: gradients.slate, subtitle: 'Take a quiet reset and return to the plan.', meta: 'Grounding', to: '/MentalReset' },
  ].map((item) => ({ ...item, kicker: 'Focus Action', status: 'Today', cta: 'Start action' }));
  return <ImmersiveCarousel eyebrow="Focus Actions" title="Focus Actions" subtitle="Small actions that move life forward today." items={items} />;
}

export function WinsCarouselSection() {
  const items = [
    ['Current streak', Target, gradients.blue], ['Meetings attended', Users, gradients.green], ['Check-in consistency', CheckCircle2, gradients.gold], ['Mood trends', HeartPulse, gradients.rose], ['Milestones', Trophy, gradients.violet], ['Accountability score', Star, gradients.slate],
  ].map(([title, icon, gradient]) => ({ title, kicker: 'Recovery Progress', subtitle: 'A clear progress signal that shows forward movement without shame metrics.', meta: 'Progress indicator', status: 'Active', icon, gradient, to: '/PositiveProgressHub', cta: 'View progress' }));
  return <ImmersiveCarousel eyebrow="Recovery Progress" title="Recovery Progress" subtitle="Track current streak, meetings attended, check-in consistency, mood trends, milestones, and accountability score." items={items} viewAllTo="/PositiveProgressHub" />;
}

export function SupportCarouselSection() {
  const items = [
    ['Counselor', 'Available', MessageCircle, gradients.blue], ['Sponsor', 'Online', HeartPulse, gradients.green], ['Family', 'Recently active', Heart, gradients.rose], ['Mentor', 'Available', Star, gradients.gold], ['Community', 'Online', Users, gradients.violet],
  ].map(([title, meta, icon, gradient]) => ({ title, kicker: 'Support Circle', subtitle: 'Tap to message, start a thread, or send encouragement.', meta, status: meta, icon, gradient, to: '/SuperAgentChat', cta: 'Message now' }));
  return <ImmersiveCarousel eyebrow="Support Circle" title="Your People" subtitle="Permission-based support with live presence and immediate messaging." items={items} />;
}

export function AICompanionCarouselSection() {
  const items = [{ title: 'What do you need next?', kicker: 'AI Companion', subtitle: 'Get a clear step, not a wall of advice. Ask about recovery, jobs, transportation, wellness, reentry, or life guidance.', meta: 'Always available', status: 'Ask AI', icon: Bot, gradient: 'from-cyan-400/80 via-blue-500/45 to-violet-950', to: '/SuperAgentChat', cta: 'Ask now' }];
  return <ImmersiveCarousel eyebrow="AI Companion" title="One Clear Next Step" subtitle="Futuristic support for the moment you are in." items={items} />;
}

export function ResourceCarouselSection() {
  const items = [
    ['Food assistance', 'Nearby', Utensils, gradients.green], ['Housing', 'Nearby', Home, gradients.blue], ['Transportation', 'Nearby', Car, gradients.slate], ['Shelters', 'Nearby', MapPinned, gradients.rose], ['Staffing agencies', 'Nearby', Briefcase, gradients.gold], ['Veteran support', 'Nearby', Star, gradients.violet], ['Recovery resources', 'Nearby', HeartPulse, gradients.blue], ['Community support', 'Nearby', Users, gradients.green],
  ].map(([title, distance, icon, gradient]) => ({ title, kicker: 'Resource Hub', subtitle: 'Practical support for rebuilding life and staying connected.', meta: distance, status: 'Support', icon, gradient, to: '/RecoveryMapFinder', cta: 'Open resource' }));
  return <ImmersiveCarousel eyebrow="Resource Hub" title="Resource Hub" subtitle="Food assistance, housing, transportation, shelters, staffing agencies, veteran support, recovery resources, and community support." items={items} viewAllTo="/RecoveryMapFinder" />;
}