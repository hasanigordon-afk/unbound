import React from "react";
import { Star, MessageCircle, UserPlus } from "lucide-react";

export default function CreatorCard({ creator, onView, onMessage }) {
  const stars = Math.round(creator.rating_avg || 0);

  return (
    <div
      onClick={() => onView && onView(creator)}
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 18, padding: "16px",
        cursor: "pointer", marginBottom: 12,
        display: "flex", alignItems: "center", gap: 14,
      }}
    >
      {/* Avatar */}
      <div style={{
        width: 56, height: 56, borderRadius: 16, flexShrink: 0,
        background: "rgba(168,85,247,0.15)", border: "2px solid rgba(168,85,247,0.3)",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, overflow: "hidden",
      }}>
        {creator.photo_url ? (
          <img src={creator.photo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : "🎨"}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
          <p style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{creator.display_name}</p>
          {creator.is_verified && (
            <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 20,
              background: "rgba(59,130,246,0.2)", color: "#60A5FA", fontWeight: 700 }}>✓ Verified</span>
          )}
          {creator.has_facility_endorsement && (
            <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 20,
              background: "rgba(16,185,129,0.2)", color: "#34D399", fontWeight: 700 }}>🏥 Endorsed</span>
          )}
        </div>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 5 }}>
          {creator.city}{creator.state ? `, ${creator.state}` : ""}
        </p>
        {creator.talent_categories?.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 6 }}>
            {creator.talent_categories.slice(0, 3).map(cat => (
              <span key={cat} style={{
                fontSize: 10, padding: "2px 7px", borderRadius: 20,
                background: "rgba(168,85,247,0.12)", color: "#C084FC", fontWeight: 600,
              }}>
                {cat}
              </span>
            ))}
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
            {[1,2,3,4,5].map(i => (
              <Star key={i} style={{ width: 10, height: 10, color: i <= stars ? "#F59E0B" : "rgba(255,255,255,0.15)", fill: i <= stars ? "#F59E0B" : "none" }} />
            ))}
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginLeft: 2 }}>({creator.review_count || 0})</span>
          </div>
          {creator.completed_orders > 0 && (
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>• {creator.completed_orders} completed</span>
          )}
        </div>
      </div>

      {/* Action */}
      <button
        onClick={(e) => { e.stopPropagation(); onMessage && onMessage(creator); }}
        style={{
          width: 36, height: 36, borderRadius: 12,
          background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0,
        }}
      >
        <MessageCircle style={{ width: 15, height: 15, color: "#A855F7" }} />
      </button>
    </div>
  );
}