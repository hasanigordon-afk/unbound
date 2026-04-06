import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ChevronLeft, Heart, Loader2, Sparkles } from "lucide-react";
import { createPageUrl } from "./utils";
import InterestSelector, { INTERESTS } from "@/components/buildyourself/InterestSelector";
import ProgressPost from "@/components/buildyourself/ProgressPost";

const TABS = [
  { id: "my",        label: "My Journey"  },
  { id: "community", label: "Community"   },
  { id: "interests", label: "My Interests" },
];

const POST_TYPE_LABELS = {
  milestone: "🏆 Milestone",
  work:      "🎨 Work",
  goal:      "🎯 Goal",
  reflection:"💭 Reflection",
  share:     "💬 Share",
};

function PostCard({ post, onLike }) {
  const tags = (post.interest_tags || []).map(id => INTERESTS.find(i => i.id === id)).filter(Boolean);
  return (
    <div style={{ borderRadius: 18, padding: "16px 18px", marginBottom: 12,
      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
          background: "rgba(45,212,191,0.12)", display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16 }}>
          {post.display_name?.[0]?.toUpperCase() || "?"}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>
            {post.display_name || "Anonymous"}
          </p>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>
            {POST_TYPE_LABELS[post.post_type] || "💬 Share"} ·{" "}
            {new Date(post.created_date).toLocaleDateString("en", { month: "short", day: "numeric" })}
          </p>
        </div>
      </div>

      {post.image_url && (
        <img src={post.image_url} alt="post"
          style={{ width: "100%", borderRadius: 12, maxHeight: 240, objectFit: "cover", marginBottom: 10 }} />
      )}

      <p style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", lineHeight: 1.7, marginBottom: 10 }}>
        {post.content}
      </p>

      {tags.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
          {tags.map(t => (
            <span key={t.id} style={{ fontSize: 10, fontWeight: 700, color: t.color,
              background: t.color + "15", padding: "3px 9px", borderRadius: 20 }}>
              {t.emoji} {t.label}
            </span>
          ))}
        </div>
      )}

      <button onClick={() => onLike(post)}
        style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none",
          cursor: "pointer", padding: "4px 0" }}>
        <Heart style={{ color: "rgba(255,255,255,0.3)", width: 14, height: 14 }} />
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontWeight: 600 }}>
          {post.like_count || 0}
        </span>
      </button>
    </div>
  );
}

export default function BuildYourself() {
  const qc = useQueryClient();
  const [tab, setTab] = useState("my");
  const [filterTag, setFilterTag] = useState(null);

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["build-profile", user?.email],
    queryFn: () => base44.entities.BuildYourselfProfile.filter({ user_email: user.email }),
    enabled: !!user?.email,
    select: d => d[0] || null,
  });

  const { data: myPosts = [] } = useQuery({
    queryKey: ["build-my-posts", user?.email],
    queryFn: () => base44.entities.BuildYourselfPost.filter({ user_email: user.email }, "-created_date", 50),
    enabled: !!user?.email,
  });

  const { data: communityPosts = [] } = useQuery({
    queryKey: ["build-community-posts"],
    queryFn: () => base44.entities.BuildYourselfPost.filter({ is_public: true }, "-created_date", 100),
    enabled: tab === "community",
  });

  const profileMutation = useMutation({
    mutationFn: (patch) => profile
      ? base44.entities.BuildYourselfProfile.update(profile.id, patch)
      : base44.entities.BuildYourselfProfile.create({ user_email: user.email, ...patch }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["build-profile"] }),
  });

  const likeMutation = useMutation({
    mutationFn: (post) => base44.entities.BuildYourselfPost.update(post.id, { like_count: (post.like_count || 0) + 1 }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["build-community-posts"] }); qc.invalidateQueries({ queryKey: ["build-my-posts"] }); },
  });

  const userInterests = profile?.interests || [];
  const displayName = user?.full_name?.split(" ")[0] || "You";

  const filteredCommunity = useMemo(() =>
    filterTag ? communityPosts.filter(p => (p.interest_tags || []).includes(filterTag)) : communityPosts,
    [communityPosts, filterTag]
  );

  const allCommunityTags = useMemo(() => {
    const counts = {};
    communityPosts.forEach(p => (p.interest_tags || []).forEach(t => { counts[t] = (counts[t] || 0) + 1; }));
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([id]) => id);
  }, [communityPosts]);

  if (profileLoading) return (
    <div style={{ background: "#07090F", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Loader2 style={{ color: "#2DD4BF", width: 28, height: 28 }} className="animate-spin" />
    </div>
  );

  // First-time onboarding
  if (!profile) return (
    <div style={{ background: "linear-gradient(170deg,#07090F,#0B0F1A)", minHeight: "100vh", paddingBottom: 100 }}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "60px 24px 32px" }}>
        <Link to={createPageUrl("MyFoundation")} style={{ display: "inline-flex", alignItems: "center", gap: 6,
          color: "rgba(255,255,255,0.4)", fontSize: 12, marginBottom: 28, textDecoration: "none" }}>
          <ChevronLeft style={{ width: 15, height: 15 }} /> Back
        </Link>

        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 48, marginBottom: 14 }}>✨</div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#fff", lineHeight: 1.2, marginBottom: 10 }}>
            Build Yourself
          </h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}>
            Recovery isn't just about what you stop — it's about who you're becoming.
            This space is yours to explore, create, and grow.
          </p>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", marginTop: 10, fontStyle: "italic" }}>
            No pressure. No grades. Just you.
          </p>
        </div>

        <div style={{ borderRadius: 20, padding: "22px 20px", background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)" }}>
          <p style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginBottom: 4 }}>
            What are you curious about?
          </p>
          <InterestSelector
            selected={userInterests}
            onChange={(interests) => profileMutation.mutate({ interests })}
          />
          {userInterests.length > 0 && (
            <button onClick={() => profileMutation.mutate({ interests: userInterests })}
              disabled={profileMutation.isPending}
              style={{ width: "100%", marginTop: 20, padding: "14px", borderRadius: 14, border: "none",
                cursor: "pointer", background: "linear-gradient(135deg,#2DD4BF,#22C5B0)",
                color: "#07090F", fontWeight: 800, fontSize: 15,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              {profileMutation.isPending ? <Loader2 style={{ width: 15, height: 15 }} className="animate-spin" /> : <Sparkles style={{ width: 15, height: 15 }} />}
              Start Building →
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ background: "linear-gradient(170deg,#07090F 0%,#0B0A14 100%)", minHeight: "100vh", paddingBottom: 100 }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ background: "linear-gradient(150deg,#0D0A20 0%,#08071A 100%)",
          padding: "60px 24px 24px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -80, right: -60, width: 280, height: 280, borderRadius: "50%",
            background: "radial-gradient(circle,rgba(167,139,250,0.1) 0%,transparent 70%)", pointerEvents: "none" }} />

          <Link to={createPageUrl("MyFoundation")} style={{ display: "inline-flex", alignItems: "center", gap: 6,
            color: "rgba(255,255,255,0.4)", fontSize: 12, marginBottom: 16, textDecoration: "none" }}>
            <ChevronLeft style={{ width: 15, height: 15 }} /> Back
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <Sparkles style={{ color: "#A78BFA", width: 16, height: 16 }} />
            <p style={{ fontSize: 12, fontWeight: 700, color: "#A78BFA", textTransform: "uppercase",
              letterSpacing: ".1em" }}>Build Yourself</p>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: "#fff", lineHeight: 1.2, marginBottom: 6 }}>
            {displayName}'s Journey
          </h1>

          {/* Interest tags strip */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {userInterests.slice(0, 5).map(id => {
              const int = INTERESTS.find(i => i.id === id);
              if (!int) return null;
              return (
                <span key={id} style={{ fontSize: 11, fontWeight: 700, color: int.color,
                  background: int.color + "15", padding: "4px 10px", borderRadius: 20 }}>
                  {int.emoji} {int.label}
                </span>
              );
            })}
            {userInterests.length > 5 && (
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", padding: "4px 6px" }}>
                +{userInterests.length - 5} more
              </span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", padding: "12px 16px 0", gap: 4 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ flex: 1, padding: "10px 6px", borderRadius: "10px 10px 0 0", border: "none", cursor: "pointer",
                background: tab === t.id ? "rgba(255,255,255,0.04)" : "transparent",
                borderBottom: tab === t.id ? "2px solid #A78BFA" : "2px solid transparent",
                color: tab === t.id ? "#A78BFA" : "rgba(255,255,255,0.35)",
                fontWeight: tab === t.id ? 700 : 500, fontSize: 13 }}>
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ padding: "16px 16px" }}>

          {/* MY JOURNEY */}
          {tab === "my" && (
            <div>
              <div style={{ marginBottom: 16 }}>
                <ProgressPost
                  userInterests={userInterests}
                  displayName={user?.full_name || "Anonymous"}
                  userEmail={user?.email}
                  onPosted={() => qc.invalidateQueries({ queryKey: ["build-my-posts"] })}
                />
              </div>

              {myPosts.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px 16px",
                  background: "rgba(255,255,255,0.03)", borderRadius: 18,
                  border: "1px solid rgba(255,255,255,0.07)" }}>
                  <p style={{ fontSize: 28, marginBottom: 10 }}>🌱</p>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>
                    Your journey starts with the first post.<br />
                    Share anything — a win, a goal, or just where you're at.
                  </p>
                </div>
              ) : (
                myPosts.map(p => (
                  <PostCard key={p.id} post={p} onLike={likeMutation.mutate} />
                ))
              )}
            </div>
          )}

          {/* COMMUNITY */}
          {tab === "community" && (
            <div>
              {/* Tag filters */}
              {allCommunityTags.length > 0 && (
                <div style={{ display: "flex", gap: 6, marginBottom: 16, overflowX: "auto", scrollbarWidth: "none" }}>
                  <button onClick={() => setFilterTag(null)}
                    style={{ padding: "6px 12px", borderRadius: 20, border: "none", cursor: "pointer", flexShrink: 0,
                      background: !filterTag ? "rgba(167,139,250,0.15)" : "rgba(255,255,255,0.05)",
                      border: `1.5px solid ${!filterTag ? "rgba(167,139,250,0.4)" : "rgba(255,255,255,0.08)"}`,
                      color: !filterTag ? "#A78BFA" : "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 700 }}>
                    All
                  </button>
                  {allCommunityTags.map(id => {
                    const int = INTERESTS.find(i => i.id === id);
                    if (!int) return null;
                    const active = filterTag === id;
                    return (
                      <button key={id} onClick={() => setFilterTag(active ? null : id)}
                        style={{ padding: "6px 12px", borderRadius: 20, border: "none", cursor: "pointer", flexShrink: 0,
                          background: active ? int.color + "20" : "rgba(255,255,255,0.05)",
                          border: `1.5px solid ${active ? int.color + "50" : "rgba(255,255,255,0.08)"}`,
                          color: active ? int.color : "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 700 }}>
                        {int.emoji} {int.label}
                      </button>
                    );
                  })}
                </div>
              )}

              {filteredCommunity.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px 16px",
                  background: "rgba(255,255,255,0.03)", borderRadius: 18, border: "1px solid rgba(255,255,255,0.07)" }}>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>
                    No community posts yet. Be the first to share! 🌟
                  </p>
                </div>
              ) : (
                filteredCommunity.map(p => (
                  <PostCard key={p.id} post={p} onLike={likeMutation.mutate} />
                ))
              )}
            </div>
          )}

          {/* INTERESTS */}
          {tab === "interests" && (
            <div>
              <div style={{ borderRadius: 18, padding: "18px 20px", marginBottom: 16,
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <p style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginBottom: 4 }}>Update Your Interests</p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 16 }}>
                  You're not locked in. Change these whenever you want.
                </p>
                <InterestSelector
                  selected={userInterests}
                  onChange={(interests) => profileMutation.mutate({ interests })}
                />
                {profileMutation.isSuccess && (
                  <p style={{ fontSize: 12, color: "#10B981", marginTop: 10, fontWeight: 600 }}>✓ Saved</p>
                )}
              </div>

              {/* Identity statement */}
              <div style={{ borderRadius: 18, padding: "18px 20px",
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <p style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginBottom: 4 }}>Who are you becoming?</p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 12, fontStyle: "italic" }}>
                  Optional — just for you. Not shown publicly.
                </p>
                <textarea
                  defaultValue={profile?.identity_statement || ""}
                  placeholder="e.g. I'm someone who creates, stays consistent, and lifts others up."
                  rows={3}
                  onBlur={e => profileMutation.mutate({ identity_statement: e.target.value })}
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)",
                    color: "#fff", fontSize: 14, resize: "none", outline: "none",
                    boxSizing: "border-box", lineHeight: 1.6 }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}