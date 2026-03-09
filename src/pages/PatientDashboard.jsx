import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle, ChevronRight, CalendarCheck } from "lucide-react";

const QUICK_ACTIONS = [
  { label: "Housing", sub: "Shelter & stable housing", emoji: "🏠", href: "FindHelpNow?category=Housing" },
  { label: "Food", sub: "Food banks & free meals", emoji: "🍽️", href: "FindHelpNow?category=Food Pantry" },
  { label: "Jobs", sub: "Employment support", emoji: "💼", href: "FindHelpNow?category=Employment Assistance" },
  { label: "Meetings", sub: "AA, NA & recovery groups", emoji: "🤝", href: "Meetings" },
  { label: "Benefits & ID", sub: "Government services", emoji: "🪪", href: "FindHelpNow?category=Reentry Services" },
  { label: "Talk to Someone", sub: "Your support team", emoji: "💬", href: "ParticipantMessages" },
];

export default function PatientDashboard() {
  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: checkIns = [] } = useQuery({
    queryKey: ["daily-checkins", user?.email],
    queryFn: () => base44.entities.DailyCheckIn.filter({ participant_email: user.email }, "-check_in_date", 30),
    enabled: !!user,
  });

  const { data: profile } = useQuery({
    queryKey: ["participant-profile-home", user?.email],
    queryFn: async () => {
      const p = await base44.entities.ParticipantProfile.filter({ participant_email: user.email });
      return p[0] || null;
    },
    enabled: !!user,
  });

  const today = new Date().toISOString().split("T")[0];
  const hasCheckedInToday = checkIns.some((c) => c.check_in_date === today);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recent7 = checkIns.filter((c) => new Date(c.check_in_date) >= sevenDaysAgo);
  const compliancePct = Math.min(100, Math.round((recent7.length / 7) * 100));

  const sobrietyDays = profile?.sobriety_start_date
    ? Math.floor((new Date() - new Date(profile.sobriety_start_date)) / 86400000)
    : null;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = user?.full_name?.split(" ")[0] || "there";

  return (
    <div style={{ background: "#F5F5F7", minHeight: "100vh", paddingBottom: "100px" }}>
      {/* Header */}
      <div style={{ background: "#FFFFFF", padding: "28px 20px 20px", borderBottom: "1px solid #E5E7EB" }}>
        <p style={{ fontSize: "13px", color: "#8E8E93", marginBottom: "4px" }}>Welcome back, {firstName}</p>
        <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#1E1E1E", lineHeight: "1.2" }}>
          What do you need today?
        </h1>
      </div>

      <div style={{ padding: "20px", maxWidth: "480px", margin: "0 auto" }}>

        {/* Check-In CTA */}
        {!hasCheckedInToday ? (
          <Link to={createPageUrl("DailyCheckIn")}>
            <div style={{
              background: "#4A90E2",
              borderRadius: "18px",
              padding: "20px 22px",
              marginBottom: "24px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              boxShadow: "0 4px 16px rgba(74,144,226,0.25)",
            }}>
              <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: "12px", padding: "10px", flexShrink: 0 }}>
                <CalendarCheck className="w-6 h-6" style={{ color: "#FFF" }} strokeWidth={2} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ color: "#FFF", fontWeight: "700", fontSize: "16px", marginBottom: "2px" }}>
                  Check in for today
                </p>
                <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "13px" }}>
                  30 seconds. No judgment.
                </p>
              </div>
              <ChevronRight className="w-5 h-5" style={{ color: "rgba(255,255,255,0.7)" }} strokeWidth={2} />
            </div>
          </Link>
        ) : (
          <div style={{
            background: "#F0FDF4",
            border: "1px solid #86EFAC",
            borderRadius: "18px",
            padding: "18px 22px",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}>
            <CheckCircle className="w-6 h-6 flex-shrink-0" style={{ color: "#16A34A" }} strokeWidth={2} />
            <div>
              <p style={{ color: "#15803D", fontWeight: "600", fontSize: "15px" }}>You showed up today ✓</p>
              <p style={{ color: "#16A34A", fontSize: "13px" }}>
                {recent7.length > 1 ? `${recent7.length} days this week. Keep moving forward.` : "Nice work. See you tomorrow."}
              </p>
            </div>
          </div>
        )}

        {/* What do you need today */}
        <p style={{ fontSize: "12px", fontWeight: "700", color: "#8E8E93", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "12px" }}>
          Find help
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "28px" }}>
          {QUICK_ACTIONS.map((action) => (
            <Link key={action.label} to={createPageUrl(action.href)}>
              <div style={{
                background: "#FFFFFF",
                border: "1px solid #E5E7EB",
                borderRadius: "16px",
                padding: "18px 14px",
                textAlign: "center",
                cursor: "pointer",
                transition: "box-shadow 0.15s ease",
              }}>
                <div style={{ fontSize: "30px", marginBottom: "8px", lineHeight: "1" }}>{action.emoji}</div>
                <p style={{ fontSize: "14px", fontWeight: "700", color: "#1E1E1E", marginBottom: "3px" }}>{action.label}</p>
                <p style={{ fontSize: "11px", color: "#8E8E93", lineHeight: "1.3" }}>{action.sub}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Your Week */}
        <p style={{ fontSize: "12px", fontWeight: "700", color: "#8E8E93", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "12px" }}>
          Your week
        </p>
        <div style={{
          background: "#FFFFFF",
          border: "1px solid #E5E7EB",
          borderRadius: "16px",
          padding: "20px",
          marginBottom: "24px",
          display: "flex",
          gap: "0",
        }}>
          <div style={{ flex: 1, textAlign: "center", borderRight: sobrietyDays !== null ? "1px solid #E5E7EB" : "none", paddingRight: "16px" }}>
            <p style={{ fontSize: "32px", fontWeight: "800", color: compliancePct >= 70 ? "#22C55E" : compliancePct >= 40 ? "#F59E0B" : "#EF4444", lineHeight: "1" }}>
              {compliancePct}%
            </p>
            <p style={{ fontSize: "12px", color: "#8E8E93", marginTop: "6px" }}>Check-ins</p>
            <p style={{ fontSize: "11px", color: "#B0B0B8", marginTop: "2px" }}>Last 7 days</p>
          </div>
          {sobrietyDays !== null ? (
            <div style={{ flex: 1, textAlign: "center", paddingLeft: "16px" }}>
              <p style={{ fontSize: "32px", fontWeight: "800", color: "#4A90E2", lineHeight: "1" }}>
                {sobrietyDays}
              </p>
              <p style={{ fontSize: "12px", color: "#8E8E93", marginTop: "6px" }}>Days sober</p>
              <p style={{ fontSize: "11px", color: "#B0B0B8", marginTop: "2px" }}>Keep moving forward</p>
            </div>
          ) : (
            <div style={{ flex: 1, textAlign: "center", paddingLeft: "16px" }}>
              <Link to={createPageUrl("Profile")}>
                <p style={{ fontSize: "13px", color: "#4A90E2", fontWeight: "600", lineHeight: "1.4" }}>
                  Add your sobriety date in your profile →
                </p>
              </Link>
            </div>
          )}
        </div>

        {/* Emergency Help */}
        <p style={{ fontSize: "12px", fontWeight: "700", color: "#8E8E93", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "12px" }}>
          Crisis support — always free
        </p>
        <div style={{ display: "flex", gap: "10px" }}>
          <a href="tel:988" style={{ flex: 1, background: "#FEF2F2", borderRadius: "14px", padding: "14px 10px", textAlign: "center", textDecoration: "none", display: "block" }}>
            <p style={{ fontWeight: "800", color: "#DC2626", fontSize: "18px", lineHeight: "1" }}>988</p>
            <p style={{ fontSize: "11px", color: "#DC2626", marginTop: "4px", fontWeight: "600" }}>Crisis Line</p>
          </a>
          <a href="tel:18006624357" style={{ flex: 1, background: "#FFF7ED", borderRadius: "14px", padding: "14px 10px", textAlign: "center", textDecoration: "none", display: "block" }}>
            <p style={{ fontWeight: "800", color: "#EA580C", fontSize: "12px", lineHeight: "1.3" }}>1-800-662-4357</p>
            <p style={{ fontSize: "11px", color: "#EA580C", marginTop: "4px", fontWeight: "600" }}>SAMHSA</p>
          </a>
          <a href="sms:741741" style={{ flex: 1, background: "#EFF6FF", borderRadius: "14px", padding: "14px 10px", textAlign: "center", textDecoration: "none", display: "block" }}>
            <p style={{ fontWeight: "800", color: "#2563EB", fontSize: "13px", lineHeight: "1.3" }}>Text HOME</p>
            <p style={{ fontSize: "11px", color: "#2563EB", marginTop: "4px", fontWeight: "600" }}>to 741741</p>
          </a>
        </div>

      </div>
    </div>
  );
}