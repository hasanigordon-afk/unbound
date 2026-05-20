import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "./utils";
import { Loader2, Edit3, LogOut, MapPin, Target, Bookmark, Calendar, Heart, ArrowRight, LayoutDashboard } from "lucide-react";
import ProfileEditSheet from "@/components/profile/ProfileEditSheet";
import ProfileDailySections from "@/components/profile/ProfileDailySections";

const C = {
  amber:    "#F0B753",
  green:    "#34D399",
  indigo:   "#5B8DEF",
  red:      "#F87171",
  muted:    "var(--text-muted)",
  text:     "var(--text)",
  textMuted:"var(--text-muted)",
  bg:       "var(--surface)",
  surface:  "var(--card)",
  border:   "var(--border)",
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
    <button onClick={onEdit} style={{ width:"100%", background:C.bg, border:`1.5px dashed rgba(46,125,122,.3)`,
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
    <div style={{ background:"transparent", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
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
    <div style={{ background:"transparent", minHeight:"100vh", color:"var(--text)" }}>
      {editing && (
        <ProfileEditSheet profile={profile} onSave={saveMutation.mutateAsync} onClose={() => setEditing(false)} />
      )}
      <ProfileDailySections
        user={user}
        profile={profile}
        firstName={firstName}
        initials={initials}
        completion={completion}
        streak={streak}
        onEdit={() => setEditing(true)}
      />
    </div>
  );
}