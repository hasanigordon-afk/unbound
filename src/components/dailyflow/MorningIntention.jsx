import React, { useState } from "react";
import { Sunrise, CheckCircle2, Loader2, Edit2 } from "lucide-react";

const PROMPTS = [
  "What's one thing I want to feel by the end of today?",
  "What do I need most from myself today?",
  "What am I choosing to focus on today?",
  "What would make today feel meaningful?",
];

export default function MorningIntention({ entry, onSave, isSaving }) {
  const [editing, setEditing] = useState(!entry?.intention_set);
  const [text, setText] = useState(entry?.intention || "");
  const prompt = PROMPTS[new Date().getDay() % PROMPTS.length];

  const handleSave = () => {
    if (!text.trim()) return;
    onSave({ intention: text.trim(), intention_set: true });
    setEditing(false);
  };

  if (!editing && entry?.intention_set) {
    return (
      <div style={{ borderRadius: 18, padding: "18px 20px",
        background: "linear-gradient(135deg,rgba(255,200,60,0.08),rgba(251,146,60,0.05))",
        border: "1px solid rgba(251,146,60,0.2)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <Sunrise style={{ color: "#FB923C", width: 18, height: 18, flexShrink: 0 }} />
          <p style={{ fontSize: 12, fontWeight: 800, color: "#FB923C", textTransform: "uppercase", letterSpacing: ".08em" }}>
            Morning Intention ✓
          </p>
          <button onClick={() => setEditing(true)}
            style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", padding: 4 }}>
            <Edit2 style={{ color: "rgba(255,255,255,0.25)", width: 13, height: 13 }} />
          </button>
        </div>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.75)", fontStyle: "italic",
          lineHeight: 1.6, borderLeft: "3px solid rgba(251,146,60,0.4)", paddingLeft: 12 }}>
          "{entry.intention}"
        </p>
      </div>
    );
  }

  return (
    <div style={{ borderRadius: 18, padding: "18px 20px",
      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(251,146,60,0.2)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <Sunrise style={{ color: "#FB923C", width: 18, height: 18 }} />
        <p style={{ fontSize: 13, fontWeight: 800, color: "#FB923C" }}>Morning Intention</p>
      </div>
      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 10, fontStyle: "italic" }}>
        {prompt}
      </p>
      <textarea value={text} onChange={e => setText(e.target.value)}
        placeholder="Write whatever comes to mind…" rows={3}
        style={{ width: "100%", padding: "12px 14px", borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)",
          color: "#fff", fontSize: 14, resize: "none", outline: "none",
          boxSizing: "border-box", lineHeight: 1.6, marginBottom: 12 }} />
      <button onClick={handleSave} disabled={!text.trim() || isSaving}
        style={{ width: "100%", padding: "12px", borderRadius: 12, border: "none",
          cursor: text.trim() ? "pointer" : "not-allowed",
          background: text.trim() ? "linear-gradient(135deg,#FB923C,#F97316)" : "rgba(255,255,255,0.07)",
          color: text.trim() ? "#fff" : "rgba(255,255,255,0.3)",
          fontWeight: 800, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        {isSaving ? <Loader2 style={{ width: 15, height: 15 }} className="animate-spin" />
          : <CheckCircle2 style={{ width: 15, height: 15 }} />}
        Set My Intention
      </button>
    </div>
  );
}