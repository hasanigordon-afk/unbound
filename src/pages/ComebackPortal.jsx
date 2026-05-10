import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Film, ArrowLeft, Loader2 } from "lucide-react";
import { COMEBACK_CATEGORIES } from "@/lib/comebackConfig";
import ComebackVideoCard from "@/components/comeback/ComebackVideoCard.jsx";

export default function ComebackPortal() {
  const [activeCategory, setActiveCategory] = useState("all");

  const { data: videos = [], isLoading } = useQuery({
    queryKey: ["comeback-videos", activeCategory],
    queryFn: () => {
      const filters = { review_status: "approved" };
      if (activeCategory !== "all") filters.category = activeCategory;
      return base44.entities.ComebackVideo.filter(filters, "-created_date", 60);
    },
  });

  return (
    <div style={{ minHeight: "100vh", paddingBottom: 140, color: "var(--text)" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "20px 18px 0" }}>

        {/* Header */}
        <Link to="/" style={{ textDecoration: "none" }}>
          <button style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "8px 14px", borderRadius: 999,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            color: "var(--text-muted)", fontSize: 13, fontWeight: 600,
            cursor: "pointer", marginBottom: 16,
          }}>
            <ArrowLeft style={{ width: 14, height: 14 }} /> Home
          </button>
        </Link>

        <div style={{
          background: "linear-gradient(135deg, rgba(240,183,83,0.14) 0%, rgba(139,92,246,0.14) 100%)",
          border: "1px solid var(--border-glow)",
          borderRadius: 22,
          padding: "20px",
          marginBottom: 18,
          boxShadow: "var(--glow-gold)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14,
              background: "linear-gradient(135deg, var(--gold), #E89A2A)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#1A1F2C", boxShadow: "var(--glow-gold)",
            }}>
              <Film style={{ width: 22, height: 22 }} strokeWidth={2.2} />
            </div>
            <div>
              <p style={{
                fontSize: 10, fontWeight: 700, color: "var(--gold)",
                letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 2,
              }}>Comeback Media Portal</p>
              <p style={{
                fontFamily: "'Lora', Georgia, serif",
                fontSize: 19, fontWeight: 600, color: "var(--text)",
              }}>
                Real comeback stories
              </p>
            </div>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>
            Curated, recovery-safe videos about overcoming addiction, hardship, and rebuilding life.
          </p>
        </div>

        {/* Category pills */}
        <div style={{
          display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, marginBottom: 14,
          scrollbarWidth: "none",
        }}>
          <CategoryPill
            label="All"
            emoji="✨"
            active={activeCategory === "all"}
            onClick={() => setActiveCategory("all")}
          />
          {COMEBACK_CATEGORIES.map(c => (
            <CategoryPill
              key={c.key}
              label={c.label}
              emoji={c.emoji}
              active={activeCategory === c.key}
              onClick={() => setActiveCategory(c.key)}
            />
          ))}
        </div>

        {/* List */}
        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
            <Loader2 className="animate-spin" style={{ width: 24, height: 24, color: "var(--accent)" }} />
          </div>
        ) : videos.length === 0 ? (
          <div style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 18,
            padding: "32px 20px",
            textAlign: "center",
          }}>
            <p style={{ fontSize: 36, marginBottom: 8 }}>🎬</p>
            <p style={{ fontFamily: "'Lora', Georgia, serif", fontSize: 16, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>
              No videos here yet
            </p>
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
              Check back soon — fresh comeback stories arrive often.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {videos.map(v => (
              <ComebackVideoCard key={v.id} video={v} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CategoryPill({ label, emoji, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        flexShrink: 0,
        padding: "8px 14px", borderRadius: 999,
        background: active ? "linear-gradient(135deg, var(--gold), #E89A2A)" : "var(--surface)",
        border: active ? "1px solid var(--gold)" : "1px solid var(--border)",
        color: active ? "#1A1F2C" : "var(--text-muted)",
        fontSize: 12.5, fontWeight: 700,
        cursor: "pointer", whiteSpace: "nowrap",
        boxShadow: active ? "var(--glow-gold)" : "none",
      }}
    >
      {emoji} {label}
    </button>
  );
}