import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "./utils";
import { ChevronLeft, ChevronRight, Phone, Loader2 } from "lucide-react";

// ─── Design tokens ────────────────────────────────────────────────────────
const C = {
  bg:         "#F5F5F7",
  white:      "#FFFFFF",
  text:       "#1E1E1E",
  muted:      "#8E8E93",
  border:     "#E5E7EB",
  blue:       "#4A90E2",
  blueSoft:   "#EBF5FF",
  red:        "#DC2626",
  redSoft:    "#FEF2F2",
  orange:     "#EA580C",
  orangeSoft: "#FFF7ED",
  green:      "#16A34A",
  greenSoft:  "#F0FDF4",
};

// ─── Personalization scoring ──────────────────────────────────────────────
// Returns the 6 mode keys sorted by relevance (highest score first)
function scoreAndSortModes(profile, recentCheckIn) {
  const needs    = profile?.support_needs || [];
  const reason   = profile?.goals?.[0] || "";
  const feeling  = profile?.challenges?.[0] || "";
  const mood     = recentCheckIn?.mood_rating ?? 3;
  const craving  = recentCheckIn?.craving_level ?? 0;
  const noMeeting = recentCheckIn?.attended_meeting === false;
  const needsHelp = recentCheckIn?.needs_help === true;

  const scores = {
    craving: 0,
    talk:    0,
    meeting: 0,
    food:    0,
    unsafe:  0,
    reset:   0,
  };

  // reason signals
  if (reason === "leaving_rehab")    { scores.craving += 3; scores.meeting += 2; }
  if (reason === "staying_sober")    { scores.craving += 2; scores.meeting += 3; }
  if (reason === "basic_needs")      { scores.food    += 4; }
  if (reason === "coming_home")      { scores.food    += 3; scores.reset   += 2; }
  if (reason === "getting_back")     { scores.reset   += 4; }
  if (reason === "support_resources"){ scores.talk    += 2; }

  // support needs signals
  if (needs.includes("Housing"))            scores.food    += 3;
  if (needs.includes("Food"))               scores.food    += 3;
  if (needs.includes("Meetings"))           scores.meeting += 3;
  if (needs.includes("Someone to Talk To")) scores.talk    += 3;
  if (needs.includes("Staying Sober"))      scores.craving += 2;
  if (needs.includes("Mental Health"))      scores.talk    += 2;
  if (needs.includes("Daily Accountability"))scores.reset  += 2;

  // feeling signals
  if (feeling === "risky_situation")   { scores.unsafe  += 4; scores.craving += 2; }
  if (feeling === "need_support_today"){ scores.unsafe  += 2; scores.talk    += 3; }
  if (feeling === "overwhelmed")       { scores.craving += 1; scores.talk    += 2; scores.reset += 1; }
  if (feeling === "stressed_trying")   { scores.talk    += 1; scores.reset   += 1; }

  // recent check-in signals
  if (needsHelp)        { scores.talk    += 3; scores.unsafe  += 1; }
  if (mood <= 2)        { scores.craving += 2; scores.talk    += 2; }
  if (craving >= 4)     { scores.craving += 4; }
  if (noMeeting)        { scores.meeting += 1; }

  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .map(([key]) => key);
}

// Returns true if the user has a meaningful personalized context to show
function hasContext(profile, recentCheckIn) {
  return !!(profile?.support_needs?.length || profile?.goals?.[0] || recentCheckIn);
}

// ─── Shared small components ──────────────────────────────────────────────
function BackBar({ onBack }) {
  return (
    <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: "16px 20px" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: C.blue, fontWeight: 600, fontSize: 15, padding: 0 }}>
        <ChevronLeft className="w-5 h-5" /> Need Help Now
      </button>
    </div>
  );
}

function LinkBtn({ emoji, label, sub, href, externalHref, bg, textColor, pinned }) {
  const inner = (
    <div style={{
      width: "100%", display: "flex", alignItems: "center", gap: 16,
      background: bg || C.blue, borderRadius: 18, padding: "20px 22px",
      boxShadow: pinned ? "0 4px 16px rgba(0,0,0,0.18)" : "0 2px 8px rgba(0,0,0,0.07)",
      border: pinned ? "2px solid rgba(255,255,255,0.25)" : "none",
      position: "relative",
    }}>
      {pinned && (
        <div style={{ position: "absolute", top: -8, right: 14, background: "#FBBF24", borderRadius: 8, padding: "2px 8px", fontSize: 10, fontWeight: 700, color: "#1E1E1E" }}>
          For you
        </div>
      )}
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

function CrisisStrip() {
  return (
    <div style={{ marginTop: 28, background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, padding: "16px 18px" }}>
      <p style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 12 }}>Always available</p>
      <div style={{ display: "flex", gap: 10 }}>
        <a href="tel:988" style={{ flex: 1, background: C.redSoft, borderRadius: 12, padding: "12px 8px", textAlign: "center", textDecoration: "none" }}>
          <p style={{ fontWeight: 800, color: C.red, fontSize: 18, lineHeight: 1 }}>988</p>
          <p style={{ fontSize: 11, color: C.red, marginTop: 3, fontWeight: 600 }}>Crisis Line</p>
        </a>
        <a href="tel:911" style={{ flex: 1, background: C.orangeSoft, borderRadius: 12, padding: "12px 8px", textAlign: "center", textDecoration: "none" }}>
          <p style={{ fontWeight: 800, color: C.orange, fontSize: 18, lineHeight: 1 }}>911</p>
          <p style={{ fontSize: 11, color: C.orange, marginTop: 3, fontWeight: 600 }}>Emergency</p>
        </a>
        <a href="sms:741741" style={{ flex: 1, background: "#EFF6FF", borderRadius: 12, padding: "12px 8px", textAlign: "center", textDecoration: "none" }}>
          <p style={{ fontWeight: 800, color: "#2563EB", fontSize: 11, lineHeight: 1.3 }}>Text HOME</p>
          <p style={{ fontSize: 11, color: "#2563EB", marginTop: 3, fontWeight: 600 }}>to 741741</p>
        </a>
      </div>
    </div>
  );
}

// ─── Grounding screen ─────────────────────────────────────────────────────
function Grounding({ onBack, onDone }) {
  const [phase, setPhase] = useState(0);
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#0D1B2A,#1A3A5C)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 28px", textAlign: "center" }}>
      <button onClick={onBack} style={{ position: "absolute", top: 20, left: 20, background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.5)", fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
        <ChevronLeft className="w-4 h-4" /> Back
      </button>
      <div style={{ width: 140, height: 140, borderRadius: "50%", border: "3px solid rgba(74,144,226,0.5)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 36, boxShadow: phase === 1 ? "0 0 0 24px rgba(74,144,226,0.06)" : "0 0 0 8px rgba(74,144,226,0.12)", transition: "box-shadow 4s ease" }}>
        <span style={{ fontSize: 44 }}>🫁</span>
      </div>
      {phase === 0 && (<>
        <p style={{ color: "#FFF", fontSize: 28, fontWeight: 700, marginBottom: 12 }}>Breathe in.</p>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 16, lineHeight: 1.6, maxWidth: 300, marginBottom: 40 }}>Slow. Through your nose. Fill your lungs.</p>
        <button onClick={() => setPhase(1)} style={{ background: C.blue, color: C.white, border: "none", borderRadius: 16, padding: "18px 48px", fontSize: 17, fontWeight: 700, cursor: "pointer" }}>Done ↓</button>
      </>)}
      {phase === 1 && (<>
        <p style={{ color: "#FFF", fontSize: 28, fontWeight: 700, marginBottom: 12 }}>Breathe out.</p>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 16, lineHeight: 1.6, maxWidth: 300, marginBottom: 40 }}>Slowly. Let it all go.</p>
        <button onClick={() => setPhase(2)} style={{ background: C.blue, color: C.white, border: "none", borderRadius: 16, padding: "18px 48px", fontSize: 17, fontWeight: 700, cursor: "pointer" }}>Done ↓</button>
      </>)}
      {phase === 2 && (<>
        <p style={{ color: "#FFF", fontSize: 22, fontWeight: 700, marginBottom: 14 }}>You made it through that moment.</p>
        <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 16, lineHeight: 1.7, maxWidth: 300, marginBottom: 40 }}>You don't have to solve everything right now.{"\n"}Start with one step.</p>
        <button onClick={onDone} style={{ background: C.blue, color: C.white, border: "none", borderRadius: 16, padding: "18px 48px", fontSize: 17, fontWeight: 700, cursor: "pointer" }}>What's my next step? →</button>
      </>)}
    </div>
  );
}

// ─── Sub-screens (context-aware) ──────────────────────────────────────────

function FeelLikeUsing({ onBack, ctx }) {
  const [showGrounding, setShowGrounding] = useState(false);
  const needs   = ctx.profile?.support_needs || [];
  // If user flagged "Someone to Talk To" in needs, messaging is most relevant first
  const talkFirst = needs.includes("Someone to Talk To") || needs.includes("Mental Health");
  // If user flagged "Meetings", show meeting finder prominently
  const meetingFirst = needs.includes("Meetings") || needs.includes("Staying Sober");

  if (showGrounding) return <Grounding onBack={() => setShowGrounding(false)} onDone={onBack} />;

  const primaryActions = [
    !talkFirst && !meetingFirst && {
      key: "breath",
      el: (
        <button key="breath" onClick={() => setShowGrounding(true)} style={{ background: "linear-gradient(135deg,#1A3A5C,#1F5C99)", borderRadius: 18, padding: "20px 22px", border: "none", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 28 }}>🫁</span>
          <div style={{ flex: 1 }}>
            <p style={{ color: C.white, fontWeight: 700, fontSize: 17, marginBottom: 3 }}>Get through the next 10 minutes</p>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>A quick breathing exercise</p>
          </div>
          <ChevronRight className="w-5 h-5" style={{ color: "rgba(255,255,255,0.5)" }} />
        </button>
      )
    },
    { key: "msg",     el: <LinkBtn key="msg"     emoji="💬" label="Message my support contact"   sub="Reach out right now"           href="ParticipantMessages" bg={C.blue}    pinned={talkFirst} /> },
    { key: "meeting", el: <LinkBtn key="meeting" emoji="🤝" label="Find a meeting near me"       sub="In-person & virtual options"   href="Meetings"           bg="#16803D"   pinned={meetingFirst} /> },
    (!talkFirst && !meetingFirst) ? null : {
      key: "breath2",
      el: (
        <button key="breath2" onClick={() => setShowGrounding(true)} style={{ background: "linear-gradient(135deg,#1A3A5C,#1F5C99)", borderRadius: 18, padding: "20px 22px", border: "none", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 28 }}>🫁</span>
          <div style={{ flex: 1 }}>
            <p style={{ color: C.white, fontWeight: 700, fontSize: 17, marginBottom: 3 }}>Get through the next 10 minutes</p>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>A quick breathing exercise</p>
          </div>
          <ChevronRight className="w-5 h-5" style={{ color: "rgba(255,255,255,0.5)" }} />
        </button>
      )
    },
  ].filter(Boolean);

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
          {primaryActions.map(a => a.el)}
        </div>
        <SectionLabel text="Crisis support" />
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <a href="tel:988" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 16, background: C.redSoft, border: `1px solid #FCA5A5`, borderRadius: 16, padding: "18px 20px" }}>
            <Phone className="w-6 h-6" style={{ color: C.red, flexShrink: 0 }} />
            <div><p style={{ color: C.red, fontWeight: 700, fontSize: 16 }}>Call 988 — Crisis Line</p><p style={{ color: "#B91C1C", fontSize: 13 }}>Free, confidential, 24/7</p></div>
          </a>
          <a href="tel:18006624357" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 16, background: C.orangeSoft, border: `1px solid #FED7AA`, borderRadius: 16, padding: "18px 20px" }}>
            <Phone className="w-6 h-6" style={{ color: C.orange, flexShrink: 0 }} />
            <div><p style={{ color: C.orange, fontWeight: 700, fontSize: 16 }}>SAMHSA Helpline</p><p style={{ color: "#9A3412", fontSize: 13 }}>1-800-662-4357</p></div>
          </a>
        </div>
      </div>
    </div>
  );
}

function NeedToTalk({ onBack, ctx }) {
  const who = ctx.profile?.who_to_talk_to || "both_best_match";
  const peerFirst = who === "peer_only";
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
          {peerFirst ? (<>
            <LinkBtn emoji="🤝" label="Connect with peer support" sub="Someone who gets it" href="ParticipantMessages" bg="#7C3AED" pinned />
            <LinkBtn emoji="👩‍⚕️" label="Message my counselor" sub="Your care team is here for you" href="ParticipantMessages" bg={C.blue} />
          </>) : (<>
            <LinkBtn emoji="👩‍⚕️" label="Message my counselor" sub="Your care team is here for you" href="ParticipantMessages" bg={C.blue} pinned={who === "counselor_only"} />
            <LinkBtn emoji="🤝" label="Connect with peer support" sub="Someone who gets it" href="ParticipantMessages" bg="#7C3AED" />
          </>)}
        </div>
        <SectionLabel text="Anonymous support" />
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <a href="tel:988" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 16, background: C.redSoft, border: `1px solid #FCA5A5`, borderRadius: 16, padding: "18px 20px" }}>
            <Phone className="w-6 h-6" style={{ color: C.red, flexShrink: 0 }} />
            <div><p style={{ color: C.red, fontWeight: 700, fontSize: 16 }}>Call 988 — Crisis Line</p><p style={{ color: "#B91C1C", fontSize: 13 }}>Free, confidential, 24/7</p></div>
          </a>
          <a href="sms:741741" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 16, background: "#EFF6FF", border: `1px solid #BFDBFE`, borderRadius: 16, padding: "18px 20px" }}>
            <Phone className="w-6 h-6" style={{ color: "#2563EB", flexShrink: 0 }} />
            <div><p style={{ color: "#2563EB", fontWeight: 700, fontSize: 16 }}>Text HOME to 741741</p><p style={{ color: "#1D4ED8", fontSize: 13 }}>Crisis Text Line — anonymous</p></div>
          </a>
        </div>
      </div>
    </div>
  );
}

function NeedMeeting({ onBack, ctx }) {
  const needs = ctx.profile?.support_needs || [];
  // surface virtual first if no location set
  const noLocation = !ctx.profile?.location_city && !ctx.profile?.location_zip;
  return (
    <div style={{ minHeight: "100vh", background: C.bg, paddingBottom: 60 }}>
      <BackBar onBack={onBack} />
      <div style={{ padding: "28px 20px", maxWidth: 480, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 26, marginBottom: 10 }}>🤝</p>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, lineHeight: 1.3, marginBottom: 8 }}>Find a meeting right now.</h1>
          <p style={{ fontSize: 15, color: "#5A5A5A", lineHeight: 1.6 }}>
            {noLocation ? "No location needed — join online right now." : "A meeting nearby or online can help."}
          </p>
        </div>
        <SectionLabel text="Find a meeting" />
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {noLocation ? (<>
            <LinkBtn emoji="💻" label="Virtual meetings" sub="Join from anywhere, right now" href="Meetings?type=virtual" bg="#7C3AED" pinned />
            <LinkBtn emoji="📍" label="Meetings near me" sub="AA, NA, SMART Recovery & more" href="Meetings" bg={C.blue} />
          </>) : (<>
            <LinkBtn emoji="📍" label="Meetings near me" sub="AA, NA, SMART Recovery & more" href="Meetings" bg={C.blue} pinned />
            <LinkBtn emoji="💻" label="Virtual meetings" sub="Join from anywhere, right now" href="Meetings?type=virtual" bg="#7C3AED" />
          </>)}
        </div>
        <SectionLabel text="Other resources" />
        <a href="https://www.aa.org/find-aa" target="_blank" rel="noreferrer" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 16, background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, padding: "18px 20px", marginBottom: 10 }}>
          <span style={{ fontSize: 24 }}>🌐</span>
          <div style={{ flex: 1 }}><p style={{ color: C.text, fontWeight: 700, fontSize: 16 }}>AA Meeting Finder</p><p style={{ color: C.muted, fontSize: 13 }}>aa.org — search by location</p></div>
          <ChevronRight className="w-4 h-4" style={{ color: C.muted }} />
        </a>
        <a href="https://www.na.org/meetingsearch/" target="_blank" rel="noreferrer" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 16, background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, padding: "18px 20px" }}>
          <span style={{ fontSize: 24 }}>🌐</span>
          <div style={{ flex: 1 }}><p style={{ color: C.text, fontWeight: 700, fontSize: 16 }}>NA Meeting Finder</p><p style={{ color: C.muted, fontSize: 13 }}>na.org — search by location</p></div>
          <ChevronRight className="w-4 h-4" style={{ color: C.muted }} />
        </a>
      </div>
    </div>
  );
}

function NeedFoodShelter({ onBack, ctx }) {
  const needs  = ctx.profile?.support_needs || [];
  const reason = ctx.profile?.goals?.[0] || "";
  const showReentry = reason === "coming_home" || needs.includes("Benefits / ID Help");
  const foodFirst   = needs.includes("Food") && !needs.includes("Housing");

  const items = [
    !foodFirst && { key: "shelter",  el: <LinkBtn key="shelter"  emoji="🏠"  label="Emergency shelter"       sub="Find a safe place to stay"          href="FindHelpNow?category=Emergency Shelter"   bg={C.blue}    pinned={needs.includes("Housing")} /> },
    { key: "food",    el: <LinkBtn key="food"    emoji="🍽️"  label="Food right now"              sub="Food banks & free meals nearby"     href="FindHelpNow?category=Food Pantry"         bg="#16803D"   pinned={foodFirst} /> },
    foodFirst && { key: "shelter2", el: <LinkBtn key="shelter2" emoji="🏠"  label="Emergency shelter"       sub="Find a safe place to stay"          href="FindHelpNow?category=Emergency Shelter"   bg={C.blue}    /> },
    { key: "housing", el: <LinkBtn key="housing" emoji="🏘️"  label="Transitional housing"        sub="Longer-term stable housing"         href="FindHelpNow?category=Transitional Housing" bg="#7C3AED"   /> },
    { key: "transit", el: <LinkBtn key="transit" emoji="🚌"  label="Transportation help"         sub="Get to where you need to go"        href="FindHelpNow?category=Transportation"       bg={C.orange}  pinned={needs.includes("Transportation")} /> },
    showReentry && { key: "reentry", el: <LinkBtn key="reentry" emoji="🔑"  label="Benefits & ID help"        sub="Government programs, reentry resources" href="FindHelpNow?category=Reentry Services"  bg="#0F766E" pinned /> },
  ].filter(Boolean);

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
          {items.map(i => i.el)}
        </div>
        <SectionLabel text="Emergency line" />
        <a href="tel:211" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 16, background: C.redSoft, border: `1px solid #FCA5A5`, borderRadius: 16, padding: "18px 20px" }}>
          <Phone className="w-6 h-6" style={{ color: C.red, flexShrink: 0 }} />
          <div><p style={{ color: C.red, fontWeight: 700, fontSize: 16 }}>Call 211</p><p style={{ color: "#B91C1C", fontSize: 13 }}>Local shelter, food & social services</p></div>
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
            <div><p style={{ color: C.white, fontWeight: 800, fontSize: 20 }}>Call 911</p><p style={{ color: "rgba(255,255,255,0.85)", fontSize: 14 }}>Emergency services</p></div>
          </a>
          <a href="tel:988" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 16, background: C.white, border: `2px solid ${C.red}`, borderRadius: 18, padding: "20px 22px" }}>
            <Phone className="w-6 h-6" style={{ color: C.red, flexShrink: 0 }} />
            <div><p style={{ color: C.red, fontWeight: 700, fontSize: 17 }}>Call 988 — Crisis Line</p><p style={{ color: "#B91C1C", fontSize: 13 }}>Free, confidential, 24/7</p></div>
          </a>
          <a href="sms:741741" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 16, background: "#EFF6FF", border: `1px solid #BFDBFE`, borderRadius: 18, padding: "20px 22px" }}>
            <Phone className="w-6 h-6" style={{ color: "#2563EB", flexShrink: 0 }} />
            <div><p style={{ color: "#2563EB", fontWeight: 700, fontSize: 17 }}>Text HOME to 741741</p><p style={{ color: "#1D4ED8", fontSize: 13 }}>Crisis Text Line</p></div>
          </a>
          <LinkBtn emoji="💬" label="Message my support team" sub="Your counselor or case contact" href="ParticipantMessages" bg="#5A5A5A" />
        </div>
      </div>
    </div>
  );
}

function GetBackOnTrack({ onBack, ctx }) {
  const needs         = ctx.profile?.support_needs || [];
  const reason        = ctx.profile?.goals?.[0] || "";
  const hasCheckedIn  = ctx.hasCheckedInToday;
  const showPlan      = reason === "getting_back" || needs.includes("Daily Accountability");

  const items = [
    !hasCheckedIn && { key: "checkin",  el: <LinkBtn key="checkin"  emoji="✅"  label="Complete today's check-in"     sub="Takes 30 seconds. Gets you back in the habit." href="DailyCheckIn"        bg={C.blue}    pinned /> },
    { key: "msg",       el: <LinkBtn key="msg"       emoji="💬"  label="Message my support team"       sub="Let them know you're working on it."           href="ParticipantMessages"  bg="#7C3AED"   pinned={needs.includes("Someone to Talk To")} /> },
    showPlan && { key: "plan", el: <LinkBtn key="plan"     emoji="📋"  label="See my plan"                  sub="Pick one goal to focus on today."              href="ForwardPlan"         bg="#16803D"   pinned /> },
    { key: "meeting",   el: <LinkBtn key="meeting"   emoji="🤝"  label="Find a meeting"                sub="Show up. That's the whole job."                href="Meetings"             bg={C.orange}  /> },
    !showPlan && { key: "plan2", el: <LinkBtn key="plan2"    emoji="📋"  label="See my plan"                  sub="Pick one goal to focus on today."              href="ForwardPlan"         bg="#16803D"   /> },
  ].filter(Boolean);

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
          {items.map(i => i.el)}
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

// ─── Mode config ──────────────────────────────────────────────────────────
const MODE_META = {
  craving: { emoji: "⚡", label: "I feel like using",                 color: "#1D4ED8", bg: "#EFF6FF",  textColor: "#1D4ED8" },
  talk:    { emoji: "💬", label: "I need someone to talk to",         color: "#7C3AED", bg: "#F5F3FF",  textColor: "#7C3AED" },
  meeting: { emoji: "🤝", label: "I need a meeting right now",        color: "#16803D", bg: "#F0FDF4",  textColor: "#16803D" },
  food:    { emoji: "🏠", label: "I need food or shelter",            color: C.orange,  bg: C.orangeSoft, textColor: C.orange  },
  unsafe:  { emoji: "🆘", label: "I feel unsafe",                     color: C.red,     bg: C.redSoft,  textColor: C.red     },
  reset:   { emoji: "⬆️", label: "I need help getting back on track", color: "#0F766E", bg: "#F0FDFA",  textColor: "#0F766E" },
};

// ─── Main component ───────────────────────────────────────────────────────
export default function UrgentHelp() {
  const navigate = useNavigate();
  const [mode, setMode] = useState(null);

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: profiles = [] } = useQuery({
    queryKey: ["member-profile-urgent", user?.email],
    queryFn: () => base44.entities.MemberProfile.filter({ created_by: user.email }),
    enabled: !!user,
  });

  const { data: recentCheckIns = [] } = useQuery({
    queryKey: ["checkins-urgent", user?.email],
    queryFn: () => base44.entities.DailyCheckIn.filter({ participant_email: user.email }, "-check_in_date", 3),
    enabled: !!user,
  });

  const profile        = profiles[0] || null;
  const recentCheckIn  = recentCheckIns[0] || null;
  const today          = new Date().toISOString().split("T")[0];
  const hasCheckedInToday = recentCheckIns.some(c => c.check_in_date === today);

  const ctx = { profile, recentCheckIn, hasCheckedInToday };

  // Sorted mode keys (most relevant first)
  const sortedKeys  = scoreAndSortModes(profile, recentCheckIn);
  const personalized = hasContext(profile, recentCheckIn);

  // Split: top 2 "suggested" + rest
  const [top1, top2, ...rest] = sortedKeys;
  const suggestedKeys = personalized ? [top1, top2] : [];
  const otherKeys     = personalized ? rest : sortedKeys;

  // Risk banner: show if mood ≤ 2 OR craving ≥ 4 OR needs_help
  const showRiskBanner =
    (recentCheckIn?.mood_rating <= 2) ||
    (recentCheckIn?.craving_level >= 4) ||
    (recentCheckIn?.needs_help === true) ||
    (profile?.challenges?.[0] === "risky_situation") ||
    (profile?.challenges?.[0] === "need_support_today");

  const SubScreen = ({ modeKey }) => {
    if (modeKey === "craving") return <FeelLikeUsing  onBack={() => setMode(null)} ctx={ctx} />;
    if (modeKey === "talk")    return <NeedToTalk      onBack={() => setMode(null)} ctx={ctx} />;
    if (modeKey === "meeting") return <NeedMeeting     onBack={() => setMode(null)} ctx={ctx} />;
    if (modeKey === "food")    return <NeedFoodShelter onBack={() => setMode(null)} ctx={ctx} />;
    if (modeKey === "unsafe")  return <FeelUnsafe      onBack={() => setMode(null)} />;
    if (modeKey === "reset")   return <GetBackOnTrack  onBack={() => setMode(null)} ctx={ctx} />;
    return null;
  };

  if (mode) return <SubScreen modeKey={mode} />;

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

        {/* Risk banner */}
        {showRiskBanner && (
          <div style={{ background: C.redSoft, border: `1px solid #FCA5A5`, borderRadius: 14, padding: "14px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 20 }}>⚠️</span>
            <div>
              <p style={{ color: C.red, fontWeight: 700, fontSize: 14, marginBottom: 2 }}>It sounds like things are hard right now.</p>
              <p style={{ color: "#B91C1C", fontSize: 13 }}>You're in the right place. Call <a href="tel:988" style={{ color: "#B91C1C", fontWeight: 700 }}>988</a> anytime.</p>
            </div>
          </div>
        )}

        {/* Personalized suggestions */}
        {suggestedKeys.length > 0 && (
          <>
            <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 10 }}>
              Suggested for you
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {suggestedKeys.map(key => {
                const m = MODE_META[key];
                return (
                  <button key={key} onClick={() => setMode(key)} style={{ display: "flex", alignItems: "center", gap: 18, background: m.bg, border: `2px solid ${m.color}33`, borderRadius: 18, padding: "20px 22px", cursor: "pointer", textAlign: "left", width: "100%", position: "relative" }}>
                    <div style={{ position: "absolute", top: -8, right: 14, background: "#FBBF24", borderRadius: 8, padding: "2px 8px", fontSize: 10, fontWeight: 700, color: "#1E1E1E" }}>For you</div>
                    <span style={{ fontSize: 30, flexShrink: 0, lineHeight: 1 }}>{m.emoji}</span>
                    <p style={{ color: m.textColor, fontWeight: 700, fontSize: 17, flex: 1, lineHeight: 1.3 }}>{m.label}</p>
                    <ChevronRight className="w-5 h-5" style={{ color: `${m.textColor}80`, flexShrink: 0 }} />
                  </button>
                );
              })}
            </div>
            <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 10 }}>
              Other options
            </p>
          </>
        )}

        {/* Rest of options */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {otherKeys.map(key => {
            const m = MODE_META[key];
            return (
              <button key={key} onClick={() => setMode(key)} style={{ display: "flex", alignItems: "center", gap: 18, background: m.bg, border: `1.5px solid ${m.color}22`, borderRadius: 18, padding: "20px 22px", cursor: "pointer", textAlign: "left", width: "100%" }}>
                <span style={{ fontSize: 30, flexShrink: 0, lineHeight: 1 }}>{m.emoji}</span>
                <p style={{ color: m.textColor, fontWeight: 700, fontSize: 17, flex: 1, lineHeight: 1.3 }}>{m.label}</p>
                <ChevronRight className="w-5 h-5" style={{ color: `${m.textColor}80`, flexShrink: 0 }} />
              </button>
            );
          })}
        </div>

        <CrisisStrip />
      </div>
    </div>
  );
}