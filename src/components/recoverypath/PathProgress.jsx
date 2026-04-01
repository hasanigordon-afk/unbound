import React, { useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Star, Flame, Trophy, TrendingUp, Loader2 } from "lucide-react";

const C = {
  teal: "#2DD4BF", gold: "#C9A96E", emerald: "#10B981",
  amber: "#F59E0B", indigo: "#6366F1", purple: "#A78BFA",
};

const LEVELS = [
  { name: "Reset Mode",        minPts: 0,    color: "#94A3B8", emoji: "🕯️",  desc: "Every great path starts with a single step." },
  { name: "Rebuilding",        minPts: 100,  color: "#F97316", emoji: "🔨",  desc: "You're laying the foundation. Keep going." },
  { name: "Locked In",         minPts: 300,  color: C.gold,    emoji: "🔐",  desc: "Consistency is becoming your identity." },
  { name: "Momentum",          minPts: 600,  color: C.teal,    emoji: "⚡",  desc: "You're moving. The path is building itself." },
  { name: "Strong Foundation", minPts: 1000, color: C.emerald, emoji: "🏛️", desc: "Discipline. Routine. Results. You built this." },
  { name: "Unshaken",          minPts: 2000, color: "#A78BFA", emoji: "🦅",  desc: "Setbacks don't define you. Nothing can stop this." },
];

const BADGES = [
  { id: "first_task",    label: "First Win",         emoji: "🌱", desc: "Completed your first task",    threshold: (p,c) => c >= 1    },
  { id: "seven_day",     label: "7-Day Streak",      emoji: "🔥", desc: "Maintained a 7-day streak",    threshold: (p,c,s) => s >= 7  },
  { id: "hundred_pts",   label: "100 Points",        emoji: "💯", desc: "Earned 100 total points",      threshold: (p) => p >= 100    },
  { id: "recovery_star", label: "Recovery Star",     emoji: "⭐", desc: "Completed 10 recovery tasks",  threshold: (p,c,s,rc) => rc >= 10 },
  { id: "full_week",     label: "Full Week",         emoji: "🗓️", desc: "Completed all tasks in a week", threshold: (p) => p >= 500   },
  { id: "five_hundred",  label: "500 Points",        emoji: "🏅", desc: "Earned 500 total points",      threshold: (p) => p >= 500    },
  { id: "thousand_pts",  label: "1000 Points",       emoji: "🏆", desc: "Earned 1000 total points",     threshold: (p) => p >= 1000   },
  { id: "unshaken",      label: "Unshaken",          emoji: "🦅", desc: "Reached Unshaken level",       threshold: (p) => p >= 2000   },
];

function getLevel(pts) {
  return [...LEVELS].reverse().find(l => pts >= l.minPts) || LEVELS[0];
}

function nextLevel(pts) {
  return LEVELS.find(l => l.minPts > pts) || null;
}

export default function PathProgress({ user }) {
  const { data: pointsLog = [], isLoading } = useQuery({
    queryKey: ["rp-points-all", user?.email],
    queryFn: () => base44.entities.RecoveryPathPoints.filter({ user_email: user.email }, "-log_date", 500),
    enabled: !!user?.email,
  });

  const { data: completions = [] } = useQuery({
    queryKey: ["rp-completions-all", user?.email],
    queryFn: () => base44.entities.RecoveryPathCompletion.filter({ user_email: user.email }, "-completion_date", 500),
    enabled: !!user?.email,
  });

  const stats = useMemo(() => {
    const today = new Date();
    const weekStart = new Date(today); weekStart.setDate(today.getDate() - today.getDay());
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const totalPts = pointsLog.reduce((s, p) => s + p.points, 0);
    const weekPts  = pointsLog.filter(p => new Date(p.log_date) >= weekStart).reduce((s, p) => s + p.points, 0);
    const monthPts = pointsLog.filter(p => new Date(p.log_date) >= monthStart).reduce((s, p) => s + p.points, 0);

    const doneTasks = completions.filter(c => c.status === "done");
    const recoveryTasks = doneTasks.filter(c => c.task_category === "recovery").length;

    // Streak
    const doneByDate = [...new Set(doneTasks.map(c => c.completion_date))].sort().reverse();
    let streak = 0;
    let cur = new Date(); cur.setHours(0,0,0,0);
    for (let i = 0; i < 60; i++) {
      const d = new Date(cur); d.setDate(d.getDate() - i);
      const ds = d.toISOString().split("T")[0];
      if (doneByDate.includes(ds)) streak++;
      else if (i > 0) break;
    }

    return { totalPts, weekPts, monthPts, totalDone: doneTasks.length, recoveryTasks, streak };
  }, [pointsLog, completions]);

  const level = getLevel(stats.totalPts);
  const next  = nextLevel(stats.totalPts);
  const levelPct = next
    ? Math.round(((stats.totalPts - level.minPts) / (next.minPts - level.minPts)) * 100)
    : 100;

  const earnedBadges = BADGES.filter(b => b.threshold(stats.totalPts, stats.totalDone, stats.streak, stats.recoveryTasks));

  if (isLoading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
      <Loader2 style={{ color: C.teal, width: 24, height: 24 }} className="animate-spin" />
    </div>
  );

  return (
    <div>
      {/* Level card */}
      <div style={{ borderRadius: 20, padding: "24px 22px", marginBottom: 16, position: "relative", overflow: "hidden",
        background: `linear-gradient(135deg,${level.color}15,rgba(255,255,255,0.03))`,
        border: `1px solid ${level.color}30` }}>
        <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%",
          background: `radial-gradient(circle,${level.color}20 0%,transparent 70%)`, pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <p style={{ fontSize: 32, marginBottom: 6 }}>{level.emoji}</p>
          <p style={{ fontSize: 24, fontWeight: 900, color: level.color, lineHeight: 1, marginBottom: 4 }}>{level.name}</p>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 18, lineHeight: 1.5 }}>{level.desc}</p>
          {next && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 600 }}>
                  Progress to <span style={{ color: level.color }}>{next.name}</span>
                </p>
                <p style={{ fontSize: 11, fontWeight: 800, color: level.color }}>{levelPct}%</p>
              </div>
              <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: 6, height: 7, overflow: "hidden" }}>
                <div style={{ width: `${levelPct}%`, height: "100%", borderRadius: 6,
                  background: `linear-gradient(90deg,${level.color}80,${level.color})`,
                  transition: "width 0.6s ease" }} />
              </div>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 5 }}>
                {next.minPts - stats.totalPts} pts to {next.name}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        {[
          { icon: Star,      label: "Total Points",  value: stats.totalPts,  color: C.indigo  },
          { icon: Flame,     label: "Streak",        value: `${stats.streak}d`, color: C.gold },
          { icon: TrendingUp,label: "This Week",     value: stats.weekPts,   color: C.teal    },
          { icon: Trophy,    label: "This Month",    value: stats.monthPts,  color: C.emerald },
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 14, padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <Icon style={{ color: stat.color, width: 13, height: 13 }} />
                <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.35)",
                  textTransform: "uppercase", letterSpacing: ".07em" }}>{stat.label}</p>
              </div>
              <p style={{ fontSize: 26, fontWeight: 900, color: stat.color, lineHeight: 1 }}>{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Badges */}
      <p style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.3)", textTransform: "uppercase",
        letterSpacing: "1px", marginBottom: 12 }}>Badges Earned</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 20 }}>
        {BADGES.map(badge => {
          const earned = earnedBadges.some(b => b.id === badge.id);
          return (
            <div key={badge.id} style={{ borderRadius: 14, padding: "12px 8px", textAlign: "center",
              background: earned ? "rgba(201,169,110,0.08)" : "rgba(255,255,255,0.02)",
              border: `1px solid ${earned ? "rgba(201,169,110,0.25)" : "rgba(255,255,255,0.06)"}`,
              opacity: earned ? 1 : 0.35 }}>
              <p style={{ fontSize: 24, marginBottom: 4 }}>{badge.emoji}</p>
              <p style={{ fontSize: 9, fontWeight: 800, color: earned ? C.gold : "rgba(255,255,255,0.3)",
                lineHeight: 1.2, textAlign: "center" }}>{badge.label}</p>
            </div>
          );
        })}
      </div>

      {/* All levels */}
      <p style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.3)", textTransform: "uppercase",
        letterSpacing: "1px", marginBottom: 10 }}>Path Levels</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {LEVELS.map(l => {
          const reached = stats.totalPts >= l.minPts;
          const isCurrent = l.name === level.name;
          return (
            <div key={l.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
              borderRadius: 12, background: isCurrent ? `${l.color}12` : "rgba(255,255,255,0.02)",
              border: `1px solid ${isCurrent ? `${l.color}30` : "rgba(255,255,255,0.05)"}` }}>
              <span style={{ fontSize: 20, opacity: reached ? 1 : 0.3 }}>{l.emoji}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 800, color: reached ? l.color : "rgba(255,255,255,0.25)" }}>{l.name}</p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>{l.minPts}+ pts</p>
              </div>
              {isCurrent && <span style={{ fontSize: 10, fontWeight: 800, color: l.color, background: `${l.color}15`,
                padding: "3px 8px", borderRadius: 10, letterSpacing: ".05em" }}>CURRENT</span>}
              {reached && !isCurrent && <span style={{ fontSize: 14, opacity: 0.6 }}>✅</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}