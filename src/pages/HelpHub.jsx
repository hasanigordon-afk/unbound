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
  help:    "var(--indigo)",
  teal:    "var(--teal)",
  gold:    "var(--sand)",
  emerald: "var(--green)",
  muted:   "var(--text-muted)",
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
        display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
        background: "var(--card)", border: "1px solid var(--border)",
        borderRadius: "var(--r-lg)", marginBottom: 8, cursor: "pointer",
      }}>
        <div style={{ color: "var(--teal)", flexShrink:0 }}>
          <Icon className="w-4 h-4" />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>{title}</p>
          <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{sub}</p>
        </div>
        {badge && (
          <span className="pill pill-teal">{badge}</span>
        )}
        <ArrowRight style={{ color: "var(--text-dim)", width: 13, height: 13, flexShrink: 0 }} />
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
    <div style={{ background: "var(--bg)", minHeight: "100vh", paddingBottom: 110 }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ padding: "60px 20px 28px", background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "var(--teal)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 6 }}>Help</p>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text)", lineHeight: 1.2, marginBottom: 8 }}>
            You don't have to<br/>figure it all out today.
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.65 }}>
            Your plan, your people, your tasks — one step at a time. It's all right here.
          </p>

          <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
            {[
              { label: "Pending Tasks", value: pendingTasks, color: "var(--indigo)" },
              { label: "Meetings This Week", value: meetingThisWeek, color: "var(--teal)" },
            ].map(s => (
              <div key={s.label} className="card" style={{ flex: 1, padding: "12px 14px" }}>
                <p style={{ fontSize: 24, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 3 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: "20px 16px" }}>

          <p className="section-label">My Plan</p>

          {/* My Tasks */}
          <p className="section-label" style={{ marginTop: 16 }}>My Tasks</p>
          <ModuleCard icon={CheckSquare} title="Today's Action Steps" sub="Small steps. Real progress. Check them off." href="/RecoveryPath" color={C.teal} badge={pendingTasks > 0 ? `${pendingTasks} pending` : undefined} />
          <ModuleCard icon={CheckSquare} title="My Weekly Goals" sub="What are you working toward this week?" href="/GoalBoard" color={C.emerald} />

          <p className="section-label" style={{ marginTop: 16 }}>Find What You Need</p>
          <ModuleCard icon={MapPin} title="Find Help Near Me" sub="Real resources in your area — housing, food, treatment, and more" href="/RecoveryMapFinder" color="#F59E0B" />

          <p className="section-label" style={{ marginTop: 16 }}>Your People</p>

          <p className="section-label" style={{ marginTop: 16 }}>Meetings</p>
          <ModuleCard icon={CalendarCheck} title="Log a Meeting" sub="AA, NA, SMART Recovery, or wherever you showed up" href="/DailyCheckIn" color={C.gold} badge={meetingThisWeek === 0 ? "Log one" : `${meetingThisWeek} this week`} />
          <ModuleCard icon={Building2} title="Find a Meeting" sub="Search for meetings happening near you" href="/RecoveryMapFinder" color="#818CF8" />

        </div>
      </div>
    </div>
  );
}