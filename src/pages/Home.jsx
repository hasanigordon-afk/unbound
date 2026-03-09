import React, { useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "./utils";
import { Loader2, ChevronRight, CalendarCheck, CheckCircle } from "lucide-react";

const NEEDS = [
  { label: "Housing", sub: "Shelter & stable housing", emoji: "🏠", href: "FindHelpNow?category=Housing" },
  { label: "Food", sub: "Food banks & free meals", emoji: "🍽️", href: "FindHelpNow?category=Food Pantry" },
  { label: "Jobs", sub: "Employment support", emoji: "💼", href: "FindHelpNow?category=Employment Assistance" },
  { label: "Meetings", sub: "AA, NA & recovery groups", emoji: "🤝", href: "Meetings" },
  { label: "Benefits & ID", sub: "Government services", emoji: "🪪", href: "FindHelpNow?category=Reentry Services" },
  { label: "Talk to Someone", sub: "Your support team", emoji: "💬", href: "ParticipantMessages" },
];

export default function Home() {
  const navigate = useNavigate();

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: profiles, isLoading } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => base44.entities.MemberProfile.filter({ created_by: user.email }),
    enabled: !!user,
  });

  const { data: checkIns = [] } = useQuery({
    queryKey: ["daily-checkins-home", user?.email],
    queryFn: () => base44.entities.DailyCheckIn.filter({ participant_email: user.email }, "-check_in_date", 30),
    enabled: !!user,
  });

  const profile = profiles?.[0];

  useEffect(() => {
    if (!isLoading && user && (!profile || !profile.onboarding_complete)) {
      navigate(createPageUrl("Onboarding"));
    }
  }, [isLoading, user, profile, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F5F5F7" }}>
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#4A90E2" }} />
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];
  const hasCheckedInToday = checkIns.some((c) => c.check_in_date === today);
  const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recent7 = checkIns.filter((c) => new Date(c.check_in_date) >= sevenDaysAgo);
  const streak = recent7.length;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = user?.full_name?.split(" ")[0] || "there";

  return (
    <div style={{ background: "#F5F5F7", minHeight: "100vh", paddingBottom: 100 }}>

      {/* Header */}
      <div style={{ background: "#FFFFFF", padding: "28px 20px 20px", borderBottom: "1px solid #E5E7EB" }}>
        <p style={{ fontSize: 13, color: "#8E8E93", marginBottom: 4 }}>{greeting}, {firstName}</p>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1E1E1E", lineHeight: 1.2 }}>
          What do you need today?
        </h1>
      </div>

      <div style={{ padding: "20px", maxWidth: 480, margin: "0 auto" }}>

        {/* Check-in CTA */}
        {!hasCheckedInToday ? (
          <Link to={createPageUrl("DailyCheckIn")}>
            <div style={{
              background: "#4A90E2",
              borderRadius: 18,
              padding: "20px 22px",
              marginBottom: 24,
              display: "flex",
              alignItems: "center",
              gap: 16,
              boxShadow: "0 4px 16px rgba(74,144,226,0.25)",
            }}>
              <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 12, padding: 10, flexShrink: 0 }}>
                <CalendarCheck className="w-6 h-6" style={{ color: "#FFF" }} strokeWidth={2} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ color: "#FFF", fontWeight: 700, fontSize: 16, marginBottom: 2 }}>Check in for today</p>
                <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 13 }}>Takes less than 30 seconds</p>
              </div>
              <ChevronRight className="w-5 h-5" style={{ color: "rgba(255,255,255,0.7)" }} />
            </div>
          </Link>
        ) : (
          <div style={{
            background: "#F0FDF4", border: "1px solid #86EFAC",
            borderRadius: 18, padding: "18px 22px", marginBottom: 24,
            display: "flex", alignItems: "center", gap: 14,
          }}>
            <CheckCircle className="w-6 h-6 flex-shrink-0" style={{ color: "#16A34A" }} />
            <div>
              <p style={{ color: "#15803D", fontWeight: 600, fontSize: 15 }}>You checked in today ✓</p>
              <p style={{ color: "#16A34A", fontSize: 13 }}>
                {streak > 1 ? `${streak} days this week — keep going.` : "Great. See you tomorrow."}
              </p>
            </div>
          </div>
        )}

        {/* Needs grid */}
        <p style={{ fontSize: 12, fontWeight: 700, color: "#8E8E93", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 12 }}>
          Help near you
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }}>
          {NEEDS.map((n) => (
            <Link key={n.label} to={createPageUrl(n.href)}>
              <div style={{
                background: "#FFFFFF", border: "1px solid #E5E7EB",
                borderRadius: 16, padding: "18px 14px", textAlign: "center",
              }}>
                <div style={{ fontSize: 28, marginBottom: 8, lineHeight: 1 }}>{n.emoji}</div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#1E1E1E", marginBottom: 3 }}>{n.label}</p>
                <p style={{ fontSize: 11, color: "#8E8E93", lineHeight: 1.3 }}>{n.sub}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* My Plan shortcut */}
        <p style={{ fontSize: 12, fontWeight: 700, color: "#8E8E93", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 12 }}>
          Your next steps
        </p>
        <Link to={createPageUrl("ForwardPlan")}>
          <div style={{
            background: "#FFFFFF", border: "1px solid #E5E7EB",
            borderRadius: 16, padding: "18px 20px", marginBottom: 12,
            display: "flex", alignItems: "center", gap: 14,
          }}>
            <span style={{ fontSize: 24 }}>📋</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#1E1E1E" }}>My Plan</p>
              <p style={{ fontSize: 12, color: "#8E8E93" }}>Goals, milestones & what's next</p>
            </div>
            <ChevronRight className="w-4 h-4" style={{ color: "#C7C7CC" }} />
          </div>
        </Link>
        <Link to={createPageUrl("Meetings")}>
          <div style={{
            background: "#FFFFFF", border: "1px solid #E5E7EB",
            borderRadius: 16, padding: "18px 20px", marginBottom: 28,
            display: "flex", alignItems: "center", gap: 14,
          }}>
            <span style={{ fontSize: 24 }}>📅</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#1E1E1E" }}>Find a Meeting</p>
              <p style={{ fontSize: 12, color: "#8E8E93" }}>AA, NA, SMART Recovery & more</p>
            </div>
            <ChevronRight className="w-4 h-4" style={{ color: "#C7C7CC" }} />
          </div>
        </Link>

        {/* Urgent help button */}
        <Link to={createPageUrl("UrgentHelp")}>
          <div style={{
            background: "#FEF2F2", border: "2px solid #FCA5A5", borderRadius: 18,
            padding: "18px 22px", marginBottom: 20,
            display: "flex", alignItems: "center", gap: 14,
          }}>
            <span style={{ fontSize: 26 }}>🆘</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 16, fontWeight: 800, color: "#DC2626" }}>Need help right now?</p>
              <p style={{ fontSize: 13, color: "#B91C1C" }}>Crisis, cravings, shelter, safety & more</p>
            </div>
            <ChevronRight className="w-5 h-5" style={{ color: "#FCA5A5" }} />
          </div>
        </Link>

        {/* Crisis numbers */}
        <p style={{ fontSize: 12, fontWeight: 700, color: "#8E8E93", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 12 }}>
          Always available
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <a href="tel:988" style={{ flex: 1, background: "#FEF2F2", borderRadius: 14, padding: "14px 10px", textAlign: "center", textDecoration: "none" }}>
            <p style={{ fontWeight: 800, color: "#DC2626", fontSize: 18, lineHeight: 1 }}>988</p>
            <p style={{ fontSize: 11, color: "#DC2626", marginTop: 4, fontWeight: 600 }}>Crisis Line</p>
          </a>
          <a href="tel:18006624357" style={{ flex: 1, background: "#FFF7ED", borderRadius: 14, padding: "14px 10px", textAlign: "center", textDecoration: "none" }}>
            <p style={{ fontWeight: 800, color: "#EA580C", fontSize: 11, lineHeight: 1.3 }}>1-800-662-4357</p>
            <p style={{ fontSize: 11, color: "#EA580C", marginTop: 4, fontWeight: 600 }}>SAMHSA</p>
          </a>
          <a href="sms:741741" style={{ flex: 1, background: "#EFF6FF", borderRadius: 14, padding: "14px 10px", textAlign: "center", textDecoration: "none" }}>
            <p style={{ fontWeight: 800, color: "#2563EB", fontSize: 13, lineHeight: 1.3 }}>Text HOME</p>
            <p style={{ fontSize: 11, color: "#2563EB", marginTop: 4, fontWeight: 600 }}>to 741741</p>
          </a>
        </div>

      </div>
    </div>
  );
}