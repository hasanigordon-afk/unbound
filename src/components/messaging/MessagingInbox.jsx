import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageSquare, ChevronRight, Check } from "lucide-react";

const TYPE_LABEL = {
  check_in: "Check-In",
  compliance_update: "Compliance",
  appointment_reminder: "Appointment",
  document_request: "Documents",
  progress_note: "Progress",
  general_message: "General",
  motivational: "Motivation",
  resource_share: "Resource",
};

const TYPE_COLOR = {
  appointment_reminder: { bg: "#EFF6FF", color: "#3B82F6" },
  motivational: { bg: "#F0FDF4", color: "#22C55E" },
  resource_share: { bg: "#FAF5FF", color: "#8B5CF6" },
  check_in: { bg: "#FFF7ED", color: "#EA580C" },
  general_message: { bg: "#F7F7F8", color: "#5A5A5A" },
};

function getTypeStyle(type) {
  return TYPE_COLOR[type] || { bg: "#F0F4FA", color: "#4A90E2" };
}

export default function MessagingInbox({ currentUserEmail, facilityId, participants, onCompose }) {
  const queryClient = useQueryClient();
  const [selectedThread, setSelectedThread] = useState(null);

  const { data: allMessages = [], isLoading } = useQuery({
    queryKey: ["all-messages", currentUserEmail],
    queryFn: async () => {
      const sent = await base44.entities.Message.filter({ sender_email: currentUserEmail });
      const received = await base44.entities.Message.filter({ receiver_email: currentUserEmail });
      const combined = [...sent, ...received];
      combined.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
      return combined;
    },
    enabled: !!currentUserEmail,
    refetchInterval: 15000,
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => base44.entities.Message.update(id, { is_read: true }),
    onSuccess: () => queryClient.invalidateQueries(["all-messages"]),
  });

  // Group by the "other" party
  const threads = {};
  allMessages.forEach((msg) => {
    const other = msg.sender_email === currentUserEmail ? msg.receiver_email : msg.sender_email;
    if (!threads[other]) threads[other] = [];
    threads[other].push(msg);
  });

  const threadList = Object.entries(threads).map(([email, msgs]) => {
    const latest = msgs[0];
    const unread = msgs.filter((m) => !m.is_read && m.receiver_email === currentUserEmail).length;
    return { email, latest, unread, msgs };
  });

  const threadMessages = selectedThread ? (threads[selectedThread] || []) : [];

  if (selectedThread) {
    // mark unread as read
    threadMessages.filter((m) => !m.is_read && m.receiver_email === currentUserEmail).forEach((m) => {
      markReadMutation.mutate(m.id);
    });

    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setSelectedThread(null)}
            className="text-sm flex items-center gap-1"
            style={{ color: "#4A90E2", background: "none", border: "none" }}
          >
            ← All Messages
          </button>
          <button
            onClick={() => onCompose(selectedThread)}
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded font-medium"
            style={{ background: "#4A90E2", color: "#FFF", border: "none" }}
          >
            <MessageSquare className="w-3.5 h-3.5" strokeWidth={1.5} />
            Reply / New
          </button>
        </div>

        <div className="mb-4">
          <p className="text-xs uppercase tracking-wide font-semibold mb-1" style={{ color: "#8E8E93" }}>Thread with</p>
          <p className="font-semibold" style={{ color: "#1E1E1E" }}>{selectedThread}</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {threadMessages.map((msg) => {
            const isMine = msg.sender_email === currentUserEmail;
            const style = getTypeStyle(msg.message_type);
            return (
              <div key={msg.id} style={{ display: "flex", justifyContent: isMine ? "flex-end" : "flex-start" }}>
                <div style={{
                  background: isMine ? "#4A90E2" : "#FFF",
                  color: isMine ? "#FFF" : "#1E1E1E",
                  border: isMine ? "none" : "1px solid #E5E7EB",
                  borderRadius: "10px",
                  padding: "14px 16px",
                  maxWidth: "80%",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded" style={isMine ? { background: "rgba(255,255,255,0.2)", color: "#FFF" } : { background: style.bg, color: style.color }}>
                      {TYPE_LABEL[msg.message_type] || msg.message_type}
                    </span>
                    {msg.status_tag && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded uppercase" style={isMine ? { background: "rgba(255,255,255,0.2)", color: "#FFF" } : { background: "#FEF3C7", color: "#D97706" }}>
                        {msg.status_tag.replace("_", " ")}
                      </span>
                    )}
                  </div>
                  {msg.subject && <p className="text-sm font-semibold mb-1">{msg.subject}</p>}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.body}</p>
                  <p className="text-[10px] mt-2" style={{ color: isMine ? "rgba(255,255,255,0.65)" : "#8E8E93" }}>
                    {new Date(msg.created_date).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                    {!isMine && msg.is_read && <span> · <Check className="w-3 h-3 inline" strokeWidth={2} /> Read</span>}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs uppercase tracking-wide font-semibold mb-4" style={{ color: "#8E8E93" }}>
        {threadList.length} Conversation{threadList.length !== 1 ? "s" : ""}
      </p>

      {isLoading && (
        <div className="text-center py-16 text-sm" style={{ color: "#8E8E93" }}>Loading messages...</div>
      )}

      {!isLoading && threadList.length === 0 && (
        <div className="text-center py-16" style={{ color: "#8E8E93" }}>
          <MessageSquare className="w-10 h-10 mx-auto mb-3" strokeWidth={1} style={{ color: "#D1D1D6" }} />
          <p className="text-sm">No messages yet.</p>
          <p className="text-xs mt-1">Click "New Message" to start a conversation.</p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {threadList.map(({ email, latest, unread }) => (
          <button
            key={email}
            onClick={() => setSelectedThread(email)}
            className="w-full text-left"
            style={{
              background: "#FFF",
              border: `1px solid ${unread > 0 ? "#4A90E2" : "#D1D1D6"}`,
              borderRadius: "8px",
              padding: "16px 18px",
              cursor: "pointer",
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-sm truncate" style={{ color: "#1E1E1E" }}>{email}</p>
                  {unread > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#4A90E2", color: "#FFF", minWidth: "18px", textAlign: "center" }}>
                      {unread}
                    </span>
                  )}
                </div>
                <p className="text-xs truncate" style={{ color: "#8E8E93" }}>
                  {latest.subject ? `${latest.subject}: ` : ""}{latest.body}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs" style={{ color: "#8E8E93" }}>
                  {new Date(latest.created_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
                <ChevronRight className="w-4 h-4" style={{ color: "#D1D1D6" }} strokeWidth={1.5} />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}