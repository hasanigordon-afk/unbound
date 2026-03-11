import React, { useState, useEffect } from "react";
import { Sun, RefreshCw } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

const QUOTES = [
  { quote: "Recovery is not a race. You don't have to feel guilty if it takes you longer than you thought.", author: "Unknown" },
  { quote: "Just because the past didn't turn out like you wanted it to doesn't mean your future can't be better than you imagined.", author: "Unknown" },
  { quote: "Fall seven times, stand up eight.", author: "Japanese Proverb" },
  { quote: "You don't have to see the whole staircase — just take the first step.", author: "Martin Luther King Jr." },
  { quote: "Every day is a new beginning. Take a deep breath and start again.", author: "Unknown" },
  { quote: "Strength doesn't come from what you can do. It comes from overcoming what you thought you couldn't.", author: "Rikki Rogers" },
  { quote: "The only person you should try to be better than is the person you were yesterday.", author: "Unknown" },
  { quote: "Recovery is about progression, not perfection.", author: "Unknown" },
  { quote: "You are braver than you believe, stronger than you seem, and smarter than you think.", author: "A.A. Milne" },
  { quote: "The bravest thing I ever did was continuing my life when I wanted to die.", author: "Juliette Lewis" },
  { quote: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { quote: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { quote: "One day at a time. This is enough.", author: "Unknown" },
  { quote: "Healing is not linear. Be patient with yourself.", author: "Unknown" },
  { quote: "Your sobriety is the most important thing you have. Everything else comes after.", author: "Unknown" },
];

const ENCOURAGEMENTS = [
  "You showed up today. That matters.",
  "Every hour sober is a victory.",
  "Your brain is healing, even when you can't feel it.",
  "You are not your past. You are your choices right now.",
  "Someone in your life is better because you're here.",
  "Cravings are temporary. Your strength is permanent.",
  "You've gotten through every hard day so far — 100% of them.",
  "Recovery looks different for everyone. Your path is valid.",
];

export default function MotivationBoostSection() {
  const [quoteIdx, setQuoteIdx] = useState(() => Math.floor(Math.random() * QUOTES.length));
  const [encIdx, setEncIdx] = useState(() => Math.floor(Math.random() * ENCOURAGEMENTS.length));

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });
  const { data: checkIns = [] } = useQuery({
    queryKey: ["motivation-checkins", user?.email],
    queryFn: () => base44.entities.DailyCheckIn.filter({ participant_email: user.email }, "-check_in_date", 90),
    enabled: !!user,
  });
  const { data: milestones = [] } = useQuery({
    queryKey: ["motivation-milestones", user?.email],
    queryFn: () => base44.entities.ForwardPlanMilestone.filter({ participant_email: user.email }),
    enabled: !!user,
  });

  const streak = (() => {
    const sorted = [...checkIns].sort((a, b) => new Date(b.check_in_date) - new Date(a.check_in_date));
    let count = 0; let cur = new Date(); cur.setHours(0, 0, 0, 0);
    for (const c of sorted) {
      const d = new Date(c.check_in_date); d.setHours(0, 0, 0, 0);
      if (Math.round((cur - d) / 86400000) <= 1) { count++; cur = d; } else break;
    }
    return count;
  })();

  const completed = milestones.filter(m => m.completed).length;
  const firstName = user?.full_name?.split(" ")[0] || "friend";

  const nextQuote = () => setQuoteIdx(i => (i + 1) % QUOTES.length);
  const nextEnc = () => setEncIdx(i => (i + 1) % ENCOURAGEMENTS.length);

  const q = QUOTES[quoteIdx];

  return (
    <div style={{ padding: "24px 20px", maxWidth: 560, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 42, marginBottom: 8 }}>☀️</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#1A3C2E", marginBottom: 4 }}>Motivation Boost</h2>
        <p style={{ fontSize: 14, color: "#6B7280" }}>You've got this, {firstName}. Here's your reminder.</p>
      </div>

      {/* Personal stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 16, padding: "18px 16px", textAlign: "center" }}>
          <p style={{ fontSize: 36, fontWeight: 800, color: "#B45309", lineHeight: 1 }}>{streak}</p>
          <p style={{ fontSize: 12, color: "#92400E", fontWeight: 600, marginTop: 4 }}>Day streak 🔥</p>
        </div>
        <div style={{ background: "#EEF2FF", border: "1px solid #C7D2FE", borderRadius: 16, padding: "18px 16px", textAlign: "center" }}>
          <p style={{ fontSize: 36, fontWeight: 800, color: "#4F46E5", lineHeight: 1 }}>{checkIns.length}</p>
          <p style={{ fontSize: 12, color: "#4338CA", fontWeight: 600, marginTop: 4 }}>Total check-ins ✅</p>
        </div>
        <div style={{ background: "#F0FDF4", border: "1px solid #A7F3D0", borderRadius: 16, padding: "18px 16px", textAlign: "center" }}>
          <p style={{ fontSize: 36, fontWeight: 800, color: "#065F46", lineHeight: 1 }}>{completed}</p>
          <p style={{ fontSize: 12, color: "#065F46", fontWeight: 600, marginTop: 4 }}>Goals achieved 🎯</p>
        </div>
        <div style={{ background: "#FDF2F8", border: "1px solid #F0ABFC", borderRadius: 16, padding: "18px 16px", textAlign: "center" }}>
          <p style={{ fontSize: 36, fontWeight: 800, color: "#86198F", lineHeight: 1 }}>{Math.round(streak * 24)}</p>
          <p style={{ fontSize: 12, color: "#86198F", fontWeight: 600, marginTop: 4 }}>Sober hours 💜</p>
        </div>
      </div>

      {/* Daily encouragement */}
      <div style={{ background: "#FFF", border: "1px solid #D4EAE1", borderRadius: 20, padding: "20px", marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#2E7D5E", textTransform: "uppercase", letterSpacing: "0.5px" }}>Today's Encouragement</p>
          <button onClick={nextEnc} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
            <RefreshCw className="w-4 h-4" style={{ color: "#9CA3AF" }} />
          </button>
        </div>
        <p style={{ fontSize: 16, color: "#1A3C2E", fontWeight: 600, lineHeight: 1.6 }}>
          {ENCOURAGEMENTS[encIdx]}
        </p>
      </div>

      {/* Quote card */}
      <div style={{ background: "linear-gradient(135deg, #1A3C2E, #2E7D5E)", borderRadius: 20, padding: "24px", marginBottom: 16 }}>
        <p style={{ fontSize: 16, color: "#FFF", lineHeight: 1.7, fontStyle: "italic", marginBottom: 14 }}>
          "{q.quote}"
        </p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ fontSize: 13, color: "#A7F3D0", fontWeight: 600 }}>— {q.author}</p>
          <button onClick={nextQuote} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 10, padding: "8px 14px", color: "#FFF", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <RefreshCw className="w-3 h-3" /> New Quote
          </button>
        </div>
      </div>

      {/* Milestone reminder */}
      {milestones.filter(m => !m.completed).length > 0 && (
        <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 16, padding: "16px 18px" }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#1D4ED8", marginBottom: 10 }}>🎯 Still working toward:</p>
          {milestones.filter(m => !m.completed).slice(0, 3).map((m, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
              <span style={{ color: "#93C5FD" }}>○</span>
              <p style={{ fontSize: 13, color: "#374151" }}>{m.milestone_text?.replace(/^(3-Year|1-Year|90-Day):\s*/i, "")}</p>
            </div>
          ))}
          <p style={{ fontSize: 12, color: "#6B7280", marginTop: 8 }}>Every sober day brings you closer. Keep going.</p>
        </div>
      )}
    </div>
  );
}