import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { Plus, ChevronLeft, ChevronRight, CalendarDays, BarChart2, List, Edit2, Trash2, Loader2 } from "lucide-react";
import RoutineSheet from "@/components/mypath/RoutineSheet";
import WeeklyCalendar from "@/components/mypath/WeeklyCalendar";
import ProgressTracker from "@/components/mypath/ProgressTracker";
import { categoryInfo } from "@/components/mypath/RoutineSheet";

const C = {
  amber:   "#B8823A",
  red:     "#C9534F",
  muted:   "#9B8E83",
  text:    "#1C1410",
  bg:      "#F7F3EE",
  surface: "#FDFAF6",
  border:  "#E8E2D9",
};

const TABS = [
  { id: "week",     label: "This Week", icon: CalendarDays },
  { id: "progress", label: "Progress",  icon: BarChart2    },
  { id: "routines", label: "Routines",  icon: List         },
];

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function MyPath() {
  const qc = useQueryClient();
  const [tab, setTab] = useState("week");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [weekOffset, setWeekOffset] = useState(0);

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: routines = [], isLoading: rLoading } = useQuery({
    queryKey: ["my-path-routines", user?.email],
    queryFn: () => base44.entities.MyPathRoutine.filter({ user_email: user.email, is_active: true }, "sort_order", 100),
    enabled: !!user?.email,
  });

  const { data: logs = [] } = useQuery({
    queryKey: ["my-path-logs", user?.email],
    queryFn: () => base44.entities.MyPathLog.filter({ user_email: user.email }, "-log_date", 400),
    enabled: !!user?.email,
  });

  const saveMutation = useMutation({
    mutationFn: (form) => {
      const payload = { ...form, user_email: user.email };
      if (editing?.id) return base44.entities.MyPathRoutine.update(editing.id, payload);
      return base44.entities.MyPathRoutine.create(payload);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["my-path-routines"] }); setSheetOpen(false); setEditing(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.MyPathRoutine.update(id, { is_active: false }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-path-routines"] }),
  });

  const toggleLog = async (routine, dateStr, isDone) => {
    if (isDone) {
      const existing = logs.find(l => l.routine_id === routine.id && l.log_date === dateStr);
      if (existing) await base44.entities.MyPathLog.update(existing.id, { completed: false });
    } else {
      const existing = logs.find(l => l.routine_id === routine.id && l.log_date === dateStr);
      if (existing) { await base44.entities.MyPathLog.update(existing.id, { completed: true }); }
      else { await base44.entities.MyPathLog.create({ user_email: user.email, routine_id: routine.id, routine_title: routine.title, routine_category: routine.category, log_date: dateStr, completed: true }); }
    }
    qc.invalidateQueries({ queryKey: ["my-path-logs"] });
  };

  const openAdd = () => { setEditing(null); setSheetOpen(true); };
  const openEdit = (r) => { setEditing(r); setSheetOpen(true); };

  const today = new Date();
  const sun = new Date(today); sun.setDate(today.getDate() - today.getDay() + weekOffset * 7);
  const sat = new Date(sun); sat.setDate(sun.getDate() + 6);
  const weekLabel = weekOffset === 0 ? "This Week"
    : weekOffset === -1 ? "Last Week"
    : `${sun.toLocaleDateString("en", { month: "short", day: "numeric" })} – ${sat.toLocaleDateString("en", { month: "short", day: "numeric" })}`;

  return (
    <div style={{ background: C.bg, minHeight: "100vh", paddingBottom: 100 }}>
      <div style={{ maxWidth: 520, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "56px 24px 24px" }}>
          <Link to={createPageUrl("MyFoundation")} style={{ display: "inline-flex", alignItems: "center", gap: 6,
            color: C.muted, fontSize: 12, marginBottom: 16, textDecoration: "none", fontWeight: 600 }}>
            <ChevronLeft style={{ width: 15, height: 15 }} /> Back
          </Link>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(184,130,58,.12)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🗺️</div>
              <div>
                <h1 style={{ fontFamily: "'Lora', serif", fontSize: 24, fontWeight: 600, color: C.text, lineHeight: 1.1 }}>My Path</h1>
                <p style={{ fontSize: 12, color: C.muted }}>Your personal weekly roadmap</p>
              </div>
            </div>
            <button onClick={openAdd}
              style={{ width: 42, height: 42, borderRadius: 14, border: "none", cursor: "pointer",
                background: C.amber, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Plus style={{ color: "#fff", width: 18, height: 18 }} />
            </button>
          </div>

          {routines.length === 0 && !rLoading && (
            <div style={{ marginTop: 16, padding: "12px 16px", borderRadius: 12,
              background: "rgba(184,130,58,.07)", border: "1px solid rgba(184,130,58,.2)" }}>
              <p style={{ fontSize: 12, color: C.text, lineHeight: 1.6 }}>
                ✨ Think of My Path as a flexible personal roadmap — not strict rules. Add what matters to you and track your rhythm over time.
              </p>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, background: C.surface,
          position: "sticky", top: 0, zIndex: 20 }}>
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            return (
              <button key={id} onClick={() => setTab(id)}
                style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                  padding: "12px 4px", background: "none", border: "none", cursor: "pointer",
                  borderBottom: active ? `2px solid ${C.amber}` : "2px solid transparent",
                  color: active ? C.amber : C.muted,
                  fontSize: 10, fontWeight: active ? 700 : 500, letterSpacing: ".04em" }}>
                <Icon style={{ width: 16, height: 16 }} strokeWidth={active ? 2 : 1.5} />
                {label}
              </button>
            );
          })}
        </div>

        <div style={{ padding: "20px 16px" }}>

          {tab === "week" && (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <button onClick={() => setWeekOffset(w => w - 1)}
                  style={{ width: 34, height: 34, borderRadius: 10, border: `.5px solid ${C.border}`, cursor: "pointer",
                    background: C.surface, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ChevronLeft style={{ color: C.muted, width: 16, height: 16 }} />
                </button>
                <p style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{weekLabel}</p>
                <button onClick={() => setWeekOffset(w => Math.min(w + 1, 0))} disabled={weekOffset >= 0}
                  style={{ width: 34, height: 34, borderRadius: 10, border: `.5px solid ${C.border}`,
                    cursor: weekOffset >= 0 ? "not-allowed" : "pointer",
                    background: C.surface, display: "flex", alignItems: "center", justifyContent: "center",
                    opacity: weekOffset >= 0 ? 0.3 : 1 }}>
                  <ChevronRight style={{ color: C.muted, width: 16, height: 16 }} />
                </button>
              </div>

              {rLoading ? (
                <div style={{ textAlign: "center", padding: 40 }}>
                  <Loader2 style={{ color: C.amber, width: 28, height: 28, margin: "0 auto" }} className="animate-spin" />
                </div>
              ) : (
                <div style={{ background: C.surface, border: `.5px solid ${C.border}`, borderRadius: 16, padding: "16px 14px" }}>
                  <WeeklyCalendar routines={routines} logs={logs} onToggle={toggleLog} weekOffset={weekOffset} />
                </div>
              )}

              {routines.length === 0 && (
                <button onClick={openAdd} style={{ width: "100%", marginTop: 16, padding: "15px", borderRadius: 50,
                  border: `1.5px dashed rgba(184,130,58,.35)`, background: "rgba(184,130,58,.05)",
                  color: C.amber, fontWeight: 700, fontSize: 14, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <Plus style={{ width: 16, height: 16 }} /> Add your first routine
                </button>
              )}
            </>
          )}

          {tab === "progress" && <ProgressTracker routines={routines} logs={logs} />}

          {tab === "routines" && (
            <>
              <button onClick={openAdd}
                style={{ width: "100%", padding: "13px 20px", borderRadius: 50, border: "none", cursor: "pointer",
                  background: C.amber, color: "#fff", fontWeight: 700, fontSize: 14, marginBottom: 20,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <Plus style={{ width: 16, height: 16 }} /> Add New Routine
              </button>

              {rLoading ? (
                <div style={{ textAlign: "center", padding: 32 }}>
                  <Loader2 style={{ color: C.amber, width: 24, height: 24, margin: "0 auto" }} className="animate-spin" />
                </div>
              ) : routines.length === 0 ? (
                <div style={{ background: C.surface, border: `.5px solid ${C.border}`, borderRadius: 16, padding: "36px 24px", textAlign: "center" }}>
                  <p style={{ fontSize: 32, marginBottom: 10 }}>🗺️</p>
                  <p style={{ fontFamily: "'Lora', serif", fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 6 }}>No routines yet</p>
                  <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>
                    Start with one thing — a meeting, a walk, a call.<br />Build from there, at your own pace.
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {routines.map(r => {
                    const ci = categoryInfo(r.category);
                    return (
                      <div key={r.id} style={{ background: C.surface, border: `.5px solid ${C.border}`,
                        borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "flex-start", gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                          background: ci.color + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                          {ci.emoji}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4 }}>{r.title}</p>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                            <span style={{ fontSize: 10, fontWeight: 700, color: ci.color, background: ci.color + "12",
                              padding: "2px 8px", borderRadius: 20 }}>{ci.label}</span>
                            <span style={{ fontSize: 10, color: C.muted, fontWeight: 600 }}>
                              {(r.days_of_week || []).sort().map(d => DAYS_SHORT[d]).join(" · ")}
                            </span>
                          </div>
                          {r.notes && <p style={{ fontSize: 11, color: C.muted, marginTop: 5, lineHeight: 1.4 }}>{r.notes}</p>}
                        </div>
                        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                          <button onClick={() => openEdit(r)} style={{ background: "none", border: "none", cursor: "pointer", padding: 6 }}>
                            <Edit2 style={{ color: C.muted, width: 14, height: 14 }} />
                          </button>
                          <button onClick={() => deleteMutation.mutate(r.id)} disabled={deleteMutation.isPending}
                            style={{ background: "none", border: "none", cursor: "pointer", padding: 6 }}>
                            <Trash2 style={{ color: C.red, width: 14, height: 14, opacity: 0.5 }} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {sheetOpen && (
        <RoutineSheet routine={editing} onClose={() => { setSheetOpen(false); setEditing(null); }}
          onSave={(form) => saveMutation.mutate(form)} isSaving={saveMutation.isPending} />
      )}
    </div>
  );
}