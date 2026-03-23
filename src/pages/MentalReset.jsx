import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import QuickResetModal from "@/components/mentalreset/QuickResetModal";
import BreathingExercise from "@/components/mentalreset/BreathingExercise";
import SoundLibrary from "@/components/mentalreset/SoundLibrary";
import MeditationLibrary from "@/components/mentalreset/MeditationLibrary";
import MentalHealthReads from "@/components/mentalreset/MentalHealthReads";
import { Wind, Headphones, Brain, BookOpen, Zap } from "lucide-react";

const TABS = [
  { id: "breathe",    label: "Breathe",    icon: Wind },
  { id: "sounds",     label: "Sounds",     icon: Headphones },
  { id: "meditate",   label: "Meditate",   icon: Brain },
  { id: "reads",      label: "Reads",      icon: BookOpen },
];

export default function MentalReset() {
  const [activeTab, setActiveTab] = useState("breathe");
  const [showReset, setShowReset] = useState(false);

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: checkIns = [] } = useQuery({
    queryKey: ["mental-reset-checkins", user?.email],
    queryFn: () => base44.entities.DailyCheckIn.filter(
      { participant_email: user.email }, "-check_in_date", 3
    ),
    enabled: !!user?.email,
  });

  const latestMood = checkIns[0]?.mood_rating ?? null;
  const latestCraving = checkIns[0]?.craving_intensity ?? null;

  // Contextual suggestion
  const suggestion = (() => {
    if (latestMood !== null && latestMood <= 2) return { text: "Mood is low — try a breathing reset or guided meditation.", tab: "breathe", color: "#A78BFA" };
    if (latestCraving !== null && latestCraving >= 7) return { text: "Cravings are high — try sounds or urge surfing meditation.", tab: "meditate", color: "#F97316" };
    if (latestMood !== null && latestMood <= 3) return { text: "Feeling stressed? Let calming sounds help.", tab: "sounds", color: "#3ECFBF" };
    return null;
  })();

  return (
    <div style={{ background: "linear-gradient(170deg,#060A18 0%,#0A0F20 60%,#07091A 100%)", minHeight: "100vh", paddingBottom: 100 }}>
      <style>{`
        @keyframes pulse-ring { 0%,100%{transform:scale(1);opacity:.6} 50%{transform:scale(1.15);opacity:1} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .mr-fade { animation: fadeUp 0.4s ease both; }
      `}</style>

      {/* ── Header ── */}
      <div style={{
        background: "linear-gradient(150deg,#0D1530 0%,#080D1E 100%)",
        padding: "56px 24px 28px", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -80, right: -40, width: 300, height: 300, borderRadius: "50%",
          background: "radial-gradient(circle,rgba(139,92,246,0.12) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -40, left: -40, width: 200, height: 200, borderRadius: "50%",
          background: "radial-gradient(circle,rgba(62,207,191,0.07) 0%,transparent 70%)", pointerEvents: "none" }} />

        <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(139,92,246,0.9)", textTransform: "uppercase",
          letterSpacing: ".12em", marginBottom: 6 }}>Mental Reset</p>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: "#fff", lineHeight: 1.2, marginBottom: 6 }}>
          Your Reset Space
        </h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginBottom: 22, lineHeight: 1.5 }}>
          Tools for when you need to breathe, calm down, and start over.
        </p>

        {/* Suggestion banner */}
        {suggestion && (
          <div style={{
            background: `rgba(${suggestion.color === "#A78BFA" ? "139,92,246" : suggestion.color === "#F97316" ? "249,115,22" : "62,207,191"},0.1)`,
            border: `1px solid ${suggestion.color}30`,
            borderRadius: 14, padding: "12px 16px", marginBottom: 20,
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <span style={{ fontSize: 18 }}>💡</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.4 }}>{suggestion.text}</p>
            </div>
            <button onClick={() => setActiveTab(suggestion.tab)} style={{
              fontSize: 11, fontWeight: 700, color: suggestion.color, background: "none",
              border: `1px solid ${suggestion.color}50`, borderRadius: 8, padding: "5px 10px", cursor: "pointer",
            }}>Go →</button>
          </div>
        )}

        {/* Emergency Reset CTA */}
        <button
          onClick={() => setShowReset(true)}
          style={{
            width: "100%", padding: "18px", borderRadius: 20,
            background: "linear-gradient(135deg,#7C3AED,#6D28D9)",
            border: "none", cursor: "pointer", position: "relative", overflow: "hidden",
            boxShadow: "0 8px 32px rgba(124,58,237,0.4)",
          }}
        >
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 30% 50%,rgba(255,255,255,0.08),transparent 60%)" }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, position: "relative" }}>
            <div style={{ animation: "pulse-ring 2s ease-in-out infinite" }}>
              <Zap style={{ width: 22, height: 22, color: "#fff" }} />
            </div>
            <div style={{ textAlign: "left" }}>
              <p style={{ fontSize: 17, fontWeight: 900, color: "#fff", lineHeight: 1 }}>I Need a Reset</p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 3 }}>Tap for instant calm — guided breathing starts now</p>
            </div>
          </div>
        </button>
      </div>

      {/* ── Tab bar ── */}
      <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingLeft: 8, paddingRight: 8, background: "rgba(6,10,24,0.8)", position: "sticky", top: 0, zIndex: 20 }}>
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button key={id} onClick={() => setActiveTab(id)} style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              padding: "12px 4px", background: "none", border: "none", cursor: "pointer",
              borderBottom: active ? "2px solid #8B5CF6" : "2px solid transparent",
              color: active ? "#A78BFA" : "rgba(255,255,255,0.3)",
              fontSize: 10, fontWeight: active ? 700 : 500, letterSpacing: ".04em",
              transition: "all 0.15s ease",
            }}>
              <Icon style={{ width: 16, height: 16 }} strokeWidth={active ? 2 : 1.5} />
              {label}
            </button>
          );
        })}
      </div>

      {/* ── Tab content ── */}
      <div className="mr-fade" key={activeTab} style={{ padding: "20px 16px" }}>
        {activeTab === "breathe"  && <BreathingExercise />}
        {activeTab === "sounds"   && <SoundLibrary />}
        {activeTab === "meditate" && <MeditationLibrary />}
        {activeTab === "reads"    && <MentalHealthReads />}
      </div>

      {showReset && <QuickResetModal onClose={() => setShowReset(false)} />}
    </div>
  );
}