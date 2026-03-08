/**
 * Scheduled function: runs once per week to email all active family contacts.
 * Sends a family-friendly (non-clinical) summary for each participant.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Allow both scheduled (no user) and manual admin trigger
    const isAuthenticated = await base44.auth.isAuthenticated();
    if (isAuthenticated) {
      const user = await base44.auth.me();
      if (user?.role !== 'admin') {
        return Response.json({ error: 'Admin only' }, { status: 403 });
      }
    }

    const allContacts = await base44.asServiceRole.entities.FamilyContact.filter({
      is_active: true,
      weekly_summary_enabled: true,
    });

    const today = new Date().toISOString().split('T')[0];
    const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - 7);
    const weekLabel = `${fmtDate(weekStart)} – ${fmtDate(new Date())}`;

    const results = [];

    for (const contact of allContacts) {
      // Skip if already sent this week
      if (contact.last_summary_sent === today) continue;

      const participantEmail = contact.participant_email;

      // Fetch participant profile + check-ins
      const [profiles, checkIns] = await Promise.all([
        base44.asServiceRole.entities.ParticipantProfile.filter({ participant_email: participantEmail }),
        base44.asServiceRole.entities.DailyCheckIn.filter({ participant_email: participantEmail }, '-check_in_date', 14),
      ]);

      const profile = profiles[0];
      const last7 = checkIns.filter((c) => new Date(c.check_in_date) >= weekStart);
      const checkInRate = Math.round((last7.length / 7) * 100);
      const meetingsThisWeek = last7.filter((c) => c.attended_meeting).length;
      const sponsorContacts = last7.filter((c) => c.connected_with_sponsor).length;
      const sobrietyDays = profile?.sobriety_start_date
        ? Math.floor((new Date() - new Date(profile.sobriety_start_date)) / 86400000)
        : null;
      const firstName = participantEmail.split('@')[0];

      // Streak
      let streak = 0;
      const sorted = [...checkIns].sort((a, b) => new Date(b.check_in_date) - new Date(a.check_in_date));
      let cur = new Date();
      for (const c of sorted) {
        const d = new Date(c.check_in_date);
        const diff = Math.floor((cur - d) / 86400000);
        if (diff <= 1) { streak++; cur = d; } else break;
      }

      const engagementLabel =
        checkInRate >= 80 ? 'Staying Engaged ✅' :
        checkInRate >= 50 ? 'Moderate Activity 🟡' :
        'Low Activity This Week 🔴';

      // Family view link
      const viewUrl = contact.access_token && contact.can_view_dashboard
        ? `${Deno.env.get('BASE44_APP_URL') || 'https://app.base44.com'}/FamilyView?token=${contact.access_token}`
        : null;

      const emailBody = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; color: #1e1e1e;">
  <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 28px 32px; border-radius: 12px 12px 0 0;">
    <p style="color: rgba(255,255,255,0.75); font-size: 11px; margin: 0 0 6px; text-transform: uppercase; letter-spacing: 1px;">Unbound · Family Support</p>
    <h1 style="color: #fff; margin: 0; font-size: 22px; font-weight: 700;">${firstName}'s Weekly Update</h1>
    <p style="color: rgba(255,255,255,0.8); margin: 6px 0 0; font-size: 13px;">${weekLabel}</p>
  </div>

  <div style="background: #fff; padding: 28px 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    <p style="font-size: 15px; margin-top: 0;">Hi ${contact.contact_name},</p>
    <p style="font-size: 14px; color: #374151; line-height: 1.6;">
      ${firstName} has given you access to receive their weekly engagement update.
      Here's a summary of their activity this week — this view shows <strong>engagement activity only</strong>, not clinical data.
    </p>

    ${sobrietyDays !== null ? `
    <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0;">
      <p style="color: rgba(255,255,255,0.8); font-size: 12px; margin: 0 0 4px;">⭐ Sobriety Milestone</p>
      <p style="color: #fff; font-size: 36px; font-weight: 800; margin: 0;">${sobrietyDays} days</p>
      <p style="color: rgba(255,255,255,0.8); font-size: 12px; margin: 4px 0 0;">Every day counts — celebrate this! 🎉</p>
    </div>` : ''}

    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb;">
      <tr style="background: #f5f3ff;">
        <td style="padding: 12px 16px; font-weight: 600; color: #374151;">Engagement Status</td>
        <td style="padding: 12px 16px; font-weight: 700; color: #6366f1;">${engagementLabel}</td>
      </tr>
      <tr>
        <td style="padding: 12px 16px; font-weight: 600; color: #374151;">Check-In Rate</td>
        <td style="padding: 12px 16px; color: #374151;">${checkInRate}% (${last7.length} of 7 days)</td>
      </tr>
      <tr style="background: #fafafa;">
        <td style="padding: 12px 16px; font-weight: 600; color: #374151;">Check-In Streak</td>
        <td style="padding: 12px 16px; color: #374151;">${streak} consecutive days</td>
      </tr>
      <tr>
        <td style="padding: 12px 16px; font-weight: 600; color: #374151;">Meetings Attended</td>
        <td style="padding: 12px 16px; color: #374151;">${meetingsThisWeek} this week</td>
      </tr>
      <tr style="background: #fafafa;">
        <td style="padding: 12px 16px; font-weight: 600; color: #374151;">Support Contacts</td>
        <td style="padding: 12px 16px; color: #374151;">${sponsorContacts} sponsor/peer contacts</td>
      </tr>
    </table>

    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 20px 0;">
      <p style="font-weight: 600; color: #15803d; margin: 0 0 8px; font-size: 13px;">💚 Ways to support ${firstName} this week:</p>
      <ul style="margin: 0; padding-left: 18px; color: #374151; font-size: 13px; line-height: 2;">
        <li>Send a text or call to let them know you're proud of them</li>
        <li>Offer to spend time together — even a short walk helps</li>
        <li>Celebrate their sobriety milestone if you get the chance</li>
      </ul>
    </div>

    ${viewUrl ? `
    <div style="text-align: center; margin: 24px 0;">
      <a href="${viewUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px;">
        View ${firstName}'s Dashboard →
      </a>
      <p style="color: #9ca3af; font-size: 11px; margin: 8px 0 0;">Link is private and unique to you.</p>
    </div>` : ''}

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
    <p style="font-size: 11px; color: #9ca3af; margin: 0;">
      You're receiving this because ${firstName} designated you as a family support contact in Unbound.
      To stop receiving these emails, ask ${firstName} to remove your contact in their app settings.
      This summary contains engagement activity only — no clinical or medical information is shared.
    </p>
  </div>
</div>`.trim();

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: contact.contact_email,
        from_name: `${firstName} via Unbound`,
        subject: `${firstName}'s Weekly Progress Update · ${weekLabel}`,
        body: emailBody,
      });

      // Mark as sent
      await base44.asServiceRole.entities.FamilyContact.update(contact.id, {
        last_summary_sent: today,
      });

      results.push({ contact: contact.contact_email, participant: participantEmail, sent: true });
    }

    return Response.json({ success: true, sent: results.length, results });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});