import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Brain, Handshake, Sprout, TrendingUp } from "lucide-react";

const pillars = [
  { title: "Help", emoji: "🤝", icon: Handshake, to: "/RecoveryHub", color: "var(--accent)", description: "Find housing, transportation, food, jobs and support." },
  { title: "Hope", emoji: "🌱", icon: Sprout, to: "/HopeHub", color: "var(--gold)", description: "Read Ah-Ha moments and comeback stories." },
  { title: "Healing", emoji: "🧠", icon: Brain, to: "/HealingHub", color: "var(--green)", description: "Daily check-ins, wellness and accountability." },
  { title: "Growth", emoji: "📈", icon: TrendingUp, to: "/GrowthHub", color: "var(--purple)", description: "Goals, routines, education and building your future." },
];

export default function FourPillarsSection() {
  return (
    <section style={{ marginBottom: 78 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "end", marginBottom: 18 }}>
        <div>
          <p className="section-label">The 4 Pillars</p>
          <h2 style={{ fontSize: "clamp(32px, 4.5vw, 54px)", margin: 0 }}>Help. Hope. Healing. Growth.</h2>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 16 }}>
        {pillars.map(({ title, emoji, icon: Icon, to, color, description }, index) => (
          <Link key={title} to={to} style={{ textDecoration: "none" }}>
            <article className="pillar-card" style={{ minHeight: 285, padding: 24, borderRadius: 30, background: "linear-gradient(180deg, rgba(255,255,255,0.105), rgba(255,255,255,0.038))", border: "1px solid rgba(190,215,255,.14)", color: "var(--text)", boxShadow: "var(--shadow-sm)", animationDelay: `${index * 110}ms` }}>
              <div className="pillar-icon-wrap" style={{ width: 56, height: 56, borderRadius: 20, display: "grid", placeItems: "center", background: "rgba(255,255,255,0.07)", border: "1px solid var(--border)", color }}>
                <span style={{ fontSize: 22, position: "absolute", transform: "translate(18px, -18px)" }}>{emoji}</span>
                <Icon size={25} />
              </div>
              <h3 style={{ margin: "28px 0 12px", fontSize: 27 }}>{title}</h3>
              <p style={{ color: "var(--text-muted)", fontSize: 14.5, lineHeight: 1.65, minHeight: 70 }}>{description}</p>
              <ArrowRight className="pillar-arrow" size={18} style={{ marginTop: 22, color }} />
            </article>
          </Link>
        ))}
      </div>
      <style>{`
        .pillar-card { position: relative; overflow: hidden; animation: fadeUp .65s cubic-bezier(.22,1,.36,1) both, pillarFloat 6s ease-in-out infinite; transition: transform .22s, border-color .22s, box-shadow .22s; }
        .pillar-card:before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at 50% 0%, rgba(91,141,239,.16), transparent 42%); opacity: .8; pointer-events: none; }
        .pillar-card:hover { transform: translateY(-7px) !important; border-color: var(--border-glow); box-shadow: var(--glow), var(--shadow-card); }
        .pillar-icon-wrap { position: relative; transition: transform .22s; }
        .pillar-card:hover .pillar-icon-wrap { transform: scale(1.08) rotate(-3deg); }
        .pillar-arrow { transition: transform .22s; }
        .pillar-card:hover .pillar-arrow { transform: translateX(5px); }
        @keyframes pillarFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        @media (max-width: 980px) { section [style*="repeat(4"] { grid-template-columns: repeat(2, minmax(0,1fr)) !important; } }
        @media (max-width: 560px) { section [style*="repeat(2"] { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}