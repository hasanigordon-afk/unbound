import React from "react";
import { Link } from "react-router-dom";
import { CalendarCheck } from "lucide-react";
import StartupHero from "@/components/home/StartupHero";
import DailyFocusWidget from "@/components/home/DailyFocusWidget";
import NonNegotiablesPreview from "@/components/nonnegotiables/NonNegotiablesPreview";
import FourPillarsSection from "@/components/home/FourPillarsSection";
import ComebackTimeline from "@/components/home/ComebackTimeline";
import AhHaVideoFeed from "@/components/home/AhHaVideoFeed";
import AISteinHomeSection from "@/components/home/AISteinHomeSection";
import ResourceMapSection from "@/components/home/ResourceMapSection";

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
  return (
    <main style={{ minHeight: "100vh", padding: "54px 0 190px", color: "var(--text)", background: "radial-gradient(circle at 50% 0%, rgba(91,141,239,0.10), transparent 34%)" }}>
      <div style={{ width: "min(1240px, calc(100vw - 40px))", margin: "0 auto" }}>
        <StartupHero />
        <DailyFocusWidget firstName={firstName} todayComplete={todayComplete} />
        <NonNegotiablesPreview />
        <FourPillarsSection />
        <ComebackTimeline />
        <AhHaVideoFeed />
        <AISteinHomeSection />
        <ResourceMapSection />

        {campaignSettings?.campaign_announcement_active && campaignSettings?.campaign_announcement && (
          <div style={{ marginTop: 34, padding: 18, borderRadius: 22, background: "var(--gold-dim)", border: "1px solid var(--gold-border)", color: "var(--gold)", fontWeight: 800 }}>
            {campaignSettings.campaign_announcement}
          </div>
        )}

        <p style={{ textAlign: "center", marginTop: 42, fontSize: 11, color: "var(--text-dim)", lineHeight: 1.7 }}>
          Re-siliant is a support tool, not a medical provider. In an emergency, call 911 or 988.
        </p>
      </div>
    </main>
  );
}