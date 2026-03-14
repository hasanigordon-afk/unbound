import React from "react";
import { AlertTriangle, ChevronRight, MessageCircle, CalendarCheck, Flag } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const ALERT_RULES = [
  { key:"relapseFlag",            label:"Relapse risk flag raised",        emoji:"⚡", color:"#EF4444" },
  { key:"highCravingImmediate",   label:"High craving intensity (8+/10)",  emoji:"🔥", color:"#EF4444" },
  { key:"missedCheckIns",         label:"Missed 3+ check-ins",             emoji:"📋", color:"#EF4444" },
  { key:"stabilityDropped",       label:"Stability score below 50",        emoji:"📉", color:"#EF4444" },
  { key:"moderateCravingPattern", label:"Elevated cravings 3+ days",       emoji:"↑",  color:"#EA580C" },
  { key:"moodDropPattern",        label:"Low mood for 3+ days",            emoji:"↓",  color:"#F59E0B" },
  { key:"isolationFlag",          label:"No mentor contact 5+ days",       emoji:"🚪", color:"#F59E0B" },
  { key:"highCravings",           label:"High avg craving intensity",       emoji:"⚠", color:"#F59E0B" },
  { key:"noMeetings",             label:"No meetings logged this week",    emoji:"📅", color:"#8E8E93" },
];

export default function AftercareAlerts({ clientMetrics, counselorEmail, onSelectClient }) {
  const queryClient = useQueryClient();

  const flagMutation = useMutation({
    mutationFn: async ({ email, alertType }) => {
      await base44.entities.EngagementAlert.create({
        participant_email: email,
        alert_type: alertType,
        alert_date: new Date().toISOString().split("T")[0],
        risk_score: 75,
        risk_level: "high",
        status: "active",
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["aftercare-alerts"] }),
  });

  const messageMutation = useMutation({
    mutationFn: async ({ toEmail, content }) => {
      await base44.entities.CounselorMessage.create({
        facility_id: "aftercare",
        counselor_email: counselorEmail,
        participant_email: toEmail,
        message: content,
        message_type: "notification",
      });
    },
  });

  const alertedClients = clientMetrics
    .map(m => ({ ...m, stabilityDropped: m.stabilityScore < 50 }))
    .filter(m =>
      m.missedCheckIns || m.highCravings || m.noMeetings || m.flagged ||
      m.relapseFlag || m.highCravingImmediate || m.moderateCravingPattern ||
      m.moodDropPattern || m.isolationFlag || m.stabilityDropped
    )
    .sort((a, b) => {
      if (a.relapseFlag && !b.relapseFlag) return -1;
      if (!a.relapseFlag && b.relapseFlag) return 1;
      if (a.highCravingImmediate && !b.highCravingImmediate) return -1;
      if (!a.highCravingImmediate && b.highCravingImmediate) return 1;
      return 0;
    });

  if (alertedClients.length === 0) {
    return (
      <div style={{ textAlign:"center", padding:"64px 20px", background:"#fff",
        borderRadius:20, border:"1px solid #E5E7EB" }}>
        <div style={{ width:52, height:52, borderRadius:"50%", background:"#F0FDF4",
          display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px" }}>
          <AlertTriangle style={{ width:24, height:24, color:"#22C55E" }}/>
        </div>
        <p style={{ fontSize:16, fontWeight:700, color:"#1E1E1E", marginBottom:6 }}>No active alerts</p>
        <p style={{ fontSize:13, color:"#8E8E93" }}>All clients are currently on track.</p>
      </div>
    );
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
        <AlertTriangle style={{ width:14, height:14, color:"#EF4444" }}/>
        <p style={{ fontSize:12, fontWeight:700, color:"#EF4444", textTransform:"uppercase", letterSpacing:".08em" }}>
          {alertedClients.length} client{alertedClients.length!==1?"s":""} need attention
        </p>
      </div>

      {alertedClients.map((m) => {
        const isEmergency = m.relapseFlag || m.highCravingImmediate;
        const borderColor = isEmergency ? "#EF4444" : "#F59E0B";
        const handle = m.email?.split("@")[0] || m.email;
        const activeRules = ALERT_RULES.filter(r => m[r.key]);

        return (
          <div key={m.email} style={{
            background:"#fff", borderRadius:16,
            border:`1px solid ${borderColor}40`,
            borderLeft:`4px solid ${borderColor}`,
            overflow:"hidden",
            boxShadow: isEmergency ? `0 0 0 1px ${borderColor}20, 0 4px 20px ${borderColor}10` : "0 1px 4px rgba(0,0,0,0.06)",
          }}>

            {/* Emergency banner */}
            {isEmergency && (
              <div style={{ background:`${borderColor}12`, padding:"8px 16px",
                borderBottom:`1px solid ${borderColor}25` }}>
                <p style={{ fontSize:12, fontWeight:800, color:borderColor }}>
                  ⚡ IMMEDIATE ATTENTION NEEDED
                </p>
              </div>
            )}

            <div style={{ padding:"16px 16px" }}>
              {/* Header row */}
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:36, height:36, borderRadius:"50%",
                    background: isEmergency ? "rgba(239,68,68,0.1)" : "rgba(245,158,11,0.1)",
                    display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
                    fontSize:16, fontWeight:900, color:borderColor }}>
                    {handle[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontSize:15, fontWeight:800, color:"#1E1E1E" }}>{handle}</p>
                    {m.latestCraving !== null && (
                      <p style={{ fontSize:12, color:"#8E8E93", marginTop:1 }}>
                        Craving: <strong style={{ color: m.latestCraving >= 8 ? "#EF4444" : "#1E1E1E" }}>{m.latestCraving}/10</strong>
                        {m.avgMood && <> · Mood: <strong style={{ color:"#1E1E1E" }}>{m.avgMood}/5</strong></>}
                      </p>
                    )}
                  </div>
                </div>
                <button onClick={() => onSelectClient(m)} style={{
                  display:"flex", alignItems:"center", gap:4, padding:"6px 12px",
                  background:"#F0F7FF", border:"1px solid #BFDBFE", borderRadius:10,
                  color:"#2563EB", fontSize:12, fontWeight:700, cursor:"pointer" }}>
                  View <ChevronRight style={{ width:12, height:12 }}/>
                </button>
              </div>

              {/* Alert tags — compact chips */}
              <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:14 }}>
                {activeRules.map(r => (
                  <span key={r.key} style={{ fontSize:11, fontWeight:700, padding:"4px 10px",
                    borderRadius:20, background:`${r.color}12`, color:r.color,
                    border:`1px solid ${r.color}28`, display:"flex", alignItems:"center", gap:4 }}>
                    <span>{r.emoji}</span> {r.label}
                  </span>
                ))}
              </div>

              {/* Mini stat strip */}
              <div style={{ display:"flex", gap:12, marginBottom:14, padding:"10px 14px",
                background:"#F7F8FA", borderRadius:12 }}>
                {[
                  { label:"Meetings", value:m.weeklyMeetings },
                  { label:"Sponsor",  value:m.sponsorContacts },
                  { label:"Last CI",  value:m.lastCheckIn ? `${m.daysSinceCheckIn}d ago` : "Never" },
                ].map(s => (
                  <div key={s.label} style={{ flex:1, textAlign:"center" }}>
                    <p style={{ fontSize:15, fontWeight:800, color:"#1E1E1E" }}>{s.value}</p>
                    <p style={{ fontSize:10, color:"#8E8E93", fontWeight:600, textTransform:"uppercase", letterSpacing:".04em" }}>{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                <button onClick={() => messageMutation.mutate({
                    toEmail: m.email,
                    content: m.relapseFlag
                      ? "Your counselor is here for you right now. Please reach out — we want to support you through this."
                      : "Hi, your counselor is checking in. Please complete your daily check-in and reach out if you need support.",
                  })}
                  style={{ padding:"10px 6px", borderRadius:12, border:"none", cursor:"pointer",
                    background:"#EBF3FD", color:"#2563EB", fontSize:12, fontWeight:700,
                    display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}>
                  <MessageCircle style={{ width:13, height:13 }}/> Message
                </button>
                <button onClick={() => messageMutation.mutate({
                    toEmail: m.email,
                    content: "Can we schedule a check-in call? Please reply with your availability — I'd like to connect with you this week.",
                  })}
                  style={{ padding:"10px 6px", borderRadius:12, border:"none", cursor:"pointer",
                    background:"#F5F3FF", color:"#7C3AED", fontSize:12, fontWeight:700,
                    display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}>
                  <CalendarCheck style={{ width:13, height:13 }}/> Schedule
                </button>
                <button onClick={() => flagMutation.mutate({ email: m.email, alertType: isEmergency ? "composite_high_risk" : "composite_medium_risk" })}
                  style={{ padding:"10px 6px", borderRadius:12, border:"none", cursor:"pointer",
                    background:"#FEF2F2", color:"#EF4444", fontSize:12, fontWeight:700,
                    display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}>
                  <Flag style={{ width:13, height:13 }}/> Flag
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}