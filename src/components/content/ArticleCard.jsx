import React from "react";
import { Bookmark, BookmarkCheck, Share2, MessageCircle, Heart, ExternalLink, ChevronRight } from "lucide-react";
import { format } from "date-fns";

const CAT_STYLE = {
  "Recovery":            { bg: "#EBF5FF", color: "#1D4ED8" },
  "Relapse Prevention":  { bg: "#FEF2F2", color: "#DC2626" },
  "Reentry":             { bg: "#F0FDF4", color: "#15803D" },
  "Employment":          { bg: "#FFFBEB", color: "#D97706" },
  "Housing":             { bg: "#F5F3FF", color: "#7C3AED" },
  "Mental Health":       { bg: "#FDF4FF", color: "#9333EA" },
  "Motivation":          { bg: "#FFF7ED", color: "#EA580C" },
  "Legal & Probation":   { bg: "#F0F9FF", color: "#0369A1" },
  "Life Skills":         { bg: "#F7FEE7", color: "#4D7C0F" },
  "Community Support":   { bg: "#FFF1F2", color: "#BE123C" },
};

export default function ArticleCard({ article, isSaved, onSave, onShare, onClick }) {
  const cat = CAT_STYLE[article.category] || { bg: "#F7F7F8", color: "#5A5A5A" };
  const dateStr = article.publish_date
    ? format(new Date(article.publish_date), "MMM d, yyyy")
    : null;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#FFF", border: "1px solid #E5E7EB" }}>
      {article.image_url && (
        <button onClick={onClick} className="block w-full">
          <img src={article.image_url} alt={article.title} className="w-full h-44 object-cover" />
        </button>
      )}

      <button onClick={onClick} className="w-full text-left p-4 pb-3">
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: cat.bg, color: cat.color }}>
            {article.category}
          </span>
          {article.featured && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#FFFBEB", color: "#D97706" }}>
              ⭐ Featured
            </span>
          )}
        </div>

        <p className="font-bold text-base leading-snug mb-1.5" style={{ color: "#1E1E1E" }}>{article.title}</p>
        <p className="text-sm leading-relaxed line-clamp-2 mb-2" style={{ color: "#5A5A5A" }}>{article.summary}</p>

        <div className="flex items-center gap-1.5 text-xs" style={{ color: "#8E8E93" }}>
          {article.source_name && <span className="font-semibold" style={{ color: "#4A90E2" }}>{article.source_name}</span>}
          {article.source_name && dateStr && <span>·</span>}
          {dateStr && <span>{dateStr}</span>}
        </div>
      </button>

      <div className="px-4 pb-4 flex items-center gap-2" style={{ borderTop: "1px solid #F7F7F8" }}>
        <button onClick={onClick}
          className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl font-semibold flex-1"
          style={{ background: "#4A90E2", color: "#FFF" }}>
          Read More <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {article.comment_count > 0 && (
          <div className="flex items-center gap-1 text-xs" style={{ color: "#8E8E93" }}>
            <MessageCircle className="w-3.5 h-3.5" />
            {article.comment_count}
          </div>
        )}

        <button onClick={e => { e.stopPropagation(); onShare && onShare(article); }}
          className="p-2 rounded-xl" style={{ background: "#F7F7F8" }}>
          <Share2 className="w-4 h-4" style={{ color: "#8E8E93" }} />
        </button>

        <button onClick={e => { e.stopPropagation(); onSave && onSave(article); }}
          className="p-2 rounded-xl" style={{ background: isSaved ? "#EBF5FF" : "#F7F7F8" }}>
          {isSaved
            ? <BookmarkCheck className="w-4 h-4" style={{ color: "#2563EB" }} />
            : <Bookmark className="w-4 h-4" style={{ color: "#8E8E93" }} />}
        </button>
      </div>
    </div>
  );
}