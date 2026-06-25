import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const CLIENT_CONNECTOR_ID = '6a10000a555f71fe414b9434';

const dayIndexes = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

function parseTime(text = '') {
  const normalized = String(text).toLowerCase();
  if (normalized.includes('morning')) return { hour: 9, minute: 0 };
  if (normalized.includes('afternoon')) return { hour: 14, minute: 0 };
  if (normalized.includes('evening')) return { hour: 18, minute: 0 };
  if (normalized.includes('night')) return { hour: 20, minute: 0 };

  const match = normalized.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
  if (!match) return { hour: 9, minute: 0 };
  let hour = Number(match[1]);
  const minute = Number(match[2] || 0);
  const meridiem = match[3];
  if (meridiem === 'pm' && hour < 12) hour += 12;
  if (meridiem === 'am' && hour === 12) hour = 0;
  return { hour, minute };
}

function nextDateForSchedule(schedule = '', time = '') {
  const now = new Date();
  const lowered = String(schedule).toLowerCase();
  const dayName = Object.keys(dayIndexes).find((day) => lowered.includes(day));
  const date = new Date(now);
  if (dayName) {
    const target = dayIndexes[dayName];
    const diff = (target - date.getDay() + 7) % 7 || 7;
    date.setDate(date.getDate() + diff);
  } else {
    date.setDate(date.getDate() + 1);
  }
  const parsedTime = parseTime(time || schedule);
  date.setHours(parsedTime.hour, parsedTime.minute, 0, 0);
  return date;
}

function nextDateForDay(dayOfWeek, time = '09:00') {
  const now = new Date();
  const date = new Date(now);
  const target = Number(dayOfWeek ?? now.getDay());
  const diff = (target - date.getDay() + 7) % 7 || 7;
  date.setDate(date.getDate() + diff);
  const parsedTime = parseTime(time);
  date.setHours(parsedTime.hour, parsedTime.minute, 0, 0);
  return date;
}

function buildEvent(item, clientName, type) {
  const explicitDate = item.date || item.due_date;
  const start = explicitDate ? new Date(`${explicitDate}T${item.start_time || item.due_time || item.preferred_time || '09:00'}`) : item.day_of_week !== undefined ? nextDateForDay(item.day_of_week, item.start_time || item.preferred_time || '09:00') : nextDateForSchedule(item.schedule_text || item.due_text || item.target || '', item.time_text || item.due_text || item.due_time || item.preferred_time || '');
  const minutes = Number(item.estimated_minutes || 60);
  const end = item.end_time && explicitDate ? new Date(`${explicitDate}T${item.end_time}`) : new Date(start.getTime() + minutes * 60 * 1000);
  const title = item.title || item.task_title || item.meeting_title || item.event_title || 'Recovery check-in';
  const isWeekly = String(item.recurrence || item.frequency || item.schedule_text || '').toLowerCase().includes('weekly') || item.day_of_week !== undefined || /every|monday|tuesday|wednesday|thursday|friday|saturday|sunday/i.test(item.schedule_text || '');

  return {
    summary: `ReZilient: ${title}`,
    description: `Recovery ${type} for ${clientName}. ${item.category || item.task_category || item.meeting_program_type || item.notes || ''}`.trim(),
    location: item.location || item.location_text || item.address || '',
    start: { dateTime: start.toISOString() },
    end: { dateTime: end.toISOString() },
    reminders: { useDefault: false, overrides: [{ method: 'popup', minutes: 30 }, { method: 'email', minutes: 60 }] },
    ...(isWeekly ? { recurrence: ['RRULE:FREQ=WEEKLY;COUNT=12'] } : {}),
  };
}

async function createEvents(accessToken, events) {
  const created = [];
  for (const event of events) {
    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });
    if (response.ok) {
      created.push(await response.json());
    }
  }
  return created.length;
}

function mergeRowsById(results) {
  const rows = results.flatMap((result) => (result.status === 'fulfilled' ? result.value : []));
  return Array.from(new Map(rows.map((row) => [row.id || `${row.created_date}-${row.title || row.task_title}`, row])).values());
}

async function loadOwnedRows(entity, userEmail, ownerField, order, limit) {
  return mergeRowsById(await Promise.allSettled([
    entity.filter({ [ownerField]: userEmail }, order, limit),
    entity.filter({ created_by: userEmail }, order, limit),
  ]));
}

async function loadClientScopedRows(entity, userEmail, clients, order, limit) {
  const filters = [
    { user_email: userEmail },
    { client_email: userEmail },
    { created_by: userEmail },
    ...clients.filter((client) => client?.id).map((client) => ({ client_id: client.id })),
  ];
  return mergeRowsById(await Promise.allSettled(filters.map((filter) => entity.filter(filter, order, limit))));
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await req.json();
    const clientName = payload.clientName || user.full_name || 'Client';
    const syncPersonal = payload.syncPersonal !== false;
    const syncShared = payload.syncShared === true;
    const clients = await loadOwnedRows(base44.entities.Clients, user.email, 'email', '-updated_date', 10);

    const [calendarEvents, dailyTasks, recoveryTasks, plannedMeetings] = await Promise.all([
      Array.isArray(payload.calendarEvents) ? Promise.resolve(payload.calendarEvents) : loadClientScopedRows(base44.entities.CalendarEvents, user.email, clients, '-updated_date', 50),
      Array.isArray(payload.tasks) ? Promise.resolve(payload.tasks) : loadClientScopedRows(base44.entities.DailyTasks, user.email, clients, '-updated_date', 50),
      base44.entities.RecoveryPathTask.filter({ user_email: user.email, is_active: true }, 'sort_order', 50),
      base44.entities.PlannedMeeting.filter({ participant_email: user.email }, 'day_of_week', 50),
    ]);

    const googleEvents = [
      ...calendarEvents.filter((item) => item.status !== 'cancelled').map((item) => buildEvent(item, clientName, 'appointment')),
      ...dailyTasks.filter((item) => !item.completed).map((item) => buildEvent(item, clientName, 'task')),
      ...recoveryTasks.map((item) => ({ ...buildEvent({ ...item, day_of_week: item.days_of_week?.[0] }, clientName, 'recovery task'), recurrence: item.recurrence === 'daily' ? ['RRULE:FREQ=DAILY;COUNT=30'] : ['RRULE:FREQ=WEEKLY;COUNT=12'] })),
      ...plannedMeetings.map((item) => buildEvent(item, clientName, 'group meeting')),
    ];

    let sharedCreated = 0;
    let personalCreated = 0;
    let personalConnected = true;

    if (syncShared && googleEvents.length) {
      const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlecalendar');
      sharedCreated = await createEvents(accessToken, googleEvents);
    }

    if (syncPersonal && googleEvents.length) {
      try {
        const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection(CLIENT_CONNECTOR_ID);
        personalCreated = await createEvents(accessToken, googleEvents);
      } catch (_error) {
        personalConnected = false;
      }
    }

    return Response.json({ sharedCreated, personalCreated, personalConnected, totalEvents: googleEvents.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});