import React, { useState } from "react";
import { Play, Sparkles, Star } from "lucide-react";
import { COMEBACK_CATEGORY_BY_KEY } from "@/lib/comebackConfig";

export default function ComebackVideoCard({ video }) {
  const [playing, setPlaying] = useState(false);
  const cat = COMEBACK_CATEGORY_BY_KEY[video.category] || {};

  return (
    <div style={{
      background: "var(--card)",
      border: "1px solid var(--border)",
      borderRadius: 20,
      overflow: "hidden",
      backdropFilter: "blur(18px)",
      boxShadow: "var(--shadow-card)",
    }}>
      {/* Video / thumbnail */}
      <div style={{ position: "relative", aspectRatio: "16/9", background: "#000" }}>
        {playing ? (
          <iframe
            src={`${video.embed_url}?autoplay=1&rel=0`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
            allowFullScreen
            style={{ width: "100%", height: "100%", border: 0 }}
          />
        ) : (
          <button
            onClick={() => setPlaying(true)}
            style={{
              position: "absolute", inset: 0, padding: 0, border: 0,
              background: `url(${video.thumbnail_url}) center/cover no-repeat`,
              cursor: "pointer", width: "100%", height: "100%",
            }}
            aria-label={`Play ${video.title}`}
          >
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.7))",
            }} />
            <div style={{
              position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
              width: 56, height: 56, borderRadius: "50%",
              background: "linear-gradient(135deg, var(--gold), #E89A2A)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "var(--glow-gold)",
            }}>
              <Play style={{ width: 24, height: 24, color: "#1A1F2C", marginLeft: 3 }} fill="#1A1F2C" />
            </div>
          </button>
        )}

        {video.is_featured_today && (
          <div style={{
            position: "absolute", top: 10, left: 10,
            display: "inline-flex", alignItems: "center", gap: 4,
            padding: "4px 10px", borderRadius: 999,
            background: "var(--gold)", color: "#1A1F2C",
            fontSize: 10, fontWeight: 800, letterSpacing: ".06em",
            textTransform: "uppercase",
          }}>
            <Star style={{ width: 10, height: 10 }} fill="#1A1F2C" /> Featured
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: 16 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          fontSize: 10, fontWeight: 700, color: cat.color || "var(--accent)",
          letterSpacing: ".12em", textTransform: "uppercase",
          marginBottom: 8,
        }}>
          <span>{cat.emoji}</span> {cat.label || video.category}
        </div>

        <p style={{
          fontFamily: "'Lora', Georgia, serif",
          fontSize: 16, fontWeight: 600, color: "var(--text)",
          lineHeight: 1.3, marginBottom: 6,
        }}>
          {video.title}
        </p>

        {video.channel_name && (
          <p style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 10 }}>
            {video.channel_name}
          </p>
        )}

        {video.ai_takeaway && (
          <div style={{
            display: "flex", gap: 8, alignItems: "flex-start",
            padding: "10px 12px", borderRadius: 12,
            background: "var(--surface)",
            border: "1px solid var(--border-glow)",
            marginBottom: 8,
          }}>
            <Sparkles style={{ width: 14, height: 14, color: "var(--accent)", flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: 12.5, color: "var(--text)", lineHeight: 1.5, fontStyle: "italic" }}>
              {video.ai_takeaway}
            </p>
          </div>
        )}

        {video.ai_summary && (
          <p style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.55 }}>
            {video.ai_summary}
          </p>
        )}
      </div>
    </div>
  );
}