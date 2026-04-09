import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Upload, CheckCircle2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const C = {
  teal:    "#2DD4BF",
  indigo:  "#6366F1",
  purple:  "#8B5CF6",
  emerald: "#10B981",
  amber:   "#F59E0B",
  red:     "#EF4444",
  muted:   "rgba(241,245,249,0.4)",
};

const SUBSTANCE_OPTIONS = [
  { key: "alcohol",             label: "Alcohol"              },
  { key: "opioids",             label: "Opioids"              },
  { key: "stimulants",          label: "Stimulants"           },
  { key: "benzodiazepines",     label: "Benzodiazepines"      },
  { key: "cannabis",            label: "Cannabis"             },
  { key: "prescription_misuse", label: "Prescription Misuse"  },
  { key: "polysubstance",       label: "Polysubstance"        },
  { key: "other",               label: "Other"                },
  { key: "prefer_not_to_say",   label: "Prefer not to say"   },
];

const GUIDELINES = [
  "Share honestly from your own experience",
  "No promotion of drug use, illegal activity, or harmful behavior",
  "No harassment, hate speech, or explicit content",
  "Respect others' recovery paths — different approaches work for different people",
  "Stories are reviewed by AI and our team before publishing",
];

const MODERATION_PROMPT = (body, title) => `
You are a content moderation assistant for a recovery community app. Review this recovery testimonial for safety.

TITLE: ${title}
STORY: ${body}

Flag if the content:
- Glorifies or promotes drug use
- Promotes illegal activity
- Contains harassment or hate speech
- Contains explicit/adult content
- Contains predatory behavior
- Is clearly not a recovery story

Also extract:
- A 2-sentence hopeful summary suitable for a preview card
- Up to 6 relevant tags from: NA/AA, sponsor, therapy, fitness, faith, family, sober living, work, relapse comeback, accountability, mental health, after rehab, medication-assisted, LGBTQ+, young adult, single parent, veterans
- Up to 3 key themes (e.g., "rebuilding family trust", "overcoming shame", "finding purpose")

Respond as JSON:
{
  "approved": true or false,
  "flag_reason": "reason if not approved, else null",
  "summary": "2-sentence preview...",
  "tags": ["tag1", "tag2"],
  "themes": ["theme1", "theme2"]
}
`;

function Field({ label, helper, optional, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
        <label style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{label}</label>
        {optional && <span style={{ fontSize: 10, color: C.muted, fontWeight: 600 }}>Optional</span>}
      </div>
      {helper && <p style={{ fontSize: 11, color: C.muted, marginBottom: 8, lineHeight: 1.5 }}>ℹ️ {helper}</p>}
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "12px 14px", borderRadius: 12, border: "none",
  background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
  color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit",
};

export default function SubmitTestimonial() {
  const navigate = useNavigate();
  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const [form, setForm] = useState({
    title: "",
    display_name: "",
    is_anonymous: false,
    sober_time: "",
    substance_category: "",
    body: "",
    lessons_learned: "",
    advice_to_others: "",
    is_relapse_comeback: false,
    image_url: "",
    guidelines_accepted: false,
  });
  const [state, setState] = useState("idle"); // idle | moderating | submitted | flagged | error
  const [flagReason, setFlagReason] = useState("");
  const [uploading, setUploading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const canSubmit = form.title.trim() && form.body.trim() && form.body.length >= 100 && form.guidelines_accepted;

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB");
      return;
    }
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      set("image_url", file_url);
    } catch {
      toast.error("Upload failed — please try a smaller image or check your connection.");
    } finally {
      setUploading(false);
    }
  };

  const submitMutation = useMutation({
    mutationFn: async () => {
      setState("moderating");

      // AI moderation + enrichment
      const mod = await base44.integrations.Core.InvokeLLM({
        prompt: MODERATION_PROMPT(form.body, form.title),
        response_json_schema: {
          type: "object",
          properties: {
            approved: { type: "boolean" },
            flag_reason: { type: ["string", "null"] },
            summary: { type: "string" },
            tags: { type: "array", items: { type: "string" } },
            themes: { type: "array", items: { type: "string" } },
          }
        }
      });

      if (!mod.approved) {
        setFlagReason(mod.flag_reason || "Content flagged for review.");
        setState("flagged");
        // Save as flagged for admin review
        await base44.entities.Testimonial.create({
          user_email: user.email,
          display_name: form.is_anonymous ? null : (form.display_name || user.full_name),
          is_anonymous: form.is_anonymous,
          title: form.title,
          body: form.body,
          sober_time: form.sober_time || null,
          substance_category: form.substance_category || null,
          lessons_learned: form.lessons_learned || null,
          advice_to_others: form.advice_to_others || null,
          image_url: form.image_url || null,
          is_relapse_comeback: form.is_relapse_comeback,
          ai_summary: mod.summary,
          ai_tags: mod.tags || [],
          ai_themes: mod.themes || [],
          status: "flagged",
          moderation_note: mod.flag_reason,
        });
        return;
      }

      // Approved — save as pending_review (lightweight human spot-check)
      await base44.entities.Testimonial.create({
        user_email: user.email,
        display_name: form.is_anonymous ? null : (form.display_name || user.full_name),
        is_anonymous: form.is_anonymous,
        title: form.title,
        body: form.body,
        sober_time: form.sober_time || null,
        substance_category: form.substance_category || null,
        lessons_learned: form.lessons_learned || null,
        advice_to_others: form.advice_to_others || null,
        image_url: form.image_url || null,
        is_relapse_comeback: form.is_relapse_comeback,
        ai_summary: mod.summary,
        ai_tags: mod.tags || [],
        ai_themes: mod.themes || [],
        status: "approved", // auto-approve after AI passes
        helpful_count: 0,
      });

      setState("submitted");
    },
    onError: () => setState("error"),
  });

  if (state === "submitted") return (
    <div style={{ background: "linear-gradient(170deg,#07090F,#0A0F1A)", minHeight: "100vh",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ textAlign: "center", maxWidth: 360 }}>
        <p style={{ fontSize: 56, marginBottom: 16 }}>🌱</p>
        <h2 style={{ fontSize: 24, fontWeight: 900, color: "#fff", marginBottom: 10 }}>Story Submitted!</h2>
        <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, marginBottom: 28 }}>
          Thank you for sharing. Your story has been reviewed and is now live in the community feed. Someone out there needed to hear exactly what you wrote.
        </p>
        <button onClick={() => navigate("/HowDidYouDoIt")} style={{
          width: "100%", padding: "14px", borderRadius: 14, border: "none", cursor: "pointer",
          background: `linear-gradient(135deg,${C.indigo},${C.purple})`,
          color: "#fff", fontWeight: 800, fontSize: 15, marginBottom: 10,
        }}>Read Stories →</button>
        <button onClick={() => navigate("/")} style={{
          width: "100%", padding: "14px", borderRadius: 14, border: "none", cursor: "pointer",
          background: "rgba(255,255,255,0.05)", color: C.muted, fontWeight: 600, fontSize: 14,
        }}>Back to Home</button>
      </div>
    </div>
  );

  if (state === "flagged") return (
    <div style={{ background: "linear-gradient(170deg,#07090F,#0A0F1A)", minHeight: "100vh",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ textAlign: "center", maxWidth: 360 }}>
        <AlertTriangle style={{ color: C.amber, width: 40, height: 40, margin: "0 auto 16px" }} />
        <h2 style={{ fontSize: 22, fontWeight: 900, color: "#fff", marginBottom: 10 }}>Story Sent for Review</h2>
        <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, marginBottom: 10 }}>
          Our AI flagged something in your story for a closer look. Our team will review it shortly. You'll still be able to edit it once it's reviewed.
        </p>
        <p style={{ fontSize: 12, color: "rgba(245,158,11,0.6)", marginBottom: 24, fontStyle: "italic" }}>Note: {flagReason}</p>
        <button onClick={() => { setState("idle"); }} style={{
          width: "100%", padding: "14px", borderRadius: 14, border: "none", cursor: "pointer",
          background: "rgba(255,255,255,0.07)", color: "#fff", fontWeight: 700, fontSize: 14, marginBottom: 10,
        }}>Edit My Story</button>
        <button onClick={() => navigate("/HowDidYouDoIt")} style={{
          width: "100%", padding: "14px", borderRadius: 14, border: "none", cursor: "pointer",
          background: "rgba(255,255,255,0.04)", color: C.muted, fontWeight: 600, fontSize: 14,
        }}>Browse Stories</button>
      </div>
    </div>
  );

  return (
    <div style={{ background: "linear-gradient(170deg,#07090F 0%,#0A0F1A 100%)", minHeight: "100vh", paddingBottom: 110 }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ padding: "56px 20px 24px", background: "linear-gradient(155deg,#0D1028,#080E1C)" }}>
          <button onClick={() => navigate("/HowDidYouDoIt")}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none",
              color: C.muted, cursor: "pointer", fontSize: 13, marginBottom: 18, padding: 0, fontWeight: 600 }}>
            <ArrowLeft style={{ width: 15, height: 15 }} /> Stories
          </button>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "#fff", marginBottom: 6 }}>Share Your Story</h1>
          <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.65 }}>
            Your experience matters. Someone out there is exactly where you were — and your story could be the thing that helps them take the next step.
          </p>
        </div>

        <div style={{ padding: "20px 16px" }}>

          {/* Community guidelines */}
          <div style={{ borderRadius: 16, padding: "14px 16px", marginBottom: 20,
            background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.2)" }}>
            <p style={{ fontSize: 12, fontWeight: 800, color: "#818CF8", marginBottom: 10,
              textTransform: "uppercase", letterSpacing: ".08em" }}>Community Guidelines</p>
            {GUIDELINES.map((g, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                <span style={{ color: C.teal, flexShrink: 0, fontSize: 12, marginTop: 1 }}>✓</span>
                <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{g}</p>
              </div>
            ))}
          </div>

          {/* Form */}
          <Field label="Story Title" helper="Give your story a title that captures its heart.">
            <input value={form.title} onChange={e => set("title", e.target.value)}
              placeholder="e.g. I didn't think I'd make it, but here I am" style={inputStyle} />
          </Field>

          <Field label="Display Name" optional helper="Leave blank to post anonymously.">
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input value={form.display_name} onChange={e => set("display_name", e.target.value)}
                placeholder={form.is_anonymous ? "Anonymous" : "Your name or nickname"}
                disabled={form.is_anonymous}
                style={{ ...inputStyle, flex: 1, opacity: form.is_anonymous ? 0.4 : 1 }} />
              <button onClick={() => set("is_anonymous", !form.is_anonymous)} style={{
                flexShrink: 0, padding: "12px 14px", borderRadius: 12, border: "none", cursor: "pointer",
                background: form.is_anonymous ? "rgba(45,212,191,0.15)" : "rgba(255,255,255,0.06)",
                border: `1.5px solid ${form.is_anonymous ? "rgba(45,212,191,0.4)" : "rgba(255,255,255,0.1)"}`,
                color: form.is_anonymous ? C.teal : C.muted, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap",
              }}>
                {form.is_anonymous ? "🙏 Anonymous" : "Stay anon"}
              </button>
            </div>
          </Field>

          <Field label="Sober Time" optional helper="Totally optional — but it can inspire others.">
            <input value={form.sober_time} onChange={e => set("sober_time", e.target.value)}
              placeholder="e.g. 2 years 3 months, or 90 days" style={inputStyle} />
          </Field>

          <Field label="Substance Category" optional>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {SUBSTANCE_OPTIONS.map(s => (
                <button key={s.key} onClick={() => set("substance_category", form.substance_category === s.key ? "" : s.key)} style={{
                  padding: "8px 12px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 12,
                  background: form.substance_category === s.key ? "rgba(99,102,241,0.18)" : "rgba(255,255,255,0.05)",
                  border: `1.5px solid ${form.substance_category === s.key ? "rgba(99,102,241,0.45)" : "rgba(255,255,255,0.09)"}`,
                  color: form.substance_category === s.key ? "#818CF8" : C.muted, fontWeight: form.substance_category === s.key ? 700 : 500,
                }}>{s.label}</button>
              ))}
            </div>
          </Field>

          <Field label="Your Story *" helper="Tell it in your own words. No perfect grammar required — just honesty.">
            <textarea value={form.body} onChange={e => set("body", e.target.value)}
              placeholder="Share what happened, how you got here, what changed, what recovery has meant to you…"
              rows={10}
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.7 }} />
            <p style={{ fontSize: 11, color: form.body.length < 100 ? C.amber : C.muted, marginTop: 5, textAlign: "right" }}>
              {form.body.length} characters {form.body.length < 100 ? `(${100 - form.body.length} more needed)` : "✓"}
            </p>
          </Field>

          <Field label="Key Lessons Learned" optional helper="What would you want your past self to know?">
            <textarea value={form.lessons_learned} onChange={e => set("lessons_learned", e.target.value)}
              placeholder="e.g. Recovery is not linear. Asking for help is strength, not weakness."
              rows={4}
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.7 }} />
          </Field>

          <Field label="Advice to Others" optional helper="What would you tell someone at day 1?">
            <textarea value={form.advice_to_others} onChange={e => set("advice_to_others", e.target.value)}
              placeholder="e.g. Don't give up before the miracle. Find one person you can be honest with."
              rows={4}
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.7 }} />
          </Field>

          {/* Relapse comeback toggle */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 16px", borderRadius: 14, marginBottom: 18,
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 2 }}>Relapse Comeback Story?</p>
              <p style={{ fontSize: 11, color: C.muted }}>Did you relapse and come back? These stories powerfully help others.</p>
            </div>
            <button onClick={() => set("is_relapse_comeback", !form.is_relapse_comeback)} style={{
              width: 48, height: 26, borderRadius: 13, border: "none", cursor: "pointer", flexShrink: 0,
              background: form.is_relapse_comeback ? C.teal : "rgba(255,255,255,0.1)",
              position: "relative", transition: "background 0.2s ease",
            }}>
              <div style={{
                position: "absolute", top: 3, left: form.is_relapse_comeback ? 25 : 3,
                width: 20, height: 20, borderRadius: "50%", background: "#fff",
                transition: "left 0.2s ease",
              }} />
            </button>
          </div>

          {/* Image upload */}
          <Field label="Photo" optional helper="Optional — a photo of something meaningful to your recovery.">
            {form.image_url ? (
              <div style={{ position: "relative" }}>
                <img src={form.image_url} alt="Story" style={{ width: "100%", borderRadius: 12, maxHeight: 200, objectFit: "cover" }} />
                <button onClick={() => set("image_url", "")} style={{
                  position: "absolute", top: 8, right: 8, width: 28, height: 28, borderRadius: "50%",
                  background: "rgba(0,0,0,0.6)", border: "none", color: "#fff", cursor: "pointer", fontSize: 12,
                }}>✕</button>
              </div>
            ) : (
              <label style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                padding: "20px", borderRadius: 12, cursor: "pointer",
                border: "2px dashed rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.03)",
              }}>
                {uploading
                  ? <Loader2 style={{ color: C.teal, width: 18, height: 18 }} className="animate-spin" />
                  : <Upload style={{ color: C.muted, width: 18, height: 18 }} />
                }
                <p style={{ fontSize: 13, color: C.muted }}>{uploading ? "Uploading…" : "Upload a photo"}</p>
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
              </label>
            )}
          </Field>

          {/* Guidelines checkbox */}
          <div style={{ padding: "16px", borderRadius: 14, marginBottom: 20,
            background: "rgba(255,255,255,0.04)", border: `1.5px solid ${form.guidelines_accepted ? "rgba(45,212,191,0.3)" : "rgba(255,255,255,0.1)"}` }}>
            <label style={{ display: "flex", gap: 12, cursor: "pointer", alignItems: "flex-start" }}>
              <input type="checkbox" checked={form.guidelines_accepted}
                onChange={e => set("guidelines_accepted", e.target.checked)}
                style={{ width: 18, height: 18, marginTop: 2, accentColor: C.teal, flexShrink: 0 }} />
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.65 }}>
                I've read the community guidelines and I confirm this story follows them. I understand it will be reviewed by AI and may be moderated.
              </p>
            </label>
          </div>

          {/* Submit */}
          <button
            onClick={() => submitMutation.mutate()}
            disabled={!canSubmit || state === "moderating"}
            style={{
              width: "100%", padding: "16px", borderRadius: 14, border: "none",
              cursor: canSubmit ? "pointer" : "not-allowed",
              background: canSubmit ? `linear-gradient(135deg,${C.indigo},${C.purple})` : "rgba(255,255,255,0.07)",
              color: canSubmit ? "#fff" : C.muted, fontWeight: 800, fontSize: 15,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: canSubmit ? "0 6px 24px rgba(99,102,241,0.3)" : "none",
              marginBottom: 12,
            }}
          >
            {state === "moderating"
              ? <><Loader2 style={{ width: 16, height: 16 }} className="animate-spin" /> Reviewing your story…</>
              : "Submit My Story →"
            }
          </button>

          <p style={{ fontSize: 11, color: C.muted, textAlign: "center", lineHeight: 1.6 }}>
            Stories are reviewed by AI and may be reviewed by our team. Publishing usually takes a few seconds.
          </p>
        </div>
      </div>
    </div>
  );
}