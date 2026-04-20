import { base44 } from "@/api/base44Client";

/**
 * 3 H's Subscription & Engagement Engine
 * Help · Hope · Healing
 */

// ── Trigger tracking (localStorage) ──────────────────────────────────────────
const TRIGGER_KEY = "ahha_sub_triggers";
const PROMPT_SEEN_SESSION_KEY = "ahha_sub_prompt_shown";
const VISIT_KEY = "ahha_home_visits";

export const TRIGGERS = {
  FIRST_CHECKIN: "first_checkin",
  AH_HA_POSTED: "ah_ha_posted",
  GOAL_SET: "goal_set",
  SECOND_VISIT: "second_visit",
};

function getTriggers() {
  try { return JSON.parse(localStorage.getItem(TRIGGER_KEY) || "{}"); }
  catch { return {}; }
}

export function markTrigger(name) {
  try {
    const t = getTriggers();
    if (!t[name]) {
      t[name] = new Date().toISOString();
      localStorage.setItem(TRIGGER_KEY, JSON.stringify(t));
    }
  } catch { /* noop */ }
}

export function hasAnyTrigger() {
  const t = getTriggers();
  return Object.keys(t).length > 0;
}

export function trackHomeVisit() {
  try {
    const n = parseInt(localStorage.getItem(VISIT_KEY) || "0", 10) + 1;
    localStorage.setItem(VISIT_KEY, String(n));
    if (n >= 2) markTrigger(TRIGGERS.SECOND_VISIT);
    return n;
  } catch { return 1; }
}

export function markPromptShownThisSession() {
  try { sessionStorage.setItem(PROMPT_SEEN_SESSION_KEY, "1"); } catch { /* noop */ }
}

export function wasPromptShownThisSession() {
  try { return sessionStorage.getItem(PROMPT_SEEN_SESSION_KEY) === "1"; } catch { return false; }
}

// ── Preference helpers ───────────────────────────────────────────────────────

export async function getOrCreatePref(userEmail) {
  const rows = await base44.entities.NotificationPreference.filter({ user_email: userEmail });
  return rows[0] || null;
}

export async function subscribeUser(userEmail, existingPref) {
  const patch = {
    subscribed: true,
    subscribed_at: new Date().toISOString(),
    all_enabled: true,
    help_enabled: true,
    hope_enabled: true,
    healing_enabled: true,
    prompt_status: "allowed",
  };

  // Try browser permission — non-blocking
  if (typeof window !== "undefined" && "Notification" in window) {
    try {
      const perm = await Notification.requestPermission();
      patch.browser_permission = perm;
    } catch { patch.browser_permission = "denied"; }
  } else {
    patch.browser_permission = "unsupported";
  }

  if (existingPref) {
    return base44.entities.NotificationPreference.update(existingPref.id, patch);
  }
  return base44.entities.NotificationPreference.create({ user_email: userEmail, ...patch });
}

export async function dismissPrompt(userEmail, existingPref) {
  const patch = {
    prompt_status: "dismissed",
    dismissed_at: new Date().toISOString(),
  };
  if (existingPref) {
    return base44.entities.NotificationPreference.update(existingPref.id, patch);
  }
  return base44.entities.NotificationPreference.create({ user_email: userEmail, ...patch });
}

export async function unsubscribeUser(prefId) {
  return base44.entities.NotificationPreference.update(prefId, {
    subscribed: false,
    all_enabled: false,
  });
}

// ── In-app nudge decision engine ─────────────────────────────────────────────

/**
 * Decide the best nudge to show right now based on user behavior.
 * Returns { stream: 'help'|'hope'|'healing', title, body, cta, action } or null.
 */
export function pickNudge({ pref, streak, checkedInToday, avgCraving, daysSinceLastCheckIn }) {
  if (!pref?.subscribed || !pref?.all_enabled) return null;

  // Frequency throttling — balanced shows every 6h, light every 24h, strong every 2h
  const throttleMs = pref.frequency === "light" ? 24 * 3600_000
                   : pref.frequency === "strong" ? 2 * 3600_000
                   : 6 * 3600_000;
  if (pref.last_nudge_at) {
    const elapsed = Date.now() - new Date(pref.last_nudge_at).getTime();
    if (elapsed < throttleMs) return null;
  }

  // ── HELP: accountability-first if they haven't checked in today
  if (pref.help_enabled && !checkedInToday) {
    if (streak > 0) {
      return {
        stream: "help",
        title: `You're ${streak} day${streak > 1 ? "s" : ""} strong`,
        body: `Don't lose your progress today. A 30-second check-in is all it takes.`,
        cta: "Check In",
        href: "/DailyCheckIn",
      };
    }
    return {
      stream: "help",
      title: "Keep the momentum going",
      body: "A quick check-in today keeps you connected to your path.",
      cta: "Check In",
      href: "/DailyCheckIn",
    };
  }

  // ── HEALING: craving elevated
  if (pref.healing_enabled && avgCraving >= 6) {
    return {
      stream: "healing",
      title: "Take 60 seconds for yourself",
      body: "Breathing, grounding, or calming audio. Small resets matter.",
      cta: "Open Reset",
      href: "/ResetButton",
    };
  }

  // ── HOPE: inactive for 2+ days
  if (pref.hope_enabled && daysSinceLastCheckIn >= 2) {
    return {
      stream: "hope",
      title: "We're still here when you're ready",
      body: "Someone just shared a story that might resonate with you.",
      cta: "Read a Story",
      href: "/AhHaCommunity",
    };
  }

  // ── HELP: streak milestone recognition
  if (pref.help_enabled && [3, 7, 14, 30, 60, 90].includes(streak) && checkedInToday) {
    const MILESTONES = {
      3: "3 days strong",
      7: "1 week locked in",
      14: "2 weeks. You're building something real.",
      30: "30 days. This is recovery.",
      60: "60 days. You're becoming who you wanted to be.",
      90: "90 days. Phoenix.",
    };
    return {
      stream: "help",
      title: MILESTONES[streak],
      body: "You didn't quit today. That matters.",
      cta: "See Progress",
      href: "/MyFoundation",
    };
  }

  // ── HEALING: gentle reflection if checked in but no streak context
  if (pref.healing_enabled && checkedInToday && streak >= 1) {
    return {
      stream: "healing",
      title: "A quiet moment",
      body: "Take 60 seconds to breathe, or jot one thing you're grateful for.",
      cta: "Open Reset",
      href: "/ResetButton",
    };
  }

  return null;
}

export async function markNudgeShown(prefId) {
  return base44.entities.NotificationPreference.update(prefId, {
    last_nudge_at: new Date().toISOString(),
  });
}