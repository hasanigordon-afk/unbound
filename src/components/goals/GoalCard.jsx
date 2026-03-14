import React, { useState } from "react";
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Flame, Calendar, Target } from "lucide-react";

const CAT_META = {
  recovery_milestone: { emoji:"🌱", color:"#10B981", bg:"rgba(16,185,129,0.1)"  },
  health:             { emoji:"❤️", color:"#EF4444", bg:"rgba(239,68,68,0.1)"   },
  relationships:      { emoji:"🤝", color:"#8B5CF6", bg:"rgba(139,92,246,0.1)" },
  career:             { emoji:"💼", color:"#F59E0B", bg:"rgba(245,158,11,0.1)"  },
  personal_growth:    { emoji:"🚀", color:"#3B82F6", bg:"rgba(59,130,246,0.1)" },
  daily_habits:       { emoji:"📅", color:"#0891B2", bg:"rgba(8,145,178,0.1)"  },
  housing:            { emoji:"🏠", color:"#34D399", bg:"rgba(52,211,153,0.1)" },
  legal:              { emoji:"⚖️", color:"#6B7280", bg:"rgba(107,114,128,0.1)"},
  education:          { emoji:"📚", color:"#A78BFA", bg:"rgba(167,139,250,0.1)"},
  financial:          { emoji:"💰", color:"#FBBF24", bg:"rgba(251,191,36,0.1)" },
};

function fmt(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

export default function GoalCard({ goal, onCheckin, onToggleMilestone }) {
  const [expanded, setExpanded] = useState(false);
  const meta = CAT_META[goal.category] || CAT_META.personal_growth;
  const today = fmt(new Date());
  const checkedToday = goal.last_checkin_date === today;
  const pct = goal.target_days
    ? Math.min(Math.round((goal.current_days / goal.target_days) * 100), 100)
    : goal.progress_percentage || 0;
  const isComplete = goal.status === "completed" || pct >= 100;
  const daysLeft = goal.target_date
    ? Math.max(0, Math.ceil((new Date(goal.target_date) - new Date()) / 86400000))
    : null;

  return (
    <div style={{
      background:"#fff", borderRadius:18,
      border:`1px solid ${isComplete ? meta.color + "50" : "#E5E7EB"}`,
      borderLeft:`4px solid ${meta.color}`,
      boxShadow:"0 1px 6px rgba(0,0,0,0.05)", overflow:"hidden",
    }}>
      <div style={{ padding:"16px 16px 14px" }}>
        {/* Header */}
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, minWidth:0 }}>
            <div style={{ width:38, height:38, borderRadius:12, flexShrink:0,
              background:meta.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>
              {meta.emoji}
            </div>
            <div style={{ minWidth:0 }}>
              <p style={{ fontSize:15, fontWeight:800, color:"#1E1E1E", lineHeight:1.2,
                overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {goal.title}
              </p>
              {goal.description && (
                <p style={{ fontSize:12, color:"#8E8E93", marginTop:2, lineHeight:1.4 }}>{goal.description}</p>
              )}
            </div>
          </div>
          {goal.streak > 0 && (
            <div style={{ display:"flex", alignItems:"center", gap:4, flexShrink:0,
              padding:"4px 10px", borderRadius:20, background:"rgba(249,115,22,0.1)" }}>
              <Flame style={{ width:13, height:13, color:"#F97316" }}/>
              <span style={{ fontSize:12, fontWeight:800, color:"#F97316" }}>{goal.streak}</span>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom:10 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <span style={{ fontSize:12, color:"#8E8E93", fontWeight:600 }}>
              {goal.target_days
                ? `${goal.current_days || 0} / ${goal.target_days} days`
                : `${pct}% complete`}
            </span>
            <span style={{ fontSize:13, fontWeight:900, color:meta.color }}>{pct}%</span>
          </div>
          <div style={{ height:8, borderRadius:4, background:"#F0F0F3", overflow:"hidden" }}>
            <div style={{
              height:"100%", borderRadius:4,
              width:`${pct}%`,
              background:`linear-gradient(90deg,${meta.color}90,${meta.color})`,
              boxShadow:`0 0 8px ${meta.color}50`,
              transition:"width 0.8s ease",
            }}/>
          </div>
        </div>

        {/* Meta row */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
          {daysLeft !== null && (
            <span style={{ fontSize:11, color:"#8E8E93", display:"flex", alignItems:"center", gap:4 }}>
              <Calendar style={{ width:11, height:11 }}/> {daysLeft}d left
            </span>
          )}
          {goal.checkin_dates?.length > 0 && (
            <span style={{ fontSize:11, color:"#8E8E93", display:"flex", alignItems:"center", gap:4 }}>
              <Target style={{ width:11, height:11 }}/> {goal.checkin_dates.length} check-ins
            </span>
          )}
        </div>

        {/* Actions */}
        <div style={{ display:"flex", gap:8 }}>
          {!isComplete && (
            <button onClick={() => onCheckin(goal)} disabled={checkedToday}
              style={{ flex:1, padding:"10px", borderRadius:12, border:"none", cursor: checkedToday ? "default" : "pointer",
                background: checkedToday ? "rgba(16,185,129,0.1)" : `linear-gradient(135deg,${meta.color},${meta.color}CC)`,
                color: checkedToday ? "#10B981" : "#fff", fontWeight:800, fontSize:13,
                display:"flex", alignItems:"center", justifyContent:"center", gap:6,
              }}>
              {checkedToday
                ? <><CheckCircle2 style={{width:14,height:14}}/> Done today</>
                : "✓ Check In Today"}
            </button>
          )}
          {isComplete && (
            <div style={{ flex:1, padding:"10px", borderRadius:12,
              background:"rgba(16,185,129,0.1)", textAlign:"center" }}>
              <p style={{ fontSize:13, fontWeight:800, color:"#10B981" }}>🎉 Goal Achieved!</p>
            </div>
          )}
          <button onClick={() => setExpanded(e=>!e)}
            style={{ padding:"10px 12px", borderRadius:12, border:"1px solid #E5E7EB",
              background:"#F7F7F8", cursor:"pointer" }}>
            {expanded
              ? <ChevronUp style={{width:14,height:14,color:"#8E8E93"}}/>
              : <ChevronDown style={{width:14,height:14,color:"#8E8E93"}}/>}
          </button>
        </div>
      </div>

      {/* Expanded: mini milestones */}
      {expanded && goal.milestones?.length > 0 && (
        <div style={{ borderTop:"1px solid #F0F0F3", padding:"12px 16px",
          background:"#FAFAFA", display:"flex", flexDirection:"column", gap:8 }}>
          <p style={{ fontSize:11, fontWeight:700, color:"#8E8E93", textTransform:"uppercase", letterSpacing:".07em" }}>
            Milestones
          </p>
          {goal.milestones.map((m,i) => (
            <button key={i} onClick={() => onToggleMilestone(goal, i)}
              style={{ display:"flex", alignItems:"center", gap:10, background:"none",
                border:"none", cursor:"pointer", textAlign:"left", padding:0 }}>
              {m.completed
                ? <CheckCircle2 style={{ width:16, height:16, color:meta.color, flexShrink:0 }}/>
                : <Circle style={{ width:16, height:16, color:"#C7C7CC", flexShrink:0 }}/>}
              <span style={{ fontSize:13, color: m.completed ? meta.color : "#5A5A5A",
                fontWeight: m.completed ? 700 : 500,
                textDecoration: m.completed ? "line-through" : "none" }}>
                {m.title}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}