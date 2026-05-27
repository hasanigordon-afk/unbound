import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  EyeOff,
  FileHeart,
  LockKeyhole,
  MessageSquareText,
  Presentation,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
  UsersRound,
} from 'lucide-react';
import PilotShell from '@/components/pilot/PilotShell';
import {
  demoAftercarePlans,
  demoClients,
  demoCounselorAccounts,
  demoFacility,
  demoMessages,
  demoPresentationChecklist,
  demoProgressReports,
  onboardingWalkthrough,
  privacyGuardrails,
} from '@/lib/rehabPilotDemoData';

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'clients', label: 'Clients' },
  { id: 'aftercare', label: 'Aftercare' },
  { id: 'privacy', label: 'Privacy' },
  { id: 'walkthrough', label: 'Walkthrough' },
];

function DemoCard({ children, className = '' }) {
  return <section className={`rounded-[30px] border border-white/12 bg-white/10 p-5 shadow-2xl backdrop-blur-2xl ${className}`}>{children}</section>;
}

function Stat({ label, value, detail, icon: Icon }) {
  return (
    <DemoCard>
      <Icon className="mb-4 h-6 w-6 text-blue-200" />
      <p className="font-sans text-4xl font-black text-white">{value}</p>
      <p className="mt-1 text-sm font-black text-slate-100">{label}</p>
      <p className="mt-1 text-xs font-bold leading-relaxed text-slate-400">{detail}</p>
    </DemoCard>
  );
}

function SectionHeader({ eyebrow, title, description }) {
  return (
    <div className="mb-4">
      <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-200/75">{eyebrow}</p>
      <h2 className="mt-1 font-sans text-3xl font-black tracking-tight text-white">{title}</h2>
      {description && <p className="mt-2 max-w-3xl text-sm font-bold leading-relaxed text-slate-300">{description}</p>}
    </div>
  );
}

function RiskBadge({ risk }) {
  const color = risk === 'low' ? 'bg-emerald-300/15 text-emerald-100 border-emerald-200/20' : risk === 'medium' ? 'bg-amber-300/15 text-amber-100 border-amber-200/20' : 'bg-rose-300/15 text-rose-100 border-rose-200/20';
  return <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${color}`}>{risk}</span>;
}

export default function PilotDemo() {
  const [activeTab, setActiveTab] = useState('overview');
  const currentPlan = demoAftercarePlans[0];

  const summary = useMemo(() => {
    const averageGoal = Math.round(demoProgressReports.reduce((sum, report) => sum + report.goal_completion, 0) / demoProgressReports.length);
    const checkins = demoProgressReports.reduce((sum, report) => sum + report.checkins, 0);
    const appointments = demoProgressReports.reduce((sum, report) => sum + report.appointments, 0);
    return { averageGoal, checkins, appointments };
  }, []);

  return (
    <PilotShell
      title="Rehab Pilot Demo"
      subtitle="Presentation-ready demo mode with synthetic facility, counselor, client, aftercare, reporting, and messaging data."
    >
      <div className="space-y-6">
        <DemoCard className="overflow-hidden bg-gradient-to-br from-blue-400/20 via-white/10 to-emerald-300/12">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200/20 bg-emerald-300/12 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-emerald-100">
                <Presentation className="h-4 w-4" /> Demo mode on
              </div>
              <h1 className="font-sans text-4xl font-black tracking-tight text-white lg:text-5xl">{demoFacility.facility_name}</h1>
              <p className="mt-3 max-w-3xl text-base font-bold leading-relaxed text-slate-300">
                {demoFacility.facility_type} in {demoFacility.city}, {demoFacility.state}. {demoFacility.privacy_note}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link to="/FacilityPilotDashboard" className="rounded-full bg-white px-5 py-3 text-sm font-black text-slate-950 active:scale-95">Open counselor dashboard</Link>
                <Link to="/AftercarePlanView" className="rounded-full border border-white/14 bg-white/10 px-5 py-3 text-sm font-black text-white active:scale-95">Open aftercare plan</Link>
              </div>
            </div>
            <div className="grid min-w-[260px] gap-3 rounded-[28px] border border-white/12 bg-slate-950/25 p-4">
              {demoPresentationChecklist.map((item) => (
                <div key={item} className="flex gap-3 text-sm font-bold text-slate-200">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-200" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </DemoCard>

        <div className="-mx-4 overflow-x-auto px-4">
          <div className="flex min-w-max gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`min-h-0 rounded-full px-4 py-2 text-sm font-black transition ${activeTab === tab.id ? 'bg-white text-slate-950' : 'border border-white/10 bg-white/8 text-slate-200'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Stat icon={UsersRound} label="Pilot clients" value={demoClients.length} detail={`${demoFacility.active_clients} active clients across the facility`} />
              <Stat icon={UserRoundCheck} label="Demo counselors" value={demoCounselorAccounts.length} detail="Counselor, aftercare, and peer roles included" />
              <Stat icon={BarChart3} label="Goal completion" value={`${summary.averageGoal}%`} detail="Average across sample progress reports" />
              <Stat icon={ClipboardList} label="Weekly check-ins" value={summary.checkins} detail={`${summary.appointments} appointments captured in reports`} />
            </div>

            <DemoCard>
              <SectionHeader eyebrow="Facility data" title="Pilot-ready facility profile" description="Use this synthetic profile during sales, training, and partner review without exposing production data." />
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-[24px] bg-white/8 p-4">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">Pilot cohort</p>
                  <p className="mt-1 font-sans text-2xl font-black text-white">{demoFacility.pilot_cohort}</p>
                  <p className="mt-2 text-sm font-bold text-slate-300">{demoFacility.licensed_beds} licensed beds at {demoFacility.address}</p>
                </div>
                <div className="rounded-[24px] bg-white/8 p-4">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">Programs included</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {demoFacility.programs.map((program) => <span key={program} className="rounded-full bg-blue-300/15 px-3 py-1 text-xs font-black text-blue-100">{program}</span>)}
                  </div>
                </div>
              </div>
            </DemoCard>

            <DemoCard>
              <SectionHeader eyebrow="Counselor accounts" title="Demo staff logins and roles" />
              <div className="grid gap-3 lg:grid-cols-3">
                {demoCounselorAccounts.map((account) => (
                  <div key={account.email} className="rounded-[24px] border border-white/10 bg-white/8 p-4">
                    <p className="font-sans text-lg font-black text-white">{account.name}</p>
                    <p className="mt-1 text-xs font-black uppercase tracking-widest text-emerald-100">{account.role}</p>
                    <p className="mt-3 text-sm font-bold text-slate-300">{account.focus}</p>
                    <p className="mt-3 rounded-2xl bg-slate-950/35 p-3 text-xs font-bold text-slate-300">{account.email}</p>
                  </div>
                ))}
              </div>
            </DemoCard>
          </div>
        )}

        {activeTab === 'clients' && (
          <DemoCard>
            <SectionHeader eyebrow="Client profiles" title="Synthetic client cohort" description="Profiles show readiness, practical needs, and support permissions without real patient identifiers." />
            <div className="grid gap-3 lg:grid-cols-3">
              {demoClients.map((client) => (
                <article key={client.id} className="rounded-[26px] border border-white/10 bg-white/8 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-sans text-xl font-black text-white">{client.display_name}</p>
                      <p className="text-xs font-bold text-slate-400">{client.stage} - {client.days_sober} days</p>
                    </div>
                    <RiskBadge risk={client.risk} />
                  </div>
                  <div className="mt-4 space-y-3 text-sm font-bold leading-relaxed text-slate-300">
                    <p>{client.recovery_focus}</p>
                    <p><span className="text-blue-100">Housing:</span> {client.housing_status}</p>
                    <p><span className="text-blue-100">Next step:</span> {client.next_step}</p>
                  </div>
                </article>
              ))}
            </div>
          </DemoCard>
        )}

        {activeTab === 'aftercare' && (
          <div className="space-y-5">
            <DemoCard>
              <SectionHeader eyebrow="Aftercare example" title={currentPlan.generated_plan_json.title} description={currentPlan.generated_plan_json.participant_snapshot} />
              <div className="grid gap-3 md:grid-cols-3">
                {['immediate_72h', 'week1_actions', 'goals_30day'].map((key) => (
                  <div key={key} className="rounded-[24px] bg-white/8 p-4">
                    <p className="mb-3 text-xs font-black uppercase tracking-widest text-amber-100">{key.replaceAll('_', ' ')}</p>
                    <ul className="space-y-2">
                      {currentPlan.generated_plan_json[key].map((item) => (
                        <li key={item} className="flex gap-2 text-sm font-bold text-slate-300">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-200" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <Link to="/AftercarePlanView" className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-slate-950">
                View full aftercare plan <ArrowRight className="h-4 w-4" />
              </Link>
            </DemoCard>

            <DemoCard>
              <SectionHeader eyebrow="Progress reports" title="Shareable weekly summaries" description="Reports distinguish what supporters can see from what stays private." />
              <div className="space-y-3">
                {demoProgressReports.map((report) => (
                  <div key={report.client} className="rounded-[24px] border border-white/10 bg-white/8 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-sans text-lg font-black text-white">{report.client}</p>
                        <p className="text-xs font-bold text-slate-400">{report.week}</p>
                      </div>
                      <span className="rounded-full bg-emerald-300/15 px-3 py-1 text-xs font-black text-emerald-100">{report.goal_completion}% goals</span>
                    </div>
                    <p className="mt-3 text-sm font-bold text-slate-300">{report.report_summary}</p>
                  </div>
                ))}
              </div>
            </DemoCard>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="space-y-5">
            <DemoCard>
              <SectionHeader eyebrow="Privacy-safe messaging" title="Audience-labeled support messages" description="Messages show useful recovery support while making consent and visibility clear." />
              <div className="space-y-3">
                {demoMessages.map((message) => (
                  <div key={message.id} className="rounded-[24px] border border-white/10 bg-white/8 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="font-sans text-lg font-black text-white">{message.sender} <span className="text-sm text-slate-400">to {message.audience}</span></p>
                      <span className="rounded-full bg-blue-300/15 px-3 py-1 text-xs font-black text-blue-100">{message.privacy_label}</span>
                    </div>
                    <p className="mt-2 text-sm font-bold leading-relaxed text-slate-300">{message.message}</p>
                    <p className="mt-2 text-xs font-bold text-slate-500">{message.role} - {message.timestamp}</p>
                  </div>
                ))}
              </div>
            </DemoCard>

            <DemoCard>
              <SectionHeader eyebrow="Guardrails" title="What stays protected" />
              <div className="grid gap-3 md:grid-cols-2">
                {privacyGuardrails.map((rule, index) => {
                  const Icon = index % 2 === 0 ? LockKeyhole : EyeOff;
                  return (
                    <div key={rule} className="flex gap-3 rounded-[22px] bg-slate-950/30 p-4 text-sm font-bold leading-relaxed text-slate-200">
                      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-200" />
                      {rule}
                    </div>
                  );
                })}
              </div>
            </DemoCard>
          </div>
        )}

        {activeTab === 'walkthrough' && (
          <DemoCard>
            <SectionHeader eyebrow="Onboarding walkthrough" title="Pilot implementation story" description="A simple presentation path from facility setup to client support and reporting." />
            <div className="grid gap-3 lg:grid-cols-4">
              {onboardingWalkthrough.map((step) => (
                <div key={step.step} className="rounded-[26px] border border-white/10 bg-white/8 p-4">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-950 font-black">{step.step}</div>
                  <p className="font-sans text-lg font-black text-white">{step.title}</p>
                  <p className="mt-2 text-sm font-bold leading-relaxed text-slate-300">{step.detail}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <Link to="/PilotClientIntake" className="rounded-[24px] border border-white/10 bg-white/8 p-4 font-black text-white"><UserRoundCheck className="mb-3 h-6 w-6 text-blue-200" />Client intake</Link>
              <Link to="/PilotTreatmentPlan" className="rounded-[24px] border border-white/10 bg-white/8 p-4 font-black text-white"><FileHeart className="mb-3 h-6 w-6 text-emerald-200" />Treatment plan input</Link>
              <Link to="/ParticipantMessages" className="rounded-[24px] border border-white/10 bg-white/8 p-4 font-black text-white"><MessageSquareText className="mb-3 h-6 w-6 text-amber-200" />Messaging demo</Link>
            </div>
          </DemoCard>
        )}

        <DemoCard className="bg-gradient-to-r from-emerald-300/15 to-blue-400/15">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-8 w-8 text-emerald-200" />
              <div>
                <p className="font-sans text-xl font-black text-white">Presentation-safe by default</p>
                <p className="text-sm font-bold text-slate-300">Synthetic cohort, explicit privacy labels, and no live PHI required.</p>
              </div>
            </div>
            <Sparkles className="hidden h-10 w-10 text-blue-200 sm:block" />
          </div>
        </DemoCard>
      </div>
    </PilotShell>
  );
}
