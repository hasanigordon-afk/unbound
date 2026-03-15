import React, { useState } from "react";
import { Heart, MessageCircle, Bookmark, UserPlus, Flag, MoreHorizontal, Zap } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const CATEGORY_COLORS = {
  artwork: "#F59E0B", clothing: "#EC4899", poetry: "#8B5CF6",
  music: "#3B82F6", photography: "#10B981", crafts: "#F97316",
  motivation: "#EF4444", skills: "#06B6D4", services: "#84CC16", other: "#6B7280",
};

const CATEGORY_EMOJI = {
  artwork: "🎨", clothing: "👕", poetry: "📝", music: "🎵",
  photography: "📷", crafts: "🧶", motivation: "🔥", skills: "⚡", services: "🤝", other: "✨",
};

export default function TalentPostCard({ post, onViewCreator, onReport }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likes, setLikes] = useState(post.like_count || 0);
  const [showMenu, setShowMenu] = useState(false);

  const color = CATEGORY_COLORS[post.category] || "#A855F7";

  const handleLike = () => {
    setLiked(l => !l);
    setLikes(n => liked ? n - 1 : n + 1);
    base44.entities.TalentPost.update(post.id, { like_count: liked ? likes - 1 : likes + 1 }).catch(() => {});
  };

  return (
    <div style={{
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 20, overflow: "hidden",
      marginBottom: 14,
    }}>
      {/* Image */}
      {post.image_url && (
        <div style={{ position: "relative", height: 200, overflow: "hidden" }}>
          <img src={post.image_url} alt={post.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{
            position: "absolute", top: 10, left: 10,
            padding: "4px 10px", borderRadius: 20,
            background: `${color}25`, border: `1px solid ${color}50`,
            color, fontSize: 11, fontWeight: 700,
          }}>
            {CATEGORY_EMOJI[post.category]} {post.category}
          </div>
          {post.is_featured && (
            <div style={{
              position: "absolute", top: 10, right: 10,
              padding: "4px 10px", borderRadius: 20,
              background: "rgba(245,158,11,0.2)", border: "1px solid rgba(245,158,11,0.5)",
              color: "#F59E0B", fontSize: 10, fontWeight: 800,
            }}>
              ⭐ Featured
            </div>
          )}
        </div>
      )}

      {!post.image_url && (
        <div style={{
          height: 80, background: `linear-gradient(135deg,${color}15,${color}05)`,
          display: "flex", alignItems: "center", padding: "0 18px",
          borderBottom: `1px solid ${color}15`,
        }}>
          <span style={{ fontSize: 32 }}>{CATEGORY_EMOJI[post.category]}</span>
          <div style={{ marginLeft: 12 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: ".08em" }}>
              {post.category}
            </span>
          </div>
        </div>
      )}

      {/* Body */}
      <div style={{ padding: "14px 16px 0" }}>
        {/* Creator row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <button
            onClick={() => onViewCreator && onViewCreator(post.creator_email)}
            style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: `${color}25`, border: `1px solid ${color}40`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0,
            }}>
              {post.creator_photo ? (
                <img src={post.creator_photo} alt="" style={{ width: "100%", height: "100%", borderRadius: 10, objectFit: "cover" }} />
              ) : "🎨"}
            </div>
            <div style={{ textAlign: "left" }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{post.creator_name || "Creator"}</p>
            </div>
          </button>
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowMenu(m => !m)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", padding: 4 }}
            >
              <MoreHorizontal style={{ width: 16, height: 16 }} />
            </button>
            {showMenu && (
              <div style={{
                position: "absolute", right: 0, top: 28, zIndex: 10,
                background: "#1A1F2E", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12, overflow: "hidden", minWidth: 140,
              }}>
                <button
                  onClick={() => { onReport && onReport(post); setShowMenu(false); }}
                  style={{ width: "100%", padding: "10px 14px", background: "none", border: "none",
                    cursor: "pointer", color: "#F87171", fontSize: 12, fontWeight: 600, textAlign: "left",
                    display: "flex", alignItems: "center", gap: 8 }}
                >
                  <Flag style={{ width: 12, height: 12 }} /> Report Post
                </button>
              </div>
            )}
          </div>
        </div>

        <h3 style={{ fontSize: 15, fontWeight: 800, color: "#fff", marginBottom: 6 }}>{post.title}</h3>
        {post.description && (
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.55, marginBottom: 10 }}>
            {post.description.slice(0, 120)}{post.description.length > 120 ? "…" : ""}
          </p>
        )}

        {post.tags?.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
            {post.tags.slice(0, 4).map(tag => (
              <span key={tag} style={{
                fontSize: 10, padding: "2px 8px", borderRadius: 20,
                background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)",
              }}>
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 16px 14px",
        borderTop: "1px solid rgba(255,255,255,0.05)", marginTop: 4,
      }}>
        <div style={{ display: "flex", gap: 16 }}>
          <button
            onClick={handleLike}
            style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer",
              color: liked ? "#F87171" : "rgba(255,255,255,0.35)", padding: 0 }}
          >
            <Heart style={{ width: 16, height: 16, fill: liked ? "#F87171" : "none" }} />
            <span style={{ fontSize: 12, fontWeight: 600 }}>{likes}</span>
          </button>
          <button style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer",
            color: "rgba(255,255,255,0.35)", padding: 0 }}>
            <MessageCircle style={{ width: 16, height: 16 }} />
            <span style={{ fontSize: 12, fontWeight: 600 }}>{post.comment_count || 0}</span>
          </button>
          <button
            onClick={() => setSaved(s => !s)}
            style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer",
              color: saved ? "#A855F7" : "rgba(255,255,255,0.35)", padding: 0 }}
          >
            <Bookmark style={{ width: 16, height: 16, fill: saved ? "#A855F7" : "none" }} />
          </button>
        </div>
        <button
          onClick={() => onViewCreator && onViewCreator(post.creator_email)}
          style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "7px 12px", borderRadius: 20,
            background: "linear-gradient(135deg,rgba(168,85,247,0.2),rgba(168,85,247,0.1))",
            border: "1px solid rgba(168,85,247,0.35)",
            color: "#A855F7", fontSize: 11, fontWeight: 700, cursor: "pointer",
          }}
        >
          <Zap style={{ width: 11, height: 11 }} /> Support Creator
        </button>
      </div>
    </div>
  );
}