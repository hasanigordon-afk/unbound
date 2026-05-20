import React, { useState } from 'react';
import PilotShell from '@/components/pilot/PilotShell';
import SEENotesIntake from '@/components/see/SEENotesIntake';
import SEEProcessingAnimation from '@/components/see/SEEProcessingAnimation';
import SEEDashboardCards from '@/components/see/SEEDashboardCards';
import SEERoadmap from '@/components/see/SEERoadmap';

const sampleNotes = 'Client has IOP Mondays and Wednesdays at 6 PM, probation check-in every Friday at 10 AM, needs bus support to appointments, NA meetings Tuesday and Saturday, sponsor calls nightly, housing referral this week, job search goal, medication reminders each morning, and counselor check-in every Thursday afternoon.';

const generatedRoadmap = {
  appointments: ['IOP every Monday and Wednesday at 6:00 PM', 'Counselor check-in Thursday afternoon', 'Discharge follow-up within 72 hours'],
  meetings: ['NA meeting Tuesday evening', 'NA meeting Saturday morning', 'Send meeting alert 2 hours before start'],
  probation: ['Probation check-in every Friday at 10:00 AM', 'Reminder Thursday night and Friday morning'],
  transportation: ['Suggest bus route for IOP appointment windows', 'Flag Friday probation ride support', 'Add backup ride contact'],
  goals: ['Secure housing referral this week', 'Complete job search action plan', 'Maintain sponsor contact routine'],
  reminders: ['Morning medication reminder', 'Nightly sponsor call reminder', 'Daily recovery check-in at 8:00 PM'],
  actions: ['Attend assigned meetings', 'Journal after evening check-in', 'Confirm transportation before appointments'],
};

export default function SEESuperAgent() {
  const [notes, setNotes] = useState(sampleNotes);
  const [processing, setProcessing] = useState(false);
  const [showRoadmap, setShowRoadmap] = useState(true);

  const processNotes = () => {
    setProcessing(true);
    setShowRoadmap(false);
    setTimeout(() => {
      setProcessing(false);
      setShowRoadmap(true);
    }, 1400);
  };

  return (
    <PilotShell title="S.E.E. Super Agent" subtitle="Simplify counselor notes, execute the roadmap, and empower client accountability.">
      <div className="space-y-5">
        <section className="rounded-[38px] border border-white/12 bg-gradient-to-br from-white/14 via-blue-400/10 to-violet-400/10 p-6 shadow-2xl backdrop-blur-2xl">
          <p className="text-sm font-black text-blue-200">AI-powered aftercare onboarding</p>
          <h1 className="mt-3 font-sans text-4xl font-black tracking-tight">Turn one note into a complete recovery roadmap.</h1>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-300">S.E.E. extracts appointments, meetings, probation needs, transportation gaps, support contacts, goals, reminders, and accountability actions from natural-language counselor notes.</p>
        </section>

        <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
          <SEENotesIntake notes={notes} setNotes={setNotes} onProcess={processNotes} processing={processing} />
          <SEEProcessingAnimation processing={processing} />
        </div>

        <SEEDashboardCards />
        {showRoadmap && <SEERoadmap roadmap={generatedRoadmap} />}
      </div>
    </PilotShell>
  );
}