import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import {
  AlertTriangle, CheckCircle2, Calendar, Phone, FileText,
  Home, Briefcase, Shield, Clock, ChevronRight, Loader2, ArrowLeft
} from "lucide-react";

// ── Tokens ──────────────────────────────────────────────────────
const C = {
  teal:    "#3ECFBF",
  gold:    "#C9A96E",
  red:     "#EF4444",
  emerald: "#10B981",
  indigo:  "#818CF8",
  navy:    "#0B1220",
  slate:   "rgba(255,255,255,0.65)",
  muted:   "rgba(255,255,255,0.3)",
};

// ── Helpers ──────────────────────────────────────────────────────
const today = new Date();
today.setHours(0, 0, 0, 0);

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return Math.round((d - today) / 86400000);
}

function fmt(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function urgencyColor(days) {
  if (days === null) return C.muted;
  if (days < 0)  return C.red;
  if (days <= 3) return "#FB923C";
  if (days <= 7) return C.gold;
  return C.emerald;
}

function urgencyLabel(days) {
  if (days === null) return "";
  if (days < 0)  return `${Math.abs(days)}d overdue`;
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
}

// ── Sub-components ───────────────────────────────────────────────
function SectionLabel({ children, icon }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
      {icon && <span style={{ fontSize: 14 }}>{icon}</span>}
      <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "1px" }}>{children}</p>
      <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
    </div>
  );
}

function RiskBadge({ label, detail, color }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 14px",
      background: `${color}12`, border: `1px solid ${color}35`, borderRadius: 12, marginBottom: 8,
    }}>
      <AlertTriangle style={{ width: 14, height: 14, color, flexShrink: 0, marginTop: 1 }} />
      <div>
        <p style={{ fontSize: 13, fontWeight: 700, color }}>{label}</p>
        {detail && <p style={{ fontSize: 12, color: C.slate, marginTop: 2, lineHeight: 1.5 }}>{detail}</p>}
      </div>
    </div>
  );
}

function AppointmentRow({ icon, label, dateStr, provider, phone }) {
  const days = daysUntil(dateStr);
  const color = urgencyColor(days);
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 12, marginBottom: 8,
    }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}18`,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{label}</p>
        {provider && <p style={{ fontSize: 12, color: C.muted, marginTop: 1 }}>{provider}</p>}
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <p style={{ fontSize: 12, fontWeight: 800, color }}>{urgencyLabel(days)}</p>
        <p style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>{fmt(dateStr)}</p>
      </div>
    </div>
  );
}

function ProgressPill({ label, value, filled }) {
  return (
    <div style={{
      padding: "10px 14px", borderRadius: 12,
      background: filled ? "rgba(16,185,129,0.08)" : "rgba(255,255,255,0.03)",
      border: `1px solid ${filled ? "rgba(16,185,129,0.25)" : "rgba(255,255,255,0.07)"}`,
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
    }}>
      <p style={{ fontSize: 13, color: filled ? C.emerald : C.muted, fontWeight: 600 }}>{label}</p>
      {filled
        ? <CheckCircle2 style={{ width: 14, height: 14, color: C.emerald, flexShrink: 0 }} />
        : <span style={{ fontSize: 11, color: C.muted }}>—</span>
      }
      {value && <p style={{ fontSize: 12, color: C.slate, maxWidth: 120, textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</p>}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────
export default function PatientSummaryDashboard() {
  const urlParams = new URLSearchParams(window.location.search);
  const patientEmail = urlParams.get("patient_email");

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  // Resolve email: URL param → current user
  const email = patientEmail || user?.email;

  const { data: plans = [], isLoading: planLoading } = useQuery({
    queryKey: ["discharge-plan-summary", email],
    queryFn: () => base44.entities.DischargePlan.filter({ participant_email: email }, "-created_date", 1),
    enabled: !!email,
  });

  const { data: checkIns = [] } = useQuery({
    queryKey: ["checkins-summary", email],
    queryFn: () => base44.entities.DailyCheckIn.filter({ participant_email: email }, "-check_in_date", 30),
    enabled: !!email,
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ["sessions-summary", email],
    queryFn: () => base44.entities.TelehealthSession.filter({ participant_email: email }, "scheduled_date", 10),
    enabled: !!email,
  });

  const plan = plans[0];

  if (!email) return (
    <div style={{ background: C.navy, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: C.muted }}>No patient email provided.</p>
    </div>
  );

  if (planLoading) return (
    <div style={{ background: C.navy, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Loader2 style={{ width: 28, height: 28, color: C.teal }} className="animate-spin" />
    </div>
  );

  // ── Derived data ─────────────────────────────────────────────

  // Upcoming appointments from discharge plan
  const appointments = [];
  if (plan) {
    if (plan.pcp_appointment_date)            appointments.push({ key: "pcp",    icon: <Phone style={{ width: 15, height: 15, color: C.teal }} />,    label: "Primary Care",     dateStr: plan.pcp_appointment_date,             provider: plan.primary_care_provider,   phone: plan.pcp_phone });
    if (plan.psychiatrist_appointment_date)   appointments.push({ key: "psych",  icon: <Calendar style={{ width: 15, height: 15, color: C.indigo }} />, label: "Psychiatry",       dateStr: plan.psychiatrist_appointment_date,     provider: plan.psychiatrist_name,       phone: plan.psychiatrist_phone });
    if (plan.therapist_appointment_date)      appointments.push({ key: "therapy",icon: <Calendar style={{ width: 15, height: 15, color: "#A78BFA" }} />, label: "Therapy",          dateStr: plan.therapist_appointment_date,        provider: plan.therapist_name,          phone: plan.therapist_phone });
    if (plan.first_aftercare_appointment)     appointments.push({ key: "after",  icon: <CheckCircle2 style={{ width: 15, height: 15, color: C.emerald }} />, label: "First Aftercare Appt", dateStr: plan.first_aftercare_appointment, provider: plan.aftercare_provider });
    if (plan.pcp_appointment_date && plan.employment_start_date) appointments.push({ key: "work",   icon: <Briefcase style={{ width: 15, height: 15, color: C.gold }} />, label: "Employment Start",  dateStr: plan.employment_start_date,            provider: plan.employer_name });
  }

  // Telehealth sessions (upcoming)
  const upcomingSessions = sessions.filter(s => {
    const d = new Date(s.scheduled_date);
    d.setHours(0, 0, 0, 0);
    return d >= today && s.status === "scheduled";
  });

  // Merge & sort
  const allAppts = [
    ...appointments,
    ...upcomingSessions.map(s => ({
      key: s.id, icon: <Calendar style={{ width: 15, height: 15, color: C.teal }} />,
      label: s.title || s.session_type?.replace(/_/g, " "),
      dateStr: s.scheduled_date, provider: s.provider_name,
    })),
  ].filter(a => a.dateStr).sort((a, b) => new Date(a.dateStr) - new Date(b.dateStr));

  // ── Risk flags ───────────────────────────────────────────────
  const riskFlags = [];

  if (plan) {
    if (plan.has_legal_obligations === "yes" && plan.court_dates)
      riskFlags.push({ label: "Pending Court Date", detail: plan.court_dates, color: C.red, priority: 1 });
    if (plan.warning_signs)
      riskFlags.push({ label: "Relapse Warning Signs Documented", detail: plan.warning_signs, color: "#FB923C", priority: 2 });
    if (plan.triggers_text)
      riskFlags.push({ label: "Known Triggers on File", detail: plan.triggers_text, color: "#FBBF24", priority: 3 });
    if (plan.has_legal_obligations === "yes" && plan.drug_testing_requirements)
      riskFlags.push({ label: "Drug Testing Required", detail: plan.drug_testing_requirements, color: "#FB923C", priority: 2 });
    if (!plan.housing_status || plan.housing_status === "unknown")
      riskFlags.push({ label: "Housing Status Unknown", detail: "No stable housing arrangement confirmed.", color: C.red, priority: 1 });
    if (plan.license_status === "suspended" || plan.license_status === "revoked")
      riskFlags.push({ label: `License ${plan.license_status}`, detail: "Transportation barrier identified.", color: "#FBBF24", priority: 3 });
    if (plan.transportation_method === "none")
      riskFlags.push({ label: "No Transportation", detail: "Patient has no reliable transport to appointments.", color: "#FB923C", priority: 2 });
  }

  // Check-in risk signals (last 7 days)
  const last7 = checkIns.slice(0, 7);
  if (last7.some(c => c.relapse_risk_flag))
    riskFlags.push({ label: "Relapse Risk Self-Reported", detail: "Patient flagged relapse risk in a recent check-in.", color: C.red, priority: 0 });
  const avgCraving = last7.length ? last7.reduce((s, c) => s + (c.craving_intensity || 0), 0) / last7.length : 0;
  if (avgCraving >= 7)
    riskFlags.push({ label: "High Craving Intensity (7-day avg)", detail: `Average craving level: ${avgCraving.toFixed(1)}/10`, color: C.red, priority: 0 });
  const last3Mood = last7.slice(0, 3);
  if (last3Mood.length >= 3 && last3Mood.every(c => c.mood_rating <= 2))
    riskFlags.push({ label: "Persistent Low Mood (3 days)", detail: "Mood rated 1-2 for 3 consecutive check-ins.", color: "#FB923C", priority: 1 });

  riskFlags.sort((a, b) => a.priority - b.priority);

  // ── Treatment progress ───────────────────────────────────────
  const progress = [];
  if (plan) {
    progress.push({ label: "Discharge Plan", filled: true, value: plan.status === "finalized" ? "Finalized" : "Draft" });
    progress.push({ label: "Aftercare Scheduled", filled: !!plan.aftercare_provider, value: plan.aftercare_provider });
    progress.push({ label: "Housing Confirmed", filled: plan.housing_status && plan.housing_status !== "unknown", value: plan.housing_status?.replace(/_/g, " ") });
    progress.push({ label: "Primary Care Set", filled: !!plan.primary_care_provider, value: plan.primary_care_provider });
    progress.push({ label: "Therapist Assigned", filled: !!plan.therapist_name, value: plan.therapist_name });
    progress.push({ label: "Sponsor / Mentor", filled: !!plan.sponsor_name, value: plan.sponsor_name });
    progress.push({ label: "Goals Documented", filled: !!(plan.goals_30_day || plan.goals_60_day), value: plan.goals_30_day ? "30-day set" : null });
    progress.push({ label: "Emergency Contacts", filled: !!(plan.emergency_contacts?.length && plan.emergency_contacts[0]?.name), value: plan.emergency_contacts?.[0]?.name });
  }

  const filledCount = progress.filter(p => p.filled).length;
  const progressPct = progress.length ? Math.round((filledCount / progress.length) * 100) : 0;

  // ── 7-day check-in stats ─────────────────────────────────────
  const streak = (() => {
    let n = 0, cur = new Date(); cur.setHours(0, 0, 0, 0);
    for (const c of checkIns) {
      const d = new Date(c.check_in_date); d.setHours(0, 0, 0, 0);
      if (Math.round((cur - d) / 86400000) <= 1) { n++; cur = d; } else break;
    }
    return n;
  })();

  return (
    <div style={{ background: "linear-gradient(170deg,#070D1C,#0B1424)", minHeight: "100vh", paddingBottom: 80 }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>

        {/* ── Header ── */}
        <div style={{ background: "linear-gradient(155deg,#0E1D3A,#081426)", padding: "52px 20px 24px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -60, right: -60, width: 260, height: 260, borderRadius: "50%",
            background: "radial-gradient(circle,rgba(62,207,191,0.1) 0%,transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            {patientEmail && (
              <button onClick={() => window.history.back()} style={{
                display: "flex", alignItems: "center", gap: 6, background: "none", border: "none",
                color: C.teal, fontSize: 13, fontWeight: 700, cursor: "pointer", marginBottom: 14, padding: 0,
              }}>
                <ArrowLeft style={{ width: 15, height: 15 }} /> Back
              </button>
            )}
            <p style={{ fontSize: 11, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 4 }}>
              Patient Summary
            </p>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: "#fff", lineHeight: 1.2, marginBottom: 4 }}>Recovery Dashboard</h1>
            <p style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>{email}</p>

            {/* Plan status badge */}
            {plan ? (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span style={{
                  fontSize: 12, fontWeight: 800, padding: "4px 12px", borderRadius: 20,
                  background: plan.status === "finalized" ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)",
                  color: plan.status === "finalized" ? C.emerald : "#F59E0B",
                  border: `1px solid ${plan.status === "finalized" ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.3)"}`,
                }}>
                  {plan.status === "finalized" ? "✅ Plan Finalized" : "📝 Plan in Progress"}
                </span>
                {plan.discharge_date && (
                  <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 20,
                    background: "rgba(255,255,255,0.06)", color: C.slate }}>
                    Discharged: {plan.discharge_date}
                  </span>
                )}
              </div>
            ) : (
              <span style={{ fontSize: 12, color: C.muted, fontStyle: "italic" }}>No discharge plan on file</span>
            )}
          </div>
        </div>

        <div style={{ padding: "16px 20px" }}>

          {/* ── Risk Flags ── */}
          {riskFlags.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <SectionLabel icon="🚨">High-Risk Flags</SectionLabel>
              {riskFlags.map((f, i) => (
                <RiskBadge key={i} label={f.label} detail={f.detail} color={f.color} />
              ))}
            </div>
          )}

          {/* ── Treatment Progress ── */}
          {plan && (
            <div style={{ marginBottom: 24 }}>
              <SectionLabel icon="📊">Treatment Plan Progress</SectionLabel>

              {/* Big score */}
              <div style={{
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)",
                borderRadius: 16, padding: "16px 18px", marginBottom: 12,
              }}>
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 10 }}>
                  <div>
                    <p style={{ fontSize: 42, fontWeight: 900, color: progressPct >= 75 ? C.emerald : progressPct >= 50 ? C.gold : "#F87171", lineHeight: 1 }}>
                      {progressPct}<span style={{ fontSize: 18, fontWeight: 600, color: C.muted }}>%</span>
                    </p>
                    <p style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{filledCount} of {progress.length} sections complete</p>
                  </div>
                  <div style={{ fontSize: 28 }}>
                    {progressPct >= 75 ? "🟢" : progressPct >= 50 ? "🟡" : "🔴"}
                  </div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: 6, height: 6, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 6, width: `${progressPct}%`,
                    background: progressPct >= 75 ? `linear-gradient(90deg,${C.emerald},#059669)` : `linear-gradient(90deg,${C.gold},#D97706)`,
                    transition: "width 0.5s ease",
                  }} />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {progress.map((p) => <ProgressPill key={p.label} {...p} />)}
              </div>
            </div>
          )}

          {/* ── Upcoming Appointments ── */}
          <div style={{ marginBottom: 24 }}>
            <SectionLabel icon="📅">Upcoming Appointments</SectionLabel>
            {allAppts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 20px", background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14 }}>
                <p style={{ fontSize: 13, color: C.muted }}>No upcoming appointments on file.</p>
              </div>
            ) : (
              allAppts.slice(0, 8).map((a) => (
                <AppointmentRow key={a.key} {...a} />
              ))
            )}
          </div>

          {/* ── 7-Day Check-In Summary ── */}
          <div style={{ marginBottom: 24 }}>
            <SectionLabel icon="⚡">7-Day Check-In Activity</SectionLabel>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
              {[
                { label: "Day Streak", value: streak, color: streak >= 7 ? C.emerald : streak >= 3 ? C.gold : "#F87171" },
                { label: "Check-Ins", value: `${last7.length}/7`, color: last7.length >= 5 ? C.emerald : last7.length >= 3 ? C.gold : "#F87171" },
                { label: "Avg Craving", value: avgCraving > 0 ? `${avgCraving.toFixed(1)}/10` : "—", color: avgCraving >= 7 ? "#F87171" : avgCraving >= 4 ? C.gold : C.emerald },
              ].map(stat => (
                <div key={stat.label} style={{
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 14, padding: "14px 12px", textAlign: "center",
                }}>
                  <p style={{ fontSize: 24, fontWeight: 900, color: stat.color, lineHeight: 1 }}>{stat.value}</p>
                  <p style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{stat.label}</p>
                </div>
              ))}
            </div>
            {/* Mini calendar strip */}
            <div style={{ display: "flex", gap: 4 }}>
              {Array.from({ length: 7 }, (_, i) => {
                const d = new Date(); d.setDate(d.getDate() - (6 - i));
                const ds = d.toISOString().split("T")[0];
                const ci = checkIns.find(c => c.check_in_date === ds);
                const isToday = i === 6;
                return (
                  <div key={ds} style={{ flex: 1, textAlign: "center" }}>
                    <p style={{ fontSize: 9, color: C.muted, marginBottom: 4 }}>
                      {d.toLocaleDateString("en-US", { weekday: "short" }).charAt(0)}
                    </p>
                    <div style={{
                      height: 28, borderRadius: 8,
                      background: ci ? (ci.mood_rating >= 4 ? "rgba(16,185,129,0.3)" : ci.mood_rating <= 2 ? "rgba(239,68,68,0.3)" : "rgba(245,158,11,0.3)") : "rgba(255,255,255,0.05)",
                      border: isToday ? `1px solid ${C.teal}` : "1px solid transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {ci && <p style={{ fontSize: 11, fontWeight: 800, color: "#fff" }}>{ci.mood_rating}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Relapse Prevention Quick View ── */}
          {plan && (plan.warning_signs || plan.coping_strategies_text || plan.people_to_call_in_crisis) && (
            <div style={{ marginBottom: 24 }}>
              <SectionLabel icon="🛡️">Relapse Prevention Plan</SectionLabel>
              {plan.warning_signs && (
                <div style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: "12px 14px", marginBottom: 8 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: C.red, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>Warning Signs</p>
                  <p style={{ fontSize: 13, color: C.slate, lineHeight: 1.6 }}>{plan.warning_signs}</p>
                </div>
              )}
              {plan.coping_strategies_text && (
                <div style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 12, padding: "12px 14px", marginBottom: 8 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: C.emerald, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>Coping Strategies</p>
                  <p style={{ fontSize: 13, color: C.slate, lineHeight: 1.6 }}>{plan.coping_strategies_text}</p>
                </div>
              )}
              {plan.people_to_call_in_crisis && (
                <div style={{ background: "rgba(62,207,191,0.06)", border: "1px solid rgba(62,207,191,0.2)", borderRadius: 12, padding: "12px 14px" }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>Crisis Contacts</p>
                  <p style={{ fontSize: 13, color: C.slate, lineHeight: 1.6 }}>{plan.people_to_call_in_crisis}</p>
                </div>
              )}
            </div>
          )}

          {/* ── Quick Actions ── */}
          <div style={{ marginBottom: 16 }}>
            <SectionLabel icon="⚙️">Quick Actions</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "Open Full Discharge Plan", sub: "View & edit all 11 sections", icon: <FileText style={{ width: 16, height: 16 }} />, color: C.teal,    href: plan ? `DischargePlan?plan_id=${plan.id}` : "DischargePlan" },
                { label: "Daily Check-In",           sub: "Log today's mood & activity",  icon: <CheckCircle2 style={{ width: 16, height: 16 }} />, color: C.emerald, href: "DailyCheckIn" },
                { label: "My Forward Plan",          sub: "Review milestones & goals",     icon: <Calendar style={{ width: 16, height: 16 }} />,    color: C.gold,    href: "ForwardPlan" },
                { label: "Messages",                 sub: "Reach your counselor",          icon: <Phone style={{ width: 16, height: 16 }} />,       color: C.indigo,  href: "ParticipantMessages" },
              ].map(item => (
                <Link key={item.label} to={createPageUrl(item.href)} style={{ textDecoration: "none" }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 14, padding: "13px 16px",
                    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 14,
                  }}>
                    <div style={{ width: 38, height: 38, borderRadius: 12, background: `${item.color}18`,
                      color: item.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {item.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{item.label}</p>
                      <p style={{ fontSize: 12, color: C.muted }}>{item.sub}</p>
                    </div>
                    <ChevronRight style={{ width: 15, height: 15, color: C.muted, flexShrink: 0 }} />
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}