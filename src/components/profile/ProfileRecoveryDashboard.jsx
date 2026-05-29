import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { CheckCircle2, Flame, History, Target } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';

function daysBetween(dateA, dateB) {
  return Math.round((new Date(dateB) - new Date(dateA)) / 86400000);
}

function calculateStreak(checkIns) {
  const dates = [...new Set(checkIns.map((item) => item.check_in_date).filter(Boolean))].sort().reverse();
  if (!dates.length) return 0;

  let streak = 1;
  for (let i = 0; i < dates.length - 1; i += 1) {
    if (daysBetween(dates[i + 1], dates[i]) === 1) streak += 1;
    else break;
  }
  return streak;
}

export default function ProfileRecoveryDashboard() {
  const [checkIns, setCheckIns] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      const user = await base44.auth.me();
      const [userCheckIns, userGoals] = await Promise.all([
        base44.entities.DailyCheckIn.filter({ participant_email: user.email }, '-check_in_date', 14),
        base44.entities.Goal.filter({ participant_email: user.email }, '-updated_date', 50),
      ]);
      setCheckIns(userCheckIns || []);
      setGoals(userGoals || []);
      setLoading(false);
    }
    loadDashboard();
  }, []);

  const stats = useMemo(() => {
    const completedGoals = goals.filter((goal) => goal.status === 'completed').length;
    const sobrietyGoal = goals.find((goal) => goal.category === 'recovery_milestone');
    const sobrietyStreak = sobrietyGoal?.current_days || sobrietyGoal?.streak || calculateStreak(checkIns);
    const chartData = [...checkIns].reverse().map((item) => ({
      date: item.check_in_date?.slice(5) || '',
      mood: item.mood_rating || 0,
      stress: item.stress_level || 0,
      craving: item.craving_intensity || 0,
      support: (item.attended_meeting ? 1 : 0) + (item.connected_with_sponsor ? 1 : 0),
    }));
    return { completedGoals, sobrietyStreak, chartData };
  }, [checkIns, goals]);

  if (loading) {
    return <div className="card-soft p-5 mb-5 skeleton h-64" />;
  }

  return (
    <section className="card p-5 mb-6 space-y-5">
      <div>
        <p className="section-label">Recovery snapshot</p>
        <h2 className="text-2xl font-semibold">Your progress dashboard</h2>
        <p className="text-sm text-slate-300 mt-1">Sobriety momentum, goals, and recent check-ins at a glance.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="card-soft p-4">
          <Flame className="w-5 h-5 text-amber-300 mb-3" />
          <p className="text-3xl font-bold">{stats.sobrietyStreak}</p>
          <p className="text-sm text-slate-300">day sobriety streak</p>
        </div>
        <div className="card-soft p-4">
          <Target className="w-5 h-5 text-blue-300 mb-3" />
          <p className="text-3xl font-bold">{stats.completedGoals}</p>
          <p className="text-sm text-slate-300">completed goals</p>
        </div>
        <div className="card-soft p-4">
          <History className="w-5 h-5 text-emerald-300 mb-3" />
          <p className="text-3xl font-bold">{checkIns.length}</p>
          <p className="text-sm text-slate-300">recent check-ins</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card-soft p-4 min-h-[240px]">
          <h3 className="font-sans text-base font-bold mb-3">Mood, stress, and cravings</h3>
          {stats.chartData.length ? (
            <ResponsiveContainer width="100%" height={190}>
              <LineChart data={stats.chartData}>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ background: '#0D1220', border: '1px solid rgba(180,205,255,0.18)', borderRadius: 14 }} />
                <Line type="monotone" dataKey="mood" stroke="#34D399" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="stress" stroke="#F0B753" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="craving" stroke="#F87171" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-slate-300">No check-ins yet. Your chart will appear after your first check-in.</p>}
        </div>

        <div className="card-soft p-4 min-h-[240px]">
          <h3 className="font-sans text-base font-bold mb-3">Support actions</h3>
          {stats.chartData.length ? (
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={stats.chartData}>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#0D1220', border: '1px solid rgba(180,205,255,0.18)', borderRadius: 14 }} />
                <Bar dataKey="support" fill="#5B8DEF" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-slate-300">Meeting and sponsor connection history will show here.</p>}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-sans text-base font-bold">Recent check-ins</h3>
        {checkIns.slice(0, 4).map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <div>
              <p className="font-bold">{item.check_in_date}</p>
              <p className="text-xs text-slate-400">Mood {item.mood_rating}/5 • Stress {item.stress_level ?? 0}/10 • Cravings {item.craving_intensity ?? 0}/10</p>
            </div>
            <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
          </div>
        ))}
      </div>
    </section>
  );
}