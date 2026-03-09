import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageSquare, Bell, CalendarClock, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const TABS = [
  { id: "message", label: "Messages", icon: MessageSquare },
  { id: "notification", label: "Alerts", icon: Bell },
  { id: "reminder", label: "Reminders", icon: CalendarClock },
];

const TYPE_STYLES = {
  message: { color: "var(--primary)", bg: "rgba(74,144,226,0.06)", badge: "#4A90E2", label: "MESSAGE" },
  notification: { color: "#F59E0B", bg: "rgba(245,158,11,0.06)", badge: "#F59E0B", label: "ALERT" },
  reminder: { color: "#7B5CF0", bg: "rgba(123,92,240,0.06)", badge: "#7B5CF0", label: "REMINDER" },
};

export default function CounselorMessages({ participantEmail, facilityId }) {
  const [activeTab, setActiveTab] = useState("message");
  const queryClient = useQueryClient();

  const { data: messages = [] } = useQuery({
    queryKey: ["participant-messages", participantEmail],
    queryFn: async () => {
      const all = await base44.entities.CounselorMessage.filter({
        facility_id: facilityId,
        participant_email: participantEmail,
      });
      // Only show delivered messages
      return all
        .filter(m => m.is_delivered !== false)
        .sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
    enabled: !!participantEmail && !!facilityId,
    refetchInterval: 30000,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (messageId) => {
      return await base44.entities.CounselorMessage.update(messageId, {
        is_read: true,
        read_at: new Date().toISOString(),
      });
    },
    onSuccess: () => queryClient.invalidateQueries(["participant-messages"]),
  });

  const tabMessages = messages.filter(m => (m.message_type || "message") === activeTab);
  const unreadTotal = messages.filter(m => !m.is_read).length;

  if (messages.length === 0) return null;

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5" style={{ color: "var(--primary)" }} strokeWidth={1.5} />
        <h3>Your Support Team</h3>
        {unreadTotal > 0 && (
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: "var(--primary)", color: "#fff" }}
          >
            {unreadTotal} new
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4" style={{ borderBottom: "1px solid var(--border)" }}>
        {TABS.map(tab => {
          const count = messages.filter(m => (m.message_type || "message") === tab.id && !m.is_read).length;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium"
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

      {/* Messages */}
      <div className="space-y-3">
        {tabMessages.length === 0 ? (
          <p className="text-sm text-center py-6" style={{ color: "var(--text-muted)" }}>
            No {activeTab === "message" ? "messages" : activeTab === "notification" ? "alerts" : "reminders"} yet
          </p>
        ) : (
          tabMessages.map(msg => {
            const style = TYPE_STYLES[msg.message_type || "message"];
            return (
              <div
                key={msg.id}
                className="p-4 rounded-lg"
                style={{
                  background: msg.is_read ? "var(--bg-primary)" : style.bg,
                  border: `1px solid ${msg.is_read ? "var(--border)" : style.color + "44"}`,
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
                    {msg.is_read && (
                      <CheckCircle2 className="w-3 h-3" style={{ color: "#22C55E" }} strokeWidth={2} />
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs whitespace-nowrap" style={{ color: "var(--text-muted)" }}>
                    <Clock className="w-3 h-3" strokeWidth={1.5} />
                    {new Date(msg.created_date).toLocaleString("en-US", {
                      month: "short", day: "numeric", hour: "numeric", minute: "2-digit"
                    })}
                  </div>
                </div>

                <p className="text-sm whitespace-pre-wrap" style={{ color: "var(--text-primary)" }}>
                  {msg.message}
                </p>

                {!msg.is_read && (
                  <Button
                    onClick={() => markAsReadMutation.mutate(msg.id)}
                    size="sm"
                    className="btn-secondary text-xs mt-3"
                  >
                    Mark as Read
                  </Button>
                )}

                {msg.read_at && (
                  <p className="text-[11px] mt-2" style={{ color: "var(--text-muted)" }}>
                    Read {new Date(msg.read_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}