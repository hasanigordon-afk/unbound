import React, { useState } from "react";
import { X, Star, MapPin, MessageCircle, ExternalLink, CheckCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function CreatorProfileModal({ creatorEmail, onClose, onMessage }) {
  const [tab, setTab] = useState("posts");

  const { data: profiles = [] } = useQuery({
    queryKey: ["creator-profile", creatorEmail],
    queryFn: () => base44.entities.CreatorProfile.filter({ user_email: creatorEmail }),
  });
  const { data: posts = [] } = useQuery({
    queryKey: ["creator-posts", creatorEmail],
    queryFn: () => base44.entities.TalentPost.filter({ creator_email: creatorEmail }, "-created_date", 20),
  });
  const { data: services = [] } = useQuery({
    queryKey: ["creator-services", creatorEmail],
    queryFn: () => base44.entities.EotService.filter({ creator_email: creatorEmail, is_available: true }),
  });
  const { data: products = [] } = useQuery({
    queryKey: ["creator-products", creatorEmail],
    queryFn: () => base44.entities.EotProduct.filter({ creator_email: creatorEmail, is_available: true }),
  });
  const { data: reviews = [] } = useQuery({
    queryKey: ["creator-reviews", creatorEmail],
    queryFn: () => base44.entities.CreatorReview.filter({ creator_email: creatorEmail }, "-created_date", 10),
  });

  const profile = profiles[0];
  const stars = Math.round(profile?.rating_avg || 0);

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 60, background: "rgba(0,0,0,0.8)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "100%", maxWidth: 540,
        background: "linear-gradient(170deg,#1A0A2E,#0A0F1E)",
        border: "1px solid rgba(168,85,247,0.2)",
        borderRadius: "24px 24px 0 0",
        maxHeight: "92vh", overflowY: "auto",
      }}>
        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg,rgba(168,85,247,0.15),rgba(251,146,60,0.08))",
          padding: "24px 20px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)" }}>
              <X style={{ width: 18, height: 18 }} />
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
            <div style={{
              width: 68, height: 68, borderRadius: 20, flexShrink: 0,
              background: "rgba(168,85,247,0.2)", border: "2px solid rgba(168,85,247,0.35)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, overflow: "hidden",
            }}>
              {profile?.photo_url ? (
                <img src={profile.photo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : "🎨"}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                <h2 style={{ fontSize: 18, fontWeight: 900, color: "#fff" }}>{profile?.display_name || "Creator"}</h2>
                {profile?.is_verified && <CheckCircle style={{ width: 14, height: 14, color: "#60A5FA" }} />}
              </div>
              {profile?.city && (
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", gap: 4, marginBottom: 6 }}>
                  <MapPin style={{ width: 11, height: 11 }} /> {profile.city}{profile.state ? `, ${profile.state}` : ""}
                </p>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} style={{ width: 11, height: 11, color: i <= stars ? "#F59E0B" : "rgba(255,255,255,0.15)", fill: i <= stars ? "#F59E0B" : "none" }} />
                  ))}
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginLeft: 3 }}>({reviews.length})</span>
                </div>
                {(profile?.completed_orders || 0) > 0 && (
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>• {profile.completed_orders} completed</span>
                )}
              </div>
            </div>
          </div>

          {profile?.bio && (
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.6, marginTop: 14 }}>
              {profile.bio}
            </p>
          )}

          {profile?.talent_categories?.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 12 }}>
              {profile.talent_categories.map(cat => (
                <span key={cat} style={{
                  fontSize: 11, padding: "3px 9px", borderRadius: 20,
                  background: "rgba(168,85,247,0.15)", color: "#C084FC", fontWeight: 600,
                }}>
                  {cat}
                </span>
              ))}
            </div>
          )}

          <button
            onClick={() => onMessage && onMessage(creatorEmail)}
            style={{
              marginTop: 14, width: "100%", padding: "11px", borderRadius: 12,
              background: "linear-gradient(135deg,#A855F7,#7C3AED)",
              border: "none", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            }}
          >
            <MessageCircle style={{ width: 14, height: 14 }} /> Message Creator
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          {[
            { id: "posts",    label: `Posts (${posts.length})` },
            { id: "products", label: `Products (${products.length})` },
            { id: "services", label: `Services (${services.length})` },
            { id: "reviews",  label: `Reviews (${reviews.length})` },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, padding: "11px 4px", background: "none", border: "none", cursor: "pointer",
              borderBottom: `2px solid ${tab === t.id ? "#A855F7" : "transparent"}`,
              color: tab === t.id ? "#fff" : "rgba(255,255,255,0.3)",
              fontSize: 11, fontWeight: 700,
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ padding: "16px 16px 40px" }}>
          {tab === "posts" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {posts.length === 0 && <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, gridColumn: "1/-1", textAlign: "center", padding: "24px 0" }}>No posts yet</p>}
              {posts.map(p => (
                <div key={p.id} style={{ borderRadius: 12, overflow: "hidden", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.title} style={{ width: "100%", height: 110, objectFit: "cover" }} />
                  ) : (
                    <div style={{ height: 110, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>
                      🎨
                    </div>
                  )}
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#fff", padding: "8px 8px 6px", lineHeight: 1.3 }}>{p.title}</p>
                </div>
              ))}
            </div>
          )}
          {tab === "products" && (
            <div>
              {products.length === 0 && <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, textAlign: "center", padding: "24px 0" }}>No products listed</p>}
              {products.map(p => (
                <div key={p.id} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ width: 52, height: 52, borderRadius: 10, overflow: "hidden", flexShrink: 0, background: "rgba(255,255,255,0.04)" }}>
                    {p.image_url && <img src={p.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{p.title}</p>
                    <p style={{ fontSize: 12, color: "#A855F7", fontWeight: 700 }}>${p.price}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {tab === "services" && (
            <div>
              {services.length === 0 && <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, textAlign: "center", padding: "24px 0" }}>No services listed</p>}
              {services.map(s => (
                <div key={s.id} style={{ padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{s.title}</p>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{s.description?.slice(0, 80)}</p>
                </div>
              ))}
            </div>
          )}
          {tab === "reviews" && (
            <div>
              {reviews.length === 0 && <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, textAlign: "center", padding: "24px 0" }}>No reviews yet</p>}
              {reviews.map(r => (
                <div key={r.id} style={{ padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} style={{ width: 11, height: 11, color: i <= r.rating ? "#F59E0B" : "rgba(255,255,255,0.15)", fill: i <= r.rating ? "#F59E0B" : "none" }} />
                    ))}
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginLeft: 4 }}>{r.reviewer_name}</span>
                  </div>
                  {r.comment && <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.55 }}>{r.comment}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Personal story */}
          {tab === "posts" && profile?.personal_story && (
            <div style={{
              marginTop: 16, padding: "14px 16px",
              background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.15)",
              borderRadius: 14,
            }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#A855F7", marginBottom: 6 }}>💜 My Story</p>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>{profile.personal_story}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}