import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { ChevronRight, Loader2, Check, Phone, MessageSquare } from "lucide-react";

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

const BG   = "linear-gradient(160deg, #0D1B2A 0%, #0F2A3F 100%)";
const CARD = "rgba(255,255,255,0.06)";
const SEL  = "rgba(74,144,226,0.25)";
const SEL_B = "2px solid #4A90E2";
const DEF_B = "2px solid transparent";
const ACCENT = "#4A90E2";

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
            background: i + 1 <= current ? ACCENT : "rgba(255,255,255,0.2)",
          }}
        />
      ))}
    </div>
  );
}

function Heading({ title, sub }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={{ color: "#FFFFFF", fontSize: 22, fontWeight: 700, lineHeight: 1.3, marginBottom: 8 }}>{title}</h2>
      {sub && <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.6 }}>{sub}</p>}
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
        <p style={{ color: "#FFFFFF", fontWeight: 600, fontSize: 15, lineHeight: 1.3 }}>{label}</p>
        {sub && <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginTop: 2 }}>{sub}</p>}
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
        opacity: disabled ? 0.35 : 1,
        transition: "all 0.15s",
      }}
    >
      <span style={{ fontSize: 24, lineHeight: 1 }}>{emoji}</span>
      <p style={{ color: "#FFFFFF", fontWeight: 500, fontSize: 12, textAlign: "center", lineHeight: 1.3 }}>{label}</p>
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
            flex: 1, padding: "14px", borderRadius: 14, fontWeight: 600, fontSize: 15,
            background: "transparent", border: "1.5px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.7)",
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
          flex: 2, padding: "14px", borderRadius: 14, fontWeight: 700, fontSize: 15,
          background: canNext ? ACCENT : "rgba(74,144,226,0.3)",
          color: "#FFFFFF", border: "none", cursor: canNext ? "pointer" : "default",
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
  const [step, setStep] = useState(1); // 1-6
  const [data, setData] = useState({
    reason: "",
    needs: [],
    feeling: "",
    support: "",
    location_city: "",
    location_state: "",
    location_zip: "",
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
        onboarding_complete: true,
      });
    },
    onSuccess: () => setStep(6),
  });

  const isUrgent = FEELINGS.find(f => f.value === data.feeling)?.urgent;
  const topNeeds = data.needs.slice(0, 3);
  const nextStep = NEXT_STEP[data.reason] || NEXT_STEP.support_resources;

  const canNext = () => {
    if (step === 2) return !!data.reason;
    if (step === 3) return data.needs.length > 0;
    if (step === 4) return !!data.feeling;
    if (step === 5) return !!data.support;
    return true;
  };

  const handleNext = () => {
    if (step === 5) { saveProfile.mutate(); return; }
    if (step < 5) setStep(s => s + 1);
  };

  // ── Screen 1: Welcome ──────────────────────────────────────────────────
  if (step === 1) {
    return (
      <div style={{ minHeight: "100vh", background: BG, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 24px" }}>
        <div style={{ maxWidth: 420, width: "100%" }}>
          {/* Mark */}
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ position: "relative", width: 64, height: 64, margin: "0 auto 20px" }}>
              <div style={{ position: "absolute", top: 0, left: 0, width: 46, height: 46, borderRadius: "50%", border: "2px solid rgba(74,144,226,0.7)" }} />
              <div style={{ position: "absolute", bottom: 0, right: 0, width: 46, height: 46, borderRadius: "50%", border: "2px solid rgba(212,165,116,0.6)" }} />
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 12, height: 12, borderRadius: "50%", background: ACCENT }} />
            </div>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>UNBOUND</p>
            <h1 style={{ color: "#FFFFFF", fontSize: 28, fontWeight: 800, lineHeight: 1.2, marginBottom: 14 }}>Welcome to Unbound</h1>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 16, fontWeight: 500, lineHeight: 1.5, marginBottom: 6 }}>Real help for your next step forward.</p>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, lineHeight: 1.7, maxWidth: 340, margin: "0 auto" }}>
              Whether you're leaving treatment, coming home, trying to stay on track, or just need support right now — Unbound is here.
            </p>
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <button
              onClick={() => setStep(2)}
              style={{
                width: "100%", padding: "16px", borderRadius: 16, fontWeight: 700, fontSize: 16,
                background: ACCENT, color: "#FFFFFF", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              Get Started <ChevronRight className="w-5 h-5" />
            </button>
            <Link to={createPageUrl("FindHelpNow")} style={{ textDecoration: "none" }}>
              <button
                style={{
                  width: "100%", padding: "16px", borderRadius: 16, fontWeight: 700, fontSize: 16,
                  background: "rgba(239,68,68,0.18)", color: "#FCA5A5",
                  border: "2px solid rgba(239,68,68,0.4)", cursor: "pointer",
                }}
              >
                🆘 I Need Help Right Now
              </button>
            </Link>
          </div>

          <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 12, textAlign: "center", marginTop: 28 }}>
            Setup takes less than 1 minute. No paperwork.
          </p>
        </div>
      </div>
    );
  }

  // ── Screen 6: Personalized Start ──────────────────────────────────────
  if (step === 6) {
    return (
      <div style={{ minHeight: "100vh", background: "#F5F5F7", paddingBottom: 40 }}>
        {/* Top banner */}
        <div style={{
          background: isUrgent ? "linear-gradient(135deg, #1D3461 0%, #1F5C99 100%)" : "linear-gradient(135deg, #0D1B2A 0%, #1A3A5C 100%)",
          padding: "40px 24px 32px", textAlign: "center",
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>✨</div>
          <h1 style={{ color: "#FFFFFF", fontSize: 22, fontWeight: 800, marginBottom: 10 }}>Here's a good place to start.</h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, lineHeight: 1.7, maxWidth: 320, margin: "0 auto" }}>
            You don't have to figure everything out at once.{"\n"}Start with the next right step.
          </p>
        </div>

        <div style={{ padding: "24px 20px", maxWidth: 480, margin: "0 auto" }}>

          {/* Urgent banner */}
          {isUrgent && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 14, padding: "16px 18px", marginBottom: 20 }}>
              <p style={{ color: "#DC2626", fontWeight: 700, fontSize: 15, marginBottom: 10 }}>Support is available right now</p>
              <div style={{ display: "flex", gap: 10 }}>
                <a href="tel:988" style={{ flex: 1, background: "#DC2626", borderRadius: 10, padding: "10px 8px", textAlign: "center", textDecoration: "none" }}>
                  <p style={{ color: "#FFF", fontWeight: 800, fontSize: 16, lineHeight: 1 }}>988</p>
                  <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 11, marginTop: 3 }}>Crisis Line</p>
                </a>
                <a href="sms:741741" style={{ flex: 1, background: "#1D4ED8", borderRadius: 10, padding: "10px 8px", textAlign: "center", textDecoration: "none" }}>
                  <p style={{ color: "#FFF", fontWeight: 800, fontSize: 13, lineHeight: 1.3 }}>Text HOME</p>
                  <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 11, marginTop: 3 }}>to 741741</p>
                </a>
              </div>
            </div>
          )}

          {/* Next best step */}
          <p style={{ fontSize: 11, fontWeight: 700, color: "#8E8E93", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 10 }}>Your next step</p>
          <Link to={createPageUrl(nextStep.href)} style={{ textDecoration: "none" }}>
            <div style={{
              background: ACCENT, borderRadius: 16, padding: "18px 20px", marginBottom: 20,
              display: "flex", alignItems: "center", gap: 14,
              boxShadow: "0 4px 16px rgba(74,144,226,0.3)",
            }}>
              <span style={{ fontSize: 26 }}>{nextStep.emoji}</span>
              <div style={{ flex: 1 }}>
                <p style={{ color: "#FFFFFF", fontWeight: 700, fontSize: 16, lineHeight: 1.3 }}>{nextStep.label}</p>
                <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, marginTop: 3 }}>Tap to go there now</p>
              </div>
              <ChevronRight className="w-5 h-5" style={{ color: "rgba(255,255,255,0.7)" }} />
            </div>
          </Link>

          {/* Top needs */}
          {topNeeds.length > 0 && (
            <>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#8E8E93", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 10 }}>What you said you need</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                {topNeeds.map(need => (
                  <Link key={need} to={createPageUrl(NEED_HREFS[need] || "FindHelpNow")} style={{ textDecoration: "none" }}>
                    <div style={{
                      background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 14,
                      padding: "14px 16px", display: "flex", alignItems: "center", gap: 12,
                    }}>
                      <span style={{ fontSize: 20 }}>{NEEDS.find(n => n.value === need)?.emoji || "📍"}</span>
                      <p style={{ flex: 1, color: "#1E1E1E", fontWeight: 600, fontSize: 15 }}>{need}</p>
                      <ChevronRight className="w-4 h-4" style={{ color: "#C7C7CC" }} />
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}

          {/* Quick-action shortcuts */}
          <p style={{ fontSize: 11, fontWeight: 700, color: "#8E8E93", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 10 }}>Also easy to reach</p>
          <div style={{ display: "flex", gap: 10, marginBottom: 28 }}>
            <Link to={createPageUrl("DailyCheckIn")} style={{ flex: 1, textDecoration: "none" }}>
              <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 14, padding: "14px 12px", textAlign: "center" }}>
                <span style={{ fontSize: 22 }}>✅</span>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#1E1E1E", marginTop: 6 }}>Check In</p>
              </div>
            </Link>
            <Link to={createPageUrl("ParticipantMessages")} style={{ flex: 1, textDecoration: "none" }}>
              <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 14, padding: "14px 12px", textAlign: "center" }}>
                <span style={{ fontSize: 22 }}>💬</span>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#1E1E1E", marginTop: 6 }}>Messages</p>
              </div>
            </Link>
            <Link to={createPageUrl("ForwardPlan")} style={{ flex: 1, textDecoration: "none" }}>
              <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 14, padding: "14px 12px", textAlign: "center" }}>
                <span style={{ fontSize: 22 }}>📋</span>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#1E1E1E", marginTop: 6 }}>My Plan</p>
              </div>
            </Link>
          </div>

          <Link to={createPageUrl("Home")} style={{ textDecoration: "none" }}>
            <button style={{
              width: "100%", padding: "16px", borderRadius: 16, fontWeight: 700, fontSize: 16,
              background: "#1E1E1E", color: "#FFFFFF", border: "none", cursor: "pointer",
            }}>
              Go to Home →
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // ── Screens 2–5: Shared dark shell ────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ padding: "32px 24px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>UNBOUND</p>
        {step > 2 && (
          <button
            onClick={() => {
              saveProfile.mutate();
            }}
            style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, background: "none", border: "none", cursor: "pointer" }}
          >
            Skip for now
          </button>
        )}
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "24px 24px 40px" }}>
        <div style={{ maxWidth: 440, width: "100%", margin: "0 auto" }}>
          <ProgressDots current={step - 1} total={4} />

          {/* ── Step 2: What brings you here ── */}
          {step === 2 && (
            <>
              <Heading
                title="What brings you here today?"
                sub="No judgment. Just pick what fits."
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
                sub={`Pick up to 3. ${data.needs.length}/3 selected.`}
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
                sub="Wherever you are — that's okay. We'll work with it."
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
                <div style={{ marginTop: 16, background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.35)", borderRadius: 12, padding: "14px 16px" }}>
                  <p style={{ color: "#FCA5A5", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>You can get help right now.</p>
                  <div style={{ display: "flex", gap: 10 }}>
                    <a href="tel:988" style={{ flex: 1, background: "rgba(239,68,68,0.3)", borderRadius: 8, padding: "8px", textAlign: "center", textDecoration: "none" }}>
                      <p style={{ color: "#FCA5A5", fontWeight: 800, fontSize: 15 }}>988</p>
                      <p style={{ color: "rgba(252,165,165,0.7)", fontSize: 10 }}>Call now</p>
                    </a>
                    <a href="sms:741741" style={{ flex: 1, background: "rgba(59,130,246,0.3)", borderRadius: 8, padding: "8px", textAlign: "center", textDecoration: "none" }}>
                      <p style={{ color: "#93C5FD", fontWeight: 700, fontSize: 13, lineHeight: 1.3 }}>Text HOME</p>
                      <p style={{ color: "rgba(147,197,253,0.7)", fontSize: 10 }}>to 741741</p>
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
                title="Who would you like support from?"
                sub="You can always change this later."
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

          <NavButtons
            step={step}
            totalSteps={5}
            canNext={canNext()}
            onBack={() => setStep(s => s - 1)}
            onNext={handleNext}
            loading={saveProfile.isPending}
            nextLabel={step === 5 ? "Show me where to start →" : "Continue"}
          />
        </div>
      </div>
    </div>
  );
}