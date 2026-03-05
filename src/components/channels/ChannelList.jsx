import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Users, Lock, Hash } from "lucide-react";

const TOPIC_COLORS = {
  motivation: { bg: "#FFF7ED", border: "#FED7AA", text: "#C2410C" },
  cravings: { bg: "#FEF2F2", border: "#FCA5A5", text: "#DC2626" },
  gratitude: { bg: "#F0FDF4", border: "#86EFAC", text: "#16A34A" },
  employment: { bg: "#EFF6FF", border: "#BFDBFE", text: "#2563EB" },
  family: { bg: "#FDF4FF", border: "#E9D5FF", text: "#9333EA" },
  spirituality: { bg: "#FFFBEB", border: "#FDE68A", text: "#D97706" },
  mental_health: { bg: "#EFF6FF", border: "#BFDBFE", text: "#3B82F6" },
  sobriety_milestones: { bg: "#F0FDF4", border: "#86EFAC", text: "#22C55E" },
  general: { bg: "#F9FAFB", border: "#D1D5DB", text: "#6B7280" },
};

export default function ChannelList({ userEmail, onSelectChannel, activeMemberships = [] }) {
  const qc = useQueryClient();

  const { data: channels = [], isLoading } = useQuery({
    queryKey: ["group-channels"],
    queryFn: () => base44.entities.GroupChannel.filter({ is_active: true }),
  });

  const joinMutation = useMutation({
    mutationFn: async (channel) => {
      const adjectives = ["Brave", "Quiet", "Rising", "Steady", "Hopeful", "Strong", "Gentle", "Resilient", "Bold", "Calm"];
      const nouns = ["Sparrow", "Maple", "River", "Oak", "Ember", "Cedar", "Falcon", "Stone", "Dawn", "Shore"];
      const name = `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`;
      return base44.entities.GroupChannelMember.create({
        channel_id: channel.id,
        member_email: userEmail,
        anonymous_name: name,
        joined_at: new Date().toISOString().split("T")[0],
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-channel-memberships", userEmail] });
    },
  });

  const joinedIds = new Set(activeMemberships.map((m) => m.channel_id));

  if (isLoading) {
    return (
      <div className="p-6 text-center text-sm" style={{ color: "#8E8E93" }}>
        Loading channels...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs uppercase tracking-wide font-semibold px-1" style={{ color: "#8E8E93" }}>
        {channels.length} Support Channels
      </p>
      {channels.map((ch) => {
        const colors = TOPIC_COLORS[ch.topic_tag] || TOPIC_COLORS.general;
        const isMember = joinedIds.has(ch.id);
        return (
          <div
            key={ch.id}
            style={{ background: "#FFF", border: "1px solid #D1D1D6", borderRadius: "8px", padding: "16px" }}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-xl"
                style={{ background: colors.bg, border: `1px solid ${colors.border}` }}>
                {ch.emoji || "💬"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-semibold text-sm" style={{ color: "#1E1E1E" }}>{ch.name}</p>
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                    style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}>
                    {ch.topic_tag.replace("_", " ")}
                  </span>
                </div>
                <p className="text-xs" style={{ color: "#5A5A5A" }}>{ch.description}</p>
                <div className="flex items-center gap-1 mt-1.5">
                  <Lock className="w-3 h-3" style={{ color: "#8E8E93" }} strokeWidth={1.5} />
                  <span className="text-[11px]" style={{ color: "#8E8E93" }}>Anonymous • Moderated</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-3 pt-3" style={{ borderTop: "1px solid #F0F0F3" }}>
              {isMember ? (
                <button
                  onClick={() => onSelectChannel(ch, activeMemberships.find((m) => m.channel_id === ch.id))}
                  className="flex items-center gap-1.5 text-xs px-3 py-2 rounded font-medium"
                  style={{ background: "#4A90E2", color: "#FFF" }}
                >
                  <Hash className="w-3.5 h-3.5" strokeWidth={2} />
                  Open Channel
                </button>
              ) : (
                <button
                  onClick={() => joinMutation.mutate(ch)}
                  disabled={joinMutation.isPending}
                  className="flex items-center gap-1.5 text-xs px-3 py-2 rounded font-medium"
                  style={{ background: "#F0F4FA", color: "#4A90E2", border: "1px solid #C7D7F0" }}
                >
                  <Users className="w-3.5 h-3.5" strokeWidth={1.5} />
                  {joinMutation.isPending ? "Joining..." : "Join Channel"}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}