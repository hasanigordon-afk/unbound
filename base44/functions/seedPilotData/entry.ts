import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const hoursWeekday = {
  mon: { open: '09:00', close: '16:00' },
  tue: { open: '09:00', close: '16:00' },
  wed: { open: '09:00', close: '16:00' },
  thu: { open: '09:00', close: '16:00' },
  fri: { open: '09:00', close: '16:00' },
};

const roles = [
  ['client', 'Client', 'client', ['view_own_plan', 'complete_checkins', 'save_resources', 'post_ah_ha_moments']],
  ['counselor', 'Counselor', 'staff', ['manage_clients', 'run_see_planner', 'view_risk_scores', 'message_clients']],
  ['sponsor', 'Sponsor', 'support', ['view_shared_progress', 'send_encouragement']],
  ['mentor', 'Mentor', 'support', ['request_matches', 'send_encouragement']],
  ['probation_officer', 'Probation Officer', 'staff', ['view_compliance', 'view_calendar', 'view_required_tasks']],
  ['veteran', 'Veteran', 'client', ['view_own_plan', 'save_veteran_resources', 'complete_checkins']],
  ['family_support', 'Family Support', 'support', ['view_shared_progress', 'send_encouragement']],
  ['facility_admin', 'Facility Admin', 'admin', ['manage_facility', 'manage_staff', 'view_pilot_dashboard']],
  ['returning_citizen', 'Returning Citizen', 'client', ['view_own_plan', 'save_resources', 'complete_checkins']],
  ['person_seeking_help', 'Person Seeking Help', 'client', ['view_resources', 'complete_checkins', 'ask_ai']],
];

const resources = [
  ['Franklin Food Bank', 'Food Resources', '224 Churchill Ave, Somerset, NJ 08873', 'Somerset', 40.5005, -74.4932, '732-246-0009', 'https://franklinfoodbank.org', true, false, true, 4.8, 'Food pantry, case referrals, and emergency household support.'],
  ['Somerset County Board of Social Services', 'Shelters', '73 E High St, Somerville, NJ 08876', 'Somerville', 40.5681, -74.6107, '908-526-8800', 'https://www.co.somerset.nj.us', true, false, true, 4.4, 'Housing, benefits, emergency assistance, and case management.'],
  ['Rutgers UBHC Recovery Support', 'Recovery Programs', '671 Hoes Ln W, Piscataway, NJ 08854', 'Piscataway', 40.5242, -74.4641, '800-969-5300', 'https://ubhc.rutgers.edu', false, false, true, 4.6, 'Behavioral health and recovery support navigation.'],
  ['Goodwill NYNJ Career Center', 'Jobs / Staffing Agencies', '191 US-22, Green Brook Township, NJ 08812', 'Green Brook', 40.5922, -74.4854, '732-968-5050', 'https://www.goodwillnynj.org', true, false, true, 4.5, 'Workforce readiness and reentry-friendly job support.'],
  ['VA New Jersey Health Care Access', 'Veteran Services', '385 Tremont Ave, East Orange, NJ 07018', 'East Orange', 40.7555, -74.2343, '973-676-1000', 'https://www.va.gov/new-jersey-health-care', true, true, true, 4.3, 'Veteran health care, benefits navigation, mental health, and transition support.'],
  ['Legal Services of Northwest Jersey', 'Legal Help', '90 Maple Ave, Somerville, NJ 08876', 'Somerville', 40.5697, -74.6131, '908-231-0840', 'https://www.lsnj.org', false, false, true, 4.4, 'Civil legal help, benefits issues, housing stability, and reentry legal guidance.'],
  ['NJ TRANSIT Access Link', 'Transportation', '1 Penn Plaza East, Newark, NJ 07105', 'Newark', 40.7346, -74.1642, '973-491-4224', 'https://www.njtransit.com/accessibility/access-link-ada-paratransit', true, false, false, 4.1, 'Transportation planning for eligible riders and appointment access.'],
  ['The Salvation Army New Brunswick', 'Community Outreach', '287 Handy St, New Brunswick, NJ 08901', 'New Brunswick', 40.4864, -74.4518, '732-545-1477', 'https://easternusa.salvationarmy.org/new-jersey/new-brunswick', true, false, true, 4.5, 'Emergency assistance, food, spiritual support, and community referrals.'],
];

const media = [
  {
    title: 'Three Minutes to Reset Before a Craving Wins',
    description: 'A short grounding video for the moment between impulse and action.',
    media_type: 'video',
    category: 'Recovery',
    source_name: 'ReZilient Care Team',
    source_url: 'https://www.youtube.com/results?search_query=grounding+exercise+craving+recovery',
    youtube_video_id: 'search-grounding-craving',
    thumbnail_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
    channel_name: 'ReZilient Care Team',
    duration_seconds: 180,
    tags: ['Help', 'Recovery', 'Craving', 'Calm'],
    tone: 'motivational',
    recovery_stage: 'early_recovery',
    moderation_status: 'approved',
    is_featured: true,
    is_positive_content: true,
    helpful_count: 27,
  },
  {
    title: 'Coming Home: First Week Reentry Structure',
    description: 'Practical steps for housing, phone calls, meetings, and the first job-search rhythm.',
    media_type: 'video',
    category: 'Reentry',
    source_name: 'ReZilient Field Guide',
    source_url: 'https://www.youtube.com/results?search_query=reentry+first+week+after+incarceration+support',
    youtube_video_id: 'search-reentry-first-week',
    thumbnail_url: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80',
    channel_name: 'ReZilient Field Guide',
    duration_seconds: 420,
    tags: ['Reentry', 'Structure', 'Employment', 'Hope'],
    tone: 'educational',
    recovery_stage: 'reentry',
    moderation_status: 'approved',
    is_featured: true,
    is_positive_content: true,
    helpful_count: 18,
  },
];

const readings = [
  {
    title: 'The First Day Does Not Need to Be Perfect',
    summary: 'A five-minute reminder that structure beats pressure when life is being rebuilt.',
    body: 'Start with food, a safe place, one support contact, and one honest check-in. Progress begins when today has a shape.',
    source_name: 'ReZilient',
    source_url: 'https://rezilient.app',
    author: 'ReZilient Care Team',
    category: 'Hope',
    tags: ['Help', 'Hope', 'Early Recovery'],
    reading_time_minutes: 5,
    tone: 'motivational',
    recovery_stage: 'early_recovery',
    moderation_status: 'approved',
    is_featured: true,
    is_positive_content: true,
    helpful_count: 34,
  },
  {
    title: 'How to Ask for Support Without Feeling Like a Burden',
    summary: 'A script-based guide for texting a sponsor, family member, mentor, or counselor.',
    body: 'Try: "I am having a hard hour, not a hard life. Can you check in with me for five minutes?" Clear asks make support easier to give.',
    source_name: 'ReZilient',
    source_url: 'https://rezilient.app',
    author: 'ReZilient Care Team',
    category: 'Healing',
    tags: ['Support Circle', 'Family', 'Sponsor'],
    reading_time_minutes: 4,
    tone: 'positive',
    recovery_stage: 'general',
    moderation_status: 'approved',
    is_featured: false,
    is_positive_content: true,
    helpful_count: 22,
  },
];

const moments = [
  ['The key was answering the first call', 'I kept waiting to feel ready. My Ah Ha Moment was realizing ready came after I answered my counselor and showed up to the meeting.', 'Hope', ['accountability', 'meetings', 'support']],
  ['A resume was more than paper', 'When my mentor helped me write my resume, I saw my life as skills instead of mistakes. That changed how I walked into the interview.', 'Healing', ['employment', 'mentor', 'reentry']],
  ['I did not have to transition alone', 'The VA appointment, peer group, and gym schedule finally belonged on one calendar. My Ah Ha Moment was seeing support as structure.', 'Help', ['veteran', 'calendar', 'structure']],
];

async function createMissing(entity: any, uniqueField: string, rows: Record<string, unknown>[]) {
  const existing = await entity.list('-created_date', 500).catch(() => []);
  const existingValues = new Set(existing.map((item: any) => item[uniqueField]));
  let created = 0;
  for (const row of rows) {
    if (existingValues.has(row[uniqueField])) continue;
    await entity.create(row);
    created += 1;
  }
  return created;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    await base44.auth.me();
    const resourceRows = resources.map(([name, category, address, city, latitude, longitude, phone, website, transportation_available, veteran_support, free_service, rating, notes]) => ({
      name,
      category,
      address,
      city,
      state: 'NJ',
      zip: String(address).slice(-5),
      latitude,
      longitude,
      phone,
      website,
      hours_json: hoursWeekday,
      hours_text: 'Mon-Fri 9:00 AM-4:00 PM',
      transportation_available,
      veteran_support,
      free_service,
      rating,
      notes,
    }));
    const momentRows = moments.map(([title, story, category, tags]) => ({
      title,
      story,
      category,
      tags,
      recovery_stage: 'general',
      moderation_status: 'approved',
      privacy: 'anonymous',
      is_positive_content: true,
      helpful_count: 10,
    }));
    const roleRows = roles.map(([key, label, dashboard_type, permissions]) => ({ key, label, dashboard_type, permissions, description: `${label} dashboard permissions for ReZilient.` }));

    const summary = {
      roles: await createMissing(base44.entities.Role, 'key', roleRows),
      resources: await createMissing(base44.entities.LocalResource, 'name', resourceRows),
      media: await createMissing(base44.entities.MediaItem, 'title', media),
      readings: await createMissing(base44.entities.ReadingItem, 'title', readings),
      ahHaMoments: await createMissing(base44.entities.AhHaInspirationStory, 'title', momentRows),
    };
    return Response.json({ ok: true, summary });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
});
