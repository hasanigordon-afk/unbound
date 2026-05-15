import React from "react";

export default function WhyReZilientExistsSection() {
  return (
    <section className="why-rezilient" style={{ position: "relative", overflow: "hidden", marginBottom: 74, padding: "clamp(30px, 5vw, 56px)", borderRadius: 38, background: "linear-gradient(135deg, rgba(91,141,239,.16), rgba(13,18,32,.78) 48%, rgba(167,139,250,.16))", border: "1px solid rgba(190,215,255,.18)", boxShadow: "var(--glow), var(--shadow)" }}>
      <div aria-hidden className="why-orb" />
      <div style={{ position: "relative", maxWidth: 860 }}>
        <p className="section-label">The Solution</p>
        <h2 style={{ fontSize: "clamp(34px, 5vw, 62px)", lineHeight: 1, margin: 0 }}>Why We Built ReZilient</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "clamp(16px, 2vw, 20px)", lineHeight: 1.8, marginTop: 18 }}>
          ReZilient was created to become more than an app.
        </p>
        <p style={{ color: "var(--text)", fontSize: "clamp(18px, 2.3vw, 24px)", lineHeight: 1.65, marginTop: 16, maxWidth: 780 }}>
          It&apos;s a support system designed to help people rebuild structure, create accountability, locate resources, connect with community, and pursue a better future after life&apos;s hardest moments.
        </p>
        <div style={{ display: "grid", gap: 8, marginTop: 28 }}>
          <strong style={{ fontSize: "clamp(24px, 3vw, 38px)", color: "var(--text)" }}>The goal is not survival.</strong>
          <strong style={{ fontSize: "clamp(28px, 4vw, 52px)", color: "var(--gold)", textShadow: "0 0 28px rgba(240,183,83,.22)" }}>The goal is growth.</strong>
        </div>
      </div>
      <style>{`
        .why-rezilient:before { content: ''; position: absolute; inset: 0; opacity: .12; background-image: radial-gradient(circle, rgba(255,255,255,.8) 0 1px, transparent 1.5px); background-size: 58px 58px; animation: particleDrift 24s linear infinite; }
        .why-orb { position: absolute; right: -120px; bottom: -150px; width: 430px; height: 430px; border-radius: 50%; background: radial-gradient(circle, rgba(167,139,250,.30), transparent 68%); filter: blur(18px); animation: heroFloat 9s ease-in-out infinite; }
      `}</style>
    </section>
  );
}