import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Loader2, Flag } from "lucide-react";
import { CATEGORIES } from "./AhHaMoment";
import { toast } from "sonner";

const C = {
  gold:    "#C9A96E",
  teal:    "#2DD4BF",
  emerald: "#10B981",
  muted:   "rgba(241,245,249,0.38)",
  glass:   { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" },
};
const catMap = Object.fromEntries(CATEGORIES.map(c => [c.key, c]));

const REACTIONS = [
  { type: "felt_this",        emoji: "❤️",  label: "Felt This"         },
  { type: "gave_me_strength", emoji: "💪",  label: "Gave Me Strength"  },
  { type: "not_alone",        emoji: "🫂",  label: "Not Alone"         },
  { type: "bookmark",         emoji: "🔖",  label: "Save"              },
];

function PromptBlock({ emoji, label, content }) {
  if (!content?.trim()) return null;
  return (
    <div style={{ ...C.glass, borderRadius: 18, padding: "18px 20px", marginBottom: 14 }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase",
        letterSpacing: ".1em", marginBottom: 8 }}>{emoji} {label}</p>
      <p style={{ fontSize: 15, color: "rgba(255,255,255,0.8)", lineHeight: 1.75, fontStyle: "italic" }}>
        "{content}"
      </p>
    </div>
  );
}

export default function AhHaDetail() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const id = new URLSearchParams(window.location.search).get("id");
  const [comment, setComment] = useState("");
  const [isAnonComment, setIsAnonComment] = useState(false);

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: story, isLoading } = useQuery({
    queryKey: ["ahha-detail", id],
    queryFn: () => base44.entities.AhHaMoment.filter({ id }),
    select: d => d[0],
    enabled: !!id,
  });

  const { data: reactions = [] } = useQuery({
    queryKey: ["ahha-reactions", id],
    queryFn: () => base44.entities.AhHaReaction.filter({ moment_id: id }),
    enabled: !!id,
  });

  const { data: comments = [] } = useQuery({
    queryKey: ["ahha-comments", id],
    queryFn: () => base44.entities.AhHaComment.filter({ moment_id: id, status: "approved" }, "created_date"),
    enabled: !!id,
  });

  const myReactions = reactions.filter(r => r.user_email === user?.email).map(r => r.reaction_type);
  const reactionCounts = REACTIONS.map(r => ({
    ...r,
    count: reactions.filter(x => x.reaction_type === r.type).length,
    mine: myReactions.includes(r.type),
  }));

  const reactMutation = useMutation({
    mutationFn: async (reactionType) => {
      const existing = reactions.find(r => r.user_email === user.email && r.reaction_type === reactionType);
      if (existing) {
        await base44.entities.AhHaReaction.delete(existing.id);
      } else {
        await base44.entities.AhHaReaction.create({ moment_id: id, user_email: user.email, reaction_type: reactionType });
        const total = reactions.filter(r => r.reaction_type !== "bookmark").length + 1;
        await base44.entities.AhHaMoment.update(id, { reaction_count: total });
      }
    },
    onSuccess: () => { qc.invalidateQueries(["ahha-reactions", id]); },
  });

  const commentMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.AhHaComment.create({
        moment_id: id,
        user_email: user.email,
        display_name: isAnonComment ? "" : (user.full_name || ""),
        is_anonymous: isAnonComment,
        content: comment.trim(),
        status: "approved",
      });
      await base44.entities.AhHaMoment.update(id, { comment_count: (story?.comment_count || 0) + 1 });
    },
    onSuccess: () => {
      setComment("");
      qc.invalidateQueries(["ahha-comments", id]);
      qc.invalidateQueries(["ahha-detail", id]);
      toast.success("Comment posted.");
    },
  });

  if (isLoading || !story) return (
    <div style={{ background: "#07090F", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Loader2 className="animate-spin" style={{ color: C.teal, width: 28, height: 28 }} />
    </div>
  );

  const cat = catMap[story.category] || { emoji: "💬", label: story.category, color: C.teal };
  const name = story.is_anonymous ? "Anonymous" : (story.display_name || "Member");

  return (
    <div style={{ background: "linear-gradient(170deg,#07090F 0%,#0B1020 100%)", minHeight: "100vh", paddingBottom: 110 }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ padding: "56px 20px 24px", background: "linear-gradient(155deg,#0A1628,#080E1C)" }}>
          <button onClick={() => navigate("/AhHaMoment")}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none",
              color: C.muted, cursor: "pointer", fontSize: 13, marginBottom: 20, padding: 0, fontWeight: 600 }}>
            <ArrowLeft style={{ width: 15, height: 15 }} /> All Stories
          </button>

          {story.has_content_warning && (
            <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 10,
              padding: "10px 14px", marginBottom: 16, fontSize: 12, color: "#F87171", fontWeight: 600, lineHeight: 1.5 }}>
              ⚠️ Content Warning: {story.content_warning || "May contain difficult themes."}
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 20 }}>{cat.emoji}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: cat.color, textTransform: "uppercase", letterSpacing: ".1em" }}>
              {cat.label}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%",
              background: `${cat.color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>
              {story.is_anonymous ? "🌿" : name[0]?.toUpperCase()}
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{name}</p>
              <p style={{ fontSize: 11, color: C.muted }}>
                {new Date(story.created_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            </div>
          </div>
        </div>

        <div style={{ padding: "20px 16px" }}>

          {/* Story content */}
          <PromptBlock emoji="💥" label="What happened" content={story.what_happened} />
          <PromptBlock emoji="💭" label="What I was feeling" content={story.feeling_in_moment} />
          <PromptBlock emoji="😔" label="What I was tired of repeating" content={story.tired_of_repeating} />
          <PromptBlock emoji="✊" label="The decision I made" content={story.decision_made} />

          {story.message_to_others && (
            <div style={{ borderRadius: 18, padding: "22px 22px", marginBottom: 14,
              background: "linear-gradient(135deg,rgba(201,169,110,0.08),rgba(45,212,191,0.04))",
              border: "1.5px solid rgba(201,169,110,0.25)" }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.gold, textTransform: "uppercase",
                letterSpacing: ".1em", marginBottom: 10 }}>💌 To someone standing at the same fork</p>
              <p style={{ fontSize: 16, color: "rgba(255,255,255,0.85)", lineHeight: 1.75, fontStyle: "italic", fontWeight: 400 }}>
                "{story.message_to_others}"
              </p>
            </div>
          )}

          {/* Reactions */}
          <div style={{ ...C.glass, borderRadius: 18, padding: "18px 20px", marginBottom: 14 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 12, textTransform: "uppercase", letterSpacing: ".08em" }}>
              This story moved people
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {reactionCounts.map(r => (
                <button key={r.type} onClick={() => user && reactMutation.mutate(r.type)}
                  disabled={reactMutation.isPending}
                  style={{
                    padding: "12px 14px", borderRadius: 14, border: "none", cursor: "pointer",
                    background: r.mine ? "rgba(201,169,110,0.12)" : "rgba(255,255,255,0.04)",
                    border: `1.5px solid ${r.mine ? "rgba(201,169,110,0.4)" : "rgba(255,255,255,0.08)"}`,
                    display: "flex", alignItems: "center", gap: 8, transition: "all 0.15s ease",
                  }}>
                  <span style={{ fontSize: 18 }}>{r.emoji}</span>
                  <div style={{ textAlign: "left" }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: r.mine ? C.gold : "#fff", lineHeight: 1.2 }}>{r.label}</p>
                    <p style={{ fontSize: 11, color: C.muted }}>{r.count}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Comments */}
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase",
              letterSpacing: "1px", marginBottom: 12 }}>
              💬 {comments.length} Response{comments.length !== 1 ? "s" : ""}
            </p>

            <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: "4px",
              border: "1px solid rgba(255,255,255,0.08)", marginBottom: 14 }}>
              <p style={{ fontSize: 11, color: "rgba(201,169,110,0.7)", fontWeight: 600,
                padding: "8px 12px 0", letterSpacing: ".04em" }}>
                ⚠️ Be kind. This space is for support, not judgment.
              </p>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Share what this moment means to you…"
                rows={3}
                style={{
                  width: "100%", padding: "12px 14px", borderRadius: 12, boxSizing: "border-box",
                  background: "transparent", border: "none",
                  color: "#fff", fontSize: 14, resize: "none", outline: "none",
                  fontFamily: "inherit", lineHeight: 1.6,
                }}
              />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px 10px" }}>
                <button onClick={() => setIsAnonComment(a => !a)} style={{
                  background: "none", border: "none", cursor: "pointer", fontSize: 12, color: C.muted, fontWeight: 600 }}>
                  {isAnonComment ? "🌿 Anonymous" : "👤 Named"}
                </button>
                <button onClick={() => comment.trim() && commentMutation.mutate()}
                  disabled={!comment.trim() || commentMutation.isPending}
                  style={{
                    padding: "8px 16px", borderRadius: 10, border: "none", cursor: comment.trim() ? "pointer" : "not-allowed",
                    background: comment.trim() ? `linear-gradient(135deg,${C.gold},#B8935A)` : "rgba(255,255,255,0.07)",
                    color: comment.trim() ? "#07090F" : C.muted, fontWeight: 700, fontSize: 13,
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                  {commentMutation.isPending ? <Loader2 style={{ width: 13, height: 13 }} className="animate-spin" /> : <Send style={{ width: 13, height: 13 }} />}
                  Respond
                </button>
              </div>
            </div>

            {comments.map(c => {
              const cName = c.is_anonymous ? "Anonymous" : (c.display_name || c.user_email?.split("@")[0] || "Member");
              return (
                <div key={c.id} style={{ ...C.glass, borderRadius: 14, padding: "14px 16px", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 26, height: 26, borderRadius: "50%", fontSize: 11,
                      background: "rgba(45,212,191,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {c.is_anonymous ? "🌿" : cName[0]?.toUpperCase()}
                    </div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>{cName}</p>
                    <p style={{ fontSize: 11, color: C.muted, marginLeft: "auto" }}>
                      {new Date(c.created_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,0.72)", lineHeight: 1.65 }}>{c.content}</p>
                </div>
              );
            })}
          </div>

          {/* Crisis note */}
          <div style={{ borderRadius: 14, padding: "14px 16px", marginTop: 8,
            background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.12)", textAlign: "center" }}>
            <p style={{ fontSize: 12, color: "rgba(248,113,113,0.8)", fontWeight: 600, marginBottom: 4 }}>
              If you're in crisis right now
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
              <a href="tel:988" style={{ fontSize: 13, fontWeight: 800, color: "#F87171", textDecoration: "none" }}>Call 988</a>
              <a href="sms:741741" style={{ fontSize: 13, fontWeight: 800, color: "#FCA5A5", textDecoration: "none" }}>Text 741741</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}