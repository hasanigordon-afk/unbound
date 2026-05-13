import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bell,
  BookOpen,
  Brain,
  CalendarCheck,
  CheckCircle2,
  Flame,
  HeartPulse,
  MapPin,
  MessageCircle,
  Moon,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import CommandCenterCard from "./CommandCenterCard";
import HomePrimaryCheckIn from "./HomePrimaryCheckIn";
import HomeRail from "./HomeRail";
import VeteranSupportModule from "./VeteranSupportModule";
import MomentumSnapshot from "./MomentumSnapshot";
import NonNegotiablesPreview from "@/components/nonnegotiables/NonNegotiablesPreview";

const moodBars = [42, 62, 50, 76, 68, 82, 74];

function SmallAction({ to, icon: Icon, label, color = "var(--accent)" }) {
  return (
    <Link to={to} style={{ textDecoration: "none" }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 13px",
        borderRadius: 16,
        background: "rgba(255,255,255,0.045)",
        border: "1px solid var(--border)",
        color: "var(--text)",
      }}>
        <Icon style={{ width: 17, height: 17, color }} />
        <span style={{ flex: 1, fontSize: 13, fontWeight: 800 }}>{label}</span>
        <ArrowRight style={{ width: 14, height: 14, color: "var(--text-dim)" }} />
      </div>
    </Link>
  );
}

function SectionTitle({ icon: Icon, label, sub }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
      <div style={{
        width: 34,
        height: 34,
        borderRadius: 13,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--navy-dim)",
        border: "1px solid var(--border-glow)",
        color: "var(--accent)",
      }}>
        <Icon style={{ width: 17, height: 17 }} />
      </div>
      <div>
        <h2 style={{ fontSize: 17, lineHeight: 1.1, margin: 0 }}>{label}</h2>
        {sub && <p style={{ fontSize: 11.5, color: "var(--text-dim)", marginTop: 3 }}>{sub}</p>}
      </div>
    </div>
  );
}

export default function CommandCenterDashboard({
  firstName,
  streak,
  stability,
  wellnessScore,
  stage,
  checkIns,
  journalCount,
  communityPostCount,
  campaignSettings,
}) {
  const todayComplete = checkIns?.some(c => {
    const d = new Date(c.check_in_date);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });
  const moodLabel = wellnessScore === null ? "Ready" : wellnessScore >= 70 ? "Steady" : wellnessScore >= 45 ? "Building" : "Tender";
  const goalProgress = stability ?? Math.min(100, Math.max(18, streak * 7));

  const reminders = [
    { label: todayComplete ? "Reflect on one win from today" : "Complete today’s check-in", to: "/DailyCheckIn", icon: CalendarCheck },
    { label: "Review your safety plan", to: "/MySafetyPlan", icon: ShieldCheck },
    { label: "Save one support resource", to: "/SavedResources", icon: MapPin },
  ];

  return (
    <main style={{ minHeight: "100vh", padding: "38px 0 170px", color: "var(--text)" }}>
      <div style={{ width: "min(1240px, calc(100vw - 40px))", margin: "0 auto" }}>
        <section style={{
          position: "relative",
          borderRadius: 32,
          padding: "clamp(34px, 5vw, 56px)",
          marginBottom: 34,
          background: "linear-gradient(135deg, rgba(91,141,239,0.22), rgba(13,18,32,0.78) 45%, rgba(52,211,153,0.12))",
          border: "1px solid var(--border-glow)",
          boxShadow: "var(--glow), var(--shadow)",
          overflow: "hidden",
        }}>
          <div aria-hidden style={{ position: "absolute", right: -80, top: -100, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(52,211,153,0.22), transparent 68%)", filter: "blur(22px)" }} />
          <div style={{ position: "relative", display: "flex", flexWrap: "wrap", gap: 30, alignItems: "flex-end", justifyContent: "space-between" }}>
            <div style={{ maxWidth: 660 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "6px 12px", borderRadius: 999, background: "rgba(255,255,255,0.08)", border: "1px solid var(--border)", color: "var(--accent)", fontSize: 11, fontWeight: 900, letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 14 }}>
                <Sparkles style={{ width: 13, height: 13 }} /> Recovery Command Center
              </div>
              <h1 style={{ fontSize: "clamp(34px, 5vw, 58px)", lineHeight: 1.02, margin: 0 }}>
                Good to see you, {firstName}.
              </h1>
              <p style={{ marginTop: 12, color: "var(--text-muted)", fontSize: 16, lineHeight: 1.65, maxWidth: 590 }}>
                One calm place to check in, track momentum, stay connected, and choose your next healthy step.
              </p>
            </div>
            <Link to="/DailyCheckIn" style={{ textDecoration: "none" }}>
              <button className="btn-primary" style={{ minWidth: 190 }}>
                Start Today’s Check-In
              </button>
            </Link>
          </div>
        </section>

        <HomePrimaryCheckIn todayComplete={todayComplete} />

        <NonNegotiablesPreview />

        <div style={{ display: "grid", gridTemplateColumns: "1.15fr .85fr", gap: 24, alignItems: "stretch" }}>
          <CommandCenterCard glow style={{ minHeight: 252 }}>
            <SectionTitle icon={Brain} label="AI Support" sub="Guidance without judgment." />
            <p style={{ color: "var(--text-muted)", fontSize: 15, lineHeight: 1.7, marginBottom: 18 }}>
              “You don’t have to solve your whole life today. Pick the next right action, then let that be enough.”
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <SmallAction to="/SuperAgent" icon={Sparkles} label="Ask for support" />
              <SmallAction to="/FiveWs" icon={Brain} label="Process a thought" color="var(--purple)" />
            </div>
          </CommandCenterCard>

          <MomentumSnapshot streak={streak} stage={stage} />
        </div>

        <VeteranSupportModule />

        <HomeRail
          title="Resources"
          sub="Find the right support quickly."
          icon={MapPin}
          items={[
            { to: "/MeetingDirectory", icon: Users, label: "Find a Meeting", description: "AA, NA, SMART and other recovery meetings near you." },
            { to: "/FindHelpNow", icon: MapPin, label: "Nearby Support", description: "Local help for food, housing, treatment, and urgent needs.", color: "var(--gold)" },
            { to: "/WellnessPlan", icon: BookOpen, label: "Wellness Plan", description: "Build nutrition, movement, and discipline routines.", color: "var(--green)" },
          ]}
        />

        <HomeRail
          title="Community"
          sub="Connection, stories, and proof that change is possible."
          icon={MessageCircle}
          items={[
            { to: "/AhHaCommunity", icon: Users, label: "Community Stories", description: `${communityPostCount || 0} posts shared. Read and connect with people rebuilding.`, color: "var(--purple)" },
            { to: "/ComebackPortal", icon: TrendingUp, label: "Comeback Videos", description: "Watch real stories of discipline, hope, and second chances.", color: "var(--gold)" },
            { to: "/HowDidYouDoIt", icon: MessageCircle, label: "Share Your Story", description: "Turn your experience into hope for someone else." },
          ]}
        />

        <HomeRail
          title="Recovery Tools"
          sub="Smaller utilities for when you need them."
          icon={Target}
          items={[
            ...reminders.map(item => ({ ...item, description: "A simple next step to keep today manageable." })),
            { to: "/Momentum", icon: Flame, label: "Momentum", description: "Track your rhythm and consistency.", color: "var(--gold)" },
            { to: "/MentalReset", icon: Moon, label: "Mood Reset", description: `Current signal: ${moodLabel}. Regulate and reset gently.`, color: "var(--green)" },
          ]}
        />

        {campaignSettings?.campaign_announcement_active && campaignSettings?.campaign_announcement && (
          <div style={{ marginTop: 34, padding: 18, borderRadius: 22, background: "var(--gold-dim)", border: "1px solid var(--gold-border)", color: "var(--gold)", fontWeight: 800 }}>
            {campaignSettings.campaign_announcement}
          </div>
        )}

        <p style={{ textAlign: "center", marginTop: 42, fontSize: 11, color: "var(--text-dim)", lineHeight: 1.7 }}>
          Re-siliant is a support tool, not a medical provider. In an emergency, call 911 or 988.
        </p>
      </div>

      <style>{`
        @media (max-width: 980px) {
          main [style*="grid-template-columns: 1.15fr .85fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}