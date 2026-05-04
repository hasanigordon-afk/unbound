import React from "react";
import { WP_COLORS as C } from "@/lib/wellnessConfig";
import { DURATION_DAYS } from "@/lib/wellnessConfig";

export default function WPProgressStrip({ plan, completedDays, currentDay }) {
  const total = DURATION_DAYS[plan.duration] || 7;
  const pct = Math.min(100, Math.round((completedDays / total) * 100));

  const phaseLabel = total === 90
    ? currentDay <= 30 ? "Phase 1 · Reset"
      : currentDay <= 60 ? "Phase 2 · Build"
        : "Phase 3 · Discipline"
    : null;

  return (
    <div style={{
      background: "linear-gradient(135deg, #0F1E3D 0%, #1A2E5C 100%)",
      borderRadius: 18, padding: "18px", color: "#fff",
      boxShadow: "0 4px 16px rgba(15,30,61,0.18)",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <p style={{ fontSize: 11, fontWeight: 800, color: C.gold,
          textTransform: "uppercase", letterSpacing: ".14em" }}>
          Progress
        </p>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>
          Day {currentDay} of {total}
        </p>
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 10 }}>
        <p style={{ fontSize: 32, fontWeight: 800, color: "#fff", lineHeight: 1 }}>{pct}%</p>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
          {completedDays} day{completedDays === 1 ? "" : "s"} complete
        </p>
      </div>

      <div style={{ height: 8, borderRadius: 999, background: "rgba(255,255,255,0.12)", overflow: "hidden" }}>
        <div style={{
          width: `${pct}%`, height: "100%", background: C.gold,
          transition: "width .4s",
        }} />
      </div>

      {phaseLabel && (
        <p style={{ fontSize: 12, color: C.gold, fontWeight: 700, marginTop: 10,
          textTransform: "uppercase", letterSpacing: ".1em" }}>
          {phaseLabel}
        </p>
      )}
    </div>
  );
}