import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Loader2, Users, Heart, Shield, LayoutList, CircleDot } from "lucide-react";
import DailyPrompt from "@/components/community/DailyPrompt";
import RecoveryPostCard, { POST_CATEGORIES } from "@/components/community/RecoveryPostCard";
import ComposePostModal from "@/components/community/ComposePostModal";
import CrisisSupportPanel from "@/components/community/CrisisSupportPanel";
import RecoveryCirclesBrowser from "@/components/community/RecoveryCirclesBrowser";
import RecoveryCircleDetail from "@/components/community/RecoveryCircleDetail";

// ── Tokens ──────────────────────────────────────────────────────
const C = {
  teal:  "#3ECFBF",
  navy:  "#0B1220",
  muted: "rgba(255,255,255,0.28)",
};

const TABS = [
  { id: "feed",    label: "Feed",    icon: <LayoutList style={{ width: 14, height: 14 }} /> },
  { id: "support", label: "Support", icon: <Heart style={{ width: 14, height: 14 }} /> },
  { id: "circles", label: "Circles", icon: <CircleDot style={{ width: 14, height: 14 }} /> },
  { id: "safe",    label: "Safe",    icon: <Shield style={{ width: 14, height: 14 }} /> },
];

const FEED_CATEGORIES = [
  { value: "all",                   label: "All",       emoji: "" },
  { value: "daily_win",             label: "Wins",      emoji: "🏆" },
  { value: "motivation",            label: "Motivation",emoji: "🔥" },
  { value: "milestone_celebration", label: "Milestones",emoji: "🎉" },
  { value: "recovery_question",     label: "Questions", emoji: "❓" },
  { value: "meeting_experience",    label: "Meetings",  emoji: "🤲" },
  { value: "reentry_advice",        label: "Reentry",   emoji: "🗺️" },
  { value: "job_housing_help",      label: "Jobs",      emoji: "🏠" },
  { value: "journal_reflection",    label: "Journal",   emoji: "📓" },
];

const SUPPORT_CATEGORIES = ["need_support", "craving_now"];

const COMMUNITY_GUIDELINES = [
  "Speak from your own experience using 'I' statements",
  "No hate speech, bullying, or personal attacks",
  "Do not glorify or share details of substance use",
  "Respect anonymity — what's shared here stays here",
  "Offer support, not unsolicited advice",
  "Report content that feels harmful to the community",
  "If someone is in crisis, connect them to professional help",
];

export default function VoicesOfRecovery() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("feed");
  const [feedFilter, setFeedFilter] = useState("all");
  const [showCompose, setShowCompose] = useState(false);
  const [composeInitContent, setComposeInitContent] = useState("");
  const [composeInitCat, setComposeInitCat] = useState("daily_win");
  const [crisisPost, setCrisisPost] = useState(null);
  const [joinedCircles, setJoinedCircles] = useState(() => {
    try { return JSON.parse(localStorage.getItem("joined_circles") || "[]"); } catch { return []; }
  });
  const [openCircle, setOpenCircle] = useState(null);

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["community-posts", activeTab, feedFilter],
    queryFn: () => {
      const filter = { moderation_status: "approved" };
      if (feedFilter !== "all" && activeTab === "feed") filter.category = feedFilter;
      return base44.entities.CommunityPost.filter(filter, "-created_date", 60);
    },
    enabled: activeTab !== "circles",
  });

  const handleJoinCircle = (id) => {
    setJoinedCircles(prev => {
      const updated = [...prev, id];
      localStorage.setItem("joined_circles", JSON.stringify(updated));
      return updated;
    });
  };

  const handleLeaveCircle = (id) => {
    setJoinedCircles(prev => {
      const updated = prev.filter(x => x !== id);
      localStorage.setItem("joined_circles", JSON.stringify(updated));
      return updated;
    });
  };

  // Client-side filtering for tabs
  const displayPosts = useMemo(() => {
    if (activeTab === "support") {
      return posts.filter(p => SUPPORT_CATEGORIES.includes(p.category) || p.post_type === "support_request");
    }
    return posts;
  }, [posts, activeTab]);

  // Urgent posts (for feed tab — surface at top)
  const urgentPosts = useMemo(() =>
    displayPosts.filter(p => SUPPORT_CATEGORIES.includes(p.category)),
    [displayPosts]
  );
  const normalPosts = useMemo(() =>
    displayPosts.filter(p => !SUPPORT_CATEGORIES.includes(p.category)),
    [displayPosts]
  );

  const openCompose = (cat = "daily_win", initialContent = "") => {
    setComposeInitCat(cat);
    setComposeInitContent(initialContent);
    setShowCompose(true);
  };

  const handlePrompt = (promptText) => {
    openCompose("journal_reflection", promptText + "\n\n");
  };

  return (
    <div style={{ background: "linear-gradient(170deg,#070D1C,#0B1424)", minHeight: "100vh", paddingBottom: 100 }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>

        {/* ── Header ── */}
        <div style={{
          background: "linear-gradient(155deg,#0E1D3A,#081426)",
          padding: "52px 20px 0", position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: -60, right: -60, width: 240, height: 240, borderRadius: "50%",
            background: "radial-gradient(circle,rgba(62,207,191,0.09) 0%,transparent 70%)", pointerEvents: "none" }} />

          <div style={{ position: "relative", zIndex: 1, marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 4 }}>
              Recovery Community
            </p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>Community</h1>
                <p style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Safe. Structured. Supportive.</p>
              </div>
              {user && (
                <button
                  onClick={() => openCompose()}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "10px 16px", borderRadius: 14,
                    background: "linear-gradient(135deg,#3ECFBF,#2CB8AE)",
                    border: "none", color: "#fff", fontWeight: 800, fontSize: 13, cursor: "pointer",
                    boxShadow: "0 4px 18px rgba(62,207,191,0.3)",
                  }}
                >
                  <Plus style={{ width: 14, height: 14 }} /> Post
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 2, marginBottom: 0 }}>
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setFeedFilter("all"); setOpenCircle(null); }}
                style={{
                  flex: 1, padding: "10px 4px", borderRadius: "12px 12px 0 0",
                  background: activeTab === tab.id ? "rgba(255,255,255,0.07)" : "transparent",
                  border: "none", cursor: "pointer",
                  borderBottom: activeTab === tab.id ? `2px solid ${C.teal}` : "2px solid transparent",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                }}
              >
                <span style={{ color: activeTab === tab.id ? C.teal : C.muted }}>{tab.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: activeTab === tab.id ? "#fff" : C.muted }}>
                  {tab.label}
                </span>
                {tab.id === "support" && urgentPosts.length > 0 && activeTab !== "support" && (
                  <span style={{
                    width: 14, height: 14, borderRadius: "50%", background: "#FB923C",
                    fontSize: 9, fontWeight: 900, color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {urgentPosts.length > 9 ? "9+" : urgentPosts.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: "16px 16px 0" }}>

          {/* ════════════════════ FEED TAB ════════════════════ */}
          {activeTab === "feed" && (
            <>
              <DailyPrompt onPromptSelect={handlePrompt} />

              {/* Category filter chips */}
              <div style={{ display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none", marginBottom: 16, paddingBottom: 4 }}>
                {FEED_CATEGORIES.map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => setFeedFilter(cat.value)}
                    style={{
                      padding: "7px 14px", borderRadius: 20, border: "none", cursor: "pointer",
                      background: feedFilter === cat.value ? C.teal : "rgba(255,255,255,0.07)",
                      color: feedFilter === cat.value ? "#fff" : "rgba(255,255,255,0.5)",
                      fontWeight: 700, fontSize: 12, flexShrink: 0, whiteSpace: "nowrap",
                      boxShadow: feedFilter === cat.value ? "0 4px 12px rgba(62,207,191,0.25)" : "none",
                    }}
                  >
                    {cat.emoji} {cat.label}
                  </button>
                ))}
              </div>

              {isLoading && (
                <div style={{ textAlign: "center", paddingTop: 40 }}>
                  <Loader2 style={{ width: 24, height: 24, color: C.teal, margin: "0 auto" }} className="animate-spin" />
                </div>
              )}

              {/* Urgent posts surfaced first */}
              {activeTab === "feed" && urgentPosts.length > 0 && feedFilter === "all" && (
                <div style={{ marginBottom: 8 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#FB923C", textTransform: "uppercase",
                    letterSpacing: ".07em", marginBottom: 10 }}>⚡ Needs Support Now</p>
                  {urgentPosts.slice(0, 2).map(post => (
                    <RecoveryPostCard key={post.id} post={post} user={user} onCrisisClick={setCrisisPost} />
                  ))}
                </div>
              )}

              {normalPosts.length === 0 && !isLoading && (
                <div style={{ textAlign: "center", padding: "48px 20px",
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18 }}>
                  <p style={{ fontSize: 24, marginBottom: 10 }}>💭</p>
                  <p style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 6 }}>No posts in this category yet.</p>
                  <p style={{ fontSize: 13, color: C.muted, marginBottom: 18 }}>Be the first to share your experience.</p>
                  <button onClick={() => openCompose(feedFilter !== "all" ? feedFilter : "daily_win")} style={{
                    padding: "10px 22px", borderRadius: 12,
                    background: "linear-gradient(135deg,#3ECFBF,#2CB8AE)",
                    border: "none", color: "#fff", fontWeight: 700, cursor: "pointer",
                  }}>
                    Share Something →
                  </button>
                </div>
              )}

              {normalPosts.map(post => (
                <RecoveryPostCard key={post.id} post={post} user={user} onCrisisClick={setCrisisPost} />
              ))}
            </>
          )}

          {/* ════════════════════ SUPPORT TAB ════════════════════ */}
          {activeTab === "support" && (
            <>
              <div style={{
                background: "rgba(251,146,60,0.08)", border: "1px solid rgba(251,146,60,0.2)",
                borderRadius: 14, padding: "14px 16px", marginBottom: 16,
              }}>
                <p style={{ fontSize: 14, fontWeight: 800, color: "#FB923C", marginBottom: 4 }}>🤝 Support Requests</p>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.55 }}>
                  These members have reached out for support. A kind word, a reaction, or sharing a resource can make a real difference.
                </p>
              </div>

              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <button onClick={() => openCompose("need_support")} style={{
                  flex: 1, padding: "11px", borderRadius: 12,
                  background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)",
                  color: "#F87171", fontWeight: 700, fontSize: 13, cursor: "pointer",
                }}>
                  🤝 I Need Support
                </button>
                <button onClick={() => openCompose("craving_now")} style={{
                  flex: 1, padding: "11px", borderRadius: 12,
                  background: "rgba(251,146,60,0.1)", border: "1px solid rgba(251,146,60,0.25)",
                  color: "#FB923C", fontWeight: 700, fontSize: 13, cursor: "pointer",
                }}>
                  ⚡ Craving Right Now
                </button>
              </div>

              {isLoading && (
                <div style={{ textAlign: "center", paddingTop: 40 }}>
                  <Loader2 style={{ width: 24, height: 24, color: C.teal, margin: "0 auto" }} className="animate-spin" />
                </div>
              )}

              {!isLoading && displayPosts.length === 0 && (
                <div style={{ textAlign: "center", padding: "48px 20px",
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18 }}>
                  <p style={{ fontSize: 28, marginBottom: 10 }}>💙</p>
                  <p style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>Everyone's holding steady right now.</p>
                  <p style={{ fontSize: 13, color: C.muted, marginTop: 6 }}>
                    When someone needs support, their post will appear here.
                  </p>
                </div>
              )}

              {displayPosts.map(post => (
                <RecoveryPostCard key={post.id} post={post} user={user} onCrisisClick={setCrisisPost} />
              ))}
            </>
          )}

          {/* ════════════════════ GROUPS TAB ════════════════════ */}
          {activeTab === "groups" && (
            <>
              <AccountabilityGroups onSelectGroup={setActiveGroup} activeGroup={activeGroup} />

              {activeGroup && (
                <div style={{ marginTop: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Group Posts</p>
                    <button onClick={() => openCompose("daily_win")} style={{
                      padding: "6px 14px", borderRadius: 10,
                      background: "rgba(62,207,191,0.15)", border: "1px solid rgba(62,207,191,0.3)",
                      color: C.teal, fontWeight: 700, fontSize: 12, cursor: "pointer",
                    }}>
                      + Post to Group
                    </button>
                  </div>

                  {isLoading
                    ? <div style={{ textAlign: "center", paddingTop: 30 }}><Loader2 style={{ width: 22, height: 22, color: C.teal }} className="animate-spin" /></div>
                    : displayPosts.length === 0
                      ? (
                        <div style={{ textAlign: "center", padding: "40px 20px",
                          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18 }}>
                          <p style={{ fontSize: 13, color: C.muted }}>No posts in this group yet. Be the first!</p>
                        </div>
                      )
                      : displayPosts.map(post => (
                          <RecoveryPostCard key={post.id} post={post} user={user} onCrisisClick={setCrisisPost} />
                        ))
                  }
                </div>
              )}

              {!activeGroup && (
                <div style={{ marginTop: 20, padding: "24px 20px", textAlign: "center",
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18 }}>
                  <p style={{ fontSize: 24, marginBottom: 10 }}>👆</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 6 }}>Select a group above</p>
                  <p style={{ fontSize: 13, color: C.muted }}>Choose a group to see posts and connect with peers on a similar path.</p>
                </div>
              )}
            </>
          )}

          {/* ════════════════════ SAFE SPACE TAB ════════════════════ */}
          {activeTab === "safe" && (
            <div>
              {/* Guidelines */}
              <div style={{
                background: "rgba(62,207,191,0.06)", border: "1px solid rgba(62,207,191,0.2)",
                borderRadius: 18, padding: "18px 20px", marginBottom: 16,
              }}>
                <p style={{ fontSize: 14, fontWeight: 800, color: C.teal, marginBottom: 12 }}>🛡️ Community Guidelines</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {COMMUNITY_GUIDELINES.map((g, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(62,207,191,0.15)",
                        color: C.teal, display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 10, fontWeight: 900, flexShrink: 0, marginTop: 1 }}>
                        {i + 1}
                      </div>
                      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.55 }}>{g}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verified roles */}
              <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 18, padding: "18px 20px", marginBottom: 16 }}>
                <p style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginBottom: 12 }}>✅ Verified Community Members</p>
                {[
                  { badge: "🏥", role: "Counselor",     color: "#3ECFBF", desc: "Licensed treatment professionals" },
                  { badge: "🤝", role: "Peer Mentor",   color: "#A78BFA", desc: "Trained peer support specialists" },
                  { badge: "⭐", role: "Alumni",        color: "#C9A96E", desc: "Graduates with long-term recovery" },
                  { badge: "💙", role: "Peer Support",  color: "#60A5FA", desc: "Certified community support members" },
                ].map(v => (
                  <div key={v.role} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0",
                    borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{v.badge}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: v.color }}>{v.role}</p>
                      <p style={{ fontSize: 12, color: C.muted }}>{v.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Report + privacy */}
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, padding: "18px 20px" }}>
                <p style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginBottom: 10 }}>🔒 Privacy & Safety</p>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.65 }}>
                  All posts are moderated. Anonymous posting is always available. You can report any post using the flag icon. 
                  In an emergency, call <strong style={{ color: "#F87171" }}>988</strong> or <strong style={{ color: "#F87171" }}>911</strong>.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Sign-in banner */}
        {!user && (
          <div style={{ margin: "16px 16px 0", padding: "16px", borderRadius: 16, textAlign: "center",
            background: "rgba(62,207,191,0.08)", border: "1px solid rgba(62,207,191,0.2)" }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 10 }}>Join the Community</p>
            <button onClick={() => base44.auth.redirectToLogin()} style={{
              padding: "10px 24px", borderRadius: 12,
              background: "linear-gradient(135deg,#3ECFBF,#2CB8AE)",
              border: "none", color: "#fff", fontWeight: 800, cursor: "pointer",
            }}>
              Sign in to post & react
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCompose && (
        <ComposePostModal
          onClose={() => setShowCompose(false)}
          initialContent={composeInitContent}
          initialCategory={composeInitCat}
        />
      )}

      {crisisPost && (
        <CrisisSupportPanel post={crisisPost} onClose={() => setCrisisPost(null)} />
      )}
    </div>
  );
}