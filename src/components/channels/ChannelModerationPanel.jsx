import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Flag, CheckCircle, Trash2, Hash } from "lucide-react";

export default function ChannelModerationPanel() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState("flagged");

  const { data: channels = [] } = useQuery({
    queryKey: ["group-channels-mod"],
    queryFn: () => base44.entities.GroupChannel.filter({ is_active: true }),
  });

  const { data: flaggedMessages = [] } = useQuery({
    queryKey: ["flagged-channel-messages"],
    queryFn: () => base44.entities.GroupChannelMessage.filter({ is_flagged: true, is_removed: false }),
    refetchInterval: 15000,
  });

  const removeMutation = useMutation({
    mutationFn: (msgId) => base44.entities.GroupChannelMessage.update(msgId, { is_removed: true }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["flagged-channel-messages"] }),
  });

  const clearFlagMutation = useMutation({
    mutationFn: (msgId) => base44.entities.GroupChannelMessage.update(msgId, { is_flagged: false, flag_reason: null }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["flagged-channel-messages"] }),
  });

  const channelMap = Object.fromEntries(channels.map((c) => [c.id, c]));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "#FEF2F2", border: "1px solid #FCA5A5" }}>
          <Flag className="w-4 h-4" style={{ color: "#EF4444" }} strokeWidth={2} />
          <span className="text-sm font-semibold" style={{ color: "#DC2626" }}>
            {flaggedMessages.length} Flagged Message{flaggedMessages.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <div style={{ background: "#FFF", border: "1px solid #D1D1D6", borderRadius: "8px" }}>
        <p className="px-4 pt-4 pb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: "#8E8E93" }}>
          Channels Overview
        </p>
        {channels.map((ch) => (
          <div key={ch.id} className="flex items-center gap-3 px-4 py-3" style={{ borderTop: "1px solid #F0F0F3" }}>
            <span className="text-lg">{ch.emoji || "💬"}</span>
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: "#1E1E1E" }}>{ch.name}</p>
              <p className="text-xs" style={{ color: "#8E8E93" }}>{ch.topic_tag.replace("_", " ")}</p>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded font-medium" style={{ background: ch.is_active ? "#F0FDF4" : "#FEF2F2", color: ch.is_active ? "#16A34A" : "#EF4444" }}>
              {ch.is_active ? "Active" : "Inactive"}
            </span>
          </div>
        ))}
      </div>

      {flaggedMessages.length > 0 && (
        <div style={{ background: "#FFF", border: "1px solid #D1D1D6", borderRadius: "8px" }}>
          <p className="px-4 pt-4 pb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: "#EF4444" }}>
            Flagged Messages Pending Review
          </p>
          {flaggedMessages.map((msg) => {
            const ch = channelMap[msg.channel_id];
            return (
              <div key={msg.id} className="px-4 py-3" style={{ borderTop: "1px solid #F0F0F3" }}>
                <div className="flex items-start gap-2 justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Hash className="w-3 h-3" style={{ color: "#8E8E93" }} strokeWidth={2} />
                      <span className="text-xs font-medium" style={{ color: "#8E8E93" }}>{ch?.name || "Unknown Channel"}</span>
                    </div>
                    <p className="text-xs font-semibold mb-0.5" style={{ color: "#5A5A5A" }}>
                      {msg.display_name}
                    </p>
                    <p className="text-sm" style={{ color: "#1E1E1E" }}>{msg.content}</p>
                    {msg.flag_reason && (
                      <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded" style={{ background: "#FEF3C7", color: "#D97706" }}>
                        Reported: {msg.flag_reason}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => removeMutation.mutate(msg.id)}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded font-medium"
                    style={{ background: "#FEE2E2", color: "#DC2626" }}
                  >
                    <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
                    Remove
                  </button>
                  <button
                    onClick={() => clearFlagMutation.mutate(msg.id)}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded font-medium"
                    style={{ background: "#F0FDF4", color: "#16A34A" }}
                  >
                    <CheckCircle className="w-3.5 h-3.5" strokeWidth={2} />
                    Dismiss Flag
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {flaggedMessages.length === 0 && (
        <div className="text-center py-8 rounded-lg" style={{ background: "#F0FDF4", border: "1px solid #86EFAC" }}>
          <CheckCircle className="w-8 h-8 mx-auto mb-2" style={{ color: "#22C55E" }} strokeWidth={1.5} />
          <p className="text-sm font-medium" style={{ color: "#16A34A" }}>All clear — no flagged messages</p>
        </div>
      )}
    </div>
  );
}