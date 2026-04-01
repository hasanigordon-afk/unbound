import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Save, CheckCircle2, Loader2, Plus, Trash2, Lock, Download } from "lucide-react";
import DischargeReview from "@/components/discharge/DischargeReview";
import { generateDischargePlanPDF } from "@/components/discharge/DischargePlanPDF";
import DischargeSummaryReport from "@/components/discharge/DischargeSummaryReport";
import DischargeSignoffChecklist from "@/components/discharge/DischargeSignoffChecklist";
import DischargeDayItinerary from "@/components/discharge/DischargeDayItinerary";

// ── Design tokens ─────────────────────────────────────────────
const C = {
  teal:    "#3ECFBF",
  gold:    "#C9A96E",
  navy:    "#0B1220",
  emerald: "#10B981",
  slate:   "rgba(255,255,255,0.65)",
  muted:   "rgba(255,255,255,0.3)",
  glass:   { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16 },
};

const STEPS = [
  { id: "discharge",    title: "Discharge Info",            emoji: "📋" },
  { id: "aftercare",    title: "Aftercare Plan",            emoji: "🏥" },
  { id: "housing",      title: "Housing Plan",              emoji: "🏠" },
  { id: "employment",   title: "Employment & Education",    emoji: "💼" },
  { id: "medical",      title: "Medical & Mental Health",   emoji: "🩺" },
  { id: "transport",    title: "Transportation",            emoji: "🚗" },
  { id: "legal",        title: "Legal & Accountability",    emoji: "⚖️" },
  { id: "relapse",      title: "Relapse Prevention",        emoji: "🛡️" },
  { id: "goals",        title: "30 / 60 / 90 Day Goals",   emoji: "🎯" },
  { id: "contacts",     title: "Emergency Contacts",        emoji: "📞" },
  { id: "summary",      title: "Summary Report",           emoji: "📊" },
  { id: "signoff",      title: "Staff Sign-Off",           emoji: "✍️" },
  { id: "itinerary",    title: "Departure Day",            emoji: "🗓" },
  { id: "review",       title: "Review & Finalize",        emoji: "✅" },
];

const EMPTY_CONTACT = { name: "", relationship: "", phone: "", email: "", notify_of_relapse: false };

// ── Helper input components ───────────────────────────────────
function FInput({ label, value, onChange, placeholder, type = "text", hint }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: ".07em", display: "block", marginBottom: 6 }}>
        {label}
      </label>
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || ""}
        style={{
          width: "100%", padding: "12px 14px", background: "rgba(255,255,255,0.07)",
          border: "1px solid rgba(255,255,255,0.13)", borderRadius: 10, color: "#fff",
          fontSize: 14, outline: "none", boxSizing: "border-box",
        }}
      />
      {hint && <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 5 }}>{hint}</p>}
    </div>
  );
}

function FTextarea({ label, value, onChange, placeholder, rows = 3 }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: ".07em", display: "block", marginBottom: 6 }}>
        {label}
      </label>
      <textarea
        rows={rows}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || ""}
        style={{
          width: "100%", padding: "12px 14px", background: "rgba(255,255,255,0.07)",
          border: "1px solid rgba(255,255,255,0.13)", borderRadius: 10, color: "#fff",
          fontSize: 14, outline: "none", resize: "vertical", boxSizing: "border-box", lineHeight: 1.6,
        }}
      />
    </div>
  );
}

function FSelect({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: ".07em", display: "block", marginBottom: 6 }}>
        {label}
      </label>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%", padding: "12px 14px", background: "#1A2235",
          border: "1px solid rgba(255,255,255,0.13)", borderRadius: 10, color: "#fff",
          fontSize: 14, outline: "none", boxSizing: "border-box",
        }}
      >
        <option value="">— Select —</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

// ── Step content ───────────────────────────────────────────────
function StepDischarge({ form, set }) {
  return (
    <>
      <FInput label="Discharge Date" value={form.discharge_date} onChange={(v) => set("discharge_date", v)} type="date" />
      <FSelect label="Discharge Type" value={form.discharge_type} onChange={(v) => set("discharge_type", v)} options={[
        { value: "planned", label: "Planned / Completed Treatment" },
        { value: "ama", label: "Against Medical Advice (AMA)" },
        { value: "administrative", label: "Administrative Discharge" },
        { value: "transfer", label: "Transfer to Higher / Lower Level of Care" },
      ]} />
      <FInput label="Primary Diagnosis" value={form.primary_diagnosis} onChange={(v) => set("primary_diagnosis", v)} placeholder="e.g., Alcohol Use Disorder, Severe" />
      <FTextarea label="Medications at Discharge" value={form.medications_at_discharge} onChange={(v) => set("medications_at_discharge", v)} placeholder="List any medications the patient is leaving with..." />
      <FTextarea label="Clinical Discharge Summary" value={form.discharge_summary} onChange={(v) => set("discharge_summary", v)} placeholder="Brief summary of treatment, progress, and clinical observations..." rows={4} />
    </>
  );
}

function StepAftercare({ form, set }) {
  return (
    <>
      <FSelect label="Aftercare Program Level" value={form.aftercare_program} onChange={(v) => set("aftercare_program", v)} options={[
        { value: "IOP", label: "Intensive Outpatient (IOP)" },
        { value: "PHP", label: "Partial Hospitalization (PHP)" },
        { value: "Outpatient", label: "Standard Outpatient" },
        { value: "MAT", label: "Medication-Assisted Treatment (MAT)" },
        { value: "Peer Support", label: "Peer Support / Community" },
        { value: "None", label: "None Arranged" },
      ]} />
      <FInput label="Provider / Facility Name" value={form.aftercare_provider} onChange={(v) => set("aftercare_provider", v)} placeholder="Name of IOP, outpatient clinic, etc." />
      <FInput label="First Aftercare Appointment" value={form.first_aftercare_appointment} onChange={(v) => set("first_aftercare_appointment", v)} type="date" />
      <FInput label="Target Meetings Per Week" value={form.meetings_per_week} onChange={(v) => set("meetings_per_week", v)} type="number" placeholder="e.g., 3" />
      <FSelect label="Preferred Meeting Type" value={form.preferred_meeting_type} onChange={(v) => set("preferred_meeting_type", v)} options={[
        { value: "AA", label: "AA" },
        { value: "NA", label: "NA" },
        { value: "SMART Recovery", label: "SMART Recovery" },
        { value: "Faith-Based", label: "Faith-Based" },
        { value: "Mixed", label: "Mixed / Open to Any" },
      ]} />
      <FInput label="Sponsor / Mentor Name" value={form.sponsor_name} onChange={(v) => set("sponsor_name", v)} placeholder="Name of sponsor or peer mentor" />
      <FInput label="Sponsor / Mentor Phone" value={form.sponsor_phone} onChange={(v) => set("sponsor_phone", v)} placeholder="Phone number" />
    </>
  );
}

function StepHousing({ form, set }) {
  return (
    <>
      <FSelect label="Housing Status After Discharge" value={form.housing_status} onChange={(v) => set("housing_status", v)} options={[
        { value: "own_home", label: "Own Home / Apartment" },
        { value: "family", label: "Family / Friends" },
        { value: "sober_living", label: "Sober Living Home" },
        { value: "transitional", label: "Transitional Housing Program" },
        { value: "shelter", label: "Emergency Shelter" },
        { value: "unknown", label: "Unknown / TBD" },
      ]} />
      <FInput label="Address" value={form.housing_address} onChange={(v) => set("housing_address", v)} placeholder="Street, city, state, zip" />
      <FInput label="Housing Contact Name" value={form.housing_contact_name} onChange={(v) => set("housing_contact_name", v)} placeholder="Sober living manager, landlord, family member..." />
      <FInput label="Housing Contact Phone" value={form.housing_contact_phone} onChange={(v) => set("housing_contact_phone", v)} placeholder="Phone number" />
      <FTextarea label="Housing Notes / Concerns" value={form.housing_notes} onChange={(v) => set("housing_notes", v)} placeholder="Any barriers, conditions, or important housing details..." />
    </>
  );
}

function StepEmployment({ form, set }) {
  return (
    <>
      <FSelect label="Employment Status" value={form.employment_status} onChange={(v) => set("employment_status", v)} options={[
        { value: "employed", label: "Returning to Existing Employment" },
        { value: "seeking", label: "Seeking Employment" },
        { value: "student", label: "Student / Enrolled in School" },
        { value: "disability", label: "On Disability / Not Working" },
        { value: "not_seeking", label: "Not Seeking at This Time" },
      ]} />
      <FInput label="Employer / School Name" value={form.employer_name} onChange={(v) => set("employer_name", v)} placeholder="Where are they working or studying?" />
      <FInput label="Start / Return Date" value={form.employment_start_date} onChange={(v) => set("employment_start_date", v)} type="date" />
      <FTextarea label="Education / Training Goal" value={form.education_goal} onChange={(v) => set("education_goal", v)} placeholder="GED, vocational training, college goal, certifications..." />
      <FTextarea label="Vocational / Workforce Support" value={form.vocational_support} onChange={(v) => set("vocational_support", v)} placeholder="Any workforce programs, job coaches, or reentry employment resources..." />
      <FTextarea label="Notes" value={form.employment_notes} onChange={(v) => set("employment_notes", v)} placeholder="Any employment barriers, second-chance employer contacts, etc." />
    </>
  );
}

function StepMedical({ form, set }) {
  return (
    <>
      <p style={{ fontSize: 12, fontWeight: 700, color: C.teal, marginBottom: 14, textTransform: "uppercase", letterSpacing: ".07em" }}>Primary Care</p>
      <FInput label="Primary Care Provider" value={form.primary_care_provider} onChange={(v) => set("primary_care_provider", v)} placeholder="Doctor name / clinic" />
      <FInput label="PCP Phone" value={form.pcp_phone} onChange={(v) => set("pcp_phone", v)} placeholder="Phone number" />
      <FInput label="PCP Appointment Date" value={form.pcp_appointment_date} onChange={(v) => set("pcp_appointment_date", v)} type="date" />

      <p style={{ fontSize: 12, fontWeight: 700, color: C.gold, marginBottom: 14, marginTop: 20, textTransform: "uppercase", letterSpacing: ".07em" }}>Psychiatry</p>
      <FInput label="Psychiatrist Name" value={form.psychiatrist_name} onChange={(v) => set("psychiatrist_name", v)} placeholder="Psychiatrist or prescriber name" />
      <FInput label="Psychiatrist Phone" value={form.psychiatrist_phone} onChange={(v) => set("psychiatrist_phone", v)} placeholder="Phone number" />
      <FInput label="Psychiatry Appointment Date" value={form.psychiatrist_appointment_date} onChange={(v) => set("psychiatrist_appointment_date", v)} type="date" />

      <p style={{ fontSize: 12, fontWeight: 700, color: "#A78BFA", marginBottom: 14, marginTop: 20, textTransform: "uppercase", letterSpacing: ".07em" }}>Therapy</p>
      <FInput label="Therapist Name" value={form.therapist_name} onChange={(v) => set("therapist_name", v)} placeholder="Therapist / counselor name" />
      <FInput label="Therapist Phone" value={form.therapist_phone} onChange={(v) => set("therapist_phone", v)} placeholder="Phone number" />
      <FInput label="Therapy Appointment Date" value={form.therapist_appointment_date} onChange={(v) => set("therapist_appointment_date", v)} type="date" />

      <p style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 14, marginTop: 20, textTransform: "uppercase", letterSpacing: ".07em" }}>Coverage & Medications</p>
      <FTextarea label="Ongoing Medications List" value={form.medications_list} onChange={(v) => set("medications_list", v)} placeholder="List all prescriptions with dosage and prescriber..." />
      <FTextarea label="Insurance / Benefits Info" value={form.insurance_info} onChange={(v) => set("insurance_info", v)} placeholder="Insurance plan, Medicaid, Medicare, COBRA, etc." />
    </>
  );
}

function StepTransport({ form, set }) {
  return (
    <>
      <FSelect label="Primary Transportation Method" value={form.transportation_method} onChange={(v) => set("transportation_method", v)} options={[
        { value: "own_vehicle", label: "Own Vehicle" },
        { value: "family", label: "Family / Friends Drive Them" },
        { value: "public_transit", label: "Public Transportation" },
        { value: "rideshare", label: "Rideshare (Uber / Lyft)" },
        { value: "facility_arranged", label: "Facility-Arranged Transport" },
        { value: "none", label: "No Transportation — Barrier" },
      ]} />
      <FSelect label="Driver's License Status" value={form.license_status} onChange={(v) => set("license_status", v)} options={[
        { value: "valid", label: "Valid License" },
        { value: "suspended", label: "Suspended" },
        { value: "revoked", label: "Revoked" },
        { value: "no_license", label: "No License" },
      ]} />
      <FTextarea label="Transportation Notes / Barriers" value={form.transportation_notes} onChange={(v) => set("transportation_notes", v)} placeholder="Any transportation barriers, referrals to transit programs, etc." />
    </>
  );
}

function StepLegal({ form, set }) {
  return (
    <>
      <FSelect label="Does the patient have active legal obligations?" value={form.has_legal_obligations} onChange={(v) => set("has_legal_obligations", v)} options={[
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
        { value: "pending", label: "Pending / Unsure" },
      ]} />
      {form.has_legal_obligations === "yes" && (
        <>
          <FInput label="Probation / Parole Officer Name" value={form.probation_officer_name} onChange={(v) => set("probation_officer_name", v)} placeholder="Officer name" />
          <FInput label="P.O. Phone Number" value={form.probation_officer_phone} onChange={(v) => set("probation_officer_phone", v)} placeholder="Phone number" />
          <FTextarea label="Upcoming Court Dates" value={form.court_dates} onChange={(v) => set("court_dates", v)} placeholder="Dates and type of court hearings..." />
          <FTextarea label="Drug Testing Requirements" value={form.drug_testing_requirements} onChange={(v) => set("drug_testing_requirements", v)} placeholder="Frequency, method, who conducts testing..." />
        </>
      )}
      <FTextarea label="Legal Notes / Other Obligations" value={form.legal_notes} onChange={(v) => set("legal_notes", v)} placeholder="Any other legal considerations, fines, community service, etc." />
    </>
  );
}

function StepRelapse({ form, set }) {
  return (
    <>
      <FTextarea label="Personal Warning Signs" rows={3} value={form.warning_signs} onChange={(v) => set("warning_signs", v)} placeholder="Early signs that they may be heading toward relapse (emotional, behavioral, social)..." />
      <FTextarea label="Known Triggers" rows={3} value={form.triggers_text} onChange={(v) => set("triggers_text", v)} placeholder="People, places, emotions, or situations that trigger cravings..." />
      <FTextarea label="Healthy Coping Strategies" rows={3} value={form.coping_strategies_text} onChange={(v) => set("coping_strategies_text", v)} placeholder="What will they do when triggered? Breathing, calling sponsor, journaling, exercise..." />
      <FTextarea label="If I Relapse, My Plan Is..." rows={4} value={form.relapse_action_plan} onChange={(v) => set("relapse_action_plan", v)} placeholder="Specific actions they will take if they use: who to call, where to go, what to say..." />
      <FTextarea label="People to Call in a Crisis" value={form.people_to_call_in_crisis} onChange={(v) => set("people_to_call_in_crisis", v)} placeholder="Names and phone numbers of people to call in crisis (beyond 988)..." />
    </>
  );
}

function StepGoals({ form, set }) {
  return (
    <>
      <div style={{ background: "rgba(62,207,191,0.07)", border: "1px solid rgba(62,207,191,0.2)", borderRadius: 12, padding: "14px 16px", marginBottom: 20 }}>
        <p style={{ fontSize: 13, color: C.slate, lineHeight: 1.65 }}>
          Set specific, realistic goals for the first 30, 60, and 90 days after discharge. These become the patient's roadmap once they leave.
        </p>
      </div>
      <FTextarea label="🗓 First 30 Days — Immediate Priorities" rows={4} value={form.goals_30_day} onChange={(v) => set("goals_30_day", v)}
        placeholder="Get settled in housing, attend first appointments, establish routine, avoid high-risk situations..." />
      <FTextarea label="📅 First 60 Days — Building Stability" rows={4} value={form.goals_60_day} onChange={(v) => set("goals_60_day", v)}
        placeholder="Start job search / return to work, build sober social network, maintain consistency with treatment..." />
      <FTextarea label="📆 First 90 Days — Long-Term Momentum" rows={4} value={form.goals_90_day} onChange={(v) => set("goals_90_day", v)}
        placeholder="Financial independence steps, relationship repair, long-term housing security, education enrollment..." />
    </>
  );
}

function StepContacts({ contacts, setContacts }) {
  const update = (i, field, val) => {
    const updated = [...contacts];
    updated[i] = { ...updated[i], [field]: val };
    setContacts(updated);
  };
  const add = () => setContacts([...contacts, { ...EMPTY_CONTACT }]);
  const remove = (i) => setContacts(contacts.filter((_, idx) => idx !== i));

  return (
    <>
      {contacts.map((c, i) => (
        <div key={i} style={{
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 14, padding: "16px", marginBottom: 12,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Contact {i + 1}</p>
            {contacts.length > 1 && (
              <button onClick={() => remove(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "#EF4444", padding: 4 }}>
                <Trash2 style={{ width: 14, height: 14 }} />
              </button>
            )}
          </div>
          <FInput label="Name" value={c.name} onChange={(v) => update(i, "name", v)} placeholder="Full name" />
          <FInput label="Relationship" value={c.relationship} onChange={(v) => update(i, "relationship", v)} placeholder="Spouse, parent, sponsor, friend..." />
          <FInput label="Phone" value={c.phone} onChange={(v) => update(i, "phone", v)} placeholder="Phone number" />
          <FInput label="Email" value={c.email} onChange={(v) => update(i, "email", v)} placeholder="Email address" />
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", marginTop: 4 }}>
            <input type="checkbox" checked={!!c.notify_of_relapse} onChange={(e) => update(i, "notify_of_relapse", e.target.checked)}
              style={{ width: 16, height: 16, cursor: "pointer" }} />
            <span style={{ fontSize: 13, color: C.slate }}>Notify this person if relapse occurs</span>
          </label>
        </div>
      ))}
      <button onClick={add} style={{
        display: "flex", alignItems: "center", gap: 8, padding: "12px 18px",
        background: "rgba(62,207,191,0.08)", border: "1px dashed rgba(62,207,191,0.3)",
        borderRadius: 12, color: C.teal, fontSize: 14, fontWeight: 700, cursor: "pointer", width: "100%",
        justifyContent: "center",
      }}>
        <Plus style={{ width: 15, height: 15 }} /> Add Another Contact
      </button>
    </>
  );
}

// ── Main page ─────────────────────────────────────────────────
export default function DischargePlan() {
  const queryClient = useQueryClient();
  const [stepIdx, setStepIdx] = useState(0);
  const [form, setForm] = useState({});
  const [contacts, setContacts] = useState([{ ...EMPTY_CONTACT }]);
  const [planId, setPlanId] = useState(null);
  const [saveMsg, setSaveMsg] = useState("");
  const [finalized, setFinalized] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const paramPlanId = urlParams.get("plan_id");
  const paramPatientEmail = urlParams.get("patient_email");

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  // Load existing plan if plan_id param provided
  const { data: existingPlan } = useQuery({
    queryKey: ["discharge-plan", paramPlanId],
    queryFn: async () => {
      const plans = await base44.entities.DischargePlan.filter({ id: paramPlanId });
      return plans?.[0] || null;
    },
    enabled: !!paramPlanId,
  });

  useEffect(() => {
    if (existingPlan) {
      const { emergency_contacts, ...rest } = existingPlan;
      setForm(rest);
      setPlanId(existingPlan.id);
      setStepIdx(existingPlan.current_step || 0);
      setFinalized(existingPlan.status === "finalized");
      if (emergency_contacts?.length) setContacts(emergency_contacts);
    } else if (paramPatientEmail) {
      setForm((f) => ({ ...f, participant_email: paramPatientEmail }));
    }
  }, [existingPlan, paramPatientEmail]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const saveMutation = useMutation({
    mutationFn: async (status) => {
      const payload = {
        ...form,
        emergency_contacts: contacts,
        current_step: stepIdx,
        status: status || form.status || "draft",
        counselor_email: form.counselor_email || user?.email,
      };
      if (planId) {
        return base44.entities.DischargePlan.update(planId, payload);
      } else {
        const created = await base44.entities.DischargePlan.create(payload);
        setPlanId(created.id);
        return created;
      }
    },
    onSuccess: (data, status) => {
      queryClient.invalidateQueries(["discharge-plan"]);
      setSaveMsg(status === "finalized" ? "Plan finalized!" : "Saved ✓");
      if (status === "finalized") setFinalized(true);
      setTimeout(() => setSaveMsg(""), 2500);
    },
  });

  const handleSave = () => saveMutation.mutate("draft");
  const handleFinalize = () => saveMutation.mutate("finalized");

  const goNext = async () => {
    await saveMutation.mutateAsync("draft");
    if (stepIdx < STEPS.length - 1) setStepIdx(stepIdx + 1);
  };

  const goPrev = () => {
    if (stepIdx > 0) setStepIdx(stepIdx - 1);
  };

  const progress = Math.round((stepIdx / (STEPS.length - 1)) * 100);
  const currentStep = STEPS[stepIdx];

  const renderStep = () => {
    switch (currentStep.id) {
      case "discharge":   return <StepDischarge form={form} set={set} />;
      case "aftercare":   return <StepAftercare form={form} set={set} />;
      case "housing":     return <StepHousing form={form} set={set} />;
      case "employment":  return <StepEmployment form={form} set={set} />;
      case "medical":     return <StepMedical form={form} set={set} />;
      case "transport":   return <StepTransport form={form} set={set} />;
      case "legal":       return <StepLegal form={form} set={set} />;
      case "relapse":     return <StepRelapse form={form} set={set} />;
      case "goals":       return <StepGoals form={form} set={set} />;
      case "contacts":    return <StepContacts contacts={contacts} setContacts={setContacts} />;
      case "summary":     return <DischargeSummaryReport clientEmail={form.participant_email} formData={form} />;
      case "signoff":     return <DischargeSignoffChecklist planId={planId} staffEmail={user?.email} finalized={finalized} />;
      case "itinerary":   return <DischargeDayItinerary planId={planId} clientEmail={form.participant_email} dischargeDate={form.discharge_date} staffEmail={user?.email} finalized={finalized} />;
      case "review":      return <DischargeReview formData={form} contacts={contacts} />;
      default:            return null;
    }
  };

  return (
    <div style={{ background: "linear-gradient(170deg,#070D1C 0%,#0B1424 55%,#080E1C 100%)", minHeight: "100vh", paddingBottom: 100 }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>

        {/* ── Header ── */}
        <div style={{
          background: "linear-gradient(155deg,#0E1D3A,#081426)",
          padding: "56px 20px 24px",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: -60, right: -60, width: 260, height: 260, borderRadius: "50%",
            background: "radial-gradient(circle,rgba(62,207,191,0.1) 0%,transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 4 }}>
              Discharge Planning Tool
            </p>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: "#fff", marginBottom: 4, lineHeight: 1.2 }}>
              Treatment Discharge Plan
            </h1>
            <p style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>
              {form.participant_email ? `Patient: ${form.participant_email}` : "Complete each section to build a full discharge roadmap."}
            </p>

            {/* Patient email if not set */}
            {!paramPlanId && !form.participant_email && (
              <FInput label="Patient Email" value={form.participant_email} onChange={(v) => set("participant_email", v)} placeholder="patient@email.com" />
            )}

            {/* Progress bar */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.slate }}>
                  Step {stepIdx + 1} of {STEPS.length} — {currentStep.emoji} {currentStep.title}
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.teal }}>{progress}%</span>
              </div>
              <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 6, height: 6, overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 6, width: `${progress}%`,
                  background: `linear-gradient(90deg,${C.teal},#2CB8AE)`,
                  transition: "width 0.4s ease",
                  boxShadow: `0 0 10px rgba(62,207,191,0.4)`,
                }} />
              </div>
            </div>

            {/* Status badge */}
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{
                fontSize: 12, fontWeight: 800, padding: "4px 12px", borderRadius: 20,
                background: finalized ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)",
                color: finalized ? C.emerald : "#F59E0B",
                border: `1px solid ${finalized ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.3)"}`,
              }}>
                {finalized ? "✅ Finalized" : "📝 Draft"}
              </span>
              {saveMsg && (
                <span style={{ fontSize: 12, color: C.emerald, fontWeight: 700 }}>{saveMsg}</span>
              )}
            </div>
          </div>
        </div>

        {/* ── Step navigator dots ── */}
        <div style={{ padding: "12px 20px", display: "flex", gap: 4, overflowX: "auto", scrollbarWidth: "none" }}>
          {STEPS.map((s, i) => (
            <button key={s.id} onClick={() => setStepIdx(i)} style={{
              padding: "5px 10px", borderRadius: 20, border: "none", cursor: "pointer",
              background: i === stepIdx
                ? `linear-gradient(135deg,${C.teal},#2CB8AE)`
                : i < stepIdx ? "rgba(62,207,191,0.12)" : "rgba(255,255,255,0.05)",
              color: i === stepIdx ? "#fff" : i < stepIdx ? C.teal : C.muted,
              fontSize: 11, fontWeight: 700, whiteSpace: "nowrap", flexShrink: 0,
            }}>
              {s.emoji} {s.title}
            </button>
          ))}
        </div>

        {/* ── Step content ── */}
        <div style={{ padding: "8px 20px 20px" }}>
          {finalized && currentStep.id !== "review" && (
            <div style={{
              background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)",
              borderRadius: 12, padding: "12px 16px", marginBottom: 20,
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <Lock style={{ width: 14, height: 14, color: C.emerald, flexShrink: 0 }} />
              <p style={{ fontSize: 13, color: C.emerald, fontWeight: 600 }}>
                This plan has been finalized and is read-only.
              </p>
            </div>
          )}

          <div style={{ ...C.glass, padding: "20px" }}>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: "#fff", marginBottom: 4 }}>
              {currentStep.emoji} {currentStep.title}
            </h2>
            <div style={{ height: 1, background: "rgba(255,255,255,0.07)", marginBottom: 20 }} />
            {renderStep()}
          </div>

          {/* ── Navigation buttons ── */}
          {!finalized && (
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              {stepIdx > 0 && (
                <button onClick={goPrev} style={{
                  flex: 1, padding: "13px", borderRadius: 12,
                  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                  color: C.slate, fontWeight: 700, fontSize: 14, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}>
                  <ChevronLeft style={{ width: 16, height: 16 }} /> Back
                </button>
              )}
              <button onClick={handleSave} disabled={saveMutation.isPending} style={{
                padding: "13px 18px", borderRadius: 12,
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                color: C.slate, fontWeight: 700, fontSize: 13, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6, flexShrink: 0,
              }}>
                {saveMutation.isPending ? <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" /> : <Save style={{ width: 14, height: 14 }} />}
                Save
              </button>
              {stepIdx < STEPS.length - 1 ? (
                <button onClick={goNext} disabled={saveMutation.isPending} style={{
                  flex: 2, padding: "13px", borderRadius: 12,
                  background: `linear-gradient(135deg,${C.teal},#2CB8AE)`,
                  border: "none", color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  boxShadow: "0 6px 20px rgba(62,207,191,0.25)",
                }}>
                  Save & Continue <ChevronRight style={{ width: 16, height: 16 }} />
                </button>
              ) : (
                <>
                  <button onClick={handleFinalize} disabled={saveMutation.isPending || !form.participant_email} style={{
                    flex: 2, padding: "13px", borderRadius: 12,
                    background: "linear-gradient(135deg,#10B981,#059669)",
                    border: "none", color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    boxShadow: "0 6px 20px rgba(16,185,129,0.3)",
                    opacity: !form.participant_email ? 0.5 : 1,
                  }}>
                    <CheckCircle2 style={{ width: 16, height: 16 }} /> Finalize Plan
                  </button>
                  <button
                    onClick={() => generateDischargePlanPDF(form, contacts)}
                    disabled={!form.participant_email}
                    style={{
                      padding: "13px 16px", borderRadius: 12,
                      background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)",
                      color: "#10B981", fontWeight: 700, fontSize: 13, cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 6, flexShrink: 0,
                      opacity: !form.participant_email ? 0.5 : 1,
                    }}
                  >
                    <Download style={{ width: 15, height: 15 }} /> PDF
                  </button>
                </>
              )}
            </div>
          )}

          {finalized && (
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button onClick={() => setStepIdx(STEPS.length - 1)} style={{
                flex: 1, padding: "13px", borderRadius: 12,
                background: `linear-gradient(135deg,${C.teal},#2CB8AE)`,
                border: "none", color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer",
              }}>
                View Full Plan
              </button>
              <button
                onClick={() => generateDischargePlanPDF({ ...form, status: "finalized" }, contacts)}
                style={{
                  flex: 1, padding: "13px", borderRadius: 12,
                  background: "linear-gradient(135deg,#10B981,#059669)",
                  border: "none", color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  boxShadow: "0 6px 20px rgba(16,185,129,0.3)",
                }}
              >
                <Download style={{ width: 16, height: 16 }} /> Download PDF
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}