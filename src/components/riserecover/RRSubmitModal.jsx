import React, { useState } from "react";
import { X, Loader2, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";

const TYPES = [
  { v: "video",          label: "Video",          emoji: "🎥" },
  { v: "audio",          label: "Audio",          emoji: "🎙️" },
  { v: "text_with_voice",label: "Text + Voice",   emoji: "✍️" },
];

const CATS = [
  { v: "personal_recovery",   label: "Personal Recovery" },
  { v: "redemption_testimony",label: "Redemption Testimony" },
  { v: "ahha_moment",          label: "Ah Ha Moment" },
  { v: "motivational_advice",  label: "Motivational Advice" },
  { v: "veteran_experience",   label: "Veteran Experience" },
  { v: "rebuilding_success",   label: "Rebuilding Success" },
];

export default function RRSubmitModal({ user, onClose, onSubmitted }) {
  const [step, setStep] = useState("form"); // form | done
  const [submission_type, setType] = useState("video");
  const [category, setCat] = useState("personal_recovery");
  const [title, setTitle] = useState("");
  const [story_text, setStory] = useState("");
  const [media_url, setMediaUrl] = useState("");
  const [is_anonymous, setAnon] = useState(false);
  const [consent_given, setConsent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setMediaUrl(file_url);
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    if (!title.trim() || !consent_given) return;
    setSaving(true);
    try {
      await base44.entities.RiseSubmission.create({
        user_email: user.email,
        display_name: is_anonymous ? "Anonymous" : (user.full_name?.split(" ")[0] || "Friend"),
        is_anonymous,
        submission_type,
        category,
        title: title.trim(),
        story_text: story_text.trim() || undefined,
        media_url: media_url || undefined,
        consent_given,
      });
      setStep("done");
      onSubmitted?.();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div role="dialog" aria-modal="true" onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 110,
      background: "rgba(7,10,20,0.92)", backdropFilter: "blur(14px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 14, overflowY: "auto",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        position: "relative",
        width: "100%", maxWidth: 520,
        background: "var(--card)",
        border: "1px solid var(--border-glow)",
        borderRadius: 22, padding: 22,
        backdropFilter: "blur(22px)",
        boxShadow: "var(--glow), var(--shadow)",
        color: "var(--text)",
      }}>
        <button onClick={onClose} aria-label="Close" style={{
          position: "absolute", top: 14, right: 14,
          width: 32, height: 32, borderRadius: "50%",
          background: "var(--surface)", border: "1px solid var(--border)",
          color: "var(--text)", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <X style={{ width: 16, height: 16 }} />
        </button>

        {step === "done" ? (
          <div style={{ textAlign: "center", padding: "24px 8px" }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: "linear-gradient(135deg, var(--accent), var(--purple))",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 14px", boxShadow: "var(--glow)",
            }}>
              <Check style={{ width: 28, height: 28, color: "#fff" }} />
            </div>
            <h3 style={{
              fontFamily: "'Lora', Georgia, serif", fontSize: 22, fontWeight: 700,
              marginBottom: 8,
            }}>Thank you for sharing.</h3>
            <p style={{ color: "var(--text-muted)", fontSize: 13.5, lineHeight: 1.65, maxWidth: 360, margin: "0 auto" }}>
              Your story is in moderation. Once approved, it can help someone else find their way back too.
            </p>
            <button onClick={onClose} className="btn-primary" style={{ marginTop: 22 }}>
              Close
            </button>
          </div>
        ) : (
          <>
            <p style={{
              fontSize: 10.5, fontWeight: 800, color: "var(--accent)",
              letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 8,
              fontFamily: "'Space Grotesk', 'DM Sans', sans-serif",
            }}>Share Your Story</p>
            <h2 style={{
              fontFamily: "'Lora', Georgia, serif", fontSize: 22, fontWeight: 700,
              lineHeight: 1.25, marginBottom: 6,
            }}>Your comeback could change someone's life.</h2>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 18 }}>
              All submissions are reviewed for safety and positivity before going live.
            </p>

            {/* Type */}
            <Label>Format</Label>
            <Row>
              {TYPES.map(t => (
                <Pill key={t.v} active={submission_type === t.v} onClick={() => setType(t.v)}>
                  <span style={{ fontSize: 14 }}>{t.emoji}</span> {t.label}
                </Pill>
              ))}
            </Row>

            {/* Category */}
            <Label>Category</Label>
            <Row wrap>
              {CATS.map(c => (
                <Pill key={c.v} active={category === c.v} onClick={() => setCat(c.v)}>
                  {c.label}
                </Pill>
              ))}
            </Row>

            {/* Title */}
            <Label>Title</Label>
            <input value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="A title that captures the moment"
              style={{ width: "100%", marginBottom: 14 }} />

            {/* Story text */}
            <Label>Your story (optional)</Label>
            <textarea value={story_text} onChange={(e) => setStory(e.target.value)}
              placeholder="Share what mattered. Keep it real and recovery-positive."
              rows={4}
              style={{ width: "100%", marginBottom: 14, resize: "vertical" }} />

            {/* Media upload */}
            {submission_type !== "text_with_voice" && (
              <>
                <Label>{submission_type === "video" ? "Upload video" : "Upload audio"}</Label>
                <input
                  type="file"
                  accept={submission_type === "video" ? "video/*" : "audio/*"}
                  onChange={handleFile}
                  style={{ width: "100%", marginBottom: 6 }}
                />
                {uploading && <p style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 8 }}>Uploading…</p>}
                {media_url && <p style={{ fontSize: 12, color: "var(--green)", marginBottom: 14 }}>✓ Uploaded</p>}
              </>
            )}

            {/* Toggles */}
            <div style={{
              display: "flex", flexDirection: "column", gap: 8,
              padding: "12px 14px", borderRadius: 12,
              background: "var(--surface)", border: "1px solid var(--border)",
              marginBottom: 16,
            }}>
              <Toggle checked={is_anonymous} onChange={setAnon} label="Share anonymously" />
              <Toggle checked={consent_given} onChange={setConsent}
                label="I consent to my story being shared on Re-siliant after moderation."
              />
            </div>

            <button onClick={submit}
              disabled={!title.trim() || !consent_given || saving}
              className="btn-primary"
              style={{
                width: "100%",
                opacity: !title.trim() || !consent_given || saving ? .5 : 1,
                cursor: !title.trim() || !consent_given || saving ? "default" : "pointer",
              }}>
              {saving ? <Loader2 className="animate-spin" style={{ width: 16, height: 16 }} /> : "Submit Story"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function Label({ children }) {
  return <p style={{
    fontSize: 10.5, fontWeight: 700, color: "var(--text-dim)",
    letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 8, marginTop: 6,
  }}>{children}</p>;
}
function Row({ children, wrap }) {
  return <div style={{ display: "flex", flexWrap: wrap ? "wrap" : "nowrap", gap: 6, marginBottom: 14 }}>{children}</div>;
}
function Pill({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      padding: "8px 12px", borderRadius: 999,
      background: active ? "linear-gradient(135deg, var(--accent), var(--purple))" : "var(--surface)",
      color: active ? "#fff" : "var(--text)",
      border: active ? "1px solid transparent" : "1px solid var(--border)",
      fontSize: 12, fontWeight: 600, cursor: "pointer",
      display: "inline-flex", alignItems: "center", gap: 5,
      boxShadow: active ? "var(--glow)" : "none",
      fontFamily: "'DM Sans', sans-serif",
    }}>{children}</button>
  );
}
function Toggle({ checked, onChange, label }) {
  return (
    <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", fontSize: 13, color: "var(--text)" }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
        style={{ width: 16, height: 16, marginTop: 2, accentColor: "var(--accent)" }} />
      <span style={{ lineHeight: 1.5 }}>{label}</span>
    </label>
  );
}