import React from 'react';
import { Briefcase, GraduationCap, Heart, Home, Target, Dumbbell } from 'lucide-react';
import SectionHubPage from '@/components/pilot/SectionHubPage';

export default function MyMissionBoard() {
  return <SectionHubPage title="My Mission Board" subtitle="Your top life goals stay visible every day." primaryAction={{ title: 'Top 5 Non-Negotiables', description: 'Goals, missions, non-negotiables, and life plan are now organized here.' }} sections={[
    { title: 'Reconnect with family', icon: Heart, description: 'Relationship repair and steady connection.', items: ['Call', 'Message', 'Show up'] },
    { title: 'Employment', icon: Briefcase, description: 'Job search, applications, interviews, and work stability.', items: ['Apply', 'Follow up', 'Prepare'] },
    { title: 'Housing', icon: Home, description: 'Stable housing steps and support options.', items: ['Search', 'Apply', 'Confirm'] },
    { title: 'Health', icon: Dumbbell, description: 'Physical and mental health routines that protect progress.', items: ['Move', 'Rest', 'Care'] },
    { title: 'Education', icon: GraduationCap, description: 'Classes, certificates, and learning goals.', items: ['Learn', 'Practice', 'Complete'] },
    { title: 'Mission focus', icon: Target, description: 'Daily decisions guided by what matters most.', items: ['Choose', 'Act', 'Review'] },
  ]} />;
}