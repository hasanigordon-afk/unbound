import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, ArrowLeft, Shield, EyeOff, Heart, Check, Loader2 } from "lucide-react";

/* ── Dark palette ─────────────────────────────────────────────────────────── */
const C = {
  bg:        "#0E0D0C",
  surface:   "#1A1817",
  surface2:  "#242120",
  border:    "#2E2A28",
  borderHi:  "#B8823A",
  text:      "#F5EFE6",
  muted:     "#B5A99A",
  dim:       "#7A7066",
  amber:     "#D4975A",
  amberSoft: "rgba(212,151,90,0.12)",
  green:     "#8FB391",
};

const INTENTS = [
  { key: "staying_sober",   label: "Trying to stay sober",    emoji: "🌱" },
  { key: "struggling",      label: "Struggling right now",     emoji: "🫂" },
  { key: "share_story",     label: "Want to share my story",   emoji: "✨" },
  { key: "supporting",      label: "Supporting someone",       emoji: "💛" },
];

const MOODS = [
  { value: 1, emoji: "😔", label: "Hard day" },
  { value: 2, emoji: "😐", label: "Getting by" },
  { value: 4, emoji: "🙂", label: "Okay" },
  { value: 5, emoji: "😊", label: "Good" },
];

const TRUST_POINTS = [
  { icon: Shield,  title: "Judgment-free space",     body: "Come as you are. No pressure, no perfect." },
  { icon: EyeOff,  title: "Anonymous usage",          body: "You never have to share your real name." },
  { icon: Heart,   title: "Not a replacement for care", body: "We support — we don't diagnose or treat." },
];

/* ── Shared wrapper ───────────────────────────────────────────────────────── */
function Screen({ children, step, total, onBack, showBack = true }) {
  return (
    <div style={{
      minHeight: "100vh", background: C.bg, color: C.text,
      display: "flex", flexDirection: "column",
      padding: "56px 24px 32px", fontFamily: "'DM Sans', sans-serif",
    }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .ah-fade { animation: fadeUp .4s cubic-bezier(.22,1,.36,1) both; }
      `}</style>

      {/* Top bar: back + progress */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 36, minHeight: 28 }}>
        {showBack && onBack ? (
          <button onClick={onBack} style={{
            background: "none", border: "none", color: C.muted,
            display: "flex", alignItems: "center", gap: 5, cursor: "pointer", padding: 0,
            fontSize: 13, fontWeight: 500,
          }}>
            <ArrowLeft style={{ width: 16, height: 16 }} />
            Back
          </button>
        ) : <div />}
        <div style={{ flex: 1 }} />
        {total && (
          <div style={{ display: "flex", gap: 5 }}>
            {Array.from({ length: total }).map((_, i) => (
              <div key={i} style={{
                width: i === step - 1 ? 18 : 6, height: 3, borderRadius: 2,
                background: i < step ? C.amber : C.border,
                transition: "all .3s ease",
              }} />
            ))}
          </div>
        )}
      </div>

      <div className="ah-fade" style={{ flex: 1, display: "flex", flexDirection: "column", maxWidth: 420, margin: "0 auto", width: "100%" }}>
        {children}
      </div>
    </div>
  );
}

function PrimaryButton({ children, onClick, disabled, loading }) {
  return (
    <button onClick={onClick} disabled={disabled || loading} style={{
      width: "100%", padding: "16px", borderRadius: 14, border: "none",
      background: disabled ? C.border : C.amber,
      color: disabled ? C.dim : "#0E0D0C",
      fontWeight: 700, fontSize: 15, cursor: disabled ? "not-allowed" : "pointer",
      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      transition: "all .15s ease",
    }}>
      {loading
        ? <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" />
        : <>{children} <ArrowRight style={{ width: 16, height: 16 }} /></>}
    </button>
  );
}

/* ── Step 1: Splash ───────────────────────────────────────────────────────── */
function SplashStep({ onNext }) {
  return (
    <Screen showBack={false}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", textAlign: "center" }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: C.amber, letterSpacing: ".2em", textTransform: "uppercase", marginBottom: 24 }}>
          Ah Ha App
        </p>
        <h1 style={{
          fontFamily: "'Lora', Georgia, serif", fontSize: 32, fontWeight: 500,
          lineHeight: 1.25, color: C.text, marginBottom: 16,
          letterSpacing: "-.01em",
        }}>
          Everyone has an <span style={{ color: C.amber, fontStyle: "italic" }}>Ah Ha</span> moment…
        </h1>
        <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.6, maxWidth: 320, margin: "0 auto" }}>
          The moment everything changes.
        </p>
      </div>
      <PrimaryButton onClick={onNext}>Get Started</PrimaryButton>
    </Screen>
  );
}

/* ── Step 2: Intent ───────────────────────────────────────────────────────── */
function IntentStep({ value, onChange, onNext, onBack }) {
  return (
    <Screen step={1} total={4} onBack={onBack}>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontFamily: "'Lora', serif", fontSize: 26, fontWeight: 500, color: C.text, marginBottom: 8, lineHeight: 1.25 }}>
          What brings you here?
        </h2>
        <p style={{ fontSize: 14, color: C.muted }}>Pick what fits right now. You can change this anytime.</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
        {INTENTS.map(opt => {
          const sel = value === opt.key;
          return (
            <button key={opt.key} onClick={() => onChange(opt.key)} style={{
              padding: "16px 18px", borderRadius: 14, cursor: "pointer",
              background: sel ? C.amberSoft : C.surface,
              border: `1px solid ${sel ? C.amber : C.border}`,
              color: C.text, textAlign: "left",
              display: "flex", alignItems: "center", gap: 12,
              transition: "all .15s ease",
            }}>
              <span style={{ fontSize: 22 }}>{opt.emoji}</span>
              <span style={{ fontSize: 15, fontWeight: 600, flex: 1 }}>{opt.label}</span>
              {sel && <Check style={{ width: 16, height: 16, color: C.amber }} strokeWidth={2.5} />}
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: "auto" }}>
        <PrimaryButton onClick={onNext} disabled={!value}>Continue</PrimaryButton>
      </div>
    </Screen>
  );
}

/* ── Step 3: Trust ────────────────────────────────────────────────────────── */
function TrustStep({ onNext, onBack }) {
  return (
    <Screen step={2} total={4} onBack={onBack}>
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontFamily: "'Lora', serif", fontSize: 26, fontWeight: 500, color: C.text, marginBottom: 8, lineHeight: 1.25 }}>
          A safe place to land.
        </h2>
        <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.6 }}>
          Before we begin, here's what you can expect from us.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
        {TRUST_POINTS.map((p, i) => {
          const Icon = p.icon;
          return (
            <div key={i} style={{
              padding: "16px 18px", borderRadius: 14,
              background: C.surface, border: `1px solid ${C.border}`,
              display: "flex", gap: 14, alignItems: "flex-start",
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                background: C.amberSoft,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon style={{ width: 18, height: 18, color: C.amber }} strokeWidth={1.8} />
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 3 }}>{p.title}</p>
                <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.55 }}>{p.body}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: "auto" }}>
        <PrimaryButton onClick={onNext}>I understand</PrimaryButton>
      </div>
    </Screen>
  );
}

/* ── Step 4: Profile ──────────────────────────────────────────────────────── */
function ProfileStep({ form, onChange, onNext, onBack }) {
  return (
    <Screen step={3} total={4} onBack={onBack}>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontFamily: "'Lora', serif", fontSize: 26, fontWeight: 500, color: C.text, marginBottom: 8, lineHeight: 1.25 }}>
          How should we know you?
        </h2>
        <p style={{ fontSize: 14, color: C.muted }}>All of this is optional.</p>
      </div>

      {/* Name */}
      <label style={{ fontSize: 11, fontWeight: 700, color: C.dim, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 8, display: "block" }}>
        Name or nickname
      </label>
      <input
        value={form.display_name}
        onChange={e => onChange({ ...form, display_name: e.target.value })}
        placeholder={form.is_anonymous ? "Anonymous" : "What should we call you?"}
        disabled={form.is_anonymous}
        style={{
          width: "100%", padding: "14px 16px", borderRadius: 12,
          background: C.surface, border: `1px solid ${C.border}`,
          color: C.text, fontSize: 15, outline: "none", marginBottom: 14,
          opacity: form.is_anonymous ? 0.5 : 1,
          boxSizing: "border-box",
        }}
      />

      {/* Anonymous toggle */}
      <div style={{
        padding: "14px 16px", borderRadius: 12, marginBottom: 16,
        background: C.surface, border: `1px solid ${C.border}`,
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <EyeOff style={{ width: 18, height: 18, color: form.is_anonymous ? C.amber : C.dim }} strokeWidth={1.8} />
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Stay anonymous</p>
          <p style={{ fontSize: 12, color: C.muted }}>Recommended. Toggle off to use your name.</p>
        </div>
        <button
          type="button"
          onClick={() => onChange({ ...form, is_anonymous: !form.is_anonymous })}
          style={{
            width: 44, height: 26, borderRadius: 13, border: "none", cursor: "pointer",
            background: form.is_anonymous ? C.amber : C.border,
            position: "relative", transition: "background .2s ease", flexShrink: 0,
          }}
        >
          <div style={{
            position: "absolute", top: 3, left: form.is_anonymous ? 21 : 3,
            width: 20, height: 20, borderRadius: "50%", background: "#fff",
            transition: "left .2s ease",
          }} />
        </button>
      </div>

      {/* Days clean */}
      <label style={{ fontSize: 11, fontWeight: 700, color: C.dim, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 8, display: "block" }}>
        Days clean <span style={{ color: C.dim, fontWeight: 500, textTransform: "none", letterSpacing: 0 }}>(optional)</span>
      </label>
      <input
        type="number" min="0"
        value={form.days_clean}
        onChange={e => onChange({ ...form, days_clean: e.target.value.replace(/\D/g, "") })}
        placeholder="0"
        style={{
          width: "100%", padding: "14px 16px", borderRadius: 12,
          background: C.surface, border: `1px solid ${C.border}`,
          color: C.text, fontSize: 15, outline: "none",
          boxSizing: "border-box",
        }}
      />

      <div style={{ marginTop: "auto", paddingTop: 24 }}>
        <PrimaryButton onClick={onNext}>Continue</PrimaryButton>
      </div>
    </Screen>
  );
}

/* ── Step 5: First Action ─────────────────────────────────────────────────── */
function FirstActionStep({ form, onChange, onFinish, onBack, saving }) {
  const canFinish = form.mood_rating != null && form.on_track != null;

  return (
    <Screen step={4} total={4} onBack={onBack}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'Lora', serif", fontSize: 26, fontWeight: 500, color: C.text, marginBottom: 8, lineHeight: 1.25 }}>
          Your first check-in.
        </h2>
        <p style={{ fontSize: 14, color: C.muted }}>Just a moment — this sets your baseline.</p>
      </div>

      {/* Mood */}
      <p style={{ fontSize: 12, fontWeight: 700, color: C.dim, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 10 }}>
        How are you feeling?
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 22 }}>
        {MOODS.map(m => {
          const sel = form.mood_rating === m.value;
          return (
            <button key={m.value} onClick={() => onChange({ ...form, mood_rating: m.value })} style={{
              padding: "14px 4px", borderRadius: 12, cursor: "pointer",
              background: sel ? C.amberSoft : C.surface,
              border: `1px solid ${sel ? C.amber : C.border}`,
              display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
              transition: "all .15s ease",
            }}>
              <span style={{ fontSize: 22 }}>{m.emoji}</span>
              <span style={{ fontSize: 10, fontWeight: 600, color: sel ? C.amber : C.muted }}>{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* On track */}
      <p style={{ fontSize: 12, fontWeight: 700, color: C.dim, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 10 }}>
        Did you stay on track today?
      </p>
      <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
        {[
          { val: true,  label: "Yes" },
          { val: false, label: "Not today" },
        ].map(o => {
          const sel = form.on_track === o.val;
          return (
            <button key={String(o.val)} onClick={() => onChange({ ...form, on_track: o.val })} style={{
              flex: 1, padding: "13px", borderRadius: 12, cursor: "pointer",
              background: sel ? C.amberSoft : C.surface,
              border: `1px solid ${sel ? C.amber : C.border}`,
              color: sel ? C.amber : C.muted,
              fontWeight: 700, fontSize: 14,
              transition: "all .15s ease",
            }}>{o.label}</button>
          );
        })}
      </div>

      {/* Ah Ha text */}
      <p style={{ fontSize: 12, fontWeight: 700, color: C.dim, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 10 }}>
        Your Ah Ha moment <span style={{ color: C.dim, fontWeight: 500, textTransform: "none", letterSpacing: 0 }}>(optional)</span>
      </p>
      <textarea
        value={form.ah_ha_text}
        onChange={e => onChange({ ...form, ah_ha_text: e.target.value })}
        placeholder="A moment that shifted something in you…"
        rows={3}
        style={{
          width: "100%", padding: "14px 16px", borderRadius: 12,
          background: C.surface, border: `1px solid ${C.border}`,
          color: C.text, fontSize: 14, outline: "none", resize: "none",
          fontFamily: "inherit", lineHeight: 1.55, boxSizing: "border-box",
        }}
      />

      <div style={{ marginTop: "auto", paddingTop: 24 }}>
        <PrimaryButton onClick={onFinish} disabled={!canFinish} loading={saving}>
          {saving ? "Saving…" : "Finish Setup"}
        </PrimaryButton>
      </div>
    </Screen>
  );
}

/* ── Main ─────────────────────────────────────────────────────────────────── */
export default function AhHaOnboarding() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [step, setStep] = useState(0); // 0=splash, 1=intent, 2=trust, 3=profile, 4=action

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const [form, setForm] = useState({
    user_intent:  null,
    display_name: "",
    is_anonymous: true,
    days_clean:   "",
    mood_rating:  null,
    on_track:     null,
    ah_ha_text:   "",
  });

  const finishMutation = useMutation({
    mutationFn: async () => {
      if (!user?.email) throw new Error("Not signed in");

      // 1) Upsert MemberProfile
      const existing = await base44.entities.MemberProfile.filter({ created_by: user.email });
      const profilePayload = {
        user_intent:        form.user_intent,
        display_name:       form.is_anonymous ? "" : form.display_name.trim(),
        is_anonymous:       form.is_anonymous,
        days_clean:         form.days_clean ? parseInt(form.days_clean, 10) : null,
        onboarding_complete: true,
      };
      if (existing[0]) await base44.entities.MemberProfile.update(existing[0].id, profilePayload);
      else             await base44.entities.MemberProfile.create(profilePayload);

      // 2) Daily check-in
      const today = new Date().toISOString().split("T")[0];
      const todays = await base44.entities.DailyCheckIn.filter({ participant_email: user.email, check_in_date: today });
      if (todays.length === 0) {
        await base44.entities.DailyCheckIn.create({
          participant_email: user.email,
          check_in_date: today,
          mood_rating: form.mood_rating,
          attended_meeting: form.on_track,
          connected_with_sponsor: null,
          notes: form.ah_ha_text.trim() || null,
          relapse_risk_flag: false,
        });
      }

      // 3) Optional Ah Ha moment
      if (form.ah_ha_text.trim().length > 0) {
        await base44.entities.AhHaMoment.create({
          content: form.ah_ha_text.trim(),
          is_anonymous: form.is_anonymous,
        }).catch(() => {}); // non-blocking
      }
    },
    onSuccess: () => {
      qc.invalidateQueries();
      navigate("/AhHaHome");
    },
  });

  const next = () => setStep(s => s + 1);
  const back = () => setStep(s => Math.max(0, s - 1));

  if (step === 0) return <SplashStep onNext={next} />;
  if (step === 1) return <IntentStep value={form.user_intent} onChange={v => setForm({ ...form, user_intent: v })} onNext={next} onBack={back} />;
  if (step === 2) return <TrustStep onNext={next} onBack={back} />;
  if (step === 3) return <ProfileStep form={form} onChange={setForm} onNext={next} onBack={back} />;
  return (
    <FirstActionStep
      form={form}
      onChange={setForm}
      onBack={back}
      onFinish={() => finishMutation.mutate()}
      saving={finishMutation.isPending}
    />
  );
}