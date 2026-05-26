import { createEntity, filterEntity, todayISO, updateEntity } from './serviceUtils';

export const goalPhases = [
  { id: 'stabilize', label: 'Days 1-14: Stabilize' },
  { id: 'build_routine', label: 'Days 15-30: Build Routine' },
  { id: 'strengthen_support', label: 'Days 31-60: Strengthen Support' },
  { id: 'independence_growth', label: 'Days 61-90: Independence & Growth' },
];

export async function get90DayGoals(user) {
  if (!user?.email) return [];
  const goals = await filterEntity('NinetyDayGoal', { user_email: user.email }, []);
  return goals.filter((goal) => goal.status !== 'archived');
}

export async function createGoal(user, payload) {
  if (!user?.email) throw new Error('Sign in is required to create a goal.');
  return createEntity('NinetyDayGoal', {
    user_id: user.id,
    user_email: user.email,
    phase: 'stabilize',
    start_date: todayISO(),
    status: 'active',
    progress_percent: 0,
    milestones_json: [],
    ...payload,
  });
}

export async function updateGoalProgress(goalId, progressPercent) {
  return updateEntity('NinetyDayGoal', goalId, { progress_percent: Number(progressPercent) });
}

export async function completeGoal(goalId) {
  return updateEntity('NinetyDayGoal', goalId, { status: 'completed', progress_percent: 100 });
}

export async function archiveGoal(goalId) {
  return updateEntity('NinetyDayGoal', goalId, { status: 'archived' });
}
