import React, { useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Circle, Flame, Star, Trophy, Heart, Zap, Loader2 } from "lucide-react";

const MILESTONES = [
  { days: 1,   label: "Day 1",    sub: "The hardest step",         emoji: "🌱", color: "#7A9E7E" },
  { days: 3,   label: "3 Days",   sub: "Getting through it",        emoji: "💧", color: "#7B8FA8" },
  { days: 7,   label: "1 Week",   sub: "One week stronger",         emoji: "⭐", color: "#B8823A" },
  { days: 14,  label: "2 Weeks",  sub: "Building momentum",         emoji: "🔥", color: "#B8823A" },
  { days: 21,  label: "21 Days",  sub: "A new habit forming",       emoji: "🧠", color: "#9B8AB8" },
  { days: 30,  label: "30 Days",  sub: "One month of courage",      emoji: "🌟", color: "#B8823A" },
  { days: 45,  label: "45 Days",  sub: "Halfway to 90",             emoji: "🏃", color: "#7B8FA8" },
  { days: 60,  label: "60 Days",  sub: "Two months of growth",      emoji: "💎", color: "#9B8AB8" },
  { days: 90,  label: "90 Days",  sub: "The gold standard",         emoji: "👑", color: "#B8823A" },
  { days: 180, label: "6 Months", sub: "Half a year, new you",      emoji: "🦋", color: "#7A9E7E" },
  { days: 365, label: "1 Year",   sub: "365 days of transformation",emoji: "🏆", color: "#B8823A" },
];

const WEEKS_TO_SHOW = 12;

function buildWeekGrid(checkIns) {
  const map = new Set(checkIns.map(c => c.check_in_date?.slice(0, 10)));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = [];
  for (let i = WEEKS_TO_SHOW * 7 - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({ date: key, checked: map.has(key), future: false });
  }
  return days;
}

function calcStreak(checkIns) {
  const sorted = [...checkIns].sort((a, b) => new Date(b.check_in_date) - new Date(a.check_in_date));
  let n = 0, cur = new Date(); cur.setHours(0, 0, 0, 0);
  for (const c of sorted) {
    const d = new Date(c.check_in_date); d.setHours(0, 0, 0, 0);
    if (Math.round((cur - d) / 86400000) <= 1) { n++; cur = d; } else break;
  }
  return n;
}

export default function RecoveryRoadmap() {
  const navigate = useNavigate();
  const [selectedDay, setSelectedDay] = useState(null);

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: checkIns = [], isLoading } = useQuery({
    queryKey: ["roadmap-checkins", user?.email],
    queryFn: () => base44.entities.DailyCheckIn.filter({ participant_email: user.email }, "-check_in_date", 400),
    enabled: !!user?.email,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["roadmap-tasks", user?.email],
    queryFn: () => base44.entities.AftercareBuilderTask.filter({ user_email: user.email, completion_status: "complete" }),
    enabled: !!user?.email,
  });

  const streak = useMemo(() => calcStreak(checkIns), [checkIns]);
  const totalCheckIns = checkIns.length;
  const weekGrid = useMemo(() => buildWeekGrid(checkIns), [checkIns]);
  const completedTasks = tasks.length;

  const reachedMilestones = MILESTONES.filter(m => streak >= m.days);
  const nextMilestone = MILESTONES.find(m => streak < m.days);
  const progressToNext = nextMilestone
    ? Math.min(100, Math.round((streak / nextMilestone.days) * 100))
    : 100;

  const checkedOnDay = selectedDay
    ? checkIns.find(c => c.check_in_date?.slice(0, 10) === selectedDay)
    : null;

  const MOOD_LABELS = { 1: "😞 Very Low", 2: "😔 Low", 3: "😐 Okay", 4: "🙂 Good", 5: "😊 Great" };

  return (
    <div style={{ background: "#F7F3EE", minHeight: "100vh", paddingBottom: 110 }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ background: "#FDFAF6", borderBottom: "1px solid #E8E2D9", padding: "56px 20px 24px" }}>
          <button onClick={() => navigate(-1)} style={{
            display: "flex", alignItems: "center", gap: 6, background: "none", border: "none",
            color: "#9B8E83", fontSize: 13, fontWeight: 600, cursor: "pointer", marginBottom: 16, padding: 0,
          }}>
            <ArrowLeft style={{ width: 15, height: 15 }} /> Back
          </button>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#B8823A", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 6 }}>
            Your Journey
          </p>
          <h1 style={{ fontSize: 26, fontWeight: 600, color: "#1C1410", lineHeight: 1.2, marginBottom: 6, fontFamily: "'Lora', Georgia, serif" }}>
            Recovery Roadmap
          </h1>
          <p style={{ fontSize: 13, color: "#4A3F35", lineHeight: 1.65 }}>
            Every check-in is a step forward. Here's proof of how far you've come.
          </p>
        </div>

        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", paddingTop: 60 }}>
            <Loader2 style={{ width: 28, height: 28, color: "#B8823A" }} className="animate-spin" />
          </div>
        ) : (
          <div style={{ padding: "20px 16px" }}>

            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 24 }}>
              {[
                { label: "Day Streak", value: streak, icon: <Flame style={{ width: 14, height: 14 }} />, color: "#B8823A" },
                { label: "Check-Ins", value: totalCheckIns, icon: <CheckCircle2 style={{ width: 14, height: 14 }} />, color: "#7A9E7E" },
                { label: "Tasks Done", value: completedTasks, icon: <Star style={{ width: 14, height: 14 }} />, color: "#9B8AB8" },
              ].map(s => (
                <div key={s.label} style={{ background: "#FDFAF6", border: "1px solid #E8E2D9", borderRadius: 16, padding: "14px 12px", textAlign: "center" }}>
                  <div style={{ color: s.color, display: "flex", justifyContent: "center", marginBottom: 6 }}>{s.icon}</div>
                  <p style={{ fontSize: 26, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</p>
                  <p style={{ fontSize: 10, color: "#9B8E83", marginTop: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em" }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Next milestone progress */}
            {nextMilestone && (
              <div style={{ background: "#FDFAF6", border: "1px solid #E8E2D9", borderRadius: 16, padding: "18px 20px", marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <div>
                    <p style={{ fontSize: 12, color: "#9B8E83", marginBottom: 2 }}>Next milestone</p>
                    <p style={{ fontSize: 16, fontWeight: 700, color: "#1C1410" }}>
                      {nextMilestone.emoji} {nextMilestone.label}
                    </p>
                    <p style={{ fontSize: 12, color: "#4A3F35" }}>{nextMilestone.sub}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 28, fontWeight: 800, color: "#B8823A", lineHeight: 1 }}>{progressToNext}%</p>
                    <p style={{ fontSize: 11, color: "#9B8E83" }}>{nextMilestone.days - streak} days left</p>
                  </div>
                </div>
                <div style={{ height: 8, background: "#E8E2D9", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 4, width: `${progressToNext}%`,
                    background: "linear-gradient(90deg, #B8823A, #C9A96E)",
                    transition: "width 1s ease",
                  }} />
                </div>
              </div>
            )}

            {/* Milestone timeline */}
            <p className="section-label">Milestone Timeline</p>
            <div style={{ background: "#FDFAF6", border: "1px solid #E8E2D9", borderRadius: 16, padding: "20px 18px", marginBottom: 24 }}>
              {MILESTONES.map((m, i) => {
                const reached = streak >= m.days;
                const isNext = m === nextMilestone;
                return (
                  <div key={m.days} style={{ display: "flex", alignItems: "flex-start", gap: 14, paddingBottom: i < MILESTONES.length - 1 ? 20 : 0, position: "relative" }}>
                    {/* Connector line */}
                    {i < MILESTONES.length - 1 && (
                      <div style={{
                        position: "absolute", left: 17, top: 36, width: 2, height: "calc(100% - 16px)",
                        background: reached ? m.color : "#E8E2D9",
                        transition: "background 0.3s ease",
                      }} />
                    )}
                    {/* Node */}
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                      background: reached ? m.color : isNext ? "rgba(184,130,58,0.1)" : "#E8E2D9",
                      border: isNext ? `2px solid #B8823A` : "2px solid transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: reached ? 18 : 14,
                      filter: reached ? "none" : "grayscale(1) opacity(0.4)",
                      zIndex: 1,
                      transition: "all 0.3s ease",
                    }}>
                      {reached ? m.emoji : <Circle style={{ width: 14, height: 14, color: "#9B8E83" }} />}
                    </div>
                    {/* Label */}
                    <div style={{ flex: 1, paddingTop: 4 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: reached ? "#1C1410" : "#9B8E83", marginBottom: 2 }}>
                        {m.label}
                        {reached && <span style={{ marginLeft: 8, fontSize: 11, color: "#7A9E7E", fontWeight: 600 }}>✓ Reached</span>}
                        {isNext && <span style={{ marginLeft: 8, fontSize: 11, color: "#B8823A", fontWeight: 700 }}>← Next</span>}
                      </p>
                      <p style={{ fontSize: 12, color: reached ? "#4A3F35" : "#9B8E83" }}>{m.sub}</p>
                    </div>
                    {/* Days badge */}
                    <div style={{
                      padding: "4px 10px", borderRadius: 20,
                      background: reached ? `${m.color}18` : "#F3EDE4",
                      border: `1px solid ${reached ? m.color + "40" : "#E8E2D9"}`,
                      flexShrink: 0,
                    }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: reached ? m.color : "#9B8E83" }}>
                        Day {m.days}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Check-in heatmap */}
            <p className="section-label">Check-In History ({WEEKS_TO_SHOW} weeks)</p>
            <div style={{ background: "#FDFAF6", border: "1px solid #E8E2D9", borderRadius: 16, padding: "18px 16px", marginBottom: 24 }}>
              {/* Day labels */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 6 }}>
                {["S","M","T","W","T","F","S"].map((d, i) => (
                  <p key={i} style={{ fontSize: 9, fontWeight: 700, color: "#9B8E83", textAlign: "center", textTransform: "uppercase" }}>{d}</p>
                ))}
              </div>
              {/* Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
                {weekGrid.map((cell, i) => (
                  <button key={i}
                    onClick={() => setSelectedDay(selectedDay === cell.date ? null : cell.date)}
                    title={cell.date}
                    style={{
                      aspectRatio: "1", borderRadius: 5, border: "none", cursor: "pointer",
                      background: cell.checked
                        ? (selectedDay === cell.date ? "#B8823A" : "rgba(184,130,58,0.55)")
                        : (selectedDay === cell.date ? "#E8E2D9" : "#F3EDE4"),
                      transition: "all 0.15s ease",
                      outline: selectedDay === cell.date ? `2px solid #B8823A` : "none",
                    }}
                  />
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: "#F3EDE4", border: "1px solid #E8E2D9" }} />
                <p style={{ fontSize: 11, color: "#9B8E83" }}>No check-in</p>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: "rgba(184,130,58,0.55)" }} />
                <p style={{ fontSize: 11, color: "#9B8E83" }}>Checked in</p>
                <p style={{ fontSize: 11, color: "#9B8E83", marginLeft: "auto" }}>
                  {checkIns.filter(c => {
                    const d = new Date(c.check_in_date);
                    const ago = new Date(); ago.setDate(ago.getDate() - WEEKS_TO_SHOW * 7);
                    return d >= ago;
                  }).length} / {WEEKS_TO_SHOW * 7} days
                </p>
              </div>

              {/* Day detail popup */}
              {selectedDay && (
                <div style={{
                  marginTop: 14, padding: "14px 16px", borderRadius: 12,
                  background: "#F7F3EE", border: "1px solid #E8E2D9",
                }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#4A3F35", marginBottom: 6 }}>
                    {new Date(selectedDay + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                  </p>
                  {checkedOnDay ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {checkedOnDay.mood_rating && (
                        <p style={{ fontSize: 13, color: "#4A3F35" }}>
                          Mood: {MOOD_LABELS[checkedOnDay.mood_rating] || checkedOnDay.mood_rating}
                        </p>
                      )}
                      {checkedOnDay.craving_intensity !== undefined && (
                        <p style={{ fontSize: 13, color: "#4A3F35" }}>
                          Craving: {checkedOnDay.craving_intensity}/10
                        </p>
                      )}
                      {checkedOnDay.attended_meeting && (
                        <p style={{ fontSize: 13, color: "#7A9E7E" }}>✓ Attended a meeting</p>
                      )}
                      {checkedOnDay.connected_with_sponsor && (
                        <p style={{ fontSize: 13, color: "#7A9E7E" }}>✓ Connected with sponsor</p>
                      )}
                    </div>
                  ) : (
                    <p style={{ fontSize: 13, color: "#9B8E83" }}>No check-in recorded for this day.</p>
                  )}
                </div>
              )}
            </div>

            {/* Motivational close */}
            <div style={{
              background: "rgba(184,130,58,0.07)", border: "1px solid rgba(184,130,58,0.2)",
              borderRadius: 16, padding: "20px 20px", textAlign: "center",
            }}>
              <p style={{ fontSize: 22, marginBottom: 8 }}>
                {streak >= 90 ? "👑" : streak >= 30 ? "🌟" : streak >= 7 ? "🔥" : "🌱"}
              </p>
              <p style={{ fontSize: 15, fontWeight: 600, color: "#1C1410", fontFamily: "'Lora', serif", marginBottom: 6 }}>
                {streak >= 90
                  ? "90 days and beyond. You're an inspiration."
                  : streak >= 30
                  ? "30+ days. You're rewriting your story."
                  : streak >= 7
                  ? "One week strong. Keep the momentum."
                  : "Every single day counts. You showed up."}
              </p>
              <p style={{ fontSize: 13, color: "#4A3F35", lineHeight: 1.6 }}>
                Recovery isn't a straight line — it's a journey. Every check-in you've made is proof that you're trying, and that matters.
              </p>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}