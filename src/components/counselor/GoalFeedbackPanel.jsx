import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageCircle, Loader2, Star, ChevronDown, ChevronUp, Target } from "lucide-react";

function RatingStars({ value, onChange, readonly=false }) {
  return (
    <div style={{ display:"flex", gap:5 }}>
      {[1,2,3,4,5].map(n => (
        <button key={n} onClick={() => !readonly && onChange(n)}
          style={{ background:"none", border:"none", cursor: readonly ? "default" : "pointer", padding:0 }}>
          <Star style={{ width:20, height:20,
            fill: n <= value ? "#FBBF24" : "none",
            color: n <= value ? "#FBBF24" : "#D1D1D6", strokeWidth:1.5 }}/>
        </button>
      ))}
    </div>
  );
}

const RATING_LABEL = { 5:"Excellent", 4:"Good", 3:"Okay", 2:"Tough", 1:"Very difficult" };
const RATING_COLOR = { 5:"#10B981", 4:"#34D399", 3:"#F59E0B", 2:"#F97316", 1:"#EF4444" };

export default function GoalFeedbackPanel({ participantEmail, counselorEmail }) {
  const queryClient = useQueryClient();

  const { data: reflections = [], isLoading } = useQuery({
    queryKey: ["reflections-counselor", participantEmail],
    queryFn: () => base44.entities.WeeklyReflection.filter({ participant_email: participantEmail }, "-week_start_date", 12),
    enabled: !!participantEmail,
  });

  const { data: goals = [] } = useQuery({
    queryKey: ["goals-counselor", participantEmail],
    queryFn: () => base44.entities.Goal.filter({ participant_email: participantEmail }),
    enabled: !!participantEmail,
  });

  const feedbackMutation = useMutation({
    mutationFn: ({ id, feedback, rating }) =>
      base44.entities.WeeklyReflection.update(id, {
        counselor_feedback: feedback,
        counselor_rating: rating,
        counselor_email: counselorEmail,
        counselor_feedback_date: new Date().toISOString(),
      }),
    onSuccess: () => queryClient.invalidateQueries(["reflections-counselor"]),
  });

  if (isLoading) return (
    <div style={{ textAlign:"center", padding:32 }}>
      <Loader2 className="animate-spin" style={{ width:24, height:24, color:"#3ECFBF", margin:"0 auto" }}/>
    </div>
  );

  return (
    <div>
      {/* Active goals overview */}
      {goals.length > 0 && (
        <div style={{ marginBottom:20 }}>
          <p style={{ fontSize:11, fontWeight:700, color:"#8E8E93", textTransform:"uppercase",
            letterSpacing:".08em", marginBottom:10 }}>Active Goals ({goals.filter(g=>g.status==="active").length})</p>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {goals.filter(g=>g.status!=="paused").map(g => {
              const pct = g.target_days
                ? Math.min(Math.round((g.current_days||0) / g.target_days * 100), 100)
                : g.progress_percentage || 0;
              return (
                <div key={g.id} style={{ background:"#F7F7F8", borderRadius:12, padding:"12px 14px" }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
                    <p style={{ fontSize:13, fontWeight:700, color:"#1E1E1E" }}>{g.title}</p>
                    <span style={{ fontSize:12, fontWeight:800,
                      color: g.status==="completed" ? "#10B981" : pct >= 70 ? "#10B981" : pct >= 40 ? "#F59E0B" : "#EF4444" }}>
                      {pct}%
                    </span>
                  </div>
                  <div style={{ height:5, borderRadius:3, background:"#E5E7EB", overflow:"hidden" }}>
                    <div style={{ width:`${pct}%`, height:"100%", borderRadius:3,
                      background: pct >= 70 ? "#10B981" : pct >= 40 ? "#F59E0B" : "#EF4444",
                      transition:"width 0.6s ease" }}/>
                  </div>
                  {g.streak > 0 && (
                    <p style={{ fontSize:11, color:"#F97316", fontWeight:700, marginTop:4 }}>🔥 {g.streak}-day streak</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Weekly reflections */}
      <p style={{ fontSize:11, fontWeight:700, color:"#8E8E93", textTransform:"uppercase",
        letterSpacing:".08em", marginBottom:10 }}>
        Weekly Reflections ({reflections.length})
      </p>

      {reflections.length === 0 ? (
        <div style={{ textAlign:"center", padding:"40px 20px", background:"#F7F7F8", borderRadius:14 }}>
          <Target style={{ width:28, height:28, color:"#C7C7CC", margin:"0 auto 10px", display:"block" }}/>
          <p style={{ fontSize:13, color:"#8E8E93" }}>No weekly reflections submitted yet.</p>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {reflections.map(r => (
            <ReflectionFeedbackCard
              key={r.id} reflection={r}
              onSubmit={(feedback, rating) => feedbackMutation.mutate({ id:r.id, feedback, rating })}
              isPending={feedbackMutation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ReflectionFeedbackCard({ reflection: r, onSubmit, isPending }) {
  const [expanded, setExpanded] = useState(!r.counselor_feedback);
  const [feedback, setFeedback] = useState(r.counselor_feedback || "");
  const [rating, setRating] = useState(r.counselor_rating || 3);
  const weekOf = new Date(r.week_start_date + "T12:00:00").toLocaleDateString("en-US",{ month:"short", day:"numeric", year:"numeric" });
  const hasFeedback = !!r.counselor_feedback;

  return (
    <div style={{ background:"#fff", borderRadius:14, border:"1px solid #E5E7EB", overflow:"hidden" }}>
      <button onClick={()=>setExpanded(e=>!e)} style={{
        width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"14px 16px", background:"none", border:"none", cursor:"pointer", textAlign:"left" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:10, height:10, borderRadius:"50%",
            background: RATING_COLOR[r.overall_rating] || "#8E8E93" }}/>
          <div>
            <p style={{ fontSize:14, fontWeight:700, color:"#1E1E1E" }}>Week of {weekOf}</p>
            {r.overall_rating && (
              <p style={{ fontSize:12, color: RATING_COLOR[r.overall_rating], fontWeight:700, marginTop:1 }}>
                Patient: {RATING_LABEL[r.overall_rating]}
              </p>
            )}
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          {hasFeedback && (
            <span style={{ fontSize:11, fontWeight:700, padding:"3px 8px", borderRadius:20,
              background:"rgba(62,207,191,0.1)", color:"#0E9F96" }}>Reviewed</span>
          )}
          {!hasFeedback && (
            <span style={{ fontSize:11, fontWeight:700, padding:"3px 8px", borderRadius:20,
              background:"rgba(245,158,11,0.1)", color:"#D97706" }}>Needs review</span>
          )}
          {expanded ? <ChevronUp style={{width:14,height:14,color:"#8E8E93"}}/>
                    : <ChevronDown style={{width:14,height:14,color:"#8E8E93"}}/>}
        </div>
      </button>

      {expanded && (
        <div style={{ padding:"0 16px 16px", borderTop:"1px solid #F0F0F3" }}>
          {/* Patient entries */}
          <div style={{ display:"flex", flexDirection:"column", gap:10, marginTop:12, marginBottom:16 }}>
            {r.wins && <Entry label="🏆 Wins" text={r.wins}/>}
            {r.challenges && <Entry label="💪 Challenges" text={r.challenges}/>}
            {r.intentions && <Entry label="🎯 Next week focus" text={r.intentions}/>}
          </div>

          {/* Counselor rating + feedback */}
          <div style={{ background:"#F7F8FA", borderRadius:12, padding:"14px 14px" }}>
            <p style={{ fontSize:12, fontWeight:700, color:"#5A5A5A", textTransform:"uppercase",
              letterSpacing:".07em", marginBottom:12 }}>Your Feedback</p>

            <div style={{ marginBottom:12 }}>
              <p style={{ fontSize:13, fontWeight:700, color:"#1E1E1E", marginBottom:8 }}>Progress rating:</p>
              <RatingStars value={rating} onChange={setRating}/>
            </div>

            <textarea value={feedback} onChange={e=>setFeedback(e.target.value)}
              placeholder="Write encouraging, specific feedback on their progress this week…"
              rows={4} style={{ width:"100%", padding:"11px 13px", borderRadius:10,
                border:"1px solid #E5E7EB", fontSize:13, color:"#1E1E1E",
                background:"#fff", outline:"none", resize:"none", boxSizing:"border-box", lineHeight:1.55 }}/>

            <button onClick={() => onSubmit(feedback, rating)}
              disabled={isPending || !feedback.trim()}
              style={{ marginTop:10, width:"100%", padding:"11px", borderRadius:10, border:"none",
                cursor: feedback.trim() ? "pointer" : "default",
                background: feedback.trim() ? "linear-gradient(135deg,#3ECFBF,#2CB8AE)" : "#E5E7EB",
                color:"#fff", fontWeight:800, fontSize:13,
                display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
              {isPending
                ? <Loader2 className="animate-spin" style={{width:16,height:16}}/>
                : <><MessageCircle style={{width:14,height:14}}/> {hasFeedback ? "Update Feedback" : "Send Feedback"}</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Entry({ label, text }) {
  return (
    <div style={{ background:"#F7F7F8", borderRadius:10, padding:"10px 12px" }}>
      <p style={{ fontSize:11, fontWeight:700, color:"#8E8E93", marginBottom:3 }}>{label}</p>
      <p style={{ fontSize:13, color:"#1E1E1E", lineHeight:1.55 }}>{text}</p>
    </div>
  );
}