import React from "react";

const C = {
  teal: "#3ECFBF",
  slate: "rgba(255,255,255,0.65)",
  muted: "rgba(255,255,255,0.3)",
};

const REVIEW_SECTIONS = [
  {
    title: "📋 Discharge Info",
    fields: [
      { key: "discharge_date", label: "Discharge Date" },
      { key: "discharge_type", label: "Type" },
      { key: "primary_diagnosis", label: "Primary Diagnosis" },
      { key: "medications_at_discharge", label: "Medications at Discharge" },
      { key: "discharge_summary", label: "Clinical Summary" },
    ],
  },
  {
    title: "🏥 Aftercare Plan",
    fields: [
      { key: "aftercare_program", label: "Program Level" },
      { key: "aftercare_provider", label: "Provider" },
      { key: "first_aftercare_appointment", label: "First Appointment" },
      { key: "meetings_per_week", label: "Meetings / Week" },
      { key: "preferred_meeting_type", label: "Meeting Type" },
      { key: "sponsor_name", label: "Sponsor / Mentor" },
      { key: "sponsor_phone", label: "Sponsor Phone" },
    ],
  },
  {
    title: "🏠 Housing Plan",
    fields: [
      { key: "housing_status", label: "Housing Status" },
      { key: "housing_address", label: "Address" },
      { key: "housing_contact_name", label: "Housing Contact" },
      { key: "housing_contact_phone", label: "Contact Phone" },
      { key: "housing_notes", label: "Notes" },
    ],
  },
  {
    title: "💼 Employment & Education",
    fields: [
      { key: "employment_status", label: "Status" },
      { key: "employer_name", label: "Employer / School" },
      { key: "employment_start_date", label: "Start Date" },
      { key: "education_goal", label: "Education Goal" },
      { key: "vocational_support", label: "Vocational Support" },
      { key: "employment_notes", label: "Notes" },
    ],
  },
  {
    title: "🩺 Medical & Mental Health",
    fields: [
      { key: "primary_care_provider", label: "Primary Care Provider" },
      { key: "pcp_phone", label: "PCP Phone" },
      { key: "pcp_appointment_date", label: "PCP Appointment" },
      { key: "psychiatrist_name", label: "Psychiatrist" },
      { key: "psychiatrist_phone", label: "Psychiatrist Phone" },
      { key: "psychiatrist_appointment_date", label: "Psychiatry Appointment" },
      { key: "therapist_name", label: "Therapist" },
      { key: "therapist_phone", label: "Therapist Phone" },
      { key: "therapist_appointment_date", label: "Therapy Appointment" },
      { key: "medications_list", label: "Ongoing Medications" },
      { key: "insurance_info", label: "Insurance / Benefits" },
    ],
  },
  {
    title: "🚗 Transportation",
    fields: [
      { key: "transportation_method", label: "Primary Method" },
      { key: "license_status", label: "Driver's License" },
      { key: "transportation_notes", label: "Notes / Barriers" },
    ],
  },
  {
    title: "⚖️ Legal & Accountability",
    fields: [
      { key: "has_legal_obligations", label: "Legal Obligations" },
      { key: "probation_officer_name", label: "Probation Officer" },
      { key: "probation_officer_phone", label: "P.O. Phone" },
      { key: "court_dates", label: "Court Dates" },
      { key: "drug_testing_requirements", label: "Drug Testing" },
      { key: "legal_notes", label: "Notes" },
    ],
  },
  {
    title: "🛡️ Relapse Prevention",
    fields: [
      { key: "warning_signs", label: "Warning Signs" },
      { key: "triggers_text", label: "Known Triggers" },
      { key: "coping_strategies_text", label: "Coping Strategies" },
      { key: "relapse_action_plan", label: "Relapse Action Plan" },
      { key: "people_to_call_in_crisis", label: "Crisis Contacts" },
    ],
  },
  {
    title: "🎯 30 / 60 / 90 Day Goals",
    fields: [
      { key: "goals_30_day", label: "First 30 Days" },
      { key: "goals_60_day", label: "First 60 Days" },
      { key: "goals_90_day", label: "First 90 Days" },
    ],
  },
];

export default function DischargeReview({ formData, contacts }) {
  return (
    <div>
      <div style={{
        background: "rgba(62,207,191,0.08)",
        border: "1px solid rgba(62,207,191,0.25)",
        borderRadius: 14,
        padding: "14px 16px",
        marginBottom: 20,
      }}>
        <p style={{ fontSize: 14, fontWeight: 800, color: C.teal }}>📋 Complete Plan Review</p>
        <p style={{ fontSize: 13, color: C.slate, marginTop: 4, lineHeight: 1.6 }}>
          Review every section below. Once you finalize, this plan will be locked and accessible to the patient as their recovery roadmap.
        </p>
      </div>

      {REVIEW_SECTIONS.map((section) => {
        const filledFields = section.fields.filter((f) => formData[f.key]);
        return (
          <div key={section.title} style={{
            background: "rgba(255,255,255,0.04)",
            border: `1px solid ${filledFields.length > 0 ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)"}`,
            borderRadius: 14,
            padding: "16px",
            marginBottom: 12,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: filledFields.length > 0 ? 12 : 0 }}>
              <p style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{section.title}</p>
              {filledFields.length === 0 && (
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", fontStyle: "italic" }}>Not filled in</span>
              )}
            </div>
            {filledFields.map((f) => (
              <div key={f.key} style={{ marginBottom: 10 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: ".06em" }}>
                  {f.label}
                </p>
                <p style={{ fontSize: 13, color: C.slate, marginTop: 3, lineHeight: 1.6 }}>
                  {String(formData[f.key])}
                </p>
              </div>
            ))}
          </div>
        );
      })}

      {/* Emergency Contacts */}
      {contacts.some((c) => c.name) && (
        <div style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 14,
          padding: "16px",
          marginBottom: 12,
        }}>
          <p style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginBottom: 12 }}>📞 Emergency Contacts</p>
          {contacts.filter((c) => c.name).map((c, i) => (
            <div key={i} style={{
              paddingBottom: 10,
              marginBottom: 10,
              borderBottom: i < contacts.filter(x => x.name).length - 1 ? "1px solid rgba(255,255,255,0.07)" : "none",
            }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>
                {c.name}
                {c.relationship && (
                  <span style={{ fontWeight: 400, color: C.muted }}> · {c.relationship}</span>
                )}
              </p>
              {c.phone && <p style={{ fontSize: 13, color: C.slate, marginTop: 2 }}>📞 {c.phone}</p>}
              {c.email && <p style={{ fontSize: 13, color: C.slate, marginTop: 1 }}>✉️ {c.email}</p>}
              {c.notify_of_relapse && (
                <p style={{ fontSize: 11, color: C.teal, marginTop: 4, fontWeight: 700 }}>⚡ Notify in case of relapse</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}