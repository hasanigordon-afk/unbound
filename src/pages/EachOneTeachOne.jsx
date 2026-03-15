import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Loader2, Search, Filter } from "lucide-react";
import EotHeader from "@/components/eachone/EotHeader";
import FeaturedCreatorBanner from "@/components/eachone/FeaturedCreatorBanner";
import TalentPostCard from "@/components/eachone/TalentPostCard";
import ProductCard from "@/components/eachone/ProductCard";
import ServiceCard from "@/components/eachone/ServiceCard";
import CreatorCard from "@/components/eachone/CreatorCard";
import PostTalentModal from "@/components/eachone/PostTalentModal";
import ServiceRequestModal from "@/components/eachone/ServiceRequestModal";
import CreatorProfileModal from "@/components/eachone/CreatorProfileModal";
import SuccessStoriesStrip from "@/components/eachone/SuccessStoriesStrip";

const POST_CATS = [
  { value: "all", label: "All" },
  { value: "artwork", label: "🎨 Art" },
  { value: "clothing", label: "👕 Fashion" },
  { value: "poetry", label: "📝 Poetry" },
  { value: "music", label: "🎵 Music" },
  { value: "photography", label: "📷 Photo" },
  { value: "crafts", label: "🧶 Crafts" },
  { value: "motivation", label: "🔥 Motivation" },
  { value: "skills", label: "⚡ Skills" },
];

const PRODUCT_CATS = [
  { value: "all", label: "All" },
  { value: "painting", label: "🖼️ Paintings" },
  { value: "apparel", label: "👕 Apparel" },
  { value: "crafts", label: "🧶 Crafts" },
  { value: "digital", label: "💻 Digital" },
  { value: "prints", label: "🖨️ Prints" },
  { value: "music", label: "🎵 Music" },
  { value: "ebook", label: "📚 Ebooks" },
  { value: "gifts", label: "🎁 Gifts" },
];

const SERVICE_CATS = [
  { value: "all", label: "All" },
  { value: "design", label: "🎨 Design" },
  { value: "beauty", label: "✂️ Beauty" },
  { value: "tutoring", label: "📚 Tutoring" },
  { value: "photography", label: "📷 Photo" },
  { value: "peer_support", label: "🤝 Support" },
  { value: "mentoring", label: "🌟 Mentoring" },
  { value: "meal_prep", label: "🍳 Meals" },
  { value: "handyman", label: "🔧 Handyman" },
];

function CategoryChips({ cats, value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 4, marginBottom: 14 }}>
      {cats.map(c => (
        <button
          key={c.value}
          onClick={() => onChange(c.value)}
          style={{
            padding: "7px 13px", borderRadius: 20, border: "none", cursor: "pointer", flexShrink: 0,
            background: value === c.value ? "rgba(168,85,247,0.25)" : "rgba(255,255,255,0.06)",
            border: `1px solid ${value === c.value ? "rgba(168,85,247,0.5)" : "transparent"}`,
            color: value === c.value ? "#C084FC" : "rgba(255,255,255,0.45)",
            fontWeight: 700, fontSize: 12,
          }}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}

function EmptyState({ emoji, title, sub, onAction, actionLabel }) {
  return (
    <div style={{
      textAlign: "center", padding: "48px 20px",
      background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 20,
    }}>
      <p style={{ fontSize: 36, marginBottom: 12 }}>{emoji}</p>
      <p style={{ fontSize: 15, fontWeight: 800, color: "#fff", marginBottom: 6 }}>{title}</p>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginBottom: onAction ? 16 : 0 }}>{sub}</p>
      {onAction && (
        <button onClick={onAction} style={{
          padding: "10px 22px", borderRadius: 12,
          background: "linear-gradient(135deg,#A855F7,#7C3AED)",
          border: "none", color: "#fff", fontWeight: 700, cursor: "pointer",
        }}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export default function EachOneTeachOne() {
  const [activeTab, setActiveTab] = useState("feed");
  const [postFilter, setPostFilter] = useState("all");
  const [productFilter, setProductFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [viewingCreator, setViewingCreator] = useState(null);

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: posts = [], isLoading: loadingPosts } = useQuery({
    queryKey: ["talent-posts", postFilter],
    queryFn: () => {
      const filter = { moderation_status: "approved" };
      if (postFilter !== "all") filter.category = postFilter;
      return base44.entities.TalentPost.filter(filter, "-created_date", 40);
    },
    enabled: activeTab === "feed",
  });

  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ["eot-products", productFilter],
    queryFn: () => {
      const filter = { moderation_status: "approved", is_available: true };
      if (productFilter !== "all") filter.category = productFilter;
      return base44.entities.EotProduct.filter(filter, "-created_date", 40);
    },
    enabled: activeTab === "market",
  });

  const { data: services = [], isLoading: loadingServices } = useQuery({
    queryKey: ["eot-services", serviceFilter],
    queryFn: () => {
      const filter = { moderation_status: "approved", is_available: true };
      if (serviceFilter !== "all") filter.category = serviceFilter;
      return base44.entities.EotService.filter(filter, "-created_date", 40);
    },
    enabled: activeTab === "services",
  });

  const { data: creators = [], isLoading: loadingCreators } = useQuery({
    queryKey: ["creator-profiles"],
    queryFn: () => base44.entities.CreatorProfile.filter({ is_active: true }, "-rating_avg", 50),
    enabled: activeTab === "creators",
  });

  const filteredCreators = creators.filter(c =>
    !search || c.display_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.talent_categories?.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredPosts = posts.filter(p =>
    !search || p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.creator_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ background: "linear-gradient(170deg,#0D0818,#0A0F1E)", minHeight: "100vh", paddingBottom: 100 }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <EotHeader
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onPost={() => setShowPostModal(true)}
          user={user}
        />

        <div style={{ padding: "16px 16px 0" }}>

          {/* Search bar for feed and creators */}
          {(activeTab === "feed" || activeTab === "creators") && (
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 14, padding: "10px 14px", marginBottom: 14,
            }}>
              <Search style={{ width: 15, height: 15, color: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={activeTab === "feed" ? "Search posts or creators…" : "Search creators…"}
                style={{
                  flex: 1, background: "none", border: "none", outline: "none",
                  color: "#fff", fontSize: 13,
                }}
              />
            </div>
          )}

          {/* ── FEED TAB ── */}
          {activeTab === "feed" && (
            <>
              <FeaturedCreatorBanner onViewCreator={setViewingCreator} />
              <SuccessStoriesStrip />
              <CategoryChips cats={POST_CATS} value={postFilter} onChange={setPostFilter} />

              {/* Motivational banner */}
              <div style={{
                padding: "14px 16px", borderRadius: 16, marginBottom: 14,
                background: "linear-gradient(135deg,rgba(168,85,247,0.1),rgba(251,146,60,0.06))",
                border: "1px solid rgba(168,85,247,0.18)",
              }}>
                <p style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginBottom: 3 }}>
                  🌟 Your story inspires others.
                </p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
                  Share your art, skills, or talents — every post builds your legacy.
                </p>
              </div>

              {loadingPosts && (
                <div style={{ textAlign: "center", padding: 40 }}>
                  <Loader2 style={{ width: 22, height: 22, color: "#A855F7" }} className="animate-spin" />
                </div>
              )}

              {!loadingPosts && filteredPosts.length === 0 && (
                <EmptyState
                  emoji="🎨"
                  title="Be the first to post your talent"
                  sub="This community is waiting for your gifts."
                  onAction={user ? () => setShowPostModal(true) : null}
                  actionLabel="✨ Share Your Gift"
                />
              )}

              {filteredPosts.map(post => (
                <TalentPostCard
                  key={post.id}
                  post={post}
                  onViewCreator={setViewingCreator}
                  onReport={(p) => console.log("Reported", p.id)}
                />
              ))}
            </>
          )}

          {/* ── MARKET TAB ── */}
          {activeTab === "market" && (
            <>
              <div style={{
                padding: "14px 16px", borderRadius: 16, marginBottom: 14,
                background: "linear-gradient(135deg,rgba(168,85,247,0.1),rgba(16,185,129,0.06))",
                border: "1px solid rgba(168,85,247,0.18)",
              }}>
                <p style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginBottom: 3 }}>
                  🛍️ Support real people building real futures.
                </p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
                  Every purchase helps someone in recovery rebuild their life with dignity.
                </p>
              </div>

              <CategoryChips cats={PRODUCT_CATS} value={productFilter} onChange={setProductFilter} />

              {loadingProducts && (
                <div style={{ textAlign: "center", padding: 40 }}>
                  <Loader2 style={{ width: 22, height: 22, color: "#A855F7" }} className="animate-spin" />
                </div>
              )}

              {!loadingProducts && products.length === 0 && (
                <EmptyState
                  emoji="🛍️"
                  title="The marketplace is growing"
                  sub="Creators are setting up their shops. Check back soon!"
                />
              )}

              {products.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onViewCreator={setViewingCreator}
                  onInquire={(p) => alert(`Contact ${p.creator_name} through messaging to arrange this purchase.`)}
                />
              ))}
            </>
          )}

          {/* ── SERVICES TAB ── */}
          {activeTab === "services" && (
            <>
              <div style={{
                padding: "14px 16px", borderRadius: 16, marginBottom: 14,
                background: "linear-gradient(135deg,rgba(16,185,129,0.1),rgba(6,182,212,0.06))",
                border: "1px solid rgba(16,185,129,0.2)",
              }}>
                <p style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginBottom: 3 }}>
                  🤝 Skills that create opportunity.
                </p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
                  Hire a community member, support their hustle, and build connections.
                </p>
              </div>

              <CategoryChips cats={SERVICE_CATS} value={serviceFilter} onChange={setServiceFilter} />

              {loadingServices && (
                <div style={{ textAlign: "center", padding: 40 }}>
                  <Loader2 style={{ width: 22, height: 22, color: "#A855F7" }} className="animate-spin" />
                </div>
              )}

              {!loadingServices && services.length === 0 && (
                <EmptyState
                  emoji="🤝"
                  title="No services listed yet"
                  sub="Community members will post their skills here."
                />
              )}

              {services.map(service => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onViewCreator={setViewingCreator}
                  onRequest={user ? setSelectedService : null}
                />
              ))}
            </>
          )}

          {/* ── CREATORS TAB ── */}
          {activeTab === "creators" && (
            <>
              <div style={{
                padding: "14px 16px", borderRadius: 16, marginBottom: 14,
                background: "linear-gradient(135deg,rgba(251,146,60,0.1),rgba(168,85,247,0.06))",
                border: "1px solid rgba(251,146,60,0.2)",
              }}>
                <p style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginBottom: 3 }}>
                  🌟 Meet the community creators.
                </p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
                  Follow their journey, support their work, and collaborate.
                </p>
              </div>

              {loadingCreators && (
                <div style={{ textAlign: "center", padding: 40 }}>
                  <Loader2 style={{ width: 22, height: 22, color: "#A855F7" }} className="animate-spin" />
                </div>
              )}

              {!loadingCreators && filteredCreators.length === 0 && (
                <EmptyState
                  emoji="🎨"
                  title="No creators yet"
                  sub="Be the first to post and become a featured creator!"
                  onAction={user ? () => setShowPostModal(true) : null}
                  actionLabel="Become a Creator"
                />
              )}

              {filteredCreators.map(creator => (
                <CreatorCard
                  key={creator.id}
                  creator={creator}
                  onView={c => setViewingCreator(c.user_email)}
                  onMessage={c => {}}
                />
              ))}
            </>
          )}

          {/* Sign-in prompt */}
          {!user && (
            <div style={{
              marginTop: 16, padding: "16px", borderRadius: 16, textAlign: "center",
              background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.2)",
            }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 10 }}>
                Join the creator community
              </p>
              <button onClick={() => base44.auth.redirectToLogin()} style={{
                padding: "10px 24px", borderRadius: 12,
                background: "linear-gradient(135deg,#A855F7,#7C3AED)",
                border: "none", color: "#fff", fontWeight: 800, cursor: "pointer",
              }}>
                Sign in to share your talent
              </button>
            </div>
          )}

          {/* Community guidelines footer */}
          <div style={{
            marginTop: 20, padding: "14px 16px", borderRadius: 14,
            background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
          }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.3)", marginBottom: 6 }}>
              🛡️ Community Standards
            </p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", lineHeight: 1.6 }}>
              No illegal goods or services. Keep communication respectful and on-platform.
              Report concerns using the flag icon. Content is moderated to keep this space safe and uplifting.
            </p>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showPostModal && user && (
        <PostTalentModal user={user} onClose={() => setShowPostModal(false)} />
      )}
      {selectedService && user && (
        <ServiceRequestModal
          service={selectedService}
          user={user}
          onClose={() => setSelectedService(null)}
        />
      )}
      {viewingCreator && (
        <CreatorProfileModal
          creatorEmail={viewingCreator}
          onClose={() => setViewingCreator(null)}
          onMessage={() => setViewingCreator(null)}
        />
      )}
    </div>
  );
}