import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Plus, MessageCircle, CalendarCheck, BookOpen, ShieldCheck, Flag } from "lucide-react";
import RecoveryPostCard from "./RecoveryPostCard";
import ComposePostModal from "./ComposePostModal";
import CrisisSupportPanel from "./CrisisSupportPanel";

const C = {
  muted: "rgba(255,255,255,0.3)",
  slate: "rgba(255,255,255,0.6)",
};

const CIRCLE_TABS = [
  { id: "feed",     label: "Feed",      icon: <MessageCircle style={{ width: 13, height: 13 }} /> },
  { id: "checkin",  label: "Check-In",  icon: <CalendarCheck style={{ width: 13, height: 13 }} /> },
  { id: "resources",label: "Resources", icon: <BookOpen style={{ width: 13, height: 13 }} /> },
];

const RESOURCES_BY_CATEGORY = {
  substance: [
    { title: "SAMHSA Substance Abuse Helpline", url: "https://www.samhsa.gov", icon: "📞" },
    { title: "How to Manage Cravings", url: "https://www.samhsa.gov", icon: "💡" },
    { title: "Medication-Assisted Treatment Info", url: "https://www.samhsa.gov", icon: "💊" },
    { title: "Find a Detox Center Near You", url: "https://findtreatment.gov", icon: "🏥" },
  ],
  reentry: [
    { title: "Reentry Council Resources", url: "https://csgjusticecenter.org", icon: "🗺️" },
    { title: "Ban the Box Employers List", url: "https://bantheboxcampaign.org", icon: "💼" },
    { title: "NJ Reentry Resources", url: "https://www.nj.gov", icon: "🏠" },
    { title: "Understanding Probation & Parole", url: "https://nicic.gov", icon: "⚖️" },
  ],
  early: [
    { title: "What to Expect in Early Recovery", url: "https://www.samhsa.gov", icon: "📖" },
    { title: "Building a Sober Routine", url: "https://www.samhsa.gov", icon: "🔥" },
    { title: "Find AA/NA Meetings Near You", url: "https://www.aa.org", icon: "🤝" },
    { title: "Relapse Prevention Basics", url: "https://www.samhsa.gov", icon: "🛡️" },
  ],
  lifestyle: [
    { title: "Recovery and Parenting Guide", url: "https://www.samhsa.gov", icon: "👨‍👧" },
    { title: "LGBTQ+ Recovery Resources", url: "https://williamsinstitute.law.ucla.edu", icon: "🏳️‍🌈" },
    { title: "Men's Mental Health in Recovery", url: "https://www.samhsa.gov", icon: "💪" },
    { title: "Women in Recovery Support Guide", url: "https://www.samhsa.gov", icon: "🌸" },
  ],
  reintegration: [
    { title: "Second-Chance Employers Directory", url: "https://www.careeronestop.org", icon: "💼" },
    { title: "HUD Housing Assistance", url: "https://www.hud.gov", icon: "🏠" },
    { title: "Benefits.gov — Programs You May Qualify For", url: "https://www.benefits.gov", icon: "📋" },
    { title: "GED Testing Centers", url: "https://ged.com", icon: "🎓" },
  ],
  trauma: [
    { title: "National Domestic Violence Hotline", url: "https://www.thehotline.org", icon: "🛡️" },
    { title: "PTSD & Trauma Recovery Guide", url: "https://www.ptsd.va.gov", icon: "💜" },
    { title: "Grief Support Resources", url: "https://www.griefshare.org", icon: "🕊️" },
    { title: "EMDR Therapy Finder", url: "https://www.emdria.org", icon: "🧠" },
  ],
};

const GUIDELINES = [
  "Speak from your own experience — use 'I' statements",
  "No glorifying substance use or behaviors",
  "Respect anonymity — what's shared here stays here",
  "Offer empathy, not unsolicited advice",
  "Flag harmful or triggering content using the report button",
  "Crisis posts will surface immediate support resources",
];

function CheckInThread({ circle, user }) {
  const [entry, setEntry] = useState("");
  const queryClient = useQueryClient();

  const todayStr = new Date().toISOString().split("T")[0];

  const { data: todayCheckins = [], isLoading } = useQuery({
    queryKey: ["circle-checkins", circle.id, todayStr],
    queryFn: () => base44.entities.CommunityPost.filter({
      group_id: circle.id,
      category: "journal_reflection",
      moderation_status: "approved",
    }, "-created_date", 20),
  });

  const submitMutation = useMutation({
    mutationFn: () => base44.entities.CommunityPost.create({
      title: `Daily Check-In · ${todayStr}`,
      content: entry.trim(),
      category: "journal_reflection",
      group_id: circle.id,
      post_type: "group_post",
      is_anonymous: false,
      moderation_status: "approved",
      like_count: 0,
    }),
    onSuccess: () => {
      setEntry("");
      queryClient.invalidateQueries(["circle-checkins", circle.id]);
    },
  });

  return (
    <div>
      <div style={{
        background: `${circle.color}10`, border: `1px solid ${circle.color}30`,
        borderRadius: 14, padding: "14px 16px", marginBottom: 16,
      }}>
        <p style={{ fontSize: 14, fontWeight: 800, color: circle.color, marginBottom: 4 }}>
          📅 Today's Check-In Thread
        </p>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginBottom: 12, lineHeight: 1.5 }}>
          {circle.prompt}
        </p>
        {user ? (
          <>
            <textarea
              value={entry}
              onChange={e => setEntry(e.target.value)}
              placeholder="Share how you're doing today…"
              rows={3}
              style={{
                width: "100%", padding: "10px 12px",
                background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 10, color: "#fff", fontSize: 13, outline: "none", resize: "none",
                lineHeight: 1.6, boxSizing: "border-box", marginBottom: 8,
              }}
            />
            <button
              onClick={() => submitMutation.mutate()}
              disabled={!entry.trim() || submitMutation.isPending}
              style={{
                padding: "9px 18px", borderRadius: 10,
                background: entry.trim() ? `linear-gradient(135deg,${circle.color},${circle.color}CC)` : "rgba(255,255,255,0.06)",
                border: "none", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6,
              }}
            >
              {submitMutation.isPending ? <Loader2 style={{ width: 13, height: 13 }} className="animate-spin" /> : "Post Check-In"}
            </button>
          </>
        ) : (
          <p style={{ fontSize: 12, color: C.muted }}>Sign in to add your check-in.</p>
        )}
      </div>

      {isLoading && <div style={{ textAlign: "center", padding: 20 }}><Loader2 style={{ width: 20, height: 20, color: circle.color }} className="animate-spin" /></div>}

      {todayCheckins.length === 0 && !isLoading && (
        <div style={{ textAlign: "center", padding: "32px 20px", background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14 }}>
          <p style={{ fontSize: 13, color: C.muted }}>No check-ins yet today. Be the first! 💙</p>
        </div>
      )}

      {todayCheckins.map(post => (
        <RecoveryPostCard key={post.id} post={post} user={user} />
      ))}
    </div>
  );
}

export default function RecoveryCircleDetail({ circle, joined, onJoin, onLeave, onBack, user }) {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("feed");
  const [showCompose, setShowCompose] = useState(false);
  const [crisisPost, setCrisisPost] = useState(null);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["circle-posts", circle.id],
    queryFn: () => base44.entities.CommunityPost.filter({
      group_id: circle.id,
      moderation_status: "approved",
    }, "-created_date", 40),
    enabled: tab === "feed",
  });

  const resources = RESOURCES_BY_CATEGORY[circle.category] || [];

  return (
    <div>
      {/* Circle Header */}
      <div style={{
        background: `linear-gradient(145deg, ${circle.color}18, rgba(255,255,255,0.02))`,
        border: `1px solid ${circle.color}30`,
        borderRadius: 20, padding: "18px 18px 14px", marginBottom: 4,
      }}>
        <button onClick={onBack} style={{
          display: "flex", alignItems: "center", gap: 6, background: "none", border: "none",
          color: C.muted, fontSize: 13, cursor: "pointer", marginBottom: 12, padding: 0,
        }}>
          <ArrowLeft style={{ width: 14, height: 14 }} /> All Circles
        </button>

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16, background: `${circle.color}25`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0,
            }}>
              {circle.emoji}
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>{circle.name}</h2>
              {circle.sensitive && (
                <span style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8",
                  background: "rgba(148,163,184,0.12)", padding: "2px 7px", borderRadius: 20 }}>
                  🔒 Sensitive Topics
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => joined ? onLeave(circle.id) : onJoin(circle.id)}
            style={{
              padding: "8px 16px", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer",
              background: joined ? "rgba(255,255,255,0.06)" : `${circle.color}25`,
              border: `1px solid ${joined ? "rgba(255,255,255,0.12)" : `${circle.color}55`}`,
              color: joined ? C.muted : circle.color, flexShrink: 0,
            }}
          >
            {joined ? "✓ Joined" : "Join Circle"}
          </button>
        </div>

        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.6, marginBottom: 12 }}>
          {circle.desc}
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {circle.topics.map(t => (
            <span key={t} style={{
              fontSize: 11, padding: "3px 9px", borderRadius: 20,
              background: `${circle.color}12`, color: circle.color,
              border: `1px solid ${circle.color}25`, fontWeight: 600,
            }}>
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Inner Tabs */}
      <div style={{ display: "flex", gap: 2, margin: "12px 0 16px" }}>
        {CIRCLE_TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              flex: 1, padding: "9px 4px", borderRadius: 10, border: "none", cursor: "pointer",
              background: tab === t.id ? `${circle.color}20` : "rgba(255,255,255,0.04)",
              borderBottom: `2px solid ${tab === t.id ? circle.color : "transparent"}`,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
            }}
          >
            <span style={{ color: tab === t.id ? circle.color : C.muted }}>{t.icon}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: tab === t.id ? "#fff" : C.muted }}>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Feed Tab */}
      {tab === "feed" && (
        <>
          {user && (
            <button
              onClick={() => setShowCompose(true)}
              style={{
                width: "100%", padding: "12px", marginBottom: 14, borderRadius: 12,
                background: `${circle.color}15`, border: `1px dashed ${circle.color}45`,
                color: circle.color, fontWeight: 700, fontSize: 13, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}
            >
              <Plus style={{ width: 14, height: 14 }} /> Post to {circle.name}
            </button>
          )}

          {isLoading && (
            <div style={{ textAlign: "center", padding: 30 }}>
              <Loader2 style={{ width: 22, height: 22, color: circle.color }} className="animate-spin" />
            </div>
          )}

          {!isLoading && posts.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 20px",
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16 }}>
              <p style={{ fontSize: 22, marginBottom: 8 }}>{circle.emoji}</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 6 }}>No posts yet in this circle</p>
              <p style={{ fontSize: 13, color: C.muted }}>Be the first to start the conversation.</p>
            </div>
          )}

          {posts.map(post => (
            <RecoveryPostCard key={post.id} post={post} user={user} onCrisisClick={setCrisisPost} />
          ))}
        </>
      )}

      {/* Check-In Tab */}
      {tab === "checkin" && <CheckInThread circle={circle} user={user} />}

      {/* Resources Tab */}
      {tab === "resources" && (
        <div>
          <div style={{
            background: `${circle.color}0E`, border: `1px solid ${circle.color}25`,
            borderRadius: 14, padding: "14px 16px", marginBottom: 14,
          }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: circle.color, marginBottom: 4 }}>
              📚 Circle Resources
            </p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
              Curated tools and resources for this circle's specific journey.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            {resources.map(r => (
              <a key={r.title} href={r.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "13px 16px",
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 14,
                }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{r.icon}</span>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{r.title}</p>
                    <p style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>External resource →</p>
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* Community Guidelines */}
          <div style={{ background: "rgba(62,207,191,0.06)", border: "1px solid rgba(62,207,191,0.2)",
            borderRadius: 14, padding: "14px 16px" }}>
            <p style={{ fontSize: 13, fontWeight: 800, color: "#3ECFBF", marginBottom: 10 }}>🛡️ Circle Guidelines</p>
            {GUIDELINES.map((g, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
                <div style={{ width: 18, height: 18, borderRadius: "50%", background: "rgba(62,207,191,0.15)",
                  color: "#3ECFBF", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 9, fontWeight: 900, flexShrink: 0, marginTop: 1 }}>
                  {i + 1}
                </div>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.55 }}>{g}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {showCompose && (
        <ComposePostModal
          onClose={() => setShowCompose(false)}
          initialCategory="daily_win"
          circleId={circle.id}
        />
      )}

      {crisisPost && (
        <CrisisSupportPanel post={crisisPost} onClose={() => setCrisisPost(null)} />
      )}
    </div>
  );
}