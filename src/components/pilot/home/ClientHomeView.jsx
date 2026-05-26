import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { CalendarDays, CheckCircle2, HeartPulse, Loader2, Plus, Shield, Target, UserRound, Users } from 'lucide-react';
import { createCheckIn } from '@/services/checkInService';
import { getTodayDashboard } from '@/services/dashboardService';
import { createGoal, goalPhases, updateGoalProgress } from '@/services/goalService';
import { getCurrentUserProfile, updateProfile } from '@/services/profileService';
import { createSupportConnection } from '@/services/supportSystemService';
import { completeTask, createTask } from '@/services/taskService';
import { todayISO } from '@/services/serviceUtils';

const card = 'rounded-[30px] border border-white/12 bg-white/10 p-5 shadow-xl backdrop-blur-2xl';
const input = 'w-full rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-sm font-bold text-white placeholder:text-slate-500';

function InlineEmpty({ children }) {
  return <p className="rounded-2xl border border-white/10 bg-white/8 p-4 text-sm font-bold text-slate-300">{children}</p>;
}

export default function ClientHomeView() {
  const queryClient = useQueryClient();
  const [checkInType, setCheckInType] = useState(null);
  const [checkInForm, setCheckInForm] = useState({ mood_score: 3, craving_score: 0, notes: '' });
  const [taskTitle, setTaskTitle] = useState('');
  const [goalTitle, setGoalTitle] = useState('');
  const [supportName, setSupportName] = useState('');
  const [supportRole, setSupportRole] = useState('sponsor');

  const profileQuery = useQuery({ queryKey: ['current-user-profile'], queryFn: getCurrentUserProfile });
  const user = profileQuery.data?.user;
  const profile = profileQuery.data?.profile;
  const dashboardQuery = useQuery({
    queryKey: ['today-dashboard', user?.email, profile?.id],
    queryFn: () => getTodayDashboard(user, profile),
    enabled: !!user?.email,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['today-dashboard'] });
    queryClient.invalidateQueries({ queryKey: ['current-user-profile'] });
  };

  const checkInMutation = useMutation({
    mutationFn: () => createCheckIn(user, {
      check_in_type: checkInType,
      mood_score: checkInType === 'mood' ? Number(checkInForm.mood_score) : undefined,
      craving_score: checkInType === 'craving' ? Number(checkInForm.craving_score) : undefined,
      meeting_attended: checkInType === 'meeting',
      notes: checkInForm.notes,
    }),
    onSuccess: () => {
      setCheckInType(null);
      setCheckInForm({ mood_score: 3, craving_score: 0, notes: '' });
      invalidate();
    },
  });

  const taskMutation = useMutation({
    mutationFn: () => createTask(user, { title: taskTitle, due_date: todayISO() }),
    onSuccess: () => { setTaskTitle(''); invalidate(); },
  });
  const completeTaskMutation = useMutation({ mutationFn: completeTask, onSuccess: invalidate });
  const goalMutation = useMutation({ mutationFn: () => createGoal(user, { title: goalTitle }), onSuccess: () => { setGoalTitle(''); invalidate(); } });
  const progressMutation = useMutation({ mutationFn: ({ id, progress }) => updateGoalProgress(id, progress), onSuccess: invalidate });
  const supportMutation = useMutation({ mutationFn: () => createSupportConnection(user, { name: supportName, role: supportRole }), onSuccess: () => { setSupportName(''); invalidate(); } });
  const recoveryDateMutation = useMutation({ mutationFn: (date) => updateProfile(profile.id, { recovery_start_date: date }), onSuccess: invalidate });

  if (profileQuery.isLoading || dashboardQuery.isLoading) {
    return <div className={card}><Loader2 className="h-5 w-5 animate-spin" /> Loading your dashboard...</div>;
  }

  if (profileQuery.error || dashboardQuery.error) {
    return <div className={card}>Dashboard could not load. {profileQuery.error?.message || dashboardQuery.error?.message}</div>;
  }

  const dashboard = dashboardQuery.data || {};
  const todayCheckInTypes = new Set((dashboard.todayCheckIns || []).map((item) => item.check_in_type));

  return (
    <div className="space-y-5">
      <section className={`${card} bg-gradient-to-br from-white/14 via-blue-500/10 to-emerald-400/10`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-200/80">Today Dashboard</p>
            <h2 className="mt-2 font-sans text-4xl font-black text-white">Hi {profile?.first_name || 'there'}.</h2>
            <p className="mt-2 text-sm font-bold text-slate-300">
              {dashboard.recoveryDay ? `Recovery day ${dashboard.recoveryDay}` : 'Add your recovery start date to calculate clean time.'}
              {dashboard.lastCheckIn ? ` Last check-in: ${new Date(dashboard.lastCheckIn.completed_at).toLocaleString()}.` : ' No check-ins yet today.'}
            </p>
          </div>
          <Link to="/Profile" className="rounded-2xl border border-white/12 bg-white/10 px-4 py-3 text-sm font-black text-white"><UserRound className="mr-2 inline h-4 w-4" />Profile</Link>
        </div>
        {!profile?.recovery_start_date && (
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <input type="date" className={input} onChange={(e) => e.target.value && recoveryDateMutation.mutate(e.target.value)} />
          </div>
        )}
        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          {[
            ['mood', 'Mood', HeartPulse],
            ['craving', 'Craving', Shield],
            ['meeting', 'Meeting', Users],
            ['medication', 'Medication', CheckCircle2],
          ].map(([type, label, Icon]) => (
            <button key={type} onClick={() => setCheckInType(type)} className={`min-h-[84px] rounded-3xl border px-4 text-left active:scale-95 ${todayCheckInTypes.has(type) ? 'border-emerald-300/40 bg-emerald-300/15' : 'border-white/10 bg-white/8'}`}>
              <Icon className="h-5 w-5 text-amber-100" />
              <span className="mt-2 block text-sm font-black text-white">{label}</span>
              <span className="text-xs font-bold text-slate-300">{todayCheckInTypes.has(type) ? 'Completed today' : 'Check in'}</span>
            </button>
          ))}
        </div>
      </section>

      {checkInType && (
        <section className={card}>
          <h3 className="font-sans text-2xl font-black text-white">Save {checkInType} check-in</h3>
          {checkInType === 'mood' && <input type="range" min="1" max="5" value={checkInForm.mood_score} onChange={(e) => setCheckInForm((f) => ({ ...f, mood_score: e.target.value }))} className="mt-4 w-full" />}
          {checkInType === 'craving' && <input type="range" min="0" max="10" value={checkInForm.craving_score} onChange={(e) => setCheckInForm((f) => ({ ...f, craving_score: e.target.value }))} className="mt-4 w-full" />}
          <textarea className={`${input} mt-3 min-h-[90px]`} value={checkInForm.notes} onChange={(e) => setCheckInForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Optional notes" />
          <div className="mt-3 flex gap-2">
            <button onClick={() => checkInMutation.mutate()} disabled={checkInMutation.isPending} className="btn-primary">Save check-in</button>
            <button onClick={() => setCheckInType(null)} className="btn-ghost">Cancel</button>
          </div>
        </section>
      )}

      <section className={card}>
        <div className="flex items-center justify-between gap-3"><h3 className="font-sans text-2xl font-black text-white">Today’s To-Do List</h3><span className="text-xs font-black text-blue-200">{dashboard.todayTasks?.length || 0} tasks</span></div>
        <div className="mt-4 flex gap-2">
          <input className={input} value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="Add today’s first step" />
          <button onClick={() => taskTitle.trim() && taskMutation.mutate()} className="rounded-2xl bg-white px-4 text-slate-950"><Plus className="h-5 w-5" /></button>
        </div>
        <div className="mt-4 space-y-2">
          {dashboard.todayTasks?.length ? dashboard.todayTasks.map((task) => (
            <div key={task.id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/8 p-3">
              <div><p className="font-black text-white">{task.title}</p><p className="text-xs font-bold text-slate-400">{task.priority} · {task.category}</p></div>
              {task.status === 'completed' ? <span className="text-xs font-black text-emerald-200">Done</span> : <button onClick={() => completeTaskMutation.mutate(task.id)} className="rounded-full bg-emerald-300 px-3 py-2 text-xs font-black text-slate-950">Complete</button>}
            </div>
          )) : <InlineEmpty>No tasks yet - add one or ask your counselor to assign one.</InlineEmpty>}
        </div>
      </section>

      <section className={card}>
        <h3 className="font-sans text-2xl font-black text-white">Weekly To-Do / Itinerary</h3>
        <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
          {(dashboard.itinerary?.length ? dashboard.itinerary : dashboard.weeklyTasks || []).map((item) => (
            <div key={`${item.id}-${item.title}`} className="min-w-[230px] rounded-3xl border border-white/10 bg-white/8 p-4">
              <CalendarDays className="h-5 w-5 text-blue-200" />
              <p className="mt-2 font-black text-white">{item.title}</p>
              <p className="mt-1 text-xs font-bold text-slate-300">{item.start_datetime ? new Date(item.start_datetime).toLocaleString() : item.due_date}</p>
            </div>
          ))}
          {!dashboard.itinerary?.length && !dashboard.weeklyTasks?.length && <InlineEmpty>No weekly itinerary yet. Add tasks here or import appointments when your care team is connected.</InlineEmpty>}
        </div>
      </section>

      <section className={card}>
        <h3 className="font-sans text-2xl font-black text-white">90-Day Goals</h3>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {goalPhases.map((phase) => <div key={phase.id} className="rounded-2xl border border-white/10 bg-white/8 p-3 text-xs font-black text-slate-200">{phase.label}</div>)}
        </div>
        <div className="mt-4 flex gap-2">
          <input className={input} value={goalTitle} onChange={(e) => setGoalTitle(e.target.value)} placeholder="Add a real 90-day goal" />
          <button onClick={() => goalTitle.trim() && goalMutation.mutate()} className="rounded-2xl bg-white px-4 text-slate-950"><Target className="h-5 w-5" /></button>
        </div>
        <div className="mt-4 space-y-3">
          {dashboard.goals?.length ? dashboard.goals.slice(0, 5).map((goal) => (
            <div key={goal.id} className="rounded-2xl border border-white/10 bg-white/8 p-4">
              <div className="flex items-center justify-between gap-3"><p className="font-black text-white">{goal.title}</p><button onClick={() => progressMutation.mutate({ id: goal.id, progress: Math.min(100, (goal.progress_percent || 0) + 10) })} className="text-xs font-black text-blue-200">+10%</button></div>
              <div className="mt-3 h-3 rounded-full bg-white/10"><div className="h-3 rounded-full bg-emerald-300" style={{ width: `${goal.progress_percent || 0}%` }} /></div>
            </div>
          )) : <InlineEmpty>No 90-day goals yet. Create one goal for the Stabilize phase to start.</InlineEmpty>}
        </div>
      </section>

      <section className={card}>
        <h3 className="font-sans text-2xl font-black text-white">Support System</h3>
        <p className="mt-1 text-sm font-bold text-slate-300">Contact and progress sharing stay permission-based.</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_150px_auto]">
          <input className={input} value={supportName} onChange={(e) => setSupportName(e.target.value)} placeholder="Name" />
          <select className={input} value={supportRole} onChange={(e) => setSupportRole(e.target.value)}><option value="sponsor">Sponsor</option><option value="counselor">Counselor</option><option value="peer_mentor">Peer mentor</option><option value="family">Family/friend</option><option value="emergency_contact">Emergency contact</option></select>
          <button onClick={() => supportName.trim() && supportMutation.mutate()} className="rounded-2xl bg-white px-4 font-black text-slate-950">Add</button>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {dashboard.supportConnections?.length ? dashboard.supportConnections.map((connection) => (
            <div key={connection.id} className="rounded-2xl border border-white/10 bg-white/8 p-4">
              <p className="font-black text-white">{connection.name}</p>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-100/80">{connection.role}</p>
              <div className="mt-3 flex gap-2">{connection.phone && <a href={`tel:${connection.phone}`} className="rounded-full bg-white px-3 py-2 text-xs font-black text-slate-950">Call</a>}{connection.email && <a href={`mailto:${connection.email}`} className="rounded-full border border-white/10 px-3 py-2 text-xs font-black text-white">Email</a>}</div>
            </div>
          )) : <InlineEmpty>No support people yet. Add a counselor, sponsor, peer mentor, or emergency contact.</InlineEmpty>}
        </div>
      </section>
    </div>
  );
}