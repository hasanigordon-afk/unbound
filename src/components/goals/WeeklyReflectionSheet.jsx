import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Loader2, Star, MessageCircle } from "lucide-react";

function getMonday(d = new Date()) {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const mon = new Date(d.setDate(diff));
  return `${mon.getFullYear()}-${String(mon.getMonth()+1).padStart(2,"0")}-${String(mon.getDate()).padStart(2,"0")}`;
}

function RatingStars({ value, onChange, readonly=false }) {
  return (
    <div style={{ display:"flex", gap:6 }}>
      {[1,2,3,4,5].map(n => (
        <button key={n} onClick={() => !readonly && onChange(n)}
          style={{ background:"none", border:"none", cursor: readonly ? "default" : "pointer", padding:0 }}>
          <Star style={{ width:24, height:24,
            fill: n <= value ? "#FBBF24" : "none",
            color: n <= value ? "#FBBF24" : "#D1D1D6",
            strokeWidth:1.5 }}/>
        </button>
      ))}
    </div>
  );
}

export default function WeeklyReflectionSheet({ participantEmail, onClose }) {
  const queryClient = useQueryClient();
  const thisWeek = getMonday();
  const [form, setForm] = useState({ overall_rating:3, wins:"", challenges:"", intentions:"" });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const { data: reflections = [], isLoading } = useQuery({
    queryKey: ["reflections", participantEmail],
    queryFn: () => base44.entities.WeeklyReflection.filter({ participant_email: participantEmail }, "-week_start_date", 8),
    enabled: !!participantEmail,
  });

  const thisWeekReflection = reflections.find(r => r.week_start_date === thisWeek);

  const submitMutation = useMutation({
    mutationFn: () => {
      if (thisWeekReflection) {
        return base44.entities.WeeklyReflection.update(thisWeekReflection.id, {
          ...form, participant_email: participantEmail, week_start_date: thisWeek,
        });
      }
      return base44.entities.WeeklyReflection.create({
        ...form, participant_email: participantEmail, week_start_date: thisWeek,
      });
    },
    onSuccess: () => queryClient.invalidateQueries(["reflections"]),
  });

  const LABEL_COLORS = { 5:"#10B981", 4:"#34D399", 3:"#F59E0B", 2:"#F97316", 1:"#EF4444" };
  const LABEL_TEXT = { 5:"Excellent week", 4:"Good week", 3:"Okay week", 2:"Tough week", 1:"Very difficult" };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(0,0,0,0.6)",
      display:"flex", alignItems:"flex-end", justifyContent:"center" }}
      onClick={e => { if (e.target===e.currentTarget) onClose(); }}>
      <div style={{ width:"100%", maxWidth:480, background:"#fff", borderRadius:"24px 24px 0 0",
        maxHeight:"88vh", overflowY:"auto", paddingBottom:32 }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"20px 20px 16px", borderBottom:"1px solid #F0F0F3", position:"sticky", top:0,
          background:"#fff", zIndex:1 }}>
          <div>
            <h2 style={{ fontSize:18, fontWeight:900, color:"#1E1E1E" }}>Weekly Reflection</h2>
            <p style={{ fontSize:12, color:"#8E8E93", marginTop:2 }}>
              Week of {new Date(thisWeek + "T12:00:00").toLocaleDateString("en-US",{ month:"short", day:"numeric" })}
            </p>
          </div>
          <button onClick={onClose} style={{ background:"#F0F0F3", border:"none", borderRadius:8, padding:8, cursor:"pointer" }}>
            <X style={{ width:16, height:16, color:"#5A5A5A" }}/>
          </button>
        </div>

        <div style={{ padding:"20px 20px" }}>
          {/* This week's form */}
          <div style={{ marginBottom:24 }}>
            <p style={{ fontSize:13, fontWeight:700, color:"#5A5A5A", textTransform:"uppercase",
              letterSpacing:".07em", marginBottom:16 }}>This Week</p>

            <div style={{ marginBottom:16 }}>
              <p style={{ fontSize:14, fontWeight:700, color:"#1E1E1E", marginBottom:10 }}>How did this week go?</p>
              <RatingStars value={form.overall_rating} onChange={v=>set("overall_rating",v)}/>
              {form.overall_rating && (
                <p style={{ fontSize:12, fontWeight:700, marginTop:6,
                  color: LABEL_COLORS[form.overall_rating] }}>{LABEL_TEXT[form.overall_rating]}</p>
              )}
            </div>

            <ReflectionField label="🏆 What went well this week?" value={form.wins}
              onChange={v=>set("wins",v)} placeholder="Wins, progress, moments you're proud of…"/>
            <ReflectionField label="💪 What was challenging?" value={form.challenges}
              onChange={v=>set("challenges",v)} placeholder="Struggles, setbacks, hard moments…"/>
            <ReflectionField label="🎯 Your focus for next week?" value={form.intentions}
              onChange={v=>set("intentions",v)} placeholder="What do you want to work on next week…"/>

            {/* Counselor feedback for this week (if exists) */}
            {thisWeekReflection?.counselor_feedback && (
              <div style={{ background:"rgba(62,207,191,0.06)", border:"1px solid rgba(62,207,191,0.25)",
                borderRadius:14, padding:"14px 16px", marginBottom:16 }}>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8 }}>
                  <MessageCircle style={{ width:14, height:14, color:"#0E9F96" }}/>
                  <p style={{ fontSize:12, fontWeight:800, color:"#0E9F96", textTransform:"uppercase", letterSpacing:".06em" }}>
                    Counselor Feedback
                  </p>
                </div>
                {thisWeekReflection.counselor_rating && (
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                    <RatingStars value={thisWeekReflection.counselor_rating} readonly/>
                    <span style={{ fontSize:12, color:"#5A5A5A" }}>Counselor rating</span>
                  </div>
                )}
                <p style={{ fontSize:14, color:"#1E1E1E", lineHeight:1.6 }}>{thisWeekReflection.counselor_feedback}</p>
              </div>
            )}

            <button onClick={() => submitMutation.mutate()}
              disabled={submitMutation.isPending || (!form.wins && !form.challenges && !form.intentions)}
              style={{ width:"100%", padding:"14px", borderRadius:14, border:"none", cursor:"pointer",
                background: (form.wins||form.challenges||form.intentions) ? "linear-gradient(135deg,#3ECFBF,#2CB8AE)" : "#E5E7EB",
                color:"#fff", fontWeight:800, fontSize:15, display:"flex", alignItems:"center",
                justifyContent:"center", gap:8 }}>
              {submitMutation.isPending
                ? <Loader2 className="animate-spin" style={{width:18,height:18}}/>
                : submitMutation.isSuccess ? "✓ Saved!" : thisWeekReflection ? "Update Reflection" : "Submit Reflection →"}
            </button>
          </div>

          {/* Past reflections */}
          {reflections.filter(r=>r.week_start_date!==thisWeek).length > 0 && (
            <div>
              <p style={{ fontSize:13, fontWeight:700, color:"#5A5A5A", textTransform:"uppercase",
                letterSpacing:".07em", marginBottom:12 }}>Past Reflections</p>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {reflections.filter(r=>r.week_start_date!==thisWeek).map(r => (
                  <PastReflectionCard key={r.id} reflection={r}/>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ReflectionField({ label, value, onChange, placeholder }) {
  return (
    <div style={{ marginBottom:14 }}>
      <p style={{ fontSize:13, fontWeight:700, color:"#1E1E1E", marginBottom:8 }}>{label}</p>
      <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={3}
        style={{ width:"100%", padding:"12px 14px", borderRadius:12, border:"1px solid #E5E7EB",
          fontSize:14, color:"#1E1E1E", background:"#F7F7F8", outline:"none",
          resize:"none", boxSizing:"border-box", lineHeight:1.55 }}/>
    </div>
  );
}

function PastReflectionCard({ reflection: r }) {
  const [open, setOpen] = useState(false);
  const LABEL_COLORS = { 5:"#10B981", 4:"#34D399", 3:"#F59E0B", 2:"#F97316", 1:"#EF4444" };
  const LABEL_TEXT = { 5:"Excellent", 4:"Good", 3:"Okay", 2:"Tough", 1:"Very difficult" };
  const weekOf = new Date(r.week_start_date + "T12:00:00").toLocaleDateString("en-US",{ month:"short", day:"numeric" });
  return (
    <div style={{ background:"#F7F7F8", borderRadius:14, overflow:"hidden" }}>
      <button onClick={()=>setOpen(o=>!o)} style={{
        width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"12px 14px", background:"none", border:"none", cursor:"pointer", textAlign:"left" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:8, height:8, borderRadius:"50%",
            background: LABEL_COLORS[r.overall_rating] || "#8E8E93" }}/>
          <span style={{ fontSize:14, fontWeight:700, color:"#1E1E1E" }}>Week of {weekOf}</span>
          {r.overall_rating && (
            <span style={{ fontSize:12, color: LABEL_COLORS[r.overall_rating], fontWeight:700 }}>
              {LABEL_TEXT[r.overall_rating]}
            </span>
          )}
        </div>
        {r.counselor_feedback && (
          <MessageCircle style={{ width:14, height:14, color:"#0E9F96" }}/>
        )}
      </button>
      {open && (
        <div style={{ padding:"0 14px 14px", display:"flex", flexDirection:"column", gap:10 }}>
          {r.wins && <Note label="🏆 Wins" text={r.wins}/>}
          {r.challenges && <Note label="💪 Challenges" text={r.challenges}/>}
          {r.intentions && <Note label="🎯 Intentions" text={r.intentions}/>}
          {r.counselor_feedback && (
            <div style={{ background:"rgba(62,207,191,0.06)", border:"1px solid rgba(62,207,191,0.2)",
              borderRadius:10, padding:"10px 12px" }}>
              <p style={{ fontSize:11, fontWeight:800, color:"#0E9F96", marginBottom:4 }}>COUNSELOR FEEDBACK</p>
              <p style={{ fontSize:13, color:"#1E1E1E", lineHeight:1.55 }}>{r.counselor_feedback}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Note({ label, text }) {
  return (
    <div>
      <p style={{ fontSize:11, fontWeight:700, color:"#8E8E93", marginBottom:3 }}>{label}</p>
      <p style={{ fontSize:13, color:"#1E1E1E", lineHeight:1.55 }}>{text}</p>
    </div>
  );
}