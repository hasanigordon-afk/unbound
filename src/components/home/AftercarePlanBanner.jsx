import React from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { ClipboardList, ArrowRight, CheckCircle2, Circle, AlertCircle, TrendingUp } from "lucide-react";

export default function AftercarePlanBanner({ user }) {
  const navigate = useNavigate();

  const { data: plans = [] } = useQuery({
    queryKey: ["forward-plan-home", user?.email],
    queryFn: () => base44.entities.ForwardPlan.filter({ participant_email: user.email }, "-created_date", 1),
    enabled: !!user?.email,
    staleTime: 60_000,
  });

  const { data: milestones = [] } = useQuery({
    queryKey: ["forward-milestones-home", plans[0]?.id],
    queryFn: () => base44.entities.ForwardPlanMilestone.filter({ forward_plan_id: plans[0].id }, "sort_order"),
    enabled: !!plans[0]?.id,
    staleTime: 60_000,
  });

  const plan = plans[0];

  // No plan yet — show a CTA to create one
  if (!plan) {
    return (
      <div onClick={() => navigate("/ForwardPlan")} style={{ marginBottom: 20, cursor: "pointer" }}>
        <div style={{
          borderRadius: 22, padding: "20px 18px",
          background: "linear-gradient(135deg,rgba(99,102,241,0.08),rgba(139,92,246,0.04))",
          border: "1.5px dashed rgba(99,102,241,0.3)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, flexShrink: 0,
              background: "rgba(99,102,241,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ClipboardList style={{ color: "#818CF8", width: 20, height: 20 }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 15, fontWeight: 900, color: "#fff", marginBottom: 3 }}>Set Up Your Treatment Plan</p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>
                Your aftercare plan keeps you accountable. Tap to build yours now.
              </p>
            </div>
            <ArrowRight style={{ color: "#818CF8", width: 16, height: 16, flexShrink: 0 }} />
          </div>
        </div>
      </div>
    );
  }

  const doneMilestones = milestones.filter(m => m.completed);
  const pendingMilestones = milestones.filter(m => !m.completed);
  const pct = milestones.length > 0 ? Math.round((doneMilestones.length / milestones.length) * 100) : 0;
  const nextUp = pendingMilestones.slice(0, 3);
  const isOnTrack = pct >= 50 || milestones.length === 0;

  return (
    <div onClick={() => navigate("/ForwardPlan")} style={{ marginBottom: 20, cursor: "pointer" }}>
      <div style={{
        borderRadius: 22, padding: "20px 18px",
        background: "linear-gradient(135deg,rgba(99,102,241,0.1),rgba(139,92,246,0.06))",
        border: `1.5px solid ${isOnTrack ? "rgba(99,102,241,0.3)" : "rgba(239,68,68,0.3)"}`,
        boxShadow: `0 8px 32px ${isOnTrack ? "rgba(99,102,241,0.08)" : "rgba(239,68,68,0.06)"}`,
      }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 13, flexShrink: 0,
              background: isOnTrack ? "rgba(99,102,241,0.15)" : "rgba(239,68,68,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center" }}>
              {isOnTrack
                ? <TrendingUp style={{ color: "#818CF8", width: 18, height: 18 }} />
                : <AlertCircle style={{ color: "#F87171", width: 18, height: 18 }} />
              }
            </div>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700,
                color: isOnTrack ? "rgba(129,140,248,0.7)" : "rgba(248,113,113,0.8)",
                textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 1 }}>
                {isOnTrack ? "Treatment Plan · On Track" : "Treatment Plan · Needs Attention"}
              </p>
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
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 600 }}>Milestone Progress</p>
              <p style={{ fontSize: 11, fontWeight: 800, color: "#818CF8" }}>
                {doneMilestones.length} of {milestones.length} done · {pct}%
              </p>
            </div>
            <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: 5, height: 7, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 5, width: `${pct}%`,
                background: pct >= 50
                  ? "linear-gradient(90deg,#6366F1,#8B5CF6)"
                  : "linear-gradient(90deg,#EF4444,#F87171)",
                boxShadow: `0 0 10px ${pct >= 50 ? "rgba(99,102,241,0.5)" : "rgba(239,68,68,0.4)"}`,
                transition: "width 0.8s ease",
              }} />
            </div>
          </div>
        )}

        {/* Next steps */}
        {nextUp.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.25)", textTransform: "uppercase",
              letterSpacing: ".08em", marginBottom: 8 }}>Next Steps</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {nextUp.map(m => (
                <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <Circle style={{ color: "rgba(99,102,241,0.5)", width: 14, height: 14, flexShrink: 0 }} />
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", fontWeight: 600, lineHeight: 1.3 }}>
                    {m.milestone_text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recently completed */}
        {doneMilestones.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
            <CheckCircle2 style={{ color: "#10B981", width: 14, height: 14, flexShrink: 0 }} />
            <p style={{ fontSize: 12, color: "rgba(16,185,129,0.8)", fontWeight: 600 }}>
              {doneMilestones.length} milestone{doneMilestones.length !== 1 ? "s" : ""} completed — keep going!
            </p>
          </div>
        )}

        {/* CTA strip */}
        <div style={{ padding: "9px 14px", borderRadius: 11,
          background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.18)",
          display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#818CF8" }}>Review your full treatment plan</p>
          <ArrowRight style={{ color: "#818CF8", width: 14, height: 14 }} />
        </div>
      </div>
    </div>
  );
}