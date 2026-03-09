import React, { useState } from "react";
import { Play, Heart } from "lucide-react";

const VIDEOS = [
  {
    id: "v1",
    title: "You Are Not Your Addiction",
    category: "Personal Story",
    duration: "8:42",
    thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    desc: "A powerful story of transformation and what it means to reclaim your identity.",
  },
  {
    id: "v2",
    title: "What Happens to Your Brain in Recovery",
    category: "Education",
    duration: "5:15",
    thumbnail: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&q=80",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    desc: "Science-backed look at how the brain heals during sobriety. It gets better.",
  },
  {
    id: "v3",
    title: "365 Days Sober: My Journey",
    category: "Personal Story",
    duration: "12:00",
    thumbnail: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400&q=80",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    desc: "Real talk about early recovery struggles and what kept one person going.",
  },
  {
    id: "v4",
    title: "Understanding Relapse Triggers",
    category: "Education",
    duration: "6:30",
    thumbnail: "https://images.unsplash.com/photo-1455849318743-b2233052fcff?w=400&q=80",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    desc: "Identify what sets off cravings and how to create space before reacting.",
  },
  {
    id: "v5",
    title: "How to Manage Cravings in the Moment",
    category: "Tools",
    duration: "4:50",
    thumbnail: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400&q=80",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    desc: "Practical techniques that work when the urge hits hardest.",
  },
];

const CATEGORY_COLORS = {
  "Personal Story": "#3B82F6",
  "Education": "#10B981",
  "Tools": "#8B5CF6",
};

export default function CccVideos() {
  const [favorites, setFavorites] = useState(new Set());
  const [filter, setFilter] = useState("All");

  const categories = ["All", "Personal Story", "Education", "Tools"];
  const filtered = filter === "All" ? VIDEOS : VIDEOS.filter(v => v.category === filter);

  const toggleFav = (id) => {
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1E3A5F", marginBottom: 4 }}>Recovery Videos</h2>
      <p style={{ color: "#5A7A9A", fontSize: 14, marginBottom: 20 }}>Real stories. Real science. Real tools for real moments.</p>

      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            style={{
              padding: "6px 14px",
              borderRadius: 20,
              border: "1px solid #CBD5E1",
              background: filter === c ? "#1E4A72" : "#FFFFFF",
              color: filter === c ? "#FFFFFF" : "#475569",
              fontWeight: 600,
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            {c}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {filtered.map(v => {
          const catColor = CATEGORY_COLORS[v.category] || "#3B82F6";
          return (
            <div key={v.id} style={{ background: "#FFFFFF", borderRadius: 16, overflow: "hidden", border: "1px solid #E2E8F0" }}>
              <div style={{ position: "relative" }}>
                <img src={v.thumbnail} alt={v.title} style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }} />
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <a href={v.url} target="_blank" rel="noreferrer" style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(255,255,255,0.9)", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
                    <Play className="w-5 h-5" style={{ color: "#1E4A72", marginLeft: 3 }} />
                  </a>
                </div>
                <span style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(0,0,0,0.6)", color: "#FFF", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6 }}>
                  {v.duration}
                </span>
              </div>
              <div style={{ padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: catColor, background: `${catColor}15`, padding: "2px 8px", borderRadius: 12, marginBottom: 6, display: "inline-block" }}>
                      {v.category}
                    </span>
                    <p style={{ fontWeight: 700, fontSize: 15, color: "#1E293B", marginBottom: 4, lineHeight: 1.3 }}>{v.title}</p>
                    <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.5 }}>{v.desc}</p>
                  </div>
                  <button onClick={() => toggleFav(v.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, flexShrink: 0 }}>
                    <Heart className="w-5 h-5" style={{ color: favorites.has(v.id) ? "#EF4444" : "#CBD5E1", fill: favorites.has(v.id) ? "#EF4444" : "none" }} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}