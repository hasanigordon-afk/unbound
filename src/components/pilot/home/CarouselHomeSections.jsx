import React from 'react';
import { Bot, Briefcase, CalendarDays, Car, Church, Dumbbell, GraduationCap, Heart, HeartPulse, Home, MapPinned, MessageCircle, Sparkles, Star, Target, Trophy, Users, Utensils } from 'lucide-react';
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
  return <ImmersiveCarousel eyebrow="Life Journey Carousel" title="Your Roadmap" subtitle="Your week. Your plan. Your progress." items={items} viewAllTo="/RecoveryPath" />;
}

export function MissionCarouselSection() {
  const items = [
    ['Reconnect with daughter', Heart, gradients.rose], ['Find stable housing', Home, gradients.blue], ['Attend meetings', Users, gradients.green], ['Apply for jobs', Briefcase, gradients.gold], ['Improve health', Dumbbell, gradients.violet],
  ].map(([title, icon, gradient]) => ({ title, kicker: 'My Non-Negotiable', subtitle: 'A permanent mission album that guides today’s choices.', meta: 'Top 5 life goal', icon, gradient, to: '/TopFiveNonNegotiables', cta: 'Refine mission' }));
  return <ImmersiveCarousel eyebrow="My Non-Negotiables" title="Mission Albums" subtitle="Top 5 life goals that stay visible and shape the plan." items={items} />;
}

export function PillarsCarouselSection() {
  const items = [
    { title: 'Recovery & Accountability', icon: HeartPulse, gradient: gradients.green, subtitle: 'Positive check-ins, sponsor support, roadmap progress, achievements, and AI accountability.', meta: '76% momentum', to: '/RecoveryPath' },
    { title: 'Reentry & Stability', icon: Home, gradient: gradients.blue, subtitle: 'Housing, transportation, jobs, food assistance, legal help, and local resources.', meta: 'Resources ready', to: '/RecoveryMapFinder' },
    { title: 'Community & Relationships', icon: Users, gradient: gradients.violet, subtitle: 'Mentors, family support, sober friendships, Ah Ha stories, groups, veterans, and community feed.', meta: '3 supporters active', to: '/AhHaCommunity' },
    { title: 'Growth & Future Building', icon: Sparkles, gradient: gradients.gold, subtitle: 'Wellness, meditation, journaling, education, exercise, goals, and routines.', meta: 'Future building', to: '/MindBodyRecovery' },
  ].map((item) => ({ ...item, kicker: 'Core Pillar', status: 'Explore', cta: 'Enter world' }));
  return <ImmersiveCarousel eyebrow="The 4 Core Pillars" title="Choose Your World" subtitle="Swipe through the connected systems that rebuild life." items={items} />;
}

export function WinsCarouselSection() {
  const items = [
    ['Meetings Completed', Users, gradients.green], ['Goals Achieved', Star, gradients.gold], ['Streaks', Target, gradients.blue], ['Family Wins', Heart, gradients.rose], ['Community Support', Trophy, gradients.violet], ['Job Applications', Briefcase, gradients.slate],
  ].map(([title, icon, gradient]) => ({ title, kicker: 'Achievement Album', subtitle: 'Collected as positive proof of progress. No shame metrics, ever.', meta: '✨ Progress Made', status: 'Collected', icon, gradient, to: '/PositiveProgressHub', cta: 'View vault' }));
  return <ImmersiveCarousel eyebrow="My Wins" title="Achievement Albums" subtitle="Collect forward movement like moments worth replaying." items={items} viewAllTo="/PositiveProgressHub" />;
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
    ['Housing', '1.2 mi', Home, gradients.blue], ['Food', '0.7 mi', Utensils, gradients.green], ['Meetings', '2.3 mi', Users, gradients.violet], ['Jobs', '1.8 mi', Briefcase, gradients.gold], ['Churches', '0.9 mi', Church, gradients.rose], ['Gyms', '1.5 mi', Dumbbell, gradients.slate], ['Transportation', '0.4 mi', Car, gradients.blue],
  ].map(([title, distance, icon, gradient]) => ({ title, kicker: 'Local Help Near Me', subtitle: 'Nearby resource sorted for what is useful right now.', meta: distance, status: 'Near Me', icon, gradient, to: '/RecoveryMapFinder', cta: 'Open map' }));
  return <ImmersiveCarousel eyebrow="Local Help Near Me" title="Resource Covers" subtitle="Swipe nearby housing, food, meetings, jobs, churches, gyms, and transportation." items={items} viewAllTo="/RecoveryMapFinder" />;
}