import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Splash() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState("glow"); // glow → brand → tagline → exit

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("brand"),   600);
    const t2 = setTimeout(() => setPhase("tagline"), 1400);
    const t3 = setTimeout(() => setPhase("exit"),    2800);
    const t4 = setTimeout(() => navigate("/"),       3400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [navigate]);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "#070910",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      overflow: "hidden",
      opacity: phase === "exit" ? 0 : 1,
      transition: phase === "exit" ? "opacity 0.6s ease" : "none",
    }}>
      <style>{`
        @keyframes glowPulse {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50%       { opacity: 0.55; transform: scale(1.06); }
        }
        @keyframes riseUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes particleDrift {
          0%   { transform: translateY(0) translateX(0)   scale(1);   opacity: 0; }
          20%  { opacity: 0.6; }
          80%  { opacity: 0.3; }
          100% { transform: translateY(-120px) translateX(30px) scale(0.4); opacity: 0; }
        }
      `}</style>

      {/* ── Ambient glow background ── */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        animation: "fadeIn 1.2s ease forwards",
      }}>
        {/* Primary warm-teal glow — top center */}
        <div style={{
          position: "absolute",
          top: "12%", left: "50%", transform: "translateX(-50%)",
          width: 500, height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(45,212,191,0.13) 0%, rgba(45,212,191,0.04) 45%, transparent 70%)",
          animation: "glowPulse 4s ease-in-out infinite",
        }} />
        {/* Secondary warm amber glow — bottom left */}
        <div style={{
          position: "absolute",
          bottom: "10%", left: "10%",
          width: 340, height: 280,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(201,169,110,0.09) 0%, transparent 65%)",
          animation: "glowPulse 5.5s ease-in-out infinite reverse",
        }} />
        {/* Cool indigo glow — right */}
        <div style={{
          position: "absolute",
          top: "35%", right: "-5%",
          width: 280, height: 360,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",
          animation: "glowPulse 6s ease-in-out infinite",
        }} />
        {/* Subtle horizontal light band */}
        <div style={{
          position: "absolute",
          top: "44%", left: 0, right: 0,
          height: 1,
          background: "linear-gradient(90deg, transparent 0%, rgba(45,212,191,0.15) 30%, rgba(45,212,191,0.25) 50%, rgba(45,212,191,0.15) 70%, transparent 100%)",
          animation: "fadeIn 2s ease 0.8s both",
        }} />
      </div>

      {/* ── Floating particles ── */}
      {[
        { x: "42%", delay: "0.3s",  dur: "4.5s", size: 3,   color: "rgba(45,212,191,0.5)"  },
        { x: "55%", delay: "1.1s",  dur: "5.2s", size: 2,   color: "rgba(201,169,110,0.4)" },
        { x: "38%", delay: "0.7s",  dur: "6s",   size: 2.5, color: "rgba(45,212,191,0.3)"  },
        { x: "60%", delay: "1.8s",  dur: "4.8s", size: 2,   color: "rgba(99,102,241,0.4)"  },
        { x: "48%", delay: "2.2s",  dur: "5.5s", size: 3,   color: "rgba(45,212,191,0.35)" },
        { x: "35%", delay: "0.9s",  dur: "7s",   size: 1.5, color: "rgba(201,169,110,0.3)" },
        { x: "63%", delay: "1.4s",  dur: "5s",   size: 2,   color: "rgba(45,212,191,0.4)"  },
      ].map((p, i) => (
        <div key={i} style={{
          position: "absolute",
          bottom: "38%", left: p.x,
          width: p.size, height: p.size,
          borderRadius: "50%",
          background: p.color,
          boxShadow: `0 0 6px ${p.color}`,
          animation: `particleDrift ${p.dur} ease-in ${p.delay} infinite`,
          pointerEvents: "none",
        }} />
      ))}

      {/* ── Brand block ── */}
      <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "0 32px" }}>

        {/* Rebos wordmark */}
        <div style={{
          opacity: ["brand", "tagline"].includes(phase) ? 1 : 0,
          transform: ["brand", "tagline"].includes(phase) ? "translateY(0)" : "translateY(28px)",
          transition: "opacity 0.9s cubic-bezier(.22,1,.36,1), transform 0.9s cubic-bezier(.22,1,.36,1)",
          marginBottom: 14,
        }}>
          <p style={{
            fontSize: 68,
            fontWeight: 900,
            letterSpacing: "-3px",
            lineHeight: 1,
            background: "linear-gradient(135deg, #ffffff 0%, #e2e8f0 40%, #2DD4BF 75%, #38bdf8 100%)",
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            animation: ["brand", "tagline"].includes(phase) ? "shimmer 5s linear infinite" : "none",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif",
          }}>
            Rebos
          </p>
        </div>

        {/* Divider line */}
        <div style={{
          width: phase === "tagline" ? 80 : 0,
          height: 1,
          background: "linear-gradient(90deg, transparent, rgba(45,212,191,0.6), transparent)",
          margin: "0 auto 18px",
          transition: "width 0.8s cubic-bezier(.22,1,.36,1) 0.1s",
        }} />

        {/* Tagline */}
        <div style={{
          opacity: phase === "tagline" ? 1 : 0,
          transform: phase === "tagline" ? "translateY(0)" : "translateY(14px)",
          transition: "opacity 0.8s ease, transform 0.8s cubic-bezier(.22,1,.36,1)",
        }}>
          <p style={{
            fontSize: 18,
            fontWeight: 300,
            color: "rgba(255,255,255,0.75)",
            letterSpacing: "0.04em",
            lineHeight: 1.4,
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif",
          }}>
            sober backwards,{" "}
            <span style={{ color: "#2DD4BF", fontWeight: 500 }}>hope forward.</span>
          </p>
        </div>
      </div>

      {/* ── Sub-tagline ── */}
      <div style={{
        position: "absolute",
        bottom: "10%",
        left: 0, right: 0,
        textAlign: "center",
        opacity: phase === "tagline" ? 1 : 0,
        transition: "opacity 1s ease 0.3s",
        pointerEvents: "none",
      }}>
        <p style={{
          fontSize: 12,
          color: "rgba(255,255,255,0.22)",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          fontWeight: 500,
        }}>
          Your companion on the journey to recovery.
        </p>
      </div>

      {/* ── Brand attribution ── */}
      <div style={{
        position: "absolute",
        bottom: "5.5%",
        left: 0, right: 0,
        textAlign: "center",
        opacity: phase === "tagline" ? 0.3 : 0,
        transition: "opacity 1s ease 0.5s",
        pointerEvents: "none",
      }}>
        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", fontWeight: 400 }}>
          by Unbound
        </p>
      </div>
    </div>
  );
}