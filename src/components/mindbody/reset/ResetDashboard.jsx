import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Award, ChevronRight, Pause, Play, Sparkles, Loader2 } from "lucide-react";
import { PHASES, BADGES, getPhaseForDay, getCurrentDay, getWorkoutForDay } from "./resetProgramData";
import ResetDailyChecklist from "./ResetDailyChecklist";
import ResetReflectionModal from "./ResetReflectionModal";

function computeStreak(logs) {
  const sorted = [...logs].sort((a, b) => new Date(b.log_date) - new Date(a.log_date));
  let n = 0;
  let cur = new Date(); cur.setHours(0, 0, 0, 0);
  for (const l of sorted) {
    const any = l.moved_body || l.ate_clean || l.hydrated || l.fasting_goal_met || l.mental_checkin;
    if (!any) continue;
    const d = new Date(l.log_date); d.setHours(0, 0, 0, 0);
    const diff = Math.round((cur - d) / 86400000);
    if (diff <= 1) { n++; cur = d; } else break;
  }
  return n;
}

export default function ResetDashboard({ program, logs, todayLog, onToggle, onReflect, onTogglePause, onSaveReflection, saving }) {
  const [reflectionOpen, setReflectionOpen] = useState(false);
  const day = getCurrentDay(program.started_at);
  const phase = getPhaseForDay(day);
  const percent = Math.round((day / 90) * 100);
  const workout = getWorkoutForDay(day);
  const streak = useMemo(() => computeStreak(logs), [logs]);

  const tasksDone = useMemo(() => {
    if (!todayLog) return 0;
    const keys = ["moved_body", "ate_clean", "hydrated", "mental_checkin"];
    if (program.fasting_enabled) keys.push("fasting_goal_met");
    return keys.filter(k => todayLog[k]).length;
  }, [todayLog, program.fasting_enabled]);

  const totalTasks = program.fasting_enabled ? 5 : 4;
  const dayComplete = tasksDone === totalTasks;

  const earnedBadges = BADGES.filter(b =>
    b.type === "day" ? day >= b.threshold : streak >= b.threshold
  );

  return (
    <div style={{ padding: "20px 16px 40px" }}>

      {/* Hero — Day X of 90 */}
      <div style={{
        background: `linear-gradient(135deg, ${phase.color}14, ${phase.color}04)`,
        border: `1px solid ${phase.color}35`,
        borderRadius: 18, padding: "24px 22px", marginBottom: 14,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 20,
              background: `${phase.color}18`, border: `1px solid ${phase.color}40`, marginBottom: 10 }}>
              <span style={{ fontSize: 12 }}>{phase.emoji}</span>
              <span style={{ fontSize: 11, fontWeight: 800, color: phase.color, letterSpacing: ".06em" }}>{phase.label}</span>
            </div>
            <p style={{ fontFamily: "'Lora', serif", fontSize: 32, fontWeight: 600, color: "#1C1410", lineHeight: 1 }}>
              Day {day} <span style={{ fontSize: 16, color: "#9B8E83", fontWeight: 500 }}>of 90</span>
            </p>
          </div>
          <button
            onClick={onTogglePause}
            disabled={saving}
            title={program.status === "active" ? "Pause program" : "Resume program"}
            style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "#FDFAF6", border: "1px solid #E8E2D9",
              cursor: saving ? "default" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#9B8E83", flexShrink: 0,
            }}
          >
            {program.status === "active"
              ? <Pause style={{ width: 14, height: 14 }} />
              : <Play style={{ width: 14, height: 14 }} />}
          </button>
        </div>

        <div style={{ height: 8, background: "#E8E2D9", borderRadius: 4, overflow: "hidden", marginBottom: 10 }}>
          <div style={{ height: "100%", width: `${percent}%`, background: phase.color, borderRadius: 4, transition: "width 0.6s ease" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ fontSize: 11, color: "#9B8E83", fontWeight: 600 }}>{percent}% complete</p>
          <p style={{ fontSize: 11, color: "#B8823A", fontWeight: 700 }}>🔥 {streak} day streak</p>
        </div>
      </div>

      {program.status === "paused" && (
        <div style={{
          background: "rgba(184,130,58,.08)", border: "1px solid rgba(184,130,58,.25)",
          borderRadius: 12, padding: "12px 14px", marginBottom: 14,
        }}>
          <p style={{ fontSize: 12, color: "#4A3F35", fontWeight: 600 }}>
            Program paused. Tap ▶ to resume when you're ready.
          </p>
        </div>
      )}

      {/* Daily message */}
      <div style={{
        background: "#FDFAF6", border: "1px solid #E8E2D9",
        borderRadius: 14, padding: "14px 18px", marginBottom: 20,
      }}>
        <p style={{ fontSize: 14, color: "#1C1410", fontStyle: "italic", lineHeight: 1.55, fontFamily: "'Lora', serif" }}>
          "{phase.tagline}"
        </p>
      </div>

      {/* Today's suggested workout */}
      <p style={{ fontSize: 10, fontWeight: 700, color: "#9B8E83", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 10 }}>
        Today's suggested workout
      </p>
      <div style={{
        background: "#FDFAF6", border: "1px solid #E8E2D9",
        borderRadius: 14, padding: "14px 16px", marginBottom: 20,
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10, flexShrink: 0,
          background: `${phase.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
        }}>
          💪
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#1C1410" }}>{workout.name}</p>
            <span style={{ fontSize: 10, fontWeight: 700, color: phase.color,
              background: `${phase.color}14`, padding: "2px 8px", borderRadius: 20 }}>
              {workout.minutes} min
            </span>
          </div>
          <p style={{ fontSize: 11, color: "#9B8E83" }}>{workout.detail}</p>
        </div>
      </div>

      {/* Daily checklist */}
      <p style={{ fontSize: 10, fontWeight: 700, color: "#9B8E83", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 10 }}>
        Today's checklist
      </p>
      <ResetDailyChecklist
        log={todayLog}
        fastingEnabled={program.fasting_enabled}
        onToggle={onToggle}
      />

      {/* Reflection prompt when day complete */}
      {dayComplete && (
        <button
          onClick={() => setReflectionOpen(true)}
          style={{
            width: "100%", marginTop: 16, padding: "14px 16px", borderRadius: 14, cursor: "pointer",
            background: "linear-gradient(135deg, rgba(184,130,58,.12), rgba(122,158,126,.05))",
            border: "1px solid rgba(184,130,58,.3)",
            display: "flex", alignItems: "center", gap: 12, textAlign: "left",
          }}
        >
          <Sparkles style={{ width: 18, height: 18, color: "#B8823A", flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#1C1410" }}>Day {day} complete</p>
            <p style={{ fontSize: 11, color: "#4A3F35" }}>Take a moment to reflect →</p>
          </div>
        </button>
      )}

      {/* Phase focus */}
      <p style={{ fontSize: 10, fontWeight: 700, color: "#9B8E83", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 10, marginTop: 24 }}>
        This phase's focus
      </p>
      <div style={{ background: "#FDFAF6", border: "1px solid #E8E2D9", borderRadius: 14, padding: "16px 18px", marginBottom: 20 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: phase.color, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>
          Fitness
        </p>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, marginBottom: 14 }}>
          {phase.fitness.map(f => (
            <li key={f} style={{ fontSize: 13, color: "#4A3F35", padding: "2px 0", lineHeight: 1.5 }}>• {f}</li>
          ))}
        </ul>
        <p style={{ fontSize: 11, fontWeight: 700, color: phase.color, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>
          Nutrition
        </p>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, marginBottom: program.fasting_enabled ? 14 : 0 }}>
          {phase.nutrition.map(n => (
            <li key={n} style={{ fontSize: 13, color: "#4A3F35", padding: "2px 0", lineHeight: 1.5 }}>• {n}</li>
          ))}
        </ul>
        {program.fasting_enabled && (
          <>
            <p style={{ fontSize: 11, fontWeight: 700, color: phase.color, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>
              Fasting
            </p>
            <p style={{ fontSize: 13, color: "#4A3F35", lineHeight: 1.5 }}>• {phase.fasting}</p>
          </>
        )}
        {phase.weeklyChallenge && (
          <div style={{ marginTop: 14, padding: "10px 12px", borderRadius: 10,
            background: "rgba(184,130,58,.06)", border: "1px solid rgba(184,130,58,.2)" }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#B8823A", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 3 }}>
              Weekly Challenge
            </p>
            <p style={{ fontSize: 12, color: "#1C1410", fontWeight: 600 }}>{phase.weeklyChallenge}</p>
          </div>
        )}
      </div>

      {/* Quick links to Mind-Body tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <Link to="/MindBodyRecovery" style={{ flex: 1, textDecoration: "none" }}>
          <div style={{
            padding: "11px 14px", borderRadius: 12,
            background: "#FDFAF6", border: "1px solid #E8E2D9",
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
          }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#4A3F35" }}>Open Mind-Body tabs</span>
            <ChevronRight style={{ width: 14, height: 14, color: "#9B8E83" }} />
          </div>
        </Link>
      </div>

      {/* Badges */}
      <p style={{ fontSize: 10, fontWeight: 700, color: "#9B8E83", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 10 }}>
        Badges
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {BADGES.map(b => {
          const earned = earnedBadges.some(e => e.key === b.key);
          return (
            <div key={b.key} style={{
              padding: "14px 12px", borderRadius: 12, textAlign: "center",
              background: "#FDFAF6",
              border: earned ? "1px solid rgba(184,130,58,.35)" : "1px solid #E8E2D9",
              opacity: earned ? 1 : 0.55,
            }}>
              <Award style={{ width: 20, height: 20, color: earned ? "#B8823A" : "#9B8E83", margin: "0 auto 4px" }} strokeWidth={1.6} />
              <p style={{ fontSize: 12, fontWeight: 700, color: "#1C1410", marginBottom: 2 }}>{b.label}</p>
              <p style={{ fontSize: 10, color: "#9B8E83" }}>{b.desc}</p>
            </div>
          );
        })}
      </div>

      {/* 90-day complete */}
      {day >= 90 && (
        <div style={{
          marginTop: 20, padding: "22px 20px", borderRadius: 16, textAlign: "center",
          background: "linear-gradient(135deg, rgba(155,138,184,.15), rgba(184,130,58,.05))",
          border: "1px solid rgba(155,138,184,.35)",
        }}>
          <p style={{ fontSize: 40, marginBottom: 8 }}>💎</p>
          <h3 style={{ fontFamily: "'Lora', serif", fontSize: 20, fontWeight: 600, color: "#1C1410", marginBottom: 6 }}>
            You did what most people won't.
          </h3>
          <p style={{ fontSize: 13, color: "#4A3F35", lineHeight: 1.6 }}>
            90 days of showing up. This is who you are now.
          </p>
        </div>
      )}

      <p style={{ textAlign: "center", fontSize: 11, color: "#9B8E83", marginTop: 20, lineHeight: 1.6, fontStyle: "italic" }}>
        Consistency over perfection.
      </p>

      {reflectionOpen && (
        <ResetReflectionModal
          day={day}
          onSave={(text, mood) => { onSaveReflection(text, mood); setReflectionOpen(false); }}
          onClose={() => setReflectionOpen(false)}
        />
      )}
    </div>
  );
}