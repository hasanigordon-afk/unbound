import React from "react";
import { VM } from "../vmData";

export default function VMDProgressStrip({ streak, weekCheckins, tasksDone, supportActions }) {
  const stats = [
    { label: "Streak",       value: streak,         unit: "days" },
    { label: "This week",    value: weekCheckins,   unit: "check-ins" },
    { label: "Tasks",        value: tasksDone,      unit: "done" },
    { label: "Support",      value: supportActions, unit: "logged" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
      {stats.map(s => (
        <div key={s.label} style={{
          background: VM.surface, border: `1px solid ${VM.border}`,
          borderRadius: 10, padding: "12px 6px", textAlign: "center",
        }}>
          <p style={{ fontSize: 22, fontWeight: 700, color: VM.gold, lineHeight: 1, marginBottom: 4, fontFamily: "'Lora', serif" }}>
            {s.value}
          </p>
          <p style={{ fontSize: 9, fontWeight: 700, color: VM.dim, textTransform: "uppercase", letterSpacing: ".05em", lineHeight: 1.2 }}>
            {s.label}
          </p>
          <p style={{ fontSize: 9, color: VM.dim, marginTop: 2 }}>{s.unit}</p>
        </div>
      ))}
    </div>
  );
}