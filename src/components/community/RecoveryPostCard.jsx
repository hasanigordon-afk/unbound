import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Flag, MessageCircle, ChevronDown, ChevronUp, ShieldCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import CommentSection from "@/components/content/CommentSection";

const AMBER = "#B8823A";
export const POST_CATEGORIES = {
  daily_win:            { label: "Daily Win",           emoji: "🏆" },
  need_support:         { label: "Need Support",        emoji: "🤝" },
  craving_now:          { label: "Craving Right Now",   emoji: "⚡" },
  motivation:           { label: "Motivation",          emoji: "🔥" },
  recovery_question:    { label: "Recovery Question",   emoji: "❓" },
  meeting_experience:   { label: "Meeting Experience",  emoji: "🤲" },
  job_housing_help:     { label: "Job / Housing Help",  emoji: "🏠" },
  milestone_celebration:{ label: "Milestone",           emoji: "🎉" },
  reentry_advice:       { label: "Reentry Advice",      emoji: "🗺️" },
  journal_reflection:   { label: "Journal Reflection",  emoji: "📓" },
  support:     { label: "Support",   emoji: "❤️" },
  question:    { label: "Question",  emoji: "❓" },
  milestone:   { label: "Milestone", emoji: "🏆" },
  advice:      { label: "Advice",    emoji: "💡" },
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
      background: "#FDFAF6",
      border: isUrgent ? "1px solid rgba(184,130,58,0.35)" : "1px solid #E8E2D9",
      borderRadius: 16,
      overflow: "hidden",
      marginBottom: 12,
      boxShadow: "0 1px 4px rgba(28,20,16,0.06)",
    }}>
      {isUrgent && (
        <div style={{
          background: "rgba(184,130,58,0.08)", padding: "6px 16px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderBottom: "1px solid rgba(184,130,58,0.18)",
        }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: AMBER }}>⚡ Support Needed</p>
          <button
            onClick={() => onCrisisClick?.(post)}
            style={{ fontSize: 11, fontWeight: 700, color: AMBER, background: "rgba(184,130,58,0.12)",
              border: "1px solid rgba(184,130,58,0.3)", borderRadius: 8, padding: "2px 10px", cursor: "pointer" }}
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
                <p style={{ fontSize: 13, fontWeight: 700, color: "#1C1410" }}>{handle}</p>
                {isVerified && (
                  <ShieldCheck style={{ width: 13, height: 13, color: AMBER }} />
                )}
              </div>
              <p style={{ fontSize: 11, color: "#9B8E83", marginTop: 1 }}>{timeAgo}</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
              background: "rgba(184,130,58,0.10)", color: AMBER,
            }}>
              {cat.emoji} {cat.label}
            </span>
          </div>
        </div>

        {/* Title */}
        {post.title && (
          <p style={{ fontSize: 15, fontWeight: 600, color: "#1C1410", marginBottom: 6, lineHeight: 1.3, fontFamily: "'Lora', serif" }}>{post.title}</p>
        )}

        {/* Content */}
        <p style={{ fontSize: 14, color: "#4A3F35", lineHeight: 1.65 }}>{post.content}</p>

        {/* Mood tag */}
        {mood && (
          <div style={{ marginTop: 10 }}>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
              background: "rgba(184,130,58,0.08)", color: AMBER, border: "1px solid rgba(184,130,58,0.2)",
            }}>
              {mood.emoji} {mood.label}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{
        padding: "10px 16px", borderTop: "1px solid #E8E2D9",
        display: "flex", alignItems: "center", gap: 6,
      }}>
        {/* Reaction toggle */}
        <button
          onClick={() => setShowReactions(!showReactions)}
          style={{
            display: "flex", alignItems: "center", gap: 6, padding: "6px 12px",
            background: showReactions ? "rgba(184,130,58,0.10)" : "#F7F3EE",
            border: `1px solid ${showReactions ? "rgba(184,130,58,0.35)" : "#E8E2D9"}`,
            borderRadius: 10, color: showReactions ? AMBER : "#9B8E83",
            fontSize: 12, fontWeight: 600, cursor: "pointer", minHeight: 36,
          }}
        >
          💙 {totalReactions > 0 ? totalReactions : "React"}
          {showReactions ? <ChevronUp style={{ width: 12, height: 12 }} /> : <ChevronDown style={{ width: 12, height: 12 }} />}
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          style={{
            display: "flex", alignItems: "center", gap: 6, padding: "6px 12px",
            background: showComments ? "rgba(184,130,58,0.10)" : "#F7F3EE",
            border: `1px solid ${showComments ? "rgba(184,130,58,0.35)" : "#E8E2D9"}`,
            borderRadius: 10, color: showComments ? AMBER : "#9B8E83", fontSize: 12, fontWeight: 600, cursor: "pointer", minHeight: 36,
          }}
        >
          <MessageCircle style={{ width: 13, height: 13 }} />
          Reply
        </button>

        <button
          onClick={() => reportMutation.mutate()}
          style={{
            marginLeft: "auto", background: "none", border: "none",
            color: "#E8E2D9", cursor: "pointer", padding: "6px",
          }}
        >
          <Flag style={{ width: 13, height: 13 }} />
        </button>
      </div>

      {/* Reaction picker */}
      {showReactions && (
        <div style={{
          padding: "10px 16px 14px", borderTop: "1px solid #E8E2D9",
          display: "flex", gap: 6, flexWrap: "wrap",
        }}>
          {REACTIONS.map(r => (
            <button
              key={r.key}
              onClick={() => { reactMutation.mutate(r.key); setShowReactions(false); }}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "7px 12px", borderRadius: 12,
                background: "#F7F3EE", border: "1px solid #E8E2D9",
                color: "#4A3F35", fontSize: 12, fontWeight: 600, cursor: "pointer",
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