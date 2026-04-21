import React from "react";
import { Check } from "lucide-react";
import { VMScreen, VMHeading, VMButton } from "./VMShell";
import { VM, FOCUS_OPTIONS } from "./vmData";

export default function VMStepFocus({ form, onChange, onNext, onBack }) {
  const selected = new Set(form.current_focus || []);
  const toggle = (key) => {
    const next = new Set(selected);
    if (next.has(key)) next.delete(key); else next.add(key);
    onChange({ ...form, current_focus: Array.from(next) });
  };

  return (
    <VMScreen step={2} total={5} onBack={onBack}>
      <VMHeading
        eyebrow="Step 02 — Focus"
        title="What's your focus right now?"
        sub="Pick as many as apply. We'll build around them."
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
        {FOCUS_OPTIONS.map(opt => {
          const sel = selected.has(opt.key);
          return (
            <button key={opt.key} onClick={() => toggle(opt.key)} style={{
              padding: "14px 16px", borderRadius: 12, cursor: "pointer",
              background: sel ? VM.oliveSoft : VM.surface,
              border: `1px solid ${sel ? VM.olive : VM.border}`,
              display: "flex", alignItems: "center", gap: 12,
              textAlign: "left", fontFamily: "inherit",
            }}>
              <span style={{ fontSize: 20 }}>{opt.emoji}</span>
              <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: sel ? VM.olive : VM.text }}>{opt.label}</span>
              {sel && <Check style={{ width: 16, height: 16, color: VM.olive }} strokeWidth={2.5} />}
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: "auto" }}>
        <VMButton onClick={onNext} disabled={selected.size === 0}>Continue</VMButton>
      </div>
    </VMScreen>
  );
}