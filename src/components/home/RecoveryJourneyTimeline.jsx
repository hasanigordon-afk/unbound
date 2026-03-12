import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Share2, Check, Lock, Trophy, Flame, Star, Zap } from "lucide-react";

const MILESTONES = [
  { days: 1,  label: "Day 1",   sub: "First step taken",    icon: "🌅", color: "#94A3B8" },
  { days: 7,  label: "7 Days",  sub: "One week strong",     icon: "🔥", color: "#F97316" },
  { days: 14, label: "2 Weeks", sub: "Two weeks sober",     icon: "⚡", color: "#EAB308" },
  { days: 30, label: "30 Days", sub: "One month free",      icon: "🏅", color: "#10B981" },
  { days: 60, label: "60 Days", sub: "Two months rebuilt",  icon: "⭐", color: "#3B82F6" },
  { days: 90, label: "90 Days", sub: "Phoenix rises",       icon: "🦅", color: "#A78BFA" },
];

const MUTED = "rgba(255,255,255,0.32)";
const DIM   = "rgba(255,255,255,0.55)";

export default function RecoveryJourneyTimeline({ streak = 0, user }) {
  const [sharing, setSharing] = useState(false);
  const [shared, setShared] = useState(false);

  const nextMilestone = MILESTONES.find(m => streak < m.days);
  const daysToNext    = nextMilestone ? nextMilestone.days - streak : 0;
  const lastMilestone = [...MILESTONES].reverse().find(m => streak >= m.days);
  const progress      = nextMilestone
    ? ((streak - (lastMilestone?.days ?? 0)) / (nextMilestone.days - (lastMilestone?.days ?? 0))) * 100
    : 100;

  const handleShare = async () => {
    const msg = streak >= 90
      ? `🦅 I've reached 90 days of sobriety on Unbound! The phoenix has risen.`
      : `🔥 I'm on a ${streak}-day recovery streak on Unbound! ${nextMilestone ? `Working towards ${nextMilestone.days} days.` : "Milestone achieved!"}`;

    setSharing(true);

    // Try Web Share API first
    if (navigator.share) {
      try {
        await navigator.share({ title: "My Recovery Journey", text: msg, url: window.location.origin });
        setShared(true);
        setTimeout(() => setShared(false), 3000);
        setSharing(false);
        return;
      } catch (_) { /* fallback */ }
    }

    // Post to Community board as a Win
    try {
      await base44.entities.Win.create({
        content: msg,
        author_email: user?.email,
        display_name: user?.full_name?.split(" ")[0] || "Anonymous",
        streak_days: streak,
      });
      setShared(true);
      setTimeout(() => setShared(false), 3000);
    } catch (_) {
      // Last resort: copy to clipboard
      navigator.clipboard?.writeText(msg);
      setShared(true);
      setTimeout(() => setShared(false), 3000);
    }
    setSharing(false);
  };

  return (
    <div style={{ background: "rgba(255,255,255,0.045)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 22, padding: "22px 20px", marginBottom: 28 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 3 }}>Recovery Journey</p>
          <p style={{ fontSize: 15, fontWeight: 800, color: "#FFF" }}>
            {streak === 0 ? "Start your streak today" : `Day ${streak} · Keep going`}
          </p>
        </div>
        <button
          onClick={handleShare}
          disabled={sharing || streak === 0}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: shared ? "rgba(16,185,129,0.2)" : "rgba(59,130,246,0.15)",
            border: `1px solid ${shared ? "rgba(16,185,129,0.4)" : "rgba(59,130,246,0.3)"}`,
            borderRadius: 12, padding: "8px 14px",
            color: shared ? "#10B981" : "#60A5FA",
            fontSize: 12, fontWeight: 700, cursor: streak === 0 ? "not-allowed" : "pointer",
            opacity: streak === 0 ? 0.4 : 1,
          }}
        >
          {shared ? <Check style={{ width: 13, height: 13 }} /> : <Share2 style={{ width: 13, height: 13 }} />}
          {shared ? "Shared!" : "Share"}
        </button>
      </div>

      {/* Progress to next milestone */}
      {nextMilestone && (
        <div style={{ marginBottom: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <p style={{ fontSize: 12, color: DIM }}>Next: <span style={{ color: nextMilestone.color, fontWeight: 700 }}>{nextMilestone.label}</span></p>
            <p style={{ fontSize: 12, color: MUTED }}>{daysToNext} day{daysToNext !== 1 ? "s" : ""} away</p>
          </div>
          <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 6, height: 7, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 6,
              background: `linear-gradient(90deg, ${nextMilestone.color}99, ${nextMilestone.color})`,
              width: `${Math.max(progress, 3)}%`,
              boxShadow: `0 0 10px ${nextMilestone.color}70`,
              transition: "width 1s cubic-bezier(.4,0,.2,1)",
            }} />
          </div>
        </div>
      )}

      {/* Milestone nodes */}
      <div style={{ display: "flex", alignItems: "flex-start", overflowX: "auto", scrollbarWidth: "none", gap: 0, paddingBottom: 4 }}>
        {MILESTONES.map((m, i) => {
          const done    = streak >= m.days;
          const current = !done && (i === 0 || streak >= MILESTONES[i - 1]?.days);
          const col     = done ? m.color : current ? m.color : "rgba(255,255,255,0.1)";
          return (
            <React.Fragment key={m.days}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flexShrink: 0 }}>
                {/* Node */}
                <div style={{
                  width: 48, height: 48, borderRadius: "50%",
                  background: done ? `linear-gradient(135deg, ${m.color}88, ${m.color})` : current ? `rgba(255,255,255,0.06)` : "rgba(255,255,255,0.04)",
                  border: `2px solid ${col}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18,
                  boxShadow: done ? `0 0 14px ${m.color}50` : current ? `0 0 10px ${m.color}30` : "none",
                  position: "relative",
                }}>
                  {done
                    ? <Check style={{ width: 18, height: 18, color: "#FFF", strokeWidth: 3 }} />
                    : current
                    ? <span style={{ opacity: 0.9 }}>{m.icon}</span>
                    : <Lock style={{ width: 14, height: 14, color: "rgba(255,255,255,0.2)" }} />
                  }
                </div>
                {/* Label */}
                <div style={{ textAlign: "center", maxWidth: 60 }}>
                  <p style={{ fontSize: 10, fontWeight: 800, color: done ? m.color : current ? "rgba(255,255,255,0.7)" : MUTED, lineHeight: 1.2 }}>{m.label}</p>
                  <p style={{ fontSize: 9, color: done ? `${m.color}99` : MUTED, lineHeight: 1.3, marginTop: 1 }}>{m.sub}</p>
                </div>
              </div>
              {/* Connector */}
              {i < MILESTONES.length - 1 && (
                <div style={{ flex: 1, height: 2, marginBottom: 30, minWidth: 12, background: streak >= MILESTONES[i + 1]?.days ? `linear-gradient(90deg, ${m.color}, ${MILESTONES[i+1].color})` : "rgba(255,255,255,0.08)", borderRadius: 2 }} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}