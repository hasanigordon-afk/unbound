import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { Check, Activity, Apple, Droplet, Timer, Brain, Flame, ArrowRight } from "lucide-react";

const TASKS = [
  { key: "moved_body",       label: "Move your body",     sub: "Any movement counts",       icon: Activity, color: "#7A9E7E" },
  { key: "ate_clean",        label: "Eat clean",          sub: "Log a gut-friendly meal",   icon: Apple,    color: "#5F9E8A" },
  { key: "hydrated",         label: "Hydrate",            sub: "Water throughout the day",  icon: Droplet,  color: "#7B8FA8" },
  { key: "fasting_goal_met", label: "Fasting goal",       sub: "Only if active",            icon: Timer,    color: "#B8823A" },
  { key: "mental_checkin",   label: "Mental check-in",    sub: "Quick mood note",           icon: Brain,    color: "#9B8AB8" },
];

export default function DailyFlowTab({ log, streak, onToggle }) {
  const completed = useMemo(
    () => TASKS.filter(t => log?.[t.key]).length,
    [log]
  );
  const percent = Math.round((completed / TASKS.length) * 100);
  const circumference = 2 * Math.PI * 42;
  const dashOffset = circumference - (circumference * percent) / 100;

  return (
    <div style={{ padding: "20px 16px" }}>

      {/* Progress + streak */}
      <div style={{
        background: "#FDFAF6", border: "1px solid #E8E2D9",
        borderRadius: 16, padding: "24px 20px", marginBottom: 16,
        display: "flex", alignItems: "center", gap: 20,
      }}>
        <div style={{ position: "relative", width: 100, height: 100, flexShrink: 0 }}>
          <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="50" cy="50" r="42" fill="none" stroke="#E8E2D9" strokeWidth="7" />
            <circle
              cx="50" cy="50" r="42" fill="none"
              stroke="#B8823A" strokeWidth="7" strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              style={{ transition: "stroke-dashoffset 0.6s ease" }}
            />
          </svg>
          <div style={{
            position: "absolute", inset: 0, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
          }}>
            <p style={{ fontSize: 24, fontWeight: 800, color: "#1C1410", lineHeight: 1 }}>{percent}%</p>
            <p style={{ fontSize: 10, color: "#9B8E83", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", marginTop: 2 }}>Today</p>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 11px", borderRadius: 20,
            background: "rgba(184,130,58,.10)", border: "1px solid rgba(184,130,58,.25)", marginBottom: 8 }}>
            <Flame style={{ width: 12, height: 12, color: "#B8823A" }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: "#B8823A" }}>{streak} day streak</span>
          </div>
          <p style={{ fontFamily: "'Lora', serif", fontSize: 16, fontWeight: 600, color: "#1C1410", lineHeight: 1.35, fontStyle: "italic" }}>
            "Control your body, control your life."
          </p>
        </div>
      </div>

      {/* Checklist */}
      <p style={{ fontSize: 10, fontWeight: 700, color: "#9B8E83", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 12 }}>
        Today's flow
      </p>
      <div style={{ background: "#FDFAF6", border: "1px solid #E8E2D9", borderRadius: 16, overflow: "hidden", marginBottom: 20 }}>
        {TASKS.map((t, i) => {
          const done = !!log?.[t.key];
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => onToggle(t.key, !done)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 14,
                padding: "14px 18px", background: "none", border: "none",
                borderBottom: i < TASKS.length - 1 ? "1px solid #E8E2D9" : "none",
                cursor: "pointer", textAlign: "left",
              }}
            >
              <div style={{
                width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                background: done ? t.color : `${t.color}15`,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background 0.2s ease",
              }}>
                {done
                  ? <Check style={{ width: 17, height: 17, color: "#fff" }} strokeWidth={2.5} />
                  : <Icon style={{ width: 16, height: 16, color: t.color }} strokeWidth={1.8} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: 14, fontWeight: 600, marginBottom: 1,
                  color: done ? "#9B8E83" : "#1C1410",
                  textDecoration: done ? "line-through" : "none",
                }}>
                  {t.label}
                </p>
                <p style={{ fontSize: 11, color: "#9B8E83" }}>{t.sub}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Recovery integration */}
      <div style={{
        background: "linear-gradient(135deg, rgba(184,130,58,.08), rgba(122,158,126,.05))",
        border: "1px solid rgba(184,130,58,.25)",
        borderRadius: 14, padding: "16px 18px", marginBottom: 16,
      }}>
        <p style={{ fontSize: 13, color: "#4A3F35", lineHeight: 1.65, fontStyle: "italic", marginBottom: 10 }}>
          A strong body supports a clear mind.
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link to="/DailyCheckIn" style={{ textDecoration: "none" }}>
            <div style={{ padding: "7px 14px", borderRadius: 20, background: "#FDFAF6",
              border: "1px solid #E8E2D9", fontSize: 12, color: "#4A3F35", fontWeight: 600,
              display: "inline-flex", alignItems: "center", gap: 6 }}>
              Daily Check-In <ArrowRight style={{ width: 11, height: 11 }} />
            </div>
          </Link>
          <Link to="/SubmitAhHa" style={{ textDecoration: "none" }}>
            <div style={{ padding: "7px 14px", borderRadius: 20, background: "#FDFAF6",
              border: "1px solid #E8E2D9", fontSize: 12, color: "#4A3F35", fontWeight: 600,
              display: "inline-flex", alignItems: "center", gap: 6 }}>
              Ah Ha Moment <ArrowRight style={{ width: 11, height: 11 }} />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}