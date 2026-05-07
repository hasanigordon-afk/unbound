import React, { useState } from "react";
import { X, Heart, Bookmark, Share2, Sparkles, Quote } from "lucide-react";
import { CAT_BY_KEY } from "@/lib/riseRecoverData";

const REACTIONS = [
  { key: "hopeful",   label: "Hopeful",   emoji: "🌱" },
  { key: "moved",     label: "Moved",      emoji: "💙" },
  { key: "fired_up",  label: "Fired Up",   emoji: "🔥" },
  { key: "grateful",  label: "Grateful",   emoji: "🙏" },
  { key: "seen",      label: "Seen",       emoji: "👁️" },
];

export default function RRVideoPlayer({ video, onClose, onSave, onReact, isSaved }) {
  const [reaction, setReaction] = useState(null);
  const cat = CAT_BY_KEY[video.category];

  const handleReact = (k) => {
    setReaction(k);
    onReact?.(video, k);
  };

  const handleShare = async () => {
    try {
      await navigator.share?.({ title: video.title, text: video.inspirational_quote, url: video.video_url });
    } catch {}
  };

  return (
    <div role="dialog" aria-modal="true" style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(7,10,20,0.92)", backdropFilter: "blur(14px)",
      display: "flex", alignItems: "stretch", justifyContent: "center",
      animation: "rrFadeIn .25s ease",
      overflowY: "auto",
    }}
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()} style={{
        position: "relative",
        width: "100%", maxWidth: 720,
        margin: "auto",
        padding: "20px 14px 40px",
      }}>
        {/* Close */}
        <button onClick={onClose} aria-label="Close"
          style={{
            position: "absolute", top: 14, right: 14, zIndex: 5,
            width: 38, height: 38, borderRadius: "50%",
            background: "rgba(20,26,45,0.85)",
            border: "1px solid var(--border)",
            color: "#fff", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            backdropFilter: "blur(12px)",
          }}>
          <X style={{ width: 18, height: 18 }} />
        </button>

        {/* Ambient glow */}
        <div aria-hidden style={{
          position: "absolute", top: 30, left: "50%", transform: "translateX(-50%)",
          width: 360, height: 200, borderRadius: "50%",
          background: `radial-gradient(circle, ${cat?.accent || "var(--accent)"}55 0%, transparent 70%)`,
          filter: "blur(40px)", pointerEvents: "none", zIndex: 0,
        }} />

        {/* Video */}
        <div style={{
          position: "relative", zIndex: 1,
          width: "100%", aspectRatio: "16/9",
          borderRadius: 18, overflow: "hidden",
          border: "1px solid var(--border-glow)",
          background: "#000",
          boxShadow: "0 0 60px rgba(91,141,239,0.35), var(--shadow)",
          marginBottom: 20,
        }}>
          <iframe
            src={`${video.video_url}?autoplay=1&rel=0`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            style={{ width: "100%", height: "100%", border: "none" }}
          />
        </div>

        {/* Inspirational quote overlay */}
        {video.inspirational_quote && (
          <div style={{
            position: "relative",
            background: "linear-gradient(135deg, var(--card), var(--bg-2))",
            border: "1px solid var(--border-glow)",
            borderRadius: 18,
            padding: "18px 18px 18px 50px",
            marginBottom: 16,
            backdropFilter: "blur(14px)",
            boxShadow: "var(--shadow-card)",
          }}>
            <Quote style={{
              position: "absolute", top: 14, left: 14,
              width: 22, height: 22, color: cat?.accent || "var(--accent)",
            }} />
            <p style={{
              fontFamily: "'Lora', Georgia, serif",
              fontSize: 17, fontStyle: "italic",
              color: "var(--text)", lineHeight: 1.5,
            }}>"{video.inspirational_quote}"</p>
          </div>
        )}

        {/* Title + meta */}
        <div style={{ marginBottom: 14, color: "var(--text)" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            fontSize: 10, fontWeight: 800, color: cat?.accent,
            letterSpacing: ".18em", textTransform: "uppercase",
            marginBottom: 8,
          }}>
            {cat?.emoji} {cat?.label}
          </span>
          <h2 style={{
            fontFamily: "'Lora', Georgia, serif",
            fontSize: 26, fontWeight: 700, lineHeight: 1.2, marginBottom: 8,
            letterSpacing: "-.01em",
          }}>{video.title}</h2>
          <p style={{
            fontSize: 13, color: "var(--text-muted)",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <Sparkles style={{ width: 12, height: 12, color: cat?.accent }} />
            {video.speaker}
          </p>
          {video.description && (
            <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.65, marginTop: 10 }}>
              {video.description}
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
          <button onClick={() => onSave?.(video)} style={{
            flex: 1,
            background: isSaved ? "linear-gradient(135deg, var(--accent), var(--purple))" : "var(--surface)",
            color: isSaved ? "#fff" : "var(--text)",
            border: `1px solid ${isSaved ? "transparent" : "var(--border)"}`,
            padding: "12px", borderRadius: 999,
            fontSize: 13, fontWeight: 700, cursor: "pointer",
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
            boxShadow: isSaved ? "var(--glow)" : "none",
            backdropFilter: "blur(12px)",
            fontFamily: "'DM Sans', sans-serif",
          }}>
            <Bookmark style={{ width: 14, height: 14 }} fill={isSaved ? "#fff" : "none"} />
            {isSaved ? "Saved" : "Save for later"}
          </button>
          <button onClick={handleShare} style={{
            background: "var(--surface)", color: "var(--text)",
            border: "1px solid var(--border)",
            padding: "12px 16px", borderRadius: 999,
            fontSize: 13, fontWeight: 600, cursor: "pointer",
            display: "inline-flex", alignItems: "center", gap: 6,
            backdropFilter: "blur(12px)",
            fontFamily: "'DM Sans', sans-serif",
          }}>
            <Share2 style={{ width: 14, height: 14 }} /> Share
          </button>
        </div>

        {/* Reactions */}
        <p style={{
          fontSize: 10.5, fontWeight: 700, color: "var(--text-dim)",
          letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 10,
          fontFamily: "'Space Grotesk', 'DM Sans', sans-serif",
        }}>How did this make you feel?</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {REACTIONS.map(r => {
            const active = reaction === r.key;
            return (
              <button key={r.key} onClick={() => handleReact(r.key)} style={{
                padding: "10px 14px", borderRadius: 999,
                background: active ? "var(--navy-dim)" : "var(--surface)",
                border: active ? `1px solid var(--accent)` : "1px solid var(--border)",
                boxShadow: active ? "var(--glow)" : "none",
                cursor: "pointer", color: "var(--text)",
                fontSize: 12.5, fontWeight: 600,
                display: "inline-flex", alignItems: "center", gap: 6,
                backdropFilter: "blur(10px)",
                transition: "all .18s",
              }}>
                <span style={{ fontSize: 15 }}>{r.emoji}</span> {r.label}
              </button>
            );
          })}
        </div>

        <p style={{
          textAlign: "center", marginTop: 28, fontSize: 11,
          color: "var(--text-dim)", lineHeight: 1.7,
        }}>
          These stories show what's possible. Recovery is a journey — please reach out for professional support when needed.
        </p>
      </div>

      <style>{`
        @keyframes rrFadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}