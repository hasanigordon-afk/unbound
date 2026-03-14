import React, { useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "./utils";
import { Loader2, CalendarCheck, Users, CheckCircle2, MessageSquare, Compass, Handshake, Flame } from "lucide-react";
import RecoveryJourneyTimeline from "@/components/home/RecoveryJourneyTimeline";

// ─── Design tokens ───────────────────────────────────────────────
const EMERALD = "#10B981";
const GOLD    = "#F59E0B";
const BLUE    = "#3B82F6";
const TEXT    = "#FFFFFF";
const DIM     = "rgba(255,255,255,0.6)";
const MUTED   = "rgba(255,255,255,0.32)";
const GLASS   = {
  background: "rgba(255,255,255,0.055)",
  border: "1px solid rgba(255,255,255,0.10)",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
};

// ─── Recovery stages ─────────────────────────────────────────────
const STAGES = [
  { name: "Ember",   minDays: 0,  color: "#94A3B8", glow: "rgba(148,163,184,0.35)", desc: "The spark within you is alive." },
  { name: "Spark",   minDays: 7,  color: "#F97316", glow: "rgba(249,115,22,0.4)",   desc: "Something powerful is growing." },
  { name: "Flame",   minDays: 14, color: GOLD,      glow: "rgba(245,158,11,0.45)",  desc: "Your fire is burning bright." },
  { name: "Ascent",  minDays: 30, color: EMERALD,   glow: "rgba(16,185,129,0.45)",  desc: "Rising stronger every day." },
  { name: "Phoenix", minDays: 90, color: "#A78BFA", glow: "rgba(167,139,250,0.5)",  desc: "You have risen. Lead the way." },
];
const getStage = (streak) => [...STAGES].reverse().find(s => streak >= s.minDays) || STAGES[0];

// ─── Inline SVGs ─────────────────────────────────────────────────
const PhoenixSVG = ({ opacity = 0.06 }) => (
  <svg viewBox="0 0 400 340" style={{ position: "absolute", top: 0, right: -20, width: 320, height: 270, opacity, pointerEvents: "none" }} fill="none">
    <path d="M200 300 C160 260 80 220 60 160 C40 100 80 60 120 80 C140 90 155 115 170 130 C180 140 190 145 200 140 C210 145 220 140 230 130 C245 115 260 90 280 80 C320 60 360 100 340 160 C320 220 240 260 200 300Z" fill="white"/>
    <path d="M200 300 C200 260 200 200 200 140" stroke="white" strokeWidth="3" strokeLinecap="round"/>
    <path d="M170 130 C155 110 130 95 110 100 C100 103 95 112 100 125 C108 145 130 155 155 160" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
    <path d="M230 130 C245 110 270 95 290 100 C300 103 305 112 300 125 C292 145 270 155 245 160" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
    <path d="M190 200 C175 195 158 198 148 208 C140 216 142 228 152 232 C162 236 175 230 183 220" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <path d="M210 200 C225 195 242 198 252 208 C260 216 258 228 248 232 C238 236 225 230 217 220" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <circle cx="200" cy="85" r="8" fill="white"/>
    <path d="M200 77 L196 68 L200 72 L204 68 Z" fill="white"/>
  </svg>
);

const ChainLinkSVG = ({ broken = false, color = MUTED, size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="9" width="7" height="6" rx="3" stroke={color} strokeWidth="2"/>
    {broken ? (
      <>
        <line x1="10" y1="12" x2="12" y2="10" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        <line x1="12" y1="14" x2="14" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        <rect x="14" y="9" width="7" height="6" rx="3" stroke={color} strokeWidth="2"/>
      </>
    ) : (
      <rect x="14" y="9" width="7" height="6" rx="3" stroke={color} strokeWidth="2"/>
    )}
    {!broken && <line x1="10" y1="12" x2="14" y2="12" stroke={color} strokeWidth="2"/>}
  </svg>
);

// ─── Support grid ─────────────────────────────────────────────────
const SUPPORT_ITEMS = [
  { label: "Housing",   icon: "🏠", href: "FindHelpNow?category=Housing" },
  { label: "Food",      icon: "🍽️", href: "FindHelpNow?category=Food Pantry" },
  { label: "Jobs",      icon: "💼", href: "FindHelpNow?category=Employment Assistance" },
  { label: "Meetings",  icon: "🤝", href: "Meetings" },
  { label: "Treatment", icon: "🏥", href: "FindHelpNow?category=Addiction Treatment" },
  { label: "My Plan",   icon: "📋", href: "ForwardPlan" },
];

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const prev = document.body.style.background;
    document.body.style.background = "#070D1A";
    return () => { document.body.style.background = prev; };
  }, []);

  const { data: user,     isLoading: userLoading }     = useQuery({ queryKey: ["user"],      queryFn: () => base44.auth.me() });
  const { data: profiles, isLoading: profilesLoading, isFetched: profilesFetched } = useQuery({
    queryKey: ["my-profile", user?.email],
    queryFn:  () => base44.entities.MemberProfile.filter({ created_by: user.email }),
    enabled:  !!user?.email,
    staleTime: 30_000,
  });
  const { data: checkIns = [] } = useQuery({
    queryKey: ["daily-checkins-home", user?.email],
    queryFn:  () => base44.entities.DailyCheckIn.filter({ participant_email: user.email }, "-check_in_date", 90),
    enabled:  !!user?.email,
  });

  const isLoading = userLoading || (!!user && profilesLoading);
  const profile   = profiles?.[0];

  useEffect(() => {
    if (!user || !profilesFetched) return;
    const profile = profiles?.[0];
    if (!profile || !profile.onboarding_complete) {
      navigate(createPageUrl("Onboarding"));
    }
  }, [user, profiles, profilesFetched, navigate]);

  if (isLoading) return (
    <div style={{ background: "#070D1A", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Loader2 className="w-7 h-7 animate-spin" style={{ color: BLUE }} />
    </div>
  );

  // ─── Computed values ──────────────────────────────────────────
  const today        = new Date().toISOString().split("T")[0];
  const hasCheckedIn = checkIns.some(c => c.check_in_date === today);
  const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recent7      = checkIns.filter(c => new Date(c.check_in_date) >= sevenDaysAgo);
  const firstName    = user?.full_name?.split(" ")[0] || "there";
  const hour         = new Date().getHours();
  const timeGreeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const streak = (() => {
    const sorted = [...checkIns].sort((a, b) => new Date(b.check_in_date) - new Date(a.check_in_date));
    let count = 0; let cur = new Date(); cur.setHours(0,0,0,0);
    for (const c of sorted) {
      const d = new Date(c.check_in_date); d.setHours(0,0,0,0);
      if (Math.round((cur - d) / 86400000) <= 1) { count++; cur = d; } else break;
    }
    return count;
  })();

  const stage = getStage(streak);
  const stageIdx = STAGES.findIndex(s => s.name === stage.name);

  // Stability score
  const avgCraving    = recent7.length ? recent7.reduce((s, c) => s + (c.craving_intensity ?? 5), 0) / recent7.length : 5;
  const checkinScore  = Math.min(recent7.length / 7, 1) * 25;
  const meetingScore  = recent7.length ? (recent7.filter(c => c.attended_meeting).length / recent7.length) * 25 : 0;
  const sponsorScore  = recent7.length ? (recent7.filter(c => c.connected_with_sponsor).length / recent7.length) * 25 : 0;
  const cravingScore  = Math.max(0, (10 - avgCraving) / 10) * 25;
  const hasCheckInData = recent7.length > 0;
  const stabilityScore = hasCheckInData ? Math.round(checkinScore + meetingScore + sponsorScore + cravingScore) : null;
  const stabilityLabel = !hasCheckInData ? "Start Tracking" : stabilityScore >= 75 ? "Stable" : stabilityScore >= 50 ? "At Risk" : "High Risk";
  const stabilityColor = !hasCheckInData ? BLUE : stabilityScore >= 75 ? EMERALD : stabilityScore >= 50 ? GOLD : "#EF4444";

  const indicators = [
    { label: "Check-ins",   done: recent7.length >= 4 },
    { label: "Meetings",    done: recent7.some(c => c.attended_meeting) },
    { label: "Sponsor",     done: recent7.some(c => c.connected_with_sponsor) },
    { label: "Low Craving", done: avgCraving < 5 },
  ];

  // Journey milestones (chain-breaking)
  const milestones = [
    { label: "Day 1",       sub: "You started",       icon: "🌅", done: checkIns.length >= 1 },
    { label: "7 Days",      sub: "First week",         icon: "🔥", done: streak >= 7 },
    { label: "30 Days",     sub: "One month sober",    icon: "⛓️", done: streak >= 30 },
    { label: "ID Obtained", sub: "Identity secured",   icon: "🪪", done: checkIns.some(c => c.attended_meeting) },
    { label: "Employment",  sub: "First opportunity",  icon: "💼", done: checkIns.length >= 14 },
    { label: "90 Days",     sub: "Phoenix rises",      icon: "🦅", done: streak >= 90 },
  ];
  const currentMilestoneIdx = milestones.reduce((acc, m, i) => m.done ? i + 1 : acc, 0);

  // Flame size based on streak
  const flameScale = Math.min(1 + streak * 0.04, 2.2);

  return (
    <div style={{ background: "linear-gradient(170deg, #070D1A 0%, #0C1525 55%, #0A1020 100%)", minHeight: "100vh", paddingBottom: 100 }}>
      <style>{`
        @keyframes flicker {
          0%,100% { opacity:1; transform:scaleY(1) scaleX(1); }
          25%     { opacity:.9; transform:scaleY(1.04) scaleX(.97); }
          75%     { opacity:.95; transform:scaleY(.97) scaleX(1.02); }
        }
        @keyframes glow-pulse {
          0%,100% { box-shadow: 0 0 18px 2px var(--glow); }
          50%     { box-shadow: 0 0 36px 8px var(--glow); }
        }
        @keyframes rise-in {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes bar-fill {
          from { width:0%; }
        }
        @keyframes chain-crack {
          0%   { transform: rotate(0deg); }
          20%  { transform: rotate(-4deg); }
          40%  { transform: rotate(3deg); }
          60%  { transform: rotate(-2deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes stage-pulse {
          0%,100% { opacity:.7; }
          50%     { opacity:1; }
        }
        .flame-anim      { animation: flicker 1.8s ease-in-out infinite; transform-origin: bottom center; }
        .glow-card       { animation: glow-pulse 3s ease-in-out infinite; }
        .rise-in         { animation: rise-in 0.5s ease-out both; }
        .bar-fill-anim   { animation: bar-fill 1.4s cubic-bezier(.4,0,.2,1) forwards; }
        .crack-anim      { animation: chain-crack 0.6s ease-out; }
        .stage-dot-pulse { animation: stage-pulse 2s ease-in-out infinite; }
      `}</style>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 16px" }}>

        {/* ── PHOENIX HEADER ────────────────────────────────────── */}
        <div style={{ position: "relative", paddingTop: 52, paddingBottom: 32, overflow: "hidden" }}>
          <PhoenixSVG opacity={0.055} />
          {/* Radial glow behind phoenix */}
          <div style={{
            position: "absolute", top: 20, right: 0,
            width: 260, height: 220,
            background: `radial-gradient(ellipse at 70% 40%, ${stage.glow} 0%, transparent 70%)`,
            pointerEvents: "none",
          }} />

          <p className="rise-in" style={{ fontSize: 14, color: DIM, marginBottom: 5, animationDelay: "0.05s" }}>
            {timeGreeting}, {firstName}
          </p>
          <h1 className="rise-in" style={{ fontSize: 32, fontWeight: 900, color: TEXT, lineHeight: 1.15, marginBottom: 18, animationDelay: "0.1s" }}>
            Rise.<br />Rebuild.<br />Reclaim your life.
          </h1>

          {/* ── RECOVERY STAGE BADGE ── */}
          <div className="rise-in glow-card" style={{
            "--glow": stage.glow,
            ...GLASS,
            borderRadius: 20,
            padding: "16px 20px",
            display: "flex", alignItems: "center", gap: 16,
            borderColor: `${stage.color}40`,
            background: `rgba(${hexToRgb(stage.color)}, 0.08)`,
            animationDelay: "0.15s",
          }}>
            {/* Flame icon, scales with streak */}
            <div className="flame-anim" style={{ transform: `scale(${flameScale})`, transformOrigin: "bottom center", flexShrink: 0 }}>
              <Flame style={{ color: stage.color, width: 28, height: 28, filter: `drop-shadow(0 0 8px ${stage.glow})` }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                <p style={{ fontSize: 22, fontWeight: 900, color: stage.color, lineHeight: 1 }}>
                  {streak > 0 ? `${streak} Day Streak` : "Start Your Streak"}
                </p>
                <span style={{
                  fontSize: 11, fontWeight: 700, color: stage.color,
                  background: `rgba(${hexToRgb(stage.color)}, 0.18)`,
                  border: `1px solid ${stage.color}50`,
                  borderRadius: 20, padding: "2px 9px",
                }}>
                  {stage.name.toUpperCase()}
                </span>
              </div>
              <p style={{ fontSize: 13, color: DIM }}>{stage.desc}</p>
            </div>
          </div>

          {/* Stage progression dots */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 14, paddingLeft: 4 }}>
            {STAGES.map((s, i) => (
              <React.Fragment key={s.name}>
                <div style={{
                  width: i === stageIdx ? 28 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: i <= stageIdx ? s.color : "rgba(255,255,255,0.12)",
                  transition: "width 0.3s ease",
                  ...(i === stageIdx ? { boxShadow: `0 0 8px ${s.glow}` } : {}),
                }} />
              </React.Fragment>
            ))}
            <p style={{ fontSize: 11, color: MUTED, marginLeft: 4 }}>
              {stageIdx < STAGES.length - 1 ? `→ ${STAGES[stageIdx + 1].name} in ${STAGES[stageIdx + 1].minDays - streak} days` : "Max level 🦅"}
            </p>
          </div>
        </div>

        {/* ── CRISIS BUTTON ─────────────────────────────────────── */}
        <Link to={createPageUrl("UrgentHelp")} style={{ textDecoration: "none", display: "block", marginBottom: 22 }}>
          <div style={{
            background: "linear-gradient(130deg, rgba(220,38,38,0.75), rgba(159,18,57,0.8))",
            borderRadius: 18, padding: "16px 20px",
            display: "flex", alignItems: "center", gap: 14,
            border: "1px solid rgba(248,113,113,0.25)",
            boxShadow: "0 4px 24px rgba(220,38,38,0.2)",
          }}>
            <span style={{ fontSize: 28 }}>🆘</span>
            <div style={{ flex: 1 }}>
              <p style={{ color: TEXT, fontWeight: 700, fontSize: 15 }}>Need help right now?</p>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>Immediate crisis support</p>
            </div>
            <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 10, padding: "8px 14px" }}>
              <p style={{ color: TEXT, fontWeight: 700, fontSize: 13 }}>Get Help →</p>
            </div>
          </div>
        </Link>

        {/* ── TODAY'S ACTIONS ───────────────────────────────────── */}
        <SectionLabel>Today's Actions</SectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>

          <Link to={createPageUrl("DailyCheckIn")} style={{ textDecoration: "none" }}>
            <ActionCard
              icon={hasCheckedIn ? <CheckCircle2 style={{ color: EMERALD, width: 24, height: 24 }} /> : <CalendarCheck style={{ color: BLUE, width: 24, height: 24 }} />}
              iconBg={hasCheckedIn ? "rgba(16,185,129,0.15)" : "rgba(59,130,246,0.15)"}
              title="Daily Check-In"
              sub={hasCheckedIn ? `Done ✓  ${streak > 1 ? `${streak} days strong` : "Nice work"}` : "30 seconds · Stay on track"}
              pill={hasCheckedIn ? "✓" : "Go →"}
              pillColor={hasCheckedIn ? EMERALD : BLUE}
              highlight={hasCheckedIn}
              highlightColor={EMERALD}
            />
          </Link>

          <Link to={createPageUrl("Meetings")} style={{ textDecoration: "none" }}>
            <ActionCard
              icon={<Users style={{ color: EMERALD, width: 24, height: 24 }} />}
              iconBg="rgba(16,185,129,0.15)"
              title="Log Meeting Attendance"
              sub="AA, NA, SMART Recovery & more"
              pill="Log →"
              pillColor={EMERALD}
            />
          </Link>

          <Link to={createPageUrl("ParticipantMessages")} style={{ textDecoration: "none" }}>
            <ActionCard
              icon={<MessageSquare style={{ color: "#A78BFA", width: 24, height: 24 }} />}
              iconBg="rgba(139,92,246,0.15)"
              title="Contact Mentor / Sponsor"
              sub="Reach out — connection is strength"
              pill="Open →"
              pillColor="#A78BFA"
            />
          </Link>
        </div>

        {/* ── RECOVERY STABILITY SCORE ──────────────────────────── */}
        <SectionLabel>Recovery Stability Score</SectionLabel>
        <div style={{ ...GLASS, borderRadius: 22, padding: "22px 20px", marginBottom: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <div>
              <p style={{ fontSize: 54, fontWeight: 900, lineHeight: 1, color: stabilityColor, filter: `drop-shadow(0 0 12px ${stabilityColor}80)` }}>
                {stabilityScore}
                <span style={{ fontSize: 26, fontWeight: 600, color: DIM }}>%</span>
              </p>
              <p style={{ fontSize: 13, color: DIM, marginTop: 4 }}>7-day recovery score</p>
            </div>
            <div style={{
              background: `rgba(${hexToRgb(stabilityColor)}, 0.12)`,
              border: `1px solid ${stabilityColor}45`,
              borderRadius: 14, padding: "10px 16px",
              boxShadow: stabilityScore >= 75 ? `0 0 16px ${stabilityColor}40` : "none",
            }}>
              <p style={{ fontSize: 15, fontWeight: 800, color: stabilityColor }}>{stabilityLabel}</p>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 6, height: 8, marginBottom: 18, overflow: "hidden" }}>
            <div className="bar-fill-anim" style={{
              height: "100%", borderRadius: 6,
              background: `linear-gradient(90deg, ${stabilityColor}99, ${stabilityColor})`,
              width: `${stabilityScore}%`,
              boxShadow: `0 0 12px ${stabilityColor}80`,
            }} />
          </div>

          {/* Indicators with chain symbolism */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {indicators.map((ind) => (
              <div key={ind.label} style={{
                display: "flex", alignItems: "center", gap: 8,
                background: ind.done ? "rgba(16,185,129,0.08)" : "rgba(255,255,255,0.035)",
                borderRadius: 12, padding: "10px 12px",
                border: `1px solid ${ind.done ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.07)"}`,
                boxShadow: ind.done ? "0 0 10px rgba(16,185,129,0.12)" : "none",
              }}>
                <ChainLinkSVG broken={ind.done} color={ind.done ? EMERALD : MUTED} size={18} />
                <p style={{ fontSize: 13, fontWeight: 600, color: ind.done ? EMERALD : DIM }}>{ind.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── RECOVERY JOURNEY TIMELINE ─────────────────────── */}
        <RecoveryJourneyTimeline streak={streak} user={user} />

        {/* ── NEARBY SUPPORT RESOURCES ─────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <SectionLabel noMargin>Nearby Support</SectionLabel>
          <Link to={createPageUrl("FindHelpNow")} style={{ textDecoration: "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Compass style={{ width: 14, height: 14, color: BLUE }} />
              <p style={{ fontSize: 12, color: BLUE, fontWeight: 600 }}>View all</p>
            </div>
          </Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 28 }}>
          {SUPPORT_ITEMS.map(item => (
            <Link key={item.label} to={createPageUrl(item.href)} style={{ textDecoration: "none" }}>
              <div style={{ ...GLASS, borderRadius: 16, padding: "16px 10px", textAlign: "center" }}>
                <div style={{ fontSize: 26, marginBottom: 6, lineHeight: 1 }}>{item.icon}</div>
                <p style={{ fontSize: 11, fontWeight: 700, color: TEXT, lineHeight: 1.3 }}>{item.label}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* ── CRISIS STRIP ─────────────────────────────────────── */}
        <SectionLabel>Always free · Always available</SectionLabel>
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <a href="tel:988" style={{ flex: 1, background: "rgba(220,38,38,0.14)", border: "1px solid rgba(220,38,38,0.3)", borderRadius: 14, padding: "14px 8px", textAlign: "center", textDecoration: "none" }}>
            <p style={{ fontWeight: 900, color: "#F87171", fontSize: 22, lineHeight: 1 }}>988</p>
            <p style={{ fontSize: 11, color: "#FCA5A5", marginTop: 4, fontWeight: 600 }}>Crisis Line</p>
          </a>
          <a href="tel:18006624357" style={{ flex: 1, background: "rgba(234,88,12,0.14)", border: "1px solid rgba(234,88,12,0.3)", borderRadius: 14, padding: "14px 8px", textAlign: "center", textDecoration: "none" }}>
            <p style={{ fontWeight: 900, color: "#FB923C", fontSize: 11, lineHeight: 1.3 }}>1-800-662-HELP</p>
            <p style={{ fontSize: 11, color: "#FDBA74", marginTop: 4, fontWeight: 600 }}>SAMHSA</p>
          </a>
          <a href="sms:741741" style={{ flex: 1, background: "rgba(59,130,246,0.14)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: 14, padding: "14px 8px", textAlign: "center", textDecoration: "none" }}>
            <p style={{ fontWeight: 900, color: "#60A5FA", fontSize: 13, lineHeight: 1.3 }}>Text HOME</p>
            <p style={{ fontSize: 11, color: "#93C5FD", marginTop: 4, fontWeight: 600 }}>to 741741</p>
          </a>
        </div>

      </div>
    </div>
  );
}

// ─── Helper components ────────────────────────────────────────────
function SectionLabel({ children, noMargin }) {
  return (
    <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "1.1px", marginBottom: noMargin ? 0 : 14 }}>
      {children}
    </p>
  );
}

function ActionCard({ icon, iconBg, title, sub, pill, pillColor, highlight, highlightColor }) {
  return (
    <div style={{
      ...GLASS,
      borderRadius: 18, padding: "18px 20px",
      display: "flex", alignItems: "center", gap: 16,
      ...(highlight ? { borderColor: `${highlightColor}45`, background: `rgba(${hexToRgb(highlightColor)}, 0.07)`, boxShadow: `0 0 18px ${highlightColor}20` } : {}),
    }}>
      <div style={{ background: iconBg, borderRadius: 14, padding: 12, flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ color: TEXT, fontWeight: 700, fontSize: 16, marginBottom: 2 }}>{title}</p>
        <p style={{ color: DIM, fontSize: 13 }}>{sub}</p>
      </div>
      <div style={{ background: `rgba(${hexToRgb(pillColor)}, 0.15)`, borderRadius: 10, padding: "8px 12px", flexShrink: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: pillColor }}>{pill}</p>
      </div>
    </div>
  );
}

// ─── Hex → "r,g,b" for rgba() ────────────────────────────────────
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  return `${r},${g},${b}`;
}