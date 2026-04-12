import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, Loader2, BookOpen, Sparkles } from "lucide-react";

/* ── Constants ────────────────────────────────────────────────────────────── */
const TAGS = [
  "Recovery","Addiction","Fatherhood","Motherhood","Mental Health",
  "Starting Over","Prison / Reentry","Faith","Loss","Hope",
  "Relapse Recovery","Sobriety","Motivation","Healing",
];

const SUBSTANCE_OPTIONS = [
  "Alcohol","Opioids","Stimulants","Benzodiazepines",
  "Cannabis","Prescription Misuse","Polysubstance","Prefer not to say",
];

const AGE_RANGES = ["18–24","25–34","35–44","45+","Prefer not to say"];

const VISIBILITY_OPTIONS = [
  {
    id: "private",
    label: "Private Draft",
    desc: "Only you can see this. Not submitted for review.",
    emoji: "🔒",
  },
  {
    id: "anonymous_review",
    label: "Anonymous",
    desc: "Submitted for community review. No name shown.",
    emoji: "🌿",
  },
  {
    id: "first_name_review",
    label: "First Name Only",
    desc: "Submitted for review. Your first name is shown.",
    emoji: "✨",
  },
];

const PROMPTS = [
  {
    key: "tired_of_repeating",
    label: "Before the moment",
    question: "What was life feeling like before your Ah Ha moment?",
    placeholder: "Describe where you were — emotionally, physically, mentally…",
    maxLen: 600,
  },
  {
    key: "what_happened",
    label: "The turning point",
    question: "What happened that made you realize things had to change?",
    placeholder: "What was the moment, the event, the conversation, the look in someone's eyes…",
    maxLen: 800,
  },
  {
    key: "feeling_in_moment",
    label: "The emotional shift",
    question: "What did that moment feel like emotionally?",
    placeholder: "Fear, relief, shame, clarity, grief, love — all of it is valid…",
    maxLen: 500,
  },
  {
    key: "decision_made",
    label: "What happened next",
    question: "What action did you take after that realization?",
    placeholder: "Even if the first step was just deciding to try…",
    maxLen: 500,
  },
  {
    key: "message_to_others",
    label: "To someone like you",
    question: "What would you say to someone going through what you went through?",
    placeholder: "Speak directly to them. They're listening.",
    maxLen: 600,
  },
];

const EMPTY = {
  title: "",
  tired_of_repeating: "",
  what_happened: "",
  feeling_in_moment: "",
  decision_made: "",
  message_to_others: "",
  visibility: "",
  tags: [],
  clean_time: "",
  substance_category: "",
  age_range: "",
  location: "",
  safety1: false,
  safety2: false,
  safety3: false,
};

/* ── Helpers ──────────────────────────────────────────────────────────────── */
function readTime(form) {
  const total = [
    form.tired_of_repeating, form.what_happened,
    form.feeling_in_moment, form.decision_made, form.message_to_others,
  ].join(" ").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(total / 200));
}

function isComplete(form) {
  return (
    form.title.trim().length > 0 &&
    form.what_happened.trim().length > 0 &&
    form.visibility !== "" &&
    form.safety1 && form.safety2 && form.safety3
  );
}

/* ── Sub-components ───────────────────────────────────────────────────────── */
function PromptCard({ prompt, value, onChange }) {
  const remaining = prompt.maxLen - value.length;
  return (
    <div style={{ background: "#FDFAF6", border: ".5px solid #E8E2D9", borderRadius: 16, padding: "20px 18px", marginBottom: 14 }}>
      <p style={{ fontSize: 10, fontWeight: 700, color: "#B8823A", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 6 }}>
        {prompt.label}
      </p>
      <p style={{ fontSize: 16, fontWeight: 600, color: "#1C1410", fontFamily: "'Lora', Georgia, serif", lineHeight: 1.4, marginBottom: 14 }}>
        {prompt.question}
      </p>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value.slice(0, prompt.maxLen))}
        placeholder={prompt.placeholder}
        rows={5}
        style={{
          width: "100%", resize: "none", padding: "13px 14px", borderRadius: 12,
          border: ".5px solid #E8E2D9", background: "#F7F3EE", color: "#1C1410",
          fontSize: 14, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.65,
          outline: "none", boxSizing: "border-box",
        }}
        onFocus={e => { e.target.style.borderColor = "#B8823A"; e.target.style.boxShadow = "0 0 0 3px rgba(184,130,58,.08)"; }}
        onBlur={e => { e.target.style.borderColor = "#E8E2D9"; e.target.style.boxShadow = "none"; }}
      />
      <p style={{ fontSize: 11, color: remaining < 50 ? "#C9534F" : "#9B8E83", textAlign: "right", marginTop: 4 }}>
        {remaining} characters left
      </p>
    </div>
  );
}

function TagPill({ label, selected, onToggle }) {
  return (
    <button onClick={onToggle} style={{
      padding: "7px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer",
      background: selected ? "#B8823A" : "#FDFAF6",
      color: selected ? "#fff" : "#4A3F35",
      border: selected ? "1px solid #B8823A" : "1px solid #E8E2D9",
      transition: "all .15s ease",
    }}>
      {label}
    </button>
  );
}

function PreviewCard({ form, user }) {
  const vis = VISIBILITY_OPTIONS.find(v => v.id === form.visibility);
  const displayName = form.visibility === "first_name_review"
    ? (user?.full_name?.split(" ")[0] || "Friend")
    : "Anonymous";
  const mins = readTime(form);

  return (
    <div style={{ background: "#FDFAF6", border: "1px solid rgba(184,130,58,.25)", borderRadius: 20, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, rgba(184,130,58,.08), rgba(184,130,58,.03))", padding: "22px 22px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 18 }}>{vis?.emoji}</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#B8823A", textTransform: "uppercase", letterSpacing: ".1em" }}>{vis?.label}</span>
          <span style={{ fontSize: 11, color: "#9B8E83", marginLeft: "auto" }}>{mins} min read</span>
        </div>
        <h2 style={{ fontFamily: "'Lora', serif", fontSize: 20, fontWeight: 600, color: "#1C1410", lineHeight: 1.3, marginBottom: 8 }}>
          {form.title || "Untitled Story"}
        </h2>
        <p style={{ fontSize: 12, color: "#9B8E83" }}>By {displayName}</p>
        {form.tags.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
            {form.tags.map(t => (
              <span key={t} style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                background: "rgba(184,130,58,.10)", color: "#B8823A", border: "1px solid rgba(184,130,58,.2)" }}>
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Sections */}
      <div style={{ padding: "20px 22px" }}>
        {PROMPTS.filter(p => form[p.key]?.trim()).map(p => (
          <div key={p.key} style={{ marginBottom: 18 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#B8823A", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 6 }}>
              {p.label}
            </p>
            <p style={{ fontSize: 14, color: "#4A3F35", lineHeight: 1.75, fontStyle: "italic" }}>
              "{form[p.key]}"
            </p>
          </div>
        ))}
        {form.clean_time && (
          <p style={{ fontSize: 12, color: "#9B8E83", marginTop: 8 }}>⏱ {form.clean_time} in recovery</p>
        )}
      </div>
    </div>
  );
}

/* ── Main page ────────────────────────────────────────────────────────────── */
export default function SubmitAhHa() {
  const navigate = useNavigate();
  const [form, setForm] = useState(() => {
    try { return { ...EMPTY, ...JSON.parse(localStorage.getItem("ahha_draft") || "{}") }; } catch { return EMPTY; }
  });
  const [preview, setPreview] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const set = useCallback((key, val) => setForm(f => ({ ...f, [key]: val })), []);

  // Auto-save draft to localStorage
  useEffect(() => {
    const t = setTimeout(() => {
      localStorage.setItem("ahha_draft", JSON.stringify(form));
    }, 800);
    return () => clearTimeout(t);
  }, [form]);

  const saveMutation = useMutation({
    mutationFn: async (status) => {
      if (!user) throw new Error("Not logged in");
      const payload = {
        user_email: user.email,
        display_name: form.visibility === "first_name_review" ? (user.full_name?.split(" ")[0] || "") : "",
        is_anonymous: form.visibility !== "first_name_review",
        what_happened: form.what_happened,
        feeling_in_moment: form.feeling_in_moment,
        tired_of_repeating: form.tired_of_repeating,
        decision_made: form.decision_made,
        message_to_others: form.message_to_others,
        status: status,
        category: form.tags[0]?.toLowerCase().replace(/\s+/g, "_").replace(/\//g, "") || "wanted_my_life_back",
        has_content_warning: false,
      };
      return base44.entities.AhHaMoment.create(payload);
    },
    onSuccess: (_, status) => {
      if (status === "pending_review" || status === "draft") {
        if (status === "pending_review") {
          localStorage.removeItem("ahha_draft");
          setSubmitted(true);
        } else {
          setSaving(false);
        }
      }
    },
  });

  const handleSaveDraft = async () => {
    setSaving(true);
    await saveMutation.mutateAsync("draft");
    setSaving(false);
  };

  const handleSubmit = () => {
    saveMutation.mutate(form.visibility === "private" ? "draft" : "pending_review");
  };

  /* ── Success state ── */
  if (submitted) return (
    <div style={{ background: "#F7F3EE", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ maxWidth: 400, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 52, marginBottom: 20 }}>✨</div>
        <h2 style={{ fontFamily: "'Lora', serif", fontSize: 24, fontWeight: 600, color: "#1C1410", lineHeight: 1.3, marginBottom: 14 }}>
          Your Ah Ha Moment has been received.
        </h2>
        <p style={{ fontSize: 15, color: "#4A3F35", lineHeight: 1.7, marginBottom: 32 }}>
          Your story could be the reason someone else keeps going.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button onClick={() => navigate("/AhHaMoment")} style={{
            padding: "14px 24px", borderRadius: 50, border: "none", cursor: "pointer",
            background: "#B8823A", color: "#fff", fontWeight: 700, fontSize: 15,
          }}>
            View All Stories
          </button>
          <button onClick={() => { setForm(EMPTY); setSubmitted(false); }} style={{
            padding: "14px 24px", borderRadius: 50, border: "1px solid #E8E2D9",
            background: "transparent", color: "#4A3F35", fontWeight: 600, fontSize: 15, cursor: "pointer",
          }}>
            Write Another
          </button>
        </div>
      </div>
    </div>
  );

  /* ── Preview state ── */
  if (preview) return (
    <div style={{ background: "#F7F3EE", minHeight: "100vh", paddingBottom: 120 }}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 16px" }}>
        <div style={{ background: "#FDFAF6", borderBottom: "1px solid #E8E2D9", padding: "56px 20px 20px", margin: "0 -16px 20px" }}>
          <button onClick={() => setPreview(false)} style={{
            display: "flex", alignItems: "center", gap: 6, background: "none", border: "none",
            color: "#9B8E83", fontSize: 13, fontWeight: 600, cursor: "pointer", marginBottom: 12, padding: 0,
          }}>
            <ArrowLeft style={{ width: 15, height: 15 }} /> Back to editing
          </button>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#B8823A", textTransform: "uppercase", letterSpacing: ".1em" }}>Preview</p>
          <h1 style={{ fontFamily: "'Lora', serif", fontSize: 22, fontWeight: 600, color: "#1C1410", marginTop: 4 }}>
            How your story will look
          </h1>
        </div>

        <PreviewCard form={form} user={user} />

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 20 }}>
          <button
            onClick={handleSubmit}
            disabled={!isComplete(form) || saveMutation.isPending}
            style={{
              padding: "15px", borderRadius: 50, border: "none", cursor: isComplete(form) ? "pointer" : "default",
              background: isComplete(form) ? "#B8823A" : "#E8E2D9",
              color: "#fff", fontWeight: 700, fontSize: 15,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {form.visibility === "private" ? "Save as Private Draft" : "Submit Story →"}
          </button>
          <button onClick={() => setPreview(false)} style={{
            padding: "15px", borderRadius: 50, border: "1px solid #E8E2D9", background: "transparent",
            color: "#4A3F35", fontWeight: 600, fontSize: 15, cursor: "pointer",
          }}>
            Keep Editing
          </button>
        </div>
      </div>
    </div>
  );

  /* ── Main form ── */
  return (
    <div style={{ background: "#F7F3EE", minHeight: "100vh", paddingBottom: 120 }}>
      <style>{`
        textarea::placeholder { color: #B0A89F; }
        input::placeholder { color: #B0A89F; }
      `}</style>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ background: "#FDFAF6", borderBottom: "1px solid #E8E2D9", padding: "56px 20px 24px" }}>
          <button onClick={() => navigate(-1)} style={{
            display: "flex", alignItems: "center", gap: 6, background: "none", border: "none",
            color: "#9B8E83", fontSize: 13, fontWeight: 600, cursor: "pointer", marginBottom: 16, padding: 0,
          }}>
            <ArrowLeft style={{ width: 15, height: 15 }} /> Back
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Sparkles style={{ width: 16, height: 16, color: "#B8823A" }} />
            <p style={{ fontSize: 11, fontWeight: 700, color: "#B8823A", textTransform: "uppercase", letterSpacing: ".1em" }}>
              Ah Ha Moment
            </p>
          </div>
          <h1 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: 26, fontWeight: 600, color: "#1C1410", lineHeight: 1.2, marginBottom: 6 }}>
            Share the moment that changed everything.
          </h1>
          <p style={{ fontSize: 13, color: "#4A3F35", lineHeight: 1.65 }}>
            Your story matters. Someone else may find strength in the moment you decided to fight for something better.
          </p>
        </div>

        <div style={{ padding: "20px 16px" }}>

          {/* Intro note */}
          <div style={{
            background: "rgba(184,130,58,.07)", border: "1px solid rgba(184,130,58,.2)",
            borderRadius: 14, padding: "14px 16px", marginBottom: 24,
          }}>
            <p style={{ fontSize: 13, color: "#4A3F35", lineHeight: 1.65 }}>
              You can <strong>save privately</strong>, submit <strong>anonymously</strong>, or share with your <strong>first name only</strong> — your choice, your comfort.
            </p>
          </div>

          {/* ── Visibility ── */}
          <p style={{ fontSize: 10, fontWeight: 700, color: "#9B8E83", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 12 }}>
            Who can see your story? <span style={{ color: "#C9534F" }}>*</span>
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
            {VISIBILITY_OPTIONS.map(opt => (
              <button key={opt.id} onClick={() => set("visibility", opt.id)} style={{
                display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 14,
                border: form.visibility === opt.id ? "1.5px solid #B8823A" : ".5px solid #E8E2D9",
                background: form.visibility === opt.id ? "rgba(184,130,58,.06)" : "#FDFAF6",
                cursor: "pointer", textAlign: "left",
              }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{opt.emoji}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: form.visibility === opt.id ? "#B8823A" : "#1C1410", marginBottom: 2 }}>{opt.label}</p>
                  <p style={{ fontSize: 12, color: "#9B8E83" }}>{opt.desc}</p>
                </div>
                {form.visibility === opt.id && (
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#B8823A", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Check style={{ width: 12, height: 12, color: "#fff" }} />
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* ── Story prompts ── */}
          <p style={{ fontSize: 10, fontWeight: 700, color: "#9B8E83", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 14 }}>
            Your story
          </p>

          {PROMPTS.map(p => (
            <PromptCard
              key={p.key}
              prompt={p}
              value={form[p.key]}
              onChange={val => set(p.key, val)}
            />
          ))}

          {/* Story title */}
          <div style={{ background: "#FDFAF6", border: ".5px solid #E8E2D9", borderRadius: 16, padding: "20px 18px", marginBottom: 24 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#B8823A", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 6 }}>
              Title your story <span style={{ color: "#C9534F" }}>*</span>
            </p>
            <p style={{ fontSize: 16, fontWeight: 600, color: "#1C1410", fontFamily: "'Lora', serif", lineHeight: 1.4, marginBottom: 14 }}>
              Give your moment a name.
            </p>
            <input
              value={form.title}
              onChange={e => set("title", e.target.value.slice(0, 80))}
              placeholder="e.g. The night everything became clear"
              style={{
                width: "100%", padding: "13px 14px", borderRadius: 12,
                border: ".5px solid #E8E2D9", background: "#F7F3EE", color: "#1C1410",
                fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box",
              }}
              onFocus={e => { e.target.style.borderColor = "#B8823A"; }}
              onBlur={e => { e.target.style.borderColor = "#E8E2D9"; }}
            />
            <p style={{ fontSize: 11, color: "#9B8E83", textAlign: "right", marginTop: 4 }}>{80 - form.title.length} characters left</p>
          </div>

          {/* ── Tags ── */}
          <p style={{ fontSize: 10, fontWeight: 700, color: "#9B8E83", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 12 }}>
            Themes (optional)
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28 }}>
            {TAGS.map(t => (
              <TagPill
                key={t}
                label={t}
                selected={form.tags.includes(t)}
                onToggle={() => set("tags", form.tags.includes(t) ? form.tags.filter(x => x !== t) : [...form.tags, t])}
              />
            ))}
          </div>

          {/* ── Optional details ── */}
          <div style={{ background: "#FDFAF6", border: ".5px solid #E8E2D9", borderRadius: 16, padding: "20px 18px", marginBottom: 24 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#9B8E83", marginBottom: 14 }}>
              Optional details — share only what you're comfortable with
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#4A3F35", display: "block", marginBottom: 5 }}>Time in recovery</label>
                <input value={form.clean_time} onChange={e => set("clean_time", e.target.value)}
                  placeholder="e.g. 18 months, 3 years…"
                  style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: ".5px solid #E8E2D9", background: "#F7F3EE", color: "#1C1410", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#4A3F35", display: "block", marginBottom: 5 }}>Substance (if applicable)</label>
                <select value={form.substance_category} onChange={e => set("substance_category", e.target.value)}
                  style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: ".5px solid #E8E2D9", background: "#F7F3EE", color: form.substance_category ? "#1C1410" : "#9B8E83", fontSize: 13, outline: "none", boxSizing: "border-box" }}>
                  <option value="">Choose if you'd like…</option>
                  {SUBSTANCE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#4A3F35", display: "block", marginBottom: 5 }}>Age range</label>
                <select value={form.age_range} onChange={e => set("age_range", e.target.value)}
                  style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: ".5px solid #E8E2D9", background: "#F7F3EE", color: form.age_range ? "#1C1410" : "#9B8E83", fontSize: 13, outline: "none", boxSizing: "border-box" }}>
                  <option value="">Choose if you'd like…</option>
                  {AGE_RANGES.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#4A3F35", display: "block", marginBottom: 5 }}>General location (city or state)</label>
                <input value={form.location} onChange={e => set("location", e.target.value)}
                  placeholder="e.g. New Jersey, Chicago…"
                  style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: ".5px solid #E8E2D9", background: "#F7F3EE", color: "#1C1410", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
              </div>
            </div>
          </div>

          {/* ── Safety checks ── */}
          <p style={{ fontSize: 10, fontWeight: 700, color: "#9B8E83", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 12 }}>
            Before you submit <span style={{ color: "#C9534F" }}>*</span>
          </p>
          <div style={{ background: "#FDFAF6", border: ".5px solid #E8E2D9", borderRadius: 16, padding: "18px 18px", marginBottom: 28 }}>
            {[
              { key: "safety1", label: "I understand my story may be reviewed before appearing publicly." },
              { key: "safety2", label: "I will not include full names, addresses, or identifying personal details." },
              { key: "safety3", label: "I understand this platform is for support and shared experience, not medical advice." },
            ].map(s => (
              <button key={s.key} onClick={() => set(s.key, !form[s.key])} style={{
                display: "flex", alignItems: "flex-start", gap: 12, width: "100%",
                background: "none", border: "none", cursor: "pointer", padding: "10px 0",
                borderBottom: s.key !== "safety3" ? ".5px solid #E8E2D9" : "none", textAlign: "left",
              }}>
                <div style={{
                  width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 1,
                  border: form[s.key] ? "none" : "1.5px solid #C8C2BC",
                  background: form[s.key] ? "#B8823A" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {form[s.key] && <Check style={{ width: 12, height: 12, color: "#fff" }} />}
                </div>
                <p style={{ fontSize: 13, color: "#4A3F35", lineHeight: 1.55 }}>{s.label}</p>
              </button>
            ))}
          </div>

          {/* ── Action buttons ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button
              onClick={() => setPreview(true)}
              disabled={!form.title.trim() || !form.what_happened.trim()}
              style={{
                padding: "15px", borderRadius: 50, border: "none", cursor: "pointer",
                background: form.title.trim() && form.what_happened.trim() ? "#B8823A" : "#E8E2D9",
                color: "#fff", fontWeight: 700, fontSize: 15,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              <Eye style={{ width: 16, height: 16 }} /> Preview Story
            </button>

            <button
              onClick={handleSaveDraft}
              disabled={saving || saveMutation.isPending}
              style={{
                padding: "15px", borderRadius: 50, border: "1px solid #E8E2D9", cursor: "pointer",
                background: "transparent", color: "#4A3F35", fontWeight: 600, fontSize: 15,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Save Draft
            </button>
          </div>

          <p style={{ textAlign: "center", fontSize: 11, color: "#9B8E83", lineHeight: 1.65, marginTop: 20 }}>
            Your draft is also auto-saved locally as you type.
          </p>

        </div>
      </div>
    </div>
  );
}