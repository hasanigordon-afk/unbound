import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Star, Heart, Plus, Flame, Target, Quote } from "lucide-react";
import AhHaWidget from "@/components/ahha/AhHaWidget";

const C = {
  hope:    "#C9A96E",
  teal:    "#2DD4BF",
  indigo:  "#6366F1",
  emerald: "#10B981",
  purple:  "#8B5CF6",
  muted:   "rgba(241,245,249,0.4)",
};

const DAILY_MESSAGES = [
  "Every day sober is a victory worth celebrating.",
  "You are not your past. You are what you choose today.",
  "The strongest people are not those who show strength in front of us, but those who win battles we know nothing about.",
  "Recovery is not a race. You don't have to feel guilty if it takes you longer than you thought.",
  "You survived 100% of your hardest days so far.",
  "Change is possible. It's happening right now — in you.",
  "Someone out there needs your story. Keep going.",
];

const REACTIONS = [
  { key: "felt_this", emoji: "🫂", label: "I felt this" },
  { key: "strength",  emoji: "💪", label: "Gave me strength" },
  { key: "not_alone", emoji: "❤️", label: "Not alone" },
];

const GOAL_CATS = [
  { label: "Reconnect with family", emoji: "👨‍👩‍👧" },
  { label: "Get stable housing",    emoji: "🏠" },
  { label: "Find employment",       emoji: "💼" },
  { label: "Stay sober",            emoji: "🌱" },
  { label: "Improve mental health", emoji: "🧠" },
  { label: "Build new friendships", emoji: "🤝" },
];

export default function HopeHub() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [whyStartedMode, setWhyStartedMode] = useState(false);
  const [whyText, setWhyText] = useState("");
  const [savedWhy, setSavedWhy] = useState(() => localStorage.getItem("ahha_why_i_started") || "");
  const dailyMsg = DAILY_MESSAGES[new Date().getDay() % DAILY_MESSAGES.length];

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: moments = [] } = useQuery({
    queryKey: ["hope-moments"],
    queryFn: () => base44.entities.AhHaMoment.filter({ status: "approved" }, "-created_date", 3),
    staleTime: 60_000,
  });

  const { data: checkIns = [] } = useQuery({
    queryKey: ["hope-checkins", user?.email],
    queryFn: () => base44.entities.DailyCheckIn.filter({ participant_email: user.email }, "-check_in_date", 90),
    enabled: !!user?.email,
  });

  const { data: goals = [] } = useQuery({
    queryKey: ["hope-goals", user?.email],
    queryFn: () => base44.entities.FutureYouGoal.filter({ user_email: user.email, is_active: true }),
    enabled: !!user?.email,
  });

  const addGoalMutation = useMutation({
    mutationFn: (title) => base44.entities.FutureYouGoal.create({
      user_email: user.email, title, timeframe: "1_year", category: "personal", is_active: true,
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["hope-goals"] }),
  });

  const streak = (() => {
    const sorted = [...checkIns].sort((a, b) => new Date(b.check_in_date) - new Date(a.check_in_date));
    let n = 0, cur = new Date(); cur.setHours(0, 0, 0, 0);
    for (const c of sorted) {
      const d = new Date(c.check_in_date); d.setHours(0, 0, 0, 0);
      if (Math.round((cur - d) / 86400000) <= 1) { n++; cur = d; } else break;
    }
    return n;
  })();

  const handleSaveWhy = () => {
    localStorage.setItem("ahha_why_i_started", whyText);
    setSavedWhy(whyText);
    setWhyStartedMode(false);
    setWhyText("");
  };

  return (
    <div style={{ background: "linear-gradient(170deg,#07090F 0%,#0A0F1A 100%)", minHeight: "100vh", paddingBottom: 110 }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ padding: "60px 20px 28px", background: "linear-gradient(155deg,#1A0E00,#0E0A00)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -60, right: -40, width: 260, height: 260, borderRadius: "50%",
            background: "radial-gradient(circle,rgba(201,169,110,0.12) 0%,transparent 70%)", pointerEvents: "none" }} />
          <p style={{ fontSize: 11, fontWeight: 800, color: C.hope, textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 6 }}>Hope</p>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "#fff", lineHeight: 1.15, marginBottom: 8 }}>
            Real Stories.<br/>Real Progress.
          </h1>
          <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.65 }}>
            Encouragement, community wins, milestones, and a vision for your future.
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <div style={{ flex: 1, padding: "12px 14px", borderRadius: 14, background: "rgba(201,169,110,0.08)", border: "1px solid rgba(201,169,110,0.2)" }}>
              <p style={{ fontSize: 26, fontWeight: 900, color: C.hope, lineHeight: 1 }}>{streak}</p>
              <p style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>Day Streak 🔥</p>
            </div>
            <div style={{ flex: 1, padding: "12px 14px", borderRadius: 14, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p style={{ fontSize: 26, fontWeight: 900, color: C.teal, lineHeight: 1 }}>{goals.length}</p>
              <p style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>Future Goals</p>
            </div>
          </div>
        </div>

        <div style={{ padding: "20px 16px" }}>

          {/* Daily Encouragement */}
          <div style={{ borderRadius: 20, padding: "18px 20px", marginBottom: 20,
            background: "linear-gradient(135deg,rgba(201,169,110,0.1),rgba(99,102,241,0.06))",
            border: "1px solid rgba(201,169,110,0.25)" }}>
            <p style={{ fontSize: 11, fontWeight: 800, color: C.hope, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 10 }}>Today's Encouragement</p>
            <Quote style={{ color: C.hope, width: 18, height: 18, marginBottom: 8, opacity: 0.6 }} />
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.85)", lineHeight: 1.7, fontStyle: "italic" }}>
              "{dailyMsg}"
            </p>
          </div>

          {/* Ah Ha Moment */}
          <AhHaWidget user={user} />

          {/* Testimonials */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <p style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: "1px" }}>📖 Recovery Stories</p>
            <Link to="/HowDidYouDoIt" style={{ fontSize: 13, color: C.teal, fontWeight: 700, textDecoration: "none" }}>See all →</Link>
          </div>
          <Link to="/HowDidYouDoIt" style={{ textDecoration: "none", display: "block", marginBottom: 20 }}>
            <div style={{ borderRadius: 18, padding: "18px 20px",
              background: "linear-gradient(135deg,rgba(99,102,241,0.1),rgba(139,92,246,0.06))",
              border: "1px solid rgba(99,102,241,0.25)" }}>
              <p style={{ fontSize: 15, fontWeight: 900, color: "#fff", marginBottom: 6 }}>How Did You Do It?</p>
              <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
                Real recovery testimonials from people who've been exactly where you are.
              </p>
              <p style={{ fontSize: 13, color: "#818CF8", fontWeight: 700, marginTop: 10 }}>Read Stories →</p>
            </div>
          </Link>

          {/* Why I Started */}
          <p style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12 }}>💡 Why I Started</p>
          {savedWhy ? (
            <div style={{ borderRadius: 18, padding: "16px 18px", marginBottom: 20,
              background: "rgba(201,169,110,0.08)", border: "1px solid rgba(201,169,110,0.25)" }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.hope, marginBottom: 8 }}>My Personal Reminder</p>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", lineHeight: 1.7, fontStyle: "italic" }}>"{savedWhy}"</p>
              <button onClick={() => { setWhyText(savedWhy); setWhyStartedMode(true); }}
                style={{ fontSize: 11, color: C.muted, background: "none", border: "none", cursor: "pointer", marginTop: 10, padding: 0, fontWeight: 600 }}>
                Edit reminder
              </button>
            </div>
          ) : whyStartedMode ? (
            <div style={{ borderRadius: 18, padding: "16px 18px", marginBottom: 20,
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <p style={{ fontSize: 13, color: C.muted, marginBottom: 10 }}>Write a reminder to yourself for difficult days:</p>
              <textarea value={whyText} onChange={e => setWhyText(e.target.value)}
                placeholder="e.g. I'm doing this for my kids, for my health, for the person I know I can be..."
                rows={4}
                style={{ width: "100%", padding: "12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: 14, resize: "none",
                  outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button onClick={handleSaveWhy} style={{ flex: 1, padding: "12px", borderRadius: 10, border: "none",
                  background: C.hope, color: "#07090F", fontWeight: 800, fontSize: 13, cursor: "pointer" }}>Save</button>
                <button onClick={() => setWhyStartedMode(false)} style={{ padding: "12px 16px", borderRadius: 10, border: "none",
                  background: "rgba(255,255,255,0.06)", color: C.muted, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Cancel</button>
              </div>
            </div>
          ) : (
            <div onClick={() => setWhyStartedMode(true)} style={{ borderRadius: 18, padding: "16px 18px", marginBottom: 20,
              background: "rgba(255,255,255,0.03)", border: "2px dashed rgba(255,255,255,0.1)", cursor: "pointer" }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: C.muted, textAlign: "center" }}>+ Write why you started</p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", textAlign: "center", marginTop: 3 }}>
                Your personal reminder for hard days
              </p>
            </div>
          )}

          {/* Future Vision Board */}
          <p style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12 }}>🌟 Future Vision</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
            {goals.slice(0, 6).map(g => (
              <div key={g.id} style={{ padding: "8px 14px", borderRadius: 20,
                background: "rgba(201,169,110,0.1)", border: "1px solid rgba(201,169,110,0.25)" }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: C.hope }}>{g.title}</p>
              </div>
            ))}
          </div>
          {goals.length === 0 && (
            <p style={{ fontSize: 13, color: C.muted, marginBottom: 10, textAlign: "center" }}>Add your future goals — what are you working toward?</p>
          )}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
            {GOAL_CATS.filter(g => !goals.some(ug => ug.title === g.label)).map(g => (
              <button key={g.label} onClick={() => user && addGoalMutation.mutate(g.label)}
                style={{ padding: "7px 12px", borderRadius: 20, border: "1.5px dashed rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.03)", color: C.muted, fontSize: 12, cursor: "pointer" }}>
                {g.emoji} {g.label}
              </button>
            ))}
          </div>
          <Link to="/FutureYou" style={{ textDecoration: "none", display: "block", marginBottom: 20 }}>
            <div style={{ padding: "14px", borderRadius: 16, textAlign: "center",
              background: "rgba(201,169,110,0.08)", border: "1px solid rgba(201,169,110,0.2)" }}>
              <p style={{ fontSize: 13, fontWeight: 800, color: C.hope }}>Manage My Future Goals →</p>
            </div>
          </Link>

          {/* Milestones */}
          <p style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12 }}>🏆 Milestones</p>
          <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4, marginBottom: 20 }}>
            {[
              { days: 1,  label: "Day 1",    emoji: "🌱" },
              { days: 7,  label: "1 Week",   emoji: "⭐" },
              { days: 14, label: "2 Weeks",  emoji: "🔥" },
              { days: 30, label: "30 Days",  emoji: "🌟" },
              { days: 60, label: "60 Days",  emoji: "💎" },
              { days: 90, label: "90 Days",  emoji: "👑" },
            ].map(m => {
              const reached = streak >= m.days;
              return (
                <div key={m.days} style={{ flexShrink: 0, padding: "12px 16px", borderRadius: 16, textAlign: "center", minWidth: 72,
                  background: reached ? "rgba(201,169,110,0.12)" : "rgba(255,255,255,0.03)",
                  border: `1.5px solid ${reached ? "rgba(201,169,110,0.4)" : "rgba(255,255,255,0.08)"}` }}>
                  <p style={{ fontSize: 24, marginBottom: 4, filter: reached ? "none" : "grayscale(1) opacity(0.3)" }}>{m.emoji}</p>
                  <p style={{ fontSize: 11, fontWeight: 700, color: reached ? C.hope : C.muted }}>{m.label}</p>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
}