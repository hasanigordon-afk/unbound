import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import CounselorMessages from "../components/participant/CounselorMessages";
import PatientAppointments from "@/components/calendar/PatientAppointments";

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

  return (
    <div style={{ minHeight:"100vh", paddingBottom:96, background:"linear-gradient(170deg,#070D1C 0%,#0B1424 55%,#080E1C 100%)" }}>
      {/* Header */}
      <div style={{ background:"linear-gradient(155deg,#0E1D3A 0%,#081426 100%)", padding:"56px 20px 0", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-50, right:-50, width:220, height:220, borderRadius:"50%",
          background:"radial-gradient(circle,rgba(62,207,191,0.08) 0%,transparent 70%)", pointerEvents:"none" }}/>
        <div style={{ position:"relative", zIndex:1 }}>
          <Link to={createPageUrl("Home")} style={{ textDecoration:"none", display:"inline-flex", alignItems:"center", gap:6, marginBottom:16 }}>
            <ArrowLeft style={{ width:16, height:16, color:"#3ECFBF" }}/>
            <span style={{ fontSize:13, fontWeight:700, color:"#3ECFBF" }}>Home</span>
          </Link>
          <h1 style={{ fontSize:22, fontWeight:900, color:"#fff", marginBottom:4 }}>Messages & Appointments</h1>
          <p style={{ fontSize:13, color:"rgba(255,255,255,0.4)", marginBottom:20 }}>Stay connected with your support team</p>

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
            <div style={{ textAlign:"center", padding:"52px 20px",
              background:"rgba(255,255,255,0.04)", borderRadius:20, border:"1px solid rgba(255,255,255,0.09)" }}>
              <p style={{ fontSize:15, fontWeight:700, color:"rgba(255,255,255,0.6)", marginBottom:6 }}>No messages yet</p>
              <p style={{ fontSize:13, color:"rgba(255,255,255,0.3)" }}>Your messages with your counselor will appear here.</p>
            </div>
          )
        )}
        {tab === "appointments" && <PatientAppointments participantEmail={user?.email}/>}
      </div>
    </div>
  );
}