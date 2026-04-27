import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "./utils";
import { Loader2, Edit3, LogOut, MapPin, Target, Bookmark, Calendar, Heart, ArrowRight } from "lucide-react";
import ProfileEditSheet from "@/components/profile/ProfileEditSheet";

const C = {
  amber:    "#B8823A",
  green:    "#7A9E7E",
  indigo:   "#7B8FA8",
  red:      "#C9534F",
  muted:    "#9B8E83",
  text:     "#1C1410",
  textMuted:"#4A3F35",
  bg:       "#F7F3EE",
  surface:  "#FDFAF6",
  border:   "#E8E2D9",
};

const STAGE_LABELS = {
  using_currently:       "Still finding my way",
  trying_to_stop:        "Ready to make a change",
  detox_last_14_days:    "Just took the first step",
  early_recovery_15_90:  "Early in my recovery",
  recovery_3_12_months:  "Building real momentum",
  long_term_1_year_plus: "Living it every day",
  relapsed_recently:     "Getting back up — stronger",
};

const COMPLETION_FIELDS = ["bio","hometown","places_i_love","hobbies","core_memories","what_im_building","long_term_dream","motivation","grounding_things","personal_quote"];

function SLabel({ icon, children }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12, marginTop:4 }}>
      {icon && <span style={{ fontSize:14 }}>{icon}</span>}
      <p style={{ fontSize:10, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"0.1em" }}>{children}</p>
      <div style={{ flex:1, height:1, background:C.border }}/>
    </div>
  );
}

function InfoCard({ children, style={} }) {
  return (
    <div style={{ background:C.surface, border:`.5px solid ${C.border}`, borderRadius:14, padding:"16px 18px", marginBottom:14, ...style }}>
      {children}
    </div>
  );
}

function EmptyPrompt({ prompt, onEdit }) {
  return (
    <button onClick={onEdit} style={{ width:"100%", background:C.bg, border:`1.5px dashed rgba(184,130,58,.3)`,
      borderRadius:12, padding:"13px 16px", textAlign:"left", cursor:"pointer", marginBottom:14 }}>
      <p style={{ fontSize:13, color:C.muted, fontStyle:"italic" }}>{prompt}</p>
    </button>
  );
}

export default function Profile() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const [editing, setEditing] = useState(false);

  const { data: user, isLoading: uL } = useQuery({ queryKey:["me"], queryFn:() => base44.auth.me() });

  const { data: profiles, isLoading: pL } = useQuery({
    queryKey:["my-profile", user?.email],
    queryFn: () => base44.entities.MemberProfile.filter({ created_by: user.email }),
    enabled: !!user,
  });

  // Returning users (with completed onboarding) who land here from login → send to Home.
  // New users with incomplete profiles stay on Profile to finish setup.
  useEffect(() => {
    if (uL || pL) return;
    if (!user) return;
    const params = new URLSearchParams(location.search);
    if (params.get("from") !== "login") return;
    if (profiles?.[0]?.onboarding_complete) {
      navigate("/", { replace: true });
    }
  }, [uL, pL, user, profiles, location.search, navigate]);

  const { data: checkIns = [] } = useQuery({
    queryKey:["daily-checkins-profile", user?.email],
    queryFn: () => base44.entities.DailyCheckIn.filter({ participant_email: user.email }, "-check_in_date", 90),
    enabled: !!user?.email,
  });

  const saveMutation = useMutation({
    mutationFn: async (form) => {
      const p = profiles?.[0];
      if (p?.id) return base44.entities.MemberProfile.update(p.id, form);
    },
    onSuccess: () => queryClient.invalidateQueries(["my-profile"]),
  });

  if (uL || (!!user && pL)) return (
    <div style={{ background:C.bg, minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <Loader2 className="w-7 h-7 animate-spin" style={{ color:C.amber }}/>
    </div>
  );

  const profile = profiles?.[0] || {};
  const firstName = user?.full_name?.split(" ")[0] || "You";

  const streak = (() => {
    const sorted = [...checkIns].sort((a,b)=>new Date(b.check_in_date)-new Date(a.check_in_date));
    let n=0, cur=new Date(); cur.setHours(0,0,0,0);
    for (const c of sorted) {
      const d=new Date(c.check_in_date); d.setHours(0,0,0,0);
      if (Math.round((cur-d)/86400000)<=1){n++;cur=d;} else break;
    }
    return n;
  })();

  const filled = COMPLETION_FIELDS.filter(f => {
    const v = profile[f];
    return Array.isArray(v) ? v.length>0 : !!v;
  }).length;
  const completion = Math.round((filled / COMPLETION_FIELDS.length) * 100);

  const initials = user?.full_name?.split(" ").map(w=>w[0]).slice(0,2).join("") || "U";

  return (
    <div style={{ background:C.bg, minHeight:"100vh", paddingBottom:120 }}>
      {editing && (
        <ProfileEditSheet profile={profile} onSave={saveMutation.mutateAsync} onClose={() => setEditing(false)} />
      )}

      <div style={{ maxWidth:480, margin:"0 auto" }}>

        {/* ── Header ── */}
        <div style={{ background:C.surface, borderBottom:`1px solid ${C.border}`, padding:"56px 24px 28px" }}>
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:16 }}>
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ width:64, height:64, borderRadius:"50%", flexShrink:0,
                background:`linear-gradient(135deg,${C.amber},#C9A96E)`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:22, fontWeight:700, color:"#fff",
                boxShadow:`0 0 0 3px rgba(184,130,58,0.2)` }}>
                {initials}
              </div>
              <div>
                <h1 style={{ fontFamily:"'Lora', serif", fontSize:22, fontWeight:600, color:C.text, lineHeight:1.2 }}>
                  {user?.full_name || firstName}
                </h1>
                {(profile.location_city || profile.hometown) && (
                  <p style={{ fontSize:12, color:C.muted, marginTop:3, display:"flex", alignItems:"center", gap:4 }}>
                    <MapPin style={{ width:11, height:11 }}/>
                    {profile.location_city || profile.hometown}{profile.location_state ? `, ${profile.location_state}` : ""}
                  </p>
                )}
              </div>
            </div>
            <button onClick={() => setEditing(true)} style={{
              background:C.bg, border:`1px solid ${C.border}`,
              borderRadius:10, padding:"8px 14px", color:C.textMuted,
              fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6,
            }}>
              <Edit3 style={{ width:13, height:13 }}/> Edit
            </button>
          </div>

          {profile.personal_quote ? (
            <p style={{ fontSize:14, color:C.amber, fontStyle:"italic", fontWeight:600, lineHeight:1.5,
              borderLeft:`3px solid rgba(184,130,58,0.4)`, paddingLeft:12 }}>
              "{profile.personal_quote}"
            </p>
          ) : (
            <button onClick={() => setEditing(true)} style={{ background:"none", border:"none", padding:0, cursor:"pointer" }}>
              <p style={{ fontSize:13, color:C.muted, fontStyle:"italic" }}>+ Add your personal quote…</p>
            </button>
          )}
        </div>

        <div style={{ padding:"20px 16px" }}>

          {/* ── Profile Completion ── */}
          <InfoCard>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
              <p style={{ fontSize:13, fontWeight:700, color:C.text }}>Profile Completion</p>
              <p style={{ fontSize:22, fontWeight:700, color:C.amber }}>{completion}%</p>
            </div>
            <div style={{ background:C.border, borderRadius:6, height:7, overflow:"hidden", marginBottom:10 }}>
              <div style={{ height:"100%", borderRadius:6, width:`${completion}%`,
                background:C.amber, transition:"width 1s ease" }}/>
            </div>
            <p style={{ fontSize:12, color:C.muted, lineHeight:1.5 }}>
              {completion < 50 ? "Add more about what you love, where you're from, and what you're building." :
               completion < 80 ? "Your story is taking shape. Keep adding the details that make you, you." :
               "Your profile reflects who you really are. That matters."}
            </p>
            {completion < 100 && (
              <button onClick={()=>setEditing(true)} style={{
                marginTop:10, padding:"9px 18px", borderRadius:50,
                background:"rgba(184,130,58,.10)", border:"1px solid rgba(184,130,58,.25)",
                color:C.amber, fontWeight:700, fontSize:13, cursor:"pointer" }}>
                Complete My Profile →
              </button>
            )}
          </InfoCard>

          {/* ── About Me ── */}
          <SLabel icon="✍️">About Me</SLabel>
          {profile.bio ? (
            <InfoCard><p style={{ fontSize:14, color:C.textMuted, lineHeight:1.7 }}>{profile.bio}</p></InfoCard>
          ) : (
            <EmptyPrompt prompt="What makes you, you? What do you want people to know about you beyond your struggles…" onEdit={() => setEditing(true)}/>
          )}

          {/* ── My Roots ── */}
          <SLabel icon="🌳">My Roots</SLabel>
          {(profile.hometown || profile.roots_story) ? (
            <InfoCard>
              {profile.hometown && (
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:profile.roots_story?10:0 }}>
                  <span style={{ fontSize:16 }}>📍</span>
                  <p style={{ fontSize:15, fontWeight:700, color:C.text }}>{profile.hometown}</p>
                </div>
              )}
              {profile.roots_story && <p style={{ fontSize:14, color:C.textMuted, lineHeight:1.68 }}>{profile.roots_story}</p>}
            </InfoCard>
          ) : (
            <EmptyPrompt prompt="Where did you grow up? What neighborhoods or cities shaped you?" onEdit={() => setEditing(true)}/>
          )}

          {/* ── Places I Love ── */}
          {profile.places_i_love?.length > 0 && (
            <>
              <SLabel icon="🗺️">Places I Love</SLabel>
              <InfoCard>
                <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                  {profile.places_i_love.map((p,i) => (
                    <span key={i} style={{ background:"rgba(184,130,58,.10)", border:"1px solid rgba(184,130,58,.25)",
                      borderRadius:20, padding:"6px 14px", fontSize:12, fontWeight:600, color:C.amber }}>
                      📍 {p}
                    </span>
                  ))}
                </div>
              </InfoCard>
            </>
          )}

          {/* ── Grounded ── */}
          <SLabel icon="⚓">What Keeps Me Grounded</SLabel>
          {profile.grounding_things ? (
            <InfoCard><p style={{ fontSize:14, color:C.textMuted, lineHeight:1.7 }}>{profile.grounding_things}</p></InfoCard>
          ) : (
            <EmptyPrompt prompt="The people, places & things that bring you back to yourself…" onEdit={() => setEditing(true)}/>
          )}

          {/* ── Hobbies ── */}
          <SLabel icon="🎯">Hobbies & Interests</SLabel>
          {(profile.hobbies?.length > 0 || profile.music_i_love || profile.food_i_love) ? (
            <InfoCard>
              {profile.hobbies?.length > 0 && (
                <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:(profile.music_i_love||profile.food_i_love)?12:0 }}>
                  {profile.hobbies.map(h => (
                    <span key={h} style={{ background:"rgba(122,158,126,.12)", border:"1px solid rgba(122,158,126,.3)",
                      borderRadius:20, padding:"6px 14px", fontSize:12, fontWeight:600, color:C.green }}>
                      {h}
                    </span>
                  ))}
                </div>
              )}
              {profile.music_i_love && <p style={{ fontSize:13, color:C.textMuted, marginBottom:6 }}>🎵 <strong>Music:</strong> {profile.music_i_love}</p>}
              {profile.food_i_love  && <p style={{ fontSize:13, color:C.textMuted }}>🍽️ <strong>Food:</strong> {profile.food_i_love}</p>}
            </InfoCard>
          ) : (
            <EmptyPrompt prompt="What do you love? Sports, music, cooking, art, faith, fitness…" onEdit={() => setEditing(true)}/>
          )}

          {/* ── Core Memories ── */}
          <SLabel icon="💛">Good Energy</SLabel>
          {profile.core_memories ? (
            <InfoCard style={{ background:"rgba(184,130,58,.05)", border:"1px solid rgba(184,130,58,.2)" }}>
              <p style={{ fontSize:14, color:C.textMuted, lineHeight:1.72, fontStyle:"italic" }}>"{profile.core_memories}"</p>
            </InfoCard>
          ) : (
            <EmptyPrompt prompt="Memories, moments, and things that feel like home… what still makes you smile?" onEdit={() => setEditing(true)}/>
          )}

          {/* ── Journey Stats ── */}
          <SLabel icon="🌱">My Journey</SLabel>
          <InfoCard>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:profile.recovery_stage_label?12:0 }}>
              <div style={{ background:C.bg, borderRadius:12, padding:"14px" }}>
                <p style={{ fontSize:28, fontWeight:700, color:C.amber, lineHeight:1 }}>{streak}</p>
                <p style={{ fontSize:11, color:C.muted, marginTop:4 }}>Day Streak</p>
              </div>
              <div style={{ background:C.bg, borderRadius:12, padding:"14px" }}>
                <p style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:4, lineHeight:1.3 }}>
                  {STAGE_LABELS[profile.stage] || "On my journey"}
                </p>
                {profile.sobriety_date && (
                  <p style={{ fontSize:11, color:C.muted }}>Since {new Date(profile.sobriety_date).toLocaleDateString("en-US",{month:"short",year:"numeric"})}</p>
                )}
              </div>
            </div>
            {profile.recovery_stage_label && (
              <p style={{ fontSize:13, color:C.textMuted, lineHeight:1.65, fontStyle:"italic" }}>"{profile.recovery_stage_label}"</p>
            )}
          </InfoCard>

          {/* ── Goals ── */}
          <SLabel icon="🚀">What I'm Building</SLabel>
          {(profile.what_im_building || profile.long_term_dream || profile.motivation) ? (
            <InfoCard>
              {profile.what_im_building && (
                <div style={{ marginBottom:12 }}>
                  <p style={{ fontSize:10, fontWeight:700, color:C.amber, textTransform:"uppercase", letterSpacing:".08em", marginBottom:5 }}>Right Now</p>
                  <p style={{ fontSize:14, color:C.textMuted, lineHeight:1.65 }}>{profile.what_im_building}</p>
                </div>
              )}
              {profile.long_term_dream && (
                <div style={{ marginBottom:12 }}>
                  <p style={{ fontSize:10, fontWeight:700, color:C.green, textTransform:"uppercase", letterSpacing:".08em", marginBottom:5 }}>My Dream</p>
                  <p style={{ fontSize:14, color:C.textMuted, lineHeight:1.65 }}>{profile.long_term_dream}</p>
                </div>
              )}
              {profile.motivation && (
                <div>
                  <p style={{ fontSize:10, fontWeight:700, color:C.indigo, textTransform:"uppercase", letterSpacing:".08em", marginBottom:5 }}>What Keeps Me Going</p>
                  <p style={{ fontSize:14, color:C.textMuted, lineHeight:1.65 }}>{profile.motivation}</p>
                </div>
              )}
            </InfoCard>
          ) : (
            <EmptyPrompt prompt="What are you building toward? Who or what inspires you to keep going?" onEdit={() => setEditing(true)}/>
          )}

          {/* ── Guided Setup ── */}
          <div style={{ background:"rgba(184,130,58,.07)", border:"1px solid rgba(184,130,58,.25)",
            borderRadius:16, padding:"20px", marginBottom:18 }}>
            <p style={{ fontSize:11, fontWeight:700, color:C.amber, textTransform:"uppercase", letterSpacing:".08em", marginBottom:8 }}>Guided Experience</p>
            <p style={{ fontFamily:"'Lora', serif", fontSize:16, fontWeight:600, color:C.text, marginBottom:6 }}>Complete Your Profile Step by Step</p>
            <p style={{ fontSize:13, color:C.textMuted, lineHeight:1.6, marginBottom:14 }}>
              A reflective, guided experience. Take it at your own pace — your progress saves automatically.
            </p>
            <Link to={createPageUrl("GuidedProfileSetup")} style={{ textDecoration:"none" }}>
              <button style={{ padding:"12px 20px", borderRadius:50, background:C.amber,
                border:"none", color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer" }}>
                Start Guided Setup →
              </button>
            </Link>
          </div>

          {/* ── Counselor guide ── */}
          <Link to={createPageUrl("CounselorGuide")} style={{ textDecoration:"none", display:"block", marginBottom:18 }}>
            <div style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 16px", borderRadius:14,
              background:C.surface, border:`.5px solid ${C.border}` }}>
              <span style={{ fontSize:20, flexShrink:0 }}>👨‍🏫</span>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:14, fontWeight:700, color:C.text }}>Counselor Teaching Guide</p>
                <p style={{ fontSize:11, color:C.muted }}>For facilities & counselors — lessons, prompts & discharge checklist</p>
              </div>
              <ArrowRight style={{ width:14, height:14, color:C.muted }}/>
            </div>
          </Link>

          {/* ── Quick links ── */}
          <SLabel icon="🔗">Quick Access</SLabel>
          <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:24 }}>
            {[
              { icon:<Bookmark style={{width:16,height:16}}/>, label:"Saved Resources",    href:"SavedResources",      color:C.amber   },
              { icon:<Calendar style={{width:16,height:16}}/>, label:"Daily Check-In",     href:"DailyCheckIn",        color:C.green   },
              { icon:<Target   style={{width:16,height:16}}/>, label:"My Forward Plan",    href:"ForwardPlan",         color:C.amber   },
              { icon:<Heart    style={{width:16,height:16}}/>, label:"Find Help Near Me",  href:"FindHelpNow",         color:C.red     },
              { icon:<ArrowRight style={{width:16,height:16}}/>, label:"Notification Settings", href:"NotificationSettings", color:C.amber   },
              { icon:<ArrowRight style={{width:16,height:16}}/>, label:"Privacy Settings", href:"PrivacySettings",     color:C.indigo  },
              { icon:<ArrowRight style={{width:16,height:16}}/>, label:"My Dashboard",     href:"ParticipantDashboard",color:C.indigo  },
            ].map(item => (
              <Link key={item.label} to={createPageUrl(item.href)} style={{ textDecoration:"none" }}>
                <div style={{ display:"flex", alignItems:"center", gap:12, padding:"13px 16px", borderRadius:12,
                  background:C.surface, border:`.5px solid ${C.border}` }}>
                  <div style={{ color:item.color, width:32, height:32, borderRadius:8, flexShrink:0,
                    background:`${item.color}12`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    {item.icon}
                  </div>
                  <p style={{ flex:1, fontSize:14, fontWeight:600, color:C.text }}>{item.label}</p>
                  <ArrowRight style={{ width:14, height:14, color:C.muted }}/>
                </div>
              </Link>
            ))}
          </div>

          {/* ── Sign out ── */}
          {user ? (
            <button onClick={() => base44.auth.logout()} style={{
              width:"100%", padding:"14px", borderRadius:50,
              background:"rgba(201,83,79,.07)", border:"1px solid rgba(201,83,79,.2)",
              color:C.red, fontWeight:700, fontSize:15, cursor:"pointer",
              display:"flex", alignItems:"center", justifyContent:"center", gap:8,
            }}>
              <LogOut style={{ width:15, height:15 }}/> Sign Out
            </button>
          ) : (
            <button onClick={() => base44.auth.redirectToLogin()} style={{
              width:"100%", padding:"14px", borderRadius:50,
              background:C.amber, border:"none", color:"#fff", fontWeight:700, fontSize:15, cursor:"pointer",
            }}>
              Sign In to Save Your Progress
            </button>
          )}

        </div>
      </div>
    </div>
  );
}