import React from 'react';
import { CalendarDays, Car, CheckCircle2, Clock, ListChecks, MapPinned, Target, Users } from 'lucide-react';
import WorkingSectionHub from '@/components/pilot/WorkingSectionHub';

export default function JourneyRoadmap() {
  return <WorkingSectionHub title="Journey Roadmap" subtitle="Your daily and weekly structure in one place." primaryAction={{ title: 'Today’s Roadmap', description: 'Appointments, meetings, reminders, tasks, transportation, goals, and daily structure without duplicate screens.' }} sections={[
    { title: 'Aftercare Plan', icon: CalendarDays, description: 'Review, edit, and save your aftercare plan notes.', items: ['Today', 'This week', 'Reminders'] },
    { title: 'Meetings', icon: Users, description: 'Recovery meetings and support commitments for the week.', items: ['Nearby', 'Planned', 'Attended'] },
    { title: 'Daily reminders', icon: Clock, description: 'Gentle prompts that keep the day anchored.', items: ['Morning', 'Afternoon', 'Night'] },
    { title: 'Tasks', icon: ListChecks, description: 'Small practical steps that move life forward.', items: ['Jobs', 'Housing', 'Health'] },
    { title: 'Transportation', icon: Car, description: 'Ride, bus, and route planning for critical appointments.', items: ['Confirm ride', 'Route', 'Leave time'] },
    { title: 'Goals', icon: Target, description: 'Weekly priorities connected to your mission board.', items: ['Top 5', 'Focus', 'Progress'] },
    { title: 'Daily Check-In', icon: CheckCircle2, description: 'Save a quick daily check-in with mood, cravings, and next step notes.', items: ['Routine', 'Check-in', 'Reflect'] },
    { title: 'Map support', icon: MapPinned, description: 'Open nearby resources when the plan needs real-world help.', items: ['Nearby', 'Saved', 'Useful now'] },
  ]} />;
}