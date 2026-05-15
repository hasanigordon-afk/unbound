import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Briefcase, Dumbbell, HeartHandshake, Sparkles, Target, Users } from "lucide-react";

const previewGoals = [
  { title: "Family", icon: Users, progress: 72, priority: "High" },
  { title: "Employment", icon: Briefcase, progress: 58, priority: "High" },
  { title: "Meetings", icon: HeartHandshake, progress: 84, priority: "Daily" },
  { title: "Fitness", icon: Dumbbell, progress: 46, priority: "Medium" },
  { title: "Education", icon: BookOpen, progress: 34, priority: "Build" },
];

export default function NonNegotiablesPreview() {
  return (
    <section className="mission-board-preview" style={{
      position: "relative",
      margin: "0 0 78px",
      padding: "clamp(26px, 4.5vw, 44px)",
      borderRadius: 38,
      overflow: "hidden",
      background: "linear-gradient(135deg, rgba(255,255,255,0.11), rgba(13,18,32,0.84) 46%, rgba(167,139,250,0.16))",
      border: "1px solid rgba(190,215,255,0.18)",
      boxShadow: "var(--glow), var(--shadow)",
      backdropFilter: "blur(26px) saturate(160%)",
    }}>
      <div aria-hidden style={{ position: "absolute", right: -90, top: -110, width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(167,139,250,0.28), transparent 68%)", filter: "blur(18px)" }} />
      <div aria-hidden style={{ position: "absolute", left: 28, top: 18, color: "rgba(255,255,255,0.10)", fontFamily: "cursive", fontSize: 34, transform: "rotate(-4deg)" }}>remember why.</div>

      <div style={{ position: "relative", zIndex: 2 }}>
        <div style={{ maxWidth: 760, marginBottom: 24 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 13px", borderRadius: 999, background: "rgba(255,255,255,0.08)", border: "1px solid var(--border)", color: "var(--gold)", fontSize: 11, fontWeight: 900, letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 14 }}>
            <Target style={{ width: 14, height: 14 }} /> Your comeback starts with five promises.
          </div>
          <h2 style={{ fontSize: "clamp(32px, 4.7vw, 56px)", lineHeight: 1, margin: 0 }}>My Non-Negotiables</h2>
          <p style={{ marginTop: 14, color: "var(--text-muted)", fontSize: 16, lineHeight: 1.7, maxWidth: 560 }}>
            The five things I refuse to break.
          </p>
        </div>

        <div className="mission-card-row" style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 13 }}>
          {previewGoals.map(({ title, icon: Icon, progress, priority }, index) => (
            <Link key={title} to="/TopFiveNonNegotiables" style={{ textDecoration: "none" }}>
              <div className="mission-mini-card" style={{ minHeight: 210, padding: 16, borderRadius: 25, color: "var(--text)", background: "linear-gradient(180deg, rgba(255,255,255,0.105), rgba(255,255,255,0.045))", border: index === 0 ? "1px solid var(--border-glow)" : "1px solid var(--border)", boxShadow: index === 0 ? "0 0 28px rgba(91,141,239,0.25)" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <span style={{ color: "var(--text-dim)", fontSize: 11, fontWeight: 900 }}>0{index + 1}</span>
                  {index === 0 ? <Sparkles style={{ width: 16, height: 16, color: "var(--gold)" }} /> : <Icon style={{ width: 16, height: 16, color: "var(--accent)" }} />}
                </div>
                <h3 style={{ fontSize: 18, lineHeight: 1.2, margin: 0 }}>{title}</h3>
                <span style={{ display: "inline-flex", marginTop: 13, padding: "5px 9px", borderRadius: 999, background: "rgba(255,255,255,.075)", border: "1px solid var(--border)", color: "var(--gold)", fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: ".08em" }}>{priority}</span>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginTop: 18 }}>
                  <span style={{ color: "var(--text)", fontSize: 24, fontWeight: 900 }}>{progress}%</span>
                  <Icon style={{ width: 17, height: 17, color: "var(--text-dim)" }} />
                </div>
                <div style={{ marginTop: 12, height: 8, background: "rgba(255,255,255,0.08)", borderRadius: 999, overflow: "hidden" }}>
                  <div className="mission-progress" style={{ width: `${progress}%`, height: "100%", borderRadius: 999, background: "linear-gradient(90deg, var(--accent), var(--purple), var(--gold))" }} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        <Link to="/TopFiveNonNegotiables" style={{ textDecoration: "none", display: "inline-flex", marginTop: 28 }}>
          <button className="btn-primary mission-board-button">Go To Mission Board <ArrowRight className="mission-board-arrow" style={{ width: 16, height: 16, marginLeft: 8, verticalAlign: "-3px" }} /></button>
        </Link>
      </div>

      <style>{`
        .mission-board-preview { animation: missionBoardGlow 6s ease-in-out infinite; }
        .mission-mini-card { transition: transform .22s, border-color .22s, box-shadow .22s; animation: fadeUp .65s cubic-bezier(.22,1,.36,1) both; }
        .mission-mini-card:hover { transform: translateY(-6px) rotate(-.5deg); border-color: var(--border-glow); box-shadow: var(--glow); }
        .mission-progress { animation: progressShine 2.8s ease-in-out infinite; }
        .mission-board-arrow { transition: transform .22s; }
        .mission-board-button:hover .mission-board-arrow { transform: translateX(5px); }
        @keyframes missionBoardGlow { 0%,100% { box-shadow: var(--glow), var(--shadow); } 50% { box-shadow: 0 0 46px rgba(167,139,250,0.34), var(--shadow); } }
        @keyframes progressShine { 0%,100% { filter: brightness(1); } 50% { filter: brightness(1.35); } }
        @media (max-width: 1100px) { .mission-card-row { grid-template-columns: repeat(2, minmax(0,1fr)) !important; } }
        @media (max-width: 560px) { .mission-card-row { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}