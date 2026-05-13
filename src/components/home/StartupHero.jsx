import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarCheck, Compass, Sparkles } from "lucide-react";

export default function StartupHero() {
  return (
    <section className="startup-hero" style={{
      position: "relative",
      overflow: "hidden",
      borderRadius: 38,
      padding: "clamp(38px, 7vw, 86px)",
      minHeight: 520,
      display: "flex",
      alignItems: "center",
      background: "linear-gradient(135deg, rgba(91,141,239,0.24), rgba(7,10,20,0.86) 42%, rgba(167,139,250,0.18))",
      border: "1px solid var(--border-glow)",
      boxShadow: "var(--glow), var(--shadow)",
      marginBottom: 28,
    }}>
      <div aria-hidden className="hero-orb hero-orb-one" />
      <div aria-hidden className="hero-orb hero-orb-two" />
      <div aria-hidden className="hero-grid" />

      <div style={{ position: "relative", zIndex: 2, maxWidth: 780 }}>
        <div className="pill pill-sand" style={{ marginBottom: 18 }}><Sparkles size={14} style={{ marginRight: 7 }} /> Recovery Operating System</div>
        <h1 style={{ fontSize: "clamp(58px, 11vw, 132px)", lineHeight: .86, margin: 0, letterSpacing: "-0.06em" }}>Re-silient</h1>
        <h2 style={{ fontSize: "clamp(28px, 4.8vw, 62px)", lineHeight: 1.02, margin: "16px 0 0" }}>Your comeback starts here.</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "clamp(16px, 2vw, 20px)", lineHeight: 1.65, maxWidth: 680, marginTop: 18 }}>
          Recovery, re-entry, accountability, resources and community all in one place.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 30 }}>
          <Link to="/Onboarding" style={{ textDecoration: "none" }}><button className="btn-primary">Start My Journey <ArrowRight size={16} style={{ marginLeft: 8, verticalAlign: "-3px" }} /></button></Link>
          <Link to="/DailyCheckIn" style={{ textDecoration: "none" }}><button className="btn-ghost"><CalendarCheck size={16} style={{ marginRight: 8, verticalAlign: "-3px" }} /> Daily Check-In</button></Link>
          <Link to="/RebuildHub" style={{ textDecoration: "none" }}><button className="btn-ghost"><Compass size={16} style={{ marginRight: 8, verticalAlign: "-3px" }} /> Explore Resources</button></Link>
        </div>
      </div>

      <style>{`
        .startup-hero:after { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at 65% 45%, rgba(255,255,255,0.10), transparent 22%); pointer-events: none; }
        .hero-orb { position: absolute; border-radius: 999px; filter: blur(28px); animation: heroFloat 8s ease-in-out infinite; }
        .hero-orb-one { right: -90px; top: -110px; width: 380px; height: 380px; background: rgba(91,141,239,0.34); }
        .hero-orb-two { right: 18%; bottom: -140px; width: 360px; height: 360px; background: rgba(240,183,83,0.16); animation-delay: -3s; }
        .hero-grid { position: absolute; inset: 0; opacity: .12; background-image: linear-gradient(rgba(255,255,255,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.12) 1px, transparent 1px); background-size: 56px 56px; mask-image: radial-gradient(circle at 55% 45%, black, transparent 72%); }
        @keyframes heroFloat { 0%,100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(-18px,16px,0) scale(1.08); } }
      `}</style>
    </section>
  );
}