import React from "react";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { VM } from "./vmData";

export function VMScreen({ children, step, total, onBack, showBack = true }) {
  return (
    <div style={{
      minHeight: "100vh", background: VM.bg, color: VM.text,
      display: "flex", flexDirection: "column",
      padding: "56px 24px 32px", fontFamily: "'DM Sans', sans-serif",
    }}>
      <style>{`
        @keyframes vmFadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .vm-fade { animation: vmFadeUp .35s cubic-bezier(.22,1,.36,1) both; }
      `}</style>

      <div style={{ display: "flex", alignItems: "center", marginBottom: 32, minHeight: 28 }}>
        {showBack && onBack ? (
          <button onClick={onBack} style={{
            background: "none", border: "none", color: VM.muted,
            display: "flex", alignItems: "center", gap: 5, cursor: "pointer", padding: 0,
            fontSize: 13, fontWeight: 500,
          }}>
            <ArrowLeft style={{ width: 16, height: 16 }} /> Back
          </button>
        ) : <div />}
        <div style={{ flex: 1 }} />
        {total && (
          <div style={{ display: "flex", gap: 4 }}>
            {Array.from({ length: total }).map((_, i) => (
              <div key={i} style={{
                width: i === step - 1 ? 20 : 6, height: 3, borderRadius: 2,
                background: i < step ? VM.olive : VM.border,
                transition: "all .3s ease",
              }} />
            ))}
          </div>
        )}
      </div>

      <div className="vm-fade" style={{
        flex: 1, display: "flex", flexDirection: "column",
        maxWidth: 440, margin: "0 auto", width: "100%",
      }}>
        {children}
      </div>
    </div>
  );
}

export function VMHeading({ eyebrow, title, sub }) {
  return (
    <div style={{ marginBottom: 28 }}>
      {eyebrow && (
        <p style={{ fontSize: 11, fontWeight: 700, color: VM.gold, letterSpacing: ".2em", textTransform: "uppercase", marginBottom: 10 }}>
          {eyebrow}
        </p>
      )}
      <h2 style={{
        fontFamily: "'Lora', Georgia, serif", fontSize: 26, fontWeight: 500,
        color: VM.text, lineHeight: 1.25, marginBottom: sub ? 8 : 0, letterSpacing: "-.01em",
      }}>
        {title}
      </h2>
      {sub && <p style={{ fontSize: 14, color: VM.muted, lineHeight: 1.6 }}>{sub}</p>}
    </div>
  );
}

export function VMButton({ children, onClick, disabled, loading, variant = "primary" }) {
  const isGhost = variant === "ghost";
  return (
    <button onClick={onClick} disabled={disabled || loading} style={{
      width: "100%", padding: "15px", borderRadius: 12, border: "none",
      background: disabled ? VM.border : isGhost ? "transparent" : VM.olive,
      color: disabled ? VM.dim : isGhost ? VM.muted : "#12140F",
      border: isGhost ? `1px solid ${VM.border}` : "none",
      fontWeight: 700, fontSize: 15,
      cursor: disabled ? "not-allowed" : "pointer",
      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      fontFamily: "inherit", letterSpacing: ".02em",
    }}>
      {loading
        ? <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" />
        : <>{children} {!isGhost && <ArrowRight style={{ width: 15, height: 15 }} />}</>}
    </button>
  );
}

export function VMLabel({ children, optional }) {
  return (
    <p style={{
      fontSize: 11, fontWeight: 700, color: VM.dim,
      textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 8,
    }}>
      {children}
      {optional && <span style={{ color: VM.dim, fontWeight: 500, textTransform: "none", letterSpacing: 0, marginLeft: 6 }}>(optional)</span>}
    </p>
  );
}