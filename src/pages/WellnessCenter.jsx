import React from 'react';
import { Heart, HeartPulse, LifeBuoy, Music, PenLine, Sparkles, Wind } from 'lucide-react';
import SectionHubPage from '@/components/pilot/SectionHubPage';

export default function WellnessCenter() {
  return <SectionHubPage title="Wellness Center" subtitle="Quick calming tools for the moment you are in." primaryAction={{ title: 'Wellness Quick Calm Button', description: 'Meditation, calming music, breathing, panic support, binaural beats, and journaling are now together.' }} sections={[
    { title: 'Calming music', icon: Music, description: 'Quiet support when your nervous system needs relief.', items: ['Calm', 'Focus', 'Sleep'] },
    { title: 'Meditation', icon: Heart, description: 'Short guided resets to return to the next right step.', items: ['2 min', '5 min', '10 min'] },
    { title: 'Breathing', icon: Wind, description: 'Simple breathing tools for pressure, cravings, or panic.', items: ['Box', 'Grounding', 'Reset'] },
    { title: 'Panic support', icon: LifeBuoy, description: 'A fast support path when the moment feels too big.', items: ['Now', 'Safe place', 'Reach out'] },
    { title: 'Binaural beats', icon: HeartPulse, description: 'Sound support for calm and focus.', items: ['Calm', 'Focus', 'Rest'] },
    { title: 'Journaling', icon: PenLine, description: 'Put the day into words and clear your head.', items: ['Prompt', 'Voice', 'Reflect'] },
    { title: 'Quick reset', icon: Sparkles, description: 'A short tool to stabilize and continue your day.', items: ['Breathe', 'Ground', 'Act'] },
  ]} />;
}