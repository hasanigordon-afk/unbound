import React, { useState } from "react";
import { Play, Pause, SkipForward, SkipBack, Music as MusicIcon } from "lucide-react";

const PLAYLISTS = [
  {
    id: "calm",
    title: "Calm & Peaceful",
    emoji: "🌿",
    color: "#10B981",
    desc: "Gentle ambient music to quiet a racing mind.",
    tracks: [
      { title: "Morning Forest", artist: "Ambient Nature", duration: "4:20" },
      { title: "Still Water", artist: "Meditation Collective", duration: "5:10" },
      { title: "Soft Horizon", artist: "Peaceful Sounds", duration: "3:45" },
      { title: "Breathe Easy", artist: "Nature Tones", duration: "6:02" },
    ],
  },
  {
    id: "focus",
    title: "Focus Mode",
    emoji: "🎯",
    color: "#3B82F6",
    desc: "Low-distraction music to help you stay present.",
    tracks: [
      { title: "Deep Flow", artist: "Concentration Lab", duration: "7:30" },
      { title: "Clear Mind", artist: "Alpha Waves", duration: "5:55" },
      { title: "Steady Ground", artist: "Focus Studio", duration: "4:40" },
      { title: "Present Moment", artist: "Mindful Beats", duration: "6:15" },
    ],
  },
  {
    id: "relax",
    title: "Relaxation",
    emoji: "🌊",
    color: "#8B5CF6",
    desc: "Immersive soundscapes for full-body relaxation.",
    tracks: [
      { title: "Ocean at Dusk", artist: "Coastal Dreams", duration: "8:10" },
      { title: "Rain on Leaves", artist: "Nature Sounds", duration: "9:00" },
      { title: "Deep Valley", artist: "Soundscape Studio", duration: "5:30" },
      { title: "Warm Evening", artist: "Ambient Rest", duration: "7:20" },
    ],
  },
];

export default function CccMusic() {
  const [activePlaylist, setActivePlaylist] = useState(null);
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const openPlaylist = (p) => {
    setActivePlaylist(p);
    setTrackIndex(0);
    setIsPlaying(false);
  };

  if (activePlaylist) {
    const track = activePlaylist.tracks[trackIndex];
    return (
      <div>
        <button onClick={() => setActivePlaylist(null)} style={{ color: "#5A7A9A", fontSize: 13, background: "none", border: "none", cursor: "pointer", marginBottom: 20, padding: 0, fontWeight: 600 }}>
          ← All Playlists
        </button>

        <div style={{ background: `linear-gradient(135deg, ${activePlaylist.color}20, ${activePlaylist.color}08)`, border: `1px solid ${activePlaylist.color}30`, borderRadius: 20, padding: "28px 24px", textAlign: "center", marginBottom: 20 }}>
          <span style={{ fontSize: 40 }}>{activePlaylist.emoji}</span>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1E3A5F", margin: "10px 0 4px" }}>{activePlaylist.title}</h3>
          <p style={{ color: "#5A7A9A", fontSize: 13, marginBottom: 20 }}>{track.artist}</p>

          <div style={{ background: "#FFFFFF", borderRadius: 50, padding: "6px 20px", display: "inline-block", marginBottom: 20 }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: "#1E293B" }}>{track.title}</p>
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ height: 4, background: "#E2E8F0", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ width: isPlaying ? "45%" : "0%", height: "100%", background: activePlaylist.color, transition: "width 0.5s" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94A3B8", marginTop: 4 }}>
              <span>0:00</span>
              <span>{track.duration}</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20 }}>
            <button onClick={() => setTrackIndex(i => Math.max(0, i - 1))} style={{ background: "none", border: "none", cursor: "pointer" }}>
              <SkipBack className="w-6 h-6" style={{ color: "#475569" }} />
            </button>
            <button
              onClick={() => setIsPlaying(p => !p)}
              style={{ width: 56, height: 56, borderRadius: "50%", background: activePlaylist.color, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              {isPlaying
                ? <Pause className="w-6 h-6" style={{ color: "#FFF" }} />
                : <Play className="w-6 h-6" style={{ color: "#FFF", marginLeft: 3 }} />
              }
            </button>
            <button onClick={() => setTrackIndex(i => Math.min(activePlaylist.tracks.length - 1, i + 1))} style={{ background: "none", border: "none", cursor: "pointer" }}>
              <SkipForward className="w-6 h-6" style={{ color: "#475569" }} />
            </button>
          </div>

          {isPlaying && (
            <p style={{ color: activePlaylist.color, fontSize: 12, marginTop: 12, fontWeight: 600 }}>▶ Now playing — take a breath and let go</p>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {activePlaylist.tracks.map((t, i) => (
            <button
              key={i}
              onClick={() => { setTrackIndex(i); setIsPlaying(true); }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 16px",
                borderRadius: 12,
                border: `1px solid ${i === trackIndex ? `${activePlaylist.color}40` : "#E2E8F0"}`,
                background: i === trackIndex ? `${activePlaylist.color}10` : "#FFFFFF",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <MusicIcon className="w-4 h-4 flex-shrink-0" style={{ color: i === trackIndex ? activePlaylist.color : "#94A3B8" }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: i === trackIndex ? 700 : 500, color: "#1E293B" }}>{t.title}</p>
                <p style={{ fontSize: 12, color: "#94A3B8" }}>{t.artist}</p>
              </div>
              <span style={{ fontSize: 12, color: "#94A3B8" }}>{t.duration}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1E3A5F", marginBottom: 4 }}>Music</h2>
      <p style={{ color: "#5A7A9A", fontSize: 14, marginBottom: 24 }}>Calming playlists for every moment in recovery.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {PLAYLISTS.map(p => (
          <button
            key={p.id}
            onClick={() => openPlaylist(p)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "20px",
              borderRadius: 16,
              border: `1px solid ${p.color}25`,
              background: "#FFFFFF",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <div style={{ width: 52, height: 52, borderRadius: 14, background: `${p.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>
              {p.emoji}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: 16, color: "#1E293B", marginBottom: 3 }}>{p.title}</p>
              <p style={{ fontSize: 13, color: "#64748B" }}>{p.desc}</p>
              <p style={{ fontSize: 11, color: "#94A3B8", marginTop: 4 }}>{p.tracks.length} tracks</p>
            </div>
            <Play className="w-5 h-5" style={{ color: p.color, flexShrink: 0 }} />
          </button>
        ))}
      </div>

      <div style={{ marginTop: 20, padding: "14px 16px", background: "#F8FAFC", borderRadius: 12, border: "1px solid #E2E8F0" }}>
        <p style={{ fontSize: 12, color: "#64748B", textAlign: "center" }}>
          🎧 For the best experience, use headphones in a quiet space.
        </p>
      </div>
    </div>
  );
}