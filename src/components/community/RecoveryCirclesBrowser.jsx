import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Search, X, Users, Star, ChevronRight, Sparkles } from "lucide-react";
import { CIRCLES, CIRCLE_CATEGORIES, getRecommendedCircles } from "./circlesData";

const C = {
  teal:  "#3ECFBF",
  muted: "rgba(255,255,255,0.3)",
  slate: "rgba(255,255,255,0.6)",
};

function CircleCard({ circle, joined, onJoin, onLeave, onOpen }) {
  return (
    <div
      style={{
        background: joined ? `${circle.color}0D` : "rgba(255,255,255,0.04)",
        border: `1px solid ${joined ? `${circle.color}40` : "rgba(255,255,255,0.09)"}`,
        borderRadius: 18, padding: "16px", cursor: "pointer",
        transition: "box-shadow 0.15s",
      }}
      onClick={() => onOpen(circle)}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14, flexShrink: 0,
            background: `${circle.color}20`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
          }}>
            {circle.emoji}
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>{circle.name}</p>
            {circle.sensitive && (
              <span style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8",
                background: "rgba(148,163,184,0.12)", padding: "2px 7px", borderRadius: 20 }}>
                🔒 Sensitive
              </span>
            )}
          </div>
        </div>
        <button
          onClick={e => { e.stopPropagation(); joined ? onLeave(circle.id) : onJoin(circle.id); }}
          style={{
            padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer",
            background: joined ? "rgba(255,255,255,0.06)" : `${circle.color}20`,
            border: `1px solid ${joined ? "rgba(255,255,255,0.12)" : `${circle.color}50`}`,
            color: joined ? C.muted : circle.color,
            flexShrink: 0,
          }}
        >
          {joined ? "Joined ✓" : "Join"}
        </button>
      </div>

      <p style={{ fontSize: 12, color: C.muted, marginBottom: 10, fontStyle: "italic" }}>{circle.tagline}</p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
        {circle.topics.slice(0, 3).map(t => (
          <span key={t} style={{
            fontSize: 11, padding: "3px 9px", borderRadius: 20,
            background: `${circle.color}12`, color: circle.color,
            border: `1px solid ${circle.color}25`, fontWeight: 600,
          }}>
            {t}
          </span>
        ))}
        {circle.topics.length > 3 && (
          <span style={{ fontSize: 11, color: C.muted, padding: "3px 4px" }}>+{circle.topics.length - 3}</span>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", marginTop: 10 }}>
        <span style={{ fontSize: 12, color: C.muted, display: "flex", alignItems: "center", gap: 4 }}>
          View Circle <ChevronRight style={{ width: 12, height: 12 }} />
        </span>
      </div>
    </div>
  );
}

export default function RecoveryCirclesBrowser({ joinedIds, onJoin, onLeave, onOpenCircle }) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });
  const { data: profile } = useQuery({
    queryKey: ["participant-profile", user?.email],
    queryFn: () => base44.entities.ParticipantProfile.filter({ participant_email: user.email }),
    enabled: !!user?.email,
    select: d => d?.[0],
  });

  const recommended = useMemo(() => getRecommendedCircles(profile), [profile]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return CIRCLES.filter(c => {
      const matchCat = activeCategory === "all" || c.category === activeCategory;
      const matchSearch = !q || c.name.toLowerCase().includes(q) || c.tagline.toLowerCase().includes(q) || c.topics.some(t => t.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [search, activeCategory]);

  const myCircles = CIRCLES.filter(c => joinedIds.includes(c.id));

  return (
    <div>
      {/* Search */}
      <div style={{ position: "relative", marginBottom: 12 }}>
        <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
          width: 15, height: 15, color: C.muted }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search circles by name or topic…"
          style={{
            width: "100%", padding: "11px 36px 11px 36px",
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12, color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box",
          }}
        />
        {search && (
          <button onClick={() => setSearch("")} style={{ position: "absolute", right: 10, top: "50%",
            transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer",
            color: C.muted, padding: 4 }}>
            <X style={{ width: 13, height: 13 }} />
          </button>
        )}
      </div>

      {/* Category filters */}
      <div style={{ display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none", marginBottom: 16, paddingBottom: 2 }}>
        <button
          onClick={() => setActiveCategory("all")}
          style={{
            padding: "7px 14px", borderRadius: 20, border: "none", cursor: "pointer", flexShrink: 0,
            background: activeCategory === "all" ? C.teal : "rgba(255,255,255,0.07)",
            color: activeCategory === "all" ? "#fff" : C.muted,
            fontWeight: 700, fontSize: 12,
          }}
        >
          All
        </button>
        {CIRCLE_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            style={{
              padding: "7px 14px", borderRadius: 20, border: "none", cursor: "pointer", flexShrink: 0, whiteSpace: "nowrap",
              background: activeCategory === cat.id ? cat.color : "rgba(255,255,255,0.07)",
              color: activeCategory === cat.id ? "#fff" : C.muted,
              fontWeight: 700, fontSize: 12,
              boxShadow: activeCategory === cat.id ? `0 4px 12px ${cat.color}30` : "none",
            }}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {/* My Circles */}
      {myCircles.length > 0 && !search && activeCategory === "all" && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <Users style={{ width: 12, height: 12, color: C.teal }} />
            <p style={{ fontSize: 11, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: ".08em" }}>
              My Circles
            </p>
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {myCircles.map(c => (
              <CircleCard key={c.id} circle={c} joined onJoin={onJoin} onLeave={onLeave} onOpen={onOpenCircle} />
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {!search && activeCategory === "all" && myCircles.length === 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <Sparkles style={{ width: 12, height: 12, color: "#FBBF24" }} />
            <p style={{ fontSize: 11, fontWeight: 700, color: "#FBBF24", textTransform: "uppercase", letterSpacing: ".08em" }}>
              Suggested for You
            </p>
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {recommended.map(c => (
              <CircleCard key={c.id} circle={c} joined={joinedIds.includes(c.id)}
                onJoin={onJoin} onLeave={onLeave} onOpen={onOpenCircle} />
            ))}
          </div>
        </div>
      )}

      {/* Category sections when browsing all */}
      {activeCategory === "all" && !search ? (
        CIRCLE_CATEGORIES.map(cat => {
          const catCircles = CIRCLES.filter(c => c.category === cat.id);
          return (
            <div key={cat.id} style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 16 }}>{cat.emoji}</span>
                <p style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>{cat.label}</p>
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)", marginLeft: 4 }} />
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                {catCircles.map(c => (
                  <CircleCard key={c.id} circle={c} joined={joinedIds.includes(c.id)}
                    onJoin={onJoin} onLeave={onLeave} onOpen={onOpenCircle} />
                ))}
              </div>
            </div>
          );
        })
      ) : (
        <div>
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 20px",
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18 }}>
              <p style={{ fontSize: 22, marginBottom: 8 }}>🔍</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>No circles found</p>
              <p style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Try a different search or category</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              {filtered.map(c => (
                <CircleCard key={c.id} circle={c} joined={joinedIds.includes(c.id)}
                  onJoin={onJoin} onLeave={onLeave} onOpen={onOpenCircle} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}