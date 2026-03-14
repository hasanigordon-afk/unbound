import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, MessageCircle, Share2, Flag, Send, Trash2, Loader2, MoreHorizontal } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const CATEGORY_META = {
  support:     { emoji: "🤝", label: "Support",     bg: "#F0FDF4", color: "#16A34A" },
  milestone:   { emoji: "🏆", label: "Milestone",   bg: "#FFFBEB", color: "#D97706" },
  advice:      { emoji: "💡", label: "Advice",       bg: "#EBF5FF", color: "#2563EB" },
  question:    { emoji: "❓", label: "Question",     bg: "#F5F3FF", color: "#7C3AED" },
  encouragement: { emoji: "💪", label: "Encouragement", bg: "#FFF7ED", color: "#EA580C" },
  reentry_win: { emoji: "🎯", label: "Reentry Win", bg: "#F0FDF4", color: "#059669" },
  recovery_thought: { emoji: "💭", label: "Thought", bg: "#F0F9FF", color: "#0891B2" },
};

function timeAgo(dateStr) {
  if (!dateStr) return "";
  try { return formatDistanceToNow(new Date(dateStr), { addSuffix: true }); } catch { return ""; }
}

function CommentRow({ comment, user, onDelete, onLike, onReply, isReply = false }) {
  const isOwn = user?.email === comment.created_by;
  const handle = comment.created_by?.split("@")[0] || "Anonymous";
  return (
    <div style={{ marginLeft: isReply ? 32 : 0, paddingLeft: isReply ? 12 : 0, borderLeft: isReply ? "2px solid #E5E7EB" : "none" }}>
      <div className="py-2">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-xs font-bold" style={{ color: "#1E1E1E" }}>{handle}</span>
          <span className="text-xs" style={{ color: "#C7C7CC" }}>{timeAgo(comment.created_date)}</span>
        </div>
        <p className="text-sm leading-relaxed mb-1.5" style={{ color: "#1E1E1E" }}>{comment.content}</p>
        <div className="flex items-center gap-3">
          <button onClick={() => onLike(comment)} className="flex items-center gap-1 text-xs" style={{ color: "#8E8E93", background: "none", border: "none", cursor: "pointer" }}>
            <Heart className="w-3 h-3" />{(comment.like_count || 0) > 0 && comment.like_count}
          </button>
          {!isReply && user && (
            <button onClick={() => onReply(comment)} className="text-xs" style={{ color: "#8E8E93", background: "none", border: "none", cursor: "pointer" }}>Reply</button>
          )}
          {isOwn && (
            <button onClick={() => onDelete(comment.id)} className="ml-auto text-xs flex items-center gap-0.5" style={{ color: "#EF4444", background: "none", border: "none", cursor: "pointer" }}>
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function CommentsThread({ postId, user }) {
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState(null);

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["post-comments", postId],
    queryFn: () => base44.entities.ArticleComment.filter({ content_type: "community_post", content_id: postId }),
  });

  const addMutation = useMutation({
    mutationFn: () => base44.entities.ArticleComment.create({
      content_type: "community_post", content_id: postId,
      parent_comment_id: replyTo?.id || null,
      content: text.trim(), status: "active", likes_count: 0,
    }),
    onSuccess: () => { queryClient.invalidateQueries(["post-comments", postId]); setText(""); setReplyTo(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ArticleComment.update(id, { status: "removed" }),
    onSuccess: () => queryClient.invalidateQueries(["post-comments", postId]),
  });

  const likeMutation = useMutation({
    mutationFn: (c) => base44.entities.ArticleComment.update(c.id, { likes_count: (c.likes_count || 0) + 1 }),
    onSuccess: () => queryClient.invalidateQueries(["post-comments", postId]),
  });

  const active = comments.filter(c => c.status !== "removed");
  const topLevel = active.filter(c => !c.parent_comment_id);
  const repliesOf = (id) => active.filter(c => c.parent_comment_id === id);

  return (
    <div className="mt-2 pt-3" style={{ borderTop: "1px solid #F7F7F8" }}>
      {isLoading && <div className="text-center py-2"><Loader2 className="w-4 h-4 animate-spin opacity-30 mx-auto" /></div>}

      {topLevel.map(c => (
        <div key={c.id}>
          <CommentRow comment={c} user={user} onDelete={deleteMutation.mutate} onLike={likeMutation.mutate} onReply={setReplyTo} />
          {repliesOf(c.id).map(r => (
            <CommentRow key={r.id} comment={r} user={user} isReply onDelete={deleteMutation.mutate} onLike={likeMutation.mutate} onReply={() => {}} />
          ))}
        </div>
      ))}

      {!isLoading && topLevel.length === 0 && (
        <p className="text-xs text-center py-3" style={{ color: "#C7C7CC" }}>No comments yet. Be the first to respond.</p>
      )}

      {user ? (
        <div className="flex gap-2 mt-2">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "#F7F7F8", border: "1px solid #E5E7EB" }}>
            <input value={text} onChange={e => setText(e.target.value)}
              placeholder={replyTo ? `Replying to ${replyTo.created_by?.split("@")[0]}…` : "Add a comment…"}
              className="flex-1 text-sm bg-transparent outline-none" style={{ color: "#1E1E1E" }}
              onKeyDown={e => e.key === "Enter" && text.trim() && addMutation.mutate()} />
            {replyTo && <button onClick={() => setReplyTo(null)} className="text-xs" style={{ color: "#8E8E93" }}>✕</button>}
          </div>
          <button onClick={() => text.trim() && addMutation.mutate()} disabled={!text.trim() || addMutation.isPending}
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "#4A90E2", color: "#FFF" }}>
            {addMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          </button>
        </div>
      ) : (
        <p className="text-xs text-center py-2" style={{ color: "#8E8E93" }}>
          <button onClick={() => base44.auth.redirectToLogin()} style={{ color: "#4A90E2", fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}>Sign in</button> to comment.
        </p>
      )}
    </div>
  );
}

export default function CommunityPostCard({ post, user, isLiked, likeCount, onLike, onShare, onReport }) {
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const cat = CATEGORY_META[post.category] || CATEGORY_META.support;
  const handle = post.is_anonymous ? "Anonymous" : (post.created_by?.split("@")[0] || "Community Member");

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#FFF", border: "1px solid #E5E7EB" }}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-base font-bold flex-shrink-0"
              style={{ background: cat.bg, color: cat.color }}>
              {cat.emoji}
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: "#1E1E1E" }}>{handle}</p>
              <p className="text-[10px]" style={{ color: "#C7C7CC" }}>{timeAgo(post.created_date)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 relative">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: cat.bg, color: cat.color }}>{cat.label}</span>
            <button onClick={() => setShowMenu(!showMenu)} style={{ background: "none", border: "none", cursor: "pointer" }}>
              <MoreHorizontal className="w-4 h-4" style={{ color: "#C7C7CC" }} />
            </button>
            {showMenu && (
              <div className="absolute top-6 right-0 rounded-xl shadow-lg z-10 overflow-hidden" style={{ background: "#FFF", border: "1px solid #E5E7EB", minWidth: 140 }}
                onMouseLeave={() => setShowMenu(false)}>
                <button onClick={() => { onShare?.(); setShowMenu(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 hover:bg-gray-50"
                  style={{ color: "#1E1E1E", background: "none", border: "none", cursor: "pointer" }}>
                  <Share2 className="w-3.5 h-3.5" /> Share
                </button>
                <button onClick={() => { onReport?.(); setShowMenu(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 hover:bg-gray-50"
                  style={{ color: "#EF4444", background: "none", border: "none", cursor: "pointer" }}>
                  <Flag className="w-3.5 h-3.5" /> Report
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <p className="text-sm leading-relaxed" style={{ color: "#1E1E1E", whiteSpace: "pre-wrap" }}>{post.content}</p>

        {post.image_url && (
          <img src={post.image_url} alt="" className="w-full rounded-xl mt-3 object-cover" style={{ maxHeight: 240 }} />
        )}
      </div>

      {/* Action bar */}
      <div className="px-4 pb-3 flex items-center gap-1" style={{ borderTop: "1px solid #F7F7F8", paddingTop: 10 }}>
        <button onClick={onLike}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold"
          style={{ background: isLiked ? "#FEF2F2" : "#F7F7F8", color: isLiked ? "#DC2626" : "#8E8E93", border: "none", cursor: "pointer" }}>
          <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
          {likeCount > 0 ? likeCount : "Like"}
        </button>

        <button onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold"
          style={{ background: showComments ? "#EBF5FF" : "#F7F7F8", color: showComments ? "#2563EB" : "#8E8E93", border: "none", cursor: "pointer" }}>
          <MessageCircle className="w-4 h-4" />
          {(post.comment_count || 0) > 0 ? post.comment_count : "Comment"}
        </button>

        <button onClick={onShare}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold ml-auto"
          style={{ background: "#F7F7F8", color: "#8E8E93", border: "none", cursor: "pointer" }}>
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Comments thread */}
      {showComments && (
        <div className="px-4 pb-4">
          <CommentsThread postId={post.id} user={user} />
        </div>
      )}
    </div>
  );
}