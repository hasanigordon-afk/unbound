import React from "react";
import { User } from "lucide-react";
import { VM } from "../vmData";

export default function VMDHeader({ onSettings }) {
  return (
    <div style={{ padding: "44px 20px 20px", borderBottom: `1px solid ${VM.border}` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontFamily: "'Lora', serif", fontSize: 16, fontWeight: 700, color: VM.gold, letterSpacing: "-.02em" }}>Ah Ha</span>
          <span style={{ fontSize: 10, color: VM.dim, fontWeight: 500 }}>LLC</span>
        </div>
        <p style={{ fontSize: 11, fontWeight: 700, color: VM.olive, letterSpacing: ".22em", textTransform: "uppercase" }}>
          Veteran Mode
        </p>
        <button onClick={onSettings} style={{
          background: VM.surface, border: `1px solid ${VM.border}`,
          width: 32, height: 32, borderRadius: 8, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: VM.muted,
        }}>
          <User style={{ width: 14, height: 14 }} strokeWidth={1.8} />
        </button>
      </div>
      <p style={{ fontSize: 12, color: VM.muted, textAlign: "center", lineHeight: 1.5 }}>
        Private support. Clear structure. One day at a time.
      </p>
    </div>
  );
}