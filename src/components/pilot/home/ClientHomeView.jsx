import React from 'react';
import { CalendarDays, CheckCircle2, HeartPulse, LifeBuoy, MapPinned, MessageCircle, Shield, Sparkles, Target, Trophy, UserRound, Users } from 'lucide-react';
import HomeCarouselSection from './HomeCarouselSection';

const sections = [
  {
    eyebrow: 'Today',
    title: "Today's Focus",
    items: [
      { title: 'Daily Itinerary', description: 'Appointments, reminders, meetings, and transportation for today.', icon: CalendarDays, to: '/Profile#roadmap', accent: 'blue' },
      { title: 'Recovery Check-In', description: 'Quick mood, craving, and support check-in when you need it.', icon: HeartPulse, to: '/WellnessCenter', accent: 'green' },
      { title: 'Top Priority', description: 'Keep the one thing that matters most today in front of you.', icon: Target, to: '/Profile#goals', accent: 'gold' },
    ],
  },
  {
    eyebrow: 'Journey',
    title: 'Continue Journey',
    items: [
      { title: 'Profile', description: 'Start with your personal recovery profile and preferences.', icon: UserRound, to: '/Profile', accent: 'gold' },
      { title: 'Progress', description: 'Review streaks, recovery score, milestones, and weekly movement.', icon: Trophy, to: '/Profile#progress', accent: 'green' },
      { title: 'Roadmap', description: 'Continue your next steps inside your Profile hub.', icon: CheckCircle2, to: '/Profile#roadmap', accent: 'violet' },
    ],
  },
  {
    eyebrow: 'Tools',
    title: 'Recovery Tools',
    items: [
      { title: 'Calm Reset', description: 'Breathing, meditation, music, and quick grounding tools.', icon: LifeBuoy, to: '/WellnessCenter', accent: 'rose' },
      { title: 'Craving Support', description: 'Use a quick support path before the moment gets bigger.', icon: Shield, to: '/WellnessCenter', accent: 'blue' },
      { title: 'AI Support', description: 'Ask for help organizing next steps, resources, or structure.', icon: Sparkles, to: '/WellnessCenter', accent: 'violet' },
    ],
  },
  {
    eyebrow: 'Nearby',
    title: 'Nearby Resources',
    items: [
      { title: 'Find Help', description: 'Shelter, food, rehab, jobs, transportation, and practical support.', icon: MapPinned, to: '/ResourceHub', accent: 'blue' },
      { title: 'Transportation', description: 'Plan rides and reduce missed appointments.', icon: CalendarDays, to: '/JourneyRoadmap', accent: 'gold' },
      { title: 'Recovery Services', description: 'Find local recovery support and structured care options.', icon: HeartPulse, to: '/ResourceHub', accent: 'green' },
    ],
  },
  {
    eyebrow: 'Community',
    title: 'Community Highlights',
    items: [
      { title: 'Encouragement Feed', description: 'See real support, wins, and messages from the community.', icon: MessageCircle, to: '/Community', accent: 'rose' },
      { title: 'Peer Groups', description: 'Connect with people walking a similar path.', icon: Users, to: '/Community', accent: 'violet' },
      { title: 'Wins', description: 'Celebrate small steps that prove momentum is happening.', icon: Trophy, to: '/Community', accent: 'gold' },
    ],
  },
];

export default function ClientHomeView() {
  return (
    <div className="space-y-5">
      {sections.map((section) => <HomeCarouselSection key={section.title} {...section} />)}
    </div>
  );
}