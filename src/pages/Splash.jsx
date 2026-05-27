import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Splash() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState("glow");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("brand"),   500);
    const t2 = setTimeout(() => setPhase("tagline"), 1200);
    const t3 = setTimeout(() => setPhase("exit"),    2600);
    const t4 = setTimeout(() => navigate("/Onboarding"),       3200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [navigate]);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "#070A14",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      overflow: "hidden",
      opacity: phase === "exit" ? 0 : 1,
      transition: phase === "exit" ? "opacity 0.6s ease" : "none",
    }}>
      <style>{`
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes shimmer {
          0%{background-position:-200% center}
          100%{background-position:200% center}
        }
        @keyframes particleDrift {
          0%   { transform: translateY(0) translateX(0) scale(1); opacity: 0; }
          20%  { opacity: 0.5; }
          80%  { opacity: 0.2; }
          100% { transform: translateY(-100px) translateX(20px) scale(0.4); opacity: 0; }
        }
      `}</style>

      {/* Ambient */}
      <div style={{ position:"absolute", inset:0, pointerEvents:"none",
        background:"radial-gradient(ellipse at 50% 40%, rgba(184,130,58,0.07) 0%, transparent 65%)",
        animation:"fadeIn 1.5s ease forwards" }} />

      {/* Particles */}
      {[
        { x:"42%", delay:"0.3s", dur:"4.5s", size:3,   color:"rgba(184,130,58,0.3)"  },
        { x:"55%", delay:"1.1s", dur:"5.2s", size:2,   color:"rgba(184,130,58,0.2)"  },
        { x:"38%", delay:"0.7s", dur:"6s",   size:2.5, color:"rgba(122,158,126,0.25)" },
        { x:"60%", delay:"1.8s", dur:"4.8s", size:2,   color:"rgba(184,130,58,0.25)" },
        { x:"48%", delay:"2.2s", dur:"5.5s", size:3,   color:"rgba(122,158,126,0.2)"  },
      ].map((p, i) => (
        <div key={i} style={{
          position:"absolute", bottom:"38%", left:p.x,
          width:p.size, height:p.size, borderRadius:"50%",
          background:p.color,
          animation:`particleDrift ${p.dur} ease-in ${p.delay} infinite`,
          pointerEvents:"none",
        }} />
      ))}

      {/* Brand block */}
      <div style={{ position:"relative", zIndex:1, textAlign:"center", padding:"0 32px" }}>

        <div style={{
          opacity: ["brand","tagline"].includes(phase) ? 1 : 0,
          transform: ["brand","tagline"].includes(phase) ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 0.9s cubic-bezier(.22,1,.36,1), transform 0.9s cubic-bezier(.22,1,.36,1)",
          marginBottom: 14,
        }}>
          <p style={{
            fontSize: 58, fontWeight: 800, letterSpacing: "-2px", lineHeight: 1,
            background: "linear-gradient(135deg, #EAF0FF 0%, #F0B753 55%, #5B8DEF 100%)",
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            animation: ["brand","tagline"].includes(phase) ? "shimmer 5s linear infinite" : "none",
          }}>
            ReZilient
          </p>
          <p style={{ fontSize:12, fontWeight:700, color:"#A8B3CF", letterSpacing:"0.12em", marginTop:4 }}>Built For Life's Biggest Comebacks</p>
        </div>

        <div style={{
          width: phase === "tagline" ? 60 : 0, height:1,
          background:"linear-gradient(90deg,transparent,rgba(184,130,58,0.5),transparent)",
          margin:"0 auto 18px", transition:"width 0.8s cubic-bezier(.22,1,.36,1) 0.1s",
        }} />

        <div style={{
          opacity: phase === "tagline" ? 1 : 0,
          transform: phase === "tagline" ? "translateY(0)" : "translateY(14px)",
          transition: "opacity 0.8s ease, transform 0.8s cubic-bezier(.22,1,.36,1)",
        }}>
          <p style={{ fontSize:17, fontWeight:700, color:"#EAF0FF", lineHeight:1.5 }}>
            Help. Hope. Healing.
          </p>
          <p style={{ fontSize:13, color:"#A8B3CF", marginTop:6 }}>
            You don't have to figure this out alone.
          </p>
          <button
            onClick={() => navigate("/Onboarding")}
            style={{
              marginTop:28, padding:"13px 32px",
              borderRadius:"var(--r-md)", border:"none",
              background:"#B8823A", color:"#FDFAF6",
              fontWeight:700, fontSize:15, cursor:"pointer",
              opacity: phase === "tagline" ? 1 : 0,
              transition:"opacity 0.8s ease 0.4s",
            }}
          >
            Enter App →
          </button>
        </div>
      </div>

      <div style={{
        position:"absolute", bottom:"8%", left:0, right:0, textAlign:"center",
        opacity: phase === "tagline" ? 1 : 0, transition:"opacity 1s ease 0.3s", pointerEvents:"none",
      }}>
        <p style={{ fontSize:11, color:"#9B8E83", letterSpacing:"0.1em", textTransform:"uppercase", fontWeight:500 }}>
          ReZilient
        </p>
      </div>
    </div>
  );
}