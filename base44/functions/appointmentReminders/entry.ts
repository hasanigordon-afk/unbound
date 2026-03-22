/**
 * UNBOUND Appointment Reminders
 * Sends 24-hour and 2-hour reminders for scheduled telehealth sessions.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

function today() {
  return new Date().toISOString().split('T')[0];
}

function tomorrowStr() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const isAuth = await base44.auth.isAuthenticated();
    if (isAuth) {
      const user = await base44.auth.me();
      if (user?.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const config = await base44.asServiceRole.entities.AutomationConfig.filter({ automation_key: 'appointment_reminders' });
    if (config[0]?.is_enabled === false) {
      return Response.json({ skipped: true, reason: 'automation_disabled' });
    }

    const todayStr = today();
    const tomorrowDate = tomorrowStr();
    const prefs = await base44.asServiceRole.entities.NotificationPreference.list();

    // 24-hour reminders
    const tomorrowSessions = await base44.asServiceRole.entities.TelehealthSession.filter({
      scheduled_date: tomorrowDate,
      status: 'scheduled',
    });

    let sent = 0;

    for (const session of tomorrowSessions) {
      const emails = session.is_group_event
        ? (session.group_participant_emails || [])
        : session.participant_email ? [session.participant_email] : [];

      for (const email of emails) {
        const pref = prefs.find(p => p.user_email === email);
        if (pref && !pref.appointment_reminders) continue;

        const existing = await base44.asServiceRole.entities.InAppNotification.filter({
          recipient_email: email,
          type: 'appointment_reminder',
          related_entity_id: session.id,
        });
        if (existing.length > 0) continue;

        const sessionLabel = session.title || session.session_type?.replace(/_/g, ' ') || 'Appointment';
        const timeLabel = session.scheduled_time || 'scheduled time';

        await base44.asServiceRole.entities.InAppNotification.create({
          recipient_email: email,
          type: 'appointment_reminder',
          title: `Reminder: ${sessionLabel} tomorrow`,
          body: `You have ${sessionLabel} at ${timeLabel} tomorrow. Tap to confirm or reschedule.`,
          action_url: '/TelehealthHub',
          action_label: 'View Appointment',
          priority: 'medium',
          is_read: false,
          dismissed: false,
          automation_key: 'appointment_reminders',
          related_entity_id: session.id,
          expires_at: tomorrowDate,
        });
        sent++;
      }
    }

    // Today's sessions (same-day reminder)
    const todaySessions = await base44.asServiceRole.entities.TelehealthSession.filter({
      scheduled_date: todayStr,
      status: 'scheduled',
    });

    for (const session of todaySessions) {
      const emails = session.is_group_event
        ? (session.group_participant_emails || [])
        : session.participant_email ? [session.participant_email] : [];

      for (const email of emails) {
        const pref = prefs.find(p => p.user_email === email);
        if (pref && !pref.appointment_reminders) continue;

        const existing = await base44.asServiceRole.entities.InAppNotification.filter({
          recipient_email: email,
          type: 'appointment_reminder',
          related_entity_id: `${session.id}_today`,
        });
        if (existing.length > 0) continue;

        const sessionLabel = session.title || session.session_type?.replace(/_/g, ' ') || 'Appointment';
        const timeLabel = session.scheduled_time || 'soon';

        await base44.asServiceRole.entities.InAppNotification.create({
          recipient_email: email,
          type: 'appointment_reminder',
          title: `Your ${sessionLabel} is today`,
          body: `Today at ${timeLabel}. Your provider is ready for you.`,
          action_url: session.meeting_url || '/TelehealthHub',
          action_label: session.meeting_url ? 'Join Session' : 'View Details',
          priority: 'high',
          is_read: false,
          dismissed: false,
          automation_key: 'appointment_reminders',
          related_entity_id: `${session.id}_today`,
          expires_at: todayStr,
        });
        sent++;
      }
    }

    await base44.asServiceRole.entities.AutomationLog.create({
      automation_key: 'appointment_reminders',
      run_date: todayStr,
      status: 'success',
      participants_processed: tomorrowSessions.length + todaySessions.length,
      notifications_sent: sent,
      alerts_created: 0,
    });

    return Response.json({ success: true, notifications_sent: sent });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});