import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Activity, AlertTriangle, CheckCircle2, Clock3, ClipboardList, Eye, Mail, Phone, Target, UsersRound } from 'lucide-react';
import PilotShell from '@/components/pilot/PilotShell';
import { demoClients, demoCounselorAccounts, demoFacility, demoProgressReports } from '@/lib/rehabPilotDemoData';
import { appParams } from '@/lib/app-params';
import { hasBase44AppId } from '@/lib/demoRoutes';

const today = new Date().toISOString().slice(0, 10);

export default function FacilityPilotDashboard() {
  const [stats, setStats] = useState(null);
  const [intakes, setIntakes] = useState([]);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        if (!hasBase44AppId(appParams.appId)) throw new Error('Demo mode');
        const [clients, checkins, goals, resources, savedIntakes] = await Promise.all([
          base44.entities.ParticipantProfile.list('-updated_date', 200),
          base44.entities.DailyCheckIn.list('-created_date', 300),
          base44.entities.TopFiveNonNegotiable.list('-updated_date', 300),
          base44.entities.SavedResource.list('-created_date', 300),
          base44.entities.PilotClientIntake.list('-created_date', 50),
        ]);

        const completedToday = checkins.filter((item) => (item.checkin_date || item.created_date || '').slice(0, 10) === today).length;
        const uniqueCheckinUsers = new Set(checkins.map((item) => item.user_email || item.created_by).filter(Boolean));
        const missed = Math.max(0, clients.length - uniqueCheckinUsers.size);
        const goalsCompleted = goals.filter((goal) => Number(goal.progress || 0) >= 100).length;
        const followUp = checkins.filter((item) => Number(item.craving_level || item.mood_rating || 0) >= 7).length + missed;
        const latest = [...checkins, ...goals, ...resources].sort((a, b) => new Date(b.updated_date || b.created_date) - new Date(a.updated_date || a.created_date))[0];

        if (clients.length || savedIntakes.length || checkins.length) {
          setIntakes(savedIntakes.slice(0, 6));
          setStats({ clients: clients.length, intakes: savedIntakes.length, completedToday, missed, goalsCompleted, resourcesViewed: resources.length, followUp, latest: latest?.updated_date || latest?.created_date });
          return;
        }
      } catch {
        // Demo mode intentionally works without live facility data.
      }

      setIsDemo(true);
      const checkins = demoProgressReports.reduce((sum, report) => sum + report.checkins, 0);
      const goalsCompleted = demoProgressReports.filter((report) => report.goal_completion >= 80).length;
      const followUp = demoClients.filter((client) => client.risk !== 'low').length;
      setIntakes(demoClients);
      setStats({
        clients: demoFacility.active_clients,
        intakes: demoClients.length,
        completedToday: checkins,
        missed: 1,
        goalsCompleted,
        resourcesViewed: 24,
        followUp,
        latest: new Date().toISOString(),
      });
    };
    load();
  }, []);

  const cards = [
    { label: 'Total clients enrolled', value: stats?.clients ?? '—', icon: UsersRound, tone: 'bg-blue-400/15 text-blue-100' },
    { label: 'Saved intakes', value: stats?.intakes ?? '—', icon: ClipboardList, tone: 'bg-sky-400/15 text-sky-100' },
    { label: 'Completed check-ins', value: stats?.completedToday ?? '—', icon: CheckCircle2, tone: 'bg-emerald-400/15 text-emerald-100' },
    { label: 'Missed check-ins', value: stats?.missed ?? '—', icon: Clock3, tone: 'bg-amber-400/15 text-amber-100' },
    { label: 'Goals completed', value: stats?.goalsCompleted ?? '—', icon: Target, tone: 'bg-violet-400/15 text-violet-100' },
    { label: 'Resources viewed', value: stats?.resourcesViewed ?? '—', icon: Eye, tone: 'bg-cyan-400/15 text-cyan-100' },
    { label: 'Need follow-up', value: stats?.followUp ?? '—', icon: AlertTriangle, tone: 'bg-rose-400/15 text-rose-100' },
  ];

  return (
    <PilotShell title="Counselor View" subtitle="Saved client intakes, treatment planning, and facility-level follow-up in one place.">
      {isDemo && (
        <section className="mb-5 rounded-[28px] border border-emerald-200/20 bg-emerald-300/12 p-4 text-sm font-bold text-emerald-50">
          Demo mode - showing synthetic Harbor Recovery Center data for a privacy-safe rehab facility pilot.
          <Link to="/PilotDemo" className="ml-2 underline">Open presentation deck</Link>
        </section>
      )}

      <section className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {cards.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="rounded-[28px] bg-white/10 border border-white/12 p-4 backdrop-blur-2xl shadow-xl">
            <div className={`w-11 h-11 rounded-2xl ${tone} flex items-center justify-center mb-4`}><Icon className="w-5 h-5" /></div>
            <p className="text-3xl font-black font-sans tracking-tight">{value}</p>
            <p className="text-xs text-slate-300 mt-1 leading-snug">{label}</p>
          </div>
        ))}
      </section>

      <section className="rounded-[30px] bg-white/10 border border-white/12 p-5 mt-5 backdrop-blur-2xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/12 flex items-center justify-center"><Activity className="w-6 h-6" /></div>
          <div>
            <h2 className="text-lg font-bold font-sans">Last activity</h2>
            <p className="text-sm text-slate-300">{stats?.latest ? new Date(stats.latest).toLocaleString() : 'No activity recorded yet'}</p>
          </div>
        </div>
      </section>

      <section className="rounded-[30px] bg-white/10 border border-white/12 p-5 mt-5 backdrop-blur-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-400/15 text-emerald-100 flex items-center justify-center"><UsersRound className="w-6 h-6" /></div>
          <div>
            <h2 className="text-lg font-bold font-sans">Demo counselor accounts</h2>
            <p className="text-sm text-slate-300">Role-specific accounts for the facility pilot walkthrough.</p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {demoCounselorAccounts.map((account) => (
            <div key={account.email} className="rounded-3xl border border-white/10 bg-white/8 p-4">
              <p className="font-black font-sans text-white">{account.name}</p>
              <p className="text-xs text-emerald-100 font-black uppercase tracking-wider mt-1">{account.role}</p>
              <p className="text-sm text-slate-300 mt-2">{account.email}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[30px] bg-white/10 border border-white/12 p-5 mt-5 backdrop-blur-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-400/15 text-sky-100 flex items-center justify-center"><ClipboardList className="w-6 h-6" /></div>
          <div>
            <h2 className="text-lg font-bold font-sans">Saved client intakes</h2>
            <p className="text-sm text-slate-300">Intakes submitted from the Client App appear here.</p>
          </div>
        </div>
        <div className="space-y-3">
          {intakes.length === 0 ? (
            <p className="text-sm text-slate-300 rounded-2xl border border-white/10 bg-white/5 p-4">No saved intakes yet.</p>
          ) : intakes.map((client) => (
            <div key={client.id} className="rounded-3xl border border-white/10 bg-white/8 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-black font-sans text-white">{client.full_name}</p>
                  <p className="text-xs text-slate-400 mt-1">Submitted {client.created_date ? new Date(client.created_date).toLocaleDateString() : 'recently'}</p>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-sky-100 bg-sky-400/15 border border-sky-300/20 rounded-full px-3 py-1">Intake</span>
              </div>
              <div className="grid gap-2 mt-3 text-sm text-slate-300">
                {client.email && <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-sky-200" /> {client.email}</p>}
                {client.phone && <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-sky-200" /> {client.phone}</p>}
                {client.urgent_needs && <p className="text-amber-100 bg-amber-400/10 border border-amber-300/15 rounded-2xl p-3">{client.urgent_needs}</p>}
              </div>
            </div>
          ))}
        </div>
      </section>
    </PilotShell>
  );
}