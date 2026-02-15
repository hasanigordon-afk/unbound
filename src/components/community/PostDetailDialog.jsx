import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { X, ThumbsUp, MessageCircle, Flag, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import moment from "moment";
import { toast } from "sonner";

export default function PostDetailDialog({ post, onClose }) {
  const [comment, setComment] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [showReportPost, setShowReportPost] = useState(false);
  const [reportReason, setReportReason] = useState("spam");
  const [reportDetails, setReportDetails] = useState("");
  const queryClient = useQueryClient();

  const REPORT_REASONS = [
    { value: "spam", label: "Spam or promotional content" },
    { value: "harassment", label: "Harassment or bullying" },
    { value: "hate_speech", label: "Hate speech" },
    { value: "inappropriate", label: "Inappropriate content" },
    { value: "self_harm", label: "Self-harm concern" },
    { value: "other", label: "Other" }
  ];

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
    mutationFn: async () => {
      // AI Moderation
      const moderationResult = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a content moderator for a recovery support community. Analyze this comment for violations.

Community Guidelines:
- No hate speech, harassment, or personal attacks
- No spam or promotional content
- No graphic descriptions or triggers
- Be supportive and constructive

Comment: ${comment}

Respond with:
1. Is this content safe? (yes/no)
2. Violation type if unsafe
3. Confidence level (high/medium/low)
4. Brief reason if flagged`,
        response_json_schema: {
          type: "object",
          properties: {
            is_safe: { type: "boolean" },
            violation_type: { type: "string" },
            confidence: { type: "string" },
            reason: { type: "string" }
          }
        }
      });

      let moderationStatus = "approved";
      let moderationReason = null;

      if (!moderationResult.is_safe) {
        moderationStatus = moderationResult.confidence === "high" ? "flagged" : "pending";
        moderationReason = moderationResult.reason;
      }

      return base44.entities.PostComment.create({
        post_id: post.id,
        content: comment,
        is_anonymous: isAnonymous,
        moderation_status: moderationStatus,
        moderation_reason: moderationReason,
      });
    },
    onSuccess: (data) => {
      if (data.moderation_status === "flagged") {
        toast.error("Comment flagged for review");
      } else if (data.moderation_status === "pending") {
        toast("Comment submitted for review");
      }
      queryClient.invalidateQueries(["post-comments"]);
      setComment("");
    },
  });

  const reportMutation = useMutation({
    mutationFn: ({ contentType, contentId }) =>
      base44.entities.ContentReport.create({
        content_type: contentType,
        content_id: contentId,
        reason: reportReason,
        details: reportDetails
      }),
    onSuccess: () => {
      toast.success("Report submitted. Thank you for keeping our community safe.");
      setShowReportPost(false);
      setReportDetails("");
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowReportPost(!showReportPost)}
              className="p-2 rounded-lg hover:bg-white/5"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              <Flag className="w-4 h-4" />
            </button>
            <button onClick={onClose} style={{ color: 'rgba(255,255,255,0.5)' }}>
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Report Form */}
          {showReportPost && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-4 border-2"
              style={{ borderColor: 'rgba(255,79,79,0.3)' }}
            >
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4" style={{ color: '#FF4F4F' }} />
                <h4 className="font-medium text-sm" style={{ color: '#FFFFFF' }}>Report this post</h4>
              </div>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full p-2 rounded-lg mb-2 text-sm"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#FFFFFF' }}
              >
                {REPORT_REASONS.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
              <Textarea
                placeholder="Additional details (optional)"
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                className="mb-2 text-sm min-h-[60px]"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#FFFFFF' }}
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => reportMutation.mutate({ contentType: "post", contentId: post.id })}
                  disabled={reportMutation.isPending}
                  size="sm"
                  style={{ background: '#FF4F4F', color: '#FFFFFF' }}
                >
                  Submit Report
                </Button>
                <Button
                  onClick={() => setShowReportPost(false)}
                  variant="outline"
                  size="sm"
                  style={{ border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#FFFFFF' }}
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}

          <div className="glass-card p-4">
            {post.moderation_status === "flagged" && (
              <div className="mb-3 p-2 rounded-lg flex items-center gap-2" style={{ background: 'rgba(255,79,79,0.1)', border: '1px solid rgba(255,79,79,0.3)' }}>
                <AlertTriangle className="w-4 h-4" style={{ color: '#FF4F4F' }} />
                <span className="text-xs" style={{ color: '#FF4F4F' }}>This post has been flagged for review</span>
              </div>
            )}
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
            {comments.filter(c => c.moderation_status !== "flagged").map(c => (
              <div key={c.id} className="p-3 rounded-xl relative group" style={{ background: 'rgba(255,255,255,0.05)' }}>
                {c.moderation_status === "pending" && (
                  <div className="mb-2 text-xs flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    <AlertTriangle className="w-3 h-3" />
                    Pending review
                  </div>
                )}
                <p className="text-sm mb-2" style={{ color: 'rgba(255,255,255,0.9)' }}>
                  {c.content}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    {moment(c.created_date).fromNow()}
                  </span>
                  <button
                    onClick={() => reportMutation.mutate({ contentType: "comment", contentId: c.id })}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1"
                    style={{ color: 'rgba(255,255,255,0.5)' }}
                  >
                    <Flag className="w-3 h-3" />
                  </button>
                </div>
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