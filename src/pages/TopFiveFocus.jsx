import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Flame, CheckCircle2, Circle, ArrowLeft, BarChart2, Settings, Loader2, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  teal:    "#2DD4BF",
  emerald: "#10B981",
  amber:   "#F59E0B",
  indigo:  "#6366F1",
  purple:  "#8B5CF6",
  rose:    "#F472B6",
  muted:   "rgba(241,245,249,0.4)",
  glass:   { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" },
};

export const DEFAULT_CATEGORIES = [
  { key:"recovery",       name:"Recovery",        emoji:"🤝", color:"#2DD4BF", desc:"Meetings, sponsor contact, readings"  },
  { key:"productivity",   name:"Productivity",    emoji:"💼", color:"#F59E0B", desc:"Work, responsibilities, errands"       },
  { key:"physical_health",name:"Physical Health", emoji:"💪", color:"#10B981", desc:"Movement, gym, outdoor time"           },
  { key:"relationships",  name:"Relationships",   emoji:"❤️", color:"#F472B6", desc:"Family, positive social connection"    },
  { key:"mental_growth",  name:"Mental Growth",   emoji:"🧠", color:"#8B5CF6", desc:"Learning, reflection, content"        },
];

function toDateStr(d) { return d.toISOString().split("T")[0]; }

function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return toDateStr(d);
  });
}

export default function TopFiveFocus() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("today");
  const today = toDateStr(new Date());

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: todayLogs = [], isLoading: logsLoading } = useQuery({
    queryKey: ["focus-logs-today", user?.email, today],
    queryFn: () => base44.entities.DailyFocusLog.filter({ user_email: user.email, log_date: today }),
    enabled: !!user?.email,
  });

  const { data: weekLogs = [] } = useQuery({
    queryKey: ["focus-logs-week", user?.email],
    queryFn: () => base44.entities.DailyFocusLog.filter({ user_email: user.email }, "-log_date", 35),
    enabled: !!user?.email,
  });

  const { data: streakData = [] } = useQuery({
    queryKey: ["focus-streak", user?.email],
    queryFn: () => base44.entities.FocusStreak.filter({ user_email: user.email }),
    enabled: !!user?.email,
    select: d => d[0] || null,
  });

  const streak = streakData;

  const completedKeys = useMemo(() =>
    new Set(todayLogs.filter(l => l.completed).map(l => l.category_key)),
    [todayLogs]
  );

  const completedCount = completedKeys.size;
  const allDone = completedCount >= DEFAULT_CATEGORIES.length;

  // Toggle a category
  const toggleMutation = useMutation({
    mutationFn: async (cat) => {
      const existing = todayLogs.find(l => l.category_key === cat.key);
      const nowCompleted = !existing?.completed;

      if (existing) {
        await base44.entities.DailyFocusLog.update(existing.id, {
          completed: nowCompleted,
          completed_at: nowCompleted ? new Date().toISOString() : null,
        });
      } else {
        await base44.entities.DailyFocusLog.create({
          user_email: user.email,
          log_date: today,
          category_key: cat.key,
          category_name: cat.name,
          completed: true,
          completed_at: new Date().toISOString(),
        });
      }

      // Update streak if all 5 done
      const newCompleted = new Set(completedKeys);
      if (nowCompleted) newCompleted.add(cat.key);
      else newCompleted.delete(cat.key);

      if (newCompleted.size >= 5) {
        const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
        const wasConsecutive = streak?.last_completed_date === toDateStr(yesterday) ||
                               streak?.last_completed_date === today;
        const newStreak = wasConsecutive ? (streak?.current_streak || 0) + 1 : 1;
        const longest = Math.max(newStreak, streak?.longest_streak || 0);

        if (streak?.id) {
          await base44.entities.FocusStreak.update(streak.id, {
            current_streak: newStreak,
            longest_streak: longest,
            last_completed_date: today,
            total_perfect_days: (streak.total_perfect_days || 0) + 1,
          });
        } else {
          await base44.entities.FocusStreak.create({
            user_email: user.email,
            current_streak: 1,
            longest_streak: 1,
            last_completed_date: today,
            total_perfect_days: 1,
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["focus-logs-today"] });
      queryClient.invalidateQueries({ queryKey: ["focus-streak"] });
      queryClient.invalidateQueries({ queryKey: ["focus-logs-week"] });
    },
  });

  // Weekly stats
  const weekStats = useMemo(() => {
    const days = getLast7Days();
    return days.map(date => {
      const dayLogs = weekLogs.filter(l => l.log_date === date && l.completed);
      return { date, count: dayLogs.length, perfect: dayLogs.length >= 5 };
    });
  }, [weekLogs]);

  const weeklyPct = useMemo(() => {
    const perfect = weekStats.filter(d => d.perfect).length;
    return Math.round((perfect / 7) * 100);
  }, [weekStats]);

  const dayLabels = ["S","M","T","W","T","F","S"];

  return (
    <div style={{ background: "linear-gradient(170deg,#07090F 0%,#0B0F1A 100%)", minHeight: "100vh", paddingBottom: 100 }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ background: "linear-gradient(150deg,#0D1020 0%,#08091A 100%)", padding: "60px 20px 24px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -60, right: -60, width: 240, height: 240, borderRadius: "50%",
            background: "radial-gradient(circle,rgba(45,212,191,0.1) 0%,transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <button onClick={() => navigate(-1)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none",
              border: "none", color: C.muted, cursor: "pointer", fontSize: 12, marginBottom: 16, padding: 0 }}>
              <ArrowLeft style={{ width: 15, height: 15 }} /> Back
            </button>

            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(45,212,191,0.7)", textTransform: "uppercase",
                  letterSpacing: ".1em", marginBottom: 4 }}>Daily Structure</p>
                <h1 style={{ fontSize: 26, fontWeight: 900, color: "#fff", lineHeight: 1.1, marginBottom: 4 }}>Stay Focused Today</h1>
                <p style={{ fontSize: 13, color: C.muted }}>Small wins. Every day.</p>
              </div>
              <div style={{ textAlign: "center", padding: "12px 16px", borderRadius: 16,
                background: `rgba(45,212,191,0.08)`, border: "1px solid rgba(45,212,191,0.15)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Flame style={{ color: C.teal, width: 18, height: 18 }} />
                  <p style={{ fontSize: 26, fontWeight: 900, color: C.teal, lineHeight: 1 }}>{streak?.current_streak || 0}</p>
                </div>
                <p style={{ fontSize: 10, color: C.muted, marginTop: 2, fontWeight: 600 }}>Day Streak</p>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <p style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>Today's Progress</p>
                <p style={{ fontSize: 12, fontWeight: 800, color: allDone ? C.emerald : "#fff" }}>
                  {completedCount} / 5 {allDone ? "✓" : ""}
                </p>
              </div>
              <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 6, height: 8, overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 6,
                  width: `${(completedCount / 5) * 100}%`,
                  background: allDone
                    ? `linear-gradient(90deg,${C.emerald},#0DA372)`
                    : `linear-gradient(90deg,${C.teal},#22C5B0)`,
                  transition: "width 0.5s cubic-bezier(.4,0,.2,1)",
                  boxShadow: allDone ? `0 0 14px rgba(16,185,129,0.5)` : `0 0 14px rgba(45,212,191,0.4)`,
                }} />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", padding: "10px 16px 0", background: "rgba(7,9,15,0.6)", gap: 4 }}>
          {[{ id:"today", label:"Today" }, { id:"week", label:"This Week" }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, padding: "10px 6px", borderRadius: "10px 10px 0 0", border: "none", cursor: "pointer",
              background: tab === t.id ? "rgba(255,255,255,0.05)" : "transparent",
              borderBottom: tab === t.id ? `2px solid ${C.teal}` : "2px solid transparent",
              color: tab === t.id ? C.teal : C.muted,
              fontWeight: tab === t.id ? 700 : 500, fontSize: 14,
            }}>{t.label}</button>
          ))}
        </div>

        <div style={{ padding: "20px 16px" }}>

          {/* TODAY TAB */}
          {tab === "today" && (
            <>
              {allDone && (
                <div style={{ padding: "14px 18px", borderRadius: 16, marginBottom: 16,
                  background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)",
                  display: "flex", alignItems: "center", gap: 10 }}>
                  <CheckCircle2 style={{ color: C.emerald, width: 20, height: 20, flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 800, color: C.emerald }}>Perfect day! All 5 complete.</p>
                    <p style={{ fontSize: 12, color: C.muted }}>You're building something real. Come back tomorrow.</p>
                  </div>
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {DEFAULT_CATEGORIES.map((cat) => {
                  const done = completedKeys.has(cat.key);
                  const isLoading = toggleMutation.isPending && toggleMutation.variables?.key === cat.key;
                  return (
                    <button
                      key={cat.key}
                      onClick={() => toggleMutation.mutate(cat)}
                      disabled={isLoading}
                      style={{
                        display: "flex", alignItems: "center", gap: 16, padding: "18px 18px",
                        borderRadius: 18, border: `1.5px solid ${done ? `${cat.color}40` : "rgba(255,255,255,0.07)"}`,
                        background: done ? `${cat.color}0C` : "rgba(255,255,255,0.03)",
                        cursor: "pointer", textAlign: "left",
                        transition: "all 0.2s ease",
                        boxShadow: done ? `0 0 20px ${cat.color}15` : "none",
                      }}
                    >
                      <span style={{ fontSize: 26, flexShrink: 0, lineHeight: 1 }}>{cat.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 15, fontWeight: 800, color: done ? cat.color : "#fff", marginBottom: 2 }}>{cat.name}</p>
                        <p style={{ fontSize: 12, color: C.muted }}>{cat.desc}</p>
                      </div>
                      <div style={{
                        width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                        background: done ? cat.color : "rgba(255,255,255,0.06)",
                        border: `1.5px solid ${done ? cat.color : "rgba(255,255,255,0.12)"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 0.2s ease",
                        boxShadow: done ? `0 0 12px ${cat.color}50` : "none",
                      }}>
                        {isLoading
                          ? <Loader2 style={{ width: 14, height: 14, color: "#fff" }} className="animate-spin" />
                          : done
                            ? <Check style={{ width: 14, height: 14, color: "#fff", strokeWidth: 3 }} />
                            : null
                        }
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Stats strip */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 20 }}>
                {[
                  { label: "Streak",        value: `${streak?.current_streak || 0}d`,  color: C.teal    },
                  { label: "Best Streak",   value: `${streak?.longest_streak || 0}d`,  color: C.amber   },
                  { label: "Perfect Days",  value: streak?.total_perfect_days || 0,    color: C.emerald },
                ].map(s => (
                  <div key={s.label} style={{ ...C.glass, borderRadius: 14, padding: "14px 12px", textAlign: "center" }}>
                    <p style={{ fontSize: 22, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</p>
                    <p style={{ fontSize: 10, color: C.muted, marginTop: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em" }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* WEEK TAB */}
          {tab === "week" && (
            <>
              {/* Weekly overview */}
              <div style={{ ...C.glass, borderRadius: 20, padding: "20px", marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: ".08em" }}>Weekly Consistency</p>
                    <p style={{ fontSize: 36, fontWeight: 900, color: C.teal, lineHeight: 1.1, marginTop: 4 }}>{weeklyPct}%</p>
                  </div>
                  <BarChart2 style={{ color: "rgba(45,212,191,0.3)", width: 36, height: 36 }} />
                </div>

                {/* 7-day bar chart */}
                <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 60 }}>
                  {weekStats.map((day, i) => {
                    const heightPct = day.count / 5;
                    const isToday = day.date === today;
                    const color = day.perfect ? C.emerald : day.count > 0 ? C.teal : "rgba(255,255,255,0.08)";
                    return (
                      <div key={day.date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                        <div style={{ width: "100%", borderRadius: 4, background: "rgba(255,255,255,0.06)",
                          height: 48, display: "flex", alignItems: "flex-end", overflow: "hidden" }}>
                          <div style={{
                            width: "100%", borderRadius: 4,
                            height: `${Math.max(heightPct * 100, day.count > 0 ? 15 : 0)}%`,
                            background: color,
                            transition: "height 0.6s ease",
                            boxShadow: day.perfect ? `0 0 8px rgba(16,185,129,0.4)` : "none",
                          }} />
                        </div>
                        <p style={{ fontSize: 10, fontWeight: isToday ? 800 : 500, color: isToday ? C.teal : C.muted }}>
                          {dayLabels[(new Date(day.date + "T12:00:00")).getDay()]}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Per-category weekly breakdown */}
              <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12 }}>
                Category Breakdown (7 days)
              </p>
              {DEFAULT_CATEGORIES.map(cat => {
                const catLogs = weekLogs.filter(l => l.category_key === cat.key && l.completed);
                const pct = Math.round((catLogs.length / 7) * 100);
                return (
                  <div key={cat.key} style={{ ...C.glass, borderRadius: 14, padding: "14px 16px", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <span style={{ fontSize: 18 }}>{cat.emoji}</span>
                      <p style={{ flex: 1, fontSize: 13, fontWeight: 700, color: "#fff" }}>{cat.name}</p>
                      <p style={{ fontSize: 12, fontWeight: 800, color: cat.color }}>{pct}%</p>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: 4, height: 5, overflow: "hidden" }}>
                      <div style={{
                        height: "100%", borderRadius: 4, width: `${pct}%`,
                        background: cat.color, transition: "width 0.8s ease",
                      }} />
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}