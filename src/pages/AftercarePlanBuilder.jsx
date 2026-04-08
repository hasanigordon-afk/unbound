import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, Shield, AlertTriangle, Loader2,
  CheckCircle2, Lock, Info, ChevronDown, ChevronUp
} from "lucide-react";

// ── Design tokens ──────────────────────────────────────────────────
const C = {
  teal:    "#2DD4BF",
  indigo:  "#6366F1",
  purple:  "#8B5CF6",
  emerald: "#10B981",
  amber:   "#F59E0B",
  red:     "#EF4444",
  muted:   "rgba(241,245,249,0.45)",
  glass:   { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18 },
};

const STEPS = ["Start", "Recovery Profile", "Legal & Supervision", "Life & Stability", "Wellness", "Generate Plan"];

const SUBSTANCES = [
  { key: "alcohol",            label: "Alcohol",              emoji: "🍺" },
  { key: "opioids",            label: "Opioids",              emoji: "💊" },
  { key: "stimulants",         label: "Stimulants",           emoji: "⚡" },
  { key: "benzodiazepines",    label: "Benzodiazepines",      emoji: "🔵" },
  { key: "cannabis",           label: "Cannabis",             emoji: "🌿" },
  { key: "prescription_misuse",label: "Prescription Misuse",  emoji: "📋" },
  { key: "other",              label: "Other / Multiple",     emoji: "🔄" },
];

const RECOVERY_PATHS = ["AA", "NA", "SMART Recovery", "Faith-based", "Peer-based", "Therapy-based", "Mixed approach"];
const TRIGGER_OPTIONS = [
  "Being alone at night", "Arguments with family", "Seeing old friends who use",
  "Financial stress", "Boredom", "Driving past old spots", "Physical pain",
  "Feeling rejected", "Social events with alcohol", "Anger / frustration",
  "Loneliness", "Work stress", "Anxiety", "Depression",
];
const AGE_GROUPS = ["18–24", "25–34", "35–44", "45+"];
const DISCHARGE_SETTINGS = [
  { key: "rehab",      label: "Rehab / Residential" },
  { key: "sober_living",label: "Sober Living" },
  { key: "detox",      label: "Detox" },
  { key: "PHP",        label: "PHP (Partial Hospitalization)" },
  { key: "IOP",        label: "IOP (Intensive Outpatient)" },
  { key: "inpatient",  label: "Inpatient Treatment" },
  { key: "jail",       label: "Jail" },
  { key: "prison",     label: "Prison" },
  { key: "other",      label: "Other" },
];

const EMPTY_FORM = {
  discharge_date: "",
  discharge_setting: "",
  primary_substance: "",
  polysubstance: false,
  secondary_substances: [],
  days_sober_at_discharge: "",
  age_group: "",
  recovery_path: [],
  triggers: [],
  // Legal
  on_probation: false,
  drug_court: false,
  court_ordered_counseling: false,
  required_meeting_frequency: "",
  urine_screens: false,
  next_court_date: "",
  supervising_officer: "",
  legal_notes: "",
  // Life
  housing_status: "",
  employment_status: "",
  transportation_access: false,
  sponsor_available: false,
  family_reconnection: false,
  benefits_needed: false,
  food_insecure: false,
  // Wellness
  therapy_interested: false,
  psychiatric_followup: false,
  sleep_issues: false,
  anxiety_depression_support: false,
  lgbtq_affirming_requested: false,
  trauma_informed_requested: false,
  gender_specific_groups: false,
  emergency_contact_name: "",
  emergency_contact_phone: "",
  // Consent
  consent_given: false,
};

// ── Reusable helpers ───────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <p style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase",
      letterSpacing: ".1em", marginBottom: 10 }}>{children}</p>
  );
}

function ToggleButton({ selected, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      padding: "9px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 13,
      background: selected ? "rgba(99,102,241,0.18)" : "rgba(255,255,255,0.05)",
      border: `1.5px solid ${selected ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.1)"}`,
      color: selected ? "#818CF8" : "rgba(255,255,255,0.6)", fontWeight: selected ? 700 : 500,
      transition: "all 0.15s ease",
    }}>{children}</button>
  );
}

function YesNo({ label, helper, value, onChange }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <p style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{label}</p>
      {helper && <p style={{ fontSize: 11, color: C.muted, marginBottom: 8, lineHeight: 1.5 }}>ℹ️ {helper}</p>}
      <div style={{ display: "flex", gap: 8 }}>
        {[{ v: true, l: "Yes" }, { v: false, l: "No" }].map(o => (
          <button key={String(o.v)} onClick={() => onChange(o.v)} style={{
            flex: 1, padding: "10px", borderRadius: 12, border: "none", cursor: "pointer",
            background: value === o.v ? (o.v ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.08)") : "rgba(255,255,255,0.04)",
            border: `1.5px solid ${value === o.v ? (o.v ? "rgba(16,185,129,0.4)" : "rgba(245,158,11,0.3)") : "rgba(255,255,255,0.08)"}`,
            color: value === o.v ? (o.v ? C.emerald : C.amber) : "rgba(255,255,255,0.4)",
            fontWeight: 700, fontSize: 14,
          }}>{o.l}</button>
        ))}
      </div>
    </div>
  );
}

function TextInput({ label, helper, optional, value, onChange, placeholder, type = "text" }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{label}</p>
        {optional && <span style={{ fontSize: 10, color: C.muted, fontWeight: 600 }}>Optional</span>}
      </div>
      {helper && <p style={{ fontSize: 11, color: C.muted, marginBottom: 6, lineHeight: 1.5 }}>ℹ️ {helper}</p>}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%", padding: "11px 14px", borderRadius: 12, border: "none",
          background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
          color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box",
          colorScheme: "dark",
        }}
      />
    </div>
  );
}

// ── Wizard Steps ───────────────────────────────────────────────────

function Step0({ form, set }) {
  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🗺️</div>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: "#fff", marginBottom: 8, lineHeight: 1.3 }}>
          Aftercare Plan Builder
        </h2>
        <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, maxWidth: 340, margin: "0 auto" }}>
          This tool helps create a personalized, structured aftercare plan based on your situation. Your counselor or case manager will review it — this is a support draft, not final advice.
        </p>
      </div>

      <div style={{ ...C.glass, padding: "16px", marginBottom: 16 }}>
        {[
          { emoji: "🔒", title: "Private & Secure", desc: "Your data is only shared with people you approve." },
          { emoji: "📋", title: "Draft Only", desc: "All plans require review by a licensed professional." },
          { emoji: "🌱", title: "Supportive Tone", desc: "Built to help, not judge. Every answer is valid." },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 12, marginBottom: i < 2 ? 12 : 0,
            paddingBottom: i < 2 ? 12 : 0, borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>{item.emoji}</span>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 2 }}>{item.title}</p>
              <p style={{ fontSize: 12, color: C.muted }}>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: "14px 16px", borderRadius: 14, marginBottom: 20,
        background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.2)" }}>
        <p style={{ fontSize: 12, color: "#FCD34D", lineHeight: 1.6 }}>
          ⚠️ <strong>Disclaimer:</strong> This plan is a support tool and should be reviewed by a licensed professional, case manager, or supervising authority where applicable. It is not medical, legal, or clinical advice.
        </p>
      </div>

      <SectionLabel>Discharge Information</SectionLabel>
      <TextInput
        label="What is your discharge date?"
        value={form.discharge_date}
        onChange={v => set("discharge_date", v)}
        type="date"
        placeholder=""
      />

      <p style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 10 }}>Where are you discharging from?</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
        {DISCHARGE_SETTINGS.map(d => (
          <ToggleButton key={d.key} selected={form.discharge_setting === d.key} onClick={() => set("discharge_setting", d.key)}>
            {d.label}
          </ToggleButton>
        ))}
      </div>

      <p style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 10 }}>Your age group</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {AGE_GROUPS.map(a => (
          <ToggleButton key={a} selected={form.age_group === a} onClick={() => set("age_group", a)}>{a}</ToggleButton>
        ))}
      </div>

      {/* Consent */}
      <div style={{ padding: "16px", borderRadius: 14, background: "rgba(99,102,241,0.07)",
        border: "1.5px solid rgba(99,102,241,0.25)", marginBottom: 4 }}>
        <label style={{ display: "flex", gap: 12, cursor: "pointer", alignItems: "flex-start" }}>
          <input type="checkbox" checked={form.consent_given} onChange={e => set("consent_given", e.target.checked)}
            style={{ width: 18, height: 18, marginTop: 2, accentColor: C.indigo, flexShrink: 0 }} />
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.65 }}>
            I understand this plan is a draft support tool only. I consent to my responses being used to generate a sample aftercare plan that requires professional review before acting on it.
          </p>
        </label>
      </div>
    </div>
  );
}

function Step1({ form, set }) {
  const toggle = (key, val) => {
    const arr = form[key] || [];
    set(key, arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
  };

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 900, color: "#fff", marginBottom: 4 }}>Recovery Profile</h2>
      <p style={{ fontSize: 13, color: C.muted, marginBottom: 20, lineHeight: 1.6 }}>
        This helps us tailor your plan to your specific situation. All answers are optional.
      </p>

      <SectionLabel>Primary Substance</SectionLabel>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
        {SUBSTANCES.map(s => (
          <button key={s.key} onClick={() => set("primary_substance", s.key)} style={{
            padding: "10px 14px", borderRadius: 14, border: "none", cursor: "pointer",
            background: form.primary_substance === s.key ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.05)",
            border: `1.5px solid ${form.primary_substance === s.key ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.1)"}`,
            color: form.primary_substance === s.key ? "#818CF8" : "rgba(255,255,255,0.6)",
            fontWeight: form.primary_substance === s.key ? 700 : 500, fontSize: 13,
          }}>{s.emoji} {s.label}</button>
        ))}
      </div>

      <YesNo label="Polysubstance use?" helper="Were multiple substances part of your use pattern?" value={form.polysubstance} onChange={v => set("polysubstance", v)} />

      <TextInput label="Days sober at discharge" optional value={form.days_sober_at_discharge} onChange={v => set("days_sober_at_discharge", v)} placeholder="e.g. 28" type="number" />

      <SectionLabel>Recovery Path Preference</SectionLabel>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
        {RECOVERY_PATHS.map(p => (
          <ToggleButton key={p} selected={(form.recovery_path || []).includes(p)} onClick={() => toggle("recovery_path", p)}>{p}</ToggleButton>
        ))}
      </div>

      <SectionLabel>Your Triggers (select all that apply)</SectionLabel>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 4 }}>
        {TRIGGER_OPTIONS.map(t => (
          <ToggleButton key={t} selected={(form.triggers || []).includes(t)} onClick={() => toggle("triggers", t)}>{t}</ToggleButton>
        ))}
      </div>
    </div>
  );
}

function Step2({ form, set }) {
  const hasLegal = form.on_probation || form.drug_court || form.court_ordered_counseling;
  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 900, color: "#fff", marginBottom: 4 }}>Legal & Supervision</h2>
      <p style={{ fontSize: 13, color: C.muted, marginBottom: 20, lineHeight: 1.6 }}>
        If you have legal requirements, we'll include a compliance section in your plan. Skip if not applicable.
      </p>

      <YesNo label="Are you on probation or parole?" value={form.on_probation} onChange={v => set("on_probation", v)} />
      <YesNo label="Are you in drug court?" value={form.drug_court} onChange={v => set("drug_court", v)} />
      <YesNo label="Court-ordered counseling?" value={form.court_ordered_counseling} onChange={v => set("court_ordered_counseling", v)} />
      <YesNo label="Required urine screens?" value={form.urine_screens} onChange={v => set("urine_screens", v)} />

      {hasLegal && (
        <>
          <TextInput label="Required meeting frequency" optional value={form.required_meeting_frequency} onChange={v => set("required_meeting_frequency", v)} placeholder="e.g. 3x per week" />
          <TextInput label="Next court date" optional value={form.next_court_date} onChange={v => set("next_court_date", v)} type="date" />
          <TextInput label="Supervising officer / case worker name" optional value={form.supervising_officer} onChange={v => set("supervising_officer", v)} placeholder="Name (optional)" />
          <TextInput label="Additional legal notes" optional value={form.legal_notes} onChange={v => set("legal_notes", v)} placeholder="Any other requirements…" />
        </>
      )}

      <div style={{ padding: "12px 14px", borderRadius: 12, background: "rgba(245,158,11,0.06)",
        border: "1px solid rgba(245,158,11,0.15)", marginTop: 8 }}>
        <p style={{ fontSize: 11, color: "#FCD34D", lineHeight: 1.6 }}>
          🔒 Legal info is used only to add a compliance section to your plan. We do not share this information or make legal conclusions.
        </p>
      </div>
    </div>
  );
}

function Step3({ form, set }) {
  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 900, color: "#fff", marginBottom: 4 }}>Life & Stability</h2>
      <p style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>Helps us build a realistic, practical plan for your real life.</p>

      <SectionLabel>Housing</SectionLabel>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {["Stable housing", "Transitional housing", "Sober living", "Staying with family", "Unstable / unknown", "Seeking housing"].map(h => (
          <ToggleButton key={h} selected={form.housing_status === h} onClick={() => set("housing_status", h)}>{h}</ToggleButton>
        ))}
      </div>

      <SectionLabel>Employment</SectionLabel>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {["Employed full-time", "Employed part-time", "Actively searching", "Not currently working", "Student", "Disability / unable to work"].map(e => (
          <ToggleButton key={e} selected={form.employment_status === e} onClick={() => set("employment_status", e)}>{e}</ToggleButton>
        ))}
      </div>

      <YesNo label="Do you have reliable transportation?" value={form.transportation_access} onChange={v => set("transportation_access", v)} />
      <YesNo label="Do you have a sponsor or accountability partner?" value={form.sponsor_available} onChange={v => set("sponsor_available", v)} />
      <YesNo label="Do you have family reconnection goals?" value={form.family_reconnection} onChange={v => set("family_reconnection", v)} />
      <YesNo label="Do you need benefits assistance (Medicaid, SNAP, etc.)?" value={form.benefits_needed} onChange={v => set("benefits_needed", v)} />
      <YesNo label="Are you experiencing food insecurity?" value={form.food_insecure} onChange={v => set("food_insecure", v)} />
    </div>
  );
}

function Step4({ form, set }) {
  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 900, color: "#fff", marginBottom: 4 }}>Wellness & Support</h2>
      <p style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>Tell us about your mental health and support preferences.</p>

      <YesNo label="Are you interested in therapy?" value={form.therapy_interested} onChange={v => set("therapy_interested", v)} />
      <YesNo label="Do you need psychiatric follow-up?" helper="This may include medication management. All decisions require a licensed clinician." value={form.psychiatric_followup} onChange={v => set("psychiatric_followup", v)} />
      <YesNo label="Are you experiencing sleep issues?" value={form.sleep_issues} onChange={v => set("sleep_issues", v)} />
      <YesNo label="Do you want anxiety / depression support options?" value={form.anxiety_depression_support} onChange={v => set("anxiety_depression_support", v)} />

      <div style={{ ...C.glass, padding: "16px", marginBottom: 16, marginTop: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <Lock style={{ color: C.indigo, width: 14, height: 14 }} />
          <p style={{ fontSize: 11, fontWeight: 800, color: "#818CF8", textTransform: "uppercase", letterSpacing: ".08em" }}>
            Optional Identity & Support Preferences
          </p>
        </div>
        <p style={{ fontSize: 12, color: C.muted, marginBottom: 14, lineHeight: 1.6 }}>
          These optional fields only affect which support resources and groups we recommend. They never affect risk scoring, plan restrictions, or any judgments.
        </p>
        <YesNo label="Would you like LGBTQ+-affirming meeting/resource options?" value={form.lgbtq_affirming_requested} onChange={v => set("lgbtq_affirming_requested", v)} />
        <YesNo label="Would you like gender-specific support group options?" value={form.gender_specific_groups} onChange={v => set("gender_specific_groups", v)} />
        <YesNo label="Would you like trauma-informed support options?" value={form.trauma_informed_requested} onChange={v => set("trauma_informed_requested", v)} />
      </div>

      <SectionLabel>Emergency Contact</SectionLabel>
      <TextInput label="Emergency contact name" optional value={form.emergency_contact_name} onChange={v => set("emergency_contact_name", v)} placeholder="Full name" />
      <TextInput label="Emergency contact phone" optional value={form.emergency_contact_phone} onChange={v => set("emergency_contact_phone", v)} placeholder="(555) 555-5555" type="tel" />
    </div>
  );
}

function Step5({ generating }) {
  return (
    <div style={{ textAlign: "center", padding: "32px 0" }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>
        {generating ? "⏳" : "✅"}
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 900, color: "#fff", marginBottom: 8 }}>
        {generating ? "Generating Your Plan…" : "Ready to Generate"}
      </h2>
      <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, maxWidth: 320, margin: "0 auto" }}>
        {generating
          ? "We're building your personalized aftercare plan. This takes about 30 seconds."
          : "We have everything we need. Click Generate Plan to create your sample aftercare plan draft."
        }
      </p>
      {generating && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 28, textAlign: "left" }}>
          {["Building recovery structure…", "Adding legal compliance section…", "Personalizing support resources…", "Finalizing 90-day milestones…"].map((l, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
              borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <Loader2 style={{ color: C.teal, width: 14, height: 14 }} className="animate-spin" />
              <p style={{ fontSize: 13, color: C.muted }}>{l}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────

export default function AftercarePlanBuilder() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const canAdvance = () => {
    if (step === 0) return form.discharge_date && form.discharge_setting && form.age_group && form.consent_given;
    if (step === 1) return !!form.primary_substance;
    return true;
  };

  const buildPrompt = (f) => `
You are a licensed addiction counselor assistant. Generate a comprehensive, practical, and hopeful sample aftercare plan for a client leaving treatment.

CRITICAL RULES:
- Label everything as "Sample Aftercare Plan – Requires Counselor / Case Manager Review"
- Use supportive, non-stigmatizing language
- Never imply different standards based on identity
- If LGBTQ+-affirming resources are requested, add as optional supportive options only
- For benzodiazepines: direct medication decisions to licensed clinicians only
- Include relapse response steps always
- Include emergency contacts section always

CLIENT PROFILE:
- Discharging from: ${f.discharge_setting}
- Discharge date: ${f.discharge_date}
- Age group: ${f.age_group}
- Primary substance: ${f.primary_substance}
- Polysubstance use: ${f.polysubstance ? "Yes" : "No"}
- Days sober at discharge: ${f.days_sober_at_discharge || "Not provided"}
- Recovery path preference: ${(f.recovery_path || []).join(", ") || "Not specified"}
- Triggers: ${(f.triggers || []).join(", ") || "Not specified"}
- Legal requirements: probation=${f.on_probation}, drug court=${f.drug_court}, court counseling=${f.court_ordered_counseling}, urine screens=${f.urine_screens}
- Housing: ${f.housing_status || "Not specified"}
- Employment: ${f.employment_status || "Not specified"}
- Transportation: ${f.transportation_access ? "Has access" : "Limited/none"}
- Sponsor available: ${f.sponsor_available ? "Yes" : "No"}
- Therapy interested: ${f.therapy_interested ? "Yes" : "No"}
- Psychiatric follow-up needed: ${f.psychiatric_followup ? "Yes" : "No"}
- Sleep issues: ${f.sleep_issues ? "Yes" : "No"}
- Food insecurity: ${f.food_insecure ? "Yes" : "No"}
- Benefits assistance needed: ${f.benefits_needed ? "Yes" : "No"}
- LGBTQ+-affirming resources requested: ${f.lgbtq_affirming_requested ? "Yes" : "No"}
- Trauma-informed support requested: ${f.trauma_informed_requested ? "Yes" : "No"}
- Emergency contact: ${f.emergency_contact_name || "Not provided"}

Generate a complete aftercare plan as a JSON object with EXACTLY this structure:
{
  "title": "Sample Aftercare Plan – Requires Counselor / Case Manager Review",
  "participant_snapshot": "2–3 sentence personalized summary of this person's situation and strengths",
  "immediate_72h": ["action 1", "action 2", "action 3", "action 4", "action 5"],
  "week1_actions": ["action 1", "action 2", "action 3", "action 4", "action 5"],
  "weekly_commitments": ["commitment 1", "commitment 2", "commitment 3", "commitment 4"],
  "meeting_schedule": ["item 1", "item 2", "item 3"],
  "legal_compliance": ${f.on_probation || f.drug_court || f.court_ordered_counseling ? '["requirement 1", "requirement 2", "requirement 3"]' : 'null'},
  "health_wellness": ["action 1", "action 2", "action 3"],
  "employment_education": ["action 1", "action 2", "action 3"],
  "housing_food_transport": ["action 1", "action 2", "action 3"],
  "trigger_prevention": ["strategy 1", "strategy 2", "strategy 3", "strategy 4"],
  "relapse_response_plan": ["step 1", "step 2", "step 3", "step 4"],
  "emergency_plan": ["step 1", "step 2", "step 3"],
  "goals_30day": ["goal 1", "goal 2", "goal 3", "goal 4"],
  "milestones_90day": ["milestone 1", "milestone 2", "milestone 3", "milestone 4"],
  "accountability_team": ["role/action 1", "role/action 2", "role/action 3"],
  "support_resources": ["resource 1", "resource 2", "resource 3"],
  "counselor_review_note": "1–2 sentences for the reviewing professional about key areas to address"
}

Make every item specific, actionable, and time-referenced. Use hopeful but realistic language. No generic platitudes.
`;

  const generatePlan = useMutation({
    mutationFn: async () => {
      setGenerating(true);
      setError(null);

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: buildPrompt(form),
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            participant_snapshot: { type: "string" },
            immediate_72h: { type: "array", items: { type: "string" } },
            week1_actions: { type: "array", items: { type: "string" } },
            weekly_commitments: { type: "array", items: { type: "string" } },
            meeting_schedule: { type: "array", items: { type: "string" } },
            legal_compliance: { type: ["array", "null"], items: { type: "string" } },
            health_wellness: { type: "array", items: { type: "string" } },
            employment_education: { type: "array", items: { type: "string" } },
            housing_food_transport: { type: "array", items: { type: "string" } },
            trigger_prevention: { type: "array", items: { type: "string" } },
            relapse_response_plan: { type: "array", items: { type: "string" } },
            emergency_plan: { type: "array", items: { type: "string" } },
            goals_30day: { type: "array", items: { type: "string" } },
            milestones_90day: { type: "array", items: { type: "string" } },
            accountability_team: { type: "array", items: { type: "string" } },
            support_resources: { type: "array", items: { type: "string" } },
            counselor_review_note: { type: "string" },
          }
        }
      });

      // Save plan to DB
      const saved = await base44.entities.AftercareBuilderPlan.create({
        user_email: user.email,
        status: "draft",
        discharge_date: form.discharge_date,
        discharge_setting: form.discharge_setting,
        primary_substance: form.primary_substance,
        polysubstance: form.polysubstance,
        age_group: form.age_group,
        recovery_path: form.recovery_path,
        triggers: form.triggers,
        lgbtq_affirming_requested: form.lgbtq_affirming_requested,
        trauma_informed_requested: form.trauma_informed_requested,
        gender_specific_groups: form.gender_specific_groups,
        therapy_interested: form.therapy_interested,
        psychiatric_followup: form.psychiatric_followup,
        sponsor_available: form.sponsor_available,
        housing_status: form.housing_status,
        employment_status: form.employment_status,
        transportation_access: form.transportation_access,
        legal_requirements: {
          on_probation: form.on_probation,
          drug_court: form.drug_court,
          court_ordered_counseling: form.court_ordered_counseling,
          urine_screens: form.urine_screens,
          required_meeting_frequency: form.required_meeting_frequency,
          next_court_date: form.next_court_date,
          supervising_officer: form.supervising_officer,
          legal_notes: form.legal_notes,
        },
        wellness_needs: {
          sleep_issues: form.sleep_issues,
          anxiety_depression_support: form.anxiety_depression_support,
          food_insecure: form.food_insecure,
          benefits_needed: form.benefits_needed,
          emergency_contact_name: form.emergency_contact_name,
          emergency_contact_phone: form.emergency_contact_phone,
        },
        generated_plan_json: result,
        consent_given: true,
      });

      return saved.id;
    },
    onSuccess: (planId) => {
      setGenerating(false);
      navigate(`/AftercarePlanView?planId=${planId}`);
    },
    onError: (err) => {
      setGenerating(false);
      setError("Something went wrong generating your plan. Please try again.");
    },
  });

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else generatePlan.mutate();
  };

  const progress = ((step) / (STEPS.length - 1)) * 100;

  return (
    <div style={{ background: "linear-gradient(170deg,#07090F 0%,#0A0F1A 100%)", minHeight: "100vh", paddingBottom: 110 }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ padding: "56px 20px 20px", background: "linear-gradient(155deg,#0D1028,#080E1C)" }}>
          <button onClick={() => step > 0 ? setStep(s => s - 1) : navigate("/")}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none",
              color: C.muted, cursor: "pointer", fontSize: 13, marginBottom: 20, padding: 0, fontWeight: 600 }}>
            <ArrowLeft style={{ width: 15, height: 15 }} /> {step > 0 ? "Back" : "Home"}
          </button>

          {/* Progress bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div style={{ flex: 1, background: "rgba(255,255,255,0.07)", borderRadius: 4, height: 5, overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 4, width: `${progress}%`,
                background: `linear-gradient(90deg,${C.indigo},${C.purple})`, transition: "width 0.4s ease" }} />
            </div>
            <p style={{ fontSize: 11, color: C.muted, fontWeight: 700, flexShrink: 0 }}>
              {step + 1} / {STEPS.length}
            </p>
          </div>
          <p style={{ fontSize: 11, color: "rgba(129,140,248,0.7)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em" }}>
            {STEPS[step]}
          </p>
        </div>

        <div style={{ padding: "20px 16px" }}>
          {error && (
            <div style={{ padding: "12px 14px", borderRadius: 12, marginBottom: 16,
              background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <p style={{ fontSize: 13, color: "#F87171" }}>{error}</p>
            </div>
          )}

          {step === 0 && <Step0 form={form} set={set} />}
          {step === 1 && <Step1 form={form} set={set} />}
          {step === 2 && <Step2 form={form} set={set} />}
          {step === 3 && <Step3 form={form} set={set} />}
          {step === 4 && <Step4 form={form} set={set} />}
          {step === 5 && <Step5 generating={generating} />}
        </div>

        {/* Bottom nav */}
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 200,
          background: "rgba(7,9,15,0.97)", borderTop: "1px solid rgba(255,255,255,0.07)",
          padding: "12px 16px", backdropFilter: "blur(16px)" }}>
          <div style={{ maxWidth: 480, margin: "0 auto" }}>
            <button
              onClick={handleNext}
              disabled={!canAdvance() || generating}
              style={{
                width: "100%", padding: "15px", borderRadius: 14, border: "none",
                cursor: canAdvance() && !generating ? "pointer" : "not-allowed",
                background: canAdvance() && !generating
                  ? `linear-gradient(135deg,${C.indigo},${C.purple})`
                  : "rgba(255,255,255,0.07)",
                color: canAdvance() && !generating ? "#fff" : C.muted,
                fontWeight: 800, fontSize: 15,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: canAdvance() && !generating ? "0 6px 24px rgba(99,102,241,0.3)" : "none",
              }}
            >
              {generating
                ? <><Loader2 style={{ width: 16, height: 16 }} className="animate-spin" /> Generating…</>
                : step === STEPS.length - 1
                  ? "✨ Generate My Plan"
                  : <>Continue <ArrowRight style={{ width: 16, height: 16 }} /></>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}