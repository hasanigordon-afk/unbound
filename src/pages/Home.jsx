import React, { useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "./utils";
import { Loader2, CalendarCheck, Users, MapPin, CheckCircle2, Flame, Home as HomeIcon, Briefcase, Utensils, Building2, Phone, MessageSquare } from "lucide-react";

const BG = "linear-gradient(160deg, #0A0F1E 0%, #0D1B2A 60%, #0A1628 100%)";
const GLASS = { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" };
const EMERALD = "#10B981";
const GOLD = "#F59E0B";
const BLUE = "#3B82F6";
const TEXT = "#FFFFFF";
const TEXT_DIM = "rgba(255,255,255,0.6)";
const TEXT_MUTED = "rgba(255,255,255,0.35)";

const SUPPORT_ITEMS = [
  { label: "Housing",   emoji: "🏠", href: "FindHelpNow?category=Housing" },
  { label: "Food",      emoji: "🍽️", href: "FindHelpNow?category=Food Pantry" },
  { label: "Jobs",      emoji: "💼", href: "FindHelpNow?category=Employment Assistance" },
  { label: "Meetings",  emoji: "🤝", href: "Meetings" },
  { label: "Treatment", emoji: "🏥", href: "FindHelpNow?category=Addiction Treatment" },
  { label: "My Plan",   emoji: "📋", href: "ForwardPlan" },
];

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const prev = document.body.style.background;
    document.body.style.background = "#0A0F1E";
    return () => { document.body.style.background = prev; };
  }, []);

  const { data: user, isLoading: userLoading } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: profiles, isLoading: profilesLoading } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => base44.entities.MemberProfile.filter({ created_by: user.email }),
    enabled: !!user,
  });

  const { data: checkIns = [] } = useQuery({
    queryKey: ["daily-checkins-home", user?.email],
    queryFn: () => base44.entities.DailyCheckIn.filter({ participant_email: user.email }, "-check_in_date", 90),
    enabled: !!user,
  });

  const isLoading = userLoading || (!!user && profilesLoading);
  const profile = profiles?.[0];

  useEffect(() => {
    if (!isLoading && user && profiles !== undefined && (!profile || !profile.onboarding_complete)) {
      navigate(createPageUrl("Onboarding"));
    }
  }, [isLoading, user, profiles, profile, navigate]);

  if (isLoading) {
    return (
      <div style={{ background: "#0A0F1E", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 className="w-7 h-7 animate-spin" style={{ color: BLUE }} />
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];
  const hasCheckedIn = checkIns.some(c => c.check_in_date === today);
  const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recent7 = checkIns.filter(c => new Date(c.check_in_date) >= sevenDaysAgo);
  const firstName = user?.full_name?.split(" ")[0] || "there";
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const streak = (() => {
    const sorted = [...checkIns].sort((a, b) => new Date(b.check_in_date) - new Date(a.check_in_date));
    let count = 0; let cur = new Date(); cur.setHours(0, 0, 0, 0);
    for (const c of sorted) {
      const d = new Date(c.check_in_date); d.setHours(0, 0, 0, 0);
      if (Math.round((cur - d) / 86400000) <= 1) { count++; cur = d; } else break;
    }
    return count;
  })();

  // Recovery Stability Score
  const checkinScore  = Math.min(recent7.length / 7, 1) * 25;
  const meetingScore  = recent7.length ? (recent7.filter(c => c.attended_meeting).length / recent7.length) * 25 : 0;
  const sponsorScore  = recent7.length ? (recent7.filter(c => c.connected_with_sponsor).length / recent7.length) * 25 : 0;
  const avgCraving    = recent7.length ? recent7.reduce((s, c) => s + (c.craving_intensity ?? 5), 0) / recent7.length : 5;
  const cravingScore  = Math.max(0, (10 - avgCraving) / 10) * 25;
  const stabilityScore = Math.round(checkinScore + meetingScore + sponsorScore + cravingScore);
  const stabilityLabel = stabilityScore >= 75 ? "Stable" : stabilityScore >= 50 ? "At Risk" : "High Risk";
  const stabilityColor = stabilityScore >= 75 ? EMERALD : stabilityScore >= 50 ? GOLD : "#EF4444";

  const indicators = [
    { label: "Check-ins",  done: recent7.length >= 4 },
    { label: "Meetings",   done: recent7.some(c => c.attended_meeting) },
    { label: "Sponsor",    done: recent7.some(c => c.connected_with_sponsor) },
    { label: "Low craving",done: avgCraving < 5 },
  ];

  // Journey milestones
  const journeyMilestones = [
    { label: "Day 1",     sub: "You started",       done: checkIns.length >= 1,  icon: "🌅" },
    { label: "7 Days",    sub: "First week",         done: checkIns.length >= 7,  icon: "🔥" },
    { label: "Meeting",   sub: "Attended group",     done: checkIns.some(c => c.attended_meeting), icon: "🤝" },
    { label: "Sponsor",   sub: "Made connection",    done: checkIns.some(c => c.connected_with_sponsor), icon: "💪" },
    { label: "30 Days",   sub: "One month",          done: streak >= 30,          icon: "⭐" },
    { label: "90 Days",   sub: "90-day stability",   done: streak >= 90,          icon: "🏆" },
  ];
  const currentMilestoneIdx = journeyMilestones.reduce((acc, m, i) => m.done ? i + 1 : acc, 0);

  return (
    <div style={{ background: BG, minHeight: "100vh", paddingBottom: 100 }}>
      <style>{`
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(16,185,129,0.5); }
          70% { box-shadow: 0 0 0 12px rgba(16,185,129,0); }
          100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }
        }
        @keyframes streak-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(245,158,11,0.3); }
          50% { box-shadow: 0 0 35px rgba(245,158,11,0.6); }
        }
        @keyframes progress-fill {
          from { width: 0%; }
        }
        .streak-glow { animation: streak-glow 2.5s ease-in-out infinite; }
        .pulse-ring { animation: pulse-ring 2s ease-out infinite; }
        .progress-animated { animation: progress-fill 1.2s ease-out forwards; }
      `}</style>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 16px" }}>

        {/* ── HEADER ── */}
        <div style={{ paddingTop: 52, paddingBottom: 28 }}>
          <p style={{ fontSize: 14, color: TEXT_DIM, marginBottom: 6 }}>{timeGreeting}, {firstName}</p>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: TEXT, lineHeight: 1.2, marginBottom: 16 }}>
            Your Recovery<br />Command Center
          </h1>

          {/* Streak badge */}
          <div className="streak-glow" style={{
            ...GLASS,
            borderRadius: 18,
            padding: "16px 20px",
            display: "flex", alignItems: "center", gap: 14,
            borderColor: "rgba(245,158,11,0.35)",
            background: "rgba(245,158,11,0.10)",
          }}>
            <div style={{ fontSize: 36, lineHeight: 1 }}>🔥</div>
            <div>
              <p style={{ fontSize: 22, fontWeight: 800, color: GOLD, lineHeight: 1 }}>
                {streak > 0 ? `${streak} Day Recovery Streak` : "Start Your Streak Today"}
              </p>
              <p style={{ fontSize: 13, color: TEXT_DIM, marginTop: 3 }}>
                {streak > 0
                  ? `You've stayed accountable for ${streak} day${streak > 1 ? "s" : ""}.`
                  : "Complete your first check-in to begin."}
              </p>
            </div>
          </div>
        </div>

        {/* ── CRISIS BUTTON ── */}
        <Link to={createPageUrl("UrgentHelp")} style={{ textDecoration: "none", display: "block", marginBottom: 20 }}>
          <div style={{
            background: "linear-gradient(135deg, rgba(220,38,38,0.8), rgba(185,28,28,0.8))",
            borderRadius: 18, padding: "16px 20px",
            display: "flex", alignItems: "center", gap: 14,
            border: "1px solid rgba(248,113,113,0.3)",
          }}>
            <span style={{ fontSize: 26 }}>🆘</span>
            <div style={{ flex: 1 }}>
              <p style={{ color: TEXT, fontWeight: 700, fontSize: 15 }}>Need help right now?</p>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>Immediate crisis support</p>
            </div>
            <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 10, padding: "8px 14px" }}>
              <p style={{ color: TEXT, fontWeight: 700, fontSize: 13 }}>Get Help →</p>
            </div>
          </div>
        </Link>

        {/* ── TODAY'S ACTIONS ── */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 14 }}>
            Today's Actions
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

            {/* Daily Check-In */}
            <Link to={createPageUrl("DailyCheckIn")} style={{ textDecoration: "none" }}>
              <div style={{
                ...GLASS,
                borderRadius: 18, padding: "18px 22px",
                display: "flex", alignItems: "center", gap: 16,
                ...(hasCheckedIn ? { borderColor: `rgba(16,185,129,0.4)`, background: "rgba(16,185,129,0.08)" } : {})
              }}>
                <div style={{
                  background: hasCheckedIn ? "rgba(16,185,129,0.2)" : "rgba(59,130,246,0.2)",
                  borderRadius: 14, padding: 12, flexShrink: 0,
                }}>
                  {hasCheckedIn
                    ? <CheckCircle2 className="w-6 h-6" style={{ color: EMERALD }} />
                    : <CalendarCheck className="w-6 h-6" style={{ color: BLUE }} />
                  }
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ color: TEXT, fontWeight: 700, fontSize: 16, marginBottom: 2 }}>Daily Check-In</p>
                  <p style={{ color: TEXT_DIM, fontSize: 13 }}>
                    {hasCheckedIn ? `Done ✓  ${streak > 1 ? `${streak} days strong` : "Nice work"}` : "30 seconds · Stay on track"}
                  </p>
                </div>
                <div style={{ background: hasCheckedIn ? "rgba(16,185,129,0.2)" : "rgba(59,130,246,0.2)", borderRadius: 10, padding: "8px 12px" }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: hasCheckedIn ? EMERALD : BLUE }}>{hasCheckedIn ? "✓" : "Go →"}</p>
                </div>
              </div>
            </Link>

            {/* Log Meeting */}
            <Link to={createPageUrl("Meetings")} style={{ textDecoration: "none" }}>
              <div style={{ ...GLASS, borderRadius: 18, padding: "18px 22px", display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ background: "rgba(16,185,129,0.15)", borderRadius: 14, padding: 12, flexShrink: 0 }}>
                  <Users className="w-6 h-6" style={{ color: EMERALD }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ color: TEXT, fontWeight: 700, fontSize: 16, marginBottom: 2 }}>Log Meeting Attendance</p>
                  <p style={{ color: TEXT_DIM, fontSize: 13 }}>AA, NA, SMART Recovery & more</p>
                </div>
                <div style={{ background: "rgba(16,185,129,0.15)", borderRadius: 10, padding: "8px 12px" }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: EMERALD }}>Log →</p>
                </div>
              </div>
            </Link>

            {/* Contact Mentor */}
            <Link to={createPageUrl("ParticipantMessages")} style={{ textDecoration: "none" }}>
              <div style={{ ...GLASS, borderRadius: 18, padding: "18px 22px", display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ background: "rgba(139,92,246,0.15)", borderRadius: 14, padding: 12, flexShrink: 0 }}>
                  <MessageSquare className="w-6 h-6" style={{ color: "#A78BFA" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ color: TEXT, fontWeight: 700, fontSize: 16, marginBottom: 2 }}>Contact Mentor / Sponsor</p>
                  <p style={{ color: TEXT_DIM, fontSize: 13 }}>Send a message for support</p>
                </div>
                <div style={{ background: "rgba(139,92,246,0.15)", borderRadius: 10, padding: "8px 12px" }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#A78BFA" }}>Open →</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* ── RECOVERY STABILITY SCORE ── */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 14 }}>
            Recovery Stability Score
          </p>
          <div style={{ ...GLASS, borderRadius: 20, padding: "22px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 12 }}>
              <div>
                <p style={{ fontSize: 48, fontWeight: 900, color: stabilityColor, lineHeight: 1 }}>{stabilityScore}<span style={{ fontSize: 24, fontWeight: 600, color: TEXT_DIM }}>%</span></p>
                <p style={{ fontSize: 13, color: TEXT_DIM, marginTop: 4 }}>7-day recovery score</p>
              </div>
              <div style={{
                background: stabilityScore >= 75 ? "rgba(16,185,129,0.15)" : stabilityScore >= 50 ? "rgba(245,158,11,0.15)" : "rgba(239,68,68,0.15)",
                border: `1px solid ${stabilityColor}40`,
                borderRadius: 12, padding: "8px 14px",
              }}>
                <p style={{ fontSize: 14, fontWeight: 800, color: stabilityColor }}>{stabilityLabel}</p>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 6, height: 8, marginBottom: 18, overflow: "hidden" }}>
              <div
                className="progress-animated"
                style={{ height: "100%", borderRadius: 6, background: `linear-gradient(90deg, ${stabilityColor}, ${stabilityColor}cc)`, width: `${stabilityScore}%` }}
              />
            </div>

            {/* Indicators */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {indicators.map((ind) => (
                <div key={ind.label} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: ind.done ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.04)",
                  borderRadius: 12, padding: "10px 12px",
                  border: `1px solid ${ind.done ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.07)"}`,
                }}>
                  <span style={{ fontSize: 16 }}>{ind.done ? "✅" : "○"}</span>
                  <p style={{ fontSize: 13, fontWeight: 600, color: ind.done ? EMERALD : TEXT_DIM }}>{ind.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RECOVERY JOURNEY MAP ── */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 14 }}>
            Recovery Journey · First 90 Days
          </p>
          <div style={{ ...GLASS, borderRadius: 20, padding: "20px 0 20px 20px", overflowX: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 0, minWidth: "max-content", paddingRight: 20 }}>
              {journeyMilestones.map((m, i) => {
                const isDone = m.done;
                const isCurrent = i === currentMilestoneIdx;
                return (
                  <React.Fragment key={m.label}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                      {/* Node */}
                      <div
                        className={isCurrent ? "pulse-ring" : ""}
                        style={{
                          width: 52, height: 52,
                          borderRadius: "50%",
                          background: isDone
                            ? `linear-gradient(135deg, ${EMERALD}, #059669)`
                            : isCurrent
                              ? `rgba(16,185,129,0.2)`
                              : "rgba(255,255,255,0.07)",
                          border: `2px solid ${isDone ? EMERALD : isCurrent ? EMERALD : "rgba(255,255,255,0.15)"}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 22, flexShrink: 0,
                        }}
                      >
                        {isDone ? "✓" : <span style={{ opacity: isCurrent ? 1 : 0.5 }}>{m.icon}</span>}
                      </div>
                      {/* Labels */}
                      <div style={{ textAlign: "center" }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: isDone ? EMERALD : isCurrent ? TEXT : TEXT_MUTED, lineHeight: 1, marginBottom: 2 }}>
                          {m.label}
                        </p>
                        <p style={{ fontSize: 10, color: isDone ? "rgba(16,185,129,0.7)" : TEXT_MUTED, lineHeight: 1.3, maxWidth: 64, textAlign: "center" }}>
                          {m.sub}
                        </p>
                      </div>
                    </div>
                    {i < journeyMilestones.length - 1 && (
                      <div style={{
                        width: 40, height: 2, flexShrink: 0, marginBottom: 20,
                        background: isDone ? `linear-gradient(90deg, ${EMERALD}, ${journeyMilestones[i+1]?.done ? EMERALD : "rgba(255,255,255,0.15)"})` : "rgba(255,255,255,0.12)",
                      }} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── NEARBY SUPPORT RESOURCES ── */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 14 }}>
            Nearby Support Resources
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {SUPPORT_ITEMS.map(item => (
              <Link key={item.label} to={createPageUrl(item.href)} style={{ textDecoration: "none" }}>
                <div style={{
                  ...GLASS,
                  borderRadius: 16, padding: "16px 10px", textAlign: "center",
                  transition: "transform 0.15s ease",
                }}>
                  <div style={{ fontSize: 26, marginBottom: 6, lineHeight: 1 }}>{item.emoji}</div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: TEXT, lineHeight: 1.3 }}>{item.label}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── CRISIS STRIP ── */}
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12 }}>
            Always free · Always available
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <a href="tel:988" style={{ flex: 1, background: "rgba(220,38,38,0.15)", border: "1px solid rgba(220,38,38,0.3)", borderRadius: 14, padding: "14px 8px", textAlign: "center", textDecoration: "none" }}>
              <p style={{ fontWeight: 800, color: "#F87171", fontSize: 20, lineHeight: 1 }}>988</p>
              <p style={{ fontSize: 11, color: "#FCA5A5", marginTop: 4, fontWeight: 600 }}>Crisis Line</p>
            </a>
            <a href="tel:18006624357" style={{ flex: 1, background: "rgba(234,88,12,0.15)", border: "1px solid rgba(234,88,12,0.3)", borderRadius: 14, padding: "14px 8px", textAlign: "center", textDecoration: "none" }}>
              <p style={{ fontWeight: 800, color: "#FB923C", fontSize: 11, lineHeight: 1.3 }}>1-800-662-4357</p>
              <p style={{ fontSize: 11, color: "#FDBA74", marginTop: 4, fontWeight: 600 }}>SAMHSA</p>
            </a>
            <a href="sms:741741" style={{ flex: 1, background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: 14, padding: "14px 8px", textAlign: "center", textDecoration: "none" }}>
              <p style={{ fontWeight: 800, color: "#60A5FA", fontSize: 13, lineHeight: 1.3 }}>Text HOME</p>
              <p style={{ fontSize: 11, color: "#93C5FD", marginTop: 4, fontWeight: 600 }}>to 741741</p>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}