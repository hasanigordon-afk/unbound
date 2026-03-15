import React, { useState } from "react";
import { Heart, ShoppingBag, Truck, Download, MapPin } from "lucide-react";

const DELIVERY_ICON = {
  shipping: <Truck style={{ width: 11, height: 11 }} />,
  pickup:   <MapPin style={{ width: 11, height: 11 }} />,
  digital:  <Download style={{ width: 11, height: 11 }} />,
};

const CAT_EMOJI = {
  painting: "🖼️", drawing: "✏️", apparel: "👕", crafts: "🧶",
  digital: "💻", prints: "🖨️", music: "🎵", ebook: "📚", gifts: "🎁", other: "✨",
};

export default function ProductCard({ product, onInquire, onViewCreator }) {
  const [saved, setSaved] = useState(false);

  return (
    <div style={{
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 18, overflow: "hidden", marginBottom: 12,
    }}>
      {/* Image */}
      <div style={{ position: "relative", height: 170, background: "rgba(255,255,255,0.03)", overflow: "hidden" }}>
        {product.image_url ? (
          <img src={product.image_url} alt={product.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 }}>
            {CAT_EMOJI[product.category] || "✨"}
          </div>
        )}
        <button
          onClick={() => setSaved(s => !s)}
          style={{
            position: "absolute", top: 10, right: 10, width: 32, height: 32,
            borderRadius: "50%", background: "rgba(0,0,0,0.5)", border: "none",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <Heart style={{ width: 14, height: 14, color: saved ? "#F87171" : "#fff", fill: saved ? "#F87171" : "none" }} />
        </button>
        <div style={{
          position: "absolute", bottom: 10, left: 10,
          padding: "3px 9px", borderRadius: 20,
          background: "rgba(0,0,0,0.6)", color: "rgba(255,255,255,0.7)",
          fontSize: 10, fontWeight: 700,
          display: "flex", alignItems: "center", gap: 4,
        }}>
          {DELIVERY_ICON[product.delivery_type]} {product.delivery_type}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "12px 14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
          <p style={{ fontSize: 14, fontWeight: 800, color: "#fff", flex: 1, marginRight: 8 }}>{product.title}</p>
          <p style={{ fontSize: 16, fontWeight: 900, color: "#A855F7", flexShrink: 0 }}>${product.price}</p>
        </div>
        <button
          onClick={() => onViewCreator && onViewCreator(product.creator_email)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: 8 }}
        >
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>by {product.creator_name || "Creator"}</p>
        </button>
        {product.description && (
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.5, marginBottom: 10 }}>
            {product.description.slice(0, 80)}{product.description.length > 80 ? "…" : ""}
          </p>
        )}
        <button
          onClick={() => onInquire && onInquire(product)}
          style={{
            width: "100%", padding: "10px", borderRadius: 12,
            background: "linear-gradient(135deg,#A855F7,#7C3AED)",
            border: "none", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}
        >
          <ShoppingBag style={{ width: 13, height: 13 }} /> Purchase Inquiry
        </button>
      </div>
    </div>
  );
}