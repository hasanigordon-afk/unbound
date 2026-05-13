import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CalendarDays, ClipboardList, Sparkles, Target } from "lucide-react";
import { base44 } from "@/api/base44Client";

const sampleGoals = [
  "Stay sober for 1 year",
  "Get my own apartment",
  "Repair family relationships",
  "Build financial stability",
  "Protect my peace",
];

export default function NonNegotiablesPreview() {
  const { data: goals = [] } = useQuery({
    queryKey: ["top-five-non-negotiables-preview"],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.TopFiveNonNegotiable.filter({ user_email: user.email, is_active: true }, "sort_order", 5);
    },
    initialData: [],
  });

  const displayGoals = goals.length ? goals : sampleGoals.map((title, index) => ({ title, progress: index === 0 ? 20 : 0, sort_order: index + 1 }));
  const avgProgress = goals.length ? Math.round(goals.reduce((sum, goal) => sum + (goal.progress || 0), 0) / goals.length) : 0;

  return (
    <section className="mission-board-preview" style={{
      position: "relative",
      margin: "0 0 30px",
      padding: "clamp(24px, 4vw, 38px)",
      borderRadius: 34,
      overflow: "hidden",
      background: "linear-gradient(135deg, rgba(255,255,255,0.10), rgba(13,18,32,0.82) 46%, rgba(167,139,250,0.14))",
      border: "1px solid rgba(255,255,255,0.16)",
      boxShadow: "var(--glow), var(--shadow)",
      backdropFilter: "blur(24px) saturate(150%)",
    }}>
      <div aria-hidden style={{ position: "absolute", right: -90, top: -110, width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(167,139,250,0.26), transparent 68%)", filter: "blur(18px)" }} />
      <div aria-hidden style={{ position: "absolute", left: 28, top: 18, color: "rgba(255,255,255,0.10)", fontFamily: "cursive", fontSize: 34, transform: "rotate(-4deg)" }}>remember why.</div>

      <div style={{ position: "relative", display: "grid", gridTemplateColumns: "minmax(0, .95fr) minmax(320px, 1.05fr)", gap: 28, alignItems: "center" }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 13px", borderRadius: 999, background: "rgba(255,255,255,0.08)", border: "1px solid var(--border)", color: "var(--gold)", fontSize: 11, fontWeight: 900, letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 14 }}>
            <ClipboardList style={{ width: 14, height: 14 }} /> Mission Board
          </div>
          <h2 style={{ fontSize: "clamp(30px, 4.5vw, 52px)", lineHeight: 1, margin: 0 }}>Top 5 Non‑Negotiables</h2>
          <p style={{ marginTop: 14, color: "var(--text-muted)", fontSize: 15.5, lineHeight: 1.7, maxWidth: 560 }}>
            The 5 promises you made to yourself.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 22, alignItems: "center" }}>
            <Link to="/TopFiveNonNegotiables" style={{ textDecoration: "none" }}>
              <button className="btn-primary" style={{ minWidth: 214 }}>Update Mission <ArrowRight style={{ width: 15, height: 15, marginLeft: 8, verticalAlign: "-3px" }} /></button>
            </Link>
            <span style={{ color: "var(--text-dim)", fontSize: 12, fontWeight: 800 }}>{goals.length || 0}/5 defined • {avgProgress}% momentum</span>
          </div>
        </div>

        <div className="mission-card-row" style={{ display: "flex", gap: 12, overflowX: "auto", scrollSnapType: "x mandatory", paddingBottom: 8 }}>
          {displayGoals.slice(0, 5).map((goal, index) => (
            <Link key={`${goal.title}-${index}`} to="/TopFiveNonNegotiables" style={{ textDecoration: "none", minWidth: 206, scrollSnapAlign: "start" }}>
              <div className="mission-mini-card" style={{
                minHeight: 186,
                padding: 16,
                borderRadius: 24,
                color: "var(--text)",
                background: "linear-gradient(180deg, rgba(255,255,255,0.105), rgba(255,255,255,0.045))",
                border: index === 0 ? "1px solid var(--border-glow)" : "1px solid var(--border)",
                boxShadow: index === 0 ? "0 0 28px rgba(91,141,239,0.25)" : "none",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                  <span style={{ color: "var(--text-dim)", fontSize: 11, fontWeight: 900 }}>0{index + 1}</span>
                  {index === 0 ? <Sparkles style={{ width: 16, height: 16, color: "var(--gold)" }} /> : <Target style={{ width: 15, height: 15, color: "var(--accent)" }} />}
                </div>
                <h3 style={{ fontSize: 17, lineHeight: 1.2, margin: 0 }}>{goal.title}</h3>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginTop: 18 }}>
                  <span style={{ color: "var(--gold)", fontSize: 22, fontWeight: 900 }}>{goal.progress || 0}%</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "var(--text-dim)", fontSize: 11, fontWeight: 800 }}><CalendarDays size={12} /> Day 90</span>
                </div>
                <div style={{ marginTop: 12, height: 8, background: "rgba(255,255,255,0.08)", borderRadius: 999, overflow: "hidden" }}>
                  <div style={{ width: `${goal.progress || 0}%`, height: "100%", borderRadius: 999, background: "linear-gradient(90deg, var(--accent), var(--purple), var(--gold))" }} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <style>{`
        .mission-board-preview { animation: missionBoardGlow 6s ease-in-out infinite; }
        .mission-mini-card { transition: transform .22s, border-color .22s, box-shadow .22s; }
        .mission-mini-card:hover { transform: translateY(-4px) rotate(-.5deg); border-color: var(--border-glow); box-shadow: var(--glow); }
        .mission-card-row::-webkit-scrollbar { height: 6px; }
        @keyframes missionBoardGlow { 0%,100% { box-shadow: var(--glow), var(--shadow); } 50% { box-shadow: 0 0 46px rgba(167,139,250,0.34), var(--shadow); } }
        @media (max-width: 860px) { .mission-board-preview > div[style*="grid-template-columns"] { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}