import { calculateStreak, getCheckInHistory, getTodayCheckIns } from './checkInService';
import { get90DayGoals } from './goalService';
import { getSupportConnections } from './supportSystemService';
import { getTodayTasks, getWeeklyTasks } from './taskService';
import { filterEntity, startOfWeek, endOfWeek } from './serviceUtils';

export async function getWeeklyItinerary(user) {
  if (!user?.email) return [];
  const start = startOfWeek();
  const end = endOfWeek();
  const items = await filterEntity('WeeklyItineraryItem', { user_email: user.email }, []);
  return items
    .filter((item) => {
      const at = new Date(item.start_datetime);
      return at >= start && at < end;
    })
    .sort((a, b) => new Date(a.start_datetime) - new Date(b.start_datetime));
}

export async function getTodayDashboard(user, profile) {
  const [todayCheckIns, checkInHistory, todayTasks, weeklyTasks, itinerary, goals, supportConnections] = await Promise.all([
    getTodayCheckIns(user),
    getCheckInHistory(user),
    getTodayTasks(user),
    getWeeklyTasks(user, startOfWeek(), endOfWeek()),
    getWeeklyItinerary(user),
    get90DayGoals(user),
    getSupportConnections(user),
  ]);

  const recoveryDay = profile?.recovery_start_date
    ? Math.max(0, Math.floor((Date.now() - new Date(profile.recovery_start_date).getTime()) / 86400000) + 1)
    : null;

  return {
    todayCheckIns,
    checkInHistory,
    todayTasks,
    weeklyTasks,
    itinerary,
    goals,
    supportConnections,
    streak: calculateStreak(checkInHistory),
    recoveryDay,
    lastCheckIn: checkInHistory.sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at))[0] || null,
  };
}

export async function getDashboardSummary(user, profile) {
  return getTodayDashboard(user, profile);
}

export async function getProgressStats(user) {
  const history = await getCheckInHistory(user);
  return {
    streak: calculateStreak(history),
    checkInsCompleted: history.length,
    meetingsAttended: history.filter((item) => item.meeting_attended).length,
  };
}
