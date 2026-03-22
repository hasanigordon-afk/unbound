/**
 * UNBOUND Discharge Activation Workflow
 * 
 * Triggered when a participant's discharge_date is set (today or past 2 days).
 * - Creates onboarding notification sequence
 * - Notifies assigned counselor
 * - Creates first-week action plan notifications
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

function today() {
  return new Date().toISOString().split('T')[0];
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const isAuth = await base44.auth.isAuthenticated();
    if (isAuth) {
      const user = await base44.auth.me();
      if (user?.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const config = await base44.asServiceRole.entities.AutomationConfig.filter({ automation_key: 'discharge_activation' });
    if (config[0]?.is_enabled === false) {
      return Response.json({ skipped: true, reason: 'automation_disabled' });
    }

    const todayStr = today();
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const twoDaysAgoStr = twoDaysAgo.toISOString().split('T')[0];

    const profiles = await base44.asServiceRole.entities.ParticipantProfile.list();
    const recentDischarges = profiles.filter(p =>
      p.discharge_date &&
      p.discharge_date >= twoDaysAgoStr &&
      p.discharge_date <= todayStr
    );

    let activated = 0;

    for (const profile of recentDischarges) {
      const email = profile.participant_email;

      // Deduplicate: check if already activated
      const existing = await base44.asServiceRole.entities.AutomationLog.filter({
        automation_key: 'discharge_activation',
      });
      const alreadyRan = existing.some(l => l.summary?.activated_email === email);
      if (alreadyRan) continue;

      // Welcome notification
      await base44.asServiceRole.entities.InAppNotification.create({
        recipient_email: email,
        type: 'discharge_activation',
        title: "Welcome to your next chapter 🌅",
        body: "Your discharge plan is ready. Let's set up your first week — your support team is with you every step.",
        action_url: '/ForwardPlan',
        action_label: 'Start My Plan',
        priority: 'high',
        is_read: false,
        dismissed: false,
        automation_key: 'discharge_activation',
        expires_at: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      });

      // First check-in nudge
      await base44.asServiceRole.entities.InAppNotification.create({
        recipient_email: email,
        type: 'checkin_reminder',
        title: "Complete your first check-in today",
        body: "Your first check-in helps us understand how you're doing and connect you with the right support.",
        action_url: '/DailyCheckIn',
        action_label: 'Check In Now',
        priority: 'high',
        is_read: false,
        dismissed: false,
        automation_key: 'discharge_activation',
        expires_at: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      });

      // Appointments reminder
      await base44.asServiceRole.entities.InAppNotification.create({
        recipient_email: email,
        type: 'appointment_reminder',
        title: "Review your upcoming appointments",
        body: "Check your aftercare schedule — therapy, meetings, and follow-up appointments are ready for you.",
        action_url: '/TelehealthHub',
        action_label: 'View Schedule',
        priority: 'medium',
        is_read: false,
        dismissed: false,
        automation_key: 'discharge_activation',
        expires_at: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      });

      // Resource recommendation
      await base44.asServiceRole.entities.InAppNotification.create({
        recipient_email: email,
        type: 'resource_recommendation',
        title: "Find support resources near you",
        body: "Housing, food, employment, and recovery meetings in your area are just a tap away.",
        action_url: '/FindHelpNow',
        action_label: 'Find Resources',
        priority: 'medium',
        is_read: false,
        dismissed: false,
        automation_key: 'discharge_activation',
        expires_at: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      });

      // Notify counselor
      if (profile.assigned_counselor_email) {
        await base44.asServiceRole.entities.InAppNotification.create({
          recipient_email: profile.assigned_counselor_email,
          type: 'general',
          title: `Discharge activated: ${email.split('@')[0]}`,
          body: `${email} was discharged on ${profile.discharge_date}. Onboarding sequence has started. Review their plan.`,
          action_url: `/PatientSummaryDashboard?email=${encodeURIComponent(email)}`,
          action_label: 'Review Client',
          priority: 'high',
          is_read: false,
          dismissed: false,
          automation_key: 'discharge_activation',
          expires_at: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
        });

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: profile.assigned_counselor_email,
          subject: `Discharge activated: ${email}`,
          body: `
<div style="font-family:-apple-system,sans-serif;max-width:560px;margin:0 auto;color:#1E1E1E;">
  <div style="background:#0E1D3A;padding:20px 24px;border-radius:8px 8px 0 0;">
    <p style="color:#3ECFBF;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;margin:0 0 4px;">Unbound Platform</p>
    <p style="color:#fff;font-size:18px;font-weight:800;margin:0;">Discharge Notification</p>
  </div>
  <div style="background:#fff;border:1px solid #E5E7EB;border-top:none;padding:24px;border-radius:0 0 8px 8px;">
    <p style="font-size:15px;color:#374151;"><strong>${email}</strong> was discharged on <strong>${profile.discharge_date}</strong>.</p>
    <p style="font-size:14px;color:#6B7280;">The onboarding sequence has been automatically activated. Please review their forward plan and confirm appointments.</p>
    <p style="font-size:12px;color:#8E8E93;margin-top:20px;">Log in to Unbound to review this participant.</p>
  </div>
</div>`,
        });
      }

      // Log individually
      await base44.asServiceRole.entities.AutomationLog.create({
        automation_key: 'discharge_activation',
        run_date: todayStr,
        status: 'success',
        participants_processed: 1,
        notifications_sent: 4,
        alerts_created: 0,
        summary: { activated_email: email, discharge_date: profile.discharge_date },
      });

      activated++;
    }

    return Response.json({ success: true, discharges_activated: activated });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});