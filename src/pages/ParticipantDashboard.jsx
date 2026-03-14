import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "./utils";
import {
  CalendarCheck, Target, MapPin, MessageCircle, Phone,
  CheckCircle2, Circle, ChevronRight, Heart, Loader2, AlertCircle
} from "lucide-react";

const BLUE = "#4A90E2";
const EMERALD = "#10B981";
const GOLD = "#F59E0B";
const PURPLE = "#8B5CF6";
const ROSE = "#EF4444";

const DEMO_CHECKINS = [
  { check_in_date: "2026-03-14", mood_rating: 4, craving_intensity: 3, attended_meeting: true },
  { check_in_date: "2026-03-13", mood_rating: 3, craving_intensity: 5, attended_meeting: false },
  { check_in_date: "2026-03-12", mood_rating: 4, craving_intensity: 2, attended_meeting: true },
  { check_in_date: "2026-03-11", mood_rating: 5, craving_intensity: 1, attended_meeting: true },
  { check_in_date: "2026-03-10", mood_rating: 4, craving_intensity: 3, attended_meeting: true },
];

const DEMO_GOALS = [
  { title: "Get a state ID", status: "active", category: "personal_growth" },
  { title: "Attend 3 meetings/week", status: "active", category: "daily_habits" },
  { title: "Apply for Medicaid", status: "active", category: "health" },
];

const DEMO_RESOURCES = [
  { organization_name: "NJ Peer Recovery Center", resource_category: "Peer Support", city: "Statewide", phone: "1-844-ReacNow" },
  { organization_name: "Community Food Bank of NJ", resource_category: "Food Pantry", city: "Hillside", phone: "(908) 355-3663" },
  { organization_name: "NJ Reentry Corporation", resource_category: "Reentry Services", city: "Statewide", phone: "(609) 396-3024" },
];

export default function ParticipantDashboard() {
  const navigate = useNavigate();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: checkIns = [] } = useQuery({
    queryKey: ["checkins-dash", user?.email],
    queryFn: () => base44.entities.DailyCheckIn.filter({ participant_email: user.email }, "-check_in_date", 7),
    enabled: !!user,
  });

  const { data: goals = [] } = useQuery({
    queryKey: ["goals-dash", user?.email],
    queryFn: () => base44.entities.Goal.filter({ created_by: user.email }),
    enabled: !!user,
  });

  const { data: allGoals = [] } = useQuery({
    queryKey: ["goals-dash-demo"],
    queryFn: () => base44.entities.Goal.list("-created_date", 3),
    enabled: !userLoading && goals.length === 0,
  });

  const { data: resources = [] } = useQuery({
    queryKey: ["resources-dash"],
    queryFn: () => base44.entities.USRecoveryResource.list("-created_date", 3),
  });

  const isDemo = !user;
  const displayCheckIns = checkIns.length > 0 ? checkIns : (isDemo ? DEMO_CHECKINS : []);
  const displayGoals = goals.length > 0 ? goals : (allGoals.length > 0 ? allGoals : DEMO_GOALS);
  const displayResources = resources.length > 0 ? resources : DEMO_RESOURCES;

  const firstName = user?.full_name?.split(" ")[0] || "Friend";
  const today = new Date().toISOString().split("T")[0];
  const hasCheckedInToday = checkIns.some(c => c.check_in_date === today);
  const latestCheckin = displayCheckIns[0];

  // Streak
  const streak = (() => {
    if (!displayCheckIns.length) return 0;
    const sorted = [...displayCheckIns].sort((a, b) => new Date(b.check_in_date) - new Date(a.check_in_date));
    let count = 0;
    let cur = new Date(); cur.setHours(0,0,0,0);
    for (const c of sorted) {
      const d = new Date(c.check_in_date); d.setHours(0,0,0,0);
      if (Math.round((cur - d) / 86400000) <= 1) { count++; cur = d; } else break;
    }
    return count;
  })();

  const MOOD_EMOJI = ["", "😢", "😕", "😐", "🙂", "😊"];
  const moodEmoji = latestCheckin ? MOOD_EMOJI[latestCheckin.mood_rating] || "🙂" : null;
  const cravingColor = !latestCheckin ? BLUE : latestCheckin.craving_intensity >= 7 ? ROSE : latestCheckin.craving_intensity >= 4 ? GOLD : EMERALD;

  const activeGoals = displayGoals.filter(g => g.status === "active");

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F5F5F7" }}>
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: BLUE }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: "#F5F5F7" }}>
      {isDemo && (
        <div style={{ background: BLUE, color: "#FFF", textAlign: "center", padding: "10px 16px", fontSize: 13 }}>
          👋 Demo mode — <button onClick={() => base44.auth.redirectToLogin()} style={{ fontWeight: 700, textDecoration: "underline", background: "none", border: "none", color: "#FFF", cursor: "pointer" }}>Sign in</button> to track your own recovery journey
        </div>
      )}

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 16px" }}>

        {/* Header */}
        <div style={{ paddingTop: 28, paddingBottom: 16 }}>
          <p style={{ fontSize: 13, color: "#8E8E93", marginBottom: 2 }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1E1E1E", lineHeight: 1.2 }}>
            {isDemo ? "Welcome to Unbound" : `Hey, ${firstName}`} 👋
          </h1>
          <p style={{ fontSize: 14, color: "#5A5A5A", marginTop: 4 }}>
            {isDemo ? "Your recovery journey starts here." : streak > 0 ? `${streak} day streak — keep going.` : "Ready to check in today?"}
          </p>
        </div>

        {/* Streak / Check-in Banner */}
        <Link to={createPageUrl("DailyCheckIn")} style={{ textDecoration: "none", display: "block", marginBottom: 14 }}>
          <div style={{
            background: hasCheckedInToday ? "rgba(16,185,129,0.08)" : "#FFFFFF",
            border: `1px solid ${hasCheckedInToday ? "rgba(16,185,129,0.3)" : "#D1D1D6"}`,
            borderRadius: 16, padding: "16px 18px",
            display: "flex", alignItems: "center", gap: 14,
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          }}>
            <div style={{ fontSize: 32 }}>🔥</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: 16, color: "#1E1E1E" }}>
                {hasCheckedInToday ? `${streak} day streak!` : streak > 0 ? `${streak} day streak` : "Start your streak"}
              </p>
              <p style={{ fontSize: 13, color: "#8E8E93" }}>
                {hasCheckedInToday ? "Check-in complete for today ✓" : "Tap to check in for today →"}
              </p>
            </div>
            {!hasCheckedInToday && (
              <div style={{ background: BLUE, color: "#FFF", borderRadius: 10, padding: "6px 12px", fontSize: 12, fontWeight: 700 }}>
                Check In
              </div>
            )}
          </div>
        </Link>

        {/* Mood + Craving Snapshot */}
        {latestCheckin && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
            <div style={{ background: "#FFFFFF", border: "1px solid #D1D1D6", borderRadius: 14, padding: "14px 16px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <p style={{ fontSize: 11, color: "#8E8E93", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 6 }}>Mood</p>
              <p style={{ fontSize: 28, lineHeight: 1 }}>{moodEmoji}</p>
              <p style={{ fontSize: 13, color: "#5A5A5A", marginTop: 4 }}>
                {["", "Very low", "Struggling", "Getting by", "Okay", "Good"][latestCheckin.mood_rating] || "—"}
              </p>
            </div>
            <div style={{ background: "#FFFFFF", border: "1px solid #D1D1D6", borderRadius: 14, padding: "14px 16px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <p style={{ fontSize: 11, color: "#8E8E93", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 6 }}>Craving</p>
              <p style={{ fontSize: 28, fontWeight: 800, lineHeight: 1, color: cravingColor }}>
                {latestCheckin.craving_intensity ?? "—"}
                <span style={{ fontSize: 14, fontWeight: 500, color: "#8E8E93" }}>/10</span>
              </p>
              <p style={{ fontSize: 13, color: "#5A5A5A", marginTop: 4 }}>
                {(latestCheckin.craving_intensity ?? 5) >= 7 ? "High — get support" : (latestCheckin.craving_intensity ?? 5) >= 4 ? "Moderate" : "Manageable"}
              </p>
            </div>
          </div>
        )}

        {/* Crisis Bar */}
        <div style={{ background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.15)", borderRadius: 14, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
          <AlertCircle style={{ width: 18, height: 18, color: ROSE, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#1E1E1E" }}>Need help right now?</p>
            <p style={{ fontSize: 12, color: "#5A5A5A" }}>988 Suicide & Crisis Lifeline · SAMHSA 1-800-662-4357</p>
          </div>
          <a href="tel:988" style={{ background: ROSE, color: "#FFF", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
            Call
          </a>
        </div>

        {/* Active Goals */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#8E8E93", textTransform: "uppercase", letterSpacing: "0.8px" }}>Active Goals</p>
            <Link to={createPageUrl("Goals")} style={{ fontSize: 12, color: BLUE, textDecoration: "none", fontWeight: 600 }}>View all →</Link>
          </div>
          {activeGoals.length === 0 ? (
            <Link to={createPageUrl("Goals")} style={{ textDecoration: "none" }}>
              <div style={{ background: "#FFFFFF", border: "1px dashed #D1D1D6", borderRadius: 14, padding: "18px 16px", textAlign: "center" }}>
                <Target style={{ width: 24, height: 24, color: "#C7C7CC", margin: "0 auto 8px" }} />
                <p style={{ fontSize: 14, color: "#8E8E93" }}>No goals yet — tap to set your first goal</p>
              </div>
            </Link>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {activeGoals.slice(0, 3).map((g, i) => (
                <Link key={g.id || i} to={createPageUrl("Goals")} style={{ textDecoration: "none" }}>
                  <div style={{ background: "#FFFFFF", border: "1px solid #D1D1D6", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                    <Circle style={{ width: 18, height: 18, color: "#C7C7CC", flexShrink: 0 }} />
                    <p style={{ fontSize: 14, color: "#1E1E1E", flex: 1 }}>{g.title}</p>
                    <ChevronRight style={{ width: 14, height: 14, color: "#C7C7CC", flexShrink: 0 }} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* My Plan (30/60/90) */}
        <Link to={createPageUrl("ForwardPlan")} style={{ textDecoration: "none", display: "block", marginBottom: 20 }}>
          <div style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.12), rgba(59,130,246,0.08))", border: "1px solid rgba(139,92,246,0.25)", borderRadius: 16, padding: "16px 18px", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ fontSize: 28 }}>📋</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: 15, color: "#1E1E1E" }}>My 90-Day Roadmap</p>
              <p style={{ fontSize: 13, color: "#5A5A5A" }}>Housing · Jobs · Legal · Health · and more</p>
            </div>
            <ChevronRight style={{ width: 18, height: 18, color: "#8E8E93" }} />
          </div>
        </Link>

        {/* Quick Actions Grid */}
        <p style={{ fontSize: 11, fontWeight: 700, color: "#8E8E93", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 12 }}>Quick Actions</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
          {[
            { label: "Find Help Near Me", icon: "📍", page: "FindHelpNow", color: BLUE },
            { label: "Meetings", icon: "🤝", page: "Meetings", color: EMERALD },
            { label: "Daily Check-In", icon: "✅", page: "DailyCheckIn", color: GOLD },
            { label: "Recovery Network", icon: "🌐", page: "RecoveryNetwork", color: PURPLE },
          ].map(item => (
            <Link key={item.page} to={createPageUrl(item.page)} style={{ textDecoration: "none" }}>
              <div style={{ background: "#FFFFFF", border: "1px solid #D1D1D6", borderRadius: 14, padding: "16px 14px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>{item.icon}</div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#1E1E1E" }}>{item.label}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Featured Resources */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#8E8E93", textTransform: "uppercase", letterSpacing: "0.8px" }}>Helpful Resources</p>
            <Link to={createPageUrl("FindHelpNow")} style={{ fontSize: 12, color: BLUE, textDecoration: "none", fontWeight: 600 }}>See all →</Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {displayResources.map((r, i) => (
              <div key={r.id || i} style={{ background: "#FFFFFF", border: "1px solid #D1D1D6", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <div style={{ fontSize: 22, flexShrink: 0 }}>
                  {r.resource_category === "Food Pantry" ? "🍽️" : r.resource_category === "Peer Support" ? "🤝" : r.resource_category === "Reentry Services" ? "🔄" : r.resource_category === "Housing" ? "🏠" : r.resource_category === "Mental Health" ? "🧠" : "📍"}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#1E1E1E" }}>{r.organization_name}</p>
                  <p style={{ fontSize: 12, color: "#8E8E93" }}>{r.resource_category}{r.city ? ` · ${r.city}` : ""}</p>
                </div>
                {r.phone && (
                  <a href={`tel:${r.phone}`} style={{ color: BLUE, flexShrink: 0 }}>
                    <Phone style={{ width: 16, height: 16 }} />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Crisis Hotlines */}
        <p style={{ fontSize: 11, fontWeight: 700, color: "#8E8E93", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 12 }}>Always Free · Always Available</p>
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <a href="tel:988" style={{ flex: 1, background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: 14, padding: "14px 8px", textAlign: "center", textDecoration: "none" }}>
            <p style={{ fontWeight: 900, color: ROSE, fontSize: 20 }}>988</p>
            <p style={{ fontSize: 11, color: "#5A5A5A", marginTop: 3 }}>Crisis Line</p>
          </a>
          <a href="tel:18006624357" style={{ flex: 1, background: "rgba(234,88,12,0.08)", border: "1px solid rgba(234,88,12,0.2)", borderRadius: 14, padding: "14px 8px", textAlign: "center", textDecoration: "none" }}>
            <p style={{ fontWeight: 700, color: "#EA580C", fontSize: 11 }}>1-800-662-HELP</p>
            <p style={{ fontSize: 11, color: "#5A5A5A", marginTop: 3 }}>SAMHSA</p>
          </a>
          <a href="sms:741741" style={{ flex: 1, background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 14, padding: "14px 8px", textAlign: "center", textDecoration: "none" }}>
            <p style={{ fontWeight: 700, color: BLUE, fontSize: 12 }}>Text HOME</p>
            <p style={{ fontSize: 11, color: "#5A5A5A", marginTop: 3 }}>to 741741</p>
          </a>
        </div>

      </div>
    </div>
  );
}