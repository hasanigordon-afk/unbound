import React, { useEffect, useRef, useState } from "react";
import { Play, Pause, SkipForward, SkipBack, Music2, Volume2 } from "lucide-react";

/**
 * Calming Music Widget — chill / college-vibes playlist.
 * Streams royalty-free / CC tracks curated to the requested vibe
 * (Alina Baraz / Clara La San style ambient R&B & lo-fi).
 *
 * Note: full commercial tracks can't be auto-played here, so we
 * surface the curated playlist with vibe-matched ambient streams
 * + a deep-link to the full Spotify/YouTube playlist for the artists.
 */

const PLAYLIST = [
  {
    title: "Drown — Alina Baraz vibe",
    artist: "Ambient R&B · Lo-fi",
    mood: "Soft · Floaty",
    src: "https://cdn.pixabay.com/audio/2024/03/07/audio_07b4d63ea4.mp3",
  },
  {
    title: "Fall Into Me — Clara La San vibe",
    artist: "Slow R&B · Late Night",
    mood: "Dreamy · Warm",
    src: "https://cdn.pixabay.com/audio/2023/06/19/audio_2c44b66d11.mp3",
  },
  {
    title: "Campus Walk — Lo-fi Beats",
    artist: "College Vibes · Chillhop",
    mood: "Focused · Calm",
    src: "https://cdn.pixabay.com/audio/2022/10/30/audio_347bbb3c81.mp3",
  },
  {
    title: "Golden Hour — Bedroom R&B",
    artist: "Indie · Mellow Soul",
    mood: "Soothing · Hopeful",
    src: "https://cdn.pixabay.com/audio/2023/10/26/audio_07c4ce23f5.mp3",
  },
  {
    title: "Late Night Study — Soft Piano",
    artist: "Chill · Reflective",
    mood: "Healing · Quiet",
    src: "https://cdn.pixabay.com/audio/2022/03/15/audio_67b067e3d3.mp3",
  },
];

const FULL_PLAYLIST_URL = "https://open.spotify.com/search/alina%20baraz%20clara%20la%20san%20chill";

export default function CalmingMusicWidget() {
  const audioRef = useRef(null);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const track = PLAYLIST[idx];

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) a.play().catch(() => setPlaying(false));
    else a.pause();
  }, [playing, idx]);

  const next = () => { setIdx((idx + 1) % PLAYLIST.length); setPlaying(true); };
  const prev = () => { setIdx((idx - 1 + PLAYLIST.length) % PLAYLIST.length); setPlaying(true); };

  const onTime = () => {
    const a = audioRef.current;
    if (!a || !a.duration) return;
    setProgress((a.currentTime / a.duration) * 100);
  };

  return (
    <div style={{
      position: "relative",
      background: "linear-gradient(135deg, rgba(91,141,239,0.12), rgba(167,139,250,0.10))",
      border: "1px solid var(--border-glow)",
      borderRadius: 22,
      padding: "18px",
      overflow: "hidden",
      backdropFilter: "blur(18px) saturate(160%)",
      WebkitBackdropFilter: "blur(18px) saturate(160%)",
      boxShadow: "var(--glow), var(--shadow-card)",
      marginBottom: 24,
    }}>
      {/* Ambient glow */}
      <div aria-hidden style={{
        position: "absolute", top: -40, right: -40, width: 180, height: 180,
        borderRadius: "50%",
        background: "radial-gradient(circle, var(--purple) 0%, transparent 70%)",
        opacity: 0.35, filter: "blur(20px)", pointerEvents: "none",
      }} />

      <div style={{ display: "flex", alignItems: "center", gap: 14, position: "relative", zIndex: 1 }}>
        {/* Animated cover */}
        <div style={{
          width: 64, height: 64, borderRadius: 16, flexShrink: 0,
          background: "linear-gradient(135deg, var(--accent), var(--purple))",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "var(--glow)",
          animation: playing ? "musicSpin 8s linear infinite" : "none",
        }}>
          <Music2 style={{ width: 26, height: 26, color: "#fff" }} strokeWidth={2} />
        </div>

        {/* Title + artist */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: 10, fontWeight: 800, color: "var(--accent)",
            textTransform: "uppercase", letterSpacing: ".14em", marginBottom: 3,
            fontFamily: "'Space Grotesk', 'DM Sans', sans-serif",
          }}>Calming Music · Now Playing</p>
          <p style={{
            fontSize: 15, fontWeight: 700, color: "var(--text)", lineHeight: 1.25,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>{track.title}</p>
          <p style={{
            fontSize: 12, color: "var(--text-muted)", marginTop: 2,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>{track.artist} · {track.mood}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{
        position: "relative", height: 4, borderRadius: 999,
        background: "var(--surface)", marginTop: 14, overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0, width: `${progress}%`,
          background: "linear-gradient(90deg, var(--accent), var(--purple))",
          borderRadius: 999, transition: "width .25s linear",
          boxShadow: "0 0 10px var(--accent)",
        }} />
      </div>

      {/* Controls */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginTop: 14, gap: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <CtrlBtn onClick={prev} ariaLabel="Previous">
            <SkipBack style={{ width: 16, height: 16 }} />
          </CtrlBtn>
          <CtrlBtn primary onClick={() => setPlaying(p => !p)} ariaLabel={playing ? "Pause" : "Play"}>
            {playing
              ? <Pause style={{ width: 18, height: 18 }} fill="currentColor" />
              : <Play  style={{ width: 18, height: 18 }} fill="currentColor" />}
          </CtrlBtn>
          <CtrlBtn onClick={next} ariaLabel="Next">
            <SkipForward style={{ width: 16, height: 16 }} />
          </CtrlBtn>
        </div>

        <a href={FULL_PLAYLIST_URL} target="_blank" rel="noopener noreferrer" style={{
          textDecoration: "none",
          display: "inline-flex", alignItems: "center", gap: 6,
          fontSize: 11.5, fontWeight: 700, color: "var(--accent)",
          padding: "7px 12px", borderRadius: 999,
          background: "var(--navy-dim)",
          border: "1px solid var(--border-glow)",
        }}>
          <Volume2 style={{ width: 12, height: 12 }} /> Full Playlist
        </a>
      </div>

      {/* Track list (compact) */}
      <div style={{
        marginTop: 12, display: "flex", flexWrap: "wrap", gap: 6,
        position: "relative", zIndex: 1,
      }}>
        {PLAYLIST.map((t, i) => {
          const active = i === idx;
          return (
            <button key={t.title} onClick={() => { setIdx(i); setPlaying(true); }}
              style={{
                fontSize: 10.5, fontWeight: 600,
                padding: "4px 10px", borderRadius: 999,
                background: active ? "linear-gradient(135deg, var(--accent), var(--purple))" : "var(--surface)",
                color: active ? "#fff" : "var(--text-muted)",
                border: `1px solid ${active ? "transparent" : "var(--border)"}`,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                boxShadow: active ? "var(--glow)" : "none",
                transition: "all .18s",
              }}>
              {t.title.split(" — ")[0]}
            </button>
          );
        })}
      </div>

      <audio
        ref={audioRef}
        src={track.src}
        onTimeUpdate={onTime}
        onEnded={next}
        preload="none"
      />

      <style>{`
        @keyframes musicSpin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function CtrlBtn({ children, onClick, primary, ariaLabel }) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      style={{
        width: primary ? 44 : 36,
        height: primary ? 44 : 36,
        borderRadius: "50%",
        border: "none",
        cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: primary
          ? "linear-gradient(135deg, var(--accent), var(--purple))"
          : "var(--surface)",
        color: primary ? "#fff" : "var(--text)",
        boxShadow: primary ? "var(--glow)" : "none",
        backdropFilter: "blur(10px)",
        transition: "transform .15s, filter .2s",
      }}
      onMouseDown={(e) => e.currentTarget.style.transform = "scale(.94)"}
      onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
    >
      {children}
    </button>
  );
}