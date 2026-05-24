import React from 'react';
import { Bot, Briefcase, CalendarDays, Car, CheckCircle2, Dumbbell, GraduationCap, Heart, HeartPulse, Home, MapPinned, MessageCircle, Music, PenLine, Sparkles, Star, Target, Trophy, Users, Utensils, Wind } from 'lucide-react';
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
    { title: 'Appointments', kicker: 'Today · 10:30 AM', subtitle: 'Know what is next and arrive prepared.', meta: 'Today structure', status: 'Current', icon: CalendarDays, gradient: gradients.blue, to: '/RecoveryPath', cta: 'View schedule' },
    { title: 'Meetings', kicker: 'Tonight · 6:30 PM', subtitle: 'A steady place to stay connected and keep momentum.', meta: 'Coming up', status: 'Upcoming', icon: Users, gradient: gradients.green, to: '/MeetingDirectory', cta: 'Find meeting' },
    { title: 'Daily reminders', kicker: 'Today · Check-ins', subtitle: 'Small reminders that keep the day from drifting.', meta: 'Daily support', status: 'Active', icon: CheckCircle2, gradient: gradients.violet, to: '/DailyFlow', cta: 'Open reminders' },
    { title: 'Tasks', kicker: 'Today · 2 actions', subtitle: 'Apply, follow up, clean up, or complete the next step.', meta: 'Focus now', status: 'Priority', icon: Briefcase, gradient: gradients.gold, to: '/DailyFlow', cta: 'Open tasks' },
    { title: 'Transportation', kicker: 'Ride · Confirm', subtitle: 'Check your ride before the appointment window.', meta: 'Planning', status: 'Current', icon: Car, gradient: gradients.slate, to: '/RecoveryMapFinder', cta: 'Confirm ride' },
    { title: 'Goals', kicker: 'Weekly progress', subtitle: 'Keep the larger life mission visible while handling today.', meta: 'Life goals', status: 'Active', icon: Target, gradient: gradients.rose, to: '/TopFiveNonNegotiables', cta: 'View goals' },
    { title: 'Daily structure', kicker: 'Morning to night', subtitle: 'Anchor the day with a simple rhythm that supports recovery.', meta: 'Structure', status: 'Ready', icon: Sparkles, gradient: gradients.blue, to: '/MyPath', cta: 'Open routine' },
  ];
  return <ImmersiveCarousel eyebrow="Weekly Journey Roadmap" title="Weekly Journey Roadmap" subtitle="Your structured path for this week with appointments, goals, reminders, meetings, transportation, and progress." items={items} viewAllTo="/RecoveryPath" />;
}

export function MissionCarouselSection() {
  const items = [
    ['Reconnect with family', Heart, gradients.rose], ['Employment', Briefcase, gradients.gold], ['Housing', Home, gradients.blue], ['Health', Dumbbell, gradients.violet], ['Education', GraduationCap, gradients.green],
  ].map(([title, icon, gradient]) => ({ title, kicker: 'Life Mission', subtitle: 'One of the top 5 life goals that remains visible every day and guides decision making.', meta: 'Top 5 life goal', icon, gradient, to: '/TopFiveNonNegotiables', cta: 'Refine mission' }));
  return <ImmersiveCarousel eyebrow="My Non-Negotiables" title="My Non-Negotiables" subtitle="The top 5 life goals that remain visible every day and guide decision making." items={items} />;
}

export function PillarsCarouselSection() {
  const items = [
    { title: 'Attend meeting', icon: Users, gradient: gradients.green, subtitle: 'Show up for one recovery support meeting today.', meta: 'Today action', to: '/MeetingDirectory' },
    { title: 'Apply to jobs', icon: Briefcase, gradient: gradients.gold, subtitle: 'Complete one job search step that moves stability forward.', meta: 'Life stability', to: '/EmploymentOpportunities' },
    { title: 'Journal', icon: Sparkles, gradient: gradients.violet, subtitle: 'Write down what happened, what helped, and the next right step.', meta: 'Reflection', to: '/DailyFlow' },
    { title: 'Call sponsor', icon: HeartPulse, gradient: gradients.blue, subtitle: 'Reach out before pressure builds and stay connected.', meta: 'Support', to: '/SuperAgentChat' },
    { title: 'Workout', icon: Dumbbell, gradient: gradients.rose, subtitle: 'Move your body to support mood, sleep, and recovery.', meta: 'Wellness', to: '/MindBodyRecovery' },
    { title: 'Meditate', icon: Heart, gradient: gradients.slate, subtitle: 'Take a quiet reset and return to the plan.', meta: 'Grounding', to: '/MentalReset' },
  ].map((item) => ({ ...item, kicker: 'Focus Action', status: 'Today', cta: 'Start action' }));
  return <ImmersiveCarousel eyebrow="Focus Actions" title="Focus Actions" subtitle="Small actions that move life forward today." items={items} />;
}

export function WinsCarouselSection() {
  const items = [
    ['Current streak', Target, gradients.blue], ['Days active', CalendarDays, gradients.slate], ['Meetings attended', Users, gradients.green], ['Mood trends', HeartPulse, gradients.rose], ['Goals completed', CheckCircle2, gradients.gold], ['Milestones', Trophy, gradients.violet], ['Achievements', Star, gradients.slate],
  ].map(([title, icon, gradient]) => ({ title, kicker: 'Recovery Progress', subtitle: 'A clear progress signal that shows forward movement without shame metrics.', meta: 'Progress indicator', status: 'Active', icon, gradient, to: '/PositiveProgressHub', cta: 'View progress' }));
  return <ImmersiveCarousel eyebrow="Progress Dashboard" title="Progress Dashboard" subtitle="Track current streak, days active, meetings attended, mood trends, goals completed, milestones, and achievements." items={items} viewAllTo="/PositiveProgressHub" />;
}

export function CommunityCarouselSection() {
  const items = [
    ['Ah Ha Moments', 'Real stories that help you feel less alone.', Sparkles, gradients.gold, '/AhHaCommunity'],
    ['Recovery stories', 'Read lived experience and practical encouragement.', MessageCircle, gradients.blue, '/StoriesHub'],
    ['Support groups', 'Find people walking a similar path.', Users, gradients.green, '/MeetingDirectory'],
    ['Encouragement', 'Give and receive steady support.', Heart, gradients.rose, '/PositiveProgressHub'],
  ].map(([title, subtitle, icon, gradient, to]) => ({ title, kicker: 'Community', subtitle, meta: 'Connection', status: 'Support', icon, gradient, to, cta: 'Open' }));
  return <ImmersiveCarousel eyebrow="Community" title="Community" subtitle="Ah Ha Moments, recovery stories, support groups, and encouragement." items={items} />;
}

export function WellnessCarouselSection() {
  const items = [
    ['Calming music', 'A quiet reset when your nervous system needs support.', Music, gradients.blue, '/MentalReset'],
    ['Meditation', 'Slow down and return to the next right step.', Heart, gradients.violet, '/MindBodyRecovery'],
    ['Breathing tools', 'Use guided breathing to lower pressure in the moment.', Wind, gradients.green, '/ResetButton'],
    ['Binaural beats', 'Sound support for calm and focus.', HeartPulse, gradients.slate, '/ResetButton'],
    ['Panic support button', 'Fast support when the moment feels too big.', MessageCircle, gradients.rose, '/Lifeline'],
    ['Journaling', 'Put the day into words and clear your head.', PenLine, gradients.gold, '/DailyFlow'],
  ].map(([title, subtitle, icon, gradient, to]) => ({ title, kicker: 'Wellness Center', subtitle, meta: 'Self-support', status: 'Available', icon, gradient, to, cta: 'Open tool' }));
  return <ImmersiveCarousel eyebrow="Wellness Center" title="Wellness Center" subtitle="Calming music, meditation, breathing tools, binaural beats, panic support, and journaling." items={items} />;
}

export function AICompanionCarouselSection() {
  const items = [
    ['Help me stay focused', 'Get a simple next step for this moment.', Target],
    ['Find transportation', 'Search for ride, bus, or nearby transportation support.', Car],
    ['What meetings are near me?', 'Find recovery meetings and support close by.', Users],
    ['Help organize my week', 'Turn appointments, reminders, tasks, and goals into a simple plan.', CalendarDays],
  ].map(([title, subtitle, icon]) => ({ title, kicker: 'AI Companion Search', subtitle, meta: 'Natural language support', status: 'Ask AI', icon, gradient: 'from-cyan-400/80 via-blue-500/45 to-violet-950', to: '/SuperAgentChat', cta: 'Ask now' }));
  return <ImmersiveCarousel eyebrow="AI Companion Search" title="AI Companion Search" subtitle="Ask in plain language: help me stay focused, find transportation, nearby meetings, or organize my week." items={items} />;
}

export function ResourceCarouselSection() {
  const items = [
    ['Food resources', 'Nearby', Utensils, gradients.green], ['Transportation', 'Nearby', Car, gradients.slate], ['Housing', 'Nearby', Home, gradients.blue], ['Shelters', 'Nearby', MapPinned, gradients.rose], ['Staffing agencies', 'Nearby', Briefcase, gradients.gold], ['Veteran support', 'Nearby', Star, gradients.violet], ['Community help', 'Nearby', Users, gradients.green], ['Recovery resources', 'Nearby', HeartPulse, gradients.blue],
  ].map(([title, distance, icon, gradient]) => ({ title, kicker: 'Resource Hub', subtitle: 'Practical support for rebuilding life and staying connected.', meta: distance, status: 'Support', icon, gradient, to: '/RecoveryMapFinder', cta: 'Open resource' }));
  return <ImmersiveCarousel eyebrow="Resource Hub" title="Resource Hub" subtitle="Food resources, transportation, housing, shelters, staffing agencies, veteran support, community help, and recovery resources." items={items} viewAllTo="/RecoveryMapFinder" />;
}