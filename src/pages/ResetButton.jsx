import React, { useState } from "react";
import { Wind, Headphones, Timer, MessageCircle, X, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import GuidedBreathing from "@/components/resetbutton/GuidedBreathing";
import BinauralPlayer from "@/components/resetbutton/BinauralPlayer";
import UrgeTimer from "@/components/resetbutton/UrgeTimer";

const CALM_MESSAGES = [
  { emoji: "🌊", text: "You reached for help instead of the habit. That's everything." },
  { emoji: "🌿", text: "Recovery isn't linear. Reaching for a reset is part of the path." },
  { emoji: "🫁", text: "Your nervous system just needs a signal that you're safe right now." },
  { emoji: "💙", text: "The urge will pass. It always does. You've proven that before." },
  { emoji: "🌅", text: "One breath at a time. That's all that's needed right now." },
];

const TABS = [
  { id: "breathe", label: "Breathe",  icon: Wind,          color: "#2DD4BF" },
  { id: "beats",   label: "Binaural", icon: Headphones,    color: "#8B5CF6" },
  { id: "timer",   label: "Urge Timer", icon: Timer,       color: "#F59E0B" },
  { id: "words",   label: "Words",    icon: MessageCircle, color: "#F472B6" },
];

export default function ResetButton() {
  const [tab, setTab] = useState("breathe");
  const msgIdx = new Date().getMinutes() % CALM_MESSAGES.length;

  return (
    <div style={{ background: "linear-gradient(170deg,#06081A 0%,#09091F 60%,#060A14 100%)",
      minHeight: "100vh", paddingBottom: 40 }}>
      <style>{`
        @keyframes pulse-soft { 0%,100%{opacity:.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.04)} }
        .pulse-soft { animation: pulse-soft 3s ease-in-out infinite; }
      `}</style>

      <div style={{ maxWidth: 480, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ padding: "56px 24px 28px", position: "relative", overflow: "hidden",
          background: "linear-gradient(160deg,#0D0F28,#07091A)" }}>
          <div style={{ position: "absolute", top: -80, left: "50%", transform: "translateX(-50%)",
            width: 340, height: 340, borderRadius: "50%",
            background: "radial-gradient(circle,rgba(45,212,191,0.07) 0%,transparent 65%)", pointerEvents: "none" }} />

          <Link to={createPageUrl("Home")} style={{ display: "inline-flex", alignItems: "center", gap: 6,
            color: "rgba(255,255,255,0.4)", fontSize: 12, marginBottom: 20, textDecoration: "none" }}>
            <ChevronLeft style={{ width: 15, height: 15 }} /> Back
          </Link>

          <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
            {/* Big reset icon */}
            <div className="pulse-soft" style={{ width: 72, height: 72, borderRadius: "50%", margin: "0 auto 16px",
              background: "linear-gradient(135deg,rgba(45,212,191,0.2),rgba(45,212,191,0.05))",
              border: "2px solid rgba(45,212,191,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>
              🧘
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: "#fff", marginBottom: 6, lineHeight: 1.2 }}>
              Reset Button
            </h1>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.6, maxWidth: 300, margin: "0 auto" }}>
              You reached for this. That's already the right move.<br />
              Take whatever you need.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", padding: "0 16px", gap: 6, marginBottom: 20, marginTop: 16 }}>
          {TABS.map(({ id, label, icon: Icon, color }) => {
            const active = tab === id;
            return (
              <button key={id} onClick={() => setTab(id)}
                style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                  padding: "10px 4px", borderRadius: 14, border: "none", cursor: "pointer",
                  background: active ? color + "18" : "rgba(255,255,255,0.04)",
                  border: `1.5px solid ${active ? color + "50" : "rgba(255,255,255,0.07)"}`,
                  transition: "all 0.15s ease" }}>
                <Icon style={{ width: 16, height: 16, color: active ? color : "rgba(255,255,255,0.3)" }} strokeWidth={active ? 2 : 1.5} />
                <span style={{ fontSize: 9, fontWeight: 700,
                  color: active ? color : "rgba(255,255,255,0.3)", letterSpacing: ".04em" }}>{label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div style={{ padding: "4px 16px 24px" }}>

          {tab === "breathe" && (
            <div style={{ borderRadius: 20, padding: "22px 20px",
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(45,212,191,0.12)" }}>
              <p style={{ fontSize: 12, fontWeight: 800, color: "#2DD4BF", textTransform: "uppercase",
                letterSpacing: ".08em", marginBottom: 18 }}>🫁 Guided Breathing</p>
              <GuidedBreathing />
            </div>
          )}

          {tab === "beats" && (
            <div style={{ borderRadius: 20, padding: "22px 20px",
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(139,92,246,0.12)" }}>
              <p style={{ fontSize: 12, fontWeight: 800, color: "#8B5CF6", textTransform: "uppercase",
                letterSpacing: ".08em", marginBottom: 18 }}>🎧 Binaural Beats</p>
              <BinauralPlayer />
            </div>
          )}

          {tab === "timer" && (
            <div style={{ borderRadius: 20, padding: "22px 20px",
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(245,158,11,0.12)" }}>
              <p style={{ fontSize: 12, fontWeight: 800, color: "#F59E0B", textTransform: "uppercase",
                letterSpacing: ".08em", marginBottom: 6 }}>⏱ Urge Surfing Timer</p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 20, lineHeight: 1.5 }}>
                Urges peak and then fade — usually within 15 minutes. Set a timer and ride it out.
              </p>
              <UrgeTimer />
            </div>
          )}

          {tab === "words" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {CALM_MESSAGES.map((m, i) => (
                <div key={i} style={{ borderRadius: 16, padding: "18px 20px",
                  background: i === msgIdx ? "rgba(45,212,191,0.07)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${i === msgIdx ? "rgba(45,212,191,0.2)" : "rgba(255,255,255,0.07)"}` }}>
                  <p style={{ fontSize: 22, marginBottom: 8 }}>{m.emoji}</p>
                  <p style={{ fontSize: 15, color: i === msgIdx ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.5)",
                    lineHeight: 1.7, fontStyle: "italic" }}>"{m.text}"</p>
                </div>
              ))}

              <a href="tel:988" style={{ textDecoration: "none", marginTop: 4 }}>
                <div style={{ borderRadius: 16, padding: "16px 20px", textAlign: "center",
                  background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.18)" }}>
                  <p style={{ fontSize: 13, fontWeight: 800, color: "#F87171" }}>📞 Crisis support: Call 988</p>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 3 }}>Free · Confidential · 24/7</p>
                </div>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}