import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ChevronLeft, Plus, Sparkles, X, Trash2, Check } from "lucide-react";
import { createPageUrl } from "./utils";

const C = {
  teal:   "#2DD4BF",
  gold:   "#FBBF24",
  indigo: "#818CF8",
  rose:   "#F472B6",
  emerald:"#34D399",
  amber:  "#F59E0B",
};

const TIMEFRAMES = [
  { id: "6_months", label: "6 Months",  emoji: "🌱", color: C.teal,   desc: "Near-term, achievable" },
  { id: "1_year",   label: "1 Year",    emoji: "🌟", color: C.gold,   desc: "Where I want to be"    },
  { id: "5_years",  label: "5 Years",   emoji: "🚀", color: C.indigo, desc: "The bigger picture"    },
];

const CATEGORIES = [
  { id: "health",        label: "Health",        emoji: "💪", color: C.emerald },
  { id: "family",        label: "Family",        emoji: "👨‍👩‍👧", color: C.rose   },
  { id: "career",        label: "Career",        emoji: "💼", color: C.indigo },
  { id: "freedom",       label: "Freedom",       emoji: "🕊️", color: C.teal   },
  { id: "relationships", label: "Relationships", emoji: "🤝", color: C.rose   },
  { id: "personal",      label: "Personal",      emoji: "🌱", color: C.teal   },
  { id: "financial",     label: "Financial",     emoji: "💰", color: C.gold   },
  { id: "spiritual",     label: "Spiritual",     emoji: "🙏", color: C.amber  },
];

const MOTIVATION_SUGGESTIONS = [
  "My kids", "My family", "My health", "My freedom", "Being present",
  "Proving it to myself", "A better life", "My future partner", "My community",
  "Peace of mind", "Financial stability", "Being a role model",
];

function timeframeColor(id) {
  return TIMEFRAMES.find(t => t.id === id)?.color || C.teal;
}

function GoalCard({ goal, onDelete }) {
  const tf = TIMEFRAMES.find(t => t.id === goal.timeframe);
  const cat = CATEGORIES.find(c => c.id === goal.category);
  const color = tf?.color || C.teal;

  return (
    <div style={{ borderRadius: 18, padding: "16px 18px", marginBottom: 10,
      background: `linear-gradient(135deg,${color}08,rgba(255,255,255,0.03))`,
      border: `1.5px solid ${color}25` }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 10, fontWeight: 800, color, background: color + "18",
              padding: "3px 9px", borderRadius: 10 }}>{tf?.emoji} {tf?.label}</span>
            {cat && <span style={{ fontSize: 10, fontWeight: 700, color: cat.color + "AA",
              background: cat.color + "10", padding: "3px 9px", borderRadius: 10 }}>
              {cat.emoji} {cat.label}
            </span>}
          </div>
          <p style={{ fontSize: 15, fontWeight: 800, color: "#fff", lineHeight: 1.3, marginBottom: goal.description ? 5 : 0 }}>
            {goal.title}
          </p>
          {goal.description && (
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>{goal.description}</p>
          )}
          {goal.motivations?.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 8 }}>
              {goal.motivations.map(m => (
                <span key={m} style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.5)",
                  background: "rgba(255,255,255,0.06)", padding: "3px 9px", borderRadius: 10 }}>
                  {m}
                </span>
              ))}
            </div>
          )}
        </div>
        <button onClick={() => onDelete(goal.id)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 4, flexShrink: 0,
            color: "rgba(255,255,255,0.2)" }}>
          <Trash2 style={{ width: 14, height: 14 }} />
        </button>
      </div>
    </div>
  );
}

function AddGoalSheet({ onClose, userEmail, onSaved }) {
  const [timeframe, setTimeframe] = useState("1_year");
  const [category, setCategory] = useState("personal");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [motivations, setMotivations] = useState([]);
  const [customMotivation, setCustomMotivation] = useState("");

  const qc = useQueryClient();
  const saveMutation = useMutation({
    mutationFn: () => base44.entities.FutureYouGoal.create({
      user_email: userEmail, timeframe, category, title, description, motivations, is_active: true,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["future-you-goals"] }); onSaved(); onClose(); },
  });

  const toggleMotivation = (m) => {
    setMotivations(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
  };
  const addCustom = () => {
    if (customMotivation.trim()) {
      setMotivations(prev => [...prev, customMotivation.trim()]);
      setCustomMotivation("");
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "flex-end",
      background: "rgba(0,0,0,0.75)" }} onClick={onClose}>
      <div style={{ width: "100%", maxWidth: 480, margin: "0 auto", borderRadius: "24px 24px 0 0",
        background: "#0D1117", padding: "24px 20px 48px", border: "1px solid rgba(255,255,255,0.1)",
        maxHeight: "90vh", overflowY: "auto" }}
        onClick={e => e.stopPropagation()}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <p style={{ fontSize: 17, fontWeight: 900, color: "#fff" }}>Add a Goal</p>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.07)", border: "none",
            borderRadius: "50%", width: 30, height: 30, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X style={{ color: "rgba(255,255,255,0.5)", width: 14, height: 14 }} />
          </button>
        </div>

        {/* Timeframe */}
        <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase",
          letterSpacing: ".08em", marginBottom: 8 }}>Timeframe</p>
        <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
          {TIMEFRAMES.map(tf => (
            <button key={tf.id} onClick={() => setTimeframe(tf.id)}
              style={{ flex: 1, padding: "10px 6px", borderRadius: 12, border: "none", cursor: "pointer",
                background: timeframe === tf.id ? tf.color + "20" : "rgba(255,255,255,0.05)",
                border: `1.5px solid ${timeframe === tf.id ? tf.color + "55" : "rgba(255,255,255,0.08)"}`,
                color: timeframe === tf.id ? tf.color : "rgba(255,255,255,0.4)",
                fontSize: 11, fontWeight: 700, textAlign: "center" }}>
              {tf.emoji}<br />{tf.label}
            </button>
          ))}
        </div>

        {/* Category */}
        <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase",
          letterSpacing: ".08em", marginBottom: 8 }}>Category</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 18 }}>
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setCategory(cat.id)}
              style={{ padding: "6px 12px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700,
                background: category === cat.id ? cat.color + "20" : "rgba(255,255,255,0.05)",
                border: `1.5px solid ${category === cat.id ? cat.color + "55" : "rgba(255,255,255,0.08)"}`,
                color: category === cat.id ? cat.color : "rgba(255,255,255,0.4)" }}>
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>

        {/* Title */}
        <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase",
          letterSpacing: ".08em", marginBottom: 6 }}>Goal *</p>
        <input value={title} onChange={e => setTitle(e.target.value)}
          placeholder="e.g. Be present for my kids every day"
          style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: 14, outline: "none",
            boxSizing: "border-box", marginBottom: 14 }} />

        {/* Description */}
        <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase",
          letterSpacing: ".08em", marginBottom: 6 }}>What does this look like? (optional)</p>
        <textarea value={description} onChange={e => setDescription(e.target.value)}
          placeholder="Describe what achieving this means to you..."
          rows={2}
          style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: 13, outline: "none",
            resize: "none", boxSizing: "border-box", marginBottom: 18 }} />

        {/* Motivations */}
        <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase",
          letterSpacing: ".08em", marginBottom: 8 }}>What's driving this?</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
          {MOTIVATION_SUGGESTIONS.map(m => {
            const sel = motivations.includes(m);
            return (
              <button key={m} onClick={() => toggleMotivation(m)}
                style={{ padding: "6px 12px", borderRadius: 20, border: "none", cursor: "pointer",
                  fontSize: 11, fontWeight: 700,
                  background: sel ? "rgba(45,212,191,0.15)" : "rgba(255,255,255,0.05)",
                  border: `1.5px solid ${sel ? "rgba(45,212,191,0.4)" : "rgba(255,255,255,0.08)"}`,
                  color: sel ? C.teal : "rgba(255,255,255,0.4)",
                  display: "flex", alignItems: "center", gap: 4 }}>
                {sel && <Check style={{ width: 10, height: 10 }} />} {m}
              </button>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
          <input value={customMotivation} onChange={e => setCustomMotivation(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addCustom()}
            placeholder="Add your own..."
            style={{ flex: 1, padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: 13, outline: "none" }} />
          <button onClick={addCustom}
            style={{ padding: "10px 14px", borderRadius: 12, background: "rgba(45,212,191,0.12)",
              border: "1px solid rgba(45,212,191,0.25)", color: C.teal, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            Add
          </button>
        </div>

        <button onClick={() => saveMutation.mutate()} disabled={!title.trim() || saveMutation.isPending}
          style={{ width: "100%", padding: "15px", borderRadius: 14, border: "none", cursor: "pointer",
            background: title.trim() ? `linear-gradient(135deg,${C.teal},#22C5B0)` : "rgba(255,255,255,0.08)",
            color: title.trim() ? "#07090F" : "rgba(255,255,255,0.3)",
            fontWeight: 800, fontSize: 15 }}>
          Save Goal →
        </button>
      </div>
    </div>
  );
}

export default function FutureYou() {
  const [showAdd, setShowAdd] = useState(false);
  const qc = useQueryClient();

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: goals = [] } = useQuery({
    queryKey: ["future-you-goals", user?.email],
    queryFn: () => base44.entities.FutureYouGoal.filter({ user_email: user.email, is_active: true }, "created_date", 50),
    enabled: !!user?.email,
  });

  // Daily consistency — check-ins in last 30 days
  const { data: checkIns = [] } = useQuery({
    queryKey: ["future-you-checkins", user?.email],
    queryFn: () => base44.entities.DailyCheckIn.filter({ participant_email: user.email }, "-check_in_date", 30),
    enabled: !!user?.email,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.FutureYouGoal.update(id, { is_active: false }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["future-you-goals"] }),
  });

  // Consistency score 0-100 from last 30 days
  const consistencyScore = useMemo(() => {
    const last30 = checkIns.filter(c => {
      const d = new Date(c.check_in_date);
      return (Date.now() - d.getTime()) <= 30 * 86400000;
    });
    return Math.min(100, Math.round((last30.length / 30) * 100));
  }, [checkIns]);

  const consistencyColor = consistencyScore >= 70 ? C.emerald : consistencyScore >= 40 ? C.gold : "#F87171";
  const consistencyLabel = consistencyScore >= 70 ? "Strong momentum" : consistencyScore >= 40 ? "Building habits" : consistencyScore > 0 ? "Just getting started" : "Start checking in daily";

  const goalsByTimeframe = useMemo(() => {
    const map = {};
    TIMEFRAMES.forEach(tf => { map[tf.id] = goals.filter(g => g.timeframe === tf.id); });
    return map;
  }, [goals]);

  const firstName = user?.full_name?.split(" ")[0] || "there";

  return (
    <div style={{ background: "linear-gradient(170deg,#07090F 0%,#0A0C16 100%)", minHeight: "100vh", paddingBottom: 100 }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ background: "linear-gradient(150deg,#0C0E20 0%,#080A18 100%)",
          padding: "60px 24px 28px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -80, right: -60, width: 280, height: 280, borderRadius: "50%",
            background: "radial-gradient(circle,rgba(251,191,36,0.07) 0%,transparent 70%)", pointerEvents: "none" }} />

          <Link to={createPageUrl("MyFoundation")} style={{ display: "inline-flex", alignItems: "center", gap: 6,
            color: "rgba(255,255,255,0.4)", fontSize: 12, marginBottom: 16, textDecoration: "none" }}>
            <ChevronLeft style={{ width: 15, height: 15 }} /> Back
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Sparkles style={{ color: C.gold, width: 16, height: 16 }} />
            <p style={{ fontSize: 12, fontWeight: 700, color: C.gold, textTransform: "uppercase", letterSpacing: ".1em" }}>
              Future You
            </p>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "#fff", lineHeight: 1.2, marginBottom: 6 }}>
            Who do you want<br />to become?
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}>
            Set goals for the future you're building — one consistent day at a time.
          </p>
        </div>

        <div style={{ padding: "20px 16px" }}>

          {/* Consistency Progress Tracker */}
          <div style={{ borderRadius: 20, padding: "20px 20px", marginBottom: 20,
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginBottom: 3 }}>
                  Daily Consistency Score
                </p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Based on your check-ins over 30 days</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 28, fontWeight: 900, color: consistencyColor, lineHeight: 1 }}>
                  {consistencyScore}%
                </p>
                <p style={{ fontSize: 10, color: consistencyColor + "AA", fontWeight: 700, marginTop: 2 }}>
                  {consistencyLabel}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: 8, height: 10, overflow: "hidden", marginBottom: 10 }}>
              <div style={{ width: `${consistencyScore}%`, height: "100%", borderRadius: 8,
                background: `linear-gradient(90deg,${consistencyColor},${consistencyColor}AA)`,
                transition: "width 0.8s ease", boxShadow: `0 0 12px ${consistencyColor}40` }} />
            </div>

            {/* Mini day dots */}
            <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
              {Array.from({ length: 30 }).map((_, i) => {
                const d = new Date(); d.setDate(d.getDate() - (29 - i));
                const ds = d.toISOString().split("T")[0];
                const checked = checkIns.some(c => c.check_in_date === ds);
                return (
                  <div key={i} style={{ width: 8, height: 8, borderRadius: 2,
                    background: checked ? consistencyColor : "rgba(255,255,255,0.07)" }} />
                );
              })}
            </div>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", marginTop: 6 }}>
              Each square = 1 day · last 30 days
            </p>

            {consistencyScore < 50 && (
              <Link to={createPageUrl("DailyCheckIn")} style={{ textDecoration: "none" }}>
                <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 10,
                  background: `${consistencyColor}10`, border: `1px solid ${consistencyColor}25`,
                  display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: consistencyColor }}>
                    Daily check-ins move you closer →
                  </p>
                </div>
              </Link>
            )}
          </div>

          {/* Add Goal button */}
          <button onClick={() => setShowAdd(true)}
            style={{ width: "100%", padding: "14px", borderRadius: 16, border: "none", cursor: "pointer",
              background: `linear-gradient(135deg,${C.gold}20,${C.gold}08)`,
              border: `1.5px solid ${C.gold}35`,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              color: C.gold, fontWeight: 800, fontSize: 14, marginBottom: 24 }}>
            <Plus style={{ width: 16, height: 16 }} /> Add a Goal
          </button>

          {/* Goals by timeframe */}
          {goals.length === 0 ? (
            <div style={{ borderRadius: 20, padding: "36px 24px", textAlign: "center",
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <p style={{ fontSize: 36, marginBottom: 10 }}>🚀</p>
              <p style={{ fontSize: 16, fontWeight: 800, color: "#fff", marginBottom: 6 }}>
                Where do you see yourself?
              </p>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}>
                Add your first goal above. No pressure — even one small vision helps.
              </p>
            </div>
          ) : (
            TIMEFRAMES.map(tf => {
              const tfGoals = goalsByTimeframe[tf.id] || [];
              if (tfGoals.length === 0) return null;
              return (
                <div key={tf.id} style={{ marginBottom: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <span style={{ fontSize: 14 }}>{tf.emoji}</span>
                    <p style={{ fontSize: 13, fontWeight: 800, color: tf.color }}>{tf.label}</p>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>· {tf.desc}</p>
                  </div>
                  {tfGoals.map(g => (
                    <GoalCard key={g.id} goal={g} onDelete={id => deleteMutation.mutate(id)} />
                  ))}
                </div>
              );
            })
          )}

          {/* Closing affirmation */}
          <div style={{ borderRadius: 14, padding: "14px 18px", marginTop: 8,
            background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.15)",
            textAlign: "center" }}>
            <p style={{ fontSize: 13, color: "rgba(251,191,36,0.7)", fontStyle: "italic", lineHeight: 1.6 }}>
              "The version of you that you're working toward is already real. You're just catching up to them."
            </p>
          </div>

        </div>
      </div>

      {showAdd && user && (
        <AddGoalSheet
          onClose={() => setShowAdd(false)}
          userEmail={user.email}
          onSaved={() => {}}
        />
      )}
    </div>
  );
}