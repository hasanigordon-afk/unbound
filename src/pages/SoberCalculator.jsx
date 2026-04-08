import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, Clock, DollarSign, Trophy, Lock, Check, Edit3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MILESTONES = [
  { days: 1,    label: "24 Hours",    emoji: "🌅", reward: "Survived the first day",          color: "#94A3B8" },
  { days: 3,    label: "72 Hours",    emoji: "🧠", reward: "Brain chemistry begins to reset",  color: "#60A5FA" },
  { days: 7,    label: "1 Week",      emoji: "🔥", reward: "One week warrior — streak badge",  color: "#F97316" },
  { days: 14,   label: "2 Weeks",     emoji: "⚡", reward: "Sleep & energy dramatically improved", color: "#EAB308" },
  { days: 30,   label: "30 Days",     emoji: "🏅", reward: "1-Month Medal — your first milestone", color: "#10B981" },
  { days: 60,   label: "60 Days",     emoji: "🌿", reward: "Habits are forming. Body healing.",color: "#34D399" },
  { days: 90,   label: "90 Days",     emoji: "🦅", reward: "Phoenix Rising — 90-day champion", color: "#A78BFA" },
  { days: 180,  label: "6 Months",    emoji: "⭐", reward: "Half-year hero — share your story", color: "#F472B6" },
  { days: 365,  label: "1 Year",      emoji: "🏆", reward: "One Year Sober — legendary status", color: "#C9A96E" },
  { days: 730,  label: "2 Years",     emoji: "💎", reward: "Two years of freedom. Unstoppable.", color: "#38BDF8" },
  { days: 1825, label: "5 Years",     emoji: "👑", reward: "5-Year Crown — a life rebuilt.",   color: "#FB923C" },
];

const LS_KEY = "rebos_sober_start";
const SPEND_KEY = "rebos_daily_spend";

function pad(n) { return String(Math.floor(n)).padStart(2, "0"); }

function calcTime(startMs) {
  const diff = Math.max(0, Date.now() - startMs);
  const totalSecs = Math.floor(diff / 1000);
  const days    = Math.floor(totalSecs / 86400);
  const hours   = Math.floor((totalSecs % 86400) / 3600);
  const minutes = Math.floor((totalSecs % 3600) / 60);
  const seconds = totalSecs % 60;
  return { days, hours, minutes, seconds, totalDays: diff / 86400000 };
}

export default function SoberCalculator() {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState(() => localStorage.getItem(LS_KEY) || "");
  const [dailySpend, setDailySpend] = useState(() => parseFloat(localStorage.getItem(SPEND_KEY)) || 20);
  const [editingDate, setEditingDate] = useState(!localStorage.getItem(LS_KEY));
  const [editingSpend, setEditingSpend] = useState(false);
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, totalDays: 0 });

  const startMs = startDate ? new Date(startDate).getTime() : null;

  const tick = useCallback(() => {
    if (!startMs) return;
    setTime(calcTime(startMs));
  }, [startMs]);

  useEffect(() => {
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [tick]);

  const saveDate = (val) => {
    setStartDate(val);
    localStorage.setItem(LS_KEY, val);
    setEditingDate(false);
  };

  const saveSpend = (val) => {
    const n = parseFloat(val) || 0;
    setDailySpend(n);
    localStorage.setItem(SPEND_KEY, n);
    setEditingSpend(false);
  };

  const moneySaved = Math.round(time.totalDays * dailySpend);
  const { days, hours, minutes, seconds } = time;

  const nextMilestone = MILESTONES.find(m => m.days > time.totalDays);
  const daysToNext = nextMilestone ? Math.ceil(nextMilestone.days - time.totalDays) : 0;

  return (
    <div style={{ background: "linear-gradient(170deg,#07090F 0%,#0A0F1A 100%)", minHeight: "100vh", paddingBottom: 100 }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ background: "linear-gradient(150deg,#0D1020 0%,#08091A 100%)", padding: "60px 24px 28px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -80, right: -60, width: 280, height: 280, borderRadius: "50%",
            background: "radial-gradient(circle,rgba(45,212,191,0.09) 0%,transparent 70%)", pointerEvents: "none" }} />
          <button onClick={() => navigate(-1)} style={{ display: "flex", alignItems: "center", gap: 6,
            background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer",
            fontSize: 12, marginBottom: 18, padding: 0 }}>
            <ChevronLeft style={{ width: 15, height: 15 }} /> Back
          </button>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#2DD4BF", textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 4 }}>
            Your Journey
          </p>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "#fff", lineHeight: 1.15, marginBottom: 4 }}>
            Sober Calculator
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>
            Every second counts. See exactly how far you've come.
          </p>
        </div>

        <div style={{ padding: "20px 16px" }}>

          {/* Set Start Date */}
          {editingDate ? (
            <div style={{ borderRadius: 22, padding: "22px 20px", marginBottom: 16,
              background: "rgba(45,212,191,0.07)", border: "1px solid rgba(45,212,191,0.2)" }}>
              <p style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginBottom: 4 }}>Set Your Sobriety Start Date</p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 14 }}>Enter the date (and optionally time) you began your journey.</p>
              <input
                type="datetime-local"
                defaultValue={startDate || new Date().toISOString().slice(0, 16)}
                id="start-input"
                style={{ width: "100%", padding: "12px 14px", borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.06)",
                  color: "#fff", fontSize: 14, boxSizing: "border-box", outline: "none", marginBottom: 12 }}
              />
              <button
                onClick={() => {
                  const val = document.getElementById("start-input").value;
                  if (val) saveDate(val);
                }}
                style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", cursor: "pointer",
                  background: "linear-gradient(135deg,#2DD4BF,#22C5B0)", color: "#07090F", fontWeight: 800, fontSize: 15 }}>
                Start Tracking →
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "12px 16px", borderRadius: 14, marginBottom: 16,
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 2, fontWeight: 600 }}>SOBER SINCE</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>
                  {new Date(startDate).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>
              <button onClick={() => setEditingDate(true)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", padding: 6 }}>
                <Edit3 style={{ width: 15, height: 15 }} />
              </button>
            </div>
          )}

          {/* Live Timer */}
          {startMs && (
            <>
              <div style={{ borderRadius: 24, padding: "28px 20px", marginBottom: 16, textAlign: "center",
                background: "linear-gradient(135deg,rgba(45,212,191,0.08),rgba(99,102,241,0.05))",
                border: "1px solid rgba(45,212,191,0.15)",
                boxShadow: "0 8px 40px rgba(45,212,191,0.08)" }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#2DD4BF", textTransform: "uppercase",
                  letterSpacing: ".12em", marginBottom: 20 }}>⏱ Time Sober</p>

                <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 8 }}>
                  {[
                    { value: days, label: "Days" },
                    { value: pad(hours), label: "Hours" },
                    { value: pad(minutes), label: "Min" },
                    { value: pad(seconds), label: "Sec" },
                  ].map((unit, i) => (
                    <React.Fragment key={unit.label}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: i === 0 ? 52 : 36, fontWeight: 900, color: "#fff", lineHeight: 1,
                          fontVariantNumeric: "tabular-nums", letterSpacing: "-1px",
                          textShadow: "0 0 20px rgba(45,212,191,0.3)" }}>
                          {i === 0 ? days : unit.value}
                        </div>
                        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: 700,
                          textTransform: "uppercase", letterSpacing: ".08em", marginTop: 4 }}>
                          {unit.label}
                        </p>
                      </div>
                      {i < 3 && <div style={{ fontSize: 28, color: "rgba(255,255,255,0.2)", lineHeight: 1, paddingTop: 4 }}>:</div>}
                    </React.Fragment>
                  ))}
                </div>

                {nextMilestone && (
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 14 }}>
                    {daysToNext === 0 ? "🎉 Milestone reached today!" : `${daysToNext} day${daysToNext !== 1 ? "s" : ""} until ${nextMilestone.label}`}
                  </p>
                )}
              </div>

              {/* Money Saved */}
              <div style={{ borderRadius: 22, padding: "22px 20px", marginBottom: 16,
                background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.2)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 12,
                      background: "rgba(16,185,129,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <DollarSign style={{ color: "#10B981", width: 18, height: 18 }} />
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>Money Saved</p>
                      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>vs. daily substance spending</p>
                    </div>
                  </div>
                  <button onClick={() => setEditingSpend(true)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", padding: 4 }}>
                    <Edit3 style={{ width: 13, height: 13 }} />
                  </button>
                </div>

                {editingSpend ? (
                  <div style={{ display: "flex", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1,
                      padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)",
                      background: "rgba(255,255,255,0.06)" }}>
                      <span style={{ color: "#10B981", fontWeight: 700 }}>$</span>
                      <input
                        type="number" defaultValue={dailySpend} id="spend-input" min="0" step="1"
                        style={{ background: "none", border: "none", color: "#fff", fontSize: 14,
                          outline: "none", width: "100%" }} placeholder="Daily spend" />
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>/day</span>
                    </div>
                    <button onClick={() => saveSpend(document.getElementById("spend-input").value)}
                      style={{ padding: "10px 14px", borderRadius: 10, border: "none", cursor: "pointer",
                        background: "#10B981", color: "#fff", fontWeight: 700, fontSize: 13 }}>
                      Save
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 16 }}>
                    <div>
                      <p style={{ fontSize: 48, fontWeight: 900, color: "#10B981", lineHeight: 1,
                        textShadow: "0 0 20px rgba(16,185,129,0.3)" }}>
                        ${moneySaved.toLocaleString()}
                      </p>
                      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>
                        Based on ${dailySpend}/day estimate
                      </p>
                    </div>
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 14 }}>
                  {[
                    { label: "This week",  value: `$${Math.round(Math.min(time.totalDays, 7) * dailySpend)}` },
                    { label: "This month", value: `$${Math.round(Math.min(time.totalDays, 30) * dailySpend)}` },
                    { label: "This year",  value: `$${Math.round(Math.min(time.totalDays, 365) * dailySpend)}` },
                  ].map(s => (
                    <div key={s.label} style={{ textAlign: "center", padding: "10px 8px", borderRadius: 10,
                      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <p style={{ fontSize: 15, fontWeight: 900, color: "#10B981" }}>{s.value}</p>
                      <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2, fontWeight: 600 }}>{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Milestones */}
              <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase",
                letterSpacing: "1.1px", marginBottom: 12 }}>🏆 Milestone Journey</p>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                {MILESTONES.map(m => {
                  const achieved = time.totalDays >= m.days;
                  const isCurrent = !achieved && MILESTONES.filter(x => time.totalDays >= x.days).length === MILESTONES.indexOf(m);
                  const daysLeft = Math.ceil(m.days - time.totalDays);

                  return (
                    <div key={m.days} style={{
                      borderRadius: 18, padding: "16px 18px",
                      background: achieved
                        ? `linear-gradient(135deg,${m.color}10,rgba(255,255,255,0.03))`
                        : "rgba(255,255,255,0.03)",
                      border: `1.5px solid ${achieved ? m.color + "35" : isCurrent ? m.color + "25" : "rgba(255,255,255,0.06)"}`,
                      opacity: !achieved && !isCurrent && m.days > time.totalDays + 365 ? 0.5 : 1,
                      transition: "all 0.3s ease",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        {/* Icon */}
                        <div style={{ width: 48, height: 48, borderRadius: 16, flexShrink: 0,
                          background: achieved ? `${m.color}20` : "rgba(255,255,255,0.05)",
                          border: `1.5px solid ${achieved ? m.color + "40" : "rgba(255,255,255,0.08)"}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: achieved ? 24 : 20,
                          filter: achieved ? "none" : "grayscale(1)",
                          boxShadow: achieved ? `0 0 16px ${m.color}30` : "none" }}>
                          {achieved ? m.emoji : <Lock style={{ width: 16, height: 16, color: "rgba(255,255,255,0.2)" }} />}
                        </div>

                        {/* Text */}
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                            <p style={{ fontSize: 15, fontWeight: 900,
                              color: achieved ? "#fff" : "rgba(255,255,255,0.4)" }}>{m.label}</p>
                            {achieved && (
                              <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 20,
                                background: `${m.color}20`, color: m.color, border: `1px solid ${m.color}40` }}>
                                UNLOCKED ✓
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: 12,
                            color: achieved ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.2)",
                            lineHeight: 1.4 }}>
                            {achieved ? m.reward : isCurrent ? `${daysLeft} day${daysLeft !== 1 ? "s" : ""} away — keep going` : `Locked — ${daysLeft} days to go`}
                          </p>
                        </div>

                        {/* Check or lock */}
                        {achieved && (
                          <div style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                            background: m.color, display: "flex", alignItems: "center", justifyContent: "center",
                            boxShadow: `0 0 12px ${m.color}50` }}>
                            <Check style={{ width: 14, height: 14, color: "#fff", strokeWidth: 3 }} />
                          </div>
                        )}
                      </div>

                      {/* Progress bar for next milestone */}
                      {isCurrent && (
                        <div style={{ marginTop: 12 }}>
                          <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: 4, height: 5, overflow: "hidden" }}>
                            <div style={{
                              height: "100%", borderRadius: 4,
                              width: `${Math.min(100, (time.totalDays / m.days) * 100)}%`,
                              background: m.color, transition: "width 0.5s ease",
                              boxShadow: `0 0 8px ${m.color}60`,
                            }} />
                          </div>
                          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 4, textAlign: "right" }}>
                            {Math.round((time.totalDays / m.days) * 100)}% of {m.label}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}