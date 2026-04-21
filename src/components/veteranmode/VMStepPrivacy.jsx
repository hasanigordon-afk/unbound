import React from "react";
import { Shield, Lock, AlertTriangle } from "lucide-react";
import { VMScreen, VMHeading, VMButton } from "./VMShell";
import { VM } from "./vmData";

const POINTS = [
  { icon: Lock,          title: "Your data stays private",     body: "Anonymous by default. You control what you share." },
  { icon: Shield,        title: "Built for your control",       body: "Change or delete your preferences anytime." },
  { icon: AlertTriangle, title: "Not medical or clinical advice", body: "This app does not replace professional care." },
];

export default function VMStepPrivacy({ onFinish, onBack, saving }) {
  return (
    <VMScreen step={5} total={5} onBack={onBack}>
      <VMHeading
        eyebrow="Step 05 — Privacy"
        title="Before we deploy."
        sub="A quick word on how this works."
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
        {POINTS.map((p, i) => {
          const Icon = p.icon;
          return (
            <div key={i} style={{
              padding: "14px 16px", borderRadius: 12,
              background: VM.surface, border: `1px solid ${VM.border}`,
              display: "flex", gap: 12, alignItems: "flex-start",
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                background: VM.oliveSoft,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon style={{ width: 16, height: 16, color: VM.olive }} strokeWidth={1.8} />
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: VM.text, marginBottom: 2 }}>{p.title}</p>
                <p style={{ fontSize: 12, color: VM.muted, lineHeight: 1.55 }}>{p.body}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: "auto" }}>
        <VMButton onClick={onFinish} loading={saving}>
          {saving ? "Deploying…" : "Deploy Mission Dashboard"}
        </VMButton>
      </div>
    </VMScreen>
  );
}