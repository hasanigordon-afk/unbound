import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Bookmark, Flag, Share2, Loader2, CheckCircle2 } from "lucide-react";

const C = {
  teal:    "#2DD4BF",
  indigo:  "#6366F1",
  purple:  "#8B5CF6",
  emerald: "#10B981",
  amber:   "#F59E0B",
  red:     "#EF4444",
  muted:   "rgba(241,245,249,0.4)",
};

const SUBSTANCE_COLORS = {
  alcohol: "#F97316", opioids: "#F43F5E", stimulants: "#F59E0B",
  benzodiazepines: "#8B5CF6", cannabis: "#10B981", prescription_misuse: "#6366F1",
  polysubstance: "#EC4899", other: "#94A3B8", prefer_not_to_say: "#64748B",
};

const REPORT_REASONS = [
  { key: "glorifies_drug_use",       label: "Glorifies drug use"         },
  { key: "promotes_illegal_activity",label: "Promotes illegal activity"  },
  { key: "harassment",               label: "Harassment"                 },
  { key: "hate_speech",              label: "Hate speech"                },
  { key: "explicit_content",         label: "Explicit content"           },
  { key: "predatory_behavior",       label: "Predatory behavior"         },
  { key: "other",                    label: "Other"                      },
];

function ReportModal({ storyId, userEmail, onClose }) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [done, setDone] = useState(false);

  const submit = async () => {
    await base44.entities.TestimonialReport.create({
      testimonial_id: storyId,
      reporter_email: userEmail,
      reason,
      details,
      status: "pending",
    });
    setDone(true);
  };

  if (done) return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.7)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: "#111827", borderRadius: 20, padding: "28px 24px", maxWidth: 380, width: "100%", textAlign: "center" }}>
        <CheckCircle2 style={{ color: C.emerald, width: 36, height: 36, margin: "0 auto 12px" }} />
        <h3 style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 8 }}>Report Submitted</h3>
        <p style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>Thank you — our team will review this content.</p>
        <button onClick={onClose} style={{ padding: "12px 24px", borderRadius: 12, border: "none",
          background: "rgba(255,255,255,0.07)", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>Close</button>
      </div>
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.7)",
      display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div style={{ background: "#111827", borderRadius: "20px 20px 0 0", padding: "24px 20px 40px",
        maxWidth: 480, width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>Report Story</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 18 }}>✕</button>
        </div>
        <p style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>Select the reason for your report:</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          {REPORT_REASONS.map(r => (
            <button key={r.key} onClick={() => setReason(r.key)} style={{
              padding: "11px 14px", borderRadius: 12, border: "none", cursor: "pointer", textAlign: "left",
              background: reason === r.key ? "rgba(239,68,68,0.1)" : "rgba(255,255,255,0.05)",
              border: `1.5px solid ${reason === r.key ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.08)"}`,
              color: reason === r.key ? "#F87171" : C.muted, fontWeight: reason === r.key ? 700 : 500, fontSize: 13,
            }}>{r.label}</button>
          ))}
        </div>
        <textarea value={details} onChange={e => setDetails(e.target.value)}
          placeholder="Additional details (optional)…" rows={3}
          style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "none", boxSizing: "border-box",
            background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
            color: "#fff", fontSize: 13, resize: "none", outline: "none", marginBottom: 14 }} />
        <button onClick={submit} disabled={!reason} style={{
          width: "100%", padding: "13px", borderRadius: 12, border: "none",
          cursor: reason ? "pointer" : "not-allowed",
          background: reason ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.05)",
          border: `1px solid ${reason ? "rgba(239,68,68,0.3)" : "transparent"}`,
          color: reason ? "#F87171" : C.muted, fontWeight: 800, fontSize: 14,
        }}>Submit Report</button>
      </div>
    </div>
  );
}

export default function TestimonialDetail() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const storyId = urlParams.get("id");
  const [showReport, setShowReport] = useState(false);

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: stories = [], isLoading } = useQuery({
    queryKey: ["testimonial-detail", storyId],
    queryFn: () => base44.entities.Testimonial.filter({ status: "approved" }, "-created_date", 50),
    enabled: !!storyId,
  });
  const story = stories.find(s => s.id === storyId);

  const { data: reactions = [] } = useQuery({
    queryKey: ["testimonial-reactions", storyId, user?.email],
    queryFn: () => base44.entities.TestimonialReaction.filter({ testimonial_id: storyId, user_email: user.email }),
    enabled: !!storyId && !!user?.email,
  });

  const hasHelped = reactions.some(r => r.reaction_type === "helpful");
  const hasBookmarked = reactions.some(r => r.reaction_type === "bookmark");

  const reactMutation = useMutation({
    mutationFn: async (type) => {
      const existing = reactions.find(r => r.reaction_type === type);
      if (existing) {
        await base44.entities.TestimonialReaction.delete(existing.id);
        if (type === "helpful") {
          await base44.entities.Testimonial.update(storyId, {
            helpful_count: Math.max(0, (story.helpful_count || 0) - 1),
          });
        }
      } else {
        await base44.entities.TestimonialReaction.create({
          testimonial_id: storyId,
          user_email: user.email,
          reaction_type: type,
        });
        if (type === "helpful") {
          await base44.entities.Testimonial.update(storyId, {
            helpful_count: (story.helpful_count || 0) + 1,
          });
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["testimonial-reactions"] });
      qc.invalidateQueries({ queryKey: ["testimonial-detail"] });
      qc.invalidateQueries({ queryKey: ["testimonials-feed"] });
    },
  });

  if (isLoading) return (
    <div style={{ background: "#07090F", minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Loader2 style={{ color: C.teal, width: 28, height: 28 }} className="animate-spin" />
    </div>
  );

  if (!story) return (
    <div style={{ background: "#07090F", minHeight: "100vh",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <p style={{ fontSize: 40, marginBottom: 12 }}>🌱</p>
      <p style={{ fontSize: 16, fontWeight: 800, color: "#fff", marginBottom: 8 }}>Story not found</p>
      <button onClick={() => navigate("/HowDidYouDoIt")} style={{
        padding: "12px 24px", borderRadius: 12, border: "none", cursor: "pointer",
        background: "rgba(255,255,255,0.07)", color: "#fff", fontWeight: 700, fontSize: 14,
      }}>Back to Stories</button>
    </div>
  );

  const subColor = SUBSTANCE_COLORS[story.substance_category] || "#94A3B8";
  const authorName = story.is_anonymous ? "Anonymous" : (story.display_name || "Member");

  return (
    <div style={{ background: "linear-gradient(170deg,#07090F 0%,#0A0F1A 100%)", minHeight: "100vh", paddingBottom: 110 }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ padding: "56px 20px 24px", background: "linear-gradient(155deg,#0D1028,#080E1C)" }}>
          <button onClick={() => navigate("/HowDidYouDoIt")}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none",
              color: C.muted, cursor: "pointer", fontSize: 13, marginBottom: 20, padding: 0, fontWeight: 600 }}>
            <ArrowLeft style={{ width: 15, height: 15 }} /> All Stories
          </button>

          {/* Tags */}
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 14 }}>
            {story.substance_category && story.substance_category !== "prefer_not_to_say" && (
              <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                background: `${subColor}15`, color: subColor, border: `1px solid ${subColor}30` }}>
                {story.substance_category.replace(/_/g, " ")}
              </span>
            )}
            {story.sober_time && (
              <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                background: "rgba(45,212,191,0.1)", color: C.teal, border: "1px solid rgba(45,212,191,0.25)" }}>
                🕊️ {story.sober_time}
              </span>
            )}
            {story.is_relapse_comeback && (
              <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                background: "rgba(245,158,11,0.1)", color: C.amber, border: "1px solid rgba(245,158,11,0.25)" }}>
                💪 Relapse Comeback
              </span>
            )}
          </div>

          <h1 style={{ fontSize: 24, fontWeight: 900, color: "#fff", lineHeight: 1.25, marginBottom: 14 }}>
            {story.title}
          </h1>

          {/* Author */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
              background: "rgba(99,102,241,0.15)", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14 }}>
              {story.is_anonymous ? "🙏" : (story.display_name?.[0] || "?")}
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{authorName}</p>
              <p style={{ fontSize: 11, color: C.muted }}>
                {new Date(story.created_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            </div>
          </div>
        </div>

        <div style={{ padding: "20px 16px" }}>

          {/* AI Summary */}
          {story.ai_summary && (
            <div style={{ borderRadius: 16, padding: "16px 18px", marginBottom: 20,
              background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.2)" }}>
              <p style={{ fontSize: 10, fontWeight: 800, color: "#818CF8", textTransform: "uppercase",
                letterSpacing: ".1em", marginBottom: 8 }}>Story at a Glance</p>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.7, fontStyle: "italic" }}>
                "{story.ai_summary}"
              </p>
            </div>
          )}

          {/* Optional image */}
          {story.image_url && (
            <img src={story.image_url} alt="Story" style={{
              width: "100%", borderRadius: 16, maxHeight: 240, objectFit: "cover", marginBottom: 20,
            }} />
          )}

          {/* Story body */}
          <div style={{ borderRadius: 18, padding: "22px 20px", marginBottom: 16,
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.8)", lineHeight: 1.85,
              whiteSpace: "pre-wrap", fontWeight: 400 }}>
              {story.body}
            </p>
          </div>

          {/* Key lessons */}
          {story.lessons_learned && (
            <div style={{ borderRadius: 16, padding: "16px 18px", marginBottom: 14,
              background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)" }}>
              <p style={{ fontSize: 11, fontWeight: 800, color: C.emerald, textTransform: "uppercase",
                letterSpacing: ".1em", marginBottom: 10 }}>💡 Key Lessons</p>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.7 }}>
                {story.lessons_learned}
              </p>
            </div>
          )}

          {/* Advice to others */}
          {story.advice_to_others && (
            <div style={{ borderRadius: 16, padding: "16px 18px", marginBottom: 20,
              background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)" }}>
              <p style={{ fontSize: 11, fontWeight: 800, color: C.amber, textTransform: "uppercase",
                letterSpacing: ".1em", marginBottom: 10 }}>🤝 Their Advice to You</p>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.7 }}>
                {story.advice_to_others}
              </p>
            </div>
          )}

          {/* AI Tags */}
          {(story.ai_tags || []).length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 10, color: C.muted, fontWeight: 700, textTransform: "uppercase",
                letterSpacing: ".08em", marginBottom: 10 }}>Topics in This Story</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {story.ai_tags.map(tag => (
                  <span key={tag} style={{ padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                    background: "rgba(255,255,255,0.05)", color: C.muted, border: "1px solid rgba(255,255,255,0.09)" }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Reaction buttons */}
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <button onClick={() => reactMutation.mutate("helpful")} style={{
              flex: 1, padding: "14px", borderRadius: 14, border: "none", cursor: "pointer",
              background: hasHelped ? "rgba(239,68,68,0.12)" : "rgba(255,255,255,0.05)",
              border: `1.5px solid ${hasHelped ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.1)"}`,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
              <Heart style={{ width: 18, height: 18, color: hasHelped ? "#F87171" : C.muted,
                fill: hasHelped ? "#F87171" : "none" }} />
              <p style={{ fontSize: 14, fontWeight: 700,
                color: hasHelped ? "#F87171" : C.muted }}>
                This Helped Me {story.helpful_count > 0 ? `· ${story.helpful_count}` : ""}
              </p>
            </button>
            <button onClick={() => reactMutation.mutate("bookmark")} style={{
              width: 52, height: 52, borderRadius: 14, border: "none", cursor: "pointer",
              background: hasBookmarked ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.05)",
              border: `1.5px solid ${hasBookmarked ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.1)"}`,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <Bookmark style={{ width: 18, height: 18, color: hasBookmarked ? "#818CF8" : C.muted,
                fill: hasBookmarked ? "#818CF8" : "none" }} />
            </button>
          </div>

          {/* Report link */}
          <button onClick={() => setShowReport(true)} style={{
            display: "flex", alignItems: "center", gap: 6, background: "none", border: "none",
            cursor: "pointer", padding: "8px 0", margin: "0 auto",
          }}>
            <Flag style={{ color: "rgba(255,255,255,0.15)", width: 13, height: 13 }} />
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", fontWeight: 600 }}>Report this story</p>
          </button>

          {/* Share your own CTA */}
          <div onClick={() => navigate("/SubmitTestimonial")} style={{ cursor: "pointer", marginTop: 20,
            borderRadius: 18, padding: "18px 20px",
            background: "linear-gradient(135deg,rgba(99,102,241,0.08),rgba(139,92,246,0.05))",
            border: "1px solid rgba(99,102,241,0.2)", textAlign: "center" }}>
            <p style={{ fontSize: 15, fontWeight: 800, color: "#fff", marginBottom: 4 }}>
              Inspired? Share your story.
            </p>
            <p style={{ fontSize: 12, color: C.muted }}>
              You never know who needs to hear it. →
            </p>
          </div>
        </div>
      </div>

      {showReport && (
        <ReportModal storyId={storyId} userEmail={user?.email} onClose={() => setShowReport(false)} />
      )}
    </div>
  );
}