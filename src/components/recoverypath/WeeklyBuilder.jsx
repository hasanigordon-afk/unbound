import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Edit2, CheckCircle2, Loader2, X } from "lucide-react";

const C = { teal: "#2DD4BF", gold: "#C9A96E", emerald: "#10B981", amber: "#F59E0B", red: "#EF4444" };

const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const CATS = [
  { value: "recovery",         label: "Recovery",          emoji: "🔵" },
  { value: "wellness",         label: "Wellness",           emoji: "🟢" },
  { value: "responsibilities", label: "Responsibilities",   emoji: "🟡" },
  { value: "family",           label: "Family",             emoji: "🩷" },
  { value: "health",           label: "Health",             emoji: "🟠" },
  { value: "employment",       label: "Employment",         emoji: "💼" },
  { value: "legal_probation",  label: "Legal / Probation",  emoji: "⚖️" },
  { value: "personal_growth",  label: "Personal Growth",    emoji: "⭐" },
];
const PRIORITIES = [
  { value: "essential", label: "Essential — Must-Do" },
  { value: "high",      label: "High Priority" },
  { value: "normal",    label: "Normal" },
  { value: "optional",  label: "Optional Growth" },
];

const EMPTY_FORM = {
  title: "", category: "recovery", days_of_week: [1,2,3,4,5],
  preferred_time: "", recurrence: "weekly", priority: "normal",
  estimated_minutes: 30, notes: "", is_essential: false,
};

function TaskRow({ task, onEdit, onDelete }) {
  const cat = CATS.find(c => c.value === task.category) || CATS[0];
  const dayStr = task.days_of_week?.map(d => DAYS[d]).join(", ") || "—";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px",
      borderRadius: 14, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
      marginBottom: 8 }}>
      <span style={{ fontSize: 18, flexShrink: 0 }}>{cat.emoji}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 800, color: "#fff",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{task.title}</p>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
          {dayStr}{task.preferred_time ? ` · ${task.preferred_time}` : ""}{task.estimated_minutes ? ` · ${task.estimated_minutes}m` : ""}
        </p>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <button onClick={() => onEdit(task)} style={{ padding: "6px", borderRadius: 8,
          background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
          cursor: "pointer", color: "rgba(255,255,255,0.4)" }}>
          <Edit2 style={{ width: 13, height: 13 }} />
        </button>
        <button onClick={() => onDelete(task.id)} style={{ padding: "6px", borderRadius: 8,
          background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.15)",
          cursor: "pointer", color: C.red }}>
          <Trash2 style={{ width: 13, height: 13 }} />
        </button>
      </div>
    </div>
  );
}

function TaskForm({ initial, onSave, onCancel, loading }) {
  const [form, setForm] = useState(initial || { ...EMPTY_FORM });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleDay = (d) => {
    const days = form.days_of_week || [];
    set("days_of_week", days.includes(d) ? days.filter(x => x !== d) : [...days, d]);
  };

  return (
    <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 18, padding: "18px 16px", marginBottom: 16 }}>
      <div style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase",
          letterSpacing: ".07em", marginBottom: 6 }}>Task Title</p>
        <input value={form.title} onChange={e => set("title", e.target.value)}
          placeholder="e.g. Morning meditation, NA meeting, Job application…"
          style={{ width: "100%", padding: "11px 13px", borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.07)",
            color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase",
            letterSpacing: ".07em", marginBottom: 6 }}>Category</p>
          <select value={form.category} onChange={e => set("category", e.target.value)}
            style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)",
              background: "#1A2235", color: "#fff", fontSize: 13, outline: "none" }}>
            {CATS.map(c => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
          </select>
        </div>
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase",
            letterSpacing: ".07em", marginBottom: 6 }}>Priority</p>
          <select value={form.priority} onChange={e => set("priority", e.target.value)}
            style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)",
              background: "#1A2235", color: "#fff", fontSize: 13, outline: "none" }}>
            {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase",
          letterSpacing: ".07em", marginBottom: 8 }}>Days of the Week</p>
        <div style={{ display: "flex", gap: 6 }}>
          {DAYS.map((d, i) => {
            const sel = form.days_of_week?.includes(i);
            return (
              <button key={i} onClick={() => toggleDay(i)}
                style={{ flex: 1, padding: "8px 4px", borderRadius: 10, border: "none", cursor: "pointer",
                  background: sel ? C.teal : "rgba(255,255,255,0.06)",
                  color: sel ? "#07090F" : "rgba(255,255,255,0.4)",
                  fontWeight: sel ? 800 : 500, fontSize: 11 }}>{d}</button>
            );
          })}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase",
            letterSpacing: ".07em", marginBottom: 6 }}>Preferred Time</p>
          <input type="time" value={form.preferred_time} onChange={e => set("preferred_time", e.target.value)}
            style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.07)", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
        </div>
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase",
            letterSpacing: ".07em", marginBottom: 6 }}>Est. Minutes</p>
          <input type="number" value={form.estimated_minutes} onChange={e => set("estimated_minutes", Number(e.target.value))}
            min={5} max={240}
            style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.07)", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase",
          letterSpacing: ".07em", marginBottom: 6 }}>Notes (optional)</p>
        <input value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Any details or reminders for yourself…"
          style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.07)", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
      </div>

      <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginBottom: 14 }}>
        <input type="checkbox" checked={!!form.is_essential} onChange={e => set("is_essential", e.target.checked)}
          style={{ width: 15, height: 15 }} />
        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>Mark as Must-Do (top priority)</span>
      </label>

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => onSave(form)} disabled={!form.title.trim() || loading}
          style={{ flex: 1, padding: "12px", borderRadius: 12, border: "none", cursor: "pointer",
            background: form.title.trim() ? `linear-gradient(135deg,${C.teal},#22C5B0)` : "rgba(255,255,255,0.07)",
            color: form.title.trim() ? "#07090F" : "rgba(255,255,255,0.25)",
            fontWeight: 800, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          {loading ? <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" /> : <CheckCircle2 style={{ width: 14, height: 14 }} />}
          Save Task
        </button>
        <button onClick={onCancel}
          style={{ padding: "12px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)",
            background: "transparent", color: "rgba(255,255,255,0.35)", cursor: "pointer", fontSize: 13 }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function WeeklyBuilder({ user }) {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [activeDay, setActiveDay] = useState(new Date().getDay());

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["rp-tasks", user?.email],
    queryFn: () => base44.entities.RecoveryPathTask.filter({ user_email: user.email, is_active: true }),
    enabled: !!user?.email,
  });

  const saveMutation = useMutation({
    mutationFn: async (form) => {
      if (editTask?.id) {
        await base44.entities.RecoveryPathTask.update(editTask.id, { ...form, user_email: user.email });
      } else {
        await base44.entities.RecoveryPathTask.create({ ...form, user_email: user.email });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rp-tasks"] });
      setShowForm(false);
      setEditTask(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.RecoveryPathTask.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rp-tasks"] }),
  });

  const dayTasks = tasks.filter(t => t.days_of_week?.includes(activeDay) || t.recurrence === "daily");

  return (
    <div>
      {/* Day strip */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {DAYS.map((d, i) => {
          const count = tasks.filter(t => t.days_of_week?.includes(i) || t.recurrence === "daily").length;
          const isToday = i === new Date().getDay();
          const active = i === activeDay;
          return (
            <button key={i} onClick={() => setActiveDay(i)}
              style={{ flex: 1, padding: "10px 4px", borderRadius: 12, border: "none", cursor: "pointer",
                background: active ? C.teal : isToday ? "rgba(45,212,191,0.1)" : "rgba(255,255,255,0.04)",
                borderBottom: isToday && !active ? `2px solid ${C.teal}` : "none" }}>
              <p style={{ fontSize: 10, fontWeight: 800, color: active ? "#07090F" : "rgba(255,255,255,0.5)",
                textTransform: "uppercase", letterSpacing: ".05em" }}>{d}</p>
              {count > 0 && <p style={{ fontSize: 11, fontWeight: 900, color: active ? "#07090F" : C.teal, marginTop: 2 }}>{count}</p>}
            </button>
          );
        })}
      </div>

      {/* Add button */}
      {!showForm && !editTask && (
        <button onClick={() => setShowForm(true)}
          style={{ width: "100%", padding: "13px", borderRadius: 14, marginBottom: 16,
            background: "rgba(45,212,191,0.07)", border: "1px dashed rgba(45,212,191,0.3)",
            color: C.teal, fontWeight: 700, fontSize: 14, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <Plus style={{ width: 16, height: 16 }} /> Add Task to {DAYS[activeDay]}
        </button>
      )}

      {/* Form */}
      {(showForm || editTask) && (
        <TaskForm initial={editTask ? editTask : { ...EMPTY_FORM, days_of_week: [activeDay] }}
          onSave={form => saveMutation.mutate(form)}
          onCancel={() => { setShowForm(false); setEditTask(null); }}
          loading={saveMutation.isPending} />
      )}

      {/* Task list for selected day */}
      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 20 }}>
          <Loader2 style={{ color: C.teal, width: 20, height: 20 }} className="animate-spin" />
        </div>
      ) : dayTasks.length === 0 ? (
        <div style={{ borderRadius: 16, padding: "32px", textAlign: "center",
          background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.07)" }}>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)" }}>No tasks for {DAYS[activeDay]} yet.</p>
        </div>
      ) : (
        dayTasks.map(task => (
          <TaskRow key={task.id} task={task}
            onEdit={(t) => { setEditTask(t); setShowForm(false); }}
            onDelete={(id) => deleteMutation.mutate(id)} />
        ))
      )}

      {tasks.length > 0 && (
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", textAlign: "center", marginTop: 12 }}>
          {tasks.length} total tasks in your weekly plan
        </p>
      )}
    </div>
  );
}