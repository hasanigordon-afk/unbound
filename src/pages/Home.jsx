import React, { useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "./utils";
import {
  Loader2, CheckCircle2, CalendarCheck, Users, MessageCircle,
  BookOpen, Briefcase, Target, ArrowRight, FileText, Home as HomeIcon,
  Heart, Megaphone,
} from "lucide-react";
import EarlyWarningBanner from "@/components/home/EarlyWarningBanner";
import DonateButton from "@/components/donate/DonateButton";
import InAppNudge from "@/components/subscription/InAppNudge";
import { trackHomeVisit } from "@/lib/subscriptionEngine";
import { getCampaignSettings } from "@/lib/campaignSettings";
import RecoveryScoreRing from "@/components/home/RecoveryScoreRing";
import MyFocusPill from "@/components/home/MyFocusPill";
import AhHaLogo from "@/components/shared/AhHaLogo";

/* ── Stage config ─────────────────────────────────────────────────────────── */
const STAGES = [
  { name: "Ember",   minDays: 0,  color: "#6B7A8D" },
  { name: "Spark",   minDays: 7,  color: "#D4915A" },
  { name: "Flame",   minDays: 14, color: "#C4A882" },
  { name: "Ascent",  minDays: 30, color: "#2E7D7A" },
  { name: "Phoenix", minDays: 90, color: "#7C5CBF" },
];
const getStage = (s) => [...STAGES].reverse().find(x => s >= x.minDays) || STAGES[0];

/* ── Today list ───────────────────────────────────────────────────────────── */
const TODAY_ITEMS = [
  { icon: <CalendarCheck className="w-4 h-4" />, label: "Daily Check-In",   sub: "30 seconds",         href: "DailyCheckIn"         },
  { icon: <Users         className="w-4 h-4" />, label: "Log Meeting",       sub: "AA · NA · SMART",    href: "Meetings"             },
  { icon: <MessageCircle className="w-4 h-4" />, label: "Reach Out",         sub: "Sponsor or mentor",  href: "ParticipantMessages"  },
  { icon: <BookOpen      className="w-4 h-4" />, label: "Read Something",    sub: "Education builds resilience", href: "RecoveryHub" },
  { icon: <Target        className="w-4 h-4" />, label: "Review My Plan",    sub: "Goals & progress",   href: "ForwardPlan"          },
];

/* ── Tools grid ───────────────────────────────────────────────────────────── */
const TOOLS = [
  { icon: <CalendarCheck className="w-4 h-4" />, label: "Check-In",  href: "DailyCheckIn"        },
  { icon: <FileText      className="w-4 h-4" />, label: "Goals",     href: "GoalBoard"            },
  { icon: <BookOpen      className="w-4 h-4" />, label: "Resources", href: "RecoveryHub"          },
  { icon: <Users         className="w-4 h-4" />, label: "Community", href: "VoicesOfRecovery"     },
  { icon: <Briefcase     className="w-4 h-4" />, label: "Jobs",      href: "EmploymentOpportunities"},
  { icon: <HomeIcon      className="w-4 h-4" />, label: "Housing",   href: "HousingAssistance"    },
  { icon: <FileText      className="w-4 h-4" />, label: "Journal",   href: "Journal"              },
  { icon: <MessageCircle className="w-4 h-4" />, label: "Messages",  href: "ParticipantMessages"  },
];

export default function Home() {
  const navigate = useNavigate();

  // Track home visit count (used by PushOptInPrompt)
  useEffect(() => { trackHomeVisit(); }, []);

  /* ── Queries ────────────────────────────────────────────────────────────── */
  const { data: campaignSettings } = useQuery({
    queryKey: ["campaign-settings"],
    queryFn: getCampaignSettings,
  });

  const { data: user, isLoading: uL } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
    retry: false,
  });

  // Send logged-out visitors to the public Onboarding landing
  useEffect(() => {
    if (!uL && !user) navigate("/Onboarding", { replace: true });
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

  // Real journal count for EarlyWarningBanner
  const { data: journalEntries = [] } = useQuery({
    queryKey: ["home-journal-count", user?.email],
    queryFn: () => base44.entities.JournalEntry.filter({ created_by: user.email }, "-created_date", 30),
    enabled: !!user?.email,
    staleTime: 60_000,
  });

  // Real community post count for EarlyWarningBanner
  const { data: communityPosts = [] } = useQuery({
    queryKey: ["home-community-count", user?.email],
    queryFn: () => base44.entities.CommunityPost.filter({ created_by: user.email }, "-created_date", 30),
    enabled: !!user?.email,
    staleTime: 60_000,
  });

  /* ── Onboarding redirect (unchanged) ────────────────────────────────────── */
  useEffect(() => {
    if (!user || !pF) return;
    if (!profiles?.[0]?.onboarding_complete) navigate(createPageUrl("Onboarding"));
  }, [user, profiles, pF, navigate]);

  /* ── Derived values ─────────────────────────────────────────────────────── */
  const today = new Date().toISOString().split("T")[0];
  const checked = checkIns.some(c => c.check_in_date === today);
  const firstName = user?.full_name?.split(" ")[0] || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

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
  const stabColor    = !hasData ? "#2E7D7A" : stability >= 75 ? "#34A853" : stability >= 50 ? "#2E7D7A" : "#E07A6C";
  const stabLabel    = !hasData ? "No data" : stability >= 75 ? "Stable" : stability >= 50 ? "At Risk" : "High Risk";

  const weeklyMeetings  = last7.filter(c => c.attended_meeting).length;
  const sponsorContacts = last7.filter(c => c.connected_with_sponsor).length;

  const stage    = getStage(streak);
  const stageIdx = STAGES.findIndex(s => s.name === stage.name);

  const cravingPostCount = checkIns.filter(c => (c.craving_intensity ?? 0) >= 7).length;

  /* ── Loading ────────────────────────────────────────────────────────────── */
  if (uL || (!!user && pL)) return (
    <div style={{ background: "#F7FAFC", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#2E7D7A" }} />
    </div>
  );

  /* ── Render ─────────────────────────────────────────────────────────────── */
  return (
    <div style={{ background: "#F7FAFC", minHeight: "100vh", paddingBottom: 120 }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .fu { animation: fadeUp 0.5s cubic-bezier(.22,1,.36,1) both; }
        .lift { transition: transform .15s ease, opacity .15s ease; cursor: pointer; }
        .lift:active { transform: scale(.975); opacity: .85; }
      `}</style>

      <div style={{ maxWidth: 480, margin: "0 auto" }}>

        {/* ── 1. HERO ─────────────────────────────────────────────────────── */}
        <div style={{ background: "#FFFFFF", borderBottom: "1px solid #E5EEF1", padding: "64px 24px 32px" }}>

          {/* Brand logo + admin/donate/greeting chip */}
          <div className="fu" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, gap: 8 }}>
            {/* Logo lockup */}
            <Link to={createPageUrl("Home")} style={{ textDecoration: "none" }}>
              <AhHaLogo size={44} showTagline={true} />
            </Link>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {campaignSettings?.donation_enabled && <DonateButton variant="pill" label="Donate" />}
              <span style={{
                fontSize: 11, fontWeight: 700, color: "#34A853", letterSpacing: ".04em",
                background: "rgba(52,168,83,.10)", border: "1px solid rgba(52,168,83,.22)",
                padding: "4px 12px", borderRadius: 20,
              }}>{greeting}</span>
            </div>
          </div>

          {/* Heading */}
          <h1 className="fu" style={{
            fontFamily: "'Lora', Georgia, serif", fontSize: 28, fontWeight: 600,
            lineHeight: 1.15, color: "#1F2933", marginBottom: 8, animationDelay: ".05s",
          }}>
            Good to see you,<br /><span style={{ color: "#2E7D7A" }}>{firstName}.</span>
          </h1>

          <p className="fu" style={{ fontSize: 14, color: "#4A5763", lineHeight: 1.7, marginBottom: 14, animationDelay: ".1s", maxWidth: 320 }}>
            Welcome back. Small steps still count — let's check in.
          </p>

          {/* Primary recovery focus pill */}
          {user?.email && <MyFocusPill userEmail={user.email} />}

          {/* CTA buttons */}
          <div className="fu" style={{ display: "flex", gap: 10, animationDelay: ".15s" }}>
            <Link to={createPageUrl("DailyCheckIn")} style={{ flex: 1, textDecoration: "none" }}>
              <button className="lift" style={{
                width: "100%", padding: "14px 18px", fontSize: 14,
                background: "#2E7D7A", color: "#fff", border: "none",
                borderRadius: 999, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
                boxShadow: "0 4px 14px rgba(46,125,122,0.22)",
              }}>
                {checked ? "Keep Going →" : "How are you feeling today?"}
              </button>
            </Link>
            <Link to={createPageUrl("RecoveryHub")} style={{ textDecoration: "none" }}>
              <button className="lift" style={{
                padding: "14px 22px", fontSize: 14, background: "#FFFFFF",
                color: "#4A5763", border: "1px solid #E5EEF1",
                borderRadius: 999, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
              }}>
                Explore
              </button>
            </Link>
          </div>

          {/* Stage progress bar */}
          <div className="fu" style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 22, animationDelay: ".2s" }}>
            {STAGES.map((s, i) => (
              <div key={s.name} style={{
                height: 4, flex: i === stageIdx ? 2 : 1, borderRadius: 2,
                background: i <= stageIdx ? s.color : "#E5EEF1",
                transition: "flex .3s ease",
              }} />
            ))}
            <span style={{ fontSize: 10, color: "#6B7280", marginLeft: 6, whiteSpace: "nowrap", fontWeight: 600 }}>
              {stage.name}
            </span>
          </div>
        </div>

        <div style={{ padding: "20px 16px 0" }}>

          {/* ── Campaign announcement banner ──────────────────────────────── */}
          {campaignSettings?.campaign_announcement_active && campaignSettings?.campaign_announcement && (
            <Link to="/Donate" style={{ textDecoration: "none", display: "block", marginBottom: 16 }}>
              <div style={{
                background: "linear-gradient(135deg, rgba(46,125,122,0.15), rgba(46,125,122,0.06))",
                border: "1px solid rgba(46,125,122,0.3)",
                borderRadius: 14, padding: "12px 14px",
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <Megaphone style={{ width: 18, height: 18, color: "#2E7D7A", flexShrink: 0 }} strokeWidth={1.8} />
                <p style={{ fontSize: 12, color: "#4A5763", lineHeight: 1.5, flex: 1 }}>
                  {campaignSettings.campaign_announcement}
                </p>
                <ArrowRight style={{ width: 14, height: 14, color: "#2E7D7A", flexShrink: 0 }} />
              </div>
            </Link>
          )}

          {/* ── 1.3. VETERANS HUB ────────────────────────────────────────────── */}
          <Link to="/veterans-dashboard" style={{ textDecoration: "none", display: "block", marginBottom: 12 }}>
            <div style={{
              background: "#EEF6FF",
              border: "1px solid rgba(30,136,229,0.16)",
              borderRadius: 22, padding: "20px",
              display: "flex", alignItems: "center", gap: 14,
              boxShadow: "0 2px 8px rgba(31,41,51,0.04)",
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                background: "rgba(30,136,229,0.14)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
              }}>🇺🇸</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: "#1E88E5", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 3 }}>Veterans Hub</p>
                <p style={{ fontSize: 15, fontWeight: 700, color: "#1F2933", marginBottom: 3 }}>Built for those who served</p>
                <p style={{ fontSize: 12, color: "#4A5763" }}>Support, connection, and purpose →</p>
              </div>
            </div>
          </Link>

          {/* ── 1.4. MIND-BODY RECOVERY ─────────────────────────────────────── */}
          <Link to="/MindBodyRecovery" style={{ textDecoration: "none", display: "block", marginBottom: 12 }}>
            <div style={{
              background: "#EAF7F5",
              border: "1px solid rgba(46,125,122,0.16)",
              borderRadius: 22, padding: "20px",
              display: "flex", alignItems: "center", gap: 14,
              boxShadow: "0 2px 8px rgba(31,41,51,0.04)",
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                background: "rgba(46,125,122,0.14)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
              }}>💪</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: "#2E7D7A", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 3 }}>Mind-Body Recovery</p>
                <p style={{ fontSize: 15, fontWeight: 700, color: "#1F2933", marginBottom: 3 }}>Move. Fuel. Reset.</p>
                <p style={{ fontSize: 12, color: "#4A5763" }}>A strong body supports a clear mind →</p>
              </div>
            </div>
          </Link>

          {/* ── 1.5. AH HA COMMUNITY ─────────────────────────────────────────── */}
          <Link to="/AhHaCommunity" style={{ textDecoration: "none", display: "block", marginBottom: 24 }}>
            <div style={{
              background: "#FFF7ED",
              border: "1px solid rgba(255,184,107,0.28)",
              borderRadius: 22, padding: "20px",
              display: "flex", alignItems: "center", gap: 14,
              boxShadow: "0 2px 8px rgba(31,41,51,0.04)",
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                background: "rgba(255,184,107,0.22)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
              }}>✨</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: "#C68A3E", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 3 }}>Recovery Stories</p>
                <p style={{ fontSize: 15, fontWeight: 700, color: "#1F2933", marginBottom: 3 }}>Real Ah Ha moments</p>
                <p style={{ fontSize: 12, color: "#4A5763" }}>Read how others found their turning point →</p>
              </div>
            </div>
          </Link>

          {/* ── 2. STATS ROW ──────────────────────────────────────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 20 }}>
            {/* Streak */}
            <div style={{ background: "#FFFFFF", border: ".5px solid #E5EEF1", borderRadius: 12, padding: "14px 10px", textAlign: "center" }}>
              <p style={{ fontSize: 28, fontWeight: 800, color: "#2E7D7A", lineHeight: 1, marginBottom: 4 }}>{streak}</p>
              <p style={{ fontSize: 9, color: "#6B7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em" }}>Day streak</p>
            </div>
            {/* Weekly score */}
            <div style={{ background: "#FFFFFF", border: ".5px solid #E5EEF1", borderRadius: 12, padding: "14px 10px", textAlign: "center" }}>
              <p style={{ fontSize: 28, fontWeight: 800, color: stabColor, lineHeight: 1, marginBottom: 4 }}>
                {stability !== null ? `${stability}%` : "—"}
              </p>
              <p style={{ fontSize: 9, color: "#6B7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em" }}>Weekly score</p>
            </div>
            {/* Checked in */}
            <div style={{ background: "#FFFFFF", border: ".5px solid #E5EEF1", borderRadius: 12, padding: "14px 10px", textAlign: "center" }}>
              <p style={{ fontSize: 17, fontWeight: 800, lineHeight: 1.2, marginBottom: 4, color: checked ? "#34A853" : "#6B7280" }}>
                {checked ? "Done ✓" : "Not yet"}
              </p>
              <p style={{ fontSize: 9, color: "#6B7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em" }}>Checked in</p>
            </div>
          </div>

          {/* ── 3. EARLY WARNING ──────────────────────────────────────────── */}
          {user && (
            <EarlyWarningBanner
              checkIns={checkIns}
              journalCount={journalEntries.length}
              communityPostCount={communityPosts.length}
              cravingPostCount={cravingPostCount}
            />
          )}

          {/* ── 3.5 SUBSCRIBER NUDGE (3 H's) ──────────────────────────────── */}
          <InAppNudge />

          {/* ── 4. TODAY LIST ─────────────────────────────────────────────── */}
          <p style={{ fontSize: 10, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 12 }}>
            Start here today
          </p>
          <div style={{ background: "#FFFFFF", border: ".5px solid #E5EEF1", borderRadius: 16, overflow: "hidden", marginBottom: 24 }}>
            {TODAY_ITEMS.map((item, i) => {
              const done = item.href === "DailyCheckIn" && checked;
              return (
                <Link key={item.label} to={createPageUrl(item.href)} className="lift" style={{ textDecoration: "none", display: "block" }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 14, padding: "14px 18px",
                    borderBottom: i < TODAY_ITEMS.length - 1 ? ".5px solid #E5EEF1" : "none",
                    background: "#FFFFFF",
                  }}>
                    {/* Icon box */}
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                      background: done ? "rgba(52,168,83,.10)" : "rgba(52,168,83,.10)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#34A853",
                    }}>
                      {item.icon}
                    </div>
                    {/* Text */}
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#1F2933", marginBottom: 1 }}>{item.label}</p>
                      <p style={{ fontSize: 11, color: "#6B7280" }}>{done ? "Done today" : item.sub}</p>
                    </div>
                    {/* Right indicator */}
                    {done ? (
                      <span style={{
                        fontSize: 11, fontWeight: 700, color: "#34A853",
                        background: "rgba(52,168,83,.10)", border: "1px solid rgba(52,168,83,.2)",
                        padding: "3px 10px", borderRadius: 20,
                      }}>Done ✓</span>
                    ) : (
                      <span style={{ color: "#6B7280", fontSize: 16 }}>›</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* ── 5. RECOVERY SCORE — CONTROL CENTER ────────────────────────── */}
          <p style={{ fontSize: 10, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 12 }}>
            This week
          </p>
          <div style={{
            background: "linear-gradient(180deg, #FFFFFF 0%, #F1F7F6 100%)",
            border: "1px solid #E5EEF1", borderRadius: 22,
            padding: "28px 20px 22px", marginBottom: 24,
            boxShadow: "0 4px 16px rgba(31,41,51,0.05)",
          }}>
            {/* Dominant ring */}
            <RecoveryScoreRing score={stability} size={210} stroke={14} />

            {/* Motivational line */}
            <p style={{
              textAlign: "center", marginTop: 18, marginBottom: 18,
              fontSize: 13, color: "#4A5763", lineHeight: 1.6, fontStyle: "italic",
              maxWidth: 320, marginLeft: "auto", marginRight: "auto",
            }}>
              {stability === null
                ? "Check in to start building your score."
                : stability >= 70
                  ? "You're focused. Your future is being built today."
                  : stability >= 40
                    ? "Stay steady. Small actions compound."
                    : "One check-in. One call. One step. That's enough."}
            </p>

            {/* Indicator pills */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                { label: "Check-ins",   done: last7.length >= 4 },
                { label: "Meetings",    done: last7.some(c => c.attended_meeting) },
                { label: "Sponsor",     done: last7.some(c => c.connected_with_sponsor) },
                { label: "Low Craving", done: avgCraving < 5 },
              ].map(ind => (
                <div key={ind.label} style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "10px 12px",
                  borderRadius: 10,
                  background: ind.done ? "rgba(52,168,83,.07)" : "#FDFAF6",
                  border: `.5px solid ${ind.done ? "rgba(52,168,83,.25)" : "#E5EEF1"}`,
                }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0, background: ind.done ? "#34A853" : "#C8C2BC" }} />
                  <p style={{ fontSize: 12, fontWeight: 600, color: ind.done ? "#1F2933" : "#6B7280" }}>{ind.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── 6. AFTERCARE PLAN ─────────────────────────────────────────── */}
          <p style={{ fontSize: 10, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 12 }}>
            My plan
          </p>
          <Link to="/AftercarePlanBuilder" className="lift" style={{ textDecoration: "none", display: "block", marginBottom: 24 }}>
            <div style={{
              background: "#EAF7F5",
              border: "1px solid rgba(46,125,122,0.16)",
              borderRadius: 22, padding: "20px",
              display: "flex", alignItems: "center", gap: 14,
              boxShadow: "0 2px 8px rgba(31,41,51,0.04)",
            }}>
              <span style={{ fontSize: 28, flexShrink: 0 }}>🗺️</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#1F2933", marginBottom: 3 }}>Aftercare Plan Builder</p>
                <p style={{ fontSize: 12, color: "#4A5763" }}>Build a personalised roadmap with AI</p>
              </div>
              <span style={{ color: "#34A853", fontSize: 18 }}>›</span>
            </div>
          </Link>

          {/* ── 7. TOOLS GRID ─────────────────────────────────────────────── */}
          <p style={{ fontSize: 10, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 12 }}>
            Tools
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 28 }}>
            {TOOLS.map(tool => (
              <Link key={tool.label} to={createPageUrl(tool.href)} className="lift" style={{ textDecoration: "none" }}>
                <div style={{
                  background: "#FFFFFF", border: ".5px solid #E5EEF1", borderRadius: 12,
                  padding: "14px 8px", display: "flex", flexDirection: "column",
                  alignItems: "center", gap: 7,
                }}>
                  <div style={{ color: "#34A853" }}>{tool.icon}</div>
                  <p style={{ fontSize: 10, fontWeight: 600, color: "#4A5763", textAlign: "center", lineHeight: 1.2 }}>{tool.label}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* ── Support the Mission ───────────────────────────────────────── */}
          {campaignSettings?.donation_enabled && (
            <>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 12 }}>
                Support the movement
              </p>
              <Link to="/Donate" className="lift" style={{ textDecoration: "none", display: "block", marginBottom: 24 }}>
                <div style={{
                  background: "linear-gradient(135deg, rgba(46,125,122,0.10), rgba(46,125,122,0.03))",
                  border: "1px solid rgba(46,125,122,0.3)",
                  borderRadius: 16, padding: "20px 20px",
                  display: "flex", alignItems: "center", gap: 14,
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: "rgba(46,125,122,0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Heart style={{ width: 22, height: 22, color: "#2E7D7A" }} fill="#2E7D7A" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#1F2933", marginBottom: 3 }}>
                      Support Recovery. Fuel Hope.
                    </p>
                    <p style={{ fontSize: 12, color: "#4A5763" }}>
                      Help us reach more people who need this →
                    </p>
                  </div>
                </div>
              </Link>
            </>
          )}

          {/* ── 8. CRISIS BUTTONS ─────────────────────────────────────────── */}
          <p style={{ fontSize: 10, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 12 }}>
            24/7 Support
          </p>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {[
              { href: "tel:988",          label: "988 Crisis" },
              { href: "tel:18006624357",  label: "SAMHSA" },
              { href: "sms:741741",       label: "Text HOME" },
            ].map(x => (
              <a key={x.href} href={x.href} className="lift" style={{
                flex: 1, textDecoration: "none", padding: "13px 6px",
                borderRadius: 999, textAlign: "center",
                background: "#FFFFFF", border: "1px solid rgba(224,122,108,0.28)",
                boxShadow: "0 1px 4px rgba(31,41,51,0.04)",
              }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#E07A6C" }}>{x.label}</p>
              </a>
            ))}
          </div>

          {/* ── 9. DISCLAIMER ─────────────────────────────────────────────── */}
          <p style={{ textAlign: "center", fontSize: 11, color: "#6B7280", lineHeight: 1.7, paddingBottom: 8 }}>
            Ah Ha LLC is a support tool, not a medical provider.<br />In an emergency, call 911 or 988.
          </p>

        </div>
      </div>
    </div>
  );
}