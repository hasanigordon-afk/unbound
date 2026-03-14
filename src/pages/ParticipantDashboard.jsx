import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { CalendarCheck, Video, MessageSquare, Briefcase, Home, Gift, Compass, CheckCircle2, Loader2 } from "lucide-react";

const MODULES = [
  {
    title: "Daily Check-In",
    desc: "Track your mood, cravings, and meetings",
    icon: CalendarCheck,
    color: "#4A90E2",
    bg: "#EBF5FF",
    page: "DailyCheckIn",
    emoji: "✅",
  },
  {
    title: "Telehealth",
    desc: "Video sessions, sponsor calls, group meetings",
    icon: Video,
    color: "#8B5CF6",
    bg: "#F5F3FF",
    page: "TelehealthHub",
    emoji: "📹",
  },
  {
    title: "Messages",
    desc: "Talk to your counselor or mentor",
    icon: MessageSquare,
    color: "#22C55E",
    bg: "#F0FDF4",
    page: "ParticipantMessages",
    emoji: "💬",
  },
  {
    title: "Employment",
    desc: "Jobs, second-chance employers, resume tips",
    icon: Briefcase,
    color: "#F59E0B",
    bg: "#FFFBEB",
    page: "EmploymentOpportunities",
    emoji: "💼",
  },
  {
    title: "Housing",
    desc: "Sober living, shelter, transitional housing",
    icon: Home,
    color: "#EF4444",
    bg: "#FEF2F2",
    page: "HousingAssistance",
    emoji: "🏠",
  },
  {
    title: "Benefits",
    desc: "Medicaid, SNAP, ID, Social Security",
    icon: Gift,
    color: "#16A34A",
    bg: "#F0FDF4",
    page: "BenefitsAssistance",
    emoji: "🎁",
  },
  {
    title: "Find Help",
    desc: "Resources near you — food, shelter, treatment",
    icon: Compass,
    color: "#6B7280",
    bg: "#F9FAFB",
    page: "FindHelpNow",
    emoji: "📍",
  },
];

export default function ParticipantDashboard() {
  const { data: user, isLoading } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: checkIns = [] } = useQuery({
    queryKey: ["daily-checkins-dashboard", user?.email],
    queryFn: () => base44.entities.DailyCheckIn.filter({ participant_email: user.email }, "-check_in_date", 7),
    enabled: !!user,
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ["telehealth-sessions-dashboard", user?.email],
    queryFn: () => base44.entities.TelehealthSession.filter({ participant_email: user?.email }),
    enabled: !!user,
  });

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#F7F7F8" }}>
      <Loader2 className="w-6 h-6 animate-spin opacity-30" />
    </div>
  );

  const today = new Date().toISOString().split("T")[0];
  const checkedInToday = checkIns.some(c => c.check_in_date === today);
  const upcomingSessions = sessions.filter(s => s.scheduled_date >= today && s.status !== "cancelled");
  const firstName = user?.full_name?.split(" ")[0] || "there";
  const streak = (() => {
    const sorted = [...checkIns].sort((a, b) => new Date(b.check_in_date) - new Date(a.check_in_date));
    let count = 0; let cur = new Date(); cur.setHours(0, 0, 0, 0);
    for (const c of sorted) {
      const d = new Date(c.check_in_date); d.setHours(0, 0, 0, 0);
      if (Math.round((cur - d) / 86400000) <= 1) { count++; cur = d; } else break;
    }
    return count;
  })();

  return (
    <div className="min-h-screen pb-28" style={{ background: "#F7F7F8" }}>
      {/* Header */}
      <div className="px-5 pt-8 pb-5" style={{ background: "#FFF", borderBottom: "1px solid #D1D1D6" }}>
        <p className="text-sm" style={{ color: "#8E8E93" }}>Good {new Date().getHours() < 12 ? "morning" : "afternoon"}, {firstName}</p>
        <h1 className="text-2xl font-bold mt-0.5" style={{ color: "#1E1E1E" }}>Your Recovery Hub</h1>

        {/* Status strip */}
        <div className="flex gap-3 mt-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
            {checkedInToday
              ? <CheckCircle2 className="w-4 h-4" style={{ color: "#22C55E" }} />
              : <CalendarCheck className="w-4 h-4" style={{ color: "#8E8E93" }} />}
            <p className="text-xs font-semibold" style={{ color: checkedInToday ? "#16A34A" : "#8E8E93" }}>
              {checkedInToday ? "Checked in ✓" : "Check-in due"}
            </p>
          </div>
          {streak > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "#FFF7ED", border: "1px solid #FED7AA" }}>
              <span>🔥</span>
              <p className="text-xs font-semibold" style={{ color: "#D97706" }}>{streak} day streak</p>
            </div>
          )}
          {upcomingSessions.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "#F5F3FF", border: "1px solid #DDD6FE" }}>
              <Video className="w-4 h-4" style={{ color: "#8B5CF6" }} />
              <p className="text-xs font-semibold" style={{ color: "#7C3AED" }}>{upcomingSessions.length} session{upcomingSessions.length !== 1 ? "s" : ""}</p>
            </div>
          )}
        </div>
      </div>

      {/* Module grid */}
      <div className="px-5 py-5">
        <p className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: "#8E8E93" }}>All Services</p>
        <div className="grid grid-cols-2 gap-3">
          {MODULES.map(m => (
            <Link key={m.page} to={createPageUrl(m.page)} style={{ textDecoration: "none" }}>
              <div className="p-4 rounded-2xl h-full" style={{ background: "#FFF", border: "1px solid #E5E7EB" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3" style={{ background: m.bg }}>
                  {m.emoji}
                </div>
                <p className="font-bold text-sm mb-1" style={{ color: "#1E1E1E" }}>{m.title}</p>
                <p className="text-xs" style={{ color: "#8E8E93", lineHeight: 1.4 }}>{m.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Upcoming session card */}
        {upcomingSessions[0] && (
          <div className="mt-5 p-4 rounded-2xl" style={{ background: "#F5F3FF", border: "1px solid #DDD6FE" }}>
            <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#7C3AED" }}>Next Session</p>
            <p className="font-bold text-sm" style={{ color: "#1E1E1E" }}>
              {upcomingSessions[0].session_type?.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "#5A5A5A" }}>
              {new Date(upcomingSessions[0].scheduled_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} at {upcomingSessions[0].scheduled_time}
              {upcomingSessions[0].provider_name ? ` with ${upcomingSessions[0].provider_name}` : ""}
            </p>
            {upcomingSessions[0].meeting_url && (
              <a href={upcomingSessions[0].meeting_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 rounded-xl text-sm font-bold"
                style={{ background: "#8B5CF6", color: "#FFF" }}>
                <Video className="w-4 h-4" /> Join Session
              </a>
            )}
          </div>
        )}

        {/* Crisis strip */}
        <div className="mt-5 flex gap-3">
          <a href="tel:988" className="flex-1 text-center py-3 rounded-xl font-bold text-sm" style={{ background: "#FEF2F2", color: "#EF4444", border: "1px solid #FCA5A5" }}>
            📞 988 Crisis
          </a>
          <a href="tel:211" className="flex-1 text-center py-3 rounded-xl font-bold text-sm" style={{ background: "#EBF5FF", color: "#4A90E2", border: "1px solid #BFDBFE" }}>
            📞 211 Help
          </a>
        </div>
      </div>
    </div>
  );
}