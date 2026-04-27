import React, { useMemo, useState } from "react";
import { Sparkles, Share2, Check } from "lucide-react";

// Science-backed recovery affirmations & inspirational quotes
const QUOTES = [
  { text: "Recovery is not a race. You don't have to feel guilty if it takes you longer than you thought it would.", author: "Anonymous" },
  { text: "The strongest people are not those who show strength in front of us, but those who win battles we know nothing about.", author: "Jonathan Harnisch" },
  { text: "You are not your worst day. You are the sum of all the days you keep choosing to try.", author: "Recovery Wisdom" },
  { text: "Healing doesn't mean the damage never existed. It means the damage no longer controls our lives.", author: "Akshay Dubey" },
  { text: "Small steps still count. Progress is progress, no matter how slow.", author: "Recovery Wisdom" },
  { text: "Self-compassion is associated with greater emotional resilience and lower relapse rates.", author: "Dr. Kristin Neff, research" },
  { text: "Connection is the opposite of addiction. Reach out today.", author: "Johann Hari" },
  { text: "Mindfulness reduces cravings by changing how your brain responds to triggers.", author: "Dr. Judson Brewer, research" },
  { text: "You've survived 100% of your hardest days so far. That's not luck — that's strength.", author: "Recovery Wisdom" },
  { text: "Hope is not a feeling. It's a practice. Show up anyway.", author: "Anonymous" },
  { text: "Gratitude rewires the brain — even 30 seconds a day strengthens neural pathways for resilience.", author: "Neuroscience research" },
  { text: "You are allowed to be both a masterpiece and a work in progress simultaneously.", author: "Sophia Bush" },
  { text: "Sleep, nutrition, and movement are not luxuries in recovery — they are medicine.", author: "Recovery Wisdom" },
  { text: "The opposite of addiction is not sobriety. It is human connection.", author: "Johann Hari" },
  { text: "Every time you choose differently, you're literally building new neural pathways. Your brain is rebuilding itself.", author: "Neuroplasticity research" },
  { text: "Asking for help is not weakness. It's the bravest thing you can do.", author: "Recovery Wisdom" },
  { text: "You don't have to see the whole staircase. Just take the first step.", author: "Martin Luther King Jr." },
  { text: "Breathing slowly for 90 seconds activates your parasympathetic nervous system and reduces craving intensity.", author: "Polyvagal research" },
  { text: "Your story isn't over. This is just one chapter — and you're still writing it.", author: "Recovery Wisdom" },
  { text: "Today, I choose progress over perfection. Showing up is enough.", author: "Daily Affirmation" },
];

// Pick a quote that rotates daily based on day of year
function getQuoteOfDay() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const dayOfYear = Math.floor(diff / 86400000);
  return QUOTES[dayOfYear % QUOTES.length];
}

export default function DailyMindset() {
  const quote = useMemo(getQuoteOfDay, []);
  const [shared, setShared] = useState(false);

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const shareText = `"${quote.text}" — ${quote.author}\n\nFrom Ah Ha · Help. Hope. Healing.`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Daily Mindset · Ah Ha",
          text: shareText,
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      }
    } catch {
      // User cancelled — silent
    }
  };

  return (
    <div style={{
      background: "#EAF7F5",
      border: "1px solid rgba(46,125,122,0.16)",
      borderRadius: 22,
      padding: "20px",
      marginBottom: 24,
      boxShadow: "0 2px 8px rgba(31,41,51,0.04)",
      position: "relative",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: "rgba(46,125,122,0.14)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Sparkles style={{ width: 14, height: 14, color: "#2E7D7A" }} strokeWidth={2} />
        </div>
        <p style={{
          fontSize: 10, fontWeight: 700, color: "#2E7D7A",
          textTransform: "uppercase", letterSpacing: ".1em",
        }}>
          Daily Mindset
        </p>
      </div>

      <p style={{
        fontFamily: "'Lora', Georgia, serif",
        fontSize: 16, lineHeight: 1.55, color: "#1F2933",
        fontWeight: 500, marginBottom: 10, fontStyle: "italic",
      }}>
        "{quote.text}"
      </p>

      <p style={{ fontSize: 12, color: "#4A5763", marginBottom: 16 }}>
        — {quote.author}
      </p>

      <button
        onClick={handleShare}
        style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          padding: "9px 16px", borderRadius: 999,
          background: "#FFFFFF", border: "1px solid rgba(46,125,122,0.22)",
          color: "#2E7D7A", fontSize: 13, fontWeight: 600,
          fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
          transition: "all 0.15s ease",
        }}
      >
        {shared ? (
          <>
            <Check style={{ width: 14, height: 14 }} strokeWidth={2.2} />
            Copied
          </>
        ) : (
          <>
            <Share2 style={{ width: 14, height: 14 }} strokeWidth={2} />
            Share
          </>
        )}
      </button>
    </div>
  );
}