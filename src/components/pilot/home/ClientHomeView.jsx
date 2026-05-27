import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, HeartPulse, LifeBuoy, MapPinned, MessageCircle, Shield, Sparkles, Target, Trophy, UserRound, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import HomeCarouselSection from './HomeCarouselSection';

const sections = [
  {
    eyebrow: 'Today',
    title: "Today's Focus",
    items: [
      { title: 'Daily Itinerary', description: 'Appointments, reminders, meetings, and transportation for today.', icon: CalendarDays, to: '/Profile#roadmap', accent: 'blue' },
      { title: 'Recovery Check-In', description: 'Quick mood, craving, and support check-in when you need it.', icon: HeartPulse, to: '/WellnessCenter', accent: 'green' },
      { title: 'Top Priority', description: 'Keep the one thing that matters most today in front of you.', icon: Target, to: '/Profile#goals', accent: 'gold' },
    ],
  },
  {
    eyebrow: 'Mission',
    title: 'Your Comeback Mission',
    items: [
      { title: 'Profile', description: 'Start with your personal recovery profile and preferences.', icon: UserRound, to: '/Profile', accent: 'gold' },
      { title: 'Progress', description: 'Review streaks, recovery score, milestones, and weekly movement.', icon: Trophy, to: '/Profile#progress', accent: 'green' },
      { title: 'Roadmap', description: 'Continue your next steps inside your Profile hub.', icon: CheckCircle2, to: '/Profile#roadmap', accent: 'violet' },
      { title: 'Encouragement Feed', description: 'See real support, wins, and messages from the community.', icon: MessageCircle, to: '/Community', accent: 'rose' },
      { title: 'Peer Groups', description: 'Connect with people walking a similar path.', icon: Users, to: '/Community', accent: 'violet' },
      { title: 'Wins', description: 'Celebrate small steps that prove momentum is happening.', icon: Trophy, to: '/Community', accent: 'gold' },
    ],
  },
  {
    eyebrow: 'Support System',
    title: 'Recovery Tools + Nearby Resources',
    items: [
      { title: 'Calm Reset', description: 'Breathing, meditation, music, and quick grounding tools.', icon: LifeBuoy, to: '/WellnessCenter', accent: 'rose' },
      { title: 'Craving Support', description: 'Use a quick support path before the moment gets bigger.', icon: Shield, to: '/WellnessCenter', accent: 'blue' },
      { title: 'Find Help Nearby', description: 'Shelter, food, rehab, jobs, transportation, and practical support.', icon: MapPinned, to: '/ResourceHub', accent: 'blue' },
      { title: 'Transportation', description: 'Plan rides and reduce missed appointments.', icon: CalendarDays, to: '/JourneyRoadmap', accent: 'gold' },
      { title: 'Recovery Services', description: 'Find local recovery support and structured care options.', icon: HeartPulse, to: '/ResourceHub', accent: 'green' },
      { title: 'AI Support', description: 'Ask for help organizing next steps, resources, or structure.', icon: Sparkles, to: '/WellnessCenter', accent: 'violet' },
    ],
  },

];

const moduleKey = (sectionTitle, itemTitle) => `${sectionTitle}:${itemTitle}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');

export default function ClientHomeView() {
  const [moduleStates, setModuleStates] = useState([]);
  const [activities, setActivities] = useState([]);
  const [calendarSyncing, setCalendarSyncing] = useState(false);
  const [calendarSyncMessage, setCalendarSyncMessage] = useState('');

  const loadBackend = async () => {
    const [stateRows, activityRows] = await Promise.all([
      base44.entities.HomeModuleState.list('-updated_date', 200),
      base44.entities.HomeModuleActivity.list('-created_date', 100),
    ]);
    setModuleStates(stateRows);
    setActivities(activityRows);
  };

  useEffect(() => {
    loadBackend();
    const unsubscribeStates = base44.entities.HomeModuleState.subscribe(loadBackend);
    const unsubscribeActivities = base44.entities.HomeModuleActivity.subscribe(loadBackend);
    return () => {
      unsubscribeStates();
      unsubscribeActivities();
    };
  }, []);

  const stateByKey = useMemo(() => Object.fromEntries(moduleStates.map((state) => [state.module_key, state])), [moduleStates]);
  const activityCounts = useMemo(() => activities.reduce((counts, activity) => ({ ...counts, [activity.module_key]: (counts[activity.module_key] || 0) + 1 }), {}), [activities]);

  const trackModuleAction = async (sectionTitle, item, actionType = 'opened') => {
    const key = moduleKey(sectionTitle, item.title);
    const existing = stateByKey[key];
    const status = actionType === 'completed' ? 'completed' : existing?.status === 'completed' ? 'completed' : 'in_progress';
    const payload = {
      module_key: key,
      section_title: sectionTitle,
      module_title: item.title,
      status,
      pinned: existing?.pinned || false,
      last_opened_at: new Date().toISOString(),
      open_count: (existing?.open_count || 0) + (actionType === 'opened' ? 1 : 0),
    };
    if (existing) await base44.entities.HomeModuleState.update(existing.id, payload);
    else await base44.entities.HomeModuleState.create(payload);
    await base44.entities.HomeModuleActivity.create({ module_key: key, section_title: sectionTitle, module_title: item.title, action_type: actionType, created_at_text: new Date().toLocaleString() });
  };

  const togglePin = async (sectionTitle, item) => {
    const key = moduleKey(sectionTitle, item.title);
    const existing = stateByKey[key];
    const pinned = !existing?.pinned;
    const payload = { module_key: key, section_title: sectionTitle, module_title: item.title, status: existing?.status || 'not_started', pinned, open_count: existing?.open_count || 0 };
    if (existing) await base44.entities.HomeModuleState.update(existing.id, payload);
    else await base44.entities.HomeModuleState.create(payload);
    await base44.entities.HomeModuleActivity.create({ module_key: key, section_title: sectionTitle, module_title: item.title, action_type: pinned ? 'pinned' : 'unpinned', created_at_text: new Date().toLocaleString() });
  };

  const syncCalendar = async () => {
    setCalendarSyncing(true);
    const response = await base44.functions.invoke('syncSeeCalendar', { syncPersonal: true, syncShared: false });
    if (response.data.personalConnected === false) {
      const url = await base44.connectors.connectAppUser('6a10000a555f71fe414b9434');
      const popup = window.open(url, '_blank');
      const timer = setInterval(async () => {
        if (!popup || popup.closed) {
          clearInterval(timer);
          const retry = await base44.functions.invoke('syncSeeCalendar', { syncPersonal: true, syncShared: false });
          setCalendarSyncMessage(`${retry.data.personalCreated || 0} recovery events synced to your calendar.`);
          setCalendarSyncing(false);
        }
      }, 500);
      return;
    }
    setCalendarSyncMessage(`${response.data.personalCreated || 0} recovery events synced to your calendar.`);
    setCalendarSyncing(false);
  };

  return (
    <div className="space-y-5">
      <section className="rounded-[30px] border border-white/12 bg-white/10 p-5 shadow-2xl backdrop-blur-2xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-200/70">Calendar Sync</p>
            <h3 className="mt-1 font-sans text-2xl font-black text-white">Never miss a check-in or meeting</h3>
            <p className="mt-2 text-sm font-bold text-slate-300">Sync recovery tasks, appointments, and group meetings directly to your personal Google Calendar.</p>
            {calendarSyncMessage && <p className="mt-2 text-sm font-black text-emerald-200">{calendarSyncMessage}</p>}
          </div>
          <button onClick={syncCalendar} disabled={calendarSyncing} className="btn-primary shrink-0 disabled:opacity-60">
            {calendarSyncing ? 'Syncing...' : 'Sync My Calendar'}
          </button>
        </div>
      </section>
      {sections.map((section) => <HomeCarouselSection key={section.title} {...section} moduleKey={moduleKey} moduleStates={stateByKey} activityCounts={activityCounts} onTrack={trackModuleAction} onTogglePin={togglePin} />)}
    </div>
  );
}