import React, { useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import {
  CalendarCheck, Flame, CheckCircle2, Circle,
  Users, RotateCcw, Phone, ArrowRight, Loader2, Zap
} from "lucide-react";

const C = {
  amber:   "#B8823A",
  green:   "#7A9E7E",
  red:     "#C9534F",
  muted:   "#9B8E83",
  text:    "#1C1410",
  bg:      "#F7F3EE",
  surface: "#FDFAF6",
  border:  "#E8E2D9",
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
      flex: 1, borderRadius: 14, padding: "16px 10px",
      background: C.surface, border: `.5px solid ${C.border}`,
      display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
      cursor: "pointer",
    }}>
      <div style={{ width: 42, height: 42, borderRadius: 12,
        background: `${color}15`, border: `1px solid ${color}30`,
        display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon style={{ color, width: 20, height: 20 }} strokeWidth={1.8} />
      </div>
      <p style={{ fontSize: 11, fontWeight: 700, color: C.text, textAlign: "center" }}>{label}</p>
    </div>
  );
  if (external) return <a href={href} style={{ flex: 1, textDecoration: "none" }}>{inner}</a>;
  return <Link to={createPageUrl(href)} style={{ flex: 1, textDecoration: "none" }}>{inner}</Link>;
}

function FlowTask({ task, done, onToggle }) {
  return (
    <button type="button" onClick={() => onToggle(task, done)} style={{
      width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "13px 16px",
      borderRadius: 12, cursor: "pointer", textAlign: "left",
      background: done ? "rgba(122,158,126,0.08)" : C.bg,
      border: `.5px solid ${done ? "rgba(122,158,126,0.3)" : C.border}`,
      marginBottom: 8, fontFamily: "inherit"
    }}>
      {done
        ? <CheckCircle2 style={{ color: C.green, width: 18, height: 18, flexShrink: 0 }} />
        : <Circle style={{ color: C.muted, width: 18, height: 18, flexShrink: 0 }} />}
      <p style={{ fontSize: 14, fontWeight: 600,
        color: done ? C.green : C.text,
        textDecoration: done ? "line-through" : "none",
        opacity: done ? 0.7 : 1 }}>
        {task.title}
      </p>
      {task.tag && (
        <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, color: C.amber,
          background: "rgba(184,130,58,.10)", padding: "3px 8px", borderRadius: 10, flexShrink: 0 }}>
          {task.tag}
        </span>
      )}
    </button>
  );
}

export default function MyFoundation() {
  const today = new Date().toISOString().split("T")[0];
  const todayDow = new Date().getDay();
  const quote = MOTIVATIONAL[new Date().getDay() % MOTIVATIONAL.length];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const qc = useQueryClient();
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

  const todayTasks = useMemo(() =>
    pathTasks.filter(t => t.days_of_week?.includes(todayDow) || t.recurrence === "daily"),
    [pathTasks, todayDow]
  );
  const completionMap = useMemo(() => {
    const m = {};
    pathCompletions.forEach(c => { m[c.task_id] = c.status; });
    return m;
  }, [pathCompletions]);

  const doneTasks = todayTasks.filter(t => completionMap[t.id] === "done");
  const flowPct   = todayTasks.length > 0 ? Math.round((doneTasks.length / todayTasks.length) * 100) : 0;

  const toggleTask = async (task, done) => {
    if (!user?.email) return;
    const existing = pathCompletions.find(c => c.task_id === task.id);
    if (done && existing?.id) {
      await base44.entities.RecoveryPathCompletion.delete(existing.id);
    } else if (!done) {
      await base44.entities.RecoveryPathCompletion.create({
        user_email: user.email,
        task_id: task.id,
        task_title: task.title,
        task_category: task.category,
        task_priority: task.priority,
        completion_date: today,
        status: "done",
        points_earned: task.is_essential ? 15 : 10,
      });
    }
    qc.invalidateQueries({ queryKey: ["foundation-rp-completions", user.email, today] });
  };

  const firstName = user?.full_name?.split(" ")[0] || "there";
  const dateStr   = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  if (isLoading) return (
    <div style={{ background: C.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Loader2 style={{ color: C.amber, width: 28, height: 28 }} className="animate-spin" />
    </div>
  );

  return (
    <div style={{ background: C.bg, minHeight: "100vh", paddingBottom: 110 }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ padding: "60px 24px 28px", background: C.surface, borderBottom: `1px solid ${C.border}` }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: C.amber, textTransform: "uppercase",
            letterSpacing: ".12em", marginBottom: 4 }}>My Foundation</p>
          <h1 style={{ fontFamily: "'Lora', serif", fontSize: 28, fontWeight: 600, color: C.text,
            marginBottom: 2, lineHeight: 1.15 }}>
            {greeting}, {firstName}.
          </h1>
          <p style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>{dateStr}</p>

          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px",
              borderRadius: 14, background: streak > 0 ? "rgba(184,130,58,.10)" : C.bg,
              border: `1px solid ${streak > 0 ? "rgba(184,130,58,.25)" : C.border}` }}>
              <Flame style={{ color: C.amber, width: 18, height: 18 }} />
              <div>
                <p style={{ fontSize: 22, fontWeight: 700, color: C.amber, lineHeight: 1 }}>{streak}</p>
                <p style={{ fontSize: 10, color: C.muted, fontWeight: 600 }}>day streak</p>
              </div>
            </div>
            <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, fontStyle: "italic", flex: 1 }}>"{quote}"</p>
          </div>
        </div>

        <div style={{ padding: "20px 16px" }}>

          {/* Daily Check-In CTA */}
          <Link to={createPageUrl("DailyCheckIn")} style={{ textDecoration: "none", display: "block", marginBottom: 14 }}>
            <div style={{
              borderRadius: 16, padding: "18px 20px",
              background: checkedToday ? "rgba(122,158,126,.08)" : "rgba(184,130,58,.07)",
              border: `1px solid ${checkedToday ? "rgba(122,158,126,.3)" : "rgba(184,130,58,.28)"}`,
              display: "flex", alignItems: "center", gap: 16,
            }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                background: checkedToday ? "rgba(122,158,126,.15)" : "rgba(184,130,58,.12)",
                display: "flex", alignItems: "center", justifyContent: "center" }}>
                {checkedToday
                  ? <CheckCircle2 style={{ color: C.green, width: 24, height: 24 }} />
                  : <CalendarCheck style={{ color: C.amber, width: 24, height: 24 }} />}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 16, fontWeight: 700, color: checkedToday ? C.green : C.text, marginBottom: 3 }}>
                  {checkedToday ? "Check-In Complete ✓" : "Daily Check-In"}
                </p>
                <p style={{ fontSize: 13, color: C.muted }}>
                  {checkedToday ? `${streak} days in a row — keep your streak alive.` : "30 seconds · Start your day strong"}
                </p>
              </div>
              <ArrowRight style={{ color: checkedToday ? C.green : C.amber, width: 16, height: 16, flexShrink: 0 }} />
            </div>
          </Link>

          {/* Daily Flow */}
          <div style={{ borderRadius: 16, padding: "18px", marginBottom: 14,
            background: C.surface, border: `.5px solid ${C.border}` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Zap style={{ color: C.amber, width: 15, height: 15 }} />
                <p style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Today's Daily Flow</p>
              </div>
              {todayTasks.length > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: C.amber }}>{flowPct}%</p>
                  <div style={{ width: 48, height: 5, borderRadius: 3, background: C.border, overflow: "hidden" }}>
                    <div style={{ width: `${flowPct}%`, height: "100%", borderRadius: 3,
                      background: C.amber, transition: "width 0.5s ease" }} />
                  </div>
                </div>
              )}
            </div>

            {todayTasks.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <p style={{ fontSize: 13, color: C.muted, marginBottom: 10 }}>No tasks planned for today yet.</p>
                <Link to={createPageUrl("RecoveryPath")} style={{ textDecoration: "none" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.amber,
                    background: "rgba(184,130,58,.10)", padding: "6px 14px", borderRadius: 10,
                    border: "1px solid rgba(184,130,58,.25)" }}>
                    Build My Weekly Plan →
                  </span>
                </Link>
              </div>
            ) : (
              <>
                {todayTasks.slice(0, 5).map(task => (
                  <FlowTask key={task.id}
                    task={{ ...task, tag: task.is_essential ? "Must-Do" : null }}
                    done={completionMap[task.id] === "done"}
                    onToggle={toggleTask}
                  />
                ))}
                {todayTasks.length > 5 && (
                  <Link to={createPageUrl("RecoveryPath")} style={{ textDecoration: "none" }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: C.amber, textAlign: "center", marginTop: 6, padding: "8px" }}>
                      +{todayTasks.length - 5} more tasks → Open Recovery Path
                    </p>
                  </Link>
                )}
                {doneTasks.length === todayTasks.length && todayTasks.length > 0 && (
                  <div style={{ textAlign: "center", marginTop: 10, padding: "12px",
                    borderRadius: 12, background: "rgba(122,158,126,.07)" }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: C.green }}>🏆 All done today!</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Quick Access */}
          <p style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase",
            letterSpacing: ".1em", marginBottom: 12 }}>Quick Access</p>
          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            <QuickCard icon={Users}     label="Inner Circle" href="ClientConnectionsPage" color="#7B8FA8" />
            <QuickCard icon={RotateCcw} label="Reset Button" href="MentalReset"           color={C.green}  />
            <QuickCard icon={Phone}     label="Lifeline"     href="tel:988"               color={C.red}   external />
          </div>

          {/* Secondary links */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { label: "Recovery Path",  sub: "Your weekly plan & progress",   href: "RecoveryPath"     },
              { label: "My Safety Plan", sub: "Crisis roadmap & coping tools",  href: "MySafetyPlan"     },
              { label: "Community",      sub: "Voices of recovery",             href: "VoicesOfRecovery" },
            ].map(item => (
              <Link key={item.href} to={createPageUrl(item.href)} style={{ textDecoration: "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
                  borderRadius: 14, background: C.surface, border: `.5px solid ${C.border}` }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.amber, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{item.label}</p>
                    <p style={{ fontSize: 11, color: C.muted }}>{item.sub}</p>
                  </div>
                  <ArrowRight style={{ color: C.muted, width: 14, height: 14 }} />
                </div>
              </Link>
            ))}
          </div>

          {/* Crisis strip */}
          <div style={{ marginTop: 20, borderRadius: 14, padding: "12px 16px",
            background: "rgba(201,83,79,.06)", border: "1px solid rgba(201,83,79,.18)",
            display: "flex", justifyContent: "space-around" }}>
            {[
              { href: "tel:988",    label: "988 Crisis"  },
              { href: "sms:741741", label: "Text 741741" },
            ].map(x => (
              <a key={x.href} href={x.href} style={{ textDecoration: "none", textAlign: "center" }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: C.red }}>{x.label}</p>
                <p style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>Always available</p>
              </a>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}