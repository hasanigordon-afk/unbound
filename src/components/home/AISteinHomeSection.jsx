import React from "react";
import { Link } from "react-router-dom";
import { Mic, PenLine, Sparkles } from "lucide-react";

export default function AISteinHomeSection() {
  return (
    <section className="card-glow" style={{ padding: "clamp(24px, 4vw, 38px)", marginBottom: 28, background: "linear-gradient(135deg, rgba(167,139,250,0.15), rgba(20,26,45,0.62), rgba(91,141,239,0.14))" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 22, alignItems: "center" }}>
        <div>
          <div className="pill pill-teal" style={{ marginBottom: 14 }}><Sparkles size={13} style={{ marginRight: 7 }} /> AI Stein</div>
          <h2 style={{ fontSize: "clamp(30px, 4vw, 48px)", margin: 0 }}>Talk it out. Write it down. Keep moving.</h2>
          <p style={{ color: "var(--text-muted)", lineHeight: 1.7, marginTop: 12 }}>Private, judgment-free support when you need a next step or a moment to breathe.</p>
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link to="/SuperAgent" style={{ textDecoration: "none" }}><button className="btn-primary"><Mic size={16} style={{ marginRight: 8, verticalAlign: "-3px" }} /> Talk</button></Link>
          <Link to="/FiveWs" style={{ textDecoration: "none" }}><button className="btn-ghost"><PenLine size={16} style={{ marginRight: 8, verticalAlign: "-3px" }} /> Write</button></Link>
        </div>
      </div>
      <style>{`@media (max-width: 780px) { section [style*="grid-template-columns: 1fr auto"] { grid-template-columns: 1fr !important; } }`}</style>
    </section>
  );
}