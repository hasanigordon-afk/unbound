import React, { useState } from "react";
import { Music, Play, Pause, SkipForward, SkipBack, ExternalLink } from "lucide-react";

const PLAYLISTS = [
  {
    id: "calm", name: "Calm & Peaceful", emoji: "🌿", color: "#2E7D5E", bg: "#E8F5E9", border: "#A7F3D0",
    desc: "Gentle ambient music to quiet the mind.",
    tracks: [
      { name: "Weightless", artist: "Marconi Union", url: "https://open.spotify.com/track/0t4mSXHDCM0BMoXbJlbfPM" },
      { name: "Claire de Lune", artist: "Debussy", url: "https://open.spotify.com/search/clair%20de%20lune%20debussy" },
      { name: "Peace", artist: "Brian Eno", url: "https://open.spotify.com/search/brian%20eno%20ambient" },
    ],
  },
  {
    id: "focus", name: "Focus & Clarity", emoji: "🎯", color: "#4F46E5", bg: "#EEF2FF", border: "#C7D2FE",
    desc: "Deep focus music to stay present and productive.",
    tracks: [
      { name: "Study Beats", artist: "Lo-Fi Collection", url: "https://open.spotify.com/search/lofi%20study%20beats" },
      { name: "Alpha Waves", artist: "Brainwave Music", url: "https://open.spotify.com/search/alpha%20waves%20focus" },
      { name: "Focus Flow", artist: "Spotify Focus", url: "https://open.spotify.com/search/focus%20flow%20playlist" },
    ],
  },
  {
    id: "sleep", name: "Sleep & Rest", emoji: "🌙", color: "#6D28D9", bg: "#F5F3FF", border: "#DDD6FE",
    desc: "Peaceful soundscapes for rest and sleep.",
    tracks: [
      { name: "Rain on Leaves", artist: "Nature Sounds", url: "https://open.spotify.com/search/rain%20sounds%20sleep" },
      { name: "Ocean Waves", artist: "Relaxing Sounds", url: "https://open.spotify.com/search/ocean%20waves%20relaxing" },
      { name: "Deep Sleep Music", artist: "Sleep Aid", url: "https://open.spotify.com/search/deep%20sleep%20music" },
    ],
  },
  {
    id: "uplift", name: "Uplifting & Hope", emoji: "☀️", color: "#B45309", bg: "#FFFBEB", border: "#FDE68A",
    desc: "Positive music to restore hope and energy.",
    tracks: [
      { name: "Here Comes the Sun", artist: "The Beatles", url: "https://open.spotify.com/search/here%20comes%20the%20sun" },
      { name: "Three Little Birds", artist: "Bob Marley", url: "https://open.spotify.com/search/three%20little%20birds%20bob%20marley" },
      { name: "Don't Stop Believing", artist: "Journey", url: "https://open.spotify.com/search/dont%20stop%20believing" },
    ],
  },
];

export default function MusicSection() {
  const [active, setActive] = useState(null);
  const [trackIdx, setTrackIdx] = useState(0);

  const currentPlaylist = PLAYLISTS.find(p => p.id === active);
  const currentTrack = currentPlaylist?.tracks[trackIdx];

  return (
    <div style={{ padding: "24px 20px", maxWidth: 560, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 42, marginBottom: 8 }}>🎵</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#1A3C2E", marginBottom: 4 }}>Music Therapy</h2>
        <p style={{ fontSize: 14, color: "#6B7280" }}>Music is medicine. Choose what your soul needs right now.</p>
      </div>

      {active && currentPlaylist && (
        <div style={{ background: currentPlaylist.bg, border: `1px solid ${currentPlaylist.border}`, borderRadius: 20, padding: "20px", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <span style={{ fontSize: 28 }}>{currentPlaylist.emoji}</span>
            <div>
              <p style={{ fontWeight: 700, fontSize: 15, color: "#1A3C2E" }}>Now Playing</p>
              <p style={{ fontSize: 13, color: "#6B7280" }}>{currentPlaylist.name}</p>
            </div>
          </div>
          <div style={{ background: "#FFF", borderRadius: 14, padding: "14px 16px", marginBottom: 14, textAlign: "center" }}>
            <p style={{ fontWeight: 700, fontSize: 16, color: "#1A3C2E", marginBottom: 2 }}>{currentTrack?.name}</p>
            <p style={{ fontSize: 13, color: "#9CA3AF" }}>{currentTrack?.artist}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 14 }}>
            <button onClick={() => setTrackIdx(i => Math.max(0, i - 1))} style={{ background: "#FFF", border: "none", borderRadius: 50, width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <SkipBack className="w-5 h-5" style={{ color: currentPlaylist.color }} />
            </button>
            <a href={currentTrack?.url} target="_blank" rel="noopener noreferrer" style={{ background: currentPlaylist.color, borderRadius: 50, width: 54, height: 54, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
              <Play className="w-6 h-6" style={{ color: "#FFF" }} />
            </a>
            <button onClick={() => setTrackIdx(i => Math.min(currentPlaylist.tracks.length - 1, i + 1))} style={{ background: "#FFF", border: "none", borderRadius: 50, width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <SkipForward className="w-5 h-5" style={{ color: currentPlaylist.color }} />
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {currentPlaylist.tracks.map((t, i) => (
              <button key={i} onClick={() => setTrackIdx(i)} style={{ display: "flex", alignItems: "center", gap: 10, background: trackIdx === i ? "#FFF" : "transparent", border: "none", borderRadius: 10, padding: "8px 10px", cursor: "pointer", textAlign: "left" }}>
                <div style={{ width: 24, height: 24, borderRadius: 6, background: trackIdx === i ? currentPlaylist.color : "#E5E7EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {trackIdx === i ? <Play className="w-3 h-3" style={{ color: "#FFF" }} /> : <span style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF" }}>{i + 1}</span>}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: trackIdx === i ? 700 : 500, color: "#1A3C2E" }}>{t.name}</p>
                  <p style={{ fontSize: 11, color: "#9CA3AF" }}>{t.artist}</p>
                </div>
              </button>
            ))}
          </div>
          <button onClick={() => { setActive(null); setTrackIdx(0); }} style={{ marginTop: 12, width: "100%", background: "none", border: "1px solid #E5E7EB", borderRadius: 10, padding: "9px", fontSize: 13, color: "#6B7280", cursor: "pointer" }}>
            Back to Playlists
          </button>
        </div>
      )}

      {!active && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {PLAYLISTS.map(p => (
            <button key={p.id} onClick={() => { setActive(p.id); setTrackIdx(0); }} style={{ background: p.bg, border: `1px solid ${p.border}`, borderRadius: 18, padding: "18px 20px", textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: 16 }}>
              <span style={{ fontSize: 30, flexShrink: 0 }}>{p.emoji}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, fontSize: 15, color: "#1A3C2E", marginBottom: 2 }}>{p.name}</p>
                <p style={{ fontSize: 13, color: "#6B7280" }}>{p.desc}</p>
              </div>
              <Play className="w-5 h-5" style={{ color: p.color }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}