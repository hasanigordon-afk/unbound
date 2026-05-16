import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarCheck, Compass, Sparkles } from "lucide-react";

export default function StartupHero() {
  return (
    <section className="startup-hero" style={{
      position: "relative",
      overflow: "hidden",
      borderRadius: 46,
      padding: "clamp(34px, 6vw, 82px)",
      minHeight: 720,
      display: "grid",
      gridTemplateColumns: "1fr",
      gap: "clamp(28px, 5vw, 70px)",
      alignItems: "center",
      background: "linear-gradient(135deg, rgba(91,141,239,0.20), rgba(7,10,20,0.92) 42%, rgba(167,139,250,0.24))",
      border: "1px solid rgba(190,215,255,0.24)",
      boxShadow: "0 0 90px rgba(91,141,239,0.25), 0 34px 90px rgba(0,0,0,0.54), inset 0 1px 0 rgba(255,255,255,0.12)",
      backdropFilter: "blur(34px) saturate(170%)",
      marginBottom: 78,
    }}>
      <div aria-hidden className="hero-orb hero-orb-one" />
      <div aria-hidden className="hero-orb hero-orb-two" />
      <div aria-hidden className="hero-grid" />

      <div style={{ position: "relative", zIndex: 2, maxWidth: 790 }}>
        <div className="pill pill-sand" style={{ marginBottom: 18, boxShadow: "0 0 28px rgba(240,183,83,.18)" }}><Sparkles size={14} style={{ marginRight: 7 }} /> Recovery Operating System</div>
        <h1 style={{ fontSize: "clamp(68px, 10vw, 144px)", lineHeight: .86, margin: 0, letterSpacing: "-0.065em", textShadow: "0 0 46px rgba(91,141,239,0.40)" }}>ReZilient</h1>
        <h2 style={{ fontSize: "clamp(30px, 4.2vw, 60px)", lineHeight: 1.04, margin: "22px 0 0" }}>Your comeback starts here.</h2>
        <blockquote style={{ margin: "24px 0 0", color: "rgba(234,240,255,0.94)", fontSize: "clamp(22px, 3vw, 34px)", lineHeight: 1.28, fontFamily: "'Lora', Georgia, serif", maxWidth: 750 }}>
          “You survived the fire.<br /><br className="quote-break" />Now rebuild the life that was always meant for you.”
        </blockquote>
        <p style={{ color: "rgba(234,240,255,0.75)", fontSize: "clamp(17px, 2vw, 21px)", lineHeight: 1.8, maxWidth: 740, marginTop: 22 }}>
          Recovery, re-entry, accountability, resources, community and purpose — all in one place.
        </p>
        <div className="hero-button-stack" style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 38 }}>
          <Link to="/Onboarding" style={{ textDecoration: "none" }}><button className="btn-primary hero-primary-button">Start My Journey <ArrowRight className="hero-arrow" size={17} style={{ marginLeft: 8, verticalAlign: "-3px" }} /></button></Link>
          <Link to="/DailyCheckIn" style={{ textDecoration: "none" }}><button className="btn-ghost"><CalendarCheck size={16} style={{ marginRight: 8, verticalAlign: "-3px" }} /> Daily Check-In</button></Link>
          <Link to="/RecoveryHub" style={{ textDecoration: "none" }}><button className="btn-ghost"><Compass size={16} style={{ marginRight: 8, verticalAlign: "-3px" }} /> Explore Resources</button></Link>
        </div>
      </div>

      <style>{`
        .startup-hero:after { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at 68% 35%, rgba(255,255,255,0.12), transparent 20%), radial-gradient(circle at 50% 100%, rgba(91,141,239,0.14), transparent 42%); pointer-events: none; }
        .startup-hero:before { content: ''; position: absolute; inset: 0; opacity: .18; background-image: radial-gradient(circle, rgba(255,255,255,.8) 0 1px, transparent 1.5px); background-size: 58px 58px; animation: particleDrift 22s linear infinite; }
        .hero-orb { position: absolute; border-radius: 999px; filter: blur(34px); animation: heroFloat 9s ease-in-out infinite; }
        .hero-orb-one { right: -90px; top: -110px; width: 420px; height: 420px; background: rgba(91,141,239,0.42); }
        .hero-orb-two { left: 10%; bottom: -150px; width: 390px; height: 390px; background: rgba(167,139,250,0.24); animation-delay: -3s; }
        .hero-grid { position: absolute; inset: 0; opacity: .14; background-image: linear-gradient(rgba(255,255,255,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.12) 1px, transparent 1px); background-size: 64px 64px; mask-image: radial-gradient(circle at 58% 48%, black, transparent 72%); }
        .hero-arrow { transition: transform .22s cubic-bezier(.22,1,.36,1); }
        .hero-primary-button:hover .hero-arrow { transform: translateX(5px); }
        @keyframes heroFloat { 0%,100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(-10px,12px,0) scale(1.03); } }
        @keyframes particleDrift { from { transform: translate3d(0,0,0); } to { transform: translate3d(-64px,-64px,0); } }
        @media (max-width: 980px) { .startup-hero { grid-template-columns: 1fr !important; text-align: center; } .hero-button-stack { justify-content: center; } }
        @media (max-width: 560px) { .hero-button-stack { display: grid !important; } .hero-button-stack a, .hero-button-stack button { width: 100%; } }
      `}</style>
    </section>
  );
}