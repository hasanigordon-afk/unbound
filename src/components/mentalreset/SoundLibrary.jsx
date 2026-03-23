import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";

// Pure Web Audio API tones — no external files needed
const BINAURAL = [
  { id: "anxiety",  title: "Anxiety Relief",    freq: 10,  color: "#A78BFA", emoji: "🌫️", desc: "Alpha waves · 10Hz · Calming" },
  { id: "craving",  title: "Craving Control",   freq: 40,  color: "#F97316", emoji: "🛡️", desc: "Gamma · 40Hz · Focus & willpower" },
  { id: "sleep",    title: "Sleep & Insomnia",  freq: 3,   color: "#60A5FA", emoji: "🌙", desc: "Delta waves · 3Hz · Deep rest" },
  { id: "focus",    title: "Focus & Clarity",   freq: 14,  color: "#3ECFBF", emoji: "🎯", desc: "Beta · 14Hz · Mental clarity" },
  { id: "healing",  title: "Emotional Healing", freq: 7,   color: "#F472B6", emoji: "💜", desc: "Theta · 7Hz · Healing" },
];

const AMBIENT = [
  { id: "rain",      title: "Rain",           emoji: "🌧️", color: "#60A5FA", type: "noise", noiseColor: 0.3  },
  { id: "ocean",     title: "Ocean Waves",    emoji: "🌊", color: "#06B6D4", type: "noise", noiseColor: 0.15 },
  { id: "forest",    title: "Forest",         emoji: "🌲", color: "#34D399", type: "noise", noiseColor: 0.2  },
  { id: "fire",      title: "Fireplace",      emoji: "🔥", color: "#F97316", type: "noise", noiseColor: 0.25 },
  { id: "white",     title: "White Noise",    emoji: "〰️", color: "#94A3B8", type: "noise", noiseColor: 1.0  },
];

function useAudioEngine() {
  const ctxRef = useRef(null);
  const nodesRef = useRef({});

  const getCtx = () => {
    if (!ctxRef.current) ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    if (ctxRef.current.state === "suspended") ctxRef.current.resume();
    return ctxRef.current;
  };

  const playBinaural = (id, freq) => {
    const ctx = getCtx();
    stopTrack(id);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 1);
    gain.connect(ctx.destination);

    const left = ctx.createOscillator();
    const right = ctx.createOscillator();
    const baseFreq = 200;
    left.frequency.value = baseFreq;
    right.frequency.value = baseFreq + freq;
    left.type = "sine"; right.type = "sine";

    const merger = ctx.createChannelMerger(2);
    left.connect(merger, 0, 0);
    right.connect(merger, 0, 1);
    merger.connect(gain);
    left.start(); right.start();

    nodesRef.current[id] = { gain, nodes: [left, right, merger] };
  };

  const playAmbient = (id, noiseColor) => {
    const ctx = getCtx();
    stopTrack(id);
    const bufferSize = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + noiseColor * white) / (1 + noiseColor);
      lastOut = data[i];
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 1);
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start();
    nodesRef.current[id] = { gain, nodes: [source] };
  };

  const stopTrack = (id) => {
    const track = nodesRef.current[id];
    if (!track) return;
    try {
      track.gain.gain.linearRampToValueAtTime(0, ctxRef.current.currentTime + 0.5);
      setTimeout(() => {
        track.nodes.forEach(n => { try { n.stop?.(); n.disconnect?.(); } catch(_) {} });
      }, 600);
    } catch(_) {}
    delete nodesRef.current[id];
  };

  const stopAll = () => {
    Object.keys(nodesRef.current).forEach(stopTrack);
  };

  useEffect(() => () => stopAll(), []);
  return { playBinaural, playAmbient, stopTrack };
}

export default function SoundLibrary() {
  const [playing, setPlaying] = useState({});
  const [tab, setTab] = useState("binaural");
  const [looping] = useState(true);
  const { playBinaural, playAmbient, stopTrack } = useAudioEngine();

  const toggle = (item) => {
    if (playing[item.id]) {
      stopTrack(item.id);
      setPlaying(p => { const n = { ...p }; delete n[item.id]; return n; });
    } else {
      if (item.freq !== undefined) playBinaural(item.id, item.freq);
      else playAmbient(item.id, item.noiseColor);
      setPlaying(p => ({ ...p, [item.id]: true }));
    }
  };

  const items = tab === "binaural" ? BINAURAL : AMBIENT;

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["binaural", "ambient"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: "10px", borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: "pointer",
            background: tab === t ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.04)",
            color: tab === t ? "#A78BFA" : "rgba(255,255,255,0.4)",
            border: `1px solid ${tab === t ? "rgba(139,92,246,0.4)" : "rgba(255,255,255,0.07)"}`,
          }}>
            {t === "binaural" ? "🎧 Binaural Beats" : "🌿 Ambient Sounds"}
          </button>
        ))}
      </div>

      {tab === "binaural" && (
        <div style={{ marginBottom: 14, padding: "10px 14px", borderRadius: 12,
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", lineHeight: 1.5 }}>
            🎧 Use headphones for full effect. Binaural beats work by playing slightly different frequencies in each ear.
          </p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map(item => {
          const isPlaying = !!playing[item.id];
          return (
            <div key={item.id} style={{
              display: "flex", alignItems: "center", gap: 14, padding: "16px 16px",
              borderRadius: 16,
              background: isPlaying ? `rgba(${item.color === "#A78BFA" ? "167,139,250" : item.color === "#60A5FA" ? "96,165,250" : item.color === "#3ECFBF" ? "62,207,191" : item.color === "#F97316" ? "249,115,22" : item.color === "#F472B6" ? "244,114,182" : item.color === "#34D399" ? "52,211,153" : item.color === "#06B6D4" ? "6,182,212" : "148,163,184"},0.1)` : "rgba(255,255,255,0.04)",
              border: `1px solid ${isPlaying ? item.color + "40" : "rgba(255,255,255,0.07)"}`,
              transition: "all 0.2s ease",
            }}>
              <span style={{ fontSize: 28, flexShrink: 0 }}>{item.emoji}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: isPlaying ? item.color : "#fff", marginBottom: 2 }}>
                  {item.title}
                </p>
                {item.desc && <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{item.desc}</p>}
              </div>
              {isPlaying && (
                <div style={{ display: "flex", gap: 3, alignItems: "flex-end", marginRight: 4 }}>
                  {[4, 8, 5, 10, 6].map((h, i) => (
                    <div key={i} style={{
                      width: 3, height: h, borderRadius: 2, background: item.color,
                      animation: `wave-bar-${i} ${0.6 + i * 0.1}s ease-in-out infinite alternate`,
                    }} />
                  ))}
                  <style>{[4,8,5,10,6].map((_,i) => `@keyframes wave-bar-${i} { from{transform:scaleY(0.3)} to{transform:scaleY(1)} }`).join("")}</style>
                </div>
              )}
              <button onClick={() => toggle(item)} style={{
                width: 42, height: 42, borderRadius: "50%", border: "none", cursor: "pointer",
                flexShrink: 0,
                background: isPlaying ? `${item.color}30` : "rgba(255,255,255,0.08)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {isPlaying
                  ? <Pause style={{ width: 16, height: 16, color: item.color }} />
                  : <Play style={{ width: 16, height: 16, color: "rgba(255,255,255,0.6)" }} />
                }
              </button>
            </div>
          );
        })}
      </div>

      {Object.keys(playing).length > 0 && (
        <div style={{ marginTop: 16, textAlign: "center" }}>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 8 }}>
            {Object.keys(playing).length} track{Object.keys(playing).length > 1 ? "s" : ""} playing
            {Object.keys(playing).length >= 2 ? " — mixed" : ""}
          </p>
        </div>
      )}
    </div>
  );
}