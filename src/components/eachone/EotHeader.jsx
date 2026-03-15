import React from "react";
import { Sparkles, Plus } from "lucide-react";

const TABS = [
  { id: "feed",      label: "Feed",      emoji: "✨" },
  { id: "market",    label: "Market",    emoji: "🛍️" },
  { id: "services",  label: "Services",  emoji: "🤝" },
  { id: "creators",  label: "Creators",  emoji: "🌟" },
];

export default function EotHeader({ activeTab, setActiveTab, onPost, user }) {
  return (
    <div style={{
      background: "linear-gradient(155deg,#1A0A2E,#0D1A2E)",
      padding: "52px 20px 0",
      position: "relative", overflow: "hidden",
    }}>
      {/* Glow orb */}
      <div style={{
        position: "absolute", top: -80, right: -80, width: 280, height: 280,
        borderRadius: "50%",
        background: "radial-gradient(circle,rgba(168,85,247,0.12) 0%,transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", top: 20, left: -60, width: 200, height: 200,
        borderRadius: "50%",
        background: "radial-gradient(circle,rgba(251,146,60,0.07) 0%,transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ position: "relative", zIndex: 1, marginBottom: 16 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#A855F7", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 4 }}>
          💜 Each One Teach One
        </p>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>Show Your Gift</h1>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 3 }}>
              Turn talent into opportunity. Inspire others through what you create.
            </p>
          </div>
          {user && (
            <button
              onClick={onPost}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "10px 16px", borderRadius: 14,
                background: "linear-gradient(135deg,#A855F7,#7C3AED)",
                border: "none", color: "#fff", fontWeight: 800, fontSize: 13, cursor: "pointer",
                boxShadow: "0 4px 18px rgba(168,85,247,0.35)", flexShrink: 0,
              }}
            >
              <Plus style={{ width: 14, height: 14 }} /> Post
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 1 }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1, padding: "10px 4px",
              borderRadius: "12px 12px 0 0",
              background: activeTab === tab.id ? "rgba(168,85,247,0.12)" : "transparent",
              border: "none", cursor: "pointer",
              borderBottom: activeTab === tab.id ? "2px solid #A855F7" : "2px solid transparent",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
            }}
          >
            <span style={{ fontSize: 13 }}>{tab.emoji}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: activeTab === tab.id ? "#fff" : "rgba(255,255,255,0.35)" }}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}