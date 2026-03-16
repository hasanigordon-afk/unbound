import React from "react";
import { X, ExternalLink, Bookmark } from "lucide-react";

const CATEGORY_META = {
  relapse_reality:         { label: "Relapse Reality",         color: "#F59E0B", emoji: "📊" },
  rehab_fraud:             { label: "Rehab Fraud",             color: "#EF4444", emoji: "🚨" },
  success_story:           { label: "Success Story",           color: "#10B981", emoji: "🌟" },
  what_helps:              { label: "What Actually Helps",     color: "#4A90E2", emoji: "💡" },
  facility_accountability: { label: "Facility Accountability", color: "#8B5CF6", emoji: "🔍" },
  hope_inspiration:        { label: "Hope & Inspiration",      color: "#F97316", emoji: "🙏" },
};

export default function ArticleDetailModal({ article, isSaved, onSave, onClose }) {
  if (!article) return null;
  const meta = CATEGORY_META[article.category] || { label: article.category, color: "#4A90E2", emoji: "📰" };

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "flex-end" }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 560, margin: "0 auto",
          background: "#fff", borderRadius: "24px 24px 0 0",
          maxHeight: "90vh", overflowY: "auto",
        }}
      >
        {article.image_url && (
          <div style={{ height: 200, overflow: "hidden", position: "relative" }}>
            <img src={article.image_url} alt={article.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,0.4),transparent)" }} />
          </div>
        )}

        <div style={{ padding: "20px 20px 40px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <span style={{
              padding: "3px 11px", borderRadius: 20, fontSize: 11, fontWeight: 700,
              background: meta.color + "18", color: meta.color,
            }}>
              {meta.emoji} {meta.label}
            </span>
            <button onClick={onClose} style={{ background: "#F0F0F3", border: "none", borderRadius: "50%", width: 30, height: 30, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <X style={{ width: 14, height: 14, color: "#6B7280" }} />
            </button>
          </div>

          <h2 style={{ fontSize: 20, fontWeight: 900, color: "#1E1E1E", lineHeight: 1.3, marginBottom: 8 }}>
            {article.title}
          </h2>

          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
            {article.source_name && <span style={{ fontSize: 11, color: "#8E8E93", fontWeight: 600 }}>{article.source_name}</span>}
            {article.publish_date && (
              <span style={{ fontSize: 11, color: "#8E8E93" }}>
                {new Date(article.publish_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </span>
            )}
          </div>

          <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, marginBottom: 16 }}>{article.summary}</p>

          {article.why_it_matters && (
            <div style={{ background: "#F9F5FF", border: "1px solid #E9D5FF", borderRadius: 10, padding: "12px 14px", marginBottom: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 800, color: "#7C3AED", marginBottom: 4 }}>💜 WHY THIS MATTERS</p>
              <p style={{ fontSize: 13, color: "#5B21B6", lineHeight: 1.6 }}>{article.why_it_matters}</p>
            </div>
          )}

          {article.full_content && (
            <p style={{ fontSize: 13, color: "#5A5A5A", lineHeight: 1.8, marginBottom: 20 }}>{article.full_content}</p>
          )}

          {article.tags?.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 20 }}>
              {article.tags.map(tag => (
                <span key={tag} style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, background: "#F3F4F6", color: "#6B7280" }}>
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => onSave && onSave(article)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "11px 16px", borderRadius: 10, cursor: "pointer",
                border: `1px solid ${isSaved ? "#4A90E2" : "#E5E7EB"}`,
                background: isSaved ? "#EBF3FD" : "#F9FAFB",
                color: isSaved ? "#4A90E2" : "#374151",
                fontSize: 13, fontWeight: 600,
              }}
            >
              <Bookmark style={{ width: 14, height: 14, fill: isSaved ? "#4A90E2" : "none" }} />
              {isSaved ? "Saved" : "Save"}
            </button>
            {article.source_url && (
              <a
                href={article.source_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  padding: "11px", borderRadius: 10, textDecoration: "none",
                  background: "#1E1E2E", color: "#fff", fontSize: 13, fontWeight: 700,
                }}
              >
                <ExternalLink style={{ width: 14, height: 14 }} /> Read Full Article
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}