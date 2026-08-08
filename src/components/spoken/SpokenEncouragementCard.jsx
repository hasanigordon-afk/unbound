import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Settings2, Volume2, VolumeX } from 'lucide-react';
import useSpokenReminders from '@/hooks/useSpokenReminders';
import { getStreakMilestoneScript, isStreakMilestone } from '@/lib/milestoneConfig';

export default function SpokenEncouragementCard({ userEmail, streak = 0 }) {
  const { pref, supported, speaking, speakEvent, isLoading } = useSpokenReminders(userEmail);
  const [lastResult, setLastResult] = useState(null);

  if (isLoading) {
    return (
      <section className="flex items-center gap-3 rounded-[24px] border border-white/10 bg-white/8 p-4">
        <Loader2 className="h-5 w-5 animate-spin text-amber-200" />
        <p className="text-sm font-bold text-slate-300">Loading voice preferences…</p>
      </section>
    );
  }

  const enabled = pref?.spoken_reminders_enabled !== false;
  const milestoneActive = isStreakMilestone(streak);
  const script = milestoneActive
    ? getStreakMilestoneScript(streak)
    : 'You are moving forward. Every small step counts toward your comeback.';

  const handlePlay = async () => {
    if (!supported) {
      setLastResult('unsupported');
      return;
    }
    const result = await speakEvent({
      eventType: milestoneActive ? 'streak_milestone' : 'nudge',
      eventKey: milestoneActive ? `streak:${streak}:manual` : `encouragement:${new Date().toISOString().slice(0, 10)}:manual`,
      text: script,
      force: true,
    });
    setLastResult(result.ok ? 'played' : result.reason);
  };

  return (
    <section className="rounded-[24px] border border-violet-200/20 bg-gradient-to-r from-violet-400/10 to-amber-300/10 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/12">
          {supported && enabled ? (
            <Volume2 className="h-5 w-5 text-violet-200" />
          ) : (
            <VolumeX className="h-5 w-5 text-slate-400" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-200/90">Spoken encouragement</p>
          <p className="mt-1 text-sm font-bold leading-relaxed text-white">
            {milestoneActive ? `Milestone voice ready — ${streak} days.` : 'Tap to hear motivating words for your journey.'}
          </p>
          {!supported && (
            <p className="mt-1 text-xs text-amber-100/80">
              Your browser does not support text-to-speech. Use Chrome, Edge, or Safari on desktop/mobile.
            </p>
          )}
          {supported && !enabled && (
            <p className="mt-1 text-xs text-slate-300">
              Spoken reminders are off.{' '}
              <Link to="/NotificationSettings" className="font-bold text-amber-200 underline">Enable in settings</Link>
            </p>
          )}
          {lastResult === 'duplicate' && (
            <p className="mt-1 text-xs text-slate-300">You already heard this milestone celebration today.</p>
          )}
        </div>
        <button
          type="button"
          onClick={handlePlay}
          disabled={!supported || speaking}
          className="btn-ghost min-h-0 shrink-0 px-3 py-2 text-xs disabled:opacity-50"
        >
          {speaking ? 'Speaking…' : 'Listen'}
        </button>
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <p className="text-[11px] font-bold text-slate-400">
          Voice: {pref?.voice_gender === 'male' ? 'Male' : pref?.voice_gender === 'system' ? 'System default' : 'Female'}
        </p>
        <Link to="/NotificationSettings" className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-200 hover:text-amber-100">
          <Settings2 className="h-3 w-3" />
          Voice settings
        </Link>
      </div>
    </section>
  );
}
