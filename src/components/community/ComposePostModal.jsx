import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = [
  { value: "daily_win",             label: "Daily Win",            emoji: "🏆", color: "#10B981" },
  { value: "need_support",          label: "Need Support",         emoji: "🤝", color: "#F87171" },
  { value: "craving_now",           label: "Craving Right Now",    emoji: "⚡", color: "#FB923C" },
  { value: "motivation",            label: "Motivation",           emoji: "🔥", color: "#FBBF24" },
  { value: "recovery_question",     label: "Recovery Question",    emoji: "❓", color: "#60A5FA" },
  { value: "meeting_experience",    label: "Meeting Experience",   emoji: "🤲", color: "#A78BFA" },
  { value: "job_housing_help",      label: "Job / Housing Help",   emoji: "🏠", color: "#34D399" },
  { value: "milestone_celebration", label: "Milestone",            emoji: "🎉", color: "#C9A96E" },
  { value: "reentry_advice",        label: "Reentry Advice",       emoji: "🗺️", color: "#818CF8" },
  { value: "journal_reflection",    label: "Journal Reflection",   emoji: "📓", color: "#9CA3AF" },
];

const MOODS = [
  { value: "hopeful",    label: "Hopeful",    emoji: "🌅" },
  { value: "struggling", label: "Struggling", emoji: "💧" },
  { value: "anxious",    label: "Anxious",    emoji: "😰" },
  { value: "grateful",   label: "Grateful",   emoji: "🙏" },
  { value: "proud",      label: "Proud",      emoji: "⭐" },
  { value: "triggered",  label: "Triggered",  emoji: "⚡" },
];

const CRISIS_CATEGORIES = ["craving_now", "need_support"];

export default function ComposePostModal({ onClose, initialContent = "", initialCategory = "daily_win", circleId = null }) {
  const [step, setStep] = useState(1); // 1=category 2=content 3=options
  const [category, setCategory] = useState(initialCategory);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState(initialContent);
  const [mood, setMood] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const queryClient = useQueryClient();

  const selectedCat = CATEGORIES.find(c => c.value === category);
  const isCrisis = CRISIS_CATEGORIES.includes(category);

  const createMutation = useMutation({
    mutationFn: async () => {
      let moderationStatus = "approved";
      let moderationReason = null;

      // Only run AI moderation if content looks potentially problematic
      if (content.length > 20) {
        try {
          const result = await base44.integrations.Core.InvokeLLM({
            prompt: `You are a content moderator for a recovery support community. Is this post safe and appropriate?
Post: ${content}
Category: ${category}
Guidelines: no hate speech, harassment, graphic drug use glorification, spam, or self-harm glorification. Crisis/craving posts ARE allowed and healthy.
Respond with JSON only.`,
            response_json_schema: {
              type: "object",
              properties: {
                is_safe: { type: "boolean" },
                violation_type: { type: "string" },
                confidence: { type: "string" },
                reason: { type: "string" }
              }
            }
          });
          if (!result.is_safe && result.confidence === "high") {
            moderationStatus = "flagged";
            moderationReason = result.reason;
          }
        } catch (_) { /* fail open */ }
      }

      return base44.entities.CommunityPost.create({
        title: title.trim() || null,
        content: content.trim(),
        category,
        post_type: circleId ? "group_post" : isCrisis ? "support_request" : "feed",
        group_id: circleId || null,
        mood_tag: mood || null,
        is_anonymous: isAnonymous,
        moderation_status: moderationStatus,
        moderation_reason: moderationReason,
        like_count: 0,
        reaction_proud: 0,
        reaction_strong: 0,
        reaction_relate: 0,
        reaction_support: 0,
        reaction_going: 0,
      });
    },
    onSuccess: (data) => {
      if (data.moderation_status === "flagged") {
        toast.error("Post flagged for review. Our team will take a look.");
      } else {
        toast.success("Your post is live in the community 💙");
      }
      queryClient.invalidateQueries(["community-posts"]);
      onClose();
    },
  });

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 60,
        background: "rgba(0,0,0,0.65)", display: "flex",
        alignItems: "flex-end", justifyContent: "center",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 520,
          background: "linear-gradient(170deg,#0F1829,#0B1220)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "24px 24px 0 0",
          padding: "24px 20px 36px",
          maxHeight: "92vh", overflowY: "auto",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: "#fff" }}>Share with Community</h2>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>Step {step} of 3</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", padding: 4 }}>
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {/* Progress */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{
              flex: 1, height: 4, borderRadius: 2,
              background: s <= step ? "#3ECFBF" : "rgba(255,255,255,0.1)",
              transition: "background 0.2s",
            }} />
          ))}
        </div>

        {/* Step 1: Category */}
        {step === 1 && (
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.6)", marginBottom: 14 }}>
              What kind of post is this?
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  style={{
                    padding: "12px 14px", borderRadius: 14, textAlign: "left",
                    background: category === cat.value ? `${cat.color}20` : "rgba(255,255,255,0.04)",
                    border: `1px solid ${category === cat.value ? `${cat.color}60` : "rgba(255,255,255,0.08)"}`,
                    cursor: "pointer",
                    boxShadow: category === cat.value ? `0 0 16px ${cat.color}20` : "none",
                  }}
                >
                  <p style={{ fontSize: 16, marginBottom: 4 }}>{cat.emoji}</p>
                  <p style={{ fontSize: 12, fontWeight: 700, color: category === cat.value ? cat.color : "rgba(255,255,255,0.6)" }}>
                    {cat.label}
                  </p>
                </button>
              ))}
            </div>

            {isCrisis && (
              <div style={{
                marginTop: 14, padding: "12px 14px", borderRadius: 12,
                background: "rgba(251,146,60,0.1)", border: "1px solid rgba(251,146,60,0.3)",
              }}>
                <p style={{ fontSize: 12, color: "#FB923C", fontWeight: 600, lineHeight: 1.5 }}>
                  ⚡ Posting in this category will flag your post for peer support and show crisis resources. You're safe here.
                </p>
              </div>
            )}

            <button
              onClick={() => setStep(2)}
              style={{
                width: "100%", marginTop: 16, padding: "13px", borderRadius: 14,
                background: "linear-gradient(135deg,#3ECFBF,#2CB8AE)",
                border: "none", color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer",
              }}
            >
              Continue →
            </button>
          </div>
        )}

        {/* Step 2: Content */}
        {step === 2 && (
          <div>
            <div style={{
              display: "flex", alignItems: "center", gap: 8, marginBottom: 14,
              padding: "8px 12px", borderRadius: 10,
              background: `${selectedCat?.color}15`, border: `1px solid ${selectedCat?.color}30`,
            }}>
              <span style={{ fontSize: 16 }}>{selectedCat?.emoji}</span>
              <p style={{ fontSize: 12, fontWeight: 700, color: selectedCat?.color }}>{selectedCat?.label}</p>
              <button onClick={() => setStep(1)} style={{ marginLeft: "auto", background: "none", border: "none",
                color: "rgba(255,255,255,0.35)", fontSize: 11, cursor: "pointer" }}>Change</button>
            </div>

            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Short title (optional)…"
              style={{
                width: "100%", padding: "11px 14px",
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12, color: "#fff", fontSize: 14, outline: "none",
                marginBottom: 12, boxSizing: "border-box",
              }}
            />

            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Share your thoughts, experience, or what you need right now…"
              rows={5}
              style={{
                width: "100%", padding: "12px 14px",
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12, color: "#fff", fontSize: 14, outline: "none",
                resize: "vertical", lineHeight: 1.65, boxSizing: "border-box", marginBottom: 12,
              }}
            />

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setStep(1)} style={{
                flex: 1, padding: "12px", borderRadius: 12,
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.5)", fontWeight: 700, fontSize: 13, cursor: "pointer",
              }}>← Back</button>
              <button
                onClick={() => setStep(3)}
                disabled={!content.trim()}
                style={{
                  flex: 2, padding: "12px", borderRadius: 12,
                  background: content.trim() ? "linear-gradient(135deg,#3ECFBF,#2CB8AE)" : "rgba(255,255,255,0.08)",
                  border: "none", color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer",
                }}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Options */}
        {step === 3 && (
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.6)", marginBottom: 14 }}>
              How are you feeling? (optional)
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
              {MOODS.map(m => (
                <button
                  key={m.value}
                  onClick={() => setMood(mood === m.value ? "" : m.value)}
                  style={{
                    padding: "8px 14px", borderRadius: 20,
                    background: mood === m.value ? "rgba(62,207,191,0.2)" : "rgba(255,255,255,0.05)",
                    border: `1px solid ${mood === m.value ? "rgba(62,207,191,0.5)" : "rgba(255,255,255,0.1)"}`,
                    color: mood === m.value ? "#3ECFBF" : "rgba(255,255,255,0.55)",
                    fontSize: 12, fontWeight: 600, cursor: "pointer",
                  }}
                >
                  {m.emoji} {m.label}
                </button>
              ))}
            </div>

            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "12px 16px", marginBottom: 16,
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12,
            }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Post anonymously</p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>Your username won't appear</p>
              </div>
              <button
                onClick={() => setIsAnonymous(!isAnonymous)}
                style={{
                  width: 44, height: 24, borderRadius: 12, position: "relative",
                  background: isAnonymous ? "#3ECFBF" : "rgba(255,255,255,0.15)",
                  border: "none", cursor: "pointer", flexShrink: 0,
                }}
              >
                <div style={{
                  width: 20, height: 20, background: "#fff", borderRadius: "50%",
                  position: "absolute", top: 2, left: isAnonymous ? "calc(100% - 22px)" : "2px",
                  transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                }} />
              </button>
            </div>

            <div style={{
              padding: "11px 14px", marginBottom: 16, borderRadius: 12,
              background: "rgba(62,207,191,0.07)", border: "1px solid rgba(62,207,191,0.2)",
            }}>
              <p style={{ fontSize: 12, color: "rgba(62,207,191,0.8)", lineHeight: 1.55 }}>
                🛡️ This is a safe, moderated community. Content that is harmful, abusive, or glorifies substance use will be removed.
              </p>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setStep(2)} style={{
                flex: 1, padding: "13px", borderRadius: 12,
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.5)", fontWeight: 700, fontSize: 13, cursor: "pointer",
              }}>← Back</button>
              <button
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending}
                style={{
                  flex: 2, padding: "13px", borderRadius: 12,
                  background: "linear-gradient(135deg,#3ECFBF,#2CB8AE)",
                  border: "none", color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  boxShadow: "0 6px 20px rgba(62,207,191,0.25)",
                }}
              >
                {createMutation.isPending
                  ? <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" />
                  : "Post to Community 💙"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}