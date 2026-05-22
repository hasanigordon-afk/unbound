import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const disclaimer = 'This plan is a support and organization tool. It does not replace professional medical, clinical, legal, or emergency guidance.';

function today() {
  return new Date().toISOString().split('T')[0];
}

function nextDateForDay(dayName) {
  const days = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
  const target = days[String(dayName).toLowerCase()];
  const date = new Date();
  const diff = (target + 7 - date.getDay()) % 7 || 7;
  date.setDate(date.getDate() + diff);
  return date.toISOString().split('T')[0];
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

function addRisk(risks, type, severity, description, suggested_action) {
  risks.push({ risk_type: type, severity, description, suggested_action, counselor_reviewed: false });
}

function extract(rawText) {
  const text = String(rawText || '');
  const lower = text.toLowerCase();
  const nameMatch = text.match(/(?:client|name|patient)\s*(?:is|:)?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
  const ageMatch = text.match(/(?:age|aged)\s*(\d{2})|\b(\d{2})\s*(?:yo|years old)\b/i);
  const phoneMatch = text.match(/(?:phone|cell)\s*(?:is|:)?\s*([+()\-\d\s]{10,})/i);
  const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  const dischargeMention = lower.includes('friday') ? nextDateForDay('friday') : lower.includes('monday') && lower.includes('discharge') ? nextDateForDay('monday') : '';
  const substance = lower.includes('opioid') || lower.includes('mat') ? 'opioids' : lower.includes('alcohol') ? 'alcohol' : lower.includes('stimulant') ? 'stimulants' : lower.includes('mental health') ? 'mental health support' : 'general life stability';

  const basics = {
    full_name: nameMatch?.[1] || '',
    age: Number(ageMatch?.[1] || ageMatch?.[2] || 0) || '',
    phone: phoneMatch?.[1]?.trim() || '',
    email: emailMatch?.[0] || '',
    discharge_date: dischargeMention,
    emergency_contact_name: lower.includes('emergency contact') ? 'Listed in notes' : '',
    facility_name: '',
    primary_recovery_category: substance,
    substance_type: substance,
    housing_status: lower.includes('sober living') ? 'sober living' : lower.includes('shelter') ? 'shelter' : lower.includes('housing') ? 'needs housing support' : '',
    transportation_status: lower.includes('bus') ? 'bus transportation' : lower.includes('ride') ? 'ride support' : '',
    employment_status: lower.includes('job') || lower.includes('employment') ? 'needs employment support' : '',
    legal_status: lower.includes('probation') ? 'probation' : lower.includes('court') ? 'court requirements' : '',
    veteran_status: lower.includes('veteran') ? 'veteran' : '',
  };

  const appointments = [];
  if (lower.includes('iop')) appointments.push({ event_title: 'IOP Session', title: 'IOP Session', event_type: 'treatment', date: nextDateForDay('monday'), start_time: lower.includes('1pm') || lower.includes('1 pm') ? '1:00 PM' : '', recurrence: lower.includes('monday wednesday friday') || lower.includes('monday, wednesday, friday') ? 'weekly Mon/Wed/Fri' : 'weekly', location: '', notes: 'Required treatment appointment', transportation_needed: lower.includes('bus') || lower.includes('transport') });
  if (lower.includes('therapy')) appointments.push({ event_title: 'Outpatient Therapy', title: 'Outpatient Therapy', event_type: 'therapy', date: nextDateForDay('wednesday'), start_time: '', recurrence: 'weekly', location: '', notes: 'Therapy appointment', transportation_needed: lower.includes('transport') });
  if (lower.includes('doctor') || lower.includes('mat') || lower.includes('medication')) appointments.push({ event_title: 'Health / MAT Follow-Up', title: 'Health / MAT Follow-Up', event_type: 'health', date: nextDateForDay('thursday'), start_time: '', recurrence: 'as scheduled', location: '', notes: 'Health follow-up; no medical advice provided', transportation_needed: lower.includes('transport') });
  if (lower.includes('probation')) appointments.push({ event_title: 'Probation Check-In', title: 'Probation Check-In', event_type: 'legal', date: nextDateForDay('wednesday'), start_time: '', recurrence: lower.includes('second wednesday') ? 'every second Wednesday' : 'recurring', location: '', notes: 'Legal compliance appointment', transportation_needed: lower.includes('transport') || lower.includes('bus') });

  const support = [];
  if (lower.includes('na')) support.push({ support_type: 'NA', name: 'NA Meeting', schedule: lower.includes('tuesday') && lower.includes('thursday') ? 'Tuesday and Thursday evenings' : 'Weekly', location: '', notes: 'Recovery meeting support', status: 'active' });
  if (lower.includes('aa')) support.push({ support_type: 'AA', name: 'AA Meeting', schedule: 'Weekly', location: '', notes: 'Recovery meeting support', status: 'active' });
  if (lower.includes('smart')) support.push({ support_type: 'SMART Recovery', name: 'SMART Recovery', schedule: 'Weekly', location: '', notes: 'Recovery meeting support', status: 'active' });
  if (lower.includes('sponsor')) support.push({ support_type: 'Sponsor', name: 'Sponsor Call', schedule: lower.includes('3x') ? '3x per week' : 'Weekly', notes: 'Sponsor accountability call', status: 'active' });
  if (lower.includes('counselor')) support.push({ support_type: 'Counselor', name: 'Counselor Check-In', schedule: 'Weekly', notes: 'Counselor follow-up', status: 'active' });

  const legal = [];
  if (lower.includes('probation')) legal.push({ requirement_type: 'probation', title: 'Probation Check-In', appointment_date: nextDateForDay('wednesday'), notes: 'Recurring probation requirement', reminder_enabled: true, status: 'active' });
  if (lower.includes('court')) legal.push({ requirement_type: 'court', title: 'Court Requirement', due_date: '', notes: 'Court date needs confirmation', reminder_enabled: true, status: 'active' });
  if (lower.includes('drug test')) legal.push({ requirement_type: 'drug_testing', title: 'Drug Testing Requirement', due_date: '', notes: 'Testing schedule needs confirmation', reminder_enabled: true, status: 'active' });

  const transportation = [];
  if (lower.includes('bus') || lower.includes('transport') || lower.includes('ride')) transportation.push({ pickup_location: 'Client residence', destination: 'Required appointments', requested_date: today(), requested_time: '', transportation_type: lower.includes('bus') ? 'bus route' : 'ride support', status: 'requested', notes: 'Confirm route and leave-time reminders' });

  const health = [];
  if (lower.includes('medication')) health.push({ reminder_title: 'Medication Reminder', reminder_type: 'health', message: 'Medication reminder as directed by provider.', scheduled_time: 'Morning', recurrence: 'daily', delivery_method: 'in_app', active: true });
  if (lower.includes('daily check')) health.push({ reminder_title: 'Daily Check-In', reminder_type: 'check_in', message: 'Complete today’s recovery check-in.', scheduled_time: '8:00 PM', recurrence: 'daily', delivery_method: 'in_app', active: true });

  const goals = [
    { task_title: 'Daily recovery check-in', task_category: 'check_in', description: 'Complete a short daily check-in.', recurrence: 'daily', priority: 'high' },
    { task_title: 'Build weekly recovery routine', task_category: 'structure', description: 'Follow appointments, support meetings, and accountability steps.', recurrence: 'weekly', priority: 'medium' },
  ];
  if (lower.includes('job')) goals.push({ task_title: 'Job search action', task_category: 'employment', description: 'Resume, applications, staffing agency, or interview follow-up.', recurrence: 'weekly', priority: 'medium' });
  if (lower.includes('housing')) goals.push({ task_title: 'Housing stability step', task_category: 'housing', description: 'Confirm housing plan, sober living, shelter, or family home.', recurrence: 'weekly', priority: 'high' });

  const missing = [];
  if (!basics.discharge_date) missing.push('No discharge date provided');
  if (!basics.emergency_contact_name) missing.push('No emergency contact listed');
  if (!basics.transportation_status && appointments.some((a) => a.transportation_needed)) missing.push('No transportation plan');
  if (!support.length) missing.push('No recovery meetings scheduled');
  if (legal.length && legal.some((item) => !item.due_date && !item.appointment_date)) missing.push('No legal requirement dates');
  if (!basics.housing_status) missing.push('No housing status');
  if (!support.some((item) => item.support_type === 'Counselor')) missing.push('No counselor follow-up date');

  const risks = [];
  if (!basics.housing_status) addRisk(risks, 'Housing gap', 'High', 'Housing status is not documented.', 'Confirm safe housing before discharge.');
  if (!basics.emergency_contact_name) addRisk(risks, 'Emergency contact missing', 'Moderate', 'No emergency contact is listed.', 'Add emergency contact or counselor override.');
  if (!transportation.length && appointments.length) addRisk(risks, 'Transportation gap', 'Moderate', 'Required appointments exist without a transportation plan.', 'Create transportation support task.');
  if (legal.length && missing.includes('No legal requirement dates')) addRisk(risks, 'Legal schedule incomplete', 'High', 'Legal obligations are mentioned without confirmed dates.', 'Confirm schedule and create high-priority reminders.');
  if (!support.length) addRisk(risks, 'Support schedule missing', 'Moderate', 'No recovery support meetings were found.', 'Add AA, NA, SMART, sponsor, or peer support plan.');
  if (/(trigger|craving|unsafe|lonely|stress|money)/i.test(text)) addRisk(risks, 'Trigger profile', 'High', 'High-risk trigger language was mentioned.', 'Review triggers and coping plan with client.');

  const confidence = Math.max(45, Math.min(95, 92 - missing.length * 7));
  return {
    extracted_client_basics: basics,
    extracted_appointments: appointments,
    extracted_recovery_support: support,
    extracted_legal_requirements: legal,
    extracted_transportation_needs: transportation,
    extracted_housing_needs: basics.housing_status ? [{ title: 'Housing Stability', description: basics.housing_status }] : [],
    extracted_employment_needs: lower.includes('job') ? [{ title: 'Employment Support', description: 'Job search help requested' }] : [],
    extracted_health_needs: health,
    extracted_risk_factors: risks,
    extracted_goals: goals,
    missing_information: missing,
    suggested_next_steps: unique(['Confirm missing critical details', 'Review risk flags', 'Approve plan sections', 'Execute after counselor approval']),
    confidence_score: confidence,
  };
}

function engineer(extraction) {
  const b = extraction.extracted_client_basics || {};
  const goals = extraction.extracted_goals || [];
  return {
    plan_title: `${b.full_name || 'Client'} S.E.E. Aftercare Plan`,
    recovery_category: b.primary_recovery_category || 'general life stability',
    summary: `Structured aftercare plan for ${b.full_name || 'client'} covering appointments, recovery support, daily routine, legal needs, transportation, risk flags, and 30/60/90 day goals.`,
    clinical_disclaimer: disclaimer,
    client_visible_summary: 'Your plan organizes your appointments, reminders, support meetings, daily check-ins, goals, transportation needs, and emergency support steps.',
    weekly_itinerary: extraction.extracted_appointments || [],
    daily_routine: goals,
    required_appointments: extraction.extracted_appointments || [],
    recovery_support_schedule: extraction.extracted_recovery_support || [],
    legal_schedule: extraction.extracted_legal_requirements || [],
    transportation_plan: extraction.extracted_transportation_needs || [],
    housing_stability_plan: extraction.extracted_housing_needs || [],
    employment_education_plan: extraction.extracted_employment_needs || [],
    wellness_plan: extraction.extracted_health_needs || [],
    emergency_plan: {
      crisis_contacts: b.emergency_contact_name ? [{ name: b.emergency_contact_name, phone: b.emergency_contact_phone || '' }] : [],
      relapse_warning_signs: ['Cravings', 'Isolation', 'Unsafe people or places', 'High stress'],
      coping_steps: ['Call support person', 'Attend a meeting', 'Use grounding or breathing exercise', 'Go to a safe place'],
      safe_places: ['Recovery meeting', 'Counselor office', 'Trusted family/support location'],
      people_to_call: unique([b.emergency_contact_name, 'Counselor', 'Sponsor / peer mentor']),
      emergency_services_info: 'Call local emergency services or crisis support immediately if safety is at risk.',
      overdose_prevention_notes: 'Follow provider guidance and local harm-reduction resources; this app does not provide medical advice.',
    },
    risk_flags: extraction.extracted_risk_factors || [],
    roadmap_30_60_90: [
      { phase: 'First week stabilization', items: ['Attend required appointments', 'Complete daily check-ins', 'Confirm housing and transportation'] },
      { phase: '30-day foundation', items: ['Maintain support meetings', 'Start job/housing steps', 'Review risk flags weekly'] },
      { phase: '60-day consistency', items: ['Build routine consistency', 'Track progress trends', 'Reduce missed appointments'] },
      { phase: '90-day independence', items: ['Strengthen support network', 'Maintain legal compliance', 'Plan long-term stability goals'] },
    ],
    client_motivation_plan: ['Stay connected to support', 'Complete daily check-ins', 'Protect recovery routine', 'Follow legal/health commitments', 'Build stable housing/work path'],
    counselor_follow_up_plan: ['Review missing information', 'Approve plan sections', 'Monitor weekly progress', 'Follow up on risk flags'],
    approved_sections: [],
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = await req.json();
    if (payload.action === 'scan') return Response.json(extract(payload.raw_text || ''));
    if (payload.action === 'engineer') return Response.json(engineer(payload.extraction || {}));
    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});