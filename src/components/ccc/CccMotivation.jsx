import React, { useState, useEffect } from "react";
import { Sparkles, RefreshCw } from "lucide-react";

const QUOTES = [
  { text: "Recovery is not a race. You don't have to feel guilty if it takes you longer than you thought.", author: "Unknown" },
  { text: "You don't have to see the whole staircase, just take the first step.", author: "Martin Luther King Jr." },
  { text: "The secret of change is to focus all of your energy not on fighting the old, but on building the new.", author: "Socrates" },
  { text: "Every day is a new beginning. Take a deep breath and start again.", author: "Unknown" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "Courage isn't having the strength to go on — it is going on when you don't have the strength.", author: "Napoleon Bonaparte" },
  { text: "You are not a burden. You are a person who needs support — and asking for it is brave.", author: "Unknown" },
  { text: "Sobriety was the greatest gift I ever gave myself.", author: "Rob Lowe" },
  { text: "One day at a time. That's all we have to do.", author: "Recovery Community" },
  { text: "Your worst day in recovery is still better than your best day in addiction.", author: "Unknown" },
  { text: "Progress, not perfection.", author: "12 Step Tradition" },
  { text: "The most courageous thing you can do is ask for help when you need it.", author: "Unknown" },
];

const DAILY_MESSAGES = [
  "You woke up today. That already counts.",
  "This moment — right now — is a moment of strength.",
  "Yesterday doesn't define today. Today is all that matters.",
  "You are more than your past. You are who you are becoming.",
  "Showing up is half the battle. You're already here.",
  "Rest when you need to. Recovery doesn't take breaks from you, but you can pause.",
  "The version of you that gets through this will be someone to be proud of.",
];

const MILESTONES = [1, 7, 14, 30, 60, 90, 180, 365];

export default function CccMotivation({ checkIns = [] }) {
  const [quoteIndex, setQuoteIndex] = useState(() => Math.floor(Math.random() * QUOTES.length));
  const [msgIndex] = useState(() => Math.floor(Math.random() * DAILY_MESSAGES.length));
  const [liked, setLiked] = useState(new Set());

  const streak = (() => {
    if (!checkIns.length) return 0;
    const sorted = [...checkIns].sort((a, b) => new Date(b.check_in_date) - new Date(a.check_in_date));
    let count = 0; let cur = new Date(); cur.setHours(0,0,0,0);
    for (const c of sorted) {
      const d = new Date(c.check_in_date); d.setHours(0,0,0,0);
      if (Math.round((cur - d) / 86400000) <= 1) { count++; cur = d; } else break;
    }
    return count;
  })();

  const nextMilestone = MILESTONES.find(m => m > streak) || 365;
  const prevMilestone = [...MILESTONES].reverse().find(m => m <= streak) || 0;
  const milestoneProgress = prevMilestone === nextMilestone ? 100 : ((streak - prevMilestone) / (nextMilestone - prevMilestone)) * 100;

  const quote = QUOTES[quoteIndex];
  const nextQuote = () => setQuoteIndex(i => (i + 1) % QUOTES.length);

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1E3A5F", marginBottom: 4 }}>Motivation Boost</h2>
      <p style={{ color: "#5A7A9A", fontSize: 14, marginBottom: 24 }}>Reminders of why you started and how far you've come.</p>

      {/* Daily message */}
      <div style={{
        background: "linear-gradient(135deg, #1B3A5C 0%, #1E4A72 100%)",
        borderRadius: 18,
        padding: "22px 22px",
        marginBottom: 20,
      }}>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
          Today's Message
        </p>
        <p style={{ color: "#FFFFFF", fontSize: 16, fontWeight: 600, lineHeight: 1.6 }}>
          {DAILY_MESSAGES[msgIndex]}
        </p>
      </div>

      {/* Quote card */}
      <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 18, padding: "22px", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
          <Sparkles className="w-5 h-5 flex-shrink-0" style={{ color: "#F59E0B", marginTop: 2 }} />
          <p style={{ fontSize: 16, color: "#1E293B", lineHeight: 1.7, fontStyle: "italic", flex: 1 }}>
            "{quote.text}"
          </p>
        </div>
        <p style={{ fontSize: 12, color: "#94A3B8", marginBottom: 16 }}>— {quote.author}</p>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={nextQuote}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, border: "1px solid #E2E8F0", background: "#F8FAFC", color: "#475569", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
          >
            <RefreshCw className="w-3 h-3" /> New Quote
          </button>
          <button
            onClick={() => setLiked(prev => { const n = new Set(prev); n.has(quoteIndex) ? n.delete(quoteIndex) : n.add(quoteIndex); return n; })}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, border: `1px solid ${liked.has(quoteIndex) ? "#FCA5A5" : "#E2E8F0"}`, background: liked.has(quoteIndex) ? "#FEF2F2" : "#F8FAFC", color: liked.has(quoteIndex) ? "#EF4444" : "#475569", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
          >
            {liked.has(quoteIndex) ? "❤️" : "🤍"} Save
          </button>
        </div>
      </div>

      {/* Streak + milestone */}
      {streak > 0 && (
        <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 18, padding: "20px 22px", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
            <span style={{ fontSize: 32 }}>🔥</span>
            <div>
              <p style={{ fontWeight: 800, fontSize: 20, color: "#92400E" }}>{streak} Day{streak !== 1 ? "s" : ""} Strong</p>
              <p style={{ fontSize: 13, color: "#B45309" }}>Every day is a victory worth acknowledging.</p>
            </div>
          </div>
          <p style={{ fontSize: 12, fontWeight: 600, color: "#92400E", marginBottom: 6 }}>
            Next milestone: {nextMilestone} days ({nextMilestone - streak} to go)
          </p>
          <div style={{ height: 8, background: "#FDE68A", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ width: `${milestoneProgress}%`, height: "100%", background: "#F59E0B", borderRadius: 4 }} />
          </div>
        </div>
      )}

      {streak === 0 && (
        <div style={{ background: "#F0F9FF", border: "1px solid #BAE6FD", borderRadius: 16, padding: "18px 20px" }}>
          <p style={{ color: "#0369A1", fontWeight: 700, marginBottom: 4 }}>Your journey starts with one check-in.</p>
          <p style={{ color: "#0284C7", fontSize: 13 }}>Complete a daily check-in to start building your streak.</p>
        </div>
      )}

      {/* Milestone badges */}
      <div style={{ marginTop: 20 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Milestones</p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {MILESTONES.map(m => {
            const achieved = streak >= m;
            return (
              <div key={m} style={{
                padding: "8px 14px",
                borderRadius: 20,
                background: achieved ? "#1E4A72" : "#F1F5F9",
                border: `1px solid ${achieved ? "#1E4A72" : "#E2E8F0"}`,
              }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: achieved ? "#FFFFFF" : "#94A3B8" }}>
                  {achieved ? "✓ " : ""}{m}d
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}