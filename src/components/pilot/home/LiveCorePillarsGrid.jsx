import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, CheckCircle2, HeartPulse, LifeBuoy, MapPinned, MessageCircle, PlayCircle, ShieldCheck, Target, UserPlus, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const pillarConfig = [
  { key: 'recovery_structure', title: 'Recovery Structure', icon: CalendarDays, to: '/JourneyRoadmap', cta: 'View Today', action: 'Add Task', actionType: 'task', empty: 'Create your first recovery task.', getItems: (d) => [...d.calendarEvents.slice(0, 1), ...d.dailyTasks.slice(0, 2)].map((x) => x.title || x.task_title || x.event_title) },
  { key: 'wellness', title: 'Wellness & Mental Health', icon: HeartPulse, to: '/WellnessCenter', cta: 'Check In', action: 'Start Breathing', actionType: 'wellness', empty: 'Start with a 5-minute calm reset.', getItems: (d) => d.wellnessSessions.slice(0, 3).map((x) => x.title || x.session_type) },
  { key: 'resources', title: 'Resources & Reentry Support', icon: MapPinned, to: '/ResourceHub', cta: 'Find Resources', action: 'Saved Resources', actionTo: '/ResourceHub', empty: 'Find and save nearby support.', getItems: (d) => d.savedResources.slice(0, 3).map((x) => x.resource_name || x.category) },
  { key: 'accountability', title: 'Accountability', icon: ShieldCheck, to: '/DailyCheckIn', cta: 'Daily Check-In', action: 'Log Meeting', actionType: 'meeting', empty: 'Log a check-in or planned meeting.', getItems: (d) => d.checkIns.slice(0, 2).map((x) => x.mood || 'Daily check-in') },
  { key: 'community', title: 'Community & Stories', icon: MessageCircle, to: '/AhHaMoments', cta: 'Read Stories', action: 'Share AhHa Moment', actionTo: '/AhHaCommunity', empty: 'Read recovery stories or share a win.', getItems: (d) => [...d.ahhaStories.slice(0, 2), ...d.communityPosts.slice(0, 1)].map((x) => x.title || x.content) },
  { key: 'goals', title: 'Goals & Progress', icon: Target, to: '/Progress', cta: 'View Goals', action: 'Add Goal', actionType: 'goal', empty: 'Add your first 30/60/90 day goal.', getItems: (d) => d.goals.slice(0, 3).map((x) => `${x.title} · ${x.progress_percentage || 0}%`) },
  { key: 'support_system', title: 'Support System', icon: Users, to: '/Profile#support', cta: 'Contact Support', action: 'Add Contact', actionType: 'contact', empty: 'Add a sponsor, counselor, mentor, or trusted contact.', getItems: (d) => d.supportContacts.slice(0, 3).map((x) => `${x.name}${x.relationship ? ` · ${x.relationship}` : ''}`) },
  { key: 'media', title: 'Media & Motivation', icon: PlayCircle, to: '/AhHaMoments', cta: 'Watch', action: 'Read', actionTo: '/AhHaMoments', empty: 'Open a motivational video or reading.', getItems: (d) => d.mediaItems.slice(0, 3).map((x) => x.title) },
];

export default function LiveCorePillarsGrid({ data, user, loading, error, onRefresh }) {
  const [workingKey, setWorkingKey] = useState('');
  const progressByKey = useMemo(() => Object.fromEntries((data.pillarProgress || []).map((row) => [row.pillar_key, row])), [data.pillarProgress]);

  const recordAction = async (pillar) => {
    setWorkingKey(pillar.key);
    const existing = progressByKey[pillar.key];
    const payload = { user_email: user?.email, pillar_key: pillar.key, pillar_title: pillar.title, progress_percentage: Math.min(100, (existing?.progress_percentage || 15) + 10), status: 'active', last_action: pillar.action, last_action_at: new Date().toISOString() };
    if (pillar.actionType === 'task') await base44.entities.DailyTasks.create({ task_title: 'Recovery structure check-in', task_category: pillar.title, due_date: new Date().toISOString().slice(0, 10), priority: 'medium' });
    if (pillar.actionType === 'wellness') await base44.entities.WellnessSession.create({ user_email: user?.email, title: '5-minute breathing reset', session_type: 'breathing', duration_minutes: 5, completed: false });
    if (pillar.actionType === 'goal') await base44.entities.Goal.create({ participant_email: user?.email, title: '30-day recovery goal', category: 'recovery_milestone', progress_percentage: 0, status: 'active' });
    if (pillar.actionType === 'contact') await base44.entities.SupportContact.create({ name: 'Trusted support contact', relationship: 'peer', preferred_channel: 'call' });
    if (pillar.actionType === 'meeting') await base44.entities.PlannedMeeting.create({ meeting_title: 'Recovery group meeting', day_of_week: new Date().getDay(), start_time: '18:00', participant_email: user?.email });
    if (existing) await base44.entities.PillarProgress.update(existing.id, payload); else await base44.entities.PillarProgress.create(payload);
    await onRefresh?.();
    setWorkingKey('');
  };

  if (loading) return <section className="rounded-[34px] border border-white/12 bg-white/10 p-5"><div className="skeleton h-8 w-52" /><div className="mt-4 grid gap-4 md:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-44" />)}</div></section>;
  if (error) return <section className="rounded-[34px] border border-red-300/25 bg-red-500/10 p-5"><h3 className="font-sans text-xl font-black text-white">Core Pillars need a refresh</h3><p className="mt-2 text-sm font-bold text-red-100">Live data could not load.</p><button onClick={onRefresh} className="btn-ghost mt-4 min-h-0 px-4 py-2 text-xs">Try again</button></section>;

  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-200/70">Core Pillars</p>
          <h2 className="font-sans text-3xl font-black text-white">Your live recovery command center</h2>
        </div>
        <Link to="/Profile" className="btn-ghost min-h-0 px-4 py-2 text-xs">My Profile</Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {pillarConfig.map((pillar) => {
          const Icon = pillar.icon;
          const items = pillar.getItems(data).filter(Boolean);
          const progress = progressByKey[pillar.key]?.progress_percentage || Math.min(100, items.length * 28);
          return (
            <Link key={pillar.key} to={pillar.to} className="group rounded-[32px] border border-white/12 bg-white/10 p-5 shadow-xl backdrop-blur-2xl transition active:scale-[.98] hover:bg-white/14">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3"><div className="rounded-3xl bg-blue-300/15 p-3 text-blue-100"><Icon className="h-6 w-6" /></div><div><h3 className="font-sans text-xl font-black text-white">{pillar.title}</h3><p className="text-xs font-bold text-slate-300">{progress}% connected</p></div></div>
                <CheckCircle2 className={`h-5 w-5 ${progress > 0 ? 'text-emerald-200' : 'text-white/25'}`} />
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-emerald-300 via-blue-300 to-amber-200" style={{ width: `${progress}%` }} /></div>
              <div className="mt-4 min-h-[78px] space-y-2">
                {items.length ? items.map((item) => <p key={item} className="rounded-2xl bg-white/8 px-3 py-2 text-xs font-bold text-slate-200 line-clamp-1">{item}</p>) : <p className="rounded-2xl border border-dashed border-white/15 bg-white/5 px-3 py-3 text-sm font-bold text-slate-300">{pillar.empty}</p>}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-white px-4 py-2 text-xs font-black text-slate-950">{pillar.cta}</span>
                {pillar.actionTo ? <Link to={pillar.actionTo} onClick={(e) => e.stopPropagation()} className="rounded-full border border-white/12 bg-white/10 px-4 py-2 text-xs font-black text-white">{pillar.action}</Link> : <button type="button" disabled={workingKey === pillar.key} onClick={(e) => { e.preventDefault(); recordAction(pillar); }} className="min-h-0 rounded-full border border-white/12 bg-white/10 px-4 py-2 text-xs font-black text-white disabled:opacity-60">{workingKey === pillar.key ? 'Saving...' : pillar.action}</button>}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}