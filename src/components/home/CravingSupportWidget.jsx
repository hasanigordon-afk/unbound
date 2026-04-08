import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/pages/utils";
import { Zap, Wind, Music, Timer, ArrowRight } from "lucide-react";

const QUICK_TOOLS = [
  { icon: Wind,  label: "Breathe",  color: "#2DD4BF", href: "CravingControlCenter" },
  { icon: Music, label: "Sound",    color: "#8B5CF6", href: "CravingControlCenter" },
  { icon: Timer, label: "Urge Timer", color: "#F59E0B", href: "CravingControlCenter" },
];

const URGE_TIPS = [
  "Urges peak at ~15 min. Ride it out.",
  "Drink a cold glass of water right now.",
  "Step outside. Fresh air shifts everything.",
  "Text your sponsor or a safe contact.",
  "Name 5 things you can see around you.",
];

export default function CravingSupportWidget() {
  const [tip] = useState(() => URGE_TIPS[Math.floor(Math.random() * URGE_TIPS.length)]);

  return (
    <div style={{
      borderRadius: 22, padding: "18px 18px 14px", marginBottom: 20,
      background: "linear-gradient(135deg,rgba(239,68,68,0.06),rgba(139,92,246,0.04))",
      border: "1px solid rgba(239,68,68,0.18)",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10,
            background: "rgba(239,68,68,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Zap style={{ color: "#F87171", width: 15, height: 15 }} />
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>Craving Right Now?</p>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>Tools to get through it</p>
          </div>
        </div>
        <Link to={createPageUrl("CravingControlCenter")} style={{ display: "flex", alignItems: "center", gap: 4,
          color: "rgba(255,255,255,0.35)", textDecoration: "none", fontSize: 11, fontWeight: 600 }}>
          All tools <ArrowRight style={{ width: 12, height: 12 }} />
        </Link>
      </div>

      {/* Tip of the moment */}
      <div style={{ padding: "10px 14px", borderRadius: 12, marginBottom: 12,
        background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.5, fontStyle: "italic" }}>
          💡 {tip}
        </p>
      </div>

      {/* Quick tool buttons */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {QUICK_TOOLS.map(tool => {
          const Icon = tool.icon;
          return (
            <Link key={tool.label} to={createPageUrl(tool.href)} style={{ flex: 1, textDecoration: "none" }}>
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                padding: "12px 8px", borderRadius: 14, cursor: "pointer",
                background: `${tool.color}0C`, border: `1px solid ${tool.color}25`,
                transition: "all 0.15s ease",
              }}>
                <Icon style={{ color: tool.color, width: 18, height: 18 }} strokeWidth={1.8} />
                <p style={{ fontSize: 10, fontWeight: 700, color: tool.color, letterSpacing: ".03em" }}>{tool.label}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Crisis CTA */}
      <Link to={createPageUrl("CravingControlCenter")} style={{ textDecoration: "none", display: "block" }}>
        <div style={{
          padding: "11px 16px", borderRadius: 12, textAlign: "center",
          background: "linear-gradient(135deg,rgba(239,68,68,0.15),rgba(220,38,38,0.08))",
          border: "1px solid rgba(239,68,68,0.25)",
        }}>
          <p style={{ fontSize: 13, fontWeight: 800, color: "#F87171" }}>
            🆘 Open Full Crisis Support Center →
          </p>
        </div>
      </Link>
    </div>
  );
}