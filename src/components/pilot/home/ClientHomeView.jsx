import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, CheckCircle2, Flame, HeartPulse, LifeBuoy, MapPinned, MessageCircle, Route, Shield, Sparkles, Target, Trophy, UserRound, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import HomeCarouselSection from './HomeCarouselSection';
import { pilotItinerary, pilotMissionItems } from '@/lib/pilotSeedData';

const sections = [
  {
    eyebrow: 'Today',
    title: "Today's Focus",
    items: [
      { title: 'Daily Itinerary', description: 'Appointments, reminders, meetings, and transportation for today.', icon: CalendarDays, to: '/JourneyRoadmap', accent: 'blue' },
      { title: 'Recovery Check-In', description: 'Quick mood, craving, and support check-in when you need it.', icon: HeartPulse, to: '/DailyCheckIn', accent: 'green' },
      { title: 'Top Priority', description: 'Keep the one thing that matters most today in front of you.', icon: Target, to: '/MyMissionBoard', accent: 'gold' },
    ],
  },
  {
    eyebrow: 'Mission',
    title: 'Your Comeback Mission',
    items: [
      { title: 'Profile', description: 'Start with your personal recovery profile and preferences.', icon: UserRound, to: '/Profile', accent: 'gold' },
      { title: 'Progress', description: 'Review streaks, recovery score, milestones, and weekly movement.', icon: Trophy, to: '/Progress', accent: 'green' },
      { title: 'Roadmap', description: 'Continue days 1-14, 15-30, 31-60, and long-view milestones.', icon: CheckCircle2, to: '/JourneyRoadmap', accent: 'violet' },
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
      { title: 'Craving Support', description: 'Use a quick support path before the moment gets bigger.', icon: Shield, to: '/CravingControlCenter', accent: 'blue' },
      { title: 'Find Help Nearby', description: 'Shelter, food, rehab, jobs, transportation, and practical support.', icon: MapPinned, to: '/ResourceHub', accent: 'blue' },
      { title: 'Transportation', description: 'Plan rides and reduce missed appointments.', icon: CalendarDays, to: '/ResourceHub', accent: 'gold' },
      { title: 'Recovery Services', description: 'Find local recovery support and structured care options.', icon: HeartPulse, to: '/ResourceHub', accent: 'green' },
      { title: 'AI Support', description: 'Ask for help organizing next steps, resources, or structure.', icon: Sparkles, to: '/AskReZilientAI', accent: 'violet' },
    ],
  },

];

const moduleKey = (sectionTitle, itemTitle) => `${sectionTitle}:${itemTitle}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
const roadmapPhases = ['Days 1-14 Stabilization', 'Days 15-30 Structure', 'Days 31-60 Rebuild', 'Days 61-90 Growth', '6 Months', '1 Year', '5 Year Vision'];
const pillars = [
  { title: 'Recovery', to: '/DailyCheckIn', detail: 'Check-ins, cravings, meetings, journal, calm resets.' },
  { title: 'Reentry', to: '/ResourceHub', detail: 'Housing, food, transportation, legal, benefits, work.' },
  { title: 'Community', to: '/AhHaMoments', detail: 'Ah Ha Moments, support circle, encouragement, mentors.' },
  { title: 'Growth', to: '/MyMissionBoard', detail: 'Mission board, goals, habits, milestones, long-view vision.' },
];

export default function ClientHomeView() {
  const [moduleStates, setModuleStates] = useState([]);
  const [activities, setActivities] = useState([]);
  const [missionItems, setMissionItems] = useState([]);
  const [checkIns, setCheckIns] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [calendarSyncing, setCalendarSyncing] = useState(false);
  const [calendarSyncMessage, setCalendarSyncMessage] = useState('');

  const loadBackend = async () => {
    const [userResult, stateResult, activityResult, missionResult, checkInResult, calendarResult, taskResult] = await Promise.allSettled([
      base44.auth.me(),
      base44.entities.HomeModuleState.list('-updated_date', 200),
      base44.entities.HomeModuleActivity.list('-created_date', 100),
      base44.entities.TopFiveNonNegotiable.list('sort_order', 5),
      base44.entities.DailyCheckIn.list('-check_in_date', 30),
      base44.entities.CalendarEvents.list('date', 12),
      base44.entities.DailyTasks.list('-created_date', 12),
    ]);
    const user = userResult.status === 'fulfilled' ? userResult.value : null;
    const ownedMission = missionResult.status === 'fulfilled' ? missionResult.value.filter((item) => !item.user_email || item.user_email === user?.email) : [];
    const ownedCheckIns = checkInResult.status === 'fulfilled' ? checkInResult.value.filter((item) => !item.participant_email || item.participant_email === user?.email) : [];
    setModuleStates(stateResult.status === 'fulfilled' ? stateResult.value : []);
    setActivities(activityResult.status === 'fulfilled' ? activityResult.value : []);
    setMissionItems(ownedMission);
    setCheckIns(ownedCheckIns);
    setCalendarEvents(calendarResult.status === 'fulfilled' ? calendarResult.value : []);
    setTasks(taskResult.status === 'fulfilled' ? taskResult.value : []);
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
  const missionBoard = missionItems.length ? missionItems.map((item) => ({ title: item.title, why: item.why_it_matters, progress: item.progress || 0 })) : pilotMissionItems;
  const itinerary = calendarEvents.length ? calendarEvents.slice(0, 3).map((event) => ({ title: event.title || event.event_title, time: event.start_time || event.time_text || event.schedule_text || 'Today', route: '/JourneyRoadmap', detail: event.location || event.notes || 'Scheduled recovery support' })) : pilotItinerary;
  const dailyTask = tasks.find((task) => !task.completed)?.task_title || 'Complete your check-in and protect one support contact today.';
  const recoveryScore = Math.min(96, 62 + Math.min(checkIns.length, 14) * 2 + missionBoard.filter((item) => item.progress >= 60).length * 3);
  const streak = checkIns.length || missionBoard[0]?.progress ? Math.max(3, Math.min(21, checkIns.length + 5)) : 5;

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
      <section className="rounded-[36px] border border-amber-200/20 bg-gradient-to-br from-amber-300/16 via-white/10 to-blue-400/10 p-5 shadow-2xl backdrop-blur-2xl">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-100">What do I need today?</p>
        <h2 className="mt-2 font-sans text-4xl font-black text-white">Structure, support, and one next step.</h2>
        <p className="mt-3 text-sm font-bold leading-relaxed text-slate-300">Your day starts with the itinerary, mission board, roadmap, recovery score, support circle, and ReZilient AI.</p>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
        <div className="rounded-[34px] border border-white/12 bg-white/10 p-5 shadow-2xl backdrop-blur-2xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-200/70">Weekly Itinerary</p>
              <h3 className="mt-1 font-sans text-2xl font-black text-white">Today has a shape</h3>
            </div>
            <Link to="/JourneyRoadmap" className="btn-ghost min-h-0 px-4 py-2 text-xs">Open roadmap</Link>
          </div>
          <div className="mt-4 grid gap-3">
            {itinerary.map((item) => (
              <Link key={`${item.time}-${item.title}`} to={item.route} className="rounded-3xl border border-white/10 bg-white/8 p-4 transition hover:bg-white/12">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-100">{item.time}</p>
                <h4 className="mt-1 font-sans text-lg font-black text-white">{item.title}</h4>
                <p className="mt-1 text-sm font-bold text-slate-300">{item.detail}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-[34px] border border-white/12 bg-white/10 p-5 shadow-2xl backdrop-blur-2xl">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-200/80">Recovery Score</p>
          <div className="mt-4 flex items-end gap-3">
            <p className="font-sans text-6xl font-black text-white">{recoveryScore}</p>
            <p className="pb-3 text-sm font-black text-emerald-100">Low risk</p>
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-300 via-blue-300 to-amber-200" style={{ width: `${recoveryScore}%` }} />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Link to="/DailyCheckIn" className="rounded-3xl bg-white/8 p-4">
              <Flame className="h-5 w-5 text-amber-200" />
              <p className="mt-2 text-2xl font-black text-white">{streak}</p>
              <p className="text-xs font-bold text-slate-300">Daily streak</p>
            </Link>
            <Link to="/DailyCheckIn" className="rounded-3xl bg-white/8 p-4">
              <Target className="h-5 w-5 text-blue-200" />
              <p className="mt-2 text-sm font-black text-white">Today's focus</p>
              <p className="text-xs font-bold text-slate-300">{dailyTask}</p>
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-[34px] border border-white/12 bg-white/10 p-5 shadow-2xl backdrop-blur-2xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-200/80">Top 5 Mission Board</p>
            <h3 className="mt-1 font-sans text-2xl font-black text-white">The five things that protect your comeback</h3>
          </div>
          <Link to="/MyMissionBoard" className="btn-ghost min-h-0 px-4 py-2 text-xs">Edit mission</Link>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-5">
          {missionBoard.slice(0, 5).map((item, index) => (
            <Link key={item.title} to="/MyMissionBoard" className="rounded-3xl border border-white/10 bg-white/8 p-4">
              <p className="text-xs font-black text-amber-100">0{index + 1}</p>
              <h4 className="mt-2 font-sans text-base font-black text-white">{item.title}</h4>
              <p className="mt-2 text-xs font-bold text-slate-300">{item.why}</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-amber-200" style={{ width: `${item.progress}%` }} /></div>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-[34px] border border-white/12 bg-white/10 p-5 shadow-2xl backdrop-blur-2xl">
        <div className="flex items-center gap-3">
          <Route className="h-6 w-6 text-blue-200" />
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-200/70">My Roadmap</p>
            <h3 className="font-sans text-2xl font-black text-white">Days 1-14 through the 5 year vision</h3>
          </div>
        </div>
        <div className="no-scrollbar mt-4 flex gap-3 overflow-x-auto pb-2">
          {roadmapPhases.map((phase, index) => (
            <Link key={phase} to="/JourneyRoadmap" className="min-w-[220px] rounded-3xl border border-white/10 bg-white/8 p-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Phase {index + 1}</p>
              <h4 className="mt-2 font-sans text-lg font-black text-white">{phase}</h4>
              <p className="mt-2 text-xs font-bold text-slate-300">{index < 3 ? 'Unlocked tasks, goals, reminders, and support actions.' : 'Long-view planning opens as consistency grows.'}</p>
            </Link>
          ))}
        </div>
      </section>

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
      <section className="grid gap-4 md:grid-cols-2">
        <Link to="/AhHaMoments" className="rounded-[30px] border border-white/12 bg-white/10 p-5 shadow-xl backdrop-blur-2xl">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-rose-200/80">Support Circle Activity</p>
          <h3 className="mt-2 font-sans text-2xl font-black text-white">Encouragement is active</h3>
          <p className="mt-2 text-sm font-bold text-slate-300">Ah Ha Moments, mentor encouragement, family support, and peer wins stay one tap away.</p>
        </Link>
        <Link to="/AskReZilientAI" className="rounded-[30px] border border-amber-200/18 bg-amber-300/10 p-5 shadow-xl backdrop-blur-2xl">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-100">Ask ReZilient AI</p>
          <h3 className="mt-2 font-sans text-2xl font-black text-white">Find housing, meetings, food, calm, work, or transportation.</h3>
          <p className="mt-2 text-sm font-bold text-slate-300">Context-aware guidance points you to live app actions, not a dead chat.</p>
        </Link>
      </section>
      <section className="grid gap-4 md:grid-cols-4">
        {pillars.map((pillar) => (
          <Link key={pillar.title} to={pillar.to} className="rounded-[30px] border border-white/12 bg-white/10 p-5 shadow-xl backdrop-blur-2xl">
            <p className="text-xs font-black uppercase tracking-[0.20em] text-blue-200/70">Core Pillar</p>
            <h3 className="mt-2 font-sans text-xl font-black text-white">{pillar.title}</h3>
            <p className="mt-2 text-xs font-bold text-slate-300">{pillar.detail}</p>
          </Link>
        ))}
      </section>
      {sections.map((section) => <HomeCarouselSection key={section.title} {...section} moduleKey={moduleKey} moduleStates={stateByKey} activityCounts={activityCounts} onTrack={trackModuleAction} onTogglePin={togglePin} />)}
    </div>
  );
}