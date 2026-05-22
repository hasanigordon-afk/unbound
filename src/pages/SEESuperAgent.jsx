import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import PilotShell from '@/components/pilot/PilotShell';
import SEEMobileHero from '@/components/see/SEEMobileHero';
import SEEClientSelector from '@/components/see/SEEClientSelector';
import SEEStatusBadge from '@/components/see/SEEStatusBadge';
import SEESectionCard from '@/components/see/SEESectionCard';
import SEEDataCard from '@/components/see/SEEDataCard';
import SEEActivityPanel from '@/components/see/SEEActivityPanel';
import { AlertTriangle, CalendarDays, CheckCircle2, ClipboardCheck, FileText, Gauge, ListChecks, Route, ShieldAlert, UserRound } from 'lucide-react';

const sampleNotes = 'Marcus leaves treatment Friday. Needs IOP Monday Wednesday Friday at 1pm, NA Tuesday and Thursday nights, probation every second Wednesday, daily check-ins, job search help, bus transportation, and sponsor call 3x per week.';
const tabs = ['SCAN', 'ENGINEER', 'EXECUTE', 'Saved Plans', 'Client Profiles', 'Missing Info Queue', 'Counselor Review', 'Risk Alerts', 'Activity Log'];
const disclaimer = 'This plan is a support and organization tool. It does not replace professional medical, clinical, legal, or emergency guidance.';
const planSections = [
  ['summary', 'Plan Summary'], ['weekly_itinerary', 'Weekly Itinerary'], ['daily_routine', 'Daily Routine'], ['required_appointments', 'Required Appointments'], ['recovery_support_schedule', 'Recovery Support Schedule'], ['legal_schedule', 'Legal Schedule'], ['transportation_plan', 'Transportation Plan'], ['housing_stability_plan', 'Housing Stability Plan'], ['employment_education_plan', 'Employment/Education Plan'], ['wellness_plan', 'Wellness Plan'], ['emergency_plan', 'Emergency Plan'], ['risk_flags', 'Risk Flags'], ['roadmap_30_60_90', '30/60/90 Day Roadmap'], ['client_motivation_plan', 'Client Motivation Plan'], ['counselor_follow_up_plan', 'Counselor Follow-Up Plan'],
];

export default function SEESuperAgent() {
  const [activeTab, setActiveTab] = useState('SCAN');
  const [notes, setNotes] = useState(sampleNotes);
  const [clients, setClients] = useState([]);
  const [plans, setPlans] = useState([]);
  const [logs, setLogs] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [newClientName, setNewClientName] = useState('Marcus Johnson');
  const [rawInput, setRawInput] = useState(null);
  const [extraction, setExtraction] = useState(null);
  const [plan, setPlan] = useState(null);
  const [approvedSections, setApprovedSections] = useState([]);
  const [overrideExecute, setOverrideExecute] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [executeSummary, setExecuteSummary] = useState(null);

  useEffect(() => { refreshData(); }, []);

  const refreshData = async () => {
    const [clientRows, planRows, logRows] = await Promise.all([
      base44.entities.Clients.list('-created_date', 100),
      base44.entities.AftercarePlans.list('-created_date', 50),
      base44.entities.SEEActivityLogs.list('-created_date', 50),
    ]);
    setClients(clientRows);
    setPlans(planRows);
    setLogs(logRows);
    if (!selectedClientId && clientRows[0]) setSelectedClientId(clientRows[0].id);
  };

  const selectedClient = useMemo(() => clients.find((client) => client.id === selectedClientId), [clients, selectedClientId]);
  const missingInfo = extraction?.missing_information || [];
  const riskFlags = extraction?.extracted_risk_factors || plan?.risk_flags || [];
  const supportItems = extraction?.extracted_recovery_support || [];
  const dailyTasks = extraction?.extracted_goals || [];
  const allApproved = planSections.every(([key]) => approvedSections.includes(key));
  const canExecute = !!selectedClientId && !!(extraction?.extracted_client_basics?.full_name || selectedClient?.full_name) && !!extraction?.extracted_client_basics?.discharge_date && supportItems.length > 0 && dailyTasks.some((task) => /check/i.test(task.task_title || '')) && (extraction?.extracted_client_basics?.emergency_contact_name || overrideExecute) && allApproved;

  const createClient = async () => {
    if (!newClientName.trim()) return;
    const client = await base44.entities.Clients.create({ full_name: newClientName.trim(), status: 'active' });
    setClients((prev) => [client, ...prev]);
    setSelectedClientId(client.id);
  };

  const logAction = async (action_type, description, related_plan_id = '') => {
    const log = await base44.entities.SEEActivityLogs.create({ client_id: selectedClientId, action_type, description, related_plan_id });
    setLogs((prev) => [log, ...prev]);
  };

  const saveRawNotes = async () => {
    if (!notes.trim() || !selectedClientId) return;
    const saved = await base44.entities.RawAftercareInput.create({ client_id: selectedClientId, raw_text: notes, input_type: 'text', processed_status: 'draft' });
    setRawInput(saved);
    await logAction('Raw notes saved', 'Counselor saved aftercare notes for scanning.');
    setMessage('Raw notes saved.');
  };

  const scanPlan = async () => {
    if (!notes.trim() || !selectedClientId) return setMessage('Select a client and paste notes before scanning.');
    setLoading(true);
    const saved = rawInput || await base44.entities.RawAftercareInput.create({ client_id: selectedClientId, raw_text: notes, input_type: 'text', processed_status: 'draft' });
    const response = await base44.functions.invoke('seeAiAgent', { action: 'scan', raw_text: notes });
    const result = response.data;
    const updatedBasics = { ...result.extracted_client_basics, full_name: result.extracted_client_basics.full_name || selectedClient?.full_name || newClientName };
    const finalResult = { ...result, extracted_client_basics: updatedBasics };
    const extractionRecord = await base44.entities.AIExtractionResult.create({ client_id: selectedClientId, raw_input_id: saved.id, ...finalResult });
    await base44.entities.RawAftercareInput.update(saved.id, { processed_status: 'processed' });
    setRawInput(saved);
    setExtraction({ ...finalResult, id: extractionRecord.id });
    setActiveTab('ENGINEER');
    await logAction('Plan scanned', `S.E.E. extracted structured data with ${result.confidence_score}% confidence.`);
    setLoading(false);
  };

  const generatePlan = async () => {
    if (!extraction) return setMessage('Scan notes before generating a plan.');
    setLoading(true);
    const response = await base44.functions.invoke('seeAiAgent', { action: 'engineer', extraction });
    setPlan(response.data);
    setApprovedSections([]);
    setActiveTab('ENGINEER');
    await logAction('Plan engineered', 'S.E.E. generated editable aftercare plan sections.');
    setLoading(false);
  };

  const updatePlanSection = (key, value) => {
    let parsed = value;
    try { parsed = JSON.parse(value); } catch { parsed = value; }
    setPlan((prev) => ({ ...prev, [key]: parsed }));
  };

  const approveSection = (key) => setApprovedSections((prev) => prev.includes(key) ? prev : [...prev, key]);
  const regenerateSection = (key) => setPlan((prev) => ({ ...prev, [key]: prev[key] }));

  const executePlan = async () => {
    if (!canExecute) return setMessage('Plan cannot be executed until required fields are completed or overridden by counselor.');
    setLoading(true);
    const basics = extraction.extracted_client_basics || {};
    const planRecord = await base44.entities.AftercarePlans.create({
      client_id: selectedClientId,
      client_name: basics.full_name || selectedClient?.full_name,
      plan_title: plan.plan_title,
      plan_status: 'executed',
      status: 'active',
      recovery_category: plan.recovery_category,
      summary: plan.summary,
      clinical_disclaimer: disclaimer,
      start_date: basics.discharge_date,
      risk_level: riskFlags.some((risk) => risk.severity === 'Urgent') ? 'Urgent' : riskFlags.some((risk) => risk.severity === 'High') ? 'High' : 'Moderate',
      client_visible_summary: plan.client_visible_summary,
      source_notes: notes,
      roadmap_summary: plan.summary,
      plan_data: plan,
      needs_review: missingInfo.length > 0,
    });

    await base44.entities.Clients.update(selectedClientId, { ...basics, risk_level: planRecord.risk_level, status: 'active' });
    const planId = planRecord.id;
    const appointments = plan.required_appointments || [];
    const reminders = [...(plan.wellness_plan || []), { reminder_title: 'Daily Check-In', reminder_type: 'check_in', message: 'Complete today’s recovery check-in.', scheduled_time: '8:00 PM', recurrence: 'daily', delivery_method: 'in_app', active: true }];
    const tasks = [...(plan.daily_routine || []), { task_title: 'Weekly counselor review', task_category: 'counselor_review', description: 'Review client progress, missed check-ins, risk flags, and next steps.', recurrence: 'weekly', priority: 'high' }];

    const [calendarRows, reminderRows, taskRows, transportRows, supportRows, legalRows, riskRows] = await Promise.all([
      appointments.length ? base44.entities.CalendarEvents.bulkCreate(appointments.map((item) => ({ client_id: selectedClientId, plan_id: planId, title: item.title || item.event_title, event_title: item.event_title || item.title, event_type: item.event_type, date: item.date, start_time: item.start_time, end_time: item.end_time, location: item.location, notes: item.notes, reminder_time: '1 hour before', recurrence: item.recurrence, transportation_needed: !!item.transportation_needed, status: 'scheduled' }))) : Promise.resolve([]),
      reminders.length ? base44.entities.Reminders.bulkCreate(reminders.map((item) => ({ client_id: selectedClientId, plan_id: planId, title: item.reminder_title || item.title, reminder_title: item.reminder_title || item.title, reminder_type: item.reminder_type || 'support', message: item.message || item.notes || 'Recovery reminder', scheduled_date: basics.discharge_date, time: item.scheduled_time || item.time || '8:00 PM', scheduled_time: item.scheduled_time || item.time || '8:00 PM', repeat: item.recurrence === 'daily' ? 'daily' : 'weekly', recurrence: item.recurrence || 'weekly', delivery_method: item.delivery_method || 'in_app', active: true, priority: item.reminder_type === 'legal' ? 'high' : 'medium' }))) : Promise.resolve([]),
      tasks.length ? base44.entities.DailyTasks.bulkCreate(tasks.map((item) => ({ client_id: selectedClientId, plan_id: planId, task_title: item.task_title || item.title || item.name, task_category: item.task_category || item.category || 'recovery', description: item.description || item.notes || '', due_date: basics.discharge_date, due_time: item.due_time || '', recurrence: item.recurrence || 'weekly', priority: item.priority || 'medium', completed: false }))) : Promise.resolve([]),
      (plan.transportation_plan || []).length ? base44.entities.TransportationRequests.bulkCreate(plan.transportation_plan.map((item) => ({ client_id: selectedClientId, plan_id: planId, pickup_location: item.pickup_location || 'Client residence', destination: item.destination || 'Required appointment', requested_date: item.requested_date || basics.discharge_date, requested_time: item.requested_time || '', transportation_type: item.transportation_type || 'support needed', status: 'requested', notes: item.notes || 'Created by S.E.E.' }))) : Promise.resolve([]),
      (plan.recovery_support_schedule || []).length ? base44.entities.RecoverySupportItems.bulkCreate(plan.recovery_support_schedule.map((item) => ({ client_id: selectedClientId, plan_id: planId, support_type: item.support_type, name: item.name, location: item.location, phone: item.phone, website: item.website, schedule: item.schedule, notes: item.notes, status: 'active' }))) : Promise.resolve([]),
      (plan.legal_schedule || []).length ? base44.entities.LegalRequirements.bulkCreate(plan.legal_schedule.map((item) => ({ client_id: selectedClientId, plan_id: planId, ...item }))) : Promise.resolve([]),
      (plan.risk_flags || []).length ? base44.entities.RiskFlags.bulkCreate(plan.risk_flags.map((item) => ({ client_id: selectedClientId, plan_id: planId, ...item }))) : Promise.resolve([]),
    ]);

    await Promise.all([
      base44.entities.EmergencyPlans.create({ client_id: selectedClientId, plan_id: planId, ...plan.emergency_plan }),
      base44.entities.ProgressLogs.create({ client_id: selectedClientId, plan_id: planId, check_in_date: new Date().toISOString().split('T')[0], mood_score: 0, craving_score: 0, task_completion_rate: 0, meetings_attended: 0, missed_events: 0, notes: 'Baseline created by S.E.E.', risk_score: riskRows.length }),
      rawInput ? base44.entities.RawAftercareInput.update(rawInput.id, { processed_status: 'executed' }) : Promise.resolve(),
    ]);

    const summary = { calendarEvents: calendarRows.length || appointments.length, reminders: reminderRows.length || reminders.length, dailyTasks: taskRows.length || tasks.length, riskFlags: riskRows.length || riskFlags.length, missingItems: missingInfo.length };
    setExecuteSummary(summary);
    setActiveTab('EXECUTE');
    await logAction('Plan executed', 'S.E.E. has built this client’s aftercare structure.', planId);
    await refreshData();
    setLoading(false);
  };

  const exportSummary = () => {
    const content = JSON.stringify({ client: selectedClient, extraction, plan, disclaimer }, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'see-aftercare-summary.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderScan = () => (
    <div className="space-y-5">
      <SEEClientSelector clients={clients} selectedClientId={selectedClientId} setSelectedClientId={setSelectedClientId} newClientName={newClientName} setNewClientName={setNewClientName} onCreateClient={createClient} />
      <SEEDataCard title="Paste client discharge notes, aftercare instructions, or counselor summary." icon={FileText}>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="min-h-[260px] w-full rounded-[28px] p-5 text-base leading-relaxed" />
        <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
          <button onClick={scanPlan} className="btn-primary">Scan Plan</button>
          <button onClick={() => document.createElement('input').click()} className="btn-ghost">Upload Document</button>
          <button onClick={() => setNotes('')} className="btn-ghost">Clear Input</button>
          <button onClick={saveRawNotes} className="btn-ghost">Save Raw Notes</button>
        </div>
      </SEEDataCard>
      {extraction && <div className="grid gap-4 md:grid-cols-3"><SEEDataCard title="AI Confidence" icon={Gauge}><p className="text-5xl font-black">{extraction.confidence_score}%</p></SEEDataCard><SEEDataCard title="Missing Info" icon={AlertTriangle} tone="amber"><p className="text-3xl font-black">{missingInfo.length}</p></SEEDataCard><SEEDataCard title="Risk Flags" icon={ShieldAlert} tone="rose"><p className="text-3xl font-black">{riskFlags.length}</p></SEEDataCard></div>}
    </div>
  );

  const renderEngineer = () => (
    <div className="space-y-5">
      {!plan && <button onClick={generatePlan} disabled={!extraction || loading} className="btn-primary w-full">Generate Plan</button>}
      {extraction && <div className="grid gap-4 md:grid-cols-2"><SEEDataCard title="Client Overview Card" icon={UserRound}><pre className="whitespace-pre-wrap text-xs text-slate-200">{JSON.stringify(extraction.extracted_client_basics, null, 2)}</pre></SEEDataCard><SEEDataCard title="Missing Info Card" icon={AlertTriangle} tone="amber">{missingInfo.map((item) => <div key={item} className="mb-2"><SEEStatusBadge>Missing Info</SEEStatusBadge><p className="mt-1 text-sm text-slate-200">{item}</p></div>)}</SEEDataCard></div>}
      {plan && <div className="grid grid-cols-2 gap-2 md:grid-cols-4"><button onClick={generatePlan} className="btn-ghost">Improve Structure</button><button onClick={generatePlan} className="btn-ghost">Make Client-Friendly</button><button onClick={generatePlan} className="btn-ghost">Add Transportation Support</button><button onClick={generatePlan} className="btn-ghost">Add Emergency Safety Plan</button></div>}
      {plan && planSections.map(([key, title]) => <SEESectionCard key={key} title={title} value={plan[key]} approved={approvedSections.includes(key)} onChange={(value) => updatePlanSection(key, value)} onApprove={() => approveSection(key)} onRegenerate={() => regenerateSection(key)} />)}
    </div>
  );

  const renderExecute = () => (
    <div className="space-y-5">
      <SEEDataCard title="Execute Summary Card" icon={ClipboardCheck} tone="emerald">
        {!canExecute && <p className="mb-4 rounded-2xl bg-amber-300/15 p-4 text-sm font-bold text-amber-100">Plan cannot be executed until required fields are completed or overridden by counselor.</p>}
        <label className="mb-4 flex items-center gap-3 rounded-2xl bg-white/8 p-3 text-sm"><input type="checkbox" checked={overrideExecute} onChange={(e) => setOverrideExecute(e.target.checked)} /> Counselor override for emergency contact requirement</label>
        <button onClick={executePlan} disabled={loading} className="btn-primary w-full">Execute Plan</button>
        {executeSummary && <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-5">{Object.entries(executeSummary).map(([key, value]) => <div key={key} className="rounded-2xl bg-white/8 p-3 text-center"><p className="text-2xl font-black">{value}</p><p className="text-xs text-slate-300">{key}</p></div>)}</div>}
      </SEEDataCard>
      <div className="grid gap-2 md:grid-cols-4"><button onClick={executePlan} className="btn-ghost">Create Calendar Events</button><button onClick={executePlan} className="btn-ghost">Create Reminders</button><button onClick={() => setMessage('Client view records are live after execution.')} className="btn-ghost">Send to Client View</button><button onClick={exportSummary} className="btn-ghost">Export Summary</button></div>
    </div>
  );

  const renderListTab = () => {
    if (activeTab === 'Saved Plans') return <SEEDataCard title="Saved Plans" icon={ListChecks}>{plans.map((item) => <div key={item.id} className="mb-3 rounded-2xl bg-white/8 p-4"><p className="font-black">{item.plan_title || item.client_name}</p><SEEStatusBadge>{item.plan_status === 'executed' ? 'Executed' : 'Draft'}</SEEStatusBadge></div>)}</SEEDataCard>;
    if (activeTab === 'Client Profiles') return <SEEDataCard title="Client Profiles" icon={UserRound}>{clients.map((item) => <div key={item.id} className="mb-3 rounded-2xl bg-white/8 p-4"><p className="font-black">{item.full_name}</p><p className="text-sm text-slate-300">Risk: {item.risk_level || 'Not set'} · Housing: {item.housing_status || 'Needs review'}</p></div>)}</SEEDataCard>;
    if (activeTab === 'Missing Info Queue') return <SEEDataCard title="Missing Info Queue" icon={AlertTriangle} tone="amber">{missingInfo.map((item) => <p key={item} className="mb-2 rounded-2xl bg-white/8 p-3 text-sm">{item}</p>)}<button onClick={() => setActiveTab('SCAN')} className="btn-ghost mt-3">Add Missing Info</button></SEEDataCard>;
    if (activeTab === 'Counselor Review') return <SEEDataCard title="Counselor Review" icon={CheckCircle2}>{planSections.map(([key, title]) => <div key={key} className="mb-2 flex items-center justify-between rounded-2xl bg-white/8 p-3"><span>{title}</span><SEEStatusBadge>{approvedSections.includes(key) ? 'Approved' : 'Needs Review'}</SEEStatusBadge></div>)}<button onClick={() => setApprovedSections(planSections.map(([key]) => key))} className="btn-primary mt-3 w-full">Mark Reviewed</button></SEEDataCard>;
    if (activeTab === 'Risk Alerts') return <SEEDataCard title="Risk Alerts" icon={ShieldAlert} tone="rose">{riskFlags.map((risk, index) => <div key={index} className="mb-3 rounded-2xl bg-white/8 p-4"><SEEStatusBadge>{risk.severity === 'High' || risk.severity === 'Urgent' ? 'High Risk' : 'Needs Review'}</SEEStatusBadge><p className="mt-2 font-black">{risk.risk_type}</p><p className="text-sm text-slate-300">{risk.description}</p></div>)}</SEEDataCard>;
    return <SEEActivityPanel logs={logs} />;
  };

  return (
    <PilotShell title="S.E.E. AI Agent" subtitle="Scan · Engineer · Execute" activeView="counselor">
      <div className="space-y-5">
        <SEEMobileHero />
        <div className="no-scrollbar flex gap-2 overflow-x-auto rounded-[28px] border border-white/10 bg-white/8 p-2">
          {tabs.map((tab) => <button key={tab} onClick={() => setActiveTab(tab)} className={`min-w-fit rounded-3xl px-4 py-3 text-xs font-black ${activeTab === tab ? 'bg-white text-slate-950' : 'text-slate-200 bg-white/5'}`}>{tab}</button>)}
        </div>
        {message && <div className="rounded-3xl border border-blue-200/20 bg-blue-300/15 p-4 text-sm font-black text-blue-100">{message}</div>}
        {loading && <div className="rounded-3xl border border-blue-200/20 bg-blue-300/15 p-4 text-center text-sm font-black text-blue-100 animate-pulse">S.E.E. is working…</div>}
        {activeTab === 'SCAN' ? renderScan() : activeTab === 'ENGINEER' ? renderEngineer() : activeTab === 'EXECUTE' ? renderExecute() : renderListTab()}
      </div>
    </PilotShell>
  );
}