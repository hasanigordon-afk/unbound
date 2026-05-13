import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function HomeRail({ title, sub, icon: Icon, items }) {
  return (
    <section style={{ marginTop: 28 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 13, display: "grid", placeItems: "center", background: "var(--navy-dim)", border: "1px solid var(--border-glow)", color: "var(--accent)" }}>
            <Icon style={{ width: 17, height: 17 }} />
          </div>
          <div>
            <h2 style={{ fontSize: 18, margin: 0 }}>{title}</h2>
            {sub && <p style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 3 }}>{sub}</p>}
          </div>
        </div>
      </div>
      <div className="home-rail" style={{ display: "flex", gap: 14, overflowX: "auto", scrollSnapType: "x mandatory", padding: "2px 2px 12px" }}>
        {items.map(({ to, icon: ItemIcon, label, description, color = "var(--accent)" }) => (
          <Link key={label} to={to} style={{ textDecoration: "none", minWidth: 255, scrollSnapAlign: "start" }}>
            <div className="home-rail-card" style={{ minHeight: 142, padding: 18, borderRadius: 22, background: "rgba(255,255,255,0.045)", border: "1px solid var(--border)", color: "var(--text)", backdropFilter: "blur(16px)", transition: "transform .22s, border-color .22s, box-shadow .22s" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                <div style={{ width: 42, height: 42, borderRadius: 16, display: "grid", placeItems: "center", background: "rgba(255,255,255,0.06)", color }}>
                  <ItemIcon style={{ width: 20, height: 20 }} />
                </div>
                <ArrowRight style={{ width: 16, height: 16, color: "var(--text-dim)" }} />
              </div>
              <h3 style={{ fontSize: 16, margin: 0 }}>{label}</h3>
              <p style={{ color: "var(--text-muted)", fontSize: 12.5, lineHeight: 1.55, marginTop: 7 }}>{description}</p>
            </div>
          </Link>
        ))}
      </div>
      <style>{`
        .home-rail::-webkit-scrollbar { height: 6px; }
        .home-rail-card:hover { transform: translateY(-3px); border-color: var(--border-glow); box-shadow: var(--glow); }
      `}</style>
    </section>
  );
}