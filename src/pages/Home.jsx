import React, { useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "./utils";
import {
  Loader2, CheckCircle2, CalendarCheck, Users, MessageSquare,
  BookOpen, Briefcase, Target, Heart, ArrowRight,
  Flame, Home as HomeIcon, FileText, MessageCircle, Building2
} from "lucide-react";
import RecoveryJourneyTimeline from "@/components/home/RecoveryJourneyTimeline";
import TopFiveFocusWidget from "@/components/home/TopFiveFocusWidget";
import EarlyWarningBanner from "@/components/home/EarlyWarningBanner";
import CravingSupportWidget from "@/components/home/CravingSupportWidget";
import AftercarePlanBanner from "@/components/home/AftercarePlanBanner";
import AhHaWidget from "@/components/ahha/AhHaWidget";

const STAGES = [
  { name:"Ember",   minDays:0,  color:"#6B7A8D" },
  { name:"Spark",   minDays:7,  color:"#D4915A" },
  { name:"Flame",   minDays:14, color:"#C4A882" },
  { name:"Ascent",  minDays:30, color:"#2A9D8F" },
  { name:"Phoenix", minDays:90, color:"#7C5CBF" },
];
const getStage = (s) => [...STAGES].reverse().find(x => s >= x.minDays) || STAGES[0];

const TOOLS = [
  { icon:<CalendarCheck className="w-4 h-4"/>, label:"Check-In",   href:"DailyCheckIn" },
  { icon:<FileText       className="w-4 h-4"/>, label:"My Goals",   href:"GoalBoard" },
  { icon:<BookOpen       className="w-4 h-4"/>, label:"Resources",  href:"RecoveryHub" },
  { icon:<Users          className="w-4 h-4"/>, label:"Community",  href:"VoicesOfRecovery" },
  { icon:<Briefcase      className="w-4 h-4"/>, label:"Jobs",       href:"EmploymentOpportunities" },
  { icon:<HomeIcon       className="w-4 h-4"/>, label:"Housing",    href:"HousingAssistance" },
  { icon:<FileText       className="w-4 h-4"/>, label:"Journal",    href:"Journal" },
  { icon:<MessageCircle  className="w-4 h-4"/>, label:"Messages",   href:"ParticipantMessages" },
];

const TODAY_ITEMS = [
  { icon:<CalendarCheck className="w-4 h-4"/>, label:"Daily Check-In",        sub:"30 seconds",                href:"DailyCheckIn" },
  { icon:<Users          className="w-4 h-4"/>, label:"Log Meeting",          sub:"AA · NA · SMART",           href:"Meetings" },
  { icon:<BookOpen       className="w-4 h-4"/>, label:"Read Something",       sub:"Education builds resilience",href:"RecoveryHub" },
  { icon:<MessageSquare  className="w-4 h-4"/>, label:"Reach Out",            sub:"Sponsor or mentor",         href:"ParticipantMessages" },
  { icon:<Target         className="w-4 h-4"/>, label:"Review My Plan",       sub:"Goals & progress",          href:"ForwardPlan" },
];

const NEXT_STEPS = [
  { icon:<Building2  className="w-4 h-4"/>, label:"Find Housing Help",    href:"HousingAssistance" },
  { icon:<Briefcase  className="w-4 h-4"/>, label:"Job Resources",        href:"EmploymentOpportunities" },
  { icon:<Target     className="w-4 h-4"/>, label:"My Reentry Plan",      href:"ForwardPlan" },
  { icon:<Heart      className="w-4 h-4"/>, label:"Relapse Prevention",   href:"CravingControlCenter" },
  { icon:<MessageSquare className="w-4 h-4"/>, label:"Contact Support",   href:"ParticipantMessages" },
  { icon:<Users      className="w-4 h-4"/>, label:"Community",            href:"VoicesOfRecovery" },
];

export default function Home() {
  const navigate = useNavigate();

  const { data: user, isLoading: uL } = useQuery({ queryKey:["user"], queryFn:() => base44.auth.me() });
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
    <div style={{ background:"var(--bg)", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <Loader2 className="w-6 h-6 animate-spin" style={{ color:"var(--teal)" }} />
    </div>
  );

  const today        = new Date().toISOString().split("T")[0];
  const checked      = checkIns.some(c => c.check_in_date === today);
  const firstName    = user?.full_name?.split(" ")[0] || "there";
  const hour         = new Date().getHours();
  const greeting     = hour<12 ? "Morning" : hour<17 ? "Afternoon" : "Evening";

  const sevenAgo = new Date(); sevenAgo.setDate(sevenAgo.getDate()-7);
  const last7    = checkIns.filter(c => new Date(c.check_in_date) >= sevenAgo);

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

  const avgCraving   = last7.length ? last7.reduce((s,c)=>s+(c.craving_intensity??5),0)/last7.length : 5;
  const scoreCheckin = Math.min(last7.length/7,1)*25;
  const scoreMeeting = last7.length ? (last7.filter(c=>c.attended_meeting).length/last7.length)*25 : 0;
  const scoreSponsor = last7.length ? (last7.filter(c=>c.connected_with_sponsor).length/last7.length)*25 : 0;
  const scoreCraving = Math.max(0,(10-avgCraving)/10)*25;
  const hasData      = last7.length > 0;
  const stability    = hasData ? Math.round(scoreCheckin+scoreMeeting+scoreSponsor+scoreCraving) : null;
  const stabColor    = !hasData ? "var(--teal)" : stability>=75 ? "var(--green)" : stability>=50 ? "var(--amber)" : "var(--red)";
  const stabLabel    = !hasData ? "Start Tracking" : stability>=75 ? "Stable" : stability>=50 ? "At Risk" : "High Risk";
  const weeklyMeetings  = last7.filter(c => c.attended_meeting).length;
  const sponsorContacts = last7.filter(c => c.connected_with_sponsor).length;
  const spotlight = articles[0];

  return (
    <div style={{ background:"var(--bg)", minHeight:"100vh", paddingBottom:120 }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .fu { animation: fadeUp 0.5s cubic-bezier(.22,1,.36,1) both; }
        .lift { transition: transform .15s ease, opacity .15s ease; }
        .lift:active { transform: scale(.975); opacity:.85; }
      `}</style>

      <div style={{ maxWidth:480, margin:"0 auto" }}>

        {/* ── HERO ── */}
        <div style={{ padding:"64px 24px 32px", background:"var(--surface)", borderBottom:"1px solid var(--border)" }}>
          <div className="fu" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <span style={{ fontSize:16, fontWeight:800, color:"var(--sand)", letterSpacing:"-.02em" }}>Ah Ha</span>
              <span style={{ fontSize:11, color:"var(--text-dim)" }}>by Unbound</span>
            </div>
            <span style={{ fontSize:11, fontWeight:600, color:"var(--teal)", letterSpacing:".05em", textTransform:"uppercase" }}>{greeting}</span>
          </div>

          <h1 className="fu" style={{ fontSize:28, fontWeight:800, lineHeight:1.15, color:"var(--text)", marginBottom:8, animationDelay:".05s" }}>
            Good to see you,<br/><span style={{ color:"var(--sand)" }}>{firstName}.</span>
          </h1>

          <p className="fu" style={{ fontSize:14, color:"var(--text-muted)", lineHeight:1.7, marginBottom:24, animationDelay:".1s", maxWidth:320 }}>
            You showed up again. That's not small — that's everything.
          </p>

          <div className="fu" style={{ display:"flex", gap:10, animationDelay:".15s" }}>
            <Link to={createPageUrl("DailyCheckIn")} style={{ flex:1, textDecoration:"none" }}>
              <button className="lift btn-primary" style={{ width:"100%", padding:"13px 18px", fontSize:14 }}>
                {checked ? "Keep Going →" : "Check In Today →"}
              </button>
            </Link>
            <Link to={createPageUrl("RecoveryHub")} style={{ textDecoration:"none" }}>
              <button className="lift btn-ghost" style={{ padding:"13px 18px", fontSize:14 }}>Explore</button>
            </Link>
          </div>

          {/* Stage strip */}
          <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:20 }}>
            {STAGES.map((s,i) => (
              <div key={s.name} style={{
                height:3, flex: i===stageIdx ? 2 : 1, borderRadius:2,
                background: i<=stageIdx ? s.color : "var(--border)",
                transition:"flex .3s ease",
              }}/>
            ))}
            <span style={{ fontSize:10, color:"var(--text-dim)", marginLeft:6, whiteSpace:"nowrap" }}>
              {stage.name}
            </span>
          </div>
        </div>

        <div style={{ padding:"24px 16px" }}>

          {/* ── STREAK STATS ── */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:24 }}>
            {[
              { label:"Day Streak", value:streak, color:stage.color },
              { label:"This Week",  value:weeklyMeetings+" mtg", color:"var(--teal)" },
              { label:"Checked In", value:checked ? "Today ✓" : "Not yet", color:checked?"var(--green)":"var(--text-dim)" },
            ].map(s => (
              <div key={s.label} className="card" style={{ padding:"14px 12px" }}>
                <p style={{ fontSize:20, fontWeight:800, color:s.color, lineHeight:1, marginBottom:4 }}>{s.value}</p>
                <p style={{ fontSize:10, color:"var(--text-dim)", fontWeight:600, textTransform:"uppercase", letterSpacing:".06em" }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* ── EARLY WARNING ── */}
          {user && (
            <EarlyWarningBanner
              checkIns={checkIns}
              journalCount={0}
              communityPostCount={0}
              cravingPostCount={checkIns.filter(c=>(c.craving_intensity??0)>=7).length}
            />
          )}

          {/* ── AFTERCARE PLAN LINKS ── */}
          {user && (
            <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:24 }}>
              <Link to="/AftercarePlan" style={{ textDecoration:"none" }}>
                <div className="card lift" style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 16px" }}>
                  <span style={{ fontSize:18 }}>📋</span>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:14, fontWeight:700, color:"var(--text)", marginBottom:2 }}>My Aftercare Plan</p>
                    <p style={{ fontSize:12, color:"var(--text-muted)" }}>Milestones & treatment goals</p>
                  </div>
                  <ArrowRight style={{ color:"var(--text-dim)", width:14, height:14 }}/>
                </div>
              </Link>
              <Link to="/AftercarePlanBuilder" style={{ textDecoration:"none" }}>
                <div className="card lift" style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 16px", borderColor:"var(--teal-border)" }}>
                  <span style={{ fontSize:18 }}>🗺️</span>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:14, fontWeight:700, color:"var(--text)", marginBottom:2 }}>Aftercare Plan Builder</p>
                    <p style={{ fontSize:12, color:"var(--text-muted)" }}>Build a personalised roadmap with AI</p>
                  </div>
                  <ArrowRight style={{ color:"var(--teal)", width:14, height:14 }}/>
                </div>
              </Link>
            </div>
          )}

          {user && <AftercarePlanBanner user={user} />}
          {user && <TopFiveFocusWidget user={user} />}
          {user && <AhHaWidget user={user} />}
          <CravingSupportWidget />

          {/* ── WEEKLY SCORE ── */}
          <p className="section-label">This week</p>
          <div className="card" style={{ padding:"20px", marginBottom:24 }}>
            <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:14 }}>
              <div>
                <p style={{ fontSize:42, fontWeight:800, lineHeight:1, color:stabColor }}>
                  {stability ?? "—"}{stability!==null && <span style={{ fontSize:18, fontWeight:500, color:"var(--text-dim)" }}>%</span>}
                </p>
                <p style={{ fontSize:11, color:"var(--text-dim)", marginTop:4 }}>weekly recovery score</p>
              </div>
              <span className="pill" style={{
                background: stability>=75 ? "rgba(52,168,130,0.12)" : stability>=50 ? "rgba(212,145,90,0.12)" : "rgba(201,83,79,0.1)",
                color: stabColor,
                border: `1px solid ${stabColor}40`,
              }}>{stabLabel}</span>
            </div>

            <div style={{ background:"var(--surface)", borderRadius:4, height:4, overflow:"hidden", marginBottom:16 }}>
              <div style={{
                height:"100%", borderRadius:4, width:`${stability ?? 0}%`,
                background:stabColor, transition:"width 1s ease",
              }}/>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {[
                { label:"Check-ins",   done:last7.length>=4 },
                { label:"Meetings",    done:last7.some(c=>c.attended_meeting) },
                { label:"Sponsor",     done:last7.some(c=>c.connected_with_sponsor) },
                { label:"Low Craving", done:avgCraving<5 },
              ].map(ind => (
                <div key={ind.label} style={{
                  display:"flex", alignItems:"center", gap:8, padding:"10px 12px",
                  borderRadius:"var(--r-md)",
                  background: ind.done ? "rgba(52,168,130,0.07)" : "var(--surface)",
                  border:`1px solid ${ind.done ? "rgba(52,168,130,0.25)" : "var(--border)"}`,
                }}>
                  <CheckCircle2 style={{ color: ind.done ? "var(--green)" : "var(--text-dim)", width:13, height:13, flexShrink:0 }}/>
                  <p style={{ fontSize:12, fontWeight:600, color: ind.done ? "var(--text)" : "var(--text-muted)" }}>{ind.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── TODAY ── */}
          <p className="section-label">Start here today</p>
          <div style={{ display:"flex", flexDirection:"column", gap:1, borderRadius:"var(--r-xl)", overflow:"hidden", border:"1px solid var(--border)", marginBottom:24 }}>
            {TODAY_ITEMS.map((item, i) => {
              const done = item.href === "DailyCheckIn" && checked;
              return (
                <Link key={item.label} to={createPageUrl(item.href)} className="lift" style={{ textDecoration:"none" }}>
                  <div style={{
                    display:"flex", alignItems:"center", gap:14, padding:"14px 18px",
                    background: i%2===0 ? "var(--card)" : "var(--surface)",
                    borderBottom: i < TODAY_ITEMS.length-1 ? "1px solid var(--border-soft)" : "none",
                  }}>
                    <div style={{ color: done ? "var(--green)" : "var(--teal)", flexShrink:0 }}>{item.icon}</div>
                    <div style={{ flex:1 }}>
                      <p style={{ fontSize:14, fontWeight:600, color:"var(--text)", marginBottom:1 }}>{item.label}</p>
                      <p style={{ fontSize:11, color:"var(--text-dim)" }}>{done ? "Done ✓" : item.sub}</p>
                    </div>
                    <ArrowRight style={{ color:"var(--text-dim)", width:13, height:13 }}/>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* ── PROGRESS ── */}
          <p className="section-label">Progress</p>
          <RecoveryJourneyTimeline streak={streak} user={user} />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:24 }}>
            {[
              { label:"Day Streak",     value:streak,           unit:"days",     color:stage.color },
              { label:"Meetings",       value:weeklyMeetings,   unit:"this week", color:"var(--teal)" },
              { label:"Sponsor Calls",  value:sponsorContacts,  unit:"this week", color:"var(--indigo)" },
              { label:"Check-Ins",      value:last7.length,     unit:"/ 7 days",  color:"var(--teal)" },
            ].map(stat => (
              <div key={stat.label} className="card" style={{ padding:"16px 14px" }}>
                <p style={{ fontSize:32, fontWeight:800, lineHeight:1, color:stat.color }}>{stat.value}</p>
                <p style={{ fontSize:10, color:"var(--text-dim)", marginTop:3, textTransform:"uppercase", letterSpacing:".06em" }}>{stat.unit}</p>
                <p style={{ fontSize:12, fontWeight:600, color:"var(--text-muted)", marginTop:6 }}>{stat.label}</p>
              </div>
            ))}
          </div>

          {/* ── WHAT'S NEXT ── */}
          <p className="section-label">What could help most</p>
          <div style={{ display:"flex", flexDirection:"column", gap:1, borderRadius:"var(--r-xl)", overflow:"hidden", border:"1px solid var(--border)", marginBottom:24 }}>
            {NEXT_STEPS.map((item, i) => (
              <Link key={item.label} to={createPageUrl(item.href)} className="lift" style={{ textDecoration:"none" }}>
                <div style={{
                  display:"flex", alignItems:"center", gap:14, padding:"14px 18px",
                  background: i%2===0 ? "var(--card)" : "var(--surface)",
                  borderBottom: i < NEXT_STEPS.length-1 ? "1px solid var(--border-soft)" : "none",
                }}>
                  <div style={{ color:"var(--text-muted)", flexShrink:0 }}>{item.icon}</div>
                  <p style={{ fontSize:14, fontWeight:600, color:"var(--text)", flex:1 }}>{item.label}</p>
                  <ArrowRight style={{ color:"var(--text-dim)", width:13, height:13 }}/>
                </div>
              </Link>
            ))}
          </div>

          {/* ── SPOTLIGHT ARTICLE ── */}
          {spotlight && (
            <>
              <p className="section-label">Resource Spotlight</p>
              <Link to={createPageUrl("RecoveryHub")} className="lift" style={{ textDecoration:"none", display:"block", marginBottom:24 }}>
                <div className="card" style={{ overflow:"hidden" }}>
                  {spotlight.image_url && (
                    <div style={{ position:"relative", height:160, overflow:"hidden" }}>
                      <img src={spotlight.image_url} alt={spotlight.title} style={{ width:"100%", height:"100%", objectFit:"cover", filter:"brightness(0.7)" }}/>
                      <div style={{ position:"absolute", bottom:12, left:14 }}>
                        <span className="pill pill-teal">{spotlight.category}</span>
                      </div>
                    </div>
                  )}
                  <div style={{ padding:"16px 18px" }}>
                    <p style={{ fontSize:16, fontWeight:700, color:"var(--text)", lineHeight:1.35, marginBottom:6 }}>{spotlight.title}</p>
                    <p style={{ fontSize:13, color:"var(--text-muted)", lineHeight:1.6,
                      overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>
                      {spotlight.summary}
                    </p>
                    <p style={{ fontSize:12, color:"var(--teal)", fontWeight:700, marginTop:10 }}>Read →</p>
                  </div>
                </div>
              </Link>
            </>
          )}

          {/* ── COMMUNITY ── */}
          {posts.length > 0 && (
            <>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
                <p className="section-label" style={{ marginBottom:0 }}>From the community</p>
                <Link to={createPageUrl("VoicesOfRecovery")} style={{ fontSize:12, color:"var(--teal)", fontWeight:700, textDecoration:"none" }}>See all →</Link>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:24 }}>
                {posts.slice(0,2).map(post => {
                  const handle = post.is_anonymous ? "Anonymous" : (post.created_by?.split("@")[0] || "Member");
                  return (
                    <div key={post.id} className="card" style={{ padding:"16px 18px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                        <div style={{ width:28, height:28, borderRadius:"50%", flexShrink:0,
                          background:"var(--teal-dim)", display:"flex", alignItems:"center", justifyContent:"center",
                          fontSize:11, fontWeight:700, color:"var(--teal)" }}>
                          {handle[0]?.toUpperCase()}
                        </div>
                        <p style={{ fontSize:12, fontWeight:600, color:"var(--text-muted)" }}>{handle}</p>
                        {post.like_count > 0 && <span style={{ marginLeft:"auto", fontSize:11, color:"var(--text-dim)" }}>❤️ {post.like_count}</span>}
                      </div>
                      <p style={{ fontSize:14, color:"var(--text-muted)", lineHeight:1.65,
                        overflow:"hidden", display:"-webkit-box", WebkitLineClamp:3, WebkitBoxOrient:"vertical" }}>
                        {post.content}
                      </p>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* ── TOOLS GRID ── */}
          <p className="section-label">Tools</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:24 }}>
            {TOOLS.map(tool => (
              <Link key={tool.label} to={createPageUrl(tool.href)} className="lift" style={{ textDecoration:"none" }}>
                <div className="card" style={{ padding:"16px 14px", display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ color:"var(--teal)", flexShrink:0 }}>{tool.icon}</div>
                  <p style={{ fontSize:13, fontWeight:600, color:"var(--text)" }}>{tool.label}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* ── CRISIS ── */}
          <div style={{ display:"flex", gap:8, marginBottom:16 }}>
            {[
              { href:"tel:988",         label:"988 Crisis Line" },
              { href:"tel:18006624357", label:"SAMHSA Helpline" },
              { href:"sms:741741",      label:"Text HOME" },
            ].map(x => (
              <a key={x.href} href={x.href} style={{ flex:1, textDecoration:"none", padding:"11px 8px",
                borderRadius:"var(--r-md)", background:"rgba(201,83,79,0.08)",
                border:"1px solid rgba(201,83,79,0.18)", textAlign:"center" }}>
                <p style={{ fontWeight:700, color:"#E07070", fontSize:12 }}>{x.label}</p>
              </a>
            ))}
          </div>

          <p style={{ textAlign:"center", fontSize:11, color:"var(--text-dim)", lineHeight:1.7, paddingBottom:8 }}>
            Unbound is a support tool, not a medical provider.<br/>In an emergency, call 911 or 988.
          </p>

        </div>
      </div>
    </div>
  );
}