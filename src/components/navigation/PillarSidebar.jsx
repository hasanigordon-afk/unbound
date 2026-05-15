import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  User,
  HeartPulse,
  Hammer,
  Users,
  Sprout,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  Sparkles,
  HeartHandshake,
  Building2,
  Briefcase,
  Film,
  MessageCircle,
  Mic2,
  Dumbbell,
  BookOpen,
  Target,
  ChevronDown,
} from "lucide-react";

const SECTIONS = [
  {
    title: "Recovery & Support",
    icon: HeartPulse,
    accent: "var(--accent)",
    items: [
      { label: "Recovery Hub", href: "/DailyHub", icon: HeartPulse },
      { label: "Daily Check-In", href: "/DailyCheckIn", icon: CheckCircle2 },
      { label: "Meetings", href: "/MeetingDirectory", icon: MapPin },
      { label: "Safety Plan", href: "/MySafetyPlan", icon: ShieldCheck },
      { label: "AI Support", href: "/SuperAgent", icon: Sparkles },
      { label: "Crisis Lifeline", href: "/Lifeline", icon: HeartHandshake },
    ],
  },
  {
    title: "Reentry & Stability",
    icon: Hammer,
    accent: "var(--gold)",
    items: [
      { label: "Reentry Hub", href: "/RebuildHub", icon: Hammer },
      { label: "Find Help Now", href: "/FindHelpNow", icon: MapPin },
      { label: "Housing", href: "/NJHousingSearch", icon: Building2 },
      { label: "Veteran Support", href: "/VeteranSupportHub", icon: ShieldCheck },
      { label: "Resource Map", href: "/VeteranResourceMap", icon: MapPin },
      { label: "Jobs & Mentorship", href: "/EachOneTeachOne", icon: Briefcase },
    ],
  },
  {
    title: "Community & Mentorship",
    icon: Users,
    accent: "var(--purple)",
    items: [
      { label: "Community Hub", href: "/StoriesHub", icon: Users },
      { label: "Community Feed", href: "/AhHaCommunity", icon: MessageCircle },
      { label: "Share Your Story", href: "/SubmitAhHa", icon: Mic2 },
      { label: "Comeback Videos", href: "/ComebackPortal", icon: Film },
      { label: "Hope Hub", href: "/HopeHub", icon: HeartHandshake },
    ],
  },
  {
    title: "Growth & Future Building",
    icon: Sprout,
    accent: "var(--green)",
    items: [
      { label: "Growth Hub", href: "/GrowthHub", icon: Sprout },
      { label: "Wellness Plan", href: "/WellnessPlan", icon: Dumbbell },
      { label: "Mind & Body", href: "/MindBodyRecovery", icon: HeartPulse },
      { label: "Learn Recovery", href: "/LearnRecovery", icon: BookOpen },
      { label: "Future You", href: "/FutureYou", icon: Target },
    ],
  },
];

function NavItem({ item, active }) {
  const Icon = item.icon;
  return (
    <Link to={item.href} style={{ textDecoration: "none" }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "9px 10px",
        borderRadius: 13,
        color: active ? "var(--text)" : "var(--text-muted)",
        background: active ? "var(--navy-dim)" : "transparent",
        border: active ? "1px solid var(--border-glow)" : "1px solid transparent",
        transition: "all .18s ease",
      }}>
        <Icon style={{ width: 15, height: 15, flexShrink: 0 }} />
        <span style={{ fontSize: 12.5, fontWeight: 700 }}>{item.label}</span>
      </div>
    </Link>
  );
}

export default function PillarSidebar() {
  const location = useLocation();
  const path = location.pathname.toLowerCase();

  return (
    <aside className="hidden lg:flex" style={{
      position: "fixed",
      left: 18,
      top: 18,
      bottom: 18,
      zIndex: 45,
      width: 274,
      flexDirection: "column",
      padding: 14,
      borderRadius: 28,
      background: "linear-gradient(180deg, rgba(20,26,45,0.82), rgba(13,18,32,0.74))",
      border: "1px solid var(--border-glow)",
      boxShadow: "var(--glow), 0 24px 60px rgba(0,0,0,0.45)",
      backdropFilter: "blur(30px) saturate(160%)",
      WebkitBackdropFilter: "blur(30px) saturate(160%)",
      overflow: "hidden",
    }}>
      <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 11, padding: "8px 8px 16px" }}>
        <div style={{ width: 40, height: 40, borderRadius: 14, background: "linear-gradient(135deg, var(--accent), var(--purple))", boxShadow: "var(--glow)" }} />
        <div>
          <p style={{ color: "var(--text)", fontWeight: 900, fontSize: 15 }}>ReZilient</p>
          <p style={{ color: "var(--text-dim)", fontSize: 10, textTransform: "uppercase", letterSpacing: ".14em" }}>4-pillar ecosystem</p>
        </div>
      </Link>

      <div style={{ display: "grid", gap: 8, marginBottom: 12 }}>
        <NavItem item={{ label: "Home", href: "/", icon: Home }} active={path === "/"} />
        <NavItem item={{ label: "Profile", href: "/Profile", icon: User }} active={path === "/profile"} />
      </div>

      <div style={{ overflowY: "auto", paddingRight: 2, display: "grid", gap: 10 }}>
        {SECTIONS.map((section, index) => {
          const SectionIcon = section.icon;
          return (
            <details key={section.title} open={index < 2} style={{
              borderRadius: 18,
              background: "rgba(255,255,255,0.035)",
              border: "1px solid var(--border)",
              overflow: "hidden",
            }}>
              <summary style={{
                listStyle: "none",
                cursor: "pointer",
                padding: "12px 12px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                color: section.accent,
                fontWeight: 900,
                fontSize: 12,
              }}>
                <SectionIcon style={{ width: 16, height: 16 }} />
                <span style={{ flex: 1 }}>{section.title}</span>
                <ChevronDown style={{ width: 14, height: 14, color: "var(--text-dim)" }} />
              </summary>
              <div style={{ padding: "0 8px 8px", display: "grid", gap: 3 }}>
                {section.items.map(item => (
                  <NavItem key={item.href + item.label} item={item} active={path === item.href.toLowerCase()} />
                ))}
              </div>
            </details>
          );
        })}
      </div>
    </aside>
  );
}