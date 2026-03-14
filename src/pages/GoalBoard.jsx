import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { Plus, X, ArrowLeft, Loader2, Target, BookOpen } from "lucide-react";
import GoalCard from "@/components/goals/GoalCard";
import WeeklyReflectionSheet from "@/components/goals/WeeklyReflectionSheet";

const CATEGORIES = [
  { value:"recovery_milestone", label:"Recovery Milestone", emoji:"🌱", placeholder:"e.g. 30 days sober, 90-day chip…" },
  { value:"career",             label:"Career & Jobs",      emoji:"💼", placeholder:"e.g. Apply to 5 jobs this week…"  },
  { value:"housing",            label:"Housing",            emoji:"🏠", placeholder:"e.g. Save first/last month rent…" },
  { value:"health",             label:"Health",             emoji:"❤️", placeholder:"e.g. Walk 30 min daily…"          },
  { value:"relationships",      label:"Relationships",      emoji:"🤝", placeholder:"e.g. Call family once a week…"    },
  { value:"education",          label:"Education",          emoji:"📚", placeholder:"e.g. Complete GED by December…"   },
  { value:"financial",          label:"Finances",           emoji:"💰", placeholder:"e.g. Save $500 emergency fund…"   },
  { value:"daily_habits",       label:"Daily Habits",       emoji:"📅", placeholder:"e.g. Journal every morning…"      },
  { value:"legal",              label:"Legal",              emoji:"⚖️", placeholder:"e.g. Attend all court dates…"     },
  { value:"personal_growth",    label:"Personal Growth",    emoji:"🚀", placeholder:"e.g. Read one book a month…"      },
];

const QUICK_GOALS = [
  { title:"30-Day Sobriety",     category:"recovery_milestone", target_days:30,  description:"Stay substance-free for 30 consecutive days" },
  { title:"90-Day Milestone",    category:"recovery_milestone", target_days:90,  description:"Build strong recovery habits over 90 days" },
  { title:"1 Year Sober",        category:"recovery_milestone", target_days:365, description:"A full year of living in recovery" },
  { title:"Daily Check-In",      category:"daily_habits",       target_days:30,  description:"Complete a check-in every day for 30 days" },
  { title:"Weekly Meeting",      category:"daily_habits",       target_days:8,   description:"Attend at least one meeting every week for 8 weeks" },
  { title:"Job Search",          category:"career",             description:"Actively search and apply for employment" },
  { title:"Financial Stability", category:"financial",          description:"Build a 3-month emergency fund" },
];

const EMPTY_FORM = { title:"", category:"recovery_milestone", description:"", target_date:"",
  target_days:"", milestones:[] };

function fmt(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

export default function GoalBoard() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [showReflection, setShowReflection] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [milestoneDraft, setMilestoneDraft] = useState("");
  const [filterStatus, setFilterStatus] = useState("active");
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const { data: user } = useQuery({ queryKey:["user"], queryFn:() => base44.auth.me() });

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ["goals", user?.email],
    queryFn: () => base44.entities.Goal.filter({ participant_email: user.email }, "-created_date", 50),
    enabled: !!user?.email,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Goal.create({
      ...data,
      participant_email: user.email,
      status: "active",
      progress_percentage: 0,
      current_days: 0,
      streak: 0,
      checkin_dates: [],
      target_days: data.target_days ? parseInt(data.target_days) : undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(["goals"]);
      setShowCreate(false);
      setForm(EMPTY_FORM);
    },
  });

  const checkinMutation = useMutation({
    mutationFn: async (goal) => {
      const today = fmt(new Date());
      const dates = goal.checkin_dates || [];
      if (dates.includes(today)) return;
      const newDates = [...dates, today];
      const yesterday = fmt(new Date(Date.now() - 86400000));
      const newStreak = (goal.last_checkin_date === yesterday || goal.last_checkin_date === today)
        ? (goal.streak || 0) + 1 : 1;
      const newCurrentDays = (goal.current_days || 0) + 1;
      const newPct = goal.target_days
        ? Math.min(Math.round(newCurrentDays / goal.target_days * 100), 100)
        : Math.min((goal.progress_percentage || 0) + 5, 100);
      await base44.entities.Goal.update(goal.id, {
        checkin_dates: newDates,
        last_checkin_date: today,
        streak: newStreak,
        current_days: newCurrentDays,
        progress_percentage: newPct,
        status: newPct >= 100 ? "completed" : "active",
      });
    },
    onSuccess: () => queryClient.invalidateQueries(["goals"]),
  });

  const toggleMilestoneMutation = useMutation({
    mutationFn: async ({ goal, idx }) => {
      const milestones = [...(goal.milestones || [])];
      milestones[idx] = { ...milestones[idx], completed: !milestones[idx].completed };
      const completedCount = milestones.filter(m => m.completed).length;
      const pct = Math.round(completedCount / milestones.length * 100);
      return base44.entities.Goal.update(goal.id, {
        milestones,
        progress_percentage: pct,
        status: pct >= 100 ? "completed" : "active",
      });
    },
    onSuccess: () => queryClient.invalidateQueries(["goals"]),
  });

  const addMilestone = () => {
    if (!milestoneDraft.trim()) return;
    set("milestones", [...form.milestones, { title: milestoneDraft.trim(), completed: false }]);
    setMilestoneDraft("");
  };

  const fillQuickGoal = (qg) => {
    setForm({ ...EMPTY_FORM, ...qg, milestones: [] });
    setShowCreate(true);
  };

  const catMeta = CATEGORIES.find(c => c.value === form.category) || CATEGORIES[0];

  const filtered = goals.filter(g =>
    filterStatus === "all" ? true : g.status === filterStatus
  );

  const activeCount = goals.filter(g => g.status === "active").length;
  const completedCount = goals.filter(g => g.status === "completed").length;
  const totalCheckins = goals.reduce((s, g) => s + (g.checkin_dates?.length || 0), 0);

  return (
    <div style={{ minHeight:"100vh", paddingBottom:100,
      background:"linear-gradient(170deg,#070D1C 0%,#0B1424 55%,#080E1C 100%)" }}>

      {/* Header */}
      <div style={{ background:"linear-gradient(155deg,#0E1D3A 0%,#081426 100%)",
        padding:"56px 20px 0", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-50, right:-50, width:240, height:240, borderRadius:"50%",
          background:"radial-gradient(circle,rgba(62,207,191,0.09) 0%,transparent 70%)", pointerEvents:"none" }}/>
        <div style={{ position:"relative", zIndex:1 }}>
          <Link to={createPageUrl("Home")} style={{ textDecoration:"none", display:"inline-flex", alignItems:"center",
            gap:6, marginBottom:16, color:"#3ECFBF" }}>
            <ArrowLeft style={{ width:16, height:16 }}/>
            <span style={{ fontSize:13, fontWeight:700 }}>Home</span>
          </Link>
          <p style={{ fontSize:11, fontWeight:700, color:"rgba(62,207,191,0.8)",
            textTransform:"uppercase", letterSpacing:".1em", marginBottom:4 }}>Recovery Goals</p>
          <h1 style={{ fontSize:22, fontWeight:900, color:"#fff", marginBottom:20 }}>My Goal Board</h1>

          {/* Stats */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:20 }}>
            {[
              { value:activeCount,    label:"Active",     color:"#3ECFBF" },
              { value:completedCount, label:"Achieved",   color:"#10B981" },
              { value:totalCheckins,  label:"Check-Ins",  color:"#C9A96E" },
            ].map(s => (
              <div key={s.label} style={{ textAlign:"center", padding:"12px 8px", borderRadius:14,
                background:`rgba(255,255,255,0.05)`, border:"1px solid rgba(255,255,255,0.08)" }}>
                <p style={{ fontSize:24, fontWeight:900, color:s.color }}>{s.value}</p>
                <p style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.4)",
                  textTransform:"uppercase", letterSpacing:".06em", marginTop:3 }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Action strip */}
          <div style={{ display:"flex", gap:8, marginBottom:0, paddingBottom:20 }}>
            <button onClick={() => setShowCreate(true)} style={{
              flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:7,
              padding:"12px", borderRadius:14, border:"none", cursor:"pointer",
              background:"linear-gradient(135deg,#3ECFBF,#2CB8AE)", color:"#fff",
              fontWeight:800, fontSize:14, boxShadow:"0 6px 20px rgba(62,207,191,0.3)" }}>
              <Plus style={{ width:16, height:16 }}/> New Goal
            </button>
            <button onClick={() => setShowReflection(true)} style={{
              flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:7,
              padding:"12px", borderRadius:14, border:"1px solid rgba(255,255,255,0.15)",
              background:"rgba(255,255,255,0.06)", color:"rgba(255,255,255,0.8)",
              fontWeight:700, fontSize:14, cursor:"pointer" }}>
              <BookOpen style={{ width:16, height:16 }}/> Weekly Reflection
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding:"16px 16px" }}>
        {/* Quick-start goal chips */}
        {goals.length === 0 && !isLoading && (
          <div style={{ marginBottom:20 }}>
            <p style={{ fontSize:12, fontWeight:700, color:"rgba(255,255,255,0.4)",
              textTransform:"uppercase", letterSpacing:".09em", marginBottom:10 }}>
              Quick-Start Goals
            </p>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
              {QUICK_GOALS.map(qg => (
                <button key={qg.title} onClick={() => fillQuickGoal(qg)} style={{
                  padding:"8px 14px", borderRadius:20,
                  background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.12)",
                  color:"rgba(255,255,255,0.75)", fontSize:12, fontWeight:700, cursor:"pointer" }}>
                  {qg.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Filter tabs */}
        {goals.length > 0 && (
          <div style={{ display:"flex", gap:6, marginBottom:14 }}>
            {[{ v:"active", l:"Active" }, { v:"completed", l:"Achieved" }, { v:"all", l:"All" }].map(f => (
              <button key={f.v} onClick={() => setFilterStatus(f.v)} style={{
                padding:"7px 14px", borderRadius:10, border:"none", cursor:"pointer",
                fontSize:12, fontWeight:700,
                background: filterStatus===f.v ? "#fff" : "rgba(255,255,255,0.07)",
                color: filterStatus===f.v ? "#0E1D3A" : "rgba(255,255,255,0.5)" }}>
                {f.l}
              </button>
            ))}
          </div>
        )}

        {isLoading ? (
          <div style={{ textAlign:"center", padding:48 }}>
            <Loader2 className="animate-spin" style={{ width:28, height:28, color:"#3ECFBF", margin:"0 auto" }}/>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:"center", padding:"56px 20px",
            background:"rgba(255,255,255,0.04)", borderRadius:20, border:"1px solid rgba(255,255,255,0.08)" }}>
            <Target style={{ width:36, height:36, color:"rgba(255,255,255,0.2)", margin:"0 auto 12px", display:"block" }}/>
            <p style={{ fontSize:16, fontWeight:700, color:"rgba(255,255,255,0.6)", marginBottom:6 }}>
              {filterStatus === "active" ? "No active goals" : "No goals yet"}
            </p>
            <p style={{ fontSize:13, color:"rgba(255,255,255,0.3)", marginBottom:20 }}>
              Set your first recovery goal to start tracking progress.
            </p>
            <button onClick={() => setShowCreate(true)} style={{
              padding:"12px 24px", borderRadius:14, border:"none", cursor:"pointer",
              background:"linear-gradient(135deg,#3ECFBF,#2CB8AE)", color:"#fff",
              fontWeight:800, fontSize:14 }}>+ Add Your First Goal</button>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {filtered.map(g => (
              <GoalCard key={g.id} goal={g}
                onCheckin={checkinMutation.mutate}
                onToggleMilestone={(goal, idx) => toggleMilestoneMutation.mutate({ goal, idx })}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Goal Modal */}
      {showCreate && (
        <div style={{ position:"fixed", inset:0, zIndex:100, background:"rgba(0,0,0,0.6)",
          display:"flex", alignItems:"flex-end", justifyContent:"center" }}
          onClick={e => { if (e.target===e.currentTarget) setShowCreate(false); }}>
          <div style={{ width:"100%", maxWidth:480, background:"#fff",
            borderRadius:"24px 24px 0 0", maxHeight:"88vh", overflowY:"auto", paddingBottom:36 }}>

            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
              padding:"20px 20px 16px", borderBottom:"1px solid #F0F0F3",
              position:"sticky", top:0, background:"#fff", zIndex:1 }}>
              <h2 style={{ fontSize:18, fontWeight:900, color:"#1E1E1E" }}>New Goal</h2>
              <button onClick={() => setShowCreate(false)} style={{
                background:"#F0F0F3", border:"none", borderRadius:8, padding:8, cursor:"pointer" }}>
                <X style={{ width:16, height:16, color:"#5A5A5A" }}/>
              </button>
            </div>

            <div style={{ padding:"20px 20px" }}>
              {/* Category picker */}
              <Field label="Category">
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {CATEGORIES.map(c => (
                    <button key={c.value} onClick={() => set("category", c.value)} style={{
                      padding:"7px 12px", borderRadius:10, border:"1.5px solid",
                      borderColor: form.category===c.value ? "#3ECFBF" : "#E5E7EB",
                      background: form.category===c.value ? "rgba(62,207,191,0.08)" : "#F7F7F8",
                      color: form.category===c.value ? "#0E9F96" : "#5A5A5A",
                      fontSize:12, fontWeight:700, cursor:"pointer" }}>
                      {c.emoji} {c.label}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Goal Title">
                <input value={form.title} onChange={e=>set("title",e.target.value)}
                  placeholder={catMeta.placeholder}
                  style={{ width:"100%", padding:"12px 14px", borderRadius:12,
                    border:"1px solid #E5E7EB", fontSize:14, color:"#1E1E1E",
                    background:"#F7F7F8", outline:"none", boxSizing:"border-box" }}/>
              </Field>

              <Field label="Description (optional)">
                <textarea value={form.description} onChange={e=>set("description",e.target.value)}
                  placeholder="Why does this goal matter to you?" rows={2}
                  style={{ width:"100%", padding:"12px 14px", borderRadius:12,
                    border:"1px solid #E5E7EB", fontSize:14, color:"#1E1E1E",
                    background:"#F7F7F8", outline:"none", resize:"none", boxSizing:"border-box" }}/>
              </Field>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <Field label="Target Days (optional)">
                  <input type="number" value={form.target_days} onChange={e=>set("target_days",e.target.value)}
                    placeholder="e.g. 30, 90, 365"
                    style={{ width:"100%", padding:"12px 14px", borderRadius:12,
                      border:"1px solid #E5E7EB", fontSize:14, color:"#1E1E1E",
                      background:"#F7F7F8", outline:"none", boxSizing:"border-box" }}/>
                </Field>
                <Field label="Target Date (optional)">
                  <input type="date" value={form.target_date} onChange={e=>set("target_date",e.target.value)}
                    style={{ width:"100%", padding:"12px 14px", borderRadius:12,
                      border:"1px solid #E5E7EB", fontSize:14, color:"#1E1E1E",
                      background:"#F7F7F8", outline:"none", boxSizing:"border-box" }}/>
                </Field>
              </div>

              <Field label="Milestones (optional)">
                <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:8 }}>
                  {form.milestones.map((m,i) => (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:8,
                      background:"#F7F7F8", borderRadius:10, padding:"8px 12px" }}>
                      <span style={{ fontSize:13, color:"#1E1E1E", flex:1 }}>{m.title}</span>
                      <button onClick={() => set("milestones", form.milestones.filter((_,idx)=>idx!==i))}
                        style={{ background:"none", border:"none", cursor:"pointer", color:"#EF4444", fontSize:14 }}>✕</button>
                    </div>
                  ))}
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <input value={milestoneDraft} onChange={e=>setMilestoneDraft(e.target.value)}
                    placeholder="Add a milestone step…"
                    onKeyDown={e=>e.key==="Enter"&&addMilestone()}
                    style={{ flex:1, padding:"10px 12px", borderRadius:10, border:"1px solid #E5E7EB",
                      fontSize:13, color:"#1E1E1E", background:"#F7F7F8", outline:"none" }}/>
                  <button onClick={addMilestone} style={{
                    padding:"10px 16px", borderRadius:10, border:"none", cursor:"pointer",
                    background:"rgba(62,207,191,0.1)", color:"#0E9F96", fontWeight:700, fontSize:13 }}>
                    Add
                  </button>
                </div>
              </Field>

              <button onClick={() => createMutation.mutate(form)}
                disabled={createMutation.isPending || !form.title.trim()}
                style={{ width:"100%", padding:"15px", borderRadius:14, border:"none", cursor:"pointer",
                  background: form.title.trim() ? "linear-gradient(135deg,#3ECFBF,#2CB8AE)" : "#E5E7EB",
                  color:"#fff", fontWeight:800, fontSize:15, display:"flex", alignItems:"center",
                  justifyContent:"center", gap:8 }}>
                {createMutation.isPending
                  ? <Loader2 className="animate-spin" style={{width:18,height:18}}/>
                  : "Create Goal →"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showReflection && user && (
        <WeeklyReflectionSheet
          participantEmail={user.email}
          onClose={() => setShowReflection(false)}
        />
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom:14 }}>
      <p style={{ fontSize:12, fontWeight:700, color:"#5A5A5A", textTransform:"uppercase",
        letterSpacing:".07em", marginBottom:8 }}>{label}</p>
      {children}
    </div>
  );
}