import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, X, ChevronLeft, ChevronRight, Clock, User, Users, Check, RotateCcw, Loader2, Calendar, Trash2 } from "lucide-react";

const SESSION_TYPES = [
  { value:"individual_counseling", label:"Individual Counseling", icon:"🪑" },
  { value:"group_meeting",         label:"Group Meeting",         icon:"👥" },
  { value:"discharge_planning",    label:"Discharge Planning",    icon:"🏁" },
  { value:"sponsor_call",          label:"Sponsor Call",          icon:"📞" },
  { value:"peer_support",          label:"Peer Support",          icon:"🤝" },
  { value:"medication_check",      label:"Medication Check",      icon:"💊" },
];

const STATUS_META = {
  pending:              { label:"Pending",    color:"#8E8E93", bg:"rgba(142,142,147,0.1)"  },
  confirmed:            { label:"Confirmed",  color:"#10B981", bg:"rgba(16,185,129,0.1)"   },
  reschedule_requested: { label:"Reschedule", color:"#F59E0B", bg:"rgba(245,158,11,0.1)"   },
};

const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function fmt(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
}
function fmtDisplay(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US",{ weekday:"short", month:"short", day:"numeric" });
}
function fmtTime(t) {
  if (!t) return "";
  const [h,m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "pm" : "am";
  return `${h%12||12}:${String(m).padStart(2,"0")} ${ampm}`;
}

const EMPTY_FORM = { title:"", session_type:"individual_counseling", is_group_event:false,
  participant_email:"", group_participant_emails:[], scheduled_date:"", scheduled_time:"09:00",
  duration_minutes:50, meeting_url:"", notes:"" };

export default function CounselorCalendar({ counselorEmail, clientMetrics = [] }) {
  const queryClient = useQueryClient();
  const [view, setView] = useState("list"); // "list" | "month"
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [monthOffset, setMonthOffset] = useState(0);
  const [groupInput, setGroupInput] = useState("");

  const today = new Date(); today.setHours(0,0,0,0);
  const displayMonth = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["counselor-sessions", counselorEmail],
    queryFn: () => base44.entities.TelehealthSession.filter({ provider_email: counselorEmail }, "scheduled_date", 200),
    enabled: !!counselorEmail,
    refetchInterval: 30000,
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      if (data.is_group_event) {
        // create one record per participant for individual tracking, plus a group record
        const base = { ...data, status:"scheduled", attendance_status:"pending" };
        if (data.group_participant_emails?.length) {
          await Promise.all(data.group_participant_emails.map(email =>
            base44.entities.TelehealthSession.create({ ...base, participant_email: email })
          ));
        } else {
          await base44.entities.TelehealthSession.create({ ...base, participant_email:"" });
        }
      } else {
        await base44.entities.TelehealthSession.create({ ...data, status:"scheduled", attendance_status:"pending" });
      }
    },
    onSuccess: () => { queryClient.invalidateQueries(["counselor-sessions"]); setShowModal(false); setForm(EMPTY_FORM); },
  });

  const cancelMutation = useMutation({
    mutationFn: (id) => base44.entities.TelehealthSession.update(id, { status:"cancelled" }),
    onSuccess: () => queryClient.invalidateQueries(["counselor-sessions"]),
  });

  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const upcoming = useMemo(() =>
    sessions
      .filter(s => s.status !== "cancelled" && s.scheduled_date >= fmt(today))
      .sort((a,b) => a.scheduled_date.localeCompare(b.scheduled_date) || a.scheduled_time.localeCompare(b.scheduled_time)),
    [sessions]
  );

  const past = useMemo(() =>
    sessions
      .filter(s => s.scheduled_date < fmt(today) || s.status === "cancelled")
      .sort((a,b) => b.scheduled_date.localeCompare(a.scheduled_date))
      .slice(0,10),
    [sessions]
  );

  // Month calendar data
  const calDays = useMemo(() => {
    const first = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), 1);
    const last  = new Date(displayMonth.getFullYear(), displayMonth.getMonth()+1, 0);
    const cells = [];
    for (let i=0; i<first.getDay(); i++) cells.push(null);
    for (let d=1; d<=last.getDate(); d++) cells.push(new Date(displayMonth.getFullYear(), displayMonth.getMonth(), d));
    return cells;
  }, [displayMonth]);

  const sessionsByDate = useMemo(() => {
    const map = {};
    sessions.filter(s=>s.status!=="cancelled").forEach(s => {
      if (!map[s.scheduled_date]) map[s.scheduled_date] = [];
      map[s.scheduled_date].push(s);
    });
    return map;
  }, [sessions]);

  const addGroupEmail = () => {
    const e = groupInput.trim();
    if (e && !form.group_participant_emails.includes(e)) {
      set("group_participant_emails", [...form.group_participant_emails, e]);
    }
    setGroupInput("");
  };

  const clientOptions = clientMetrics.map(m => m.email);

  return (
    <div>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
        <div style={{ display:"flex", gap:6 }}>
          {["list","month"].map(v=>(
            <button key={v} onClick={()=>setView(v)} style={{
              padding:"7px 14px", borderRadius:10, border:"none", cursor:"pointer", fontSize:12, fontWeight:700,
              background: view===v ? "#1E1D3A" : "#F0F0F3", color: view===v ? "#fff" : "#5A5A5A",
            }}>{v==="list"?"List":"Month"}</button>
          ))}
        </div>
        <button onClick={()=>setShowModal(true)} style={{
          display:"flex", alignItems:"center", gap:6, padding:"9px 16px", borderRadius:12,
          background:"linear-gradient(135deg,#3ECFBF,#2CB8AE)", border:"none", cursor:"pointer",
          color:"#fff", fontSize:13, fontWeight:800, boxShadow:"0 4px 14px rgba(62,207,191,0.3)",
        }}>
          <Plus style={{width:15,height:15}}/> New Session
        </button>
      </div>

      {isLoading ? (
        <div style={{ textAlign:"center", padding:40 }}><Loader2 className="animate-spin" style={{ width:28, height:28, color:"#3ECFBF", margin:"0 auto" }}/></div>
      ) : view === "list" ? (
        <ListView upcoming={upcoming} past={past} onCancel={cancelMutation.mutate}/>
      ) : (
        <MonthView calDays={calDays} displayMonth={displayMonth}
          sessionsByDate={sessionsByDate} monthOffset={monthOffset}
          setMonthOffset={setMonthOffset} today={today}/>
      )}

      {/* Create modal */}
      {showModal && (
        <div style={{ position:"fixed", inset:0, zIndex:100, background:"rgba(0,0,0,0.55)",
          display:"flex", alignItems:"flex-end", justifyContent:"center" }}
          onClick={e=>{ if(e.target===e.currentTarget) setShowModal(false); }}>
          <div style={{ width:"100%", maxWidth:480, background:"#fff", borderRadius:"24px 24px 0 0",
            padding:"24px 20px 40px", maxHeight:"90vh", overflowY:"auto" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
              <h2 style={{ fontSize:18, fontWeight:900, color:"#1E1E1E" }}>New Session</h2>
              <button onClick={()=>setShowModal(false)} style={{ background:"#F0F0F3", border:"none", borderRadius:8, padding:8, cursor:"pointer" }}>
                <X style={{width:16,height:16,color:"#5A5A5A"}}/>
              </button>
            </div>

            {/* Group toggle */}
            <div style={{ display:"flex", gap:8, marginBottom:16 }}>
              {[false,true].map(g=>(
                <button key={g.toString()} onClick={()=>set("is_group_event",g)} style={{
                  flex:1, padding:"10px", borderRadius:12, border:"1.5px solid",
                  borderColor: form.is_group_event===g ? "#3ECFBF" : "#E5E7EB",
                  background: form.is_group_event===g ? "rgba(62,207,191,0.08)" : "#fff",
                  color: form.is_group_event===g ? "#0E9F96" : "#5A5A5A",
                  fontWeight:700, fontSize:13, cursor:"pointer",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:6,
                }}>
                  {g ? <><Users style={{width:14,height:14}}/> Group</> : <><User style={{width:14,height:14}}/> Individual</>}
                </button>
              ))}
            </div>

            <FormField label="Session Type">
              <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                {SESSION_TYPES.map(t=>(
                  <button key={t.value} onClick={()=>set("session_type",t.value)} style={{
                    padding:"7px 12px", borderRadius:10, border:"1.5px solid",
                    borderColor: form.session_type===t.value ? "#3ECFBF" : "#E5E7EB",
                    background: form.session_type===t.value ? "rgba(62,207,191,0.08)" : "#F7F7F8",
                    color: form.session_type===t.value ? "#0E9F96" : "#5A5A5A",
                    fontSize:12, fontWeight:700, cursor:"pointer",
                  }}>{t.icon} {t.label}</button>
                ))}
              </div>
            </FormField>

            <FormField label="Title (optional)">
              <Input value={form.title} onChange={v=>set("title",v)} placeholder="e.g. Weekly check-in, Discharge planning…"/>
            </FormField>

            {!form.is_group_event ? (
              <FormField label="Patient">
                <select value={form.participant_email} onChange={e=>set("participant_email",e.target.value)}
                  style={{ width:"100%", padding:"12px 14px", borderRadius:12, border:"1px solid #E5E7EB",
                    fontSize:14, color:"#1E1E1E", background:"#F7F7F8", outline:"none" }}>
                  <option value="">Select patient…</option>
                  {clientOptions.map(e=><option key={e} value={e}>{e}</option>)}
                </select>
              </FormField>
            ) : (
              <FormField label="Group Participants">
                <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:8 }}>
                  {form.group_participant_emails.map((e,i)=>(
                    <span key={i} style={{ fontSize:12, fontWeight:700, padding:"4px 10px", borderRadius:20,
                      background:"rgba(62,207,191,0.1)", color:"#0E9F96",
                      display:"flex", alignItems:"center", gap:6 }}>
                      {e.split("@")[0]}
                      <button onClick={()=>set("group_participant_emails", form.group_participant_emails.filter((_,idx)=>idx!==i))}
                        style={{ background:"none", border:"none", cursor:"pointer", color:"#0E9F96", padding:0 }}>✕</button>
                    </span>
                  ))}
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <select value={groupInput} onChange={e=>setGroupInput(e.target.value)}
                    style={{ flex:1, padding:"11px 12px", borderRadius:12, border:"1px solid #E5E7EB",
                      fontSize:13, color:"#1E1E1E", background:"#F7F7F8", outline:"none" }}>
                    <option value="">Add patient…</option>
                    {clientOptions.filter(e=>!form.group_participant_emails.includes(e)).map(e=><option key={e} value={e}>{e}</option>)}
                  </select>
                  <button onClick={addGroupEmail} style={{ padding:"11px 16px", borderRadius:12,
                    background:"rgba(62,207,191,0.1)", border:"1px solid rgba(62,207,191,0.3)",
                    color:"#0E9F96", fontWeight:700, fontSize:13, cursor:"pointer" }}>Add</button>
                </div>
              </FormField>
            )}

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <FormField label="Date">
                <Input type="date" value={form.scheduled_date} onChange={v=>set("scheduled_date",v)}/>
              </FormField>
              <FormField label="Time">
                <Input type="time" value={form.scheduled_time} onChange={v=>set("scheduled_time",v)}/>
              </FormField>
            </div>

            <FormField label="Duration (minutes)">
              <div style={{ display:"flex", gap:6 }}>
                {[30,50,60,90].map(d=>(
                  <button key={d} onClick={()=>set("duration_minutes",d)} style={{
                    flex:1, padding:"9px 4px", borderRadius:10, border:"1.5px solid",
                    borderColor: form.duration_minutes===d ? "#3ECFBF" : "#E5E7EB",
                    background: form.duration_minutes===d ? "rgba(62,207,191,0.08)" : "#F7F7F8",
                    color: form.duration_minutes===d ? "#0E9F96" : "#5A5A5A",
                    fontSize:13, fontWeight:700, cursor:"pointer",
                  }}>{d}m</button>
                ))}
              </div>
            </FormField>

            <FormField label="Video Link (optional)">
              <Input value={form.meeting_url} onChange={v=>set("meeting_url",v)} placeholder="https://meet.google.com/…"/>
            </FormField>

            <FormField label="Notes for patient (optional)">
              <textarea value={form.notes} onChange={e=>set("notes",e.target.value)}
                placeholder="Any preparation or context for the patient…"
                rows={3} style={{ width:"100%", padding:"12px 14px", borderRadius:12,
                  border:"1px solid #E5E7EB", fontSize:14, color:"#1E1E1E",
                  background:"#F7F7F8", outline:"none", resize:"vertical", boxSizing:"border-box" }}/>
            </FormField>

            <button
              onClick={()=>createMutation.mutate(form)}
              disabled={createMutation.isPending || !form.scheduled_date}
              style={{ width:"100%", padding:"15px", borderRadius:14, border:"none", cursor:"pointer",
                background: form.scheduled_date ? "linear-gradient(135deg,#3ECFBF,#2CB8AE)" : "#E5E7EB",
                color:"#fff", fontWeight:800, fontSize:15, display:"flex", alignItems:"center",
                justifyContent:"center", gap:8 }}>
              {createMutation.isPending ? <Loader2 className="animate-spin" style={{width:18,height:18}}/> : "Schedule Session →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ListView({ upcoming, past, onCancel }) {
  const [showPast, setShowPast] = useState(false);

  if (upcoming.length === 0 && past.length === 0) {
    return (
      <div style={{ textAlign:"center", padding:"60px 20px", background:"#fff",
        borderRadius:20, border:"1px solid #E5E7EB" }}>
        <Calendar style={{ width:40, height:40, color:"#C7C7CC", margin:"0 auto 14px", display:"block" }}/>
        <p style={{ fontSize:16, fontWeight:700, color:"#1E1E1E", marginBottom:6 }}>No sessions scheduled</p>
        <p style={{ fontSize:13, color:"#8E8E93" }}>Create a session to get started.</p>
      </div>
    );
  }

  return (
    <div>
      {upcoming.length > 0 && (
        <>
          <p style={{ fontSize:11, fontWeight:700, color:"#8E8E93", textTransform:"uppercase",
            letterSpacing:".09em", marginBottom:10 }}>Upcoming ({upcoming.length})</p>
          <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:20 }}>
            {upcoming.map(s=><SessionCard key={s.id} session={s} onCancel={onCancel} mode="counselor"/>)}
          </div>
        </>
      )}
      {past.length > 0 && (
        <>
          <button onClick={()=>setShowPast(p=>!p)} style={{ fontSize:12, fontWeight:700,
            color:"#8E8E93", background:"none", border:"none", cursor:"pointer",
            textTransform:"uppercase", letterSpacing:".09em", marginBottom:10, padding:0 }}>
            {showPast?"▲":"▶"} Past sessions ({past.length})
          </button>
          {showPast && (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {past.map(s=><SessionCard key={s.id} session={s} onCancel={onCancel} mode="counselor" dimmed/>)}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function MonthView({ calDays, displayMonth, sessionsByDate, monthOffset, setMonthOffset, today }) {
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
        <button onClick={()=>setMonthOffset(o=>o-1)} style={{ background:"#F0F0F3", border:"none", borderRadius:8, padding:"8px 10px", cursor:"pointer" }}>
          <ChevronLeft style={{width:16,height:16,color:"#5A5A5A"}}/>
        </button>
        <p style={{ fontSize:15, fontWeight:800, color:"#1E1E1E" }}>
          {MONTHS[displayMonth.getMonth()]} {displayMonth.getFullYear()}
        </p>
        <button onClick={()=>setMonthOffset(o=>o+1)} style={{ background:"#F0F0F3", border:"none", borderRadius:8, padding:"8px 10px", cursor:"pointer" }}>
          <ChevronRight style={{width:16,height:16,color:"#5A5A5A"}}/>
        </button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2, marginBottom:6 }}>
        {["S","M","T","W","T","F","S"].map((d,i)=>(
          <p key={i} style={{ textAlign:"center", fontSize:11, fontWeight:700, color:"#8E8E93", padding:"4px 0" }}>{d}</p>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2 }}>
        {calDays.map((day,i)=>{
          if (!day) return <div key={i}/>;
          const ds = fmt(day);
          const isToday = ds === fmt(today);
          const daySessions = sessionsByDate[ds] || [];
          return (
            <div key={i} style={{ minHeight:52, borderRadius:10, padding:"4px 3px",
              background: isToday ? "rgba(62,207,191,0.1)" : "#fff",
              border:`1px solid ${isToday ? "rgba(62,207,191,0.4)" : "#E5E7EB"}` }}>
              <p style={{ fontSize:12, fontWeight: isToday ? 900 : 600,
                color: isToday ? "#0E9F96" : "#5A5A5A", textAlign:"center" }}>
                {day.getDate()}
              </p>
              {daySessions.slice(0,2).map((s,j)=>(
                <div key={j} style={{ fontSize:9, fontWeight:700, padding:"2px 4px", borderRadius:4,
                  background:s.is_group_event?"rgba(91,110,245,0.12)":"rgba(62,207,191,0.12)",
                  color:s.is_group_event?"#5B6EF5":"#0E9F96", marginTop:2,
                  overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  {fmtTime(s.scheduled_time)}
                </div>
              ))}
              {daySessions.length > 2 && (
                <p style={{ fontSize:9, color:"#8E8E93", textAlign:"center", marginTop:1 }}>+{daySessions.length-2}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function SessionCard({ session: s, onCancel, onConfirm, onReschedule, mode="counselor", dimmed=false }) {
  const [showReschedule, setShowReschedule] = useState(false);
  const [rescheduleNote, setRescheduleNote] = useState("");
  const typeMeta = SESSION_TYPES.find(t=>t.value===s.session_type) || SESSION_TYPES[0];
  const attMeta = STATUS_META[s.attendance_status] || STATUS_META.pending;
  const isCancelled = s.status === "cancelled";
  const handle = s.participant_email?.split("@")[0] || (s.is_group_event ? "Group" : "—");

  return (
    <div style={{ background:"#fff", borderRadius:16,
      border: isCancelled ? "1px solid #E5E7EB" : "1px solid #E5E7EB",
      borderLeft:`4px solid ${isCancelled?"#C7C7CC":s.is_group_event?"#5B6EF5":"#3ECFBF"}`,
      padding:"14px 16px", opacity: dimmed ? 0.6 : 1,
      boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>

      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:8 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:20 }}>{typeMeta.icon}</span>
          <div>
            <p style={{ fontSize:14, fontWeight:800, color:"#1E1E1E", lineHeight:1.2 }}>
              {s.title || typeMeta.label}
            </p>
            <p style={{ fontSize:12, color:"#8E8E93", marginTop:2 }}>
              {fmtDisplay(s.scheduled_date)} · {fmtTime(s.scheduled_time)} · {s.duration_minutes}m
            </p>
          </div>
        </div>
        {!isCancelled && (
          <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20,
            background:attMeta.bg, color:attMeta.color }}>
            {attMeta.label}
          </span>
        )}
        {isCancelled && <span style={{ fontSize:11, fontWeight:700, color:"#8E8E93" }}>Cancelled</span>}
      </div>

      {mode === "counselor" && !s.is_group_event && (
        <p style={{ fontSize:12, color:"#5A5A5A", marginBottom:8 }}>
          <User style={{ width:12, height:12, display:"inline", marginRight:4 }}/>{handle}
        </p>
      )}
      {s.is_group_event && s.group_participant_emails?.length > 0 && (
        <p style={{ fontSize:12, color:"#5A5A5A", marginBottom:8 }}>
          <Users style={{ width:12, height:12, display:"inline", marginRight:4 }}/>
          {s.group_participant_emails.length} participants
        </p>
      )}

      {s.reschedule_note && s.attendance_status === "reschedule_requested" && (
        <div style={{ background:"rgba(245,158,11,0.08)", border:"1px solid rgba(245,158,11,0.2)",
          borderRadius:10, padding:"8px 12px", marginBottom:8 }}>
          <p style={{ fontSize:11, fontWeight:700, color:"#D97706", marginBottom:2 }}>Patient note:</p>
          <p style={{ fontSize:13, color:"#92400E" }}>{s.reschedule_note}</p>
        </div>
      )}

      {s.notes && <p style={{ fontSize:12, color:"#8E8E93", marginBottom:10, lineHeight:1.5 }}>{s.notes}</p>}

      {/* Actions */}
      {!isCancelled && mode === "counselor" && (
        <div style={{ display:"flex", gap:8, marginTop:6 }}>
          {s.meeting_url && (
            <a href={s.meeting_url} target="_blank" rel="noopener noreferrer" style={{ flex:1 }}>
              <button style={{ width:"100%", padding:"8px", borderRadius:10, border:"none", cursor:"pointer",
                background:"rgba(62,207,191,0.1)", color:"#0E9F96", fontWeight:700, fontSize:12 }}>
                🔗 Join
              </button>
            </a>
          )}
          <button onClick={()=>onCancel(s.id)} style={{ flex:1, padding:"8px", borderRadius:10, border:"none",
            cursor:"pointer", background:"rgba(239,68,68,0.07)", color:"#EF4444", fontWeight:700, fontSize:12,
            display:"flex", alignItems:"center", justifyContent:"center", gap:4 }}>
            <Trash2 style={{width:12,height:12}}/> Cancel
          </button>
        </div>
      )}

      {/* Patient actions */}
      {!isCancelled && mode === "patient" && s.attendance_status !== "confirmed" && (
        <div style={{ marginTop:8 }}>
          {!showReschedule ? (
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={()=>onConfirm(s.id)} style={{ flex:1, padding:"10px", borderRadius:10,
                border:"none", cursor:"pointer", background:"rgba(16,185,129,0.1)", color:"#059669",
                fontWeight:800, fontSize:13, display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}>
                <Check style={{width:14,height:14}}/> Confirm
              </button>
              <button onClick={()=>setShowReschedule(true)} style={{ flex:1, padding:"10px", borderRadius:10,
                border:"none", cursor:"pointer", background:"rgba(245,158,11,0.1)", color:"#D97706",
                fontWeight:700, fontSize:13, display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}>
                <RotateCcw style={{width:13,height:13}}/> Reschedule
              </button>
            </div>
          ) : (
            <div>
              <textarea value={rescheduleNote} onChange={e=>setRescheduleNote(e.target.value)}
                placeholder="Let your counselor know when you're available or why you need to reschedule…"
                rows={3} style={{ width:"100%", padding:"10px 12px", borderRadius:10,
                  border:"1px solid #E5E7EB", fontSize:13, marginBottom:8, resize:"none",
                  outline:"none", boxSizing:"border-box" }}/>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={()=>setShowReschedule(false)} style={{ flex:1, padding:"9px", borderRadius:10,
                  border:"1px solid #E5E7EB", cursor:"pointer", background:"#fff", color:"#5A5A5A",
                  fontWeight:600, fontSize:12 }}>Back</button>
                <button onClick={()=>{ onReschedule(s.id, rescheduleNote); setShowReschedule(false); }}
                  style={{ flex:2, padding:"9px", borderRadius:10, border:"none", cursor:"pointer",
                    background:"rgba(245,158,11,0.12)", color:"#D97706", fontWeight:800, fontSize:13 }}>
                  Send Request
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      {!isCancelled && mode === "patient" && s.attendance_status === "confirmed" && (
        <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:8 }}>
          <Check style={{ width:14, height:14, color:"#10B981" }}/>
          <p style={{ fontSize:12, fontWeight:700, color:"#10B981" }}>You confirmed attendance</p>
        </div>
      )}
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div style={{ marginBottom:14 }}>
      <p style={{ fontSize:12, fontWeight:700, color:"#5A5A5A", textTransform:"uppercase",
        letterSpacing:".07em", marginBottom:8 }}>{label}</p>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type="text" }) {
  return (
    <input type={type} value={value||""} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      style={{ width:"100%", padding:"12px 14px", borderRadius:12, border:"1px solid #E5E7EB",
        fontSize:14, color:"#1E1E1E", background:"#F7F7F8", outline:"none", boxSizing:"border-box" }}/>
  );
}