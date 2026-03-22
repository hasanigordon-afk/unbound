import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import {
  CalendarCheck, Target, BookOpen, MessageSquare, Loader2,
  ArrowRight, CheckCircle2, AlertCircle, Flame, Heart,
  FileText, Shield, Map, Users
} from "lucide-react";

const C = {
  teal:    "#3ECFBF",
  gold:    "#C9A96E",
  navy:    "#0B1220",
  indigo:  "#5B6EF5",
  emerald: "#10B981",
  amber:   "#F59E0B",
  red:     "#EF4444",
  slate:   "rgba(255,255,255,0.55)",
  muted:   "rgba(255,255,255,0.28)",
  glass:   { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" },
};

function rgb(hex) {
  if (!hex.startsWith("#")) return "62,207,191";
  return `${parseInt(hex.slice(1,3),16)},${parseInt(hex.slice(3,5),16)},${parseInt(hex.slice(5,7),16)}`;
}

const QUICK_ACTIONS = [
  { emoji: "✅", label: "Check In",         sub: "Daily accountability",     href: "DailyCheckIn",        color: C.teal    },
  { emoji: "📋", label: "My Plan",           sub: "Goals & milestones",       href: "ForwardPlan",          color: C.gold    },
  { emoji: "💬", label: "Messages",          sub: "Talk to your support team",href: "ParticipantMessages",  color: C.indigo  },
  { emoji: "🗺️", label: "Find Help",         sub: "Resources near you",       href: "FindHelpNow",          color: C.emerald },
  { emoji: "📓", label: "Journal",           sub: "Private space for you",    href: "Journal",              color: "#818CF8" },
  { emoji: "🤝", label: "Community",         sub: "You're not alone",         href: "VoicesOfRecovery",     color: "#A78BFA" },
  { emoji: "🛡️", label: "Safety Plan",       sub: "Crisis preparedness",      href: "MySafetyPlan",         color: C.red     },
  { emoji: "🏥", label: "Discharge Plan",    sub: "Your release roadmap",     href: "DischargePlan",        color: "#F472B6" },
];

export default function ParticipantDashboard() {
  const { data: user, isLoading: uL } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: checkIns = [] } = useQuery({
    queryKey: ["participant-dash-checkins", user?.email],
    queryFn: () => base44.entities.DailyCheckIn.filter({ participant_email: user.email }, "-check_in_date", 30),
    enabled: !!user?.email,
  });

  const { data: goals = [] } = useQuery({
    queryKey: ["participant-dash-goals", user?.email],
    queryFn: () => base44.entities.Goal.filter({ participant_email: user.email, status: "active" }, "-created_date", 5),
    enabled: !!user?.email,
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ["participant-dash-sessions", user?.email],
    queryFn: () => base44.entities.TelehealthSession.filter({ participant_email: user.email, status: "scheduled" }, "scheduled_date", 3),
    enabled: !!user?.email,
  });

  if (uL) return (
    <div style={{ background: C.navy, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Loader2 style={{ width: 28, height: 28, color: C.teal }} className="animate-spin" />
    </div>
  );

  const today = new Date().toISOString().split("T")[0];
  const checkedToday = checkIns.some(c => c.check_in_date === today);
  const firstName = user?.full_name?.split(" ")[0] || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // Streak
  const streak = (() => {
    const sorted = [...checkIns].sort((a,b) => new Date(b.check_in_date) - new Date(a.check_in_date));
    let n = 0, cur = new Date(); cur.setHours(0,0,0,0);
    for (const c of sorted) {
      const d = new Date(c.check_in_date); d.setHours(0,0,0,0);
      if (Math.round((cur-d)/86400000) <= 1) { n++; cur=d; } else break;
    }
    return n;
  })();

  const sevenAgo = new Date(); sevenAgo.setDate(sevenAgo.getDate() - 7);
  const last7 = checkIns.filter(c => new Date(c.check_in_date) >= sevenAgo);
  const weeklyMeetings = last7.filter(c => c.attended_meeting).length;
  const avgCraving = last7.length ? last7.reduce((s,c) => s + (c.craving_intensity ?? 5), 0) / last7.length : 5;
  const stability = last7.length ? Math.round(
    Math.min(last7.length/7,1)*25 +
    (last7.filter(c=>c.attended_meeting).length/Math.max(last7.length,1))*25 +
    (last7.filter(c=>c.connected_with_sponsor).length/Math.max(last7.length,1))*25 +
    Math.max(0,(10-avgCraving)/10)*25
  ) : null;
  const stabColor = !stability ? C.teal : stability >= 75 ? C.emerald : stability >= 50 ? C.gold : C.red;
  const stabLabel = !stability ? "Start Tracking" : stability >= 75 ? "Stable" : stability >= 50 ? "Monitor" : "Needs Attention";

  const nextSession = sessions[0];

  return (
    <div style={{ background: `linear-gradient(170deg,#070D1C 0%,#0B1424 55%,#080E1C 100%)`, minHeight: "100vh", paddingBottom: 120 }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>

        {/* ── Hero ──────────────────────────────────────────────── */}
        <div style={{ background: "linear-gradient(155deg,#0E1D3A,#081426)", padding: "56px 24px 32px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -80, right: -80, width: 320, height: 320, borderRadius: "50%",
            background: "radial-gradient(circle,rgba(62,207,191,0.08) 0%,transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 12 }}>
              {greeting}, {firstName}
            </p>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: "#fff", lineHeight: 1.15, marginBottom: 10 }}>
              My Dashboard
            </h1>
            <p style={{ fontSize: 14, color: C.slate, marginBottom: 24, lineHeight: 1.6 }}>
              Your personal recovery command center.
            </p>

            {/* CTA */}
            <Link to={createPageUrl("DailyCheckIn")} style={{ textDecoration: "none" }}>
              <button style={{ width: "100%", padding: "15px 20px", borderRadius: 16,
                background: checkedToday ? "rgba(16,185,129,0.12)" : `linear-gradient(135deg,${C.teal},#2CB8AE)`,
                border: checkedToday ? "1px solid rgba(16,185,129,0.3)" : "none",
                color: checkedToday ? C.emerald : "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer",
                boxShadow: checkedToday ? "none" : "0 10px 32px rgba(62,207,191,0.28)" }}>
                {checkedToday ? "✓ Today's Check-In Complete — View Progress" : "Complete Today's Check-In →"}
              </button>
            </Link>
          </div>
        </div>

        <div style={{ padding: "20px 16px" }}>

          {/* ── Stats strip ─────────────────────────────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
            {[
              { label: "Streak", value: streak, unit: "days", color: C.gold },
              { label: "Meetings", value: weeklyMeetings, unit: "this week", color: C.emerald },
              { label: "Stability", value: stability ? `${stability}%` : "—", unit: stabLabel, color: stabColor },
            ].map(s => (
              <div key={s.label} style={{ ...C.glass, borderRadius: 18, padding: "16px 14px", textAlign: "center" }}>
                <p style={{ fontSize: 26, fontWeight: 900, color: s.color, lineHeight: 1, marginBottom: 3 }}>{s.value}</p>
                <p style={{ fontSize: 10, color: C.muted, marginBottom: 2 }}>{s.unit}</p>
                <p style={{ fontSize: 11, fontWeight: 700, color: C.slate }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* ── Upcoming session ────────────────────────────────── */}
          {nextSession && (
            <div style={{ ...C.glass, borderRadius: 18, padding: "16px 18px", marginBottom: 20,
              background: "rgba(91,110,245,0.07)", border: "1px solid rgba(91,110,245,0.25)" }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#818CF8", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 8 }}>
                📅 Upcoming Session
              </p>
              <p style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>{nextSession.title || nextSession.session_type?.replace(/_/g, " ")}</p>
              <p style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>
                {nextSession.scheduled_date} at {nextSession.scheduled_time} · {nextSession.provider_name || "Your counselor"}
              </p>
              {nextSession.meeting_url && (
                <a href={nextSession.meeting_url} target="_blank" rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 10, padding: "8px 16px", borderRadius: 10,
                    background: "rgba(91,110,245,0.2)", border: "1px solid rgba(91,110,245,0.4)",
                    color: "#818CF8", textDecoration: "none", fontSize: 12, fontWeight: 700 }}>
                  Join Session →
                </a>
              )}
            </div>
          )}

          {/* ── Active goals ────────────────────────────────────── */}
          {goals.length > 0 && (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: ".07em" }}>🎯 Active Goals</p>
                <Link to={createPageUrl("MyGoals")} style={{ textDecoration: "none" }}>
                  <span style={{ fontSize: 12, color: C.teal, fontWeight: 700 }}>See all →</span>
                </Link>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                {goals.slice(0, 3).map(goal => (
                  <div key={goal.id} style={{ ...C.glass, borderRadius: 14, padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{goal.title}</p>
                      <span style={{ fontSize: 13, fontWeight: 800, color: C.teal }}>{goal.progress_percentage || 0}%</span>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 4, height: 5, overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 4, width: `${goal.progress_percentage || 0}%`,
                        background: `linear-gradient(90deg,${C.teal},#2CB8AE)` }} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── Quick actions grid ──────────────────────────────── */}
          <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 14 }}>
            Quick Access
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
            {QUICK_ACTIONS.map(action => (
              <Link key={action.href} to={createPageUrl(action.href)} style={{ textDecoration: "none" }}>
                <div style={{ ...C.glass, borderRadius: 18, padding: "16px 14px",
                  transition: "border-color .15s ease" }}>
                  <div style={{ fontSize: 24, marginBottom: 10 }}>{action.emoji}</div>
                  <p style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginBottom: 3 }}>{action.label}</p>
                  <p style={{ fontSize: 11, color: C.muted, lineHeight: 1.4 }}>{action.sub}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* ── Crisis strip ────────────────────────────────────── */}
          <div style={{ ...C.glass, borderRadius: 18, padding: "16px 18px", textAlign: "center", marginBottom: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 10 }}>
              Always Available
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              {[
                { href: "tel:988", label: "Call 988", sub: "Crisis Line", bg: "rgba(220,38,38,0.15)", border: "rgba(220,38,38,0.3)", color: "#F87171" },
                { href: "/MySafetyPlan", label: "Safety Plan", sub: "Your plan", bg: "rgba(139,92,246,0.12)", border: "rgba(139,92,246,0.3)", color: "#A78BFA", isLink: true },
                { href: "sms:741741", label: "Text HOME", sub: "to 741741", bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.3)", color: "#60A5FA" },
              ].map(x => x.isLink ? (
                <Link key={x.href} to={x.href} style={{ flex: 1, textDecoration: "none", background: x.bg,
                  border: `1px solid ${x.border}`, borderRadius: 12, padding: "12px 8px", textAlign: "center" }}>
                  <p style={{ fontWeight: 800, color: x.color, fontSize: 12, lineHeight: 1.3 }}>{x.label}</p>
                  <p style={{ fontSize: 10, color: x.color, marginTop: 2, opacity: .75 }}>{x.sub}</p>
                </Link>
              ) : (
                <a key={x.href} href={x.href} style={{ flex: 1, textDecoration: "none", background: x.bg,
                  border: `1px solid ${x.border}`, borderRadius: 12, padding: "12px 8px", textAlign: "center" }}>
                  <p style={{ fontWeight: 800, color: x.color, fontSize: 12, lineHeight: 1.3 }}>{x.label}</p>
                  <p style={{ fontSize: 10, color: x.color, marginTop: 2, opacity: .75 }}>{x.sub}</p>
                </a>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}