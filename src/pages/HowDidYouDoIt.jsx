import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Heart, Bookmark, Filter, ArrowRight, Loader2, Search } from "lucide-react";

const C = {
  teal:    "#2DD4BF",
  indigo:  "#6366F1",
  purple:  "#8B5CF6",
  emerald: "#10B981",
  amber:   "#F59E0B",
  muted:   "rgba(241,245,249,0.4)",
  glass:   { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18 },
};

const SUBSTANCE_LABELS = {
  alcohol:            { label: "Alcohol",              color: "#F97316" },
  opioids:            { label: "Opioids",              color: "#F43F5E" },
  stimulants:         { label: "Stimulants",           color: "#F59E0B" },
  benzodiazepines:    { label: "Benzos",               color: "#8B5CF6" },
  cannabis:           { label: "Cannabis",             color: "#10B981" },
  prescription_misuse:{ label: "Prescription Misuse",  color: "#6366F1" },
  polysubstance:      { label: "Polysubstance",        color: "#EC4899" },
  other:              { label: "Other",                color: "#94A3B8" },
  prefer_not_to_say:  { label: "Anonymous",            color: "#64748B" },
};

const FILTERS = [
  { key: "all",            label: "All Stories"       },
  { key: "most_helpful",   label: "Most Helpful"      },
  { key: "relapse_comeback", label: "Relapse Comeback" },
  { key: "after_rehab",    label: "After Rehab"       },
  { key: "alcohol",        label: "Alcohol"           },
  { key: "opioids",        label: "Opioids"           },
  { key: "polysubstance",  label: "Polysubstance"     },
  { key: "mental_health",  label: "Mental Health"     },
  { key: "family",         label: "Family"            },
  { key: "faith",          label: "Faith"             },
  { key: "work",           label: "Finding Work"      },
];

function TestimonialCard({ story, reactions }) {
  const sub = SUBSTANCE_LABELS[story.substance_category] || SUBSTANCE_LABELS.other;
  const helpfulCount = story.helpful_count || 0;
  const preview = story.ai_summary || story.body?.slice(0, 160);

  return (
    <Link to={`/TestimonialDetail?id=${story.id}`} style={{ textDecoration: "none", display: "block" }}>
      <div style={{
        borderRadius: 20, padding: "20px", marginBottom: 12,
        background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
        transition: "border-color 0.15s ease",
      }}>
        {/* Tags row */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
          {story.substance_category && (
            <span style={{
              padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700,
              background: `${sub.color}15`, color: sub.color, border: `1px solid ${sub.color}30`,
            }}>{sub.label}</span>
          )}
          {story.sober_time && (
            <span style={{
              padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700,
              background: "rgba(45,212,191,0.1)", color: C.teal, border: "1px solid rgba(45,212,191,0.25)",
            }}>🕊️ {story.sober_time}</span>
          )}
          {story.is_relapse_comeback && (
            <span style={{
              padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700,
              background: "rgba(245,158,11,0.1)", color: C.amber, border: "1px solid rgba(245,158,11,0.25)",
            }}>💪 Relapse Comeback</span>
          )}
          {(story.ai_tags || []).slice(0, 2).map(tag => (
            <span key={tag} style={{
              padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 600,
              background: "rgba(255,255,255,0.05)", color: C.muted, border: "1px solid rgba(255,255,255,0.08)",
            }}>{tag}</span>
          ))}
        </div>

        <h3 style={{ fontSize: 16, fontWeight: 800, color: "#fff", marginBottom: 6, lineHeight: 1.3 }}>
          {story.title}
        </h3>

        <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.65, marginBottom: 14,
          overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>
          {preview}…
        </p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
              background: "rgba(99,102,241,0.15)", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12 }}>
              {story.is_anonymous ? "🙏" : (story.display_name?.[0] || "?")}
            </div>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>
              {story.is_anonymous ? "Anonymous" : (story.display_name || "Member")}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Heart style={{ color: C.muted, width: 13, height: 13 }} />
              <p style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>{helpfulCount} helped</p>
            </div>
            <span style={{ fontSize: 12, color: C.teal, fontWeight: 700 }}>Read Story →</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function HowDidYouDoIt() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const { data: stories = [], isLoading } = useQuery({
    queryKey: ["testimonials-feed"],
    queryFn: () => base44.entities.Testimonial.filter({ status: "approved" }, "-helpful_count", 50),
    staleTime: 60_000,
  });

  const filtered = useMemo(() => {
    let list = stories;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(s => s.title?.toLowerCase().includes(q) || s.body?.toLowerCase().includes(q) || s.ai_summary?.toLowerCase().includes(q));
    }
    if (filter === "most_helpful") return [...list].sort((a, b) => (b.helpful_count || 0) - (a.helpful_count || 0));
    if (filter === "relapse_comeback") return list.filter(s => s.is_relapse_comeback);
    if (filter === "after_rehab") return list.filter(s => (s.ai_tags || []).includes("after rehab") || (s.discharge_setting));
    if (filter === "mental_health") return list.filter(s => (s.ai_tags || []).some(t => t.toLowerCase().includes("mental") || t.toLowerCase().includes("therapy") || t.toLowerCase().includes("anxiety")));
    if (filter === "family") return list.filter(s => (s.ai_tags || []).some(t => t.toLowerCase().includes("family")));
    if (filter === "faith") return list.filter(s => (s.ai_tags || []).some(t => t.toLowerCase().includes("faith") || t.toLowerCase().includes("spiritual")));
    if (filter === "work") return list.filter(s => (s.ai_tags || []).some(t => t.toLowerCase().includes("work") || t.toLowerCase().includes("job") || t.toLowerCase().includes("employment")));
    if (SUBSTANCE_LABELS[filter]) return list.filter(s => s.substance_category === filter);
    return list;
  }, [stories, filter, search]);

  return (
    <div style={{ background: "linear-gradient(170deg,#07090F 0%,#0A0F1A 100%)", minHeight: "100vh", paddingBottom: 110 }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ padding: "60px 20px 24px", background: "linear-gradient(155deg,#0D1028,#080E1C)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -80, right: -60, width: 280, height: 280, borderRadius: "50%",
            background: "radial-gradient(circle,rgba(45,212,191,0.08) 0%,transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: C.teal, textTransform: "uppercase",
              letterSpacing: ".12em", marginBottom: 6 }}>Community</p>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: "#fff", marginBottom: 6, lineHeight: 1.15 }}>
              How'd You Do It?
            </h1>
            <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.65, marginBottom: 20 }}>
              Real stories from real people in recovery. Learn, find hope, feel less alone.
            </p>

            {/* Search */}
            <div style={{ display: "flex", alignItems: "center", gap: 10,
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 14, padding: "11px 14px" }}>
              <Search style={{ color: C.muted, width: 15, height: 15, flexShrink: 0 }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search stories…"
                style={{ background: "none", border: "none", color: "#fff", fontSize: 14,
                  outline: "none", flex: 1, minWidth: 0 }}
              />
            </div>
          </div>
        </div>

        <div style={{ padding: "0 16px" }}>

          {/* Share CTA */}
          <div onClick={() => navigate("/SubmitTestimonial")} style={{ cursor: "pointer",
            borderRadius: 20, padding: "18px 20px", margin: "16px 0",
            background: "linear-gradient(135deg,rgba(99,102,241,0.12),rgba(139,92,246,0.08))",
            border: "2px solid rgba(99,102,241,0.3)",
            display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 46, height: 46, borderRadius: 15, flexShrink: 0,
              background: "rgba(99,102,241,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 22 }}>✍️</span>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 15, fontWeight: 900, color: "#fff", marginBottom: 2 }}>Share Your Story</p>
              <p style={{ fontSize: 12, color: C.muted }}>Your experience could be exactly what someone needs to hear.</p>
            </div>
            <ArrowRight style={{ color: "#818CF8", width: 16, height: 16, flexShrink: 0 }} />
          </div>

          {/* Filters */}
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, marginBottom: 16,
            msOverflowStyle: "none", scrollbarWidth: "none" }}>
            {FILTERS.map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)} style={{
                flexShrink: 0, padding: "8px 14px", borderRadius: 20, border: "none", cursor: "pointer",
                background: filter === f.key ? "rgba(45,212,191,0.15)" : "rgba(255,255,255,0.05)",
                border: `1.5px solid ${filter === f.key ? "rgba(45,212,191,0.4)" : "rgba(255,255,255,0.08)"}`,
                color: filter === f.key ? C.teal : C.muted,
                fontWeight: filter === f.key ? 700 : 500, fontSize: 13,
                transition: "all 0.15s ease",
              }}>{f.label}</button>
            ))}
          </div>

          {/* Story count */}
          <p style={{ fontSize: 11, color: C.muted, fontWeight: 600, marginBottom: 14, textTransform: "uppercase", letterSpacing: ".06em" }}>
            {isLoading ? "Loading…" : `${filtered.length} ${filtered.length === 1 ? "story" : "stories"}`}
          </p>

          {isLoading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}>
              <Loader2 style={{ color: C.teal, width: 26, height: 26 }} className="animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 20px", ...C.glass }}>
              <p style={{ fontSize: 40, marginBottom: 12 }}>🌱</p>
              <p style={{ fontSize: 16, fontWeight: 800, color: "#fff", marginBottom: 6 }}>No stories here yet</p>
              <p style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>
                {filter === "all" ? "Be the first to share your recovery journey." : "Try a different filter or be the first to share in this category."}
              </p>
              <button onClick={() => navigate("/SubmitTestimonial")} style={{
                padding: "12px 24px", borderRadius: 12, border: "none", cursor: "pointer",
                background: `linear-gradient(135deg,${C.indigo},${C.purple})`,
                color: "#fff", fontWeight: 800, fontSize: 14,
              }}>Share Your Story</button>
            </div>
          ) : (
            filtered.map(story => (
              <TestimonialCard key={story.id} story={story} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}