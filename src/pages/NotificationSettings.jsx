import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Bell, Check, Loader2 } from "lucide-react";

const CATEGORIES = [
  { key: "daily_motivation",      label: "Daily motivation",           desc: "A short encouragement each day" },
  { key: "recovery_motivation",   label: "Recovery reminders",         desc: "Prompts to check in, reach out, or reflect" },
  { key: "community_updates",     label: "Community updates",          desc: "New stories, testimonials, and posts" },
  { key: "milestone_reminders",   label: "Milestone reminders",        desc: "Celebrate your sober days and streaks" },
  { key: "app_updates",           label: "App updates",                desc: "New features and improvements" },
  { key: "campaign_announcements",label: "Campaign announcements",     desc: "Mission news from the recovery campaign" },
  { key: "donation_progress",     label: "Donation campaign progress", desc: "Updates on fundraising and impact" },
  { key: "events_partners",       label: "Events & partner updates",   desc: "Recovery events and partner news" },
];

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      style={{
        width: 44, height: 26, borderRadius: 13, border: "none", cursor: "pointer",
        background: checked ? "#B8823A" : "#E8E2D9",
        position: "relative", transition: "background 0.2s ease",
        flexShrink: 0,
      }}
    >
      <div style={{
        position: "absolute", top: 3, left: checked ? 21 : 3,
        width: 20, height: 20, borderRadius: "50%",
        background: "#fff",
        transition: "left 0.2s ease",
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
      }} />
    </button>
  );
}

export default function NotificationSettings() {
  const qc = useQueryClient();
  const [saved, setSaved] = useState(false);

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: pref, isLoading } = useQuery({
    queryKey: ["notification-pref", user?.email],
    queryFn: async () => {
      const rows = await base44.entities.NotificationPreference.filter({ user_email: user.email });
      return rows[0] || null;
    },
    enabled: !!user?.email,
  });

  const [form, setForm] = useState({
    all_enabled: true,
    daily_motivation: true,
    recovery_motivation: true,
    community_updates: true,
    milestone_reminders: true,
    app_updates: true,
    campaign_announcements: true,
    donation_progress: false,
    events_partners: false,
  });

  useEffect(() => {
    if (pref) {
      setForm({
        all_enabled: pref.all_enabled ?? true,
        daily_motivation: pref.daily_motivation ?? true,
        recovery_motivation: pref.recovery_motivation ?? true,
        community_updates: pref.community_updates ?? true,
        milestone_reminders: pref.milestone_reminders ?? true,
        app_updates: pref.app_updates ?? true,
        campaign_announcements: pref.campaign_announcements ?? true,
        donation_progress: pref.donation_progress ?? false,
        events_partners: pref.events_partners ?? false,
      });
    }
  }, [pref]);

  const saveMutation = useMutation({
    mutationFn: async (patch) => {
      if (pref) return base44.entities.NotificationPreference.update(pref.id, patch);
      return base44.entities.NotificationPreference.create({ user_email: user.email, ...patch, prompt_status: "allowed" });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notification-pref"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  const updateField = (key, value) => {
    const next = { ...form, [key]: value };
    setForm(next);
    saveMutation.mutate(next);
  };

  if (isLoading) {
    return (
      <div style={{ background: "#F7F3EE", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 style={{ width: 24, height: 24, color: "#B8823A" }} className="animate-spin" />
      </div>
    );
  }

  return (
    <div style={{ background: "#F7F3EE", minHeight: "100vh", paddingBottom: 120 }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ padding: "48px 20px 24px", background: "#FDFAF6", borderBottom: "1px solid #E8E2D9" }}>
          <Link to="/Profile" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, color: "#4A3F35", fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
            <ArrowLeft style={{ width: 15, height: 15 }} />
            Back
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
            <Bell style={{ width: 22, height: 22, color: "#B8823A" }} strokeWidth={1.8} />
            <h1 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: 24, fontWeight: 600, color: "#1C1410" }}>
              Notifications
            </h1>
          </div>
          <p style={{ fontSize: 13, color: "#9B8E83", lineHeight: 1.6 }}>
            Choose what you'd like to hear from us. Updates changes instantly.
          </p>
        </div>

        {/* Master switch */}
        <div style={{ padding: "20px 16px 12px" }}>
          <div style={{
            background: "#FDFAF6", border: "1px solid #E8E2D9",
            borderRadius: 16, padding: "16px 18px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ flex: 1, marginRight: 12 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#1C1410", marginBottom: 2 }}>
                All notifications
              </p>
              <p style={{ fontSize: 12, color: "#9B8E83" }}>
                Turn everything off with one switch
              </p>
            </div>
            <Toggle checked={form.all_enabled} onChange={(v) => updateField("all_enabled", v)} />
          </div>
        </div>

        {/* Category toggles */}
        <div style={{ padding: "0 16px" }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "#9B8E83", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 10, marginTop: 8, padding: "0 4px" }}>
            Categories
          </p>
          <div style={{
            background: "#FDFAF6", border: "1px solid #E8E2D9",
            borderRadius: 16, overflow: "hidden",
            opacity: form.all_enabled ? 1 : 0.5,
            pointerEvents: form.all_enabled ? "auto" : "none",
          }}>
            {CATEGORIES.map((cat, i) => (
              <div key={cat.key} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 18px",
                borderBottom: i < CATEGORIES.length - 1 ? "1px solid #E8E2D9" : "none",
              }}>
                <div style={{ flex: 1, marginRight: 12 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#1C1410", marginBottom: 2 }}>
                    {cat.label}
                  </p>
                  <p style={{ fontSize: 11, color: "#9B8E83", lineHeight: 1.5 }}>
                    {cat.desc}
                  </p>
                </div>
                <Toggle checked={form[cat.key]} onChange={(v) => updateField(cat.key, v)} />
              </div>
            ))}
          </div>
        </div>

        {/* Save indicator */}
        {saved && (
          <div style={{
            position: "fixed", bottom: 100, left: "50%", transform: "translateX(-50%)",
            padding: "10px 18px", borderRadius: 50,
            background: "#7A9E7E", color: "#fff",
            fontSize: 13, fontWeight: 700,
            display: "flex", alignItems: "center", gap: 6,
            zIndex: 50, boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}>
            <Check style={{ width: 14, height: 14 }} />
            Saved
          </div>
        )}

        <p style={{ textAlign: "center", fontSize: 11, color: "#9B8E83", padding: "24px 32px 8px", lineHeight: 1.6 }}>
          You can change your preferences any time. We'll never share your information.
        </p>
      </div>
    </div>
  );
}