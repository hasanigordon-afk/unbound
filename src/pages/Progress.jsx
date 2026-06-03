import React from 'react';
import { CalendarDays, CheckCircle2, HeartPulse, Star, Target, Trophy, Users } from 'lucide-react';
import SectionHubPage from '@/components/pilot/SectionHubPage';

export default function Progress() {
  return (
    <SectionHubPage
      title="Progress"
      subtitle="Track recovery, accountability, and forward movement without shame."
      primaryAction={{
        title: 'Positive Progress Hub',
        description: 'Log wins, achievements, supporter sharing, and spoken milestone celebrations.',
        to: '/PositiveProgressHub',
      }}
      sections={[
        { title: 'Current streak', icon: Target, description: 'Daily check-ins build your streak and unlock spoken milestone celebrations.', items: ['Today', 'Week', 'Month'], to: '/DailyCheckIn' },
        { title: 'Days active', icon: CalendarDays, description: 'Days you showed up and used the app for life rebuilding.', items: ['Active', 'Consistent', 'Growing'], to: '/Profile' },
        { title: 'Meetings attended', icon: Users, description: 'Recovery support attendance and connection.', items: ['This week', 'This month', 'Total'], to: '/ResourceHub?category=Recovery%20Programs' },
        { title: 'Mood trends', icon: HeartPulse, description: 'Notice patterns in mood and stress over time.', items: ['Mood', 'Cravings', 'Energy'], to: '/DailyCheckIn' },
        { title: 'Goals completed', icon: CheckCircle2, description: 'Completed steps from your roadmap and mission board.', items: ['Tasks', 'Goals', 'Routines'], to: '/MyMissionBoard' },
        { title: 'Milestones', icon: Trophy, description: 'Meaningful moments worth remembering — with optional voice celebration.', items: ['Recovery', 'Work', 'Family'], to: '/JourneyRoadmap' },
        { title: 'Achievements', icon: Star, description: 'Positive proof that you are moving forward.', items: ['Wins', 'Badges', 'Growth'], to: '/PositiveProgressHub' },
        { title: 'Voice reminders', icon: HeartPulse, description: 'Choose male or female voice for milestone and achievement encouragement.', items: ['Female', 'Male', 'Auto-play'], to: '/NotificationSettings' },
      ]}
    />
  );
}
