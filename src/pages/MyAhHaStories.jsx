import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Plus, Eye, Edit2, Trash2, RefreshCw, Share2,
  Loader2, Sparkles, ChevronRight, AlertTriangle, Heart, MessageCircle,
} from "lucide-react";
import { demoAhHaMoments } from "@/data/pilotDemoData";

/* ── Constants ────────────────────────────────────────────────────────────── */
const TABS = [
  { id: "all",      label: "All"      },
  { id: "draft",    label: "Drafts"   },
  { id: "pending_review", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
];

const STATUS_CONFIG = {
  draft:          { label: "Draft",           color: "#9B8E83", bg: "rgba(155,142,131,.12)",  border: "rgba(155,142,131,.25)" },
  pending_review: { label: "Awaiting Review", color: "#B8823A", bg: "rgba(184,130,58,.10)",   border: "rgba(184,130,58,.25)"  },
  approved:       { label: "Live in Community", color: "#1D9E75", bg: "rgba(29,158,117,.10)", border: "rgba(29,158,117,.25)" },
  rejected:       { label: "Needs Changes",   color: "#C9534F", bg: "rgba(201,83,79,.08)",    border: "rgba(201,83,79,.2)"   },
  flagged:        { label: "Flagged",          color: "#C9534F", bg: "rgba(201,83,79,.08)",   border: "rgba(201,83,79,.2)"   },
};

const VIS_LABELS = {
  private:             "🔒 Private",
  anonymous_review:    "🌿 Anonymous",
  first_name_review:   "✨ First Name",
};

const PROMPT_LABELS = {
  tired_of_repeating: "Before the moment",
  what_happened:      "The turning point",
  feeling_in_moment:  "The emotional shift",
  decision_made:      "What happened next",
  message_to_others:  "To someone like you",
};

/* ── Story Card ───────────────────────────────────────────────────────────── */
function StoryCard({ story, onView, onEdit, onDelete, onResubmit }) {
  const cfg = STATUS_CONFIG[story.status] || STATUS_CONFIG.draft;
  const preview = (story.what_happened || story.tired_of_repeating || "")?.slice(0, 140);
  const tags = story.ai_tags || [];

  return (
    <div style={{
      background: "#FDFAF6", border: ".5px solid #E8E2D9", borderRadius: 16,
      overflow: "hidden", marginBottom: 12,
    }}>
      {/* Status bar */}
      <div style={{ height: 3, background: cfg.color, opacity: 0.6 }} />

      <div style={{ padding: "16px 18px" }}>
        {/* Top row */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontFamily: "'Lora', serif", fontSize: 15, fontWeight: 600, color: "#1C1410", lineHeight: 1.3, marginBottom: 4 }}>
              {story.title || "Untitled Story"}
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{
                fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
              }}>{cfg.label}</span>
              {story.is_anonymous !== undefined && (
                <span style={{ fontSize: 11, color: "#9B8E83" }}>
                  {story.is_anonymous ? "🌿 Anonymous" : "✨ First Name"}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Preview */}
        {preview && (
          <p style={{ fontSize: 13, color: "#4A3F35", lineHeight: 1.65, fontStyle: "italic", marginBottom: 12 }}>
            "{preview}{preview.length === 140 ? "…" : ""}"
          </p>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
            {tags.slice(0, 4).map(t => (
              <span key={t} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20,
                background: "rgba(184,130,58,.08)", color: "#B8823A", border: "1px solid rgba(184,130,58,.18)" }}>
                {t}
              </span>
            ))}
          </div>
        )}

        {/* Meta row */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
          <span style={{ fontSize: 11, color: "#9B8E83" }}>
            {new Date(story.created_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
          {(story.reaction_count > 0) && (
            <span style={{ fontSize: 11, color: "#9B8E83", display: "flex", alignItems: "center", gap: 3 }}>
              <Heart style={{ width: 11, height: 11 }} /> {story.reaction_count}
            </span>
          )}
          {(story.comment_count > 0) && (
            <span style={{ fontSize: 11, color: "#9B8E83", display: "flex", alignItems: "center", gap: 3 }}>
              <MessageCircle style={{ width: 11, height: 11 }} /> {story.comment_count}
            </span>
          )}
        </div>

        {/* Rejection note */}
        {story.status === "rejected" && story.moderation_note && (
          <div style={{ background: "rgba(201,83,79,.06)", border: "1px solid rgba(201,83,79,.18)", borderRadius: 10, padding: "10px 12px", marginBottom: 12 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#C9534F", marginBottom: 3 }}>
              ⚠️ This story needs a few changes before it can be shared publicly.
            </p>
            <p style={{ fontSize: 12, color: "#4A3F35", lineHeight: 1.55 }}>{story.moderation_note}</p>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={() => onView(story)} style={actionBtn("#1D9E75", "rgba(29,158,117,.10)")}>
            <Eye style={{ width: 12, height: 12 }} /> View
          </button>
          {(story.status === "draft" || story.status === "rejected") && (
            <button onClick={() => onEdit(story)} style={actionBtn("#B8823A", "rgba(184,130,58,.10)")}>
              <Edit2 style={{ width: 12, height: 12 }} /> Edit
            </button>
          )}
          {story.status === "rejected" && (
            <button onClick={() => onResubmit(story)} style={actionBtn("#B8823A", "rgba(184,130,58,.10)")}>
              <RefreshCw style={{ width: 12, height: 12 }} /> Resubmit
            </button>
          )}
          <button onClick={() => onDelete(story)} style={actionBtn("#C9534F", "rgba(201,83,79,.07)")}>
            <Trash2 style={{ width: 12, height: 12 }} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

const actionBtn = (color, bg) => ({
  display: "flex", alignItems: "center", gap: 5,
  padding: "7px 12px", borderRadius: 20, border: `1px solid ${color}30`,
  background: bg, color, fontSize: 11, fontWeight: 700, cursor: "pointer",
});

/* ── Story Detail View ────────────────────────────────────────────────────── */
function StoryDetail({ story, onBack, onEdit, onResubmit }) {
  const cfg = STATUS_CONFIG[story.status] || STATUS_CONFIG.draft;

  return (
    <div style={{ paddingBottom: 120 }}>
      <div style={{ background: "#FDFAF6", borderBottom: "1px solid #E8E2D9", padding: "56px 20px 24px" }}>
        <button onClick={onBack} style={{
          display: "flex", alignItems: "center", gap: 6, background: "none", border: "none",
          color: "#9B8E83", fontSize: 13, fontWeight: 600, cursor: "pointer", marginBottom: 16, padding: 0,
        }}>
          <ArrowLeft style={{ width: 15, height: 15 }} /> My Stories
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
            background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
            {cfg.label}
          </span>
          <span style={{ fontSize: 11, color: "#9B8E83" }}>
            {story.is_anonymous ? "🌿 Anonymous" : "✨ First Name"}
          </span>
        </div>

        <h1 style={{ fontFamily: "'Lora', serif", fontSize: 22, fontWeight: 600, color: "#1C1410", lineHeight: 1.3, marginBottom: 6 }}>
          {story.title || "Untitled Story"}
        </h1>
        <p style={{ fontSize: 12, color: "#9B8E83" }}>
          Written {new Date(story.created_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </p>
      </div>

      <div style={{ padding: "20px 16px" }}>

        {/* Rejection note */}
        {story.status === "rejected" && (
          <div style={{ background: "rgba(201,83,79,.06)", border: "1px solid rgba(201,83,79,.2)", borderRadius: 14, padding: "16px 18px", marginBottom: 20 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#C9534F", marginBottom: 6 }}>
              ⚠️ This story needs a few changes before it can be shared publicly.
            </p>
            {story.moderation_note && (
              <p style={{ fontSize: 13, color: "#4A3F35", lineHeight: 1.65 }}>{story.moderation_note}</p>
            )}
            <button onClick={() => onResubmit(story)} style={{
              marginTop: 12, padding: "10px 20px", borderRadius: 50, border: "none", cursor: "pointer",
              background: "#B8823A", color: "#fff", fontWeight: 700, fontSize: 13,
            }}>
              Edit and Resubmit →
            </button>
          </div>
        )}

        {/* Story sections */}
        {Object.entries(PROMPT_LABELS).map(([key, label]) => story[key] ? (
          <div key={key} style={{ background: "#FDFAF6", border: ".5px solid #E8E2D9", borderRadius: 14, padding: "18px 18px", marginBottom: 12 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#B8823A", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 8 }}>{label}</p>
            <p style={{ fontSize: 14, color: "#4A3F35", lineHeight: 1.75, fontStyle: "italic" }}>"{story[key]}"</p>
          </div>
        ) : null)}

        {/* Tags */}
        {(story.ai_tags || []).length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 8, marginBottom: 20 }}>
            {story.ai_tags.map(t => (
              <span key={t} style={{ fontSize: 12, padding: "4px 12px", borderRadius: 20,
                background: "rgba(184,130,58,.08)", color: "#B8823A", border: "1px solid rgba(184,130,58,.18)" }}>
                {t}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        {story.status === "approved" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
            {[
              { label: "Reactions", value: story.reaction_count || 0, icon: <Heart style={{ width: 14, height: 14 }} /> },
              { label: "Comments",  value: story.comment_count  || 0, icon: <MessageCircle style={{ width: 14, height: 14 }} /> },
            ].map(s => (
              <div key={s.label} style={{ background: "#FDFAF6", border: ".5px solid #E8E2D9", borderRadius: 12, padding: "14px", textAlign: "center" }}>
                <div style={{ color: "#B8823A", display: "flex", justifyContent: "center", marginBottom: 4 }}>{s.icon}</div>
                <p style={{ fontSize: 22, fontWeight: 800, color: "#B8823A" }}>{s.value}</p>
                <p style={{ fontSize: 10, color: "#9B8E83", textTransform: "uppercase", letterSpacing: ".06em", fontWeight: 600 }}>{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Edit button for drafts */}
        {(story.status === "draft" || story.status === "rejected") && (
          <button onClick={() => onEdit(story)} style={{
            width: "100%", padding: "14px", borderRadius: 50, border: "none", cursor: "pointer",
            background: "#B8823A", color: "#fff", fontWeight: 700, fontSize: 15,
          }}>
            <Edit2 style={{ width: 14, height: 14, display: "inline", marginRight: 6 }} />
            Edit This Story
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Main Page ────────────────────────────────────────────────────────────── */
export default function MyAhHaStories() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState("all");
  const [selectedStory, setSelectedStory] = useState(null);

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: stories = [], isLoading } = useQuery({
    queryKey: ["my-ahha-stories", user?.email],
    queryFn: async () => {
      try {
        return await base44.entities.AhHaMoment.filter({ user_email: user.email }, "-created_date", 100);
      } catch {
        return [];
      }
    },
    enabled: !!user?.email,
  });
  const storyRows = stories.length > 0 ? stories : demoAhHaMoments;

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.AhHaMoment.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-ahha-stories"] }),
  });

  const resubmitMutation = useMutation({
    mutationFn: (id) => base44.entities.AhHaMoment.update(id, { status: "pending_review" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-ahha-stories"] }),
  });

  const filtered = useMemo(() => {
    if (activeTab === "all") return storyRows;
    return storyRows.filter(s => s.status === activeTab);
  }, [storyRows, activeTab]);

  const stats = useMemo(() => ({
    total:    storyRows.length,
    drafts:   storyRows.filter(s => s.status === "draft").length,
    pending:  storyRows.filter(s => s.status === "pending_review").length,
    approved: storyRows.filter(s => s.status === "approved").length,
    reactions: storyRows.reduce((sum, s) => sum + (s.reaction_count || 0), 0),
  }), [storyRows]);

  const handleEdit = (story) => {
    navigate(`/SubmitAhHa?edit=${story.id}`);
  };

  const handleDelete = (story) => {
    if (window.confirm("Delete this story? This cannot be undone.")) {
      deleteMutation.mutate(story.id);
      if (selectedStory?.id === story.id) setSelectedStory(null);
    }
  };

  const handleResubmit = (story) => {
    resubmitMutation.mutate(story.id);
    if (selectedStory?.id === story.id) setSelectedStory(null);
  };

  /* Story detail view */
  if (selectedStory) return (
    <div style={{ background: "#F7F3EE", minHeight: "100vh" }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <StoryDetail
          story={selectedStory}
          onBack={() => setSelectedStory(null)}
          onEdit={handleEdit}
          onResubmit={handleResubmit}
        />
      </div>
    </div>
  );

  return (
    <div style={{ background: "#F7F3EE", minHeight: "100vh", paddingBottom: 120 }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ background: "#FDFAF6", borderBottom: "1px solid #E8E2D9", padding: "56px 20px 0" }}>
          <button onClick={() => navigate(-1)} style={{
            display: "flex", alignItems: "center", gap: 6, background: "none", border: "none",
            color: "#9B8E83", fontSize: 13, fontWeight: 600, cursor: "pointer", marginBottom: 16, padding: 0,
          }}>
            <ArrowLeft style={{ width: 15, height: 15 }} /> Back
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <Sparkles style={{ width: 14, height: 14, color: "#B8823A" }} />
            <p style={{ fontSize: 11, fontWeight: 700, color: "#B8823A", textTransform: "uppercase", letterSpacing: ".1em" }}>My Ah Ha Stories</p>
          </div>
          <h1 style={{ fontFamily: "'Lora', serif", fontSize: 24, fontWeight: 600, color: "#1C1410", lineHeight: 1.2, marginBottom: 4 }}>
            Your reflections.<br />Your growth. Your voice.
          </h1>
          <p style={{ fontSize: 13, color: "#4A3F35", marginBottom: 20 }}>
            Every story here is a chapter in your journey.
          </p>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 2, overflowX: "auto", scrollbarWidth: "none" }}>
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                padding: "10px 14px", borderRadius: "12px 12px 0 0",
                background: "transparent", border: "none", cursor: "pointer",
                borderBottom: activeTab === tab.id ? "2px solid #B8823A" : "2px solid transparent",
                color: activeTab === tab.id ? "#B8823A" : "#9B8E83",
                fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", flexShrink: 0,
              }}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: "20px 16px" }}>

          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 24 }}>
            {[
              { label: "Total",     value: stats.total,    color: "#B8823A" },
              { label: "Approved",  value: stats.approved, color: "#1D9E75" },
              { label: "Reactions", value: stats.reactions, color: "#9B8AB8" },
            ].map(s => (
              <div key={s.label} style={{ background: "#FDFAF6", border: ".5px solid #E8E2D9", borderRadius: 12, padding: "14px 10px", textAlign: "center" }}>
                <p style={{ fontSize: 26, fontWeight: 800, color: s.color, lineHeight: 1, marginBottom: 4 }}>{s.value}</p>
                <p style={{ fontSize: 9, color: "#9B8E83", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em" }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Write new CTA */}
          <button onClick={() => navigate("/SubmitAhHa")} style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            padding: "14px", borderRadius: 50, border: "none", cursor: "pointer",
            background: "#B8823A", color: "#fff", fontWeight: 700, fontSize: 14, marginBottom: 24,
          }}>
            <Plus style={{ width: 16, height: 16 }} /> Write New Ah Ha Story
          </button>

          {/* Story list */}
          {isLoading ? (
            <div style={{ display: "flex", justifyContent: "center", paddingTop: 40 }}>
              <Loader2 style={{ width: 28, height: 28, color: "#B8823A" }} className="animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div style={{
              background: "#FDFAF6", border: "1px solid #E8E2D9", borderRadius: 16,
              padding: "40px 24px", textAlign: "center",
            }}>
              <p style={{ fontSize: 32, marginBottom: 12 }}>📖</p>
              <p style={{ fontFamily: "'Lora', serif", fontSize: 16, fontWeight: 600, color: "#1C1410", marginBottom: 8 }}>
                {activeTab === "draft" ? "You haven't started a story yet."
                  : activeTab === "approved" ? "No stories have been shared publicly yet."
                  : "Your Ah Ha Moments will live here."}
              </p>
              <p style={{ fontSize: 13, color: "#9B8E83", lineHeight: 1.65 }}>
                {activeTab === "draft" || activeTab === "all"
                  ? "Start writing when you're ready. No pressure — just truth."
                  : "Keep writing. The right words will come."}
              </p>
            </div>
          ) : (
            filtered.map(story => (
              <StoryCard
                key={story.id}
                story={story}
                onView={() => setSelectedStory(story)}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onResubmit={handleResubmit}
              />
            ))
          )}

          {/* Pending callout */}
          {stats.pending > 0 && activeTab !== "pending_review" && (
            <div style={{
              marginTop: 8, background: "rgba(184,130,58,.07)", border: "1px solid rgba(184,130,58,.22)",
              borderRadius: 14, padding: "14px 16px", textAlign: "center",
            }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#B8823A" }}>
                {stats.pending} {stats.pending === 1 ? "story is" : "stories are"} awaiting review
              </p>
              <button onClick={() => setActiveTab("pending_review")} style={{
                fontSize: 12, color: "#B8823A", fontWeight: 700, background: "none", border: "none", cursor: "pointer", marginTop: 4,
              }}>View pending →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}