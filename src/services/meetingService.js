import { createEntity, filterEntity, listEntity, matchesText } from './serviceUtils';
import { distanceMiles } from './resourceService';

export async function searchMeetings(filters = {}) {
  let meetings = await listEntity('Meeting', []);
  if (filters.meetingType) {
    meetings = meetings.filter((meeting) => (meeting.meeting_type || meeting.program_type) === filters.meetingType);
  }
  if (filters.query) meetings = meetings.filter((meeting) => matchesText({
    name: meeting.name || meeting.title,
    category: meeting.program_type,
    description: meeting.notes,
    address: meeting.address,
    city: meeting.city,
    state: meeting.state,
    zip: meeting.zip,
  }, filters.query));
  if (filters.dayOfWeek !== '' && filters.dayOfWeek != null) {
    meetings = meetings.filter((meeting) => Number(meeting.day_of_week) === Number(filters.dayOfWeek));
  }
  if (filters.onlineOnly) meetings = meetings.filter((meeting) => meeting.url || meeting.online_url || meeting.in_person === false);

  return meetings
    .map((meeting) => ({ ...meeting, name: meeting.name || meeting.title, meeting_type: meeting.meeting_type || meeting.program_type, distance: distanceMiles(filters.location, meeting) }))
    .sort((a, b) => (a.distance ?? 99999) - (b.distance ?? 99999));
}

export async function getNearbyMeetings(location, filters = {}) {
  return searchMeetings({ ...filters, location });
}

export async function saveMeeting(user, meeting) {
  if (!user?.email) throw new Error('Sign in is required to save a meeting.');
  return createEntity('MeetingFavorite', {
    user_email: user.email,
    meeting_id: meeting.id,
    meeting_name: meeting.name || meeting.title,
  });
}

export async function syncMeetingFeeds() {
  return {
    status: 'not_configured',
    message: 'Meeting feed sync requires a configured Meeting Guide-compatible feed or admin CSV import.',
  };
}
