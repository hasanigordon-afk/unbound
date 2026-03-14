import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Bookmark, BookmarkCheck, Share2, ExternalLink, Heart, Calendar, Tag } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { format } from "date-fns";
import CommentSection from "./CommentSection";
import ShareSheet from "./ShareSheet";

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

export default function ArticleDetail({ article, user, isSaved, onSave, onBack }) {
  const queryClient = useQueryClient();
  const [sharingOpen, setSharingOpen] = React.useState(false);
  const cat = CAT_STYLE[article.category] || { bg: "#F7F7F8", color: "#5A5A5A" };

  // Bump view count once
  useEffect(() => {
    if (article.id) {
      base44.entities.Article.update(article.id, { view_count: (article.view_count || 0) + 1 }).catch(() => {});
    }
  }, [article.id]);

  const { data: likes = [] } = useQuery({
    queryKey: ["likes", "article", article.id],
    queryFn: () => base44.entities.PostLike.filter({ content_type: "article", content_id: article.id }),
    enabled: !!user,
  });

  const hasLiked = likes.some(l => l.created_by === user?.email);

  const likeMutation = useMutation({
    mutationFn: async () => {
      const existing = likes.find(l => l.created_by === user?.email);
      if (existing) {
        await base44.entities.PostLike.delete(existing.id);
        await base44.entities.Article.update(article.id, { like_count: Math.max(0, (article.like_count || 0) - 1) });
      } else {
        await base44.entities.PostLike.create({ content_type: "article", content_id: article.id });
        await base44.entities.Article.update(article.id, { like_count: (article.like_count || 0) + 1 });
      }
    },
    onSuccess: () => queryClient.invalidateQueries(["likes", "article", article.id]),
  });

  const reportMutation = useMutation({
    mutationFn: () => base44.entities.ContentReport.create({ content_type: "article", content_id: article.id, reason: "harmful_content" }),
    onSuccess: () => alert("Thank you — our team will review this content."),
  });

  return (
    <div className="min-h-screen pb-28" style={{ background: "#F7F7F8" }}>
      {/* Header bar */}
      <div className="px-5 pt-6 pb-4" style={{ background: "#FFF", borderBottom: "1px solid #D1D1D6" }}>
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm mb-4" style={{ color: "#4A90E2", background: "none", border: "none" }}>
          <ArrowLeft className="w-4 h-4" /> Back to Hub
        </button>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: cat.bg, color: cat.color }}>
          {article.category}
        </span>
        <h1 className="text-xl font-bold mt-2 leading-snug" style={{ color: "#1E1E1E" }}>{article.title}</h1>

        <div className="flex items-center gap-3 mt-3 flex-wrap">
          {article.source_name && (
            <span className="text-xs font-semibold" style={{ color: "#4A90E2" }}>{article.source_name}</span>
          )}
          {article.publish_date && (
            <span className="text-xs flex items-center gap-1" style={{ color: "#8E8E93" }}>
              <Calendar className="w-3 h-3" />
              {format(new Date(article.publish_date), "MMMM d, yyyy")}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 mt-4">
          {user && (
            <button onClick={() => likeMutation.mutate()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold"
              style={{ background: hasLiked ? "#FEE2E2" : "#F7F7F8", color: hasLiked ? "#DC2626" : "#8E8E93" }}>
              <Heart className={`w-4 h-4 ${hasLiked ? "fill-current" : ""}`} />
              {(article.like_count || 0) > 0 && article.like_count}
            </button>
          )}
          <button onClick={() => onSave && onSave()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold"
            style={{ background: isSaved ? "#EBF5FF" : "#F7F7F8", color: isSaved ? "#2563EB" : "#8E8E93" }}>
            {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            {isSaved ? "Saved" : "Save"}
          </button>
          <button onClick={() => setSharingOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold"
            style={{ background: "#F7F7F8", color: "#8E8E93" }}>
            <Share2 className="w-4 h-4" /> Share
          </button>
        </div>
      </div>

      {/* Hero image */}
      {article.image_url && (
        <img src={article.image_url} alt={article.title} className="w-full h-52 object-cover" />
      )}

      <div className="px-5 py-5 space-y-5">
        {/* Summary callout */}
        <div className="p-4 rounded-2xl" style={{ background: "#EBF5FF", border: "1px solid #BFDBFE" }}>
          <p className="text-sm leading-relaxed" style={{ color: "#1E3A5F" }}>{article.summary}</p>
        </div>

        {/* Full content */}
        {article.full_content && (
          <div className="rounded-2xl p-5" style={{ background: "#FFF", border: "1px solid #E5E7EB" }}>
            <div className="prose prose-sm max-w-none" style={{ color: "#1E1E1E", lineHeight: 1.7 }}>
              <ReactMarkdown>{article.full_content}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Source link */}
        {article.source_url && (
          <a href={article.source_url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 p-4 rounded-2xl text-sm font-semibold"
            style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", color: "#15803D" }}>
            <ExternalLink className="w-4 h-4" />
            Read original source: {article.source_name || "View Source"}
          </a>
        )}

        {/* Tags */}
        {article.tags?.length > 0 && (
          <div className="flex gap-2 flex-wrap items-center">
            <Tag className="w-3.5 h-3.5" style={{ color: "#C7C7CC" }} />
            {article.tags.map(t => (
              <span key={t} className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: "#F0F0F3", color: "#5A5A5A" }}>
                {t}
              </span>
            ))}
          </div>
        )}

        {/* Was this helpful */}
        <div className="p-4 rounded-2xl text-center" style={{ background: "#FFF", border: "1px solid #E5E7EB" }}>
          <p className="text-sm font-semibold mb-3" style={{ color: "#1E1E1E" }}>Was this article helpful?</p>
          <div className="flex justify-center gap-3">
            <button onClick={() => likeMutation.mutate()}
              className="px-5 py-2.5 rounded-xl text-sm font-bold"
              style={{ background: "#22C55E", color: "#FFF" }}>👍 Yes, it helped</button>
            <button className="px-5 py-2.5 rounded-xl text-sm font-bold" style={{ background: "#F7F7F8", color: "#5A5A5A" }}>
              Not really
            </button>
          </div>
        </div>

        {/* Comments */}
        {article.comments_enabled !== false && (
          <CommentSection contentType="article" contentId={article.id} user={user} />
        )}

        {/* Report */}
        <div className="text-center">
          <button onClick={() => reportMutation.mutate()} className="text-xs" style={{ color: "#C7C7CC", background: "none", border: "none" }}>
            Report this content
          </button>
        </div>
      </div>

      {sharingOpen && <ShareSheet title={article.title} summary={article.summary} onClose={() => setSharingOpen(false)} />}
    </div>
  );
}