import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Bell, Check, Loader2, Heart } from "lucide-react";

const H_STREAMS = [
  {
    key: "help_enabled",
    label: "Help",
    tag: "Accountability",
    color: "#7A9E7E",
    emoji: "📍",
    desc: "Check-in reminders, goal nudges, missed-day prompts — gentle, never guilt-based.",
  },
  {
    key: "hope_enabled",
    label: "Hope",
    tag: "Community",
    color: "#B8823A",
    emoji: "✨",
    desc: "Ah Ha stories from others, milestone celebrations, encouragement during inactivity.",
  },
  {
    key: "healing_enabled",
    label: "Healing",
    tag: "Mental Growth",
    color: "#7B8FA8",
    emoji: "🌿",
    desc: "Breathing, calming audio, reflection prompts. 60-second resets when you need them.",
  },
];

const CATEGORIES = [
  { key: "milestone_reminders",   label: "Milestone reminders",        desc: "Celebrate your streaks & sober days" },
  { key: "community_updates",     label: "Community updates",          desc: "New stories and testimonials" },
  { key: "campaign_announcements",label: "Campaign announcements",     desc: "Mission news and updates" },
  { key: "app_updates",           label: "App updates",                desc: "New features and improvements" },
  { key: "donation_progress",     label: "Donation progress",          desc: "Fundraising milestones" },
  { key: "events_partners",       label: "Events & partners",          desc: "Recovery events and partner news" },
];

const FREQUENCIES = [
  { key: "light",    label: "Light",         desc: "A quiet presence — rare, gentle" },
  { key: "balanced", label: "Balanced",      desc: "A steady rhythm — recommended" },
  { key: "strong",   label: "Strong support",desc: "More frequent — when you need more" },
];

function Toggle({ checked, onChange, color = "#B8823A" }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      style={{
        width: 44, height: 26, borderRadius: 13, border: "none", cursor: "pointer",
        background: checked ? color : "#E8E2D9",
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
    subscribed: false,
    all_enabled: true,
    help_enabled: true,
    hope_enabled: true,
    healing_enabled: true,
    frequency: "balanced",
    milestone_reminders: true,
    community_updates: true,
    campaign_announcements: true,
    app_updates: true,
    donation_progress: false,
    events_partners: false,
  });

  useEffect(() => {
    if (pref) {
      setForm({
        subscribed: pref.subscribed ?? false,
        all_enabled: pref.all_enabled ?? true,
        help_enabled: pref.help_enabled ?? true,
        hope_enabled: pref.hope_enabled ?? true,
        healing_enabled: pref.healing_enabled ?? true,
        frequency: pref.frequency ?? "balanced",
        milestone_reminders: pref.milestone_reminders ?? true,
        community_updates: pref.community_updates ?? true,
        campaign_announcements: pref.campaign_announcements ?? true,
        app_updates: pref.app_updates ?? true,
        donation_progress: pref.donation_progress ?? false,
        events_partners: pref.events_partners ?? false,
      });
    }
  }, [pref]);

  const saveMutation = useMutation({
    mutationFn: async (patch) => {
      if (pref) return base44.entities.NotificationPreference.update(pref.id, patch);
      return base44.entities.NotificationPreference.create({
        user_email: user.email, ...patch, prompt_status: "allowed",
      });
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

  const handleUnsubscribe = () => {
    updateField("subscribed", false);
  };

  const handleResubscribe = () => {
    const patch = { ...form, subscribed: true, all_enabled: true };
    setForm(patch);
    saveMutation.mutate({ ...patch, subscribed_at: new Date().toISOString() });
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
            Tune what you hear from us. Changes save instantly.
          </p>
        </div>

        <div style={{ padding: "20px 16px" }}>

          {/* ── Subscription status card ── */}
          <div style={{
            background: form.subscribed ? "linear-gradient(135deg, rgba(184,130,58,0.08), rgba(122,158,126,0.05))" : "#FDFAF6",
            border: `1px solid ${form.subscribed ? "rgba(184,130,58,0.3)" : "#E8E2D9"}`,
            borderRadius: 16, padding: "18px 18px", marginBottom: 20,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: form.subscribed ? "rgba(184,130,58,0.15)" : "#F7F3EE",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Heart style={{ width: 18, height: 18, color: form.subscribed ? "#B8823A" : "#9B8E83" }} fill={form.subscribed ? "#B8823A" : "none"} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#1C1410" }}>
                  {form.subscribed ? "You're connected" : "Not subscribed"}
                </p>
                <p style={{ fontSize: 11, color: "#9B8E83" }}>
                  {form.subscribed ? "Help · Hope · Healing" : "Subscribe to receive the 3 H's support stream"}
                </p>
              </div>
              <Toggle
                checked={form.subscribed}
                onChange={(v) => v ? handleResubscribe() : handleUnsubscribe()}
              />
            </div>
            {!form.subscribed && (
              <p style={{ fontSize: 12, color: "#4A3F35", lineHeight: 1.6, marginTop: 4, fontStyle: "italic" }}>
                You can always come back.
              </p>
            )}
          </div>

          {/* ── Master switch ── */}
          <div style={{
            background: "#FDFAF6", border: "1px solid #E8E2D9",
            borderRadius: 16, padding: "16px 18px", marginBottom: 20,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            opacity: form.subscribed ? 1 : 0.5,
            pointerEvents: form.subscribed ? "auto" : "none",
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

          {/* ── 3 H's streams ── */}
          <div style={{
            opacity: form.subscribed && form.all_enabled ? 1 : 0.5,
            pointerEvents: form.subscribed && form.all_enabled ? "auto" : "none",
          }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#9B8E83", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 10, padding: "0 4px" }}>
              The 3 H's
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
              {H_STREAMS.map(h => (
                <div key={h.key} style={{
                  background: "#FDFAF6", border: "1px solid #E8E2D9",
                  borderRadius: 14, padding: "14px 16px",
                  display: "flex", alignItems: "center", gap: 12,
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                    background: `${h.color}15`,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
                  }}>
                    {h.emoji}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "#1C1410" }}>{h.label}</p>
                      <span style={{
                        fontSize: 9, fontWeight: 700, color: h.color,
                        background: `${h.color}12`, border: `1px solid ${h.color}30`,
                        padding: "1px 7px", borderRadius: 20, letterSpacing: ".04em",
                      }}>{h.tag}</span>
                    </div>
                    <p style={{ fontSize: 11, color: "#4A3F35", lineHeight: 1.5 }}>{h.desc}</p>
                  </div>
                  <Toggle checked={form[h.key]} onChange={(v) => updateField(h.key, v)} color={h.color} />
                </div>
              ))}
            </div>

            {/* ── Frequency ── */}
            <p style={{ fontSize: 10, fontWeight: 700, color: "#9B8E83", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 10, padding: "0 4px" }}>
              Frequency
            </p>
            <div style={{
              background: "#FDFAF6", border: "1px solid #E8E2D9",
              borderRadius: 14, padding: 6, marginBottom: 20,
              display: "flex", gap: 4,
            }}>
              {FREQUENCIES.map(f => {
                const sel = form.frequency === f.key;
                return (
                  <button key={f.key} onClick={() => updateField("frequency", f.key)} style={{
                    flex: 1, padding: "10px 8px", borderRadius: 10, border: "none",
                    background: sel ? "#B8823A" : "transparent",
                    color: sel ? "#fff" : "#4A3F35",
                    fontWeight: 700, fontSize: 12, cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}>{f.label}</button>
                );
              })}
            </div>
            <p style={{ fontSize: 11, color: "#9B8E83", textAlign: "center", marginBottom: 24, padding: "0 12px", lineHeight: 1.5 }}>
              {FREQUENCIES.find(f => f.key === form.frequency)?.desc}
            </p>

            {/* ── Categories ── */}
            <p style={{ fontSize: 10, fontWeight: 700, color: "#9B8E83", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 10, padding: "0 4px" }}>
              Other updates
            </p>
            <div style={{
              background: "#FDFAF6", border: "1px solid #E8E2D9",
              borderRadius: 16, overflow: "hidden", marginBottom: 20,
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

        <p style={{ textAlign: "center", fontSize: 11, color: "#9B8E83", padding: "8px 32px 8px", lineHeight: 1.6 }}>
          You can change your preferences any time.
        </p>
      </div>
    </div>
  );
}