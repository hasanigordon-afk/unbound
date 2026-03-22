/**
 * UNBOUND Community Moderation Scan
 * 
 * Scans recent community posts for:
 * - Crisis/harm language → flag + staff alert
 * - Reported posts → queue for review
 * 
 * Runs every few hours. Does NOT expose private journal content.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

const CRISIS_KEYWORDS = [
  'kill myself', 'want to die', 'end it all', 'suicide', 'overdose on purpose',
  'hurt myself', 'self harm', 'relapsed', 'using again', 'no reason to live',
  'give up on life', 'cant go on', "can't go on",
];

function containsCrisisLanguage(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  return CRISIS_KEYWORDS.some(kw => lower.includes(kw));
}

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

    const config = await base44.asServiceRole.entities.AutomationConfig.filter({ automation_key: 'community_moderation' });
    if (config[0]?.is_enabled === false) {
      return Response.json({ skipped: true, reason: 'automation_disabled' });
    }

    // Get recent posts (last 24h) that are approved or pending
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const recentPosts = await base44.asServiceRole.entities.CommunityPost.list('-created_date', 200);
    const fresh = recentPosts.filter(p =>
      p.created_date >= oneDayAgo && p.moderation_status !== 'flagged'
    );

    // Get reports
    const reports = await base44.asServiceRole.entities.ContentReport
      ? await base44.asServiceRole.entities.ContentReport.filter({ status: 'pending' })
      : [];

    let flagged = 0, queued = 0;

    // Crisis language scan
    for (const post of fresh) {
      const hasCrisis = containsCrisisLanguage(post.content) || containsCrisisLanguage(post.title);
      if (!hasCrisis) continue;

      // Flag the post
      await base44.asServiceRole.entities.CommunityPost.update(post.id, {
        moderation_status: 'flagged',
        moderation_reason: 'Automated: potential crisis language detected',
      });

      // Create staff alert (no PII in the alert itself)
      const dedup_key = `moderation:${post.id}`;
      const existing = await base44.asServiceRole.entities.StaffAlertQueue.filter({ dedup_key });
      if (existing.length === 0) {
        await base44.asServiceRole.entities.StaffAlertQueue.create({
          participant_email: post.created_by || 'unknown',
          alert_type: 'moderation_flag',
          priority: 'urgent',
          status: 'new',
          summary: 'Crisis language detected in a community post. Requires immediate moderator review.',
          contributing_factors: ['automated_crisis_keyword_detection'],
          automation_key: 'community_moderation',
          dedup_key,
        });
      }

      // In-app notification to the author with crisis resources
      if (post.created_by) {
        const existing2 = await base44.asServiceRole.entities.InAppNotification.filter({
          recipient_email: post.created_by,
          type: 'general',
          related_entity_id: post.id,
        });
        if (existing2.length === 0) {
          await base44.asServiceRole.entities.InAppNotification.create({
            recipient_email: post.created_by,
            type: 'general',
            title: "We noticed your post — are you okay? 💙",
            body: "If you're struggling right now, please reach out. Call 988 or text HOME to 741741. You are not alone.",
            action_url: '/UrgentHelp',
            action_label: 'Get Support Now',
            priority: 'urgent',
            is_read: false,
            dismissed: false,
            automation_key: 'community_moderation',
            related_entity_id: post.id,
          });
        }
      }
      flagged++;
    }

    // Queue reported posts
    for (const report of reports) {
      if (!report.content_id) continue;
      const dedup_key = `report:${report.content_id}`;
      const existing = await base44.asServiceRole.entities.StaffAlertQueue.filter({ dedup_key });
      if (existing.length === 0) {
        await base44.asServiceRole.entities.StaffAlertQueue.create({
          participant_email: 'system',
          alert_type: 'moderation_flag',
          priority: 'medium',
          status: 'new',
          summary: `Community content has been reported and needs moderator review.`,
          contributing_factors: [`report_reason: ${report.reason || 'not specified'}`],
          automation_key: 'community_moderation',
          dedup_key,
        });
      }
      queued++;
    }

    await base44.asServiceRole.entities.AutomationLog.create({
      automation_key: 'community_moderation',
      run_date: today(),
      status: 'success',
      participants_processed: fresh.length,
      notifications_sent: flagged,
      alerts_created: flagged + queued,
      summary: { posts_scanned: fresh.length, crisis_flagged: flagged, reports_queued: queued },
    });

    return Response.json({ success: true, posts_scanned: fresh.length, crisis_flagged: flagged, reports_queued: queued });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});