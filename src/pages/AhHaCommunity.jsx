import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Search, X, ArrowLeft, Loader2, Heart, MessageCircle,
  Bookmark, Share2, Flag, Star, Clock, ChevronDown, ChevronUp,
} from "lucide-react";

/* ── Constants ────────────────────────────────────────────────────────────── */
const FILTERS = [
  { id: "recent",     label: "Most Recent"    },
  { id: "reactions",  label: "Most Reacted"   },
  { id: "inspiring",  label: "Most Inspiring" },
];

const TAG_FILTERS = [
  "Recovery","Mental Health","Starting Over","Prison / Reentry",
  "Sobriety","Hope","Fatherhood","Motherhood","Faith","Loss","Healing","Motivation",
];

const REACTIONS = [
  { type: "needed_this",  emoji: "🙏", label: "Needed This"  },
  { type: "respect",      emoji: "✊", label: "Respect"       },
  { type: "powerful",     emoji: "⚡", label: "Powerful"      },
  { type: "inspiring",    emoji: "🌟", label: "Inspiring"     },
  { type: "proud_of_you", emoji: "💛", label: "Proud of You"  },
];

const REPORT_REASONS = [
  { value: "harmful_content",       label: "Harmful content"        },
  { value: "spam",                  label: "Spam"                   },
  { value: "inappropriate_details", label: "Inappropriate details"  },
  { value: "triggering_unsafe",     label: "Triggering / unsafe"    },
  { value: "other",                 label: "Other"                  },
];

/* ── Helpers ──────────────────────────────────────────────────────────────── */
function displayName(story) {
  if (story.is_anonymous || story.display_name_mode === "anonymous") return "Anonymous";
  if (story.first_name_display) return story.first_name_display;
  return "Anonymous";
}

function readTime(story) {
  return story.estimated_read_time || 1;
}

/* ── Reaction Bar ─────────────────────────────────────────────────────────── */
function ReactionBar({ story, userReactions, onReact, compact }) {
  const [open, setOpen] = useState(false);
  const total = story.reactions_count || 0;

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: "flex", alignItems: "center", gap: 5,
          padding: compact ? "6px 12px" : "8px 14px", borderRadius: 20,
          border: "1px solid var(--border)", background: "var(--card)",
          cursor: "pointer", fontSize: 12, fontWeight: 700, color: "var(--text-muted)",
        }}
      >
        <Heart style={{ width: 13, height: 13, color: total > 0 ? "var(--gold)" : "var(--text-muted)" }} />
        {total > 0 ? total : "React"}
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 40 }} />
          <div style={{
            position: "absolute", bottom: "calc(100% + 8px)", left: 0, zIndex: 50,
            background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16,
            padding: "10px 8px", display: "flex", gap: 4, boxShadow: "0 4px 20px rgba(0,0,0,.12)",
          }}>
            {REACTIONS.map(r => {
              const reacted = userReactions?.includes(r.type);
              return (
                <button key={r.type} onClick={() => { onReact(r.type); setOpen(false); }} style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                  padding: "8px 10px", borderRadius: 12, border: "none", cursor: "pointer",
                  background: reacted ? "rgba(184,130,58,.12)" : "transparent",
                  transition: "background .15s",
                }}>
                  <span style={{ fontSize: 20 }}>{r.emoji}</span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: reacted ? "var(--gold)" : "var(--text-muted)", whiteSpace: "nowrap" }}>{r.label}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Report Modal ─────────────────────────────────────────────────────────── */
function ReportModal({ onClose, onSubmit }) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "flex-end" }}>
      <div style={{ width: "100%", maxWidth: 480, margin: "0 auto", background: "var(--card)", borderRadius: "20px 20px 0 0", padding: "24px 20px 40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <p style={{ fontFamily: "'Lora', serif", fontSize: 16, fontWeight: 600, color: "var(--text)" }}>Report this story</p>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 22 }}>✕</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
          {REPORT_REASONS.map(r => (
            <button key={r.value} onClick={() => setReason(r.value)} style={{
              padding: "11px 14px", borderRadius: 10, textAlign: "left", cursor: "pointer",
              border: reason === r.value ? "1.5px solid var(--gold)" : "1px solid var(--border)",
              background: reason === r.value ? "rgba(184,130,58,.07)" : "var(--card)",
              fontSize: 13, fontWeight: reason === r.value ? 700 : 500, color: "var(--text)",
            }}>{r.label}</button>
          ))}
        </div>
        <textarea value={details} onChange={e => setDetails(e.target.value)} placeholder="Optional details…" rows={2}
          style={{ width: "100%", resize: "none", padding: "11px 12px", borderRadius: 10, border: "1px solid var(--border)",
            background: "var(--surface)", fontSize: 13, color: "var(--text)", outline: "none", boxSizing: "border-box", marginBottom: 14 }} />
        <button onClick={() => onSubmit(reason, details)} disabled={!reason} style={{
          width: "100%", padding: "14px", borderRadius: 50, border: "none", cursor: reason ? "pointer" : "default",
          background: reason ? "#C9534F" : "var(--border)", color: "#fff", fontWeight: 700, fontSize: 14,
        }}>Submit Report</button>
      </div>
    </div>
  );
}

/* ── Full Story View ──────────────────────────────────────────────────────── */
function StoryDetail({ story, user, userReactions, userSaved, onReact, onSave, onReport, onBack }) {
  const [showReport, setShowReport] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const qc = useQueryClient();

  const { data: storyComments = [] } = useQuery({
    queryKey: ["ahha-comments", story.id],
    queryFn: () => base44.entities.AhHaStoryComment.filter({ story_id: story.id, approval_status: "visible" }, "-created_date", 50),
  });

  const commentMutation = useMutation({
    mutationFn: () => base44.entities.AhHaStoryComment.create({
      story_id: story.id, user_email: user.email, comment_text: comment, approval_status: "visible",
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ahha-comments", story.id] }); setComment(""); },
  });

  const SECTION_LABELS = [
    { key: "before_moment",   label: "Before the moment"    },
    { key: "turning_point",   label: "The turning point"    },
    { key: "emotional_shift", label: "The emotional shift"  },
    { key: "next_action",     label: "What happened next"   },
    { key: "advice_to_others",label: "To someone like you"  },
  ];

  return (
    <div style={{ background: "transparent", minHeight: "100vh", paddingBottom: 120, color: "var(--text)" }}>
      {showReport && (
        <ReportModal
          onClose={() => setShowReport(false)}
          onSubmit={(reason, details) => { onReport(story, reason, details); setShowReport(false); }}
        />
      )}

      {/* Header */}
      <div style={{ background: "var(--card)", borderBottom: "1px solid var(--border)", padding: "56px 20px 24px" }}>
        <button onClick={onBack} style={{
          display: "flex", alignItems: "center", gap: 6, background: "none", border: "none",
          color: "var(--text-muted)", fontSize: 13, fontWeight: 600, cursor: "pointer", marginBottom: 16, padding: 0,
        }}>
          <ArrowLeft style={{ width: 15, height: 15 }} /> Community
        </button>

        {story.featured_status && (
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 10 }}>
            <Star style={{ width: 13, height: 13, color: "var(--gold)" }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: "var(--gold)", textTransform: "uppercase", letterSpacing: ".1em" }}>Featured Story</span>
          </div>
        )}

        <h1 style={{ fontFamily: "'Lora', serif", fontSize: 22, fontWeight: 600, color: "var(--text)", lineHeight: 1.3, marginBottom: 10 }}>
          {story.title}
        </h1>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)" }}>{displayName(story)}</span>
          {story.clean_time_value && story.clean_time_unit && (
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>• {story.clean_time_value} {story.clean_time_unit} in recovery</span>
          )}
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>• {readTime(story)} min read</span>
        </div>

        {(story.ai_tags || []).length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {story.ai_tags.map(t => (
              <span key={t} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20,
                background: "rgba(184,130,58,.09)", color: "var(--gold)", border: "1px solid rgba(184,130,58,.2)" }}>{t}</span>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: "20px 16px" }}>

        {/* Story sections */}
        {SECTION_LABELS.map(s => story[s.key] ? (
          <div key={s.key} style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "var(--gold)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 8 }}>{s.label}</p>
            <p style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.8, fontStyle: "italic" }}>"{story[s.key]}"</p>
          </div>
        ) : null)}

        {/* Action bar */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", paddingTop: 16, borderTop: "1px solid var(--border)", marginBottom: 24 }}>
          <ReactionBar story={story} userReactions={userReactions} onReact={(t) => onReact(story, t)} />

          <button onClick={() => onSave(story)} style={{
            display: "flex", alignItems: "center", gap: 5, padding: "8px 14px", borderRadius: 20,
            border: "1px solid var(--border)",
            background: userSaved ? "rgba(184,130,58,.10)" : "var(--card)",
            cursor: "pointer", fontSize: 12, fontWeight: 700,
            color: userSaved ? "var(--gold)" : "var(--text-muted)",
          }}>
            <Bookmark style={{ width: 13, height: 13 }} />
            {userSaved ? "Saved" : "Save"}
          </button>

          <button onClick={() => setShowReport(true)} style={{
            display: "flex", alignItems: "center", gap: 5, padding: "8px 14px", borderRadius: 20,
            border: "1px solid var(--border)", background: "var(--card)",
            cursor: "pointer", fontSize: 12, fontWeight: 700, color: "var(--text-muted)",
          }}>
            <Flag style={{ width: 13, height: 13 }} /> Report
          </button>
        </div>

        {/* Comments */}
        {story.comments_enabled !== false && (
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>
              Community Response
            </p>
            <div style={{ background: "rgba(184,130,58,.06)", border: "1px solid rgba(184,130,58,.15)", borderRadius: 12, padding: "10px 14px", marginBottom: 14 }}>
              <p style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic" }}>
                This space is for encouragement, not judgment.
              </p>
            </div>

            {user && (
              <div style={{ marginBottom: 16 }}>
                <textarea value={comment} onChange={e => setComment(e.target.value)}
                  placeholder="Leave an encouraging word…" rows={3}
                  style={{ width: "100%", resize: "none", padding: "12px 14px", borderRadius: 12,
                    border: "1px solid var(--border)", background: "var(--card)", fontSize: 13, color: "var(--text)",
                    outline: "none", boxSizing: "border-box", marginBottom: 8 }} />
                <button onClick={() => comment.trim() && commentMutation.mutate()} disabled={!comment.trim() || commentMutation.isPending}
                  style={{ padding: "10px 22px", borderRadius: 50, border: "none", cursor: comment.trim() ? "pointer" : "default",
                    background: comment.trim() ? "var(--gold)" : "var(--border)", color: "#fff", fontWeight: 700, fontSize: 13 }}>
                  {commentMutation.isPending ? "Posting…" : "Post →"}
                </button>
              </div>
            )}

            {storyComments.map(c => (
              <div key={c.id} style={{ padding: "12px 14px", borderRadius: 12, background: "var(--card)",
                border: ".5px solid var(--border)", marginBottom: 8 }}>
                <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.65 }}>{c.comment_text}</p>
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>
                  {new Date(c.created_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
              </div>
            ))}

            {storyComments.length === 0 && (
              <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "20px 0" }}>
                Be the first to leave an encouraging word.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Story Card ───────────────────────────────────────────────────────────── */
function StoryCard({ story, userReactions, userSaved, onRead, onReact, onSave, onReport }) {
  const [showReport, setShowReport] = useState(false);
  const preview = story.story_preview || (story.turning_point || "").slice(0, 180);
  const tags = story.ai_tags || [];
  const name = displayName(story);

  return (
    <>
      {showReport && (
        <ReportModal
          onClose={() => setShowReport(false)}
          onSubmit={(reason, details) => { onReport(story, reason, details); setShowReport(false); }}
        />
      )}
      <div style={{ background: "var(--card)", border: ".5px solid var(--border)", borderRadius: 18, overflow: "hidden", marginBottom: 14 }}>
        {story.featured_status && (
          <div style={{ background: "linear-gradient(90deg, rgba(184,130,58,.15), rgba(184,130,58,.05))", padding: "8px 16px", display: "flex", alignItems: "center", gap: 6 }}>
            <Star style={{ width: 12, height: 12, color: "var(--gold)" }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: "var(--gold)", textTransform: "uppercase", letterSpacing: ".1em" }}>Featured Story</span>
          </div>
        )}

        <div style={{ padding: "18px 18px 14px" }}>
          {/* Meta */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(184,130,58,.15)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 13 }}>✨</span>
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{name}</span>
            {story.clean_time_value && story.clean_time_unit && (
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>• {story.clean_time_value} {story.clean_time_unit} in recovery</span>
            )}
            <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: "auto", display: "flex", alignItems: "center", gap: 3 }}>
              <Clock style={{ width: 11, height: 11 }} /> {readTime(story)} min
            </span>
          </div>

          {/* Title + preview */}
          <h3 style={{ fontFamily: "'Lora', serif", fontSize: 17, fontWeight: 600, color: "var(--text)", lineHeight: 1.3, marginBottom: 8 }}>
            {story.title || "Untitled Story"}
          </h3>
          {preview && (
            <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.75, fontStyle: "italic", marginBottom: 12 }}>
              "{preview}{preview.length >= 180 ? "…" : ""}"
            </p>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>
              {tags.slice(0, 4).map(t => (
                <span key={t} style={{ fontSize: 10, padding: "3px 9px", borderRadius: 20,
                  background: "rgba(184,130,58,.08)", color: "var(--gold)", border: "1px solid rgba(184,130,58,.18)" }}>{t}</span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", borderTop: ".5px solid var(--border)", paddingTop: 12 }}>
            <button onClick={() => onRead(story)} style={{
              flex: 1, padding: "10px", borderRadius: 50, border: "none", cursor: "pointer",
              background: "var(--gold)", color: "#fff", fontWeight: 700, fontSize: 13,
            }}>
              Read Story →
            </button>

            <ReactionBar story={story} userReactions={userReactions} onReact={(t) => onReact(story, t)} compact />

            <button onClick={() => onSave(story)} style={{
              padding: "8px 10px", borderRadius: 20, border: "1px solid var(--border)",
              background: userSaved ? "rgba(184,130,58,.10)" : "var(--card)",
              cursor: "pointer", color: userSaved ? "var(--gold)" : "var(--text-muted)",
            }}>
              <Bookmark style={{ width: 14, height: 14 }} />
            </button>

            <button onClick={() => setShowReport(true)} style={{
              padding: "8px 10px", borderRadius: 20, border: "1px solid var(--border)",
              background: "var(--card)", cursor: "pointer", color: "var(--text-muted)",
            }}>
              <Flag style={{ width: 14, height: 14 }} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Main Page ────────────────────────────────────────────────────────────── */
export default function AhHaCommunity() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [tagFilter, setTagFilter] = useState("");
  const [selectedStory, setSelectedStory] = useState(null);

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: stories = [], isLoading } = useQuery({
    queryKey: ["ahha-community"],
    queryFn: () => base44.entities.AhHaStory.filter({ approval_status: "approved" }, "-published_at", 100),
  });

  const { data: myReactions = [] } = useQuery({
    queryKey: ["ahha-my-reactions", user?.email],
    queryFn: () => base44.entities.AhHaReactionV2.filter({ user_email: user.email }, "-created_date", 500),
    enabled: !!user?.email,
  });

  const { data: mySaved = [] } = useQuery({
    queryKey: ["ahha-my-saved", user?.email],
    queryFn: () => base44.entities.AhHaSavedStory.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const savedIds = useMemo(() => new Set(mySaved.map(s => s.story_id)), [mySaved]);
  const reactionsByStory = useMemo(() => {
    const map = {};
    myReactions.forEach(r => {
      if (!map[r.story_id]) map[r.story_id] = [];
      map[r.story_id].push(r.reaction_type);
    });
    return map;
  }, [myReactions]);

  const reactMutation = useMutation({
    mutationFn: async ({ story, type }) => {
      if (!user) { base44.auth.redirectToLogin(); return; }
      const existing = myReactions.find(r => r.story_id === story.id && r.reaction_type === type);
      if (existing) {
        await base44.entities.AhHaReactionV2.delete(existing.id);
        await base44.entities.AhHaStory.update(story.id, { reactions_count: Math.max(0, (story.reactions_count || 0) - 1) });
      } else {
        await base44.entities.AhHaReactionV2.create({ story_id: story.id, user_email: user.email, reaction_type: type });
        await base44.entities.AhHaStory.update(story.id, { reactions_count: (story.reactions_count || 0) + 1 });
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ahha-my-reactions"] }); qc.invalidateQueries({ queryKey: ["ahha-community"] }); },
  });

  const saveMutation = useMutation({
    mutationFn: async (story) => {
      if (!user) { base44.auth.redirectToLogin(); return; }
      if (savedIds.has(story.id)) {
        const rec = mySaved.find(s => s.story_id === story.id);
        if (rec) await base44.entities.AhHaSavedStory.delete(rec.id);
      } else {
        await base44.entities.AhHaSavedStory.create({ story_id: story.id, user_email: user.email });
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ahha-my-saved"] }),
  });

  const reportMutation = useMutation({
    mutationFn: ({ story, reason, details }) =>
      base44.entities.AhHaStoryReport.create({
        story_id: story.id, reported_by_email: user?.email || "anonymous",
        report_reason: reason, report_details: details, status: "open",
      }),
  });

  const filtered = useMemo(() => {
    let list = [...stories];
    if (tagFilter) list = list.filter(s => (s.ai_tags || []).some(t => t.toLowerCase().includes(tagFilter.toLowerCase())));
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        s.title?.toLowerCase().includes(q) ||
        s.story_preview?.toLowerCase().includes(q) ||
        s.turning_point?.toLowerCase().includes(q) ||
        (s.ai_tags || []).some(t => t.toLowerCase().includes(q))
      );
    }
    if (sortBy === "reactions") list.sort((a, b) => (b.reactions_count || 0) - (a.reactions_count || 0));
    else if (sortBy === "inspiring") list.sort((a, b) => ((b.reactions_count || 0) + (b.saves_count || 0)) - ((a.reactions_count || 0) + (a.saves_count || 0)));
    else list.sort((a, b) => new Date(b.published_at || b.created_date) - new Date(a.published_at || a.created_date));
    return list;
  }, [stories, tagFilter, search, sortBy]);

  const featured = useMemo(() => stories.find(s => s.featured_status), [stories]);

  if (selectedStory) return (
    <div style={{ background: "transparent", minHeight: "100vh", color: "var(--text)" }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <StoryDetail
          story={selectedStory}
          user={user}
          userReactions={reactionsByStory[selectedStory.id] || []}
          userSaved={savedIds.has(selectedStory.id)}
          onReact={(s, t) => reactMutation.mutate({ story: s, type: t })}
          onSave={(s) => saveMutation.mutate(s)}
          onReport={(s, r, d) => reportMutation.mutate({ story: s, reason: r, details: d })}
          onBack={() => setSelectedStory(null)}
        />
      </div>
    </div>
  );

  return (
    <div style={{ background: "transparent", minHeight: "100vh", paddingBottom: 120, color: "var(--text)" }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>

        {/* Header */}
        <div className="card-glow" style={{ background: "linear-gradient(135deg, rgba(91,141,239,0.16), rgba(240,183,83,0.10))", borderRadius: 24, padding: "28px 20px 0", margin: "20px 16px 0" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "var(--gold)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 5 }}>
            Ah Ha Community
          </p>
          <h1 style={{ fontFamily: "'Lora', serif", fontSize: 24, fontWeight: 600, color: "var(--text)", lineHeight: 1.2, marginBottom: 5 }}>
            Real moments.<br />Real change.
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 18 }}>
            Real people choosing better.
          </p>

          {/* Search */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 12,
            background: "var(--surface)", border: "1px solid var(--border)", marginBottom: 14 }}>
            <Search style={{ width: 15, height: 15, color: "var(--text-muted)", flexShrink: 0 }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search stories, tags, themes…"
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 13, color: "var(--text)" }} />
            {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
              <X style={{ width: 14, height: 14, color: "var(--text-muted)" }} />
            </button>}
          </div>

          {/* Sort tabs */}
          <div style={{ display: "flex", gap: 2, marginBottom: 0, overflowX: "auto", scrollbarWidth: "none" }}>
            {FILTERS.map(f => (
              <button key={f.id} onClick={() => setSortBy(f.id)} style={{
                padding: "9px 14px", borderRadius: "12px 12px 0 0", border: "none", cursor: "pointer",
                background: "transparent", fontWeight: 700, fontSize: 12, whiteSpace: "nowrap", flexShrink: 0,
                color: sortBy === f.id ? "var(--gold)" : "var(--text-muted)",
                borderBottom: sortBy === f.id ? "2px solid var(--gold)" : "2px solid transparent",
              }}>{f.label}</button>
            ))}
          </div>
        </div>

        <div style={{ padding: "16px 16px 0" }}>

          {/* Tag filter chips */}
          <div style={{ display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none", marginBottom: 18, paddingBottom: 4 }}>
            <button onClick={() => setTagFilter("")} style={{
              padding: "6px 14px", borderRadius: 20, border: tagFilter === "" ? "1px solid var(--gold)" : "1px solid var(--border)",
              background: tagFilter === "" ? "var(--gold)" : "var(--card)",
              color: tagFilter === "" ? "#fff" : "var(--text-muted)", fontSize: 12, fontWeight: 700, cursor: "pointer", flexShrink: 0,
            }}>All</button>
            {TAG_FILTERS.map(t => (
              <button key={t} onClick={() => setTagFilter(tagFilter === t ? "" : t)} style={{
                padding: "6px 14px", borderRadius: 20,
                border: tagFilter === t ? "1px solid var(--gold)" : "1px solid var(--border)",
                background: tagFilter === t ? "var(--gold)" : "var(--card)",
                color: tagFilter === t ? "#fff" : "var(--text-muted)",
                fontSize: 12, fontWeight: 700, cursor: "pointer", flexShrink: 0, whiteSpace: "nowrap",
              }}>{t}</button>
            ))}
          </div>

          {/* Write CTA */}
          <button onClick={() => navigate("/SubmitAhHa")} style={{
            width: "100%", padding: "13px", borderRadius: 50, border: "1px dashed rgba(184,130,58,.4)",
            background: "rgba(184,130,58,.05)", color: "var(--gold)", fontWeight: 700, fontSize: 13,
            cursor: "pointer", marginBottom: 20,
          }}>
            ✍️ Share your own Ah Ha Moment →
          </button>

          {isLoading ? (
            <div style={{ display: "flex", justifyContent: "center", paddingTop: 40 }}>
              <Loader2 style={{ width: 28, height: 28, color: "var(--gold)" }} className="animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18, padding: "48px 24px", textAlign: "center" }}>
              <p style={{ fontSize: 36, marginBottom: 14 }}>🌱</p>
              <p style={{ fontFamily: "'Lora', serif", fontSize: 16, fontWeight: 600, color: "var(--text)", lineHeight: 1.5, marginBottom: 10 }}>
                {search || tagFilter ? "No stories match that search." : "No Ah Ha stories have been approved yet."}
              </p>
              <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.65 }}>
                {search || tagFilter ? "Try a different tag or keyword." : "Be the first to share a breakthrough that might help someone else."}
              </p>
            </div>
          ) : (
            filtered.map(story => (
              <StoryCard
                key={story.id}
                story={story}
                userReactions={reactionsByStory[story.id] || []}
                userSaved={savedIds.has(story.id)}
                onRead={setSelectedStory}
                onReact={(s, t) => reactMutation.mutate({ story: s, type: t })}
                onSave={saveMutation.mutate}
                onReport={(s, r, d) => reportMutation.mutate({ story: s, reason: r, details: d })}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}