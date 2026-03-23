import React, { useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "./utils";
import {
  CalendarCheck, Target, BookOpen, MessageCircle,
  Shield, Home, FileText, Heart, Video,
  Flame, CheckCircle2, AlertTriangle, ArrowRight, Phone,
} from "lucide-react";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import EmptyState from "@/components/shared/EmptyState";
import MoodCravingChart from "@/components/dashboard/MoodCravingChart";

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  teal:    "#3ECFBF",
  gold:    "#C9A96E",
  indigo:  "#5B6EF5",
  emerald: "#10B981",
  rose:    "#F43F5E",
  amber:   "#F59E0B",
  glass:   { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" },
};

const QUICK_ACTIONS = [
  { icon: CalendarCheck, label: "Check-In",    sub: "Daily accountability",   href: "DailyCheckIn",         color: C.teal   },
  { icon: Target,        label: "My Goals",    sub: "Track progress",         href: "GoalBoard",            color: C.gold   },
  { icon: BookOpen,      label: "Resources",   sub: "Articles & guides",      href: "RecoveryHub",          color: C.indigo },
  { icon: MessageCircle, label: "Messages",    sub: "Reach out for support",  href: "ParticipantMessages",  color: C.emerald},
  { icon: Shield,        label: "Safety Plan", sub: "My crisis roadmap",      href: "MySafetyPlan",         color: C.rose   },
  { icon: FileText,      label: "Journal",     sub: "Your private space",     href: "Journal",              color: "#818CF8"},
  { icon: Home,          label: "Housing",     sub: "Find safe housing",      href: "HousingAssistance",    color: "#34D399"},
  { icon: Video,         label: "Telehealth",  sub: "Connect with counselor", href: "TelehealthHub",        color: "#60A5FA"},
];

function StatBadge({ value, label, color }) {
  return (
    <div style={{
      flex: 1, textAlign: "center", padding: "14px 8px",
      background: "rgba(255,255,255,0.04)", borderRadius: 14,
      border: "1px solid rgba(255,255,255,0.07)",
    }}>
      <p style={{ fontSize: 26, fontWeight: 900, color, lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 4, fontWeight: 600,
        textTransform: "uppercase", letterSpacing: ".06em" }}>{label}</p>
    </div>
  );
}

export default function ParticipantDashboard() {
  const navigate = useNavigate();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["current-user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: checkIns = [], isLoading: checkInsLoading } = useQuery({
    queryKey: ["participant-checkins", user?.email],
    queryFn: () => base44.entities.DailyCheckIn.filter(
      { participant_email: user.email }, "-check_in_date", 30
    ),
    enabled: !!user?.email,
  });

  const { data: goals = [], isLoading: goalsLoading } = useQuery({
    queryKey: ["participant-goals", user?.email],
    queryFn: () => base44.entities.Goal.filter({ participant_email: user.email, status: "active" }),
    enabled: !!user?.email,
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ["participant-sessions", user?.email],
    queryFn: () => base44.entities.TelehealthSession.filter(
      { participant_email: user.email, status: "scheduled" }, "scheduled_date", 5
    ),
    enabled: !!user?.email,
  });

  const { data: profile } = useQuery({
    queryKey: ["participant-profile", user?.email],
    queryFn: () => base44.entities.ParticipantProfile.filter({ participant_email: user.email }),
    enabled: !!user?.email,
    select: (data) => data[0] || null,
  });

  // ── Computed metrics ──────────────────────────────────────────────────────
  const metrics = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const checkedToday = checkIns.some(c => c.check_in_date === today);

    // Streak
    const sorted = [...checkIns].sort((a, b) => new Date(b.check_in_date) - new Date(a.check_in_date));
    let streak = 0;
    let cur = new Date(); cur.setHours(0, 0, 0, 0);
    for (const c of sorted) {
      const d = new Date(c.check_in_date); d.setHours(0, 0, 0, 0);
      if (Math.round((cur - d) / 86400000) <= 1) { streak++; cur = d; } else break;
    }

    // Last 7 days
    const sevenAgo = new Date(); sevenAgo.setDate(sevenAgo.getDate() - 7);
    const last7 = checkIns.filter(c => new Date(c.check_in_date) >= sevenAgo);
    const weeklyMeetings = last7.filter(c => c.attended_meeting).length;
    const avgCraving = last7.length
      ? last7.reduce((s, c) => s + (c.craving_intensity ?? 5), 0) / last7.length
      : 5;

    // Stability score
    const stability = last7.length > 0 ? Math.round(
      Math.min(last7.length / 7, 1) * 25 +
      (last7.filter(c => c.attended_meeting).length / last7.length) * 25 +
      (last7.filter(c => c.connected_with_sponsor).length / last7.length) * 25 +
      Math.max(0, (10 - avgCraving) / 10) * 25
    ) : null;

    const stabColor = !stability ? C.teal
      : stability >= 75 ? C.emerald
      : stability >= 50 ? C.amber
      : C.rose;

    const stabLabel = !stability ? "—"
      : stability >= 75 ? "Stable"
      : stability >= 50 ? "At Risk"
      : "High Risk";

    // Sobriety days
    const sobrietyDays = profile?.sobriety_start_date
      ? Math.floor((new Date() - new Date(profile.sobriety_start_date)) / 86400000)
      : null;

    // Next session
    const nextSession = sessions.sort((a, b) =>
      new Date(`${a.scheduled_date}T${a.scheduled_time}`) -
      new Date(`${b.scheduled_date}T${b.scheduled_time}`)
    )[0] || null;

    return { checkedToday, streak, weeklyMeetings, avgCraving, stability, stabColor, stabLabel, sobrietyDays, nextSession };
  }, [checkIns, sessions, profile]);

  const isLoading = userLoading || checkInsLoading;

  if (isLoading) return (
    <div style={{ background: "#070D1C", minHeight: "100vh" }}>
      <PageLoader label="Loading your dashboard…" />
    </div>
  );

  if (!user) return null;

  const firstName = user.full_name?.split(" ")[0] || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div style={{ background: "linear-gradient(170deg,#070D1C 0%,#0B1424 100%)", minHeight: "100vh", paddingBottom: 100 }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>

        {/* ── Hero header ── */}
        <div style={{
          background: "linear-gradient(150deg,#0E1D3A 0%,#081426 100%)",
          padding: "60px 24px 32px", position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: -80, right: -60, width: 280, height: 280, borderRadius: "50%",
            background: "radial-gradient(circle,rgba(62,207,191,0.1) 0%,transparent 70%)", pointerEvents: "none" }} />

          <p style={{ fontSize: 12, fontWeight: 700, color: C.teal, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 6 }}>
            {greeting}
          </p>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "#fff", marginBottom: 4, lineHeight: 1.2 }}>
            {firstName}'s Dashboard
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", marginBottom: 24 }}>
            Your recovery hub — everything in one place.
          </p>

          {/* ── Key stats ── */}
          <div style={{ display: "flex", gap: 10 }}>
            <StatBadge value={metrics.streak} label="Day Streak" color={C.teal} />
            <StatBadge
              value={metrics.stability !== null ? `${metrics.stability}%` : "—"}
              label={metrics.stabLabel}
              color={metrics.stabColor}
            />
            <StatBadge value={metrics.weeklyMeetings} label="Meetings" color={C.emerald} />
            {metrics.sobrietyDays !== null && (
              <StatBadge value={metrics.sobrietyDays} label="Sober Days" color={C.gold} />
            )}
          </div>
        </div>

        <div style={{ padding: "20px 16px" }}>

          {/* ── Today's check-in CTA ── */}
          <Link to={createPageUrl("DailyCheckIn")} style={{ textDecoration: "none", display: "block", marginBottom: 16 }}>
            <div style={{
              borderRadius: 18, padding: "18px 20px",
              background: metrics.checkedToday
                ? "rgba(16,185,129,0.08)"
                : "linear-gradient(135deg,rgba(62,207,191,0.15),rgba(62,207,191,0.05))",
              border: `1px solid ${metrics.checkedToday ? "rgba(16,185,129,0.3)" : "rgba(62,207,191,0.3)"}`,
              display: "flex", alignItems: "center", gap: 14,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                background: metrics.checkedToday ? "rgba(16,185,129,0.15)" : "rgba(62,207,191,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {metrics.checkedToday
                  ? <CheckCircle2 style={{ color: C.emerald, width: 22, height: 22 }} />
                  : <CalendarCheck style={{ color: C.teal, width: 22, height: 22 }} />}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 15, fontWeight: 800, color: "#fff", marginBottom: 2 }}>
                  {metrics.checkedToday ? "Check-In Complete ✓" : "Complete Today's Check-In"}
                </p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
                  {metrics.checkedToday
                    ? `${metrics.streak} days in a row — keep going.`
                    : "30 seconds · Stay on track"}
                </p>
              </div>
              <ArrowRight style={{ color: metrics.checkedToday ? C.emerald : C.teal, width: 18, height: 18 }} />
            </div>
          </Link>

          {/* ── Upcoming session ── */}
          {metrics.nextSession && (
            <div style={{ borderRadius: 18, padding: "16px 20px", marginBottom: 16,
              background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.2)" }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#60A5FA", textTransform: "uppercase",
                letterSpacing: ".08em", marginBottom: 6 }}>📅 Upcoming Session</p>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 3 }}>
                {metrics.nextSession.title || metrics.nextSession.session_type?.replace(/_/g, " ")}
              </p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
                {metrics.nextSession.scheduled_date} at {metrics.nextSession.scheduled_time}
                {metrics.nextSession.provider_name ? ` · ${metrics.nextSession.provider_name}` : ""}
              </p>
              {metrics.nextSession.meeting_url && (
                <a href={metrics.nextSession.meeting_url} target="_blank" rel="noopener noreferrer"
                  style={{ display: "inline-block", marginTop: 10, fontSize: 12, fontWeight: 700,
                    color: "#60A5FA", textDecoration: "none",
                    background: "rgba(96,165,250,0.1)", padding: "6px 14px",
                    borderRadius: 8, border: "1px solid rgba(96,165,250,0.25)" }}>
                  Join Session →
                </a>
              )}
            </div>
          )}

          {/* ── Mood & Craving chart ── */}
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase",
              letterSpacing: "1px", marginBottom: 10 }}>📈 30-Day Trends</p>
            <MoodCravingChart checkIns={checkIns} />
          </div>

          {/* ── Active goals ── */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "1px" }}>
                🎯 Active Goals
              </p>
              <Link to={createPageUrl("GoalBoard")} style={{ fontSize: 12, color: C.teal, textDecoration: "none", fontWeight: 700 }}>
                View all →
              </Link>
            </div>
            {goalsLoading ? (
              <div style={{ ...C.glass, borderRadius: 14, padding: "16px", textAlign: "center" }}>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>Loading goals…</p>
              </div>
            ) : goals.length === 0 ? (
              <EmptyState
                icon="🎯"
                title="No active goals yet"
                description="Set a goal to track your progress."
                action={() => navigate(createPageUrl("GoalBoard"))}
                actionLabel="Set a Goal"
                compact
              />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {goals.slice(0, 3).map(goal => (
                  <div key={goal.id} style={{
                    ...C.glass, borderRadius: 14, padding: "14px 16px",
                    display: "flex", alignItems: "center", gap: 12,
                  }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{goal.title}</p>
                      <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 4, height: 4, overflow: "hidden" }}>
                        <div style={{
                          width: `${goal.progress_percentage || 0}%`, height: "100%",
                          background: C.teal, borderRadius: 4,
                        }} />
                      </div>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.teal, flexShrink: 0 }}>
                      {goal.progress_percentage || 0}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Quick actions grid ── */}
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase",
              letterSpacing: "1px", marginBottom: 10 }}>⚡ Quick Access</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {QUICK_ACTIONS.map(({ icon: Icon, label, sub, href, color }) => (
                <Link key={href} to={createPageUrl(href)} style={{ textDecoration: "none" }}>
                  <div style={{
                    ...C.glass, borderRadius: 18, padding: "16px 14px",
                    cursor: "pointer",
                    transition: "transform 0.15s ease",
                  }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 12, marginBottom: 10,
                      background: `rgba(${hexToRgb(color)},0.12)`, color,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Icon style={{ width: 18, height: 18 }} />
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginBottom: 2 }}>{label}</p>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", lineHeight: 1.3 }}>{sub}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* ── Crisis strip ── */}
          <div style={{ borderRadius: 16, padding: "16px", background: "rgba(239,68,68,0.06)",
            border: "1px solid rgba(239,68,68,0.15)", marginBottom: 8 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(239,68,68,0.7)", textTransform: "uppercase",
              letterSpacing: ".08em", marginBottom: 10 }}>🆘 Crisis Support — Always Available</p>
            <div style={{ display: "flex", gap: 8 }}>
              {[
                { href: "tel:988",    label: "988",       sub: "Crisis Line" },
                { href: "sms:741741", label: "Text 741741", sub: "Crisis Text" },
                { href: "tel:18006624357", label: "SAMHSA", sub: "Treatment" },
              ].map(x => (
                <a key={x.href} href={x.href} style={{ flex: 1, textDecoration: "none",
                  background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
                  borderRadius: 10, padding: "10px 6px", textAlign: "center" }}>
                  <p style={{ fontSize: 11, fontWeight: 900, color: "#F87171" }}>{x.label}</p>
                  <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{x.sub}</p>
                </a>
              ))}
            </div>
          </div>

          <p style={{ textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.2)", lineHeight: 1.6, paddingTop: 8 }}>
            Unbound is a support tool. In an emergency, call 911.
          </p>
        </div>
      </div>
    </div>
  );
}

function hexToRgb(hex) {
  try {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r},${g},${b}`;
  } catch { return "255,255,255"; }
}