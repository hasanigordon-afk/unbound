import React from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { VMScreen, VMHeading, VMButton } from "./VMShell";
import { VM, RESOURCE_PRIORITIES } from "./vmData";

export default function VMStepResources({ form, onChange, onNext, onBack }) {
  // Start with user-ordered list (default to full list in declared order)
  const order = (form.resource_priority && form.resource_priority.length === RESOURCE_PRIORITIES.length)
    ? form.resource_priority
    : RESOURCE_PRIORITIES.map(r => r.key);

  const move = (idx, dir) => {
    const next = [...order];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange({ ...form, resource_priority: next });
  };

  return (
    <VMScreen step={4} total={5} onBack={onBack}>
      <VMHeading
        eyebrow="Step 04 — Resources"
        title="Order what matters most."
        sub="Move the resources you need first to the top."
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
        {order.map((key, idx) => {
          const r = RESOURCE_PRIORITIES.find(x => x.key === key);
          if (!r) return null;
          return (
            <div key={key} style={{
              padding: "12px 14px", borderRadius: 12,
              background: idx === 0 ? VM.oliveSoft : VM.surface,
              border: `1px solid ${idx === 0 ? VM.olive : VM.border}`,
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <span style={{
                fontSize: 11, fontWeight: 800, color: idx === 0 ? VM.olive : VM.dim,
                width: 20, textAlign: "center", letterSpacing: ".05em",
              }}>
                {String(idx + 1).padStart(2, "0")}
              </span>
              <span style={{ fontSize: 18 }}>{r.emoji}</span>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: VM.text }}>{r.label}</span>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <button onClick={() => move(idx, -1)} disabled={idx === 0} style={{
                  background: "none", border: "none", padding: 2, cursor: idx === 0 ? "default" : "pointer",
                  color: idx === 0 ? VM.dim : VM.muted,
                }}>
                  <ChevronUp style={{ width: 16, height: 16 }} />
                </button>
                <button onClick={() => move(idx, 1)} disabled={idx === order.length - 1} style={{
                  background: "none", border: "none", padding: 2, cursor: idx === order.length - 1 ? "default" : "pointer",
                  color: idx === order.length - 1 ? VM.dim : VM.muted,
                }}>
                  <ChevronDown style={{ width: 16, height: 16 }} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: "auto" }}>
        <VMButton onClick={() => { onChange({ ...form, resource_priority: order }); onNext(); }}>
          Continue
        </VMButton>
      </div>
    </VMScreen>
  );
}