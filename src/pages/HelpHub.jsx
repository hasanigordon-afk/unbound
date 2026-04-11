import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  ClipboardList, CheckSquare, MapPin, Users, CalendarCheck,
  Phone, ArrowRight, Plus, Building2, Briefcase, Home, Utensils,
  Car, Heart, Shirt
} from "lucide-react";

const C = {
  help:    "#6366F1",
  teal:    "#2DD4BF",
  gold:    "#C9A96E",
  emerald: "#10B981",
  muted:   "rgba(241,245,249,0.4)",
  glass:   { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20 },
};

const RESOURCE_CATS = [
  { icon: <Home className="w-5 h-5"/>,     label: "Housing",     color: "#6366F1", href: "/NJHousingSearch" },
  { icon: <Utensils className="w-5 h-5"/>, label: "Food",        color: "#10B981", href: "/FindHelpNow" },
  { icon: <Briefcase className="w-5 h-5"/>,label: "Jobs",        color: C.gold,    href: "/EmploymentOpportunities" },
  { icon: <Car className="w-5 h-5"/>,      label: "Transport",   color: "#F59E0B", href: "/FindHelpNow" },
  { icon: <Heart className="w-5 h-5"/>,    label: "Treatment",   color: "#F472B6", href: "/RecoveryMapFinder" },
  { icon: <Shirt className="w-5 h-5"/>,    label: "Necessities", color: "#34D399", href: "/FindHelpNow" },
];

function ModuleCard({ icon: Icon, title, sub, href, color, badge }) {
  return (
    <Link to={href} style={{ textDecoration: "none" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 14, padding: "16px 18px",
        background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 18, marginBottom: 10, cursor: "pointer",
      }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, flexShrink: 0,
          background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", color }}>
          <Icon className="w-5 h-5" />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 15, fontWeight: 800, color: "#fff", marginBottom: 2 }}>{title}</p>
          <p style={{ fontSize: 12, color: C.muted }}>{sub}</p>
        </div>
        {badge && (
          <span style={{ fontSize: 11, fontWeight: 800, padding: "3px 9px", borderRadius: 20,
            background: `${color}20`, color, border: `1px solid ${color}40` }}>{badge}</span>
        )}
        <ArrowRight style={{ color: C.muted, width: 15, height: 15, flexShrink: 0 }} />
      </div>
    </Link>
  );
}

export default function HelpHub() {
  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: tasks = [] } = useQuery({
    queryKey: ["help-tasks", user?.email],
    queryFn: () => base44.entities.RecoveryPathTask.filter({ user_email: user.email, completion_status: "pending" }, "-created_date", 5),
    enabled: !!user?.email,
  });

  const { data: checkIns = [] } = useQuery({
    queryKey: ["help-checkins", user?.email],
    queryFn: () => base44.entities.DailyCheckIn.filter({ participant_email: user.email }, "-check_in_date", 7),
    enabled: !!user?.email,
  });

  const meetingThisWeek = checkIns.filter(c => c.attended_meeting).length;
  const pendingTasks = tasks.length;

  return (
    <div style={{ background: "linear-gradient(170deg,#07090F 0%,#0A0F1A 100%)", minHeight: "100vh", paddingBottom: 110 }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ padding: "60px 20px 28px", background: "linear-gradient(155deg,#0D1040,#080E1C)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -60, right: -40, width: 260, height: 260, borderRadius: "50%",
            background: "radial-gradient(circle,rgba(99,102,241,0.12) 0%,transparent 70%)", pointerEvents: "none" }} />
          <p style={{ fontSize: 11, fontWeight: 800, color: "#818CF8", textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 6 }}>Help</p>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "#fff", lineHeight: 1.15, marginBottom: 8 }}>
            You don't have to<br/>figure it all out today.
          </h1>
          <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.65 }}>
            Your plan, your people, your tasks — one step at a time. It's all right here.
          </p>

          {/* Quick stats */}
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            {[
              { label: "Pending Tasks", value: pendingTasks, color: "#818CF8" },
              { label: "Meetings This Week", value: meetingThisWeek, color: C.teal },
            ].map(s => (
              <div key={s.label} style={{ flex: 1, padding: "12px 14px", borderRadius: 14,
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <p style={{ fontSize: 26, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: "20px 16px" }}>

          {/* My Plan */}
          <p style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>My Plan</p>
          <ModuleCard icon={ClipboardList} title="My Aftercare Plan" sub="Your goals, appointments, and what comes next" href="/AftercarePlan" color="#6366F1" />
          <ModuleCard icon={ClipboardList} title="Build My Plan" sub="Answer a few questions — we'll build a roadmap with you" href="/AftercarePlanBuilder" color="#8B5CF6" />

          {/* My Tasks */}
          <p style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: "1px", marginTop: 18, marginBottom: 10 }}>My Tasks</p>
          <ModuleCard icon={CheckSquare} title="Today's Action Steps" sub="Small steps. Real progress. Check them off." href="/RecoveryPath" color={C.teal} badge={pendingTasks > 0 ? `${pendingTasks} pending` : undefined} />
          <ModuleCard icon={CheckSquare} title="My Weekly Goals" sub="What are you working toward this week?" href="/GoalBoard" color={C.emerald} />

          {/* Resources */}
          <p style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: "1px", marginTop: 18, marginBottom: 10 }}>Find What You Need</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
            {RESOURCE_CATS.map(r => (
              <Link key={r.label} to={r.href} style={{ textDecoration: "none" }}>
                <div style={{ padding: "14px 10px", borderRadius: 16, textAlign: "center",
                  background: `${r.color}10`, border: `1px solid ${r.color}25`, cursor: "pointer" }}>
                  <div style={{ color: r.color, display: "flex", justifyContent: "center", marginBottom: 6 }}>{r.icon}</div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>{r.label}</p>
                </div>
              </Link>
            ))}
          </div>
          <ModuleCard icon={MapPin} title="Find Help Near Me" sub="Real resources in your area — housing, food, treatment, and more" href="/RecoveryMapFinder" color="#F59E0B" />

          {/* Support Contacts */}
          <p style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: "1px", marginTop: 18, marginBottom: 10 }}>Your People</p>
          <ModuleCard icon={Users} title="My Support Circle" sub="The people in your corner — sponsor, counselor, family, friends" href="/InnerCircle" color="#F472B6" />
          <ModuleCard icon={Phone} title="Crisis Line — 988" sub="Available 24/7. Free. Confidential. No judgment." href="tel:988" color="#EF4444" />

          {/* Meetings */}
          <p style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: "1px", marginTop: 18, marginBottom: 10 }}>Meetings</p>
          <ModuleCard icon={CalendarCheck} title="Log a Meeting" sub="AA, NA, SMART Recovery, or wherever you showed up" href="/DailyCheckIn" color={C.gold} badge={meetingThisWeek === 0 ? "Log one" : `${meetingThisWeek} this week`} />
          <ModuleCard icon={Building2} title="Find a Meeting" sub="Search for meetings happening near you" href="/RecoveryMapFinder" color="#818CF8" />

        </div>
      </div>
    </div>
  );
}