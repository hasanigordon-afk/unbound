import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, Reply, Trash2, Flag, Loader2, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

function CommentBubble({ comment, user, onReply, onDelete, onLike, onReport, depth = 0 }) {
  const isOwn = user?.email === comment.created_by;
  const handle = comment.author_handle || comment.created_by?.split("@")[0] || "Anonymous";
  const timeAgo = comment.created_date
    ? formatDistanceToNow(new Date(comment.created_date), { addSuffix: true })
    : "";

  if (comment.status === "removed" || comment.status === "hidden") return null;

  return (
    <div style={{ marginLeft: depth > 0 ? 28 : 0, paddingLeft: depth > 0 ? 12 : 0, borderLeft: depth > 0 ? "2px solid #E5E7EB" : "none" }}>
      <div className="py-3" style={{ borderBottom: "1px solid #F7F7F8" }}>
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-bold" style={{ color: "#1E1E1E" }}>{handle}</p>
          <p className="text-xs" style={{ color: "#C7C7CC" }}>{timeAgo}</p>
        </div>
        <p className="text-sm leading-relaxed mb-2" style={{ color: "#1E1E1E" }}>{comment.content}</p>
        <div className="flex items-center gap-3">
          <button onClick={() => onLike(comment)} className="flex items-center gap-1 text-xs" style={{ color: "#8E8E93" }}>
            <Heart className="w-3.5 h-3.5" />
            {comment.likes_count > 0 && comment.likes_count}
          </button>
          {depth === 0 && (
            <button onClick={() => onReply(comment)} className="flex items-center gap-1 text-xs" style={{ color: "#8E8E93" }}>
              <Reply className="w-3.5 h-3.5" /> Reply
            </button>
          )}
          {isOwn && (
            <button onClick={() => onDelete(comment)} className="flex items-center gap-1 text-xs" style={{ color: "#EF4444" }}>
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          {!isOwn && (
            <button onClick={() => onReport(comment)} className="flex items-center gap-1 text-xs" style={{ color: "#C7C7CC" }}>
              <Flag className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CommentSection({ contentType, contentId, user }) {
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["comments", contentType, contentId],
    queryFn: () => base44.entities.ArticleComment.filter({ content_type: contentType, content_id: contentId }),
  });

  const postMutation = useMutation({
    mutationFn: () => base44.entities.ArticleComment.create({
      content_type: contentType,
      content_id: contentId,
      parent_comment_id: replyingTo?.id || null,
      author_handle: user?.full_name || user?.email?.split("@")[0] || "Anonymous",
      content: newComment.trim(),
      likes_count: 0,
      status: "active",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(["comments", contentType, contentId]);
      setNewComment("");
      setReplyingTo(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (comment) => base44.entities.ArticleComment.delete(comment.id),
    onSuccess: () => queryClient.invalidateQueries(["comments", contentType, contentId]),
  });

  const likeMutation = useMutation({
    mutationFn: (comment) => base44.entities.ArticleComment.update(comment.id, { likes_count: (comment.likes_count || 0) + 1 }),
    onSuccess: () => queryClient.invalidateQueries(["comments", contentType, contentId]),
  });

  const reportMutation = useMutation({
    mutationFn: (comment) => base44.entities.ContentReport.create({ content_type: "comment", content_id: comment.id, reason: "harmful_content" }),
    onSuccess: () => alert("Thank you for reporting. Our team will review this comment."),
  });

  const topLevel = comments.filter(c => !c.parent_comment_id && c.status !== "removed");
  const getReplies = (parentId) => comments.filter(c => c.parent_comment_id === parentId && c.status !== "removed");

  return (
    <div className="rounded-2xl p-4" style={{ background: "#FFF", border: "1px solid #E5E7EB" }}>
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="w-4 h-4" style={{ color: "#8E8E93" }} />
        <p className="text-sm font-bold" style={{ color: "#1E1E1E" }}>
          {topLevel.length} Comment{topLevel.length !== 1 ? "s" : ""}
        </p>
      </div>

      {isLoading && <div className="text-center py-6"><Loader2 className="w-5 h-5 mx-auto animate-spin opacity-30" /></div>}

      {topLevel.map(comment => (
        <div key={comment.id}>
          <CommentBubble
            comment={comment}
            user={user}
            onReply={setReplyingTo}
            onDelete={deleteMutation.mutate}
            onLike={likeMutation.mutate}
            onReport={reportMutation.mutate}
          />
          {getReplies(comment.id).map(reply => (
            <CommentBubble
              key={reply.id}
              comment={reply}
              user={user}
              depth={1}
              onReply={() => {}}
              onDelete={deleteMutation.mutate}
              onLike={likeMutation.mutate}
              onReport={reportMutation.mutate}
            />
          ))}
        </div>
      ))}

      {topLevel.length === 0 && !isLoading && (
        <p className="text-sm text-center py-4" style={{ color: "#C7C7CC" }}>Be the first to share your thoughts.</p>
      )}

      {/* Comment input */}
      {user ? (
        <div className="mt-4 pt-4" style={{ borderTop: "1px solid #F7F7F8" }}>
          {replyingTo && (
            <div className="flex items-center justify-between mb-2 px-3 py-2 rounded-lg" style={{ background: "#F7F7F8" }}>
              <p className="text-xs" style={{ color: "#5A5A5A" }}>Replying to {replyingTo.author_handle || "comment"}…</p>
              <button onClick={() => setReplyingTo(null)} className="text-xs" style={{ color: "#8E8E93" }}>✕</button>
            </div>
          )}
          <div className="flex gap-2">
            <textarea
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Add a supportive comment…"
              rows={2}
              className="flex-1 text-sm p-3 rounded-xl resize-none outline-none"
              style={{ background: "#F7F7F8", border: "1px solid #D1D1D6", color: "#1E1E1E" }}
            />
            <button
              onClick={() => postMutation.mutate()}
              disabled={!newComment.trim() || postMutation.isPending}
              className="px-4 py-2 rounded-xl text-sm font-bold self-end"
              style={{ background: newComment.trim() ? "#4A90E2" : "#E5E7EB", color: "#FFF" }}>
              {postMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post"}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 pt-4 text-center" style={{ borderTop: "1px solid #F7F7F8" }}>
          <button onClick={() => base44.auth.redirectToLogin()} className="text-sm font-semibold" style={{ color: "#4A90E2", background: "none", border: "none" }}>
            Sign in to comment
          </button>
        </div>
      )}
    </div>
  );
}