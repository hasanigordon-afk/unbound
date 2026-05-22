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

function buildEvent(item, clientName, type) {
  const start = nextDateForSchedule(item.schedule_text || item.due_text || item.target || '', item.time_text || item.due_text || '');
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const isWeekly = String(item.recurrence || item.frequency || item.schedule_text || '').toLowerCase().includes('weekly') || /every|monday|tuesday|wednesday|thursday|friday|saturday|sunday/i.test(item.schedule_text || '');

  return {
    summary: `ReZilient: ${item.title}`,
    description: `S.E.E. Super Agent ${type} for ${clientName}. ${item.category || item.frequency || item.due_text || ''}`.trim(),
    start: { dateTime: start.toISOString() },
    end: { dateTime: end.toISOString() },
    reminders: { useDefault: true },
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

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await req.json();
    const clientName = payload.clientName || 'Client';
    const calendarEvents = Array.isArray(payload.calendarEvents) ? payload.calendarEvents : [];
    const tasks = Array.isArray(payload.tasks) ? payload.tasks : [];
    const syncPersonal = payload.syncPersonal !== false;
    const syncShared = payload.syncShared !== false;

    const googleEvents = [
      ...calendarEvents.map((item) => buildEvent(item, clientName, 'appointment')),
      ...tasks.map((item) => buildEvent(item, clientName, 'scheduled task')),
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