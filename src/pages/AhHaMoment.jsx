import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { Search, Filter, Star, ArrowRight, Loader2, BookOpen, Heart } from "lucide-react";

// ── Constants ──────────────────────────────────────────────────────────────
const C = {
  amber:  "#B8823A",
  muted:  "#9B8E83",
  text:   "#1C1410",
  body:   "#4A3F35",
  card:   { background: "#FDFAF6", border: "1px solid #E8E2D9", borderRadius: 16, boxShadow: "0 1px 6px rgba(28,20,16,0.07)" },
};

export const CATEGORIES = [
  { key: "wake_up_call",       label: "Wake-Up Call",          emoji: "⚡" },
  { key: "rock_bottom",        label: "Rock Bottom",           emoji: "🪨" },
  { key: "my_child_saved_me",  label: "My Child Saved Me",     emoji: "👶" },
  { key: "health_scare",       label: "Health Scare",          emoji: "🏥" },
  { key: "jail_court",         label: "Jail / Court",          emoji: "⚖️" },
  { key: "tired_of_running",   label: "Tired of Running",      emoji: "🏃" },
  { key: "wanted_my_life_back",label: "I Wanted My Life Back", emoji: "🌅" },
  { key: "no_more_excuses",    label: "No More Excuses",       emoji: "🔥" },
];
const catMap = Object.fromEntries(CATEGORIES.map(c => [c.key, c]));

function StoryCard({ story, compact }) {
  const cat = catMap[story.category] || { emoji: "💬", label: story.category };
  const name = story.is_anonymous ? "Anonymous" : (story.display_name || story.user_email?.split("@")[0] || "Member");
  const preview = story.what_happened?.slice(0, compact ? 120 : 200) + (story.what_happened?.length > (compact ? 120 : 200) ? "…" : "");

  return (
    <Link to={`/AhHaDetail?id=${story.id}`} style={{ textDecoration: "none", display: "block" }}>
      <div style={{
        ...C.card, padding: "18px 18px",
        marginBottom: 12, cursor: "pointer",
        transition: "box-shadow 0.15s ease",
      }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(28,20,16,0.1)"; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 6px rgba(28,20,16,0.07)"; }}
      >
        {/* Content warning */}
        {story.has_content_warning && (
          <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8,
            padding: "6px 12px", marginBottom: 12, fontSize: 11, color: "#F87171", fontWeight: 600 }}>
            ⚠️ Content Warning: {story.content_warning || "May contain difficult themes"}
          </div>
        )}

        {/* Category + featured badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 16 }}>{cat.emoji}</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: C.amber, textTransform: "uppercase", letterSpacing: ".08em" }}>
            {cat.label}
          </span>
          {story.is_featured && (
            <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700,
              background: "rgba(184,130,58,0.1)", color: C.amber, padding: "3px 8px",
              borderRadius: 10, border: "1px solid rgba(184,130,58,0.25)", display: "flex", alignItems: "center", gap: 4 }}>
              <Star style={{ width: 9, height: 9 }} /> Featured
            </span>
          )}
        </div>

        {/* Story preview */}
        <p style={{ fontSize: 14, color: C.body, lineHeight: 1.7, marginBottom: 14, fontStyle: "italic" }}>
          "{preview}"
        </p>

        {/* Author + stats */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%",
              background: `${cat.color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>
              {story.is_anonymous ? "🌿" : name[0]?.toUpperCase()}
            </div>
            <p style={{ fontSize: 12, fontWeight: 700, color: C.muted }}>{name}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 12, color: C.muted }}>❤️ {story.reaction_count || 0}</span>
            <span style={{ fontSize: 12, color: C.muted }}>💬 {story.comment_count || 0}</span>
            <ArrowRight style={{ color: C.amber, width: 14, height: 14 }} />
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function AhHaMoment() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: stories = [], isLoading } = useQuery({
    queryKey: ["ahha-moments"],
    queryFn: () => base44.entities.AhHaMoment.filter({ status: "approved" }, "-created_date", 50),
    staleTime: 30_000,
  });

  const featured = useMemo(() => stories.filter(s => s.is_featured).slice(0, 3), [stories]);

  const filtered = useMemo(() => {
    let list = stories;
    if (activeCategory !== "all") list = list.filter(s => s.category === activeCategory);
    if (showFeaturedOnly) list = list.filter(s => s.is_featured);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        s.what_happened?.toLowerCase().includes(q) ||
        s.message_to_others?.toLowerCase().includes(q) ||
        s.display_name?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [stories, activeCategory, showFeaturedOnly, search]);

  return (
    <div style={{ background: "#F7F3EE", minHeight: "100vh", paddingBottom: 110 }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .ah-fadeUp { animation: fadeUp 0.6s cubic-bezier(.22,1,.36,1) both; }
      `}</style>

      <div style={{ maxWidth: 480, margin: "0 auto" }}>

        {/* ── Hero ── */}
        <div style={{ padding: "64px 24px 32px", background: "#FDFAF6", borderBottom: "1px solid #E8E2D9" }}>
          <div className="ah-fadeUp">
            <p style={{ fontSize: 10, fontWeight: 700, color: C.amber, textTransform: "uppercase",
              letterSpacing: ".14em", marginBottom: 10 }}>Ah Ha by Unbound</p>
            <h1 style={{ fontSize: 28, fontWeight: 600, color: "#1C1410", lineHeight: 1.15, marginBottom: 8, fontFamily: "'Lora', Georgia, serif" }}>
              The Ah Ha Moment
            </h1>
            <p style={{ fontSize: 14, color: C.body, lineHeight: 1.65, marginBottom: 24, maxWidth: 340 }}>
              The moment you realized life had to change. Real stories. Real people. No filters.
            </p>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => navigate("/SubmitAhHa")} style={{
                flex: 1, padding: "13px 18px", borderRadius: 14, border: "none", cursor: "pointer",
                background: "#B8823A", color: "#fff", fontWeight: 700, fontSize: 14, minHeight: 44,
              }}>
                Share Your Ah Ha Moment ✨
              </button>
              <button onClick={() => document.getElementById("stories-feed")?.scrollIntoView({ behavior: "smooth" })}
                style={{ padding: "13px 16px", borderRadius: 14, border: "1px solid #E8E2D9",
                  background: "#FDFAF6", color: "#4A3F35",
                  fontWeight: 600, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap", minHeight: 44 }}>
                Read Stories
              </button>
            </div>
          </div>
        </div>

        <div style={{ padding: "0 16px" }}>

          {/* ── Featured strip ── */}
          {featured.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "20px 0 12px" }}>
                <Star style={{ color: C.amber, width: 14, height: 14 }} />
                <p style={{ fontSize: 11, fontWeight: 700, color: C.amber, textTransform: "uppercase", letterSpacing: "1.1px" }}>
                  Featured Stories
                </p>
                <div style={{ flex: 1, height: 1, background: "#E8E2D9" }} />
              </div>
              {featured.map(s => <StoryCard key={s.id} story={s} compact />)}
            </div>
          )}

          {/* ── Search ── */}
          <div style={{ position: "relative", marginBottom: 14 }}>
            <Search style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
              color: "#9B8E83", width: 16, height: 16 }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search stories…"
              style={{
                width: "100%", padding: "13px 14px 13px 40px", borderRadius: 14, boxSizing: "border-box",
                background: "#FDFAF6", border: "1px solid #E8E2D9",
                color: "#1C1410", fontSize: 14, outline: "none",
              }}
            />
          </div>

          {/* ── Category filters ── */}
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 16,
            scrollbarWidth: "none", WebkitScrollbarWidth: "none" }}>
            {[{ key: "all", label: "All Stories", emoji: "✨" }, ...CATEGORIES].map(cat => {
              const active = activeCategory === cat.key;
              return (
                <button key={cat.key} onClick={() => setActiveCategory(cat.key)} style={{
                  flexShrink: 0, padding: "7px 14px", borderRadius: 20, border: "none", cursor: "pointer",
                  background: active ? "#B8823A" : "#FDFAF6",
                  border: `1px solid ${active ? "#B8823A" : "#E8E2D9"}`,
                  color: active ? "#fff" : "#9B8E83", fontWeight: active ? 700 : 500, fontSize: 12,
                  display: "flex", alignItems: "center", gap: 5, minHeight: 36,
                  transition: "all 0.15s ease",
                }}>
                  <span>{cat.emoji}</span> {cat.label}
                </button>
              );
            })}
          </div>

          {/* ── Featured toggle ── */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <button onClick={() => setShowFeaturedOnly(f => !f)} style={{
              padding: "7px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700,
              background: showFeaturedOnly ? "#B8823A" : "#FDFAF6",
              border: `1px solid ${showFeaturedOnly ? "#B8823A" : "#E8E2D9"}`,
              color: showFeaturedOnly ? "#fff" : "#9B8E83", minHeight: 36,
            }}>
              ⭐ Featured only
            </button>
            <p style={{ fontSize: 12, color: "#9B8E83" }}>
              {filtered.length} {filtered.length === 1 ? "story" : "stories"}
            </p>
          </div>

          {/* ── Feed ── */}
          <div id="stories-feed">
            {isLoading ? (
              <div style={{ textAlign: "center", padding: "48px 0" }}>
                <Loader2 className="animate-spin" style={{ color: "#B8823A", width: 28, height: 28, margin: "0 auto" }} />
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", background: "#FDFAF6",
                border: "1px solid #E8E2D9", borderRadius: 16 }}>
                <p style={{ fontSize: 32, marginBottom: 12 }}>🌱</p>
                <p style={{ fontSize: 16, fontWeight: 600, color: "#1C1410", marginBottom: 8, fontFamily: "'Lora', serif" }}>
                  {stories.length === 0 ? "Be the first to share." : "No stories match your search."}
                </p>
                <p style={{ fontSize: 13, color: "#9B8E83", marginBottom: 20, lineHeight: 1.6 }}>
                  {stories.length === 0
                    ? "Your moment could be the one that helps someone take their first step."
                    : "Try a different category or search term."}
                </p>
                {stories.length === 0 && (
                  <button onClick={() => navigate("/SubmitAhHa")} style={{
                    padding: "13px 28px", borderRadius: 12, border: "none", cursor: "pointer",
                    background: "#B8823A", color: "#fff", fontWeight: 700, fontSize: 14, minHeight: 44,
                  }}>
                    Share Your Moment →
                  </button>
                )}
              </div>
            ) : (
              filtered.map(s => <StoryCard key={s.id} story={s} />)
            )}
          </div>

          {/* ── Your story CTA ── */}
          {!isLoading && filtered.length > 0 && (
            <div style={{ marginTop: 8, marginBottom: 16, borderRadius: 16, padding: "24px 20px",
              background: "#FDFAF6", border: "1px solid #E8E2D9", textAlign: "center",
              boxShadow: "0 1px 6px rgba(28,20,16,0.07)" }}>
              <p style={{ fontSize: 16, fontWeight: 600, color: "#1C1410", marginBottom: 6, fontFamily: "'Lora', serif" }}>
                Your story matters too.
              </p>
              <p style={{ fontSize: 13, color: "#9B8E83", marginBottom: 16, lineHeight: 1.6 }}>
                Someone out there is standing at the same fork in the road. Your Ah Ha moment could be their turning point.
              </p>
              <button onClick={() => navigate("/SubmitAhHa")} style={{
                padding: "13px 28px", borderRadius: 12, border: "none", cursor: "pointer",
                background: "#B8823A", color: "#fff", fontWeight: 700, fontSize: 14, minHeight: 44,
              }}>
                Share Your Ah Ha Moment →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}