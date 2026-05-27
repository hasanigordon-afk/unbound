const DISCLAIMER = 'This plan is a support and organization tool. It does not replace professional medical, clinical, legal, or emergency guidance.';

const DAY_INDEXES = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

const DAY_LABELS = Object.keys(DAY_INDEXES);

export const SEE_SAMPLE_NOTES = [
  'Client Marcus Johnson leaves treatment Friday. He needs IOP Monday, Wednesday, Friday at 1 PM at Trenton Recovery Center.',
  'NA Tuesday and Thursday nights, sponsor call 3x per week, daily check-ins at 8 PM, and medication reminders every morning.',
  'Probation every second Wednesday at 10 AM, job search help, sober living confirmation, bus transportation, and relapse risk when lonely or around old friends.',
  'Emergency contact is Angela Johnson 555-222-8811.',
].join(' ');

export const SEE_PLAN_SECTIONS = [
  ['summary', 'Plan Summary'],
  ['weekly_itinerary', 'Weekly Itinerary'],
  ['required_appointments', 'Calendar Events'],
  ['reminder_plan', 'Reminders'],
  ['task_plan', 'Tasks'],
  ['transportation_plan', 'Transportation Needs'],
  ['goal_plan', 'Goals'],
  ['check_in_plan', 'Check-Ins'],
  ['recovery_support_schedule', 'Recovery Support Schedule'],
  ['legal_schedule', 'Legal Schedule'],
  ['housing_stability_plan', 'Housing Stability Plan'],
  ['employment_education_plan', 'Employment/Education Plan'],
  ['wellness_plan', 'Wellness Plan'],
  ['emergency_plan', 'Emergency Plan'],
  ['risk_flags', 'Risk Indicators'],
  ['roadmap_30_60_90', '30/60/90 Day Roadmap'],
  ['client_motivation_plan', 'Client Motivation Plan'],
  ['counselor_follow_up_plan', 'Counselor Follow-Up Plan'],
];

function compact(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function titleCase(value) {
  return compact(value).replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}

function toDateString(date) {
  return date.toISOString().split('T')[0];
}

function currentDate(now = new Date()) {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function addDays(now, days) {
  const date = currentDate(now);
  date.setDate(date.getDate() + days);
  return toDateString(date);
}

function nextDateForDay(dayName, now = new Date()) {
  const target = DAY_INDEXES[String(dayName || '').toLowerCase()];
  const date = currentDate(now);
  const diff = (target + 7 - date.getDay()) % 7 || 7;
  date.setDate(date.getDate() + diff);
  return toDateString(date);
}

function uniqueBy(items, getKey) {
  const seen = new Set();
  return items.filter((item) => {
    const key = getKey(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function uniqueStrings(items) {
  return [...new Set(items.map(compact).filter(Boolean))];
}

function splitNotes(rawText) {
  return compact(rawText)
    .split(/(?:\n+|(?<=[.!?])\s+|;\s*)/)
    .map(compact)
    .filter(Boolean);
}

function detectDays(text) {
  const lower = String(text || '').toLowerCase();
  return DAY_LABELS.filter((day) => new RegExp(`\\b${day}s?\\b`, 'i').test(lower));
}

function detectTime(text, fallback = '') {
  const value = String(text || '');
  const explicit = value.match(/\b(\d{1,2})(?::(\d{2}))?\s*(a\.?m\.?|p\.?m\.?|am|pm)\b/i);
  if (explicit) {
    let hour = Number(explicit[1]);
    const minute = explicit[2] || '00';
    const meridiem = explicit[3].toLowerCase().startsWith('p') ? 'PM' : 'AM';
    if (hour > 12) hour -= 12;
    return `${hour}:${minute.padStart(2, '0')} ${meridiem}`;
  }

  const military = value.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
  if (military) {
    let hour = Number(military[1]);
    const minute = military[2];
    const meridiem = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${minute} ${meridiem}`;
  }

  const lower = value.toLowerCase();
  if (lower.includes('morning')) return '9:00 AM';
  if (lower.includes('noon')) return '12:00 PM';
  if (lower.includes('afternoon')) return '2:00 PM';
  if (lower.includes('evening') || lower.includes('night')) return '7:00 PM';
  if (lower.includes('bedtime')) return '9:30 PM';
  return fallback;
}

function detectDate(text, now = new Date()) {
  const lower = String(text || '').toLowerCase();
  const iso = lower.match(/\b(20\d{2}-[01]\d-[0-3]\d)\b/);
  if (iso) return iso[1];

  const numeric = lower.match(/\b([01]?\d)[/-]([0-3]?\d)(?:[/-](20\d{2}|\d{2}))?\b/);
  if (numeric) {
    const year = numeric[3] ? Number(numeric[3].length === 2 ? `20${numeric[3]}` : numeric[3]) : now.getFullYear();
    return toDateString(new Date(year, Number(numeric[1]) - 1, Number(numeric[2])));
  }

  if (lower.includes('tomorrow')) return addDays(now, 1);
  if (lower.includes('today')) return addDays(now, 0);
  if (lower.includes('friday discharge') || lower.includes('discharge friday')) return nextDateForDay('friday', now);
  const day = detectDays(lower)[0];
  return day ? nextDateForDay(day, now) : '';
}

function findName(text) {
  const match = text.match(/\b(?:client|patient|name)\s*(?:is|:)?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})\b/);
  if (match) return match[1].replace(/^(Client|Patient)\s+/i, '');
  const leaves = text.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})\s+(?:leaves|discharges|is leaving)\b/);
  return leaves?.[1]?.replace(/^(Client|Patient)\s+/i, '') || '';
}

function findEmergencyContact(text) {
  const match = text.match(/\bemergency contact\s*(?:is|:)?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})(?:\s+([+()\-\d\s]{7,}))?/i);
  return {
    name: compact(match?.[1] || ''),
    phone: compact(match?.[2] || ''),
  };
}

function detectRecoveryCategory(lower) {
  if (/opioid|suboxone|methadone|mat\b/.test(lower)) return 'opioids';
  if (/alcohol|aa\b/.test(lower)) return 'alcohol';
  if (/stimulant|cocaine|meth\b/.test(lower)) return 'stimulants';
  if (/mental health|psychiatric|therapy/.test(lower)) return 'mental health support';
  return 'general life stability';
}

function buildBasics(text, sentences, now) {
  const lower = text.toLowerCase();
  const emergency = findEmergencyContact(text);
  const dischargeSentence = sentences.find((sentence) => /discharge|leaves|leaving|release/i.test(sentence)) || text;
  const ageMatch = text.match(/(?:age|aged)\s*(\d{2})|\b(\d{2})\s*(?:yo|years old)\b/i);
  const phoneMatch = text.match(/(?:phone|cell)\s*(?:is|:)?\s*([+()\-\d\s]{10,})/i);
  const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);

  return {
    full_name: findName(text),
    age: Number(ageMatch?.[1] || ageMatch?.[2] || 0) || '',
    phone: compact(phoneMatch?.[1] || ''),
    email: emailMatch?.[0] || '',
    discharge_date: detectDate(dischargeSentence, now),
    emergency_contact_name: emergency.name,
    emergency_contact_phone: emergency.phone,
    facility_name: '',
    primary_recovery_category: detectRecoveryCategory(lower),
    substance_type: detectRecoveryCategory(lower),
    housing_status: lower.includes('sober living') ? 'sober living confirmation needed' : lower.includes('shelter') ? 'shelter support needed' : lower.includes('housing') ? 'housing support needed' : '',
    transportation_status: /bus|ride|transport|no car|uber|lyft/.test(lower) ? 'transportation support needed' : '',
    employment_status: /job|employment|resume|interview|workforce/.test(lower) ? 'employment support needed' : '',
    legal_status: lower.includes('probation') ? 'probation' : lower.includes('parole') ? 'parole' : lower.includes('court') ? 'court requirements' : '',
    veteran_status: lower.includes('veteran') ? 'veteran' : '',
  };
}

function eventTypeFor(sentence) {
  const lower = sentence.toLowerCase();
  if (/iop|php|outpatient|treatment|group/.test(lower)) return ['treatment', /php/.test(lower) ? 'PHP Session' : /group/.test(lower) ? 'Treatment Group' : 'IOP Session'];
  if (/therapy|therapist|counseling/.test(lower)) return ['therapy', 'Therapy Appointment'];
  if (/doctor|clinic|mat|medication management|psychiatric|provider/.test(lower)) return ['health', /mat/.test(lower) ? 'MAT Follow-Up' : 'Health Follow-Up'];
  if (/probation|parole/.test(lower)) return ['legal', lower.includes('parole') ? 'Parole Check-In' : 'Probation Check-In'];
  if (/court/.test(lower)) return ['legal', 'Court Date'];
  if (/drug test|urine|screen/.test(lower)) return ['legal', 'Drug Testing Requirement'];
  if (/case manager|case management/.test(lower)) return ['case_management', 'Case Management Appointment'];
  return ['appointment', 'Aftercare Appointment'];
}

function locationFor(sentence) {
  const atMatch = sentence.match(/\bat\s+([^,.]+(?:Center|Clinic|Office|Court|House|Hall|Church|Hospital|IOP|Recovery|Probation|Department)?)/i);
  return compact(atMatch?.[1] || '');
}

function recurrenceFor(sentence, days) {
  const lower = sentence.toLowerCase();
  if (/daily|every day|nightly|each morning/.test(lower)) return 'daily';
  if (/second\s+\w+day|2nd\s+\w+day/.test(lower)) return 'every second week';
  if (/monthly/.test(lower)) return 'monthly';
  if (/biweekly|every other/.test(lower)) return 'biweekly';
  if (/weekly|every|mondays|tuesdays|wednesdays|thursdays|fridays|saturdays|sundays/.test(lower) || days.length) return 'weekly';
  return 'one-time';
}

function extractAppointments(sentences, basics, now) {
  const appointmentSentences = sentences.filter((sentence) => /iop|php|outpatient|therapy|therapist|counseling|doctor|clinic|mat|medication management|psychiatric|probation|parole|court|drug test|urine|screen|case manager|case management/i.test(sentence));

  const appointments = [];
  appointmentSentences.forEach((sentence) => {
    const days = detectDays(sentence);
    const [event_type, defaultTitle] = eventTypeFor(sentence);
    const start_time = detectTime(sentence);
    const recurrence = recurrenceFor(sentence, days);
    const base = {
      title: defaultTitle,
      event_title: defaultTitle,
      event_type,
      start_time,
      end_time: '',
      location: locationFor(sentence),
      notes: sentence,
      reminder_time: '1 hour before',
      recurrence,
      transportation_needed: /bus|ride|transport|no car|uber|lyft/.test(sentence.toLowerCase()) || !!basics.transportation_status,
      needs_review: !start_time || (!days.length && !detectDate(sentence, now)),
    };

    if (days.length) {
      days.forEach((day) => {
        appointments.push({
          ...base,
          title: `${defaultTitle} (${titleCase(day)})`,
          event_title: `${defaultTitle} (${titleCase(day)})`,
          date: nextDateForDay(day, now),
          day: titleCase(day),
        });
      });
    } else {
      appointments.push({
        ...base,
        date: detectDate(sentence, now) || basics.discharge_date || addDays(now, 1),
      });
    }
  });

  return uniqueBy(appointments, (item) => `${item.title}|${item.date}|${item.start_time}`);
}

function supportTypeFor(sentence) {
  const lower = sentence.toLowerCase();
  if (/\bna\b|narcotics anonymous/.test(lower)) return ['NA', 'NA Meeting'];
  if (/\baa\b|alcoholics anonymous/.test(lower)) return ['AA', 'AA Meeting'];
  if (/smart/.test(lower)) return ['SMART Recovery', 'SMART Recovery Meeting'];
  if (/sponsor/.test(lower)) return ['Sponsor', 'Sponsor Call'];
  if (/peer mentor|mentor|recovery coach/.test(lower)) return ['Peer Support', 'Peer Support Check-In'];
  return ['Support', 'Recovery Support'];
}

function extractSupport(sentences, now) {
  const support = [];
  sentences.filter((sentence) => /\bna\b|\baa\b|smart|meeting|sponsor|peer mentor|recovery coach/i.test(sentence)).forEach((sentence) => {
    const [support_type, name] = supportTypeFor(sentence);
    const days = detectDays(sentence);
    const schedule = days.length ? `${days.map(titleCase).join(', ')} ${detectTime(sentence) || ''}`.trim() : compact(sentence.match(/(\d+x per week|twice weekly|weekly|nightly|daily|each morning)/i)?.[1] || 'Weekly');
    support.push({
      support_type,
      name,
      schedule,
      location: locationFor(sentence),
      notes: sentence,
      status: 'active',
      start_date: days[0] ? nextDateForDay(days[0], now) : addDays(now, 1),
    });
  });
  return uniqueBy(support, (item) => `${item.support_type}|${item.schedule}`);
}

function extractLegal(sentences, now) {
  const legal = [];
  sentences.filter((sentence) => /probation|parole|court|drug test|urine|screen|legal/i.test(sentence)).forEach((sentence) => {
    const lower = sentence.toLowerCase();
    const days = detectDays(sentence);
    const appointment_date = days[0] ? nextDateForDay(days[0], now) : detectDate(sentence, now);
    const due_date = lower.includes('court') && !appointment_date ? detectDate(sentence, now) : '';
    legal.push({
      requirement_type: lower.includes('probation') ? 'probation' : lower.includes('parole') ? 'parole' : lower.includes('court') ? 'court' : /drug test|urine|screen/.test(lower) ? 'drug_testing' : 'legal',
      title: lower.includes('probation') ? 'Probation Check-In' : lower.includes('parole') ? 'Parole Check-In' : lower.includes('court') ? 'Court Requirement' : /drug test|urine|screen/.test(lower) ? 'Drug Testing Requirement' : 'Legal Requirement',
      appointment_date,
      due_date,
      due_time: detectTime(sentence),
      notes: sentence,
      reminder_enabled: true,
      status: 'active',
    });
  });
  return uniqueBy(legal, (item) => `${item.requirement_type}|${item.appointment_date}|${item.due_date}`);
}

function extractTransportation(sentences, appointments, basics, now) {
  const transportSentences = sentences.filter((sentence) => /bus|ride|transport|no car|uber|lyft|pickup|drop off|route/i.test(sentence));
  const destinations = appointments.filter((item) => item.transportation_needed).map((item) => item.location || item.title);
  if (!transportSentences.length && !destinations.length) return [];

  const destinationText = destinations.length ? uniqueStrings(destinations).join('; ') : 'Required appointments';
  return [{
    pickup_location: 'Client residence',
    destination: destinationText,
    requested_date: basics.discharge_date || addDays(now, 1),
    requested_time: '',
    transportation_type: /bus/i.test(transportSentences.join(' ')) ? 'bus route planning' : 'ride support',
    status: 'requested',
    notes: transportSentences[0] || 'Confirm route, pickup windows, and leave-time reminders.',
  }];
}

function extractReminders(sentences, basics, now) {
  const reminders = [];
  const lower = sentences.join(' ').toLowerCase();

  if (/medication|meds|dose|mat|suboxone|methadone/.test(lower)) {
    const sentence = sentences.find((item) => /medication|meds|dose|mat|suboxone|methadone/i.test(item)) || '';
    reminders.push({
      title: 'Medication Reminder',
      reminder_title: 'Medication Reminder',
      reminder_type: 'health',
      message: 'Medication reminder as directed by the client provider.',
      scheduled_date: basics.discharge_date || addDays(now, 1),
      scheduled_time: detectTime(sentence, '9:00 AM'),
      recurrence: /daily|every|morning|night|bedtime/i.test(sentence) ? 'daily' : 'as scheduled',
      delivery_method: 'in_app',
      active: true,
      priority: 'high',
      notes: sentence,
    });
  }

  if (/daily check|check-in|check in|mood|craving/.test(lower)) {
    const sentence = sentences.find((item) => /daily check|check-in|check in|mood|craving/i.test(item)) || '';
    reminders.push({
      title: 'Daily Check-In',
      reminder_title: 'Daily Check-In',
      reminder_type: 'check_in',
      message: 'Complete mood, craving, safety, and next-step check-in.',
      scheduled_date: basics.discharge_date || addDays(now, 1),
      scheduled_time: detectTime(sentence, '8:00 PM'),
      recurrence: 'daily',
      delivery_method: 'in_app',
      active: true,
      priority: 'high',
      notes: sentence || 'Daily check-in created by S.E.E.',
    });
  }

  if (/sponsor|peer mentor|recovery coach/.test(lower)) {
    const sentence = sentences.find((item) => /sponsor|peer mentor|recovery coach/i.test(item)) || '';
    reminders.push({
      title: 'Accountability Contact',
      reminder_title: 'Accountability Contact',
      reminder_type: 'support',
      message: 'Reach out to sponsor, peer mentor, or recovery support contact.',
      scheduled_date: basics.discharge_date || addDays(now, 1),
      scheduled_time: detectTime(sentence, '7:00 PM'),
      recurrence: /daily|nightly/.test(sentence.toLowerCase()) ? 'daily' : 'weekly',
      delivery_method: 'in_app',
      active: true,
      priority: 'medium',
      notes: sentence,
    });
  }

  return uniqueBy(reminders, (item) => `${item.reminder_type}|${item.scheduled_time}|${item.recurrence}`);
}

function extractGoalsAndTasks(sentences, basics, now) {
  const tasks = [
    {
      task_title: 'Complete daily recovery check-in',
      task_category: 'check_in',
      description: 'Track mood, cravings, safety, medication adherence, and next best step.',
      due_date: basics.discharge_date || addDays(now, 1),
      due_time: '8:00 PM',
      recurrence: 'daily',
      priority: 'high',
    },
  ];

  const goals = [
    {
      goal_title: 'Stabilize first week after discharge',
      category: 'recovery',
      target_date: addDays(now, 7),
      success_measure: 'Appointments, check-ins, transportation, and support contacts are confirmed.',
      priority: 'high',
    },
  ];

  const addTaskGoal = (test, task) => {
    const sentence = sentences.find((item) => test.test(item));
    if (!sentence) return;
    tasks.push({
      task_title: task.title,
      task_category: task.category,
      description: sentence,
      due_date: basics.discharge_date || addDays(now, task.days || 1),
      due_time: task.time || '',
      recurrence: task.recurrence || 'weekly',
      priority: task.priority || 'medium',
    });
    goals.push({
      goal_title: task.goal,
      category: task.category,
      target_date: addDays(now, task.goalDays || 30),
      success_measure: task.measure,
      priority: task.priority || 'medium',
    });
  };

  addTaskGoal(/job|employment|resume|interview|workforce/i, {
    title: 'Job search action step',
    goal: 'Build employment momentum',
    category: 'employment',
    measure: 'Resume, applications, or workforce appointment completed each week.',
  });
  addTaskGoal(/housing|sober living|shelter|rent/i, {
    title: 'Confirm safe housing plan',
    goal: 'Secure stable housing path',
    category: 'housing',
    measure: 'Housing option, backup plan, and contact person are documented.',
    priority: 'high',
  });
  addTaskGoal(/benefits|medicaid|snap|food|insurance/i, {
    title: 'Benefits and basic needs follow-up',
    goal: 'Stabilize basic needs',
    category: 'resources',
    measure: 'Benefits, insurance, food, or resource applications are started.',
  });
  addTaskGoal(/id|license|birth certificate|documents/i, {
    title: 'Document recovery step',
    goal: 'Replace critical documents',
    category: 'reentry',
    measure: 'ID, license, or required documents are requested.',
  });
  addTaskGoal(/family|child|parent|relationship/i, {
    title: 'Family support step',
    goal: 'Rebuild safe support connections',
    category: 'relationships',
    measure: 'A safe contact plan or family session is scheduled.',
  });

  return {
    tasks: uniqueBy(tasks, (item) => `${item.task_category}|${item.task_title}`),
    goals: uniqueBy(goals, (item) => `${item.category}|${item.goal_title}`),
  };
}

function extractCheckIns(reminders, basics, now) {
  const dailyReminder = reminders.find((item) => item.reminder_type === 'check_in');
  return [{
    title: 'Daily Recovery Check-In',
    cadence: 'daily',
    scheduled_time: dailyReminder?.scheduled_time || '8:00 PM',
    start_date: basics.discharge_date || addDays(now, 1),
    metrics: ['mood', 'cravings', 'safety', 'medication', 'appointments', 'wins'],
    escalation_rule: 'Flag counselor if two check-ins are missed, craving score is high, or safety concern is reported.',
    owner: 'client',
  }];
}

function addRisk(risks, risk_type, severity, description, suggested_action) {
  risks.push({ risk_type, severity, description, suggested_action, counselor_reviewed: false });
}

function extractRiskFactors(text, basics, appointments, support, legal, transportation) {
  const lower = text.toLowerCase();
  const risks = [];

  if (/suicid|self harm|unsafe|overdose|violence|weapon/.test(lower)) {
    addRisk(risks, 'Immediate safety language', 'Urgent', 'The notes include safety language that needs direct counselor review.', 'Review safety plan immediately and use emergency protocols when appropriate.');
  }
  if (!basics.housing_status) addRisk(risks, 'Housing gap', 'High', 'Housing status is not documented.', 'Confirm safe housing and backup plan before discharge.');
  if (!basics.emergency_contact_name) addRisk(risks, 'Emergency contact missing', 'Moderate', 'No emergency contact is listed.', 'Add emergency contact or document counselor override.');
  if (appointments.length && !transportation.length) addRisk(risks, 'Transportation gap', 'Moderate', 'Required appointments exist without transportation support.', 'Confirm route, ride support, or telehealth fallback.');
  if (legal.length && legal.some((item) => !item.appointment_date && !item.due_date)) addRisk(risks, 'Legal schedule incomplete', 'High', 'Legal obligations are mentioned without confirmed dates.', 'Confirm legal schedule and create high-priority reminders.');
  if (!support.length) addRisk(risks, 'Support schedule missing', 'Moderate', 'No recovery meetings or support contacts were found.', 'Add AA, NA, SMART, sponsor, peer mentor, or counselor support.');
  if (/trigger|craving|lonely|isolation|old friends|old people|old places|stress|money|anger|boredom/.test(lower)) addRisk(risks, 'Trigger profile', 'High', 'High-risk trigger language was mentioned.', 'Review triggers, coping plan, and accountability contacts with client.');
  if (/medication|mat|suboxone|methadone/.test(lower) && !/doctor|provider|clinic|mat/.test(lower)) addRisk(risks, 'Medication follow-up unclear', 'Moderate', 'Medication reminders are mentioned without a provider follow-up.', 'Confirm provider instructions and follow-up appointment.');

  return uniqueBy(risks, (item) => `${item.risk_type}|${item.severity}`);
}

function buildWeeklyItinerary(appointments, support, reminders, tasks, checkIns) {
  const rows = [];
  appointments.forEach((item) => rows.push({
    day: item.day || (item.date ? new Date(`${item.date}T12:00:00`).toLocaleDateString('en-US', { weekday: 'long' }) : 'Scheduled'),
    time: item.start_time || 'Time TBD',
    title: item.title || item.event_title,
    type: 'calendar_event',
    location: item.location || '',
    transportation_needed: !!item.transportation_needed,
    notes: item.notes || '',
  }));
  support.forEach((item) => rows.push({
    day: item.schedule || 'Weekly',
    time: detectTime(item.schedule) || 'Time TBD',
    title: item.name,
    type: 'support',
    location: item.location || '',
    transportation_needed: false,
    notes: item.notes || '',
  }));
  checkIns.forEach((item) => rows.push({
    day: 'Daily',
    time: item.scheduled_time,
    title: item.title,
    type: 'check_in',
    location: 'In app',
    transportation_needed: false,
    notes: item.escalation_rule,
  }));
  reminders.filter((item) => item.reminder_type !== 'check_in').forEach((item) => rows.push({
    day: titleCase(item.recurrence || 'Scheduled'),
    time: item.scheduled_time || 'Time TBD',
    title: item.title || item.reminder_title,
    type: 'reminder',
    location: 'In app',
    transportation_needed: false,
    notes: item.message || '',
  }));
  tasks.filter((item) => item.task_category !== 'check_in').forEach((item) => rows.push({
    day: titleCase(item.recurrence || 'Weekly'),
    time: item.due_time || 'Flexible',
    title: item.task_title,
    type: 'task',
    location: '',
    transportation_needed: false,
    notes: item.description || '',
  }));
  return rows;
}

export function extractSeeWorkflow(rawText, options = {}) {
  const now = options.now ? new Date(options.now) : new Date();
  const text = compact(rawText);
  const sentences = splitNotes(text);
  const basics = buildBasics(text, sentences, now);
  const appointments = extractAppointments(sentences, basics, now);
  const recoverySupport = extractSupport(sentences, now);
  const legal = extractLegal(sentences, now);
  const transportation = extractTransportation(sentences, appointments, basics, now);
  const reminders = extractReminders(sentences, basics, now);
  const { tasks, goals } = extractGoalsAndTasks(sentences, basics, now);
  const checkIns = extractCheckIns(reminders, basics, now);
  const risks = extractRiskFactors(text, basics, appointments, recoverySupport, legal, transportation);
  const weeklyItinerary = buildWeeklyItinerary(appointments, recoverySupport, reminders, tasks, checkIns);

  const missing = [];
  if (!basics.discharge_date) missing.push('No discharge date provided');
  if (!basics.emergency_contact_name) missing.push('No emergency contact listed');
  if (!basics.housing_status) missing.push('No housing status');
  if (appointments.some((item) => item.needs_review)) missing.push('Some appointment dates or times need confirmation');
  if (!transportation.length && appointments.some((item) => item.transportation_needed)) missing.push('No transportation plan');
  if (!recoverySupport.length) missing.push('No recovery meetings or support contacts scheduled');
  if (legal.length && legal.some((item) => !item.appointment_date && !item.due_date)) missing.push('No legal requirement dates');

  const confidence = Math.max(48, Math.min(96, 94 - missing.length * 6 + Math.min(weeklyItinerary.length, 8)));

  return {
    extracted_client_basics: basics,
    extracted_appointments: appointments,
    extracted_recovery_support: recoverySupport,
    extracted_legal_requirements: legal,
    extracted_transportation_needs: transportation,
    extracted_housing_needs: basics.housing_status ? [{ title: 'Housing Stability', description: basics.housing_status, priority: 'high' }] : [],
    extracted_employment_needs: basics.employment_status ? [{ title: 'Employment Support', description: basics.employment_status, priority: 'medium' }] : [],
    extracted_health_needs: reminders.filter((item) => item.reminder_type === 'health'),
    extracted_reminders: reminders,
    extracted_tasks: tasks,
    extracted_check_ins: checkIns,
    extracted_risk_factors: risks,
    extracted_goals: goals,
    weekly_itinerary: weeklyItinerary,
    missing_information: missing,
    suggested_next_steps: uniqueStrings([
      'Review missing information with client',
      'Approve or edit each plan section',
      'Execute to create calendar events, reminders, tasks, transportation requests, check-ins, and risk flags',
      risks.some((risk) => risk.severity === 'Urgent') ? 'Address urgent safety language before routine execution' : '',
    ]),
    confidence_score: confidence,
  };
}

export function engineerSeePlan(extraction = {}) {
  const basics = extraction.extracted_client_basics || {};
  const clientName = basics.full_name || 'Client';
  const risks = extraction.extracted_risk_factors || [];
  const missing = extraction.missing_information || [];
  const riskLevel = risks.some((risk) => risk.severity === 'Urgent') ? 'Urgent' : risks.some((risk) => risk.severity === 'High') ? 'High' : risks.length ? 'Moderate' : 'Low';

  return {
    plan_title: `${clientName} S.E.E. Aftercare Plan`,
    recovery_category: basics.primary_recovery_category || 'general life stability',
    summary: `Structured aftercare plan for ${clientName} covering calendar events, reminders, tasks, transportation needs, goals, check-ins, risk indicators, and weekly itinerary items.`,
    clinical_disclaimer: DISCLAIMER,
    client_visible_summary: 'Your plan organizes appointments, reminders, support meetings, daily check-ins, goals, transportation help, and safety support steps.',
    weekly_itinerary: extraction.weekly_itinerary || [],
    required_appointments: extraction.extracted_appointments || [],
    reminder_plan: extraction.extracted_reminders || [],
    task_plan: extraction.extracted_tasks || extraction.extracted_goals || [],
    transportation_plan: extraction.extracted_transportation_needs || [],
    goal_plan: extraction.extracted_goals || [],
    check_in_plan: extraction.extracted_check_ins || [],
    daily_routine: extraction.extracted_tasks || extraction.extracted_goals || [],
    recovery_support_schedule: extraction.extracted_recovery_support || [],
    legal_schedule: extraction.extracted_legal_requirements || [],
    housing_stability_plan: extraction.extracted_housing_needs || [],
    employment_education_plan: extraction.extracted_employment_needs || [],
    wellness_plan: extraction.extracted_health_needs || [],
    emergency_plan: {
      crisis_contacts: basics.emergency_contact_name ? [{ name: basics.emergency_contact_name, phone: basics.emergency_contact_phone || '' }] : [],
      relapse_warning_signs: uniqueStrings(['Cravings', 'Isolation', 'Unsafe people or places', 'High stress', ...risks.map((risk) => risk.risk_type)]),
      coping_steps: ['Call a support person', 'Attend a meeting or safe peer space', 'Use grounding or breathing exercise', 'Move to a safer location', 'Contact counselor if risk escalates'],
      safe_places: ['Recovery meeting', 'Counselor office', 'Trusted family/support location', 'Treatment provider'],
      people_to_call: uniqueStrings([basics.emergency_contact_name, 'Counselor', 'Sponsor / peer mentor']),
      emergency_services_info: 'Call local emergency services or crisis support immediately if safety is at risk.',
      overdose_prevention_notes: 'Follow provider guidance and local harm-reduction resources; this app does not provide medical advice.',
    },
    risk_flags: risks,
    risk_level: riskLevel,
    roadmap_30_60_90: [
      { phase: 'First week stabilization', items: ['Attend required appointments', 'Complete daily check-ins', 'Confirm housing and transportation', 'Make accountability contacts'] },
      { phase: '30-day foundation', items: ['Maintain support meetings', 'Complete job/housing/resource steps', 'Review risk flags weekly', 'Adjust reminders based on attendance'] },
      { phase: '60-day consistency', items: ['Build routine consistency', 'Track progress trends', 'Reduce missed appointments', 'Strengthen support network'] },
      { phase: '90-day independence', items: ['Maintain legal compliance', 'Advance employment or education goals', 'Refresh relapse prevention plan', 'Set longer-term stability goals'] },
    ],
    client_motivation_plan: ['Stay connected to support', 'Complete daily check-ins', 'Protect recovery routine', 'Follow legal and health commitments', 'Build stable housing/work path'],
    counselor_follow_up_plan: uniqueStrings(['Review missing information', 'Approve plan sections', 'Monitor weekly progress', 'Follow up on risk flags', missing.length ? `Resolve: ${missing.join('; ')}` : 'No critical gaps detected']),
    approved_sections: [],
  };
}

export function buildSeeExecutionSummary(plan = {}, extraction = {}) {
  const appointments = plan.required_appointments || [];
  const reminders = plan.reminder_plan || plan.wellness_plan || [];
  const tasks = plan.task_plan || plan.daily_routine || [];
  const transportation = plan.transportation_plan || [];
  const goals = plan.goal_plan || [];
  const checkIns = plan.check_in_plan || [];
  const risks = plan.risk_flags || extraction.extracted_risk_factors || [];

  return {
    calendarEvents: appointments.length,
    reminders: reminders.length,
    dailyTasks: tasks.length,
    transportationNeeds: transportation.length,
    goals: goals.length,
    checkIns: checkIns.length,
    riskFlags: risks.length,
    weeklyItems: (plan.weekly_itinerary || []).length,
    missingItems: (extraction.missing_information || []).length,
  };
}
