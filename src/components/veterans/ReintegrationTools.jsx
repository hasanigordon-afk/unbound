import React, { useState } from "react";
import { Plus, Check, Target, Loader2, X } from "lucide-react";
import { VET_COLORS, GOAL_CATEGORIES, getTodayMission } from "./veteransData";

const MOODS = [
  { v: 1, emoji: "😞" },
  { v: 2, emoji: "😕" },
  { v: 3, emoji: "🙂" },
  { v: 4, emoji: "😊" },
  { v: 5, emoji: "🤩" },
];

function GoalModal({ onSubmit, onClose, saving }) {
  const [category, setCategory] = useState("fitness");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(28,20,16,0.6)", display: "flex", alignItems: "flex-end" }}>
      <div style={{ background: VET_COLORS.surface, width: "100%", maxWidth: 480, margin: "0 auto", borderRadius: "20px 20px 0 0", padding: "24px 20px 32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <h3 style={{ fontFamily: "'Lora', serif", fontSize: 20, fontWeight: 600, color: VET_COLORS.text }}>New goal</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: VET_COLORS.dim }}>
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        <p style={{ fontSize: 10, fontWeight: 700, color: VET_COLORS.dim, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 10 }}>
          Category
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
          {GOAL_CATEGORIES.map(c => {
            const sel = category === c.key;
            return (
              <button key={c.key} onClick={() => setCategory(c.key)} style={{
                padding: "12px 10px", borderRadius: 12, cursor: "pointer",
                background: sel ? `${c.color}15` : VET_COLORS.bg,
                border: `1.5px solid ${sel ? c.color : VET_COLORS.border}`,
                display: "flex", alignItems: "center", gap: 8, textAlign: "left",
              }}>
                <span style={{ fontSize: 18 }}>{c.emoji}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: sel ? c.color : VET_COLORS.text }}>{c.label}</span>
              </button>
            );
          })}
        </div>

        <input
          value={title}
          onChange={e => setTitle(e.target.value.slice(0, 100))}
          placeholder="Goal title"
          style={{
            width: "100%", padding: "12px 14px", borderRadius: 12,
            border: `1px solid ${VET_COLORS.border}`, background: VET_COLORS.bg,
            fontSize: 14, marginBottom: 10, boxSizing: "border-box", outline: "none",
          }}
        />
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value.slice(0, 400))}
          rows={3}
          placeholder="Notes (optional)"
          style={{
            width: "100%", padding: "12px 14px", borderRadius: 12,
            border: `1px solid ${VET_COLORS.border}`, background: VET_COLORS.bg,
            fontSize: 14, marginBottom: 16, boxSizing: "border-box", outline: "none", resize: "none",
            fontFamily: "inherit",
          }}
        />

        <button
          onClick={() => onSubmit({ category, title: title.trim(), notes: notes.trim() })}
          disabled={!title.trim() || saving}
          style={{
            width: "100%", padding: 13, borderRadius: 50, border: "none",
            background: title.trim() ? VET_COLORS.olive : VET_COLORS.border,
            color: "#fff", fontWeight: 700, fontSize: 14,
            cursor: title.trim() ? "pointer" : "default",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
        >
          {saving && <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" />}
          Save Goal
        </button>
      </div>
    </div>
  );
}

export default function ReintegrationTools({ todayMission, goals, onSetMood, onToggleMission, onCreateGoal, onUpdateGoal, saving }) {
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const mission = getTodayMission();
  const activeGoals = goals.filter(g => g.status === "active");

  return (
    <div style={{ padding: "20px 16px 40px" }}>
      <p style={{ fontFamily: "'Lora', serif", fontSize: 22, fontWeight: 600, color: VET_COLORS.text, marginBottom: 4 }}>
        Reintegration Tools
      </p>
      <p style={{ fontSize: 13, color: VET_COLORS.muted, marginBottom: 18, lineHeight: 1.5 }}>
        Structure. Progress. Purpose.
      </p>

      {/* Mood */}
      <div style={{ background: VET_COLORS.surface, border: `1px solid ${VET_COLORS.border}`, borderRadius: 14, padding: "16px 18px", marginBottom: 12 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: VET_COLORS.text, marginBottom: 12 }}>How are you today?</p>
        <div style={{ display: "flex", gap: 6 }}>
          {MOODS.map(m => {
            const sel = todayMission?.mood_rating === m.v;
            return (
              <button key={m.v} onClick={() => onSetMood(m.v)} style={{
                flex: 1, padding: "10px 4px", borderRadius: 12, cursor: "pointer",
                background: sel ? VET_COLORS.oliveDim : VET_COLORS.bg,
                border: `1.5px solid ${sel ? VET_COLORS.olive : VET_COLORS.border}`,
                fontSize: 22,
              }}>{m.emoji}</button>
            );
          })}
        </div>
      </div>

      {/* Mission of the Day */}
      <div style={{
        background: `linear-gradient(135deg, ${VET_COLORS.oliveDim}, ${VET_COLORS.navyDim})`,
        border: `1px solid ${VET_COLORS.olive}35`,
        borderRadius: 14, padding: "16px 18px", marginBottom: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <Target style={{ width: 16, height: 16, color: VET_COLORS.olive }} strokeWidth={2} />
          <p style={{ fontSize: 11, fontWeight: 700, color: VET_COLORS.olive, textTransform: "uppercase", letterSpacing: ".1em" }}>
            Mission for the day
          </p>
        </div>
        <p style={{ fontSize: 15, color: VET_COLORS.text, lineHeight: 1.55, marginBottom: 12, fontFamily: "'Lora', serif", fontWeight: 500 }}>
          {mission}
        </p>
        <button
          onClick={() => onToggleMission(mission)}
          style={{
            width: "100%", padding: 12, borderRadius: 50, border: "none", cursor: "pointer",
            background: todayMission?.mission_completed ? VET_COLORS.olive : VET_COLORS.surface,
            color: todayMission?.mission_completed ? "#fff" : VET_COLORS.olive,
            border: `1px solid ${VET_COLORS.olive}`,
            fontWeight: 700, fontSize: 13,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}
        >
          {todayMission?.mission_completed && <Check style={{ width: 14, height: 14 }} strokeWidth={2.5} />}
          {todayMission?.mission_completed ? "Mission Complete" : "Mark Complete"}
        </button>
      </div>

      {/* Goals */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20, marginBottom: 10 }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: VET_COLORS.dim, textTransform: "uppercase", letterSpacing: ".1em" }}>
          Your goals
        </p>
        <button onClick={() => setGoalModalOpen(true)} style={{
          background: "none", border: "none", cursor: "pointer",
          color: VET_COLORS.olive, fontSize: 12, fontWeight: 700,
          display: "inline-flex", alignItems: "center", gap: 4,
        }}>
          <Plus style={{ width: 13, height: 13 }} />
          Add Goal
        </button>
      </div>

      {activeGoals.length === 0 ? (
        <div style={{
          background: VET_COLORS.surface, border: `1px dashed ${VET_COLORS.border}`,
          borderRadius: 14, padding: "24px 20px", textAlign: "center",
        }}>
          <p style={{ fontSize: 13, color: VET_COLORS.dim, lineHeight: 1.6 }}>
            No goals yet. Set your first one — employment, fitness, sobriety, or family.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {activeGoals.map(g => {
            const cat = GOAL_CATEGORIES.find(c => c.key === g.category) || GOAL_CATEGORIES[0];
            return (
              <div key={g.id} style={{ background: VET_COLORS.surface, border: `1px solid ${VET_COLORS.border}`, borderRadius: 14, padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                    background: `${cat.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
                  }}>{cat.emoji}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: VET_COLORS.text }}>{g.title}</p>
                    <p style={{ fontSize: 10, color: cat.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em" }}>{cat.label}</p>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 800, color: cat.color }}>{g.progress || 0}%</span>
                </div>
                <div style={{ height: 6, background: VET_COLORS.bg, borderRadius: 3, overflow: "hidden", marginBottom: 10 }}>
                  <div style={{ height: "100%", width: `${g.progress || 0}%`, background: cat.color, borderRadius: 3, transition: "width 0.4s" }} />
                </div>
                <input
                  type="range" min="0" max="100" step="5"
                  value={g.progress || 0}
                  onChange={e => onUpdateGoal(g.id, { progress: parseInt(e.target.value) })}
                  style={{ width: "100%", accentColor: cat.color, cursor: "pointer" }}
                />
              </div>
            );
          })}
        </div>
      )}

      {goalModalOpen && (
        <GoalModal
          saving={saving}
          onClose={() => setGoalModalOpen(false)}
          onSubmit={(data) => { onCreateGoal(data); setGoalModalOpen(false); }}
        />
      )}
    </div>
  );
}