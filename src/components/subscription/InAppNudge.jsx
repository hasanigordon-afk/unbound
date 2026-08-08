import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { X, ArrowRight, Volume2 } from "lucide-react";
import { pickNudge, markNudgeShown } from "@/lib/subscriptionEngine";
import useSpokenReminders from "@/hooks/useSpokenReminders";

const STREAM_STYLES = {
  help:    { color: "#7A9E7E", label: "Help",    emoji: "📍" },
  hope:    { color: "#B8823A", label: "Hope",    emoji: "✨" },
  healing: { color: "#7B8FA8", label: "Healing", emoji: "🌿" },
};

export default function InAppNudge() {
  const [dismissed, setDismissed] = useState(false);

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me().catch(() => null) });

  const { data: pref } = useQuery({
    queryKey: ["notification-pref", user?.email],
    queryFn: async () => {
      const rows = await base44.entities.NotificationPreference.filter({ user_email: user.email });
      return rows[0] || null;
    },
    enabled: !!user?.email,
  });

  const { data: checkIns = [] } = useQuery({
    queryKey: ["daily-checkins-nudge", user?.email],
    queryFn: () => base44.entities.DailyCheckIn.filter({ participant_email: user.email }, "-check_in_date", 14),
    enabled: !!user?.email && !!pref?.subscribed,
    staleTime: 60_000,
  });

  const { streak, checkedInToday, avgCraving, daysSinceLastCheckIn } = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const ci = checkedInTodayFn(checkIns, today);
    const s = computeStreak(checkIns);
    const recent = checkIns.slice(0, 7);
    const avg = recent.length ? recent.reduce((a, c) => a + (c.craving_intensity ?? 3), 0) / recent.length : 0;
    const last = checkIns[0]?.check_in_date;
    const days = last ? Math.floor((Date.now() - new Date(last).getTime()) / 86400_000) : 99;
    return { streak: s, checkedInToday: ci, avgCraving: avg, daysSinceLastCheckIn: days };
  }, [checkIns]);

  const nudge = useMemo(() => {
    if (!pref?.subscribed || dismissed) return null;
    return pickNudge({ pref, streak, checkedInToday, avgCraving, daysSinceLastCheckIn });
  }, [pref, streak, checkedInToday, avgCraving, daysSinceLastCheckIn, dismissed]);

  const { speakEvent, supported, speaking } = useSpokenReminders(user?.email);

  // Auto-speak milestone nudges when enabled
  useEffect(() => {
    if (!nudge?.speakableText || !nudge?.isMilestone || !user?.email) return;
    speakEvent({
      eventType: nudge.eventType || 'nudge',
      eventKey: nudge.eventKey,
      text: nudge.speakableText,
    }).catch(() => {});
  }, [nudge?.eventKey, nudge?.speakableText, nudge?.isMilestone, user?.email, speakEvent]);

  // Mark shown (for throttling) when a nudge renders
  useEffect(() => {
    if (nudge && pref?.id) {
      markNudgeShown(pref.id).catch(() => {});
    }
  }, [nudge, pref?.id]);

  if (!nudge) return null;

  const s = STREAM_STYLES[nudge.stream];

  return (
    <div style={{
      background: `linear-gradient(135deg, ${s.color}14, ${s.color}06)`,
      border: `1px solid ${s.color}35`,
      borderRadius: 16, padding: "14px 16px",
      marginBottom: 16,
      display: "flex", alignItems: "center", gap: 12,
      animation: "fadeIn 0.4s ease",
    }}>
      <style>{`@keyframes fadeIn { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }`}</style>
      <span style={{ fontSize: 22, flexShrink: 0 }}>{s.emoji}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: s.color, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 2 }}>{s.label}</p>
        <p style={{ fontSize: 13, fontWeight: 700, color: "#1C1410", marginBottom: 2, lineHeight: 1.3 }}>{nudge.title}</p>
        <p style={{ fontSize: 11, color: "#4A3F35", lineHeight: 1.45 }}>{nudge.body}</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
        {nudge.speakableText && supported && (
          <button
            type="button"
            onClick={() => speakEvent({
              eventType: nudge.eventType || 'nudge',
              eventKey: `${nudge.eventKey}:replay`,
              text: nudge.speakableText,
              force: true,
            })}
            disabled={speaking}
            aria-label="Replay spoken encouragement"
            style={{
              background: "rgba(255,255,255,0.85)", color: s.color,
              padding: "6px 10px", borderRadius: 20,
              fontSize: 11, fontWeight: 700,
              display: "flex", alignItems: "center", gap: 4,
              border: `1px solid ${s.color}35`, cursor: "pointer",
            }}
          >
            <Volume2 style={{ width: 11, height: 11 }} /> Listen
          </button>
        )}
        <Link to={nudge.href} style={{ textDecoration: "none" }}>
          <div style={{
            background: s.color, color: "#fff",
            padding: "6px 10px", borderRadius: 20,
            fontSize: 11, fontWeight: 700,
            display: "flex", alignItems: "center", gap: 4,
          }}>
            {nudge.cta} <ArrowRight style={{ width: 11, height: 11 }} />
          </div>
        </Link>
        <button onClick={() => setDismissed(true)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9B8E83", padding: 2 }}>
          <X style={{ width: 12, height: 12 }} />
        </button>
      </div>
    </div>
  );
}

function checkedInTodayFn(checkIns, today) {
  return checkIns.some(c => c.check_in_date === today);
}
function computeStreak(checkIns) {
  const sorted = [...checkIns].sort((a, b) => new Date(b.check_in_date) - new Date(a.check_in_date));
  let n = 0, cur = new Date(); cur.setHours(0, 0, 0, 0);
  for (const c of sorted) {
    const d = new Date(c.check_in_date); d.setHours(0, 0, 0, 0);
    if (Math.round((cur - d) / 86400_000) <= 1) { n++; cur = d; } else break;
  }
  return n;
}