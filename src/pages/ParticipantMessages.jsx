import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import CounselorMessages from "../components/participant/CounselorMessages";
import PatientAppointments from "@/components/calendar/PatientAppointments";
import { demoClients, demoMessages } from "@/lib/rehabPilotDemoData";

export default function ParticipantMessages() {
  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: profile } = useQuery({
    queryKey: ["participant-profile"],
    queryFn: async () => {
      const profiles = await base44.entities.ParticipantProfile.filter({ participant_email: user.email });
      return profiles[0];
    },
    enabled: !!user,
  });

  const [tab, setTab] = useState("messages");
  const demoClient = demoClients[0];

  return (
    <div style={{ minHeight:"100vh", paddingBottom:96, background:"linear-gradient(170deg,#070D1C 0%,#0B1424 55%,#080E1C 100%)" }}>
      {/* Header */}
      <div style={{ background:"linear-gradient(155deg,#0E1D3A 0%,#081426 100%)", padding:"56px 20px 0", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-50, right:-50, width:220, height:220, borderRadius:"50%",
          background:"radial-gradient(circle,rgba(62,207,191,0.08) 0%,transparent 70%)", pointerEvents:"none" }}/>
        <div style={{ position:"relative", zIndex:1 }}>
          <Link to="/" style={{ textDecoration:"none", display:"inline-flex", alignItems:"center", gap:6, marginBottom:16 }}>
            <ArrowLeft style={{ width:16, height:16, color:"#3ECFBF" }}/>
            <span style={{ fontSize:13, fontWeight:700, color:"#3ECFBF" }}>Home</span>
          </Link>
          <h1 style={{ fontSize:22, fontWeight:900, color:"#fff", marginBottom:4 }}>Messages & Appointments</h1>
          <p style={{ fontSize:13, color:"rgba(255,255,255,0.4)", marginBottom:20 }}>Stay connected with your support team. Demo mode uses synthetic, audience-labeled messages.</p>

          {/* Tabs */}
          <div style={{ display:"flex", gap:4 }}>
            {[{ id:"messages", label:"Messages" }, { id:"appointments", label:"My Appointments" }].map(t=>{
              const active = tab === t.id;
              return (
                <button key={t.id} onClick={()=>setTab(t.id)} style={{
                  padding:"10px 18px", borderRadius:"12px 12px 0 0", border:"none", cursor:"pointer",
                  background: active ? "linear-gradient(170deg,#070D1C,#0B1424)" : "transparent",
                  color: active ? "#3ECFBF" : "rgba(255,255,255,0.45)",
                  fontWeight: active ? 800 : 600, fontSize:14,
                }}>
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ padding:"20px 16px" }}>
        {tab === "messages" && (
          profile?.facility_id ? (
            <CounselorMessages participantEmail={user?.email} facilityId={profile.facility_id}/>
          ) : (
            <div style={{ display:"grid", gap:12 }}>
              <div style={{ padding:"14px 16px", borderRadius:18, background:"rgba(45,212,191,0.08)", border:"1px solid rgba(45,212,191,0.2)" }}>
                <p style={{ fontSize:11, letterSpacing:".12em", textTransform:"uppercase", fontWeight:900, color:"#5EEAD4", marginBottom:4 }}>Demo client</p>
                <p style={{ fontSize:16, fontWeight:900, color:"#fff" }}>{demoClient.display_name} - privacy-safe counselor thread</p>
                <p style={{ fontSize:12, color:"rgba(255,255,255,0.45)", marginTop:4 }}>Supporters only see progress fields explicitly approved by the client or counselor.</p>
              </div>
              {demoMessages.map((message) => (
                <div key={message.id} style={{ padding:16, background:"rgba(255,255,255,0.04)", borderRadius:20, border:"1px solid rgba(255,255,255,0.09)" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", gap:12, flexWrap:"wrap", marginBottom:8 }}>
                    <div>
                      <p style={{ fontSize:15, fontWeight:900, color:"#fff" }}>{message.sender}</p>
                      <p style={{ fontSize:11, color:"rgba(255,255,255,0.35)" }}>{message.role} to {message.audience} - {message.timestamp}</p>
                    </div>
                    <span style={{ alignSelf:"flex-start", padding:"5px 10px", borderRadius:999, background:"rgba(62,207,191,0.12)", color:"#5EEAD4", fontSize:10, fontWeight:900, letterSpacing:".08em", textTransform:"uppercase" }}>{message.privacy_label}</span>
                  </div>
                  <p style={{ fontSize:14, color:"rgba(255,255,255,0.72)", lineHeight:1.6 }}>{message.message}</p>
                </div>
              ))}
            </div>
          )
        )}
        {tab === "appointments" && (user?.email ? <PatientAppointments participantEmail={user.email}/> : (
          <div style={{ display:"grid", gap:12 }}>
            {["IOP intake - Tomorrow 10:00 AM", "MAT follow-up - Friday 2:30 PM", "Peer group - Saturday 10:00 AM"].map((appointment) => (
              <div key={appointment} style={{ padding:16, background:"rgba(255,255,255,0.04)", borderRadius:20, border:"1px solid rgba(255,255,255,0.09)", color:"#fff", fontWeight:800 }}>{appointment}</div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}