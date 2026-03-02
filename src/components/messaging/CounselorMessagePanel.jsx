import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, ChevronLeft } from "lucide-react";

const MESSAGE_TYPES = [
  { value: "check_in", label: "Check-In" },
  { value: "compliance_update", label: "Compliance Update" },
  { value: "appointment_reminder", label: "Appointment Reminder" },
  { value: "document_request", label: "Document Request" },
  { value: "progress_note", label: "Progress Note" },
  { value: "general_message", label: "General Message" },
];

const STATUS_TAGS = [
  { value: "", label: "No Tag" },
  { value: "required", label: "Required" },
  { value: "informational", label: "Informational" },
  { value: "follow_up", label: "Follow-Up" },
];

const TAG_COLORS = {
  required: { bg: "#FEE2E2", color: "#EF4444" },
  informational: { bg: "#EFF6FF", color: "#3B82F6" },
  follow_up: { bg: "#FEF3C7", color: "#D97706" },
};

const TYPE_LABEL = Object.fromEntries(MESSAGE_TYPES.map((t) => [t.value, t.label]));

function MessageRow({ msg }) {
  const tag = msg.status_tag;
  const tagStyle = tag ? TAG_COLORS[tag] : null;
  return (
    <div style={{ background: "#FFF", border: "1px solid #E5E7EB", borderRadius: "6px", padding: "16px", marginBottom: "10px" }}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold px-2 py-0.5 rounded" style={{ background: "#F0F4FA", color: "#4A90E2" }}>
            {TYPE_LABEL[msg.message_type] || msg.message_type}
          </span>
          {tagStyle && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded uppercase" style={{ background: tagStyle.bg, color: tagStyle.color }}>
              {tag.replace("_", " ")}
            </span>
          )}
          {msg.required_response && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded uppercase" style={{ background: "#FFF7ED", color: "#EA580C" }}>
              Response Required
            </span>
          )}
        </div>
        <span className="text-xs whitespace-nowrap" style={{ color: "#8E8E93" }}>
          {new Date(msg.created_date).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
        </span>
      </div>

      {msg.subject && (
        <p className="text-sm font-semibold mb-1" style={{ color: "#1E1E1E" }}>{msg.subject}</p>
      )}
      <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "#374151" }}>{msg.body}</p>

      <p className="text-xs mt-2" style={{ color: "#8E8E93" }}>
        From: {msg.sender_email} ({msg.sender_role?.replace("_", " ")})
        {msg.is_read ? " · Read" : " · Unread"}
      </p>
    </div>
  );
}

export default function CounselorMessagePanel({
  counselorEmail,
  facilityId,
  participants,
  initialPatient,
  channel,
  senderRole = "counselor",
  receiverRole = "patient",
}) {
  const queryClient = useQueryClient();
  const [selectedEmail, setSelectedEmail] = useState(initialPatient?.participant_email || "");
  const [form, setForm] = useState({
    message_type: "general_message",
    subject: "",
    body: "",
    status_tag: "",
    required_response: false,
  });

  useEffect(() => {
    if (initialPatient?.participant_email) setSelectedEmail(initialPatient.participant_email);
  }, [initialPatient]);

  const { data: messages = [] } = useQuery({
    queryKey: ["messages-thread", channel, selectedEmail],
    queryFn: async () => {
      const all = await base44.entities.Message.filter({ channel, receiver_email: selectedEmail });
      return all.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
    enabled: !!selectedEmail,
    refetchInterval: 20000,
  });

  const sendMutation = useMutation({
    mutationFn: async () => {
      return await base44.entities.Message.create({
        sender_email: counselorEmail,
        sender_role: senderRole,
        receiver_email: selectedEmail,
        receiver_role: receiverRole,
        channel,
        message_type: form.message_type,
        subject: form.subject.trim(),
        body: form.body.trim(),
        status_tag: form.status_tag || undefined,
        required_response: form.required_response,
        is_read: false,
        facility_id: facilityId || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["messages-thread"]);
      setForm({ message_type: "general_message", subject: "", body: "", status_tag: "", required_response: false });
    },
  });

  const recipientList = participants.map((p) => p.participant_email);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Recipient Selector */}
      <div style={{ background: "#FFF", border: "1px solid #D1D1D6", borderRadius: "8px", padding: "20px" }}>
        <label className="text-xs uppercase tracking-wide font-semibold block mb-2" style={{ color: "#8E8E93" }}>
          Select Recipient
        </label>
        <select
          value={selectedEmail}
          onChange={(e) => setSelectedEmail(e.target.value)}
          className="w-full px-3 py-2 text-sm"
          style={{ background: "#F7F7F8", border: "1px solid #D1D1D6", borderRadius: "6px", color: "#1E1E1E" }}
        >
          <option value="">— Select a patient/client —</option>
          {recipientList.map((email) => (
            <option key={email} value={email}>{email}</option>
          ))}
        </select>
      </div>

      {/* Compose */}
      {selectedEmail && (
        <div style={{ background: "#FFF", border: "1px solid #D1D1D6", borderRadius: "8px", padding: "20px" }}>
          <p className="text-xs uppercase tracking-wide font-semibold mb-4" style={{ color: "#8E8E93" }}>New Message</p>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "#5A5A5A" }}>Message Type *</label>
                <select
                  value={form.message_type}
                  onChange={(e) => setForm({ ...form, message_type: e.target.value })}
                  className="w-full px-3 py-2 text-sm"
                  style={{ background: "#F7F7F8", border: "1px solid #D1D1D6", borderRadius: "6px", color: "#1E1E1E" }}
                >
                  {MESSAGE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "#5A5A5A" }}>Status Tag</label>
                <select
                  value={form.status_tag}
                  onChange={(e) => setForm({ ...form, status_tag: e.target.value })}
                  className="w-full px-3 py-2 text-sm"
                  style={{ background: "#F7F7F8", border: "1px solid #D1D1D6", borderRadius: "6px", color: "#1E1E1E" }}
                >
                  {STATUS_TAGS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "#5A5A5A" }}>Subject *</label>
              <input
                type="text"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="Brief subject line"
                className="w-full px-3 py-2 text-sm"
                style={{ background: "#F7F7F8", border: "1px solid #D1D1D6", borderRadius: "6px", color: "#1E1E1E" }}
              />
            </div>

            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "#5A5A5A" }}>Message Body *</label>
              <textarea
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                placeholder="Write your message here..."
                rows={5}
                className="w-full px-3 py-2 text-sm"
                style={{ background: "#F7F7F8", border: "1px solid #D1D1D6", borderRadius: "6px", color: "#1E1E1E", resize: "vertical" }}
              />
            </div>

            <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "#1E1E1E" }}>
              <input
                type="checkbox"
                checked={form.required_response}
                onChange={(e) => setForm({ ...form, required_response: e.target.checked })}
              />
              Requires Response
            </label>

            <button
              onClick={() => sendMutation.mutate()}
              disabled={!form.subject.trim() || !form.body.trim() || sendMutation.isPending}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded"
              style={{
                background: !form.subject.trim() || !form.body.trim() ? "#E5E7EB" : "#4A90E2",
                color: !form.subject.trim() || !form.body.trim() ? "#9CA3AF" : "#FFF",
                border: "none",
                cursor: !form.subject.trim() || !form.body.trim() ? "not-allowed" : "pointer",
                borderRadius: "6px",
              }}
            >
              <Send className="w-4 h-4" strokeWidth={1.5} />
              {sendMutation.isPending ? "Sending..." : "Send Message"}
            </button>
          </div>
        </div>
      )}

      {/* Message History */}
      {selectedEmail && (
        <div>
          <p className="text-xs uppercase tracking-wide font-semibold mb-3" style={{ color: "#8E8E93" }}>
            Message History — {selectedEmail}
          </p>
          {messages.length === 0 ? (
            <div className="text-center py-10 text-sm" style={{ color: "#8E8E93" }}>No messages sent yet.</div>
          ) : (
            messages.map((msg) => <MessageRow key={msg.id} msg={msg} />)
          )}
        </div>
      )}
    </div>
  );
}