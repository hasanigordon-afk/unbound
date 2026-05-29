import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const appEmail = 'rezilient@base44.app';
const timeZone = 'America/New_York';

function todayInUserTimezone() {
  return new Date().toLocaleDateString('en-CA', { timeZone });
}

function dayOfWeekInUserTimezone() {
  return Number(new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'short' })
    .formatToParts(new Date()).length) && new Date().toLocaleDateString('en-US', { timeZone, weekday: 'long' });
}

function currentDayIndex() {
  const day = new Date().toLocaleDateString('en-US', { timeZone, weekday: 'long' });
  return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(day);
}

function formatList(items) {
  return items.map((item) => `• ${item.time ? `${item.time} — ` : ''}${item.title}`).join('\n');
}

function buildMessage(items) {
  return `Good morning — here’s your ReZilient plan for today. You’ve got ${items.length} recovery step${items.length === 1 ? '' : 's'} scheduled.\n\n${formatList(items)}\n\nOne step at a time. You don’t have to do the whole day right now — just start with the next right thing.`;
}

async function alreadySent(base44, email, date) {
  const logs = await base44.asServiceRole.entities.RecoveryReminderLog.filter({
    user_email: email,
    reminder_date: date,
  }, '-created_date', 1);
  return logs.length > 0;
}

async function sendReminder(base44, email, date, items) {
  if (!email || !items.length || await alreadySent(base44, email, date)) return false;

  const body = buildMessage(items);
  await base44.asServiceRole.entities.Message.create({
    sender_email: appEmail,
    sender_role: 'counselor',
    receiver_email: email,
    receiver_role: 'patient',
    channel: 'counselor_patient',
    message_type: 'appointment_reminder',
    subject: 'Your recovery plan for today',
    body,
    status_tag: 'informational',
    is_read: false,
    required_response: false,
  });

  const prefs = await base44.asServiceRole.entities.NotificationPreference.filter({ user_email: email }, '-created_date', 1);
  const canEmail = !prefs.length || (prefs[0].all_enabled !== false && prefs[0].help_enabled !== false);

  let emailSent = false;
  if (canEmail) {
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: email,
        subject: 'Your recovery plan for today',
        body,
        from_name: 'ReZilient',
      });
      emailSent = true;
    } catch (error) {
      console.warn(`Email reminder skipped for ${email}: ${error.message}`);
    }
  }

  await base44.asServiceRole.entities.RecoveryReminderLog.create({
    user_email: email,
    reminder_date: date,
    item_count: items.length,
    sent_at: new Date().toISOString(),
    delivery_type: emailSent ? 'in_app_and_email' : 'in_app',
  });

  return true;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const date = todayInUserTimezone();
    const dayIndex = currentDayIndex();

    const [dailyTasks, weeklyTasks, meetings, events] = await Promise.all([
      base44.asServiceRole.entities.DailyTasks.filter({ due_date: date, completed: false }, 'due_time', 200),
      base44.asServiceRole.entities.WeeklyTask.filter({ due_date: date, completed: false }, 'due_time', 200),
      base44.asServiceRole.entities.PlannedMeeting.filter({ day_of_week: dayIndex }, 'start_time', 200),
      base44.asServiceRole.entities.CalendarEvents.filter({ date }, 'start_time', 200),
    ]);

    const byUser = new Map();
    const addItem = (email, item) => {
      if (!email) return;
      byUser.set(email, [...(byUser.get(email) || []), item]);
    };

    dailyTasks.forEach((task) => addItem(task.user_email || task.participant_email, {
      title: task.task_title,
      time: task.due_time,
    }));

    weeklyTasks.forEach((task) => addItem(task.user_email, {
      title: task.title,
      time: task.due_time,
    }));

    meetings.forEach((meeting) => addItem(meeting.participant_email, {
      title: meeting.meeting_title,
      time: meeting.start_time,
    }));

    events.forEach((event) => addItem(event.user_email || event.participant_email || event.client_email, {
      title: event.title || event.event_title,
      time: event.start_time || event.time_text,
    }));

    let sent = 0;
    for (const [email, items] of byUser.entries()) {
      if (await sendReminder(base44, email, date, items)) sent += 1;
    }

    return Response.json({ date, checked_users: byUser.size, sent });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});