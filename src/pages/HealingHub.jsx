import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Smile, BookOpen, Zap, Wind, Music, Sun, ArrowRight, Loader2, CheckCircle2
} from "lucide-react";

const C = {
  healing: "#2DD4BF",
  gold:    "#C9A96E",
  indigo:  "#6366F1",
  purple:  "#8B5CF6",
  emerald: "#10B981",
  muted:   "rgba(241,245,249,0.4)",
};

const MOODS = [
  { value: 1, emoji: "😢", label: "Rough",   color: "#EF4444" },
  { value: 2, emoji: "😕", label: "Low",     color: "#F59E0B" },
  { value: 3, emoji: "😐", label: "Okay",    color: C.gold    },
  { value: 4, emoji: "🙂", label: "Good",    color: C.healing },
  { value: 5, emoji: "😊", label: "Great",   color: C.emerald },
];

const JOURNAL_PROMPTS = [
  "What got me through today?",
  "What am I proud of today?",
  "What do I need tomorrow?",
  "What am I grateful for right now?",
  "What's one thing I want to let go of?",
  "What does my strongest self look like?",
];

const GRATITUDE_PROMPTS = [
  "Name 3 things you're grateful for today.",
  "Who showed up for you this week?",
  "What's a small win you almost didn't notice?",
  "What part of your recovery are you proud of?",
];

export default function HealingHub() {
  const qc = useQueryClient();
  const today = new Date().toISOString().split("T")[0];
  const [moodToday, setMoodToday] = useState(null);
  const [moodNote, setMoodNote] = useState("");
  const [moodSaved, setMoodSaved] = useState(false);
  const [gratitudeText, setGratitudeText] = useState("");
  const [gratitudeSaved, setGratitudeSaved] = useState(false);
  const [journalText, setJournalText] = useState("");
  const [journalPrompt] = useState(() => JOURNAL_PROMPTS[new Date().getDay() % JOURNAL_PROMPTS.length]);
  const [gratitudePrompt] = useState(() => GRATITUDE_PROMPTS[new Date().getDay() % GRATITUDE_PROMPTS.length]);

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: checkIns = [] } = useQuery({
    queryKey: ["healing-checkins", user?.email],
    queryFn: () => base44.entities.DailyCheckIn.filter({ participant_email: user.email }, "-check_in_date", 30),
    enabled: !!user?.email,
  });

  const todayCheckin = checkIns.find(c => c.check_in_date === today);
  const recentMoods = checkIns.slice(0, 7);

  const saveMoodMutation = useMutation({
    mutationFn: () => base44.entities.DailyCheckIn.create({
      participant_email: user.email,
      check_in_date: today,
      mood_rating: moodToday,
      notes: moodNote || null,
      relapse_risk_flag: false,
      attended_meeting: false,
      connected_with_sponsor: false,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["healing-checkins"] });
      setMoodSaved(true);
    },
  });

  const saveGratitudeMutation = useMutation({
    mutationFn: () => base44.entities.JournalEntry.create({
      user_email: user.email,
      title: "Gratitude — " + today,
      content: gratitudeText,
      prompt_used: gratitudePrompt,
      mood_tag: "grateful",
      entry_date: today,
    }),
    onSuccess: () => setGratitudeSaved(true),
  });

  return (
    <div style={{ background: "linear-gradient(170deg,#07090F 0%,#0A0F1A 100%)", minHeight: "100vh", paddingBottom: 110 }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ padding: "60px 20px 28px", background: "linear-gradient(155deg,#031A18,#050F0E)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -60, right: -40, width: 260, height: 260, borderRadius: "50%",
            background: "radial-gradient(circle,rgba(45,212,191,0.1) 0%,transparent 70%)", pointerEvents: "none" }} />
          <p style={{ fontSize: 11, fontWeight: 800, color: C.healing, textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 6 }}>Healing</p>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "#fff", lineHeight: 1.15, marginBottom: 8 }}>
            How are you<br/>actually doing?
          </h1>
          <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.65 }}>
            A private space to breathe, feel, reflect, and slowly put yourself back together.
          </p>
        </div>

        <div style={{ padding: "20px 16px" }}>

          {/* Mood Check-in */}
          <p style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12 }}>
            😊 How are you feeling right now?
          </p>

          {todayCheckin || moodSaved ? (
            <div style={{ borderRadius: 18, padding: "16px 18px", marginBottom: 20,
              background: "rgba(45,212,191,0.07)", border: "1px solid rgba(45,212,191,0.25)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <CheckCircle2 style={{ color: C.healing, width: 18, height: 18 }} />
                <p style={{ fontSize: 14, fontWeight: 700, color: C.healing }}>Mood logged for today ✓</p>
              </div>
              {recentMoods.length > 1 && (
                <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
                  {recentMoods.slice(0, 7).map((c, i) => {
                    const mood = MOODS.find(m => m.value === c.mood_rating) || MOODS[2];
                    return (
                      <div key={i} style={{ textAlign: "center" }}>
                        <p style={{ fontSize: 18 }}>{mood.emoji}</p>
                        <p style={{ fontSize: 9, color: C.muted, marginTop: 2 }}>{c.check_in_date?.slice(5)}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div style={{ borderRadius: 18, padding: "18px", marginBottom: 20,
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p style={{ fontSize: 13, color: C.muted, marginBottom: 14 }}>No right or wrong answer. Just honest.</p>
              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                {MOODS.map(m => {
                  const sel = moodToday === m.value;
                  return (
                    <button key={m.value} onClick={() => setMoodToday(m.value)}
                      style={{ flex: 1, padding: "12px 4px", borderRadius: 14, border: "none", cursor: "pointer",
                        background: sel ? `${m.color}18` : "rgba(255,255,255,0.04)",
                        border: `1.5px solid ${sel ? m.color + "50" : "rgba(255,255,255,0.07)"}`,
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <span style={{ fontSize: 22 }}>{m.emoji}</span>
                      <span style={{ fontSize: 9, fontWeight: 700, color: sel ? m.color : "rgba(255,255,255,0.3)" }}>{m.label}</span>
                    </button>
                  );
                })}
              </div>
              <textarea value={moodNote} onChange={e => setMoodNote(e.target.value)}
                placeholder="Optional note..."
                rows={2}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: 13, resize: "none",
                  outline: "none", boxSizing: "border-box", fontFamily: "inherit", marginBottom: 12 }} />
              <button onClick={() => user && moodToday && saveMoodMutation.mutate()}
                disabled={!moodToday || saveMoodMutation.isPending}
                style={{ width: "100%", padding: "12px", borderRadius: 12, border: "none", cursor: moodToday ? "pointer" : "not-allowed",
                  background: moodToday ? `linear-gradient(135deg,${C.healing},#22C5B0)` : "rgba(255,255,255,0.06)",
                  color: moodToday ? "#07090F" : C.muted, fontWeight: 800, fontSize: 14 }}>
                {saveMoodMutation.isPending ? "Saving..." : "Log My Mood"}
              </button>
            </div>
          )}

          {/* Journal */}
          <p style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12 }}>📓 Say what you actually feel</p>
          <div style={{ borderRadius: 18, padding: "18px", marginBottom: 10,
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <p style={{ fontSize: 13, color: "#818CF8", fontWeight: 700, marginBottom: 10 }}>Write to this, or ignore it — either way:</p>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", lineHeight: 1.6, fontStyle: "italic", marginBottom: 14 }}>
              "{journalPrompt}"
            </p>
            <textarea value={journalText} onChange={e => setJournalText(e.target.value)}
              placeholder="This is just for you. No one else reads this."
              rows={4}
              style={{ width: "100%", padding: "12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: 14, resize: "none",
                outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
          </div>
          <Link to="/Journal" style={{ textDecoration: "none", display: "block", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px",
              borderRadius: 14, background: "rgba(129,140,248,0.1)", border: "1px solid rgba(129,140,248,0.2)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <BookOpen style={{ color: "#818CF8", width: 16, height: 16 }} />
                <p style={{ fontSize: 13, fontWeight: 700, color: "#818CF8" }}>Open My Full Journal</p>
              </div>
              <ArrowRight style={{ color: "#818CF8", width: 14, height: 14 }} />
            </div>
          </Link>

          {/* Trigger & Craving Log */}
          <p style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12 }}>⚡ When it gets hard</p>
          <Link to="/DailyCheckIn" style={{ textDecoration: "none", display: "block", marginBottom: 20 }}>
            <div style={{ borderRadius: 18, padding: "16px 18px",
              background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(239,68,68,0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Zap style={{ color: "#F87171", width: 18, height: 18 }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 15, fontWeight: 800, color: "#fff", marginBottom: 2 }}>I'm feeling a craving or a trigger</p>
                  <p style={{ fontSize: 12, color: C.muted }}>Log it. Name it. Take its power away.</p>
                </div>
                <ArrowRight style={{ color: C.muted, width: 14, height: 14 }} />
              </div>
            </div>
          </Link>

          {/* Guided Reset Tools */}
          <p style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12 }}>🌬️ Tools to come back to yourself</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
            {[
              { icon: <Wind className="w-5 h-5"/>,  label: "Breathing",   sub: "Box breathing & more",   href: "/ResetButton",         color: C.healing },
              { icon: <Music className="w-5 h-5"/>, label: "Calming Audio",sub: "Sounds & binaural beats",href: "/MentalReset",          color: C.indigo  },
              { icon: <Sun className="w-5 h-5"/>,   label: "Meditation",  sub: "Guided exercises",       href: "/MentalReset",          color: C.gold    },
              { icon: <Smile className="w-5 h-5"/>, label: "Grounding",   sub: "5-4-3-2-1 technique",    href: "/CravingControlCenter", color: C.purple  },
            ].map(t => (
              <Link key={t.label} to={t.href} style={{ textDecoration: "none" }}>
                <div style={{ borderRadius: 18, padding: "16px 14px",
                  background: `${t.color}0A`, border: `1px solid ${t.color}22`, cursor: "pointer" }}>
                  <div style={{ color: t.color, marginBottom: 8 }}>{t.icon}</div>
                  <p style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginBottom: 3 }}>{t.label}</p>
                  <p style={{ fontSize: 11, color: C.muted }}>{t.sub}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Gratitude */}
          <p style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12 }}>🙏 What's still good, even today</p>
          {gratitudeSaved ? (
            <div style={{ borderRadius: 18, padding: "16px 18px", marginBottom: 20,
              background: "rgba(45,212,191,0.07)", border: "1px solid rgba(45,212,191,0.25)",
              display: "flex", alignItems: "center", gap: 10 }}>
              <CheckCircle2 style={{ color: C.healing, width: 18, height: 18, flexShrink: 0 }} />
              <p style={{ fontSize: 14, fontWeight: 700, color: C.healing }}>Gratitude saved for today ✓</p>
            </div>
          ) : (
            <div style={{ borderRadius: 18, padding: "18px", marginBottom: 20,
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p style={{ fontSize: 13, color: C.gold, fontWeight: 700, marginBottom: 10 }}>Today's reflection:</p>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.6, fontStyle: "italic", marginBottom: 14 }}>
                "{gratitudePrompt}"
              </p>
              <textarea value={gratitudeText} onChange={e => setGratitudeText(e.target.value)}
                placeholder="Even one small thing counts..."
                rows={3}
                style={{ width: "100%", padding: "12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: 14, resize: "none",
                  outline: "none", boxSizing: "border-box", fontFamily: "inherit", marginBottom: 12 }} />
              <button onClick={() => user && gratitudeText.trim() && saveGratitudeMutation.mutate()}
                disabled={!gratitudeText.trim() || saveGratitudeMutation.isPending}
                style={{ width: "100%", padding: "12px", borderRadius: 12, border: "none",
                  cursor: gratitudeText.trim() ? "pointer" : "not-allowed",
                  background: gratitudeText.trim() ? `linear-gradient(135deg,${C.gold},#B8935A)` : "rgba(255,255,255,0.06)",
                  color: gratitudeText.trim() ? "#07090F" : C.muted, fontWeight: 800, fontSize: 14 }}>
                {saveGratitudeMutation.isPending ? "Saving..." : "Save Gratitude"}
              </button>
            </div>
          )}

          {/* Safety Plan */}
          <Link to="/MySafetyPlan" style={{ textDecoration: "none", display: "block" }}>
            <div style={{ borderRadius: 18, padding: "16px 18px",
              background: "rgba(139,92,246,0.07)", border: "1px solid rgba(139,92,246,0.2)",
              display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: 15, fontWeight: 900, color: "#fff", marginBottom: 3 }}>My Safety Plan</p>
                <p style={{ fontSize: 12, color: C.muted }}>Know your warning signs before they sneak up on you</p>
              </div>
              <ArrowRight style={{ color: "#A78BFA", width: 16, height: 16 }} />
            </div>
          </Link>

        </div>
      </div>
    </div>
  );
}