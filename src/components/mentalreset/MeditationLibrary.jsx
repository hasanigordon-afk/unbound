import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, X, Heart } from "lucide-react";

const MEDITATIONS = [
  {
    id: "urge",
    title: "Urge Surfing",
    emoji: "🌊",
    duration: "5 min",
    durationSec: 300,
    color: "#F97316",
    tag: "For Cravings",
    script: [
      "Close your eyes and notice where you feel the urge in your body.",
      "Don't fight it. Imagine the craving as a wave in the ocean.",
      "You are standing on the shore. The wave builds, peaks, then fades.",
      "The craving doesn't control you. You can ride it out.",
      "Breathe slowly. The wave is already starting to shrink.",
      "You are safe on the shore. You don't have to act on this feeling.",
      "Every time you surf the urge, you grow stronger.",
    ],
  },
  {
    id: "letitpass",
    title: "Let It Pass",
    emoji: "🍂",
    duration: "3 min",
    durationSec: 180,
    color: "#A78BFA",
    tag: "For Anxiety",
    script: [
      "Breathe in slowly through your nose. Hold it for a moment.",
      "This feeling is temporary. It will pass, just like all the others have.",
      "You don't need to solve anything right now. Just breathe.",
      "Let the thought float by like a cloud. You notice it, but you let it go.",
      "You are not your anxiety. You are the sky. Anxiety is just weather.",
    ],
  },
  {
    id: "reset",
    title: "Reset Your Mind",
    emoji: "🔄",
    duration: "4 min",
    durationSec: 240,
    color: "#3ECFBF",
    tag: "Daily Reset",
    script: [
      "Take a slow, deep breath. This is a fresh start.",
      "Everything that happened before this moment stays in the past.",
      "You have the power to begin again, right now.",
      "Let your shoulders drop. Unclench your jaw. Release tension from your hands.",
      "Your mind is clearing. Your body is relaxing.",
      "You are present. You are safe. You are enough.",
    ],
  },
  {
    id: "forgiveness",
    title: "Forgiveness & Self Worth",
    emoji: "💜",
    duration: "7 min",
    durationSec: 420,
    color: "#F472B6",
    tag: "Healing",
    script: [
      "You deserve to be here. Right now, exactly as you are.",
      "You've carried a lot. Give yourself permission to put some of it down.",
      "The mistakes you've made do not define you. You are more than your worst moments.",
      "Forgive yourself — not because it was okay, but because carrying guilt is too heavy.",
      "You are worthy of love. You are worthy of healing. You are worthy of a second chance.",
      "Take a deep breath and let compassion fill your chest like warm light.",
      "You are not alone in this. Millions of people have stood where you stand and found their way.",
    ],
  },
  {
    id: "startover",
    title: "Start Over Today",
    emoji: "🌅",
    duration: "2 min",
    durationSec: 120,
    color: "#C9A96E",
    tag: "Morning",
    script: [
      "Today is not yesterday. You don't have to carry what happened before.",
      "Right now, in this breath, you are beginning again.",
      "What small step can you take today? Just one. That's enough.",
      "You are someone worth believing in. Start there.",
    ],
  },
];

export default function MeditationLibrary() {
  const [active, setActive] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [lineIdx, setLineIdx] = useState(0);
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem("mr_fav_med") || "[]"); } catch { return []; }
  });
  const intervalRef = useRef(null);
  const elapsedRef = useRef(0);

  const meditation = active ? MEDITATIONS.find(m => m.id === active) : null;

  const stop = () => {
    clearInterval(intervalRef.current);
    setPlaying(false);
    setElapsed(0);
    setLineIdx(0);
    elapsedRef.current = 0;
  };

  const startPlay = () => {
    if (!meditation) return;
    stop();
    setPlaying(true);
    const lineInterval = meditation.durationSec / meditation.script.length;
    intervalRef.current = setInterval(() => {
      elapsedRef.current += 1;
      setElapsed(e => e + 1);
      const newLine = Math.floor(elapsedRef.current / lineInterval);
      setLineIdx(Math.min(newLine, meditation.script.length - 1));
      if (elapsedRef.current >= meditation.durationSec) {
        clearInterval(intervalRef.current);
        setPlaying(false);
      }
    }, 1000);
  };

  const toggleFav = (id) => {
    const updated = favorites.includes(id) ? favorites.filter(f => f !== id) : [...favorites, id];
    setFavorites(updated);
    localStorage.setItem("mr_fav_med", JSON.stringify(updated));
  };

  useEffect(() => () => clearInterval(intervalRef.current), []);

  if (active && meditation) {
    const progress = elapsed / meditation.durationSec;
    return (
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        {/* Player */}
        <div style={{
          borderRadius: 24, padding: "28px 24px",
          background: `linear-gradient(150deg,rgba(${meditation.color === "#F97316" ? "249,115,22" : meditation.color === "#A78BFA" ? "167,139,250" : meditation.color === "#3ECFBF" ? "62,207,191" : meditation.color === "#F472B6" ? "244,114,182" : "201,169,110"},0.1) 0%,transparent 100%)`,
          border: `1px solid ${meditation.color}30`,
          marginBottom: 20,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: meditation.color, textTransform: "uppercase",
                letterSpacing: ".08em", marginBottom: 4 }}>{meditation.tag}</p>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: "#fff" }}>{meditation.title}</h2>
            </div>
            <button onClick={() => { stop(); setActive(null); }} style={{
              background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "50%",
              width: 36, height: 36, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <X style={{ width: 14, height: 14, color: "rgba(255,255,255,0.5)" }} />
            </button>
          </div>

          {/* Progress */}
          <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 4, height: 4, marginBottom: 12, overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 4, width: `${progress * 100}%`,
              background: `linear-gradient(90deg,${meditation.color},${meditation.color}aa)`,
              transition: "width 1s linear" }} />
          </div>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 28 }}>
            {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")} / {meditation.duration}
          </p>

          {/* Script line */}
          <div style={{ minHeight: 80, display: "flex", alignItems: "center", justifyContent: "center",
            textAlign: "center", marginBottom: 28 }}>
            <p style={{ fontSize: 18, color: "#fff", lineHeight: 1.65, fontStyle: "italic",
              opacity: playing ? 1 : 0.5 }}>
              "{meditation.script[lineIdx]}"
            </p>
          </div>

          {/* Play/Pause */}
          <button onClick={playing ? () => { clearInterval(intervalRef.current); setPlaying(false); } : startPlay}
            style={{
              width: "100%", padding: "16px", borderRadius: 16, cursor: "pointer", border: "none",
              background: `linear-gradient(135deg,${meditation.color},${meditation.color}bb)`,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            }}>
            {playing
              ? <><Pause style={{ width: 18, height: 18, color: "#000" }} /><span style={{ fontSize: 15, fontWeight: 800, color: "#000" }}>Pause</span></>
              : <><Play style={{ width: 18, height: 18, color: "#000" }} /><span style={{ fontSize: 15, fontWeight: 800, color: "#000" }}>{elapsed > 0 ? "Resume" : "Begin"}</span></>
            }
          </button>
        </div>

        {/* Dots navigator */}
        <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
          {meditation.script.map((_, i) => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: "50%",
              background: i <= lineIdx ? meditation.color : "rgba(255,255,255,0.1)",
              transition: "background 0.3s ease",
            }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase",
        letterSpacing: "1px", marginBottom: 14 }}>Guided Meditations</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {MEDITATIONS.map(m => {
          const isFav = favorites.includes(m.id);
          return (
            <div key={m.id} style={{
              display: "flex", alignItems: "center", gap: 14, padding: "16px 16px",
              borderRadius: 18, background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)", cursor: "pointer",
            }} onClick={() => setActive(m.id)}>
              <span style={{ fontSize: 30, flexShrink: 0 }}>{m.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                  <p style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{m.title}</p>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                    background: `${m.color}20`, color: m.color }}>{m.tag}</span>
                </div>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{m.duration}</p>
              </div>
              <button onClick={e => { e.stopPropagation(); toggleFav(m.id); }} style={{
                background: "none", border: "none", cursor: "pointer", padding: 6,
              }}>
                <Heart style={{ width: 16, height: 16, color: isFav ? "#F472B6" : "rgba(255,255,255,0.2)",
                  fill: isFav ? "#F472B6" : "none" }} />
              </button>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${m.color}20`,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Play style={{ width: 14, height: 14, color: m.color }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}