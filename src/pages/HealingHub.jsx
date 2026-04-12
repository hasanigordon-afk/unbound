import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Smile, BookOpen, Zap, Wind, Music, Sun, ArrowRight, Loader2, CheckCircle2
} from "lucide-react";

const C = {
  healing: "var(--teal)",
  gold:    "var(--sand)",
  indigo:  "var(--indigo)",
  purple:  "var(--purple)",
  emerald: "var(--green)",
  muted:   "var(--text-muted)",
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
    <div style={{ background: "var(--bg)", minHeight: "100vh", paddingBottom: 110 }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ padding: "60px 20px 28px", background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "var(--teal)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 6 }}>Healing</p>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text)", lineHeight: 1.2, marginBottom: 8 }}>
            How are you<br/>actually doing?
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.65 }}>
            A private space to breathe, feel, reflect, and slowly put yourself back together.
          </p>
        </div>

        <div style={{ padding: "20px 16px" }}>

          {/* Mood Check-in */}
          <p style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12 }}>
            😊 How are you feeling right now?
          </p>

          {todayCheckin || moodSaved ? (
            <div className="card" style={{ padding: "16px 18px", marginBottom: 20, borderColor: "var(--teal-border)" }}>
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
            <div className="card" style={{ padding: "18px", marginBottom: 20 }}>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 14 }}>No right or wrong answer. Just honest.</p>
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
                className={moodToday ? "btn-primary" : "btn-ghost"}
                style={{ width: "100%", padding: "12px", fontSize: 14 }}>
                {saveMoodMutation.isPending ? "Saving..." : "Log My Mood"}
              </button>
            </div>
          )}

          {/* Journal */}
          <p className="section-label">Say what you actually feel</p>
          <div className="card" style={{ padding: "18px", marginBottom: 8 }}>
            <p style={{ fontSize: 13, color: "var(--teal)", fontWeight: 700, marginBottom: 10 }}>Write to this, or ignore it — either way:</p>
            <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6, fontStyle: "italic", marginBottom: 14 }}>
              "{journalPrompt}"
            </p>
            <textarea value={journalText} onChange={e => setJournalText(e.target.value)}
              placeholder="This is just for you. No one else reads this."
              rows={4}
              style={{ width: "100%", padding: "12px", resize: "none", boxSizing: "border-box" }} />
          </div>
          <Link to="/Journal" style={{ textDecoration: "none", display: "block", marginBottom: 20 }}>
            <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <BookOpen style={{ color: "var(--indigo)", width: 16, height: 16 }} />
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Open My Full Journal</p>
              </div>
              <ArrowRight style={{ color: "var(--text-dim)", width: 14, height: 14 }} />
            </div>
          </Link>

          <p className="section-label">When it gets hard</p>
          <Link to="/DailyCheckIn" style={{ textDecoration: "none", display: "block", marginBottom: 20 }}>
            <div className="card" style={{ padding: "14px 16px", borderColor: "rgba(201,83,79,0.25)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Zap style={{ color: "var(--red)", width: 16, height: 16, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>I'm feeling a craving or a trigger</p>
                  <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Log it. Name it. Take its power away.</p>
                </div>
                <ArrowRight style={{ color: "var(--text-dim)", width: 13, height: 13 }} />
              </div>
            </div>
          </Link>

          <p className="section-label">Tools to come back to yourself</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
            {[
              { icon: <Wind className="w-4 h-4"/>,  label: "Breathing",   sub: "Box breathing & more",    href: "/ResetButton",         color: "var(--teal)"   },
              { icon: <Music className="w-4 h-4"/>, label: "Calming Audio",sub: "Sounds & binaural beats",  href: "/MentalReset",          color: "var(--indigo)" },
              { icon: <Sun className="w-4 h-4"/>,   label: "Meditation",  sub: "Guided exercises",         href: "/MentalReset",          color: "var(--sand)"   },
              { icon: <Smile className="w-4 h-4"/>, label: "Grounding",   sub: "5-4-3-2-1 technique",      href: "/CravingControlCenter", color: "var(--purple)" },
            ].map(t => (
              <Link key={t.label} to={t.href} style={{ textDecoration: "none" }}>
                <div className="card" style={{ padding: "14px 12px", cursor: "pointer" }}>
                  <div style={{ color: t.color, marginBottom: 8 }}>{t.icon}</div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 3 }}>{t.label}</p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{t.sub}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Gratitude */}
          <p className="section-label">What's still good, even today</p>
          {gratitudeSaved ? (
            <div className="card" style={{ padding: "16px 18px", marginBottom: 20, borderColor: "var(--teal-border)",
              display: "flex", alignItems: "center", gap: 10 }}>
              <CheckCircle2 style={{ color: C.healing, width: 18, height: 18, flexShrink: 0 }} />
              <p style={{ fontSize: 14, fontWeight: 700, color: C.healing }}>Gratitude saved for today ✓</p>
            </div>
          ) : (
            <div className="card" style={{ padding: "18px", marginBottom: 20 }}>
              <p style={{ fontSize: 13, color: "var(--sand)", fontWeight: 600, marginBottom: 10 }}>Today's reflection:</p>
              <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6, fontStyle: "italic", marginBottom: 14 }}>
                "{gratitudePrompt}"
              </p>
              <textarea value={gratitudeText} onChange={e => setGratitudeText(e.target.value)}
                placeholder="Even one small thing counts..."
                rows={3}
                style={{ width: "100%", padding: "12px", resize: "none", boxSizing: "border-box", marginBottom: 12 }} />
              <button onClick={() => user && gratitudeText.trim() && saveGratitudeMutation.mutate()}
                disabled={!gratitudeText.trim() || saveGratitudeMutation.isPending}
                className={gratitudeText.trim() ? "btn-primary" : "btn-ghost"}
                style={{ width: "100%", padding: "12px", fontSize: 14 }}>
                {saveGratitudeMutation.isPending ? "Saving..." : "Save Gratitude"}
              </button>
            </div>
          )}

          {/* Safety Plan */}
          <Link to="/MySafetyPlan" style={{ textDecoration: "none", display: "block" }}>
            <div className="card" style={{ padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 3 }}>My Safety Plan</p>
                <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Know your warning signs before they sneak up on you</p>
              </div>
              <ArrowRight style={{ color: "var(--text-dim)", width: 14, height: 14 }} />
            </div>
          </Link>

        </div>
      </div>
    </div>
  );
}