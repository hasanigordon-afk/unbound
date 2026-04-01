import React, { useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Flame, Star, CheckCircle2, Target, Loader2, Sun } from "lucide-react";
import PathTaskCard from "./PathTaskCard";
import ReflectionModal from "./ReflectionModal";

const C = {
  teal: "#2DD4BF", gold: "#C9A96E", emerald: "#10B981",
  amber: "#F59E0B", indigo: "#6366F1", purple: "#A78BFA",
};

const POINTS = { normal: 10, recovery: 15, high: 20, essential: 20 };
const DAY_NAMES = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

const DAILY_QUOTES = [
  "Your week. Your plan. Your progress.",
  "One honest day at a time.",
  "Discipline is a form of self-love.",
  "Your path is still here. Keep walking.",
  "Small wins stack into big change.",
  "Today's effort is tomorrow's foundation.",
];

function ProgressRing({ pct, size = 80, stroke = 7, color = C.teal, label, sub }) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke} />
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.6s ease" }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center" }}>
          <p style={{ fontSize: 17, fontWeight: 900, color, lineHeight: 1 }}>{label}</p>
          {sub && <p style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>{sub}</p>}
        </div>
      </div>
    </div>
  );
}

export default function DailyDashboard({ user }) {
  const qc = useQueryClient();
  const [showReflection, setShowReflection] = useState(false);
  const today = new Date().toISOString().split("T")[0];
  const todayDow = new Date().getDay();
  const quote = DAILY_QUOTES[new Date().getDay() % DAILY_QUOTES.length];

  const { data: tasks = [] } = useQuery({
    queryKey: ["rp-tasks", user?.email],
    queryFn: () => base44.entities.RecoveryPathTask.filter({ user_email: user.email, is_active: true }),
    enabled: !!user?.email,
  });

  const { data: completions = [], isLoading } = useQuery({
    queryKey: ["rp-completions-today", user?.email, today],
    queryFn: () => base44.entities.RecoveryPathCompletion.filter({ user_email: user.email, completion_date: today }),
    enabled: !!user?.email,
  });

  const { data: pointsLog = [] } = useQuery({
    queryKey: ["rp-points-recent", user?.email],
    queryFn: () => base44.entities.RecoveryPathPoints.filter({ user_email: user.email }, "-log_date", 100),
    enabled: !!user?.email,
  });

  const { data: reflection } = useQuery({
    queryKey: ["rp-reflection-today", user?.email, today],
    queryFn: () => base44.entities.RecoveryPathReflection.filter({ user_email: user.email, reflection_date: today }),
    enabled: !!user?.email,
    select: d => d[0] || null,
  });

  // Today's tasks
  const todayTasks = useMemo(() =>
    tasks.filter(t => t.days_of_week?.includes(todayDow) || t.recurrence === "daily"),
    [tasks, todayDow]
  );

  const completionMap = useMemo(() => {
    const m = {};
    completions.forEach(c => { m[c.task_id] = c.status; });
    return m;
  }, [completions]);

  const doneTasks    = todayTasks.filter(t => completionMap[t.id] === "done");
  const skippedTasks = todayTasks.filter(t => completionMap[t.id] === "skipped");
  const pendingTasks = todayTasks.filter(t => !completionMap[t.id]);
  const essentials   = pendingTasks.filter(t => t.is_essential || t.priority === "essential");
  const optional     = pendingTasks.filter(t => !t.is_essential && t.priority !== "essential");

  const pct = todayTasks.length > 0 ? Math.round((doneTasks.length / todayTasks.length) * 100) : 0;
  const allDone = todayTasks.length > 0 && pendingTasks.length === 0 && skippedTasks.length === 0;

  // Points today
  const todayPoints = pointsLog.filter(p => p.log_date === today).reduce((s, p) => s + p.points, 0);

  // Streak
  const streak = useMemo(() => {
    const dates = [...new Set(completions.filter(c => c.status === "done").map(c => c.completion_date))];
    let s = 0, cur = new Date(); cur.setHours(0,0,0,0);
    for (let i = 0; i < 30; i++) {
      const d = new Date(cur); d.setDate(d.getDate() - i);
      const ds = d.toISOString().split("T")[0];
      if (dates.includes(ds)) s++;
      else if (i > 0) break;
    }
    return s;
  }, [completions]);

  const completeMutation = useMutation({
    mutationFn: async (task) => {
      const pts = task.category === "recovery" ? 15
        : (task.priority === "essential" || task.priority === "high") ? 20 : 10;
      await base44.entities.RecoveryPathCompletion.create({
        user_email: user.email, task_id: task.id, task_title: task.title,
        task_category: task.category, task_priority: task.priority,
        completion_date: today, status: "done", points_earned: pts,
      });
      await base44.entities.RecoveryPathPoints.create({
        user_email: user.email, log_date: today, points: pts,
        reason: `Completed: ${task.title}`, task_id: task.id,
        bonus_type: task.category === "recovery" ? "recovery_bonus" : "task",
      });
      // Full day bonus
      const newDone = doneTasks.length + 1;
      if (newDone === todayTasks.length) {
        await base44.entities.RecoveryPathPoints.create({
          user_email: user.email, log_date: today, points: 50,
          reason: "Full day completed! 🎉", bonus_type: "full_day",
        });
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rp-completions-today"] })
      && qc.invalidateQueries({ queryKey: ["rp-points-recent"] }),
  });

  const skipMutation = useMutation({
    mutationFn: async ({ task, reason }) => {
      await base44.entities.RecoveryPathCompletion.create({
        user_email: user.email, task_id: task.id, task_title: task.title,
        task_category: task.category, task_priority: task.priority,
        completion_date: today, status: "skipped", skip_reason: reason, points_earned: 0,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rp-completions-today"] }),
  });

  const undoMutation = useMutation({
    mutationFn: async (task) => {
      const existing = completions.find(c => c.task_id === task.id);
      if (existing) await base44.entities.RecoveryPathCompletion.delete(existing.id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rp-completions-today"] }),
  });

  if (isLoading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
      <Loader2 style={{ color: C.teal, width: 24, height: 24 }} className="animate-spin" />
    </div>
  );

  const missedMsg = skippedTasks.length > 0 && pendingTasks.length === 0 && !allDone
    ? "Today got away from you. Your path is still here. Reset and keep moving."
    : null;

  return (
    <div>
      {/* Quote */}
      <div style={{ padding: "16px 0 4px" }}>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", fontStyle: "italic", textAlign: "center" }}>{quote}</p>
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", justifyContent: "space-around", padding: "20px 0 16px" }}>
        <ProgressRing pct={pct} color={C.teal} label={`${pct}%`} sub="today" />
        <div style={{ textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, marginBottom: 4 }}>
            <Flame style={{ color: C.gold, width: 18, height: 18 }} />
            <p style={{ fontSize: 28, fontWeight: 900, color: C.gold, lineHeight: 1 }}>{streak}</p>
          </div>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em" }}>Streak</p>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, marginBottom: 4 }}>
            <Star style={{ color: C.indigo, width: 18, height: 18 }} />
            <p style={{ fontSize: 28, fontWeight: 900, color: C.indigo, lineHeight: 1 }}>{todayPoints}</p>
          </div>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em" }}>Points</p>
        </div>
      </div>

      {/* All done state */}
      {allDone && todayTasks.length > 0 && (
        <div style={{ borderRadius: 18, padding: "20px", marginBottom: 16, textAlign: "center",
          background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.2)" }}>
          <p style={{ fontSize: 28, marginBottom: 6 }}>🏆</p>
          <p style={{ fontSize: 17, fontWeight: 900, color: "#10B981", marginBottom: 4 }}>All done today!</p>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>+50 bonus points earned. You showed up for yourself.</p>
        </div>
      )}

      {/* Missed tasks message */}
      {missedMsg && (
        <div style={{ borderRadius: 14, padding: "14px 16px", marginBottom: 14,
          background: "rgba(201,169,110,0.07)", border: "1px solid rgba(201,169,110,0.2)" }}>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.6, fontStyle: "italic" }}>"{missedMsg}"</p>
        </div>
      )}

      {/* Top 3 essentials */}
      {essentials.length > 0 && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <Target style={{ color: "#EF4444", width: 14, height: 14 }} />
            <p style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: ".08em" }}>
              Top {Math.min(3, essentials.length)} Must-Do Tasks
            </p>
          </div>
          {essentials.slice(0, 3).map(task => (
            <PathTaskCard key={task.id} task={task} status={completionMap[task.id]}
              onDone={() => completeMutation.mutate(task)}
              onSkip={(t, reason) => skipMutation.mutate({ task: t, reason })}
              onUndo={() => undoMutation.mutate(task)}
              pointsPreview />
          ))}
        </>
      )}

      {/* Remaining tasks */}
      {optional.length > 0 && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, marginTop: 16 }}>
            <Sun style={{ color: C.teal, width: 14, height: 14 }} />
            <p style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: ".08em" }}>
              Today's Path
            </p>
          </div>
          {optional.map(task => (
            <PathTaskCard key={task.id} task={task} status={completionMap[task.id]}
              onDone={() => completeMutation.mutate(task)}
              onSkip={(t, reason) => skipMutation.mutate({ task: t, reason })}
              onUndo={() => undoMutation.mutate(task)} />
          ))}
        </>
      )}

      {/* Completed */}
      {doneTasks.length > 0 && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, marginTop: 16 }}>
            <CheckCircle2 style={{ color: C.emerald, width: 14, height: 14 }} />
            <p style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: ".08em" }}>
              Completed ({doneTasks.length})
            </p>
          </div>
          {doneTasks.map(task => (
            <PathTaskCard key={task.id} task={task} status="done"
              onUndo={() => undoMutation.mutate(task)} />
          ))}
        </>
      )}

      {/* No tasks */}
      {todayTasks.length === 0 && (
        <div style={{ borderRadius: 18, padding: "40px 24px", textAlign: "center",
          background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.08)" }}>
          <p style={{ fontSize: 32, marginBottom: 12 }}>📅</p>
          <p style={{ fontSize: 15, fontWeight: 800, color: "#fff", marginBottom: 6 }}>Nothing planned today</p>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>Go to Weekly Plan to add tasks for {DAY_NAMES[todayDow]}.</p>
        </div>
      )}

      {/* Reflection CTA */}
      {(doneTasks.length > 0 || skippedTasks.length > 0) && (
        <button onClick={() => setShowReflection(true)}
          style={{ width: "100%", marginTop: 20, padding: "14px", borderRadius: 16, border: "none",
            cursor: "pointer", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)",
            color: C.indigo, fontWeight: 700, fontSize: 14 }}>
          {reflection ? "✅ Reflection Done" : "📝 End-of-Day Reflection (optional)"}
        </button>
      )}

      {showReflection && (
        <ReflectionModal user={user} today={today} existing={reflection}
          onClose={() => setShowReflection(false)} />
      )}
    </div>
  );
}