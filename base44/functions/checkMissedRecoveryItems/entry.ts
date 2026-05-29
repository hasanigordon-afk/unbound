import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const systemEmail = 'rezilient@base44.app';

const todayDate = () => new Date().toISOString().slice(0, 10);
const currentTime = () => new Date().toLocaleTimeString('en-US', {
  timeZone: 'America/New_York',
  hour12: false,
  hour: '2-digit',
  minute: '2-digit'
});

const friendlyMessage = (title) =>
  `Hey — no judgment. It looks like you may have missed "${title}". Recovery is built by returning, not by being perfect. Take one small step now: check in, reschedule it, or reach out to someone safe.`;

async function createAlertIfNeeded(base44, item) {
  const existing = await base44.asServiceRole.entities.MissedCheckInAlert.filter({
    source_entity: item.source_entity,
    source_id: item.source_id,
  }, '-created_date', 1);

  if (existing.length) return false;

  const message = friendlyMessage(item.title);
  await base44.asServiceRole.entities.MissedCheckInAlert.create({
    user_email: item.user_email,
    source_entity: item.source_entity,
    source_id: item.source_id,
    title: item.title,
    message,
    status: 'sent',
    sent_at: new Date().toISOString(),
  });

  if (item.user_email) {
    await base44.asServiceRole.entities.Message.create({
      sender_email: systemEmail,
      sender_role: 'counselor',
      receiver_email: item.user_email,
      receiver_role: 'patient',
      channel: 'counselor_patient',
      message_type: 'check_in',
      subject: 'Friendly recovery check-in',
      body: message,
      status_tag: 'follow_up',
      is_read: false,
      required_response: false,
    });
  }

  return true;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const today = todayDate();
    const now = currentTime();
    const nowDay = new Date().getDay();

    const [dailyTasks, weeklyTasks, meetings] = await Promise.all([
      base44.asServiceRole.entities.DailyTasks.filter({ due_date: today, completed: false }, '-created_date', 100),
      base44.asServiceRole.entities.WeeklyTask.filter({ due_date: today, completed: false }, '-created_date', 100),
      base44.asServiceRole.entities.PlannedMeeting.filter({ day_of_week: nowDay }, '-created_date', 100),
    ]);

    const missedItems = [
      ...dailyTasks
        .filter((task) => task.due_time && task.due_time < now)
        .map((task) => ({
          source_entity: 'DailyTasks',
          source_id: task.id,
          title: task.task_title,
          user_email: task.participant_email || task.user_email,
        })),
      ...weeklyTasks
        .filter((task) => task.due_time && task.due_time < now)
        .map((task) => ({
          source_entity: 'WeeklyTask',
          source_id: task.id,
          title: task.title,
          user_email: task.user_email,
        })),
      ...meetings
        .filter((meeting) => meeting.start_time && meeting.start_time < now)
        .map((meeting) => ({
          source_entity: 'PlannedMeeting',
          source_id: meeting.id,
          title: meeting.meeting_title,
          user_email: meeting.participant_email,
        })),
    ].filter((item) => item.source_id && item.title);

    let created = 0;
    for (const item of missedItems) {
      if (await createAlertIfNeeded(base44, item)) created += 1;
    }

    return Response.json({ checked: missedItems.length, created });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});