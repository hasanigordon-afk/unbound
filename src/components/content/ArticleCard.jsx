import React from "react";
import { Bookmark, BookmarkCheck, Share2, Heart, Clock } from "lucide-react";

export const CAT_COLORS = {
  "Recovery":           { bg: "#EBF5FF", color: "#2563EB" },
  "Relapse Prevention": { bg: "#FEF2F2", color: "#DC2626" },
  "Reentry":            { bg: "#F5F3FF", color: "#7C3AED" },
  "Employment":         { bg: "#FFF7ED", color: "#D97706" },
  "Housing":            { bg: "#F0FDF4", color: "#16A34A" },
  "Mental Health":      { bg: "#F0F9FF", color: "#0891B2" },
  "Motivation":         { bg: "#FFFBEB", color: "#D97706" },
  "Legal":              { bg: "#F8FAFC", color: "#475569" },
  "Life Skills":        { bg: "#FDF4FF", color: "#9333EA" },
  "Community":          { bg: "#F0FDF4", color: "#059669" },
};

export default function ArticleCard({ article, isSaved, isLiked, onSave, onLike, onShare, onClick }) {
  const cat = CAT_COLORS[article.category] || { bg: "#F7F7F8", color: "#5A5A5A" };
  const dateStr = article.publish_date
    ? new Date(article.publish_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#FFF", border: "1px solid #E5E7EB" }}>
      {article.image_url && (
        <div className="w-full h-44 overflow-hidden">
          <img src={article.image_url} alt={article.title} className="w-full h-full object-cover" />
        </div>
      )}
      <button className="w-full text-left p-4" onClick={onClick}>
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full" style={{ background: cat.bg, color: cat.color }}>{article.category}</span>
          {article.featured && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#FFF7ED", color: "#D97706" }}>⭐ Featured</span>}
          {article.pinned && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#F0FDF4", color: "#16A34A" }}>📌 Pinned</span>}
        </div>
        <h3 className="font-bold text-base leading-snug mb-2" style={{ color: "#1E1E1E" }}>{article.title}</h3>
        <p className="text-sm leading-relaxed mb-3" style={{ color: "#5A5A5A" }}>{article.summary}</p>
        <div className="flex items-center gap-3 text-xs" style={{ color: "#8E8E93" }}>
          {article.source_name && <span>📰 {article.source_name}</span>}
          {dateStr && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{dateStr}</span>}
          {article.like_count > 0 && <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{article.like_count}</span>}
        </div>
      </button>

      <div className="px-4 pb-4 flex items-center gap-2 flex-wrap" style={{ borderTop: "1px solid #F7F7F8" }}>
        <button onClick={onLike} className="flex items-center gap-1 text-xs px-3 py-2 rounded-xl"
          style={{ background: isLiked ? "#FEF2F2" : "#F7F7F8", color: isLiked ? "#EF4444" : "#8E8E93" }}>
          <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-current" : ""}`} />
          {isLiked ? "Liked" : "Like"}
        </button>
        <button onClick={onSave} className="flex items-center gap-1 text-xs px-3 py-2 rounded-xl"
          style={{ background: isSaved ? "#EBF5FF" : "#F7F7F8", color: isSaved ? "#2563EB" : "#8E8E93" }}>
          {isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
          {isSaved ? "Saved" : "Save"}
        </button>
        <button onClick={onShare} className="flex items-center gap-1 text-xs px-3 py-2 rounded-xl"
          style={{ background: "#F7F7F8", color: "#8E8E93" }}>
          <Share2 className="w-3.5 h-3.5" /> Share
        </button>
        <button onClick={onClick} className="ml-auto text-xs px-4 py-2 rounded-xl font-bold"
          style={{ background: "#4A90E2", color: "#FFF" }}>
          Read →
        </button>
      </div>
    </div>
  );
}