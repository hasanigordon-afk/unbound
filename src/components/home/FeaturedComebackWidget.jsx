import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Play, Sparkles, ArrowRight } from "lucide-react";

export default function FeaturedComebackWidget() {
  const { data: featured } = useQuery({
    queryKey: ["featured-comeback"],
    queryFn: async () => {
      // Try featured-of-the-day first
      const today = await base44.entities.ComebackVideo.filter(
        { review_status: "approved", is_featured_today: true },
        "-updated_date",
        1
      );
      if (today?.length) return today[0];
      // Fallback: any approved featured
      const fallback = await base44.entities.ComebackVideo.filter(
        { review_status: "approved", is_featured: true },
        "-created_date",
        1
      );
      if (fallback?.length) return fallback[0];
      // Final fallback: latest approved
      const latest = await base44.entities.ComebackVideo.filter(
        { review_status: "approved" },
        "-created_date",
        1
      );
      return latest?.[0] || null;
    },
    staleTime: 5 * 60 * 1000,
  });

  if (!featured) return null;

  return (
    <Link to="/ComebackPortal" style={{ textDecoration: "none", display: "block" }}>
      <div className="fade-up" style={{
        position: "relative",
        background: "var(--card)",
        border: "1px solid var(--border-glow)",
        borderRadius: 22,
        overflow: "hidden",
        backdropFilter: "blur(18px)",
        boxShadow: "var(--shadow-card)",
      }}>
        <div style={{ position: "relative", aspectRatio: "16/9", background: "#000" }}>
          <div style={{
            position: "absolute", inset: 0,
            background: `url(${featured.thumbnail_url}) center/cover no-repeat`,
          }} />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.85))",
          }} />
          <div style={{
            position: "absolute", top: 12, left: 12,
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "5px 11px", borderRadius: 999,
            background: "var(--gold)", color: "#1A1F2C",
            fontSize: 10, fontWeight: 800, letterSpacing: ".1em",
            textTransform: "uppercase",
          }}>
            <Sparkles style={{ width: 10, height: 10 }} /> Comeback of the Day
          </div>
          <div style={{
            position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
            width: 60, height: 60, borderRadius: "50%",
            background: "linear-gradient(135deg, var(--gold), #E89A2A)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "var(--glow-gold)",
          }}>
            <Play style={{ width: 26, height: 26, color: "#1A1F2C", marginLeft: 3 }} fill="#1A1F2C" />
          </div>
          <div style={{ position: "absolute", bottom: 14, left: 14, right: 14 }}>
            <p style={{
              fontFamily: "'Lora', Georgia, serif",
              fontSize: 15, fontWeight: 600, color: "#fff",
              lineHeight: 1.3,
              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
            }}>
              {featured.title}
            </p>
            <div style={{
              marginTop: 6, display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.75)" }}>
                {featured.channel_name || "Watch now"}
              </span>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                fontSize: 11, fontWeight: 600, color: "var(--gold)",
              }}>
                Open Portal <ArrowRight style={{ width: 12, height: 12 }} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}