import React, { useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "./utils";
import {
  Loader2, CheckCircle2, CalendarCheck, Users, MessageSquare,
  BookOpen, Map, Briefcase, Target, Heart, ArrowRight,
  Flame, Home as HomeIcon, FileText, MessageCircle, Building2
} from "lucide-react";
import RecoveryJourneyTimeline from "@/components/home/RecoveryJourneyTimeline";
import TopFiveFocusWidget from "@/components/home/TopFiveFocusWidget";
import EarlyWarningBanner from "@/components/home/EarlyWarningBanner";
import CravingSupportWidget from "@/components/home/CravingSupportWidget";
import AftercarePlanBanner from "@/components/home/AftercarePlanBanner";

// ─── Tokens ───────────────────────────────────────────────────────
const C = {
  teal:    "#2DD4BF",
  gold:    "#C9A96E",
  navy:    "#07090F",
  indigo:  "#6366F1",
  emerald: "#10B981",
  purple:  "#8B5CF6",
  slate:   "rgba(241,245,249,0.55)",
  muted:   "rgba(241,245,249,0.28)",
  glass:   { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", backdropFilter:"blur(16px)", WebkitBackdropFilter:"blur(16px)" },
};

const STAGES = [
  { name:"Ember",   minDays:0,  color:"#94A3B8", glow:"rgba(148,163,184,0.3)",  desc:"The spark within you is alive." },
  { name:"Spark",   minDays:7,  color:"#F97316", glow:"rgba(249,115,22,0.35)",  desc:"Something powerful is growing." },
  { name:"Flame",   minDays:14, color:C.gold,    glow:"rgba(201,169,110,0.4)",  desc:"Your fire is burning bright." },
  { name:"Ascent",  minDays:30, color:C.emerald, glow:"rgba(16,185,129,0.4)",   desc:"Rising stronger every day." },
  { name:"Phoenix", minDays:90, color:"#A78BFA", glow:"rgba(167,139,250,0.45)", desc:"You have risen. Lead the way." },
];
const getStage = (s) => [...STAGES].reverse().find(x => s >= x.minDays) || STAGES[0];

function rgb(hex) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
}

// ─── Quick tools ──────────────────────────────────────────────────
const TOOLS = [
  { icon:<CalendarCheck className="w-5 h-5"/>, label:"Check-In",   sub:"Daily accountability", href:"DailyCheckIn",    color:C.teal   },
  { icon:<FileText       className="w-5 h-5"/>, label:"My Goals",   sub:"Track daily progress",  href:"GoalBoard",       color:C.gold   },
  { icon:<BookOpen       className="w-5 h-5"/>, label:"Resources",  sub:"Articles & guides",    href:"RecoveryHub",     color:C.indigo },
  { icon:<Users          className="w-5 h-5"/>, label:"Community",  sub:"Real people, real wins",href:"VoicesOfRecovery",color:C.emerald},
  { icon:<Briefcase      className="w-5 h-5"/>, label:"Jobs",       sub:"Second-chance employers",href:"EmploymentOpportunities",color:"#F59E0B"},
  { icon:<HomeIcon       className="w-5 h-5"/>, label:"Housing",    sub:"Find safe housing",    href:"HousingAssistance",color:"#34D399"},
  { icon:<FileText       className="w-5 h-5"/>, label:"Journal",    sub:"Your private space",   href:"Journal",         color:"#818CF8"},
  { icon:<MessageCircle  className="w-5 h-5"/>, label:"Messages",   sub:"Reach out for support",href:"ParticipantMessages",color:"#F472B6"},
];

const NEXT_STEPS = [
  { icon:<Building2  className="w-5 h-5"/>, label:"Find Housing Help",         sub:"Transitional & supportive housing near you",  href:"HousingAssistance",     color:C.emerald },
  { icon:<Briefcase  className="w-5 h-5"/>, label:"Explore Job Resources",     sub:"Second-chance employers ready to hire",       href:"EmploymentOpportunities",color:C.gold    },
  { icon:<Target     className="w-5 h-5"/>, label:"Review My Reentry Plan",    sub:"Goals, milestones & forward momentum",        href:"ForwardPlan",           color:C.teal    },
  { icon:<Heart      className="w-5 h-5"/>, label:"Relapse Prevention Steps",  sub:"Stay prepared. Build your safety net.",       href:"CravingControlCenter",  color:"#F472B6" },
  { icon:<Map        className="w-5 h-5"/>, label:"Contact Support",           sub:"Reach your counselor or sponsor now",         href:"ParticipantMessages",   color:C.indigo  },
  { icon:<Users      className="w-5 h-5"/>, label:"Community Encouragement",   sub:"Real stories. Real progress.",                href:"VoicesOfRecovery",      color:"#A78BFA" },
];

// ─────────────────────────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const p = document.body.style.background;
    document.body.style.background = C.navy;
    return () => { document.body.style.background = p; };
  }, []);

  const { data: user,     isLoading: uL } = useQuery({ queryKey:["user"],          queryFn:() => base44.auth.me() });
  const { data: profiles, isLoading: pL, isFetched: pF } = useQuery({
    queryKey:["my-profile", user?.email],
    queryFn: () => base44.entities.MemberProfile.filter({ created_by: user.email }),
    enabled: !!user?.email, staleTime:30_000,
  });
  const { data: checkIns = [] } = useQuery({
    queryKey:["daily-checkins-home", user?.email],
    queryFn: () => base44.entities.DailyCheckIn.filter({ participant_email: user.email }, "-check_in_date", 90),
    enabled: !!user?.email,
  });
  const { data: articles = [] } = useQuery({
    queryKey:["home-spotlight"],
    queryFn: () => base44.entities.Article.filter({ featured:true, approved:true }, "-created_date", 1),
    staleTime:60_000,
  });
  const { data: posts = [] } = useQuery({
    queryKey:["home-community"],
    queryFn: () => base44.entities.CommunityPost.filter({ moderation_status:"approved" }, "-created_date", 3),
    staleTime:60_000,
  });

  useEffect(() => {
    if (!user || !pF) return;
    if (!profiles?.[0]?.onboarding_complete) navigate(createPageUrl("Onboarding"));
  }, [user, profiles, pF, navigate]);

  if (uL || (!!user && pL)) return (
    <div style={{ background:C.navy, minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <Loader2 className="w-7 h-7 animate-spin" style={{ color:C.teal }} />
    </div>
  );

  // ── Computed ─────────────────────────────────────────────────
  const today        = new Date().toISOString().split("T")[0];
  const checked      = checkIns.some(c => c.check_in_date === today);
  const firstName    = user?.full_name?.split(" ")[0] || "there";
  const hour         = new Date().getHours();
  const greeting     = hour<12?"Good morning":hour<17?"Good afternoon":"Good evening";

  const sevenAgo     = new Date(); sevenAgo.setDate(sevenAgo.getDate()-7);
  const last7        = checkIns.filter(c => new Date(c.check_in_date) >= sevenAgo);

  const streak = (() => {
    const sorted = [...checkIns].sort((a,b) => new Date(b.check_in_date)-new Date(a.check_in_date));
    let n=0, cur=new Date(); cur.setHours(0,0,0,0);
    for (const c of sorted) {
      const d=new Date(c.check_in_date); d.setHours(0,0,0,0);
      if (Math.round((cur-d)/86400000) <= 1) { n++; cur=d; } else break;
    }
    return n;
  })();

  const stage    = getStage(streak);
  const stageIdx = STAGES.findIndex(s => s.name === stage.name);

  const avgCraving   = last7.length ? last7.reduce((s,c) => s+(c.craving_intensity??5),0)/last7.length : 5;
  const scoreCheckin = Math.min(last7.length/7,1)*25;
  const scoreMeeting = last7.length ? (last7.filter(c=>c.attended_meeting).length/last7.length)*25 : 0;
  const scoreSponsor = last7.length ? (last7.filter(c=>c.connected_with_sponsor).length/last7.length)*25 : 0;
  const scoreCraving = Math.max(0,(10-avgCraving)/10)*25;
  const hasData      = last7.length > 0;
  const stability    = hasData ? Math.round(scoreCheckin+scoreMeeting+scoreSponsor+scoreCraving) : null;
  const stabColor    = !hasData ? C.teal : stability>=75 ? C.emerald : stability>=50 ? C.gold : "#EF4444";
  const stabLabel    = !hasData ? "Start Tracking" : stability>=75 ? "Stable" : stability>=50 ? "At Risk" : "High Risk";

  const weeklyMeetings = last7.filter(c => c.attended_meeting).length;
  const sponsorContacts= last7.filter(c => c.connected_with_sponsor).length;

  const spotlight = articles[0];

  return (
    <div style={{ background:`linear-gradient(170deg,#070D1C 0%,#0B1424 55%,#080E1C 100%)`, minHeight:"100vh", paddingBottom:120 }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes glow   { 0%,100%{opacity:.7} 50%{opacity:1} }
        @keyframes barFill{ from{width:0} }
        @keyframes flicker{ 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(1.08) scaleX(.96)} }
        @keyframes shimmer{
          0%{background-position:-200% center}
          100%{background-position:200% center}
        }
        .u-fadeUp  { animation: fadeUp  0.65s cubic-bezier(.22,1,.36,1) both; }
        .u-fadeIn  { animation: fadeIn  0.5s ease both; }
        .u-glow    { animation: glow    3s ease-in-out infinite; }
        .u-bar     { animation: barFill 1.6s cubic-bezier(.4,0,.2,1) forwards; }
        .u-flame   { animation: flicker 2s ease-in-out infinite; transform-origin:bottom center; }
        .u-shimmer {
          background: linear-gradient(90deg,${C.gold} 0%,#fffbe8 45%,${C.gold} 90%);
          background-size: 200% auto;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3.2s linear infinite;
        }
        .lift { transition: transform .18s ease, box-shadow .18s ease; }
        .lift:active { transform: scale(.97); }
      `}</style>

      <div style={{ maxWidth:480, margin:"0 auto" }}>

        {/* ═══════════════════════════════════════════════════════
            §1 — HERO
        ═══════════════════════════════════════════════════════ */}
        <div style={{ position:"relative", overflow:"hidden", padding:"0 0 56px" }}>
          {/* Layered bg */}
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(155deg,#0E1D3A 0%,#081426 60%,#070D1C 100%)" }}/>
          <div style={{ position:"absolute", top:-100, right:-80, width:400, height:400, borderRadius:"50%",
            background:"radial-gradient(circle,rgba(62,207,191,0.1) 0%,transparent 68%)", pointerEvents:"none" }}/>
          <div style={{ position:"absolute", bottom:-60, left:-60, width:320, height:280, borderRadius:"50%",
            background:"radial-gradient(circle,rgba(201,169,110,0.07) 0%,transparent 70%)", pointerEvents:"none" }}/>
          {/* Subtle arc lines */}
          <svg style={{ position:"absolute",inset:0,width:"100%",height:"100%",opacity:.05,pointerEvents:"none" }} viewBox="0 0 480 460" fill="none">
            <circle cx="440" cy="-20" r="230" stroke="white" strokeWidth="1"/>
            <circle cx="440" cy="-20" r="330" stroke="white" strokeWidth=".6"/>
            <circle cx="-30" cy="430" r="280" stroke="white" strokeWidth=".7"/>
            <path d="M0 200 Q240 70 480 220" stroke="white" strokeWidth=".8"/>
          </svg>

          <div style={{ position:"relative", zIndex:1, padding:"72px 24px 0" }}>
            {/* Brand lockup */}
            <div className="u-fadeIn" style={{ display:'flex', alignItems:'center', gap:8, marginBottom:20, animationDelay:'.04s' }}>
              <span style={{ fontSize:22, fontWeight:900, color:'#2DD4BF', letterSpacing:'-.03em', lineHeight:1 }}>Rebos</span>
              <span style={{ fontSize:11, color:'rgba(255,255,255,0.25)', fontWeight:400, letterSpacing:'.02em' }}>by Unbound</span>
              <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.06)', marginLeft:4 }}/>
              <p style={{ fontSize:11, fontWeight:600, color:'rgba(45,212,191,0.7)', letterSpacing:'.06em', textTransform:'uppercase' }}>
                {greeting}
              </p>
            </div>

            <h1 className="u-fadeUp" style={{ fontSize:32, fontWeight:900, lineHeight:1.12, color:"#fff", letterSpacing:"-.5px", marginBottom:14, animationDelay:".1s" }}>
              Welcome back,{" "}
              <span className="u-shimmer">{firstName}.</span>
            </h1>

            <p className="u-fadeUp" style={{ fontSize:15, color:"rgba(255,255,255,0.45)", lineHeight:1.65, marginBottom:32, animationDelay:".18s", maxWidth:340 }}>
              Your calm, structured companion for recovery — one honest day at a time.
            </p>

            <div className="u-fadeUp" style={{ display:"flex", gap:12, animationDelay:".26s" }}>
              <Link to={createPageUrl("DailyCheckIn")} style={{ flex:1, textDecoration:"none" }}>
                <button className="lift" style={{
                  width:"100%", padding:"15px 20px",
                  background:`linear-gradient(135deg,#2DD4BF,#22C5B0)`,
                  border:"none", borderRadius:16, color:"#07090F",
                  fontWeight:800, fontSize:15, cursor:"pointer",
                  boxShadow:`0 8px 32px rgba(45,212,191,0.28)`,
                }}>
                  {checked ? "Continue My Journey →" : "Check In Now →"}
                </button>
              </Link>
              <Link to={createPageUrl("RecoveryHub")} style={{ textDecoration:"none" }}>
                <button className="lift" style={{
                  padding:"15px 20px", whiteSpace:"nowrap",
                  background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)",
                  borderRadius:16, color:"rgba(255,255,255,0.6)", fontWeight:700, fontSize:14, cursor:"pointer",
                }}>
                  Explore
                </button>
              </Link>
            </div>

              {/* Stage dot strip */}
            <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:30 }}>
              {STAGES.map((s,i) => (
                <div key={s.name} style={{
                  width: i===stageIdx ? 30 : 8, height:8, borderRadius:4,
                  background: i<=stageIdx ? s.color : "rgba(255,255,255,0.1)",
                  transition:"width .3s ease",
                  boxShadow: i===stageIdx ? `0 0 10px ${s.glow}` : "none",
                }}/>
              ))}
              <p style={{ fontSize:11, color:C.muted, marginLeft:6 }}>
                {stageIdx < STAGES.length-1 ? `${STAGES[stageIdx+1].name} in ${STAGES[stageIdx+1].minDays-streak}d` : "Phoenix 🦅"}
              </p>
            </div>
          </div>
        </div>

        <div style={{ padding:"0 16px" }}>

          {/* ═══════════════════════════════════════════════════════
              §1b — AFTERCARE / TREATMENT PLAN BANNER
          ═══════════════════════════════════════════════════════ */}
          {user && <AftercarePlanBanner user={user} />}

          {/* ═══════════════════════════════════════════════════════
              §2 — PERSONALIZED WELCOME CARD
          ═══════════════════════════════════════════════════════ */}
          <div style={{ ...C.glass, borderRadius:24, padding:"24px 22px", marginBottom:20,
            background:`rgba(${rgb(stage.color)},0.06)`, borderColor:`${stage.color}30`,
            boxShadow:`0 0 40px rgba(${rgb(stage.color)},0.08)` }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
              <div className="u-flame" style={{ flexShrink:0 }}>
                <Flame style={{ color:stage.color, width:26, height:26, filter:`drop-shadow(0 0 8px ${stage.glow})` }}/>
              </div>
              <div>
                <p style={{ fontSize:18, fontWeight:800, color:"#fff", lineHeight:1.25 }}>
                  Welcome back, {firstName}.
                </p>
                <p style={{ fontSize:13, color:C.slate, marginTop:2 }}>{stage.desc}</p>
              </div>
            </div>

            <p style={{ fontSize:14, color:C.slate, lineHeight:1.6, marginBottom:18 }}>
              You've built real momentum.{streak > 0 ? ` ${streak} days strong — ` : " "} Let's keep it going today.
            </p>

            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:18 }}>
              <div style={{ flex:1, padding:"12px 16px", borderRadius:14,
                background:`rgba(${rgb(stage.color)},0.1)`, border:`1px solid ${stage.color}30` }}>
                <p style={{ fontSize:28, fontWeight:900, color:stage.color, lineHeight:1 }}>{streak}</p>
                <p style={{ fontSize:11, color:C.muted, marginTop:2 }}>Day Streak</p>
              </div>
              <div style={{ flex:1, padding:"12px 16px", borderRadius:14,
                background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)" }}>
                <p style={{ fontSize:28, fontWeight:900, color:C.teal, lineHeight:1 }}>{checked ? "✓" : "—"}</p>
                <p style={{ fontSize:11, color:C.muted, marginTop:2 }}>Checked In</p>
              </div>
              <div style={{ flex:1, padding:"12px 16px", borderRadius:14,
                background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)" }}>
                <p style={{ fontSize:28, fontWeight:900, color:C.gold, lineHeight:1 }}>{weeklyMeetings}</p>
                <p style={{ fontSize:11, color:C.muted, marginTop:2 }}>Meetings (7d)</p>
              </div>
            </div>

            <Link to={createPageUrl("DailyCheckIn")} style={{ textDecoration:"none" }}>
              <button className="lift" style={{
                width:"100%", padding:"13px 20px", borderRadius:14,
                background: checked ? "rgba(16,185,129,0.12)" : `linear-gradient(135deg,${C.teal},#2CB8AE)`,
                border: checked ? "1px solid rgba(16,185,129,0.3)" : "none",
                color: checked ? C.emerald : "#fff", fontWeight:700, fontSize:14, cursor:"pointer",
              }}>
                {checked ? "✓ Check-In Complete — View My Next Steps" : "Complete Today's Check-In →"}
              </button>
            </Link>
          </div>

          {/* ═══════════════════════════════════════════════════════
              §2b — EARLY WARNING BANNER (shown if at risk)
          ═══════════════════════════════════════════════════════ */}
          {user && (
            <EarlyWarningBanner
              checkIns={checkIns}
              journalCount={0}
              communityPostCount={0}
              cravingPostCount={checkIns.filter(c => (c.craving_intensity ?? 0) >= 7).length}
            />
          )}

          {/* ═══════════════════════════════════════════════════════
              §2c — TOP 5 FOCUS WIDGET
          ═══════════════════════════════════════════════════════ */}
          {user && <TopFiveFocusWidget user={user} />}
          <CravingSupportWidget />

          {/* ═══════════════════════════════════════════════════════
              §3 — DAILY MOMENTUM / CHECK-IN BLOCK
          ═══════════════════════════════════════════════════════ */}
          <SLabel icon="⚡">Daily Momentum</SLabel>
          <div style={{ ...C.glass, borderRadius:24, padding:"24px 22px", marginBottom:20 }}>
            <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:16 }}>
              <div>
                <p style={{ fontSize:52, fontWeight:900, lineHeight:1, color:stabColor,
                  filter:`drop-shadow(0 0 14px ${stabColor}70)` }}>
                  {stability ?? "—"}{stability!==null && <span style={{ fontSize:22, fontWeight:600, color:C.muted }}>%</span>}
                </p>
                <p style={{ fontSize:12, color:C.muted, marginTop:4 }}>7-day recovery score</p>
              </div>
              <div style={{ padding:"10px 16px", borderRadius:14, background:`rgba(${rgb(stabColor)},0.1)`,
                border:`1px solid ${stabColor}40`, textAlign:"center" }}>
                <p style={{ fontSize:11, color:C.muted, marginBottom:2, textTransform:"uppercase", letterSpacing:".06em" }}>Status</p>
                <p style={{ fontSize:15, fontWeight:900, color:stabColor }}>{stabLabel}</p>
              </div>
            </div>

            <div style={{ background:"rgba(255,255,255,0.06)", borderRadius:6, height:6, overflow:"hidden", marginBottom:20 }}>
              <div className="u-bar" style={{
                height:"100%", borderRadius:6, width:`${stability ?? 0}%`,
                background:`linear-gradient(90deg,${stabColor}80,${stabColor})`,
                boxShadow:`0 0 12px ${stabColor}60`,
              }}/>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              {[
                { label:"Check-ins",   done:last7.length>=4,                         icon:"📅" },
                { label:"Meetings",    done:last7.some(c=>c.attended_meeting),        icon:"🤝" },
                { label:"Sponsor",     done:last7.some(c=>c.connected_with_sponsor),  icon:"🫂" },
                { label:"Low Craving", done:avgCraving<5,                             icon:"💆" },
              ].map(ind => (
                <div key={ind.label} style={{
                  display:"flex", alignItems:"center", gap:9, padding:"11px 13px", borderRadius:14,
                  background: ind.done ? "rgba(16,185,129,0.07)" : "rgba(255,255,255,0.03)",
                  border:`1px solid ${ind.done ? "rgba(16,185,129,0.28)" : "rgba(255,255,255,0.07)"}`,
                }}>
                  <span style={{ fontSize:15 }}>{ind.icon}</span>
                  <p style={{ fontSize:13, fontWeight:700, color:ind.done ? C.emerald : C.slate }}>{ind.label}</p>
                  {ind.done && <CheckCircle2 style={{ color:C.emerald, width:13, height:13, marginLeft:"auto" }}/>}
                </div>
              ))}
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════
              §4 — TODAY'S FOCUS
          ═══════════════════════════════════════════════════════ */}
          <SLabel icon="🎯">Today's Focus</SLabel>
          <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:20 }}>
            {[
              { icon:<CalendarCheck className="w-5 h-5"/>, label:"Complete Check-In",        sub: checked ? "Completed ✓" : "30 seconds · Stay on track",              href:"DailyCheckIn",        color:C.teal,    done:checked },
              { icon:<Users          className="w-5 h-5"/>, label:"Log Meeting Attendance",   sub:"AA · NA · SMART Recovery & more",                                  href:"Meetings",            color:C.emerald                },
              { icon:<BookOpen       className="w-5 h-5"/>, label:"Read a Recovery Article",  sub:"Education builds resilience",                                       href:"RecoveryHub",         color:C.gold                   },
              { icon:<MessageSquare  className="w-5 h-5"/>, label:"Message Mentor / Sponsor", sub:"Connection is strength",                                            href:"ParticipantMessages", color:"#A78BFA"                 },
              { icon:<Target         className="w-5 h-5"/>, label:"Review My Plan",           sub:"Check goals & update progress",                                     href:"ForwardPlan",         color:C.indigo                 },
            ].map(item => (
              <Link key={item.label} to={createPageUrl(item.href)} className="lift" style={{ textDecoration:"none" }}>
                <div style={{
                  display:"flex", alignItems:"center", gap:16, padding:"16px 18px", borderRadius:20,
                  background: item.done ? `rgba(${rgb(item.color)},0.07)` : "rgba(255,255,255,0.04)",
                  border:`1px solid ${item.done ? `${item.color}35` : "rgba(255,255,255,0.08)"}`,
                  boxShadow: item.done ? `0 0 20px rgba(${rgb(item.color)},0.1)` : "none",
                }}>
                  <div style={{ width:44, height:44, borderRadius:14, flexShrink:0,
                    background:`rgba(${rgb(item.color)},0.14)`, color:item.color,
                    display:"flex", alignItems:"center", justifyContent:"center" }}>
                    {item.icon}
                  </div>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:15, fontWeight:700, color:"#fff", marginBottom:2 }}>{item.label}</p>
                    <p style={{ fontSize:12, color:C.muted }}>{item.sub}</p>
                  </div>
                  <ArrowRight style={{ color:item.done ? item.color : C.muted, width:16, height:16, flexShrink:0 }}/>
                </div>
              </Link>
            ))}
          </div>

          {/* ═══════════════════════════════════════════════════════
              §5 — PROGRESS SNAPSHOT
          ═══════════════════════════════════════════════════════ */}
          <SLabel icon="📊">Progress Snapshot</SLabel>
          <RecoveryJourneyTimeline streak={streak} user={user} />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:20 }}>
            {[
              { label:"Day Streak",      value:streak,          unit:"days",    color:stage.color  },
              { label:"Weekly Meetings", value:weeklyMeetings,  unit:"this week",color:C.emerald   },
              { label:"Sponsor Contacts",value:sponsorContacts, unit:"this week",color:C.indigo    },
              { label:"Check-Ins",       value:last7.length,    unit:"/ 7 days", color:C.teal      },
            ].map(stat => (
              <div key={stat.label} style={{ ...C.glass, borderRadius:20, padding:"20px 18px" }}>
                <p style={{ fontSize:38, fontWeight:900, lineHeight:1, color:stat.color,
                  filter:`drop-shadow(0 0 10px ${stat.color}60)` }}>{stat.value}</p>
                <p style={{ fontSize:11, color:C.muted, marginTop:4 }}>{stat.unit}</p>
                <p style={{ fontSize:13, fontWeight:700, color:C.slate, marginTop:6 }}>{stat.label}</p>
              </div>
            ))}
          </div>

          {/* ═══════════════════════════════════════════════════════
              §6 — NEXT RIGHT STEP
          ═══════════════════════════════════════════════════════ */}
          <SLabel icon="🧭">Next Right Step</SLabel>
          <div style={{ borderRadius:24, overflow:"hidden", border:"1px solid rgba(255,255,255,0.07)", marginBottom:20 }}>
            {NEXT_STEPS.map((item, i) => (
              <Link key={item.label} to={createPageUrl(item.href)} className="lift" style={{ textDecoration:"none", display:"block" }}>
                <div style={{
                  display:"flex", alignItems:"center", gap:16, padding:"16px 20px",
                  background: i%2===0 ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.025)",
                  borderBottom: i<NEXT_STEPS.length-1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                }}>
                  <div style={{ width:42, height:42, borderRadius:14, flexShrink:0,
                    background:`rgba(${rgb(item.color)},0.12)`, color:item.color,
                    display:"flex", alignItems:"center", justifyContent:"center" }}>
                    {item.icon}
                  </div>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:15, fontWeight:700, color:"#fff", marginBottom:2 }}>{item.label}</p>
                    <p style={{ fontSize:12, color:C.muted }}>{item.sub}</p>
                  </div>
                  <ArrowRight style={{ color:C.muted, width:16, height:16, flexShrink:0 }}/>
                </div>
              </Link>
            ))}
          </div>

          {/* ═══════════════════════════════════════════════════════
              §7 — RESOURCE SPOTLIGHT
          ═══════════════════════════════════════════════════════ */}
          {spotlight && (
            <>
              <SLabel icon="📖">Resource Spotlight</SLabel>
              <Link to={createPageUrl("RecoveryHub")} className="lift" style={{ textDecoration:"none", display:"block", marginBottom:20 }}>
                <div style={{ borderRadius:24, overflow:"hidden", border:"1px solid rgba(255,255,255,0.09)", background:"rgba(255,255,255,0.04)" }}>
                  {spotlight.image_url && (
                    <div style={{ position:"relative", height:180, overflow:"hidden" }}>
                      <img src={spotlight.image_url} alt={spotlight.title} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                      <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom,transparent 40%,rgba(7,13,28,0.9))" }}/>
                      <span style={{ position:"absolute", bottom:14, left:18,
                        fontSize:11, fontWeight:700, padding:"4px 12px", borderRadius:50,
                        background:"rgba(62,207,191,0.2)", color:C.teal, border:`1px solid ${C.teal}50` }}>
                        {spotlight.category}
                      </span>
                    </div>
                  )}
                  <div style={{ padding:"18px 20px" }}>
                    <p style={{ fontSize:17, fontWeight:800, color:"#fff", lineHeight:1.3, marginBottom:8 }}>{spotlight.title}</p>
                    <p style={{ fontSize:13, color:C.slate, lineHeight:1.55, marginBottom:14,
                      overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>
                      {spotlight.summary}
                    </p>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                      {spotlight.source_name && <span style={{ fontSize:12, color:C.teal, fontWeight:700 }}>{spotlight.source_name}</span>}
                      <span style={{ fontSize:13, color:C.gold, fontWeight:700 }}>Read More →</span>
                    </div>
                  </div>
                </div>
              </Link>
            </>
          )}

          {/* ═══════════════════════════════════════════════════════
              §8 — COMMUNITY ENCOURAGEMENT
          ═══════════════════════════════════════════════════════ */}
          {posts.length > 0 && (
            <>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
                <SLabel icon="🫂" noMargin>Encouragement From the Community</SLabel>
                <Link to={createPageUrl("VoicesOfRecovery")} style={{ textDecoration:"none" }}>
                  <span style={{ fontSize:13, color:C.teal, fontWeight:700 }}>See all →</span>
                </Link>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:20 }}>
                {posts.slice(0,2).map(post => {
                  const CAT = { support:"🤝", milestone:"🏆", advice:"💡", question:"❓" };
                  const handle = post.is_anonymous ? "Anonymous" : (post.created_by?.split("@")[0] || "Member");
                  return (
                    <div key={post.id} style={{ ...C.glass, borderRadius:20, padding:"16px 18px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                        <div style={{ width:34, height:34, borderRadius:"50%", flexShrink:0,
                          background:`rgba(${rgb(C.teal)},0.12)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>
                          {CAT[post.category] || "💬"}
                        </div>
                        <div>
                          <p style={{ fontSize:13, fontWeight:700, color:"#fff" }}>{handle}</p>
                          <p style={{ fontSize:11, color:C.muted }}>{post.category}</p>
                        </div>
                      </div>
                      <p style={{ fontSize:14, color:C.slate, lineHeight:1.62,
                        overflow:"hidden", display:"-webkit-box", WebkitLineClamp:3, WebkitBoxOrient:"vertical" }}>
                        {post.content}
                      </p>
                      {post.like_count > 0 && (
                        <p style={{ fontSize:12, color:C.muted, marginTop:10 }}>❤️ {post.like_count} found this helpful</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* ═══════════════════════════════════════════════════════
              §9 — FEATURED TOOLS / QUICK ACCESS
          ═══════════════════════════════════════════════════════ */}
          <SLabel icon="⚙️">Featured Tools</SLabel>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:28 }}>
            {TOOLS.map(tool => (
              <Link key={tool.label} to={createPageUrl(tool.href)} className="lift" style={{ textDecoration:"none" }}>
                <div style={{ ...C.glass, borderRadius:20, padding:"18px 16px" }}>
                  <div style={{ width:42, height:42, borderRadius:12, marginBottom:12,
                    background:`rgba(${rgb(tool.color)},0.14)`, color:tool.color,
                    display:"flex", alignItems:"center", justifyContent:"center" }}>
                    {tool.icon}
                  </div>
                  <p style={{ fontSize:14, fontWeight:800, color:"#fff", marginBottom:3 }}>{tool.label}</p>
                  <p style={{ fontSize:11, color:C.muted, lineHeight:1.4 }}>{tool.sub}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* ═══════════════════════════════════════════════════════
              §10 — MOTIVATIONAL FOOTER BANNER
          ═══════════════════════════════════════════════════════ */}
          <div style={{ borderRadius:24, overflow:"hidden", marginBottom:20, position:"relative" }}>
            <div style={{ position:"absolute", inset:0, background:"linear-gradient(135deg,#0E2040,#132A4A,#0D1E38)" }}/>
            <div style={{ position:"absolute", top:-40, right:-40, width:220, height:220, borderRadius:"50%",
              background:`radial-gradient(circle,rgba(${rgb(C.teal)},0.15) 0%,transparent 70%)`, pointerEvents:"none" }}/>
            <div style={{ position:"absolute", bottom:-30, left:-30, width:180, height:180, borderRadius:"50%",
              background:`radial-gradient(circle,rgba(${rgb(C.gold)},0.1) 0%,transparent 70%)`, pointerEvents:"none" }}/>
            <div style={{ position:"relative", zIndex:1, padding:"36px 28px", textAlign:"center" }}>
              <p style={{ fontSize:11, fontWeight:700, color:C.teal, textTransform:"uppercase", letterSpacing:".1em", marginBottom:12 }}>
                Keep Going
              </p>
              <h2 style={{ fontSize:26, fontWeight:900, color:"#fff", lineHeight:1.2, marginBottom:14, letterSpacing:"-.3px" }}>
                Your future is being{" "}
                <span className="u-shimmer">built right now.</span>
              </h2>
              <p style={{ fontSize:14, color:C.slate, lineHeight:1.65, marginBottom:28, maxWidth:320, margin:"0 auto 28px" }}>
                Progress is happening, even when it feels slow. One honest day at a time still changes everything.
              </p>
              <Link to={createPageUrl("DailyCheckIn")} style={{ textDecoration:"none" }}>
                <button className="lift" style={{
                  padding:"14px 32px", borderRadius:14,
                  background:`linear-gradient(135deg,${C.teal},#2CB8AE)`,
                  border:"none", color:"#fff", fontWeight:800, fontSize:15, cursor:"pointer",
                  boxShadow:`0 8px 30px rgba(${rgb(C.teal)},0.3)`,
                }}>
                  Take Today's Next Step →
                </button>
              </Link>
            </div>
          </div>

          {/* Crisis strip */}
          <p style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"1px", textAlign:"center", marginBottom:12 }}>
            Always Free · Always Available
          </p>
          <div style={{ display:"flex", gap:10, marginBottom:16 }}>
            {[
              { href:"tel:988",         label:"988",          sub:"Crisis Line", bg:"rgba(220,38,38,0.12)", border:"rgba(220,38,38,0.25)", fc:"#F87171", sc:"#FCA5A5" },
              { href:"tel:18006624357", label:"1-800-662-HELP",sub:"SAMHSA",     bg:"rgba(234,88,12,0.12)", border:"rgba(234,88,12,0.25)", fc:"#FB923C", sc:"#FDBA74" },
              { href:"sms:741741",      label:"Text HOME",    sub:"to 741741",   bg:"rgba(59,130,246,0.12)",border:"rgba(59,130,246,0.25)",fc:"#60A5FA", sc:"#93C5FD" },
            ].map(x => (
              <a key={x.href} href={x.href} style={{ flex:1, textDecoration:"none", background:x.bg,
                border:`1px solid ${x.border}`, borderRadius:16, padding:"14px 8px", textAlign:"center" }}>
                <p style={{ fontWeight:900, color:x.fc, fontSize:12, lineHeight:1.3 }}>{x.label}</p>
                <p style={{ fontSize:11, color:x.sc, marginTop:3, fontWeight:600 }}>{x.sub}</p>
              </a>
            ))}
          </div>

          <p style={{ textAlign:"center", fontSize:11, color:C.muted, lineHeight:1.6, paddingBottom:8 }}>
            Unbound is a support tool, not a medical provider.<br/>In an emergency, call 911 or 988.
          </p>

        </div>
      </div>
    </div>
  );
}

function SLabel({ children, icon, noMargin }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom: noMargin ? 0 : 14 }}>
      {icon && <span style={{ fontSize:14 }}>{icon}</span>}
      <p style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"1.1px" }}>{children}</p>
      <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.05)", marginLeft:4 }}/>
    </div>
  );
}