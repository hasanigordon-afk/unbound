import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck } from "lucide-react";

export default function VeteranSupportModule() {
  return (
    <section className="card-soft" style={{
      marginTop: 30,
      padding: "22px clamp(20px, 3vw, 28px)",
      display: "grid",
      gridTemplateColumns: "minmax(0, 1fr) auto",
      gap: 18,
      alignItems: "center",
      background: "linear-gradient(135deg, rgba(60,59,110,0.16), rgba(13,18,32,0.72), rgba(178,34,52,0.08))",
      borderColor: "rgba(255,255,255,0.12)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
        <div style={{ width: 48, height: 48, borderRadius: 18, display: "grid", placeItems: "center", background: "linear-gradient(135deg, rgba(60,59,110,0.55), rgba(178,34,52,0.24))", border: "1px solid rgba(255,255,255,0.16)", color: "#fff" }}>
          <ShieldCheck style={{ width: 23, height: 23 }} />
        </div>
        <div>
          <div style={{ color: "#dbe7ff", fontSize: 10.5, fontWeight: 900, letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 5 }}>🇺🇸 Veteran Support</div>
          <h2 style={{ fontSize: "clamp(20px, 3vw, 27px)", margin: 0 }}>Mission-focused resources, benefits, housing, jobs, and peer support.</h2>
        </div>
      </div>
      <Link to="/VeteranSupportHub" style={{ textDecoration: "none" }}>
        <button className="btn-ghost" style={{ minWidth: 218, borderColor: "rgba(255,255,255,0.18)" }}>
          Explore Veteran Resources <ArrowRight style={{ width: 15, height: 15, marginLeft: 8, verticalAlign: "-3px" }} />
        </button>
      </Link>
      <style>{`@media (max-width: 760px) { section.card-soft { grid-template-columns: 1fr !important; } }`}</style>
    </section>
  );
}