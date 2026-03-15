import React from "react";
import { Star, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function FeaturedCreatorBanner({ onViewCreator }) {
  const { data: featured = [] } = useQuery({
    queryKey: ["featured-creators"],
    queryFn: () => base44.entities.FeaturedCreator.filter({ is_active: true, feature_type: "week" }, "-created_date", 1),
  });

  const item = featured[0];

  if (!item) return (
    <div style={{
      margin: "16px 0",
      padding: "18px 20px",
      background: "linear-gradient(135deg,rgba(168,85,247,0.12),rgba(251,146,60,0.08))",
      border: "1px solid rgba(168,85,247,0.25)",
      borderRadius: 18,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 16 }}>🌟</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#A855F7", textTransform: "uppercase", letterSpacing: ".08em" }}>
          Creator of the Week
        </span>
      </div>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
        Be the first creator featured here — post your work and get noticed!
      </p>
    </div>
  );

  return (
    <div
      onClick={() => onViewCreator && onViewCreator(item.creator_email)}
      style={{
        margin: "16px 0",
        background: "linear-gradient(135deg,rgba(168,85,247,0.15),rgba(251,146,60,0.1))",
        border: "1px solid rgba(168,85,247,0.3)",
        borderRadius: 18, overflow: "hidden", cursor: "pointer",
      }}
    >
      {item.image_url && (
        <div style={{ height: 130, overflow: "hidden" }}>
          <img src={item.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.7 }} />
        </div>
      )}
      <div style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
          <Star style={{ width: 12, height: 12, color: "#F59E0B", fill: "#F59E0B" }} />
          <span style={{ fontSize: 10, fontWeight: 800, color: "#F59E0B", textTransform: "uppercase", letterSpacing: ".08em" }}>
            Creator of the Week
          </span>
        </div>
        <p style={{ fontSize: 15, fontWeight: 800, color: "#fff", marginBottom: 4 }}>{item.headline || "Featured Creator"}</p>
        {item.story && (
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.5, marginBottom: 8 }}>
            {item.story.slice(0, 100)}…
          </p>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#A855F7" }}>
          <span style={{ fontSize: 12, fontWeight: 700 }}>View Profile</span>
          <ChevronRight style={{ width: 12, height: 12 }} />
        </div>
      </div>
    </div>
  );
}