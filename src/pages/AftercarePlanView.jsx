import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, CheckCircle2, Circle, ChevronDown, ChevronUp,
  Shield, AlertTriangle, Printer, Edit3, Download, Loader2
} from "lucide-react";

const C = {
  teal:    "#2DD4BF",
  indigo:  "#6366F1",
  purple:  "#8B5CF6",
  emerald: "#10B981",
  amber:   "#F59E0B",
  red:     "#EF4444",
  muted:   "rgba(241,245,249,0.4)",
};

const SECTION_CONFIG = [
  { key: "immediate_72h",       label: "🚨 First 72 Hours",                  color: C.red,     phase: "72h"   },
  { key: "week1_actions",       label: "📅 Week 1 Stabilization",            color: C.amber,   phase: "7day"  },
  { key: "weekly_commitments",  label: "🔁 Weekly Recovery Commitments",     color: C.teal,    phase: "7day"  },
  { key: "meeting_schedule",    label: "🤝 Meetings & Support Schedule",     color: C.indigo,  phase: "7day"  },
  { key: "legal_compliance",    label: "⚖️ Legal & Compliance Requirements", color: "#F472B6", phase: "7day"  },
  { key: "health_wellness",     label: "❤️ Health & Wellness Actions",       color: C.emerald, phase: "30day" },
  { key: "employment_education",label: "💼 Employment & Education",          color: C.amber,   phase: "30day" },
  { key: "housing_food_transport", label: "🏠 Housing, Food & Transport",    color: "#34D399", phase: "30day" },
  { key: "trigger_prevention",  label: "🛡️ Trigger & Relapse Prevention",   color: C.purple,  phase: "30day" },
  { key: "relapse_response_plan",label: "🆘 Relapse Response Plan",          color: C.red,     phase: "30day" },
  { key: "emergency_plan",      label: "📞 Emergency Action Plan",           color: "#F87171", phase: "30day" },
  { key: "goals_30day",         label: "🎯 30-Day Goals",                    color: C.teal,    phase: "30day" },
  { key: "milestones_90day",    label: "🚀 90-Day Milestones",              color: C.purple,  phase: "90day" },
  { key: "accountability_team", label: "👥 Accountability Team",            color: C.indigo,  phase: "90day" },
  { key: "support_resources",   label: "🌐 Support Resources",              color: C.emerald, phase: "90day" },
];

function PlanSection({ sectionKey, label, color, items, tasks, onToggleTask, planId, userEmail }) {
  const [open, setOpen] = useState(true);
  if (!items || items.length === 0) return null;

  return (
    <div style={{ marginBottom: 12 }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 16px", borderRadius: open ? "16px 16px 0 0" : 16,
        background: `${color}0C`, border: `1.5px solid ${color}30`,
        cursor: "pointer", borderBottom: open ? "none" : undefined,
      }}>
        <p style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{label}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, color, fontWeight: 700 }}>{items.length} items</span>
          {open
            ? <ChevronUp style={{ color, width: 16, height: 16 }} />
            : <ChevronDown style={{ color, width: 16, height: 16 }} />
          }
        </div>
      </button>

      {open && (
        <div style={{ borderRadius: "0 0 16px 16px", border: `1.5px solid ${color}30`,
          borderTop: "none", padding: "4px 0", background: "rgba(255,255,255,0.02)" }}>
          {items.map((item, i) => {
            const task = tasks.find(t => t.title === item && t.category_key === sectionKey);
            const done = task?.completion_status === "complete";
            return (
              <div key={i} onClick={() => onToggleTask(sectionKey, item, task, done)}
                style={{
                  display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 16px",
                  borderBottom: i < items.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                  cursor: "pointer", transition: "background 0.15s ease",
                  background: done ? "rgba(16,185,129,0.05)" : "transparent",
                }}>
                {done
                  ? <CheckCircle2 style={{ color: C.emerald, width: 18, height: 18, flexShrink: 0, marginTop: 1 }} />
                  : <Circle style={{ color: "rgba(255,255,255,0.2)", width: 18, height: 18, flexShrink: 0, marginTop: 1 }} />
                }
                <p style={{
                  fontSize: 13, lineHeight: 1.55, color: done ? "rgba(16,185,129,0.7)" : "rgba(255,255,255,0.75)",
                  textDecoration: done ? "line-through" : "none", fontWeight: 500,
                }}>
                  {item}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AftercarePlanView() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const planId = urlParams.get("planId");

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: plans = [], isLoading: planLoading } = useQuery({
    queryKey: ["aftercare-builder-plan", planId],
    queryFn: () => base44.entities.AftercareBuilderPlan.filter({ user_email: user.email }, "-created_date", 5),
    enabled: !!user?.email,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["aftercare-builder-tasks", planId],
    queryFn: () => base44.entities.AftercareBuilderTask.filter({ plan_id: planId }),
    enabled: !!planId,
  });

  const plan = planId ? plans.find(p => p.id === planId) : plans[0];
  const generated = plan?.generated_plan_json;

  const toggleTask = useMutation({
    mutationFn: async ({ sectionKey, item, task, currentlyDone }) => {
      if (task) {
        await base44.entities.AftercareBuilderTask.update(task.id, {
          completion_status: currentlyDone ? "pending" : "complete",
        });
      } else {
        await base44.entities.AftercareBuilderTask.create({
          plan_id: plan.id,
          user_email: user.email,
          title: item,
          category: "recovery",
          category_key: sectionKey,
          completion_status: "complete",
        });
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["aftercare-builder-tasks"] }),
  });

  const handleToggle = (sectionKey, item, task, done) => {
    toggleTask.mutate({ sectionKey, item, task, currentlyDone: done });
  };

  const allItems = generated
    ? SECTION_CONFIG.flatMap(s => generated[s.key] || [])
    : [];
  const completedCount = tasks.filter(t => t.completion_status === "complete").length;
  const totalCount = allItems.length;
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (planLoading) return (
    <div style={{ background: "#07090F", minHeight: "100vh", display: "flex",
      alignItems: "center", justifyContent: "center" }}>
      <Loader2 style={{ color: C.teal, width: 28, height: 28 }} className="animate-spin" />
    </div>
  );

  if (!plan || !generated) return (
    <div style={{ background: "#07090F", minHeight: "100vh", display: "flex",
      flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <p style={{ fontSize: 48, marginBottom: 12 }}>📋</p>
      <h2 style={{ fontSize: 20, fontWeight: 900, color: "#fff", marginBottom: 8 }}>No plan found</h2>
      <p style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>Create a new aftercare plan to get started.</p>
      <button onClick={() => navigate("/AftercarePlanBuilder")} style={{
        padding: "14px 28px", borderRadius: 14, border: "none", cursor: "pointer",
        background: `linear-gradient(135deg,${C.indigo},${C.purple})`,
        color: "#fff", fontWeight: 800, fontSize: 15,
      }}>Build My Plan →</button>
    </div>
  );

  return (
    <div style={{ background: "linear-gradient(170deg,#07090F 0%,#0A0F1A 100%)", minHeight: "100vh", paddingBottom: 110 }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ padding: "56px 20px 24px", background: "linear-gradient(155deg,#0D1028,#080E1C)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -80, right: -60, width: 280, height: 280, borderRadius: "50%",
            background: "radial-gradient(circle,rgba(99,102,241,0.1) 0%,transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <button onClick={() => navigate("/")} style={{ display: "flex", alignItems: "center", gap: 6,
              background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 13,
              marginBottom: 18, padding: 0, fontWeight: 600 }}>
              <ArrowLeft style={{ width: 15, height: 15 }} /> Home
            </button>

            {/* Disclaimer badge */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px",
              borderRadius: 20, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)",
              marginBottom: 14 }}>
              <Shield style={{ color: C.amber, width: 12, height: 12 }} />
              <p style={{ fontSize: 10, fontWeight: 800, color: C.amber, textTransform: "uppercase", letterSpacing: ".08em" }}>
                Sample Plan – Requires Counselor Review
              </p>
            </div>

            <h1 style={{ fontSize: 22, fontWeight: 900, color: "#fff", lineHeight: 1.2, marginBottom: 6 }}>
              {generated.title || "My Aftercare Plan"}
            </h1>
            <p style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>
              Discharge: {plan.discharge_date ? new Date(plan.discharge_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "—"}
              {" · "}{plan.primary_substance?.replace(/_/g, " ")}
            </p>

            {/* Progress */}
            <div style={{ borderRadius: 14, padding: "12px 16px",
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: C.indigo }}>Plan Progress</p>
                <p style={{ fontSize: 16, fontWeight: 900, color: "#818CF8" }}>{pct}%</p>
              </div>
              <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: 4, height: 6, overflow: "hidden", marginBottom: 6 }}>
                <div style={{ height: "100%", borderRadius: 4, width: `${pct}%`,
                  background: "linear-gradient(90deg,#6366F1,#8B5CF6)", transition: "width 0.6s ease" }} />
              </div>
              <p style={{ fontSize: 11, color: C.muted }}>{completedCount} of {totalCount} items completed</p>
            </div>
          </div>
        </div>

        <div style={{ padding: "20px 16px" }}>

          {/* Participant snapshot */}
          {generated.participant_snapshot && (
            <div style={{ borderRadius: 18, padding: "18px 20px", marginBottom: 20,
              background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.2)" }}>
              <p style={{ fontSize: 11, fontWeight: 800, color: "#818CF8", textTransform: "uppercase",
                letterSpacing: ".1em", marginBottom: 8 }}>Your Snapshot</p>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.7,
                borderLeft: "3px solid rgba(99,102,241,0.5)", paddingLeft: 14, fontStyle: "italic" }}>
                {generated.participant_snapshot}
              </p>
            </div>
          )}

          {/* Plan sections */}
          {SECTION_CONFIG.map(s => (
            <PlanSection
              key={s.key}
              sectionKey={s.key}
              label={s.label}
              color={s.color}
              items={generated[s.key]}
              tasks={tasks}
              onToggleTask={handleToggle}
              planId={plan.id}
              userEmail={user?.email}
            />
          ))}

          {/* Counselor review note */}
          {generated.counselor_review_note && (
            <div style={{ borderRadius: 18, padding: "18px 20px", marginBottom: 20, marginTop: 8,
              background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)" }}>
              <p style={{ fontSize: 11, fontWeight: 800, color: C.amber, textTransform: "uppercase",
                letterSpacing: ".1em", marginBottom: 8 }}>📝 For Your Counselor</p>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.65 }}>
                {generated.counselor_review_note}
              </p>
            </div>
          )}

          {/* Status + actions */}
          <div style={{ borderRadius: 18, padding: "18px 20px", marginBottom: 20,
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <p style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase",
              letterSpacing: ".1em", marginBottom: 12 }}>Plan Status</p>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px",
              borderRadius: 20, marginBottom: 16,
              background: plan.status === "approved" ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)",
              border: `1px solid ${plan.status === "approved" ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.25)"}` }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%",
                background: plan.status === "approved" ? C.emerald : C.amber }} />
              <p style={{ fontSize: 12, fontWeight: 800,
                color: plan.status === "approved" ? C.emerald : C.amber, textTransform: "capitalize" }}>
                {plan.status?.replace("_", " ")}
              </p>
            </div>
            <button onClick={() => navigate("/AftercarePlanBuilder")} style={{
              width: "100%", padding: "13px", borderRadius: 13, border: "none", cursor: "pointer",
              background: `linear-gradient(135deg,${C.indigo},${C.purple})`,
              color: "#fff", fontWeight: 800, fontSize: 14,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
              <Edit3 style={{ width: 15, height: 15 }} /> Build a New Plan
            </button>
          </div>

          {/* Crisis strip */}
          <a href="tel:988" style={{ textDecoration: "none", display: "block",
            padding: "14px 16px", borderRadius: 14, textAlign: "center",
            background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
            <p style={{ fontSize: 13, fontWeight: 800, color: "#F87171" }}>
              🆘 In crisis? Call 988 · Text HOME to 741741
            </p>
          </a>
        </div>
      </div>
    </div>
  );
}