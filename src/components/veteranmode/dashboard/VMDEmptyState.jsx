import React from "react";
import { VM } from "../vmData";

export default function VMDEmptyState({ onFirstCheckin, onFindHelp }) {
  return (
    <div style={{
      background: VM.surface, border: `1px solid ${VM.border}`,
      borderRadius: 14, padding: "22px 20px", textAlign: "center",
    }}>
      <p style={{ fontFamily: "'Lora', serif", fontSize: 18, color: VM.text, lineHeight: 1.4, marginBottom: 16, fontWeight: 500 }}>
        Start simple.<br />
        One check-in, one task, one step forward.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <button onClick={onFirstCheckin} style={{
          padding: "12px", borderRadius: 10, cursor: "pointer",
          background: VM.olive, border: "none", color: "#12140F",
          fontSize: 13, fontWeight: 700, fontFamily: "inherit",
        }}>
          Do First Check-In
        </button>
        <button onClick={onFindHelp} style={{
          padding: "12px", borderRadius: 10, cursor: "pointer",
          background: "transparent", border: `1px solid ${VM.border}`,
          color: VM.text, fontSize: 13, fontWeight: 600, fontFamily: "inherit",
        }}>
          Find Nearby Help
        </button>
      </div>
    </div>
  );
}