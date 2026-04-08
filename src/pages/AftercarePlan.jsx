import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2, Circle, ArrowLeft, ClipboardList, TrendingUp,
  Plus, X, Loader2, Trash2, Calendar, Flame
} from "lucide-react";

const C = {
  teal:    "#2DD4BF",
  indigo:  "#6366F1",
  purple:  "#8B5CF6",
  emerald: "#10B981",
  amber:   "#F59E0B",
  red:     "#EF4444",
  gold:    "#C9A96E",
  muted:   "rgba(241,245,249,0.4)",
};

// Phases relative to discharge date
const PHASES = [
  { key: "phase1", label: "First 90 Days",  range: "Days 1–90",    emoji: "🌱", color: C.teal,   days: [1, 90]   },
  { key: "phase2", label: "Days 91–365",    range: "Months 4–12",  emoji: "📈", color: C.amber,  days: [91, 365] },
  { key: "phase3", label: "Year 2 & Beyond",range: "Long-term",    emoji: "🚀", color: C.purple, days: [366, Infinity] },
];

const GOAL_CATEGORIES = [
  { key: "recovery",      icon: "🌱", label: "Recovery"      },
  { key: "housing",       icon: "🏠", label: "Housing"       },
  { key: "employment",    icon: "💼", label: "Employment"    },
  { key: "health",        icon: "❤️", label: "Health"        },
  { key: "relationships", icon: "🤝", label: "Relationships" },
  { key: "legal",         icon: "⚖️", label: "Legal"         },
  { key: "financial",     icon: "💰", label: "Financial"     },
  { key: "education",     icon: "📚", label: "Education"     },
  { key: "other",         icon: "📌", label: "Other"         },
];

const catMap = Object.fromEntries(GOAL_CATEGORIES.map(c => [c.key, c]));

function daysSince(dateStr) {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.max(1, Math.floor(diff / 86400000) + 1);
}

function getActivePhase(dayCount) {
  if (!dayCount) return "phase1";
  if (dayCount <= 90)  return "phase1";
  if (dayCount <= 365) return "phase2";
  return "phase3";
}

// ── Sub-components ─────────────────────────────────────────────────────────

function DischargeSetup({ onSave, saving }) {
  const [date, setDate] = useState("");
  return (
    <div style={{ padding: "48px 24px", textAlign: "center" }}>
      <div style={{ width: 60, height: 60, borderRadius: 20, margin: "0 auto 16px",
        background: "rgba(99,102,241,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Calendar style={{ color: "#818CF8", width: 26, height: 26 }} />
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 900, color: "#fff", marginBottom: 8 }}>When did you discharge?</h2>
      <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.65, marginBottom: 28, maxWidth: 300, margin: "0 auto 28px" }}>
        Your aftercare plan starts from your discharge date. We'll track your progress day by day.
      </p>
      <input
        type="date"
        value={date}
        max={new Date().toISOString().split("T")[0]}
        onChange={e => setDate(e.target.value)}
        style={{
          width: "100%", padding: "14px 16px", borderRadius: 14, border: "none", boxSizing: "border-box",
          background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.15)",
          color: "#fff", fontSize: 16, outline: "none", marginBottom: 16,
          colorScheme: "dark",
        }}
      />
      <button
        onClick={() => date && onSave(date)}
        disabled={!date || saving}
        style={{
          width: "100%", padding: "15px", borderRadius: 14, border: "none",
          cursor: date ? "pointer" : "not-allowed",
          background: date ? `linear-gradient(135deg,${C.indigo},${C.purple})` : "rgba(255,255,255,0.07)",
          color: date ? "#fff" : C.muted, fontWeight: 800, fontSize: 15,
          boxShadow: date ? "0 6px 24px rgba(99,102,241,0.3)" : "none",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}
      >
        {saving ? <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" /> : null}
        {saving ? "Setting up…" : "Start My Aftercare Plan →"}
      </button>
    </div>
  );
}

function MilestoneItem({ milestone, onToggle, onDelete, disabled }) {
  const cat = catMap[milestone.category] || { icon: "📌", label: milestone.category };
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px", borderRadius: 16,
      background: milestone.completed ? "rgba(16,185,129,0.07)" : "rgba(255,255,255,0.04)",
      border: `1.5px solid ${milestone.completed ? "rgba(16,185,129,0.25)" : "rgba(255,255,255,0.08)"}`,
      transition: "all 0.2s ease",
    }}>
      <button onClick={() => !disabled && onToggle(milestone)} disabled={disabled}
        style={{ background: "none", border: "none", cursor: "pointer", padding: 0, marginTop: 2, flexShrink: 0 }}>
        {milestone.completed
          ? <CheckCircle2 style={{ color: C.emerald, width: 20, height: 20 }} />
          : <Circle style={{ color: "rgba(255,255,255,0.2)", width: 20, height: 20 }} />
        }
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
          <span style={{ fontSize: 13 }}>{cat.icon}</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: ".06em" }}>
            {cat.label}
          </span>
        </div>
        <p style={{
          fontSize: 14, fontWeight: 600, lineHeight: 1.45,
          color: milestone.completed ? "rgba(16,185,129,0.8)" : "#fff",
          textDecoration: milestone.completed ? "line-through" : "none",
          opacity: milestone.completed ? 0.7 : 1,
        }}>
          {milestone.milestone_text}
        </p>
        {milestone.completed && milestone.completed_date && (
          <p style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
            ✓ {new Date(milestone.completed_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </p>
        )}
      </div>
      <button onClick={() => onDelete(milestone)} disabled={disabled}
        style={{ background: "none", border: "none", cursor: "pointer", padding: 4,
          flexShrink: 0, color: "rgba(255,255,255,0.15)", marginTop: -2 }}>
        <Trash2 style={{ width: 15, height: 15 }} />
      </button>
    </div>
  );
}

function AddMilestoneForm({ activePhase, onSave, saving }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ text: "", category: "recovery", phase: activePhase });

  useEffect(() => { setForm(f => ({ ...f, phase: activePhase })); }, [activePhase]);

  const handleSave = () => {
    if (!form.text.trim()) return;
    onSave(form, () => {
      setForm({ text: "", category: "recovery", phase: activePhase });
      setOpen(false);
    });
  };

  if (!open) return (
    <button onClick={() => setOpen(true)} style={{
      width: "100%", padding: "13px", borderRadius: 14, border: "none", cursor: "pointer",
      background: "rgba(99,102,241,0.08)", border: "1.5px dashed rgba(99,102,241,0.3)",
      color: "#818CF8", fontWeight: 700, fontSize: 14,
      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    }}>
      <Plus style={{ width: 16, height: 16 }} /> Add a milestone
    </button>
  );

  return (
    <div style={{ borderRadius: 18, padding: "18px 16px", marginBottom: 4,
      background: "rgba(99,102,241,0.07)", border: "1.5px solid rgba(99,102,241,0.25)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <p style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>New Milestone</p>
        <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, padding: 0 }}>
          <X style={{ width: 16, height: 16 }} />
        </button>
      </div>

      <textarea
        value={form.text}
        onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
        placeholder="Write your goal or step… e.g. Attend 3 AA meetings per week"
        rows={3}
        style={{
          width: "100%", padding: "12px 14px", borderRadius: 12, boxSizing: "border-box",
          background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
          color: "#fff", fontSize: 14, resize: "none", outline: "none",
          fontFamily: "inherit", lineHeight: 1.6, marginBottom: 12,
        }}
      />

      <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: ".06em" }}>Category</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
        {GOAL_CATEGORIES.map(cat => {
          const sel = form.category === cat.key;
          return (
            <button key={cat.key} onClick={() => setForm(f => ({ ...f, category: cat.key }))} style={{
              padding: "6px 12px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 12,
              background: sel ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.05)",
              border: `1px solid ${sel ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.08)"}`,
              color: sel ? "#818CF8" : C.muted, fontWeight: sel ? 700 : 500,
            }}>{cat.icon} {cat.label}</button>
          );
        })}
      </div>

      <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: ".06em" }}>Phase</p>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {PHASES.map(p => {
          const sel = form.phase === p.key;
          return (
            <button key={p.key} onClick={() => setForm(f => ({ ...f, phase: p.key }))} style={{
              flex: 1, padding: "9px 6px", borderRadius: 12, border: "none", cursor: "pointer",
              background: sel ? `${p.color}18` : "rgba(255,255,255,0.04)",
              border: `1.5px solid ${sel ? `${p.color}50` : "rgba(255,255,255,0.08)"}`,
              color: sel ? p.color : C.muted, fontWeight: sel ? 700 : 500, fontSize: 10, lineHeight: 1.4,
            }}>{p.emoji}<br />{p.label}</button>
          );
        })}
      </div>

      <button onClick={handleSave} disabled={!form.text.trim() || saving} style={{
        width: "100%", padding: "13px", borderRadius: 13, border: "none",
        cursor: form.text.trim() ? "pointer" : "not-allowed",
        background: form.text.trim() ? `linear-gradient(135deg,${C.indigo},${C.purple})` : "rgba(255,255,255,0.07)",
        color: form.text.trim() ? "#fff" : C.muted, fontWeight: 800, fontSize: 14,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        boxShadow: form.text.trim() ? "0 6px 20px rgba(99,102,241,0.3)" : "none",
      }}>
        {saving ? <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" /> : <Plus style={{ width: 16, height: 16 }} />}
        {saving ? "Saving…" : "Save Milestone"}
      </button>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function AftercarePlan() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: plans = [], isLoading: planLoading } = useQuery({
    queryKey: ["aftercare-plan", user?.email],
    queryFn: () => base44.entities.ForwardPlan.filter({ participant_email: user.email }, "-created_date", 1),
    enabled: !!user?.email,
  });

  const plan = plans[0];
  const dayCount = daysSince(plan?.discharge_date);
  const currentPhase = getActivePhase(dayCount);
  const [activePhase, setActivePhase] = useState(null);

  useEffect(() => {
    if (plan && !activePhase) setActivePhase(currentPhase);
  }, [plan, currentPhase]);

  const { data: milestones = [], isLoading: msLoading } = useQuery({
    queryKey: ["aftercare-milestones", plan?.id],
    queryFn: () => base44.entities.ForwardPlanMilestone.filter({ forward_plan_id: plan.id }, "sort_order"),
    enabled: !!plan?.id,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["aftercare-milestones"] });
    qc.invalidateQueries({ queryKey: ["aftercare-plan"] });
    qc.invalidateQueries({ queryKey: ["forward-milestones-home"] });
    qc.invalidateQueries({ queryKey: ["forward-plan-home"] });
  };

  const createPlanMutation = useMutation({
    mutationFn: async (dischargeDate) => {
      await base44.entities.ForwardPlan.create({
        participant_email: user.email,
        title: "My Aftercare Plan",
        discharge_date: dischargeDate,
        overall_completion_percentage: 0,
      });
    },
    onSuccess: () => { invalidate(); },
  });

  const toggleMutation = useMutation({
    mutationFn: async (milestone) => {
      const nowDone = !milestone.completed;
      await base44.entities.ForwardPlanMilestone.update(milestone.id, {
        completed: nowDone,
        completed_date: nowDone ? new Date().toISOString() : null,
      });
      const updated = milestones.map(m => m.id === milestone.id ? { ...m, completed: nowDone } : m);
      const pct = updated.length ? Math.round((updated.filter(m => m.completed).length / updated.length) * 100) : 0;
      await base44.entities.ForwardPlan.update(plan.id, { overall_completion_percentage: pct });
    },
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (milestone) => base44.entities.ForwardPlanMilestone.delete(milestone.id),
    onSuccess: invalidate,
  });

  const addMutation = useMutation({
    mutationFn: async ({ form, planId }) => {
      await base44.entities.ForwardPlanMilestone.create({
        participant_email: user.email,
        forward_plan_id: planId,
        category: form.category,
        timeline: form.phase, // store phase in timeline field
        milestone_text: form.text.trim(),
        sort_order: milestones.length,
        completed: false,
      });
    },
    onSuccess: invalidate,
  });

  const handleAddMilestone = (form, onDone) => {
    addMutation.mutate({ form, planId: plan.id }, { onSuccess: onDone });
  };

  const isLoading = planLoading || msLoading;
  const isSaving = addMutation.isPending || createPlanMutation.isPending;
  const phase = activePhase || "phase1";
  const visibleMilestones = milestones.filter(m => m.timeline === phase);
  const donePct = milestones.length > 0 ? Math.round((milestones.filter(m => m.completed).length / milestones.length) * 100) : 0;
  const sectionDone = visibleMilestones.filter(m => m.completed).length;
  const activePhaseInfo = PHASES.find(p => p.key === phase);

  // ── No plan yet: ask for discharge date ──
  if (!isLoading && !plan) {
    return (
      <div style={{ background: "linear-gradient(170deg,#07090F 0%,#0A0F1A 100%)", minHeight: "100vh" }}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <div style={{ padding: "56px 20px 0" }}>
            <button onClick={() => navigate("/")} style={{ display: "flex", alignItems: "center", gap: 6,
              background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 13,
              marginBottom: 24, padding: 0, fontWeight: 600 }}>
              <ArrowLeft style={{ width: 15, height: 15 }} /> Back to Home
            </button>
          </div>
          <DischargeSetup onSave={(d) => createPlanMutation.mutate(d)} saving={createPlanMutation.isPending} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "linear-gradient(170deg,#07090F 0%,#0A0F1A 100%)", minHeight: "100vh", paddingBottom: 110 }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ padding: "56px 20px 24px", background: "linear-gradient(155deg,#0D1028,#080E1C)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -60, right: -60, width: 260, height: 260, borderRadius: "50%",
            background: "radial-gradient(circle,rgba(99,102,241,0.1) 0%,transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <button onClick={() => navigate("/")} style={{ display: "flex", alignItems: "center", gap: 6,
              background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 13,
              marginBottom: 18, padding: 0, fontWeight: 600 }}>
              <ArrowLeft style={{ width: 15, height: 15 }} /> Back to Home
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ width: 46, height: 46, borderRadius: 15, flexShrink: 0,
                background: "rgba(99,102,241,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ClipboardList style={{ color: "#818CF8", width: 22, height: 22 }} />
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(129,140,248,0.7)", textTransform: "uppercase",
                  letterSpacing: ".1em", marginBottom: 2 }}>My Aftercare Plan</p>
                <h1 style={{ fontSize: 24, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}>
                  {plan?.title || "Treatment Checklist"}
                </h1>
              </div>
            </div>

            {/* Day counter */}
            {dayCount && (
              <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                <div style={{ flex: 1, borderRadius: 14, padding: "12px 16px",
                  background: "rgba(45,212,191,0.08)", border: "1px solid rgba(45,212,191,0.2)",
                  display: "flex", alignItems: "center", gap: 10 }}>
                  <Flame style={{ color: C.teal, width: 18, height: 18 }} />
                  <div>
                    <p style={{ fontSize: 26, fontWeight: 900, color: C.teal, lineHeight: 1 }}>{dayCount}</p>
                    <p style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>Days in recovery</p>
                  </div>
                </div>
                <div style={{ flex: 1, borderRadius: 14, padding: "12px 16px",
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <p style={{ fontSize: 11, color: C.muted, fontWeight: 600, marginBottom: 3 }}>Discharged</p>
                  <p style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>
                    {new Date(plan.discharge_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                  <p style={{ fontSize: 11, color: activePhaseInfo?.color, fontWeight: 700, marginTop: 2 }}>
                    {activePhaseInfo?.emoji} {activePhaseInfo?.label}
                  </p>
                </div>
              </div>
            )}

            {/* Overall progress */}
            {milestones.length > 0 && (
              <div style={{ borderRadius: 14, padding: "12px 16px",
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <TrendingUp style={{ color: "#818CF8", width: 14, height: 14 }} />
                    <p style={{ fontSize: 12, fontWeight: 700, color: "#818CF8" }}>Overall Progress</p>
                  </div>
                  <p style={{ fontSize: 18, fontWeight: 900, color: "#818CF8" }}>{donePct}%</p>
                </div>
                <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: 5, height: 7, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 5, width: `${donePct}%`,
                    background: "linear-gradient(90deg,#6366F1,#8B5CF6)",
                    transition: "width 0.8s ease",
                  }} />
                </div>
                <p style={{ fontSize: 11, color: C.muted, marginTop: 5 }}>
                  {milestones.filter(m => m.completed).length} of {milestones.length} milestones complete
                </p>
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: "0 16px" }}>

          {/* Phase tabs */}
          <div style={{ display: "flex", gap: 8, padding: "16px 0", overflowX: "auto" }}>
            {PHASES.map(p => {
              const sec = milestones.filter(m => m.timeline === p.key);
              const secDone = sec.filter(m => m.completed).length;
              const active = phase === p.key;
              const isCurrent = p.key === currentPhase;
              return (
                <button key={p.key} onClick={() => setActivePhase(p.key)} style={{
                  flexShrink: 0, padding: "10px 14px", borderRadius: 14, border: "none", cursor: "pointer",
                  background: active ? `${p.color}18` : "rgba(255,255,255,0.04)",
                  border: `1.5px solid ${active ? `${p.color}50` : isCurrent ? `${p.color}30` : "rgba(255,255,255,0.08)"}`,
                  transition: "all 0.2s ease", position: "relative",
                }}>
                  {isCurrent && !active && (
                    <div style={{ position: "absolute", top: 6, right: 6, width: 6, height: 6,
                      borderRadius: "50%", background: p.color }} />
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 14 }}>{p.emoji}</span>
                    <div style={{ textAlign: "left" }}>
                      <p style={{ fontSize: 11, fontWeight: 800, color: active ? p.color : "#fff", lineHeight: 1.2 }}>{p.label}</p>
                      <p style={{ fontSize: 10, color: C.muted, marginTop: 1 }}>{secDone}/{sec.length} done</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Milestones */}
          {!isLoading && (
            <>
              {visibleMilestones.length > 0 && (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "1px" }}>
                      {activePhaseInfo?.label} · {activePhaseInfo?.range}
                    </p>
                    <p style={{ fontSize: 12, fontWeight: 700,
                      color: sectionDone === visibleMilestones.length ? C.emerald : C.muted }}>
                      {sectionDone}/{visibleMilestones.length} complete
                    </p>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                    {visibleMilestones.map(m => (
                      <MilestoneItem
                        key={m.id} milestone={m}
                        onToggle={(ms) => toggleMutation.mutate(ms)}
                        onDelete={(ms) => deleteMutation.mutate(ms)}
                        disabled={toggleMutation.isPending || deleteMutation.isPending}
                      />
                    ))}
                  </div>

                  {sectionDone === visibleMilestones.length && visibleMilestones.length > 0 && (
                    <div style={{ textAlign: "center", padding: "14px", borderRadius: 14, marginBottom: 16,
                      background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
                      <p style={{ fontSize: 15, fontWeight: 800, color: C.emerald }}>
                        🏆 All {activePhaseInfo?.label} milestones complete!
                      </p>
                    </div>
                  )}
                </>
              )}

              {visibleMilestones.length === 0 && (
                <div style={{ textAlign: "center", padding: "28px 0 20px", color: C.muted }}>
                  <p style={{ fontSize: 14, marginBottom: 4 }}>No milestones for this phase yet.</p>
                  <p style={{ fontSize: 12 }}>Add your first goal below.</p>
                </div>
              )}

              <AddMilestoneForm activePhase={phase} onSave={handleAddMilestone} saving={isSaving} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}