import React, { useState, useRef } from "react";
import { Play, Pause, Headphones } from "lucide-react";

const TRACKS = [
  {
    id: "relax",
    title: "Deep Relaxation",
    freq: "Alpha • 8–12 Hz",
    duration: "20 min",
    color: "#10B981",
    emoji: "🌿",
    desc: "Gently eases muscle tension and mental chatter. Best for winding down.",
    benefit: "Reduces stress, promotes calm alertness",
  },
  {
    id: "anxiety",
    title: "Anxiety Relief",
    freq: "Theta • 4–7 Hz",
    duration: "15 min",
    color: "#3B82F6",
    emoji: "🌊",
    desc: "Deep theta waves to settle anxiety and emotional overwhelm.",
    benefit: "Calms the nervous system, reduces fear response",
  },
  {
    id: "sleep",
    title: "Deep Sleep",
    freq: "Delta • 0.5–4 Hz",
    duration: "30 min",
    color: "#6366F1",
    emoji: "🌙",
    desc: "Slow delta waves to ease you into restorative sleep.",
    benefit: "Improves sleep onset, reduces insomnia",
  },
  {
    id: "focus",
    title: "Sharp Focus",
    freq: "Beta • 13–30 Hz",
    duration: "25 min",
    color: "#F59E0B",
    emoji: "🎯",
    desc: "Stimulates alert, focused thinking without anxiety.",
    benefit: "Improves concentration and mental clarity",
  },
];

export default function CccBinaural() {
  const [playing, setPlaying] = useState(null);
  const [elapsed, setElapsed] = useState({});
  const timerRefs = React.useRef({});

  const togglePlay = (id) => {
    if (playing === id) {
      setPlaying(null);
      clearInterval(timerRefs.current[id]);
    } else {
      if (playing) clearInterval(timerRefs.current[playing]);
      setPlaying(id);
      if (!elapsed[id]) setElapsed(e => ({ ...e, [id]: 0 }));
      timerRefs.current[id] = setInterval(() => {
        setElapsed(e => ({ ...e, [id]: (e[id] || 0) + 1 }));
      }, 1000);
    }
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1E3A5F", marginBottom: 4 }}>Binaural Beats</h2>
      <p style={{ color: "#5A7A9A", fontSize: 14, marginBottom: 16 }}>Audio designed to shift your brain state. Use when you need a reset.</p>

      <div style={{ background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 14, padding: "14px 16px", marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
        <Headphones className="w-5 h-5 flex-shrink-0" style={{ color: "#D97706" }} />
        <p style={{ fontSize: 13, color: "#92400E", lineHeight: 1.5 }}>
          <strong>Headphones recommended.</strong> Binaural beats only work when each ear hears a slightly different frequency.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {TRACKS.map(t => {
          const isPlaying = playing === t.id;
          const secs = elapsed[t.id] || 0;
          return (
            <div
              key={t.id}
              style={{
                background: "#FFFFFF",
                border: `1px solid ${isPlaying ? t.color + "40" : "#E2E8F0"}`,
                borderRadius: 16,
                padding: "20px",
                boxShadow: isPlaying ? `0 0 0 3px ${t.color}15` : "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: isPlaying ? 16 : 0 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: `${t.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                  {t.emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: 15, color: "#1E293B", marginBottom: 2 }}>{t.title}</p>
                  <p style={{ fontSize: 12, color: t.color, fontWeight: 600, marginBottom: 4 }}>{t.freq}</p>
                  <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.5 }}>{t.desc}</p>
                  <p style={{ fontSize: 11, color: "#94A3B8", marginTop: 4 }}>✓ {t.benefit}</p>
                </div>
                <div style={{ flexShrink: 0, textAlign: "right" }}>
                  <button
                    onClick={() => togglePlay(t.id)}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      background: isPlaying ? t.color : `${t.color}15`,
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {isPlaying
                      ? <Pause className="w-5 h-5" style={{ color: "#FFF" }} />
                      : <Play className="w-5 h-5" style={{ color: t.color, marginLeft: 2 }} />
                    }
                  </button>
                  <p style={{ fontSize: 11, color: "#94A3B8", marginTop: 4 }}>{t.duration}</p>
                </div>
              </div>

              {isPlaying && (
                <div>
                  <div style={{ height: 3, background: "#E2E8F0", borderRadius: 2, overflow: "hidden", marginBottom: 8 }}>
                    <div style={{ width: `${(secs / (parseInt(t.duration) * 60)) * 100}%`, maxWidth: "100%", height: "100%", background: t.color, transition: "width 1s linear" }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94A3B8" }}>
                    <span>{formatTime(secs)} elapsed</span>
                    <span style={{ color: t.color, fontWeight: 600 }}>● Playing</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}