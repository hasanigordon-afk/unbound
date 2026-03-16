import React from "react";
import { ExternalLink } from "lucide-react";

const CATEGORY_META = {
  relapse_reality:         { label: "Relapse Reality",         color: "#F59E0B", emoji: "📊" },
  rehab_fraud:             { label: "Rehab Fraud",             color: "#EF4444", emoji: "🚨" },
  success_story:           { label: "Success Story",           color: "#10B981", emoji: "🌟" },
  what_helps:              { label: "What Actually Helps",     color: "#4A90E2", emoji: "💡" },
  facility_accountability: { label: "Facility Accountability", color: "#8B5CF6", emoji: "🔍" },
  hope_inspiration:        { label: "Hope & Inspiration",      color: "#F97316", emoji: "🙏" },
};

export default function FeaturedArticleBanner({ article, onOpen }) {
  if (!article) return null;
  const meta = CATEGORY_META[article.category] || { label: article.category, color: "#4A90E2", emoji: "📰" };

  return (
    <div
      onClick={() => onOpen && onOpen(article)}
      style={{
        borderRadius: 18, overflow: "hidden", cursor: "pointer", position: "relative",
        background: "#1E1E2E", marginBottom: 4,
      }}
    >
      {article.image_url ? (
        <img src={article.image_url} alt={article.title} style={{ width: "100%", height: 220, objectFit: "cover", display: "block" }} />
      ) : (
        <div style={{ height: 180, background: `linear-gradient(135deg,#1E1E2E,${meta.color}33)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 60 }}>{meta.emoji}</span>
        </div>
      )}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)",
      }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "16px 18px" }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 7 }}>
          <span style={{
            padding: "2px 10px", borderRadius: 20, fontSize: 10, fontWeight: 800,
            background: "#fff", color: "#1E1E1E",
          }}>
            ⭐ FEATURED
          </span>
          <span style={{
            padding: "2px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700,
            background: meta.color + "cc", color: "#fff",
          }}>
            {meta.emoji} {meta.label}
          </span>
        </div>
        <h2 style={{ fontSize: 17, fontWeight: 900, color: "#fff", lineHeight: 1.3, marginBottom: 6 }}>
          {article.title}
        </h2>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", lineHeight: 1.5, marginBottom: 10 }}>
          {article.summary?.slice(0, 120)}{article.summary?.length > 120 ? "…" : ""}
        </p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>
            {article.source_name || "Editorial"}
          </span>
          {article.source_url && (
            <a
              href={article.source_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              style={{
                display: "flex", alignItems: "center", gap: 4,
                padding: "6px 12px", borderRadius: 8,
                background: "#fff", color: "#1E1E1E",
                fontSize: 11, fontWeight: 700, textDecoration: "none",
              }}
            >
              <ExternalLink style={{ width: 10, height: 10 }} /> Read Full Story
            </a>
          )}
        </div>
      </div>
    </div>
  );
}