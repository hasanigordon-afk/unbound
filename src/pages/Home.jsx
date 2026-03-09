import React, { useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "./utils";
import { Loader2, ChevronRight, CalendarCheck, CheckCircle, Phone } from "lucide-react";
import NextBestStep from "../components/home/NextBestStep";
import ProgressSnapshot from "../components/home/ProgressSnapshot";

const NEEDS = [
  { label: "Find Help",      emoji: "🗺️",  href: "FindHelpNow" },
  { label: "Housing",        emoji: "🏠", href: "FindHelpNow?category=Housing" },
  { label: "Food",           emoji: "🍽️", href: "FindHelpNow?category=Food Pantry" },
  { label: "Jobs",           emoji: "💼", href: "FindHelpNow?category=Employment Assistance" },
  { label: "Meetings",       emoji: "🤝", href: "Meetings" },
  { label: "My Plan",        emoji: "📋", href: "ForwardPlan" },
];

export default function Home() {
  const navigate = useNavigate();

  const { data: user, isLoading: userLoading } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: profiles, isLoading: profilesLoading } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => base44.entities.MemberProfile.filter({ created_by: user.email }),
    enabled: !!user,
  });

  const { data: counselorProfiles, isLoading: counselorLoading } = useQuery({
    queryKey: ["counselor-profile-home", user?.email],
    queryFn: () => base44.entities.CounselorProfile.filter({ counselor_email: user.email }),
    enabled: !!user,
  });

  const isLoading = userLoading || (!!user && (profilesLoading || counselorLoading));

  const { data: checkIns = [] } = useQuery({
    queryKey: ["daily-checkins-home", user?.email],
    queryFn: () => base44.entities.DailyCheckIn.filter({ participant_email: user.email }, "-check_in_date", 30),
    enabled: !!user,
  });

  const profile = profiles?.[0];
  const isCounselor = counselorProfiles?.length > 0;

  useEffect(() => {
    if (isLoading) return;
    if (!user) return;
    if (isCounselor) {
      navigate(createPageUrl("ProfessionalPortal"), { replace: true });
      return;
    }
    if (profiles !== undefined && (!profile || !profile.onboarding_complete)) {
      navigate(createPageUrl("Onboarding"));
    }
  }, [isLoading, user, profiles, profile, isCounselor, navigate]);

  if (isLoading || isCounselor || !profile?.onboarding_complete) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F5F5F7" }}>
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#4A90E2" }} />
      </div>
    );
  }

  const today        = new Date().toISOString().split("T")[0];
  const hasCheckedIn = checkIns.some((c) => c.check_in_date === today);
  const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recent7      = checkIns.filter((c) => new Date(c.check_in_date) >= sevenDaysAgo);
  const checkinRate  = Math.min(100, Math.round((recent7.length / 7) * 100));
  const recentCheckIn= checkIns[0] || null;
  const firstName    = user?.full_name?.split(" ")[0] || "there";

  // Streak: count consecutive days from today backward
  const streak = (() => {
    const sorted = [...checkIns].sort((a, b) => new Date(b.check_in_date) - new Date(a.check_in_date));
    let count = 0;
    let cur = new Date(); cur.setHours(0, 0, 0, 0);
    for (const c of sorted) {
      const d = new Date(c.check_in_date); d.setHours(0, 0, 0, 0);
      const diff = Math.round((cur - d) / 86400000);
      if (diff <= 1) { count++; cur = d; } else break;
    }
    return count;
  })();

  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div style={{ background: "#F5F5F7", minHeight: "100vh", paddingBottom: 100 }}>

      {/* ── SECTION 1: WELCOME HEADER ── */}
      <div style={{ background: "#FFFFFF", padding: "32px 20px 24px", borderBottom: "1px solid #E5E7EB" }}>
        <p style={{ fontSize: 13, color: "#8E8E93", marginBottom: 4, fontWeight: 500 }}>
          {timeGreeting}, {firstName}
        </p>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1E1E1E", lineHeight: 1.25, marginBottom: 6 }}>
          What do you need today?
        </h1>
        <p style={{ fontSize: 14, color: "#8E8E93", lineHeight: 1.5 }}>
          Help is here. Start with one step.
        </p>
      </div>

      <div style={{ padding: "20px", maxWidth: 480, margin: "0 auto" }}>

        {/* ── SECTION 3: URGENT HELP ── */}
        <Link to={createPageUrl("UrgentHelp")} style={{ textDecoration: "none", display: "block", marginBottom: 20 }}>
          <div style={{
            background: "linear-gradient(135deg, #DC2626, #B91C1C)",
            borderRadius: 18, padding: "20px 22px",
            display: "flex", alignItems: "center", gap: 16,
            boxShadow: "0 4px 20px rgba(220,38,38,0.2)",
          }}>
            <span style={{ fontSize: 28, flexShrink: 0, lineHeight: 1 }}>🆘</span>
            <div style={{ flex: 1 }}>
              <p style={{ color: "#FFFFFF", fontWeight: 800, fontSize: 16, marginBottom: 2 }}>Need help right now?</p>
              <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 13 }}>Get to support fast.</p>
            </div>
            <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 10, padding: "8px 14px" }}>
              <p style={{ color: "#FFFFFF", fontWeight: 700, fontSize: 13, whiteSpace: "nowrap" }}>Get Help →</p>
            </div>
          </div>
        </Link>

        {/* ── SECTION 4: DAILY CHECK-IN ── */}
        {!hasCheckedIn ? (
          <Link to={createPageUrl("DailyCheckIn")} style={{ textDecoration: "none", display: "block", marginBottom: 20 }}>
            <div style={{
              background: "#4A90E2", borderRadius: 18, padding: "20px 22px",
              display: "flex", alignItems: "center", gap: 16,
              boxShadow: "0 4px 16px rgba(74,144,226,0.25)",
            }}>
              <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 12, padding: 10, flexShrink: 0 }}>
                <CalendarCheck className="w-6 h-6" style={{ color: "#FFF" }} strokeWidth={2} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ color: "#FFF", fontWeight: 700, fontSize: 16, marginBottom: 2 }}>Daily Check-In</p>
                <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 13 }}>30 seconds. Stay on track.</p>
              </div>
              <ChevronRight className="w-5 h-5" style={{ color: "rgba(255,255,255,0.7)" }} />
            </div>
          </Link>
        ) : (
          <div style={{
            background: "#F0FDF4", border: "1px solid #86EFAC",
            borderRadius: 18, padding: "18px 22px", marginBottom: 20,
            display: "flex", alignItems: "center", gap: 14,
          }}>
            <CheckCircle className="w-6 h-6 flex-shrink-0" style={{ color: "#16A34A" }} />
            <div>
              <p style={{ color: "#15803D", fontWeight: 700, fontSize: 15 }}>You showed up today ✓</p>
              <p style={{ color: "#16A34A", fontSize: 13 }}>
                {streak > 1 ? `${streak} days in a row. Keep moving forward.` : "Nice work. See you tomorrow."}
              </p>
            </div>
          </div>
        )}

        {/* ── SECTION 5: NEXT BEST STEP ── */}
        <NextBestStep
          profile={profile}
          recentCheckIn={recentCheckIn}
          hasCheckedInToday={hasCheckedIn}
        />

        {/* ── SECTION 2: PRIMARY ACTIONS ── */}
        <p style={{ fontSize: 11, fontWeight: 700, color: "#8E8E93", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 12 }}>
          What do you need?
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 28 }}>
          {NEEDS.map((n) => (
            <Link key={n.label} to={createPageUrl(n.href)} style={{ textDecoration: "none" }}>
              <div style={{
                background: "#FFFFFF", border: "1px solid #E5E7EB",
                borderRadius: 16, padding: "16px 10px", textAlign: "center",
              }}>
                <div style={{ fontSize: 26, marginBottom: 6, lineHeight: 1 }}>{n.emoji}</div>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#1E1E1E", lineHeight: 1.3 }}>{n.label}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* ── SECTION 6: PROGRESS ── */}
        <ProgressSnapshot
          streak={streak}
          checkinRate={checkinRate}
          profile={profile}
        />

        {/* ── CRAVING CONTROL CENTER BANNER ── */}
        <Link to={createPageUrl("CravingControlCenter")} style={{ textDecoration: "none", display: "block", marginBottom: 20 }}>
          <div style={{
            background: "linear-gradient(135deg, #1B3A5C, #1E4A72)",
            borderRadius: 18, padding: "20px 22px",
            display: "flex", alignItems: "center", gap: 16,
          }}>
            <span style={{ fontSize: 28, flexShrink: 0 }}>🧘</span>
            <div style={{ flex: 1 }}>
              <p style={{ color: "#FFFFFF", fontWeight: 800, fontSize: 15, marginBottom: 2 }}>Craving Control Center</p>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>Breathing, meditation, music & more</p>
            </div>
            <ChevronRight className="w-5 h-5" style={{ color: "rgba(255,255,255,0.5)" }} />
          </div>
        </Link>

        {/* ── SECTION 7: SAVED / RECOMMENDED SUPPORT ── */}
        <p style={{ fontSize: 11, fontWeight: 700, color: "#8E8E93", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 12 }}>
          More ways to get help
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
          <Link to={createPageUrl("Meetings")} style={{ textDecoration: "none" }}>
            <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 16, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>📅</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#1E1E1E" }}>Meetings today</p>
                <p style={{ fontSize: 12, color: "#8E8E93" }}>AA, NA, SMART Recovery & more</p>
              </div>
              <ChevronRight className="w-4 h-4" style={{ color: "#C7C7CC" }} />
            </div>
          </Link>
          <Link to={createPageUrl("ForwardPlan")} style={{ textDecoration: "none" }}>
            <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 16, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>📋</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#1E1E1E" }}>My Plan</p>
                <p style={{ fontSize: 12, color: "#8E8E93" }}>Your goals & next steps</p>
              </div>
              <ChevronRight className="w-4 h-4" style={{ color: "#C7C7CC" }} />
            </div>
          </Link>
          <Link to={createPageUrl("SavedResources")} style={{ textDecoration: "none" }}>
            <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 16, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>🔖</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#1E1E1E" }}>Saved places</p>
                <p style={{ fontSize: 12, color: "#8E8E93" }}>Resources you bookmarked</p>
              </div>
              <ChevronRight className="w-4 h-4" style={{ color: "#C7C7CC" }} />
            </div>
          </Link>
        </div>

        {/* ── CRISIS STRIP ── */}
        <p style={{ fontSize: 11, fontWeight: 700, color: "#8E8E93", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 12 }}>
          Always available — always free
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <a href="tel:988" style={{ flex: 1, background: "#FEF2F2", borderRadius: 14, padding: "14px 10px", textAlign: "center", textDecoration: "none" }}>
            <p style={{ fontWeight: 800, color: "#DC2626", fontSize: 18, lineHeight: 1 }}>988</p>
            <p style={{ fontSize: 11, color: "#DC2626", marginTop: 4, fontWeight: 600 }}>Crisis Line</p>
          </a>
          <a href="tel:18006624357" style={{ flex: 1, background: "#FFF7ED", borderRadius: 14, padding: "14px 10px", textAlign: "center", textDecoration: "none" }}>
            <p style={{ fontWeight: 800, color: "#EA580C", fontSize: 11, lineHeight: 1.3 }}>1-800-662-4357</p>
            <p style={{ fontSize: 11, color: "#EA580C", marginTop: 4, fontWeight: 600 }}>SAMHSA</p>
          </a>
          <a href="sms:741741" style={{ flex: 1, background: "#EFF6FF", borderRadius: 14, padding: "14px 10px", textAlign: "center", textDecoration: "none" }}>
            <p style={{ fontWeight: 800, color: "#2563EB", fontSize: 13, lineHeight: 1.3 }}>Text HOME</p>
            <p style={{ fontSize: 11, color: "#2563EB", marginTop: 4, fontWeight: 600 }}>to 741741</p>
          </a>
        </div>

      </div>
    </div>
  );
}