import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Flag, MessageCircle, ChevronDown, ChevronUp, ShieldCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import CommentSection from "@/components/content/CommentSection";

export const POST_CATEGORIES = {
  daily_win:            { label: "Daily Win",           emoji: "🏆", color: "#10B981", bg: "rgba(16,185,129,0.12)" },
  need_support:         { label: "Need Support",        emoji: "🤝", color: "#F87171", bg: "rgba(248,113,113,0.12)" },
  craving_now:          { label: "Craving Right Now",   emoji: "⚡", color: "#FB923C", bg: "rgba(251,146,60,0.12)" },
  motivation:           { label: "Motivation",          emoji: "🔥", color: "#FBBF24", bg: "rgba(251,191,36,0.12)" },
  recovery_question:    { label: "Recovery Question",   emoji: "❓", color: "#60A5FA", bg: "rgba(96,165,250,0.12)" },
  meeting_experience:   { label: "Meeting Experience",  emoji: "🤲", color: "#A78BFA", bg: "rgba(167,139,250,0.12)" },
  job_housing_help:     { label: "Job / Housing Help",  emoji: "🏠", color: "#34D399", bg: "rgba(52,211,153,0.12)" },
  milestone_celebration:{ label: "Milestone",           emoji: "🎉", color: "#C9A96E", bg: "rgba(201,169,110,0.12)" },
  reentry_advice:       { label: "Reentry Advice",      emoji: "🗺️", color: "#818CF8", bg: "rgba(129,140,248,0.12)" },
  journal_reflection:   { label: "Journal Reflection",  emoji: "📓", color: "#9CA3AF", bg: "rgba(156,163,175,0.12)" },
  // legacy
  support:     { label: "Support",   emoji: "❤️", color: "#F87171", bg: "rgba(248,113,113,0.12)" },
  question:    { label: "Question",  emoji: "❓", color: "#60A5FA", bg: "rgba(96,165,250,0.12)" },
  milestone:   { label: "Milestone", emoji: "🏆", color: "#C9A96E", bg: "rgba(201,169,110,0.12)" },
  advice:      { label: "Advice",    emoji: "💡", color: "#A78BFA", bg: "rgba(167,139,250,0.12)" },
};

const MOOD_TAGS = {
  hopeful:    { label: "Hopeful",    emoji: "🌅", color: "#3ECFBF" },
  struggling: { label: "Struggling", emoji: "💧", color: "#F87171" },
  anxious:    { label: "Anxious",    emoji: "😰", color: "#FB923C" },
  grateful:   { label: "Grateful",   emoji: "🙏", color: "#C9A96E" },
  proud:      { label: "Proud",      emoji: "⭐", color: "#FBBF24" },
  triggered:  { label: "Triggered",  emoji: "⚡", color: "#EF4444" },
};

const REACTIONS = [
  { key: "reaction_proud",   label: "Proud of you",    emoji: "⭐" },
  { key: "reaction_strong",  label: "Stay Strong",     emoji: "💪" },
  { key: "reaction_relate",  label: "I Relate",        emoji: "🫂" },
  { key: "reaction_support", label: "Sending Support", emoji: "💙" },
  { key: "reaction_going",   label: "Keep Going",      emoji: "🔥" },
];

const CRISIS_CATEGORIES = ["craving_now", "need_support"];

export default function RecoveryPostCard({ post, user, onCrisisClick }) {
  const [showComments, setShowComments] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const queryClient = useQueryClient();

  const cat = POST_CATEGORIES[post.category] || POST_CATEGORIES.support;
  const mood = post.mood_tag ? MOOD_TAGS[post.mood_tag] : null;
  const timeAgo = post.created_date ? formatDistanceToNow(new Date(post.created_date), { addSuffix: true }) : "";
  const handle = post.is_anonymous ? "Anonymous" : (post.created_by?.split("@")[0] || "Community Member");
  const isUrgent = CRISIS_CATEGORIES.includes(post.category);
  const isVerified = post.is_verified_mentor || post.is_verified_counselor;

  const reactMutation = useMutation({
    mutationFn: (reactionKey) => base44.entities.CommunityPost.update(post.id, {
      [reactionKey]: (post[reactionKey] || 0) + 1,
      like_count: (post.like_count || 0) + 1,
    }),
    onSuccess: () => queryClient.invalidateQueries(["community-posts"]),
  });

  const reportMutation = useMutation({
    mutationFn: () => base44.entities.CommunityPost.update(post.id, { moderation_status: "flagged" }),
    onSuccess: () => alert("Reported. Our team will review this shortly."),
  });

  const totalReactions = REACTIONS.reduce((sum, r) => sum + (post[r.key] || 0), 0) || post.like_count || 0;

  return (
    <div style={{
      background: isUrgent ? "rgba(251,146,60,0.05)" : "rgba(255,255,255,0.04)",
      border: `1px solid ${isUrgent ? "rgba(251,146,60,0.3)" : "rgba(255,255,255,0.09)"}`,
      borderRadius: 18,
      overflow: "hidden",
      marginBottom: 12,
    }}>
      {isUrgent && (
        <div style={{
          background: "rgba(251,146,60,0.15)", padding: "6px 16px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#FB923C" }}>⚡ Support Needed</p>
          <button
            onClick={() => onCrisisClick?.(post)}
            style={{ fontSize: 11, fontWeight: 700, color: "#FB923C", background: "rgba(251,146,60,0.2)",
              border: "1px solid rgba(251,146,60,0.4)", borderRadius: 8, padding: "2px 10px", cursor: "pointer" }}
          >
            Offer Help →
          </button>
        </div>
      )}

      <div style={{ padding: "14px 16px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
              background: cat.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
            }}>
              {cat.emoji}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{handle}</p>
                {isVerified && (
                  <ShieldCheck style={{ width: 13, height: 13, color: "#3ECFBF" }} />
                )}
              </div>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 1 }}>{timeAgo}</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
              background: cat.bg, color: cat.color,
            }}>
              {cat.emoji} {cat.label}
            </span>
          </div>
        </div>

        {/* Title */}
        {post.title && (
          <p style={{ fontSize: 15, fontWeight: 800, color: "#fff", marginBottom: 6, lineHeight: 1.3 }}>{post.title}</p>
        )}

        {/* Content */}
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.72)", lineHeight: 1.65 }}>{post.content}</p>

        {/* Mood tag */}
        {mood && (
          <div style={{ marginTop: 10 }}>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
              background: `${mood.color}18`, color: mood.color, border: `1px solid ${mood.color}30`,
            }}>
              {mood.emoji} {mood.label}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{
        padding: "10px 16px", borderTop: "1px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", gap: 6,
      }}>
        {/* Reaction toggle */}
        <button
          onClick={() => setShowReactions(!showReactions)}
          style={{
            display: "flex", alignItems: "center", gap: 6, padding: "6px 12px",
            background: showReactions ? "rgba(62,207,191,0.15)" : "rgba(255,255,255,0.05)",
            border: `1px solid ${showReactions ? "rgba(62,207,191,0.3)" : "rgba(255,255,255,0.08)"}`,
            borderRadius: 10, color: showReactions ? "#3ECFBF" : "rgba(255,255,255,0.45)",
            fontSize: 12, fontWeight: 600, cursor: "pointer",
          }}
        >
          💙 {totalReactions > 0 ? totalReactions : "React"}
          {showReactions ? <ChevronUp style={{ width: 12, height: 12 }} /> : <ChevronDown style={{ width: 12, height: 12 }} />}
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          style={{
            display: "flex", alignItems: "center", gap: 6, padding: "6px 12px",
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 10, color: "rgba(255,255,255,0.45)", fontSize: 12, fontWeight: 600, cursor: "pointer",
          }}
        >
          <MessageCircle style={{ width: 13, height: 13 }} />
          Reply
        </button>

        <button
          onClick={() => reportMutation.mutate()}
          style={{
            marginLeft: "auto", background: "none", border: "none",
            color: "rgba(255,255,255,0.2)", cursor: "pointer", padding: "6px",
          }}
        >
          <Flag style={{ width: 13, height: 13 }} />
        </button>
      </div>

      {/* Reaction picker */}
      {showReactions && (
        <div style={{
          padding: "10px 16px 14px",
          display: "flex", gap: 6, flexWrap: "wrap",
        }}>
          {REACTIONS.map(r => (
            <button
              key={r.key}
              onClick={() => { reactMutation.mutate(r.key); setShowReactions(false); }}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "7px 12px", borderRadius: 12,
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer",
              }}
            >
              {r.emoji} {r.label} {post[r.key] > 0 && <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>{post[r.key]}</span>}
            </button>
          ))}
        </div>
      )}

      {/* Comments */}
      {showComments && (
        <div style={{ padding: "0 16px 16px" }}>
          <CommentSection contentType="community_post" contentId={post.id} user={user} />
        </div>
      )}
    </div>
  );
}