import React from "react";
import { Shield, Loader2 } from "lucide-react";
import { VH_COLORS as C } from "./vetHubData";

// Veteran Mode toggle — when on, app prioritizes veteran resources globally.
export default function VeteranModeBanner({ active, onToggle, saving }) {
  return (
    <div style={{
      background: active
        ? "linear-gradient(135deg,#0F1E3D 0%,#1A2E5C 100%)"
        : "#fff",
      border: `1px solid ${active ? "rgba(200,147,47,0.32)" : C.border}`,
      borderRadius: 18, padding: 14,
      display: "flex", alignItems: "center", gap: 12,
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: 12, flexShrink: 0,
        background: active ? "rgba(200,147,47,0.20)" : "rgba(15,30,61,0.07)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Shield style={{ width: 20, height: 20, color: active ? C.gold : C.navy }} />
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 13.5, fontWeight: 800,
          color: active ? "#fff" : C.text, marginBottom: 2 }}>Veteran Mode</p>
        <p style={{ fontSize: 11.5, color: active ? "rgba(255,255,255,0.72)" : C.dim, lineHeight: 1.5 }}>
          {active ? "Veteran resources prioritized across the app." : "Tailor the app to your service experience."}
        </p>
      </div>
      <button onClick={onToggle} disabled={saving}
        style={{
          padding: "8px 14px", borderRadius: 999, border: "none",
          background: active ? C.gold : C.navy, color: "#fff",
          fontSize: 12, fontWeight: 800, cursor: saving ? "wait" : "pointer",
          fontFamily: "'DM Sans', sans-serif",
          display: "inline-flex", alignItems: "center", gap: 6,
        }}>
        {saving && <Loader2 className="animate-spin" style={{ width: 12, height: 12 }} />}
        {active ? "ON" : "Activate"}
      </button>
    </div>
  );
}