import { base44 } from '@/api/base44Client';

const VOICE_LOAD_TIMEOUT_MS = 3000;
let voicesCache = null;
let voicesReady = false;

export const EVENT_TYPES = {
  STREAK_MILESTONE: 'streak_milestone',
  GOAL_COMPLETED: 'goal_completed',
  ACHIEVEMENT: 'achievement',
  CHECK_IN: 'check_in',
  NUDGE: 'nudge',
  PREVIEW: 'preview',
};

export function isSpeechSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

function loadVoices() {
  if (!isSpeechSupported()) return Promise.resolve([]);
  if (voicesReady && voicesCache?.length) return Promise.resolve(voicesCache);

  return new Promise((resolve) => {
    const finish = () => {
      voicesCache = window.speechSynthesis.getVoices() || [];
      voicesReady = voicesCache.length > 0;
      resolve(voicesCache);
    };

    finish();
    if (!voicesReady) {
      window.speechSynthesis.onvoiceschanged = finish;
      setTimeout(finish, VOICE_LOAD_TIMEOUT_MS);
    }
  });
}

function scoreVoice(voice, gender) {
  const name = `${voice.name} ${voice.lang}`.toLowerCase();
  const femaleHints = ['female', 'woman', 'samantha', 'victoria', 'karen', 'moira', 'fiona', 'zira', 'google uk english female', 'microsoft zira'];
  const maleHints = ['male', 'man', 'daniel', 'alex', 'fred', 'david', 'tom', 'google uk english male', 'microsoft david'];

  if (gender === 'female') {
    if (femaleHints.some((h) => name.includes(h))) return 10;
    if (maleHints.some((h) => name.includes(h))) return 0;
    return voice.name.includes('en') ? 4 : 1;
  }

  if (gender === 'male') {
    if (maleHints.some((h) => name.includes(h))) return 10;
    if (femaleHints.some((h) => name.includes(h))) return 0;
    return voice.name.includes('en') ? 4 : 1;
  }

  return voice.default ? 8 : 3;
}

export async function pickVoice(gender = 'female') {
  const voices = await loadVoices();
  if (!voices.length) return null;

  if (gender === 'system') {
    return voices.find((v) => v.default) || voices.find((v) => v.lang?.startsWith('en')) || voices[0];
  }

  const english = voices.filter((v) => v.lang?.startsWith('en'));
  const pool = english.length ? english : voices;
  const ranked = [...pool].sort((a, b) => scoreVoice(b, gender) - scoreVoice(a, gender));
  return ranked[0] || null;
}

export async function fetchNotificationPref(userEmail) {
  if (!userEmail) return null;
  const rows = await base44.entities.NotificationPreference.filter({ user_email: userEmail });
  return rows[0] || null;
}

export function shouldSpeakForPref(pref, eventType) {
  if (!pref) return true;
  if (pref.spoken_reminders_enabled === false) return false;
  if (pref.all_enabled === false && pref.subscribed) return false;

  if (eventType === EVENT_TYPES.STREAK_MILESTONE || eventType === EVENT_TYPES.NUDGE) {
    if (pref.milestone_reminders === false) return false;
    if (pref.auto_play_milestones === false) return false;
  }

  if (eventType === EVENT_TYPES.GOAL_COMPLETED || eventType === EVENT_TYPES.ACHIEVEMENT) {
    if (pref.spoken_goal_celebrations === false) return false;
  }

  return true;
}

export async function wasAlreadySpoken(userEmail, eventKey) {
  if (!userEmail || !eventKey) return false;
  try {
    const rows = await base44.entities.SpokenReminderLog.filter(
      { user_email: userEmail, event_key: eventKey },
      '-spoken_at',
      1,
    );
    return rows.length > 0;
  } catch {
    return false;
  }
}

export async function logSpokenReminder({ userEmail, eventType, eventKey, message }) {
  if (!userEmail || !eventKey) return;
  try {
    await base44.entities.SpokenReminderLog.create({
      user_email: userEmail,
      event_type: eventType,
      event_key: eventKey,
      message_text: message?.slice(0, 500) || '',
      spoken_at: new Date().toISOString(),
    });
  } catch {
    /* non-blocking */
  }
}

let speaking = false;

export async function speakText(text, { gender = 'female', rate = 0.92, pitch = 1.02, onEnd } = {}) {
  if (!isSpeechSupported() || !text?.trim()) {
    onEnd?.({ ok: false, reason: 'unsupported' });
    return { ok: false, reason: 'unsupported' };
  }

  const voice = await pickVoice(gender);
  window.speechSynthesis.cancel();

  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text.trim());
    utterance.rate = rate;
    utterance.pitch = pitch;
    if (voice) utterance.voice = voice;

    utterance.onstart = () => { speaking = true; };
    utterance.onend = () => {
      speaking = false;
      onEnd?.({ ok: true });
      resolve({ ok: true, voice: voice?.name });
    };
    utterance.onerror = () => {
      speaking = false;
      onEnd?.({ ok: false, reason: 'error' });
      resolve({ ok: false, reason: 'error' });
    };

    window.speechSynthesis.speak(utterance);
  });
}

export async function speakCelebration({
  userEmail,
  pref,
  eventType,
  eventKey,
  text,
  gender,
  force = false,
}) {
  if (!text?.trim()) return { ok: false, reason: 'empty' };
  if (!force && !shouldSpeakForPref(pref, eventType)) return { ok: false, reason: 'disabled' };

  if (!force && userEmail && eventKey) {
    const already = await wasAlreadySpoken(userEmail, eventKey);
    if (already) return { ok: false, reason: 'duplicate' };
  }

  const voiceGender = gender || pref?.voice_gender || 'female';
  const result = await speakText(text, { gender: voiceGender });

  if (result.ok && userEmail && eventKey) {
    await logSpokenReminder({ userEmail, eventType, eventKey, message: text });
  }

  return result;
}

export function isSpeaking() {
  return speaking;
}
