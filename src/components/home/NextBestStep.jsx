import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../pages/utils";
import { ChevronRight } from "lucide-react";

function getNextStep(profile, recentCheckIn, hasCheckedInToday) {
  const needs    = profile?.support_needs || [];
  const goal     = profile?.goals?.[0] || "";
  const mood     = recentCheckIn?.mood_rating ?? 3;
  const craving  = recentCheckIn?.craving_level ?? 0;
  const needsHelp = recentCheckIn?.needs_help;

  if (!hasCheckedInToday) return {
    emoji: "✅", title: "Complete today's check-in",
    sub: "Stay on track — one day at a time.", href: "DailyCheckIn",
    color: "#4A90E2", bg: "#EBF5FF",
  };
  if (needsHelp || mood <= 2 || craving >= 4) return {
    emoji: "💙", title: "Talk to someone now",
    sub: "Your support contact is here for you.", href: "ParticipantMessages",
    color: "#7C3AED", bg: "#F5F3FF",
  };
  if (needs.includes("Housing") || goal === "coming_home") return {
    emoji: "🏠", title: "Find housing nearby",
    sub: "Shelter and transitional housing options.", href: "FindHelpNow?category=Housing",
    color: "#1D4ED8", bg: "#EBF5FF",
  };
  if (needs.includes("Food")) return {
    emoji: "🍽️", title: "Find food near you",
    sub: "Food banks and free meals in your area.", href: "FindHelpNow?category=Food Pantry",
    color: "#15803D", bg: "#F0FDF4",
  };
  if (needs.includes("Meetings") || needs.includes("Staying Sober") || goal === "staying_sober" || goal === "leaving_rehab") return {
    emoji: "🤝", title: "Find a meeting today",
    sub: "AA, NA, SMART Recovery — in person or online.", href: "Meetings",
    color: "#0F766E", bg: "#F0FDFA",
  };
  if (needs.includes("Employment") || goal === "getting_back") return {
    emoji: "💼", title: "Look at job resources",
    sub: "Employment support near you.", href: "FindHelpNow?category=Employment Assistance",
    color: "#7C3AED", bg: "#F5F3FF",
  };
  if (needs.includes("Benefits / ID Help")) return {
    emoji: "🪪", title: "Finish your benefits checklist",
    sub: "Government programs and ID help.", href: "FindHelpNow?category=Reentry Services",
    color: "#C2410C", bg: "#FFF7ED",
  };
  return {
    emoji: "📋", title: "See your plan",
    sub: "Review your goals and next steps.", href: "ForwardPlan",
    color: "#4A90E2", bg: "#EBF5FF",
  };
}

export default function NextBestStep({ profile, recentCheckIn, hasCheckedInToday }) {
  const step = getNextStep(profile, recentCheckIn, hasCheckedInToday);
  return (
    <div style={{ marginBottom: 24 }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: "#8E8E93", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 10 }}>
        Your next step
      </p>
      <Link to={createPageUrl(step.href)} style={{ textDecoration: "none", display: "block" }}>
        <div style={{
          background: step.bg, border: `1.5px solid ${step.color}33`,
          borderRadius: 18, padding: "20px", display: "flex", alignItems: "center", gap: 16,
        }}>
          <span style={{ fontSize: 30, flexShrink: 0, lineHeight: 1 }}>{step.emoji}</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, fontSize: 16, color: step.color, marginBottom: 3, lineHeight: 1.3 }}>{step.title}</p>
            <p style={{ fontSize: 13, color: "#5A5A5A", lineHeight: 1.4 }}>{step.sub}</p>
          </div>
          <ChevronRight className="w-5 h-5" style={{ color: `${step.color}80`, flexShrink: 0 }} />
        </div>
      </Link>
    </div>
  );
}