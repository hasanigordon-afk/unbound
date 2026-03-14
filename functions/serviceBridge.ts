/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║           UNBOUND SERVICE BRIDGE v1.0                        ║
 * ║  Central routing layer for all external service integrations  ║
 * ║  Modules: EHR · Telehealth · Compliance · Billing ·          ║
 * ║           Employment · Housing · Benefits                     ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { module, action, payload = {} } = body;

    if (!module || !action) {
      return Response.json({ error: 'Both "module" and "action" fields are required.' }, { status: 400 });
    }

    const handlers = {
      ehr:        (a, p) => handleEHR(a, p, base44, user),
      telehealth: (a, p) => handleTelehealth(a, p, base44, user),
      compliance: (a, p) => handleCompliance(a, p, base44, user),
      billing:    (a, p) => handleBilling(a, p, base44, user),
      employment: (a, p) => handleEmployment(a, p, base44, user),
      housing:    (a, p) => handleHousing(a, p, base44, user),
      benefits:   (a, p) => handleBenefits(a, p, base44, user),
    };

    const handler = handlers[module];
    if (!handler) {
      return Response.json({
        error: `Unknown module "${module}". Available modules: ${Object.keys(handlers).join(', ')}`,
      }, { status: 400 });
    }

    const result = await handler(action, payload);

    // ── Audit log (best-effort, non-blocking) ─────────────────
    base44.asServiceRole.entities.AuditLog.create({
      action: `bridge:${module}:${action}`,
      user_email: user.email,
      resource_type: module,
      status: 'success',
      details: JSON.stringify({ keys: Object.keys(payload) }),
    }).catch(() => {});

    return Response.json({ success: true, module, action, data: result });

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
});

// ════════════════════════════════════════════════════════════════
// MODULE 1 — EHR (Electronic Health Record)
// ════════════════════════════════════════════════════════════════
async function handleEHR(action, payload, base44, user) {
  const sa = base44.asServiceRole;

  switch (action) {
    case 'import_discharge_plan':
    case 'import_medication_reminder':
    case 'import_therapy_schedule':
    case 'import_counselor_contact':
    case 'import_progress_report': {
      const typeMap = {
        import_discharge_plan:    'discharge_plan',
        import_medication_reminder: 'medication_reminder',
        import_therapy_schedule:  'therapy_schedule',
        import_counselor_contact: 'counselor_contact',
        import_progress_report:   'progress_report',
      };
      return sa.entities.EHRRecord.create({
        participant_email: payload.participant_email,
        facility_id:       payload.facility_id,
        record_type:       typeMap[action],
        title:             payload.title || action.replace('import_', '').replace(/_/g, ' '),
        content:           payload.content,
        source_system:     payload.source_system || 'manual',
        import_date:       new Date().toISOString().split('T')[0],
        provider_name:     payload.provider_name || user.full_name,
        next_review_date:  payload.next_review_date,
        is_active:         true,
        access_level:      payload.access_level || 'counselor_only',
      });
    }
    case 'list_records':
      return sa.entities.EHRRecord.filter({ participant_email: payload.participant_email });
    case 'sync_progress_report':
      return { queued: true, participant: payload.participant_email, timestamp: new Date().toISOString() };
    default:
      throw new Error(`EHR: unknown action "${action}"`);
  }
}

// ════════════════════════════════════════════════════════════════
// MODULE 2 — Telehealth
// ════════════════════════════════════════════════════════════════
async function handleTelehealth(action, payload, base44, user) {
  const sa = base44.asServiceRole;

  switch (action) {
    case 'schedule_session': {
      const sessionCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      return sa.entities.TelehealthSession.create({
        participant_email: payload.participant_email || user.email,
        provider_email:    payload.provider_email,
        provider_name:     payload.provider_name,
        session_type:      payload.session_type,
        status:            'scheduled',
        scheduled_date:    payload.scheduled_date,
        scheduled_time:    payload.scheduled_time,
        duration_minutes:  payload.duration_minutes || 50,
        meeting_url:       `https://meet.unbound.app/s/${sessionCode}`,
        meeting_id:        sessionCode,
        facility_id:       payload.facility_id,
        notes:             payload.notes,
        billing_code:      payload.billing_code || '90834',
      });
    }
    case 'list_sessions':
      return sa.entities.TelehealthSession.filter({ participant_email: payload.email || user.email });
    case 'list_upcoming': {
      const today = new Date().toISOString().split('T')[0];
      const all = await sa.entities.TelehealthSession.filter({ participant_email: payload.email || user.email });
      return all.filter(s => s.scheduled_date >= today && s.status !== 'cancelled');
    }
    case 'cancel_session':
      return sa.entities.TelehealthSession.update(payload.session_id, { status: 'cancelled' });
    case 'complete_session':
      return sa.entities.TelehealthSession.update(payload.session_id, {
        status: 'completed',
        session_notes: payload.session_notes,
      });
    case 'list_provider_sessions':
      return sa.entities.TelehealthSession.filter({ provider_email: user.email });
    default:
      throw new Error(`Telehealth: unknown action "${action}"`);
  }
}

// ════════════════════════════════════════════════════════════════
// MODULE 3 — Justice Compliance
// ════════════════════════════════════════════════════════════════
async function handleCompliance(action, payload, base44, user) {
  const sa = base44.asServiceRole;

  switch (action) {
    case 'generate_weekly_report': {
      const email  = payload.participant_email;
      const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 7);
      const all    = await sa.entities.DailyCheckIn.filter({ participant_email: email });
      const recent = all.filter(c => new Date(c.check_in_date) >= cutoff);

      const meetings = recent.filter(c => c.attended_meeting).length;
      const sponsors = recent.filter(c => c.connected_with_sponsor).length;
      const relapseFlags = recent.filter(c => c.relapse_risk_flag).length;
      const avgCraving = recent.length
        ? (recent.reduce((s, c) => s + (c.craving_intensity || 0), 0) / recent.length) : 0;
      const avgMood = recent.length
        ? (recent.reduce((s, c) => s + (c.mood_rating || 0), 0) / recent.length) : 0;
      const compliance = Math.round((recent.length / 7) * 100);

      const riskScore = Math.max(0, 100
        - (recent.length / 7) * 30
        - (meetings / 7) * 20
        - (sponsors / 7) * 20
        + avgCraving * 3
        + relapseFlags * 10);

      return sa.entities.ComplianceReport.create({
        participant_email:     email,
        report_period_start:   cutoff.toISOString().split('T')[0],
        report_period_end:     new Date().toISOString().split('T')[0],
        checkin_count:         recent.length,
        meeting_count:         meetings,
        sponsor_contact_count: sponsors,
        avg_craving_level:     parseFloat(avgCraving.toFixed(1)),
        avg_mood_rating:       parseFloat(avgMood.toFixed(1)),
        compliance_percentage: compliance,
        risk_score:            parseFloat(riskScore.toFixed(1)),
        relapse_alert_count:   relapseFlags,
        generated_by:          user.email,
        status:                'generated',
        facility_id:           payload.facility_id,
      });
    }
    case 'list_reports':
      return sa.entities.ComplianceReport.filter({ participant_email: payload.participant_email });
    case 'list_facility_reports':
      return sa.entities.ComplianceReport.filter({ facility_id: payload.facility_id });
    default:
      throw new Error(`Compliance: unknown action "${action}"`);
  }
}

// ════════════════════════════════════════════════════════════════
// MODULE 4 — Insurance Billing
// ════════════════════════════════════════════════════════════════
async function handleBilling(action, payload, base44, user) {
  const sa = base44.asServiceRole;

  switch (action) {
    case 'create_record':
      return sa.entities.BillingRecord.create({
        facility_id:       payload.facility_id,
        participant_email: payload.participant_email,
        provider_email:    payload.provider_email || user.email,
        service_type:      payload.service_type,
        service_date:      payload.service_date || new Date().toISOString().split('T')[0],
        duration_minutes:  payload.duration_minutes,
        billing_code:      payload.billing_code,
        amount_billed:     payload.amount_billed,
        insurance_provider: payload.insurance_provider,
        member_id:         payload.member_id,
        claim_status:      'pending',
        session_id:        payload.session_id,
        notes:             payload.notes,
      });
    case 'list_records':
      return sa.entities.BillingRecord.filter({ facility_id: payload.facility_id });
    case 'update_claim_status':
      return sa.entities.BillingRecord.update(payload.record_id, { claim_status: payload.status });
    case 'get_summary': {
      const records = await sa.entities.BillingRecord.filter({ facility_id: payload.facility_id });
      const total = records.reduce((s, r) => s + (r.amount_billed || 0), 0);
      const byStatus = records.reduce((acc, r) => {
        acc[r.claim_status] = (acc[r.claim_status] || 0) + 1;
        return acc;
      }, {});
      return { total_billed: total, record_count: records.length, by_status: byStatus };
    }
    default:
      throw new Error(`Billing: unknown action "${action}"`);
  }
}

// ════════════════════════════════════════════════════════════════
// MODULE 5 — Employment Reintegration
// ════════════════════════════════════════════════════════════════
async function handleEmployment(action, payload, base44, user) {
  const sa = base44.asServiceRole;

  switch (action) {
    case 'list_listings':
      return sa.entities.EmploymentListing.filter({ is_active: true });
    case 'list_second_chance':
      return sa.entities.EmploymentListing.filter({ is_active: true, second_chance_employer: true });
    case 'save_job':
      return base44.entities.SavedResource.create({
        resource_id:       payload.job_id,
        resource_name:     payload.job_title,
        resource_category: 'Employment Assistance',
      });
    default:
      throw new Error(`Employment: unknown action "${action}"`);
  }
}

// ════════════════════════════════════════════════════════════════
// MODULE 6 — Housing Resources
// ════════════════════════════════════════════════════════════════
async function handleHousing(action, payload, base44, user) {
  const sa = base44.asServiceRole;
  switch (action) {
    case 'list_all':
      return sa.entities.USRecoveryResource.list('-created_date', 100);
    case 'list_by_type':
      return sa.entities.USRecoveryResource.filter({ resource_category: payload.category });
    case 'list_emergency':
      return sa.entities.USRecoveryResource.filter({ resource_category: 'Emergency Shelter' });
    default:
      throw new Error(`Housing: unknown action "${action}"`);
  }
}

// ════════════════════════════════════════════════════════════════
// MODULE 7 — Government Benefits
// ════════════════════════════════════════════════════════════════
async function handleBenefits(action, payload, base44, user) {
  const sa = base44.asServiceRole;
  switch (action) {
    case 'list_programs':
      return sa.entities.BenefitsProgram.list();
    case 'list_by_type':
      return sa.entities.BenefitsProgram.filter({ program_type: payload.program_type });
    case 'list_by_state':
      return sa.entities.BenefitsProgram.filter({ state: payload.state });
    default:
      throw new Error(`Benefits: unknown action "${action}"`);
  }
}