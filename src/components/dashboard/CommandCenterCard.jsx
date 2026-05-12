import React from "react";

export default function CommandCenterCard({ children, className = "", style = {}, glow = false }) {
  return (
    <section
      className={`fade-up ${className}`}
      style={{
        position: "relative",
        borderRadius: 24,
        padding: 18,
        background: "linear-gradient(180deg, rgba(20,26,45,0.74), rgba(13,18,32,0.58))",
        border: glow ? "1px solid var(--border-glow)" : "1px solid var(--border)",
        boxShadow: glow ? "var(--glow), var(--shadow-card)" : "var(--shadow-card)",
        backdropFilter: "blur(22px) saturate(150%)",
        WebkitBackdropFilter: "blur(22px) saturate(150%)",
        overflow: "hidden",
        ...style,
      }}
    >
      <div aria-hidden style={{
        position: "absolute",
        inset: "-40% -30% auto auto",
        width: 180,
        height: 180,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(91,141,239,0.14), transparent 70%)",
        filter: "blur(18px)",
        pointerEvents: "none",
      }} />
      <div style={{ position: "relative" }}>{children}</div>
    </section>
  );
}