import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/pages/utils";
import { X, Phone, MapPin, BookOpen, MessageCircle, PenLine } from "lucide-react";

const RESOURCES = [
  { icon: <Phone style={{ width: 16, height: 16 }} />,       label: "Call a Mentor",          sub: "Reach out right now",             href: "ParticipantMessages", color: "#3ECFBF" },
  { icon: <span style={{ fontSize: 15 }}>🫁</span>,           label: "Grounding Exercise",     sub: "3-minute breathing reset",        href: "CravingControlCenter", color: "#A78BFA" },
  { icon: <MapPin style={{ width: 16, height: 16 }} />,       label: "Find a Meeting",         sub: "AA / NA / SMART near you",        href: "Meetings",             color: "#10B981" },
  { icon: <PenLine style={{ width: 16, height: 16 }} />,      label: "Journal Now",            sub: "Write it out privately",          href: "Journal",              color: "#C9A96E" },
  { icon: <BookOpen style={{ width: 16, height: 16 }} />,     label: "Recovery Resources",     sub: "Articles & coping tools",        href: "RecoveryHub",          color: "#60A5FA" },
];

export default function CrisisSupportPanel({ onClose, post }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 60,
        background: "rgba(0,0,0,0.7)", display: "flex",
        alignItems: "flex-end", justifyContent: "center",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 520,
          background: "linear-gradient(170deg,#1A0A0A,#0F1220)",
          border: "1px solid rgba(251,146,60,0.3)",
          borderRadius: "24px 24px 0 0",
          padding: "24px 20px 40px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#FB923C", textTransform: "uppercase", letterSpacing: ".09em" }}>
              ⚡ Support Resources
            </p>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: "#fff", marginTop: 4 }}>You're not alone in this.</h3>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)" }}>
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, marginBottom: 20 }}>
          It takes real strength to reach out. Here are tools that can help right now:
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
          {RESOURCES.map(r => (
            <Link key={r.label} to={createPageUrl(r.href)} onClick={onClose} style={{ textDecoration: "none" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 14, padding: "13px 16px",
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)",
                borderRadius: 14,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12, background: `${r.color}20`,
                  color: r.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  {r.icon}
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{r.label}</p>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>{r.sub}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Crisis hotlines */}
        <div style={{ padding: "14px 16px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 14 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#F87171", marginBottom: 10, textTransform: "uppercase", letterSpacing: ".07em" }}>
            🚨 Crisis Lines — Always Available
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <a href="tel:988" style={{ flex: 1, textDecoration: "none", textAlign: "center", padding: "10px 8px",
              background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10 }}>
              <p style={{ fontSize: 15, fontWeight: 900, color: "#F87171" }}>988</p>
              <p style={{ fontSize: 10, color: "#FCA5A5", marginTop: 2 }}>Crisis Line</p>
            </a>
            <a href="tel:18006624357" style={{ flex: 1, textDecoration: "none", textAlign: "center", padding: "10px 8px",
              background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10 }}>
              <p style={{ fontSize: 12, fontWeight: 900, color: "#F87171" }}>1-800-662-HELP</p>
              <p style={{ fontSize: 10, color: "#FCA5A5", marginTop: 2 }}>SAMHSA</p>
            </a>
            <a href="sms:741741" style={{ flex: 1, textDecoration: "none", textAlign: "center", padding: "10px 8px",
              background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10 }}>
              <p style={{ fontSize: 13, fontWeight: 900, color: "#F87171" }}>Text HOME</p>
              <p style={{ fontSize: 10, color: "#FCA5A5", marginTop: 2 }}>to 741741</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}