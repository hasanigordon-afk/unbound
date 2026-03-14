import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "./utils";
import {
  Loader2, CalendarCheck, Users, CheckCircle2,
  MessageSquare, Compass, Flame, ArrowRight,
  BookOpen, Map, Target, Zap, Star
} from "lucide-react";
import RecoveryJourneyTimeline from "@/components/home/RecoveryJourneyTimeline";

// ── Palette ──────────────────────────────────────────────────────
const TEAL    = "#4ECDC4";
const GOLD    = "#D4A857";
const INDIGO  = "#6366F1";
const EMERALD = "#10B981";
const TEXT    = "#FFFFFF";
const DIM     = "rgba(255,255,255,0.62)";
const MUTED   = "rgba(255,255,255,0.30)";
const GLASS   = {
  background:          "rgba(255,255,255,0.045)",
  border:              "1px solid rgba(255,255,255,0.09)",
  backdropFilter:      "blur(24px)",
  WebkitBackdropFilter:"blur(24px)",
};

// ── Recovery stages ──────────────────────────────────────────────
const STAGES = [
  { name: "Ember",   minDays: 0,  color: "#94A3B8", glow: "rgba(148,163,184,0.35)", desc: "The spark within you is alive." },
  { name: "Spark",   minDays: 7,  color: "#F97316", glow: "rgba(249,115,22,0.4)",   desc: "Something powerful is growing." },
  { name: "Flame",   minDays: 14, color: GOLD,      glow: "rgba(212,168,87,0.45)",  desc: "Your fire is burning bright." },
  { name: "Ascent",  minDays: 30, color: EMERALD,   glow: "rgba(16,185,129,0.45)",  desc: "Rising stronger every day." },
  { name: "Phoenix", minDays: 90, color: "#A78BFA", glow: "rgba(167,139,250,0.5)",  desc: "You have risen. Lead the way." },
];
const getStage = (streak) => [...STAGES].reverse().find(s => streak >= s.minDays) || STAGES[0];

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  return `${r},${g},${b}`;
}

// ── Decorative SVGs ───────────────────────────────────────────────
const HeroArcs = () => (
  <svg viewBox="0 0 480 380" style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:0.07, pointerEvents:"none" }} fill="none">
    <circle cx="420" cy="-30" r="220" stroke="white" strokeWidth="1"/>
    <circle cx="420" cy="-30" r="310" stroke="white" strokeWidth="0.6"/>
    <circle cx="-40" cy="340" r="260" stroke="white" strokeWidth="0.8"/>
    <path d="M0 180 Q240 60 480 200" stroke="white" strokeWidth="0.8"/>
    <path d="M0 240 Q240 120 480 260" stroke="white" strokeWidth="0.5"/>
  </svg>
);

const DiamondAccent = ({ x, y, size=8, opacity=0.15, color="white" }) => (
  <div style={{
    position:"absolute", left:x, top:y,
    width:size, height:size,
    background:`rgba(${color === "gold" ? "212,168,87" : "255,255,255"},${opacity})`,
    transform:"rotate(45deg)",
    borderRadius:1,
    pointerEvents:"none",
  }} />
);

// ── Support quick links ───────────────────────────────────────────
const SUPPORT_ITEMS = [
  { label:"Housing",   icon:"🏠", href:"FindHelpNow?category=Housing" },
  { label:"Food",      icon:"🍽️", href:"FindHelpNow?category=Food Pantry" },
  { label:"Jobs",      icon:"💼", href:"FindHelpNow?category=Employment Assistance" },
  { label:"Meetings",  icon:"🤝", href:"Meetings" },
  { label:"Treatment", icon:"🏥", href:"FindHelpNow?category=Addiction Treatment" },
  { label:"My Plan",   icon:"📋", href:"ForwardPlan" },
];

// ─────────────────────────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const prev = document.body.style.background;
    document.body.style.background = "#060C18";
    return () => { document.body.style.background = prev; };
  }, []);

  const { data: user, isLoading: userLoading } = useQuery({ queryKey:["user"], queryFn:() => base44.auth.me() });

  const { data: profiles, isLoading: profilesLoading, isFetched: profilesFetched } = useQuery({
    queryKey:  ["my-profile", user?.email],
    queryFn:   () => base44.entities.MemberProfile.filter({ created_by: user.email }),
    enabled:   !!user?.email,
    staleTime: 30_000,
  });

  const { data: checkIns = [] } = useQuery({
    queryKey: ["daily-checkins-home", user?.email],
    queryFn:  () => base44.entities.DailyCheckIn.filter({ participant_email: user.email }, "-check_in_date", 90),
    enabled:  !!user?.email,
  });

  const { data: articles = [] } = useQuery({
    queryKey: ["home-spotlight-articles"],
    queryFn:  () => base44.entities.Article.filter({ featured: true, approved: true }, "-created_date", 3),
    staleTime: 60_000,
  });

  const { data: communityPosts = [] } = useQuery({
    queryKey: ["home-community"],
    queryFn:  () => base44.entities.CommunityPost.filter({ moderation_status: "approved" }, "-created_date", 3),
    staleTime: 60_000,
  });

  const isLoading = userLoading || (!!user && profilesLoading);

  useEffect(() => {
    if (!user || !profilesFetched) return;
    if (!profiles?.[0]?.onboarding_complete) navigate(createPageUrl("Onboarding"));
  }, [user, profiles, profilesFetched, navigate]);

  if (isLoading) return (
    <div style={{ background:"#060C18", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <Loader2 className="w-7 h-7 animate-spin" style={{ color: TEAL }} />
    </div>
  );

  // ── Computed values ───────────────────────────────────────────
  const today         = new Date().toISOString().split("T")[0];
  const hasCheckedIn  = checkIns.some(c => c.check_in_date === today);
  const sevenDaysAgo  = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recent7       = checkIns.filter(c => new Date(c.check_in_date) >= sevenDaysAgo);
  const firstName     = user?.full_name?.split(" ")[0] || "there";
  const hour          = new Date().getHours();
  const timeGreeting  = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const streak = (() => {
    const sorted = [...checkIns].sort((a, b) => new Date(b.check_in_date) - new Date(a.check_in_date));
    let count = 0; let cur = new Date(); cur.setHours(0,0,0,0);
    for (const c of sorted) {
      const d = new Date(c.check_in_date); d.setHours(0,0,0,0);
      if (Math.round((cur - d) / 86400000) <= 1) { count++; cur = d; } else break;
    }
    return count;
  })();

  const stage    = getStage(streak);
  const stageIdx = STAGES.findIndex(s => s.name === stage.name);

  const avgCraving    = recent7.length ? recent7.reduce((s, c) => s + (c.craving_intensity ?? 5), 0) / recent7.length : 5;
  const checkinScore  = Math.min(recent7.length / 7, 1) * 25;
  const meetingScore  = recent7.length ? (recent7.filter(c => c.attended_meeting).length / recent7.length) * 25 : 0;
  const sponsorScore  = recent7.length ? (recent7.filter(c => c.connected_with_sponsor).length / recent7.length) * 25 : 0;
  const cravingScore  = Math.max(0, (10 - avgCraving) / 10) * 25;
  const hasCheckInData  = recent7.length > 0;
  const stabilityScore  = hasCheckInData ? Math.round(checkinScore + meetingScore + sponsorScore + cravingScore) : null;
  const stabilityColor  = !hasCheckInData ? TEAL : stabilityScore >= 75 ? EMERALD : stabilityScore >= 50 ? GOLD : "#EF4444";

  const indicators = [
    { label:"Check-ins",   done: recent7.length >= 4,                        icon:"📅" },
    { label:"Meetings",    done: recent7.some(c => c.attended_meeting),       icon:"🤝" },
    { label:"Sponsor",     done: recent7.some(c => c.connected_with_sponsor), icon:"🫂" },
    { label:"Low Craving", done: avgCraving < 5,                              icon:"💆" },
  ];

  const spotlightArticle = articles[0];
  const CAT_COLOR = { "Recovery":"#4ECDC4","Relapse Prevention":"#EF4444","Reentry":"#A78BFA","Employment":"#F59E0B","Housing":"#10B981","Mental Health":"#60A5FA","Motivation":"#F97316","Life Skills":"#34D399","Community":"#FBBF24" };

  return (
    <div style={{ background:"linear-gradient(175deg, #060C18 0%, #0C1426 50%, #08101E 100%)", minHeight:"100vh", paddingBottom:120 }}>
      <style>{`
        @keyframes fadeUp   { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
        @keyframes scaleIn  { from{opacity:0;transform:scale(.94)} to{opacity:1;transform:scale(1)} }
        @keyframes glow     { 0%,100%{box-shadow:0 0 20px 2px var(--g)} 50%{box-shadow:0 0 40px 10px var(--g)} }
        @keyframes flicker  { 0%,100%{opacity:1;transform:scaleY(1)} 50%{opacity:.9;transform:scaleY(1.06) scaleX(.97)} }
        @keyframes barFill  { from{width:0} }
        @keyframes drift    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes shimmer  {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .fade-up    { animation: fadeUp  0.6s cubic-bezier(.22,1,.36,1) both; }
        .fade-in    { animation: fadeIn  0.5s ease both; }
        .scale-in   { animation: scaleIn 0.5s cubic-bezier(.22,1,.36,1) both; }
        .glow-pulse { animation: glow 3.5s ease-in-out infinite; }
        .flame      { animation: flicker 2s ease-in-out infinite; transform-origin: bottom center; }
        .bar-fill   { animation: barFill 1.6s cubic-bezier(.4,0,.2,1) forwards; }
        .drift      { animation: drift 4s ease-in-out infinite; }
        .shimmer-text {
          background: linear-gradient(90deg, ${GOLD} 0%, #fff8e7 40%, ${GOLD} 80%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }
        .card-lift { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .card-lift:active { transform: scale(.98); }
      `}</style>

      <div style={{ maxWidth:480, margin:"0 auto" }}>

        {/* ══════════════════════════════════════════════════════
            CINEMATIC HERO
        ══════════════════════════════════════════════════════ */}
        <div style={{ position:"relative", overflow:"hidden", paddingBottom:52, minHeight:420 }}>
          {/* Layered background */}
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(160deg, #0D1B35 0%, #091526 60%, #060C18 100%)" }} />
          <div style={{ position:"absolute", top:-80, right:-60, width:360, height:360, borderRadius:"50%",
            background:"radial-gradient(circle, rgba(78,205,196,0.12) 0%, transparent 70%)", pointerEvents:"none" }} />
          <div style={{ position:"absolute", bottom:0, left:-80, width:300, height:280, borderRadius:"50%",
            background:"radial-gradient(circle, rgba(212,168,87,0.07) 0%, transparent 70%)", pointerEvents:"none" }} />
          <HeroArcs />
          <DiamondAccent x={28}  y={100} size={6}  opacity={0.2} />
          <DiamondAccent x={420} y={80}  size={9}  opacity={0.12} color="gold" />
          <DiamondAccent x={60}  y={320} size={5}  opacity={0.15} />
          <DiamondAccent x={390} y={300} size={7}  opacity={0.1} />

          {/* Content */}
          <div style={{ position:"relative", zIndex:1, padding:"64px 24px 0" }}>
            {/* Greeting */}
            <p className="fade-in" style={{ fontSize:13, fontWeight:600, color:TEAL, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:14, animationDelay:"0.05s" }}>
              {timeGreeting}, {firstName}
            </p>

            {/* Main headline */}
            <h1 className="fade-up" style={{ fontSize:38, fontWeight:900, lineHeight:1.12, color:TEXT, marginBottom:16, animationDelay:"0.12s", letterSpacing:"-0.5px" }}>
              Welcome to the rest of your{" "}
              <span className="shimmer-text">sober and successful</span>{" "}
              life.
            </h1>

            <p className="fade-up" style={{ fontSize:15, color:DIM, lineHeight:1.65, marginBottom:32, animationDelay:"0.2s", maxWidth:360 }}>
              A place to stay accountable, rebuild with purpose, and move forward one honest day at a time.
            </p>

            {/* CTA Buttons */}
            <div className="fade-up" style={{ display:"flex", gap:12, animationDelay:"0.28s" }}>
              <Link to={createPageUrl("DailyCheckIn")} style={{ textDecoration:"none", flex:1 }}>
                <button style={{
                  width:"100%", padding:"14px 20px",
                  background:`linear-gradient(135deg, ${TEAL}, #2AB5AC)`,
                  border:"none", borderRadius:14, color:"#fff",
                  fontWeight:800, fontSize:15, cursor:"pointer",
                  boxShadow:`0 8px 32px rgba(78,205,196,0.35)`,
                  letterSpacing:"0.01em",
                }}>
                  {hasCheckedIn ? "Continue Journey →" : "Check In Now →"}
                </button>
              </Link>
              <Link to={createPageUrl("ForwardPlan")} style={{ textDecoration:"none" }}>
                <button style={{
                  padding:"14px 18px",
                  background:"rgba(255,255,255,0.07)",
                  border:"1px solid rgba(255,255,255,0.14)",
                  borderRadius:14, color:DIM,
                  fontWeight:700, fontSize:14, cursor:"pointer",
                  backdropFilter:"blur(12px)",
                  whiteSpace:"nowrap",
                }}>
                  My Plan
                </button>
              </Link>
            </div>

            {/* Streak badge in hero */}
            {streak > 0 && (
              <div className="fade-up scale-in" style={{ marginTop:32, animationDelay:"0.36s", display:"inline-flex", alignItems:"center", gap:10,
                background:`rgba(${hexToRgb(stage.color)}, 0.1)`,
                border:`1px solid ${stage.color}35`,
                borderRadius:50, padding:"10px 18px",
                boxShadow:`0 0 28px rgba(${hexToRgb(stage.color)},0.18)`,
              }}>
                <div className="flame">
                  <Flame style={{ color:stage.color, width:18, height:18, filter:`drop-shadow(0 0 6px ${stage.glow})` }} />
                </div>
                <span style={{ fontWeight:800, fontSize:15, color:stage.color }}>{streak} Day Streak</span>
                <span style={{ fontSize:12, fontWeight:600, color:DIM }}>· {stage.name}</span>
              </div>
            )}

            {/* Stage progress dots */}
            <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:20, paddingBottom:8 }}>
              {STAGES.map((s, i) => (
                <div key={s.name} style={{
                  width: i === stageIdx ? 32 : 8, height:8, borderRadius:4,
                  background: i <= stageIdx ? s.color : "rgba(255,255,255,0.1)",
                  transition:"width 0.3s ease",
                  boxShadow: i === stageIdx ? `0 0 10px ${s.glow}` : "none",
                }} />
              ))}
              {stageIdx < STAGES.length - 1 && (
                <p style={{ fontSize:11, color:MUTED, marginLeft:6 }}>
                  → {STAGES[stageIdx+1].name} in {STAGES[stageIdx+1].minDays - streak}d
                </p>
              )}
            </div>
          </div>
        </div>

        <div style={{ padding:"0 16px" }}>

          {/* ══════════════════════════════════════════════════════
              CRISIS BANNER
          ══════════════════════════════════════════════════════ */}
          <Link to={createPageUrl("UrgentHelp")} className="card-lift" style={{ textDecoration:"none", display:"block", marginBottom:24 }}>
            <div style={{
              background:"linear-gradient(130deg, rgba(220,38,38,0.7), rgba(159,18,57,0.75))",
              borderRadius:20, padding:"16px 20px",
              display:"flex", alignItems:"center", gap:14,
              border:"1px solid rgba(248,113,113,0.2)",
              boxShadow:"0 4px 28px rgba(220,38,38,0.18)",
            }}>
              <span style={{ fontSize:26 }}>🆘</span>
              <div style={{ flex:1 }}>
                <p style={{ color:TEXT, fontWeight:700, fontSize:15 }}>Need help right now?</p>
                <p style={{ color:"rgba(255,255,255,0.65)", fontSize:12, marginTop:2 }}>Immediate crisis support — free &amp; confidential</p>
              </div>
              <ArrowRight style={{ color:"rgba(255,255,255,0.5)", width:18, height:18 }} />
            </div>
          </Link>

          {/* ══════════════════════════════════════════════════════
              DAILY MOMENTUM CARD
          ══════════════════════════════════════════════════════ */}
          <PremiumLabel icon="⚡">Daily Momentum</PremiumLabel>
          <div className="scale-in" style={{ ...GLASS, borderRadius:24, padding:"24px 22px", marginBottom:28 }}>
            {/* Score row */}
            <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:18 }}>
              <div>
                <p style={{ fontSize:56, fontWeight:900, lineHeight:1, color:stabilityColor,
                  filter:`drop-shadow(0 0 14px ${stabilityColor}70)` }}>
                  {stabilityScore ?? "—"}
                  {stabilityScore !== null && <span style={{ fontSize:24, fontWeight:600, color:DIM }}>%</span>}
                </p>
                <p style={{ fontSize:13, color:DIM, marginTop:5 }}>7-day recovery score</p>
              </div>
              <div style={{
                background:`rgba(${hexToRgb(stabilityColor)}, 0.1)`,
                border:`1px solid ${stabilityColor}40`,
                borderRadius:14, padding:"12px 16px",
                textAlign:"center",
              }}>
                <p style={{ fontSize:11, color:MUTED, marginBottom:3, textTransform:"uppercase", letterSpacing:"0.06em" }}>Status</p>
                <p style={{ fontSize:16, fontWeight:900, color:stabilityColor }}>
                  {!hasCheckInData ? "Track" : stabilityScore >= 75 ? "Stable" : stabilityScore >= 50 ? "At Risk" : "High Risk"}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ background:"rgba(255,255,255,0.06)", borderRadius:6, height:6, marginBottom:20, overflow:"hidden" }}>
              <div className="bar-fill" style={{
                height:"100%", borderRadius:6, width:`${stabilityScore ?? 0}%`,
                background:`linear-gradient(90deg, ${stabilityColor}80, ${stabilityColor})`,
                boxShadow:`0 0 12px ${stabilityColor}70`,
              }} />
            </div>

            {/* Indicator pills */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              {indicators.map(ind => (
                <div key={ind.label} style={{
                  display:"flex", alignItems:"center", gap:9,
                  background: ind.done ? "rgba(16,185,129,0.07)" : "rgba(255,255,255,0.03)",
                  border:`1px solid ${ind.done ? "rgba(16,185,129,0.28)" : "rgba(255,255,255,0.07)"}`,
                  borderRadius:14, padding:"11px 13px",
                  boxShadow: ind.done ? "0 0 12px rgba(16,185,129,0.1)" : "none",
                }}>
                  <span style={{ fontSize:16 }}>{ind.icon}</span>
                  <p style={{ fontSize:13, fontWeight:700, color: ind.done ? EMERALD : DIM }}>{ind.label}</p>
                  {ind.done && <CheckCircle2 style={{ color:EMERALD, width:14, height:14, marginLeft:"auto" }} />}
                </div>
              ))}
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════
              TODAY'S FOCUS
          ══════════════════════════════════════════════════════ */}
          <PremiumLabel icon="🎯">Today's Focus</PremiumLabel>
          <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:28 }}>
            <ActionCard
              href="DailyCheckIn"
              icon={hasCheckedIn ? <CheckCircle2 style={{ color:EMERALD, width:22, height:22 }} /> : <CalendarCheck style={{ color:TEAL, width:22, height:22 }} />}
              iconBg={hasCheckedIn ? "rgba(16,185,129,0.14)" : `rgba(78,205,196,0.14)`}
              accentColor={hasCheckedIn ? EMERALD : TEAL}
              title="Daily Check-In"
              sub={hasCheckedIn ? `Completed ✓  ${streak > 1 ? `${streak} days strong` : "Great work"}` : "30 seconds · Stay on track"}
              done={hasCheckedIn}
            />
            <ActionCard
              href="Meetings"
              icon={<Users style={{ color:EMERALD, width:22, height:22 }} />}
              iconBg="rgba(16,185,129,0.14)"
              accentColor={EMERALD}
              title="Log Meeting Attendance"
              sub="AA · NA · SMART Recovery &amp; more"
            />
            <ActionCard
              href="ParticipantMessages"
              icon={<MessageSquare style={{ color:"#A78BFA", width:22, height:22 }} />}
              iconBg="rgba(139,92,246,0.14)"
              accentColor="#A78BFA"
              title="Contact Mentor / Sponsor"
              sub="Connection is a form of strength"
            />
            <ActionCard
              href="RecoveryHub"
              icon={<BookOpen style={{ color:GOLD, width:22, height:22 }} />}
              iconBg={`rgba(212,168,87,0.14)`}
              accentColor={GOLD}
              title="Read a Recovery Article"
              sub="Education, resources &amp; guidance"
            />
          </div>

          {/* ══════════════════════════════════════════════════════
              PROGRESS MILESTONES STRIP
          ══════════════════════════════════════════════════════ */}
          <RecoveryJourneyTimeline streak={streak} user={user} />

          {/* ══════════════════════════════════════════════════════
              RESOURCE SPOTLIGHT
          ══════════════════════════════════════════════════════ */}
          {spotlightArticle && (
            <>
              <PremiumLabel icon="📖">Resource Spotlight</PremiumLabel>
              <Link to={createPageUrl("RecoveryHub")} className="card-lift" style={{ textDecoration:"none", display:"block", marginBottom:28 }}>
                <div style={{ borderRadius:24, overflow:"hidden", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.09)" }}>
                  {spotlightArticle.image_url && (
                    <div style={{ position:"relative", height:170, overflow:"hidden" }}>
                      <img src={spotlightArticle.image_url} alt={spotlightArticle.title}
                        style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                      <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom, transparent 40%, rgba(6,12,24,0.92))" }} />
                      <div style={{ position:"absolute", bottom:14, left:18 }}>
                        <span style={{
                          fontSize:11, fontWeight:700, padding:"4px 12px", borderRadius:50,
                          background: `rgba(78,205,196,0.25)`, color:TEAL,
                          border:`1px solid ${TEAL}50`,
                        }}>
                          {spotlightArticle.category}
                        </span>
                      </div>
                    </div>
                  )}
                  <div style={{ padding:"18px 20px" }}>
                    <p style={{ fontSize:17, fontWeight:800, color:TEXT, lineHeight:1.3, marginBottom:8 }}>{spotlightArticle.title}</p>
                    <p className="line-clamp-2" style={{ fontSize:13, color:DIM, lineHeight:1.55, marginBottom:14 }}>{spotlightArticle.summary}</p>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                      {spotlightArticle.source_name && (
                        <span style={{ fontSize:12, color:TEAL, fontWeight:700 }}>{spotlightArticle.source_name}</span>
                      )}
                      <span style={{ fontSize:13, color:GOLD, fontWeight:700 }}>Read More →</span>
                    </div>
                  </div>
                </div>
              </Link>
            </>
          )}

          {/* ══════════════════════════════════════════════════════
              COMMUNITY ENCOURAGEMENT
          ══════════════════════════════════════════════════════ */}
          {communityPosts.length > 0 && (
            <>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
                <PremiumLabel icon="🫂" noMargin>Community Voices</PremiumLabel>
                <Link to={createPageUrl("VoicesOfRecovery")} style={{ textDecoration:"none" }}>
                  <span style={{ fontSize:13, color:TEAL, fontWeight:700 }}>See all →</span>
                </Link>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:28 }}>
                {communityPosts.slice(0,2).map(post => (
                  <CommunitySnippet key={post.id} post={post} />
                ))}
              </div>
            </>
          )}

          {/* ══════════════════════════════════════════════════════
              NEXT RIGHT STEP
          ══════════════════════════════════════════════════════ */}
          <PremiumLabel icon="🧭">Next Right Step</PremiumLabel>
          <div style={{ borderRadius:24, overflow:"hidden", marginBottom:28 }}>
            {[
              { icon:<Map style={{ width:20, height:20 }} />, label:"Find Housing",         sub:"Transitional & supportive housing", href:"FindHelpNow?category=Housing",            color:EMERALD },
              { icon:<Target style={{ width:20, height:20 }} />, label:"Explore Jobs",     sub:"Second-chance employers near you",  href:"FindHelpNow?category=Employment Assistance", color:GOLD },
              { icon:<Zap style={{ width:20, height:20 }} />, label:"My Recovery Plan",    sub:"Goals, milestones & daily habits",  href:"ForwardPlan",                            color:TEAL },
              { icon:<Star style={{ width:20, height:20 }} />, label:"Reentry Resources", sub:"ID, benefits, legal guidance",      href:"IdentityBridge",                         color:"#A78BFA" },
            ].map((item, i) => (
              <Link key={item.label} to={createPageUrl(item.href)} className="card-lift" style={{ textDecoration:"none", display:"block" }}>
                <div style={{
                  display:"flex", alignItems:"center", gap:16, padding:"16px 20px",
                  background: i % 2 === 0 ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.025)",
                  borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.06)" : "none",
                }}>
                  <div style={{ width:42, height:42, borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center",
                    background:`rgba(${hexToRgb(item.color)},0.12)`, color:item.color, flexShrink:0 }}>
                    {item.icon}
                  </div>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:15, fontWeight:700, color:TEXT, marginBottom:2 }}>{item.label}</p>
                    <p style={{ fontSize:12, color:MUTED }}>{item.sub}</p>
                  </div>
                  <ArrowRight style={{ color:MUTED, width:16, height:16, flexShrink:0 }} />
                </div>
              </Link>
            ))}
          </div>

          {/* ══════════════════════════════════════════════════════
              SUPPORT GRID
          ══════════════════════════════════════════════════════ */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
            <PremiumLabel icon="🏡" noMargin>Nearby Support</PremiumLabel>
            <Link to={createPageUrl("FindHelpNow")} style={{ textDecoration:"none" }}>
              <span style={{ fontSize:13, color:TEAL, fontWeight:700 }}>View all →</span>
            </Link>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:28 }}>
            {SUPPORT_ITEMS.map(item => (
              <Link key={item.label} to={createPageUrl(item.href)} className="card-lift" style={{ textDecoration:"none" }}>
                <div style={{ ...GLASS, borderRadius:18, padding:"18px 10px", textAlign:"center" }}>
                  <div style={{ fontSize:26, marginBottom:7, lineHeight:1 }}>{item.icon}</div>
                  <p style={{ fontSize:11, fontWeight:700, color:TEXT, lineHeight:1.3 }}>{item.label}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* ══════════════════════════════════════════════════════
              CRISIS STRIP
          ══════════════════════════════════════════════════════ */}
          <p style={{ fontSize:11, fontWeight:700, color:MUTED, textTransform:"uppercase", letterSpacing:"1px", textAlign:"center", marginBottom:14 }}>
            Always Free · Always Available
          </p>
          <div style={{ display:"flex", gap:10, marginBottom:16 }}>
            {[
              { href:"tel:988",           label:"988",            sub:"Crisis Line",      bg:"rgba(220,38,38,0.13)",   border:"rgba(220,38,38,0.28)",   fc:"#F87171", sc:"#FCA5A5" },
              { href:"tel:18006624357",   label:"1-800-662-HELP", sub:"SAMHSA",           bg:"rgba(234,88,12,0.13)",   border:"rgba(234,88,12,0.28)",   fc:"#FB923C", sc:"#FDBA74" },
              { href:"sms:741741",        label:"Text HOME",       sub:"to 741741",        bg:"rgba(59,130,246,0.13)",  border:"rgba(59,130,246,0.28)",  fc:"#60A5FA", sc:"#93C5FD" },
            ].map(item => (
              <a key={item.href} href={item.href} style={{
                flex:1, textDecoration:"none",
                background:item.bg, border:`1px solid ${item.border}`,
                borderRadius:16, padding:"14px 8px", textAlign:"center",
              }}>
                <p style={{ fontWeight:900, color:item.fc, fontSize:12, lineHeight:1.3 }}>{item.label}</p>
                <p style={{ fontSize:11, color:item.sc, marginTop:4, fontWeight:600 }}>{item.sub}</p>
              </a>
            ))}
          </div>

          {/* Footer whisper */}
          <p style={{ textAlign:"center", fontSize:12, color:MUTED, paddingTop:8, lineHeight:1.6, paddingBottom:12 }}>
            Unbound is a support tool, not a medical provider.<br />In an emergency, call 911 or 988.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Helper components ─────────────────────────────────────────────
function PremiumLabel({ children, icon, noMargin }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom: noMargin ? 0 : 14 }}>
      {icon && <span style={{ fontSize:14 }}>{icon}</span>}
      <p style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.28)", textTransform:"uppercase", letterSpacing:"1.1px" }}>
        {children}
      </p>
      <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.05)", marginLeft:4 }} />
    </div>
  );
}

function ActionCard({ href, icon, iconBg, accentColor, title, sub, done }) {
  return (
    <Link to={createPageUrl(href)} className="card-lift" style={{ textDecoration:"none" }}>
      <div style={{
        display:"flex", alignItems:"center", gap:16,
        background: done ? `rgba(${hexToRgb(accentColor)},0.07)` : "rgba(255,255,255,0.04)",
        border:`1px solid ${done ? `${accentColor}35` : "rgba(255,255,255,0.08)"}`,
        borderRadius:20, padding:"17px 18px",
        boxShadow: done ? `0 0 20px rgba(${hexToRgb(accentColor)},0.1)` : "none",
      }}>
        <div style={{ width:46, height:46, borderRadius:14, background:iconBg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          {icon}
        </div>
        <div style={{ flex:1 }}>
          <p style={{ fontSize:15, fontWeight:700, color:TEXT, marginBottom:2 }} dangerouslySetInnerHTML={{ __html: title }} />
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.42)" }} dangerouslySetInnerHTML={{ __html: sub }} />
        </div>
        <div style={{ padding:"8px 13px", borderRadius:12, background:`rgba(${hexToRgb(accentColor)},0.14)`, flexShrink:0 }}>
          <ArrowRight style={{ color:accentColor, width:15, height:15 }} />
        </div>
      </div>
    </Link>
  );
}

function CommunitySnippet({ post }) {
  const CAT = { support:"🤝", milestone:"🏆", advice:"💡", question:"❓" };
  const handle = post.is_anonymous ? "Anonymous" : (post.created_by?.split("@")[0] || "Member");
  return (
    <div style={{
      background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)",
      borderRadius:20, padding:"16px 18px",
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
        <div style={{ width:34, height:34, borderRadius:"50%", background:"rgba(78,205,196,0.12)",
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>
          {CAT[post.category] || "💬"}
        </div>
        <p style={{ fontSize:13, fontWeight:700, color:TEXT }}>{handle}</p>
      </div>
      <p style={{ fontSize:14, color:DIM, lineHeight:1.6,
        overflow:"hidden", display:"-webkit-box", WebkitLineClamp:3, WebkitBoxOrient:"vertical" }}>
        {post.content}
      </p>
      {post.like_count > 0 && (
        <p style={{ fontSize:12, color:MUTED, marginTop:10 }}>❤️ {post.like_count} found this helpful</p>
      )}
    </div>
  );
}