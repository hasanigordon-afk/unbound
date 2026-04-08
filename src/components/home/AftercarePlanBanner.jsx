import React from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { ClipboardList, ArrowRight, CheckCircle2, Circle } from "lucide-react";

export default function AftercarePlanBanner({ user }) {
  const navigate = useNavigate();
  const { data: plans = [] } = useQuery({
    queryKey: ["forward-plan-home", user?.email],
    queryFn: () => base44.entities.ForwardPlan.filter({ user_email: user.email }, "-created_date", 1),
    enabled: !!user?.email,
    staleTime: 60_000,
  });

  const { data: milestones = [] } = useQuery({
    queryKey: ["forward-milestones-home", plans[0]?.id],
    queryFn: () => base44.entities.ForwardPlanMilestone.filter({ plan_id: plans[0].id }),
    enabled: !!plans[0]?.id,
    staleTime: 60_000,
  });

  const plan = plans[0];
  if (!plan) return null;

  const pct = milestones.length > 0 ? Math.round((doneMilestones.length / milestones.length) * 100) : 0;

  return (
    <div onClick={() => navigate("/ForwardPlan")} style={{ textDecoration: "none", display: "block", marginBottom: 20, cursor: "pointer" }}>
      <div style={{
        borderRadius: 22, padding: "20px 18px",
        background: "linear-gradient(135deg,rgba(99,102,241,0.1),rgba(139,92,246,0.06))",
        border: "1.5px solid rgba(99,102,241,0.25)",
        boxShadow: "0 8px 32px rgba(99,102,241,0.08)",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 12,
              background: "rgba(99,102,241,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ClipboardList style={{ color: "#818CF8", width: 18, height: 18 }} />
            </div>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(129,140,248,0.7)", textTransform: "uppercase",
                letterSpacing: ".1em", marginBottom: 1 }}>Today's Plan</p>
              <p style={{ fontSize: 15, fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>
                {plan.title || "My Aftercare Plan"}
              </p>
            </div>
          </div>
          <ArrowRight style={{ color: "rgba(129,140,248,0.5)", width: 16, height: 16, flexShrink: 0 }} />
        </div>

        {/* Progress bar */}
        {milestones.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 600 }}>Overall Progress</p>
              <p style={{ fontSize: 11, fontWeight: 800, color: "#818CF8" }}>{pct}% — {doneMilestones.length}/{milestones.length} milestones</p>
            </div>
            <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: 5, height: 6, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 5, width: `${pct}%`,
                background: "linear-gradient(90deg,#6366F1,#8B5CF6)",
                boxShadow: "0 0 10px rgba(99,102,241,0.5)",
                transition: "width 0.8s ease",
              }} />
            </div>
          </div>
        )}

        {/* Next steps */}
        {pendingMilestones.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.25)", textTransform: "uppercase",
              letterSpacing: ".08em", marginBottom: 2 }}>Next Up</p>
            {pendingMilestones.map(m => (
              <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <Circle style={{ color: "rgba(99,102,241,0.4)", width: 14, height: 14, flexShrink: 0 }} />
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", fontWeight: 600, lineHeight: 1.3 }}>
                  {m.title}
                </p>
              </div>
            ))}
          </div>
        )}

        {milestones.length === 0 && plan.description && (
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>
            {plan.description.slice(0, 140)}{plan.description.length > 140 ? "…" : ""}
          </p>
        )}

        <div style={{ marginTop: 14, padding: "8px 12px", borderRadius: 10,
          background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)",
          display: "inline-flex", alignItems: "center", gap: 6 }}>
          <CheckCircle2 style={{ color: "#818CF8", width: 12, height: 12 }} />
          <p style={{ fontSize: 11, fontWeight: 700, color: "#818CF8" }}>Tap to review your full plan →</p>
        </div>
      </div>
    </div>
  );
}