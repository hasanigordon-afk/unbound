import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { X, ThumbsUp, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import moment from "moment";

export default function PostDetailDialog({ post, onClose }) {
  const [comment, setComment] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const queryClient = useQueryClient();

  const { data: comments = [] } = useQuery({
    queryKey: ["post-comments", post.id],
    queryFn: () => base44.entities.PostComment.filter({ post_id: post.id }, '-created_date'),
  });

  const likeMutation = useMutation({
    mutationFn: () =>
      base44.entities.CommunityPost.update(post.id, {
        like_count: (post.like_count || 0) + 1
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["community-posts"]);
    },
  });

  const commentMutation = useMutation({
    mutationFn: () =>
      base44.entities.PostComment.create({
        post_id: post.id,
        content: comment,
        is_anonymous: isAnonymous,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["post-comments"]);
      setComment("");
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[85vh] overflow-auto"
        style={{ background: '#1A1F3A' }}
      >
        <div className="sticky top-0 p-5 flex items-center justify-between" style={{ background: '#1A1F3A', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <h2 className="text-lg font-bold" style={{ color: '#FFFFFF' }}>Discussion</h2>
          <button onClick={onClose} style={{ color: 'rgba(255,255,255,0.5)' }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="glass-card p-4">
            {post.title && (
              <h3 className="font-semibold mb-2" style={{ color: '#FFFFFF' }}>{post.title}</h3>
            )}
            <p className="text-sm mb-3" style={{ color: 'rgba(255,255,255,0.75)' }}>
              {post.content}
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => likeMutation.mutate()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                style={{ background: 'rgba(47,243,224,0.15)', color: '#2FF3E0' }}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                {post.like_count || 0}
              </button>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {moment(post.created_date).fromNow()}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>
              Comments ({comments.length})
            </h4>
            {comments.map(c => (
              <div key={c.id} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <p className="text-sm mb-2" style={{ color: 'rgba(255,255,255,0.9)' }}>
                  {c.content}
                </p>
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {moment(c.created_date).fromNow()}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-3 sticky bottom-0 pt-4" style={{ background: '#1A1F3A' }}>
            <Textarea
              placeholder="Add a supportive comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="resize-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#FFFFFF' }}
            />
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs flex-1" style={{ color: 'rgba(255,255,255,0.75)' }}>
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded"
                />
                Anonymous
              </label>
              <Button
                onClick={() => commentMutation.mutate()}
                disabled={!comment.trim() || commentMutation.isPending}
                size="sm"
                style={{ background: '#2FF3E0', color: '#0B0F1F' }}
              >
                Comment
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}