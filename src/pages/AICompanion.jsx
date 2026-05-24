import React from 'react';
import { Bot, CalendarDays, Car, MapPinned, MessageCircle, Target, Users } from 'lucide-react';
import SectionHubPage from '@/components/pilot/SectionHubPage';

export default function AICompanion() {
  return <SectionHubPage title="AI Companion" subtitle="Ask for help in plain language." primaryAction={{ title: 'Ask AI Companion', description: 'One place for natural-language support, search, and organization.' }} sections={[
    { title: 'Help me stay focused', icon: Target, description: 'Get one clear next step for right now.', items: ['Focus', 'Ground', 'Act'] },
    { title: 'Find transportation', icon: Car, description: 'Search for rides, routes, and transportation help.', items: ['Ride', 'Bus', 'Route'] },
    { title: 'What meetings are near me?', icon: Users, description: 'Find recovery meetings and support groups nearby.', items: ['AA', 'NA', 'SMART'] },
    { title: 'Help organize my week', icon: CalendarDays, description: 'Turn appointments, goals, reminders, and tasks into a simple plan.', items: ['Schedule', 'Tasks', 'Reminders'] },
    { title: 'Find local help', icon: MapPinned, description: 'Look for nearby food, housing, jobs, and support.', items: ['Food', 'Housing', 'Jobs'] },
    { title: 'Talk through the moment', icon: MessageCircle, description: 'Use calm, practical guidance when the day feels heavy.', items: ['Calm', 'Support', 'Next step'] },
    { title: 'AI search', icon: Bot, description: 'Search across recovery, resources, wellness, structure, and community.', items: ['Search', 'Ask', 'Organize'] },
  ]} />;
}