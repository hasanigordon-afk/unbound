import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, HeartPulse, Sparkles } from "lucide-react";

export default function HomePrimaryCheckIn({ todayComplete }) {
  return (
    <section className="home-checkin-hero" style={{
      position: "relative",
      marginBottom: 30,
      padding: "clamp(30px, 5vw, 54px)",
      borderRadius: 34,
      overflow: "hidden",
      background: "linear-gradient(135deg, rgba(91,141,239,0.24), rgba(13,18,32,0.82) 48%, rgba(167,139,250,0.18))",
      border: "1px solid var(--border-glow)",
      boxShadow: "var(--glow), var(--shadow)",
    }}>
      <div aria-hidden className="checkin-pulse" style={{ position: "absolute", inset: -80, background: "radial-gradient(circle at 72% 36%, rgba(91,141,239,0.34), transparent 34%), radial-gradient(circle at 24% 80%, rgba(52,211,153,0.18), transparent 28%)", filter: "blur(18px)" }} />
      <div style={{ position: "relative", display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: 28, alignItems: "center" }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 13px", borderRadius: 999, background: "rgba(255,255,255,0.08)", border: "1px solid var(--border)", color: "var(--green)", fontSize: 11, fontWeight: 900, letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 16 }}>
            <Sparkles style={{ width: 14, height: 14 }} /> Start here
          </div>
          <h2 style={{ fontSize: "clamp(34px, 5.6vw, 64px)", lineHeight: 0.98, margin: 0 }}>Start Today’s Check-In</h2>
          <p style={{ marginTop: 16, color: "var(--text-muted)", fontSize: 17, lineHeight: 1.7, maxWidth: 700 }}>
            Take two calm minutes to name how you feel, what you need, and the next healthy step for today.
          </p>
        </div>
        <Link to="/DailyCheckIn" style={{ textDecoration: "none" }}>
          <button className="btn-primary" style={{ minWidth: 230, minHeight: 58, fontSize: 16, boxShadow: "0 0 42px rgba(91,141,239,0.48)" }}>
            {todayComplete ? <CheckCircle2 style={{ width: 19, height: 19, marginRight: 8, verticalAlign: "-4px" }} /> : <HeartPulse style={{ width: 19, height: 19, marginRight: 8, verticalAlign: "-4px" }} />}
            {todayComplete ? "Review Check-In" : "Check In Now"}
          </button>
        </Link>
      </div>
      <style>{`
        .home-checkin-hero { animation: checkinGlow 4.8s ease-in-out infinite; }
        .checkin-pulse { animation: checkinPulse 7s ease-in-out infinite; }
        @keyframes checkinGlow { 0%,100% { box-shadow: var(--glow), var(--shadow); } 50% { box-shadow: 0 0 54px rgba(91,141,239,0.48), var(--shadow); } }
        @keyframes checkinPulse { 0%,100% { opacity: .7; transform: scale(1); } 50% { opacity: 1; transform: scale(1.05); } }
        @media (max-width: 760px) { .home-checkin-hero > div { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}