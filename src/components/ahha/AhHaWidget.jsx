import React from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Sparkles } from "lucide-react";

const C = {
  gold: "#C9A96E",
  teal: "#2DD4BF",
  muted: "rgba(241,245,249,0.38)",
};

const REACTIONS = [
  { type: "felt_this",        emoji: "❤️",  label: "I Relate"     },
  { type: "gave_me_strength", emoji: "💪",  label: "Proud of You" },
  { type: "not_alone",        emoji: "🫂",  label: "Stay Strong"  },
];

export default function AhHaWidget({ user }) {
  const qc = useQueryClient();

  const { data: stories = [] } = useQuery({
    queryKey: ["ahha-widget"],
    queryFn: () => base44.entities.AhHaMoment.filter({ status: "approved" }, "-created_date", 5),
    staleTime: 60_000,
  });

  const featured = stories.find(s => s.is_featured) || stories[0];

  const { data: reactions = [] } = useQuery({
    queryKey: ["ahha-widget-reactions", featured?.id],
    queryFn: () => base44.entities.AhHaReaction.filter({ moment_id: featured.id }),
    enabled: !!featured?.id,
  });

  const myReactions = reactions.filter(r => r.user_email === user?.email).map(r => r.reaction_type);

  const reactMutation = useMutation({
    mutationFn: async (type) => {
      const existing = reactions.find(r => r.user_email === user?.email && r.reaction_type === type);
      if (existing) {
        await base44.entities.AhHaReaction.delete(existing.id);
      } else {
        await base44.entities.AhHaReaction.create({ moment_id: featured.id, user_email: user.email, reaction_type: type });
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ahha-widget-reactions", featured?.id] }),
  });

  if (!featured) return (
    <Link to="/AhHaMoment" style={{ textDecoration: "none", display: "block", marginBottom: 20 }}>
      <div style={{
        borderRadius: 22, padding: "20px 20px",
        background: "linear-gradient(135deg,rgba(201,169,110,0.08),rgba(45,212,191,0.04))",
        border: "2px dashed rgba(201,169,110,0.25)", textAlign: "center",
      }}>
        <p style={{ fontSize: 22, marginBottom: 8 }}>✨</p>
        <p style={{ fontSize: 15, fontWeight: 900, color: "#fff", marginBottom: 4 }}>The Ah Ha Moment</p>
        <p style={{ fontSize: 12, color: C.muted }}>Be the first to share yours</p>
      </div>
    </Link>
  );

  const name = featured.is_anonymous ? "Anonymous" : (featured.display_name || "Member");
  const preview = featured.what_happened?.slice(0, 160) + (featured.what_happened?.length > 160 ? "…" : "");

  return (
    <div style={{ marginBottom: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <Sparkles style={{ color: C.gold, width: 14, height: 14 }} />
          <p style={{ fontSize: 11, fontWeight: 800, color: C.gold, textTransform: "uppercase", letterSpacing: "1px" }}>
            Ah Ha Moment
          </p>
        </div>
        <Link to="/AhHaMoment" style={{ fontSize: 12, color: C.teal, fontWeight: 700, textDecoration: "none" }}>
          See all →
        </Link>
      </div>

      {/* Story card */}
      <div style={{
        borderRadius: 22, padding: "20px 20px",
        background: "linear-gradient(135deg,rgba(201,169,110,0.07),rgba(45,212,191,0.04))",
        border: "1.5px solid rgba(201,169,110,0.25)",
      }}>
        {/* Author */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%",
            background: "rgba(201,169,110,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
            {featured.is_anonymous ? "🌿" : name[0]?.toUpperCase()}
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>{name}</p>
            <p style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: ".06em" }}>
              {featured.category?.replace(/_/g, " ")}
            </p>
          </div>
        </div>

        {/* Story excerpt */}
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.8)", lineHeight: 1.75, fontStyle: "italic", marginBottom: 16 }}>
          "{preview}"
        </p>

        {/* Quick reactions */}
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {REACTIONS.map(r => {
            const mine = myReactions.includes(r.type);
            const count = reactions.filter(x => x.reaction_type === r.type).length;
            return (
              <button key={r.type}
                onClick={() => user && reactMutation.mutate(r.type)}
                disabled={!user || reactMutation.isPending}
                style={{
                  flex: 1, padding: "9px 6px", borderRadius: 12, border: "none", cursor: user ? "pointer" : "default",
                  background: mine ? "rgba(201,169,110,0.15)" : "rgba(255,255,255,0.05)",
                  border: `1.5px solid ${mine ? "rgba(201,169,110,0.45)" : "rgba(255,255,255,0.08)"}`,
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                  transition: "all 0.15s ease",
                }}>
                <span style={{ fontSize: 16 }}>{r.emoji}</span>
                <span style={{ fontSize: 9, fontWeight: 700, color: mine ? C.gold : C.muted, lineHeight: 1.2 }}>{r.label}</span>
                {count > 0 && <span style={{ fontSize: 9, color: C.muted }}>{count}</span>}
              </button>
            );
          })}
        </div>

        {/* Read full + share CTA */}
        <div style={{ display: "flex", gap: 8 }}>
          <Link to={`/AhHaDetail?id=${featured.id}`} style={{ textDecoration: "none", flex: 1 }}>
            <div style={{
              padding: "10px 14px", borderRadius: 12, textAlign: "center",
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer",
            }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>Read Full Story</p>
            </div>
          </Link>
          <Link to="/SubmitAhHa" style={{ textDecoration: "none", flex: 1 }}>
            <div style={{
              padding: "10px 14px", borderRadius: 12, textAlign: "center",
              background: "linear-gradient(135deg,rgba(201,169,110,0.2),rgba(201,169,110,0.1))",
              border: "1.5px solid rgba(201,169,110,0.35)", cursor: "pointer",
            }}>
              <p style={{ fontSize: 12, fontWeight: 800, color: C.gold }}>Share Mine ✨</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}