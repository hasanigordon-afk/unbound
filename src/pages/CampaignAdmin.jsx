import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, Loader2, Send, Plus, Trash2, Check, Calendar } from "lucide-react";
import { getCampaignSettings, saveCampaignSettings, DEFAULT_SETTINGS } from "@/lib/campaignSettings";

const CATEGORIES = [
  "daily_motivation", "recovery_motivation", "community_updates",
  "milestone_reminders", "app_updates", "campaign_announcements",
  "donation_progress", "events_partners",
];

function Field({ label, value, onChange, type = "text", rows = 3, placeholder }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: "#4A3F35", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6, display: "block" }}>
        {label}
      </label>
      {type === "textarea" ? (
        <textarea
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder={placeholder}
          style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #E8E2D9", background: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit", resize: "vertical", lineHeight: 1.55 }}
        />
      ) : (
        <input
          type={type}
          value={value ?? ""}
          onChange={(e) => onChange(type === "number" ? parseFloat(e.target.value) || 0 : e.target.value)}
          placeholder={placeholder}
          style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #E8E2D9", background: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }}
        />
      )}
    </div>
  );
}

export default function CampaignAdmin() {
  const qc = useQueryClient();
  const [tab, setTab] = useState("settings");
  const [form, setForm] = useState(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: settings } = useQuery({
    queryKey: ["campaign-settings"],
    queryFn: getCampaignSettings,
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ["campaign-notifications"],
    queryFn: () => base44.entities.CampaignNotification.list("-created_date", 50),
  });

  const { data: donations = [] } = useQuery({
    queryKey: ["donations-admin"],
    queryFn: () => base44.entities.Donation.list("-created_date", 100),
  });

  const { data: allPrefs = [] } = useQuery({
    queryKey: ["all-notification-prefs"],
    queryFn: () => base44.entities.NotificationPreference.list("-created_date", 500),
  });

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: saveCampaignSettings,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campaign-settings"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });

  if (user && user.role !== "admin") {
    return (
      <div style={{ background: "#F7F3EE", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center" }}>
        <div>
          <p style={{ fontSize: 15, color: "#4A3F35", marginBottom: 12 }}>Admins only.</p>
          <Link to="/" style={{ color: "#B8823A", fontWeight: 700, textDecoration: "none" }}>← Back to Home</Link>
        </div>
      </div>
    );
  }

  const totalRaised = donations.reduce((s, d) => s + (d.amount || 0), 0);

  const updateAmount = (idx, val) => {
    const next = [...(form.donation_amounts || [])];
    next[idx] = parseFloat(val) || 0;
    setForm({ ...form, donation_amounts: next });
  };
  const addAmount = () => setForm({ ...form, donation_amounts: [...(form.donation_amounts || []), 0] });
  const removeAmount = (idx) => setForm({ ...form, donation_amounts: form.donation_amounts.filter((_, i) => i !== idx) });

  return (
    <div style={{ background: "#F7F3EE", minHeight: "100vh", paddingBottom: 120 }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ padding: "48px 20px 20px", background: "#FDFAF6", borderBottom: "1px solid #E8E2D9" }}>
          <Link to="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, color: "#4A3F35", fontSize: 13, fontWeight: 600, marginBottom: 14 }}>
            <ArrowLeft style={{ width: 15, height: 15 }} />
            Back
          </Link>
          <h1 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: 24, fontWeight: 600, color: "#1C1410", marginBottom: 4 }}>
            Campaign Admin
          </h1>
          <p style={{ fontSize: 13, color: "#9B8E83" }}>Manage donations, notifications, and campaign content</p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", background: "#FDFAF6", borderBottom: "1px solid #E8E2D9", padding: "0 12px" }}>
          {[
            { id: "settings", label: "Settings" },
            { id: "subscribers", label: "Subscribers" },
            { id: "notifications", label: "Notifications" },
            { id: "donations", label: `Donations (${donations.length})` },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: "12px 14px", background: "none", border: "none",
                borderBottom: `2px solid ${tab === t.id ? "#B8823A" : "transparent"}`,
                color: tab === t.id ? "#B8823A" : "#9B8E83",
                fontWeight: 700, fontSize: 13, cursor: "pointer",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ padding: "20px 16px" }}>

          {tab === "settings" && (
            <>
              {/* Toggle: donations on/off */}
              <div style={{ background: "#FDFAF6", border: "1px solid #E8E2D9", borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#1C1410" }}>Donation feature enabled</p>
                  <p style={{ fontSize: 11, color: "#9B8E83" }}>Hide/show the donate button and page</p>
                </div>
                <input
                  type="checkbox"
                  checked={form.donation_enabled ?? true}
                  onChange={(e) => setForm({ ...form, donation_enabled: e.target.checked })}
                  style={{ width: 18, height: 18, accentColor: "#B8823A", cursor: "pointer" }}
                />
              </div>

              <div style={{ background: "#FDFAF6", border: "1px solid #E8E2D9", borderRadius: 14, padding: "18px 18px", marginBottom: 16 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#B8823A", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 14 }}>Donation Page</p>
                <Field label="Headline" value={form.donation_headline} onChange={(v) => setForm({ ...form, donation_headline: v })} />
                <Field label="Subheadline" type="textarea" rows={2} value={form.donation_subheadline} onChange={(v) => setForm({ ...form, donation_subheadline: v })} />
                <Field label="Mission Statement" type="textarea" rows={4} value={form.mission_statement} onChange={(v) => setForm({ ...form, mission_statement: v })} />
                <Field label="Thank You Message" type="textarea" rows={3} value={form.thank_you_message} onChange={(v) => setForm({ ...form, thank_you_message: v })} />
                <Field label="Banner Image URL" value={form.banner_image_url} onChange={(v) => setForm({ ...form, banner_image_url: v })} placeholder="https://..." />

                <label style={{ fontSize: 11, fontWeight: 700, color: "#4A3F35", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8, display: "block" }}>
                  Donation Amounts
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                  {(form.donation_amounts || []).map((a, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ fontSize: 13, color: "#4A3F35" }}>$</span>
                      <input
                        type="number"
                        value={a}
                        onChange={(e) => updateAmount(i, e.target.value)}
                        style={{ width: 70, padding: "7px 10px", borderRadius: 8, border: "1px solid #E8E2D9", background: "#fff", fontSize: 13, outline: "none" }}
                      />
                      <button type="button" onClick={() => removeAmount(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "#B85C5C", padding: 2 }}>
                        <Trash2 style={{ width: 14, height: 14 }} />
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={addAmount} style={{ padding: "6px 12px", borderRadius: 20, background: "rgba(184,130,58,0.1)", border: "1px solid rgba(184,130,58,0.3)", color: "#B8823A", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <Plus style={{ width: 12, height: 12 }} /> Add
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <Field label="Donation Goal ($)" type="number" value={form.donation_goal} onChange={(v) => setForm({ ...form, donation_goal: v })} />
                  <Field label="Raised So Far ($)" type="number" value={form.donation_raised} onChange={(v) => setForm({ ...form, donation_raised: v })} />
                </div>
              </div>

              <div style={{ background: "#FDFAF6", border: "1px solid #E8E2D9", borderRadius: 14, padding: "18px 18px", marginBottom: 16 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#B8823A", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 14 }}>Push Notification Prompt</p>
                <Field label="Prompt Headline" value={form.push_prompt_headline} onChange={(v) => setForm({ ...form, push_prompt_headline: v })} />
                <Field label="Prompt Body Text" type="textarea" rows={3} value={form.push_prompt_body} onChange={(v) => setForm({ ...form, push_prompt_body: v })} />
              </div>

              <div style={{ background: "#FDFAF6", border: "1px solid #E8E2D9", borderRadius: 14, padding: "18px 18px", marginBottom: 16 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#B8823A", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 14 }}>Campaign Announcement Banner</p>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <input
                    type="checkbox"
                    checked={form.campaign_announcement_active ?? false}
                    onChange={(e) => setForm({ ...form, campaign_announcement_active: e.target.checked })}
                    style={{ width: 16, height: 16, accentColor: "#B8823A", cursor: "pointer" }}
                  />
                  <label style={{ fontSize: 13, color: "#4A3F35" }}>Show announcement banner on homepage</label>
                </div>
                <Field label="Announcement Text" type="textarea" rows={2} value={form.campaign_announcement} onChange={(v) => setForm({ ...form, campaign_announcement: v })} placeholder="e.g. We hit 50% of our goal — thank you!" />
              </div>

              <button
                onClick={() => saveMutation.mutate(form)}
                disabled={saveMutation.isPending}
                style={{
                  width: "100%", padding: "14px", borderRadius: 50, border: "none",
                  background: "#B8823A", color: "#fff", fontWeight: 700, fontSize: 14,
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
              >
                {saveMutation.isPending
                  ? <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" />
                  : saved ? <Check style={{ width: 16, height: 16 }} /> : <Save style={{ width: 16, height: 16 }} />}
                {saveMutation.isPending ? "Saving…" : saved ? "Saved" : "Save Settings"}
              </button>
            </>
          )}

          {tab === "subscribers" && <SubscribersTab prefs={allPrefs} />}

          {tab === "notifications" && <NotificationsTab notifications={notifications} user={user} qc={qc} />}

          {tab === "donations" && (
            <DonationsTab donations={donations} totalRaised={totalRaised} />
          )}
        </div>
      </div>
    </div>
  );
}

function NotificationsTab({ notifications, user, qc }) {
  const [form, setForm] = useState({ title: "", body: "", category: "campaign_announcements", scheduled_for: "", action_url: "" });
  const [mode, setMode] = useState("now"); // "now" | "scheduled"

  const createMutation = useMutation({
    mutationFn: async (status) => {
      const payload = {
        title: form.title.trim(),
        body: form.body.trim(),
        category: form.category,
        action_url: form.action_url.trim() || null,
        status,
        sent_by: user?.email,
      };
      if (status === "scheduled" && form.scheduled_for) payload.scheduled_for = form.scheduled_for;
      if (status === "sent") payload.sent_at = new Date().toISOString();
      return base44.entities.CampaignNotification.create(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campaign-notifications"] });
      setForm({ title: "", body: "", category: "campaign_announcements", scheduled_for: "", action_url: "" });
    },
  });

  const canSubmit = form.title.trim() && form.body.trim() && (mode === "now" || form.scheduled_for);

  return (
    <>
      <div style={{ background: "#FDFAF6", border: "1px solid #E8E2D9", borderRadius: 14, padding: "18px 18px", marginBottom: 20 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#B8823A", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 14 }}>
          Send or Schedule Campaign Notification
        </p>
        <Field label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} placeholder="e.g. We're halfway to our goal!" />
        <Field label="Message" type="textarea" value={form.body} onChange={(v) => setForm({ ...form, body: v })} placeholder="Share the news with your community…" />

        <label style={{ fontSize: 11, fontWeight: 700, color: "#4A3F35", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6, display: "block" }}>Category</label>
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #E8E2D9", background: "#fff", fontSize: 13, marginBottom: 16, outline: "none" }}
        >
          {CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g, " ")}</option>)}
        </select>

        <Field label="Optional Link URL" value={form.action_url} onChange={(v) => setForm({ ...form, action_url: v })} placeholder="https://…" />

        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <button type="button" onClick={() => setMode("now")} style={{ flex: 1, padding: "10px", borderRadius: 10, border: `1.5px solid ${mode === "now" ? "#B8823A" : "#E8E2D9"}`, background: mode === "now" ? "rgba(184,130,58,0.08)" : "#fff", color: mode === "now" ? "#B8823A" : "#4A3F35", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Send Now</button>
          <button type="button" onClick={() => setMode("scheduled")} style={{ flex: 1, padding: "10px", borderRadius: 10, border: `1.5px solid ${mode === "scheduled" ? "#B8823A" : "#E8E2D9"}`, background: mode === "scheduled" ? "rgba(184,130,58,0.08)" : "#fff", color: mode === "scheduled" ? "#B8823A" : "#4A3F35", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Schedule</button>
        </div>

        {mode === "scheduled" && (
          <Field label="Scheduled For" type="datetime-local" value={form.scheduled_for} onChange={(v) => setForm({ ...form, scheduled_for: v })} />
        )}

        <button
          onClick={() => createMutation.mutate(mode === "now" ? "sent" : "scheduled")}
          disabled={!canSubmit || createMutation.isPending}
          style={{
            width: "100%", padding: "13px", borderRadius: 50, border: "none",
            background: canSubmit ? "#B8823A" : "#E8E2D9",
            color: canSubmit ? "#fff" : "#9B8E83",
            fontWeight: 700, fontSize: 14, cursor: canSubmit ? "pointer" : "not-allowed",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
        >
          {createMutation.isPending ? <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" /> : (mode === "now" ? <Send style={{ width: 15, height: 15 }} /> : <Calendar style={{ width: 15, height: 15 }} />)}
          {mode === "now" ? "Send Notification" : "Schedule Notification"}
        </button>
      </div>

      <p style={{ fontSize: 11, fontWeight: 700, color: "#9B8E83", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 10 }}>History</p>
      {notifications.length === 0 && (
        <p style={{ fontSize: 13, color: "#9B8E83", padding: "20px 0", textAlign: "center" }}>No campaign notifications sent yet.</p>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {notifications.map(n => (
          <div key={n.id} style={{ background: "#FDFAF6", border: "1px solid #E8E2D9", borderRadius: 12, padding: "12px 14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 4 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#1C1410", flex: 1 }}>{n.title}</p>
              <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: n.status === "sent" ? "rgba(122,158,126,0.15)" : "rgba(184,130,58,0.12)", color: n.status === "sent" ? "#5F8063" : "#B8823A", textTransform: "uppercase" }}>{n.status}</span>
            </div>
            <p style={{ fontSize: 12, color: "#4A3F35", lineHeight: 1.5, marginBottom: 4 }}>{n.body}</p>
            <p style={{ fontSize: 10, color: "#9B8E83" }}>{n.category.replace(/_/g, " ")} · {new Date(n.created_date).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </>
  );
}

function SubscribersTab({ prefs }) {
  const total = prefs.length;
  const subscribed = prefs.filter(p => p.subscribed).length;
  const helpOn = prefs.filter(p => p.subscribed && p.help_enabled).length;
  const hopeOn = prefs.filter(p => p.subscribed && p.hope_enabled).length;
  const healingOn = prefs.filter(p => p.subscribed && p.healing_enabled).length;
  const rate = total > 0 ? Math.round((subscribed / total) * 100) : 0;

  const freqBreakdown = { light: 0, balanced: 0, strong: 0 };
  prefs.filter(p => p.subscribed).forEach(p => {
    const f = p.frequency || "balanced";
    if (freqBreakdown[f] !== undefined) freqBreakdown[f] += 1;
  });

  const pct = (n) => subscribed > 0 ? Math.round((n / subscribed) * 100) : 0;

  return (
    <>
      {/* Top-line stats */}
      <div style={{ background: "linear-gradient(135deg, rgba(184,130,58,0.08), rgba(122,158,126,0.05))", border: "1px solid #E8E2D9", borderRadius: 14, padding: "20px 20px", marginBottom: 16, textAlign: "center" }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#9B8E83", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 6 }}>Subscription Rate</p>
        <p style={{ fontSize: 36, fontWeight: 800, color: "#B8823A", lineHeight: 1 }}>{rate}%</p>
        <p style={{ fontSize: 12, color: "#9B8E83", marginTop: 4 }}>{subscribed} of {total} users connected</p>
      </div>

      {/* 3 H's breakdown */}
      <p style={{ fontSize: 11, fontWeight: 700, color: "#9B8E83", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 10 }}>The 3 H's — Stream Opt-in</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 20 }}>
        {[
          { label: "Help",    n: helpOn,    color: "#7A9E7E", emoji: "📍" },
          { label: "Hope",    n: hopeOn,    color: "#B8823A", emoji: "✨" },
          { label: "Healing", n: healingOn, color: "#7B8FA8", emoji: "🌿" },
        ].map(h => (
          <div key={h.label} style={{ background: "#FDFAF6", border: "1px solid #E8E2D9", borderRadius: 12, padding: "14px 10px", textAlign: "center" }}>
            <p style={{ fontSize: 22, marginBottom: 4 }}>{h.emoji}</p>
            <p style={{ fontSize: 22, fontWeight: 800, color: h.color, lineHeight: 1 }}>{pct(h.n)}%</p>
            <p style={{ fontSize: 10, color: "#9B8E83", marginTop: 4, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em" }}>{h.label}</p>
            <p style={{ fontSize: 10, color: "#9B8E83", marginTop: 2 }}>{h.n} users</p>
          </div>
        ))}
      </div>

      {/* Frequency breakdown */}
      <p style={{ fontSize: 11, fontWeight: 700, color: "#9B8E83", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 10 }}>Frequency Preference</p>
      <div style={{ background: "#FDFAF6", border: "1px solid #E8E2D9", borderRadius: 14, padding: "16px 18px", marginBottom: 20 }}>
        {[
          { key: "light", label: "Light" },
          { key: "balanced", label: "Balanced" },
          { key: "strong", label: "Strong support" },
        ].map((f, i) => (
          <div key={f.key} style={{ marginBottom: i < 2 ? 12 : 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: "#1C1410", fontWeight: 600 }}>{f.label}</span>
              <span style={{ fontSize: 12, color: "#9B8E83" }}>{freqBreakdown[f.key]} ({pct(freqBreakdown[f.key])}%)</span>
            </div>
            <div style={{ height: 6, background: "#F7F3EE", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ width: `${pct(freqBreakdown[f.key])}%`, height: "100%", background: "#B8823A", borderRadius: 3, transition: "width 0.3s ease" }} />
            </div>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 11, color: "#9B8E83", textAlign: "center", lineHeight: 1.6 }}>
        Engagement and retention metrics update in real time as users interact with the app.
      </p>
    </>
  );
}

function DonationsTab({ donations, totalRaised }) {
  return (
    <>
      <div style={{ background: "linear-gradient(135deg, rgba(184,130,58,0.08), rgba(122,158,126,0.05))", border: "1px solid #E8E2D9", borderRadius: 14, padding: "18px 20px", marginBottom: 16, textAlign: "center" }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#9B8E83", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 6 }}>Total Received</p>
        <p style={{ fontSize: 32, fontWeight: 800, color: "#B8823A", lineHeight: 1 }}>${totalRaised.toLocaleString()}</p>
        <p style={{ fontSize: 12, color: "#9B8E83", marginTop: 4 }}>{donations.length} donation{donations.length !== 1 ? "s" : ""}</p>
      </div>

      {donations.length === 0 && (
        <p style={{ fontSize: 13, color: "#9B8E83", padding: "40px 0", textAlign: "center" }}>No donations yet.</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {donations.map(d => (
          <div key={d.id} style={{ background: "#FDFAF6", border: "1px solid #E8E2D9", borderRadius: 12, padding: "12px 14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#1C1410" }}>
                {d.is_anonymous ? "Anonymous" : d.donor_name}
              </p>
              <p style={{ fontSize: 15, fontWeight: 800, color: "#B8823A" }}>${d.amount}</p>
            </div>
            {d.message && <p style={{ fontSize: 12, color: "#4A3F35", fontStyle: "italic", lineHeight: 1.5, marginBottom: 4 }}>"{d.message}"</p>}
            <p style={{ fontSize: 10, color: "#9B8E83" }}>{new Date(d.created_date).toLocaleDateString()} · {d.status}</p>
          </div>
        ))}
      </div>
    </>
  );
}