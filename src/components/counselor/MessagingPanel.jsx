import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Send, MessageSquare, X, Clock, CheckCircle2, Bell, CalendarClock, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const TABS = [
  { id: "message", label: "Messages", icon: MessageSquare },
  { id: "notification", label: "Notifications", icon: Bell },
  { id: "reminder", label: "Reminders", icon: CalendarClock },
];

const TYPE_STYLES = {
  message: { color: "var(--primary)", bg: "rgba(74,144,226,0.08)", badge: "#4A90E2", label: "MESSAGE" },
  notification: { color: "#F59E0B", bg: "rgba(245,158,11,0.08)", badge: "#F59E0B", label: "ALERT" },
  reminder: { color: "#7B5CF0", bg: "rgba(123,92,240,0.08)", badge: "#7B5CF0", label: "REMINDER" },
};

function MessageBubble({ msg }) {
  const style = TYPE_STYLES[msg.message_type] || TYPE_STYLES.message;
  const isScheduled = msg.scheduled_for && !msg.is_delivered;
  const scheduledDate = msg.scheduled_for ? new Date(msg.scheduled_for) : null;

  return (
    <div
      className="p-4 rounded-lg"
      style={{
        background: isScheduled ? "#F9FAFB" : style.bg,
        border: `1px solid ${isScheduled ? "var(--border)" : style.color}22`,
        opacity: isScheduled ? 0.75 : 1,
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: style.badge + "22", color: style.badge }}
          >
            {style.label}
          </span>
          {msg.notification_title && (
            <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
              {msg.notification_title}
            </span>
          )}
          {isScheduled && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: "#F3F4F6", color: "#6B7280" }}>
              SCHEDULED
            </span>
          )}
          {msg.is_read && !isScheduled && (
            <CheckCircle2 className="w-3 h-3" style={{ color: "#22C55E" }} strokeWidth={2} />
          )}
        </div>
        <div className="flex items-center gap-1 text-xs whitespace-nowrap" style={{ color: "var(--text-muted)" }}>
          <Clock className="w-3 h-3" strokeWidth={1.5} />
          {isScheduled
            ? `Sends ${scheduledDate.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}`
            : new Date(msg.created_date).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
          }
        </div>
      </div>

      <p className="text-sm whitespace-pre-wrap" style={{ color: "var(--text-primary)" }}>
        {msg.message}
      </p>

      {msg.read_at && (
        <p className="text-[11px] mt-2" style={{ color: "var(--text-muted)" }}>
          Read {new Date(msg.read_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
        </p>
      )}
    </div>
  );
}

export default function MessagingPanel({ participant, counselorEmail, facilityId, onClose }) {
  const [activeTab, setActiveTab] = useState(participant._openTab || "message");
  const [messageContent, setMessageContent] = useState("");
  const [notifTitle, setNotifTitle] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const bottomRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: messages = [] } = useQuery({
    queryKey: ["counselor-messages", participant.participant_email],
    queryFn: async () => {
      const all = await base44.entities.CounselorMessage.filter({
        facility_id: facilityId,
        participant_email: participant.participant_email,
      });
      return all.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    },
    enabled: !!participant && !!facilityId,
    refetchInterval: 15000,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMutation = useMutation({
    mutationFn: async ({ content, type, title, scheduled }) => {
      const payload = {
        facility_id: facilityId,
        counselor_email: counselorEmail,
        participant_email: participant.participant_email,
        message: content,
        message_type: type,
        is_read: false,
        is_delivered: !scheduled,
      };
      if (title) payload.notification_title = title;
      if (scheduled) payload.scheduled_for = new Date(scheduled).toISOString();
      return await base44.entities.CounselorMessage.create(payload);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries(["counselor-messages"]);
      setMessageContent("");
      setNotifTitle("");
      setScheduledFor("");
      const label = vars.scheduled ? "Reminder scheduled" : vars.type === "notification" ? "Notification sent" : "Message sent";
      toast.success(label);
    },
  });

  const handleSend = () => {
    if (!messageContent.trim()) return;
    sendMutation.mutate({
      content: messageContent.trim(),
      type: activeTab,
      title: notifTitle.trim() || undefined,
      scheduled: activeTab === "reminder" && scheduledFor ? scheduledFor : undefined,
    });
  };

  const tabMessages = messages.filter(m => (m.message_type || "message") === activeTab);
  const unreadTotal = messages.filter(m => !m.is_read && m.is_delivered !== false).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl flex flex-col"
        style={{
          background: "var(--bg-secondary)",
          borderRadius: "12px",
          maxHeight: "85vh",
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5" style={{ color: "var(--primary)" }} strokeWidth={1.5} />
            <div>
              <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                {participant.participant_email}
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {unreadTotal > 0 ? `${unreadTotal} unread` : "All messages read"}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="w-4 h-4" strokeWidth={1.5} />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex" style={{ borderBottom: "1px solid var(--border)" }}>
          {TABS.map(tab => {
            const count = messages.filter(m => (m.message_type || "message") === tab.id && !m.is_read && m.is_delivered !== false).length;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium relative"
                style={{
                  color: activeTab === tab.id ? "var(--primary)" : "var(--text-muted)",
                  borderBottom: activeTab === tab.id ? "2px solid var(--primary)" : "2px solid transparent",
                  background: "none",
                }}
              >
                <tab.icon className="w-3.5 h-3.5" strokeWidth={1.5} />
                {tab.label}
                {count > 0 && (
                  <span className="w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center"
                    style={{ background: "var(--primary)", color: "#fff" }}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Message History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: "var(--bg-primary)" }}>
          {tabMessages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                No {activeTab === "message" ? "messages" : activeTab === "notification" ? "notifications" : "reminders"} yet
              </p>
            </div>
          ) : (
            tabMessages.map(msg => <MessageBubble key={msg.id} msg={msg} />)
          )}
          <div ref={bottomRef} />
        </div>

        {/* Compose Area */}
        <div className="p-4" style={{ borderTop: "1px solid var(--border)" }}>
          {activeTab === "notification" && (
            <Input
              placeholder="Alert title (e.g. Appointment Reminder)"
              value={notifTitle}
              onChange={(e) => setNotifTitle(e.target.value)}
              className="mb-2 text-sm"
              style={{ background: "var(--bg-primary)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}
            />
          )}

          {activeTab === "reminder" && (
            <div className="mb-2">
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-secondary)" }}>
                Schedule for (leave blank to send now)
              </label>
              <input
                type="datetime-local"
                value={scheduledFor}
                onChange={(e) => setScheduledFor(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded"
                style={{
                  background: "var(--bg-primary)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
          )}

          <Textarea
            placeholder={
              activeTab === "message" ? "Type a message..." :
              activeTab === "notification" ? "Alert or announcement text..." :
              "Reminder content..."
            }
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSend(); }}
            rows={3}
            className="mb-3"
            style={{
              background: "var(--bg-primary)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              color: "var(--text-primary)",
            }}
          />

          <div className="flex items-center justify-between">
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {activeTab === "reminder" && scheduledFor
                ? `Will be delivered ${new Date(scheduledFor).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}`
                : "Ctrl+Enter to send"}
            </p>
            <Button
              onClick={handleSend}
              disabled={!messageContent.trim() || sendMutation.isPending}
              className="btn-primary"
            >
              <Send className="w-4 h-4 mr-2" strokeWidth={1.5} />
              {sendMutation.isPending ? "Sending..." :
                activeTab === "reminder" && scheduledFor ? "Schedule" : "Send"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}