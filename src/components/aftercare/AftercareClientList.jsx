import React from "react";
import { ChevronRight, AlertTriangle, Flame, Calendar, Users, Phone } from "lucide-react";

const SCORE_META = (score) =>
  score >= 80
    ? { label:"Stable",    color:"#10B981", bg:"rgba(16,185,129,0.1)",  border:"rgba(16,185,129,0.25)" }
    : score >= 50
    ? { label:"At Risk",   color:"#F59E0B", bg:"rgba(245,158,11,0.1)",  border:"rgba(245,158,11,0.25)" }
    : { label:"High Risk", color:"#EF4444", bg:"rgba(239,68,68,0.1)",   border:"rgba(239,68,68,0.25)"  };

function Tag({ color, children }) {
  return (
    <span style={{ fontSize:11, fontWeight:700, padding:"3px 9px", borderRadius:20,
      background:`${color}18`, color, border:`1px solid ${color}30` }}>
      {children}
    </span>
  );
}

function StatCell({ value, label, color }) {
  return (
    <div style={{ flex:1, textAlign:"center", padding:"10px 6px",
      background:"rgba(255,255,255,0.6)", borderRadius:10 }}>
      <p style={{ fontSize:18, fontWeight:900, color, lineHeight:1 }}>{value}</p>
      <p style={{ fontSize:10, color:"#8E8E93", marginTop:3, fontWeight:600, textTransform:"uppercase", letterSpacing:".04em" }}>{label}</p>
    </div>
  );
}

export default function AftercareClientList({ clientMetrics, onSelectClient }) {
  if (clientMetrics.length === 0) {
    return (
      <div style={{ textAlign:"center", padding:"64px 20px", background:"#fff",
        borderRadius:20, border:"1px solid #E5E7EB" }}>
        <div style={{ width:52, height:52, borderRadius:"50%", background:"#F0F9FF",
          display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px" }}>
          <Users style={{ width:24, height:24, color:"#60A5FA" }}/>
        </div>
        <p style={{ fontSize:16, fontWeight:700, color:"#1E1E1E", marginBottom:6 }}>No clients yet</p>
        <p style={{ fontSize:13, color:"#8E8E93" }}>Clients will appear once assigned to you.</p>
      </div>
    );
  }

  const sorted = [...clientMetrics].sort((a, b) => a.stabilityScore - b.stabilityScore);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      {sorted.map((m) => {
        const meta = SCORE_META(m.stabilityScore);
        const isEmergency = m.relapseFlag || m.highCravingImmediate;
        const hasAlert = isEmergency || m.missedCheckIns || m.noMeetings || m.isolationFlag || m.stabilityScore < 50;
        const handle = m.email?.split("@")[0] || m.email;
        const lastCIColor = m.daysSinceCheckIn <= 1 ? "#10B981" : m.daysSinceCheckIn <= 3 ? "#F59E0B" : "#EF4444";
        const streakColor = m.streak >= 7 ? "#10B981" : m.streak >= 3 ? "#F59E0B" : "#EF4444";

        return (
          <button key={m.email} onClick={() => onSelectClient(m)}
            style={{ width:"100%", textAlign:"left", background:"#fff",
              border:`1px solid ${hasAlert ? meta.border : "#E5E7EB"}`,
              borderLeft:`4px solid ${meta.color}`,
              borderRadius:16, padding:"16px 16px", cursor:"pointer",
              boxShadow: isEmergency ? `0 0 0 1px ${meta.color}40, 0 4px 16px ${meta.color}12` : "0 1px 4px rgba(0,0,0,0.05)",
            }}>

            {/* Row 1: identity + badge */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, minWidth:0 }}>
                {isEmergency && <AlertTriangle style={{ width:15, height:15, color:"#EF4444", flexShrink:0 }}/>}
                <div style={{ width:32, height:32, borderRadius:"50%", background:meta.bg,
                  display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
                  fontSize:14, fontWeight:900, color:meta.color }}>
                  {handle[0]?.toUpperCase()}
                </div>
                <p style={{ fontSize:14, fontWeight:700, color:"#1E1E1E", overflow:"hidden",
                  textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{handle}</p>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
                <span style={{ fontSize:12, fontWeight:800, padding:"4px 12px", borderRadius:20,
                  background:meta.bg, color:meta.color, border:`1px solid ${meta.border}` }}>
                  {m.stabilityScore} · {meta.label}
                </span>
                <ChevronRight style={{ width:16, height:16, color:"#C7C7CC" }}/>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ height:5, borderRadius:3, background:"#F0F0F3", overflow:"hidden", marginBottom:12 }}>
              <div style={{ width:`${m.stabilityScore}%`, height:"100%", borderRadius:3,
                background:`linear-gradient(90deg,${meta.color}90,${meta.color})`,
                transition:"width 0.6s ease" }}/>
            </div>

            {/* Stats row */}
            <div style={{ display:"flex", gap:6, marginBottom: hasAlert ? 12 : 0 }}>
              <StatCell value={m.streak > 0 ? m.streak : "—"} label="Streak" color={streakColor}/>
              <StatCell value={m.weeklyMeetings} label="Meetings" color={m.weeklyMeetings > 0 ? "#10B981" : "#EF4444"}/>
              <StatCell value={m.sponsorContacts} label="Sponsor" color={m.sponsorContacts > 0 ? "#10B981" : "#EF4444"}/>
              <StatCell value={m.lastCheckIn ? `${m.daysSinceCheckIn}d` : "—"} label="Last CI" color={lastCIColor}/>
            </div>

            {/* Alert tags */}
            {hasAlert && (
              <div style={{ display:"flex", flexWrap:"wrap", gap:6, paddingTop:12,
                borderTop:`1px solid ${meta.border}` }}>
                {isEmergency         && <Tag color="#EF4444">⚡ Relapse risk</Tag>}
                {m.missedCheckIns    && <Tag color="#EF4444">⚠ Missed check-ins</Tag>}
                {m.noMeetings        && <Tag color="#F59E0B">No meetings</Tag>}
                {m.isolationFlag     && <Tag color="#F59E0B">Isolation pattern</Tag>}
                {m.stabilityScore < 50 && !isEmergency && <Tag color="#EF4444">Score below 50</Tag>}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}