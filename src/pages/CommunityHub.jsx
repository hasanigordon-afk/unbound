import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Sparkles, Star, Trophy, Users } from 'lucide-react';
import WorkingSectionHub from '@/components/pilot/WorkingSectionHub';

export default function CommunityHub() {
  return <div className="space-y-4">
    <Link to="/Testimonials" className="block rounded-[34px] border border-emerald-300/20 bg-emerald-400/10 p-5 text-left shadow-2xl backdrop-blur-2xl">
      <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-100">Help. Hope. Healing.</p>
      <h2 className="mt-2 font-sans text-3xl font-black text-white">Open Testimonials, Watch & Read</h2>
      <p className="mt-2 text-sm font-bold text-slate-300">Positive recovery videos, readings, AhHa Stories, and saved inspiration.</p>
    </Link>
    <WorkingSectionHub title="Community" subtitle="Stories, encouragement, and support without judgment." primaryAction={{ title: 'Community Highlights', description: 'Ah Ha Moments, recovery stories, testimonials, recovery posts, and encouragement are now together.' }} sections={[
    { title: 'Ah Ha Moments', icon: Sparkles, description: 'Short moments of insight from real people.', items: ['Read', 'Save', 'Share'] },
    { title: 'Recovery stories', icon: MessageCircle, description: 'Stories from people rebuilding life one step at a time.', items: ['Hope', 'Lessons', 'Growth'] },
    { title: 'Testimonials', icon: Star, description: 'Encouraging proof that progress is possible.', items: ['Watch', 'Read', 'Reflect'] },
    { title: 'Recovery posts', icon: Users, description: 'Community posts and support conversations.', items: ['Post', 'Reply', 'Support'] },
    { title: 'Encouragement', icon: Heart, description: 'Send and receive simple encouragement.', items: ['Proud', 'Keep going', 'Respect'] },
    { title: 'Milestone stories', icon: Trophy, description: 'Celebrate meaningful progress without comparison.', items: ['Wins', 'Growth', 'Hope'] },
  ]} />
  </div>;
}