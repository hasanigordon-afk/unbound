import React from "react";
import { Sun, CheckCircle2, Smile, Flame, Sparkles, Target, ListChecks, BookOpen, Bell, Heart } from "lucide-react";
import HubHero from "@/components/hubs/HubHero";
import HubFeatureCard from "@/components/hubs/HubFeatureCard";
import SectionHeading from "@/components/dashboard/SectionHeading";

const ACCENT = "var(--accent)";

const FEATURES = [
  { to: "/DailyCheckIn",   icon: CheckCircle2, label: "Daily Check-In",       desc: "Mark today. Stay accountable." },
  { to: "/DailyFlow",      icon: Sun,          label: "Daily Flow",            desc: "Morning intention + night reflection." },
  { to: "/Momentum",       icon: Flame,        label: "Recovery Streaks",      desc: "Track your momentum day by day." },
  { to: "/SuperAgent",     icon: Sparkles,     label: "AI Companion",          desc: "Talk it out. Get clarity." },
  { to: "/MyFoundation",   icon: Smile,        label: "Mood & Focus",          desc: "Check in with how you feel." },
  { to: "/ForwardPlan",    icon: Target,       label: "Goal Tracking",         desc: "Set and finish what matters." },
  { to: "/MyPath",         icon: ListChecks,   label: "Habit Tracking",        desc: "Build the routines that hold." },
  { to: "/Journal",        icon: BookOpen,     label: "Journaling",            desc: "Process the day in your own words." },
  { to: "/NotificationSettings", icon: Bell,   label: "Reminders",             desc: "Gentle nudges that keep you moving." },
  { to: "/TopFiveFocus",   icon: Heart,        label: "Daily Encouragement",   desc: "Your top 5 focus today." },
];

export default function DailyHub() {
  return (
    <div style={{ minHeight: "100vh", paddingBottom: 140, color: "var(--text)" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "20px 18px 0" }}>
        <HubHero
          pillar="Pillar 01 · Daily"
          title="Show up today."
          subtitle="Daily structure, accountability, focus, and routines that help you stay on track one day at a time."
          icon={Sun}
          accent={ACCENT}
        />

        <SectionHeading>Daily Tools</SectionHeading>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {FEATURES.map(f => <HubFeatureCard key={f.to} {...f} accent={ACCENT} />)}
        </div>
      </div>
    </div>
  );
}