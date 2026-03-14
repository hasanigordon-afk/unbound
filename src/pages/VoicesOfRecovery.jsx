import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, Share2, Flag, MessageCircle, Loader2, Plus, X, Upload } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import CommentSection from "@/components/content/CommentSection";
import ShareSheet from "@/components/content/ShareSheet";

const POST_CATEGORIES = [
  { value: "encouragement",    label: "💪 Encouragement",   color: "#22C55E", bg: "#F0FDF4" },
  { value: "milestone",        label: "🏆 Milestone",        color: "#D97706", bg: "#FFFBEB" },
  { value: "reentry_win",      label: "🎯 Reentry Win",      color: "#7C3AED", bg: "#F5F3FF" },
  { value: "recovery_thought", label: "💭 Recovery Thought", color: "#2563EB", bg: "#EBF5FF" },
  { value: "advice",           label: "🤝 Advice",           color: "#0891B2", bg: "#ECFEFF" },
  { value: "question",         label: "❓ Question",         color: "#EA580C", bg: "#FFF7ED" },
  { value: "support",          label: "❤️ Support",          color: "#BE123C", bg: "#FFF1F2" },
];

function PostCard({ post, user, onLike, onShare, onReport }) {
  const [showComments, setShowComments] = useState(false);
  const cat = POST_CATEGORIES.find(c => c.value === post.category) || POST_CATEGORIES[0];
  const timeAgo = post.created_date ? formatDistanceToNow(new Date(post.created_date), { addSuffix: true }) : "";
  const authorHandle = post.is_anonymous ? "Anonymous" : (post.created_by?.split("@")[0] || "Community Member");

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#FFF", border: "1px solid #E5E7EB" }}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
              style={{ background: cat.bg, color: cat.color }}>
              {cat.label.split(" ")[0]}
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: "#1E1E1E" }}>{authorHandle}</p>
              <p className="text-[10px]" style={{ color: "#C7C7CC" }}>{timeAgo}</p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: cat.bg, color: cat.color }}>
            {cat.label}
          </span>
        </div>

        {/* Content */}
        <p className="text-sm leading-relaxed" style={{ color: "#1E1E1E" }}>{post.content}</p>

        {post.image_url && (
          <img src={post.image_url} alt="" className="w-full rounded-xl mt-3 object-cover max-h-64" />
        )}
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex items-center gap-3" style={{ borderTop: "1px solid #F7F7F8" }}>
        <button onClick={() => onLike(post)} className="flex items-center gap-1.5 text-sm py-2"
          style={{ background: "none", border: "none", color: "#8E8E93" }}>
          <Heart className="w-4 h-4" />
          {(post.like_count || 0) > 0 && <span className="text-xs">{post.like_count}</span>}
        </button>
        <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-1.5 text-sm py-2"
          style={{ background: "none", border: "none", color: "#8E8E93" }}>
          <MessageCircle className="w-4 h-4" />
          {(post.comment_count || 0) > 0 && <span className="text-xs">{post.comment_count}</span>}
        </button>
        <button onClick={() => onShare(post)} className="flex items-center gap-1.5 text-sm py-2 ml-auto"
          style={{ background: "none", border: "none", color: "#8E8E93" }}>
          <Share2 className="w-4 h-4" />
        </button>
        <button onClick={() => onReport(post)} className="flex items-center gap-1.5 text-sm py-2"
          style={{ background: "none", border: "none", color: "#C7C7CC" }}>
          <Flag className="w-3.5 h-3.5" />
        </button>
      </div>

      {showComments && (
        <div className="px-4 pb-4">
          <CommentSection contentType="community_post" contentId={post.id} user={user} />
        </div>
      )}
    </div>
  );
}

export default function VoicesOfRecovery() {
  const queryClient = useQueryClient();
  const [showCompose, setShowCompose] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [postCategory, setPostCategory] = useState("encouragement");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [sharing, setSharing] = useState(null);

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["community-posts"],
    queryFn: () => base44.entities.CommunityPost.filter({ moderation_status: "approved" }, "-created_date", 50),
  });

  const createMutation = useMutation({
    mutationFn: () => base44.entities.CommunityPost.create({
      content: postContent.trim(),
      category: postCategory,
      is_anonymous: isAnonymous,
      moderation_status: "approved",
      like_count: 0,
      comment_count: 0,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(["community-posts"]);
      setShowCompose(false);
      setPostContent("");
    },
  });

  const likeMutation = useMutation({
    mutationFn: async (post) => {
      await base44.entities.PostLike.create({ content_type: "community_post", content_id: post.id });
      return base44.entities.CommunityPost.update(post.id, { like_count: (post.like_count || 0) + 1 });
    },
    onSuccess: () => queryClient.invalidateQueries(["community-posts"]),
  });

  const reportMutation = useMutation({
    mutationFn: (post) => base44.entities.ContentReport.create({ content_type: "community_post", content_id: post.id, reason: "harmful_content" }),
    onSuccess: () => alert("Thank you for reporting. Our moderation team will review this post."),
  });

  const filtered = activeFilter === "all" ? posts : posts.filter(p => p.category === activeFilter);

  return (
    <div className="min-h-screen pb-28" style={{ background: "#F7F7F8" }}>
      {/* Header */}
      <div className="px-5 pt-8 pb-4" style={{ background: "#FFF", borderBottom: "1px solid #D1D1D6" }}>
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-xl font-bold" style={{ color: "#1E1E1E" }}>Voices of Recovery</h1>
            <p className="text-sm mt-0.5" style={{ color: "#8E8E93" }}>Real people. Real journeys. Real support.</p>
          </div>
          {user && (
            <button onClick={() => setShowCompose(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold"
              style={{ background: "#4A90E2", color: "#FFF" }}>
              <Plus className="w-4 h-4" /> Share
            </button>
          )}
        </div>

        {/* Category filter chips */}
        <div className="flex gap-2 overflow-x-auto mt-3 pb-1" style={{ scrollbarWidth: "none" }}>
          <button onClick={() => setActiveFilter("all")}
            className="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0"
            style={{ background: activeFilter === "all" ? "#1E1E1E" : "#F0F0F3", color: activeFilter === "all" ? "#FFF" : "#5A5A5A", border: "1px solid #D1D1D6" }}>
            All
          </button>
          {POST_CATEGORIES.map(c => (
            <button key={c.value} onClick={() => setActiveFilter(c.value)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0"
              style={{ background: activeFilter === c.value ? c.color : "#F0F0F3", color: activeFilter === c.value ? "#FFF" : "#5A5A5A", border: "1px solid #D1D1D6" }}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 py-5 space-y-3">
        {!user && (
          <div className="p-4 rounded-2xl text-center" style={{ background: "#EBF5FF", border: "1px solid #BFDBFE" }}>
            <p className="text-sm font-semibold mb-2" style={{ color: "#1E3A5F" }}>Join the conversation</p>
            <button onClick={() => base44.auth.redirectToLogin()}
              className="px-5 py-2 rounded-xl text-sm font-bold" style={{ background: "#4A90E2", color: "#FFF" }}>
              Sign in to post
            </button>
          </div>
        )}

        {isLoading && <div className="text-center py-10"><Loader2 className="w-6 h-6 mx-auto animate-spin opacity-30" /></div>}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-16 rounded-2xl" style={{ background: "#FFF", border: "1px solid #E5E7EB" }}>
            <p className="text-2xl mb-2">💭</p>
            <p className="text-sm font-medium" style={{ color: "#1E1E1E" }}>No posts yet in this category.</p>
            <p className="text-xs mt-1" style={{ color: "#8E8E93" }}>Be the first to share your experience.</p>
          </div>
        )}

        {filtered.map(post => (
          <PostCard key={post.id} post={post} user={user}
            onLike={likeMutation.mutate}
            onShare={setSharing}
            onReport={reportMutation.mutate}
          />
        ))}
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="w-full max-w-lg rounded-t-3xl p-6" style={{ background: "#FFF" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold" style={{ color: "#1E1E1E" }}>Share Your Story</h3>
              <button onClick={() => setShowCompose(false)}><X className="w-5 h-5" style={{ color: "#8E8E93" }} /></button>
            </div>

            {/* Category selector */}
            <div className="flex gap-2 overflow-x-auto mb-4 pb-1" style={{ scrollbarWidth: "none" }}>
              {POST_CATEGORIES.map(c => (
                <button key={c.value} onClick={() => setPostCategory(c.value)}
                  className="px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex-shrink-0"
                  style={{ background: postCategory === c.value ? c.color : "#F0F0F3", color: postCategory === c.value ? "#FFF" : "#5A5A5A" }}>
                  {c.label}
                </button>
              ))}
            </div>

            <textarea
              value={postContent}
              onChange={e => setPostContent(e.target.value)}
              placeholder="Share something that might help or inspire someone on their journey…"
              rows={5}
              className="w-full text-sm p-4 rounded-2xl resize-none outline-none mb-3"
              style={{ background: "#F7F7F8", border: "1px solid #D1D1D6", color: "#1E1E1E" }}
            />

            {/* Anonymous toggle */}
            <div className="flex items-center justify-between mb-4 px-1">
              <div>
                <p className="text-sm font-semibold" style={{ color: "#1E1E1E" }}>Post anonymously</p>
                <p className="text-xs" style={{ color: "#8E8E93" }}>Your name won't appear on this post</p>
              </div>
              <button onClick={() => setIsAnonymous(!isAnonymous)}
                className="w-11 h-6 rounded-full relative"
                style={{ background: isAnonymous ? "#4A90E2" : "#D1D1D6" }}>
                <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all"
                  style={{ left: isAnonymous ? "calc(100% - 22px)" : "2px", boxShadow: "0 1px 3px rgba(0,0,0,0.15)" }} />
              </button>
            </div>

            <div className="p-3 rounded-xl mb-4" style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}>
              <p className="text-xs" style={{ color: "#92400E" }}>
                🛡️ This is a safe, moderated space. Content that is harmful, triggering, or abusive will be removed.
              </p>
            </div>

            <button
              onClick={() => createMutation.mutate()}
              disabled={!postContent.trim() || createMutation.isPending}
              className="w-full py-4 rounded-2xl text-base font-bold"
              style={{ background: postContent.trim() ? "#4A90E2" : "#E5E7EB", color: "#FFF" }}>
              {createMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Share with Community →"}
            </button>
          </div>
        </div>
      )}

      {sharing && <ShareSheet title={sharing.content?.slice(0, 60) + "…"} summary={sharing.content} onClose={() => setSharing(null)} />}
    </div>
  );
}