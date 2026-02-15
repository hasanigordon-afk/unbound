import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { toast } from "sonner";

const CATEGORIES = [
  { value: "support", label: "Support", color: '#7B5CFF' },
  { value: "question", label: "Question", color: '#2FF3E0' },
  { value: "milestone", label: "Milestone", color: '#F4D35E' },
  { value: "advice", label: "Advice", color: '#FF4FD8' }
];

export default function CreatePostDialog({ onClose }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("support");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const queryClient = useQueryClient();

  const createPost = useMutation({
    mutationFn: async () => {
      // AI Moderation
      const moderationResult = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a content moderator for a recovery support community. Analyze this post for violations of community guidelines.

Community Guidelines:
- No hate speech, harassment, or personal attacks
- No spam or promotional content
- No graphic descriptions of substance use or self-harm
- No sharing of contact information or solicitation
- Content should be supportive and recovery-focused

Post Title: ${title}
Post Content: ${content}
Category: ${category}

Respond with:
1. Is this content safe? (yes/no)
2. Violation type if unsafe (hate_speech, harassment, spam, graphic_content, solicitation, or none)
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
        if (moderationResult.confidence === "high") {
          moderationStatus = "flagged";
          moderationReason = moderationResult.reason;
        } else {
          moderationStatus = "pending";
          moderationReason = moderationResult.reason;
        }
      }

      return base44.entities.CommunityPost.create({
        title,
        content,
        category,
        is_anonymous: isAnonymous,
        moderation_status: moderationStatus,
        moderation_reason: moderationReason,
      });
    },
    onSuccess: (data) => {
      if (data.moderation_status === "flagged") {
        toast.error("Post flagged for review: " + data.moderation_reason);
      } else if (data.moderation_status === "pending") {
        toast("Post submitted for review");
      } else {
        toast.success("Post shared with the community!");
      }
      queryClient.invalidateQueries(["community-posts"]);
      onClose();
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
        className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-6"
        style={{ background: '#1A1F3A' }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold" style={{ color: '#FFFFFF' }}>Share Your Story</h2>
          <button onClick={onClose} style={{ color: 'rgba(255,255,255,0.5)' }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm mb-2 block" style={{ color: 'rgba(255,255,255,0.75)' }}>
              Category
            </label>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{
                    background: category === cat.value ? `${cat.color}30` : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${category === cat.value ? cat.color : 'rgba(255,255,255,0.08)'}`,
                    color: category === cat.value ? cat.color : 'rgba(255,255,255,0.75)'
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <Input
            placeholder="Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#FFFFFF' }}
          />

          <Textarea
            placeholder="Share your thoughts..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[150px] resize-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#FFFFFF' }}
          />

          <label className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="rounded"
            />
            Post anonymously
          </label>

          <Button
            onClick={() => createPost.mutate()}
            disabled={!content.trim() || createPost.isPending}
            className="w-full font-medium"
            style={{ background: '#7B5CFF', color: '#FFFFFF' }}
          >
            {createPost.isPending ? "Sharing..." : "Share Post"}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}