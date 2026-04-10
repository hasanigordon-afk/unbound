import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { Search, Filter, Star, ArrowRight, Loader2, BookOpen, Heart } from "lucide-react";

// ── Constants ──────────────────────────────────────────────────────────────
const C = {
  teal:    "#2DD4BF",
  gold:    "#C9A96E",
  indigo:  "#6366F1",
  emerald: "#10B981",
  rose:    "#F472B6",
  amber:   "#F59E0B",
  muted:   "rgba(241,245,249,0.38)",
  glass:   { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(16px)" },
};

export const CATEGORIES = [
  { key: "wake_up_call",       label: "Wake-Up Call",          emoji: "⚡", color: "#F59E0B" },
  { key: "rock_bottom",        label: "Rock Bottom",           emoji: "🪨", color: "#94A3B8" },
  { key: "my_child_saved_me",  label: "My Child Saved Me",     emoji: "👶", color: "#F472B6" },
  { key: "health_scare",       label: "Health Scare",          emoji: "🏥", color: "#EF4444" },
  { key: "jail_court",         label: "Jail / Court",          emoji: "⚖️", color: "#8B5CF6" },
  { key: "tired_of_running",   label: "Tired of Running",      emoji: "🏃", color: "#6366F1" },
  { key: "wanted_my_life_back",label: "I Wanted My Life Back", emoji: "🌅", color: "#10B981" },
  { key: "no_more_excuses",    label: "No More Excuses",       emoji: "🔥", color: "#2DD4BF" },
];
const catMap = Object.fromEntries(CATEGORIES.map(c => [c.key, c]));

function StoryCard({ story, compact }) {
  const cat = catMap[story.category] || { emoji: "💬", label: story.category, color: C.teal };
  const name = story.is_anonymous ? "Anonymous" : (story.display_name || story.user_email?.split("@")[0] || "Member");
  const preview = story.what_happened?.slice(0, compact ? 120 : 200) + (story.what_happened?.length > (compact ? 120 : 200) ? "…" : "");

  return (
    <Link to={`/AhHaDetail?id=${story.id}`} style={{ textDecoration: "none", display: "block" }}>
      <div style={{
        ...C.glass, borderRadius: 22, padding: "20px 20px",
        marginBottom: 14, cursor: "pointer",
        borderColor: `${cat.color}25`,
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
      }}
        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 32px rgba(0,0,0,0.3)`; }}
        onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
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
          <span style={{ fontSize: 11, fontWeight: 700, color: cat.color, textTransform: "uppercase", letterSpacing: ".08em" }}>
            {cat.label}
          </span>
          {story.is_featured && (
            <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700,
              background: "rgba(201,169,110,0.15)", color: C.gold, padding: "3px 8px",
              borderRadius: 10, border: "1px solid rgba(201,169,110,0.3)", display: "flex", alignItems: "center", gap: 4 }}>
              <Star style={{ width: 9, height: 9 }} /> Featured
            </span>
          )}
        </div>

        {/* Story preview */}
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.82)", lineHeight: 1.7, marginBottom: 14, fontStyle: "italic" }}>
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
            <ArrowRight style={{ color: cat.color, width: 14, height: 14 }} />
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
    <div style={{ background: "linear-gradient(170deg,#07090F 0%,#0B1020 100%)", minHeight: "100vh", paddingBottom: 110 }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .ah-fadeUp { animation: fadeUp 0.6s cubic-bezier(.22,1,.36,1) both; }
      `}</style>

      <div style={{ maxWidth: 480, margin: "0 auto" }}>

        {/* ── Hero ── */}
        <div style={{ padding: "64px 24px 32px", position: "relative", overflow: "hidden",
          background: "linear-gradient(155deg,#0A1628 0%,#080E1C 100%)" }}>
          <div style={{ position: "absolute", top: -80, right: -80, width: 320, height: 320, borderRadius: "50%",
            background: "radial-gradient(circle,rgba(201,169,110,0.09) 0%,transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -40, left: -40, width: 240, height: 200, borderRadius: "50%",
            background: "radial-gradient(circle,rgba(45,212,191,0.07) 0%,transparent 70%)", pointerEvents: "none" }} />

          <div style={{ position: "relative", zIndex: 1 }} className="ah-fadeUp">
            <p style={{ fontSize: 10, fontWeight: 800, color: "rgba(201,169,110,0.7)", textTransform: "uppercase",
              letterSpacing: ".14em", marginBottom: 10 }}>Ah Ha by Unbound</p>
            <h1 style={{ fontSize: 30, fontWeight: 900, color: "#fff", lineHeight: 1.15, marginBottom: 8, letterSpacing: "-.4px" }}>
              The Ah Ha Moment
            </h1>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", lineHeight: 1.65, marginBottom: 28, maxWidth: 340 }}>
              The moment you realized life had to change. Real stories. Real people. No filters.
            </p>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => navigate("/SubmitAhHa")} style={{
                flex: 1, padding: "14px 18px", borderRadius: 14, border: "none", cursor: "pointer",
                background: "linear-gradient(135deg,#C9A96E,#B8935A)",
                color: "#07090F", fontWeight: 800, fontSize: 14,
                boxShadow: "0 6px 24px rgba(201,169,110,0.28)",
              }}>
                Share Your Ah Ha Moment ✨
              </button>
              <button onClick={() => document.getElementById("stories-feed")?.scrollIntoView({ behavior: "smooth" })}
                style={{ padding: "14px 16px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.6)",
                  fontWeight: 700, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>
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
                <Star style={{ color: C.gold, width: 14, height: 14 }} />
                <p style={{ fontSize: 11, fontWeight: 700, color: C.gold, textTransform: "uppercase", letterSpacing: "1.1px" }}>
                  Featured Stories
                </p>
                <div style={{ flex: 1, height: 1, background: "rgba(201,169,110,0.15)" }} />
              </div>
              {featured.map(s => <StoryCard key={s.id} story={s} compact />)}
            </div>
          )}

          {/* ── Search ── */}
          <div style={{ position: "relative", marginBottom: 14 }}>
            <Search style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
              color: C.muted, width: 16, height: 16 }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search stories…"
              style={{
                width: "100%", padding: "13px 14px 13px 40px", borderRadius: 14, boxSizing: "border-box",
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)",
                color: "#fff", fontSize: 14, outline: "none",
              }}
            />
          </div>

          {/* ── Category filters ── */}
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 16,
            scrollbarWidth: "none", WebkitScrollbarWidth: "none" }}>
            {[{ key: "all", label: "All Stories", emoji: "✨", color: C.teal }, ...CATEGORIES].map(cat => {
              const active = activeCategory === cat.key;
              return (
                <button key={cat.key} onClick={() => setActiveCategory(cat.key)} style={{
                  flexShrink: 0, padding: "7px 14px", borderRadius: 20, border: "none", cursor: "pointer",
                  background: active ? `${cat.color}20` : "rgba(255,255,255,0.04)",
                  border: `1.5px solid ${active ? `${cat.color}50` : "rgba(255,255,255,0.07)"}`,
                  color: active ? cat.color : C.muted, fontWeight: active ? 700 : 500, fontSize: 12,
                  display: "flex", alignItems: "center", gap: 5,
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
              background: showFeaturedOnly ? "rgba(201,169,110,0.15)" : "rgba(255,255,255,0.04)",
              border: `1.5px solid ${showFeaturedOnly ? "rgba(201,169,110,0.4)" : "rgba(255,255,255,0.07)"}`,
              color: showFeaturedOnly ? C.gold : C.muted,
            }}>
              ⭐ Featured only
            </button>
            <p style={{ fontSize: 12, color: C.muted }}>
              {filtered.length} {filtered.length === 1 ? "story" : "stories"}
            </p>
          </div>

          {/* ── Feed ── */}
          <div id="stories-feed">
            {isLoading ? (
              <div style={{ textAlign: "center", padding: "48px 0" }}>
                <Loader2 className="animate-spin" style={{ color: C.teal, width: 28, height: 28, margin: "0 auto" }} />
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 20px", ...C.glass, borderRadius: 22 }}>
                <p style={{ fontSize: 32, marginBottom: 12 }}>🌱</p>
                <p style={{ fontSize: 16, fontWeight: 800, color: "#fff", marginBottom: 8 }}>
                  {stories.length === 0 ? "Be the first to share." : "No stories match your search."}
                </p>
                <p style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>
                  {stories.length === 0
                    ? "Your moment could be the one that helps someone take their first step."
                    : "Try a different category or search term."}
                </p>
                {stories.length === 0 && (
                  <button onClick={() => navigate("/SubmitAhHa")} style={{
                    padding: "13px 28px", borderRadius: 13, border: "none", cursor: "pointer",
                    background: "linear-gradient(135deg,#C9A96E,#B8935A)",
                    color: "#07090F", fontWeight: 800, fontSize: 14,
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
            <div style={{ marginTop: 8, marginBottom: 16, borderRadius: 22, padding: "24px 22px",
              background: "linear-gradient(135deg,rgba(201,169,110,0.08),rgba(45,212,191,0.04))",
              border: "1.5px solid rgba(201,169,110,0.2)", textAlign: "center" }}>
              <p style={{ fontSize: 16, fontWeight: 800, color: "#fff", marginBottom: 6 }}>
                Your story matters too.
              </p>
              <p style={{ fontSize: 13, color: C.muted, marginBottom: 16, lineHeight: 1.6 }}>
                Someone out there is standing at the same fork in the road. Your Ah Ha moment could be their turning point.
              </p>
              <button onClick={() => navigate("/SubmitAhHa")} style={{
                padding: "13px 28px", borderRadius: 13, border: "none", cursor: "pointer",
                background: "linear-gradient(135deg,#C9A96E,#B8935A)",
                color: "#07090F", fontWeight: 800, fontSize: 14,
                boxShadow: "0 4px 20px rgba(201,169,110,0.25)",
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