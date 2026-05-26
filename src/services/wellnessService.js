import { createCheckIn } from './checkInService';
import { createEntity, filterEntity } from './serviceUtils';
import { getMediaItems } from './mediaService';

export async function getWellnessContent() {
  return getMediaItems();
}

export async function saveJournalEntry(user, payload) {
  if (!user?.email) throw new Error('Sign in is required to save a journal entry.');
  return createEntity('JournalEntry', {
    prompt: payload.title || 'Wellness journal',
    content: payload.body,
    mood_score: payload.mood_score ? Number(payload.mood_score) : undefined,
    tags: payload.tags || ['wellness'],
    shared_with_facility: false,
  });
}

export function getBreathingExercises() {
  return [
    { id: 'box', name: 'Box breathing', inhale: 4, hold: 4, exhale: 4, rounds: 4 },
    { id: 'ground', name: 'Grounding breath', inhale: 4, hold: 2, exhale: 6, rounds: 5 },
  ];
}

export async function getMeditationAudio() {
  return getMediaItems({ mediaType: 'meditation' });
}

export async function trackWellnessActivity(user, payload) {
  return createCheckIn(user, {
    check_in_type: 'wellness',
    notes: payload.notes || payload.activity || 'Wellness activity completed',
  });
}

export async function getJournalEntries(user) {
  if (!user?.email) return [];
  return filterEntity('JournalEntry', { created_by: user.email }, []);
}
