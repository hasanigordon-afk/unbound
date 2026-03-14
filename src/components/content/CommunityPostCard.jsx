import React, { useState } from "react";
import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";

const CAT_EMOJI = { support: "🤝", question: "❓", milestone: "🏆", advice: "💡" };
const CAT_LABEL = { support: "Support", question: "Question", milestone: "Milestone", advice: "Advice" };

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Math.floor((new Date() - new Date(dateStr)) / 60000);
  if (diff < 1) return "Just now";
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

export default function CommunityPostCard({ post, user, isLiked, likeCount, onLike, onShare, onReport }) {
  const [showMenu, setShowMenu] = useState(false);
  const emoji = CAT_EMOJI[post.category] || "✍️";
  const catLabel = CAT_LABEL[post.category] || post.category;
  const authorName = post.is_anonymous ? "Anonymous" : (post.created_by?.split("@")[0] || "Community Member");

  return (
    <div className="rounded-2xl p-4" style={{ background: "#FFF", border: "1px solid #E5E7EB" }}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0"
            style={{ background: "#F7F7F8" }}>
            {emoji}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold" style={{ color: "#1E1E1E" }}>{authorName}</p>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#F7F7F8", color: "#8E8E93" }}>
                {catLabel}
              </span>
            </div>
            <p className="text-xs" style={{ color: "#C7C7CC" }}>{timeAgo(post.created_date)}</p>
          </div>
        </div>

        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)} style={{ background: "none", border: "none", padding: 4 }}>
            <MoreHorizontal className="w-4 h-4" style={{ color: "#8E8E93" }} />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-8 z-10 rounded-xl py-1 w-36"
              style={{ background: "#FFF", border: "1px solid #E5E7EB", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}
              onMouseLeave={() => setShowMenu(false)}>
              <button onClick={() => { onShare(); setShowMenu(false); }}
                className="w-full text-left px-4 py-2.5 text-sm" style={{ background: "none", border: "none", color: "#1E1E1E" }}>
                Share
              </button>
              <button onClick={() => { if (window.confirm("Report this post?")) { onReport(); setShowMenu(false); } }}
                className="w-full text-left px-4 py-2.5 text-sm" style={{ background: "none", border: "none", color: "#EF4444" }}>
                Report
              </button>
            </div>
          )}
        </div>
      </div>

      {post.title && (
        <p className="font-bold text-sm mb-1" style={{ color: "#1E1E1E" }}>{post.title}</p>
      )}
      <p className="text-sm leading-relaxed mb-3" style={{ color: "#1E1E1E" }}>{post.content}</p>

      <div className="flex items-center gap-2 pt-3" style={{ borderTop: "1px solid #F7F7F8" }}>
        <button onClick={onLike}
          className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl font-medium"
          style={{ background: isLiked ? "#FEF2F2" : "#F7F7F8", color: isLiked ? "#EF4444" : "#8E8E93", border: "none", cursor: "pointer" }}>
          <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-current" : ""}`} />
          {likeCount > 0 ? likeCount : "Like"}
        </button>
        <button onClick={onShare}
          className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl ml-auto"
          style={{ background: "#F7F7F8", color: "#8E8E93", border: "none", cursor: "pointer" }}>
          <Share2 className="w-3.5 h-3.5" /> Share
        </button>
      </div>
    </div>
  );
}