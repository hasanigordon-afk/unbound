import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Search, Plus, Star, TrendingUp, Filter, X, Loader2, ChevronDown } from "lucide-react";
import FacilityReviewCard from "@/components/reviews/FacilityReviewCard";
import WriteReviewModal from "@/components/reviews/WriteReviewModal";

const SCORE_FILTERS = [
  { label: "All Scores", value: "all" },
  { label: "🌟 Excellent (8–10)", value: "high" },
  { label: "👍 Good (5–7)", value: "mid" },
  { label: "⚠️ Poor (1–4)", value: "low" },
];

const SORT_OPTIONS = [
  { label: "Most Recent", value: "recent" },
  { label: "Highest Score", value: "highest" },
  { label: "Lowest Score", value: "lowest" },
  { label: "Most Helpful", value: "helpful" },
];

function StatPill({ emoji, label, value, color }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "12px 10px", background: color + "10",
      border: `1px solid ${color}25`, borderRadius: 12, flex: 1,
    }}>
      <span style={{ fontSize: 20, marginBottom: 3 }}>{emoji}</span>
      <span style={{ fontSize: 18, fontWeight: 900, color, lineHeight: 1 }}>{value}</span>
      <span style={{ fontSize: 10, color: "#8E8E93", marginTop: 2, fontWeight: 600, textAlign: "center" }}>{label}</span>
    </div>
  );
}

export default function FacilityReviews() {
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [search, setSearch] = useState("");
  const [scoreFilter, setScoreFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["facility-reviews"],
    queryFn: () => base44.entities.FacilityReview.filter({ moderation_status: "approved" }, "-created_date", 100),
  });

  const stats = useMemo(() => {
    if (!reviews.length) return { total: 0, avgScore: 0, recommend: 0, facilities: 0 };
    const avg = reviews.reduce((s, r) => s + (r.overall_score || 0), 0) / reviews.length;
    const recCount = reviews.filter(r => r.would_recommend === true).length;
    const facilities = new Set(reviews.map(r => r.facility_name)).size;
    return {
      total: reviews.length,
      avgScore: avg.toFixed(1),
      recommend: Math.round((recCount / reviews.length) * 100),
      facilities,
    };
  }, [reviews]);

  const filtered = useMemo(() => {
    let list = [...reviews];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(r =>
        r.facility_name?.toLowerCase().includes(q) ||
        r.headline?.toLowerCase().includes(q) ||
        r.facility_city?.toLowerCase().includes(q)
      );
    }

    if (scoreFilter === "high") list = list.filter(r => r.overall_score >= 8);
    else if (scoreFilter === "mid") list = list.filter(r => r.overall_score >= 5 && r.overall_score < 8);
    else if (scoreFilter === "low") list = list.filter(r => r.overall_score < 5);

    if (sortBy === "highest") list.sort((a, b) => (b.overall_score || 0) - (a.overall_score || 0));
    else if (sortBy === "lowest") list.sort((a, b) => (a.overall_score || 0) - (b.overall_score || 0));
    else if (sortBy === "helpful") list.sort((a, b) => (b.helpful_count || 0) - (a.helpful_count || 0));
    else list.sort((a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0));

    return list;
  }, [reviews, search, scoreFilter, sortBy]);

  return (
    <div style={{ background: "#F7F7F8", minHeight: "100vh", paddingBottom: 100 }}>

      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #E5E7EB", padding: "20px 16px 0" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: "#1E1E1E", lineHeight: 1.2 }}>
              Community Reviews
            </h1>
            <p style={{ fontSize: 12, color: "#8E8E93", marginTop: 3 }}>
              Real stories from people who've been there
            </p>
          </div>
          <button
            onClick={() => setShowWriteModal(true)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "10px 14px", borderRadius: 12,
              background: "#4A90E2", border: "none", color: "#fff",
              fontSize: 12, fontWeight: 700, cursor: "pointer", flexShrink: 0,
            }}
          >
            <Plus style={{ width: 13, height: 13 }} /> Write Review
          </button>
        </div>

        {/* Stats strip */}
        {stats.total > 0 && (
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <StatPill emoji="📝" label="Reviews" value={stats.total} color="#4A90E2" />
            <StatPill emoji="⭐" label="Avg Score" value={stats.avgScore} color="#F59E0B" />
            <StatPill emoji="👍" label="Recommend" value={`${stats.recommend}%`} color="#10B981" />
            <StatPill emoji="🏥" label="Facilities" value={stats.facilities} color="#8B5CF6" />
          </div>
        )}

        {/* Search */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "#F7F7F8", border: "1px solid #E5E7EB", borderRadius: 10,
          padding: "9px 12px", marginBottom: 12,
        }}>
          <Search style={{ width: 14, height: 14, color: "#8E8E93", flexShrink: 0 }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by facility name or city…"
            style={{ flex: 1, background: "none", border: "none", outline: "none", fontSize: 13, color: "#1E1E1E" }}
          />
          {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}><X style={{ width: 12, height: 12, color: "#8E8E93" }} /></button>}
        </div>

        {/* Filter chips */}
        <div style={{ display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 12 }}>
          {SCORE_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setScoreFilter(f.value)}
              style={{
                flexShrink: 0, padding: "6px 12px", borderRadius: 20, border: "none", cursor: "pointer",
                background: scoreFilter === f.value ? "#4A90E2" : "#F0F0F3",
                color: scoreFilter === f.value ? "#fff" : "#5A5A5A",
                fontSize: 11, fontWeight: 700,
              }}
            >
              {f.label}
            </button>
          ))}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{
              flexShrink: 0, padding: "6px 10px", borderRadius: 20,
              border: "1px solid #E5E7EB", background: "#F0F0F3",
              color: "#5A5A5A", fontSize: 11, fontWeight: 700, cursor: "pointer", outline: "none",
            }}
          >
            {SORT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {/* CTA banner */}
      <div style={{ margin: "16px 16px 0" }}>
        <div
          onClick={() => setShowWriteModal(true)}
          style={{
            background: "linear-gradient(135deg,#1E3A5F,#2563EB)",
            borderRadius: 16, padding: "16px 18px", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 14,
          }}
        >
          <div style={{ fontSize: 36 }}>💙</div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>
              Did you go through a program?
            </p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", marginTop: 3, lineHeight: 1.5 }}>
              Your honest review could be the thing that helps someone else choose the right facility.
            </p>
          </div>
          <div style={{
            background: "rgba(255,255,255,0.15)", borderRadius: 10,
            padding: "8px 12px", color: "#fff", fontSize: 11, fontWeight: 700, flexShrink: 0,
          }}>
            Share →
          </div>
        </div>
      </div>

      {/* Results */}
      <div style={{ padding: "16px 16px 0" }}>
        {isLoading ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#8E8E93" }}>
            <Loader2 style={{ width: 24, height: 24, margin: "0 auto 8px" }} className="animate-spin" />
            <p style={{ fontSize: 13 }}>Loading community reviews…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 20px", background: "#fff", borderRadius: 16 }}>
            <p style={{ fontSize: 32, marginBottom: 10 }}>📝</p>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#1E1E1E", marginBottom: 6 }}>
              {reviews.length === 0 ? "Be the first to review" : "No reviews match that search"}
            </p>
            <p style={{ fontSize: 12, color: "#8E8E93", marginBottom: 16 }}>
              {reviews.length === 0
                ? "If you've been through a program, your experience can guide someone else's journey."
                : "Try a different search or filter."}
            </p>
            {reviews.length === 0 && (
              <button
                onClick={() => setShowWriteModal(true)}
                style={{
                  padding: "11px 24px", borderRadius: 12, border: "none",
                  background: "#4A90E2", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer",
                }}
              >
                Write First Review
              </button>
            )}
          </div>
        ) : (
          <>
            <p style={{ fontSize: 11, color: "#8E8E93", marginBottom: 12, fontWeight: 600 }}>
              {filtered.length} review{filtered.length !== 1 ? "s" : ""} found
            </p>
            {filtered.map(review => (
              <FacilityReviewCard key={review.id} review={review} />
            ))}
          </>
        )}
      </div>

      {showWriteModal && (
        <WriteReviewModal
          user={user}
          onClose={() => setShowWriteModal(false)}
        />
      )}
    </div>
  );
}