const dischargeDate = '2026-06-03';

export const demoFacility = {
  id: 'rez-demo-harbor',
  facility_name: 'Harbor Recovery Center',
  facility_type: 'Residential rehab + IOP step-down',
  city: 'Newark',
  state: 'NJ',
  address: 'Demo campus, 118 Harbor Way',
  licensed_beds: 48,
  active_clients: 18,
  pilot_cohort: 'June 2026 discharge cohort',
  programs: ['Residential treatment', 'MAT coordination', 'IOP step-down', 'Family support'],
  privacy_note: 'All demo records use synthetic names, demo emails, and non-identifying care details.',
};

export const demoCounselorAccounts = [
  {
    name: 'Maya Rivera, LCADC',
    email: 'maya.rivera@demo.rezilient.org',
    role: 'Primary counselor',
    caseload: 7,
    focus: 'Discharge readiness, relapse prevention, and family release planning',
  },
  {
    name: 'Andre Patel, LCSW',
    email: 'andre.patel@demo.rezilient.org',
    role: 'Aftercare coordinator',
    caseload: 6,
    focus: 'IOP handoff, transportation, appointment adherence, and benefits follow-up',
  },
  {
    name: 'Jordan Ellis, CPRS',
    email: 'jordan.ellis@demo.rezilient.org',
    role: 'Peer recovery coach',
    caseload: 5,
    focus: 'Daily check-ins, meeting connection, and motivational support',
  },
];

export const demoClients = [
  {
    id: 'client-sam',
    full_name: 'Sam Carter',
    display_name: 'Sam C.',
    email: 'sam.carter@demo.rezilient.org',
    phone: '(555) 010-1842',
    recovery_focus: 'Alcohol recovery, evening triggers, and rebuilding a reliable daily routine.',
    housing_status: 'Sober living bed confirmed for discharge week.',
    primary_support: 'Sister and peer coach approved for progress-only updates.',
    urgent_needs: 'Transportation to IOP intake and first MAT follow-up.',
    preferred_checkin_time: '09:00',
    stage: 'Discharge in 5 days',
    risk: 'medium',
    days_sober: 36,
    next_step: 'Confirm IOP intake and add rides to calendar.',
  },
  {
    id: 'client-lee',
    full_name: 'Lee Morgan',
    display_name: 'Lee M.',
    email: 'lee.morgan@demo.rezilient.org',
    phone: '(555) 010-2961',
    recovery_focus: 'Opioid recovery, MAT adherence, and employment readiness.',
    housing_status: 'Returning home with approved family support.',
    primary_support: 'Mother, counselor, and sponsor approved.',
    urgent_needs: 'Pharmacy pickup reminder and benefits appointment.',
    preferred_checkin_time: '19:30',
    stage: 'Step-down IOP',
    risk: 'low',
    days_sober: 64,
    next_step: 'Complete weekly progress report before family session.',
  },
  {
    id: 'client-avery',
    full_name: 'Avery Brooks',
    display_name: 'Avery B.',
    email: 'avery.brooks@demo.rezilient.org',
    phone: '(555) 010-3480',
    recovery_focus: 'Co-occurring anxiety, meeting consistency, and stable housing search.',
    housing_status: 'Temporary recovery residence pending permanent placement.',
    primary_support: 'Peer coach and case manager only.',
    urgent_needs: 'Housing application checklist and evening craving plan.',
    preferred_checkin_time: '20:00',
    stage: 'First week post-discharge',
    risk: 'elevated',
    days_sober: 21,
    next_step: 'Review safety plan and assign two evening support contacts.',
  },
];

export const demoAftercarePlans = [
  {
    id: 'demo-aftercare-sam',
    user_email: 'sam.carter@demo.rezilient.org',
    discharge_date: dischargeDate,
    primary_substance: 'alcohol',
    status: 'approved',
    generated_plan_json: {
      title: 'Sam C. 30/60/90 Aftercare Plan',
      participant_snapshot: 'Sam is leaving residential care with sober housing confirmed, strong family motivation, and elevated risk during unstructured evenings.',
      immediate_72h: [
        'Call Maya Rivera within 24 hours of discharge.',
        'Attend IOP intake at Harbor Recovery Step-Down.',
        'Move into sober living before 6 PM and share arrival confirmation.',
      ],
      week1_actions: [
        'Complete daily ReZilient check-in by 9 AM.',
        'Add MAT follow-up, IOP groups, and peer meetings to calendar.',
        'Confirm transportation for the first three appointments.',
      ],
      weekly_commitments: [
        'Attend three recovery meetings.',
        'Send a progress-only family update every Sunday.',
        'Review evening trigger plan with peer coach.',
      ],
      meeting_schedule: [
        'Monday IOP group at 6 PM.',
        'Wednesday alumni recovery meeting at 7 PM.',
        'Saturday peer group at 10 AM.',
      ],
      legal_compliance: ['No open legal requirements for this demo client.'],
      health_wellness: [
        'Keep medication list in profile.',
        'Use Calm Reset before evening cravings pass level 6.',
      ],
      employment_education: ['Update resume during week three with case manager.'],
      housing_food_transport: [
        'Confirm sober living curfew and house meeting schedule.',
        'Save bus route to IOP and pharmacy.',
      ],
      trigger_prevention: [
        'Avoid former bar district for 30 days.',
        'Use two-contact rule before responding to high-conflict texts.',
      ],
      relapse_response_plan: [
        'Message counselor with "need support" if cravings reach 7.',
        'Call 988 or local crisis line for immediate safety concerns.',
      ],
      emergency_plan: ['Call 988, then notify Harbor on-call counselor.'],
      goals_30day: [
        'Complete 20 check-ins.',
        'Attend 12 recovery meetings.',
        'Secure outpatient therapy appointment.',
      ],
      milestones_90day: [
        'Maintain stable sober housing.',
        'Begin part-time work or training.',
        'Graduate from IOP step-down.',
      ],
      accountability_team: [
        'Maya Rivera - counselor',
        'Jordan Ellis - peer coach',
        'Nina Carter - approved family supporter',
      ],
      support_resources: [
        'Harbor Alumni Group',
        'NJ 211 transportation support',
        'Local SMART Recovery meeting directory',
      ],
      counselor_review_note: 'Demo plan is synthetic and presentation-safe. It shows how counselors can convert discharge notes into client-facing structure.',
    },
  },
];

export const demoProgressReports = [
  {
    client: 'Sam C.',
    week: 'Week 1 post-discharge',
    checkins: 5,
    meetings: 3,
    appointments: 2,
    goal_completion: 68,
    report_summary: 'Strong appointment follow-through. Evening craving risk remains the main support focus.',
    shared_fields: ['appointments completed', 'weekly progress summary', 'goals completed'],
    hidden_fields: ['journal entries', 'clinical notes', 'sensitive messages'],
  },
  {
    client: 'Lee M.',
    week: 'Week 4 IOP',
    checkins: 7,
    meetings: 4,
    appointments: 3,
    goal_completion: 84,
    report_summary: 'Stable MAT adherence and consistent family session participation.',
    shared_fields: ['achievements', 'appointments completed', 'encouragement messages'],
    hidden_fields: ['medication details', 'private counselor notes'],
  },
  {
    client: 'Avery B.',
    week: 'Week 1 post-discharge',
    checkins: 4,
    meetings: 2,
    appointments: 1,
    goal_completion: 52,
    report_summary: 'Needs evening support and housing follow-up. Safety plan is active and counselor-reviewed.',
    shared_fields: ['weekly progress summary', 'support requests'],
    hidden_fields: ['housing case notes', 'journal entries', 'diagnosis details'],
  },
];

export const demoMessages = [
  {
    id: 'msg-1',
    sender: 'Maya Rivera',
    role: 'Counselor',
    audience: 'Sam C.',
    message: 'Great job completing the IOP intake. I only shared your attendance confirmation and weekly goal status with your approved family supporter.',
    privacy_label: 'Progress-only family share',
    timestamp: 'Today, 9:14 AM',
  },
  {
    id: 'msg-2',
    sender: 'Sam C.',
    role: 'Client',
    audience: 'Care team',
    message: 'Evenings are still the toughest. I used Calm Reset and messaged Jordan before leaving sober living.',
    privacy_label: 'Care team only',
    timestamp: 'Yesterday, 8:42 PM',
  },
  {
    id: 'msg-3',
    sender: 'Jordan Ellis',
    role: 'Peer coach',
    audience: 'Avery B.',
    message: 'I can meet you after group and help finish the housing checklist. No journal details are visible to me.',
    privacy_label: 'Peer support thread',
    timestamp: 'Yesterday, 5:20 PM',
  },
];

export const privacyGuardrails = [
  'Demo mode uses synthetic people, demo emails, and fictional facility details.',
  'Supporters see only explicit progress fields selected by the client or counselor.',
  'Journal entries, diagnosis details, medication details, and sensitive counselor notes stay hidden.',
  'Messages are labeled by audience so presenters can explain exactly who can see each item.',
];

export const onboardingWalkthrough = [
  {
    step: '1',
    title: 'Facility sets pilot cohort',
    detail: 'Admin loads counselor accounts, client profiles, and discharge windows for the pilot cohort.',
  },
  {
    step: '2',
    title: 'Counselor completes intake',
    detail: 'Counselor captures goals, triggers, support contacts, and urgent needs before discharge.',
  },
  {
    step: '3',
    title: 'Client sees a lighter app',
    detail: 'Client starts with daily check-ins, calendar reminders, aftercare tasks, and nearby resources.',
  },
  {
    step: '4',
    title: 'Progress reports stay private by default',
    detail: 'Counselor and client choose which progress summaries can be shared with approved supporters.',
  },
];

export const demoPresentationChecklist = [
  'Open Pilot Demo and introduce the facility dashboard.',
  'Show counselor accounts and client profiles.',
  'Open the aftercare plan example.',
  'Review progress reports and privacy-safe messages.',
  'Close with onboarding walkthrough and next pilot actions.',
];
