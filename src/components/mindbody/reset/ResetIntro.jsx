import React, { useState } from "react";
import { Loader2, Check } from "lucide-react";
import { PHASES } from "./resetProgramData";

export default function ResetIntro({ onStart, starting }) {
  const [fastingEnabled, setFastingEnabled] = useState(false);

  return (
    <div style={{ padding: "24px 16px 40px" }}>
      <div style={{
        background: "linear-gradient(135deg, rgba(184,130,58,.08), rgba(122,158,126,.04))",
        border: "1px solid rgba(184,130,58,.25)",
        borderRadius: 18, padding: "28px 22px", marginBottom: 20, textAlign: "center",
      }}>
        <p style={{ fontSize: 54, marginBottom: 10 }}>🎯</p>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#B8823A", textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 6 }}>
          90-Day Program
        </p>
        <h1 style={{ fontFamily: "'Lora', serif", fontSize: 28, fontWeight: 600, color: "#1C1410", lineHeight: 1.2, marginBottom: 10 }}>
          Mind-Body Reset
        </h1>
        <p style={{ fontSize: 14, color: "#4A3F35", lineHeight: 1.6, fontStyle: "italic" }}>
          "Small daily wins create a new life."
        </p>
      </div>

      <p style={{ fontSize: 10, fontWeight: 700, color: "#9B8E83", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 12 }}>
        The 3 phases
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
        {PHASES.map(p => (
          <div key={p.id} style={{
            background: "#FDFAF6", border: "1px solid #E8E2D9",
            borderRadius: 14, padding: "14px 16px",
            display: "flex", alignItems: "center", gap: 14,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 11, flexShrink: 0,
              background: `${p.color}15`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
            }}>
              {p.emoji}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                <p style={{ fontSize: 14, fontWeight: 800, color: p.color, letterSpacing: ".02em" }}>{p.label}</p>
                <span style={{ fontSize: 11, color: "#9B8E83", fontWeight: 600 }}>Days {p.range[0]}–{p.range[1]}</span>
              </div>
              <p style={{ fontSize: 12, color: "#4A3F35", lineHeight: 1.5 }}>{p.goal}</p>
            </div>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 10, fontWeight: 700, color: "#9B8E83", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 12 }}>
        Before you start
      </p>
      <button
        onClick={() => setFastingEnabled(v => !v)}
        style={{
          width: "100%", background: "#FDFAF6", border: "1px solid #E8E2D9",
          borderRadius: 14, padding: "14px 16px", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 12, textAlign: "left", marginBottom: 20,
        }}
      >
        <div style={{
          width: 24, height: 24, borderRadius: 7, flexShrink: 0,
          background: fastingEnabled ? "#B8823A" : "transparent",
          border: fastingEnabled ? "none" : "1.5px solid #C8C2BC",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {fastingEnabled && <Check style={{ width: 14, height: 14, color: "#fff" }} strokeWidth={3} />}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#1C1410", marginBottom: 2 }}>
            Include fasting goals
          </p>
          <p style={{ fontSize: 11, color: "#9B8E83" }}>
            Optional — can be changed anytime
          </p>
        </div>
      </button>

      <button
        onClick={() => onStart({ fasting_enabled: fastingEnabled })}
        disabled={starting}
        style={{
          width: "100%", padding: 16, borderRadius: 50, border: "none",
          background: "#B8823A", color: "#fff", fontWeight: 700, fontSize: 15,
          cursor: starting ? "default" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          marginBottom: 14,
        }}
      >
        {starting
          ? <Loader2 style={{ width: 15, height: 15 }} className="animate-spin" />
          : null}
        Start Day 1 →
      </button>

      <p style={{ fontSize: 11, color: "#9B8E83", textAlign: "center", lineHeight: 1.6 }}>
        You can pause anytime. Listen to your body — this is not medical advice.
      </p>
    </div>
  );
}