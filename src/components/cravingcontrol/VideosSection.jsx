import React, { useState } from "react";
import { Play, Bookmark, BookmarkCheck, ExternalLink } from "lucide-react";

const VIDEOS = [
  { id: 1, title: "The Brain in Recovery", channel: "NIDA Science", duration: "8:42", category: "Education", emoji: "🧠", url: "https://www.youtube.com/results?search_query=brain+recovery+addiction+education", desc: "How your brain heals during recovery from addiction." },
  { id: 2, title: "Urge Surfing Technique", channel: "Mindfulness Recovery", duration: "12:15", category: "Technique", emoji: "🌊", url: "https://www.youtube.com/results?search_query=urge+surfing+addiction+recovery", desc: "Learn to ride out cravings without acting on them." },
  { id: 3, title: "I'm 5 Years Sober — My Story", channel: "Recovery Stories", duration: "18:30", category: "Inspiration", emoji: "🌟", url: "https://www.youtube.com/results?search_query=5+years+sober+personal+story+recovery", desc: "A personal transformation story from someone who made it through." },
  { id: 4, title: "What Triggers Really Are", channel: "The Recovery Coach", duration: "9:22", category: "Education", emoji: "⚡", url: "https://www.youtube.com/results?search_query=addiction+triggers+explained+recovery", desc: "Understanding your triggers is the first step to mastering them." },
  { id: 5, title: "Relapse Prevention Tools", channel: "SMART Recovery", duration: "14:50", category: "Technique", emoji: "🛡️", url: "https://www.youtube.com/results?search_query=relapse+prevention+tools+SMART+recovery", desc: "Evidence-based tools to protect your sobriety." },
  { id: 6, title: "Finding Purpose in Recovery", channel: "Sober Stories", duration: "22:10", category: "Inspiration", emoji: "🎯", url: "https://www.youtube.com/results?search_query=finding+purpose+meaning+recovery+sobriety", desc: "How people rebuild meaning and purpose in their lives." },
  { id: 7, title: "Mindfulness for Addiction", channel: "Mindfulness Works", duration: "16:05", category: "Technique", emoji: "🧘", url: "https://www.youtube.com/results?search_query=mindfulness+meditation+addiction+recovery", desc: "Using mindfulness as a daily recovery tool." },
  { id: 8, title: "From Rock Bottom to Thriving", channel: "Real Recovery", duration: "31:20", category: "Inspiration", emoji: "🦅", url: "https://www.youtube.com/results?search_query=rock+bottom+to+thriving+recovery+transformation", desc: "A raw, honest story of what recovery really looks like." },
];

const CATEGORIES = ["All", "Education", "Inspiration", "Technique"];

const CATEGORY_COLORS = {
  Education: { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE" },
  Inspiration: { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A" },
  Technique: { bg: "#F0FDF4", color: "#065F46", border: "#A7F3D0" },
};

export default function VideosSection() {
  const [filter, setFilter] = useState("All");
  const [saved, setSaved] = useState(new Set());

  const filtered = filter === "All" ? VIDEOS : VIDEOS.filter(v => v.category === filter);

  return (
    <div style={{ padding: "24px 20px", maxWidth: 560, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 42, marginBottom: 8 }}>🎬</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#1A3C2E", marginBottom: 4 }}>Recovery Videos</h2>
        <p style={{ fontSize: 14, color: "#6B7280" }}>Stories, science, and strategies for your journey.</p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setFilter(c)} style={{
            background: filter === c ? "#2E7D5E" : "#FFF", color: filter === c ? "#FFF" : "#6B7280",
            border: "1px solid", borderColor: filter === c ? "#2E7D5E" : "#E5E7EB",
            borderRadius: 20, padding: "7px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
          }}>
            {c}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map(v => {
          const cat = CATEGORY_COLORS[v.category] || {};
          const isSaved = saved.has(v.id);
          return (
            <div key={v.id} style={{ background: "#FFF", border: "1px solid #E5E7EB", borderRadius: 18, padding: "18px 18px", display: "flex", gap: 14 }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: cat.bg || "#F3F4F6", border: `1px solid ${cat.border || "#E5E7EB"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 26 }}>
                {v.emoji}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                  <p style={{ fontWeight: 700, fontSize: 14, color: "#1A3C2E", lineHeight: 1.4 }}>{v.title}</p>
                  <button onClick={() => setSaved(s => { const ns = new Set(s); isSaved ? ns.delete(v.id) : ns.add(v.id); return ns; })} style={{ background: "none", border: "none", cursor: "pointer", flexShrink: 0, padding: 2 }}>
                    {isSaved ? <BookmarkCheck className="w-4 h-4" style={{ color: "#2E7D5E" }} /> : <Bookmark className="w-4 h-4" style={{ color: "#D1D5DB" }} />}
                  </button>
                </div>
                <p style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 6 }}>{v.channel} · {v.duration}</p>
                <p style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.5, marginBottom: 10 }}>{v.desc}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: cat.color, background: cat.bg, border: `1px solid ${cat.border}`, borderRadius: 8, padding: "2px 8px" }}>{v.category}</span>
                  <a href={v.url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 5, background: "#2E7D5E", color: "#FFF", borderRadius: 8, padding: "5px 12px", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
                    <Play className="w-3 h-3" /> Watch
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}