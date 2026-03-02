import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronRight, ChevronLeft } from "lucide-react";

const TYPE_LABEL = {
  check_in: "Check-In",
  compliance_update: "Compliance Update",
  appointment_reminder: "Appointment Reminder",
  document_request: "Document Request",
  progress_note: "Progress Note",
  general_message: "General Message",
};

const TAG_COLORS = {
  required: { bg: "#FEE2E2", color: "#EF4444" },
  informational: { bg: "#EFF6FF", color: "#3B82F6" },
  follow_up: { bg: "#FEF3C7", color: "#D97706" },
};

export default function PatientInbox({ userEmail }) {
  const [selectedMsg, setSelectedMsg] = useState(null);
  const queryClient = useQueryClient();

  const { data: messages = [] } = useQuery({
    queryKey: ["patient-inbox", userEmail],
    queryFn: async () => {
      const all = await base44.entities.Message.filter({ receiver_email: userEmail });
      return all.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
    enabled: !!userEmail,
    refetchInterval: 30000,
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => base44.entities.Message.update(id, { is_read: true }),
    onSuccess: () => queryClient.invalidateQueries(["patient-inbox"]),
  });

  const unreadCount = messages.filter((m) => !m.is_read).length;

  if (selectedMsg) {
    const tag = selectedMsg.status_tag;
    const tagStyle = tag ? TAG_COLORS[tag] : null;
    return (
      <div>
        <button
          onClick={() => setSelectedMsg(null)}
          className="flex items-center gap-1 text-xs mb-4"
          style={{ color: "#4A90E2", background: "none", border: "none", cursor: "pointer" }}
        >
          <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
          Back to Inbox
        </button>

        <div style={{ background: "#FFF", border: "1px solid #D1D1D6", borderRadius: "8px", padding: "24px" }}>
          {/* Meta */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex flex-wrap gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded" style={{ background: "#F0F4FA", color: "#4A90E2" }}>
                {TYPE_LABEL[selectedMsg.message_type] || selectedMsg.message_type}
              </span>
              {tagStyle && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded uppercase" style={{ background: tagStyle.bg, color: tagStyle.color }}>
                  {tag.replace("_", " ")}
                </span>
              )}
              {selectedMsg.required_response && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded uppercase" style={{ background: "#FFF7ED", color: "#EA580C" }}>
                  Response Required
                </span>
              )}
            </div>
            <span className="text-xs whitespace-nowrap" style={{ color: "#8E8E93" }}>
              {new Date(selectedMsg.created_date).toLocaleString("en-US", {
                month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit"
              })}
            </span>
          </div>

          <p className="text-xs mb-1" style={{ color: "#8E8E93" }}>
            From: <span style={{ color: "#1E1E1E", fontWeight: 600 }}>{selectedMsg.sender_email}</span>
            {" "}({selectedMsg.sender_role?.replace("_", " ")})
          </p>

          <h3 className="text-base font-semibold mt-4 mb-3" style={{ color: "#1E1E1E" }}>{selectedMsg.subject}</h3>
          <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "#374151" }}>{selectedMsg.body}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs uppercase tracking-wide font-semibold" style={{ color: "#8E8E93" }}>
          Inbox
        </p>
        {unreadCount > 0 && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#4A90E2", color: "#FFF" }}>
            {unreadCount} unread
          </span>
        )}
      </div>

      {messages.length === 0 ? (
        <div className="text-center py-16 text-sm" style={{ color: "#8E8E93" }}>
          No messages from your care team yet.
        </div>
      ) : (
        <div style={{ background: "#FFF", border: "1px solid #D1D1D6", borderRadius: "8px", overflow: "hidden" }}>
          {/* Table Header */}
          <div className="grid px-4 py-2.5" style={{
            gridTemplateColumns: "1fr 2fr 120px 80px",
            background: "#F7F7F8",
            borderBottom: "1px solid #E5E7EB",
          }}>
            {["Sender", "Subject", "Date", "Status"].map((h) => (
              <p key={h} className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "#8E8E93" }}>{h}</p>
            ))}
          </div>

          {messages.map((msg, i) => (
            <button
              key={msg.id}
              onClick={() => {
                setSelectedMsg(msg);
                if (!msg.is_read) markReadMutation.mutate(msg.id);
              }}
              className="w-full text-left grid px-4 py-3.5"
              style={{
                gridTemplateColumns: "1fr 2fr 120px 80px",
                borderTop: i > 0 ? "1px solid #F0F0F3" : "none",
                background: msg.is_read ? "transparent" : "#F8FAFF",
                cursor: "pointer",
                alignItems: "center",
              }}
            >
              <p className="text-xs truncate pr-2" style={{ color: "#1E1E1E", fontWeight: msg.is_read ? 400 : 600 }}>
                {msg.sender_email}
              </p>
              <p className="text-xs truncate pr-2" style={{ color: "#1E1E1E", fontWeight: msg.is_read ? 400 : 600 }}>
                {msg.subject || "(No subject)"}
              </p>
              <p className="text-xs" style={{ color: "#8E8E93" }}>
                {new Date(msg.created_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </p>
              <p className="text-[10px] font-semibold uppercase" style={{ color: msg.is_read ? "#8E8E93" : "#4A90E2" }}>
                {msg.is_read ? "Read" : "New"}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}