import React, { useState } from "react";
import { Bookmark, ExternalLink, Eye } from "lucide-react";

const AMBER = "#B8823A";
const CATEGORY_META = {
  relapse_reality:         { label: "Relapse Reality",        emoji: "📊" },
  rehab_fraud:             { label: "Rehab Fraud",            emoji: "🚨" },
  success_story:           { label: "Success Story",          emoji: "🌟" },
  what_helps:              { label: "What Actually Helps",    emoji: "💡" },
  facility_accountability: { label: "Facility Accountability",emoji: "🔍" },
  hope_inspiration:        { label: "Hope & Inspiration",     emoji: "🙏" },
};

const REACTIONS = [
  { key: "reaction_eyeopening", label: "Eye-opening", emoji: "👁️" },
  { key: "reaction_helpful",    label: "Helpful",     emoji: "🙌" },
  { key: "reaction_inspiring",  label: "Inspiring",   emoji: "✨" },
  { key: "reaction_hardtruth",  label: "Hard truth",  emoji: "💔" },
  { key: "reaction_mustread",   label: "Must read",   emoji: "🔥" },
];

export default function TruthArticleCard({ article, isSaved, onSave, onReact, onOpen }) {
  const [myReaction, setMyReaction] = useState(null);
  const [localCounts, setLocalCounts] = useState({});
  const meta = CATEGORY_META[article.category] || { label: article.category, emoji: "📰" };

  const handleReact = (key) => {
    if (myReaction === key) return;
    setMyReaction(key);
    setLocalCounts(p => ({ ...p, [key]: (p[key] || 0) + 1 }));
    onReact && onReact(article, key);
  };

  return (
    <div style={{
      background: "#FDFAF6", border: "1px solid #E8E2D9",
      borderRadius: 16, overflow: "hidden", marginBottom: 14,
      boxShadow: "0 1px 6px rgba(28,20,16,0.07)",
    }}>
      {/* Image */}
      {article.image_url && (
        <div style={{ height: 160, overflow: "hidden", position: "relative" }}>
          <img src={article.image_url} alt={article.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 60%)",
          }} />
          <div style={{ position: "absolute", bottom: 10, left: 12 }}>
            <span style={{
              padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
              background: "rgba(184,130,58,0.85)", color: "#fff",
            }}>
              {meta.emoji} {meta.label}
            </span>
          </div>
        </div>
      )}

      <div style={{ padding: "14px 16px 0" }}>
        {!article.image_url && (
          <span style={{
            display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
            background: "rgba(184,130,58,0.10)", color: AMBER, marginBottom: 8,
          }}>
            {meta.emoji} {meta.label}
          </span>
        )}

        {/* Title */}
        <h3
          onClick={() => onOpen && onOpen(article)}
          style={{ fontSize: 15, fontWeight: 600, color: "#1C1410", lineHeight: 1.35, marginBottom: 7, cursor: "pointer", fontFamily: "'Lora', Georgia, serif" }}
        >
          {article.title}
        </h3>

        {/* Summary */}
        <p style={{ fontSize: 12, color: "#4A3F35", lineHeight: 1.6, marginBottom: 10 }}>
          {article.summary?.slice(0, 160)}{article.summary?.length > 160 ? "…" : ""}
        </p>

        {/* Why it matters */}
        {article.why_it_matters && (
          <div style={{
            background: "rgba(184,130,58,0.06)", border: "1px solid rgba(184,130,58,0.18)",
            borderRadius: 8, padding: "8px 12px", marginBottom: 10,
          }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: AMBER, marginBottom: 2 }}>WHY THIS MATTERS</p>
            <p style={{ fontSize: 11, color: "#4A3F35", lineHeight: 1.5 }}>{article.why_it_matters}</p>
          </div>
        )}

        {/* Reactions */}
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
          {REACTIONS.map(r => {
            const count = (article[r.key] || 0) + (localCounts[r.key] || 0);
            const active = myReaction === r.key;
            return (
              <button
                key={r.key}
                onClick={() => handleReact(r.key)}
                style={{
                  display: "flex", alignItems: "center", gap: 3,
                  padding: "4px 9px", borderRadius: 20, cursor: "pointer",
                  border: `1px solid ${active ? AMBER : "#E8E2D9"}`,
                  background: active ? "rgba(184,130,58,0.10)" : "#FDFAF6",
                  color: active ? AMBER : "#9B8E83",
                  fontSize: 11, fontWeight: active ? 700 : 500,
                }}
              >
                <span>{r.emoji}</span> {r.label}{count > 0 ? ` · ${count}` : ""}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "8px 16px 12px", borderTop: "1px solid #E8E2D9",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {article.source_name && (
            <span style={{ fontSize: 10, color: AMBER, fontWeight: 600 }}>{article.source_name}</span>
          )}
          {article.publish_date && (
            <span style={{ fontSize: 10, color: "#9B8E83" }}>
              {new Date(article.publish_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          )}
          {article.view_count > 0 && (
            <span style={{ fontSize: 10, color: "#9B8E83", display: "flex", alignItems: "center", gap: 2 }}>
              <Eye style={{ width: 10, height: 10 }} /> {article.view_count}
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={() => onSave && onSave(article)}
            style={{
              width: 30, height: 30, borderRadius: 8, border: `1px solid ${isSaved ? AMBER : "#E8E2D9"}`,
              background: isSaved ? "rgba(184,130,58,0.10)" : "#FDFAF6",
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            }}
          >
            <Bookmark style={{ width: 13, height: 13, color: isSaved ? AMBER : "#9B8E83", fill: isSaved ? AMBER : "none" }} />
          </button>
          {article.source_url && (
            <a
              href={article.source_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex", alignItems: "center", gap: 4,
                padding: "6px 11px", borderRadius: 10, border: "none",
                background: AMBER, color: "#fff", fontSize: 11, fontWeight: 600, textDecoration: "none", minHeight: 30,
              }}
            >
              <ExternalLink style={{ width: 11, height: 11 }} /> Read More
            </a>
          )}
        </div>
      </div>
    </div>
  );
}