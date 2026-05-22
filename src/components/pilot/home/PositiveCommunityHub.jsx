import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, Heart, Sparkles, ThumbsUp, UsersRound } from 'lucide-react';
import HomeSectionHeader from './HomeSectionHeader';

const channels = ['Ah Ha Moments', 'Wins', 'Stories', 'Advice', 'Mentorship', 'Recovery groups', 'Veteran groups', 'Reentry groups'];
const reactions = [['Respect', Flame], ['Proud of You', Sparkles], ['Keep Going', Heart], ['Inspired', ThumbsUp]];

export default function PositiveCommunityHub() {
  return (
    <section className="card p-5">
      <HomeSectionHeader eyebrow="Community" title="Positive-first connection." subtitle="Share wins, learn from stories, find mentors, and build sober relationships without shame language." />
      <div className="grid gap-4 lg:grid-cols-[1.3fr_.7fr]">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {channels.map((channel) => (
            <Link key={channel} to="/AhHaCommunity" className="rounded-[24px] border border-white/10 bg-white/8 p-4 transition hover:-translate-y-1 active:scale-95">
              <UsersRound className="mb-3 h-5 w-5 text-blue-200" />
              <p className="text-xs font-black text-slate-200">{channel}</p>
            </Link>
          ))}
        </div>
        <div className="rounded-[28px] bg-white/8 p-4">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-slate-400">Encouragement reactions</p>
          <div className="space-y-2">
            {reactions.map(([label, ReactionIcon]) => (
              <div key={label} className="flex items-center gap-3 rounded-2xl bg-white/8 p-3">
                <ReactionIcon className="h-4 w-4 text-emerald-200" />
                <span className="text-sm font-black text-white">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}