import React from "react";
import { VMScreen, VMButton } from "./VMShell";
import { VM } from "./vmData";

export default function VMStepEntry({ onNext }) {
  return (
    <VMScreen showBack={false}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", textAlign: "center" }}>
        <div style={{
          width: 56, height: 56, borderRadius: 14, margin: "0 auto 24px",
          background: VM.oliveSoft, border: `1px solid ${VM.olive}50`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 28,
        }}>
          🇺🇸
        </div>
        <p style={{
          fontSize: 11, fontWeight: 700, color: VM.gold, letterSpacing: ".25em",
          textTransform: "uppercase", marginBottom: 20,
        }}>
          Veteran Mode
        </p>
        <h1 style={{
          fontFamily: "'Lora', Georgia, serif", fontSize: 30, fontWeight: 500,
          lineHeight: 1.2, color: VM.text, marginBottom: 14, letterSpacing: "-.01em",
        }}>
          Welcome. This is your space.
        </h1>
        <p style={{ fontSize: 15, color: VM.muted, lineHeight: 1.65, maxWidth: 340, margin: "0 auto" }}>
          Built for veterans navigating life after service.<br />
          Private. Structured. On your terms.
        </p>
      </div>
      <VMButton onClick={onNext}>Enter Veteran Mode</VMButton>
    </VMScreen>
  );
}