import React from "react";
import { Phone } from "lucide-react";
import { VM } from "../vmData";

const LINES = [
  { label: "988 — Press 1",       number: "988",          sub: "Veterans Crisis Line",    accent: VM.red },
  { label: "Vet2Vet",              number: "18778388255",  sub: "Peer support",             accent: VM.olive },
  { label: "Vets4Warriors",       number: "18558387100",  sub: "24/7 confidential",        accent: VM.olive },
  { label: "Vet Center Line",      number: "18779272727",  sub: "Readjustment counseling",  accent: VM.olive },
];

export default function VMDSupportCard() {
  return (
    <div style={{
      background: VM.surface, border: `1px solid ${VM.border}`,
      borderRadius: 14, padding: "16px 18px",
    }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: VM.dim, textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 4 }}>
        Support Lines
      </p>
      <p style={{ fontSize: 16, fontWeight: 500, color: VM.text, marginBottom: 14, fontFamily: "'Lora', serif" }}>
        Support, when you need it.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {LINES.map(l => (
          <a key={l.number} href={`tel:${l.number}`} style={{ textDecoration: "none" }}>
            <div style={{
              padding: "12px 14px", borderRadius: 10,
              background: "transparent", border: `1px solid ${l.accent}40`,
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                background: `${l.accent}20`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Phone style={{ width: 14, height: 14, color: l.accent }} strokeWidth={1.8} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: VM.text, marginBottom: 1 }}>{l.label}</p>
                <p style={{ fontSize: 11, color: VM.dim }}>{l.sub}</p>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: l.accent, letterSpacing: ".05em" }}>CALL</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}