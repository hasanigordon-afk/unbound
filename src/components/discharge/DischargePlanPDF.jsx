import { jsPDF } from "jspdf";

const ACCENT = [62, 207, 191];    // teal
const DARK   = [11, 18, 32];      // navy
const GRAY   = [90, 90, 90];
const LIGHT  = [245, 247, 250];
const WHITE  = [255, 255, 255];
const RED    = [239, 68, 68];
const GOLD   = [201, 169, 110];

function hex(r, g, b) { return [r, g, b]; }

function setFill(doc, rgb) { doc.setFillColor(...rgb); }
function setTextColor(doc, rgb) { doc.setTextColor(...rgb); }
function setDrawColor(doc, rgb) { doc.setDrawColor(...rgb); }

const PW = 210; // A4 width mm
const PH = 297; // A4 height mm
const ML = 18;  // margin left
const MR = 18;  // margin right
const CW = PW - ML - MR; // content width

export function generateDischargePlanPDF(formData, contacts) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = 0;

  // ─── helpers ────────────────────────────────────────────────
  const val = (v) => v ? String(v).trim() : "";
  const fmt = (v) => val(v) || "—";

  function newPage() {
    doc.addPage();
    y = 0;
    drawPageHeader();
  }

  function checkY(needed) {
    if (y + needed > PH - 16) newPage();
  }

  // ─── Page header strip (repeating) ──────────────────────────
  function drawPageHeader() {
    setFill(doc, DARK);
    doc.rect(0, 0, PW, 14, "F");
    setTextColor(doc, [62, 207, 191]);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text("UNBOUND · RECOVERY ROADMAP", ML, 9);
    setTextColor(doc, [150, 150, 160]);
    doc.text(`Patient: ${fmt(formData.participant_email)}   |   Generated: ${new Date().toLocaleDateString()}`, PW - MR, 9, { align: "right" });
    y = 18;
  }

  // ─── Cover page ─────────────────────────────────────────────
  function drawCoverPage() {
    // Dark hero bg
    setFill(doc, DARK);
    doc.rect(0, 0, PW, PH, "F");

    // Teal accent bar left
    setFill(doc, ACCENT);
    doc.rect(0, 0, 6, PH, "F");

    // Logo / title block
    setFill(doc, [18, 30, 55]);
    doc.roundedRect(ML, 40, CW, 80, 4, 4, "F");

    setTextColor(doc, ACCENT);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("RECOVERY ROADMAP", ML + CW / 2, 58, { align: "center" });

    setTextColor(doc, WHITE);
    doc.setFontSize(26);
    doc.setFont("helvetica", "bold");
    doc.text("Discharge Treatment Plan", ML + CW / 2, 74, { align: "center" });

    setFill(doc, ACCENT);
    doc.rect(ML + 30, 80, CW - 60, 0.5, "F");

    // Patient info
    setTextColor(doc, [180, 200, 220]);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    if (formData.participant_email) {
      doc.text(`Patient: ${formData.participant_email}`, ML + CW / 2, 93, { align: "center" });
    }
    if (formData.discharge_date) {
      doc.text(`Discharge Date: ${formData.discharge_date}`, ML + CW / 2, 102, { align: "center" });
    }
    if (formData.counselor_email) {
      doc.text(`Prepared by: ${formData.counselor_email}`, ML + CW / 2, 111, { align: "center" });
    }

    // Status badge
    const isFinalized = formData.status === "finalized";
    setFill(doc, isFinalized ? [16, 60, 40] : [60, 45, 10]);
    doc.roundedRect(ML + CW / 2 - 22, 124, 44, 10, 2, 2, "F");
    setTextColor(doc, isFinalized ? [52, 211, 153] : [251, 191, 36]);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(isFinalized ? "✓ FINALIZED" : "DRAFT", ML + CW / 2, 130.5, { align: "center" });

    // Table of contents
    setFill(doc, [15, 25, 48]);
    doc.roundedRect(ML, 148, CW, 110, 4, 4, "F");

    setTextColor(doc, ACCENT);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("PLAN CONTENTS", ML + 10, 160);

    const sections = [
      "1. Discharge Information",
      "2. Aftercare Plan",
      "3. Housing Plan",
      "4. Employment & Education",
      "5. Medical & Mental Health",
      "6. Transportation",
      "7. Legal & Accountability",
      "8. Relapse Prevention",
      "9. 30 / 60 / 90 Day Goals",
      "10. Emergency Contacts",
    ];

    setTextColor(doc, [160, 180, 210]);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    sections.forEach((s, i) => {
      const col = i < 5 ? 0 : 1;
      const row = i < 5 ? i : i - 5;
      doc.text(s, ML + 10 + col * (CW / 2), 170 + row * 10);
    });

    // Crisis footer
    setFill(doc, [80, 10, 10]);
    doc.rect(0, PH - 28, PW, 28, "F");
    setTextColor(doc, [248, 113, 113]);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("CRISIS SUPPORT", ML, PH - 18);
    setTextColor(doc, [255, 200, 200]);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("National Crisis Line: 988  |  SAMHSA: 1-800-662-4357  |  Emergency: 911", ML, PH - 10);
  }

  // ─── Section header ──────────────────────────────────────────
  function sectionHeader(title, emoji, color = ACCENT) {
    checkY(22);
    setFill(doc, DARK);
    doc.rect(ML, y, CW, 12, "F");
    setFill(doc, color);
    doc.rect(ML, y, 3, 12, "F");
    setTextColor(doc, color);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`${emoji}  ${title.toUpperCase()}`, ML + 8, y + 8);
    y += 16;
  }

  // ─── Field row ───────────────────────────────────────────────
  function field(label, value, fullWidth = false) {
    if (!val(value)) return;
    const text = fmt(value);
    const lines = doc.splitTextToSize(text, fullWidth ? CW - 4 : CW / 2 - 10);
    const needed = 6 + lines.length * 5 + 4;
    checkY(needed);

    setFill(doc, LIGHT);
    doc.roundedRect(ML, y, fullWidth ? CW : CW - 2, needed - 2, 2, 2, "F");

    setTextColor(doc, GRAY);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text(label.toUpperCase(), ML + 4, y + 5);

    setTextColor(doc, DARK);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    lines.forEach((line, i) => {
      doc.text(line, ML + 4, y + 11 + i * 5);
    });
    y += needed + 2;
  }

  // ─── Two column fields ───────────────────────────────────────
  function twoCol(pairs) {
    const halfW = (CW - 6) / 2;
    let i = 0;
    while (i < pairs.length) {
      const [la, va] = pairs[i];
      const [lb, vb] = pairs[i + 1] || ["", ""];
      const hasA = val(va);
      const hasB = val(vb);
      if (!hasA && !hasB) { i += 2; continue; }
      checkY(20);
      if (hasA) {
        setFill(doc, LIGHT);
        doc.roundedRect(ML, y, halfW, 18, 2, 2, "F");
        setTextColor(doc, GRAY);
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.text(la.toUpperCase(), ML + 4, y + 5);
        setTextColor(doc, DARK);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text(doc.splitTextToSize(fmt(va), halfW - 8)[0], ML + 4, y + 13);
      }
      if (hasB) {
        const x2 = ML + halfW + 6;
        setFill(doc, LIGHT);
        doc.roundedRect(x2, y, halfW, 18, 2, 2, "F");
        setTextColor(doc, GRAY);
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.text(lb.toUpperCase(), x2 + 4, y + 5);
        setTextColor(doc, DARK);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text(doc.splitTextToSize(fmt(vb), halfW - 8)[0], x2 + 4, y + 13);
      }
      y += 22;
      i += 2;
    }
  }

  // ─── Long text block ─────────────────────────────────────────
  function textBlock(label, value, color = ACCENT) {
    if (!val(value)) return;
    const lines = doc.splitTextToSize(value, CW - 10);
    const needed = 10 + lines.length * 5 + 6;
    checkY(needed);
    setFill(doc, [245, 250, 255]);
    doc.roundedRect(ML, y, CW, needed, 2, 2, "F");
    setFill(doc, color);
    doc.rect(ML, y, 3, needed, "F");
    setTextColor(doc, color);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text(label.toUpperCase(), ML + 8, y + 6);
    setTextColor(doc, DARK);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    lines.forEach((line, i) => doc.text(line, ML + 8, y + 13 + i * 5));
    y += needed + 4;
  }

  // ─── Goals timeline block ────────────────────────────────────
  function goalBlock(label, value, color) {
    if (!val(value)) return;
    const lines = doc.splitTextToSize(value, CW / 3 - 12);
    const needed = 12 + lines.length * 5 + 6;
    return { label, lines, needed, color };
  }

  function threeGoalCols(g30, g60, g90) {
    const cols = [g30, g60, g90].filter(Boolean);
    if (!cols.length) return;
    const colW = (CW - 8) / 3;
    const maxNeeded = Math.max(...cols.map((c) => c.needed));
    checkY(maxNeeded + 4);

    [g30, g60, g90].forEach((g, ci) => {
      if (!g) return;
      const x = ML + ci * (colW + 4);
      setFill(doc, [240, 248, 255]);
      doc.roundedRect(x, y, colW, maxNeeded, 2, 2, "F");
      setFill(doc, g.color);
      doc.rect(x, y, colW, 10, "F");
      setTextColor(doc, WHITE);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text(g.label, x + colW / 2, y + 7, { align: "center" });
      setTextColor(doc, DARK);
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      g.lines.forEach((line, i) => doc.text(line, x + 4, y + 17 + i * 5));
    });
    y += maxNeeded + 6;
  }

  // ─── Contact card ────────────────────────────────────────────
  function contactCard(contact, index) {
    const needed = 36;
    checkY(needed + 2);
    setFill(doc, LIGHT);
    doc.roundedRect(ML, y, CW, needed, 3, 3, "F");
    setFill(doc, ACCENT);
    doc.roundedRect(ML, y, 3, needed, 2, 2, "F");

    setTextColor(doc, DARK);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(`Contact ${index + 1}: ${fmt(contact.name)}`, ML + 8, y + 8);
    setTextColor(doc, GRAY);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`Relationship: ${fmt(contact.relationship)}`, ML + 8, y + 16);
    doc.text(`Phone: ${fmt(contact.phone)}`, ML + 8, y + 23);
    if (contact.email) doc.text(`Email: ${contact.email}`, ML + 8, y + 30);
    if (contact.notify_of_relapse) {
      setTextColor(doc, RED);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");
      doc.text("⚠ Notify if relapse occurs", ML + CW - 4, y + 8, { align: "right" });
    }
    y += needed + 4;
  }

  // ─── START RENDERING ────────────────────────────────────────
  drawCoverPage();

  // Page 2+
  doc.addPage();
  drawPageHeader();

  // 1. Discharge Info
  sectionHeader("Discharge Information", "📋");
  twoCol([
    ["Discharge Date", formData.discharge_date],
    ["Discharge Type", formData.discharge_type?.replace(/_/g, " ")],
    ["Primary Diagnosis", formData.primary_diagnosis],
    ["Counselor", formData.counselor_email],
  ]);
  textBlock("Medications at Discharge", formData.medications_at_discharge, GOLD);
  textBlock("Clinical Discharge Summary", formData.discharge_summary, GRAY);

  // 2. Aftercare
  y += 4;
  sectionHeader("Aftercare Plan", "🏥");
  twoCol([
    ["Program Level", formData.aftercare_program],
    ["Provider / Facility", formData.aftercare_provider],
    ["First Appointment", formData.first_aftercare_appointment],
    ["Meetings Per Week", formData.meetings_per_week ? `${formData.meetings_per_week}x/week` : null],
    ["Meeting Type", formData.preferred_meeting_type],
    ["Sponsor / Mentor", formData.sponsor_name],
    ["Sponsor Phone", formData.sponsor_phone],
    ["", ""],
  ]);

  // 3. Housing
  y += 4;
  sectionHeader("Housing Plan", "🏠");
  twoCol([
    ["Housing Status", formData.housing_status?.replace(/_/g, " ")],
    ["Address", formData.housing_address],
    ["Contact Name", formData.housing_contact_name],
    ["Contact Phone", formData.housing_contact_phone],
  ]);
  textBlock("Housing Notes", formData.housing_notes);

  // 4. Employment
  y += 4;
  sectionHeader("Employment & Education", "💼");
  twoCol([
    ["Employment Status", formData.employment_status?.replace(/_/g, " ")],
    ["Employer / School", formData.employer_name],
    ["Start / Return Date", formData.employment_start_date],
    ["", ""],
  ]);
  textBlock("Education / Training Goal", formData.education_goal, GOLD);
  textBlock("Vocational Support", formData.vocational_support);
  textBlock("Employment Notes", formData.employment_notes);

  // 5. Medical & Mental Health
  y += 4;
  sectionHeader("Medical & Mental Health", "🩺");

  // PCP
  setTextColor(doc, ACCENT);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("PRIMARY CARE", ML, y);
  y += 5;
  twoCol([
    ["Provider Name", formData.primary_care_provider],
    ["PCP Phone", formData.pcp_phone],
    ["Appointment Date", formData.pcp_appointment_date],
    ["", ""],
  ]);

  // Psychiatry
  setTextColor(doc, GOLD);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("PSYCHIATRY", ML, y);
  y += 5;
  twoCol([
    ["Psychiatrist", formData.psychiatrist_name],
    ["Psych Phone", formData.psychiatrist_phone],
    ["Appointment Date", formData.psychiatrist_appointment_date],
    ["", ""],
  ]);

  // Therapy
  setTextColor(doc, [167, 139, 250]);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("THERAPY", ML, y);
  y += 5;
  twoCol([
    ["Therapist", formData.therapist_name],
    ["Therapist Phone", formData.therapist_phone],
    ["Appointment Date", formData.therapist_appointment_date],
    ["", ""],
  ]);

  textBlock("Ongoing Medications", formData.medications_list, GOLD);
  textBlock("Insurance / Benefits", formData.insurance_info);

  // 6. Transportation
  y += 4;
  sectionHeader("Transportation", "🚗");
  twoCol([
    ["Transportation Method", formData.transportation_method?.replace(/_/g, " ")],
    ["License Status", formData.license_status?.replace(/_/g, " ")],
  ]);
  textBlock("Transportation Notes", formData.transportation_notes);

  // 7. Legal
  y += 4;
  sectionHeader("Legal & Accountability", "⚖️");
  if (formData.has_legal_obligations === "yes") {
    twoCol([
      ["Probation Officer", formData.probation_officer_name],
      ["P.O. Phone", formData.probation_officer_phone],
    ]);
    textBlock("Court Dates", formData.court_dates);
    textBlock("Drug Testing Requirements", formData.drug_testing_requirements);
  } else {
    const statusLabel = formData.has_legal_obligations === "no" ? "No active legal obligations" : "Pending / Under Review";
    field("Legal Obligations Status", statusLabel, true);
  }
  textBlock("Legal Notes", formData.legal_notes);

  // 8. Relapse Prevention
  y += 4;
  sectionHeader("Relapse Prevention Plan", "🛡️", RED);
  textBlock("Personal Warning Signs", formData.warning_signs, RED);
  textBlock("Known Triggers", formData.triggers_text, [234, 88, 12]);
  textBlock("Healthy Coping Strategies", formData.coping_strategies_text, [16, 185, 129]);
  textBlock("If I Relapse, My Plan Is...", formData.relapse_action_plan, RED);
  textBlock("People to Call in Crisis", formData.people_to_call_in_crisis);

  // 9. Goals
  y += 4;
  sectionHeader("30 / 60 / 90 Day Recovery Goals", "🎯", GOLD);
  threeGoalCols(
    goalBlock("30 Days", formData.goals_30_day, ACCENT),
    goalBlock("60 Days", formData.goals_60_day, GOLD),
    goalBlock("90 Days", formData.goals_90_day, [167, 139, 250]),
  );

  // 10. Emergency Contacts
  if (contacts?.length) {
    y += 4;
    sectionHeader("Emergency Contacts", "📞");
    contacts.filter((c) => c.name).forEach((c, i) => contactCard(c, i));
  }

  // ─── Final footer page ───────────────────────────────────────
  checkY(60);
  y += 8;
  setFill(doc, [10, 20, 38]);
  doc.roundedRect(ML, y, CW, 48, 4, 4, "F");
  setFill(doc, ACCENT);
  doc.rect(ML, y, 3, 48, "F");
  setTextColor(doc, ACCENT);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("IMPORTANT REMINDERS", ML + 10, y + 10);
  setTextColor(doc, [160, 190, 220]);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  const reminders = [
    "• Attend all scheduled aftercare appointments — consistency is key to long-term recovery.",
    "• Use this plan as your roadmap. Review it daily, especially your goals and warning signs.",
    "• Contact your counselor or sponsor if you experience cravings or feel at risk.",
    "• Call 988 (Suicide & Crisis Lifeline) or 911 if you are in immediate danger.",
  ];
  reminders.forEach((r, i) => doc.text(r, ML + 10, y + 20 + i * 8));

  // Page numbers
  const totalPages = doc.getNumberOfPages();
  for (let p = 2; p <= totalPages; p++) {
    doc.setPage(p);
    setTextColor(doc, [120, 130, 150]);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(`Page ${p} of ${totalPages}`, PW / 2, PH - 8, { align: "center" });
    setTextColor(doc, [80, 90, 110]);
    doc.text("Unbound · Discharge Treatment Plan · Confidential", PW / 2, PH - 4, { align: "center" });
  }

  const name = formData.participant_email?.split("@")[0] || "patient";
  doc.save(`discharge-plan-${name}-${new Date().toISOString().split("T")[0]}.pdf`);
}