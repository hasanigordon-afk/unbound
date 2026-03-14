import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, Trash2, Heart, Loader2 } from "lucide-react";

function timeAgo(dateStr) {
  const diff = Math.floor((new Date() - new Date(dateStr)) / 60000);
  if (diff < 1) return "Just now";
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

function CommentBubble({ comment, user, isLiked, onLike, onDelete, onReply, isReply }) {
  const isOwn = user?.email === comment.created_by;
  return (
    <div className="p-3 rounded-2xl" style={{ background: isReply ? "#F0F0F3" : "#F7F7F8" }}>
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-semibold" style={{ color: "#1E1E1E" }}>
          {comment.created_by?.split("@")[0] || "Anonymous"}
        </p>
        <p className="text-xs" style={{ color: "#C7C7CC" }}>{timeAgo(comment.created_date)}</p>
      </div>
      <p className="text-sm" style={{ color: "#1E1E1E" }}>{comment.content}</p>
      <div className="flex items-center gap-3 mt-2">
        <button onClick={onLike} className="flex items-center gap-1 text-xs"
          style={{ background: "none", border: "none", color: isLiked ? "#EF4444" : "#8E8E93", cursor: "pointer" }}>
          <Heart className={`w-3 h-3 ${isLiked ? "fill-current" : ""}`} />
          {comment.like_count > 0 ? comment.like_count : "Like"}
        </button>
        {!isReply && user && (
          <button onClick={onReply} className="text-xs" style={{ background: "none", border: "none", color: "#8E8E93", cursor: "pointer" }}>
            Reply
          </button>
        )}
        {isOwn && (
          <button onClick={onDelete} className="ml-auto flex items-center gap-1 text-xs"
            style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer" }}>
            <Trash2 className="w-3 h-3" /> Delete
          </button>
        )}
      </div>
    </div>
  );
}

export default function ArticleComments({ articleId, user }) {
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState(null);

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["article-comments", articleId],
    queryFn: () => base44.entities.ArticleComment.filter({ article_id: articleId }),
  });
  const { data: likedComments = [] } = useQuery({
    queryKey: ["comment-likes", user?.email, articleId],
    queryFn: () => base44.entities.ArticleLike.filter({ created_by: user.email, target_type: "comment_like" }),
    enabled: !!user,
  });

  const likedIds = new Set(likedComments.map(l => l.target_id));
  const activeComments = comments.filter(c => c.status === "active" || !c.status);
  const topLevel = activeComments.filter(c => !c.parent_comment_id);
  const repliesOf = (id) => activeComments.filter(c => c.parent_comment_id === id);

  const addMutation = useMutation({
    mutationFn: () => base44.entities.ArticleComment.create({
      article_id: articleId,
      content: newComment,
      parent_comment_id: replyTo || null,
      status: "active",
      like_count: 0,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(["article-comments", articleId]);
      setNewComment(""); setReplyTo(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ArticleComment.update(id, { status: "removed" }),
    onSuccess: () => queryClient.invalidateQueries(["article-comments", articleId]),
  });

  const likeMutation = useMutation({
    mutationFn: async (comment) => {
      const existing = likedComments.find(l => l.target_id === comment.id);
      if (existing) {
        await base44.entities.ArticleLike.delete(existing.id);
        await base44.entities.ArticleComment.update(comment.id, { like_count: Math.max(0, (comment.like_count || 0) - 1) });
      } else {
        await base44.entities.ArticleLike.create({ target_id: comment.id, target_type: "comment_like" });
        await base44.entities.ArticleComment.update(comment.id, { like_count: (comment.like_count || 0) + 1 });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["article-comments", articleId]);
      queryClient.invalidateQueries(["comment-likes"]);
    },
  });

  return (
    <div className="space-y-3 mt-4">
      {user ? (
        <div className="flex gap-2 items-center">
          <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-2xl"
            style={{ background: "#F7F7F8", border: "1px solid #E5E7EB" }}>
            <input
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder={replyTo ? "Write a reply…" : "Add a comment…"}
              className="flex-1 text-sm bg-transparent outline-none"
              style={{ color: "#1E1E1E" }}
              onKeyDown={e => e.key === "Enter" && newComment.trim() && addMutation.mutate()}
            />
            {replyTo && (
              <button onClick={() => setReplyTo(null)} className="text-xs" style={{ color: "#8E8E93" }}>✕ Cancel</button>
            )}
          </div>
          <button onClick={() => newComment.trim() && addMutation.mutate()}
            disabled={!newComment.trim() || addMutation.isPending}
            className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: "#4A90E2", color: "#FFF" }}>
            {addMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      ) : (
        <p className="text-xs text-center py-3" style={{ color: "#8E8E93" }}>
          <button onClick={() => base44.auth.redirectToLogin()} style={{ color: "#4A90E2", fontWeight: 700, background: "none", border: "none" }}>Sign in</button> to comment.
        </p>
      )}

      {isLoading && <div className="text-center py-4"><Loader2 className="w-5 h-5 animate-spin opacity-30 mx-auto" /></div>}

      {topLevel.map(c => (
        <div key={c.id}>
          <CommentBubble comment={c} user={user} isLiked={likedIds.has(c.id)}
            onLike={() => likeMutation.mutate(c)}
            onDelete={() => deleteMutation.mutate(c.id)}
            onReply={() => setReplyTo(c.id)}
          />
          {repliesOf(c.id).map(r => (
            <div key={r.id} className="ml-8 mt-2">
              <CommentBubble comment={r} user={user} isLiked={likedIds.has(r.id)}
                isReply
                onLike={() => likeMutation.mutate(r)}
                onDelete={() => deleteMutation.mutate(r.id)}
              />
            </div>
          ))}
        </div>
      ))}

      {!isLoading && topLevel.length === 0 && (
        <p className="text-sm text-center py-6" style={{ color: "#8E8E93" }}>Be the first to comment.</p>
      )}
    </div>
  );
}