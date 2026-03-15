import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, CheckCircle2, Heart } from "lucide-react";
import RecoveryPostCard from "./RecoveryPostCard";

const C = {
  muted: "rgba(255,255,255,0.28)",
  slate: "rgba(255,255,255,0.6)",
};

const CHECKIN_QUESTIONS = [
  {
    key: "stayed_sober",
    question: "Did you stay sober today?",
    type: "yesno",
    emoji: "🏆",
    yesColor: "#34D399",
    noColor: "#F87171",
  },
  {
    key: "attended_meeting",
    question: "Did you attend a meeting?",
    type: "yesno",
    emoji: "🤲",
    yesColor: "#3ECFBF",
    noColor: "#94A3B8",
  },
  {
    key: "biggest_challenge",
    question: "What was your biggest challenge today?",
    type: "text",
    emoji: "🌊",
    placeholder: "Share what was hard today…",
  },
  {
    key: "gratitude",
    question: "What are you grateful for today?",
    type: "text",
    emoji: "🙏",
    placeholder: "Something you're thankful for, big or small…",
  },
];

function YesNo({ value, onChange, yesColor, noColor }) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {["yes", "no"].map(opt => (
        <button
          key={opt}
          onClick={() => onChange(value === opt ? null : opt)}
          style={{
            flex: 1, padding: "10px", borderRadius: 10, fontSize: 13, fontWeight: 700,
            cursor: "pointer", border: "none",
            background: value === opt
              ? (opt === "yes" ? `${yesColor}25` : `${noColor}25`)
              : "rgba(255,255,255,0.06)",
            color: value === opt
              ? (opt === "yes" ? yesColor : noColor)
              : C.muted,
            borderWidth: 1, borderStyle: "solid",
            borderColor: value === opt
              ? (opt === "yes" ? `${yesColor}50` : `${noColor}50`)
              : "rgba(255,255,255,0.08)",
          }}
        >
          {opt === "yes" ? "✓ Yes" : "✗ No"}
        </button>
      ))}
    </div>
  );
}

export default function AccountabilityCheckIn({ circle, user }) {
  const queryClient = useQueryClient();
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];

  const { data: todayCheckins = [], isLoading } = useQuery({
    queryKey: ["acct-checkins", circle.id, todayStr],
    queryFn: () => base44.entities.CommunityPost.filter({
      group_id: circle.id,
      category: "journal_reflection",
      moderation_status: "approved",
    }, "-created_date", 30),
  });

  const submitMutation = useMutation({
    mutationFn: () => {
      const lines = CHECKIN_QUESTIONS.map(q => {
        const ans = answers[q.key];
        if (q.type === "yesno") return `${q.emoji} **${q.question}** ${ans === "yes" ? "Yes ✓" : ans === "no" ? "No" : "—"}`;
        return `${q.emoji} **${q.question}**\n${ans || "—"}`;
      });
      const content = lines.join("\n\n");

      return base44.entities.CommunityPost.create({
        title: `Daily Accountability Check-In · ${todayStr}`,
        content,
        category: "journal_reflection",
        group_id: circle.id,
        post_type: "group_post",
        is_anonymous: false,
        moderation_status: "approved",
        like_count: 0,
      });
    },
    onSuccess: () => {
      setSubmitted(true);
      queryClient.invalidateQueries(["acct-checkins", circle.id]);
    },
  });

  const setAnswer = (key, val) => setAnswers(prev => ({ ...prev, [key]: val }));
  const hasAnyAnswer = Object.values(answers).some(v => v !== null && v !== undefined && v !== "");

  return (
    <div>
      {/* Prompt header */}
      <div style={{
        background: `${circle.color}10`, border: `1px solid ${circle.color}30`,
        borderRadius: 16, padding: "14px 16px", marginBottom: 16,
      }}>
        <p style={{ fontSize: 14, fontWeight: 800, color: circle.color, marginBottom: 2 }}>
          📋 Daily Accountability Check-In
        </p>
        <p style={{ fontSize: 12, color: C.muted }}>
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>

      {!submitted && user ? (
        <div style={{
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 16, padding: "16px", marginBottom: 16,
        }}>
          {CHECKIN_QUESTIONS.map((q, i) => (
            <div key={q.key} style={{ marginBottom: i < CHECKIN_QUESTIONS.length - 1 ? 20 : 0 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 8 }}>
                {q.emoji} {q.question}
              </p>
              {q.type === "yesno" ? (
                <YesNo
                  value={answers[q.key]}
                  onChange={v => setAnswer(q.key, v)}
                  yesColor={q.yesColor}
                  noColor={q.noColor}
                />
              ) : (
                <textarea
                  value={answers[q.key] || ""}
                  onChange={e => setAnswer(q.key, e.target.value)}
                  placeholder={q.placeholder}
                  rows={2}
                  style={{
                    width: "100%", padding: "10px 12px",
                    background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 10, color: "#fff", fontSize: 13, outline: "none", resize: "none",
                    lineHeight: 1.6, boxSizing: "border-box",
                  }}
                />
              )}
            </div>
          ))}

          <button
            onClick={() => submitMutation.mutate()}
            disabled={!hasAnyAnswer || submitMutation.isPending}
            style={{
              width: "100%", marginTop: 18, padding: "12px", borderRadius: 12,
              background: hasAnyAnswer
                ? `linear-gradient(135deg,${circle.color},${circle.color}CC)`
                : "rgba(255,255,255,0.06)",
              border: "none", color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              opacity: !hasAnyAnswer ? 0.5 : 1,
            }}
          >
            {submitMutation.isPending
              ? <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" />
              : <CheckCircle2 style={{ width: 14, height: 14 }} />
            }
            Post My Check-In
          </button>
        </div>
      ) : submitted ? (
        <div style={{
          textAlign: "center", padding: "24px 20px", marginBottom: 16,
          background: `${circle.color}10`, border: `1px solid ${circle.color}30`, borderRadius: 16,
        }}>
          <p style={{ fontSize: 26, marginBottom: 8 }}>✅</p>
          <p style={{ fontSize: 15, fontWeight: 800, color: "#fff", marginBottom: 4 }}>Check-In Posted!</p>
          <p style={{ fontSize: 13, color: C.muted }}>Your accountability post is now visible to your circle.</p>
        </div>
      ) : (
        <div style={{ padding: "16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, marginBottom: 16 }}>
          <p style={{ fontSize: 13, color: C.muted, textAlign: "center" }}>Sign in to post your check-in.</p>
        </div>
      )}

      {/* Today's check-ins from others */}
      <div style={{ marginBottom: 10 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase",
          letterSpacing: ".07em", marginBottom: 12 }}>
          <Heart style={{ width: 11, height: 11, display: "inline", marginRight: 4 }} />
          Today's Circle Check-Ins
        </p>
      </div>

      {isLoading && (
        <div style={{ textAlign: "center", padding: 20 }}>
          <Loader2 style={{ width: 20, height: 20, color: circle.color }} className="animate-spin" />
        </div>
      )}

      {!isLoading && todayCheckins.length === 0 && (
        <div style={{ textAlign: "center", padding: "28px 20px",
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14 }}>
          <p style={{ fontSize: 13, color: C.muted }}>No check-ins yet today. Be the first! 💙</p>
        </div>
      )}

      {todayCheckins.map(post => (
        <RecoveryPostCard key={post.id} post={post} user={user} />
      ))}
    </div>
  );
}