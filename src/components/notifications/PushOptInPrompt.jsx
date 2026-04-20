import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Bell, X, Sparkles } from "lucide-react";
import { getCampaignSettings } from "@/lib/campaignSettings";

const VISIT_KEY = "ahha_home_visits";
const SESSION_KEY = "ahha_push_prompt_shown";

/**
 * Increments the home-visit counter stored in localStorage.
 * Returns the new count.
 */
export function trackHomeVisit() {
  try {
    const n = parseInt(localStorage.getItem(VISIT_KEY) || "0", 10) + 1;
    localStorage.setItem(VISIT_KEY, String(n));
    return n;
  } catch {
    return 1;
  }
}

/**
 * Call after a user completes a meaningful action (check-in, story, profile setup)
 * to mark them as "action-complete" so the prompt is allowed to appear.
 */
export function markActionComplete() {
  try { localStorage.setItem("ahha_action_complete", "1"); } catch { /* noop */ }
}

function hasCompletedAction() {
  try { return localStorage.getItem("ahha_action_complete") === "1"; } catch { return false; }
}

export default function PushOptInPrompt() {
  const [visible, setVisible] = useState(false);
  const [settings, setSettings] = useState(null);
  const [user, setUser] = useState(null);
  const [pref, setPref] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const me = await base44.auth.me();
        if (!mounted) return;
        setUser(me);

        // Load existing pref
        const prefs = await base44.entities.NotificationPreference.filter({ user_email: me.email });
        const existing = prefs[0] || null;
        setPref(existing);

        // Don't show if already decided
        if (existing && ["allowed", "denied"].includes(existing.prompt_status)) return;

        // Don't show twice per session
        if (sessionStorage.getItem(SESSION_KEY)) return;

        // Require: visited home more than once AND completed a meaningful action
        const visits = parseInt(localStorage.getItem(VISIT_KEY) || "0", 10);
        if (visits < 2) return;
        if (!hasCompletedAction()) return;

        // Don't re-nag if dismissed within last 3 days
        if (existing?.prompt_status === "dismissed" && existing.dismissed_at) {
          const elapsed = Date.now() - new Date(existing.dismissed_at).getTime();
          if (elapsed < 3 * 24 * 60 * 60 * 1000) return;
        }

        const s = await getCampaignSettings();
        if (!mounted) return;
        setSettings(s);
        setVisible(true);
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        /* not authenticated — skip prompt */
      }
    })();
    return () => { mounted = false; };
  }, []);

  const savePref = async (patch) => {
    const base = { user_email: user.email, ...patch };
    if (pref) return base44.entities.NotificationPreference.update(pref.id, patch);
    return base44.entities.NotificationPreference.create(base);
  };

  const handleAllow = async () => {
    setLoading(true);
    let browserPerm = "unsupported";
    if (typeof window !== "undefined" && "Notification" in window) {
      try {
        browserPerm = await Notification.requestPermission();
      } catch {
        browserPerm = "denied";
      }
    }
    await savePref({
      prompt_status: "allowed",
      browser_permission: browserPerm,
      all_enabled: true,
    });
    setLoading(false);
    setVisible(false);
  };

  const handleLater = async () => {
    await savePref({
      prompt_status: "dismissed",
      dismissed_at: new Date().toISOString(),
    });
    setVisible(false);
  };

  if (!visible || !settings) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      display: "flex", alignItems: "flex-end", justifyContent: "center",
      background: "rgba(28,20,16,0.45)",
      animation: "fadeIn 0.25s ease",
    }}>
      <style>{`
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
      `}</style>
      <div style={{
        width: "100%", maxWidth: 480,
        background: "#FDFAF6",
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: "28px 24px 32px",
        animation: "slideUp 0.35s cubic-bezier(.22,1,.36,1)",
        boxShadow: "0 -4px 24px rgba(28,20,16,0.12)",
      }}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
          <button onClick={handleLater} aria-label="Dismiss" style={{
            background: "none", border: "none", cursor: "pointer", padding: 4,
            color: "#9B8E83",
          }}>
            <X style={{ width: 20, height: 20 }} />
          </button>
        </div>

        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: "rgba(184,130,58,0.12)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px",
        }}>
          <Bell style={{ width: 28, height: 28, color: "#B8823A" }} strokeWidth={1.8} />
        </div>

        <h2 style={{
          fontFamily: "'Lora', Georgia, serif",
          fontSize: 22, fontWeight: 600, color: "#1C1410",
          textAlign: "center", marginBottom: 10, lineHeight: 1.25,
        }}>
          {settings.push_prompt_headline}
        </h2>

        <p style={{
          fontSize: 14, color: "#4A3F35", textAlign: "center",
          lineHeight: 1.65, marginBottom: 22,
        }}>
          {settings.push_prompt_body}
        </p>

        <div style={{
          background: "rgba(122,158,126,0.08)",
          border: "1px solid rgba(122,158,126,0.2)",
          borderRadius: 12, padding: "12px 14px", marginBottom: 22,
          display: "flex", alignItems: "flex-start", gap: 10,
        }}>
          <Sparkles style={{ width: 16, height: 16, color: "#7A9E7E", flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontSize: 12, color: "#4A3F35", lineHeight: 1.55 }}>
            You'll receive daily encouragement, milestone reminders, and community updates. You can adjust anytime in settings.
          </p>
        </div>

        <button
          onClick={handleAllow}
          disabled={loading}
          style={{
            width: "100%", padding: "14px", borderRadius: 50, border: "none",
            background: "#B8823A", color: "#fff",
            fontWeight: 700, fontSize: 15, cursor: "pointer",
            marginBottom: 10, fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {loading ? "Enabling…" : "Allow Notifications"}
        </button>

        <button
          onClick={handleLater}
          style={{
            width: "100%", padding: "12px", borderRadius: 50,
            background: "transparent", color: "#4A3F35",
            border: "1px solid #E8E2D9",
            fontWeight: 600, fontSize: 14, cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Maybe Later
        </button>
      </div>
    </div>
  );
}