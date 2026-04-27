import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { ChevronRight, Loader2, Check, Phone, MessageSquare } from "lucide-react";
import RecoveryFocusPicker from "@/components/onboarding/RecoveryFocusPicker";
import LocationStep from "@/components/onboarding/LocationStep";
import { CATEGORY_BY_VALUE, isCrisisCategory } from "@/lib/recoveryCategories";
import AhHaLogo from "@/components/shared/AhHaLogo";

// ─── Data ──────────────────────────────────────────────────────────────────

const REASONS = [
  { value: "leaving_rehab",       label: "I'm leaving rehab",                    emoji: "🌱", stage: "early_recovery_15_90" },
  { value: "coming_home",         label: "I'm coming home from jail or prison",  emoji: "🔑", stage: "trying_to_stop"        },
  { value: "staying_sober",       label: "I'm trying to stay sober",             emoji: "💪", stage: "recovery_3_12_months"  },
  { value: "basic_needs",         label: "I need housing or basic help",          emoji: "🏠", stage: "trying_to_stop"        },
  { value: "getting_back",        label: "I'm getting back on my feet",           emoji: "⬆️", stage: "early_recovery_15_90" },
  { value: "support_resources",   label: "I'm here for support and resources",   emoji: "🤝", stage: "recovery_3_12_months"  },
];

const NEEDS = [
  { value: "Housing",                  emoji: "🏠" },
  { value: "Food",                     emoji: "🍽️" },
  { value: "Job Help",                 emoji: "💼" },
  { value: "Meetings",                 emoji: "🤝" },
  { value: "Benefits / ID Help",       emoji: "🪪" },
  { value: "Transportation",           emoji: "🚌" },
  { value: "Mental Health",            emoji: "💙" },
  { value: "Someone to Talk To",       emoji: "💬" },
  { value: "Staying Sober",            emoji: "🌟" },
  { value: "Daily Accountability",     emoji: "📋" },
];

const FEELINGS = [
  { value: "okay_need_direction",  label: "I'm okay, I just need direction",  emoji: "🧭", urgent: false },
  { value: "stressed_trying",      label: "I'm stressed but trying",          emoji: "😤", urgent: false },
  { value: "overwhelmed",          label: "I'm overwhelmed",                  emoji: "😓", urgent: false },
  { value: "need_support_today",   label: "I need support today",             emoji: "🆘", urgent: true  },
  { value: "risky_situation",      label: "I'm in a risky situation",         emoji: "⚠️", urgent: true  },
];

const SUPPORT_OPTIONS = [
  { value: "counselor_only",   label: "Counselor",                       emoji: "👩‍⚕️" },
  { value: "peer_only",        label: "Mentor or peer support",          emoji: "🤝" },
  { value: "case_worker",      label: "Case worker",                     emoji: "📋" },
  { value: "reentry_contact",  label: "Probation / reentry contact",     emoji: "🔑" },
  { value: "resources_only",   label: "Just resources for now",          emoji: "📍" },
];

const WHO_MAP = {
  counselor_only:  "counselor_only",
  peer_only:       "peer_only",
  case_worker:     "counselor_only",
  reentry_contact: "counselor_only",
  resources_only:  "both_best_match",
};

const NEED_HREFS = {
  "Housing":              "FindHelpNow?category=Housing",
  "Food":                 "FindHelpNow?category=Food Pantry",
  "Job Help":             "FindHelpNow?category=Employment Assistance",
  "Meetings":             "Meetings",
  "Benefits / ID Help":   "FindHelpNow?category=Reentry Services",
  "Transportation":       "FindHelpNow?category=Transportation",
  "Mental Health":        "FindHelpNow?category=Mental Health",
  "Someone to Talk To":   "ParticipantMessages",
  "Staying Sober":        "Meetings",
  "Daily Accountability": "DailyCheckIn",
};

const NEXT_STEP = {
  leaving_rehab:      { label: "Complete your first check-in",           href: "DailyCheckIn",                    emoji: "✅" },
  coming_home:        { label: "Find housing and benefits near you",     href: "FindHelpNow?category=Housing",     emoji: "🏠" },
  staying_sober:      { label: "Find a meeting near you",                href: "Meetings",                        emoji: "🤝" },
  basic_needs:        { label: "Find help near you right now",           href: "FindHelpNow",                     emoji: "📍" },
  getting_back:       { label: "Set your first goal in My Plan",         href: "ForwardPlan",                     emoji: "📋" },
  support_resources:  { label: "Explore what's available near you",     href: "FindHelpNow",                     emoji: "🗺️" },
};

// ─── Styles ────────────────────────────────────────────────────────────────
// Ah Ha brand palette — warm cream + amber

const BG     = "#F7F3EE";
const CARD   = "#FDFAF6";
const CARD_B = "1px solid #E8E2D9";
const SEL    = "rgba(184,130,58,0.10)";
const SEL_B  = "2px solid #B8823A";
const DEF_B  = "2px solid #E8E2D9";
const ACCENT = "#B8823A";
const TEXT       = "#1C1410";
const TEXT_MUTED = "#4A3F35";
const TEXT_DIM   = "#9B8E83";

// ─── Shared sub-components ────────────────────────────────────────────────

function ProgressDots({ current, total }) {
  return (
    <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 28 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            height: 4,
            borderRadius: 2,
            transition: "all 0.25s",
            width: i + 1 === current ? 28 : 8,
            background: i + 1 <= current ? ACCENT : "#E8E2D9",
          }}
        />
      ))}
    </div>
  );
}

function Heading({ title, sub }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={{ fontFamily: "'Lora', Georgia, serif", color: TEXT, fontSize: 24, fontWeight: 600, lineHeight: 1.25, marginBottom: 8 }}>{title}</h2>
      {sub && <p style={{ color: TEXT_MUTED, fontSize: 14, lineHeight: 1.6 }}>{sub}</p>}
    </div>
  );
}

function OptionCard({ selected, onClick, emoji, label, sub }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%", textAlign: "left", padding: "14px 16px",
        borderRadius: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 14,
        background: selected ? SEL : CARD,
        border: selected ? SEL_B : DEF_B,
        transition: "all 0.15s",
      }}
    >
      {emoji && <span style={{ fontSize: 22, flexShrink: 0, lineHeight: 1 }}>{emoji}</span>}
      <div style={{ flex: 1 }}>
        <p style={{ color: TEXT, fontWeight: 600, fontSize: 15, lineHeight: 1.3 }}>{label}</p>
        {sub && <p style={{ color: TEXT_DIM, fontSize: 12, marginTop: 2 }}>{sub}</p>}
      </div>
      {selected && <Check className="w-4 h-4 flex-shrink-0" style={{ color: ACCENT }} />}
    </button>
  );
}

function ChipCard({ selected, onClick, emoji, label, max, count }) {
  const disabled = !selected && count >= max;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "12px 10px", borderRadius: 14, cursor: disabled ? "default" : "pointer",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
        background: selected ? SEL : CARD,
        border: selected ? SEL_B : DEF_B,
        opacity: disabled ? 0.4 : 1,
        transition: "all 0.15s",
      }}
    >
      <span style={{ fontSize: 24, lineHeight: 1 }}>{emoji}</span>
      <p style={{ color: TEXT, fontWeight: 500, fontSize: 12, textAlign: "center", lineHeight: 1.3 }}>{label}</p>
    </button>
  );
}

function NavButtons({ step, totalSteps, canNext, onBack, onNext, loading, nextLabel }) {
  return (
    <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
      {step > 1 && (
        <button
          onClick={onBack}
          style={{
            flex: 1, padding: "14px", borderRadius: 50, fontWeight: 600, fontSize: 15,
            background: "transparent", border: `1.5px solid ${CARD_B === "1px solid #E8E2D9" ? "#E8E2D9" : "#E8E2D9"}`, color: TEXT_MUTED,
            cursor: "pointer",
          }}
        >
          Back
        </button>
      )}
      <button
        onClick={onNext}
        disabled={!canNext || loading}
        style={{
          flex: 2, padding: "14px", borderRadius: 50, fontWeight: 700, fontSize: 15,
          background: canNext ? ACCENT : "#E8E2D9",
          color: canNext ? "#fff" : TEXT_DIM, border: "none", cursor: canNext ? "pointer" : "default",
          transition: "background 0.15s",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (nextLabel || "Continue")}
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1-8 (welcome, reason, needs, feeling, support, focus, location, done)
  const [data, setData] = useState({
    reason: "",
    needs: [],
    feeling: "",
    support: "",
    focus: "",
    location_city: "",
    location_state: "",
    location_zip: "",
    location_lat: null,
    location_lng: null,
    location_granted: false,
  });

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const saveProfile = useMutation({
    mutationFn: async () => {
      const reason = REASONS.find(r => r.value === data.reason);
      await base44.entities.MemberProfile.create({
        track: "both",
        stage: reason?.stage || "trying_to_stop",
        goals: [data.reason],
        support_needs: data.needs,
        challenges: [data.feeling],
        who_to_talk_to: WHO_MAP[data.support] || "both_best_match",
        location_city: data.location_city,
        location_state: data.location_state,
        location_zip: data.location_zip,
        location_lat: data.location_lat,
        location_lng: data.location_lng,
        onboarding_complete: true,
      });

      // Persist primary recovery focus (Batch B)
      if (data.focus && user?.email) {
        await base44.entities.RecoveryFocus.create({
          user_email: user.email,
          category: data.focus,
          is_primary: true,
          is_crisis_category: isCrisisCategory(data.focus),
          selected_at: new Date().toISOString(),
        });
      }
    },
    onSuccess: () => setStep(8),
  });

  const isUrgent = FEELINGS.find(f => f.value === data.feeling)?.urgent;
  const topNeeds = data.needs.slice(0, 3);
  const nextStep = NEXT_STEP[data.reason] || NEXT_STEP.support_resources;

  const canNext = () => {
    if (step === 2) return !!data.reason;
    if (step === 3) return data.needs.length > 0;
    if (step === 4) return !!data.feeling;
    if (step === 5) return !!data.support;
    if (step === 6) return !!data.focus;
    if (step === 7) return data.location_granted || (data.location_zip && data.location_zip.length === 5);
    return true;
  };

  const handleNext = () => {
    if (step === 7) { saveProfile.mutate(); return; }
    if (step < 7) setStep(s => s + 1);
  };

  // ── Screen 1: Welcome ──────────────────────────────────────────────────
  if (step === 1) {
    return (
      <div style={{ height: "100vh", background: BG, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "8px 24px", overflow: "hidden" }}>
        <div style={{ maxWidth: 420, width: "100%" }}>
          {/* Brand mark */}
          <div style={{ textAlign: "center", marginBottom: 10 }}>
            <img
              src="https://media.base44.com/images/public/698cbbdc830161c35d66ad0e/b5173ee05_ahha_homepage_logo_750x750.png"
              alt="Ah Ha"
              style={{
                width: "min(160px, 22vh)",
                height: "min(160px, 22vh)",
                objectFit: "contain",
                display: "block",
                margin: "0 auto 6px",
                mixBlendMode: "multiply",
                background: "transparent",
              }}
            />
            <h1 style={{ fontFamily: "'Lora', Georgia, serif", color: TEXT, fontSize: 22, fontWeight: 600, lineHeight: 1.2, marginBottom: 6 }}>You showed up. That's not small — that's everything.</h1>
            <p style={{ color: TEXT_MUTED, fontSize: 13, fontWeight: 500, lineHeight: 1.4, marginBottom: 4 }}>Help. Hope. Healing.</p>
            <p style={{ color: TEXT_DIM, fontSize: 12, lineHeight: 1.5, maxWidth: 340, margin: "0 auto" }}>
              Whether you're leaving treatment, coming home, trying to stay sober, or just need somewhere to start — this is built for you.
            </p>
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button
              onClick={() => setStep(2)}
              style={{
                width: "100%", padding: "13px", borderRadius: 50, fontWeight: 700, fontSize: 15,
                background: ACCENT, color: "#fff", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              Get Started <ChevronRight className="w-5 h-5" />
            </button>
            <Link to={createPageUrl("FindHelpNow")} style={{ textDecoration: "none" }}>
              <button
                style={{
                  width: "100%", padding: "13px", borderRadius: 50, fontWeight: 700, fontSize: 15,
                  background: "rgba(201,83,79,0.07)", color: "#A32D2D",
                  border: "1.5px solid rgba(201,83,79,0.25)", cursor: "pointer",
                }}
              >
                🆘 I Need Help Right Now
              </button>
            </Link>
          </div>

          <p style={{ color: TEXT_DIM, fontSize: 11, textAlign: "center", marginTop: 8 }}>
            Takes under a minute. No paperwork. No judgment.
          </p>

          {/* Returning user log-in */}
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #E8E2D9" }}>
            <p style={{ color: TEXT_DIM, fontSize: 12, marginBottom: 6, textAlign: "center" }}>
              Already have an account?
            </p>
            <button
              onClick={() => base44.auth.redirectToLogin()}
              style={{
                width: "100%", padding: "13px", borderRadius: 50, fontWeight: 700, fontSize: 15,
                background: ACCENT, color: "#fff", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Log in <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Screen 8: Personalized Start ──────────────────────────────────────
  if (step === 8) {
    return (
      <div style={{ minHeight: "100vh", background: BG, paddingBottom: 40 }}>
        {/* Top banner */}
        <div style={{
          background: CARD, borderBottom: "1px solid #E8E2D9",
          padding: "56px 24px 32px", textAlign: "center",
        }}>
          <div style={{ fontSize: 44, marginBottom: 14 }}>✨</div>
          <h1 style={{ fontFamily: "'Lora', Georgia, serif", color: TEXT, fontSize: 24, fontWeight: 600, marginBottom: 10, lineHeight: 1.25 }}>
            Here's a good place to start.
          </h1>
          <p style={{ color: TEXT_MUTED, fontSize: 14, lineHeight: 1.7, maxWidth: 320, margin: "0 auto" }}>
            You don't have to figure everything out today. Start with one step.
          </p>
        </div>

        <div style={{ padding: "24px 20px", maxWidth: 480, margin: "0 auto" }}>

          {/* Urgent banner */}
          {isUrgent && (
            <div style={{ background: "rgba(201,83,79,0.06)", border: "1px solid rgba(201,83,79,0.22)", borderRadius: 14, padding: "16px 18px", marginBottom: 20 }}>
              <p style={{ color: "#A32D2D", fontWeight: 700, fontSize: 15, marginBottom: 10 }}>Help is available right now</p>
              <div style={{ display: "flex", gap: 10 }}>
                <a href="tel:988" style={{ flex: 1, background: "#A32D2D", borderRadius: 10, padding: "10px 8px", textAlign: "center", textDecoration: "none" }}>
                  <p style={{ color: "#fff", fontWeight: 800, fontSize: 16, lineHeight: 1 }}>988</p>
                  <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 11, marginTop: 3 }}>Crisis Line</p>
                </a>
                <a href="sms:741741" style={{ flex: 1, background: ACCENT, borderRadius: 10, padding: "10px 8px", textAlign: "center", textDecoration: "none" }}>
                  <p style={{ color: "#fff", fontWeight: 800, fontSize: 13, lineHeight: 1.3 }}>Text HOME</p>
                  <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 11, marginTop: 3 }}>to 741741</p>
                </a>
              </div>
            </div>
          )}

          {/* Next best step */}
          <p style={{ fontSize: 10, fontWeight: 700, color: TEXT_DIM, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10 }}>Your next step</p>
          <Link to={createPageUrl(nextStep.href)} style={{ textDecoration: "none" }}>
            <div style={{
              background: ACCENT, borderRadius: 16, padding: "18px 20px", marginBottom: 20,
              display: "flex", alignItems: "center", gap: 14,
              boxShadow: "0 4px 16px rgba(184,130,58,0.25)",
            }}>
              <span style={{ fontSize: 26 }}>{nextStep.emoji}</span>
              <div style={{ flex: 1 }}>
                <p style={{ color: "#fff", fontWeight: 700, fontSize: 16, lineHeight: 1.3 }}>{nextStep.label}</p>
                <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 3 }}>Start here</p>
              </div>
              <ChevronRight className="w-5 h-5" style={{ color: "rgba(255,255,255,0.85)" }} />
            </div>
          </Link>

          {/* Top needs */}
          {topNeeds.length > 0 && (
            <>
              <p style={{ fontSize: 10, fontWeight: 700, color: TEXT_DIM, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10 }}>What you're focused on</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                {topNeeds.map(need => (
                  <Link key={need} to={createPageUrl(NEED_HREFS[need] || "FindHelpNow")} style={{ textDecoration: "none" }}>
                    <div style={{
                      background: CARD, border: "1px solid #E8E2D9", borderRadius: 14,
                      padding: "14px 16px", display: "flex", alignItems: "center", gap: 12,
                    }}>
                      <span style={{ fontSize: 20 }}>{NEEDS.find(n => n.value === need)?.emoji || "📍"}</span>
                      <p style={{ flex: 1, color: TEXT, fontWeight: 600, fontSize: 15 }}>{need}</p>
                      <ChevronRight className="w-4 h-4" style={{ color: TEXT_DIM }} />
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}

          {/* Quick-action shortcuts */}
          <p style={{ fontSize: 10, fontWeight: 700, color: TEXT_DIM, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10 }}>Also easy to reach</p>
          <div style={{ display: "flex", gap: 10, marginBottom: 28 }}>
            <Link to={createPageUrl("DailyCheckIn")} style={{ flex: 1, textDecoration: "none" }}>
              <div style={{ background: CARD, border: "1px solid #E8E2D9", borderRadius: 14, padding: "14px 12px", textAlign: "center" }}>
                <span style={{ fontSize: 22 }}>✅</span>
                <p style={{ fontSize: 12, fontWeight: 600, color: TEXT, marginTop: 6 }}>Check In</p>
              </div>
            </Link>
            <Link to={createPageUrl("ParticipantMessages")} style={{ flex: 1, textDecoration: "none" }}>
              <div style={{ background: CARD, border: "1px solid #E8E2D9", borderRadius: 14, padding: "14px 12px", textAlign: "center" }}>
                <span style={{ fontSize: 22 }}>💬</span>
                <p style={{ fontSize: 12, fontWeight: 600, color: TEXT, marginTop: 6 }}>Messages</p>
              </div>
            </Link>
            <Link to={createPageUrl("ForwardPlan")} style={{ flex: 1, textDecoration: "none" }}>
              <div style={{ background: CARD, border: "1px solid #E8E2D9", borderRadius: 14, padding: "14px 12px", textAlign: "center" }}>
                <span style={{ fontSize: 22 }}>📋</span>
                <p style={{ fontSize: 12, fontWeight: 600, color: TEXT, marginTop: 6 }}>My Plan</p>
              </div>
            </Link>
          </div>

          <Link to={createPageUrl("Home")} style={{ textDecoration: "none" }}>
            <button style={{
              width: "100%", padding: "16px", borderRadius: 50, fontWeight: 700, fontSize: 16,
              background: ACCENT, color: "#fff", border: "none", cursor: "pointer",
            }}>
              Go to Home →
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // ── Screens 2–5: Shared shell ─────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ padding: "32px 24px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <AhHaLogo size={32} />
        {step > 2 && (
          <button
            onClick={() => {
              saveProfile.mutate();
            }}
            style={{ color: TEXT_DIM, fontSize: 13, background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}
          >
            Skip for now
          </button>
        )}
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "24px 24px 40px" }}>
        <div style={{ maxWidth: 440, width: "100%", margin: "0 auto" }}>
          <ProgressDots current={step - 1} total={6} />

          {/* ── Step 2: What brings you here ── */}
          {step === 2 && (
            <>
              <Heading
                title="What brings you here today?"
                sub="Pick whatever fits your situation."
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {REASONS.map(r => (
                  <OptionCard
                    key={r.value}
                    selected={data.reason === r.value}
                    onClick={() => setData(d => ({ ...d, reason: r.value }))}
                    emoji={r.emoji}
                    label={r.label}
                  />
                ))}
              </div>
            </>
          )}

          {/* ── Step 3: What do you need most ── */}
          {step === 3 && (
            <>
              <Heading
                title="What do you need most right now?"
                sub={`Pick up to 3 things. ${data.needs.length} of 3 selected.`}
              />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {NEEDS.map(n => (
                  <ChipCard
                    key={n.value}
                    selected={data.needs.includes(n.value)}
                    onClick={() => {
                      setData(d => ({
                        ...d,
                        needs: d.needs.includes(n.value)
                          ? d.needs.filter(x => x !== n.value)
                          : [...d.needs, n.value],
                      }));
                    }}
                    emoji={n.emoji}
                    label={n.value}
                    max={3}
                    count={data.needs.length}
                  />
                ))}
              </div>
            </>
          )}

          {/* ── Step 4: How are things feeling ── */}
          {step === 4 && (
            <>
              <Heading
                title="How are things feeling right now?"
                sub="Be honest. There's no wrong answer here."
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {FEELINGS.map(f => (
                  <OptionCard
                    key={f.value}
                    selected={data.feeling === f.value}
                    onClick={() => setData(d => ({ ...d, feeling: f.value }))}
                    emoji={f.emoji}
                    label={f.label}
                  />
                ))}
              </div>
              {FEELINGS.find(f => f.value === data.feeling)?.urgent && (
                <div style={{ marginTop: 16, background: "rgba(201,83,79,0.06)", border: "1px solid rgba(201,83,79,0.22)", borderRadius: 12, padding: "14px 16px" }}>
                  <p style={{ color: "#A32D2D", fontSize: 13, fontWeight: 700, marginBottom: 10 }}>You can get help right now.</p>
                  <div style={{ display: "flex", gap: 10 }}>
                    <a href="tel:988" style={{ flex: 1, background: "#A32D2D", borderRadius: 10, padding: "10px 8px", textAlign: "center", textDecoration: "none" }}>
                      <p style={{ color: "#fff", fontWeight: 800, fontSize: 16, lineHeight: 1 }}>988</p>
                      <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 11, marginTop: 3 }}>Crisis Line</p>
                    </a>
                    <a href="sms:741741" style={{ flex: 1, background: ACCENT, borderRadius: 10, padding: "10px 8px", textAlign: "center", textDecoration: "none" }}>
                      <p style={{ color: "#fff", fontWeight: 800, fontSize: 13, lineHeight: 1.3 }}>Text HOME</p>
                      <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 11, marginTop: 3 }}>to 741741</p>
                    </a>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── Step 5: Who would you like support from ── */}
          {step === 5 && (
            <>
              <Heading
                title="Who do you want to hear from?"
                sub="You can change this any time."
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {SUPPORT_OPTIONS.map(s => (
                  <OptionCard
                    key={s.value}
                    selected={data.support === s.value}
                    onClick={() => setData(d => ({ ...d, support: s.value }))}
                    emoji={s.emoji}
                    label={s.label}
                  />
                ))}
              </div>
            </>
          )}

          {/* ── Step 6: Recovery focus area ── */}
          {step === 6 && (
            <>
              <Heading
                title="What's your primary focus?"
                sub="Pick the area you want to work on most. This helps us tailor your support — you can change it any time."
              />
              <RecoveryFocusPicker
                value={data.focus}
                onChange={(v) => setData(d => ({ ...d, focus: v }))}
              />
            </>
          )}

          {/* ── Step 7: Location permission ── */}
          {step === 7 && (
            <>
              <Heading
                title="Where are you located?"
                sub="So we can show meetings and resources near you — not on the other side of the country."
              />
              <LocationStep
                value={{
                  zip: data.location_zip,
                  latitude: data.location_lat,
                  longitude: data.location_lng,
                }}
                onChange={(loc) => setData(d => ({
                  ...d,
                  location_lat: loc.latitude ?? d.location_lat,
                  location_lng: loc.longitude ?? d.location_lng,
                  location_zip: loc.zip ?? d.location_zip,
                  location_granted: loc.granted || d.location_granted,
                }))}
              />
            </>
          )}

          <NavButtons
            step={step}
            totalSteps={7}
            canNext={canNext()}
            onBack={() => setStep(s => s - 1)}
            onNext={handleNext}
            loading={saveProfile.isPending}
            nextLabel={step === 7 ? "Show me where to start →" : "Keep going"}
          />
        </div>
      </div>
    </div>
  );
}