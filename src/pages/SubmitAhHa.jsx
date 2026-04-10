import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Save, CheckCircle2, Loader2, Eye, EyeOff } from "lucide-react";
import { CATEGORIES } from "./AhHaMoment";
import { toast } from "sonner";

const C = {
  gold:   "#C9A96E",
  teal:   "#2DD4BF",
  muted:  "rgba(241,245,249,0.38)",
};

const STEPS = [
  { key: "category",          label: "What kind of moment was it?",                  subtitle: "Choose the category that feels closest to your truth." },
  { key: "what_happened",     label: "What happened?",                                subtitle: "What made you realize things had to change? Be as honest as you can." },
  { key: "feeling_in_moment", label: "What were you feeling in that moment?",         subtitle: "Fear? Relief? Shame? Exhaustion? Whatever it was, it's valid." },
  { key: "tired_of_repeating",label: "What were you tired of repeating?",             subtitle: "The cycle, the lies, the promises, the consequences — what had to stop?" },
  { key: "decision_made",     label: "What decision did you make next?",              subtitle: "It doesn't have to have been perfect. What did you choose?" },
  { key: "message_to_others", label: "What would you say to someone at that same fork?", subtitle: "Speak directly to them. They're reading this right now." },
  { key: "privacy",           label: "Privacy & publishing",                          subtitle: "Control how your story appears." },
];

const EMPTY = {
  category: "",
  what_happened: "",
  feeling_in_moment: "",
  tired_of_repeating: "",
  decision_made: "",
  message_to_others: "",
  is_anonymous: false,
  has_content_warning: false,
  content_warning: "",
};

function Textarea({ label, subtitle, value, onChange, placeholder, minRows = 4 }) {
  const len = value?.length || 0;
  return (
    <div>
      <label style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.7)", display: "block", marginBottom: 6 }}>
        {label}
      </label>
      {subtitle && <p style={{ fontSize: 12, color: C.muted, marginBottom: 10, lineHeight: 1.55 }}>{subtitle}</p>}
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={minRows}
        style={{
          width: "100%", padding: "14px", borderRadius: 14, boxSizing: "border-box",
          background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.12)",
          color: "#fff", fontSize: 14, resize: "none", outline: "none",
          fontFamily: "inherit", lineHeight: 1.7, caretColor: C.gold,
        }}
      />
      <p style={{ fontSize: 11, color: C.muted, textAlign: "right", marginTop: 4 }}>{len} chars</p>
    </div>
  );
}

export default function SubmitAhHa() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ ...EMPTY });
  const [submitted, setSubmitted] = useState(false);

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const submitMutation = useMutation({
    mutationFn: async (isDraft) => {
      await base44.entities.AhHaMoment.create({
        ...form,
        user_email: user.email,
        display_name: user.full_name || "",
        status: isDraft ? "draft" : "pending_review",
        reaction_count: 0,
        comment_count: 0,
        save_count: 0,
      });
    },
    onSuccess: (_, isDraft) => {
      if (isDraft) {
        toast.success("Draft saved.");
        navigate("/AhHaMoment");
      } else {
        setSubmitted(true);
      }
    },
  });

  const currentStep = STEPS[step];
  const progress = ((step) / (STEPS.length - 1)) * 100;

  const canAdvance = () => {
    if (step === 0) return !!form.category;
    if (step === 1) return form.what_happened?.trim().length > 20;
    return true;
  };

  if (submitted) return (
    <div style={{ background: "#07090F", minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: "32px 24px", textAlign: "center" }}>
      <div style={{ fontSize: 64, marginBottom: 20 }}>✨</div>
      <h1 style={{ fontSize: 26, fontWeight: 900, color: "#fff", marginBottom: 10, lineHeight: 1.2 }}>
        Your moment is submitted.
      </h1>
      <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.7, marginBottom: 28, maxWidth: 320 }}>
        It'll be reviewed and published shortly. Someone out there needs to read exactly what you just wrote.
      </p>
      <button onClick={() => navigate("/AhHaMoment")} style={{
        padding: "15px 32px", borderRadius: 14, border: "none", cursor: "pointer",
        background: `linear-gradient(135deg,${C.gold},#B8935A)`,
        color: "#07090F", fontWeight: 800, fontSize: 15,
      }}>
        Read Other Moments →
      </button>
    </div>
  );

  return (
    <div style={{ background: "linear-gradient(170deg,#07090F 0%,#0B1020 100%)", minHeight: "100vh", paddingBottom: 120 }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ padding: "56px 20px 24px", background: "linear-gradient(155deg,#0A1628,#080E1C)" }}>
          <button onClick={() => step > 0 ? setStep(s => s - 1) : navigate("/AhHaMoment")}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none",
              color: C.muted, cursor: "pointer", fontSize: 13, marginBottom: 20, padding: 0, fontWeight: 600 }}>
            <ArrowLeft style={{ width: 15, height: 15 }} /> {step > 0 ? "Back" : "Stories"}
          </button>

          <p style={{ fontSize: 10, fontWeight: 800, color: "rgba(201,169,110,0.7)", textTransform: "uppercase",
            letterSpacing: ".14em", marginBottom: 6 }}>Share Your Ah Ha Moment</p>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: "#fff", lineHeight: 1.25, marginBottom: 16 }}>
            {currentStep.label}
          </h1>

          {/* Progress bar */}
          <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: 4, height: 5, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 4, width: `${progress}%`,
              background: `linear-gradient(90deg,${C.gold},${C.teal})`,
              transition: "width 0.5s ease",
            }} />
          </div>
          <p style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>Step {step + 1} of {STEPS.length}</p>
        </div>

        <div style={{ padding: "20px 20px" }}>

          {/* Step 0 — Category */}
          {step === 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {CATEGORIES.map(cat => {
                const sel = form.category === cat.key;
                return (
                  <button key={cat.key} onClick={() => set("category", cat.key)} style={{
                    padding: "16px 18px", borderRadius: 16, border: "none", cursor: "pointer", textAlign: "left",
                    background: sel ? `${cat.color}12` : "rgba(255,255,255,0.04)",
                    border: `1.5px solid ${sel ? `${cat.color}50` : "rgba(255,255,255,0.08)"}`,
                    display: "flex", alignItems: "center", gap: 14,
                    transition: "all 0.15s ease",
                  }}>
                    <span style={{ fontSize: 22 }}>{cat.emoji}</span>
                    <p style={{ fontSize: 15, fontWeight: 700, color: sel ? cat.color : "rgba(255,255,255,0.7)" }}>
                      {cat.label}
                    </p>
                    {sel && <CheckCircle2 style={{ color: cat.color, width: 18, height: 18, marginLeft: "auto" }} />}
                  </button>
                );
              })}
            </div>
          )}

          {/* Steps 1–5 — Prompts */}
          {step >= 1 && step <= 5 && (
            <Textarea
              value={form[currentStep.key]}
              onChange={v => set(currentStep.key, v)}
              subtitle={currentStep.subtitle}
              placeholder={[
                "",
                "I remember the night when…",
                "I felt a mix of…",
                "I was so tired of…",
                "I decided that…",
                "If you're standing there right now, I want you to know…",
              ][step]}
              minRows={6}
            />
          )}

          {/* Step 6 — Privacy */}
          {step === 6 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Anonymous toggle */}
              <div style={{ borderRadius: 16, padding: "18px 18px",
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {form.is_anonymous ? <EyeOff style={{ color: C.muted, width: 18, height: 18 }} />
                      : <Eye style={{ color: C.teal, width: 18, height: 18 }} />}
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>
                      {form.is_anonymous ? "Post Anonymously" : "Post with My Name"}
                    </p>
                  </div>
                  <button onClick={() => set("is_anonymous", !form.is_anonymous)} style={{
                    width: 44, height: 26, borderRadius: 13, border: "none", cursor: "pointer",
                    background: form.is_anonymous ? C.teal : "rgba(255,255,255,0.15)",
                    position: "relative", transition: "background 0.2s ease",
                  }}>
                    <div style={{
                      position: "absolute", top: 3, left: form.is_anonymous ? 21 : 3,
                      width: 20, height: 20, borderRadius: "50%", background: "#fff",
                      transition: "left 0.2s ease", boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
                    }} />
                  </button>
                </div>
                <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>
                  {form.is_anonymous
                    ? "Your name won't appear on the story. Only you will know it's yours."
                    : "Your first name will be shown with your story."}
                </p>
              </div>

              {/* Content warning */}
              <div style={{ borderRadius: 16, padding: "18px 18px",
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>⚠️ Add Content Warning</p>
                  <button onClick={() => set("has_content_warning", !form.has_content_warning)} style={{
                    width: 44, height: 26, borderRadius: 13, border: "none", cursor: "pointer",
                    background: form.has_content_warning ? "#EF4444" : "rgba(255,255,255,0.15)",
                    position: "relative", transition: "background 0.2s ease",
                  }}>
                    <div style={{
                      position: "absolute", top: 3, left: form.has_content_warning ? 21 : 3,
                      width: 20, height: 20, borderRadius: "50%", background: "#fff",
                      transition: "left 0.2s ease",
                    }} />
                  </button>
                </div>
                {form.has_content_warning && (
                  <input
                    value={form.content_warning}
                    onChange={e => set("content_warning", e.target.value)}
                    placeholder="Briefly describe the content (e.g. mentions of overdose, domestic violence)"
                    style={{
                      width: "100%", padding: "12px 14px", borderRadius: 12, boxSizing: "border-box",
                      background: "rgba(255,255,255,0.06)", border: "1px solid rgba(239,68,68,0.3)",
                      color: "#fff", fontSize: 13, outline: "none",
                    }}
                  />
                )}
              </div>

              {/* Summary */}
              <div style={{ borderRadius: 16, padding: "18px 18px",
                background: "rgba(201,169,110,0.06)", border: "1.5px solid rgba(201,169,110,0.2)" }}>
                <p style={{ fontSize: 13, fontWeight: 800, color: C.gold, marginBottom: 10 }}>✨ Your story will include:</p>
                {[
                  { label: "Category", value: CATEGORIES.find(c => c.key === form.category)?.label },
                  { label: "Your moment", value: form.what_happened?.slice(0, 60) + "…" },
                  { label: "Posted as", value: form.is_anonymous ? "Anonymous" : (user?.full_name || "You") },
                ].map(r => (
                  <div key={r.label} style={{ display: "flex", gap: 10, marginBottom: 6 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: C.muted, minWidth: 80 }}>{r.label}:</p>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", flex: 1, lineHeight: 1.45 }}>{r.value || "—"}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Nav */}
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0,
          background: "rgba(7,9,15,0.97)", borderTop: "1px solid rgba(255,255,255,0.07)",
          padding: "12px 20px", display: "flex", gap: 10, zIndex: 200 }}>

          {step === STEPS.length - 1 ? (
            <>
              <button onClick={() => submitMutation.mutate(true)}
                disabled={submitMutation.isPending}
                style={{ padding: "13px 18px", borderRadius: 13, border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.05)", color: C.muted, fontWeight: 700, fontSize: 13, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 6 }}>
                <Save style={{ width: 14, height: 14 }} /> Save Draft
              </button>
              <button onClick={() => submitMutation.mutate(false)}
                disabled={submitMutation.isPending}
                style={{ flex: 1, padding: "13px", borderRadius: 13, border: "none", cursor: "pointer",
                  background: `linear-gradient(135deg,${C.gold},#B8935A)`,
                  color: "#07090F", fontWeight: 800, fontSize: 14,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  boxShadow: "0 4px 20px rgba(201,169,110,0.3)" }}>
                {submitMutation.isPending
                  ? <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" />
                  : <><CheckCircle2 style={{ width: 16, height: 16 }} /> Submit My Moment</>}
              </button>
            </>
          ) : (
            <button onClick={() => setStep(s => s + 1)} disabled={!canAdvance()} style={{
              flex: 1, padding: "15px", borderRadius: 13, border: "none",
              cursor: canAdvance() ? "pointer" : "not-allowed",
              background: canAdvance() ? `linear-gradient(135deg,${C.gold},#B8935A)` : "rgba(255,255,255,0.07)",
              color: canAdvance() ? "#07090F" : C.muted, fontWeight: 800, fontSize: 15,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: canAdvance() ? "0 4px 20px rgba(201,169,110,0.28)" : "none",
            }}>
              Continue <ArrowRight style={{ width: 16, height: 16 }} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}