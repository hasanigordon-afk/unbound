import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import AhHaWidget from "@/components/ahha/AhHaWidget";

const DAILY_MESSAGES = [
  "Every day sober is a victory worth celebrating.",
  "You are not your past. You are what you choose today.",
  "The strongest people win battles we know nothing about.",
  "Recovery is not a race. You don't have to feel guilty if it takes longer than you thought.",
  "You survived 100% of your hardest days so far.",
  "Change is possible. It's happening right now — in you.",
  "Someone out there needs your story. Keep going.",
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
  const qc = useQueryClient();
  const [whyStartedMode, setWhyStartedMode] = useState(false);
  const [whyText, setWhyText] = useState("");
  const [savedWhy, setSavedWhy] = useState(() => localStorage.getItem("ahha_why_i_started") || "");
  const dailyMsg = DAILY_MESSAGES[new Date().getDay() % DAILY_MESSAGES.length];

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

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
    <div style={{ background: "var(--bg)", minHeight: "100vh", paddingBottom: 110 }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ padding: "60px 20px 28px", background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "var(--sand)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 6 }}>Hope</p>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text)", lineHeight: 1.2, marginBottom: 8 }}>
            People just like you<br/>made it through.
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.65 }}>
            Real stories, honest wins, and a reminder you're not alone.
          </p>
          <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
            <div className="card" style={{ flex: 1, padding: "12px 14px" }}>
              <p style={{ fontSize: 24, fontWeight: 800, color: "var(--sand)", lineHeight: 1 }}>{streak}</p>
              <p style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 3 }}>Day Streak</p>
            </div>
            <div className="card" style={{ flex: 1, padding: "12px 14px" }}>
              <p style={{ fontSize: 24, fontWeight: 800, color: "var(--teal)", lineHeight: 1 }}>{goals.length}</p>
              <p style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 3 }}>Future Goals</p>
            </div>
          </div>
        </div>

        <div style={{ padding: "20px 16px" }}>

          {/* Daily Encouragement */}
          <div className="card" style={{ padding: "18px 20px", marginBottom: 20, borderColor: "var(--sand-border)" }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "var(--sand)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 10 }}>
              Something to hold onto today
            </p>
            <p style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.75, fontStyle: "italic" }}>
              "{dailyMsg}"
            </p>
          </div>

          {/* Ah Ha Moment */}
          <AhHaWidget user={user} />

          {/* Testimonials */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <p className="section-label" style={{ marginBottom: 0 }}>How they got through it</p>
            <Link to="/HowDidYouDoIt" style={{ fontSize: 12, color: "var(--teal)", fontWeight: 700, textDecoration: "none" }}>See all →</Link>
          </div>
          <Link to="/HowDidYouDoIt" style={{ textDecoration: "none", display: "block", marginBottom: 20 }}>
            <div className="card" style={{ padding: "16px 18px" }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>How Did You Do It?</p>
              <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
                Honest stories from people who sat in the same place — and found their way out.
              </p>
              <p style={{ fontSize: 12, color: "var(--teal)", fontWeight: 700, marginTop: 10 }}>Read their stories →</p>
            </div>
          </Link>

          {/* Why I Started */}
          <p className="section-label">Why I'm doing this</p>
          {savedWhy ? (
            <div className="card" style={{ padding: "16px 18px", marginBottom: 20, borderColor: "var(--sand-border)" }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "var(--sand)", marginBottom: 8, textTransform: "uppercase", letterSpacing: ".06em" }}>My Personal Reminder</p>
              <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.7, fontStyle: "italic" }}>"{savedWhy}"</p>
              <button onClick={() => { setWhyText(savedWhy); setWhyStartedMode(true); }}
                style={{ fontSize: 11, color: "var(--text-dim)", background: "none", border: "none", cursor: "pointer", marginTop: 10, padding: 0, fontWeight: 600 }}>
                Edit reminder
              </button>
            </div>
          ) : whyStartedMode ? (
            <div className="card" style={{ padding: "16px 18px", marginBottom: 20 }}>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 10 }}>
                Write something to read on a hard day — from you, to you:
              </p>
              <textarea value={whyText} onChange={e => setWhyText(e.target.value)}
                placeholder="e.g. I'm doing this for my kids, for my health, for the person I know I can be..."
                rows={4}
                style={{ width: "100%", padding: "12px", resize: "none", boxSizing: "border-box", marginBottom: 12 }} />
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={handleSaveWhy} className="btn-primary" style={{ flex: 1, padding: "12px", fontSize: 13 }}>Save</button>
                <button onClick={() => setWhyStartedMode(false)} className="btn-ghost" style={{ padding: "12px 16px", fontSize: 13 }}>Cancel</button>
              </div>
            </div>
          ) : (
            <div onClick={() => setWhyStartedMode(true)} style={{ borderRadius: "var(--r-xl)", padding: "16px 18px", marginBottom: 20,
              background: "var(--surface)", border: "1px dashed var(--border)", cursor: "pointer", textAlign: "center" }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-muted)" }}>+ Write something to read on a hard day</p>
              <p style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 4 }}>From you, to future you — when it gets tough</p>
            </div>
          )}

          {/* Future Vision */}
          <p className="section-label">What I'm working toward</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
            {goals.slice(0, 6).map(g => (
              <span key={g.id} className="pill pill-sand">{g.title}</span>
            ))}
          </div>
          {goals.length === 0 && (
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 10, textAlign: "center" }}>
              What does life look like when you get to the other side?
            </p>
          )}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
            {GOAL_CATS.filter(g => !goals.some(ug => ug.title === g.label)).map(g => (
              <button key={g.label} onClick={() => user && addGoalMutation.mutate(g.label)}
                className="pill pill-ghost" style={{ cursor: "pointer" }}>
                {g.emoji} {g.label}
              </button>
            ))}
          </div>
          <Link to="/FutureYou" style={{ textDecoration: "none", display: "block", marginBottom: 20 }}>
            <div className="card" style={{ padding: "13px", textAlign: "center" }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "var(--sand)" }}>Manage My Future Goals →</p>
            </div>
          </Link>

          {/* Milestones */}
          <p className="section-label">Milestones</p>
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, marginBottom: 20 }}>
            {[
              { days: 1,  label: "Day 1",   emoji: "🌱" },
              { days: 7,  label: "1 Week",  emoji: "⭐" },
              { days: 14, label: "2 Weeks", emoji: "🔥" },
              { days: 30, label: "30 Days", emoji: "🌟" },
              { days: 60, label: "60 Days", emoji: "💎" },
              { days: 90, label: "90 Days", emoji: "👑" },
            ].map(m => {
              const reached = streak >= m.days;
              return (
                <div key={m.days} className="card" style={{
                  flexShrink: 0, padding: "12px 14px", textAlign: "center", minWidth: 70,
                  borderColor: reached ? "var(--sand-border)" : "var(--border)",
                  background: reached ? "var(--sand-dim)" : "var(--card)",
                }}>
                  <p style={{ fontSize: 22, marginBottom: 4, filter: reached ? "none" : "grayscale(1) opacity(0.3)" }}>{m.emoji}</p>
                  <p style={{ fontSize: 11, fontWeight: 700, color: reached ? "var(--sand)" : "var(--text-dim)" }}>{m.label}</p>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
}