import React, { useEffect, useState } from "react";

/**
 * RecoveryScoreRing — dominant circular progress indicator for the Home dashboard.
 * Color-coded by risk: green (Low) / amber (Medium) / red (High).
 *
 * Props:
 *   score: number | null       0–100, null = no data yet
 *   size:  number              outer diameter (default 200)
 *   stroke: number             ring thickness (default 14)
 */
export default function RecoveryScoreRing({ score, size = 200, stroke = 14 }) {
  const hasData = typeof score === "number";
  const clamped = hasData ? Math.max(0, Math.min(100, score)) : 0;

  // Animate from 0 → score on mount
  const [animated, setAnimated] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setAnimated(clamped));
    return () => cancelAnimationFrame(id);
  }, [clamped]);

  // Risk band colors (aligned to app palette)
  const band = !hasData
    ? { color: "#B8823A", bg: "rgba(184,130,58,0.08)", level: "—",      label: "No data yet" }
    : clamped >= 70
      ? { color: "#1D9E75", bg: "rgba(29,158,117,0.10)", level: "Low",    label: "Low Risk" }
      : clamped >= 40
        ? { color: "#B8823A", bg: "rgba(184,130,58,0.12)", level: "Medium", label: "Medium Risk" }
        : { color: "#C9534F", bg: "rgba(201,83,79,0.10)",  level: "High",   label: "High Risk" };

  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference - (animated / 100) * circumference;

  return (
    <div style={{
      position: "relative", width: size, height: size, margin: "0 auto",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {/* Soft glow halo */}
      <div style={{
        position: "absolute", inset: -10, borderRadius: "50%",
        background: `radial-gradient(circle, ${band.color}22 0%, transparent 65%)`,
        pointerEvents: "none",
      }} />

      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", display: "block" }}>
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="#E8E2D9" strokeWidth={stroke}
        />
        {/* Progress */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={band.color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.22,1,.36,1)" }}
        />
      </svg>

      {/* Center content */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        textAlign: "center",
      }}>
        <p style={{
          fontSize: 10, fontWeight: 700, color: "#9B8E83",
          textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 4,
        }}>
          Recovery Score
        </p>
        <p style={{
          fontFamily: "'Lora', Georgia, serif",
          fontSize: 56, fontWeight: 600, lineHeight: 1, color: band.color,
        }}>
          {hasData ? clamped : "—"}
        </p>
        <p style={{ fontSize: 11, color: "#9B8E83", fontWeight: 500, marginTop: 2 }}>
          out of 100
        </p>

        {/* Risk pill */}
        <span style={{
          marginTop: 10,
          display: "inline-flex", alignItems: "center", gap: 6,
          fontSize: 11, fontWeight: 700, color: band.color, letterSpacing: ".04em",
          background: band.bg, border: `1px solid ${band.color}33`,
          padding: "5px 12px", borderRadius: 20,
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: "50%", background: band.color,
            boxShadow: `0 0 8px ${band.color}88`,
          }} />
          {band.label}
        </span>
      </div>
    </div>
  );
}