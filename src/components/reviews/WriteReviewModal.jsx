import React, { useState } from "react";
import { X, Plus, Trash2, ChevronRight, Check } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const PROGRAM_OPTIONS = [
  { value: "detox", label: "Detox" },
  { value: "inpatient", label: "Inpatient / Residential" },
  { value: "iop", label: "Intensive Outpatient (IOP)" },
  { value: "php", label: "Partial Hospitalization (PHP)" },
  { value: "outpatient", label: "Regular Outpatient" },
  { value: "mat", label: "Medication-Assisted (MAT)" },
  { value: "other", label: "Other Program" },
];

const STAY_OPTIONS = [
  { value: "less_than_1_week", label: "Less than a week" },
  { value: "1_2_weeks", label: "1–2 weeks" },
  { value: "30_days", label: "About 30 days" },
  { value: "60_days", label: "About 60 days" },
  { value: "90_days", label: "About 90 days" },
  { value: "6_months_plus", label: "6 months or more" },
];

const YEAR_OPTIONS = Array.from({ length: 8 }, (_, i) => `${2026 - i}`);

const SCORE_CATEGORIES = [
  { key: "score_staff",       label: "Staff & Care Quality",       desc: "How caring and helpful was the staff?" },
  { key: "score_program",     label: "Program Effectiveness",      desc: "Did the program help with your recovery?" },
  { key: "score_environment", label: "Facility & Environment",     desc: "Was the facility clean and comfortable?" },
  { key: "score_aftercare",   label: "Aftercare & Discharge Plan", desc: "Did they prepare you for life after?" },
];

function ScoreSlider({ label, desc, value, onChange }) {
  const color = value >= 8 ? "#10B981" : value >= 5 ? "#F59E0B" : value > 0 ? "#EF4444" : "#D1D5DB";
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#1E1E1E" }}>{label}</p>
          <p style={{ fontSize: 11, color: "#8E8E93" }}>{desc}</p>
        </div>
        <span style={{
          width: 38, height: 38, borderRadius: "50%", display: "flex",
          alignItems: "center", justifyContent: "center",
          background: color + "18", border: `2px solid ${color}40`,
          fontSize: 15, fontWeight: 900, color, flexShrink: 0,
        }}>
          {value || "—"}
        </span>
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        {[1,2,3,4,5,6,7,8,9,10].map(n => (
          <button
            key={n}
            onClick={() => onChange(n)}
            style={{
              flex: 1, height: 32, borderRadius: 6, border: "none", cursor: "pointer",
              background: n <= value
                ? (value >= 8 ? "#10B981" : value >= 5 ? "#F59E0B" : "#EF4444")
                : "#F0F0F3",
              color: n <= value ? "#fff" : "#9CA3AF",
              fontSize: 11, fontWeight: 700,
            }}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

function TagInput({ placeholder, items, onChange }) {
  const [input, setInput] = useState("");

  const add = () => {
    const val = input.trim();
    if (val && !items.includes(val)) {
      onChange([...items, val]);
    }
    setInput("");
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder={placeholder}
          style={{
            flex: 1, padding: "8px 12px", borderRadius: 8, fontSize: 13,
            border: "1px solid #D1D5DB", background: "#F9FAFB", color: "#1E1E1E", outline: "none",
          }}
        />
        <button
          onClick={add}
          disabled={!input.trim()}
          style={{
            padding: "8px 12px", borderRadius: 8, border: "none", cursor: input.trim() ? "pointer" : "default",
            background: input.trim() ? "#4A90E2" : "#E5E7EB",
            color: input.trim() ? "#fff" : "#9CA3AF",
          }}
        >
          <Plus style={{ width: 14, height: 14 }} />
        </button>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {items.map((item, i) => (
          <span key={i} style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "4px 10px", borderRadius: 20, fontSize: 12,
            background: "#F0F0F3", color: "#374151", border: "1px solid #E5E7EB",
          }}>
            {item}
            <button onClick={() => onChange(items.filter((_, j) => j !== i))}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#9CA3AF", display: "flex" }}>
              <X style={{ width: 10, height: 10 }} />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

const STEPS = ["Facility", "Your Stay", "Score It", "Pros & Cons", "Your Words", "Submit"];

export default function WriteReviewModal({ facilityId, facilityName, facilityCity, facilityState, onClose, user }) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);

  const [form, setForm] = useState({
    facility_id: facilityId || "",
    facility_name: facilityName || "",
    facility_city: facilityCity || "",
    facility_state: facilityState || "",
    program_type: "",
    length_of_stay: "",
    year_attended: "",
    overall_score: 0,
    score_staff: 0,
    score_program: 0,
    score_environment: 0,
    score_aftercare: 0,
    headline: "",
    pros: [],
    cons: [],
    full_review: "",
    would_recommend: null,
    is_anonymous: true,
    reviewer_email: user?.email || "",
    reviewer_name: user?.full_name || "",
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const mutation = useMutation({
    mutationFn: () => base44.entities.FacilityReview.create({
      ...form,
      moderation_status: "approved",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(["facility-reviews"]);
      toast.success("Your review is live! Thank you for helping the community. 💙");
      onClose();
    },
  });

  const canNext = () => {
    if (step === 0) return form.facility_name.trim().length > 0;
    if (step === 1) return form.program_type && form.length_of_stay && form.year_attended;
    if (step === 2) return form.overall_score > 0;
    if (step === 3) return form.pros.length > 0 || form.cons.length > 0;
    if (step === 4) return form.headline.trim().length > 0;
    return true;
  };

  const overallColor = form.overall_score >= 8 ? "#10B981" : form.overall_score >= 5 ? "#F59E0B" : form.overall_score > 0 ? "#EF4444" : "#9CA3AF";

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 60,
        background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "flex-end",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 560, margin: "0 auto",
          background: "#fff", borderRadius: "24px 24px 0 0",
          maxHeight: "92vh", overflowY: "auto",
        }}
      >
        {/* Header */}
        <div style={{ padding: "20px 20px 0", position: "sticky", top: 0, background: "#fff", zIndex: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#4A90E2", textTransform: "uppercase", letterSpacing: ".08em" }}>
                Step {step + 1} of {STEPS.length}
              </p>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1E1E1E" }}>{STEPS[step]}</h2>
            </div>
            <button onClick={onClose} style={{ background: "#F0F0F3", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <X style={{ width: 15, height: 15, color: "#6B7280" }} />
            </button>
          </div>

          {/* Progress bar */}
          <div style={{ height: 4, background: "#F0F0F3", borderRadius: 2, marginBottom: 20, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${((step + 1) / STEPS.length) * 100}%`, background: "#4A90E2", borderRadius: 2, transition: "width 0.3s ease" }} />
          </div>
        </div>

        {/* Step content */}
        <div style={{ padding: "0 20px 100px" }}>

          {/* STEP 0 – Facility */}
          {step === 0 && (
            <div>
              <p style={{ fontSize: 13, color: "#5A5A5A", marginBottom: 20, lineHeight: 1.6 }}>
                Your honest experience helps others in recovery make informed choices about where to get help.
                <strong style={{ color: "#1E1E1E" }}> Every voice matters.</strong>
              </p>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 5 }}>
                Facility Name *
              </label>
              <input
                value={form.facility_name}
                onChange={e => set("facility_name", e.target.value)}
                placeholder="e.g. Hope House Treatment Center"
                style={{ width: "100%", padding: "11px 12px", borderRadius: 10, border: "1px solid #D1D5DB", fontSize: 13, color: "#1E1E1E", outline: "none", boxSizing: "border-box", marginBottom: 12 }}
              />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 5 }}>City</label>
                  <input
                    value={form.facility_city}
                    onChange={e => set("facility_city", e.target.value)}
                    placeholder="Newark"
                    style={{ width: "100%", padding: "11px 12px", borderRadius: 10, border: "1px solid #D1D5DB", fontSize: 13, color: "#1E1E1E", outline: "none", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 5 }}>State</label>
                  <input
                    value={form.facility_state}
                    onChange={e => set("facility_state", e.target.value)}
                    placeholder="NJ"
                    style={{ width: "100%", padding: "11px 12px", borderRadius: 10, border: "1px solid #D1D5DB", fontSize: 13, color: "#1E1E1E", outline: "none", boxSizing: "border-box" }}
                  />
                </div>
              </div>
              <div style={{
                marginTop: 20, padding: "12px 14px", borderRadius: 12,
                background: "#F0FDF4", border: "1px solid #BBF7D0",
              }}>
                <p style={{ fontSize: 12, color: "#15803D", fontWeight: 600 }}>🛡️ Your privacy is protected</p>
                <p style={{ fontSize: 11, color: "#166534", marginTop: 3, lineHeight: 1.5 }}>
                  You control whether your name is shown. Reviews are moderated for safety. No identifying information is required.
                </p>
              </div>
            </div>
          )}

          {/* STEP 1 – Your Stay */}
          {step === 1 && (
            <div>
              <p style={{ fontSize: 13, color: "#5A5A5A", marginBottom: 16 }}>Tell us a little about your experience at <strong>{form.facility_name}</strong>.</p>

              <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>Which program did you attend? *</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 16 }}>
                {PROGRAM_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => set("program_type", opt.value)}
                    style={{
                      padding: "10px", borderRadius: 10, border: `1px solid ${form.program_type === opt.value ? "#4A90E2" : "#E5E7EB"}`,
                      background: form.program_type === opt.value ? "#EBF3FD" : "#F9FAFB",
                      color: form.program_type === opt.value ? "#4A90E2" : "#374151",
                      fontSize: 12, fontWeight: 600, cursor: "pointer", textAlign: "left",
                      display: "flex", alignItems: "center", gap: 6,
                    }}
                  >
                    {form.program_type === opt.value && <Check style={{ width: 12, height: 12 }} />}
                    {opt.label}
                  </button>
                ))}
              </div>

              <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>How long was your stay? *</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 16 }}>
                {STAY_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => set("length_of_stay", opt.value)}
                    style={{
                      padding: "9px 10px", borderRadius: 10, border: `1px solid ${form.length_of_stay === opt.value ? "#4A90E2" : "#E5E7EB"}`,
                      background: form.length_of_stay === opt.value ? "#EBF3FD" : "#F9FAFB",
                      color: form.length_of_stay === opt.value ? "#4A90E2" : "#374151",
                      fontSize: 11, fontWeight: 600, cursor: "pointer", textAlign: "left",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>Approximately what year? *</label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {YEAR_OPTIONS.map(y => (
                  <button
                    key={y}
                    onClick={() => set("year_attended", y)}
                    style={{
                      padding: "7px 14px", borderRadius: 8,
                      border: `1px solid ${form.year_attended === y ? "#4A90E2" : "#E5E7EB"}`,
                      background: form.year_attended === y ? "#4A90E2" : "#F9FAFB",
                      color: form.year_attended === y ? "#fff" : "#374151",
                      fontSize: 12, fontWeight: 600, cursor: "pointer",
                    }}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2 – Score It */}
          {step === 2 && (
            <div>
              <p style={{ fontSize: 13, color: "#5A5A5A", marginBottom: 20 }}>
                Score each area honestly. <strong>1 = very poor, 10 = excellent.</strong> Your honesty helps people find the right fit.
              </p>

              {/* Overall score — big tap buttons */}
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 14, fontWeight: 800, color: "#1E1E1E", marginBottom: 4 }}>Overall Score *</p>
                <p style={{ fontSize: 11, color: "#8E8E93", marginBottom: 12 }}>If you could sum up this facility in one number</p>
                <div style={{ display: "flex", gap: 5 }}>
                  {[1,2,3,4,5,6,7,8,9,10].map(n => (
                    <button
                      key={n}
                      onClick={() => set("overall_score", n)}
                      style={{
                        flex: 1, height: 44, borderRadius: 8, border: "none", cursor: "pointer",
                        background: n === form.overall_score
                          ? (n >= 8 ? "#10B981" : n >= 5 ? "#F59E0B" : "#EF4444")
                          : "#F0F0F3",
                        color: n === form.overall_score ? "#fff" : "#9CA3AF",
                        fontSize: 13, fontWeight: 800,
                        transform: n === form.overall_score ? "scale(1.08)" : "scale(1)",
                      }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                {form.overall_score > 0 && (
                  <p style={{ textAlign: "center", marginTop: 8, fontSize: 13, fontWeight: 700, color: overallColor }}>
                    {form.overall_score >= 9 ? "Excellent 🌟" : form.overall_score >= 7 ? "Good 👍" : form.overall_score >= 5 ? "Okay 🤷" : form.overall_score >= 3 ? "Below Average ⚠️" : "Poor ❌"}
                  </p>
                )}
              </div>

              {SCORE_CATEGORIES.map(cat => (
                <ScoreSlider
                  key={cat.key}
                  label={cat.label}
                  desc={cat.desc}
                  value={form[cat.key]}
                  onChange={v => set(cat.key, v)}
                />
              ))}
            </div>
          )}

          {/* STEP 3 – Pros & Cons */}
          {step === 3 && (
            <div>
              <p style={{ fontSize: 13, color: "#5A5A5A", marginBottom: 20, lineHeight: 1.6 }}>
                Be honest and specific. These bullet points are what people read first — and they make the biggest difference.
              </p>

              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 13, fontWeight: 800, color: "#10B981", marginBottom: 4 }}>✅ What did they do well?</p>
                <p style={{ fontSize: 11, color: "#8E8E93", marginBottom: 10 }}>Add one point at a time. Press Enter or the + button.</p>
                <TagInput
                  placeholder="e.g. Staff was compassionate and always available"
                  items={form.pros}
                  onChange={v => set("pros", v)}
                />
              </div>

              <div>
                <p style={{ fontSize: 13, fontWeight: 800, color: "#F59E0B", marginBottom: 4 }}>🔧 What could they improve?</p>
                <p style={{ fontSize: 11, color: "#8E8E93", marginBottom: 10 }}>Honest feedback helps facilities do better.</p>
                <TagInput
                  placeholder="e.g. Aftercare planning felt rushed"
                  items={form.cons}
                  onChange={v => set("cons", v)}
                />
              </div>
            </div>
          )}

          {/* STEP 4 – Your Words */}
          {step === 4 && (
            <div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>Review Headline * <span style={{ fontSize: 11, fontWeight: 400, color: "#9CA3AF" }}>(short summary)</span></label>
                <input
                  value={form.headline}
                  onChange={e => set("headline", e.target.value)}
                  placeholder="e.g. Staff changed my life but aftercare was lacking"
                  maxLength={100}
                  style={{ width: "100%", padding: "11px 12px", borderRadius: 10, border: "1px solid #D1D5DB", fontSize: 13, color: "#1E1E1E", outline: "none", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>Full Review <span style={{ fontSize: 11, fontWeight: 400, color: "#9CA3AF" }}>(optional but powerful)</span></label>
                <textarea
                  value={form.full_review}
                  onChange={e => set("full_review", e.target.value)}
                  placeholder="Share your full experience. What was life like there? How did it affect your recovery? What do you wish you knew before you went?"
                  rows={6}
                  style={{ width: "100%", padding: "11px 12px", borderRadius: 10, border: "1px solid #D1D5DB", fontSize: 13, color: "#1E1E1E", outline: "none", resize: "vertical", boxSizing: "border-box", lineHeight: 1.6 }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 8 }}>Would you recommend this facility? *</p>
                <div style={{ display: "flex", gap: 10 }}>
                  {[{ val: true, label: "👍 Yes, I would recommend", color: "#10B981" }, { val: false, label: "👎 No, I would not", color: "#EF4444" }].map(opt => (
                    <button
                      key={String(opt.val)}
                      onClick={() => set("would_recommend", opt.val)}
                      style={{
                        flex: 1, padding: "12px 8px", borderRadius: 10, cursor: "pointer",
                        border: `2px solid ${form.would_recommend === opt.val ? opt.color : "#E5E7EB"}`,
                        background: form.would_recommend === opt.val ? opt.color + "12" : "#F9FAFB",
                        color: form.would_recommend === opt.val ? opt.color : "#374151",
                        fontSize: 12, fontWeight: 700,
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5 – Submit */}
          {step === 5 && (
            <div>
              <p style={{ fontSize: 13, color: "#5A5A5A", marginBottom: 20, lineHeight: 1.6 }}>
                Almost done. Choose how you want to be shown in the community feed.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                {[
                  { val: true, title: "Post Anonymously", desc: "Your name won't be shown. Just 'Community member'.", emoji: "🔒" },
                  { val: false, title: "Use My Name", desc: user?.full_name ? `Show as "${user.full_name}"` : "Show your display name", emoji: "👤" },
                ].map(opt => (
                  <button
                    key={String(opt.val)}
                    onClick={() => set("is_anonymous", opt.val)}
                    style={{
                      padding: "14px", borderRadius: 12, cursor: "pointer", textAlign: "left",
                      border: `2px solid ${form.is_anonymous === opt.val ? "#4A90E2" : "#E5E7EB"}`,
                      background: form.is_anonymous === opt.val ? "#EBF3FD" : "#F9FAFB",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 20 }}>{opt.emoji}</span>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: form.is_anonymous === opt.val ? "#4A90E2" : "#1E1E1E" }}>{opt.title}</p>
                        <p style={{ fontSize: 11, color: "#6B7280", marginTop: 1 }}>{opt.desc}</p>
                      </div>
                      {form.is_anonymous === opt.val && <Check style={{ width: 16, height: 16, color: "#4A90E2", marginLeft: "auto" }} />}
                    </div>
                  </button>
                ))}
              </div>

              {/* Summary */}
              <div style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 12, padding: "14px", marginBottom: 20 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 8 }}>Review Summary</p>
                <p style={{ fontSize: 12, color: "#5A5A5A" }}><strong>Facility:</strong> {form.facility_name}{form.facility_city ? `, ${form.facility_city}` : ""}</p>
                <p style={{ fontSize: 12, color: "#5A5A5A" }}><strong>Overall Score:</strong> {form.overall_score}/10</p>
                <p style={{ fontSize: 12, color: "#5A5A5A" }}><strong>Pros:</strong> {form.pros.length} point{form.pros.length !== 1 ? "s" : ""}</p>
                <p style={{ fontSize: 12, color: "#5A5A5A" }}><strong>Cons:</strong> {form.cons.length} point{form.cons.length !== 1 ? "s" : ""}</p>
                <p style={{ fontSize: 12, color: "#5A5A5A" }}><strong>Would Recommend:</strong> {form.would_recommend === true ? "Yes" : form.would_recommend === false ? "No" : "Not answered"}</p>
              </div>

              <div style={{ background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 10, padding: "10px 12px" }}>
                <p style={{ fontSize: 11, color: "#92400E", lineHeight: 1.5 }}>
                  🛡️ By submitting, you confirm this is based on your real experience and does not include harmful, identifying, or defamatory content. Reviews are moderated for community safety.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom nav */}
        <div style={{
          position: "sticky", bottom: 0, background: "#fff",
          borderTop: "1px solid #E5E7EB", padding: "12px 20px",
          display: "flex", gap: 10,
        }}>
          {step > 0 && (
            <button
              onClick={() => setStep(s => s - 1)}
              style={{
                padding: "12px 20px", borderRadius: 12, border: "1px solid #E5E7EB",
                background: "#F9FAFB", color: "#374151", fontWeight: 600, fontSize: 13, cursor: "pointer",
              }}
            >
              Back
            </button>
          )}
          <button
            onClick={() => step < STEPS.length - 1 ? setStep(s => s + 1) : mutation.mutate()}
            disabled={!canNext() || mutation.isPending}
            style={{
              flex: 1, padding: "12px", borderRadius: 12, border: "none",
              background: canNext() ? "#4A90E2" : "#E5E7EB",
              color: canNext() ? "#fff" : "#9CA3AF",
              fontWeight: 700, fontSize: 14, cursor: canNext() ? "pointer" : "default",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}
          >
            {mutation.isPending ? "Posting…" : step === STEPS.length - 1 ? "🚀 Post My Review" : <>Next <ChevronRight style={{ width: 14, height: 14 }} /></>}
          </button>
        </div>
      </div>
    </div>
  );
}