import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "./utils";
import { ChevronLeft, ChevronRight, Phone } from "lucide-react";

// ─── Shared design tokens ─────────────────────────────────────────────────
const C = {
  bg:       "#F5F5F7",
  white:    "#FFFFFF",
  text:     "#1E1E1E",
  muted:    "#8E8E93",
  border:   "#E5E7EB",
  blue:     "#4A90E2",
  blueSoft: "#EBF5FF",
  red:      "#DC2626",
  redSoft:  "#FEF2F2",
  orange:   "#EA580C",
  orangeSoft:"#FFF7ED",
  green:    "#16A34A",
  greenSoft:"#F0FDF4",
};

// ─── Reusable sub-components ──────────────────────────────────────────────

function BackBar({ onBack, label = "Need Help Now" }) {
  return (
    <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: "16px 20px", display: "flex", alignItems: "center", gap: 10 }}>
      <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: C.blue, fontWeight: 600, fontSize: 15, padding: 0 }}>
        <ChevronLeft className="w-5 h-5" /> {label}
      </button>
    </div>
  );
}

function BigBtn({ emoji, label, sub, onClick, color = C.blue, bg, textColor = C.white }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%", display: "flex", alignItems: "center", gap: 16,
        background: bg || color, borderRadius: 18, padding: "20px 22px",
        border: "none", cursor: "pointer", textAlign: "left",
        boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
      }}
    >
      {emoji && <span style={{ fontSize: 28, flexShrink: 0, lineHeight: 1 }}>{emoji}</span>}
      <div style={{ flex: 1 }}>
        <p style={{ color: textColor, fontWeight: 700, fontSize: 17, lineHeight: 1.3, marginBottom: sub ? 3 : 0 }}>{label}</p>
        {sub && <p style={{ color: `${textColor}cc`, fontSize: 13 }}>{sub}</p>}
      </div>
      <ChevronRight className="w-5 h-5" style={{ color: `${textColor}99`, flexShrink: 0 }} />
    </button>
  );
}

function LinkBtn({ emoji, label, sub, href, externalHref, color, bg, textColor }) {
  const inner = (
    <div style={{
      width: "100%", display: "flex", alignItems: "center", gap: 16,
      background: bg || color || C.blue, borderRadius: 18, padding: "20px 22px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.07)", textDecoration: "none",
    }}>
      {emoji && <span style={{ fontSize: 28, flexShrink: 0, lineHeight: 1 }}>{emoji}</span>}
      <div style={{ flex: 1 }}>
        <p style={{ color: textColor || C.white, fontWeight: 700, fontSize: 17, lineHeight: 1.3, marginBottom: sub ? 3 : 0 }}>{label}</p>
        {sub && <p style={{ color: `${textColor || C.white}cc`, fontSize: 13 }}>{sub}</p>}
      </div>
      <ChevronRight className="w-5 h-5" style={{ color: `${textColor || C.white}80`, flexShrink: 0 }} />
    </div>
  );
  if (externalHref) return <a href={externalHref} style={{ textDecoration: "none", display: "block" }}>{inner}</a>;
  return <Link to={createPageUrl(href)} style={{ textDecoration: "none", display: "block" }}>{inner}</Link>;
}

function SectionLabel({ text }) {
  return <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 10, marginTop: 24 }}>{text}</p>;
}

// ─── Grounding screen ─────────────────────────────────────────────────────
function Grounding({ onBack, onDone }) {
  const [phase, setPhase] = useState(0); // 0=in 1=out 2=done
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#0D1B2A,#1A3A5C)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 28px", textAlign: "center" }}>
      <button onClick={onBack} style={{ position: "absolute", top: 20, left: 20, background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.5)", fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
        <ChevronLeft className="w-4 h-4" /> Back
      </button>

      {/* Breathing ring */}
      <div style={{
        width: 140, height: 140, borderRadius: "50%",
        border: "3px solid rgba(74,144,226,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 36,
        boxShadow: phase === 0 ? "0 0 0 8px rgba(74,144,226,0.12)" : phase === 1 ? "0 0 0 24px rgba(74,144,226,0.06)" : "0 0 0 8px rgba(74,144,226,0.12)",
        transition: "box-shadow 4s ease",
      }}>
        <span style={{ fontSize: 44 }}>🫁</span>
      </div>

      {phase === 0 && (
        <>
          <p style={{ color: "#FFFFFF", fontSize: 28, fontWeight: 700, marginBottom: 12 }}>Breathe in.</p>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 16, lineHeight: 1.6, maxWidth: 300, marginBottom: 40 }}>
            Slow. Through your nose. Fill your lungs.
          </p>
          <button onClick={() => setPhase(1)} style={{ background: C.blue, color: C.white, border: "none", borderRadius: 16, padding: "18px 48px", fontSize: 17, fontWeight: 700, cursor: "pointer" }}>
            Done ↓
          </button>
        </>
      )}

      {phase === 1 && (
        <>
          <p style={{ color: "#FFFFFF", fontSize: 28, fontWeight: 700, marginBottom: 12 }}>Breathe out.</p>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 16, lineHeight: 1.6, maxWidth: 300, marginBottom: 40 }}>
            Slowly. Let it all go.
          </p>
          <button onClick={() => setPhase(2)} style={{ background: C.blue, color: C.white, border: "none", borderRadius: 16, padding: "18px 48px", fontSize: 17, fontWeight: 700, cursor: "pointer" }}>
            Done ↓
          </button>
        </>
      )}

      {phase === 2 && (
        <>
          <p style={{ color: "#FFFFFF", fontSize: 22, fontWeight: 700, marginBottom: 14 }}>You made it through that moment.</p>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 16, lineHeight: 1.7, maxWidth: 300, marginBottom: 40 }}>
            You don't have to solve everything right now.{"\n"}Start with one step.
          </p>
          <button onClick={onDone} style={{ background: C.blue, color: C.white, border: "none", borderRadius: 16, padding: "18px 48px", fontSize: 17, fontWeight: 700, cursor: "pointer" }}>
            What's my next step? →
          </button>
        </>
      )}
    </div>
  );
}

// ─── Sub-screens ──────────────────────────────────────────────────────────

function FeelLikeUsing({ onBack }) {
  const [showGrounding, setShowGrounding] = useState(false);
  if (showGrounding) return <Grounding onBack={() => setShowGrounding(false)} onDone={onBack} />;
  return (
    <div style={{ minHeight: "100vh", background: C.bg, paddingBottom: 60 }}>
      <BackBar onBack={onBack} />
      <div style={{ padding: "28px 20px", maxWidth: 480, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 26, marginBottom: 10 }}>💙</p>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, lineHeight: 1.3, marginBottom: 8 }}>You reached out. That matters.</h1>
          <p style={{ fontSize: 15, color: "#5A5A5A", lineHeight: 1.6 }}>Cravings pass. You have tools. Let's get through this moment together.</p>
        </div>

        <SectionLabel text="Right now" />
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <button
            onClick={() => setShowGrounding(true)}
            style={{ background: "linear-gradient(135deg,#1A3A5C,#1F5C99)", borderRadius: 18, padding: "20px 22px", border: "none", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 16 }}
          >
            <span style={{ fontSize: 28 }}>🫁</span>
            <div style={{ flex: 1 }}>
              <p style={{ color: C.white, fontWeight: 700, fontSize: 17, marginBottom: 3 }}>Get through the next 10 minutes</p>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>A quick breathing exercise</p>
            </div>
            <ChevronRight className="w-5 h-5" style={{ color: "rgba(255,255,255,0.5)" }} />
          </button>
          <LinkBtn emoji="💬" label="Message my support contact" sub="Reach out right now" href="ParticipantMessages" bg={C.blue} />
          <LinkBtn emoji="🤝" label="Find a meeting near me" sub="In-person & virtual options" href="Meetings" bg="#16803D" />
        </div>

        <SectionLabel text="Crisis support" />
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <a href="tel:988" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 16, background: C.redSoft, border: `1px solid #FCA5A5`, borderRadius: 16, padding: "18px 20px" }}>
            <Phone className="w-6 h-6" style={{ color: C.red, flexShrink: 0 }} />
            <div>
              <p style={{ color: C.red, fontWeight: 700, fontSize: 16 }}>Call 988 — Crisis Line</p>
              <p style={{ color: "#B91C1C", fontSize: 13 }}>Free, confidential, 24/7</p>
            </div>
          </a>
          <a href="tel:18006624357" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 16, background: C.orangeSoft, border: `1px solid #FED7AA`, borderRadius: 16, padding: "18px 20px" }}>
            <Phone className="w-6 h-6" style={{ color: C.orange, flexShrink: 0 }} />
            <div>
              <p style={{ color: C.orange, fontWeight: 700, fontSize: 16 }}>SAMHSA Helpline</p>
              <p style={{ color: "#9A3412", fontSize: 13 }}>1-800-662-4357</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}

function NeedToTalk({ onBack }) {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, paddingBottom: 60 }}>
      <BackBar onBack={onBack} />
      <div style={{ padding: "28px 20px", maxWidth: 480, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 26, marginBottom: 10 }}>🤝</p>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, lineHeight: 1.3, marginBottom: 8 }}>You don't have to do this alone.</h1>
          <p style={{ fontSize: 15, color: "#5A5A5A", lineHeight: 1.6 }}>Pick the person you'd like to reach out to.</p>
        </div>

        <SectionLabel text="Reach out now" />
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <LinkBtn emoji="👩‍⚕️" label="Message my counselor" sub="Your care team is here for you" href="ParticipantMessages" bg={C.blue} />
          <LinkBtn emoji="🤝" label="Connect with peer support" sub="Someone who gets it" href="ParticipantMessages" bg="#7C3AED" />
        </div>

        <SectionLabel text="Anonymous support" />
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <a href="tel:988" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 16, background: C.redSoft, border: `1px solid #FCA5A5`, borderRadius: 16, padding: "18px 20px" }}>
            <Phone className="w-6 h-6" style={{ color: C.red, flexShrink: 0 }} />
            <div>
              <p style={{ color: C.red, fontWeight: 700, fontSize: 16 }}>Call 988 — Crisis Line</p>
              <p style={{ color: "#B91C1C", fontSize: 13 }}>Free, confidential, 24/7</p>
            </div>
          </a>
          <a href="sms:741741" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 16, background: "#EFF6FF", border: `1px solid #BFDBFE`, borderRadius: 16, padding: "18px 20px" }}>
            <Phone className="w-6 h-6" style={{ color: "#2563EB", flexShrink: 0 }} />
            <div>
              <p style={{ color: "#2563EB", fontWeight: 700, fontSize: 16 }}>Text HOME to 741741</p>
              <p style={{ color: "#1D4ED8", fontSize: 13 }}>Crisis Text Line — anonymous</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}

function NeedMeeting({ onBack }) {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, paddingBottom: 60 }}>
      <BackBar onBack={onBack} />
      <div style={{ padding: "28px 20px", maxWidth: 480, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 26, marginBottom: 10 }}>🤝</p>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, lineHeight: 1.3, marginBottom: 8 }}>Find a meeting right now.</h1>
          <p style={{ fontSize: 15, color: "#5A5A5A", lineHeight: 1.6 }}>A meeting nearby or online can help. Let's find one.</p>
        </div>

        <SectionLabel text="Find a meeting" />
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <LinkBtn emoji="📍" label="Meetings near me" sub="AA, NA, SMART Recovery & more" href="Meetings" bg={C.blue} />
          <LinkBtn emoji="💻" label="Virtual meetings" sub="Join from anywhere, right now" href="Meetings?type=virtual" bg="#7C3AED" />
        </div>

        <SectionLabel text="Other resources" />
        <a href="https://www.aa.org/find-aa" target="_blank" rel="noreferrer" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 16, background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, padding: "18px 20px", marginBottom: 10 }}>
          <span style={{ fontSize: 24 }}>🌐</span>
          <div style={{ flex: 1 }}>
            <p style={{ color: C.text, fontWeight: 700, fontSize: 16 }}>AA Meeting Finder</p>
            <p style={{ color: C.muted, fontSize: 13 }}>aa.org — search by location</p>
          </div>
          <ChevronRight className="w-4 h-4" style={{ color: C.muted }} />
        </a>
        <a href="https://www.na.org/meetingsearch/" target="_blank" rel="noreferrer" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 16, background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, padding: "18px 20px" }}>
          <span style={{ fontSize: 24 }}>🌐</span>
          <div style={{ flex: 1 }}>
            <p style={{ color: C.text, fontWeight: 700, fontSize: 16 }}>NA Meeting Finder</p>
            <p style={{ color: C.muted, fontSize: 13 }}>na.org — search by location</p>
          </div>
          <ChevronRight className="w-4 h-4" style={{ color: C.muted }} />
        </a>
      </div>
    </div>
  );
}

function NeedFoodShelter({ onBack }) {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, paddingBottom: 60 }}>
      <BackBar onBack={onBack} />
      <div style={{ padding: "28px 20px", maxWidth: 480, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 26, marginBottom: 10 }}>🏠</p>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, lineHeight: 1.3, marginBottom: 8 }}>Let's find you what you need.</h1>
          <p style={{ fontSize: 15, color: "#5A5A5A", lineHeight: 1.6 }}>Real places near you that can help today.</p>
        </div>

        <SectionLabel text="Find help near you" />
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <LinkBtn emoji="🏠" label="Emergency shelter" sub="Find a safe place to stay" href="FindHelpNow?category=Emergency Shelter" bg={C.blue} />
          <LinkBtn emoji="🍽️" label="Food right now" sub="Food banks & free meals nearby" href="FindHelpNow?category=Food Pantry" bg="#16803D" />
          <LinkBtn emoji="🏘️" label="Transitional housing" sub="Longer-term stable housing options" href="FindHelpNow?category=Transitional Housing" bg="#7C3AED" />
          <LinkBtn emoji="🚌" label="Transportation help" sub="Get to where you need to go" href="FindHelpNow?category=Transportation" bg={C.orange} />
        </div>

        <SectionLabel text="Emergency lines" />
        <a href="tel:211" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 16, background: C.redSoft, border: `1px solid #FCA5A5`, borderRadius: 16, padding: "18px 20px" }}>
          <Phone className="w-6 h-6" style={{ color: C.red, flexShrink: 0 }} />
          <div>
            <p style={{ color: C.red, fontWeight: 700, fontSize: 16 }}>Call 211</p>
            <p style={{ color: "#B91C1C", fontSize: 13 }}>Local shelter, food & social services</p>
          </div>
        </a>
      </div>
    </div>
  );
}

function FeelUnsafe({ onBack }) {
  return (
    <div style={{ minHeight: "100vh", background: C.redSoft, paddingBottom: 60 }}>
      <BackBar onBack={onBack} />
      <div style={{ padding: "28px 20px", maxWidth: 480, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 26, marginBottom: 10 }}>🆘</p>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, lineHeight: 1.3, marginBottom: 8 }}>Your safety matters most.</h1>
          <p style={{ fontSize: 15, color: "#5A5A5A", lineHeight: 1.6 }}>If you are in immediate danger, call 911 now.</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <a href="tel:911" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 16, background: C.red, borderRadius: 18, padding: "22px 22px", boxShadow: "0 4px 16px rgba(220,38,38,0.4)" }}>
            <Phone className="w-7 h-7" style={{ color: C.white, flexShrink: 0 }} strokeWidth={2.5} />
            <div>
              <p style={{ color: C.white, fontWeight: 800, fontSize: 20 }}>Call 911</p>
              <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 14 }}>Emergency services</p>
            </div>
          </a>
          <a href="tel:988" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 16, background: C.white, border: `2px solid ${C.red}`, borderRadius: 18, padding: "20px 22px" }}>
            <Phone className="w-6 h-6" style={{ color: C.red, flexShrink: 0 }} />
            <div>
              <p style={{ color: C.red, fontWeight: 700, fontSize: 17 }}>Call 988 — Crisis Line</p>
              <p style={{ color: "#B91C1C", fontSize: 13 }}>Free, confidential, 24/7</p>
            </div>
          </a>
          <a href="sms:741741" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 16, background: "#EFF6FF", border: `1px solid #BFDBFE`, borderRadius: 18, padding: "20px 22px" }}>
            <Phone className="w-6 h-6" style={{ color: "#2563EB", flexShrink: 0 }} />
            <div>
              <p style={{ color: "#2563EB", fontWeight: 700, fontSize: 17 }}>Text HOME to 741741</p>
              <p style={{ color: "#1D4ED8", fontSize: 13 }}>Crisis Text Line</p>
            </div>
          </a>
          <LinkBtn emoji="💬" label="Message my support team" sub="Your counselor or case contact" href="ParticipantMessages" bg="#5A5A5A" />
        </div>
      </div>
    </div>
  );
}

function GetBackOnTrack({ onBack }) {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, paddingBottom: 60 }}>
      <BackBar onBack={onBack} />
      <div style={{ padding: "28px 20px", maxWidth: 480, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 26, marginBottom: 10 }}>⬆️</p>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, lineHeight: 1.3, marginBottom: 8 }}>Starting over is still moving forward.</h1>
          <p style={{ fontSize: 15, color: "#5A5A5A", lineHeight: 1.6 }}>You don't have to fix everything today. Pick one thing and start there.</p>
        </div>

        <SectionLabel text="Start here" />
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <LinkBtn emoji="✅" label="Complete today's check-in" sub="Takes 30 seconds. Gets you back in the habit." href="DailyCheckIn" bg={C.blue} />
          <LinkBtn emoji="💬" label="Message my support team" sub="Let them know you're working on it." href="ParticipantMessages" bg="#7C3AED" />
          <LinkBtn emoji="📋" label="See my plan" sub="Pick one goal to focus on today." href="ForwardPlan" bg="#16803D" />
          <LinkBtn emoji="🤝" label="Find a meeting" sub="Show up. That's the whole job." href="Meetings" bg={C.orange} />
        </div>

        <div style={{ background: C.greenSoft, border: "1px solid #86EFAC", borderRadius: 16, padding: "20px", marginTop: 24, textAlign: "center" }}>
          <p style={{ fontSize: 18, marginBottom: 8 }}>💚</p>
          <p style={{ color: "#15803D", fontWeight: 700, fontSize: 16, marginBottom: 6 }}>One step is enough.</p>
          <p style={{ color: "#16A34A", fontSize: 14, lineHeight: 1.6 }}>Every single time you come back, it counts. The comeback is always the goal.</p>
        </div>
      </div>
    </div>
  );
}

// ─── Main triage screen ───────────────────────────────────────────────────

const MODES = [
  { key: "craving",  emoji: "⚡", label: "I feel like using",                color: "#1D4ED8", bg: "#EFF6FF",  textColor: "#1D4ED8" },
  { key: "talk",     emoji: "💬", label: "I need someone to talk to",        color: "#7C3AED", bg: "#F5F3FF",  textColor: "#7C3AED" },
  { key: "meeting",  emoji: "🤝", label: "I need a meeting right now",       color: "#16803D", bg: "#F0FDF4",  textColor: "#16803D" },
  { key: "food",     emoji: "🏠", label: "I need food or shelter",           color: C.orange,  bg: C.orangeSoft, textColor: C.orange },
  { key: "unsafe",   emoji: "🆘", label: "I feel unsafe",                    color: C.red,     bg: C.redSoft,  textColor: C.red    },
  { key: "reset",    emoji: "⬆️", label: "I need help getting back on track", color: "#0F766E", bg: "#F0FDFA",  textColor: "#0F766E" },
];

export default function UrgentHelp() {
  const navigate = useNavigate();
  const [mode, setMode] = useState(null);

  if (mode === "craving")  return <FeelLikeUsing   onBack={() => setMode(null)} />;
  if (mode === "talk")     return <NeedToTalk       onBack={() => setMode(null)} />;
  if (mode === "meeting")  return <NeedMeeting      onBack={() => setMode(null)} />;
  if (mode === "food")     return <NeedFoodShelter  onBack={() => setMode(null)} />;
  if (mode === "unsafe")   return <FeelUnsafe       onBack={() => setMode(null)} />;
  if (mode === "reset")    return <GetBackOnTrack   onBack={() => setMode(null)} />;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: "24px 20px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, lineHeight: 1.2, marginBottom: 4 }}>Need help right now?</h1>
          <p style={{ fontSize: 14, color: C.muted }}>Take one step. Pick what you need most.</p>
        </div>
        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, fontSize: 13, fontWeight: 600 }}>
          ✕ Close
        </button>
      </div>

      <div style={{ padding: "20px", maxWidth: 480, margin: "0 auto" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {MODES.map(m => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              style={{
                display: "flex", alignItems: "center", gap: 18,
                background: m.bg, border: `1.5px solid ${m.color}22`,
                borderRadius: 18, padding: "20px 22px",
                cursor: "pointer", textAlign: "left", width: "100%",
              }}
            >
              <span style={{ fontSize: 30, flexShrink: 0, lineHeight: 1 }}>{m.emoji}</span>
              <p style={{ color: m.textColor, fontWeight: 700, fontSize: 17, flex: 1, lineHeight: 1.3 }}>{m.label}</p>
              <ChevronRight className="w-5 h-5" style={{ color: `${m.textColor}80`, flexShrink: 0 }} />
            </button>
          ))}
        </div>

        {/* Always-visible crisis strip */}
        <div style={{ marginTop: 28, background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, padding: "16px 18px" }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 12 }}>Always available</p>
          <div style={{ display: "flex", gap: 10 }}>
            <a href="tel:988" style={{ flex: 1, background: C.redSoft, borderRadius: 12, padding: "12px 8px", textAlign: "center", textDecoration: "none" }}>
              <p style={{ fontWeight: 800, color: C.red, fontSize: 18, lineHeight: 1 }}>988</p>
              <p style={{ fontSize: 11, color: C.red, marginTop: 3, fontWeight: 600 }}>Crisis Line</p>
            </a>
            <a href="tel:911" style={{ flex: 1, background: "#FFF7ED", borderRadius: 12, padding: "12px 8px", textAlign: "center", textDecoration: "none" }}>
              <p style={{ fontWeight: 800, color: C.orange, fontSize: 18, lineHeight: 1 }}>911</p>
              <p style={{ fontSize: 11, color: C.orange, marginTop: 3, fontWeight: 600 }}>Emergency</p>
            </a>
            <a href="sms:741741" style={{ flex: 1, background: "#EFF6FF", borderRadius: 12, padding: "12px 8px", textAlign: "center", textDecoration: "none" }}>
              <p style={{ fontWeight: 800, color: "#2563EB", fontSize: 11, lineHeight: 1.3 }}>Text HOME</p>
              <p style={{ fontSize: 11, color: "#2563EB", marginTop: 3, fontWeight: 600 }}>to 741741</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}