import React from "react";
import { FileText, ShieldCheck } from "lucide-react";

export default function ProgressReportPanel({ audience = "institutions" }) {
  const rows = [
    ["Recovery stabilization", "Streaks, check-ins, meeting rhythm"],
    ["Life stability", "Housing, employment, transportation progress"],
    ["Support engagement", "Mentor interactions and wellness participation"],
    ["Compliance readiness", "Attendance, goals, reminders, and follow-through"]
  ];

  return (
    <div className="card-glow" style={{ padding: 22 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
        <div style={{ width: 46, height: 46, borderRadius: 16, background: "var(--navy-dim)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <FileText style={{ width: 22 }} />
        </div>
        <div>
          <h3 style={{ fontSize: 22 }}>Clean progress reports</h3>
          <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Built for users, mentors, counselors, and {audience}.</p>
        </div>
      </div>
      <div style={{ display: "grid", gap: 10 }}>
        {rows.map(([title, body]) => (
          <div key={title} style={{ display: "flex", gap: 10, padding: 12, borderRadius: 16, background: "var(--surface)", border: "1px solid var(--border)" }}>
            <ShieldCheck style={{ width: 18, color: "var(--green)", marginTop: 2, flexShrink: 0 }} />
            <div>
              <p style={{ fontWeight: 700, fontSize: 14 }}>{title}</p>
              <p style={{ color: "var(--text-muted)", fontSize: 12.5 }}>{body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}