import React, { useMemo, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { ChevronLeft, Flame, Plus } from "lucide-react";
import MorningIntention from "@/components/dailyflow/MorningIntention";
import TaskChecklist from "@/components/dailyflow/TaskChecklist";
import NightReflection from "@/components/dailyflow/NightReflection";

const C = { teal: "#2DD4BF", gold: "#C9A96E" };

export default function DailyFlow() {
  const qc = useQueryClient();
  const today = new Date().toISOString().split("T")[0];

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: routines = [] } = useQuery({
    queryKey: ["my-path-routines", user?.email],
    queryFn: () => base44.entities.MyPathRoutine.filter({ user_email: user.email, is_active: true }, "sort_order", 100),
    enabled: !!user?.email,
  });

  const { data: logs = [] } = useQuery({
    queryKey: ["my-path-logs", user?.email],
    queryFn: () => base44.entities.MyPathLog.filter({ user_email: user.email }, "-log_date", 400),
    enabled: !!user?.email,
  });

  const { data: flowEntries = [] } = useQuery({
    queryKey: ["daily-flow-entries", user?.email],
    queryFn: () => base44.entities.DailyFlowEntry.filter({ user_email: user.email }, "-flow_date", 60),
    enabled: !!user?.email,
  });

  const todayEntry = flowEntries.find(e => e.flow_date === today) || null;

  // Log set for today
  const logSet = useMemo(() => {
    const s = new Set();
    logs.forEach(l => { if (l.completed) s.add(`${l.routine_id}_${l.log_date}`); });
    return s;
  }, [logs]);

  // Streak: consecutive days with any activity (intention OR task OR reflection)
  const streak = useMemo(() => {
    const activeDays = new Set([
      ...flowEntries.filter(e => e.intention_set || e.reflection_done).map(e => e.flow_date),
      ...logs.filter(l => l.completed).map(l => l.log_date),
    ]);
    let s = 0;
    const cur = new Date(); cur.setHours(0, 0, 0, 0);
    while (true) {
      const ds = cur.toISOString().split("T")[0];
      if (!activeDays.has(ds)) break;
      s++; cur.setDate(cur.getDate() - 1);
    }
    return s;
  }, [flowEntries, logs]);

  // Today tasks
  const dow = new Date(today + "T12:00:00").getDay();
  const todayTasks = routines.filter(r => (r.days_of_week || []).includes(dow));
  const doneTasks = todayTasks.filter(r => logSet.has(`${r.id}_${today}`)).length;
  const allTasksDone = todayTasks.length > 0 && doneTasks === todayTasks.length;

  // Save/update flow entry
  const entryMutation = useMutation({
    mutationFn: async (patch) => {
      if (todayEntry) {
        return base44.entities.DailyFlowEntry.update(todayEntry.id, patch);
      } else {
        return base44.entities.DailyFlowEntry.create({ user_email: user.email, flow_date: today, ...patch });
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["daily-flow-entries"] }),
  });

  // Toggle task
  const toggleTask = useCallback(async (routine, dateStr, isDone) => {
    const existing = logs.find(l => l.routine_id === routine.id && l.log_date === dateStr);
    if (isDone && existing) {
      await base44.entities.MyPathLog.update(existing.id, { completed: false });
    } else if (existing) {
      await base44.entities.MyPathLog.update(existing.id, { completed: true });
    } else {
      await base44.entities.MyPathLog.create({
        user_email: user.email, routine_id: routine.id,
        routine_title: routine.title, routine_category: routine.category,
        log_date: dateStr, completed: true,
      });
    }
    qc.invalidateQueries({ queryKey: ["my-path-logs"] });
  }, [logs, user]);

  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = user?.full_name?.split(" ")[0] || "there";

  // Gentle nudge based on time & state
  const nudge = (() => {
    if (!todayEntry?.intention_set && hour >= 6 && hour < 11)
      return { msg: "Take 30 seconds to set your intention for today.", color: "#FB923C" };
    if (doneTasks === 0 && todayTasks.length > 0 && hour >= 10 && hour < 15)
      return { msg: "Your first task is waiting. One step at a time.", color: C.teal };
    if (!todayEntry?.reflection_done && allTasksDone && hour >= 17)
      return { msg: "You finished all your tasks — take a moment to reflect.", color: "#A78BFA" };
    if (!todayEntry?.reflection_done && hour >= 20)
      return { msg: "End your day with a quick reflection. It only takes a minute.", color: "#A78BFA" };
    return null;
  })();

  return (
    <div style={{ background: "linear-gradient(170deg,#07090F 0%,#0B0F1A 100%)", minHeight: "100vh", paddingBottom: 100 }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ background: "linear-gradient(150deg,#0D1020 0%,#08091A 100%)",
          padding: "60px 24px 28px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -60, right: -60, width: 260, height: 260, borderRadius: "50%",
            background: "radial-gradient(circle,rgba(251,146,60,0.08) 0%,transparent 70%)", pointerEvents: "none" }} />

          <Link to={createPageUrl("MyFoundation")} style={{ display: "inline-flex", alignItems: "center", gap: 6,
            color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 12, marginBottom: 16, textDecoration: "none" }}>
            <ChevronLeft style={{ width: 15, height: 15 }} /> Back
          </Link>

          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: C.teal, textTransform: "uppercase",
                letterSpacing: ".1em", marginBottom: 4 }}>Daily Flow</p>
              <h1 style={{ fontSize: 24, fontWeight: 900, color: "#fff", lineHeight: 1.2, marginBottom: 4 }}>
                {timeGreeting}, {firstName}
              </h1>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>
                {new Date().toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric" })}
              </p>
            </div>
            {streak > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
                borderRadius: 20, background: "rgba(201,169,110,0.1)", border: "1px solid rgba(201,169,110,0.25)" }}>
                <Flame style={{ color: C.gold, width: 14, height: 14 }} />
                <p style={{ fontSize: 13, fontWeight: 800, color: C.gold }}>{streak}d</p>
              </div>
            )}
          </div>

          {/* Day progress pills */}
          <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
            {[
              { label: "Intention", done: todayEntry?.intention_set, color: "#FB923C" },
              { label: `${doneTasks}/${todayTasks.length} Tasks`, done: allTasksDone, color: C.teal },
              { label: "Reflection", done: todayEntry?.reflection_done, color: "#A78BFA" },
            ].map(p => (
              <div key={p.label} style={{ flex: 1, padding: "8px 6px", borderRadius: 12, textAlign: "center",
                background: p.done ? `${p.color}18` : "rgba(255,255,255,0.04)",
                border: `1.5px solid ${p.done ? p.color + "40" : "rgba(255,255,255,0.07)"}` }}>
                <p style={{ fontSize: 10, fontWeight: 700,
                  color: p.done ? p.color : "rgba(255,255,255,0.3)", lineHeight: 1.2 }}>
                  {p.done ? "✓ " : ""}{p.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: "20px 16px", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Gentle nudge */}
          {nudge && (
            <div style={{ borderRadius: 14, padding: "11px 16px",
              background: `${nudge.color}08`, border: `1px solid ${nudge.color}20` }}>
              <p style={{ fontSize: 13, color: `${nudge.color}CC`, fontStyle: "italic" }}>
                💬 {nudge.msg}
              </p>
            </div>
          )}

          {/* Morning Intention */}
          <MorningIntention
            entry={todayEntry}
            onSave={(patch) => entryMutation.mutate(patch)}
            isSaving={entryMutation.isPending}
          />

          {/* Task Checklist */}
          <div style={{ borderRadius: 18, padding: "18px", background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)" }}>
            <TaskChecklist
              routines={routines}
              logSet={logSet}
              onToggle={toggleTask}
              today={today}
            />
            {routines.length === 0 && (
              <Link to={createPageUrl("MyPath")} style={{ textDecoration: "none" }}>
                <button style={{ width: "100%", marginTop: 12, padding: "12px", borderRadius: 12,
                  border: "1.5px dashed rgba(45,212,191,0.3)", background: "rgba(45,212,191,0.04)",
                  color: C.teal, fontWeight: 700, fontSize: 13, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <Plus style={{ width: 14, height: 14 }} /> Build your routine in My Path
                </button>
              </Link>
            )}
          </div>

          {/* Night Reflection */}
          <NightReflection
            entry={todayEntry}
            onSave={(patch) => entryMutation.mutate(patch)}
            isSaving={entryMutation.isPending}
            tasksComplete={allTasksDone}
          />

        </div>
      </div>
    </div>
  );
}