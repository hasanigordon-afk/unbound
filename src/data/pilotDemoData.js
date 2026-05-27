const DEMO_FACILITY_ID = 'demo-integrity-recovery';
const DEMO_PLAN_ID = 'demo-roadmap-plan';
export const DEMO_PARTICIPANT_EMAIL = 'marcus.rivera@rezilient.demo';
export const DEMO_COUNSELOR_EMAIL = 'counselor.rivera@integrityrc.org';

const isoDate = (offset = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
};

const isoDateTime = (offset = 0, hour = 9, minute = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
};

const weekday = (offset = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
};

const hours = {
  sun: { open: '09:00', close: '17:00' },
  mon: { open: '08:00', close: '20:00' },
  tue: { open: '08:00', close: '20:00' },
  wed: { open: '08:00', close: '20:00' },
  thu: { open: '08:00', close: '20:00' },
  fri: { open: '08:00', close: '18:00' },
  sat: { open: '09:00', close: '15:00' },
};

export const demoFacility = {
  id: DEMO_FACILITY_ID,
  facility_name: 'Integrity Recovery Center',
  name: 'Integrity Recovery Center',
  city: 'Newark',
  state: 'NJ',
};

export const demoResources = [
  {
    id: 'demo-resource-iop',
    name: 'Somerset Recovery IOP',
    category: 'IOP',
    address: '120 Cedar Grove Ln, Somerset, NJ 08873',
    city: 'Somerset',
    state: 'NJ',
    zip: '08873',
    latitude: 40.5081,
    longitude: -74.4994,
    phone: '(732) 555-0148',
    website: 'https://example.org/somerset-iop',
    hours_json: hours,
    hours_text: 'Mon-Thu 8 AM-8 PM; Fri 8 AM-6 PM',
    accepts_medicaid: true,
    veteran_support: true,
    free_service: false,
    transportation_available: true,
    rating: 4.8,
    notes: 'Evening IOP, relapse prevention group, MAT coordination, and bus vouchers.',
  },
  {
    id: 'demo-resource-food',
    name: 'Franklin Community Food Pantry',
    category: 'Food Resources',
    address: '224 Churchill Ave, Somerset, NJ 08873',
    city: 'Somerset',
    state: 'NJ',
    zip: '08873',
    latitude: 40.4967,
    longitude: -74.4819,
    phone: '(732) 555-0182',
    website: 'https://example.org/franklin-food',
    hours_json: hours,
    hours_text: 'Weekdays 9 AM-5 PM; Sat 9 AM-1 PM',
    accepts_medicaid: false,
    veteran_support: false,
    free_service: true,
    transportation_available: false,
    rating: 4.7,
    notes: 'Walk-in pantry, SNAP screening, hygiene kits, and ready-to-eat groceries.',
  },
  {
    id: 'demo-resource-housing',
    name: 'New Brunswick Reentry Housing Desk',
    category: 'Shelters',
    address: '90 Jersey Ave, New Brunswick, NJ 08901',
    city: 'New Brunswick',
    state: 'NJ',
    zip: '08901',
    latitude: 40.4862,
    longitude: -74.4443,
    phone: '(732) 555-0199',
    website: 'https://example.org/reentry-housing',
    hours_json: hours,
    hours_text: 'Daily intake 9 AM-5 PM',
    accepts_medicaid: true,
    veteran_support: true,
    free_service: true,
    transportation_available: true,
    rating: 4.6,
    notes: 'Transitional beds, ID replacement help, and landlord mediation.',
  },
  {
    id: 'demo-resource-jobs',
    name: 'Second Chance Staffing Cooperative',
    category: 'Jobs / Staffing Agencies',
    address: '15 Livingston Ave, New Brunswick, NJ 08901',
    city: 'New Brunswick',
    state: 'NJ',
    zip: '08901',
    latitude: 40.4938,
    longitude: -74.4448,
    phone: '(732) 555-0164',
    website: 'https://example.org/second-chance-staffing',
    hours_json: hours,
    hours_text: 'Mon-Fri 8 AM-4 PM',
    accepts_medicaid: false,
    veteran_support: true,
    free_service: true,
    transportation_available: true,
    rating: 4.9,
    notes: 'Resume lab, forklift credentialing, and employers open to reentry hires.',
  },
  {
    id: 'demo-resource-legal',
    name: 'Central NJ Legal Reentry Clinic',
    category: 'Legal Help',
    address: '50 Paterson St, New Brunswick, NJ 08901',
    city: 'New Brunswick',
    state: 'NJ',
    zip: '08901',
    latitude: 40.4955,
    longitude: -74.4492,
    phone: '(732) 555-0133',
    website: 'https://example.org/reentry-legal',
    hours_json: hours,
    hours_text: 'Tue-Thu 10 AM-6 PM',
    accepts_medicaid: false,
    veteran_support: false,
    free_service: true,
    transportation_available: false,
    rating: 4.5,
    notes: 'Probation questions, fines and fees planning, expungement screening.',
  },
];

export const demoSavedResources = [
  { id: 'demo-saved-resource-iop', resource_id: 'demo-resource-iop', resource_name: 'Somerset Recovery IOP', category: 'IOP' },
  { id: 'demo-saved-resource-jobs', resource_id: 'demo-resource-jobs', resource_name: 'Second Chance Staffing Cooperative', category: 'Jobs / Staffing Agencies' },
];

export const demoMeetings = [
  { id: 'demo-meeting-na', title: 'New Beginnings NA', program_type: 'NA', meeting_format: 'open', in_person: true, city: 'Somerset', state: 'NJ', day_of_week: 2, start_time: '19:30', end_time: '20:30', address: 'St. Matthias Community Room', latitude: 40.4978, longitude: -74.4882, notes: 'Peer chair, newcomer-friendly, bus stop one block away.' },
  { id: 'demo-meeting-smart', title: 'SMART Recovery Reentry Circle', program_type: 'SMART', meeting_format: 'hybrid', in_person: true, city: 'New Brunswick', state: 'NJ', day_of_week: 4, start_time: '18:00', end_time: '19:15', address: 'Public Library Room B', latitude: 40.4941, longitude: -74.4449, url: 'https://example.org/smart-reentry', notes: 'Coping skills and weekly action planning.' },
  { id: 'demo-meeting-aa', title: 'Sunrise Accountability AA', program_type: 'AA', meeting_format: 'open', in_person: true, city: 'Somerset', state: 'NJ', day_of_week: 6, start_time: '08:30', end_time: '09:30', address: 'Franklin Fellowship Hall', latitude: 40.505, longitude: -74.511, notes: 'Breakfast coffee and sponsor introductions after meeting.' },
];

export const demoGoals = [
  { id: 'demo-goal-housing', participant_email: DEMO_PARTICIPANT_EMAIL, title: 'Confirm sober living bed', category: 'housing', status: 'active', progress_percentage: 75, target_date: isoDate(9), description: 'Call house manager, submit ID copy, and confirm first-week payment plan.' },
  { id: 'demo-goal-work', participant_email: DEMO_PARTICIPANT_EMAIL, title: 'Complete forklift credential', category: 'career', status: 'active', progress_percentage: 60, target_date: isoDate(16), description: 'Finish two training modules and schedule the practical test.' },
  { id: 'demo-goal-family', participant_email: DEMO_PARTICIPANT_EMAIL, title: 'Rebuild weekly family call', category: 'relationships', status: 'active', progress_percentage: 40, target_date: isoDate(30), description: 'Keep Sunday call with mom and send one sober living update.' },
  { id: 'demo-goal-id', participant_email: DEMO_PARTICIPANT_EMAIL, title: 'Replace state ID', category: 'legal', status: 'completed', progress_percentage: 100, target_date: isoDate(-1), description: 'ID replacement submitted and scanned into the roadmap packet.' },
];

export const demoCheckIns = [
  { id: 'demo-checkin-0', participant_email: DEMO_PARTICIPANT_EMAIL, check_in_date: isoDate(0), mood_rating: 4, craving_intensity: 2, stress_level: 4, attended_meeting: true, meeting_type: 'NA', connected_with_sponsor: true, notes: 'Morning routine done, cravings lower after calling sponsor.' },
  { id: 'demo-checkin-1', participant_email: DEMO_PARTICIPANT_EMAIL, check_in_date: isoDate(-1), mood_rating: 3, craving_intensity: 5, stress_level: 6, attended_meeting: false, meeting_type: 'Virtual', connected_with_sponsor: true, notes: 'Stress spiked after housing call; used breathing reset and stayed on plan.' },
  { id: 'demo-checkin-2', participant_email: DEMO_PARTICIPANT_EMAIL, check_in_date: isoDate(-2), mood_rating: 4, craving_intensity: 1, stress_level: 3, attended_meeting: true, meeting_type: 'SMART', connected_with_sponsor: false, notes: 'Good job search progress and one application submitted.' },
];

export const demoSupportContacts = [
  { id: 'demo-contact-sponsor', name: 'Andre Williams', relationship: 'sponsor', phone: '(732) 555-0104', email: 'andre@rezilient.demo', preferred_channel: 'call', is_primary: true },
  { id: 'demo-contact-counselor', name: 'Counselor Rivera', relationship: 'counselor', phone: '(973) 555-0161', email: DEMO_COUNSELOR_EMAIL, preferred_channel: 'text', is_primary: false },
  { id: 'demo-contact-family', name: 'Elena Rivera', relationship: 'family', phone: '(908) 555-0122', email: 'elena@rezilient.demo', preferred_channel: 'call', is_primary: false },
];

export const demoSafetyPlan = {
  id: 'demo-safety-plan',
  owner_email: DEMO_PARTICIPANT_EMAIL,
  warning_signs: ['Skipping meals', 'Ignoring sponsor calls', 'Driving past old neighborhood'],
  coping_strategies: ['Call Andre before making decisions', 'Box breathing for 5 minutes', 'Go to the library until the craving drops'],
  safe_environments: ['Franklin Public Library', 'Sponsor Andre\'s porch', 'Somerset Recovery lobby'],
  reasons_to_live: ['My daughter seeing consistency', 'Keeping my freedom', 'Building a place I can be proud to come home to'],
  support_contacts: demoSupportContacts.map((contact) => ({
    name: contact.name,
    relationship: contact.relationship,
    phone: contact.phone,
    notify_on_crisis: contact.is_primary || contact.relationship === 'counselor',
  })),
  crisis_message: 'I am struggling and need support now. Please call me, or text if you cannot talk. I am trying to stay safe and stay on my plan.',
  professional_contacts: [],
  is_complete: true,
  last_reviewed: isoDate(0),
};

export const demoJournalEntries = [
  { id: 'demo-journal-0', prompt: 'Today I noticed...', content: 'I get quieter when I am worried about housing. Saying it out loud helped me ask for a ride and keep the IOP appointment.', mood: 'steady', mood_score: 4, tags: ['reflection', 'housing', 'support'], title: 'Named the housing stress before it ran the day', date: 'Today, 8:15 AM', created_date: isoDateTime(0, 8, 15) },
  { id: 'demo-journal-1', prompt: 'One thing I handled...', content: 'I called the staffing coach even though I wanted to put it off. The interview prep is booked for Friday.', mood: 'proud', mood_score: 5, tags: ['win', 'employment'], title: 'Made the job call before noon', date: 'Yesterday, 7:40 PM', created_date: isoDateTime(-1, 19, 40) },
];

export const demoAhHaMoments = [
  {
    id: 'demo-ahha-1',
    user_email: 'anonymous@rezilient.demo',
    display_name: 'Marcus',
    is_anonymous: false,
    category: 'wanted_my_life_back',
    title: 'I wanted my mornings back',
    what_happened: 'I woke up before my alarm in treatment and realized I had not felt clear in years. It was quiet, but it felt like a door opening.',
    feeling_in_moment: 'Scared, grateful, and tired of negotiating with the same old excuses.',
    tired_of_repeating: 'Missing calls from my daughter and pretending I would fix everything tomorrow.',
    decision_made: 'I asked for a discharge plan with meetings, housing steps, and someone I could call before I disappeared.',
    message_to_others: 'Do one honest thing before the day gets loud. That one thing can become a pattern.',
    status: 'approved',
    is_featured: true,
    reaction_count: 42,
    comment_count: 8,
    save_count: 16,
    media_type: 'text',
    is_private: false,
    is_submitted: true,
    is_approved: true,
    allow_comments: true,
    created_date: isoDateTime(-2, 10, 20),
    ai_tags: ['clarity', 'family', 'first step'],
  },
  {
    id: 'demo-ahha-2',
    user_email: 'anonymous2@rezilient.demo',
    display_name: 'Tasha',
    is_anonymous: true,
    category: 'jail_court',
    title: 'The judge saw the plan before the past',
    what_happened: 'My counselor printed my reentry roadmap. For once the conversation was about appointments, work, and support instead of only mistakes.',
    feeling_in_moment: 'I felt nervous, but also prepared.',
    tired_of_repeating: 'Walking into court with no structure and hoping people believed me.',
    decision_made: 'I started checking in every morning and sharing progress with my counselor.',
    message_to_others: 'Bring proof of your next step. It changes how you stand in the room.',
    status: 'approved',
    is_featured: true,
    reaction_count: 31,
    comment_count: 5,
    save_count: 11,
    media_type: 'text',
    is_private: false,
    is_submitted: true,
    is_approved: true,
    allow_comments: true,
    created_date: isoDateTime(-4, 12, 10),
    ai_tags: ['court', 'accountability', 'roadmap'],
  },
];

export const demoCalendarEvents = [
  { id: 'demo-event-iop', client_id: 'demo-client-marcus', plan_id: DEMO_PLAN_ID, title: 'IOP intake at Somerset Recovery', event_title: 'IOP intake at Somerset Recovery', event_type: 'treatment', category: 'Recovery', date: isoDate(1), start_time: '14:00', end_time: '15:30', location: '120 Cedar Grove Ln, Somerset', reminder_time: '1 hour before', transportation_needed: true, status: 'confirmed', confirmed: true, notes: 'Bring ID, insurance card, and discharge packet.' },
  { id: 'demo-event-meeting', client_id: 'demo-client-marcus', plan_id: DEMO_PLAN_ID, title: 'New Beginnings NA', event_title: 'New Beginnings NA', event_type: 'meeting', category: 'Recovery Support', date: isoDate(2), start_time: '19:30', end_time: '20:30', location: 'St. Matthias Community Room', reminder_time: '2 hours before', transportation_needed: false, status: 'scheduled', notes: 'Ask Andre to introduce two steady members.' },
  { id: 'demo-event-probation', client_id: 'demo-client-marcus', plan_id: DEMO_PLAN_ID, title: 'Probation check-in', event_title: 'Probation check-in', event_type: 'legal', category: 'Legal', date: isoDate(5), start_time: '10:00', end_time: '10:30', location: 'Middlesex County Probation', reminder_time: '1 day before', transportation_needed: true, status: 'scheduled', notes: 'Upload meeting attendance and employment application log.' },
];

export const demoTasks = [
  { id: 'demo-task-id', client_id: 'demo-client-marcus', plan_id: DEMO_PLAN_ID, task_title: 'Upload ID copy for sober living', task_category: 'housing', description: 'Send front/back photo to house manager before the weekly bed review.', due_date: isoDate(1), due_time: '09:00', recurrence: 'once', priority: 'high', completed: false },
  { id: 'demo-task-sponsor', client_id: 'demo-client-marcus', plan_id: DEMO_PLAN_ID, task_title: 'Call sponsor before evening meeting', task_category: 'recovery', description: 'Use the call to plan transportation and name any cravings early.', due_date: isoDate(0), due_time: '17:30', recurrence: 'daily', priority: 'high', completed: true, completed_at: isoDateTime(0, 17, 10) },
  { id: 'demo-task-resume', client_id: 'demo-client-marcus', plan_id: DEMO_PLAN_ID, task_title: 'Finish resume draft with staffing coach', task_category: 'employment', description: 'Add warehouse experience and forklift class date.', due_date: isoDate(3), due_time: '11:00', recurrence: 'once', priority: 'medium', completed: false },
];

export const demoRoadmapProgress = {
  score: 82,
  streakDays: 9,
  meetingsThisWeek: 3,
  checkInsThisWeek: 6,
  tasksCompleted: 11,
  roadmapCompletion: 68,
  nextMilestone: 'Confirm sober living bed review',
};

export const demoForwardPlans = [
  {
    id: DEMO_PLAN_ID,
    participant_email: DEMO_PARTICIPANT_EMAIL,
    title: '30/60/90 Reentry Roadmap',
    discharge_date: isoDate(-7),
    housing_goal: 'Move from temporary bed to sober living with weekly rent plan.',
    employment_goal: 'Complete forklift credential and apply to three second-chance employers.',
    education_goal: 'Finish OSHA 10 refresher.',
    financial_goal: 'Open checking account and set up weekly budget.',
    health_goal: 'Attend IOP three nights and primary care visit within 30 days.',
    relationships_goal: 'Keep Sunday family call and weekly sponsor contact.',
    legal_goal: 'Attend probation check-ins with documentation packet.',
    overall_completion_percentage: 68,
  },
];

export const demoForwardPlanMilestones = [
  { id: 'demo-ms-housing', participant_email: DEMO_PARTICIPANT_EMAIL, forward_plan_id: DEMO_PLAN_ID, category: 'housing', timeline: '90_day', milestone_text: 'Secure sober living bed and transportation route.', completed: true, completed_date: isoDateTime(-1, 14, 30), sort_order: 1 },
  { id: 'demo-ms-employment', participant_email: DEMO_PARTICIPANT_EMAIL, forward_plan_id: DEMO_PLAN_ID, category: 'employment', timeline: '90_day', milestone_text: 'Complete resume and submit three applications.', completed: false, sort_order: 2 },
  { id: 'demo-ms-legal', participant_email: DEMO_PARTICIPANT_EMAIL, forward_plan_id: DEMO_PLAN_ID, category: 'legal', timeline: '90_day', milestone_text: 'Bring meeting log and IOP proof to probation.', completed: false, sort_order: 3 },
];

export const demoCounselorClients = [
  {
    id: 'demo-client-marcus',
    participant_email: DEMO_PARTICIPANT_EMAIL,
    facility_id: DEMO_FACILITY_ID,
    assigned_counselor_email: DEMO_COUNSELOR_EMAIL,
    discharge_date: isoDate(-7),
    sobriety_start_date: isoDate(-35),
    program_type: 'post_incarceration',
    location_city: 'Somerset',
    location_state: 'NJ',
    location_zip: '08873',
    terms_accepted: true,
    pilot_participant: true,
    engagement_mode: 'reentry_focus',
  },
  {
    id: 'demo-client-tasha',
    participant_email: 'tasha.miles@rezilient.demo',
    facility_id: DEMO_FACILITY_ID,
    assigned_counselor_email: DEMO_COUNSELOR_EMAIL,
    discharge_date: isoDate(-12),
    sobriety_start_date: isoDate(-48),
    program_type: 'post_treatment',
    location_city: 'Newark',
    location_state: 'NJ',
    location_zip: '07102',
    terms_accepted: true,
    pilot_participant: true,
    engagement_mode: 'treatment_continuity',
  },
  {
    id: 'demo-client-devon',
    participant_email: 'devon.price@rezilient.demo',
    facility_id: DEMO_FACILITY_ID,
    assigned_counselor_email: DEMO_COUNSELOR_EMAIL,
    discharge_date: isoDate(-3),
    sobriety_start_date: isoDate(-21),
    program_type: 'housing_transition',
    location_city: 'Plainfield',
    location_state: 'NJ',
    location_zip: '07060',
    terms_accepted: true,
    pilot_participant: true,
    engagement_mode: 'reentry_focus',
  },
];

export const demoPilotIntakes = [
  {
    id: 'demo-intake-marcus',
    full_name: 'Marcus Rivera',
    email: DEMO_PARTICIPANT_EMAIL,
    phone: '(732) 555-0177',
    recovery_focus: 'Reentry stabilization, evening IOP, NA meetings, and housing consistency.',
    housing_status: 'Temporary bed through Sunday; sober living review scheduled.',
    primary_support: 'Andre Williams, sponsor, daily phone check-in.',
    urgent_needs: 'Needs transportation to IOP intake and ID copy uploaded before bed review.',
    preferred_checkin_time: '08:15',
    created_date: isoDateTime(-1, 10, 30),
  },
  {
    id: 'demo-intake-devon',
    full_name: 'Devon Price',
    email: 'devon.price@rezilient.demo',
    phone: '(908) 555-0194',
    recovery_focus: 'Housing transition, missed group follow-up, and high-craving support plan.',
    housing_status: 'Couch surfing; needs shelter intake backup.',
    primary_support: 'Counselor Rivera and peer mentor Jamal.',
    urgent_needs: 'Missed bus to group; needs outreach and transportation plan today.',
    preferred_checkin_time: '19:30',
    created_date: isoDateTime(-2, 15, 10),
  },
];

export const demoCounselorCheckIns = [
  ...demoCheckIns,
  { id: 'demo-checkin-tasha-0', participant_email: 'tasha.miles@rezilient.demo', check_in_date: isoDate(0), mood_rating: 5, craving_intensity: 1, stress_level: 3, attended_meeting: true, meeting_type: 'AA', connected_with_sponsor: true, notes: 'Stable morning and confirmed outpatient group.' },
  { id: 'demo-checkin-tasha-1', participant_email: 'tasha.miles@rezilient.demo', check_in_date: isoDate(-1), mood_rating: 4, craving_intensity: 2, stress_level: 4, attended_meeting: true, meeting_type: 'AA', connected_with_sponsor: true, notes: 'Stayed after group to ask about childcare.' },
  { id: 'demo-checkin-devon-0', participant_email: 'devon.price@rezilient.demo', check_in_date: isoDate(-3), mood_rating: 2, craving_intensity: 7, stress_level: 8, attended_meeting: false, meeting_type: 'Virtual', connected_with_sponsor: false, relapse_risk_flag: true, notes: 'Missed bus and skipped group; needs outreach.' },
];

export const demoEngagementAlerts = [
  { id: 'demo-alert-devon', participant_email: 'devon.price@rezilient.demo', status: 'active', alert_message: 'No check-in for 3 days and elevated craving score on last entry.', reason: 'Missed check-ins and transportation barrier', created_date: isoDateTime(-1, 9, 0) },
];

export const demoPhaseCompletions = [
  { id: 'demo-phase-marcus-1', participant_email: DEMO_PARTICIPANT_EMAIL, phase: 'Phase 1', completed_date: isoDateTime(-4, 16, 0) },
  { id: 'demo-phase-tasha-1', participant_email: 'tasha.miles@rezilient.demo', phase: 'Phase 1', completed_date: isoDateTime(-8, 11, 0) },
  { id: 'demo-phase-tasha-2', participant_email: 'tasha.miles@rezilient.demo', phase: 'Phase 2', completed_date: isoDateTime(-2, 12, 0) },
];

export const demoHomeModuleStates = [
  { id: 'demo-home-roadmap', module_key: 'your-comeback-mission-roadmap', section_title: 'Your Comeback Mission', module_title: 'Roadmap', status: 'in_progress', pinned: true, open_count: 6, last_opened_at: isoDateTime(0, 8, 45) },
  { id: 'demo-home-checkin', module_key: 'today-recovery-check-in', section_title: 'Today', module_title: 'Recovery Check-In', status: 'completed', pinned: true, open_count: 9, last_opened_at: isoDateTime(0, 8, 15) },
  { id: 'demo-home-resources', module_key: 'support-system-find-help-nearby', section_title: 'Support System', module_title: 'Find Help Nearby', status: 'in_progress', pinned: false, open_count: 4, last_opened_at: isoDateTime(-1, 15, 0) },
];

export const demoHomeModuleActivities = [
  { id: 'demo-home-activity-1', module_key: 'today-recovery-check-in', section_title: 'Today', module_title: 'Recovery Check-In', action_type: 'completed', created_at_text: 'Today, 8:15 AM' },
  { id: 'demo-home-activity-2', module_key: 'your-comeback-mission-roadmap', section_title: 'Your Comeback Mission', module_title: 'Roadmap', action_type: 'opened', created_at_text: 'Today, 8:45 AM' },
  { id: 'demo-home-activity-3', module_key: 'support-system-find-help-nearby', section_title: 'Support System', module_title: 'Find Help Nearby', action_type: 'pinned', created_at_text: 'Yesterday, 3:00 PM' },
];

export const demoLocalLists = {
  rez_daily_checkins: demoCheckIns.map((item) => ({
    title: `${item.mood_rating}/5 mood, craving ${item.craving_intensity}/10 - ${item.notes}`,
    date: item.check_in_date === isoDate(0) ? 'Today' : item.check_in_date,
  })),
  rez_journal_entries: demoJournalEntries.map(({ title, date, content }) => ({ title, date, content })),
  rez_goals: demoGoals.map((goal) => ({ title: `${goal.title} (${goal.progress_percentage}% complete)`, date: `Target ${goal.target_date}` })),
  rez_reminders: [
    { title: '9:00 AM - Upload ID copy for sober living', date: 'Today' },
    { title: '5:30 PM - Call Andre before the evening meeting', date: 'Today' },
    { title: '8:15 PM - Log check-in and transportation notes', date: 'Tonight' },
  ],
  rez_meetings: demoMeetings.map((meeting) => ({ title: `${meeting.title} - ${weekday((meeting.day_of_week - new Date().getDay() + 7) % 7)} ${meeting.start_time}`, date: `${meeting.city}, ${meeting.state}` })),
  rez_aftercare_plans: [
    { title: '30/60/90 roadmap: IOP, sober living, probation, employment', date: 'Updated today' },
    { title: `${demoRoadmapProgress.roadmapCompletion}% complete - next: ${demoRoadmapProgress.nextMilestone}`, date: 'Roadmap progress' },
  ],
  rez_saved_resources: demoSavedResources.map((resource) => ({ title: `${resource.resource_name} (${resource.category})`, date: 'Saved for this week' })),
  rez_support_circle: demoSupportContacts.map((contact) => ({ title: `${contact.name} - ${contact.relationship} via ${contact.preferred_channel}`, date: contact.is_primary ? 'Primary support' : 'Backup support' })),
  rez_calendar_events: demoCalendarEvents.map((event) => ({ title: `${event.title} - ${event.start_time}`, date: event.date })),
  rez_tasks: demoTasks.map((task) => ({ title: `${task.completed ? 'Done' : 'Next'}: ${task.task_title}`, date: `${task.due_date} ${task.due_time}` })),
  rez_ah_ha_moments: demoAhHaMoments.map((story) => ({ title: story.title, date: story.is_featured ? 'Featured Ah Ha Moment' : 'Community story' })),
  rez_roadmap: [
    { title: `${demoRoadmapProgress.roadmapCompletion}% roadmap complete`, date: '30/60/90 plan' },
    { title: `${demoRoadmapProgress.checkInsThisWeek} check-ins and ${demoRoadmapProgress.meetingsThisWeek} meetings this week`, date: 'Weekly progress' },
  ],
};

export const demoSectionHighlights = {
  'Aftercare Plan': ['IOP intake confirmed tomorrow at 2:00 PM', 'Probation packet due Monday', 'Sober living bed review in 9 days'],
  Meetings: ['New Beginnings NA Tue 7:30 PM', 'SMART Recovery Thu 6:00 PM', 'Sunrise AA Sat 8:30 AM'],
  'Daily reminders': ['Upload ID copy by 9:00 AM', 'Call sponsor at 5:30 PM', 'Night check-in at 8:15 PM'],
  Tasks: demoTasks.map((task) => `${task.completed ? 'Done' : task.priority.toUpperCase()}: ${task.task_title}`),
  Goals: demoGoals.map((goal) => `${goal.title} - ${goal.progress_percentage}%`),
  'Daily Check-In': ['Mood 4/5 today', 'Craving 2/10 after sponsor call', '6 of 7 check-ins this week'],
  'Map support': ['Somerset Recovery IOP saved', 'Food pantry 0.8 miles away', 'Legal clinic Tue-Thu'],
  'Support Circle': demoSupportContacts.map((contact) => `${contact.name} - ${contact.relationship}`),
  Journal: demoJournalEntries.map((entry) => entry.title),
  'My Progress': [`${demoRoadmapProgress.streakDays}-day structure streak`, `${demoRoadmapProgress.meetingsThisWeek} meetings this week`, `${demoRoadmapProgress.roadmapCompletion}% roadmap complete`],
  'Recovery Score': [`Score ${demoRoadmapProgress.score}`, 'Strong check-in rhythm', 'Next boost: confirm housing step'],
  Roadmap: [`${demoRoadmapProgress.roadmapCompletion}% complete`, demoRoadmapProgress.nextMilestone, `${demoTasks.filter((task) => !task.completed).length} tasks due this week`],
  'Current streak': [`${demoRoadmapProgress.streakDays} days active`, 'Morning check-ins intact', 'Sponsor call logged today'],
  'Meetings attended': [`${demoRoadmapProgress.meetingsThisWeek} this week`, 'NA + SMART + AA mix', 'Next meeting Tue 7:30 PM'],
  'Goals completed': [`${demoRoadmapProgress.tasksCompleted} roadmap tasks done`, 'Housing goal 75%', 'Employment goal 60%'],
  Milestones: ['ID packet submitted', 'First family call completed', 'IOP intake scheduled'],
  Achievements: ['7-day check-in streak', 'Meeting attendance shared', 'First job application submitted'],
  'Ah Ha Moments': demoAhHaMoments.map((story) => story.title),
};

export const getDemoLocalList = (key, fallback = []) => demoLocalLists[key] || fallback;

export const getActionSeed = (action = {}) => {
  const normalized = action.title || action.type;
  const keyMap = {
    'Daily Check-In': 'rez_daily_checkins',
    Journaling: 'rez_journal_entries',
    Journal: 'rez_journal_entries',
    Goals: 'rez_goals',
    'Top 5 Non-Negotiables': 'rez_goals',
    'Daily reminders': 'rez_reminders',
    Meetings: 'rez_meetings',
    'Aftercare Plan': 'rez_aftercare_plans',
    'Resource Save': 'rez_saved_resources',
    'Support Circle': 'rez_support_circle',
    'Ah Ha Moments': 'rez_ah_ha_moments',
    Roadmap: 'rez_roadmap',
    'Today\'s Roadmap': 'rez_roadmap',
    Tasks: 'rez_tasks',
    Calendar: 'rez_calendar_events',
  };
  return getDemoLocalList(keyMap[normalized], action.sample ? [action.sample] : []);
};

export const getSectionDemoItems = (title) => demoSectionHighlights[title] || [];
