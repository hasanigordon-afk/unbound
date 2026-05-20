import React from "react";
import { Shield, Loader2 } from "lucide-react";
import { VH_COLORS as C } from "./vetHubData";

// Veteran Mode toggle — when on, app prioritizes veteran resources globally.
export default function VeteranModeBanner({ active, onToggle, saving }) {
  return (
    <div style={{
      background: active
        ? "linear-gradient(135deg, rgba(91,141,239,.78), rgba(34,211,238,.32), rgba(13,18,32,.86))"
        : "linear-gradient(145deg, rgba(255,255,255,.10), rgba(13,18,32,.74))",
      border: active ? "1px solid rgba(240,183,83,.34)" : "1px solid rgba(190,225,255,.15)",
      borderRadius: 26, padding: 18,
      boxShadow: active ? "0 0 34px rgba(240,183,83,.16), 0 20px 54px rgba(0,0,0,.30)" : "0 20px 54px rgba(0,0,0,.28), inset 0 1px 0 rgba(255,255,255,.10)",
      backdropFilter: "blur(24px) saturate(160%)",
      display: "flex", alignItems: "center", gap: 12,
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: 12, flexShrink: 0,
        background: active ? "rgba(240,183,83,0.18)" : "rgba(34,211,238,0.10)", border: active ? "1px solid rgba(240,183,83,.28)" : "1px solid rgba(34,211,238,.22)", boxShadow: active ? "0 0 24px rgba(240,183,83,.16)" : "0 0 24px rgba(34,211,238,.14)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Shield style={{ width: 20, height: 20, color: active ? "var(--gold)" : "#22D3EE" }} />
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 13.5, fontWeight: 800,
          color: "var(--text)", marginBottom: 2 }}>Veteran Mode</p>
        <p style={{ fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.5 }}>
          {active ? "Veteran resources prioritized across the app." : "Tailor the app to your service experience."}
        </p>
      </div>
      <button onClick={onToggle} disabled={saving}
        style={{
          padding: "8px 14px", borderRadius: 999, border: "none",
          background: active ? "linear-gradient(135deg, var(--gold), #22D3EE)" : "linear-gradient(135deg, #5B8DEF, #22D3EE)", color: active ? "#07101f" : "#fff",
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