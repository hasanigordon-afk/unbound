import { createEntity, filterEntity, updateEntity } from './serviceUtils';

export async function createReminder(user, payload) {
  if (!user?.email) throw new Error('Sign in is required to create a reminder.');
  return createEntity('ReminderNotification', {
    user_id: user.id,
    user_email: user.email,
    status: 'pending',
    ...payload,
  });
}

export async function scheduleReminder(user, payload) {
  return createReminder(user, payload);
}

export async function dismissReminder(reminderId) {
  return updateEntity('ReminderNotification', reminderId, { status: 'dismissed' });
}

export async function getUpcomingReminders(user) {
  if (!user?.email) return [];
  const reminders = await filterEntity('ReminderNotification', { user_email: user.email }, []);
  return reminders.filter((item) => item.status === 'pending').sort((a, b) => new Date(a.scheduled_for) - new Date(b.scheduled_for));
}
