import React from "react";
import { MapPin, Globe, Calendar, Send } from "lucide-react";

const CAT_EMOJI = {
  beauty: "✂️", cleaning: "🧹", design: "🎨", tutoring: "📚",
  resume: "📄", photography: "📷", peer_support: "🤝", mentoring: "🌟",
  apparel: "👕", moving: "📦", handyman: "🔧", meal_prep: "🍳", other: "⚡",
};

const CAT_COLOR = {
  beauty: "#EC4899", cleaning: "#10B981", design: "#A855F7", tutoring: "#3B82F6",
  resume: "#F59E0B", photography: "#06B6D4", peer_support: "#3ECFBF", mentoring: "#F97316",
  apparel: "#8B5CF6", moving: "#6B7280", handyman: "#78716C", meal_prep: "#84CC16", other: "#A855F7",
};

export default function ServiceCard({ service, onRequest, onViewCreator }) {
  const color = CAT_COLOR[service.category] || "#A855F7";

  const pricingLabel = service.pricing_model === "free" ? "Free" :
    service.pricing_model === "negotiable" ? "Negotiable" :
    service.price_amount ? `$${service.price_amount}${service.pricing_model === "hourly" ? "/hr" : ""}` :
    service.pricing_model;

  return (
    <div style={{
      background: "rgba(255,255,255,0.04)",
      border: `1px solid ${color}20`,
      borderRadius: 18, overflow: "hidden", marginBottom: 12,
    }}>
      {service.image_url ? (
        <div style={{ height: 130, overflow: "hidden" }}>
          <img src={service.image_url} alt={service.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      ) : (
        <div style={{
          height: 70, background: `linear-gradient(135deg,${color}12,${color}04)`,
          display: "flex", alignItems: "center", padding: "0 18px",
          borderBottom: `1px solid ${color}15`,
        }}>
          <span style={{ fontSize: 28 }}>{CAT_EMOJI[service.category] || "⚡"}</span>
        </div>
      )}

      <div style={{ padding: "13px 15px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
          <p style={{ fontSize: 14, fontWeight: 800, color: "#fff", flex: 1, marginRight: 8, lineHeight: 1.3 }}>{service.title}</p>
          <span style={{
            padding: "3px 9px", borderRadius: 20,
            background: `${color}18`, color, fontSize: 11, fontWeight: 700, flexShrink: 0,
          }}>
            {pricingLabel}
          </span>
        </div>

        <button
          onClick={() => onViewCreator && onViewCreator(service.creator_email)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: 6 }}
        >
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>by {service.creator_name || "Creator"}</p>
        </button>

        {service.description && (
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.5, marginBottom: 10 }}>
            {service.description.slice(0, 90)}{service.description.length > 90 ? "…" : ""}
          </p>
        )}

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
            {service.is_remote ? <Globe style={{ width: 11, height: 11 }} /> : <MapPin style={{ width: 11, height: 11 }} />}
            {service.is_remote ? "Remote / Online" : `${service.city || ""}${service.state ? `, ${service.state}` : ""}`}
          </span>
          {service.availability && (
            <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
              <Calendar style={{ width: 11, height: 11 }} /> {service.availability}
            </span>
          )}
        </div>

        <button
          onClick={() => onRequest && onRequest(service)}
          style={{
            width: "100%", padding: "10px", borderRadius: 12,
            background: `linear-gradient(135deg,${color}30,${color}15)`,
            border: `1px solid ${color}45`,
            color, fontWeight: 700, fontSize: 12, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}
        >
          <Send style={{ width: 12, height: 12 }} /> Request This Service
        </button>
      </div>
    </div>
  );
}