import React, { useState, useMemo } from "react";
import { Play, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { RR_SEED_VIDEOS, pickDailyVideo, CAT_BY_KEY } from "@/lib/riseRecoverData";
import RRVideoPlayer from "./RRVideoPlayer";

export default function RRDailyRiseWidget() {
  const [playing, setPlaying] = useState(false);
  const video = useMemo(() => pickDailyVideo(RR_SEED_VIDEOS), []);
  if (!video) return null;
  const cat = CAT_BY_KEY[video.category];

  return (
    <>
      <div className="fade-up" style={{
        position: "relative",
        borderRadius: 24,
        overflow: "hidden",
        marginBottom: 24,
        cursor: "pointer",
        border: "1px solid var(--border-glow)",
        boxShadow: "var(--glow), var(--shadow-card)",
        animation: "rrDailyGlow 4s ease-in-out infinite",
      }}
      onClick={() => setPlaying(true)}>
        {/* Animated glow border */}
        <div aria-hidden style={{
          position: "absolute", inset: -1, borderRadius: 24, padding: 1,
          background: `linear-gradient(135deg, ${cat?.accent}, var(--purple), ${cat?.accent})`,
          backgroundSize: "200% 200%",
          animation: "rrBorderShift 5s linear infinite",
          WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor", maskComposite: "exclude",
          opacity: 0.6, pointerEvents: "none", zIndex: 1,
        }} />

        {/* Thumbnail */}
        <div style={{ position: "relative", aspectRatio: "16/9" }}>
          <img src={video.thumbnail_url} alt={video.title}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div aria-hidden style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(180deg, rgba(7,10,20,0) 30%, rgba(7,10,20,0.95) 100%)",
          }} />
          <div aria-hidden style={{
            position: "absolute", inset: 0,
            background: `radial-gradient(circle at 70% 30%, ${cat?.accent}33 0%, transparent 60%)`,
          }} />

          {/* Top chip */}
          <div style={{
            position: "absolute", top: 14, left: 14,
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "5px 12px", borderRadius: 999,
            background: "rgba(7,10,20,0.75)",
            border: `1px solid ${cat?.accent}55`,
            backdropFilter: "blur(12px)",
          }}>
            <Sparkles style={{ width: 11, height: 11, color: cat?.accent }} />
            <span style={{
              fontSize: 9.5, fontWeight: 800, color: cat?.accent,
              letterSpacing: ".18em", textTransform: "uppercase",
              fontFamily: "'Space Grotesk', 'DM Sans', sans-serif",
            }}>
              Daily Rise · AI Pick
            </span>
          </div>

          {/* Center play */}
          <div style={{
            position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
            width: 70, height: 70, borderRadius: "50%",
            background: "linear-gradient(135deg, var(--accent), var(--purple))",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 38px var(--accent), 0 8px 22px rgba(0,0,0,0.45)",
            animation: "rrPlayPulse 2.4s ease-in-out infinite",
          }}>
            <Play style={{ width: 28, height: 28, color: "#fff" }} fill="#fff" />
          </div>
        </div>

        {/* Content under thumbnail */}
        <div style={{
          position: "relative", zIndex: 2,
          padding: "16px 18px 18px",
          background: "var(--card)",
          backdropFilter: "blur(20px)",
        }}>
          <h3 style={{
            fontFamily: "'Lora', Georgia, serif",
            fontSize: 19, fontWeight: 700, color: "var(--text)",
            lineHeight: 1.25, marginBottom: 6,
            letterSpacing: "-.01em",
          }}>{video.title}</h3>
          <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginBottom: 10 }}>
            {video.speaker}
          </p>
          {video.inspirational_quote && (
            <p style={{
              fontSize: 13, fontStyle: "italic",
              color: "var(--text-muted)",
              fontFamily: "'Lora', Georgia, serif",
              lineHeight: 1.55,
              padding: "10px 12px",
              borderLeft: `2px solid ${cat?.accent}`,
              background: "var(--surface)",
              borderRadius: 10,
              marginBottom: 12,
            }}>
              "{video.inspirational_quote}"
            </p>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "var(--text-dim)" }}>Tap to watch · ~{Math.round((video.duration_seconds||300)/60)} min</span>
            <Link to="/RiseRecover" onClick={(e) => e.stopPropagation()} style={{
              fontSize: 12, color: "var(--accent)", fontWeight: 700,
              textDecoration: "none",
              display: "inline-flex", alignItems: "center", gap: 4,
            }}>
              Explore all <ArrowRight style={{ width: 12, height: 12 }} />
            </Link>
          </div>
        </div>

        <style>{`
          @keyframes rrDailyGlow {
            0%,100% { box-shadow: 0 0 22px rgba(91,141,239,0.25), var(--shadow-card); }
            50%     { box-shadow: 0 0 42px rgba(167,139,250,0.40), var(--shadow-card); }
          }
          @keyframes rrBorderShift {
            0% { background-position: 0% 50%; }
            100% { background-position: 200% 50%; }
          }
        `}</style>
      </div>

      {playing && (
        <RRVideoPlayer
          video={video}
          onClose={() => setPlaying(false)}
        />
      )}
    </>
  );
}