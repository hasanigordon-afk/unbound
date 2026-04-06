import React, { useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import {
  CalendarCheck, Flame, CheckCircle2, Circle,
  Users, RotateCcw, Phone, ArrowRight, Loader2, Zap
} from "lucide-react";

const C = {
  teal:    "#2DD4BF",
  gold:    "#C9A96E",
  emerald: "#10B981",
  indigo:  "#6366F1",
  rose:    "#F472B6",
  amber:   "#F59E0B",
  navy:    "#07090F",
};

const MOTIVATIONAL = [
  "One honest day at a time.",
  "Your foundation holds. Keep building.",
  "Discipline today. Freedom tomorrow.",
  "Progress over perfection. Always.",
  "You chose this path. Walk it.",
  "Every check-in is a vote for yourself.",
];

function QuickCard({ icon: Icon, label, href, color, external }) {
  const inner = (
    <div style={{
      flex: 1, borderRadius: 20, padding: "20px 14px",
      background: `${color}0A`, border: `1px solid ${color}25`,
      display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
      cursor: "pointer", transition: "transform 0.15s ease",
    }}>
      <div style={{ width: 48, height: 48, borderRadius: 16,
        background: `${color}18`, border: `1px solid ${color}30`,
        display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon style={{ color, width: 22, height: 22 }} strokeWidth={1.8} />
      </div>
      <p style={{ fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.7)",
        textAlign: "center", letterSpacing: ".01em" }}>{label}</p>
    </div>
  );
  if (external) return <a href={href} style={{ flex: 1, textDecoration: "none" }}>{inner}</a>;
  return <Link to={createPageUrl(href)} style={{ flex: 1, textDecoration: "none" }}>{inner}</Link>;
}

function FlowTask({ task, done, onToggle }) {
  return (
    <div onClick={onToggle}
      style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px",
        borderRadius: 14, cursor: "pointer",
        background: done ? "rgba(16,185,129,0.06)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${done ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.06)"}`,
        transition: "all 0.2s ease", marginBottom: 8 }}>
      {done
        ? <CheckCircle2 style={{ color: C.emerald, width: 20, height: 20, flexShrink: 0 }} />
        : <Circle style={{ color: "rgba(255,255,255,0.2)", width: 20, height: 20, flexShrink: 0 }} />}
      <p style={{ fontSize: 14, fontWeight: 700,
        color: done ? C.emerald : "#fff",
        textDecoration: done ? "line-through" : "none",
        opacity: done ? 0.7 : 1 }}>
        {task.title}
      </p>
      {task.tag && (
        <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 800, color: task.color,
          background: `${task.color}15`, padding: "3px 8px", borderRadius: 10, flexShrink: 0 }}>
          {task.tag}
        </span>
      )}
    </div>
  );
}

export default function MyFoundation() {
  const today = new Date().toISOString().split("T")[0];
  const todayDow = new Date().getDay();
  const quote = MOTIVATIONAL[new Date().getDay() % MOTIVATIONAL.length];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: checkIns = [], isLoading } = useQuery({
    queryKey: ["foundation-checkins", user?.email],
    queryFn: () => base44.entities.DailyCheckIn.filter({ participant_email: user.email }, "-check_in_date", 60),
    enabled: !!user?.email,
  });

  const { data: pathTasks = [] } = useQuery({
    queryKey: ["foundation-rp-tasks", user?.email],
    queryFn: () => base44.entities.RecoveryPathTask.filter({ user_email: user.email, is_active: true }),
    enabled: !!user?.email,
  });

  const { data: pathCompletions = [] } = useQuery({
    queryKey: ["foundation-rp-completions", user?.email, today],
    queryFn: () => base44.entities.RecoveryPathCompletion.filter({ user_email: user.email, completion_date: today }),
    enabled: !!user?.email,
  });

  // Streak
  const streak = useMemo(() => {
    const sorted = [...checkIns].sort((a, b) => new Date(b.check_in_date) - new Date(a.check_in_date));
    let n = 0, cur = new Date(); cur.setHours(0, 0, 0, 0);
    for (const c of sorted) {
      const d = new Date(c.check_in_date); d.setHours(0, 0, 0, 0);
      if (Math.round((cur - d) / 86400000) <= 1) { n++; cur = d; } else break;
    }
    return n;
  }, [checkIns]);

  const checkedToday = checkIns.some(c => c.check_in_date === today);

  // Today's Recovery Path tasks
  const todayTasks = useMemo(() =>
    pathTasks.filter(t => t.days_of_week?.includes(todayDow) || t.recurrence === "daily"),
    [pathTasks, todayDow]
  );
  const completionMap = useMemo(() => {
    const m = {};
    pathCompletions.forEach(c => { m[c.task_id] = c.status; });
    return m;
  }, [pathCompletions]);

  const doneTasks  = todayTasks.filter(t => completionMap[t.id] === "done");
  const flowPct    = todayTasks.length > 0 ? Math.round((doneTasks.length / todayTasks.length) * 100) : 0;

  const firstName = user?.full_name?.split(" ")[0] || "there";
  const dateStr   = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  if (isLoading) return (
    <div style={{ background: C.navy, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Loader2 style={{ color: C.teal, width: 28, height: 28 }} className="animate-spin" />
    </div>
  );

  return (
    <div style={{ background: "linear-gradient(170deg,#07090F 0%,#0A0F1A 100%)", minHeight: "100vh", paddingBottom: 110 }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>

        {/* ── Header ── */}
        <div style={{ padding: "60px 24px 28px", position: "relative", overflow: "hidden",
          background: "linear-gradient(155deg,#0D1428 0%,#080E1C 100%)" }}>
          <div style={{ position: "absolute", top: -80, right: -60, width: 280, height: 280, borderRadius: "50%",
            background: "radial-gradient(circle,rgba(45,212,191,0.08) 0%,transparent 70%)", pointerEvents: "none" }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: C.teal, textTransform: "uppercase",
              letterSpacing: ".12em", marginBottom: 4 }}>My Foundation</p>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: "#fff", marginBottom: 2, lineHeight: 1.15 }}>
              {greeting}, {firstName}.
            </h1>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginBottom: 20 }}>{dateStr}</p>

            {/* Streak + quote row */}
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px",
                borderRadius: 14, background: streak > 0 ? "rgba(201,169,110,0.1)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${streak > 0 ? "rgba(201,169,110,0.25)" : "rgba(255,255,255,0.07)"}` }}>
                <Flame style={{ color: C.gold, width: 18, height: 18 }} />
                <div>
                  <p style={{ fontSize: 22, fontWeight: 900, color: C.gold, lineHeight: 1 }}>{streak}</p>
                  <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: 600 }}>day streak</p>
                </div>
              </div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: 1.6,
                fontStyle: "italic", flex: 1 }}>"{quote}"</p>
            </div>
          </div>
        </div>

        <div style={{ padding: "20px 16px" }}>

          {/* ── Daily Check-In CTA ── */}
          <Link to={createPageUrl("DailyCheckIn")} style={{ textDecoration: "none", display: "block", marginBottom: 14 }}>
            <div style={{
              borderRadius: 22, padding: "20px 22px",
              background: checkedToday
                ? "rgba(16,185,129,0.08)"
                : `linear-gradient(135deg,${C.teal}20,${C.teal}08)`,
              border: `1px solid ${checkedToday ? "rgba(16,185,129,0.3)" : `${C.teal}40`}`,
              display: "flex", alignItems: "center", gap: 16,
              boxShadow: checkedToday ? "none" : `0 8px 32px rgba(45,212,191,0.12)`,
            }}>
              <div style={{ width: 52, height: 52, borderRadius: 18, flexShrink: 0,
                background: checkedToday ? "rgba(16,185,129,0.15)" : `${C.teal}20`,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: checkedToday ? "none" : `0 0 20px ${C.teal}30` }}>
                {checkedToday
                  ? <CheckCircle2 style={{ color: C.emerald, width: 26, height: 26 }} />
                  : <CalendarCheck style={{ color: C.teal, width: 26, height: 26 }} />}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 17, fontWeight: 900, color: checkedToday ? C.emerald : "#fff", marginBottom: 3 }}>
                  {checkedToday ? "Check-In Complete ✓" : "Daily Check-In"}
                </p>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
                  {checkedToday ? `${streak} days in a row — keep your streak alive.` : "30 seconds · Start your day strong"}
                </p>
              </div>
              <ArrowRight style={{ color: checkedToday ? C.emerald : C.teal, width: 18, height: 18, flexShrink: 0 }} />
            </div>
          </Link>

          {/* ── Daily Flow ── */}
          <div style={{ borderRadius: 22, padding: "20px 18px", marginBottom: 14,
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Zap style={{ color: C.teal, width: 15, height: 15 }} />
                <p style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>Today's Daily Flow</p>
              </div>
              {todayTasks.length > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <p style={{ fontSize: 12, fontWeight: 900, color: C.teal }}>{flowPct}%</p>
                  <div style={{ width: 48, height: 5, borderRadius: 3,
                    background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                    <div style={{ width: `${flowPct}%`, height: "100%", borderRadius: 3,
                      background: C.teal, transition: "width 0.5s ease" }} />
                  </div>
                </div>
              )}
            </div>

            {todayTasks.length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", marginBottom: 10 }}>
                  No tasks planned for today yet.
                </p>
                <Link to={createPageUrl("RecoveryPath")} style={{ textDecoration: "none" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.teal,
                    background: `${C.teal}10`, padding: "6px 14px", borderRadius: 10,
                    border: `1px solid ${C.teal}25` }}>
                    Build My Weekly Plan →
                  </span>
                </Link>
              </div>
            ) : (
              <>
                {todayTasks.slice(0, 5).map(task => (
                  <FlowTask key={task.id} task={{ ...task, tag: task.is_essential ? "Must-Do" : null, color: C.amber }}
                    done={completionMap[task.id] === "done"}
                    onToggle={() => {}} // Read-only here; full control in RecoveryPath
                  />
                ))}
                {todayTasks.length > 5 && (
                  <Link to={createPageUrl("RecoveryPath")} style={{ textDecoration: "none" }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: C.teal, textAlign: "center",
                      marginTop: 6, padding: "8px" }}>
                      +{todayTasks.length - 5} more tasks → Open Recovery Path
                    </p>
                  </Link>
                )}
                {doneTasks.length === todayTasks.length && todayTasks.length > 0 && (
                  <div style={{ textAlign: "center", marginTop: 10, padding: "12px",
                    borderRadius: 12, background: "rgba(16,185,129,0.07)" }}>
                    <p style={{ fontSize: 14, fontWeight: 800, color: C.emerald }}>🏆 All done today! +50 bonus pts</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── Quick Access ── */}
          <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase",
            letterSpacing: "1.1px", marginBottom: 12 }}>Quick Access</p>
          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            <QuickCard icon={Users}     label="Inner Circle"  href="ClientConnectionsPage" color={C.indigo} />
            <QuickCard icon={RotateCcw} label="Reset Button"  href="MentalReset"           color={C.teal}   />
            <QuickCard icon={Phone}     label="Lifeline"      href="tel:988" color={C.rose} external />
          </div>

          {/* ── Secondary links ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { label: "Recovery Path",       sub: "Your weekly plan & progress",  href: "RecoveryPath",         color: C.teal   },
              { label: "My Safety Plan",      sub: "Crisis roadmap & coping tools",href: "MySafetyPlan",         color: C.rose   },
              { label: "Community",           sub: "Voices of recovery",           href: "VoicesOfRecovery",     color: C.indigo },
            ].map(item => (
              <Link key={item.href} to={createPageUrl(item.href)} style={{ textDecoration: "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
                  borderRadius: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.color, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{item.label}</p>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{item.sub}</p>
                  </div>
                  <ArrowRight style={{ color: "rgba(255,255,255,0.2)", width: 14, height: 14 }} />
                </div>
              </Link>
            ))}
          </div>

          {/* ── Crisis strip ── */}
          <div style={{ marginTop: 20, borderRadius: 14, padding: "12px 16px",
            background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.12)",
            display: "flex", justifyContent: "space-around" }}>
            {[
              { href: "tel:988",    label: "988 Crisis",     color: "#F87171" },
              { href: "sms:741741", label: "Text 741741",    color: "#FCA5A5" },
            ].map(x => (
              <a key={x.href} href={x.href} style={{ textDecoration: "none", textAlign: "center" }}>
                <p style={{ fontSize: 12, fontWeight: 800, color: x.color }}>{x.label}</p>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 2 }}>Always available</p>
              </a>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}