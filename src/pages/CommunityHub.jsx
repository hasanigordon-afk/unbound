import React from 'react';
import { Heart, MessageCircle, Sparkles, Star, Trophy, Users } from 'lucide-react';
import SectionHubPage from '@/components/pilot/SectionHubPage';

export default function CommunityHub() {
  return <SectionHubPage title="Community" subtitle="Stories, encouragement, and support without judgment." primaryAction={{ title: 'Community Highlights', description: 'Ah Ha Moments, recovery stories, testimonials, recovery posts, and encouragement are now together.' }} sections={[
    { title: 'Ah Ha Moments', icon: Sparkles, description: 'Short moments of insight from real people.', items: ['Read', 'Save', 'Share'] },
    { title: 'Recovery stories', icon: MessageCircle, description: 'Stories from people rebuilding life one step at a time.', items: ['Hope', 'Lessons', 'Growth'] },
    { title: 'Testimonials', icon: Star, description: 'Encouraging proof that progress is possible.', items: ['Watch', 'Read', 'Reflect'] },
    { title: 'Recovery posts', icon: Users, description: 'Community posts and support conversations.', items: ['Post', 'Reply', 'Support'] },
    { title: 'Encouragement', icon: Heart, description: 'Send and receive simple encouragement.', items: ['Proud', 'Keep going', 'Respect'] },
    { title: 'Milestone stories', icon: Trophy, description: 'Celebrate meaningful progress without comparison.', items: ['Wins', 'Growth', 'Hope'] },
  ]} />;
}