import React from "react";
import { VMScreen, VMHeading, VMButton, VMLabel } from "./VMShell";
import { VM, NOTIFICATION_TONES } from "./vmData";

export default function VMStepStructure({ form, onChange, onNext, onBack }) {
  return (
    <VMScreen step={3} total={5} onBack={onBack}>
      <VMHeading
        eyebrow="Step 03 — Structure"
        title="Set your daily rhythm."
        sub="Pick a time and a tone. Adjust anytime."
      />

      <VMLabel>Daily check-in time</VMLabel>
      <input
        type="time"
        value={form.checkin_time || "08:00"}
        onChange={e => onChange({ ...form, checkin_time: e.target.value })}
        style={{
          width: "100%", padding: "14px 16px", borderRadius: 12,
          background: VM.surface, border: `1px solid ${VM.border}`,
          color: VM.text, fontSize: 15, outline: "none",
          marginBottom: 22, boxSizing: "border-box",
          colorScheme: "dark",
        }}
      />

      <VMLabel>Notification tone</VMLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
        {NOTIFICATION_TONES.map(t => {
          const sel = form.notification_tone === t.key;
          return (
            <button key={t.key} onClick={() => onChange({ ...form, notification_tone: t.key })} style={{
              padding: "14px 16px", borderRadius: 12, cursor: "pointer",
              background: sel ? VM.oliveSoft : VM.surface,
              border: `1px solid ${sel ? VM.olive : VM.border}`,
              textAlign: "left", fontFamily: "inherit",
            }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: sel ? VM.olive : VM.text, marginBottom: 2 }}>{t.label}</p>
              <p style={{ fontSize: 12, color: VM.muted }}>{t.sub}</p>
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: "auto" }}>
        <VMButton onClick={onNext} disabled={!form.notification_tone}>Continue</VMButton>
      </div>
    </VMScreen>
  );
}