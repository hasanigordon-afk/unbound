import React, { useState } from "react";
import { Sparkles, ChevronRight } from "lucide-react";

const PROMPTS = [
  { emoji: "🌅", text: "What grounded you today?", color: "#3ECFBF" },
  { emoji: "🏆", text: "What was your biggest win today, big or small?", color: "#C9A96E" },
  { emoji: "💪", text: "What are you fighting through right now?", color: "#F87171" },
  { emoji: "🙏", text: "What are you grateful for tonight?", color: "#A78BFA" },
  { emoji: "🌱", text: "What did you learn about yourself this week?", color: "#10B981" },
  { emoji: "🔥", text: "What kept you going when it got hard?", color: "#FB923C" },
  { emoji: "🤝", text: "Who showed up for you today?", color: "#60A5FA" },
  { emoji: "🗺️", text: "What's one thing you're choosing today?", color: "#3ECFBF" },
];

export default function DailyPrompt({ onPromptSelect }) {
  const todayIdx = new Date().getDate() % PROMPTS.length;
  const prompt = PROMPTS[todayIdx];

  return (
    <div style={{
      background: `linear-gradient(135deg, ${prompt.color}18, ${prompt.color}08)`,
      border: `1px solid ${prompt.color}35`,
      borderRadius: 18,
      padding: "16px 18px",
      marginBottom: 16,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <Sparkles style={{ width: 13, height: 13, color: prompt.color }} />
        <p style={{ fontSize: 10, fontWeight: 700, color: prompt.color, textTransform: "uppercase", letterSpacing: ".09em" }}>
          Today's Community Prompt
        </p>
      </div>
      <p style={{ fontSize: 16, fontWeight: 800, color: "#fff", lineHeight: 1.35, marginBottom: 14 }}>
        {prompt.emoji} {prompt.text}
      </p>
      <button
        onClick={() => onPromptSelect(prompt.text)}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          background: `${prompt.color}22`, border: `1px solid ${prompt.color}50`,
          borderRadius: 10, padding: "9px 14px", color: prompt.color,
          fontWeight: 700, fontSize: 13, cursor: "pointer",
        }}
      >
        Share My Answer <ChevronRight style={{ width: 13, height: 13 }} />
      </button>
    </div>
  );
}