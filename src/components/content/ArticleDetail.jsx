import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Bookmark, BookmarkCheck, Heart, Share2, ExternalLink, Calendar } from "lucide-react";
const CAT_COLORS = {
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
import ArticleComments from "./ArticleComments";
import ShareMenu from "./ShareMenu";

export default function ArticleDetail({ article, user, isSaved, isLiked, onSave, onLike, onBack }) {
  const [showShare, setShowShare] = useState(false);
  const cat = CAT_COLORS[article.category] || { bg: "#F7F7F8", color: "#5A5A5A" };
  const dateStr = article.publish_date
    ? new Date(article.publish_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : null;

  return (
    <div className="min-h-screen pb-28" style={{ background: "#F7F7F8" }}>
      {showShare && (
        <ShareMenu title={article.title} url={article.source_url || window.location.href} onClose={() => setShowShare(false)} />
      )}

      {/* Header */}
      <div className="px-5 pt-6 pb-4 sticky top-0 z-10" style={{ background: "#FFF", borderBottom: "1px solid #D1D1D6" }}>
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm" style={{ color: "#4A90E2", background: "none", border: "none" }}>
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-2">
            <button onClick={onLike} style={{ background: "none", border: "none" }}>
              <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} style={{ color: isLiked ? "#EF4444" : "#C7C7CC" }} />
            </button>
            <button onClick={onSave} style={{ background: "none", border: "none" }}>
              {isSaved ? <BookmarkCheck className="w-5 h-5" style={{ color: "#2563EB" }} /> : <Bookmark className="w-5 h-5" style={{ color: "#C7C7CC" }} />}
            </button>
            <button onClick={() => setShowShare(true)} style={{ background: "none", border: "none" }}>
              <Share2 className="w-5 h-5" style={{ color: "#C7C7CC" }} />
            </button>
          </div>
        </div>
      </div>

      {article.image_url && (
        <div className="w-full h-52 overflow-hidden">
          <img src={article.image_url} alt={article.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="px-5 py-5">
        {/* Meta */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: cat.bg, color: cat.color }}>{article.category}</span>
          {article.featured && <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: "#FFF7ED", color: "#D97706" }}>⭐ Featured</span>}
        </div>

        <h1 className="text-xl font-bold mb-3" style={{ color: "#1E1E1E", lineHeight: 1.3 }}>{article.title}</h1>

        <div className="flex items-center gap-3 mb-4 text-xs" style={{ color: "#8E8E93" }}>
          {article.source_name && <span>📰 {article.source_name}</span>}
          {dateStr && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{dateStr}</span>}
        </div>

        {/* Summary */}
        <div className="p-4 rounded-2xl mb-5" style={{ background: "#EBF5FF", border: "1px solid #BFDBFE" }}>
          <p className="text-sm font-semibold mb-1" style={{ color: "#1D4ED8" }}>Summary</p>
          <p className="text-sm leading-relaxed" style={{ color: "#1E3A8A" }}>{article.summary}</p>
        </div>

        {/* Full content */}
        {article.full_content && (
          <div className="rounded-2xl p-5 mb-5" style={{ background: "#FFF", border: "1px solid #E5E7EB" }}>
            <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "#1E1E1E" }}>
              {article.full_content}
            </p>
          </div>
        )}

        {/* Source link */}
        {article.source_url && (
          <a href={article.source_url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold mb-5"
            style={{ background: "#F7F7F8", color: "#4A90E2", border: "1px solid #E5E7EB", textDecoration: "none" }}>
            <ExternalLink className="w-4 h-4" />
            Read original article — {article.source_name || "Source"}
          </a>
        )}

        {/* Tags */}
        {article.tags?.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-5">
            {article.tags.map(t => (
              <span key={t} className="text-xs px-2.5 py-1 rounded-full" style={{ background: "#F7F7F8", color: "#5A5A5A" }}>{t}</span>
            ))}
          </div>
        )}

        {/* Reactions */}
        <div className="flex items-center gap-3 pb-5 mb-5" style={{ borderBottom: "1px solid #E5E7EB" }}>
          <button onClick={onLike}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold"
            style={{ background: isLiked ? "#FEF2F2" : "#F7F7F8", color: isLiked ? "#EF4444" : "#8E8E93" }}>
            <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
            {isLiked ? "Liked" : "Helpful"} {article.like_count > 0 ? `(${article.like_count})` : ""}
          </button>
          <button onClick={() => setShowShare(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold"
            style={{ background: "#F7F7F8", color: "#8E8E93" }}>
            <Share2 className="w-4 h-4" /> Share
          </button>
        </div>

        {/* Comments */}
        {article.comments_enabled !== false && (
          <div>
            <p className="font-bold text-base mb-3" style={{ color: "#1E1E1E" }}>
              Community Responses {article.comment_count > 0 ? `(${article.comment_count})` : ""}
            </p>
            <ArticleComments articleId={article.id} user={user} />
          </div>
        )}
      </div>
    </div>
  );
}