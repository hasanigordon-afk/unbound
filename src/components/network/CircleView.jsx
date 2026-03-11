import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Send, Loader2, Flag } from "lucide-react";

export default function CircleView({ circle, user, onBack }) {
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  const { data: membership } = useQuery({
    queryKey: ["my-membership", circle.id, user?.email],
    queryFn: () => base44.entities.GroupChannelMember.filter({ channel_id: circle.id, member_email: user.email }),
    enabled: !!user,
  });

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["circle-messages", circle.id],
    queryFn: () => base44.entities.GroupChannelMessage.filter({ channel_id: circle.id, is_removed: false }, "created_date", 60),
  });

  useEffect(() => {
    const unsub = base44.entities.GroupChannelMessage.subscribe((event) => {
      if (event.data?.channel_id === circle.id) {
        queryClient.invalidateQueries(["circle-messages", circle.id]);
      }
    });
    return () => unsub();
  }, [circle.id, queryClient]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const displayName = membership?.[0]?.anonymous_name || "Anonymous";

  const sendMutation = useMutation({
    mutationFn: () => base44.entities.GroupChannelMessage.create({
      channel_id: circle.id,
      author_email: user.email,
      display_name: displayName,
      content: text.trim(),
    }),
    onSuccess: () => {
      setText("");
      queryClient.invalidateQueries(["circle-messages", circle.id]);
    },
  });

  const handleSend = () => {
    if (!text.trim()) return;
    sendMutation.mutate();
  };

  const handleFlag = async (msg) => {
    await base44.entities.GroupChannelMessage.update(msg.id, { is_flagged: true, flag_reason: "Reported by member" });
    queryClient.invalidateQueries(["circle-messages", circle.id]);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 80px)", minHeight: 0 }}>
      {/* Header */}
      <div style={{ background: "rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
          <ArrowLeft style={{ width: 20, height: 20, color: "rgba(255,255,255,0.7)" }} />
        </button>
        <div style={{ flex: 1 }}>
          <p style={{ color: "#FFF", fontWeight: 700, fontSize: 15 }}>{circle.emoji} {circle.name}</p>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>You are: <strong style={{ color: "rgba(255,255,255,0.6)" }}>{displayName}</strong></p>
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{circle.member_count || 0} members</div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {isLoading ? (
          <div className="text-center py-12"><Loader2 style={{ width: 24, height: 24, color: "rgba(255,255,255,0.3)" }} className="animate-spin mx-auto" /></div>
        ) : messages.length === 0 ? (
          <div className="text-center py-16">
            <p style={{ fontSize: 32, marginBottom: 8 }}>🌅</p>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>Be the first to share something</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.author_email === user.email;
            return (
              <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: isOwn ? "flex-end" : "flex-start" }}>
                {!isOwn && <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginBottom: 3, paddingLeft: 4 }}>{msg.display_name}</p>}
                <div style={{ maxWidth: "80%", background: isOwn ? "#3B82F6" : "rgba(255,255,255,0.08)", borderRadius: isOwn ? "16px 16px 4px 16px" : "16px 16px 16px 4px", padding: "10px 14px", position: "relative" }}>
                  <p style={{ fontSize: 14, color: "#FFF", lineHeight: 1.5 }}>{msg.content}</p>
                </div>
                {!isOwn && (
                  <button onClick={() => handleFlag(msg)} style={{ background: "none", border: "none", cursor: "pointer", marginTop: 2, paddingLeft: 4, display: "flex", alignItems: "center", gap: 4 }}>
                    <Flag style={{ width: 10, height: 10, color: "rgba(255,255,255,0.2)" }} />
                  </button>
                )}
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "12px 16px", display: "flex", gap: 10, flexShrink: 0, background: "rgba(0,0,0,0.3)" }}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder={`Message as ${displayName}…`}
          style={{ flex: 1, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: "11px 14px", color: "#FFF", fontSize: 14, outline: "none" }}
        />
        <button onClick={handleSend} disabled={!text.trim() || sendMutation.isPending} style={{ background: text.trim() ? "#3B82F6" : "rgba(255,255,255,0.1)", border: "none", borderRadius: 12, padding: "11px 14px", cursor: text.trim() ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {sendMutation.isPending ? <Loader2 style={{ width: 16, height: 16, color: "#FFF" }} className="animate-spin" /> : <Send style={{ width: 16, height: 16, color: "#FFF" }} />}
        </button>
      </div>
    </div>
  );
}