import React from "react";
import { Flame, Trophy, Zap, Star } from "lucide-react";

const MILESTONES = [3, 7, 14, 21, 30, 60, 90];

function getMilestoneLabel(streak) {
  if (streak >= 90) return { emoji: "🏆", label: "Legend", color: "#C9A96E" };
  if (streak >= 60) return { emoji: "💎", label: "Diamond", color: "#22D3EE" };
  if (streak >= 30) return { emoji: "🔥", label: "On Fire", color: "#F97316" };
  if (streak >= 21) return { emoji: "⚡", label: "Electric", color: "#FBBF24" };
  if (streak >= 14) return { emoji: "💪", label: "Strong",  color: "#A78BFA" };
  if (streak >= 7)  return { emoji: "🌟", label: "Weekly",  color: "#34D399" };
  if (streak >= 3)  return { emoji: "🌱", label: "Growing", color: "#6EE7B7" };
  return null;
}

export default function StreakDisplay({ streak, totalSessions, totalMins, longestStreak }) {
  const milestone = getMilestoneLabel(streak);
  const nextMs = MILESTONES.find(m => m > streak) || null;
  const prevMs = [...MILESTONES].reverse().find(m => m <= streak) || 0;
  const segProgress = nextMs ? (streak - prevMs) / (nextMs - prevMs) : 1;

  return (
    <div>
      {/* Streak hero */}
      <div style={{ borderRadius: 20, padding: "22px 20px", marginBottom: 14,
        background: streak >= 7
          ? "linear-gradient(135deg,rgba(245,158,11,0.12),rgba(249,115,22,0.06))"
          : "rgba(255,255,255,0.04)",
        border: `1px solid ${streak >= 7 ? "rgba(245,158,11,0.3)" : "rgba(255,255,255,0.08)"}` }}>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ textAlign: "center", minWidth: 70 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4, justifyContent: "center" }}>
              <Flame style={{ color: streak > 0 ? "#F59E0B" : "rgba(255,255,255,0.2)",
                width: 22, height: 22, marginBottom: 2 }} />
              <p style={{ fontSize: 44, fontWeight: 900, color: streak > 0 ? "#F59E0B" : "rgba(255,255,255,0.2)", lineHeight: 1 }}>
                {streak}
              </p>
            </div>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 600, marginTop: 2 }}>day streak</p>
          </div>

          <div style={{ flex: 1 }}>
            {milestone && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px",
                borderRadius: 20, background: milestone.color + "18", marginBottom: 8 }}>
                <span style={{ fontSize: 14 }}>{milestone.emoji}</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: milestone.color }}>{milestone.label}</span>
              </div>
            )}
            {nextMs && (
              <>
                <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: 6, height: 5,
                  overflow: "hidden", marginBottom: 4 }}>
                  <div style={{ width: `${segProgress * 100}%`, height: "100%", borderRadius: 6,
                    background: "linear-gradient(90deg,#F59E0B,#F97316)",
                    transition: "width 0.5s ease" }} />
                </div>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                  {nextMs - streak} more day{nextMs - streak !== 1 ? "s" : ""} to {nextMs}-day milestone
                </p>
              </>
            )}
            {streak === 0 && (
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>
                Log today's activity to start your streak 🌱
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
        {[
          { icon: Zap,    value: totalSessions, label: "Sessions",    color: "#F59E0B" },
          { icon: Trophy, value: longestStreak, label: "Best Streak", color: "#C9A96E" },
          { icon: Star,   value: totalMins >= 60 ? `${Math.round(totalMins / 60)}h` : `${totalMins}m`, label: "Total Time", color: "#A78BFA" },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} style={{ borderRadius: 14, padding: "14px 10px", textAlign: "center",
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <Icon style={{ color: s.color, width: 14, height: 14, margin: "0 auto 6px" }} />
              <p style={{ fontSize: 22, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 3, fontWeight: 600 }}>{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Milestone badges */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {MILESTONES.map(ms => {
          const reached = longestStreak >= ms;
          return (
            <div key={ms} style={{ padding: "5px 12px", borderRadius: 20,
              background: reached ? "rgba(245,158,11,0.12)" : "rgba(255,255,255,0.04)",
              border: `1.5px solid ${reached ? "rgba(245,158,11,0.35)" : "rgba(255,255,255,0.07)"}` }}>
              <p style={{ fontSize: 11, fontWeight: 800,
                color: reached ? "#F59E0B" : "rgba(255,255,255,0.2)" }}>
                {reached ? "✓ " : ""}{ms}d
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}