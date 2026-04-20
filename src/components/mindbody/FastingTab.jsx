import React, { useState, useEffect } from "react";
import { Play, Square, Timer, Loader2 } from "lucide-react";

const PLANS = [
  { key: "12_hour", label: "12 Hour", tag: "Beginner",     hours: 12 },
  { key: "16_hour", label: "16 Hour", tag: "Intermediate", hours: 16 },
  { key: "custom",  label: "Custom",  tag: "Pick hours",   hours: null },
];

function formatTime(ms) {
  if (ms < 0) ms = 0;
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function FastingTab({ activeSession, onStart, onStop, saving }) {
  const [selectedPlan, setSelectedPlan] = useState("12_hour");
  const [customHours, setCustomHours] = useState(14);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleStart = () => {
    const plan = PLANS.find(p => p.key === selectedPlan);
    const hours = plan.hours || customHours;
    onStart({ plan: selectedPlan, target_hours: hours });
  };

  if (activeSession) {
    const started = new Date(activeSession.started_at).getTime();
    const targetMs = activeSession.target_hours * 3600 * 1000;
    const elapsed = now - started;
    const remaining = targetMs - elapsed;
    const progress = Math.min((elapsed / targetMs) * 100, 100);
    const done = remaining <= 0;
    const completedHours = Math.min(elapsed / 3600000, activeSession.target_hours);

    const circumference = 2 * Math.PI * 90;
    const dashOffset = circumference - (circumference * progress) / 100;

    return (
      <div style={{ padding: "20px 16px" }}>
        <div style={{
          background: "#FDFAF6", border: "1px solid #E8E2D9",
          borderRadius: 20, padding: "28px 20px", marginBottom: 16, textAlign: "center",
        }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#B8823A", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 6 }}>
            Fasting · {activeSession.target_hours} hour
          </p>
          <h2 style={{ fontFamily: "'Lora', serif", fontSize: 20, fontWeight: 600, color: "#1C1410", marginBottom: 20 }}>
            {done ? "You made it." : "Discipline builds control."}
          </h2>

          <div style={{ position: "relative", width: 220, height: 220, margin: "0 auto 20px" }}>
            <svg width="220" height="220" viewBox="0 0 220 220" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="110" cy="110" r="90" fill="none" stroke="#E8E2D9" strokeWidth="8" />
              <circle
                cx="110" cy="110" r="90" fill="none"
                stroke={done ? "#7A9E7E" : "#B8823A"} strokeWidth="8" strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                style={{ transition: "stroke-dashoffset 1s linear" }}
              />
            </svg>
            <div style={{
              position: "absolute", inset: 0, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
            }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#9B8E83", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 4 }}>
                {done ? "Completed" : "Remaining"}
              </p>
              <p style={{ fontSize: 30, fontWeight: 800, color: "#1C1410", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
                {formatTime(done ? elapsed : remaining)}
              </p>
              <p style={{ fontSize: 12, color: "#9B8E83", marginTop: 6 }}>
                {Math.floor(progress)}% complete
              </p>
            </div>
          </div>

          <button
            onClick={() => onStop(completedHours, done)}
            disabled={saving}
            style={{
              padding: "13px 28px", borderRadius: 50, border: "none", cursor: "pointer",
              background: done ? "#7A9E7E" : "#F7F3EE",
              color: done ? "#fff" : "#4A3F35",
              fontWeight: 700, fontSize: 14,
              border: done ? "none" : "1px solid #E8E2D9",
              display: "inline-flex", alignItems: "center", gap: 8,
            }}
          >
            {saving
              ? <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" />
              : <Square style={{ width: 14, height: 14 }} fill="currentColor" />}
            {done ? "End & Log" : "Stop Early"}
          </button>
        </div>

        <div style={{
          background: "rgba(184,130,58,.06)", border: "1px solid rgba(184,130,58,.2)",
          borderRadius: 12, padding: "12px 14px",
        }}>
          <p style={{ fontSize: 11, color: "#4A3F35", lineHeight: 1.6 }}>
            ⚠️ This is not medical advice. Listen to your body. Stop if you feel unwell.
          </p>
        </div>
      </div>
    );
  }

  // No active session — show setup
  return (
    <div style={{ padding: "20px 16px" }}>
      <div style={{
        background: "#FDFAF6", border: "1px solid #E8E2D9",
        borderRadius: 16, padding: "20px 20px", marginBottom: 16, textAlign: "center",
      }}>
        <Timer style={{ width: 32, height: 32, color: "#B8823A", margin: "0 auto 8px" }} strokeWidth={1.5} />
        <h2 style={{ fontFamily: "'Lora', serif", fontSize: 22, fontWeight: 600, color: "#1C1410", marginBottom: 6 }}>
          Optional Fasting
        </h2>
        <p style={{ fontSize: 13, color: "#4A3F35", lineHeight: 1.6 }}>
          Discipline builds control. Pick a window that works for you today.
        </p>
      </div>

      <p style={{ fontSize: 10, fontWeight: 700, color: "#9B8E83", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 12 }}>
        Choose your plan
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        {PLANS.map(p => {
          const sel = selectedPlan === p.key;
          return (
            <button key={p.key} onClick={() => setSelectedPlan(p.key)} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "14px 16px", borderRadius: 14,
              background: sel ? "rgba(184,130,58,.06)" : "#FDFAF6",
              border: sel ? "1.5px solid #B8823A" : "1px solid #E8E2D9",
              cursor: "pointer", textAlign: "left", width: "100%",
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                background: sel ? "#B8823A" : "rgba(184,130,58,.1)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Timer style={{ width: 16, height: 16, color: sel ? "#fff" : "#B8823A" }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: sel ? "#B8823A" : "#1C1410" }}>{p.label}</p>
                <p style={{ fontSize: 11, color: "#9B8E83" }}>{p.tag}</p>
              </div>
            </button>
          );
        })}
      </div>

      {selectedPlan === "custom" && (
        <div style={{
          background: "#FDFAF6", border: "1px solid #E8E2D9",
          borderRadius: 14, padding: "14px 16px", marginBottom: 16,
        }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#4A3F35", display: "block", marginBottom: 8 }}>
            Hours: <strong style={{ color: "#B8823A", fontSize: 15 }}>{customHours}</strong>
          </label>
          <input
            type="range" min={8} max={24} step={1}
            value={customHours}
            onChange={e => setCustomHours(parseInt(e.target.value))}
            style={{ width: "100%", accentColor: "#B8823A", cursor: "pointer" }}
          />
        </div>
      )}

      <button
        onClick={handleStart}
        disabled={saving}
        style={{
          width: "100%", padding: 15, borderRadius: 50, border: "none",
          background: "#B8823A", color: "#fff", fontWeight: 700, fontSize: 15,
          cursor: saving ? "default" : "pointer", marginBottom: 14,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}
      >
        {saving ? <Loader2 style={{ width: 15, height: 15 }} className="animate-spin" /> : <Play style={{ width: 15, height: 15 }} />}
        Start Fast
      </button>

      <div style={{
        background: "rgba(184,130,58,.06)", border: "1px solid rgba(184,130,58,.2)",
        borderRadius: 12, padding: "12px 14px",
      }}>
        <p style={{ fontSize: 11, color: "#4A3F35", lineHeight: 1.6 }}>
          ⚠️ This is not medical advice. Listen to your body.
        </p>
      </div>
    </div>
  );
}