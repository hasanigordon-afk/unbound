/**
 * UNBOUND Automation Engine
 * 
 * Master scheduled function that runs all participant-facing automations:
 * 1. Daily check-in reminders
 * 2. Missed check-in escalation
 * 3. Risk trend alerts → StaffAlertQueue
 * 4. Goal & task reminders
 * 5. Inactivity re-engagement
 * 6. Milestone celebrations
 * 7. Consent expiry reminders
 * 
 * Runs daily. Respects NotificationPreference per user.
 * Logs every run to AutomationLog.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

const SDK_VERSION = '0.8.21';

// ── Helpers ───────────────────────────────────────────────────────────────────

function today() {
  return new Date().toISOString().split('T')[0];
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function daysBetween(dateStr) {
  if (!dateStr) return 999;
  return Math.floor((new Date() - new Date(dateStr)) / 86400000);
}

function getStreakDays(checkIns) {
  const sorted = [...checkIns].sort((a, b) => new Date(b.check_in_date) - new Date(a.check_in_date));
  let count = 0;
  let cur = new Date(); cur.setHours(0, 0, 0, 0);
  for (const c of sorted) {
    const d = new Date(c.check_in_date); d.setHours(0, 0, 0, 0);
    if (Math.round((cur - d) / 86400000) <= 1) { count++; cur = d; } else break;
  }
  return count;
}

async function getConfig(base44, key) {
  const configs = await base44.asServiceRole.entities.AutomationConfig.filter({ automation_key: key });
  if (configs.length === 0) return { is_enabled: true, thresholds: {}, channels: ['in_app'] };
  return configs[0];
}

async function getPref(prefs, email) {
  return prefs.find(p => p.user_email === email) || null;
}

async function dedupNotification(base44, recipientEmail, type, date) {
  const existing = await base44.asServiceRole.entities.InAppNotification.filter({
    recipient_email: recipientEmail,
    type,
  });
  return existing.some(n => n.created_date?.startsWith(date));
}

async function createNotification(base44, { recipient_email, type, title, body, action_url, action_label, priority = 'medium', automation_key }) {
  return base44.asServiceRole.entities.InAppNotification.create({
    recipient_email,
    type,
    title,
    body,
    action_url,
    action_label,
    priority,
    is_read: false,
    dismissed: false,
    automation_key,
    expires_at: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
  });
}

async function createStaffAlert(base44, { participant_email, facility_id, assigned_counselor_email, alert_type, priority, summary, contributing_factors, automation_key }) {
  const dedup_key = `${participant_email}:${alert_type}:${today()}`;
  const existing = await base44.asServiceRole.entities.StaffAlertQueue.filter({ dedup_key });
  if (existing.length > 0) return null;
  return base44.asServiceRole.entities.StaffAlertQueue.create({
    participant_email,
    facility_id,
    assigned_counselor_email,
    alert_type,
    priority,
    status: 'new',
    summary,
    contributing_factors,
    automation_key,
    dedup_key,
  });
}

async function logRun(base44, automation_key, status, stats) {
  return base44.asServiceRole.entities.AutomationLog.create({
    automation_key,
    run_date: today(),
    status,
    participants_processed: stats.processed || 0,
    notifications_sent: stats.sent || 0,
    alerts_created: stats.alerts || 0,
    errors: stats.errors || [],
    summary: stats.detail || {},
  });
}

// ── AUTOMATION 1: Daily Check-In Reminder ────────────────────────────────────

async function runCheckinReminders(base44, profiles, allCheckIns, prefs, config) {
  if (!config.is_enabled) return { processed: 0, sent: 0 };
  let sent = 0;
  const todayStr = today();

  for (const profile of profiles) {
    const email = profile.participant_email;
    const pref = await getPref(prefs, email);
    if (pref && !pref.checkin_reminders) continue;
    if (!pref?.channel_in_app && !pref?.channel_email) continue; // default: in_app always on

    const checkedToday = allCheckIns.some(c => c.participant_email === email && c.check_in_date === todayStr);
    if (checkedToday) continue;

    const alreadyNotified = await dedupNotification(base44, email, 'checkin_reminder', todayStr);
    if (alreadyNotified) continue;

    const streak = getStreakDays(allCheckIns.filter(c => c.participant_email === email));
    const streakMsg = streak > 0 ? ` You're on a ${streak}-day streak — keep it going! 🔥` : '';

    await createNotification(base44, {
      recipient_email: email,
      type: 'checkin_reminder',
      title: "Time for your daily check-in",
      body: `Taking 60 seconds to check in keeps your momentum going.${streakMsg}`,
      action_url: '/DailyCheckIn',
      action_label: 'Check In Now',
      priority: 'medium',
      automation_key: 'daily_checkin_reminder',
    });
    sent++;
  }
  return { processed: profiles.length, sent };
}

// ── AUTOMATION 2: Missed Check-In Escalation ─────────────────────────────────

async function runMissedCheckinEscalation(base44, profiles, allCheckIns, prefs, config) {
  if (!config.is_enabled) return { processed: 0, sent: 0, alerts: 0 };
  const threshold = config.thresholds?.missed_days ?? 3;
  const escalate_at = config.thresholds?.escalate_days ?? 5;
  let sent = 0, alerts = 0;

  for (const profile of profiles) {
    const email = profile.participant_email;
    const myCheckIns = allCheckIns.filter(c => c.participant_email === email);
    const lastCheckIn = myCheckIns.sort((a, b) => new Date(b.check_in_date) - new Date(a.check_in_date))[0];
    const missedDays = lastCheckIn ? daysBetween(lastCheckIn.check_in_date) : 99;

    if (missedDays < threshold) continue;

    const pref = await getPref(prefs, email);
    if (pref && !pref.missed_checkin_alerts) continue;

    const alreadyNotified = await dedupNotification(base44, email, 'missed_checkin', today());
    if (!alreadyNotified) {
      await createNotification(base44, {
        recipient_email: email,
        type: 'missed_checkin',
        title: "We miss you — come back when you're ready",
        body: `It's been ${missedDays} days since your last check-in. No pressure — just here when you need us. 💙`,
        action_url: '/DailyCheckIn',
        action_label: 'Check In Today',
        priority: missedDays >= escalate_at ? 'high' : 'medium',
        automation_key: 'missed_checkin_escalation',
      });
      sent++;
    }

    if (missedDays >= escalate_at && profile.assigned_counselor_email) {
      const alert = await createStaffAlert(base44, {
        participant_email: email,
        facility_id: profile.facility_id,
        assigned_counselor_email: profile.assigned_counselor_email,
        alert_type: 'missed_checkins',
        priority: missedDays >= 7 ? 'urgent' : 'medium',
        summary: `${email.split('@')[0]} has missed check-ins for ${missedDays} consecutive days.`,
        contributing_factors: [`${missedDays} consecutive missed check-ins`],
        automation_key: 'missed_checkin_escalation',
      });
      if (alert) alerts++;
    }
  }
  return { processed: profiles.length, sent, alerts };
}

// ── AUTOMATION 3: Risk Trend Alerts → StaffAlertQueue ───────────────────────

async function runRiskTrendAlerts(base44, profiles, allCheckIns, config) {
  if (!config.is_enabled) return { processed: 0, alerts: 0 };
  const minDays = config.thresholds?.min_data_days ?? 3;
  let alerts = 0;

  for (const profile of profiles) {
    const email = profile.participant_email;
    const myCheckIns = allCheckIns
      .filter(c => c.participant_email === email)
      .sort((a, b) => new Date(b.check_in_date) - new Date(a.check_in_date));

    if (myCheckIns.length < minDays) continue;

    const last7 = myCheckIns.filter(c => new Date(c.check_in_date) >= daysAgo(7));
    const last3 = myCheckIns.slice(0, 3);

    const factors = [];

    // Relapse self-flag (urgent)
    if (last3.some(c => c.relapse_risk_flag)) {
      factors.push('Self-reported relapse risk in recent check-in');
    }

    // Sustained low mood (≤2) for 3+ days
    if (last3.length >= 3 && last3.every(c => c.mood_rating !== null && c.mood_rating <= 2)) {
      factors.push('Mood rated ≤2 for 3 consecutive days');
    }

    // High craving pattern
    if (last3.length >= 3 && last3.every(c => (c.craving_intensity ?? 0) >= 7)) {
      factors.push('Craving intensity ≥7/10 for 3 consecutive days');
    }

    // Isolation (no meetings + no sponsor 5 days)
    const last5 = myCheckIns.slice(0, 5);
    if (last5.length >= 5 && last5.every(c => !c.attended_meeting && !c.connected_with_sponsor)) {
      factors.push('No meetings or sponsor contact in 5 days');
    }

    if (factors.length === 0) continue;

    const hasRelapse = factors.some(f => f.includes('relapse'));
    const priority = hasRelapse ? 'urgent' : factors.length >= 2 ? 'medium' : 'routine';

    const alert = await createStaffAlert(base44, {
      participant_email: email,
      facility_id: profile.facility_id,
      assigned_counselor_email: profile.assigned_counselor_email,
      alert_type: hasRelapse ? 'relapse_risk' : 'mood_decline',
      priority,
      summary: `Risk trend detected for ${email.split('@')[0]}: ${factors[0]}`,
      contributing_factors: factors,
      automation_key: 'risk_trend_alerts',
    });
    if (alert) alerts++;
  }
  return { processed: profiles.length, alerts };
}

// ── AUTOMATION 5: Goal & Task Reminders ──────────────────────────────────────

async function runGoalReminders(base44, profiles, prefs, config) {
  if (!config.is_enabled) return { processed: 0, sent: 0 };
  let sent = 0;

  const allGoals = await base44.asServiceRole.entities.Goal.filter({ status: 'active' });

  for (const profile of profiles) {
    const email = profile.participant_email;
    const pref = await getPref(prefs, email);
    if (pref && !pref.goal_reminders) continue;

    const myGoals = allGoals.filter(g => g.participant_email === email || g.created_by === email);
    if (myGoals.length === 0) continue;

    // Only remind every 3 days
    const alreadyNotified = await dedupNotification(base44, email, 'goal_reminder', today());
    if (alreadyNotified) continue;

    const stalledGoal = myGoals.find(g => {
      const lastCheckin = g.last_checkin_date;
      return !lastCheckin || daysBetween(lastCheckin) >= 3;
    });
    if (!stalledGoal) continue;

    await createNotification(base44, {
      recipient_email: email,
      type: 'goal_reminder',
      title: `Keep going on: ${stalledGoal.title}`,
      body: "Small steps count. Check in on your goal to keep your momentum going.",
      action_url: '/GoalBoard',
      action_label: 'View Goals',
      priority: 'low',
      automation_key: 'goal_reminders',
    });
    sent++;
  }
  return { processed: profiles.length, sent };
}

// ── AUTOMATION 8: Inactivity Re-Engagement ───────────────────────────────────

async function runInactivityNudge(base44, profiles, allCheckIns, prefs, config) {
  if (!config.is_enabled) return { processed: 0, sent: 0 };
  const inactiveDays = config.thresholds?.inactive_days ?? 7;
  let sent = 0;

  for (const profile of profiles) {
    const email = profile.participant_email;
    const pref = await getPref(prefs, email);
    if (pref && !pref.inactivity_nudges) continue;

    const myCheckIns = allCheckIns.filter(c => c.participant_email === email);
    const lastCI = myCheckIns.sort((a, b) => new Date(b.check_in_date) - new Date(a.check_in_date))[0];
    const days = lastCI ? daysBetween(lastCI.check_in_date) : 99;

    if (days < inactiveDays) continue;

    const alreadyNotified = await dedupNotification(base44, email, 'inactivity_nudge', today());
    if (alreadyNotified) continue;

    await createNotification(base44, {
      recipient_email: email,
      type: 'inactivity_nudge',
      title: "Still here for you whenever you're ready 💙",
      body: "Recovery isn't linear. Whenever you want to reconnect, we're here — one small step is all it takes.",
      action_url: '/DailyCheckIn',
      action_label: 'Come Back',
      priority: 'low',
      automation_key: 'inactivity_reengagement',
    });
    sent++;
  }
  return { processed: profiles.length, sent };
}

// ── AUTOMATION 10: Milestone Celebrations ────────────────────────────────────

async function runMilestoneCelebrations(base44, profiles, allCheckIns, prefs, config) {
  if (!config.is_enabled) return { processed: 0, sent: 0 };
  const MILESTONES = [1, 3, 7, 14, 30, 60, 90, 180, 365];
  let sent = 0;

  for (const profile of profiles) {
    const email = profile.participant_email;
    const pref = await getPref(prefs, email);
    if (pref && !pref.milestone_celebrations) continue;

    const streak = getStreakDays(allCheckIns.filter(c => c.participant_email === email));
    if (!MILESTONES.includes(streak)) continue;

    const alreadyNotified = await dedupNotification(base44, email, 'milestone_celebration', today());
    if (alreadyNotified) continue;

    const msgs = {
      1:   { t: "You started! Day 1 is everything. 🌱", b: "Showing up today is the hardest and most important step." },
      3:   { t: "3 days in a row! You're building something real. ✨", b: "Consistency like this is what changes lives." },
      7:   { t: "One full week! 🔥", b: "7 days of showing up for yourself. That's no small thing." },
      14:  { t: "Two weeks strong 💪", b: "You've proven to yourself that you can keep going." },
      30:  { t: "30 days — One month! 🏆", b: "This milestone is a huge deal. Keep going, one day at a time." },
      60:  { t: "60 days — two months of momentum 🚀", b: "You are building a new life, one check-in at a time." },
      90:  { t: "90 days! A quarter year of recovery. 🦅", b: "This is a clinically significant milestone. Be proud." },
      180: { t: "6 months — half a year of strength 🌟", b: "You've come further than you may realize. Keep going." },
      365: { t: "ONE FULL YEAR! 🎉🎊", b: "365 days of showing up. You are a phoenix. This is everything." },
    };
    const m = msgs[streak];

    await createNotification(base44, {
      recipient_email: email,
      type: 'milestone_celebration',
      title: m.t,
      body: m.b,
      action_url: '/Profile',
      action_label: 'See My Progress',
      priority: streak >= 30 ? 'high' : 'medium',
      automation_key: 'milestone_celebrations',
    });
    sent++;
  }
  return { processed: profiles.length, sent };
}

// ── AUTOMATION 13: Consent Reminders ─────────────────────────────────────────

async function runConsentReminders(base44, profiles, config) {
  if (!config.is_enabled) return { processed: 0, sent: 0 };
  let sent = 0;

  for (const profile of profiles) {
    if (profile.terms_accepted) continue;
    const email = profile.participant_email;

    const alreadyNotified = await dedupNotification(base44, email, 'consent_reminder', today());
    if (alreadyNotified) continue;

    await createNotification(base44, {
      recipient_email: email,
      type: 'consent_reminder',
      title: "Action needed: Complete your profile setup",
      body: "Please review and accept the platform terms to unlock all features of your recovery plan.",
      action_url: '/Profile',
      action_label: 'Complete Setup',
      priority: 'medium',
      automation_key: 'consent_reminders',
    });
    sent++;
  }
  return { processed: profiles.length, sent };
}

// ── MAIN HANDLER ─────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Allow scheduled calls (no user) or admin manual calls
    const isAuth = await base44.auth.isAuthenticated();
    if (isAuth) {
      const user = await base44.auth.me();
      if (user?.role !== 'admin') {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // Load shared data once
    const [profiles, allCheckIns, prefs] = await Promise.all([
      base44.asServiceRole.entities.ParticipantProfile.list(),
      base44.asServiceRole.entities.DailyCheckIn.list('-check_in_date', 5000),
      base44.asServiceRole.entities.NotificationPreference.list(),
    ]);

    if (profiles.length === 0) {
      return Response.json({ message: 'No participants found', processed: 0 });
    }

    // Load configs
    const [
      c1, c2, c3, c5, c8, c10, c13
    ] = await Promise.all([
      getConfig(base44, 'daily_checkin_reminder'),
      getConfig(base44, 'missed_checkin_escalation'),
      getConfig(base44, 'risk_trend_alerts'),
      getConfig(base44, 'goal_reminders'),
      getConfig(base44, 'inactivity_reengagement'),
      getConfig(base44, 'milestone_celebrations'),
      getConfig(base44, 'consent_reminders'),
    ]);

    // Run all automations
    const [r1, r2, r3, r5, r8, r10, r13] = await Promise.all([
      runCheckinReminders(base44, profiles, allCheckIns, prefs, c1),
      runMissedCheckinEscalation(base44, profiles, allCheckIns, prefs, c2),
      runRiskTrendAlerts(base44, profiles, allCheckIns, c3),
      runGoalReminders(base44, profiles, prefs, c5),
      runInactivityNudge(base44, profiles, allCheckIns, prefs, c8),
      runMilestoneCelebrations(base44, profiles, allCheckIns, prefs, c10),
      runConsentReminders(base44, profiles, c13),
    ]);

    const totalSent = (r1.sent||0) + (r2.sent||0) + (r5.sent||0) + (r8.sent||0) + (r10.sent||0) + (r13.sent||0);
    const totalAlerts = (r2.alerts||0) + (r3.alerts||0);

    const summary = { checkin_reminders: r1, missed_checkin: r2, risk_trends: r3, goal_reminders: r5, inactivity: r8, milestones: r10, consent: r13 };

    await logRun(base44, 'automation_engine', 'success', {
      processed: profiles.length,
      sent: totalSent,
      alerts: totalAlerts,
      detail: summary,
    });

    return Response.json({
      success: true,
      date: today(),
      participants: profiles.length,
      notifications_sent: totalSent,
      staff_alerts_created: totalAlerts,
      breakdown: summary,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});