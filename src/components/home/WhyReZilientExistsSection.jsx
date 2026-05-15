import React from "react";
import { CheckCircle2, Sparkles } from "lucide-react";

export default function WhyReZilientExistsSection() {
  return (
    <section className="why-rezilient" style={{ position: "relative", overflow: "hidden", marginBottom: 78, padding: "clamp(30px, 5vw, 56px)", borderRadius: 38, background: "linear-gradient(135deg, rgba(91,141,239,.16), rgba(13,18,32,.80) 48%, rgba(167,139,250,.17))", border: "1px solid rgba(190,215,255,.18)", boxShadow: "var(--glow), var(--shadow)", display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(280px, 420px)", gap: 34, alignItems: "center" }}>
      <div aria-hidden className="why-orb" />
      <div style={{ position: "relative", zIndex: 2 }}>
        <p className="section-label">Why We Built ReZilient</p>
        <h2 style={{ fontSize: "clamp(34px, 5vw, 62px)", lineHeight: 1, margin: 0 }}>More Than An App. A Comeback System.</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "clamp(16px, 2vw, 20px)", lineHeight: 1.8, marginTop: 18 }}>
          ReZilient was created to become more than an app.
        </p>
        <p style={{ color: "var(--text)", fontSize: "clamp(18px, 2.2vw, 23px)", lineHeight: 1.65, marginTop: 16, maxWidth: 780 }}>
          It is a support system designed to help people rebuild structure, create accountability, locate resources, connect with community, and pursue a better future after life&apos;s hardest moments.
        </p>
        <div className="growth-quote" style={{ marginTop: 28, padding: 22, borderRadius: 26, background: "rgba(255,255,255,.075)", border: "1px solid rgba(190,215,255,.16)" }}>
          <strong style={{ display: "block", fontSize: "clamp(24px, 3vw, 36px)", color: "var(--text)" }}>“The goal is not survival.</strong>
          <strong style={{ display: "block", marginTop: 6, fontSize: "clamp(28px, 4vw, 50px)", color: "var(--gold)", textShadow: "0 0 28px rgba(240,183,83,.22)" }}>The goal is growth.”</strong>
        </div>
      </div>

      <div className="phone-mockup" aria-label="ReZilient phone mockup">
        <div className="phone-notch" />
        <div className="phone-screen">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <strong style={{ fontSize: 18 }}>ReZilient</strong>
            <Sparkles size={18} color="var(--gold)" />
          </div>
          <div className="phone-score">72%</div>
          <p style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 4 }}>Today&apos;s comeback momentum</p>
          {["Daily Check-In", "Find Support", "Mission Board"].map((item, i) => (
            <div key={item} className="phone-row" style={{ animationDelay: `${i * 160}ms` }}>
              <CheckCircle2 size={15} color="var(--green)" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .why-rezilient:before { content: ''; position: absolute; inset: 0; opacity: .12; background-image: radial-gradient(circle, rgba(255,255,255,.8) 0 1px, transparent 1.5px); background-size: 58px 58px; animation: particleDrift 24s linear infinite; }
        .why-orb { position: absolute; right: -120px; bottom: -150px; width: 430px; height: 430px; border-radius: 50%; background: radial-gradient(circle, rgba(167,139,250,.30), transparent 68%); filter: blur(18px); animation: heroFloat 9s ease-in-out infinite; }
        .phone-mockup { position: relative; z-index: 2; width: min(100%, 330px); margin: 0 auto; min-height: 520px; border-radius: 46px; padding: 14px; background: linear-gradient(145deg, rgba(255,255,255,.20), rgba(20,26,45,.66)); border: 1px solid rgba(220,235,255,.22); box-shadow: 0 0 60px rgba(91,141,239,.34), 0 30px 70px rgba(0,0,0,.44), inset 0 1px 0 rgba(255,255,255,.20); animation: phoneFloat 7s ease-in-out infinite; }
        .phone-notch { position: absolute; top: 18px; left: 50%; transform: translateX(-50%); width: 92px; height: 22px; border-radius: 999px; background: rgba(5,8,18,.85); z-index: 3; }
        .phone-screen { min-height: 490px; border-radius: 34px; padding: 56px 22px 22px; background: radial-gradient(circle at 50% 0%, rgba(91,141,239,.22), transparent 35%), linear-gradient(180deg, rgba(7,10,20,.96), rgba(13,18,32,.88)); border: 1px solid rgba(255,255,255,.10); overflow: hidden; }
        .phone-score { font-size: 58px; font-weight: 900; letter-spacing: -.06em; background: linear-gradient(135deg, var(--text), var(--accent), var(--purple)); -webkit-background-clip: text; color: transparent; }
        .phone-row { margin-top: 14px; padding: 14px; border-radius: 18px; display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.10); color: var(--text); font-weight: 800; font-size: 13px; animation: fadeUp .7s cubic-bezier(.22,1,.36,1) both; }
        @keyframes phoneFloat { 0%,100% { transform: translateY(0) rotate(2deg); } 50% { transform: translateY(-12px) rotate(-1deg); } }
        @media (max-width: 900px) { .why-rezilient { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}