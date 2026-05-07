import React from "react";

/**
 * Cinematic ambient background — fixed full-viewport layer behind everything.
 * Uses CSS variables (--ambient-1..4) so it adapts to any theme automatically.
 *
 * Renders 4 slow-drifting blurred orbs + a fine grain layer.
 * No images, GPU-friendly transforms only.
 */
export default function AmbientBackground() {
  return (
    <div aria-hidden="true" style={{
      position: "fixed", inset: 0, zIndex: -1, overflow: "hidden",
      background: "var(--bg)",
      pointerEvents: "none",
    }}>
      <style>{`
        @keyframes amb-drift-1 { 0%,100% { transform: translate3d(-10%, -10%, 0) scale(1); } 50% { transform: translate3d(8%, 6%, 0) scale(1.15); } }
        @keyframes amb-drift-2 { 0%,100% { transform: translate3d(60%, 5%, 0) scale(1.1); }  50% { transform: translate3d(40%, 30%, 0) scale(.95); } }
        @keyframes amb-drift-3 { 0%,100% { transform: translate3d(20%, 70%, 0) scale(1); }   50% { transform: translate3d(50%, 55%, 0) scale(1.2); } }
        @keyframes amb-drift-4 { 0%,100% { transform: translate3d(75%, 60%, 0) scale(1.05); } 50% { transform: translate3d(60%, 80%, 0) scale(.9); } }
        @keyframes amb-breathe { 0%,100% { opacity: .85; } 50% { opacity: 1; } }

        .amb-orb {
          position: absolute; border-radius: 50%;
          filter: blur(80px);
          will-change: transform;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
        .amb-grain {
          position: absolute; inset: 0;
          background-image:
            radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 3px 3px;
          opacity: .35; mix-blend-mode: overlay;
        }
        .amb-vignette {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.45) 100%);
          pointer-events: none;
        }
      `}</style>

      {/* Layered drifting orbs */}
      <div className="amb-orb" style={{
        width: 520, height: 520, background: "var(--ambient-1)",
        animation: "amb-drift-1 24s infinite, amb-breathe 8s infinite",
      }} />
      <div className="amb-orb" style={{
        width: 460, height: 460, background: "var(--ambient-2)",
        animation: "amb-drift-2 30s infinite, amb-breathe 10s infinite",
      }} />
      <div className="amb-orb" style={{
        width: 380, height: 380, background: "var(--ambient-3)",
        animation: "amb-drift-3 36s infinite, amb-breathe 12s infinite",
      }} />
      <div className="amb-orb" style={{
        width: 320, height: 320, background: "var(--ambient-4)",
        animation: "amb-drift-4 28s infinite, amb-breathe 9s infinite",
      }} />

      <div className="amb-grain" />
      <div className="amb-vignette" />
    </div>
  );
}