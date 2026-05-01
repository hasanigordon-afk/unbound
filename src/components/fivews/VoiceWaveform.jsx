import React from "react";

/**
 * Lightweight CSS-only waveform animation for the "Talk It Out" recording state.
 * Avoids needing real audio analyser — feels alive, no perf cost.
 */
export default function VoiceWaveform({ active = false, color = "#C8932F" }) {
  const bars = [0, 1, 2, 3, 4, 5, 6, 7];
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      gap: 4, height: 32,
    }}>
      {bars.map(i => (
        <span
          key={i}
          style={{
            width: 4,
            borderRadius: 2,
            background: color,
            animation: active ? `wave-${i % 4} 1s ease-in-out infinite` : "none",
            height: active ? "auto" : 6,
            opacity: active ? 1 : 0.3,
          }}
        />
      ))}
      <style>{`
        @keyframes wave-0 { 0%,100% { height: 8px } 50% { height: 26px } }
        @keyframes wave-1 { 0%,100% { height: 14px } 50% { height: 32px } }
        @keyframes wave-2 { 0%,100% { height: 6px } 50% { height: 22px } }
        @keyframes wave-3 { 0%,100% { height: 18px } 50% { height: 30px } }
      `}</style>
    </div>
  );
}