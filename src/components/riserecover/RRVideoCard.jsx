import React from "react";
import { Play, Clock, Sparkles } from "lucide-react";
import { CAT_BY_KEY } from "@/lib/riseRecoverData";

const fmt = (s) => {
  if (!s) return null;
  const m = Math.floor(s / 60), sec = s % 60;
  return `${m}:${String(sec).padStart(2,"0")}`;
};

export default function RRVideoCard({ video, size = "md", onClick }) {
  const cat = CAT_BY_KEY[video.category];
  const isLg = size === "lg";

  return (
    <button onClick={() => onClick?.(video)}
      style={{
        position: "relative", overflow: "hidden",
        flexShrink: 0,
        width: isLg ? "100%" : 220,
        aspectRatio: isLg ? "16/9" : "4/5",
        borderRadius: 18,
        border: "1px solid var(--border-glow)",
        background: "var(--card-solid)",
        cursor: "pointer",
        boxShadow: "var(--shadow-card)",
        transition: "transform .25s cubic-bezier(.22,1,.36,1), box-shadow .2s",
        padding: 0,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px) scale(1.015)";
        e.currentTarget.style.boxShadow = `0 0 28px ${cat?.accent || "var(--accent)"}, var(--shadow-card)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0) scale(1)";
        e.currentTarget.style.boxShadow = "var(--shadow-card)";
      }}
    >
      {/* Thumbnail */}
      <img src={video.thumbnail_url} alt={video.title}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        onError={(e) => { e.currentTarget.style.display = "none"; }}
      />
      {/* Cinematic gradient */}
      <div aria-hidden style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(180deg, rgba(7,10,20,0.05) 0%, rgba(7,10,20,0.45) 55%, rgba(7,10,20,0.92) 100%)",
      }} />
      {/* Accent glow */}
      <div aria-hidden style={{
        position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%",
        background: `radial-gradient(circle, ${cat?.accent || "var(--accent)"}33 0%, transparent 70%)`,
        filter: "blur(12px)", pointerEvents: "none",
      }} />

      {/* Top chips */}
      <div style={{
        position: "absolute", top: 10, left: 10, right: 10,
        display: "flex", justifyContent: "space-between", gap: 6,
      }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          padding: "4px 10px", borderRadius: 999,
          fontSize: 9.5, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase",
          color: cat?.accent || "var(--accent)",
          background: "rgba(7,10,20,0.7)",
          border: `1px solid ${cat?.accent || "var(--accent)"}55`,
          backdropFilter: "blur(10px)",
        }}>
          <span>{cat?.emoji}</span> {cat?.label}
        </span>
        {video.duration_seconds > 0 && (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            padding: "4px 10px", borderRadius: 999,
            fontSize: 10, fontWeight: 700, color: "#fff",
            background: "rgba(7,10,20,0.7)", backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}>
            <Clock style={{ width: 10, height: 10 }} /> {fmt(video.duration_seconds)}
          </span>
        )}
      </div>

      {/* Center play */}
      <div style={{
        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        width: 54, height: 54, borderRadius: "50%",
        background: "linear-gradient(135deg, var(--accent), var(--purple))",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "var(--glow), 0 8px 22px rgba(0,0,0,0.4)",
        animation: "rrPlayPulse 2.4s ease-in-out infinite",
      }}>
        <Play style={{ width: 22, height: 22, color: "#fff" }} fill="#fff" />
      </div>

      {/* Bottom info */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        padding: "14px 14px 14px",
        textAlign: "left",
      }}>
        <p style={{
          fontFamily: "'Lora', Georgia, serif",
          fontSize: isLg ? 18 : 15, fontWeight: 700, color: "#fff",
          lineHeight: 1.25, marginBottom: 4,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>{video.title}</p>
        <p style={{
          fontSize: 11, color: "rgba(255,255,255,0.65)",
          display: "flex", alignItems: "center", gap: 5,
        }}>
          <Sparkles style={{ width: 10, height: 10, color: cat?.accent }} />
          {video.speaker}
        </p>
      </div>

      <style>{`
        @keyframes rrPlayPulse {
          0%,100% { transform: translate(-50%,-50%) scale(1);   box-shadow: var(--glow), 0 8px 22px rgba(0,0,0,0.4); }
          50%     { transform: translate(-50%,-50%) scale(1.08); box-shadow: 0 0 38px var(--accent), 0 8px 22px rgba(0,0,0,0.4); }
        }
      `}</style>
    </button>
  );
}