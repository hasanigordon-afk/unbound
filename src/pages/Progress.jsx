import React from 'react';
import { CalendarDays, CheckCircle2, HeartPulse, Star, Target, Trophy, Users } from 'lucide-react';
import SectionHubPage from '@/components/pilot/SectionHubPage';

export default function Progress() {
  return <SectionHubPage title="Progress" subtitle="Track recovery, accountability, and forward movement without shame." primaryAction={{ title: 'Progress Snapshot', description: 'Check-ins, streaks, milestones, achievements, accountability, and momentum live here.' }} sections={[
    { title: 'Current streak', icon: Target, description: 'How many days you have stayed active with your structure.', items: ['Today', 'Week', 'Month'] },
    { title: 'Days active', icon: CalendarDays, description: 'Days you showed up and used the app for life rebuilding.', items: ['Active', 'Consistent', 'Growing'] },
    { title: 'Meetings attended', icon: Users, description: 'Recovery support attendance and connection.', items: ['This week', 'This month', 'Total'] },
    { title: 'Mood trends', icon: HeartPulse, description: 'Notice patterns in mood and stress over time.', items: ['Mood', 'Cravings', 'Energy'] },
    { title: 'Goals completed', icon: CheckCircle2, description: 'Completed steps from your roadmap and mission board.', items: ['Tasks', 'Goals', 'Routines'] },
    { title: 'Milestones', icon: Trophy, description: 'Meaningful moments worth remembering.', items: ['Recovery', 'Work', 'Family'] },
    { title: 'Achievements', icon: Star, description: 'Positive proof that you are moving forward.', items: ['Wins', 'Badges', 'Growth'] },
  ]} />;
}