import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { Flame, CalendarCheck, Star, TrendingUp, CheckCircle2, Circle } from "lucide-react";
import RecoveryInsightsTab from "../components/progress/RecoveryInsightsTab";

const DAYS = ["S","M","T","W","T","F","S"];

function CheckInGrid({ checkIns }) {
  const days = Array.from({ length: 28 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (27 - i));
    d.setHours(0, 0, 0, 0);
    const key = d.toISOString().split("T")[0];
    const found = checkIns.find(c => c.check_in_date === key);
    return { key, date: d, found };
  });

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 5, marginBottom: 4 }}>
        {DAYS.map((d, i) => (
          <p key={i} style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase" }}>{d}</p>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 5 }}>
        {days.map(({ key, found }) => (
          <div key={key} style={{
            aspectRatio: "1", borderRadius: 8,
            background: found ? "#4A90E2" : "#F1F5F9",
            border: `1px solid ${found ? "#3B82F6" : "#E2E8F0"}`,
          }} />
        ))}
      </div>
      <p style={{ fontSize: 11, color: "#94A3B8", marginTop: 8, textAlign: "right" }}>Last 28 days</p>
    </div>
  );
}

export default function ClientProgress() {
  const [activeTab, setActiveTab] = useState("overview");
  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: checkIns = [] } = useQuery({
    queryKey: ["progress-checkins", user?.email],
    queryFn: () => base44.entities.DailyCheckIn.filter({ participant_email: user.email }, "-check_in_date", 90),
    enabled: !!user,
  });

  const { data: milestones = [] } = useQuery({
    queryKey: ["progress-milestones", user?.email],
    queryFn: () => base44.entities.ForwardPlanMilestone.filter({ participant_email: user.email }, "sort_order"),
    enabled: !!user,
  });

  // Streak
  const streak = (() => {
    const sorted = [...checkIns].sort((a, b) => new Date(b.check_in_date) - new Date(a.check_in_date));
    let count = 0;
    let cur = new Date(); cur.setHours(0, 0, 0, 0);
    for (const c of sorted) {
      const d = new Date(c.check_in_date); d.setHours(0, 0, 0, 0);
      if (Math.round((cur - d) / 86400000) <= 1) { count++; cur = d; } else break;
    }
    return count;
  })();

  const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recent7  = checkIns.filter(c => new Date(c.check_in_date) >= sevenDaysAgo);
  const recent30 = checkIns.filter(c => new Date(c.check_in_date) >= thirtyDaysAgo);
  const rate7  = Math.round((recent7.length  / 7)  * 100);
  const rate30 = Math.round((recent30.length / 30) * 100);

  const meetingsLast30 = recent30.filter(c => c.attended_meeting).length;
  const sponsorLast30  = recent30.filter(c => c.connected_with_sponsor).length;
  const avgMood = recent7.length ? (recent7.reduce((s, c) => s + (c.mood_rating || 0), 0) / recent7.length).toFixed(1) : "—";

  const completedMilestones = milestones.filter(m => m.completed);
  const totalMilestones     = milestones.length;

  const BADGES = [
    { id: "first_checkin",   emoji: "🌱", label: "First Check-In",     unlocked: checkIns.length >= 1 },
    { id: "streak_3",        emoji: "🔥", label: "3 Days Strong",       unlocked: streak >= 3 },
    { id: "streak_7",        emoji: "⭐", label: "7-Day Streak",        unlocked: streak >= 7 },
    { id: "streak_30",       emoji: "🏆", label: "30 Days!",            unlocked: streak >= 30 },
    { id: "ten_checkins",    emoji: "💪", label: "10 Check-Ins",        unlocked: checkIns.length >= 10 },
    { id: "meeting_goer",    emoji: "🤝", label: "Meeting Goer",        unlocked: meetingsLast30 >= 3 },
    { id: "connected",       emoji: "💬", label: "Staying Connected",   unlocked: sponsorLast30 >= 3 },
    { id: "goal_getter",     emoji: "🎯", label: "Goal Getter",         unlocked: completedMilestones.length >= 1 },
  ];

  return (
    <div style={{ background: "#F5F5F7", minHeight: "100vh", paddingBottom: 100 }}>

      {/* Header */}
      <div style={{ background: "#FFFFFF", padding: "32px 20px 16px", borderBottom: "1px solid #E5E7EB" }}>
        <p style={{ fontSize: 13, color: "#8E8E93", fontWeight: 500, marginBottom: 4 }}>Your journey</p>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1E1E1E", lineHeight: 1.25, marginBottom: 16 }}>My Progress</h1>
        {/* Tab switcher */}
        <div style={{ display: "flex", gap: 6 }}>
          {[
            { id: "overview", label: "Overview" },
            { id: "insights", label: "Recovery Insights" },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer",
                background: activeTab === tab.id ? "#1E1E1E" : "#F0F0F3",
                color: activeTab === tab.id ? "#FFF" : "#5A5A5A",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "insights" && (
        <div style={{ padding: "20px", maxWidth: 480, margin: "0 auto" }}>
          <RecoveryInsightsTab checkIns={checkIns} />
        </div>
      )}

      {activeTab === "overview" && (
      <div style={{ padding: "20px", maxWidth: 480, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Streak hero */}
        <div style={{
          background: streak >= 7 ? "linear-gradient(135deg, #F59E0B, #D97706)" : streak >= 1 ? "linear-gradient(135deg, #4A90E2, #3B7DD8)" : "#F8FAFC",
          border: streak === 0 ? "1px solid #E2E8F0" : "none",
          borderRadius: 20, padding: "24px 24px",
          display: "flex", alignItems: "center", gap: 18,
        }}>
          <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 16, padding: "14px", flexShrink: 0 }}>
            <Flame className="w-8 h-8" style={{ color: streak > 0 ? "#FFF" : "#94A3B8" }} strokeWidth={1.5} />
          </div>
          <div>
            <p style={{ fontSize: 42, fontWeight: 800, color: streak > 0 ? "#FFF" : "#1E1E1E", lineHeight: 1 }}>{streak}</p>
            <p style={{ fontSize: 14, fontWeight: 600, color: streak > 0 ? "rgba(255,255,255,0.85)" : "#64748B", marginTop: 2 }}>
              {streak === 0 ? "Start your streak today" : streak === 1 ? "day in a row — nice start!" : `days in a row — keep going!`}
            </p>
          </div>
        </div>

        {/* Check-in grid */}
        <div style={{ background: "#FFF", border: "1px solid #E2E8F0", borderRadius: 18, padding: "20px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <CalendarCheck className="w-5 h-5" style={{ color: "#4A90E2" }} strokeWidth={1.5} />
            <p style={{ fontSize: 15, fontWeight: 700, color: "#1E1E1E" }}>Check-In History</p>
          </div>
          <CheckInGrid checkIns={checkIns} />
        </div>

        {/* Stats grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <StatCard icon="📅" label="Last 7 days" value={`${rate7}%`} sub="check-in rate"
            color={rate7 >= 70 ? "#16A34A" : rate7 >= 40 ? "#D97706" : "#DC2626"} />
          <StatCard icon="📆" label="Last 30 days" value={`${rate30}%`} sub="check-in rate"
            color={rate30 >= 70 ? "#16A34A" : rate30 >= 40 ? "#D97706" : "#DC2626"} />
          <StatCard icon="🤝" label="Meetings" value={meetingsLast30} sub="last 30 days" color="#4A90E2" />
          <StatCard icon="😊" label="Avg mood" value={avgMood} sub="last 7 days" color="#8B5CF6" />
        </div>

        {/* Goals progress */}
        {totalMilestones > 0 && (
          <div style={{ background: "#FFF", border: "1px solid #E2E8F0", borderRadius: 18, padding: "20px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <TrendingUp className="w-5 h-5" style={{ color: "#4A90E2" }} strokeWidth={1.5} />
                <p style={{ fontSize: 15, fontWeight: 700, color: "#1E1E1E" }}>My Plan Goals</p>
              </div>
              <Link to={createPageUrl("ForwardPlan")} style={{ fontSize: 13, color: "#4A90E2", fontWeight: 600, textDecoration: "none" }}>
                View all →
              </Link>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
              <p style={{ fontSize: 32, fontWeight: 800, color: "#1E1E1E", lineHeight: 1 }}>
                {completedMilestones.length}<span style={{ fontSize: 16, fontWeight: 600, color: "#94A3B8" }}>/{totalMilestones}</span>
              </p>
              <div style={{ flex: 1 }}>
                <div style={{ background: "#F1F5F9", borderRadius: 8, height: 10, overflow: "hidden" }}>
                  <div style={{
                    background: "#4A90E2", height: "100%", borderRadius: 8,
                    width: `${Math.round((completedMilestones.length / totalMilestones) * 100)}%`,
                  }} />
                </div>
                <p style={{ fontSize: 12, color: "#94A3B8", marginTop: 4 }}>
                  {Math.round((completedMilestones.length / totalMilestones) * 100)}% complete
                </p>
              </div>
            </div>
            {/* Recent milestones */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {milestones.slice(0, 5).map(m => (
                <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {m.completed
                    ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "#16A34A" }} strokeWidth={1.5} />
                    : <Circle className="w-4 h-4 flex-shrink-0" style={{ color: "#CBD5E1" }} strokeWidth={1.5} />}
                  <p style={{ fontSize: 13, color: m.completed ? "#16A34A" : "#64748B", lineHeight: 1.4 }}>
                    {m.milestone_text?.replace(/^(3-Year|1-Year|90-Day):\s*/i, "")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Badges */}
        <div style={{ background: "#FFF", border: "1px solid #E2E8F0", borderRadius: 18, padding: "20px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Star className="w-5 h-5" style={{ color: "#F59E0B" }} strokeWidth={1.5} />
            <p style={{ fontSize: 15, fontWeight: 700, color: "#1E1E1E" }}>Milestones</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {BADGES.map(b => (
              <div key={b.id} style={{
                background: b.unlocked ? "#F0FDF4" : "#F8FAFC",
                border: `1px solid ${b.unlocked ? "#86EFAC" : "#E2E8F0"}`,
                borderRadius: 14, padding: "14px 14px",
                display: "flex", alignItems: "center", gap: 10,
                opacity: b.unlocked ? 1 : 0.5,
              }}>
                <span style={{ fontSize: 24, lineHeight: 1, flexShrink: 0, filter: b.unlocked ? "none" : "grayscale(1)" }}>{b.emoji}</span>
                <p style={{ fontSize: 12, fontWeight: 700, color: b.unlocked ? "#15803D" : "#94A3B8", lineHeight: 1.3 }}>{b.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent check-ins */}
        <div style={{ background: "#FFF", border: "1px solid #E2E8F0", borderRadius: 18, padding: "20px 20px" }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: "#1E1E1E", marginBottom: 14 }}>Recent Check-Ins</p>
          {checkIns.length === 0 && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <p style={{ color: "#94A3B8", fontSize: 14 }}>No check-ins yet. Start today!</p>
              <Link to={createPageUrl("DailyCheckIn")} style={{ textDecoration: "none" }}>
                <div style={{ display: "inline-block", marginTop: 12, background: "#4A90E2", color: "#FFF", borderRadius: 12, padding: "10px 24px", fontWeight: 700, fontSize: 14 }}>
                  Check In Now
                </div>
              </Link>
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {checkIns.slice(0, 7).map(c => {
              const MOODS = ["", "😢", "😕", "😐", "🙂", "😊"];
              return (
                <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "#F8FAFC", borderRadius: 12 }}>
                  <p style={{ fontSize: 22, lineHeight: 1, flexShrink: 0 }}>{MOODS[c.mood_rating] || "😐"}</p>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#1E1E1E" }}>{c.check_in_date}</p>
                    <p style={{ fontSize: 11, color: "#94A3B8" }}>
                      {c.attended_meeting ? "✓ Meeting" : "No meeting"} · {c.connected_with_sponsor ? "✓ Support contact" : "No contact"}
                    </p>
                  </div>
                  {c.needs_help && (
                    <span style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", borderRadius: 20, padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>Needed help</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div style={{ background: "#FFF", border: "1px solid #E2E8F0", borderRadius: 16, padding: "18px 16px" }}>
      <p style={{ fontSize: 20, marginBottom: 8 }}>{icon}</p>
      <p style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 26, fontWeight: 800, color, lineHeight: 1, marginBottom: 2 }}>{value}</p>
      <p style={{ fontSize: 11, color: "#94A3B8" }}>{sub}</p>
    </div>
  );
}