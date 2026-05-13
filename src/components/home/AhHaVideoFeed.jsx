import React from "react";
import { Link } from "react-router-dom";
import { Play, Video } from "lucide-react";

const stories = [
  "The moment I chose myself again",
  "I called someone instead of using",
  "From court date to clean date",
];

export default function AhHaVideoFeed() {
  return (
    <section style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "end", marginBottom: 16 }}>
        <div>
          <p className="section-label">Community Proof</p>
          <h2 style={{ fontSize: "clamp(30px, 4vw, 48px)", margin: 0 }}>Ah Ha Moment video stories</h2>
        </div>
        <Link to="/AhHaCommunity" style={{ textDecoration: "none" }}><button className="btn-ghost">View Feed</button></Link>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {stories.map((story, index) => (
          <Link key={story} to="/AhHaCommunity" style={{ textDecoration: "none" }}>
            <article className="video-story-card" style={{ minHeight: 260, padding: 18, borderRadius: 28, overflow: "hidden", position: "relative", color: "var(--text)", background: `linear-gradient(135deg, rgba(91,141,239,${0.18 + index * .04}), rgba(13,18,32,0.82)), url(https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80) center/cover`, border: "1px solid var(--border)" }}>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent, rgba(7,10,20,0.86))" }} />
              <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", display: "grid", placeItems: "center", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.22)", backdropFilter: "blur(12px)" }}><Play size={20} fill="currentColor" /></div>
                <div>
                  <span className="pill pill-ghost"><Video size={12} style={{ marginRight: 6 }} /> Video Story</span>
                  <h3 style={{ fontSize: 23, lineHeight: 1.1, margin: "12px 0 0" }}>{story}</h3>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
      <style>{`.video-story-card { transition: transform .22s, box-shadow .22s; } .video-story-card:hover { transform: translateY(-5px); box-shadow: var(--glow), var(--shadow-card); } @media (max-width: 860px) { section [style*="repeat(3"] { grid-template-columns: 1fr !important; } }`}</style>
    </section>
  );
}