import React, { useState } from "react";
import { Headphones, ExternalLink } from "lucide-react";

const TRACKS = [
  {
    id: "relax", title: "Deep Relaxation", freq: "Alpha 10Hz", emoji: "🌊", color: "#2E7D5E", bg: "#E8F5E9", border: "#A7F3D0",
    desc: "Reduces anxiety and promotes a calm, relaxed state. Best for unwinding after a stressful day.",
    url: "https://www.youtube.com/results?search_query=binaural+beats+alpha+10hz+relaxation",
  },
  {
    id: "anxiety", title: "Anxiety Relief", freq: "Theta 6Hz", emoji: "💆", color: "#4F46E5", bg: "#EEF2FF", border: "#C7D2FE",
    desc: "Theta waves reduce anxiety and racing thoughts. Use when overwhelmed or emotionally activated.",
    url: "https://www.youtube.com/results?search_query=binaural+beats+theta+anxiety+relief",
  },
  {
    id: "sleep", title: "Sleep Induction", freq: "Delta 2Hz", emoji: "🌙", color: "#6D28D9", bg: "#F5F3FF", border: "#DDD6FE",
    desc: "Delta waves support deep, restorative sleep. Ideal for insomnia or restless nights in recovery.",
    url: "https://www.youtube.com/results?search_query=binaural+beats+delta+deep+sleep",
  },
  {
    id: "focus", title: "Focus & Clarity", freq: "Beta 15Hz", emoji: "🎯", color: "#0F766E", bg: "#F0FDFA", border: "#99F6E4",
    desc: "Beta waves improve concentration and mental clarity. Great for journaling or therapy work.",
    url: "https://www.youtube.com/results?search_query=binaural+beats+beta+focus+concentration",
  },
  {
    id: "craving", title: "Craving Reduction", freq: "Theta 7Hz", emoji: "🌿", color: "#B45309", bg: "#FFFBEB", border: "#FDE68A",
    desc: "Specific theta frequencies have been studied for craving management in addiction recovery.",
    url: "https://www.youtube.com/results?search_query=binaural+beats+craving+addiction+recovery",
  },
];

export default function BinauralBeatsSection() {
  const [active, setActive] = useState(null);

  return (
    <div style={{ padding: "24px 20px", maxWidth: 560, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 42, marginBottom: 8 }}>🎧</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#1A3C2E", marginBottom: 4 }}>Binaural Beats</h2>
        <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.6 }}>Audio frequencies that guide your brainwaves into calm states.</p>
      </div>

      {/* Headphone notice */}
      <div style={{ background: "#FEF3C7", border: "1px solid #FDE68A", borderRadius: 14, padding: "14px 16px", marginBottom: 20, display: "flex", gap: 12, alignItems: "flex-start" }}>
        <Headphones className="w-5 h-5" style={{ color: "#B45309", flexShrink: 0, marginTop: 1 }} strokeWidth={1.5} />
        <div>
          <p style={{ fontWeight: 700, fontSize: 13, color: "#92400E", marginBottom: 2 }}>🎧 Headphones Required</p>
          <p style={{ fontSize: 12, color: "#92400E", lineHeight: 1.5 }}>
            Binaural beats only work with stereo headphones. Each ear receives a slightly different frequency — your brain creates the effect.
          </p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {TRACKS.map(t => (
          <div
            key={t.id}
            style={{
              background: active === t.id ? t.bg : "#FFF",
              border: `1px solid ${active === t.id ? t.border : "#E5E7EB"}`,
              borderRadius: 18, padding: "18px 18px", cursor: "pointer",
            }}
            onClick={() => setActive(active === t.id ? null : t.id)}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: t.bg, border: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                {t.emoji}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, fontSize: 15, color: "#1A3C2E" }}>{t.title}</p>
                <p style={{ fontSize: 12, fontWeight: 600, color: t.color }}>{t.freq}</p>
              </div>
              <span style={{ fontSize: 18, color: "#C7C7CC" }}>{active === t.id ? "▾" : "▸"}</span>
            </div>

            {active === t.id && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${t.border}` }}>
                <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.6, marginBottom: 14 }}>{t.desc}</p>
                <a
                  href={t.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, background: t.color, color: "#FFF", borderRadius: 12, padding: "10px 18px", fontSize: 13, fontWeight: 700, textDecoration: "none" }}
                >
                  <ExternalLink className="w-4 h-4" /> Listen on YouTube
                </a>
                <p style={{ fontSize: 11, color: "#9CA3AF", marginTop: 8 }}>
                  Opens search for free tracks. Use quality headphones for best results.
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 20, background: "#F0FDF4", border: "1px solid #A7F3D0", borderRadius: 16, padding: 16 }}>
        <p style={{ fontSize: 12, color: "#065F46", lineHeight: 1.6 }}>
          💡 <strong>How it works:</strong> When two slightly different frequencies are played — one in each ear — your brain generates a third frequency matching the difference. This synchronizes your brainwaves and shifts your mental state.
        </p>
      </div>
    </div>
  );
}