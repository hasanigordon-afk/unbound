import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Plus, Loader2, MessageCircle, Lock, Globe } from "lucide-react";

const TOPIC_META = {
  motivation:          { emoji: "⚡", color: "#F59E0B", label: "Motivation" },
  cravings:            { emoji: "🔥", color: "#EF4444", label: "Managing Cravings" },
  gratitude:           { emoji: "🙏", color: "#10B981", label: "Gratitude" },
  employment:          { emoji: "💼", color: "#3B82F6", label: "Employment" },
  family:              { emoji: "❤️", color: "#EC4899", label: "Family & Relationships" },
  spirituality:        { emoji: "✨", color: "#8B5CF6", label: "Spirituality" },
  mental_health:       { emoji: "🧠", color: "#6366F1", label: "Mental Health" },
  sobriety_milestones: { emoji: "🏆", color: "#F97316", label: "Milestones" },
  general:             { emoji: "💬", color: "#64748B", label: "General Support" },
};

function CircleCard({ circle, isMember, onJoin, onOpen }) {
  const meta = TOPIC_META[circle.topic_tag] || TOPIC_META.general;
  return (
    <div style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 18, padding: "18px 16px" }}>
      <div className="flex items-start gap-3 mb-2">
        <div style={{ width: 48, height: 48, borderRadius: 14, background: `rgba(${hexToRgb(meta.color)},0.15)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>
          {circle.emoji || meta.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p style={{ color: "#FFF", fontWeight: 700, fontSize: 15 }}>{circle.name}</p>
          <span style={{ fontSize: 11, fontWeight: 600, color: meta.color, background: `rgba(${hexToRgb(meta.color)},0.12)`, borderRadius: 20, padding: "2px 8px", display: "inline-block", marginTop: 2 }}>
            {meta.label}
          </span>
        </div>
        <div className="flex items-center gap-1" style={{ flexShrink: 0 }}>
          <Users style={{ width: 12, height: 12, color: "rgba(255,255,255,0.35)" }} />
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{circle.member_count || 0}</span>
        </div>
      </div>

      {circle.description && (
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.5, marginBottom: 14 }}>{circle.description}</p>
      )}

      <div className="flex gap-2">
        {isMember ? (
          <button onClick={() => onOpen(circle)} style={{ flex: 1, background: `rgba(${hexToRgb(meta.color)},0.2)`, border: `1px solid ${meta.color}50`, borderRadius: 12, padding: "9px", fontSize: 13, fontWeight: 700, color: meta.color, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <MessageCircle style={{ width: 14, height: 14 }} /> Open Circle
          </button>
        ) : (
          <button onClick={() => onJoin(circle)} style={{ flex: 1, background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: 12, padding: "9px", fontSize: 13, fontWeight: 700, color: "#60A5FA", cursor: "pointer" }}>
            + Join Circle
          </button>
        )}
      </div>
    </div>
  );
}

function CreateCircleModal({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [topic, setTopic] = useState("general");
  const [emoji, setEmoji] = useState("");

  const handleSubmit = () => {
    if (!name.trim()) return;
    onCreate({ name: name.trim(), description, topic_tag: topic, emoji: emoji || TOPIC_META[topic].emoji });
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 999, display: "flex", alignItems: "flex-end" }} onClick={onClose}>
      <div style={{ background: "#111827", borderRadius: "24px 24px 0 0", padding: "28px 20px", width: "100%", maxHeight: "85vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
        <h2 style={{ color: "#FFF", fontWeight: 800, fontSize: 20, marginBottom: 20 }}>Create a Recovery Circle</h2>

        <div className="flex flex-col gap-4">
          <div>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Circle Name</p>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Monday Morning Warriors" style={{ width: "100%", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, padding: "12px 14px", color: "#FFF", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          </div>

          <div>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Topic</p>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(TOPIC_META).map(([key, meta]) => (
                <button key={key} onClick={() => setTopic(key)} style={{ padding: "10px 6px", borderRadius: 12, border: "1px solid", background: topic === key ? `rgba(${hexToRgb(meta.color)},0.2)` : "rgba(255,255,255,0.04)", borderColor: topic === key ? meta.color : "rgba(255,255,255,0.1)", color: topic === key ? meta.color : "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 600, cursor: "pointer", textAlign: "center", lineHeight: 1.3 }}>
                  <div style={{ fontSize: 18, marginBottom: 4 }}>{meta.emoji}</div>
                  {meta.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Description (optional)</p>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What is this circle about?" rows={2} style={{ width: "100%", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, padding: "12px 14px", color: "#FFF", fontSize: 14, outline: "none", resize: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
          </div>

          <button onClick={handleSubmit} disabled={!name.trim()} style={{ background: name.trim() ? "#3B82F6" : "rgba(255,255,255,0.1)", color: name.trim() ? "#FFF" : "rgba(255,255,255,0.3)", border: "none", borderRadius: 14, padding: "15px", fontSize: 15, fontWeight: 700, cursor: name.trim() ? "pointer" : "not-allowed" }}>
            Create Circle
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RecoveryCircleList({ user, onOpenCircle }) {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);

  const { data: circles = [], isLoading } = useQuery({
    queryKey: ["group-channels"],
    queryFn: () => base44.entities.GroupChannel.filter({ is_active: true }),
  });

  const { data: memberships = [] } = useQuery({
    queryKey: ["my-circle-memberships", user?.email],
    queryFn: () => base44.entities.GroupChannelMember.filter({ member_email: user.email }),
    enabled: !!user,
  });

  const joinMutation = useMutation({
    mutationFn: async (circle) => {
      const adjectives = ["Brave", "Rising", "Strong", "Hopeful", "Steady", "Bold", "Calm", "Free"];
      const nouns = ["Sparrow", "Oak", "River", "Flame", "Star", "Phoenix", "Eagle", "Wolf"];
      const name = `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`;
      await base44.entities.GroupChannelMember.create({ channel_id: circle.id, member_email: user.email, anonymous_name: name, joined_at: new Date().toISOString().split("T")[0] });
      await base44.entities.GroupChannel.update(circle.id, { member_count: (circle.member_count || 0) + 1 });
    },
    onSuccess: () => { queryClient.invalidateQueries(["my-circle-memberships"]); queryClient.invalidateQueries(["group-channels"]); },
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.GroupChannel.create({ ...data, is_active: true, member_count: 1, moderated_by: user.email }),
    onSuccess: async (newCircle) => {
      await base44.entities.GroupChannelMember.create({ channel_id: newCircle.id, member_email: user.email, anonymous_name: "Circle Founder", joined_at: new Date().toISOString().split("T")[0] });
      queryClient.invalidateQueries(["group-channels"]);
      queryClient.invalidateQueries(["my-circle-memberships"]);
    },
  });

  const memberChannelIds = new Set(memberships.map(m => m.channel_id));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p style={{ color: "#FFF", fontWeight: 700, fontSize: 15 }}>Recovery Circles</p>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}>Small peer groups — anonymous &amp; safe</p>
        </div>
        <button onClick={() => setShowCreate(true)} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: 12, padding: "8px 14px", color: "#60A5FA", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          <Plus style={{ width: 14, height: 14 }} /> New Circle
        </button>
      </div>

      <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 14, padding: "12px 14px", display: "flex", gap: 10, alignItems: "center" }}>
        <Lock style={{ width: 16, height: 16, color: "#F59E0B", flexShrink: 0 }} />
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>Circles are anonymous. Your real name is never shown. You choose a display name when you join.</p>
      </div>

      {isLoading ? (
        <div className="text-center py-12"><Loader2 style={{ width: 28, height: 28, color: "rgba(255,255,255,0.3)" }} className="animate-spin mx-auto" /></div>
      ) : (
        <div className="flex flex-col gap-3">
          {memberships.length > 0 && (
            <>
              <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.8px" }}>My Circles</p>
              {circles.filter(c => memberChannelIds.has(c.id)).map(c => (
                <CircleCard key={c.id} circle={c} isMember={true} onJoin={joinMutation.mutate} onOpen={onOpenCircle} />
              ))}
              <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.8px", marginTop: 8 }}>Discover</p>
            </>
          )}
          {circles.filter(c => !memberChannelIds.has(c.id)).map(c => (
            <CircleCard key={c.id} circle={c} isMember={false} onJoin={joinMutation.mutate} onOpen={onOpenCircle} />
          ))}
          {circles.length === 0 && (
            <div className="text-center py-12">
              <Users style={{ width: 36, height: 36, color: "rgba(255,255,255,0.2)" }} className="mx-auto mb-3" />
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>No circles yet — create the first one!</p>
            </div>
          )}
        </div>
      )}

      {showCreate && <CreateCircleModal onClose={() => setShowCreate(false)} onCreate={createMutation.mutate} />}
    </div>
  );
}

function hexToRgb(hex) {
  if (!hex || !hex.startsWith("#")) return "255,255,255";
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}