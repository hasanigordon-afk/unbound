import React, { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  CalendarDays,
  Car,
  CheckCircle2,
  ClipboardCheck,
  Flame,
  HeartHandshake,
  HeartPulse,
  LifeBuoy,
  MapPinned,
  Moon,
  Route,
  Shield,
  Sparkles,
  Star,
  Target,
  Trophy,
  Users,
  X,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import HomeCarouselSection from './HomeCarouselSection';

const roles = [
  { id: 'client', label: 'Client', signal: 'Own the next hour', detail: 'Focus on schedule, recovery habits, rides, and check-ins.' },
  { id: 'counselor', label: 'Counselor', signal: 'Care team view', detail: 'Review attendance, risk signals, and aftercare movement.' },
  { id: 'sponsor', label: 'Sponsor', signal: 'Connection ready', detail: 'See the best moments to call, encourage, and reinforce progress.' },
  { id: 'po', label: 'PO', signal: 'Accountability view', detail: 'Track verified appointments, milestones, and compliance tasks.' },
  { id: 'mentor', label: 'Mentor', signal: 'Life rebuild lens', detail: 'Support goals around work, housing, identity, and confidence.' },
  { id: 'veteran', label: 'Veteran', signal: 'Veteran support', detail: 'Surface VA care, peer groups, benefits, and trauma-informed tools.' },
];

const sections = [
  {
    eyebrow: 'Daily command lane',
    title: "Today's Focus",
    items: [
      { title: '10:30 AM IOP Group', description: 'Bring workbook, finish urine screen, and confirm the 9:45 pickup window.', icon: CalendarDays, to: '/JourneyRoadmap', accent: 'blue', sampleStatus: 'confirmed', sampleOpens: 8, sampleUpdates: 4 },
      { title: 'Call Marcus After Work', description: 'Sponsor check-in scheduled for the vulnerable drive-home window.', icon: HeartPulse, to: '/WellnessCenter', accent: 'green', sampleStatus: 'support set', sampleOpens: 6, sampleUpdates: 3 },
      { title: 'Housing Packet Follow-up', description: 'Send ID photo and voicemail note to Harbor House before 3 PM.', icon: Target, to: '/MyMissionBoard', accent: 'gold', sampleStatus: 'priority', sampleOpens: 11, sampleUpdates: 5 },
    ],
  },
  {
    eyebrow: 'Momentum visuals',
    title: 'Motivational Progress',
    items: [
      { title: '87 Recovery Score', description: 'Strong week: check-ins completed, two meetings attended, sponsor contacted.', icon: Trophy, to: '/Progress', accent: 'gold', sampleStatus: 'rising', sampleOpens: 14, sampleUpdates: 6 },
      { title: '18 Day Daily Streak', description: 'Morning routine, hydration, journal prompt, and evening gratitude are linked.', icon: Flame, to: '/Progress', accent: 'rose', sampleStatus: 'live streak', sampleOpens: 18, sampleUpdates: 7 },
      { title: 'Top Five Goals', description: 'Housing, daughter visit, CDL class, gym routine, and court compliance stay visible.', icon: Star, to: '/MyMissionBoard', accent: 'violet', sampleStatus: 'tracked', sampleOpens: 9, sampleUpdates: 5 },
      { title: 'Roadmap Activity', description: 'Two tasks closed, one ride confirmed, and aftercare appointment added.', icon: CheckCircle2, to: '/JourneyRoadmap', accent: 'green', sampleStatus: 'moving', sampleOpens: 12, sampleUpdates: 8 },
    ],
  },
  {
    eyebrow: 'Spotify-style support shelves',
    title: 'Meetings + Support',
    items: [
      { title: '6:30 PM NA · Riverside', description: 'Open discussion, 1.4 miles away, peer ride leaves at 6:05 PM.', icon: Users, to: '/ResourceHub', accent: 'green', sampleStatus: 'ride ready', sampleOpens: 7, sampleUpdates: 4 },
      { title: 'Calm Reset Room', description: 'Three-minute breathing, 174 Hz tone, and grounding script for panic spikes.', icon: LifeBuoy, to: '/WellnessCenter', accent: 'rose', sampleStatus: 'available', sampleOpens: 13, sampleUpdates: 5 },
      { title: 'Food + Transit Help', description: 'Community fridge on Maple, bus pass desk open until 4:30 PM.', icon: MapPinned, to: '/ResourceHub', accent: 'blue', sampleStatus: 'nearby', sampleOpens: 10, sampleUpdates: 6 },
      { title: 'Court Reminder', description: 'Check-in paperwork due Friday; PO note and proof folder already attached.', icon: Shield, to: '/Profile', accent: 'gold', sampleStatus: 'on track', sampleOpens: 5, sampleUpdates: 3 },
      { title: 'Aftercare Call', description: 'New outpatient counselor intro call tomorrow at 11:15 AM.', icon: HeartHandshake, to: '/JourneyRoadmap', accent: 'violet', sampleStatus: 'scheduled', sampleOpens: 6, sampleUpdates: 4 },
    ],
  },

];

const moduleKey = (sectionTitle, itemTitle) => `${sectionTitle}:${itemTitle}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');

export default function ClientHomeView() {
  const [moduleStates, setModuleStates] = useState([]);
  const [activities, setActivities] = useState([]);
  const [activeRole, setActiveRole] = useState('client');
  const [calmOpen, setCalmOpen] = useState(false);
  const [calendarSyncing, setCalendarSyncing] = useState(false);
  const [calendarSyncMessage, setCalendarSyncMessage] = useState('');
  const activeRoleData = roles.find((role) => role.id === activeRole) || roles[0];

  const loadBackend = async () => {
    try {
      const [stateRows, activityRows] = await Promise.all([
        base44.entities.HomeModuleState.list('-updated_date', 200),
        base44.entities.HomeModuleActivity.list('-created_date', 100),
      ]);
      setModuleStates(stateRows);
      setActivities(activityRows);
    } catch (error) {
      setModuleStates([]);
      setActivities([]);
    }
  };

  useEffect(() => {
    loadBackend();
    const unsubscribeStates = base44.entities.HomeModuleState.subscribe?.(loadBackend);
    const unsubscribeActivities = base44.entities.HomeModuleActivity.subscribe?.(loadBackend);
    return () => {
      unsubscribeStates?.();
      unsubscribeActivities?.();
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
    try {
      if (existing) await base44.entities.HomeModuleState.update(existing.id, payload);
      else await base44.entities.HomeModuleState.create(payload);
      await base44.entities.HomeModuleActivity.create({ module_key: key, section_title: sectionTitle, module_title: item.title, action_type: actionType, created_at_text: new Date().toLocaleString() });
    } catch (error) {
      setActivities((current) => [{ module_key: key, section_title: sectionTitle, module_title: item.title, action_type: actionType, created_at_text: new Date().toLocaleString() }, ...current]);
    }
  };

  const togglePin = async (sectionTitle, item) => {
    const key = moduleKey(sectionTitle, item.title);
    const existing = stateByKey[key];
    const pinned = !existing?.pinned;
    const payload = { module_key: key, section_title: sectionTitle, module_title: item.title, status: existing?.status || 'not_started', pinned, open_count: existing?.open_count || 0 };
    try {
      if (existing) await base44.entities.HomeModuleState.update(existing.id, payload);
      else await base44.entities.HomeModuleState.create(payload);
      await base44.entities.HomeModuleActivity.create({ module_key: key, section_title: sectionTitle, module_title: item.title, action_type: pinned ? 'pinned' : 'unpinned', created_at_text: new Date().toLocaleString() });
    } catch (error) {
      setModuleStates((current) => [{ ...payload, pinned }, ...current.filter((state) => state.module_key !== key)]);
    }
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
    <div className="relative space-y-6 pb-6">
      <section className="relative overflow-hidden rounded-[38px] border border-white/12 bg-[#050915]/88 p-5 shadow-[0_30px_90px_rgba(0,0,0,.55)] backdrop-blur-2xl sm:p-7">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_14%,rgba(245,188,90,.24),transparent_28%),radial-gradient(circle_at_85%_20%,rgba(59,130,246,.22),transparent_30%),linear-gradient(145deg,rgba(255,255,255,.10),rgba(9,15,31,.20)_42%,rgba(0,0,0,.34))]" />
        <div className="absolute -bottom-20 right-4 h-48 w-48 rounded-full bg-amber-300/12 blur-3xl" />
        <div className="relative z-10 grid gap-6 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-200/20 bg-amber-200/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-amber-100">
              <Moon className="h-4 w-4" /> Comeback Dashboard
            </div>
            <h2 className="font-sans text-4xl font-black leading-[.95] tracking-tight text-white sm:text-6xl">Today is already structured for the comeback.</h2>
            <p className="mt-4 max-w-2xl text-base font-bold leading-relaxed text-slate-300">Deep focus, real meetings, warm support, and practical aftercare stay visible in one premium recovery command center.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <MetricCard label="Recovery score" value="87" detail="+9 this week" icon={Trophy} tone="gold" />
              <MetricCard label="Daily streak" value="18" detail="check-ins linked" icon={Flame} tone="rose" />
              <MetricCard label="Today's focus" value="3" detail="priority moves" icon={Target} tone="blue" />
            </div>
          </div>
          <div className="rounded-[32px] border border-white/12 bg-black/24 p-5 shadow-2xl backdrop-blur-2xl">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-100/80">Today's Focus card</p>
            <h3 className="mt-2 font-sans text-2xl font-black text-white">Keep the 6:30 meeting protected.</h3>
            <p className="mt-2 text-sm font-bold leading-relaxed text-slate-300">Ride leaves at 6:05 PM, sponsor call at 5:20 PM, and dinner prep is already moved earlier.</p>
            <div className="mt-5 space-y-3">
              {['9:45 ride pickup confirmed', '3:00 housing packet follow-up', '5:20 sponsor call before commute'].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/8 p-3 text-sm font-black text-white">
                  <CheckCircle2 className="h-5 w-5 text-emerald-200" /> {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[30px] border border-white/12 bg-white/8 p-2 shadow-2xl backdrop-blur-2xl">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {roles.map((role) => (
            <button
              key={role.id}
              type="button"
              onClick={() => setActiveRole(role.id)}
              className={`min-h-0 rounded-[24px] px-4 py-3 text-left transition active:scale-95 ${activeRole === role.id ? 'bg-amber-200 text-slate-950 shadow-[0_0_30px_rgba(245,188,90,.28)]' : 'bg-white/8 text-slate-300'}`}
            >
              <span className="block text-sm font-black">{role.label}</span>
              <span className="block text-[11px] font-bold uppercase tracking-[0.14em] opacity-75">{role.signal}</span>
            </button>
          ))}
        </div>
        <div className="mt-2 rounded-[24px] bg-black/20 p-4 text-sm font-bold text-slate-300">
          <span className="text-white">{activeRoleData.label} mode:</span> {activeRoleData.detail}
        </div>
      </section>

      <section className="relative overflow-hidden rounded-[36px] border border-amber-200/18 bg-[linear-gradient(145deg,rgba(245,188,90,.16),rgba(10,15,31,.88)_42%,rgba(2,6,18,.95))] p-5 shadow-[0_30px_90px_rgba(0,0,0,.48)] backdrop-blur-2xl sm:p-7">
        <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-blue-400/12 blur-3xl" />
        <div className="relative z-10 grid gap-6 lg:grid-cols-[.95fr_1.05fr]">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-blue-100">
              <Sparkles className="h-4 w-4" /> S.E.E AI
            </div>
            <h3 className="font-sans text-3xl font-black leading-tight text-white sm:text-4xl">Describe your goals or schedule</h3>
            <p className="mt-3 text-sm font-bold leading-relaxed text-slate-300">S.E.E turns plain language into calendar events, transportation, reminders, tasks, and aftercare planning.</p>
            <div className="mt-5 rounded-[28px] border border-white/12 bg-black/24 p-4 text-sm font-bold leading-relaxed text-slate-200">
              I have IOP at 10:30, need a ride, want to call my sponsor before tonight's Riverside meeting, and need to finish my housing packet before court check-in.
            </div>
            <button onClick={syncCalendar} disabled={calendarSyncing} className="btn-gold mt-5 disabled:opacity-60">
              {calendarSyncing ? 'Syncing plan...' : 'Sync Plan to Calendar'}
            </button>
            {calendarSyncMessage && <p className="mt-3 text-sm font-black text-emerald-200">{calendarSyncMessage}</p>}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <PlanTile icon={CalendarDays} title="Calendar events" detail="IOP group 10:30 AM, Riverside NA 6:30 PM, court check-in Friday." />
            <PlanTile icon={Car} title="Transportation" detail="Pickup 9:45 AM, peer ride 6:05 PM, bus pass backup noted." />
            <PlanTile icon={Bell} title="Reminders" detail="Sponsor call 5:20 PM, housing packet 3 PM, gratitude prompt 9 PM." />
            <PlanTile icon={ClipboardCheck} title="Tasks" detail="Upload ID photo, call Harbor House, pack workbook, print proof folder." />
            <PlanTile icon={Route} title="Aftercare planning" detail="Counselor intro tomorrow, relapse-prevention review, weekend support map." wide />
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <ProgressVisual title="Stability arc" value="72%" detail="Housing, work, and care steps" />
        <ProgressVisual title="Support rhythm" value="5/7" detail="Sponsor, group, mentor touchpoints" />
        <ProgressVisual title="Roadmap motion" value="12" detail="Completed actions this month" />
      </section>

      {sections.map((section) => <HomeCarouselSection key={section.title} {...section} moduleKey={moduleKey} moduleStates={stateByKey} activityCounts={activityCounts} onTrack={trackModuleAction} onTogglePin={togglePin} />)}
      <button type="button" onClick={() => setCalmOpen(true)} className="fixed left-4 bottom-24 z-[85] min-h-0 rounded-full border border-amber-100/25 bg-[linear-gradient(145deg,rgba(245,188,90,.96),rgba(180,117,28,.96))] px-5 py-3 text-sm font-black text-slate-950 shadow-[0_0_34px_rgba(245,188,90,.34),0_18px_50px_rgba(0,0,0,.40)] active:scale-95">
        Emergency Calm
      </button>
      {calmOpen && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/60 p-4 backdrop-blur-2xl">
          <section className="relative w-full max-w-xl rounded-[36px] border border-amber-100/18 bg-[linear-gradient(145deg,rgba(245,188,90,.16),rgba(6,10,24,.94)_44%,rgba(0,0,0,.96))] p-6 text-center shadow-[0_30px_100px_rgba(0,0,0,.62)]">
            <button type="button" onClick={() => setCalmOpen(false)} className="absolute right-4 top-4 min-h-0 rounded-full bg-white/10 p-3 text-white">
              <X className="h-5 w-5" />
            </button>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[24px] bg-amber-200/14 text-amber-100 shadow-[0_0_28px_rgba(245,188,90,.25)]">
              <LifeBuoy className="h-7 w-7" />
            </div>
            <h3 className="mt-5 font-sans text-3xl font-black text-white">You are safe in this minute.</h3>
            <p className="mx-auto mt-3 max-w-md text-sm font-bold leading-relaxed text-slate-300">Breathe in for four, hold for four, out for six. Text Marcus, step into light, and return to the next right action.</p>
            <div className="mx-auto my-7 flex h-40 w-40 items-center justify-center rounded-full border border-amber-100/20 bg-white/8 shadow-[0_0_60px_rgba(245,188,90,.20)]">
              <span className="text-xs font-black uppercase tracking-[0.24em] text-amber-100">Breathe</span>
            </div>
            <div className="grid gap-3 text-left text-sm font-bold text-slate-300 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/8 p-4">Ground: name 5 things you see, 4 you feel, 3 you hear.</div>
              <div className="rounded-2xl bg-white/8 p-4">Connect: call sponsor, counselor, mentor, or emergency services if safety is at risk.</div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, detail, icon: Icon, tone }) {
  const toneClass = tone === 'gold' ? 'text-amber-100 bg-amber-200/14' : tone === 'rose' ? 'text-rose-100 bg-rose-300/14' : 'text-blue-100 bg-blue-300/14';
  return (
    <div className="rounded-[28px] border border-white/12 bg-white/8 p-4 shadow-xl backdrop-blur-2xl">
      <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-2xl ${toneClass}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <div className="mt-1 flex items-end gap-2">
        <span className="font-sans text-4xl font-black text-white">{value}</span>
        <span className="pb-2 text-xs font-black uppercase tracking-[0.12em] text-emerald-200">{detail}</span>
      </div>
    </div>
  );
}

function PlanTile({ icon: Icon, title, detail, wide = false }) {
  return (
    <div className={`rounded-[28px] border border-white/12 bg-white/8 p-4 shadow-xl backdrop-blur-2xl ${wide ? 'sm:col-span-2' : ''}`}>
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-200/14 text-amber-100">
        <Icon className="h-5 w-5" />
      </div>
      <h4 className="font-sans text-lg font-black text-white">{title}</h4>
      <p className="mt-2 text-sm font-bold leading-relaxed text-slate-300">{detail}</p>
    </div>
  );
}

function ProgressVisual({ title, value, detail }) {
  return (
    <div className="rounded-[30px] border border-white/12 bg-[linear-gradient(145deg,rgba(255,255,255,.10),rgba(8,13,27,.70))] p-5 shadow-2xl backdrop-blur-2xl">
      <div className="flex items-center justify-between">
        <p className="text-sm font-black text-white">{title}</p>
        <span className="rounded-full bg-amber-200/14 px-3 py-1 text-xs font-black text-amber-100">{value}</span>
      </div>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/8">
        <div className="h-full rounded-full bg-gradient-to-r from-amber-200 via-blue-300 to-emerald-200 shadow-[0_0_24px_rgba(245,188,90,.35)]" style={{ width: value.includes('/') ? '71%' : value }} />
      </div>
      <p className="mt-3 text-sm font-bold text-slate-300">{detail}</p>
    </div>
  );
}