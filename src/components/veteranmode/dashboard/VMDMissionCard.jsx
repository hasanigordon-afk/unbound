import React from "react";
import { Target, Check, RefreshCw } from "lucide-react";
import { VM } from "../vmData";

export default function VMDMissionCard({ objective, completed, onComplete, onChange }) {
  return (
    <div style={{
      background: completed ? VM.oliveSoft : VM.surface,
      border: `1px solid ${completed ? VM.olive : VM.border}`,
      borderRadius: 14, padding: "18px 18px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <Target style={{ width: 14, height: 14, color: VM.gold }} strokeWidth={2} />
        <p style={{ fontSize: 11, fontWeight: 700, color: VM.dim, textTransform: "uppercase", letterSpacing: ".12em" }}>
          Today's Mission
        </p>
      </div>
      <p style={{ fontSize: 18, color: VM.text, lineHeight: 1.4, marginBottom: 16, fontWeight: 500, fontFamily: "'Lora', serif" }}>
        {objective}
      </p>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onComplete} style={{
          flex: 1, padding: "11px", borderRadius: 10, cursor: "pointer",
          background: completed ? VM.olive : "transparent",
          border: `1px solid ${completed ? VM.olive : VM.border}`,
          color: completed ? "#12140F" : VM.text,
          fontSize: 13, fontWeight: 700, fontFamily: "inherit",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        }}>
          {completed && <Check style={{ width: 14, height: 14 }} strokeWidth={3} />}
          {completed ? "Complete" : "Complete Objective"}
        </button>
        <button onClick={onChange} style={{
          padding: "11px 14px", borderRadius: 10, cursor: "pointer",
          background: "transparent", border: `1px solid ${VM.border}`,
          color: VM.muted, fontSize: 13, fontWeight: 600, fontFamily: "inherit",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <RefreshCw style={{ width: 13, height: 13 }} />
          Change
        </button>
      </div>
    </div>
  );
}