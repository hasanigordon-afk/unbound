import React, { useState } from "react";
import { CheckCircle2, Clock, SkipForward, RotateCcw, ChevronDown, Zap } from "lucide-react";

const CAT_CONFIG = {
  recovery:         { emoji: "🔵", color: "#2DD4BF", label: "Recovery"        },
  wellness:         { emoji: "🟢", color: "#10B981", label: "Wellness"         },
  responsibilities: { emoji: "🟡", color: "#F59E0B", label: "Responsibilities" },
  family:           { emoji: "🩷", color: "#F472B6", label: "Family"           },
  health:           { emoji: "🟠", color: "#FB923C", label: "Health"           },
  employment:       { emoji: "💼", color: "#6366F1", label: "Employment"       },
  legal_probation:  { emoji: "⚖️", color: "#EF4444", label: "Legal / Probation"},
  personal_growth:  { emoji: "⭐", color: "#A78BFA", label: "Personal Growth"  },
};

const PRIORITY_CONFIG = {
  essential: { label: "Essential", color: "#EF4444" },
  high:      { label: "High",      color: "#F59E0B" },
  normal:    { label: "Normal",    color: "#6366F1" },
  optional:  { label: "Optional",  color: "rgba(255,255,255,0.25)" },
};

const SKIP_REASONS = [
  "Not feeling well", "Scheduling conflict", "Low energy",
  "Already handled it differently", "Other",
];

const MOTIVATIONAL = [
  "You built this plan for a reason. One more win today.",
  "Small steps count. Your next goal is coming up.",
  "Stay with your path. Progress is still progress.",
  "A quick win today keeps momentum alive.",
  "This one's worth doing. You've got it.",
  "Each task completed is a vote for who you're becoming.",
];

export default function PathTaskCard({ task, status, onDone, onSkip, onUndo, pointsPreview }) {
  const [showSkip, setShowSkip] = useState(false);
  const [skipReason, setSkipReason] = useState("");
  const [flashed, setFlashed] = useState(false);
  const cat = CAT_CONFIG[task.category] || CAT_CONFIG.personal_growth;
  const pri = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.normal;
  const msg = MOTIVATIONAL[Math.floor(Math.random() * MOTIVATIONAL.length)];

  const handleDone = () => {
    setFlashed(true);
    setTimeout(() => { setFlashed(false); onDone(task); }, 400);
  };

  const isDone    = status === "done";
  const isSkipped = status === "skipped";

  return (
    <div style={{
      borderRadius: 18, overflow: "hidden", marginBottom: 10,
      background: isDone   ? "rgba(16,185,129,0.06)"  :
                  isSkipped? "rgba(255,255,255,0.02)"  :
                  flashed  ? "rgba(45,212,191,0.12)"   : "rgba(255,255,255,0.04)",
      border: `1px solid ${isDone   ? "rgba(16,185,129,0.22)" :
                            isSkipped? "rgba(255,255,255,0.05)" :
                                       `${cat.color}22`}`,
      transition: "all 0.3s ease",
      opacity: isSkipped ? 0.5 : 1,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px" }}>
        {/* Category dot / check */}
        <div onClick={!isDone && !isSkipped ? handleDone : undefined}
          style={{ width: 40, height: 40, borderRadius: "50%", flexShrink: 0, cursor: isDone || isSkipped ? "default" : "pointer",
            background: isDone ? "rgba(16,185,129,0.15)" : `${cat.color}15`,
            display: "flex", alignItems: "center", justifyContent: "center",
            border: `1.5px solid ${isDone ? "rgba(16,185,129,0.35)" : `${cat.color}35`}`,
            transition: "transform 0.15s ease",
          }}>
          {isDone
            ? <CheckCircle2 style={{ color: "#10B981", width: 18, height: 18 }} />
            : <span style={{ fontSize: 18 }}>{cat.emoji}</span>}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
            <p style={{ fontSize: 15, fontWeight: 800, color: isDone ? "#10B981" : "#fff",
              textDecoration: isSkipped ? "line-through" : "none",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {task.title}
            </p>
            {task.is_essential && !isDone && (
              <span style={{ fontSize: 9, fontWeight: 800, color: "#EF4444", background: "rgba(239,68,68,0.1)",
                padding: "2px 6px", borderRadius: 8, letterSpacing: ".05em", textTransform: "uppercase", flexShrink: 0 }}>
                Must-Do
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: cat.color }}>{cat.label}</span>
            {task.preferred_time && (
              <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                <Clock style={{ width: 10, height: 10, color: "rgba(255,255,255,0.3)" }} />
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{task.preferred_time}</span>
              </div>
            )}
            {task.estimated_minutes && (
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>{task.estimated_minutes}m</span>
            )}
            <span style={{ fontSize: 10, fontWeight: 700, color: pri.color }}>{pri.label}</span>
          </div>
        </div>

        {/* Actions */}
        {!isDone && !isSkipped && (
          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
            <button onClick={handleDone}
              style={{ padding: "7px 14px", borderRadius: 10, border: "none", cursor: "pointer",
                background: `linear-gradient(135deg,${cat.color},${cat.color}CC)`,
                color: "#07090F", fontWeight: 800, fontSize: 12,
                display: "flex", alignItems: "center", gap: 4 }}>
              <Zap style={{ width: 11, height: 11 }} /> Done
            </button>
            <button onClick={() => setShowSkip(!showSkip)}
              style={{ padding: "7px 10px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)",
                background: "transparent", cursor: "pointer", color: "rgba(255,255,255,0.3)" }}>
              <SkipForward style={{ width: 13, height: 13 }} />
            </button>
          </div>
        )}
        {isDone && (
          <button onClick={() => onUndo && onUndo(task)}
            style={{ padding: "6px 10px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.07)",
              background: "transparent", cursor: "pointer", color: "rgba(255,255,255,0.25)", fontSize: 11 }}>
            <RotateCcw style={{ width: 12, height: 12 }} />
          </button>
        )}
      </div>

      {/* Points preview */}
      {!isDone && !isSkipped && pointsPreview && (
        <div style={{ padding: "0 16px 10px" }}>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontStyle: "italic" }}>{msg}</p>
        </div>
      )}

      {/* Skip reason panel */}
      {showSkip && (
        <div style={{ padding: "12px 16px 14px", borderTop: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(0,0,0,0.2)" }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>
            Skip reason — no judgment.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
            {SKIP_REASONS.map(r => (
              <button key={r} onClick={() => setSkipReason(r)}
                style={{ padding: "5px 10px", borderRadius: 20, border: `1px solid ${skipReason===r?"rgba(245,158,11,0.5)":"rgba(255,255,255,0.1)"}`,
                  background: skipReason === r ? "rgba(245,158,11,0.1)" : "transparent",
                  color: skipReason === r ? "#F59E0B" : "rgba(255,255,255,0.4)",
                  fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                {r}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => { onSkip(task, skipReason); setShowSkip(false); }}
              style={{ flex: 1, padding: "9px", borderRadius: 10, border: "1px solid rgba(245,158,11,0.3)",
                background: "rgba(245,158,11,0.08)", color: "#F59E0B", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
              Skip for Now
            </button>
            <button onClick={() => setShowSkip(false)}
              style={{ padding: "9px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)",
                background: "transparent", color: "rgba(255,255,255,0.3)", fontSize: 12, cursor: "pointer" }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}