import React from "react";
import { X, CheckCircle2, Circle } from "lucide-react";
import { SA_COLORS as C } from "@/lib/superAgentConfig";

const TYPE_LABEL = { daily: "Daily", "7_day": "7-Day", "30_day": "30-Day", "90_day": "90-Day" };

export default function SAPlanModal({ plan, onClose, onToggleStep, onDelete }) {
  if (!plan) return null;
  const total = plan.action_steps?.length || 0;
  const done  = plan.action_steps?.filter(s => s.completed).length || 0;

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(15,30,61,0.55)",
      zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: C.cream, width: "100%", maxWidth: 560,
        maxHeight: "92vh", overflowY: "auto",
        borderTopLeftRadius: 22, borderTopRightRadius: 22,
        padding: "20px 18px 28px", fontFamily: "'DM Sans', sans-serif",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 10, fontWeight: 800, color: C.gold,
              textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 4 }}>
              {TYPE_LABEL[plan.plan_type]} Plan · {done}/{total} done
            </p>
            <h3 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: 20, fontWeight: 700, color: C.text, lineHeight: 1.25 }}>
              {plan.plan_title}
            </h3>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", padding: 4 }}>
            <X style={{ width: 20, height: 20, color: C.muted }} />
          </button>
        </div>

        {plan.plan_summary && (
          <p style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.6, marginBottom: 14 }}>
            {plan.plan_summary}
          </p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {(plan.action_steps || []).map((step, i) => (
            <button key={i} onClick={() => onToggleStep(i)} style={{
              display: "flex", alignItems: "flex-start", gap: 12, textAlign: "left",
              background: step.completed ? "rgba(107,143,113,0.08)" : "#fff",
              border: `1px solid ${step.completed ? C.green + "55" : C.border}`,
              borderRadius: 14, padding: "12px 14px", cursor: "pointer",
              fontFamily: "inherit",
            }}>
              {step.completed
                ? <CheckCircle2 style={{ width: 20, height: 20, color: C.green, flexShrink: 0, marginTop: 1 }} />
                : <Circle style={{ width: 20, height: 20, color: C.dim, flexShrink: 0, marginTop: 1 }} />}
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 11, fontWeight: 800, color: C.gold, letterSpacing: ".1em",
                  textTransform: "uppercase", marginBottom: 3 }}>Day {step.day}</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: C.text, lineHeight: 1.4,
                  textDecoration: step.completed ? "line-through" : "none",
                  opacity: step.completed ? 0.7 : 1 }}>
                  {step.title}
                </p>
                {step.description && (
                  <p style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.55, marginTop: 4 }}>
                    {step.description}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>

        <button onClick={onDelete} style={{
          marginTop: 18, background: "transparent",
          border: `1px solid ${C.red}55`, color: C.red,
          padding: "10px 16px", borderRadius: 999, fontSize: 13, fontWeight: 600,
          cursor: "pointer",
        }}>
          Delete plan
        </button>
      </div>
    </div>
  );
}