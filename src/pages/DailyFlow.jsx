import React, { useMemo, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { ChevronLeft, Flame, Plus } from "lucide-react";
import MorningIntention from "@/components/dailyflow/MorningIntention";
import TaskChecklist from "@/components/dailyflow/TaskChecklist";
import NightReflection from "@/components/dailyflow/NightReflection";

const C = {
  amber:   "#B8823A",
  green:   "#7A9E7E",
  muted:   "#9B8E83",
  text:    "#1C1410",
  bg:      "#F7F3EE",
  surface: "#FDFAF6",
  border:  "#E8E2D9",
};

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

  const logSet = useMemo(() => {
    const s = new Set();
    logs.forEach(l => { if (l.completed) s.add(`${l.routine_id}_${l.log_date}`); });
    return s;
  }, [logs]);

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

  const dow = new Date(today + "T12:00:00").getDay();
  const todayTasks = routines.filter(r => (r.days_of_week || []).includes(dow));
  const doneTasks = todayTasks.filter(r => logSet.has(`${r.id}_${today}`)).length;
  const allTasksDone = todayTasks.length > 0 && doneTasks === todayTasks.length;

  const entryMutation = useMutation({
    mutationFn: async (patch) => {
      if (todayEntry) return base44.entities.DailyFlowEntry.update(todayEntry.id, patch);
      return base44.entities.DailyFlowEntry.create({ user_email: user.email, flow_date: today, ...patch });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["daily-flow-entries"] }),
  });

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

  const nudge = (() => {
    if (!todayEntry?.intention_set && hour >= 6 && hour < 11)
      return { msg: "Take 30 seconds to set your intention for today.", color: C.amber };
    if (doneTasks === 0 && todayTasks.length > 0 && hour >= 10 && hour < 15)
      return { msg: "Your first task is waiting. One step at a time.", color: C.green };
    if (!todayEntry?.reflection_done && allTasksDone && hour >= 17)
      return { msg: "You finished all your tasks — take a moment to reflect.", color: C.amber };
    if (!todayEntry?.reflection_done && hour >= 20)
      return { msg: "End your day with a quick reflection. It only takes a minute.", color: C.amber };
    return null;
  })();

  return (
    <div style={{ background: C.bg, minHeight: "100vh", paddingBottom: 100 }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "56px 24px 24px" }}>
          <Link to={createPageUrl("MyFoundation")} style={{ display: "inline-flex", alignItems: "center", gap: 6,
            color: C.muted, cursor: "pointer", fontSize: 12, marginBottom: 16, textDecoration: "none", fontWeight: 600 }}>
            <ChevronLeft style={{ width: 15, height: 15 }} /> Back
          </Link>

          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.amber, textTransform: "uppercase",
                letterSpacing: ".1em", marginBottom: 4 }}>Daily Flow</p>
              <h1 style={{ fontFamily: "'Lora', serif", fontSize: 24, fontWeight: 600, color: C.text, lineHeight: 1.2, marginBottom: 4 }}>
                {timeGreeting}, {firstName}
              </h1>
              <p style={{ fontSize: 13, color: C.muted }}>
                {new Date().toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric" })}
              </p>
            </div>
            {streak > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
                borderRadius: 20, background: "rgba(184,130,58,.10)", border: "1px solid rgba(184,130,58,.25)" }}>
                <Flame style={{ color: C.amber, width: 14, height: 14 }} />
                <p style={{ fontSize: 13, fontWeight: 700, color: C.amber }}>{streak}d</p>
              </div>
            )}
          </div>

          {/* Day progress pills */}
          <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
            {[
              { label: "Intention", done: todayEntry?.intention_set, color: C.amber },
              { label: `${doneTasks}/${todayTasks.length} Tasks`, done: allTasksDone, color: C.green },
              { label: "Reflection", done: todayEntry?.reflection_done, color: C.amber },
            ].map(p => (
              <div key={p.label} style={{ flex: 1, padding: "8px 6px", borderRadius: 10, textAlign: "center",
                background: p.done ? `${p.color}12` : C.bg,
                border: `1.5px solid ${p.done ? p.color + "40" : C.border}` }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: p.done ? p.color : C.muted, lineHeight: 1.2 }}>
                  {p.done ? "✓ " : ""}{p.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: "20px 16px", display: "flex", flexDirection: "column", gap: 16 }}>

          {nudge && (
            <div style={{ borderRadius: 12, padding: "11px 16px",
              background: `${nudge.color}08`, border: `1px solid ${nudge.color}22` }}>
              <p style={{ fontSize: 13, color: nudge.color, fontStyle: "italic" }}>
                💬 {nudge.msg}
              </p>
            </div>
          )}

          <MorningIntention entry={todayEntry} onSave={(patch) => entryMutation.mutate(patch)} isSaving={entryMutation.isPending} />

          <div style={{ borderRadius: 16, padding: "18px", background: C.surface, border: `.5px solid ${C.border}` }}>
            <TaskChecklist routines={routines} logSet={logSet} onToggle={toggleTask} today={today} />
            {routines.length === 0 && (
              <Link to={createPageUrl("MyPath")} style={{ textDecoration: "none" }}>
                <button style={{ width: "100%", marginTop: 12, padding: "12px", borderRadius: 50,
                  border: `1.5px dashed rgba(184,130,58,.35)`, background: "rgba(184,130,58,.05)",
                  color: C.amber, fontWeight: 700, fontSize: 13, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <Plus style={{ width: 14, height: 14 }} /> Build your routine in My Path
                </button>
              </Link>
            )}
          </div>

          <NightReflection entry={todayEntry} onSave={(patch) => entryMutation.mutate(patch)}
            isSaving={entryMutation.isPending} tasksComplete={allTasksDone} />
        </div>
      </div>
    </div>
  );
}