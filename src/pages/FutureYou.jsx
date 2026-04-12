import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ChevronLeft, Plus, Sparkles, X, Trash2, Check } from "lucide-react";
import { createPageUrl } from "./utils";

const C = {
  amber:   "#B8823A",
  green:   "#7A9E7E",
  indigo:  "#7B8FA8",
  red:     "#C9534F",
  muted:   "#9B8E83",
  text:    "#1C1410",
  textMuted: "#4A3F35",
  bg:      "#F7F3EE",
  surface: "#FDFAF6",
  border:  "#E8E2D9",
};

const TIMEFRAMES = [
  { id: "6_months", label: "6 Months", emoji: "🌱", color: C.green  },
  { id: "1_year",   label: "1 Year",   emoji: "🌟", color: C.amber  },
  { id: "5_years",  label: "5 Years",  emoji: "🚀", color: C.indigo },
];

const CATEGORIES = [
  { id: "health",        label: "Health",        emoji: "💪", color: C.green  },
  { id: "family",        label: "Family",        emoji: "👨‍👩‍👧", color: C.red    },
  { id: "career",        label: "Career",        emoji: "💼", color: C.indigo },
  { id: "freedom",       label: "Freedom",       emoji: "🕊️", color: C.amber  },
  { id: "relationships", label: "Relationships", emoji: "🤝", color: C.green  },
  { id: "personal",      label: "Personal",      emoji: "🌱", color: C.amber  },
  { id: "financial",     label: "Financial",     emoji: "💰", color: C.indigo },
  { id: "spiritual",     label: "Spiritual",     emoji: "🙏", color: C.muted  },
];

const MOTIVATION_SUGGESTIONS = [
  "My kids", "My family", "My health", "My freedom", "Being present",
  "Proving it to myself", "A better life", "My future partner", "My community",
  "Peace of mind", "Financial stability", "Being a role model",
];

function GoalCard({ goal, onDelete }) {
  const tf = TIMEFRAMES.find(t => t.id === goal.timeframe);
  const cat = CATEGORIES.find(c => c.id === goal.category);
  const color = tf?.color || C.amber;

  return (
    <div style={{ borderRadius: 14, padding: "16px 18px", marginBottom: 10,
      background: C.surface, border: `.5px solid ${C.border}` }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 10, fontWeight: 700, color, background: color + "15",
              padding: "3px 9px", borderRadius: 10 }}>{tf?.emoji} {tf?.label}</span>
            {cat && <span style={{ fontSize: 10, fontWeight: 700, color: cat.color,
              background: cat.color + "10", padding: "3px 9px", borderRadius: 10 }}>
              {cat.emoji} {cat.label}
            </span>}
          </div>
          <p style={{ fontSize: 15, fontWeight: 700, color: C.text, lineHeight: 1.3, marginBottom: goal.description ? 5 : 0 }}>
            {goal.title}
          </p>
          {goal.description && (
            <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{goal.description}</p>
          )}
          {goal.motivations?.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 8 }}>
              {goal.motivations.map(m => (
                <span key={m} style={{ fontSize: 10, fontWeight: 600, color: C.muted,
                  background: C.bg, padding: "3px 9px", borderRadius: 10, border: `1px solid ${C.border}` }}>
                  {m}
                </span>
              ))}
            </div>
          )}
        </div>
        <button onClick={() => onDelete(goal.id)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 4, flexShrink: 0, color: C.muted }}>
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
    if (customMotivation.trim()) { setMotivations(prev => [...prev, customMotivation.trim()]); setCustomMotivation(""); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "flex-end",
      background: "rgba(28,20,16,0.5)" }} onClick={onClose}>
      <div style={{ width: "100%", maxWidth: 480, margin: "0 auto", borderRadius: "20px 20px 0 0",
        background: C.surface, padding: "24px 20px 48px", border: `1px solid ${C.border}`,
        maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <p style={{ fontFamily: "'Lora', serif", fontSize: 18, fontWeight: 600, color: C.text }}>Add a Goal</p>
          <button onClick={onClose} style={{ background: C.bg, border: `1px solid ${C.border}`,
            borderRadius: "50%", width: 30, height: 30, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X style={{ color: C.muted, width: 14, height: 14 }} />
          </button>
        </div>

        <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>Timeframe</p>
        <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
          {TIMEFRAMES.map(tf => (
            <button key={tf.id} onClick={() => setTimeframe(tf.id)}
              style={{ flex: 1, padding: "10px 6px", borderRadius: 12, cursor: "pointer",
                background: timeframe === tf.id ? tf.color + "15" : C.bg,
                border: `1.5px solid ${timeframe === tf.id ? tf.color + "50" : C.border}`,
                color: timeframe === tf.id ? tf.color : C.muted,
                fontSize: 11, fontWeight: 700, textAlign: "center" }}>
              {tf.emoji}<br />{tf.label}
            </button>
          ))}
        </div>

        <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>Category</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 18 }}>
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setCategory(cat.id)}
              style={{ padding: "6px 12px", borderRadius: 20, cursor: "pointer", fontSize: 11, fontWeight: 700,
                background: category === cat.id ? cat.color + "15" : C.bg,
                border: `1.5px solid ${category === cat.id ? cat.color + "45" : C.border}`,
                color: category === cat.id ? cat.color : C.muted }}>
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>

        <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>Goal *</p>
        <input value={title} onChange={e => setTitle(e.target.value)}
          placeholder="e.g. Be present for my kids every day"
          style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1px solid ${C.border}`,
            background: C.bg, color: C.text, fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: 14 }} />

        <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>What does this look like? (optional)</p>
        <textarea value={description} onChange={e => setDescription(e.target.value)}
          placeholder="Describe what achieving this means to you..." rows={2}
          style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1px solid ${C.border}`,
            background: C.bg, color: C.text, fontSize: 13, outline: "none",
            resize: "none", boxSizing: "border-box", marginBottom: 18 }} />

        <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>What's driving this?</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
          {MOTIVATION_SUGGESTIONS.map(m => {
            const sel = motivations.includes(m);
            return (
              <button key={m} onClick={() => toggleMotivation(m)}
                style={{ padding: "6px 12px", borderRadius: 20, cursor: "pointer", fontSize: 11, fontWeight: 700,
                  background: sel ? "rgba(184,130,58,.15)" : C.bg,
                  border: `1.5px solid ${sel ? "rgba(184,130,58,.4)" : C.border}`,
                  color: sel ? C.amber : C.muted,
                  display: "flex", alignItems: "center", gap: 4 }}>
                {sel && <Check style={{ width: 10, height: 10 }} />} {m}
              </button>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
          <input value={customMotivation} onChange={e => setCustomMotivation(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addCustom()} placeholder="Add your own..."
            style={{ flex: 1, padding: "10px 14px", borderRadius: 12, border: `1px solid ${C.border}`,
              background: C.bg, color: C.text, fontSize: 13, outline: "none" }} />
          <button onClick={addCustom}
            style={{ padding: "10px 14px", borderRadius: 12, background: "rgba(184,130,58,.12)",
              border: "1px solid rgba(184,130,58,.25)", color: C.amber, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            Add
          </button>
        </div>

        <button onClick={() => saveMutation.mutate()} disabled={!title.trim() || saveMutation.isPending}
          style={{ width: "100%", padding: "15px", borderRadius: 50, border: "none", cursor: "pointer",
            background: title.trim() ? C.amber : C.border,
            color: title.trim() ? "#fff" : C.muted, fontWeight: 700, fontSize: 15 }}>
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

  const { data: checkIns = [] } = useQuery({
    queryKey: ["future-you-checkins", user?.email],
    queryFn: () => base44.entities.DailyCheckIn.filter({ participant_email: user.email }, "-check_in_date", 30),
    enabled: !!user?.email,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.FutureYouGoal.update(id, { is_active: false }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["future-you-goals"] }),
  });

  const consistencyScore = useMemo(() => {
    const last30 = checkIns.filter(c => (Date.now() - new Date(c.check_in_date).getTime()) <= 30 * 86400000);
    return Math.min(100, Math.round((last30.length / 30) * 100));
  }, [checkIns]);

  const consistencyColor = consistencyScore >= 70 ? C.green : consistencyScore >= 40 ? C.amber : C.red;
  const consistencyLabel = consistencyScore >= 70 ? "Strong momentum" : consistencyScore >= 40 ? "Building habits" : consistencyScore > 0 ? "Just getting started" : "Start checking in daily";

  const goalsByTimeframe = useMemo(() => {
    const map = {};
    TIMEFRAMES.forEach(tf => { map[tf.id] = goals.filter(g => g.timeframe === tf.id); });
    return map;
  }, [goals]);

  return (
    <div style={{ background: C.bg, minHeight: "100vh", paddingBottom: 100 }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "56px 24px 24px" }}>
          <Link to={createPageUrl("MyFoundation")} style={{ display: "inline-flex", alignItems: "center", gap: 6,
            color: C.muted, fontSize: 12, marginBottom: 16, textDecoration: "none", fontWeight: 600 }}>
            <ChevronLeft style={{ width: 15, height: 15 }} /> Back
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Sparkles style={{ color: C.amber, width: 16, height: 16 }} />
            <p style={{ fontSize: 11, fontWeight: 700, color: C.amber, textTransform: "uppercase", letterSpacing: ".1em" }}>Future You</p>
          </div>
          <h1 style={{ fontFamily: "'Lora', serif", fontSize: 24, fontWeight: 600, color: C.text, lineHeight: 1.2, marginBottom: 6 }}>
            Who do you want<br />to become?
          </h1>
          <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
            Set goals for the future you're building — one consistent day at a time.
          </p>
        </div>

        <div style={{ padding: "20px 16px" }}>

          {/* Consistency */}
          <div style={{ borderRadius: 16, padding: "20px", marginBottom: 20, background: C.surface, border: `.5px solid ${C.border}` }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 3 }}>Daily Consistency Score</p>
                <p style={{ fontSize: 11, color: C.muted }}>Based on check-ins over 30 days</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 28, fontWeight: 700, color: consistencyColor, lineHeight: 1 }}>{consistencyScore}%</p>
                <p style={{ fontSize: 10, color: consistencyColor, fontWeight: 700, marginTop: 2 }}>{consistencyLabel}</p>
              </div>
            </div>

            <div style={{ background: C.border, borderRadius: 8, height: 8, overflow: "hidden", marginBottom: 10 }}>
              <div style={{ width: `${consistencyScore}%`, height: "100%", borderRadius: 8,
                background: consistencyColor, transition: "width 0.8s ease" }} />
            </div>

            <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
              {Array.from({ length: 30 }).map((_, i) => {
                const d = new Date(); d.setDate(d.getDate() - (29 - i));
                const ds = d.toISOString().split("T")[0];
                const checked = checkIns.some(c => c.check_in_date === ds);
                return <div key={i} style={{ width: 8, height: 8, borderRadius: 2, background: checked ? consistencyColor : C.border }} />;
              })}
            </div>
            <p style={{ fontSize: 10, color: C.muted, marginTop: 6 }}>Each square = 1 day · last 30 days</p>
          </div>

          {/* Add Goal */}
          <button onClick={() => setShowAdd(true)}
            style={{ width: "100%", padding: "14px", borderRadius: 50, border: "none", cursor: "pointer",
              background: C.amber, color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              fontWeight: 700, fontSize: 14, marginBottom: 24 }}>
            <Plus style={{ width: 16, height: 16 }} /> Add a Goal
          </button>

          {goals.length === 0 ? (
            <div style={{ borderRadius: 16, padding: "36px 24px", textAlign: "center",
              background: C.surface, border: `.5px solid ${C.border}` }}>
              <p style={{ fontSize: 36, marginBottom: 10 }}>🚀</p>
              <p style={{ fontFamily: "'Lora', serif", fontSize: 16, fontWeight: 600, color: C.text, marginBottom: 6 }}>
                Where do you see yourself?
              </p>
              <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
                Add your first goal. Even one small vision helps.
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
                    <p style={{ fontSize: 13, fontWeight: 700, color: tf.color }}>{tf.label}</p>
                  </div>
                  {tfGoals.map(g => <GoalCard key={g.id} goal={g} onDelete={id => deleteMutation.mutate(id)} />)}
                </div>
              );
            })
          )}

          <div style={{ borderRadius: 14, padding: "14px 18px", marginTop: 8,
            background: "rgba(184,130,58,.07)", border: "1px solid rgba(184,130,58,.2)", textAlign: "center" }}>
            <p style={{ fontSize: 13, color: C.textMuted, fontStyle: "italic", lineHeight: 1.6 }}>
              "The version of you that you're working toward is already real. You're just catching up to them."
            </p>
          </div>
        </div>
      </div>

      {showAdd && user && (
        <AddGoalSheet onClose={() => setShowAdd(false)} userEmail={user.email} onSaved={() => {}} />
      )}
    </div>
  );
}