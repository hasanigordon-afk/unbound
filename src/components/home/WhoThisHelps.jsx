import React from "react";
import { Shield, HeartHandshake, Home, Building2 } from "lucide-react";

const GROUPS = [
  { icon: HeartHandshake, title: "People in recovery", text: "Daily structure, encouragement, safety tools, and practical next steps." },
  { icon: Home, title: "People rebuilding after reentry", text: "Housing, work, resources, routines, and stability support in one place." },
  { icon: Shield, title: "Veterans and families", text: "Veteran-aware resources, crisis support, wellness, and community connection." },
  { icon: Building2, title: "Facilities & partners", text: "A scalable digital layer for aftercare, engagement, discharge, and support." },
];

export default function WhoThisHelps() {
  return (
    <section className="card-glow fade-up" style={{ padding: 20, marginTop: 18, background: "linear-gradient(145deg, rgba(91,141,239,0.12), rgba(52,211,153,0.08))" }}>
      <p className="section-label" style={{ color: "var(--green)", marginBottom: 12 }}>Who this helps</p>
      <h2 style={{ fontSize: 22, lineHeight: 1.18, marginBottom: 10 }}>Built for people and systems that support second chances.</h2>
      <p style={{ color: "var(--text-muted)", fontSize: 13.5, lineHeight: 1.65, marginBottom: 16 }}>
        Re-silient supports the human journey while giving organizations a clearer way to guide people forward.
      </p>
      <div style={{ display: "grid", gap: 10 }}>
        {GROUPS.map(({ icon: Icon, title, text }) => (
          <div key={title} className="card-soft" style={{ padding: 14, display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: "var(--navy-dim)", border: "1px solid var(--border-glow)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)", flexShrink: 0 }}>
              <Icon style={{ width: 17, height: 17 }} />
            </div>
            <div>
              <p style={{ fontWeight: 800, fontSize: 13.5, color: "var(--text)", marginBottom: 3 }}>{title}</p>
              <p style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5 }}>{text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}