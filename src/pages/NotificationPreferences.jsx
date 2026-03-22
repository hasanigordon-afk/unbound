import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

const SECTIONS = [
  {
    label: "Recovery & Accountability",
    items: [
      { key: "checkin_reminders",      label: "Daily Check-In Reminders",         sub: "Daily nudge to complete your check-in" },
      { key: "missed_checkin_alerts",  label: "Missed Check-In Follow-Up",         sub: "Gentle reminder if you miss a few days" },
      { key: "goal_reminders",         label: "Goal & Task Reminders",             sub: "Updates on your recovery plan items" },
      { key: "milestone_celebrations", label: "Milestone Celebrations",            sub: "Celebrate streaks, sobriety dates, and wins" },
    ],
  },
  {
    label: "Care & Appointments",
    items: [
      { key: "appointment_reminders",  label: "Appointment Reminders",            sub: "24h and same-day reminders for sessions" },
      { key: "weekly_summary",         label: "Weekly Progress Summary",          sub: "Your weekly recap every Sunday" },
    ],
  },
  {
    label: "Support & Resources",
    items: [
      { key: "inactivity_nudges",       label: "Re-Engagement Nudges",           sub: "A gentle check-in if you haven't been active" },
      { key: "resource_recommendations",label: "Resource Recommendations",        sub: "Housing, jobs, food, and local services" },
    ],
  },
];

function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        width: 44, height: 24, borderRadius: 12, flexShrink: 0,
        background: value ? "#3ECFBF" : "rgba(255,255,255,0.12)",
        border: "none", cursor: "pointer", position: "relative",
        transition: "background 0.2s ease",
      }}
    >
      <div style={{
        position: "absolute", top: 2, width: 20, height: 20, borderRadius: "50%",
        background: "#fff", transition: "left 0.2s ease",
        left: value ? 22 : 2,
        boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
      }} />
    </button>
  );
}

export default function NotificationPreferences() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: existing, isLoading } = useQuery({
    queryKey: ["notif-prefs", user?.email],
    queryFn: async () => {
      const rows = await base44.entities.NotificationPreference.filter({ user_email: user.email });
      return rows[0] || null;
    },
    enabled: !!user?.email,
  });

  const [prefs, setPrefs] = useState(null);

  React.useEffect(() => {
    if (existing !== undefined) {
      setPrefs(existing || {
        user_email: user?.email,
        checkin_reminders: true,
        checkin_reminder_time: "09:00",
        missed_checkin_alerts: true,
        appointment_reminders: true,
        goal_reminders: true,
        weekly_summary: true,
        milestone_celebrations: true,
        resource_recommendations: true,
        inactivity_nudges: true,
        channel_in_app: true,
        channel_email: false,
        channel_sms: false,
        quiet_hours_start: "21:00",
        quiet_hours_end: "08:00",
      });
    }
  }, [existing, user]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (existing?.id) {
        return base44.entities.NotificationPreference.update(existing.id, prefs);
      }
      return base44.entities.NotificationPreference.create({ ...prefs, user_email: user.email });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notif-prefs", user?.email] });
      navigate(-1);
    },
  });

  const set = (key, val) => setPrefs(p => ({ ...p, [key]: val }));

  if (isLoading || !prefs) return (
    <div style={{ minHeight: "100vh", background: "#0B1220", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Loader2 style={{ color: "#3ECFBF", width: 28, height: 28 }} className="animate-spin" />
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0B1220", paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "52px 20px 16px", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
          <ArrowLeft style={{ color: "rgba(255,255,255,0.5)", width: 20, height: 20 }} />
        </button>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#3ECFBF", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 2 }}>Settings</p>
          <h1 style={{ fontSize: 20, fontWeight: 900, color: "#fff" }}>Notification Preferences</h1>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "20px 16px" }}>

        {/* Delivery Channels */}
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "16px 20px", marginBottom: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 14 }}>Delivery Channels</p>
          {[
            { key: "channel_in_app", label: "In-App Notifications", sub: "Show in notification bell (recommended)" },
            { key: "channel_email",  label: "Email Notifications",  sub: "Critical alerts and weekly summaries" },
          ].map(c => (
            <div key={c.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 14, marginBottom: 14, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{c.label}</p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{c.sub}</p>
              </div>
              <Toggle value={!!prefs[c.key]} onChange={v => set(c.key, v)} />
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.4)" }}>SMS (coming soon)</p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", marginTop: 2 }}>Text message reminders</p>
            </div>
            <Toggle value={false} onChange={() => {}} />
          </div>
        </div>

        {/* Notification Types */}
        {SECTIONS.map(section => (
          <div key={section.label} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "16px 20px", marginBottom: 12 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 14 }}>{section.label}</p>
            {section.items.map((item, i) => (
              <div key={item.key} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                paddingBottom: i < section.items.length - 1 ? 14 : 0,
                marginBottom: i < section.items.length - 1 ? 14 : 0,
                borderBottom: i < section.items.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
              }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{item.label}</p>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{item.sub}</p>
                </div>
                <Toggle value={!!prefs[item.key]} onChange={v => set(item.key, v)} />
              </div>
            ))}
          </div>
        ))}

        {/* Quiet Hours */}
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "16px 20px", marginBottom: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 14 }}>Quiet Hours</p>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 14, lineHeight: 1.55 }}>
            No notifications will be sent during quiet hours.
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            {[
              { key: "quiet_hours_start", label: "Start" },
              { key: "quiet_hours_end",   label: "End" },
            ].map(t => (
              <div key={t.key} style={{ flex: 1 }}>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>{t.label}</p>
                <input
                  type="time"
                  value={prefs[t.key] || "21:00"}
                  onChange={e => set(t.key, e.target.value)}
                  style={{
                    width: "100%", background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10,
                    padding: "10px 12px", color: "#fff", fontSize: 14,
                    fontFamily: "inherit", outline: "none",
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          style={{
            width: "100%", padding: "16px", borderRadius: 14,
            background: "linear-gradient(135deg,#3ECFBF,#2CB8AE)",
            border: "none", color: "#fff", fontWeight: 800, fontSize: 16,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
        >
          {saveMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save style={{ width: 16, height: 16 }} /> Save Preferences</>}
        </button>
      </div>
    </div>
  );
}