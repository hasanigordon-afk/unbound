import React from "react";
import { Building2, ClipboardCheck, Users, BarChart3 } from "lucide-react";

const ITEMS = [
  { icon: ClipboardCheck, label: "Aftercare navigation" },
  { icon: Users, label: "Participant engagement" },
  { icon: BarChart3, label: "Scalable support pathways" },
];

export default function InstitutionalPartnershipSection() {
  return (
    <section className="card-glow" style={{ padding: 20, marginTop: 18, background: "linear-gradient(145deg, rgba(167,139,250,0.12), rgba(91,141,239,0.10))" }}>
      <div style={{ width: 42, height: 42, borderRadius: 14, background: "var(--navy-dim)", border: "1px solid var(--border-glow)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)", marginBottom: 14 }}>
        <Building2 style={{ width: 20, height: 20 }} />
      </div>
      <p className="section-label" style={{ color: "var(--purple)", marginBottom: 10 }}>Institutional-ready</p>
      <h2 style={{ fontSize: 22, lineHeight: 1.18, marginBottom: 10 }}>Professional infrastructure for long-term recovery.</h2>
      <p style={{ color: "var(--text-muted)", fontSize: 13.5, lineHeight: 1.65, marginBottom: 16 }}>
        Designed for treatment centers, reentry programs, veteran organizations, community providers, and facilities that need modern digital continuity of care.
      </p>
      <div style={{ display: "grid", gap: 8 }}>
        {ITEMS.map(({ icon: Icon, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 14, background: "var(--surface)", border: "1px solid var(--border)" }}>
            <Icon style={{ width: 15, height: 15, color: "var(--accent)" }} />
            <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text)" }}>{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}