import React from "react";

export const INTERESTS = [
  { id: "art",         label: "Visual Art",    emoji: "🎨", color: "#F472B6" },
  { id: "music",       label: "Music",         emoji: "🎵", color: "#A78BFA" },
  { id: "writing",     label: "Writing",       emoji: "✍️", color: "#60A5FA" },
  { id: "business",    label: "Business",      emoji: "💼", color: "#FBBF24" },
  { id: "tech",        label: "Tech & Coding", emoji: "💻", color: "#34D399" },
  { id: "fitness",     label: "Fitness",       emoji: "💪", color: "#F87171" },
  { id: "cooking",     label: "Cooking",       emoji: "🍳", color: "#FB923C" },
  { id: "photography", label: "Photography",   emoji: "📸", color: "#38BDF8" },
  { id: "fashion",     label: "Fashion",       emoji: "👗", color: "#E879F9" },
  { id: "nature",      label: "Nature",        emoji: "🌿", color: "#4ADE80" },
  { id: "community",   label: "Community",     emoji: "🤝", color: "#2DD4BF" },
  { id: "spirituality",label: "Spirituality",  emoji: "🕊️", color: "#C4B5FD" },
  { id: "education",   label: "Education",     emoji: "📚", color: "#FCD34D" },
  { id: "parenting",   label: "Parenting",     emoji: "👶", color: "#FCA5A5" },
  { id: "crafts",      label: "Crafts & DIY",  emoji: "🛠️", color: "#D97706" },
  { id: "other",       label: "Something Else",emoji: "✨", color: "#94A3B8" },
];

export default function InterestSelector({ selected, onChange, max = 6 }) {
  const toggle = (id) => {
    if (selected.includes(id)) {
      onChange(selected.filter(s => s !== id));
    } else if (selected.length < max) {
      onChange([...selected, id]);
    }
  };

  return (
    <div>
      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 14, lineHeight: 1.6 }}>
        Pick up to {max} that feel true to you right now. You can always change these.
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {INTERESTS.map(i => {
          const active = selected.includes(i.id);
          const maxed = !active && selected.length >= max;
          return (
            <button key={i.id} onClick={() => !maxed && toggle(i.id)}
              style={{ padding: "9px 14px", borderRadius: 14, border: "none",
                cursor: maxed ? "not-allowed" : "pointer",
                background: active ? i.color + "20" : "rgba(255,255,255,0.05)",
                border: `1.5px solid ${active ? i.color + "60" : "rgba(255,255,255,0.08)"}`,
                opacity: maxed ? 0.4 : 1, transition: "all 0.15s ease" }}>
              <span style={{ fontSize: 14, marginRight: 6 }}>{i.emoji}</span>
              <span style={{ fontSize: 12, fontWeight: 700,
                color: active ? i.color : "rgba(255,255,255,0.55)" }}>{i.label}</span>
            </button>
          );
        })}
      </div>
      {selected.length > 0 && (
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 10 }}>
          {selected.length}/{max} selected
        </p>
      )}
    </div>
  );
}