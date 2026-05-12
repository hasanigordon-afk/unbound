import React, { useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "./utils";
import { Loader2 } from "lucide-react";
import CommandCenterDashboard from "@/components/dashboard/CommandCenterDashboard";

import DashFocusOfDay       from "@/components/dashboard/DashFocusOfDay";
import DashMomentum         from "@/components/dashboard/DashMomentum";
import DashQuickActions     from "@/components/dashboard/DashQuickActions";
import DashAIMentor         from "@/components/dashboard/DashAIMentor";
import DashResourceSnapshot from "@/components/dashboard/DashResourceSnapshot";
import DashCommunityMomentum from "@/components/dashboard/DashCommunityMomentum";
import SectionHeading       from "@/components/dashboard/SectionHeading";

import MarketingHero    from "@/components/home/MarketingHero";
import HomeTopNav from "@/components/home/HomeTopNav";
import PillarsGrid      from "@/components/home/PillarsGrid";
import EarlyWarningBanner from "@/components/home/EarlyWarningBanner";
import InAppNudge        from "@/components/subscription/InAppNudge";
import FeaturedComebackWidget from "@/components/home/FeaturedComebackWidget";
import ComebackPortalCard    from "@/components/home/ComebackPortalCard";
import WhoThisHelps from "@/components/home/WhoThisHelps";
import RecoveryTestimonialSection from "@/components/home/RecoveryTestimonialSection";
import InstitutionalPartnershipSection from "@/components/home/InstitutionalPartnershipSection";
import { trackHomeVisit } from "@/lib/subscriptionEngine";
import { getCampaignSettings } from "@/lib/campaignSettings";

/* ── Stage thresholds ────────────────────────────────────────────────────── */
const STAGES = [
  { name: "Ember",   minDays: 0  },
  { name: "Spark",   minDays: 7  },
  { name: "Flame",   minDays: 14 },
  { name: "Ascent",  minDays: 30 },
  { name: "Phoenix", minDays: 90 },
];
const getStage = (s) => [...STAGES].reverse().find(x => s >= x.minDays) || STAGES[0];

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => { trackHomeVisit(); }, []);

  /* ── Queries (unchanged) ────────────────────────────────────────────── */
  const { data: campaignSettings } = useQuery({
    queryKey: ["campaign-settings"],
    queryFn: getCampaignSettings,
  });

  const { data: user, isLoading: uL } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
    retry: false,
  });

  useEffect(() => {
    if (!uL && !user) navigate("/Resiliant", { replace: true });
  }, [uL, user, navigate]);

  const { data: profiles, isLoading: pL, isFetched: pF } = useQuery({
    queryKey: ["my-profile", user?.email],
    queryFn: () => base44.entities.MemberProfile.filter({ created_by: user.email }),
    enabled: !!user?.email, staleTime: 30_000,
  });

  const { data: checkIns = [] } = useQuery({
    queryKey: ["daily-checkins-home", user?.email],
    queryFn: () => base44.entities.DailyCheckIn.filter({ participant_email: user.email }, "-check_in_date", 90),
    enabled: !!user?.email,
  });

  const { data: journalEntries = [] } = useQuery({
    queryKey: ["home-journal-count", user?.email],
    queryFn: () => base44.entities.JournalEntry.filter({ created_by: user.email }, "-created_date", 30),
    enabled: !!user?.email, staleTime: 60_000,
  });

  const { data: communityPosts = [] } = useQuery({
    queryKey: ["home-community-count", user?.email],
    queryFn: () => base44.entities.CommunityPost.filter({ created_by: user.email }, "-created_date", 30),
    enabled: !!user?.email, staleTime: 60_000,
  });

  /* ── Onboarding redirect (unchanged) ────────────────────────────────── */
  useEffect(() => {
    if (!user || !pF) return;
    if (!profiles?.[0]?.onboarding_complete) navigate(createPageUrl("Onboarding"));
  }, [user, profiles, pF, navigate]);

  /* ── Derived values (unchanged) ─────────────────────────────────────── */
  const firstName = user?.full_name?.split(" ")[0] || "there";

  const sevenAgo = useMemo(() => { const d = new Date(); d.setDate(d.getDate() - 7); return d; }, []);
  const last7 = useMemo(() => checkIns.filter(c => new Date(c.check_in_date) >= sevenAgo), [checkIns, sevenAgo]);

  const streak = useMemo(() => {
    const sorted = [...checkIns].sort((a, b) => new Date(b.check_in_date) - new Date(a.check_in_date));
    let n = 0, cur = new Date(); cur.setHours(0, 0, 0, 0);
    for (const c of sorted) {
      const d = new Date(c.check_in_date); d.setHours(0, 0, 0, 0);
      if (Math.round((cur - d) / 86400000) <= 1) { n++; cur = d; } else break;
    }
    return n;
  }, [checkIns]);

  const avgCraving   = last7.length ? last7.reduce((s, c) => s + (c.craving_intensity ?? 5), 0) / last7.length : 5;
  const scoreCheckin = Math.min(last7.length / 7, 1) * 25;
  const scoreMeeting = last7.length ? (last7.filter(c => c.attended_meeting).length / last7.length) * 25 : 0;
  const scoreSponsor = last7.length ? (last7.filter(c => c.connected_with_sponsor).length / last7.length) * 25 : 0;
  const scoreCraving = Math.max(0, (10 - avgCraving) / 10) * 25;
  const hasData      = last7.length > 0;
  const stability    = hasData ? Math.round(scoreCheckin + scoreMeeting + scoreSponsor + scoreCraving) : null;

  const stage = getStage(streak);

  const cravingPostCount = checkIns.filter(c => (c.craving_intensity ?? 0) >= 7).length;

  const wellnessScore = hasData ? Math.round((scoreSponsor + scoreCraving) * 2) : null;

  /* ── Loading ────────────────────────────────────────────────────────── */
  if (uL || (!!user && pL)) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Loader2 className="animate-spin" style={{ width: 28, height: 28, color: "var(--accent)" }} />
    </div>
  );

  /* ── Render ─────────────────────────────────────────────────────────── */
  return (
    <CommandCenterDashboard
      firstName={firstName}
      streak={streak}
      stability={stability}
      wellnessScore={wellnessScore}
      stage={stage}
      checkIns={checkIns}
      journalCount={journalEntries.length}
      communityPostCount={communityPosts.length}
      campaignSettings={campaignSettings}
    />
  );
}