import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import PilotShell from '@/components/pilot/PilotShell';
import SEENotesIntake from '@/components/see/SEENotesIntake';
import SEEProcessingAnimation from '@/components/see/SEEProcessingAnimation';
import SEEDashboardCards from '@/components/see/SEEDashboardCards';
import GoogleCalendarSyncPanel from '@/components/see/GoogleCalendarSyncPanel';
import SEEReviewSection from '@/components/see/SEEReviewSection';
import SEEMobileHero from '@/components/see/SEEMobileHero';
import SEEClientSelector from '@/components/see/SEEClientSelector';
import { CheckCircle2 } from 'lucide-react';

const sampleNotes = 'Client has IOP Mondays and Wednesdays at 6 PM, probation check-in every Friday at 10 AM, needs bus support to appointments, NA meetings Tuesday and Saturday, sponsor calls nightly, housing referral this week, job search goal, medication reminders each morning, and counselor check-in every Thursday afternoon.';
const loadingSteps = ['Reading counselor notes…', 'Extracting recovery tasks…', 'Building calendar…', 'Creating reminders…', 'Checking transportation needs…', 'Finalizing client roadmap…'];
const makeItem = (data) => ({ id: crypto.randomUUID(), confirmed: false, ...data });

function parseNotes(notes) {
  const text = notes.toLowerCase();
  const needsReview = !/(\d{1,2}\s?(am|pm)|morning|afternoon|evening|nightly)/i.test(notes);
  const clientMatch = notes.match(/client\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
  const clientName = clientMatch?.[1] || 'Demo Client';

  const calendarEvents = [];
  const reminders = [];
  const transportation = [];
  const tasks = [];
  const goals = [];

  if (text.includes('iop') || text.includes('therapy')) calendarEvents.push(makeItem({ title: 'IOP / Therapy Session', category: 'treatment', schedule_text: 'Mondays and Wednesdays', recurrence: 'weekly', time_text: text.includes('6 pm') ? '6:00 PM' : '', needs_review: !text.includes('6 pm') }));
  if (text.includes('probation') || text.includes('court')) calendarEvents.push(makeItem({ title: 'Probation / Court Check-In', category: 'probation', schedule_text: 'Every Friday', recurrence: 'weekly', time_text: text.includes('10 am') ? '10:00 AM' : '', needs_review: !text.includes('10 am') }));
  if (text.includes('na meeting') || text.includes('aa') || text.includes('meetings')) calendarEvents.push(makeItem({ title: 'NA / Recovery Meetings', category: 'meeting', schedule_text: text.includes('tuesday') || text.includes('saturday') ? 'Tuesday and Saturday' : 'Weekly meeting schedule', recurrence: 'weekly', time_text: '', needs_review: true }));
  if (text.includes('counselor check')) calendarEvents.push(makeItem({ title: 'Counselor Follow-Up', category: 'follow_up', schedule_text: 'Every Thursday afternoon', recurrence: 'weekly', time_text: 'Afternoon', needs_review: true }));

  if (text.includes('sponsor')) reminders.push(makeItem({ title: 'Sponsor Call', frequency: 'Nightly', reminder_time: 'Evening', needs_review: false }));
  if (text.includes('medication')) reminders.push(makeItem({ title: 'Medication Reminder', frequency: 'Daily', reminder_time: 'Morning', needs_review: false }));
  reminders.push(makeItem({ title: 'Daily Recovery Check-In', frequency: 'Daily', reminder_time: '8:00 PM', needs_review: false }));

  if (text.includes('bus') || text.includes('transportation') || text.includes('ride')) transportation.push(makeItem({ title: 'Bus Support to Appointments', destination: 'Treatment / probation appointments', support_type: 'Bus route planning', schedule_text: 'Before scheduled appointments', needs_review: true }));

  if (text.includes('housing')) goals.push(makeItem({ title: 'Complete Housing Referral', category: 'housing', target: 'This week', needs_review: false }));
  if (text.includes('job')) goals.push(makeItem({ title: 'Start Job Search Goal', category: 'employment', target: 'Weekly applications and follow-up', needs_review: false }));
  goals.push(makeItem({ title: 'Maintain Weekly Recovery Routine', category: 'accountability', target: 'Meetings, sponsor contact, check-ins', needs_review: false }));

  tasks.push(makeItem({ title: 'Review extracted roadmap with client', category: 'follow_up', due_text: 'Before discharge', needs_review: false }));
  if (text.includes('housing')) tasks.push(makeItem({ title: 'Send housing referral to client dashboard', category: 'referral', due_text: 'This week', needs_review: false }));
  if (transportation.length) tasks.push(makeItem({ title: 'Confirm transportation plan', category: 'transportation', due_text: 'Before first appointment', needs_review: true }));

  return { clientName, calendarEvents, reminders, transportation, tasks, goals, needsReview };
}

export default function SEESuperAgent() {
  const [notes, setNotes] = useState(sampleNotes);
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [newClientName, setNewClientName] = useState('Demo Client');
  const [processing, setProcessing] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [review, setReview] = useState(null);

  useEffect(() => {
    base44.entities.Clients.list('-created_date', 50).then(setClients);
  }, []);

  const createClient = async () => {
    if (!newClientName.trim()) return;
    const client = await base44.entities.Clients.create({ full_name: newClientName.trim(), status: 'active' });
    setClients((prev) => [client, ...prev]);
    setSelectedClientId(client.id);
  };

  const generate = async () => {
    setError('');
    setSuccess('');
    if (!notes.trim()) return setError('Please enter counselor notes first.');
    if (!selectedClientId) return setError('Please select or create a client before generating a roadmap.');
    setProcessing(true);
    setReview(null);
    for (const step of loadingSteps) {
      setLoadingText(step);
      await new Promise((resolve) => setTimeout(resolve, 280));
    }
    setReview(parseNotes(notes));
    setProcessing(false);
    setLoadingText('');
  };

  const updateSection = (section, items) => setReview((prev) => ({ ...prev, [section]: items }));
  const editItem = (section, id) => {
    const value = prompt('Update item title');
    if (!value) return;
    updateSection(section, review[section].map((item) => item.id === id ? { ...item, title: value } : item));
  };
  const deleteItem = (section, id) => updateSection(section, review[section].filter((item) => item.id !== id));
  const confirmItem = (section, id) => updateSection(section, review[section].map((item) => item.id === id ? { ...item, confirmed: true } : item));

  const approveAndSave = async () => {
    if (!review || !selectedClientId) return;
    setProcessing(true);
    setLoadingText('Finalizing client roadmap…');
    const client = clients.find((item) => item.id === selectedClientId);
    const plan = await base44.entities.AftercarePlans.create({ client_id: selectedClientId, client_name: client?.full_name || review.clientName, source_notes: notes, needs_review: review.needsReview, roadmap_summary: 'S.E.E. generated roadmap with calendar, reminders, transportation, tasks, and goals.' });
    const attach = (items) => items.map(({ id, detail, ...item }) => ({ ...item, client_id: selectedClientId, plan_id: plan.id, confirmed: true }));
    const appointmentRows = review.calendarEvents.map((item) => ({
      client_id: selectedClientId,
      plan_id: plan.id,
      title: item.title,
      day: item.schedule_text?.split(' ')[0]?.replace(',', '') || '',
      time: item.time_text || '',
      location: item.category === 'meeting' ? 'Recovery meeting location' : item.category === 'follow_up' ? 'Phone / virtual' : 'Appointment location',
      category: item.category,
      status: 'scheduled',
      reminder_status: 'On',
      transportation_needed: review.transportation.length > 0,
      checkin_required: ['probation', 'treatment', 'follow_up'].includes(item.category),
      needs_review: item.needs_review,
    }));
    const [, , , , , , , , calendarSync] = await Promise.all([
      review.calendarEvents.length ? base44.entities.CalendarEvents.bulkCreate(attach(review.calendarEvents)) : Promise.resolve(),
      appointmentRows.length ? base44.entities.Appointments.bulkCreate(appointmentRows) : Promise.resolve(),
      review.reminders.length ? base44.entities.DailyReminders.bulkCreate(attach(review.reminders)) : Promise.resolve(),
      review.reminders.length ? base44.entities.Reminders.bulkCreate(review.reminders.map((item) => ({ client_id: selectedClientId, plan_id: plan.id, title: item.title, time: item.reminder_time, repeat: item.frequency?.toLowerCase() === 'daily' ? 'daily' : 'weekly', priority: 'medium', notes: item.frequency }))) : Promise.resolve(),
      review.transportation.length ? base44.entities.TransportationNeeds.bulkCreate(attach(review.transportation)) : Promise.resolve(),
      review.transportation.length ? base44.entities.TransportationRequests.bulkCreate(review.transportation.map((item) => ({ client_id: selectedClientId, plan_id: plan.id, appointment: item.title, destination: item.destination, pickup_time: item.schedule_text, ride_type: item.support_type, notes: 'Auto-created by S.E.E.', status: 'requested' }))) : Promise.resolve(),
      review.tasks.length ? base44.entities.CounselorTasks.bulkCreate(attach(review.tasks)) : Promise.resolve(),
      review.goals.length ? base44.entities.AccountabilityGoals.bulkCreate(attach(review.goals)) : Promise.resolve(),
      base44.functions.invoke('syncSeeCalendar', { clientName: client?.full_name || review.clientName, calendarEvents: review.calendarEvents, tasks: review.tasks }),
    ]);
    setProcessing(false);
    setLoadingText('');
    setSuccess(calendarSync?.data?.personalConnected === false ? 'S.E.E. Roadmap created and synced to the facility calendar. Connect the client calendar to sync personally.' : 'S.E.E. Roadmap Created Successfully and synced to Google Calendar.');
  };

  return (
    <PilotShell title="S.E.E. Super Agent" subtitle="Mobile recovery roadmap builder" activeView="counselor">
      <div className="space-y-5">
        <SEEMobileHero />

        <SEEClientSelector
          clients={clients}
          selectedClientId={selectedClientId}
          setSelectedClientId={setSelectedClientId}
          newClientName={newClientName}
          setNewClientName={setNewClientName}
          onCreateClient={createClient}
        />

        {error && <div className="rounded-3xl border border-rose-300/20 bg-rose-400/15 p-4 text-sm font-black text-rose-100">{error}</div>}
        {success && <div className="rounded-3xl border border-emerald-300/20 bg-emerald-400/15 p-4 text-sm font-black text-emerald-100 flex items-center gap-2"><CheckCircle2 className="h-5 w-5" />{success}</div>}

        <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
          <SEENotesIntake notes={notes} setNotes={setNotes} onProcess={generate} processing={processing} />
          <SEEProcessingAnimation processing={processing} />
        </div>
        {loadingText && <div className="rounded-3xl border border-blue-300/20 bg-blue-400/15 p-4 text-center text-sm font-black text-blue-100 animate-pulse">{loadingText}</div>}
        <SEEDashboardCards />
        <GoogleCalendarSyncPanel />

        {review && (
          <div className="space-y-5">
            <SEEReviewSection title="Extracted Calendar Events" items={review.calendarEvents} onEdit={(id) => editItem('calendarEvents', id)} onDelete={(id) => deleteItem('calendarEvents', id)} onConfirm={(id) => confirmItem('calendarEvents', id)} />
            <SEEReviewSection title="Daily Reminders" items={review.reminders} onEdit={(id) => editItem('reminders', id)} onDelete={(id) => deleteItem('reminders', id)} onConfirm={(id) => confirmItem('reminders', id)} />
            <SEEReviewSection title="Transportation Needs" items={review.transportation} onEdit={(id) => editItem('transportation', id)} onDelete={(id) => deleteItem('transportation', id)} onConfirm={(id) => confirmItem('transportation', id)} />
            <SEEReviewSection title="Accountability Goals" items={review.goals} onEdit={(id) => editItem('goals', id)} onDelete={(id) => deleteItem('goals', id)} onConfirm={(id) => confirmItem('goals', id)} />
            <SEEReviewSection title="Counselor Follow-Ups" items={review.tasks} onEdit={(id) => editItem('tasks', id)} onDelete={(id) => deleteItem('tasks', id)} onConfirm={(id) => confirmItem('tasks', id)} />
            <button onClick={approveAndSave} disabled={processing} className="sticky bottom-28 z-20 w-full rounded-[28px] bg-white px-5 py-5 font-black text-slate-950 shadow-2xl active:scale-95 transition disabled:opacity-70">Approve & Save Plan</button>
          </div>
        )}
      </div>
    </PilotShell>
  );
}