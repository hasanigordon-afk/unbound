import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import MailComposer from 'npm:nodemailer@6.9.16/lib/mail-composer/index.js';

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

function formatDate(value) {
  if (!value) return 'Unscheduled';
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function isUpcoming(item) {
  if (!item.appointment_date && !item.reminder_date) return true;
  const date = new Date(item.appointment_date || item.reminder_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
}

async function buildRawEmail({ to, subject, html }) {
  const composer = new MailComposer({
    to,
    subject,
    html,
    text: html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
  });
  const message = await composer.compile().build();
  return btoa(String.fromCharCode(...new Uint8Array(message)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

async function sendGmail(accessToken, email) {
  const raw = await buildRawEmail(email);
  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw }),
  });
  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Gmail send failed: ${details}`);
  }
  return response.json();
}

function renderList(items, emptyText, mapper) {
  if (!items.length) return `<p style="color:#64748b;margin:8px 0 0;">${emptyText}</p>`;
  return `<ul style="margin:10px 0 0;padding-left:18px;color:#334155;line-height:1.8;">${items.map(mapper).join('')}</ul>`;
}

function buildEmail({ client, assignment, appointments, goals, tasks, reminders }) {
  const clientName = assignment.client_display_name || client?.full_name || assignment.client_email;
  const completedGoals = goals.filter((item) => item.confirmed || item.progress >= 100).length;
  const completedTasks = tasks.filter((item) => item.status === 'completed' || item.confirmed).length;
  const openTasks = tasks.filter((item) => item.status !== 'completed');
  const upcomingAppointments = appointments.filter(isUpcoming).slice(0, 8);
  const upcomingReminders = reminders.filter(isUpcoming).slice(0, 6);
  const progressRate = goals.length ? Math.round((completedGoals / goals.length) * 100) : 0;

  const html = `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:640px;margin:0 auto;color:#0f172a;background:#f8fafc;padding:24px;">
  <div style="background:linear-gradient(135deg,#0f172a,#2563eb);border-radius:22px 22px 0 0;padding:28px;color:white;">
    <p style="margin:0 0 8px;font-size:12px;letter-spacing:1.6px;text-transform:uppercase;color:#bfdbfe;font-weight:700;">ReZilient · Weekly Roadmap Summary</p>
    <h1 style="margin:0;font-size:26px;line-height:1.2;">${escapeHtml(clientName)}</h1>
    <p style="margin:10px 0 0;color:#dbeafe;font-size:14px;">Progress and upcoming recovery schedule for counselor review.</p>
  </div>
  <div style="background:white;border:1px solid #e2e8f0;border-top:0;border-radius:0 0 22px 22px;padding:28px;">
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:24px;">
      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:16px;padding:14px;"><p style="margin:0;color:#2563eb;font-size:12px;font-weight:800;">Goal Progress</p><p style="margin:6px 0 0;font-size:24px;font-weight:900;">${progressRate}%</p></div>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:16px;padding:14px;"><p style="margin:0;color:#15803d;font-size:12px;font-weight:800;">Completed Goals</p><p style="margin:6px 0 0;font-size:24px;font-weight:900;">${completedGoals}/${goals.length}</p></div>
      <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:16px;padding:14px;"><p style="margin:0;color:#c2410c;font-size:12px;font-weight:800;">Open Tasks</p><p style="margin:6px 0 0;font-size:24px;font-weight:900;">${openTasks.length}</p></div>
    </div>

    <h2 style="font-size:18px;margin:0 0 8px;">Upcoming schedule</h2>
    ${renderList(upcomingAppointments, 'No upcoming appointments found.', (item) => `<li><strong>${escapeHtml(item.title)}</strong> — ${formatDate(item.appointment_date)} ${escapeHtml(item.time || '')} ${item.location ? `· ${escapeHtml(item.location)}` : ''}</li>`)}

    <h2 style="font-size:18px;margin:24px 0 8px;">Current goals</h2>
    ${renderList(goals.slice(0, 8), 'No goals found.', (item) => `<li><strong>${escapeHtml(item.title)}</strong> — ${escapeHtml(item.target || item.category || 'Roadmap goal')} ${item.confirmed ? '✅' : ''}</li>`)}

    <h2 style="font-size:18px;margin:24px 0 8px;">Counselor follow-ups</h2>
    ${renderList(openTasks.slice(0, 8), 'No open counselor follow-ups.', (item) => `<li><strong>${escapeHtml(item.title)}</strong> — ${escapeHtml(item.due_text || item.category || 'Follow-up')}</li>`)}

    <h2 style="font-size:18px;margin:24px 0 8px;">Active reminders</h2>
    ${renderList(upcomingReminders, 'No active reminders found.', (item) => `<li><strong>${escapeHtml(item.title)}</strong> — ${escapeHtml(item.time || item.repeat || 'Reminder active')}</li>`)}

    <p style="margin:28px 0 0;color:#64748b;font-size:12px;line-height:1.6;">This automated summary is generated from ReZilient roadmap activity and schedule records for assigned counselor follow-up.</p>
  </div>
</div>`.trim();

  return {
    to: assignment.assigned_staff_email,
    subject: `Weekly ReZilient roadmap summary: ${clientName}`,
    html,
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const isAuthenticated = await base44.auth.isAuthenticated();
    if (isAuthenticated) {
      const user = await base44.auth.me();
      if (user?.role !== 'admin') return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const payload = await req.json().catch(() => ({}));
    const dryRun = payload.dryRun === true;
    const assignments = await base44.asServiceRole.entities.FacilityClientAssignment.filter({ status: 'active' }, '-created_date', 100);
    const scopedAssignments = payload.client_email ? assignments.filter((item) => item.client_email === payload.client_email) : assignments;
    const { accessToken } = dryRun ? { accessToken: null } : await base44.asServiceRole.connectors.getConnection('gmail');
    const results = [];

    for (const assignment of scopedAssignments) {
      if (!assignment.assigned_staff_email || !assignment.client_email) continue;
      const clients = await base44.asServiceRole.entities.Clients.filter({ email: assignment.client_email }, '-created_date', 1);
      const client = clients[0];
      if (!client?.id) continue;

      const [appointments, goals, tasks, reminders] = await Promise.all([
        base44.asServiceRole.entities.Appointments.filter({ client_id: client.id }, '-appointment_date', 50),
        base44.asServiceRole.entities.AccountabilityGoals.filter({ client_id: client.id }, '-created_date', 50),
        base44.asServiceRole.entities.CounselorTasks.filter({ client_id: client.id }, '-created_date', 50),
        base44.asServiceRole.entities.Reminders.filter({ client_id: client.id, status: 'active' }, '-reminder_date', 50),
      ]);

      const email = buildEmail({ client, assignment, appointments, goals, tasks, reminders });
      if (!dryRun) await sendGmail(accessToken, email);
      results.push({ client: assignment.client_email, counselor: assignment.assigned_staff_email, sent: !dryRun });
    }

    return Response.json({ success: true, dryRun, processed: results.length, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});