import { createEntity, filterEntity, todayISO, updateEntity } from './serviceUtils';

export async function getTodayTasks(user) {
  if (!user?.email) return [];
  const tasks = await filterEntity('RecoveryTask', { user_email: user.email }, []);
  const today = todayISO();
  return tasks.filter((task) => task.due_date === today && task.status !== 'archived');
}

export async function getWeeklyTasks(user, weekStart, weekEnd) {
  if (!user?.email) return [];
  const tasks = await filterEntity('RecoveryTask', { user_email: user.email }, []);
  const start = weekStart.toISOString().slice(0, 10);
  const end = weekEnd.toISOString().slice(0, 10);
  return tasks.filter((task) => task.due_date >= start && task.due_date < end);
}

export async function createTask(user, payload) {
  if (!user?.email) throw new Error('Sign in is required to create a task.');
  return createEntity('RecoveryTask', {
    user_id: user.id,
    user_email: user.email,
    category: 'personal',
    priority: 'medium',
    status: 'pending',
    due_date: todayISO(),
    source: 'user_created',
    ...payload,
  });
}

export async function updateTask(taskId, updates) {
  return updateEntity('RecoveryTask', taskId, updates);
}

export async function completeTask(taskId) {
  return updateTask(taskId, { status: 'completed' });
}

export async function deleteTask(taskId) {
  return updateTask(taskId, { status: 'skipped' });
}
