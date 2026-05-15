import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, HeartPulse, LifeBuoy, Map, Sprout } from "lucide-react";

const pillars = [
  { title: "Healing", icon: HeartPulse, to: "/HealingHub", color: "var(--green)", items: ["Reset tools", "Reflection", "Wellness"] },
  { title: "Support", icon: LifeBuoy, to: "/HopeHub", color: "var(--purple)", items: ["AI Stein", "Community", "Safety"] },
  { title: "Resources", icon: Map, to: "/RebuildHub", color: "var(--gold)", items: ["Food", "Housing", "Jobs"] },
  { title: "Growth", icon: Sprout, to: "/GrowthHub", color: "var(--accent)", items: ["Goals", "Fitness", "Future"] },
];

export default function FourPillarsSection() {
  return (
    <section style={{ marginBottom: 74 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "end", marginBottom: 16 }}>
        <div>
          <p className="section-label">The Platform</p>
          <h2 style={{ fontSize: "clamp(30px, 4vw, 48px)", margin: 0 }}>Four Pillars</h2>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 14 }}>
        {pillars.map(({ title, icon: Icon, to, color, items }) => (
          <Link key={title} to={to} style={{ textDecoration: "none" }}>
            <article className="pillar-card" style={{ minHeight: 235, padding: 22, borderRadius: 28, background: "linear-gradient(180deg, rgba(255,255,255,0.09), rgba(255,255,255,0.035))", border: "1px solid var(--border)", color: "var(--text)", boxShadow: "var(--shadow-sm)" }}>
              <div style={{ width: 48, height: 48, borderRadius: 18, display: "grid", placeItems: "center", background: "rgba(255,255,255,0.07)", border: "1px solid var(--border)", color }}><Icon size={23} /></div>
              <h3 style={{ margin: "22px 0 10px", fontSize: 25 }}>{title}</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {items.map((item) => <span key={item} className="pill pill-ghost" style={{ fontSize: 10 }}>{item}</span>)}
              </div>
              <ArrowRight size={17} style={{ marginTop: 24, color }} />
            </article>
          </Link>
        ))}
      </div>
      <style>{`.pillar-card { transition: transform .22s, border-color .22s, box-shadow .22s; } .pillar-card:hover { transform: translateY(-5px); border-color: var(--border-glow); box-shadow: var(--glow), var(--shadow-card); } @media (max-width: 980px) { section [style*="repeat(4"] { grid-template-columns: repeat(2, minmax(0,1fr)) !important; } } @media (max-width: 560px) { section [style*="repeat(2"] { grid-template-columns: 1fr !important; } }`}</style>
    </section>
  );
}