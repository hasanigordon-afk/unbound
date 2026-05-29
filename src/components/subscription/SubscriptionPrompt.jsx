import React, { useEffect, useState } from "react";
import { Heart, Sparkles, X } from "lucide-react";
import {
  getOrCreatePref, subscribeUser, dismissPrompt,
  hasAnyTrigger, wasPromptShownThisSession, markPromptShownThisSession,
} from "@/lib/subscriptionEngine";
import PersonalizationSheet from "./PersonalizationSheet";
import { useAuth } from "@/lib/AuthContext";

const HEADLINES = [
  "Stay Connected to Your Recovery",
  "Keep the Momentum Going",
  "Don't Lose This Progress",
];

export default function SubscriptionPrompt() {
  const { user: authUser, isAuthenticated, isLoadingAuth } = useAuth();
  const [visible, setVisible] = useState(false);
  const [user, setUser] = useState(null);
  const [pref, setPref] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPersonalization, setShowPersonalization] = useState(false);
  const [headline] = useState(() => HEADLINES[Math.floor(Math.random() * HEADLINES.length)]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (isLoadingAuth || !isAuthenticated || !authUser?.email) return;
        const me = authUser;
        if (!mounted) return;
        setUser(me);

        const existing = await getOrCreatePref(me.email);
        if (!mounted) return;
        setPref(existing);

        // Already subscribed — nothing to do
        if (existing?.subscribed) return;

        // Already explicitly denied — respect it
        if (existing?.prompt_status === "denied") return;

        // Don't show more than once per session
        if (wasPromptShownThisSession()) return;

        // Require at least one meaningful trigger (check-in, ah ha, goal, second visit)
        if (!hasAnyTrigger()) return;

        // Respect 3-day cooldown on dismissal
        if (existing?.prompt_status === "dismissed" && existing.dismissed_at) {
          const elapsed = Date.now() - new Date(existing.dismissed_at).getTime();
          if (elapsed < 3 * 24 * 3600_000) return;
        }

        // Small delay so it doesn't jar the user
        setTimeout(() => {
          if (mounted) {
            setVisible(true);
            markPromptShownThisSession();
          }
        }, 1200);
      } catch { /* not authed */ }
    })();
    return () => { mounted = false; };
  }, [authUser, isAuthenticated, isLoadingAuth]);

  const handleSubscribe = async () => {
    setLoading(true);
    const updated = await subscribeUser(user.email, pref);
    setPref(updated);
    setLoading(false);
    setVisible(false);
    // Show personalization sheet next (skippable)
    setTimeout(() => setShowPersonalization(true), 400);
  };

  const handleLater = async () => {
    await dismissPrompt(user.email, pref);
    setVisible(false);
  };

  if (showPersonalization && pref) {
    return <PersonalizationSheet pref={pref} onClose={() => setShowPersonalization(false)} />;
  }

  if (!visible) return null;

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
        padding: "24px 24px 32px",
        animation: "slideUp 0.35s cubic-bezier(.22,1,.36,1)",
        boxShadow: "0 -4px 24px rgba(28,20,16,0.12)",
      }}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 4 }}>
          <button onClick={handleLater} aria-label="Dismiss" style={{
            background: "none", border: "none", cursor: "pointer", padding: 4, color: "#9B8E83",
          }}>
            <X style={{ width: 20, height: 20 }} />
          </button>
        </div>

        {/* 3 H's icon row */}
        <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 18 }}>
          {[
            { label: "Help",    color: "#7A9E7E" },
            { label: "Hope",    color: "#B8823A" },
            { label: "Healing", color: "#7B8FA8" },
          ].map(h => (
            <div key={h.label} style={{
              padding: "6px 14px", borderRadius: 20,
              background: `${h.color}15`, border: `1px solid ${h.color}35`,
              fontSize: 11, fontWeight: 700, color: h.color, letterSpacing: ".04em",
            }}>
              {h.label}
            </div>
          ))}
        </div>

        <h2 style={{
          fontFamily: "'Lora', Georgia, serif",
          fontSize: 22, fontWeight: 600, color: "#1C1410",
          textAlign: "center", marginBottom: 10, lineHeight: 1.25,
        }}>
          {headline}
        </h2>

        <p style={{
          fontSize: 14, color: "#4A3F35", textAlign: "center",
          lineHeight: 1.65, marginBottom: 20, padding: "0 8px",
        }}>
          Subscribe to receive support, reminders, and real moments from people walking the same path as you.
        </p>

        <div style={{
          background: "rgba(122,158,126,0.08)",
          border: "1px solid rgba(122,158,126,0.2)",
          borderRadius: 12, padding: "11px 14px", marginBottom: 20,
          display: "flex", alignItems: "flex-start", gap: 10,
        }}>
          <Sparkles style={{ width: 15, height: 15, color: "#7A9E7E", flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontSize: 12, color: "#4A3F35", lineHeight: 1.55 }}>
            One tap. No forms. You can adjust or turn off anytime.
          </p>
        </div>

        <button
          onClick={handleSubscribe}
          disabled={loading}
          style={{
            width: "100%", padding: "14px", borderRadius: 50, border: "none",
            background: "#B8823A", color: "#fff",
            fontWeight: 700, fontSize: 15, cursor: "pointer",
            marginBottom: 10, fontFamily: "'DM Sans', sans-serif",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
        >
          <Heart style={{ width: 16, height: 16 }} fill="#fff" />
          {loading ? "Connecting…" : "Stay Connected"}
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
          Not Now
        </button>
      </div>
    </div>
  );
}