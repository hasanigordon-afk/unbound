import React from "react";
import { VMScreen, VMHeading, VMButton, VMLabel } from "./VMShell";
import { VM, BRANCHES, SUPPORT_STYLES } from "./vmData";

export default function VMStepService({ form, onChange, onNext, onSkip, onBack }) {
  return (
    <VMScreen step={1} total={5} onBack={onBack}>
      <VMHeading
        eyebrow="Step 01 — Background"
        title="Service background."
        sub="All fields are optional. This stays private."
      />

      <VMLabel optional>Branch of service</VMLabel>
      <select
        value={form.branch || ""}
        onChange={e => onChange({ ...form, branch: e.target.value })}
        style={{
          width: "100%", padding: "14px 16px", borderRadius: 12,
          background: VM.surface, border: `1px solid ${VM.border}`,
          color: form.branch ? VM.text : VM.dim, fontSize: 15, outline: "none",
          marginBottom: 18, appearance: "none", boxSizing: "border-box",
          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none'><path d='M1 1l5 5 5-5' stroke='%23A8A396' stroke-width='1.5'/></svg>")`,
          backgroundRepeat: "no-repeat", backgroundPosition: "right 16px center",
        }}
      >
        <option value="">Select branch…</option>
        {BRANCHES.map(b => <option key={b.key} value={b.key}>{b.label}</option>)}
      </select>

      <VMLabel optional>Years served</VMLabel>
      <input
        value={form.service_years || ""}
        onChange={e => onChange({ ...form, service_years: e.target.value })}
        placeholder="e.g. 2008–2014"
        style={{
          width: "100%", padding: "14px 16px", borderRadius: 12,
          background: VM.surface, border: `1px solid ${VM.border}`,
          color: VM.text, fontSize: 15, outline: "none",
          marginBottom: 18, boxSizing: "border-box",
        }}
      />

      <VMLabel optional>Combat experience</VMLabel>
      <div style={{ display: "flex", gap: 6, marginBottom: 22 }}>
        {[
          { key: "combat",     label: "Combat" },
          { key: "non_combat", label: "Non-combat" },
          { key: "prefer_not_to_say", label: "Prefer not" },
        ].map(o => {
          const sel = form.combat_experience === o.key;
          return (
            <button key={o.key} onClick={() => onChange({ ...form, combat_experience: sel ? null : o.key })} style={{
              flex: 1, padding: "11px 8px", borderRadius: 10, cursor: "pointer",
              background: sel ? VM.oliveSoft : VM.surface,
              border: `1px solid ${sel ? VM.olive : VM.border}`,
              color: sel ? VM.olive : VM.muted,
              fontSize: 12, fontWeight: 700, fontFamily: "inherit",
            }}>
              {o.label}
            </button>
          );
        })}
      </div>

      <VMLabel>Preferred support style</VMLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
        {SUPPORT_STYLES.map(s => {
          const sel = form.support_style === s.key;
          return (
            <button key={s.key} onClick={() => onChange({ ...form, support_style: s.key })} style={{
              padding: "13px 16px", borderRadius: 12, cursor: "pointer",
              background: sel ? VM.oliveSoft : VM.surface,
              border: `1px solid ${sel ? VM.olive : VM.border}`,
              textAlign: "left", color: VM.text, fontFamily: "inherit",
            }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: sel ? VM.olive : VM.text, marginBottom: 2 }}>{s.label}</p>
              <p style={{ fontSize: 12, color: VM.muted }}>{s.sub}</p>
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
        <VMButton onClick={onNext}>Continue</VMButton>
        <VMButton onClick={onSkip} variant="ghost">Skip this step</VMButton>
      </div>
    </VMScreen>
  );
}