import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { Loader2, Edit3, LogOut, MapPin, Target, Bookmark, Calendar, Heart, ArrowRight } from "lucide-react";
import ProfileEditSheet from "@/components/profile/ProfileEditSheet";

// ── Design tokens (shared with Home) ───────────────────────────
const C = {
  teal:    "#3ECFBF",
  gold:    "#C9A96E",
  navy:    "#0B1220",
  emerald: "#10B981",
  indigo:  "#5B6EF5",
  slate:   "rgba(255,255,255,0.55)",
  muted:   "rgba(255,255,255,0.28)",
  glass:   { background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.09)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)" },
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

function rgb(hex) {
  const r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
}

function SLabel({ icon, children }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
      {icon && <span style={{ fontSize:15 }}>{icon}</span>}
      <p style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"1px" }}>{children}</p>
      <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.05)" }}/>
    </div>
  );
}

function Card({ children, style={} }) {
  return (
    <div style={{ ...C.glass, borderRadius:20, padding:"20px 18px", marginBottom:16, ...style }}>
      {children}
    </div>
  );
}

function EmptyPrompt({ prompt, onEdit }) {
  return (
    <button onClick={onEdit} style={{ width:"100%", background:"rgba(255,255,255,0.03)", border:"1.5px dashed rgba(255,255,255,0.12)",
      borderRadius:14, padding:"14px 18px", textAlign:"left", cursor:"pointer" }}>
      <p style={{ fontSize:13, color:"rgba(255,255,255,0.25)", fontStyle:"italic" }}>{prompt}</p>
    </button>
  );
}

// Completion fields to track
const COMPLETION_FIELDS = ["bio","hometown","places_i_love","hobbies","core_memories","what_im_building","long_term_dream","motivation","grounding_things","personal_quote"];

export default function Profile() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);

  const { data: user, isLoading: uL } = useQuery({ queryKey:["me"], queryFn:() => base44.auth.me() });

  const { data: profiles, isLoading: pL } = useQuery({
    queryKey:["my-profile", user?.email],
    queryFn: () => base44.entities.MemberProfile.filter({ created_by: user.email }),
    enabled: !!user,
  });

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
    <div style={{ background:C.navy, minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <Loader2 className="w-7 h-7 animate-spin" style={{ color:C.teal }}/>
    </div>
  );

  const profile = profiles?.[0] || {};
  const firstName = user?.full_name?.split(" ")[0] || "You";

  // Streak
  const streak = (() => {
    const sorted = [...checkIns].sort((a,b)=>new Date(b.check_in_date)-new Date(a.check_in_date));
    let n=0, cur=new Date(); cur.setHours(0,0,0,0);
    for (const c of sorted) {
      const d=new Date(c.check_in_date); d.setHours(0,0,0,0);
      if (Math.round((cur-d)/86400000)<=1){n++;cur=d;} else break;
    }
    return n;
  })();

  // Completion
  const filled = COMPLETION_FIELDS.filter(f => {
    const v = profile[f];
    return Array.isArray(v) ? v.length>0 : !!v;
  }).length;
  const completion = Math.round((filled / COMPLETION_FIELDS.length) * 100);

  const initials = user?.full_name?.split(" ").map(w=>w[0]).slice(0,2).join("") || "U";

  return (
    <div style={{ background:`linear-gradient(170deg,#070D1C 0%,#0B1424 55%,#080E1C 100%)`, minHeight:"100vh", paddingBottom:120 }}>
      {editing && (
        <ProfileEditSheet
          profile={profile}
          onSave={saveMutation.mutateAsync}
          onClose={() => setEditing(false)}
        />
      )}

      <div style={{ maxWidth:480, margin:"0 auto", padding:"0 16px" }}>

        {/* ── §1 PROFILE HEADER ─────────────────────────────── */}
        <div style={{ position:"relative", overflow:"hidden", borderRadius:"0 0 28px 28px", marginBottom:20,
          background:"linear-gradient(155deg,#0E1D3A 0%,#081426 100%)",
          padding:"64px 24px 32px", margin:"0 -16px 20px" }}>
          {/* BG orbs */}
          <div style={{ position:"absolute", top:-60, right:-60, width:280, height:280, borderRadius:"50%",
            background:"radial-gradient(circle,rgba(62,207,191,0.1) 0%,transparent 70%)", pointerEvents:"none" }}/>
          <div style={{ position:"absolute", bottom:-40, left:-40, width:220, height:200, borderRadius:"50%",
            background:"radial-gradient(circle,rgba(201,169,110,0.07) 0%,transparent 70%)", pointerEvents:"none" }}/>
          <div style={{ position:"relative", zIndex:1 }}>
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:16 }}>
              <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                {/* Avatar */}
                <div style={{ width:72, height:72, borderRadius:"50%", flexShrink:0,
                  background:`linear-gradient(135deg,${C.teal},#2CB8AE)`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:26, fontWeight:900, color:"#fff",
                  boxShadow:`0 0 0 3px rgba(62,207,191,0.2)` }}>
                  {initials}
                </div>
                <div>
                  <p style={{ fontSize:22, fontWeight:900, color:"#fff", lineHeight:1.2 }}>{user?.full_name || firstName}</p>
                  {(profile.location_city || profile.hometown) && (
                    <p style={{ fontSize:13, color:C.muted, marginTop:3, display:"flex", alignItems:"center", gap:4 }}>
                      <MapPin style={{ width:12, height:12 }}/>
                      {profile.location_city || profile.hometown}{profile.location_state ? `, ${profile.location_state}` : ""}
                    </p>
                  )}
                </div>
              </div>
              <button onClick={() => setEditing(true)} style={{
                background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.15)",
                borderRadius:12, padding:"8px 14px", color:"rgba(255,255,255,0.7)",
                fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6,
              }}>
                <Edit3 style={{ width:14, height:14 }}/> Edit
              </button>
            </div>

            {profile.personal_quote ? (
              <p style={{ fontSize:14, color:C.teal, fontStyle:"italic", fontWeight:600, lineHeight:1.5 }}>
                "{profile.personal_quote}"
              </p>
            ) : (
              <button onClick={() => setEditing(true)} style={{ background:"none", border:"none", padding:0, cursor:"pointer" }}>
                <p style={{ fontSize:13, color:"rgba(255,255,255,0.25)", fontStyle:"italic" }}>
                  + Add your personal quote or status line…
                </p>
              </button>
            )}
          </div>
        </div>

        {/* ── Profile Completion Bar ─────────────────────────── */}
        <Card style={{ marginBottom:16 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
            <p style={{ fontSize:14, fontWeight:700, color:"#fff" }}>Profile Completion</p>
            <p style={{ fontSize:22, fontWeight:900, color:C.teal }}>{completion}%</p>
          </div>
          <div style={{ background:"rgba(255,255,255,0.07)", borderRadius:6, height:7, overflow:"hidden", marginBottom:10 }}>
            <div style={{ height:"100%", borderRadius:6, width:`${completion}%`,
              background:`linear-gradient(90deg,${C.teal},#2CB8AE)`,
              boxShadow:`0 0 10px rgba(62,207,191,0.4)`, transition:"width 1s ease" }}/>
          </div>
          <p style={{ fontSize:12, color:C.muted, lineHeight:1.5 }}>
            {completion < 50 ? "Add more about what you love, where you're from, and what you're building." :
             completion < 80 ? "Your story is taking shape. Keep adding the details that make you, you." :
             "Your profile reflects who you really are. That matters."}
          </p>
          {completion < 100 && (
            <button onClick={()=>setEditing(true)} style={{
              marginTop:10, padding:"9px 18px", borderRadius:12,
              background:"rgba(62,207,191,0.1)", border:"1px solid rgba(62,207,191,0.25)",
              color:C.teal, fontWeight:700, fontSize:13, cursor:"pointer" }}>
              Complete My Profile →
            </button>
          )}
        </Card>

        {/* ── §2 ABOUT ME ────────────────────────────────────── */}
        <SLabel icon="✍️">About Me</SLabel>
        {profile.bio ? (
          <Card>
            <p style={{ fontSize:15, color:C.slate, lineHeight:1.7 }}>{profile.bio}</p>
          </Card>
        ) : (
          <div style={{ marginBottom:16 }}>
            <EmptyPrompt prompt="What makes you, you? What do you want people to know about you beyond your struggles…" onEdit={() => setEditing(true)}/>
          </div>
        )}

        {/* ── §3 WHERE I'M FROM ──────────────────────────────── */}
        <SLabel icon="🌳">My Roots</SLabel>
        {(profile.hometown || profile.roots_story) ? (
          <Card>
            {profile.hometown && (
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:profile.roots_story?10:0 }}>
                <span style={{ fontSize:18 }}>📍</span>
                <p style={{ fontSize:16, fontWeight:800, color:"#fff" }}>{profile.hometown}</p>
              </div>
            )}
            {profile.roots_story && (
              <p style={{ fontSize:14, color:C.slate, lineHeight:1.68 }}>{profile.roots_story}</p>
            )}
          </Card>
        ) : (
          <div style={{ marginBottom:16 }}>
            <EmptyPrompt prompt="Where did you grow up? What neighborhoods or cities shaped you?" onEdit={() => setEditing(true)}/>
          </div>
        )}

        {/* ── §4 PLACES I LOVE ───────────────────────────────── */}
        {(profile.places_i_love?.length > 0) && (
          <>
            <SLabel icon="🗺️">Places I Love</SLabel>
            <Card>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {profile.places_i_love.map((p,i) => (
                  <span key={i} style={{ background:"rgba(62,207,191,0.08)", border:"1px solid rgba(62,207,191,0.2)",
                    borderRadius:20, padding:"7px 14px", fontSize:13, fontWeight:600, color:C.teal }}>
                    📍 {p}
                  </span>
                ))}
              </div>
            </Card>
          </>
        )}

        {/* ── §5 WHAT KEEPS ME GROUNDED ──────────────────────── */}
        <SLabel icon="⚓">What Keeps Me Grounded</SLabel>
        {profile.grounding_things ? (
          <Card>
            <p style={{ fontSize:14, color:C.slate, lineHeight:1.7 }}>{profile.grounding_things}</p>
          </Card>
        ) : (
          <div style={{ marginBottom:16 }}>
            <EmptyPrompt prompt="The people, places & things that bring you back to yourself…" onEdit={() => setEditing(true)}/>
          </div>
        )}

        {/* ── §6 HOBBIES & INTERESTS ─────────────────────────── */}
        <SLabel icon="🎯">Hobbies & Interests</SLabel>
        {(profile.hobbies?.length > 0 || profile.music_i_love || profile.food_i_love) ? (
          <Card>
            {profile.hobbies?.length > 0 && (
              <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom: (profile.music_i_love||profile.food_i_love)?14:0 }}>
                {profile.hobbies.map(h => (
                  <span key={h} style={{ background:"rgba(201,169,110,0.1)", border:"1px solid rgba(201,169,110,0.25)",
                    borderRadius:20, padding:"6px 14px", fontSize:13, fontWeight:600, color:C.gold }}>
                    {h}
                  </span>
                ))}
              </div>
            )}
            {profile.music_i_love && (
              <p style={{ fontSize:14, color:C.slate, marginBottom:8 }}>🎵 <strong style={{ color:"#fff" }}>Music:</strong> {profile.music_i_love}</p>
            )}
            {profile.food_i_love && (
              <p style={{ fontSize:14, color:C.slate }}>🍽️ <strong style={{ color:"#fff" }}>Food:</strong> {profile.food_i_love}</p>
            )}
          </Card>
        ) : (
          <div style={{ marginBottom:16 }}>
            <EmptyPrompt prompt="What do you love? Sports, music, cooking, art, faith, fitness…" onEdit={() => setEditing(true)}/>
          </div>
        )}

        {/* ── §7 CORE MEMORIES / GOOD ENERGY ────────────────── */}
        <SLabel icon="💛">Good Energy</SLabel>
        {profile.core_memories ? (
          <Card style={{ background:"rgba(201,169,110,0.06)", borderColor:"rgba(201,169,110,0.2)" }}>
            <p style={{ fontSize:14, color:C.slate, lineHeight:1.72, fontStyle:"italic" }}>
              "{profile.core_memories}"
            </p>
          </Card>
        ) : (
          <div style={{ marginBottom:16 }}>
            <EmptyPrompt prompt="Memories, moments, and things that feel like home… what still makes you smile?" onEdit={() => setEditing(true)}/>
          </div>
        )}

        {/* ── §8 RECOVERY / JOURNEY ──────────────────────────── */}
        <SLabel icon="🌱">My Journey</SLabel>
        <Card>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom: profile.recovery_stage_label ? 14 : 0 }}>
            <div style={{ background:"rgba(255,255,255,0.04)", borderRadius:14, padding:"14px 14px" }}>
              <p style={{ fontSize:28, fontWeight:900, color:C.teal, lineHeight:1 }}>{streak}</p>
              <p style={{ fontSize:11, color:C.muted, marginTop:4 }}>Day Streak</p>
            </div>
            <div style={{ background:"rgba(255,255,255,0.04)", borderRadius:14, padding:"14px 14px" }}>
              <p style={{ fontSize:13, fontWeight:700, color:"#fff", marginBottom:4 }}>
                {STAGE_LABELS[profile.stage] || "On my journey"}
              </p>
              {profile.sobriety_date && (
                <p style={{ fontSize:11, color:C.muted }}>Since {new Date(profile.sobriety_date).toLocaleDateString("en-US",{month:"short",year:"numeric"})}</p>
              )}
            </div>
          </div>
          {profile.recovery_stage_label && (
            <p style={{ fontSize:14, color:C.slate, lineHeight:1.65, fontStyle:"italic" }}>
              "{profile.recovery_stage_label}"
            </p>
          )}
        </Card>

        {/* ── §9 GOALS & MOTIVATION ──────────────────────────── */}
        <SLabel icon="🚀">What I'm Building</SLabel>
        {(profile.what_im_building || profile.long_term_dream || profile.motivation) ? (
          <Card>
            {profile.what_im_building && (
              <div style={{ marginBottom:14 }}>
                <p style={{ fontSize:11, fontWeight:700, color:C.teal, textTransform:"uppercase", letterSpacing:".08em", marginBottom:6 }}>Right Now</p>
                <p style={{ fontSize:14, color:C.slate, lineHeight:1.65 }}>{profile.what_im_building}</p>
              </div>
            )}
            {profile.long_term_dream && (
              <div style={{ marginBottom:14 }}>
                <p style={{ fontSize:11, fontWeight:700, color:C.gold, textTransform:"uppercase", letterSpacing:".08em", marginBottom:6 }}>My Dream</p>
                <p style={{ fontSize:14, color:C.slate, lineHeight:1.65 }}>{profile.long_term_dream}</p>
              </div>
            )}
            {profile.motivation && (
              <div>
                <p style={{ fontSize:11, fontWeight:700, color:"rgba(167,139,250,0.8)", textTransform:"uppercase", letterSpacing:".08em", marginBottom:6 }}>What Keeps Me Going</p>
                <p style={{ fontSize:14, color:C.slate, lineHeight:1.65 }}>{profile.motivation}</p>
              </div>
            )}
          </Card>
        ) : (
          <div style={{ marginBottom:16 }}>
            <EmptyPrompt prompt="What are you building toward? Who or what inspires you to keep going?" onEdit={() => setEditing(true)}/>
          </div>
        )}

        {/* ── Quick links ─────────────────────────────────────── */}
        <SLabel icon="🔗">Quick Access</SLabel>
        <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:24 }}>
          {[
            { icon:<Bookmark style={{width:18,height:18}}/>, label:"Saved Resources",  href:"SavedResources", color:C.teal    },
            { icon:<Calendar style={{width:18,height:18}}/>, label:"Daily Check-In",   href:"DailyCheckIn",   color:C.emerald },
            { icon:<Target   style={{width:18,height:18}}/>, label:"My Forward Plan",  href:"ForwardPlan",    color:C.gold    },
            { icon:<Heart    style={{width:18,height:18}}/>, label:"Find Help Near Me",href:"FindHelpNow",    color:"#F472B6" },
          ].map(item => (
            <Link key={item.label} to={createPageUrl(item.href)} style={{ textDecoration:"none" }}>
              <div style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 18px", borderRadius:16,
                background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ color:item.color }}>{item.icon}</div>
                <p style={{ flex:1, fontSize:15, fontWeight:700, color:"#fff" }}>{item.label}</p>
                <ArrowRight style={{ width:16, height:16, color:C.muted }}/>
              </div>
            </Link>
          ))}
        </div>

        {/* ── Sign out ────────────────────────────────────────── */}
        {user ? (
          <button onClick={() => base44.auth.logout()} style={{
            width:"100%", padding:"14px", borderRadius:14,
            background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)",
            color:"#F87171", fontWeight:700, fontSize:15, cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center", gap:8,
          }}>
            <LogOut style={{ width:16, height:16 }}/> Sign Out
          </button>
        ) : (
          <button onClick={() => base44.auth.redirectToLogin()} style={{
            width:"100%", padding:"14px", borderRadius:14,
            background:`linear-gradient(135deg,${C.teal},#2CB8AE)`,
            border:"none", color:"#fff", fontWeight:800, fontSize:15, cursor:"pointer",
          }}>
            Sign In to Save Your Progress
          </button>
        )}

      </div>
    </div>
  );
}