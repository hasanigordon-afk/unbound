import React from "react";
import { Calendar, CheckCircle2 } from "lucide-react";
import { SA_COLORS as C } from "@/lib/superAgentConfig";

const TYPE_LABEL = { daily: "Daily", "7_day": "7-Day", "30_day": "30-Day", "90_day": "90-Day" };

export default function SAPlanCard({ plan, onClick }) {
  const total = plan.action_steps?.length || 0;
  const done  = plan.action_steps?.filter(s => s.completed).length || 0;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <button onClick={onClick} style={{
      textAlign: "left", background: "#fff", border: `1px solid ${C.border}`,
      borderRadius: 16, padding: "16px", cursor: "pointer", width: "100%",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: C.gold + "22", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Calendar style={{ width: 17, height: 17, color: C.gold }} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 10, fontWeight: 800, color: C.gold,
            textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 2 }}>
            {TYPE_LABEL[plan.plan_type] || plan.plan_type}
          </p>
          <p style={{ fontSize: 14, fontWeight: 700, color: C.text, lineHeight: 1.35 }}>
            {plan.plan_title}
          </p>
        </div>
        {pct === 100 && <CheckCircle2 style={{ width: 18, height: 18, color: C.green }} />}
      </div>

      {/* Progress bar */}
      <div style={{ height: 6, borderRadius: 999, background: C.cream, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: C.green, transition: "width .3s" }} />
      </div>
      <p style={{ fontSize: 11, color: C.dim, marginTop: 6 }}>
        {done} of {total} steps done · {pct}%
      </p>
    </button>
  );
}