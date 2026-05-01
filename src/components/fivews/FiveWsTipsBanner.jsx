import React, { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

const TIPS = [
  "AI works best when you speak freely. The clearer your question, the better your answer.",
  "No question is too small.",
  "You can ask about anything.",
  "This is your space to think things through.",
];

export default function FiveWsTipsBanner() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % TIPS.length), 5500);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      background: "rgba(15,30,61,0.04)",
      border: "1px solid rgba(15,30,61,0.10)",
      borderRadius: 14,
      padding: "12px 14px",
      display: "flex", alignItems: "flex-start", gap: 10,
      marginBottom: 18,
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
        background: "rgba(200,147,47,0.14)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Sparkles style={{ width: 14, height: 14, color: "#C8932F" }} strokeWidth={2} />
      </div>
      <p key={idx} style={{
        flex: 1,
        fontSize: 12.5,
        color: "#4A5260",
        lineHeight: 1.55,
        animation: "fadeTip 0.5s ease",
      }}>
        {TIPS[idx]}
      </p>
      <style>{`
        @keyframes fadeTip { from { opacity: 0; transform: translateY(3px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}