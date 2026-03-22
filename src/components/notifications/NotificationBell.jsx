import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, X, CheckCheck, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const PRIORITY_COLORS = {
  urgent: "#EF4444",
  high:   "#F59E0B",
  medium: "#3ECFBF",
  low:    "rgba(255,255,255,0.3)",
};

const TYPE_ICONS = {
  checkin_reminder:       "📅",
  missed_checkin:         "⚠️",
  risk_alert:             "🔴",
  appointment_reminder:   "🗓️",
  goal_reminder:          "🎯",
  discharge_activation:   "🌅",
  weekly_summary:         "📊",
  inactivity_nudge:       "💙",
  resource_recommendation:"🗺️",
  milestone_celebration:  "🏆",
  staff_alert:            "🚨",
  moderation_flag:        "🛡️",
  consent_reminder:       "📋",
  general:                "💬",
};

export default function NotificationBell({ user }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications", user?.email],
    queryFn: () => base44.entities.InAppNotification.filter({
      recipient_email: user.email,
      dismissed: false,
    }, "-created_date", 30),
    enabled: !!user?.email,
    refetchInterval: 60_000,
  });

  const unread = notifications.filter(n => !n.is_read);

  const markReadMutation = useMutation({
    mutationFn: (id) => base44.entities.InAppNotification.update(id, { is_read: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications", user?.email] }),
  });

  const dismissMutation = useMutation({
    mutationFn: (id) => base44.entities.InAppNotification.update(id, { dismissed: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications", user?.email] }),
  });

  const markAllRead = async () => {
    await Promise.all(unread.map(n => markReadMutation.mutateAsync(n.id)));
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div style={{ position: "relative" }} ref={panelRef}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: "relative", background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12,
          padding: "8px 10px", cursor: "pointer", display: "flex", alignItems: "center",
        }}
      >
        <Bell style={{ width: 18, height: 18, color: unread.length > 0 ? "#3ECFBF" : "rgba(255,255,255,0.5)" }} />
        {unread.length > 0 && (
          <span style={{
            position: "absolute", top: 4, right: 4,
            width: 16, height: 16, borderRadius: "50%",
            background: "#EF4444", color: "#fff",
            fontSize: 9, fontWeight: 900,
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "2px solid #0B1220",
          }}>
            {unread.length > 9 ? "9+" : unread.length}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: "absolute", right: 0, top: "calc(100% + 8px)",
          width: 340, maxHeight: 480,
          background: "#111827", border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 16, overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          zIndex: 1000,
        }}>
          {/* Header */}
          <div style={{
            padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <p style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>
              Notifications {unread.length > 0 && <span style={{ color: "#3ECFBF" }}>({unread.length})</span>}
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              {unread.length > 0 && (
                <button onClick={markAllRead} style={{
                  display: "flex", alignItems: "center", gap: 4,
                  background: "none", border: "none", color: "#3ECFBF",
                  fontSize: 12, fontWeight: 700, cursor: "pointer",
                }}>
                  <CheckCheck style={{ width: 13, height: 13 }} /> Mark all read
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div style={{ overflowY: "auto", maxHeight: 400 }}>
            {notifications.length === 0 ? (
              <div style={{ padding: "40px 20px", textAlign: "center" }}>
                <p style={{ fontSize: 28, marginBottom: 8 }}>🔔</p>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>You're all caught up!</p>
              </div>
            ) : notifications.map(n => (
              <div key={n.id} style={{
                padding: "12px 16px",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                background: n.is_read ? "transparent" : "rgba(62,207,191,0.04)",
                display: "flex", gap: 12, alignItems: "flex-start",
              }}>
                <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>
                  {TYPE_ICONS[n.type] || "💬"}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                    <p style={{
                      fontSize: 13, fontWeight: n.is_read ? 500 : 700,
                      color: n.is_read ? "rgba(255,255,255,0.6)" : "#fff",
                      lineHeight: 1.3, marginBottom: 3,
                    }}>{n.title}</p>
                    <button
                      onClick={() => dismissMutation.mutate(n.id)}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 2, flexShrink: 0 }}>
                      <X style={{ width: 12, height: 12, color: "rgba(255,255,255,0.2)" }} />
                    </button>
                  </div>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.45, marginBottom: 8 }}>
                    {n.body}
                  </p>
                  {n.action_url && n.action_label && (
                    <Link
                      to={n.action_url}
                      onClick={() => { markReadMutation.mutate(n.id); setOpen(false); }}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 4,
                        fontSize: 12, fontWeight: 700,
                        color: PRIORITY_COLORS[n.priority] || "#3ECFBF",
                        textDecoration: "none",
                      }}
                    >
                      {n.action_label} <ChevronRight style={{ width: 11, height: 11 }} />
                    </Link>
                  )}
                </div>
                {!n.is_read && (
                  <div style={{
                    width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
                    background: PRIORITY_COLORS[n.priority] || "#3ECFBF", marginTop: 5,
                  }} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}