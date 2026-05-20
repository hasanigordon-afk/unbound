import React from 'react';
import { ClipboardCheck, HeartPulse, MapPinned, ShieldCheck, UserRound, UsersRound, BriefcaseMedical, Building2, Flame, Target, LifeBuoy } from 'lucide-react';
import PilotShell from '@/components/pilot/PilotShell';
import PilotCard from '@/components/pilot/PilotCard';

const pillars = [
  { title: 'Recovery accountability', body: 'Daily check-ins, missed-check-in visibility, and calm relapse-prevention support.', icon: ClipboardCheck, tone: 'blue' },
  { title: 'Aftercare continuity', body: 'Counselor-entered treatment plans become simple client next steps after discharge.', icon: ShieldCheck, tone: 'green' },
  { title: 'Stability resources', body: 'Local recovery, housing, employment, food, legal, and reentry support in one place.', icon: MapPinned, tone: 'gold' },
  { title: 'Human support', body: 'Emergency calm tools, sponsors, mentors, counselors, and facility follow-up workflows.', icon: HeartPulse, tone: 'violet' },
];

const roles = [
  { title: 'Client App', body: 'Client-facing intake, check-ins, Top 5 goals, resources, and emergency calm support.', icon: UserRound, to: '/PilotClientIntake', tone: 'blue' },
  { title: 'Counselor View', body: 'Review saved intakes, enter treatment details, and build aftercare plans faster.', icon: BriefcaseMedical, to: '/FacilityPilotDashboard', tone: 'green' },
  { title: 'Sponsors / mentors', body: 'Support accountability, goals, and follow-up without overwhelming the client.', icon: UsersRound, to: '/TopFiveNonNegotiables', tone: 'violet' },
  { title: 'Facility admins', body: 'Track engagement, missed check-ins, follow-up needs, and pilot outcomes.', icon: Building2, to: '/FacilityPilotDashboard', tone: 'gold' },
];

const modules = [
  { label: 'Daily check-ins', to: '/DailyCheckIn', icon: Flame },
  { label: 'Top 5 goals', to: '/TopFiveNonNegotiables', icon: Target },
  { label: 'Resources', to: '/RecoveryMapFinder', icon: MapPinned },
  { label: 'Emergency calm', to: '/MySafetyPlan', icon: LifeBuoy },
];

export default function PilotHome() {
  return (
    <PilotShell title="Facility Pilot" subtitle="A calm mobile-first recovery operating system for treatment and sober living teams.">
      <section className="rounded-[34px] bg-white/10 border border-white/12 p-6 shadow-2xl backdrop-blur-2xl mb-5">
        <p className="text-sm text-blue-200 font-bold mb-3">Pilot-ready healthcare tech</p>
        <h2 className="text-4xl font-semibold font-sans tracking-tight leading-tight">Recovery support that feels simple enough to use every day.</h2>
        <p className="text-slate-300 mt-4 leading-relaxed">ReZilient helps facilities move clients from treatment planning to aftercare accountability without heavy onboarding or clutter.</p>
        <div className="grid grid-cols-2 gap-3 mt-5">
          {modules.map(({ label, to, icon: Icon }) => (
            <a key={label} href={to} className="min-h-[70px] rounded-3xl bg-white text-slate-950 flex items-center gap-3 px-4 font-bold active:scale-95 transition">
              <Icon className="w-5 h-5" /> {label}
            </a>
          ))}
        </div>
      </section>

      <h2 className="text-xl font-bold font-sans mb-3">Four core pillars</h2>
      <section className="grid md:grid-cols-2 gap-4 mb-7">
        {pillars.map((pillar) => <PilotCard key={pillar.title} {...pillar} />)}
      </section>

      <h2 className="text-xl font-bold font-sans mb-3">Choose your role</h2>
      <section className="grid md:grid-cols-2 gap-4">
        {roles.map((role) => <PilotCard key={role.title} {...role} action="Continue" />)}
      </section>
    </PilotShell>
  );
}