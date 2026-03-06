import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, Calendar, Zap, BookOpen, MessageSquare } from "lucide-react";

const MESSAGE_TEMPLATES = {
  appointment_reminder: [
    {
      label: "Upcoming Appointment",
      subject: "Upcoming Appointment Reminder",
      body: "This is a reminder that you have an upcoming appointment scheduled. Please make sure to attend and contact us if you need to reschedule.",
    },
    {
      label: "Drug Test Reminder",
      subject: "Scheduled Drug Test Reminder",
      body: "You have a scheduled drug test coming up. Please arrive on time and bring your ID.",
    },
    {
      label: "Court Date Reminder",
      subject: "Court Date Reminder",
      body: "Your upcoming court date is approaching. Please ensure you have all required documentation ready and arrive on time.",
    },
  ],
  motivational: [
    {
      label: "Daily Encouragement",
      subject: "You're Doing Great",
      body: "I just wanted to reach out and let you know how proud I am of the progress you've been making. Every day you show up is a step forward. Keep going — you've got this!",
    },
    {
      label: "Sobriety Milestone",
      subject: "Celebrating Your Milestone",
      body: "I wanted to take a moment to acknowledge your sobriety milestone. This is a significant achievement, and it reflects the hard work and dedication you've put into your recovery journey. We're here cheering you on!",
    },
    {
      label: "Tough Day Support",
      subject: "Here For You",
      body: "Recovery isn't always easy, and I want you to know that having a tough day doesn't mean you're failing. Reach out anytime — I'm here to support you through the difficult moments.",
    },
  ],
  resource_share: [
    {
      label: "Crisis Hotline",
      subject: "Important Resources for You",
      body: "I wanted to share some important resources:\n\n• SAMHSA Helpline: 1-800-662-4357 (free, confidential, 24/7)\n• Crisis Text Line: Text HOME to 741741\n• NA Meeting Finder: www.na.org\n\nDon't hesitate to reach out for help whenever you need it.",
    },
    {
      label: "Housing Resources",
      subject: "Housing Assistance Resources",
      body: "Here are some housing resources that may be helpful:\n\n• Local shelter directory: 211.org\n• Transitional housing programs in your area\n• HUD Emergency Housing Vouchers\n\nPlease let me know if you'd like help navigating any of these options.",
    },
    {
      label: "Employment Support",
      subject: "Employment & Job Training Resources",
      body: "I wanted to share some employment resources that can help with your reintegration:\n\n• American Job Centers: careeronestop.org\n• Local workforce development programs\n• Reentry employment assistance\n\nLet's schedule a time to talk through your career goals.",
    },
  ],
  general_message: [],
  check_in: [
    {
      label: "Check-In Request",
      subject: "Checking In On You",
      body: "Hi, I'm just checking in to see how you're doing. Please take a moment to complete your daily check-in in the app, and don't hesitate to reach out if you need anything.",
    },
  ],
};

const QUICK_TYPES = [
  { id: "general_message", label: "Direct Message", icon: MessageSquare, color: "#4A90E2" },
  { id: "appointment_reminder", label: "Appointment Reminder", icon: Calendar, color: "#3B82F6" },
  { id: "motivational", label: "Motivational", icon: Zap, color: "#22C55E" },
  { id: "resource_share", label: "Share Resource", icon: BookOpen, color: "#8B5CF6" },
];

const STATUS_TAGS = [
  { value: "", label: "No Tag" },
  { value: "required", label: "Required Action" },
  { value: "informational", label: "Informational" },
  { value: "follow_up", label: "Follow-Up Needed" },
];

export default function ComposeMessage({
  senderEmail,
  senderRole = "counselor",
  facilityId,
  participants,
  initialRecipient,
  onSent,
}) {
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState("general_message");
  const [form, setForm] = useState({
    receiver_email: initialRecipient || "",
    subject: "",
    body: "",
    status_tag: "",
    required_response: false,
  });

  const templates = MESSAGE_TEMPLATES[selectedType] || [];

  const applyTemplate = (tpl) => {
    setForm((f) => ({ ...f, subject: tpl.subject, body: tpl.body }));
  };

  const sendMutation = useMutation({
    mutationFn: () =>
      base44.entities.Message.create({
        sender_email: senderEmail,
        sender_role: senderRole,
        receiver_email: form.receiver_email,
        receiver_role: "patient",
        channel: "counselor_patient",
        message_type: selectedType,
        subject: form.subject.trim(),
        body: form.body.trim(),
        status_tag: form.status_tag || undefined,
        required_response: form.required_response,
        is_read: false,
        facility_id: facilityId || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["all-messages"]);
      onSent?.();
    },
  });

  const canSend = form.receiver_email && form.subject.trim() && form.body.trim() && !sendMutation.isPending;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Message Type Picker */}
      <div style={{ background: "#FFF", border: "1px solid #D1D1D6", borderRadius: "8px", padding: "20px" }}>
        <p className="text-xs uppercase tracking-wide font-semibold mb-3" style={{ color: "#8E8E93" }}>Message Type</p>
        <div className="grid grid-cols-2 gap-2">
          {QUICK_TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedType(t.id)}
              className="flex items-center gap-2 px-3 py-2.5 rounded text-sm font-medium text-left"
              style={{
                background: selectedType === t.id ? t.color : "#F7F7F8",
                color: selectedType === t.id ? "#FFF" : "#5A5A5A",
                border: selectedType === t.id ? "none" : "1px solid #D1D1D6",
              }}
            >
              <t.icon className="w-4 h-4 shrink-0" strokeWidth={1.5} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Templates */}
      {templates.length > 0 && (
        <div style={{ background: "#FFF", border: "1px solid #D1D1D6", borderRadius: "8px", padding: "20px" }}>
          <p className="text-xs uppercase tracking-wide font-semibold mb-3" style={{ color: "#8E8E93" }}>Quick Templates</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {templates.map((tpl) => (
              <button
                key={tpl.label}
                onClick={() => applyTemplate(tpl)}
                className="text-left px-3 py-2.5 rounded text-sm"
                style={{ background: "#F7F7F8", border: "1px solid #E5E7EB", color: "#1E1E1E" }}
              >
                <p className="font-medium text-sm">{tpl.label}</p>
                <p className="text-xs mt-0.5 truncate" style={{ color: "#8E8E93" }}>{tpl.subject}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Compose Form */}
      <div style={{ background: "#FFF", border: "1px solid #D1D1D6", borderRadius: "8px", padding: "20px" }}>
        <p className="text-xs uppercase tracking-wide font-semibold mb-4" style={{ color: "#8E8E93" }}>Compose</p>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: "#5A5A5A" }}>Recipient *</label>
            <select
              value={form.receiver_email}
              onChange={(e) => setForm({ ...form, receiver_email: e.target.value })}
              className="w-full px-3 py-2 text-sm"
              style={{ background: "#F7F7F8", border: "1px solid #D1D1D6", borderRadius: "6px", color: "#1E1E1E" }}
            >
              <option value="">— Select recipient —</option>
              {participants.map((p) => (
                <option key={p.participant_email} value={p.participant_email}>{p.participant_email}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
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
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "#1E1E1E" }}>
                <input
                  type="checkbox"
                  checked={form.required_response}
                  onChange={(e) => setForm({ ...form, required_response: e.target.checked })}
                />
                Requires Response
              </label>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: "#5A5A5A" }}>Subject *</label>
            <input
              type="text"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="Message subject"
              className="w-full px-3 py-2 text-sm"
              style={{ background: "#F7F7F8", border: "1px solid #D1D1D6", borderRadius: "6px", color: "#1E1E1E" }}
            />
          </div>

          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: "#5A5A5A" }}>Message *</label>
            <textarea
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              placeholder="Write your message..."
              rows={6}
              className="w-full px-3 py-2 text-sm"
              style={{ background: "#F7F7F8", border: "1px solid #D1D1D6", borderRadius: "6px", color: "#1E1E1E", resize: "vertical" }}
            />
          </div>

          <button
            onClick={() => sendMutation.mutate()}
            disabled={!canSend}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded"
            style={{
              background: canSend ? "#4A90E2" : "#E5E7EB",
              color: canSend ? "#FFF" : "#9CA3AF",
              border: "none",
              cursor: canSend ? "pointer" : "not-allowed",
            }}
          >
            <Send className="w-4 h-4" strokeWidth={1.5} />
            {sendMutation.isPending ? "Sending..." : "Send Message"}
          </button>

          {sendMutation.isError && (
            <p className="text-xs text-red-500">Failed to send. Please try again.</p>
          )}
        </div>
      </div>
    </div>
  );
}