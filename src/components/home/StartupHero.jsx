import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarCheck, Compass, Sparkles } from "lucide-react";

export default function StartupHero() {
  return (
    <section className="startup-hero" style={{
      position: "relative",
      overflow: "hidden",
      borderRadius: 46,
      padding: "clamp(48px, 8vw, 104px)",
      minHeight: 660,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      background: "linear-gradient(135deg, rgba(91,141,239,0.20), rgba(7,10,20,0.90) 42%, rgba(167,139,250,0.22))",
      border: "1px solid rgba(190,215,255,0.24)",
      boxShadow: "0 0 80px rgba(91,141,239,0.22), 0 34px 90px rgba(0,0,0,0.52), inset 0 1px 0 rgba(255,255,255,0.12)",
      backdropFilter: "blur(34px) saturate(170%)",
      marginBottom: 70,
    }}>
      <div aria-hidden className="hero-orb hero-orb-one" />
      <div aria-hidden className="hero-orb hero-orb-two" />
      <div aria-hidden className="hero-grid" />

      <div style={{ position: "relative", zIndex: 2, maxWidth: 820, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div className="pill pill-sand" style={{ marginBottom: 18 }}><Sparkles size={14} style={{ marginRight: 7 }} /> Recovery Operating System</div>
        <h1 style={{ fontSize: "clamp(66px, 12vw, 148px)", lineHeight: .86, margin: 0, letterSpacing: "-0.065em", textShadow: "0 0 42px rgba(91,141,239,0.36)" }}>ReZilient</h1>
        <h2 style={{ fontSize: "clamp(30px, 5vw, 66px)", lineHeight: 1.04, margin: "22px 0 0" }}>Your comeback starts here.</h2>
        <blockquote style={{ margin: "24px 0 0", color: "rgba(234,240,255,0.92)", fontSize: "clamp(22px, 3.2vw, 34px)", lineHeight: 1.28, fontFamily: "'Lora', Georgia, serif", maxWidth: 760 }}>
          “You survived the fire.<br />Now rebuild the life that was always meant for you.”
        </blockquote>
        <p style={{ color: "rgba(234,240,255,0.74)", fontSize: "clamp(17px, 2vw, 21px)", lineHeight: 1.8, maxWidth: 760, marginTop: 22 }}>
          Recovery, re-entry, accountability, resources, community and purpose—all in one place.
        </p>
        <div className="hero-button-stack" style={{ display: "grid", gap: 16, marginTop: 38, width: "min(100%, 360px)" }}>
          <Link to="/Onboarding" style={{ textDecoration: "none" }}><button className="btn-primary hero-primary-button" style={{ width: "100%" }}>Start My Journey <ArrowRight className="hero-arrow" size={17} style={{ marginLeft: 8, verticalAlign: "-3px" }} /></button></Link>
          <Link to="/DailyCheckIn" style={{ textDecoration: "none" }}><button className="btn-ghost" style={{ width: "100%" }}><CalendarCheck size={16} style={{ marginRight: 8, verticalAlign: "-3px" }} /> Daily Check-In</button></Link>
          <Link to="/RecoveryHub" style={{ textDecoration: "none" }}><button className="btn-ghost" style={{ width: "100%" }}><Compass size={16} style={{ marginRight: 8, verticalAlign: "-3px" }} /> Explore Resources</button></Link>
        </div>
      </div>

      <style>{`
        .startup-hero:after { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at 50% 35%, rgba(255,255,255,0.13), transparent 20%), radial-gradient(circle at 50% 100%, rgba(91,141,239,0.14), transparent 42%); pointer-events: none; }
        .startup-hero:before { content: ''; position: absolute; inset: 0; opacity: .18; background-image: radial-gradient(circle, rgba(255,255,255,.8) 0 1px, transparent 1.5px); background-size: 64px 64px; animation: particleDrift 22s linear infinite; }
        .hero-orb { position: absolute; border-radius: 999px; filter: blur(34px); animation: heroFloat 9s ease-in-out infinite; }
        .hero-orb-one { right: -90px; top: -110px; width: 420px; height: 420px; background: rgba(91,141,239,0.38); }
        .hero-orb-two { left: 10%; bottom: -150px; width: 390px; height: 390px; background: rgba(167,139,250,0.22); animation-delay: -3s; }
        .hero-grid { position: absolute; inset: 0; opacity: .14; background-image: linear-gradient(rgba(255,255,255,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.12) 1px, transparent 1px); background-size: 64px 64px; mask-image: radial-gradient(circle at 50% 48%, black, transparent 72%); }
        .hero-arrow { transition: transform .22s cubic-bezier(.22,1,.36,1); }
        .hero-primary-button:hover .hero-arrow { transform: translateX(4px); }
        @keyframes heroFloat { 0%,100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(-18px,16px,0) scale(1.08); } }
        @keyframes particleDrift { from { transform: translate3d(0,0,0); } to { transform: translate3d(-64px,-64px,0); } }
      `}</style>
    </section>
  );
}