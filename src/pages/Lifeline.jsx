import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Phone, MessageCircle, ChevronLeft, AlertTriangle, Heart, Shield, X } from "lucide-react";
import { createPageUrl } from "./utils";

const HOTLINES = [
  { label: "988 Suicide & Crisis Lifeline", sub: "Call or text — 24/7, free, confidential", href: "tel:988",    color: "#EF4444", emoji: "🆘" },
  { label: "SAMHSA Helpline",               sub: "Substance use treatment referrals",       href: "tel:18006624357", color: "#F87171", emoji: "📞" },
  { label: "Crisis Text Line",              sub: "Text HOME to 741741",                    href: "sms:741741&body=HOME", color: "#F97316", emoji: "💬" },
  { label: "AA 24-Hour Helpline (NJ)",      sub: "Talk to a sober member right now",       href: "tel:18004940100", color: "#FBBF24", emoji: "☎️" },
];

const ROLE_COLORS = {
  sponsor:         "#2DD4BF",
  counselor:       "#818CF8",
  trusted_contact: "#34D399",
  family:          "#F472B6",
  other:           "#94A3B8",
};

const ROLE_LABELS = {
  sponsor:         "Sponsor",
  counselor:       "Counselor",
  trusted_contact: "Trusted Contact",
  family:          "Family",
  other:           "Support",
};

function ContactCard({ contact, crisis }) {
  const color = ROLE_COLORS[contact.role] || ROLE_COLORS.other;
  const label = ROLE_LABELS[contact.role] || "Support";
  return (
    <div style={{ borderRadius: 18, padding: "16px 18px",
      background: crisis ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.04)",
      border: `1.5px solid ${color}30`, marginBottom: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <div style={{ width: 42, height: 42, borderRadius: "50%", flexShrink: 0,
          background: color + "18", display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, fontWeight: 800, color }}>
          {contact.name?.[0]?.toUpperCase() || "?"}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 15, fontWeight: 800, color: "#fff", lineHeight: 1.1 }}>{contact.name}</p>
          <span style={{ fontSize: 10, fontWeight: 700, color, background: color + "15",
            padding: "2px 8px", borderRadius: 10 }}>{label}</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {contact.phone && (
          <a href={`tel:${contact.phone.replace(/\D/g,"")}`} style={{ flex: 1, textDecoration: "none" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              padding: "12px", borderRadius: 12,
              background: `linear-gradient(135deg,${color},${color}CC)`,
              boxShadow: `0 6px 20px ${color}30` }}>
              <Phone style={{ color: "#fff", width: 16, height: 16 }} />
              <span style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>Call</span>
            </div>
          </a>
        )}
        <a href={`sms:${contact.phone?.replace(/\D/g,"") || ""}`} style={{ flex: 1, textDecoration: "none" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            padding: "12px", borderRadius: 12,
            background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
            <MessageCircle style={{ color: "rgba(255,255,255,0.6)", width: 16, height: 16 }} />
            <span style={{ fontSize: 13, fontWeight: 800, color: "rgba(255,255,255,0.6)" }}>Text</span>
          </div>
        </a>
      </div>
    </div>
  );
}

export default function Lifeline() {
  const [crisisMode, setCrisisMode] = useState(false);

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: contacts = [] } = useQuery({
    queryKey: ["inner-circle-contacts", user?.email],
    queryFn: () => base44.entities.InnerCircleContact.filter({ user_email: user.email }, "sort_order", 20),
    enabled: !!user?.email,
  });

  // In crisis mode: fullscreen, stripped, urgent
  if (crisisMode) return (
    <div style={{ background: "#0A0008", minHeight: "100vh", paddingBottom: 40,
      display: "flex", flexDirection: "column" }}>
      <style>{`@keyframes pulse-red{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0.4)}50%{box-shadow:0 0 0 16px rgba(239,68,68,0)}}`}</style>
      <div style={{ maxWidth: 480, margin: "0 auto", width: "100%", padding: "60px 20px 20px" }}>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#EF4444",
              animation: "pulse-red 1.5s ease-in-out infinite" }} />
            <p style={{ fontSize: 13, fontWeight: 800, color: "#EF4444", letterSpacing: ".06em" }}>CRISIS MODE</p>
          </div>
          <button onClick={() => setCrisisMode(false)}
            style={{ background: "rgba(255,255,255,0.07)", border: "none", borderRadius: "50%",
              width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X style={{ color: "rgba(255,255,255,0.5)", width: 14, height: 14 }} />
          </button>
        </div>

        <p style={{ fontSize: 22, fontWeight: 900, color: "#fff", lineHeight: 1.3, marginBottom: 6 }}>
          You're not alone.
        </p>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", marginBottom: 28, lineHeight: 1.6 }}>
          Reach out right now. One of these options can help.
        </p>

        {/* 988 — biggest button */}
        <a href="tel:988" style={{ textDecoration: "none", display: "block", marginBottom: 14 }}>
          <div style={{ borderRadius: 20, padding: "22px 24px",
            background: "linear-gradient(135deg,#EF4444,#DC2626)",
            boxShadow: "0 8px 32px rgba(239,68,68,0.4)",
            display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(255,255,255,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Phone style={{ color: "#fff", width: 24, height: 24 }} />
            </div>
            <div>
              <p style={{ fontSize: 20, fontWeight: 900, color: "#fff" }}>Call 988</p>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.75)" }}>Crisis Lifeline · Free · 24/7</p>
            </div>
          </div>
        </a>

        <a href="sms:741741&body=HOME" style={{ textDecoration: "none", display: "block", marginBottom: 24 }}>
          <div style={{ borderRadius: 18, padding: "16px 20px",
            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
            display: "flex", alignItems: "center", gap: 14 }}>
            <MessageCircle style={{ color: "#F87171", width: 22, height: 22, flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>Text HOME to 741741</p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Crisis Text Line</p>
            </div>
          </div>
        </a>

        {contacts.length > 0 && (
          <>
            <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.3)",
              textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 12 }}>
              Your Inner Circle
            </p>
            {contacts.slice(0, 3).map(c => <ContactCard key={c.id} contact={c} crisis />)}
          </>
        )}

        <Link to={createPageUrl("ResetButton")} style={{ textDecoration: "none", display: "block", marginTop: 8 }}>
          <div style={{ borderRadius: 14, padding: "14px 18px", textAlign: "center",
            background: "rgba(45,212,191,0.08)", border: "1px solid rgba(45,212,191,0.2)" }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#2DD4BF" }}>🧘 Open Reset Button for breathing & calm</p>
          </div>
        </Link>
      </div>
    </div>
  );

  return (
    <div style={{ background: "linear-gradient(170deg,#07090F 0%,#0B0A14 100%)", minHeight: "100vh", paddingBottom: 100 }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ background: "linear-gradient(150deg,#100A0A 0%,#0A0808 100%)",
          padding: "60px 24px 28px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -80, right: -60, width: 260, height: 260, borderRadius: "50%",
            background: "radial-gradient(circle,rgba(239,68,68,0.07) 0%,transparent 70%)", pointerEvents: "none" }} />

          <Link to={createPageUrl("MyFoundation")} style={{ display: "inline-flex", alignItems: "center", gap: 6,
            color: "rgba(255,255,255,0.4)", fontSize: 12, marginBottom: 16, textDecoration: "none" }}>
            <ChevronLeft style={{ width: 15, height: 15 }} /> Back
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <Heart style={{ color: "#F87171", width: 16, height: 16 }} />
            <p style={{ fontSize: 12, fontWeight: 700, color: "#F87171", textTransform: "uppercase",
              letterSpacing: ".1em" }}>Lifeline</p>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "#fff", lineHeight: 1.2, marginBottom: 6 }}>
            You don't have to<br />face this alone.
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: 1.6, marginBottom: 20 }}>
            Reach out in one tap — to your circle, a hotline, or both.
          </p>

          {/* Crisis Mode button */}
          <button onClick={() => setCrisisMode(true)}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 18px",
              borderRadius: 16, border: "none", cursor: "pointer", width: "100%",
              background: "linear-gradient(135deg,rgba(239,68,68,0.18),rgba(239,68,68,0.08))",
              border: "1.5px solid rgba(239,68,68,0.35)" }}>
            <AlertTriangle style={{ color: "#F87171", width: 18, height: 18, flexShrink: 0 }} />
            <div style={{ flex: 1, textAlign: "left" }}>
              <p style={{ fontSize: 14, fontWeight: 900, color: "#F87171", lineHeight: 1.1 }}>I'm in crisis right now</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>Opens focused support view</p>
            </div>
          </button>
        </div>

        <div style={{ padding: "20px 16px" }}>

          {/* Hotlines */}
          <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.3)",
            textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 12 }}>
            🆘 Emergency Hotlines
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
            {HOTLINES.map(h => (
              <a key={h.href} href={h.href} style={{ textDecoration: "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
                  borderRadius: 16, background: "rgba(255,255,255,0.04)",
                  border: `1.5px solid ${h.color}25`, transition: "all 0.15s ease" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                    background: h.color + "15", display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: 18 }}>
                    {h.emoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginBottom: 2 }}>{h.label}</p>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{h.sub}</p>
                  </div>
                  <Phone style={{ color: h.color, width: 16, height: 16, flexShrink: 0 }} />
                </div>
              </a>
            ))}
          </div>

          {/* Inner Circle */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.3)",
              textTransform: "uppercase", letterSpacing: ".08em" }}>
              💙 My Inner Circle
            </p>
            <Link to={createPageUrl("InnerCircle")} style={{ fontSize: 11, color: "#2DD4BF",
              textDecoration: "none", fontWeight: 700 }}>
              Manage →
            </Link>
          </div>

          {contacts.length === 0 ? (
            <div style={{ borderRadius: 18, padding: "24px 20px", textAlign: "center",
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
              marginBottom: 24 }}>
              <Shield style={{ color: "rgba(255,255,255,0.15)", width: 32, height: 32, margin: "0 auto 10px" }} />
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>
                Your Inner Circle is empty.<br />Add a sponsor, counselor, or trusted friend.
              </p>
              <Link to={createPageUrl("InnerCircle")} style={{ textDecoration: "none" }}>
                <span style={{ display: "inline-block", marginTop: 12, fontSize: 12, fontWeight: 700,
                  color: "#2DD4BF", background: "rgba(45,212,191,0.1)", padding: "8px 16px",
                  borderRadius: 12, border: "1px solid rgba(45,212,191,0.25)" }}>
                  Add Someone →
                </span>
              </Link>
            </div>
          ) : (
            <div style={{ marginBottom: 24 }}>
              {contacts.map(c => <ContactCard key={c.id} contact={c} />)}
            </div>
          )}

          {/* Reset button link */}
          <Link to={createPageUrl("ResetButton")} style={{ textDecoration: "none", display: "block" }}>
            <div style={{ borderRadius: 16, padding: "15px 18px",
              background: "rgba(45,212,191,0.07)", border: "1px solid rgba(45,212,191,0.18)",
              display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>🧘</span>
              <div>
                <p style={{ fontSize: 13, fontWeight: 800, color: "#2DD4BF" }}>Need to calm down first?</p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Open the Reset Button — breathing, binaural beats & more</p>
              </div>
            </div>
          </Link>

        </div>
      </div>
    </div>
  );
}