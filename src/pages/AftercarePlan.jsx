import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Circle, ArrowLeft, ClipboardList, TrendingUp, Plus, AlertCircle } from "lucide-react";

const C = {
  teal:    "#2DD4BF",
  indigo:  "#6366F1",
  purple:  "#8B5CF6",
  emerald: "#10B981",
  amber:   "#F59E0B",
  muted:   "rgba(241,245,249,0.4)",
};

const TIMELINES = [
  { key: "90_day", label: "Next 90 Days",   emoji: "🎯", color: C.teal   },
  { key: "1_year", label: "This Year",      emoji: "📅", color: C.amber  },
  { key: "3_year", label: "3-Year Vision",  emoji: "🚀", color: C.purple },
];

const GOAL_CATEGORIES = {
  housing:       { icon: "🏠", label: "Housing"       },
  employment:    { icon: "💼", label: "Employment"    },
  education:     { icon: "📚", label: "Education"     },
  financial:     { icon: "💰", label: "Financial"     },
  health:        { icon: "❤️", label: "Health"        },
  relationships: { icon: "🤝", label: "Relationships" },
  legal:         { icon: "⚖️", label: "Legal"         },
};

function MilestoneItem({ milestone, onToggle, disabled }) {
  const cat = GOAL_CATEGORIES[milestone.category] || { icon: "📌", label: milestone.category };
  return (
    <button
      onClick={() => !disabled && onToggle(milestone)}
      disabled={disabled}
      style={{
        display: "flex", alignItems: "flex-start", gap: 14, padding: "14px 16px",
        borderRadius: 16, border: "none", cursor: "pointer", textAlign: "left", width: "100%",
        background: milestone.completed ? "rgba(16,185,129,0.07)" : "rgba(255,255,255,0.04)",
        border: `1.5px solid ${milestone.completed ? "rgba(16,185,129,0.25)" : "rgba(255,255,255,0.08)"}`,
        transition: "all 0.2s ease",
      }}
    >
      <div style={{ marginTop: 2, flexShrink: 0 }}>
        {milestone.completed
          ? <CheckCircle2 style={{ color: C.emerald, width: 20, height: 20 }} />
          : <Circle style={{ color: "rgba(255,255,255,0.2)", width: 20, height: 20 }} />
        }
      </div>
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
            ✓ Completed {new Date(milestone.completed_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </p>
        )}
      </div>
    </button>
  );
}

export default function AftercarePlan() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [activeTimeline, setActiveTimeline] = useState("90_day");

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: plans = [], isLoading: planLoading } = useQuery({
    queryKey: ["aftercare-plan", user?.email],
    queryFn: () => base44.entities.ForwardPlan.filter({ participant_email: user.email }, "-created_date", 1),
    enabled: !!user?.email,
  });

  const plan = plans[0];

  const { data: milestones = [], isLoading: msLoading } = useQuery({
    queryKey: ["aftercare-milestones", plan?.id],
    queryFn: () => base44.entities.ForwardPlanMilestone.filter({ forward_plan_id: plan.id }, "sort_order"),
    enabled: !!plan?.id,
  });

  const toggleMutation = useMutation({
    mutationFn: async (milestone) => {
      const nowDone = !milestone.completed;
      await base44.entities.ForwardPlanMilestone.update(milestone.id, {
        completed: nowDone,
        completed_date: nowDone ? new Date().toISOString() : null,
      });
      // Update overall pct on plan
      const updated = milestones.map(m => m.id === milestone.id ? { ...m, completed: nowDone } : m);
      const done = updated.filter(m => m.completed).length;
      const pct = updated.length > 0 ? Math.round((done / updated.length) * 100) : 0;
      await base44.entities.ForwardPlan.update(plan.id, { overall_completion_percentage: pct });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["aftercare-milestones"] });
      qc.invalidateQueries({ queryKey: ["aftercare-plan"] });
      qc.invalidateQueries({ queryKey: ["forward-milestones-home"] });
      qc.invalidateQueries({ queryKey: ["forward-plan-home"] });
    },
  });

  const isLoading = planLoading || msLoading;
  const allDone = milestones.length > 0 && milestones.every(m => m.completed);
  const visibleMilestones = milestones.filter(m => m.timeline === activeTimeline);
  const donePct = milestones.length > 0 ? Math.round((milestones.filter(m => m.completed).length / milestones.length) * 100) : 0;
  const sectionDone = visibleMilestones.filter(m => m.completed).length;

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
                background: "rgba(99,102,241,0.15)", display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 0 20px rgba(99,102,241,0.2)" }}>
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

            {/* Overall progress */}
            {milestones.length > 0 && (
              <div style={{ borderRadius: 16, padding: "14px 16px",
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <TrendingUp style={{ color: "#818CF8", width: 14, height: 14 }} />
                    <p style={{ fontSize: 12, fontWeight: 700, color: "#818CF8" }}>Overall Progress</p>
                  </div>
                  <p style={{ fontSize: 20, fontWeight: 900, color: "#818CF8" }}>{donePct}%</p>
                </div>
                <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: 5, height: 8, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 5, width: `${donePct}%`,
                    background: "linear-gradient(90deg,#6366F1,#8B5CF6)",
                    boxShadow: "0 0 10px rgba(99,102,241,0.5)",
                    transition: "width 0.8s ease",
                  }} />
                </div>
                <p style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>
                  {milestones.filter(m => m.completed).length} of {milestones.length} milestones complete
                </p>
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: "0 16px" }}>

          {/* Timeline tabs */}
          <div style={{ display: "flex", gap: 8, padding: "16px 0", overflowX: "auto" }}>
            {TIMELINES.map(t => {
              const sec = milestones.filter(m => m.timeline === t.key);
              const secDone = sec.filter(m => m.completed).length;
              const active = activeTimeline === t.key;
              return (
                <button key={t.key} onClick={() => setActiveTimeline(t.key)} style={{
                  flexShrink: 0, padding: "10px 16px", borderRadius: 14, border: "none", cursor: "pointer",
                  background: active ? `${t.color}18` : "rgba(255,255,255,0.04)",
                  border: `1.5px solid ${active ? `${t.color}50` : "rgba(255,255,255,0.08)"}`,
                  transition: "all 0.2s ease",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 14 }}>{t.emoji}</span>
                    <div style={{ textAlign: "left" }}>
                      <p style={{ fontSize: 12, fontWeight: 800, color: active ? t.color : "#fff", lineHeight: 1.2 }}>{t.label}</p>
                      <p style={{ fontSize: 10, color: C.muted, marginTop: 1 }}>{secDone}/{sec.length} done</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* No plan state */}
          {!isLoading && !plan && (
            <div style={{ textAlign: "center", padding: "48px 24px" }}>
              <AlertCircle style={{ color: C.muted, width: 40, height: 40, margin: "0 auto 16px" }} />
              <p style={{ fontSize: 17, fontWeight: 800, color: "#fff", marginBottom: 8 }}>No Plan Set Up Yet</p>
              <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, marginBottom: 24 }}>
                Your aftercare plan will appear here once it's been created with your care team or through the plan builder.
              </p>
              <button onClick={() => navigate("/ForwardPlan")} style={{
                padding: "13px 28px", borderRadius: 14, border: "none", cursor: "pointer",
                background: `linear-gradient(135deg,${C.indigo},${C.purple})`,
                color: "#fff", fontWeight: 800, fontSize: 14,
                boxShadow: "0 6px 20px rgba(99,102,241,0.3)",
              }}>
                Build My Plan →
              </button>
            </div>
          )}

          {/* Milestones checklist */}
          {!isLoading && plan && (
            <>
              {visibleMilestones.length === 0 ? (
                <div style={{ textAlign: "center", padding: "36px 0", color: C.muted }}>
                  <p style={{ fontSize: 14 }}>No items in this timeframe yet.</p>
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "1px" }}>
                      {TIMELINES.find(t => t.key === activeTimeline)?.label}
                    </p>
                    <p style={{ fontSize: 12, fontWeight: 700,
                      color: sectionDone === visibleMilestones.length ? C.emerald : C.muted }}>
                      {sectionDone}/{visibleMilestones.length} complete
                    </p>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                    {visibleMilestones.map(m => (
                      <MilestoneItem
                        key={m.id}
                        milestone={m}
                        onToggle={(ms) => toggleMutation.mutate(ms)}
                        disabled={toggleMutation.isPending}
                      />
                    ))}
                  </div>

                  {sectionDone === visibleMilestones.length && visibleMilestones.length > 0 && (
                    <div style={{ textAlign: "center", padding: "16px", borderRadius: 14,
                      background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)",
                      marginBottom: 16 }}>
                      <p style={{ fontSize: 15, fontWeight: 800, color: C.emerald }}>
                        🏆 All {TIMELINES.find(t => t.key === activeTimeline)?.label} milestones complete!
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Edit plan link */}
              <button onClick={() => navigate("/ForwardPlan")} style={{
                width: "100%", padding: "13px", borderRadius: 14, border: "none", cursor: "pointer",
                background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)",
                color: "#818CF8", fontWeight: 700, fontSize: 14,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}>
                <Plus style={{ width: 16, height: 16 }} /> Add or Edit Milestones
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}