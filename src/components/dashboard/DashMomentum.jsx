import React from "react";
import { Flame, Heart, TrendingUp } from "lucide-react";

/**
 * Recovery Momentum — animated streak ring + key metrics.
 */
function Ring({ score = 0, size = 140, stroke = 10, color = "var(--accent)" }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, score));
  const offset = c - (c * v) / 100;

  return (
    <svg width={size} height={size} style={{ display: "block", filter: "drop-shadow(0 0 10px rgba(91,141,239,0.45))" }}>
      <defs>
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="var(--accent)" />
          <stop offset="100%" stopColor="var(--purple)" />
        </linearGradient>
      </defs>
      <circle cx={size/2} cy={size/2} r={r}
        stroke="var(--border)" strokeWidth={stroke} fill="none" opacity={0.4} />
      <circle cx={size/2} cy={size/2} r={r}
        stroke="url(#ringGrad)" strokeWidth={stroke} fill="none"
        strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={offset}
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: "stroke-dashoffset .9s cubic-bezier(.22,1,.36,1)" }}
      />
    </svg>
  );
}

export default function DashMomentum({ streak = 0, score = null, wellnessScore = null }) {
  const ringValue = score ?? Math.min((streak / 30) * 100, 100);
  const display = score !== null ? `${score}%` : `${streak}`;

  return (
    <div className="fade-up" style={{
      background: "var(--card)",
      border: "1px solid var(--border)",
      borderRadius: 24,
      padding: "24px 22px",
      backdropFilter: "blur(18px) saturate(160%)",
      WebkitBackdropFilter: "blur(18px) saturate(160%)",
      boxShadow: "var(--shadow-card)",
      animation: "dashCardFloat 6.5s ease-in-out infinite",
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 6,
      }}>
        <span style={{
          fontSize: 10.5, fontWeight: 700, color: "var(--text-dim)",
          letterSpacing: ".18em", textTransform: "uppercase",
          fontFamily: "'Space Grotesk', 'DM Sans', sans-serif",
        }}>
          Recovery Momentum
        </span>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          fontSize: 11, fontWeight: 600, color: "var(--green)",
          padding: "3px 10px", borderRadius: 999,
          background: "var(--tint-mint)",
          border: "1px solid rgba(52,211,153,0.32)",
        }}>
          <TrendingUp style={{ width: 11, height: 11 }} /> On track
        </span>
      </div>

      <div style={{
        display: "grid", gridTemplateColumns: "auto 1fr", gap: 22,
        alignItems: "center", marginTop: 14,
      }}>
        {/* Ring */}
        <div style={{ position: "relative", width: 140, height: 140 }}>
          <Ring score={ringValue} />
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
          }}>
            <span style={{
              fontFamily: "'Space Grotesk', 'DM Sans', sans-serif",
              fontSize: 32, fontWeight: 700, color: "var(--text)",
              lineHeight: 1, letterSpacing: "-.02em",
            }}>{display}</span>
            <span style={{
              fontSize: 10, color: "var(--text-dim)",
              letterSpacing: ".15em", textTransform: "uppercase",
              marginTop: 4, fontWeight: 700,
            }}>{score !== null ? "Weekly" : "Day Streak"}</span>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Metric icon={<Flame style={{ width: 13, height: 13 }} />} label="Streak" value={`${streak} days`} accent="var(--gold)" />
          <Metric icon={<Heart style={{ width: 13, height: 13 }} />} label="Wellness" value={wellnessScore !== null ? `${wellnessScore}%` : "—"} accent="var(--green)" />
          <Metric icon={<TrendingUp style={{ width: 13, height: 13 }} />} label="Consistency" value={score !== null ? `${score}%` : "Build it"} accent="var(--accent)" />
        </div>
      </div>

      <style>{`
        @keyframes dashCardFloat {
          0%,100% { transform: translateY(0); }
          50%     { transform: translateY(-3px); }
        }
      `}</style>
    </div>
  );
}

function Metric({ icon, label, value, accent }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "8px 12px", borderRadius: 12,
      background: "var(--surface)",
      border: "1px solid var(--border)",
    }}>
      <div style={{
        width: 26, height: 26, borderRadius: 7,
        background: "var(--card)",
        color: accent,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        boxShadow: `0 0 12px ${accent}`,
      }}>{icon}</div>
      <div style={{ flex: 1, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: 11.5, color: "var(--text-dim)", letterSpacing: ".06em", textTransform: "uppercase", fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 13, color: "var(--text)", fontWeight: 700 }}>{value}</span>
      </div>
    </div>
  );
}