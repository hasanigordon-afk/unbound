import React from "react";
import { Apple, Dumbbell, Calendar } from "lucide-react";
import { WP_COLORS as C, DURATION_DAYS } from "@/lib/wellnessConfig";

const TYPE_META = {
  nutrition: { icon: Apple,    label: "Nutrition", color: C.green },
  exercise:  { icon: Dumbbell, label: "Exercise",  color: C.navy },
  full_90:   { icon: Calendar, label: "90-Day",    color: C.gold },
};

export default function WPPlanCard({ plan, onClick }) {
  const meta = TYPE_META[plan.plan_type] || TYPE_META.nutrition;
  const Icon = meta.icon;
  const total = DURATION_DAYS[plan.duration] || 7;
  const pct = Math.min(100, Math.round(((plan.completed_days || 0) / total) * 100));

  return (
    <button onClick={onClick} style={{
      textAlign: "left", background: "#fff", border: `1px solid ${C.border}`,
      borderRadius: 16, padding: "14px 16px", cursor: "pointer", width: "100%",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 11, flexShrink: 0,
          background: meta.color + "1A",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon style={{ width: 18, height: 18, color: meta.color }} strokeWidth={2.2} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 10, fontWeight: 800, color: meta.color,
            textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 2 }}>
            {meta.label} · {total} days{plan.mode !== "standard" ? ` · ${plan.mode === "veteran" ? "Veteran" : "Rebuild"}` : ""}
          </p>
          <p style={{ fontSize: 14, fontWeight: 700, color: C.text, lineHeight: 1.35,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {plan.plan_title}
          </p>
        </div>
      </div>

      <div style={{ height: 5, borderRadius: 999, background: C.cream, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: C.green, transition: "width .3s" }} />
      </div>
      <p style={{ fontSize: 11, color: C.dim, marginTop: 5 }}>
        {plan.completed_days || 0}/{total} days · {pct}%
      </p>
    </button>
  );
}