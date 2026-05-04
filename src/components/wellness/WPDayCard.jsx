import React from "react";
import { WP_COLORS as C } from "@/lib/wellnessConfig";

const SectionRow = ({ label, value }) => {
  if (!value) return null;
  return (
    <div style={{ marginBottom: 8 }}>
      <p style={{ fontSize: 10.5, fontWeight: 800, color: C.gold,
        textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 2 }}>
        {label}
      </p>
      <p style={{ fontSize: 13.5, color: C.text, lineHeight: 1.55 }}>{value}</p>
    </div>
  );
};

export default function WPDayCard({ day, kind /* 'meal' | 'workout' */ }) {
  if (!day) return null;
  const isMeal = kind === "meal";

  return (
    <div style={{
      background: "#fff", border: `1px solid ${C.border}`, borderRadius: 16,
      padding: "16px",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <p style={{ fontSize: 11, fontWeight: 800, color: C.navy,
          textTransform: "uppercase", letterSpacing: ".12em" }}>
          Day {day.day}
        </p>
        {day.phase && (
          <span style={{
            fontSize: 10, fontWeight: 700, color: C.gold,
            background: "rgba(200,147,47,0.10)",
            border: `1px solid ${C.gold}33`,
            padding: "2px 8px", borderRadius: 999,
            textTransform: "uppercase", letterSpacing: ".08em",
          }}>
            {day.phase.replace("_", " ")}
          </span>
        )}
      </div>

      {isMeal ? (
        <>
          <SectionRow label="Breakfast" value={day.breakfast} />
          <SectionRow label="Lunch" value={day.lunch} />
          <SectionRow label="Dinner" value={day.dinner} />
          <SectionRow label="Snacks" value={day.snacks} />
          <SectionRow label="Hydration" value={day.hydration} />
          <SectionRow label="Discipline check" value={day.discipline_check} />
        </>
      ) : (
        <>
          {day.title && (
            <p style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 10 }}>
              {day.title}
            </p>
          )}
          {day.rest_day ? (
            <p style={{ fontSize: 13.5, color: C.muted, fontStyle: "italic", lineHeight: 1.55 }}>
              Rest day. Walk, stretch, hydrate, sleep.
            </p>
          ) : (
            <>
              <SectionRow label="Warm-up" value={day.warmup} />
              <SectionRow label="Main workout" value={day.main_workout} />
              <SectionRow label="Core finisher" value={day.core_finisher} />
              <SectionRow label="Cooldown" value={day.cooldown} />
              <SectionRow label="Beginner option" value={day.beginner_mod} />
              <SectionRow label="Advanced option" value={day.advanced_mod} />
            </>
          )}
        </>
      )}
    </div>
  );
}