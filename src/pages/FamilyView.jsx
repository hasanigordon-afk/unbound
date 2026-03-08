import React, { useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Heart, TrendingUp, Calendar, Star, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";

// Family view accessed via token: /FamilyView?token=xxx
export default function FamilyView() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  const { data: contacts = [], isLoading: tokenLoading } = useQuery({
    queryKey: ["family-contact-token", token],
    queryFn: () => base44.entities.FamilyContact.filter({ access_token: token, is_active: true }),
    enabled: !!token,
  });

  const contact = contacts[0];
  const participantEmail = contact?.participant_email;

  const { data: profile } = useQuery({
    queryKey: ["fv-profile", participantEmail],
    queryFn: () => base44.entities.ParticipantProfile.filter({ participant_email: participantEmail }),
    enabled: !!participantEmail,
    select: (d) => d[0],
  });

  const { data: checkIns = [], isLoading: checkInsLoading } = useQuery({
    queryKey: ["fv-checkins", participantEmail],
    queryFn: () => base44.entities.DailyCheckIn.filter({ participant_email: participantEmail }, "-check_in_date", 30),
    enabled: !!participantEmail,
  });

  const metrics = useMemo(() => {
    if (!checkIns.length) return null;
    const sorted = [...checkIns].sort((a, b) => new Date(b.check_in_date) - new Date(a.check_in_date));
    const cutoff7 = new Date(); cutoff7.setDate(cutoff7.getDate() - 7);
    const last7 = sorted.filter((c) => new Date(c.check_in_date) >= cutoff7);

    // Check-in streak
    let streak = 0;
    let cur = new Date();
    for (const c of sorted) {
      const d = new Date(c.check_in_date);
      const diff = Math.floor((cur - d) / 86400000);
      if (diff <= 1) { streak++; cur = d; } else break;
    }

    const checkInRate = Math.round((last7.length / 7) * 100);
    const meetingsThisWeek = last7.filter((c) => c.attended_meeting).length;
    const sponsorContacts = last7.filter((c) => c.connected_with_sponsor).length;
    const daysSince = sorted[0]
      ? Math.floor((new Date() - new Date(sorted[0].check_in_date)) / 86400000)
      : 99;

    // Sobriety days
    const sobrietyDays = profile?.sobriety_start_date
      ? Math.floor((new Date() - new Date(profile.sobriety_start_date)) / 86400000)
      : null;

    // Engagement level (non-clinical — just activity-based)
    const engagementLabel =
      checkInRate >= 80 ? "Staying Engaged" :
      checkInRate >= 50 ? "Moderate Activity" :
      "Low Activity";

    const engagementColor =
      checkInRate >= 80 ? "#22c55e" :
      checkInRate >= 50 ? "#f59e0b" : "#ef4444";

    return { streak, checkInRate, meetingsThisWeek, sponsorContacts, daysSince, sobrietyDays, engagementLabel, engagementColor };
  }, [checkIns, profile]);

  // ── Loading / error states ────────────────────────────────────────────────
  if (!token) {
    return <ErrorScreen message="No access token provided. Please use the link sent to your email." />;
  }

  if (tokenLoading || checkInsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f5f3ff" }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#8b5cf6" }} />
      </div>
    );
  }

  if (!contact) {
    return <ErrorScreen message="This link is invalid or has been revoked by the participant." />;
  }

  if (!contact.can_view_dashboard) {
    return <ErrorScreen message="Dashboard access is not enabled for this link. You may still receive weekly email summaries." />;
  }

  const firstName = participantEmail?.split("@")[0] || "your loved one";

  return (
    <div className="min-h-screen pb-16" style={{ background: "#f5f3ff" }}>
      {/* Header */}
      <div className="px-5 pt-8 pb-5" style={{ background: "#6366f1" }}>
        <div className="flex items-center gap-3 mb-1">
          <Heart className="w-5 h-5 text-white opacity-80" />
          <span className="text-white text-xs font-semibold tracking-widest uppercase opacity-80">Family Support View</span>
        </div>
        <h1 className="text-white text-xl font-bold">{firstName}'s Progress</h1>
        <p className="text-white text-xs opacity-70 mt-1">
          Shared by {firstName} · Non-clinical engagement data only
        </p>
      </div>

      <div className="px-5 py-5 space-y-4 max-w-lg mx-auto">
        {/* Privacy notice */}
        <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: "#ede9fe", border: "1px solid #c4b5fd" }}>
          <ShieldCheck className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#7c3aed" }} />
          <p className="text-xs" style={{ color: "#5b21b6" }}>
            This view shows <strong>engagement activity only</strong> — no clinical data, mood scores, or private notes are shared. {firstName} has consented to sharing this information with you.
          </p>
        </div>

        {/* Sobriety streak hero */}
        {metrics?.sobrietyDays !== null && metrics?.sobrietyDays !== undefined && (
          <div className="rounded-2xl p-6 text-center" style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" }}>
            <Star className="w-7 h-7 mx-auto mb-2 text-yellow-300" />
            <p className="text-5xl font-bold text-white">{metrics.sobrietyDays}</p>
            <p className="text-white text-sm mt-1 opacity-90">Days of Sobriety</p>
            <p className="text-white text-xs mt-2 opacity-70">Every day is a win worth celebrating 🎉</p>
          </div>
        )}

        {/* Engagement status */}
        {metrics && (
          <div className="rounded-xl p-4 flex items-center gap-4" style={{ background: "#fff", border: "1px solid #e5e7eb" }}>
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: metrics.engagementColor }} />
            <div>
              <p className="font-semibold text-sm" style={{ color: "#1e1e1e" }}>{metrics.engagementLabel}</p>
              <p className="text-xs" style={{ color: "#8e8e93" }}>
                {metrics.daysSince === 0 ? "Checked in today ✓" :
                 metrics.daysSince === 1 ? "Last check-in was yesterday" :
                 `Last check-in ${metrics.daysSince} days ago`}
              </p>
            </div>
          </div>
        )}

        {/* Metric grid */}
        {metrics && (
          <div className="grid grid-cols-2 gap-3">
            <MetricCard
              label="Check-In Rate"
              value={`${metrics.checkInRate}%`}
              sub="Last 7 days"
              color="#6366f1"
              bg="#eef2ff"
            />
            <MetricCard
              label="Streak"
              value={`${metrics.streak}d`}
              sub="Consecutive days"
              color="#8b5cf6"
              bg="#f5f3ff"
            />
            <MetricCard
              label="Meetings"
              value={metrics.meetingsThisWeek}
              sub="Attended this week"
              color="#10b981"
              bg="#ecfdf5"
            />
            <MetricCard
              label="Sponsor Contact"
              value={metrics.sponsorContacts}
              sub="Times this week"
              color="#f59e0b"
              bg="#fffbeb"
            />
          </div>
        )}

        {!metrics && (
          <div className="text-center py-10 rounded-xl" style={{ background: "#fff", border: "1px solid #e5e7eb" }}>
            <TrendingUp className="w-8 h-8 mx-auto mb-3 opacity-30" style={{ color: "#6366f1" }} />
            <p className="text-sm" style={{ color: "#8e8e93" }}>No check-in data yet</p>
          </div>
        )}

        {/* 4-week activity calendar */}
        {checkIns.length > 0 && (
          <div className="rounded-xl p-4" style={{ background: "#fff", border: "1px solid #e5e7eb" }}>
            <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "#8e8e93" }}>
              Activity — Last 28 Days
            </p>
            <ActivityGrid checkIns={checkIns} />
          </div>
        )}

        {/* How to support */}
        <div className="rounded-xl p-4" style={{ background: "#fff", border: "1px solid #e5e7eb" }}>
          <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "#8e8e93" }}>Ways to Show Support</p>
          <div className="space-y-2 text-sm" style={{ color: "#374151" }}>
            {[
              "Send an encouraging text or call today",
              "Offer to attend a meeting together",
              "Celebrate sobriety milestones — even small ones",
              "Listen without judgment when they want to talk",
              "Help remove triggers from shared environments",
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-2">
                <span style={{ color: "#8b5cf6" }}>•</span>
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs pb-2" style={{ color: "#c4b5fd" }}>
          Powered by Unbound · Family support is a critical part of recovery.
        </p>
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub, color, bg }) {
  return (
    <div className="rounded-xl p-4 text-center" style={{ background: bg }}>
      <p className="text-3xl font-bold" style={{ color }}>{value}</p>
      <p className="text-xs font-semibold mt-1" style={{ color: "#374151" }}>{label}</p>
      <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>{sub}</p>
    </div>
  );
}

function ActivityGrid({ checkIns }) {
  const today = new Date();
  const days = Array.from({ length: 28 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (27 - i));
    return d.toISOString().split("T")[0];
  });
  const checkedSet = new Set(checkIns.map((c) => c.check_in_date));
  return (
    <div className="grid gap-1" style={{ gridTemplateColumns: "repeat(7, 1fr)" }}>
      {["S","M","T","W","T","F","S"].map((d, i) => (
        <p key={i} className="text-center text-xs mb-1" style={{ color: "#9ca3af" }}>{d}</p>
      ))}
      {days.map((date) => (
        <div
          key={date}
          title={date}
          className="rounded aspect-square"
          style={{ background: checkedSet.has(date) ? "#6366f1" : "#f3f4f6" }}
        />
      ))}
    </div>
  );
}

function ErrorScreen({ message }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ background: "#f5f3ff" }}>
      <AlertCircle className="w-12 h-12 mb-4" style={{ color: "#8b5cf6" }} />
      <h2 className="text-lg font-semibold mb-2" style={{ color: "#1e1e1e" }}>Access Unavailable</h2>
      <p className="text-sm max-w-xs" style={{ color: "#6b7280" }}>{message}</p>
    </div>
  );
}