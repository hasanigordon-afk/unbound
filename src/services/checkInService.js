import { createEntity, filterEntity, todayISO } from './serviceUtils';

export async function createCheckIn(user, payload) {
  const email = user?.email;
  if (!email) throw new Error('Sign in is required to create a check-in.');
  return createEntity('CheckInRecord', {
    user_id: user.id,
    user_email: email,
    completed_at: new Date().toISOString(),
    ...payload,
  });
}

export async function getTodayCheckIns(user) {
  if (!user?.email) return [];
  const records = await filterEntity('CheckInRecord', { user_email: user.email }, []);
  const today = todayISO();
  return records.filter((item) => String(item.completed_at || '').startsWith(today));
}

export async function getCheckInHistory(user) {
  if (!user?.email) return [];
  return filterEntity('CheckInRecord', { user_email: user.email }, []);
}

export function calculateStreak(records) {
  const days = new Set(records.map((item) => String(item.completed_at || '').slice(0, 10)).filter(Boolean));
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}
