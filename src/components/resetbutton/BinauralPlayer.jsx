import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, Volume2 } from "lucide-react";

const TRACKS = [
  { id: "delta",  label: "Deep Rest",     freq: "Delta 2Hz",  desc: "Sleep & deep recovery",  color: "#6366F1", emoji: "🌙" },
  { id: "theta",  label: "Calm Focus",    freq: "Theta 6Hz",  desc: "Meditation & flow",       color: "#8B5CF6", emoji: "🧘" },
  { id: "alpha",  label: "Relaxed Alert", freq: "Alpha 10Hz", desc: "Stress relief",           color: "#2DD4BF", emoji: "🌊" },
  { id: "beta",   label: "Clear Mind",    freq: "Beta 18Hz",  desc: "Focus & clarity",         color: "#34D399", emoji: "💚" },
];

// Generates binaural beat using Web Audio API
function createBinauralBeat(ctx, baseFreq, beatFreq) {
  const gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
  gainNode.connect(ctx.destination);

  const merger = ctx.createChannelMerger(2);
  merger.connect(gainNode);

  const leftOsc = ctx.createOscillator();
  leftOsc.type = "sine";
  leftOsc.frequency.value = baseFreq;

  const rightOsc = ctx.createOscillator();
  rightOsc.type = "sine";
  rightOsc.frequency.value = baseFreq + beatFreq;

  const leftGain = ctx.createGain(); leftGain.gain.value = 1;
  const rightGain = ctx.createGain(); rightGain.gain.value = 1;

  leftOsc.connect(leftGain); leftGain.connect(merger, 0, 0);
  rightOsc.connect(rightGain); rightGain.connect(merger, 0, 1);

  leftOsc.start(); rightOsc.start();
  return { leftOsc, rightOsc, gainNode };
}

const BEAT_FREQS = { delta: 2, theta: 6, alpha: 10, beta: 18 };

export default function BinauralPlayer() {
  const [selected, setSelected] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef(null);
  const nodesRef = useRef(null);

  const stop = () => {
    if (nodesRef.current) {
      try {
        nodesRef.current.leftOsc.stop();
        nodesRef.current.rightOsc.stop();
        nodesRef.current.gainNode.disconnect();
      } catch(e) {}
      nodesRef.current = null;
    }
    if (audioRef.current) { audioRef.current.close(); audioRef.current = null; }
    setPlaying(false);
  };

  const play = (track) => {
    stop();
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    audioRef.current = ctx;
    const nodes = createBinauralBeat(ctx, 200, BEAT_FREQS[track.id]);
    nodes.gainNode.gain.setValueAtTime(volume * 0.15, ctx.currentTime);
    nodesRef.current = nodes;
    setPlaying(true);
  };

  useEffect(() => {
    if (nodesRef.current) {
      nodesRef.current.gainNode.gain.setValueAtTime(volume * 0.15, audioRef.current?.currentTime || 0);
    }
  }, [volume]);

  useEffect(() => () => stop(), []);

  const handleSelect = (track) => {
    if (selected?.id === track.id && playing) { stop(); return; }
    setSelected(track);
    play(track);
  };

  return (
    <div>
      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 16, lineHeight: 1.6 }}>
        Binaural beats work best with headphones. Each frequency gently guides your brain into a different state.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
        {TRACKS.map(t => {
          const isActive = selected?.id === t.id && playing;
          return (
            <button key={t.id} onClick={() => handleSelect(t)}
              style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
                borderRadius: 16, border: "none", cursor: "pointer", textAlign: "left",
                background: isActive ? t.color + "15" : "rgba(255,255,255,0.04)",
                border: `1.5px solid ${isActive ? t.color + "50" : "rgba(255,255,255,0.08)"}`,
                transition: "all 0.2s ease" }}>
              <span style={{ fontSize: 24, flexShrink: 0 }}>{t.emoji}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 800, color: isActive ? t.color : "#fff", marginBottom: 2 }}>{t.label}</p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{t.freq} · {t.desc}</p>
              </div>
              <div style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                background: isActive ? t.color + "25" : "rgba(255,255,255,0.06)",
                display: "flex", alignItems: "center", justifyContent: "center" }}>
                {isActive
                  ? <Pause style={{ color: t.color, width: 14, height: 14 }} />
                  : <Play style={{ color: "rgba(255,255,255,0.4)", width: 14, height: 14 }} />}
              </div>
            </button>
          );
        })}
      </div>

      {playing && (
        <div style={{ borderRadius: 14, padding: "14px 16px",
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Volume2 style={{ color: "rgba(255,255,255,0.4)", width: 16, height: 16, flexShrink: 0 }} />
            <input type="range" min="0" max="1" step="0.05" value={volume}
              onChange={e => setVolume(parseFloat(e.target.value))}
              style={{ flex: 1, accentColor: selected?.color || "#2DD4BF", cursor: "pointer" }} />
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", width: 28, textAlign: "right" }}>
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}