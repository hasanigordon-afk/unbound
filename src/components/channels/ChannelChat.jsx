import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Send, Flag, Shield } from "lucide-react";

const REACTIONS = ["❤️", "🔥", "👏", "🙏", "💪"];

export default function ChannelChat({ channel, membership, userEmail, onBack }) {
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const [flagging, setFlagging] = useState(null);
  const bottomRef = useRef(null);

  const { data: messages = [] } = useQuery({
    queryKey: ["channel-messages", channel.id],
    queryFn: () => base44.entities.GroupChannelMessage.filter({ channel_id: channel.id, is_removed: false }, "created_date", 100),
    refetchInterval: 5000,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const sendMutation = useMutation({
    mutationFn: () =>
      base44.entities.GroupChannelMessage.create({
        channel_id: channel.id,
        author_email: userEmail,
        display_name: membership.anonymous_name,
        content: text.trim(),
        reactions: {},
      }),
    onSuccess: () => {
      setText("");
      qc.invalidateQueries({ queryKey: ["channel-messages", channel.id] });
    },
  });

  const flagMutation = useMutation({
    mutationFn: ({ msgId, reason }) =>
      base44.entities.GroupChannelMessage.update(msgId, { is_flagged: true, flag_reason: reason }),
    onSuccess: () => {
      setFlagging(null);
      qc.invalidateQueries({ queryKey: ["channel-messages", channel.id] });
    },
  });

  const reactMutation = useMutation({
    mutationFn: ({ msg, emoji }) => {
      const current = msg.reactions || {};
      return base44.entities.GroupChannelMessage.update(msg.id, {
        reactions: { ...current, [emoji]: (current[emoji] || 0) + 1 },
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["channel-messages", channel.id] }),
  });

  const handleSend = () => {
    if (!text.trim()) return;
    sendMutation.mutate();
  };

  const isMe = (msg) => msg.author_email === userEmail;

  return (
    <div className="flex flex-col h-full" style={{ background: "#F7F7F8", minHeight: "calc(100vh - 160px)" }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0" style={{ background: "#FFF", borderBottom: "1px solid #D1D1D6" }}>
        <button onClick={onBack} className="p-1 rounded" style={{ color: "#8E8E93" }}>
          <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
        </button>
        <div className="text-xl">{channel.emoji || "💬"}</div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm leading-tight" style={{ color: "#1E1E1E" }}>{channel.name}</p>
          <p className="text-[11px]" style={{ color: "#8E8E93" }}>
            Anonymous as <span className="font-medium" style={{ color: "#4A90E2" }}>{membership.anonymous_name}</span>
            &nbsp;•&nbsp;
            <Shield className="inline w-3 h-3" strokeWidth={1.5} /> Moderated
          </p>
        </div>
      </div>

      {/* Anonymity Notice */}
      <div className="mx-4 mt-3 px-3 py-2 rounded text-xs" style={{ background: "#EBF3FD", color: "#2563EB", border: "1px solid #BFDBFE" }}>
        🔒 Your real identity is hidden. You appear as <strong>{membership.anonymous_name}</strong> in this channel.
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
        {messages.length === 0 && (
          <div className="text-center py-8 text-sm" style={{ color: "#8E8E93" }}>
            No messages yet. Be the first to share!
          </div>
        )}
        {messages.map((msg) => {
          const mine = isMe(msg);
          return (
            <div key={msg.id} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
              {!mine && (
                <p className="text-[11px] font-medium mb-1 ml-1" style={{ color: "#8E8E93" }}>{msg.display_name}</p>
              )}
              <div
                className="max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed"
                style={{
                  background: mine ? "#4A90E2" : "#FFF",
                  color: mine ? "#FFF" : "#1E1E1E",
                  border: mine ? "none" : "1px solid #E5E5EA",
                  borderRadius: mine ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                }}
              >
                {msg.content}
              </div>

              {/* Reactions */}
              <div className="flex items-center gap-1 mt-1 flex-wrap">
                {Object.entries(msg.reactions || {}).map(([emoji, count]) =>
                  count > 0 ? (
                    <span
                      key={emoji}
                      onClick={() => reactMutation.mutate({ msg, emoji })}
                      className="text-xs px-1.5 py-0.5 rounded-full cursor-pointer"
                      style={{ background: "#F0F0F3", border: "1px solid #E5E5EA" }}
                    >
                      {emoji} {count}
                    </span>
                  ) : null
                )}
                {!mine && (
                  <div className="flex gap-0.5">
                    {REACTIONS.map((e) => (
                      <button
                        key={e}
                        onClick={() => reactMutation.mutate({ msg, emoji: e })}
                        className="text-xs w-6 h-6 rounded-full flex items-center justify-center opacity-40 hover:opacity-100"
                        style={{ background: "#F0F0F3" }}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                )}
                {!mine && !msg.is_flagged && (
                  <button
                    onClick={() => setFlagging(msg.id)}
                    className="text-[10px] flex items-center gap-0.5 opacity-30 hover:opacity-70"
                    style={{ color: "#EF4444" }}
                  >
                    <Flag className="w-2.5 h-2.5" strokeWidth={2} /> report
                  </button>
                )}
                {msg.is_flagged && !mine && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "#FEF3C7", color: "#D97706" }}>
                    Under Review
                  </span>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Flag Modal */}
      {flagging && (
        <div className="absolute inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="bg-white rounded-xl p-5 mx-4 w-full max-w-sm shadow-xl">
            <p className="font-semibold text-sm mb-3" style={{ color: "#1E1E1E" }}>Report this message?</p>
            {["Harmful content", "Spam", "Harassment", "Relapse trigger"].map((reason) => (
              <button
                key={reason}
                onClick={() => flagMutation.mutate({ msgId: flagging, reason })}
                className="block w-full text-left px-4 py-3 rounded-lg text-sm mb-2"
                style={{ background: "#F7F7F8", color: "#1E1E1E", border: "1px solid #D1D1D6" }}
              >
                {reason}
              </button>
            ))}
            <button onClick={() => setFlagging(null)} className="block w-full text-center text-sm mt-2" style={{ color: "#8E8E93" }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="flex items-end gap-2 px-4 py-3 flex-shrink-0" style={{ background: "#FFF", borderTop: "1px solid #D1D1D6" }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="Share with the group..."
          rows={1}
          className="flex-1 text-sm resize-none rounded-xl px-4 py-2.5 outline-none"
          style={{ background: "#F7F7F8", border: "1px solid #D1D1D6", color: "#1E1E1E", maxHeight: "100px" }}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sendMutation.isPending}
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: text.trim() ? "#4A90E2" : "#E5E5EA", color: text.trim() ? "#FFF" : "#8E8E93" }}
        >
          <Send className="w-4 h-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}