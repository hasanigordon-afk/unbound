import React, { useState } from "react";
import { Bookmark, ExternalLink, Eye } from "lucide-react";

const CATEGORY_META = {
  relapse_reality:       { label: "Relapse Reality",        color: "#F59E0B", emoji: "📊" },
  rehab_fraud:           { label: "Rehab Fraud",            color: "#EF4444", emoji: "🚨" },
  success_story:         { label: "Success Story",          color: "#10B981", emoji: "🌟" },
  what_helps:            { label: "What Actually Helps",    color: "#4A90E2", emoji: "💡" },
  facility_accountability: { label: "Facility Accountability", color: "#8B5CF6", emoji: "🔍" },
  hope_inspiration:      { label: "Hope & Inspiration",     color: "#F97316", emoji: "🙏" },
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
  const meta = CATEGORY_META[article.category] || { label: article.category, color: "#6B7280", emoji: "📰" };

  const handleReact = (key) => {
    if (myReaction === key) return;
    setMyReaction(key);
    setLocalCounts(p => ({ ...p, [key]: (p[key] || 0) + 1 }));
    onReact && onReact(article, key);
  };

  return (
    <div style={{
      background: "#fff", border: "1px solid #E5E7EB",
      borderRadius: 16, overflow: "hidden", marginBottom: 14,
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
              background: meta.color + "cc", color: "#fff",
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
            background: meta.color + "18", color: meta.color, marginBottom: 8,
          }}>
            {meta.emoji} {meta.label}
          </span>
        )}

        {/* Title */}
        <h3
          onClick={() => onOpen && onOpen(article)}
          style={{ fontSize: 15, fontWeight: 800, color: "#1E1E1E", lineHeight: 1.35, marginBottom: 7, cursor: "pointer" }}
        >
          {article.title}
        </h3>

        {/* Summary */}
        <p style={{ fontSize: 12, color: "#5A5A5A", lineHeight: 1.6, marginBottom: 10 }}>
          {article.summary?.slice(0, 160)}{article.summary?.length > 160 ? "…" : ""}
        </p>

        {/* Why it matters */}
        {article.why_it_matters && (
          <div style={{
            background: "#F9F5FF", border: "1px solid #E9D5FF",
            borderRadius: 8, padding: "8px 12px", marginBottom: 10,
          }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#7C3AED", marginBottom: 2 }}>💜 WHY THIS MATTERS</p>
            <p style={{ fontSize: 11, color: "#5B21B6", lineHeight: 1.5 }}>{article.why_it_matters}</p>
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
                  border: `1px solid ${active ? meta.color : "#E5E7EB"}`,
                  background: active ? meta.color + "15" : "#F9FAFB",
                  color: active ? meta.color : "#6B7280",
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
        padding: "8px 16px 12px", borderTop: "1px solid #F3F4F6",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {article.source_name && (
            <span style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 600 }}>{article.source_name}</span>
          )}
          {article.publish_date && (
            <span style={{ fontSize: 10, color: "#9CA3AF" }}>
              {new Date(article.publish_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          )}
          {article.view_count > 0 && (
            <span style={{ fontSize: 10, color: "#9CA3AF", display: "flex", alignItems: "center", gap: 2 }}>
              <Eye style={{ width: 10, height: 10 }} /> {article.view_count}
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={() => onSave && onSave(article)}
            style={{
              width: 30, height: 30, borderRadius: 8, border: `1px solid ${isSaved ? "#4A90E2" : "#E5E7EB"}`,
              background: isSaved ? "#EBF3FD" : "#F9FAFB",
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            }}
          >
            <Bookmark style={{ width: 13, height: 13, color: isSaved ? "#4A90E2" : "#9CA3AF", fill: isSaved ? "#4A90E2" : "none" }} />
          </button>
          {article.source_url && (
            <a
              href={article.source_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex", alignItems: "center", gap: 4,
                padding: "6px 11px", borderRadius: 8, border: "1px solid #E5E7EB",
                background: "#F9FAFB", color: "#374151", fontSize: 11, fontWeight: 600, textDecoration: "none",
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