import assert from 'node:assert/strict';
import { SEE_SAMPLE_NOTES, buildSeeExecutionSummary, engineerSeePlan, extractSeeWorkflow } from '../shared/seeWorkflow.js';

const extraction = extractSeeWorkflow(SEE_SAMPLE_NOTES, { now: '2026-05-27T12:00:00Z' });

assert.equal(extraction.extracted_client_basics.full_name, 'Marcus Johnson');
assert.equal(extraction.extracted_client_basics.emergency_contact_name, 'Angela Johnson');
assert.ok(extraction.extracted_client_basics.discharge_date, 'discharge date is extracted');
assert.ok(extraction.extracted_appointments.length >= 4, 'calendar events are extracted');
assert.ok(extraction.extracted_reminders.some((item) => item.reminder_type === 'check_in'), 'daily check-in reminder is extracted');
assert.ok(extraction.extracted_tasks.some((item) => item.task_category === 'employment'), 'employment task is extracted');
assert.ok(extraction.extracted_transportation_needs.length >= 1, 'transportation need is extracted');
assert.ok(extraction.extracted_goals.some((item) => item.category === 'housing'), 'housing goal is extracted');
assert.ok(extraction.extracted_check_ins.length >= 1, 'check-in plan is extracted');
assert.ok(extraction.extracted_risk_factors.some((item) => item.risk_type === 'Trigger profile'), 'risk indicator is extracted');
assert.ok(extraction.weekly_itinerary.length >= 8, 'weekly itinerary is built');

const plan = engineerSeePlan(extraction);
assert.equal(plan.required_appointments.length, extraction.extracted_appointments.length);
assert.equal(plan.reminder_plan.length, extraction.extracted_reminders.length);
assert.equal(plan.task_plan.length, extraction.extracted_tasks.length);
assert.equal(plan.transportation_plan.length, extraction.extracted_transportation_needs.length);
assert.equal(plan.goal_plan.length, extraction.extracted_goals.length);
assert.equal(plan.check_in_plan.length, extraction.extracted_check_ins.length);
assert.equal(plan.risk_flags.length, extraction.extracted_risk_factors.length);

const summary = buildSeeExecutionSummary(plan, extraction);
assert.equal(summary.calendarEvents, plan.required_appointments.length);
assert.equal(summary.reminders, plan.reminder_plan.length);
assert.equal(summary.transportationNeeds, plan.transportation_plan.length);
assert.equal(summary.goals, plan.goal_plan.length);
assert.equal(summary.checkIns, plan.check_in_plan.length);
assert.equal(summary.weeklyItems, plan.weekly_itinerary.length);

console.log(JSON.stringify({
  client: extraction.extracted_client_basics.full_name,
  confidence: extraction.confidence_score,
  summary,
}, null, 2));
