import React, { useState } from "react";
import { Phone, X, MessageCircle, AlertTriangle } from "lucide-react";
import { VET_COLORS } from "./veteransData";

export default function CrisisButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Sticky floating button */}
      <button
        onClick={() => setOpen(true)}
        style={{
          position: "fixed", bottom: 88, right: 16, zIndex: 40,
          background: "#B85C5C", color: "#fff",
          padding: "12px 18px", borderRadius: 50, border: "none",
          cursor: "pointer", fontWeight: 700, fontSize: 13,
          display: "flex", alignItems: "center", gap: 8,
          boxShadow: "0 4px 14px rgba(184,92,92,0.4)",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <AlertTriangle style={{ width: 14, height: 14 }} strokeWidth={2.2} />
        Need Immediate Help?
      </button>

      {open && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 100,
          background: "rgba(28,20,16,0.65)",
          display: "flex", alignItems: "flex-end",
        }}>
          <div style={{
            background: VET_COLORS.surface, width: "100%", maxWidth: 480, margin: "0 auto",
            borderRadius: "20px 20px 0 0", padding: "24px 20px 32px",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#B85C5C", textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 4 }}>
                  Crisis Support
                </p>
                <h3 style={{ fontFamily: "'Lora', serif", fontSize: 22, fontWeight: 600, color: VET_COLORS.text, lineHeight: 1.2 }}>
                  You don't have to face this alone.
                </h3>
              </div>
              <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: VET_COLORS.dim, padding: 4 }}>
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>

            <a href="tel:988" style={{ textDecoration: "none", display: "block", marginBottom: 10 }}>
              <div style={{
                background: "rgba(184,92,92,0.08)", border: "1px solid rgba(184,92,92,0.3)",
                borderRadius: 14, padding: "16px 18px",
                display: "flex", alignItems: "center", gap: 14,
              }}>
                <div style={{ width: 44, height: 44, borderRadius: 11, background: "rgba(184,92,92,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Phone style={{ width: 20, height: 20, color: "#B85C5C" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: VET_COLORS.text }}>Veterans Crisis Line</p>
                  <p style={{ fontSize: 12, color: VET_COLORS.muted }}>Call 988, then press 1</p>
                </div>
              </div>
            </a>

            <a href="sms:838255" style={{ textDecoration: "none", display: "block", marginBottom: 10 }}>
              <div style={{
                background: VET_COLORS.bg, border: `1px solid ${VET_COLORS.border}`,
                borderRadius: 14, padding: "16px 18px",
                display: "flex", alignItems: "center", gap: 14,
              }}>
                <div style={{ width: 44, height: 44, borderRadius: 11, background: VET_COLORS.navyDim, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <MessageCircle style={{ width: 20, height: 20, color: VET_COLORS.navy }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: VET_COLORS.text }}>Text the Crisis Line</p>
                  <p style={{ fontSize: 12, color: VET_COLORS.muted }}>Text 838255</p>
                </div>
              </div>
            </a>

            <a href="tel:911" style={{ textDecoration: "none", display: "block", marginBottom: 14 }}>
              <div style={{
                background: VET_COLORS.bg, border: `1px solid ${VET_COLORS.border}`,
                borderRadius: 14, padding: "16px 18px",
                display: "flex", alignItems: "center", gap: 14,
              }}>
                <div style={{ width: 44, height: 44, borderRadius: 11, background: "rgba(184,92,92,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <AlertTriangle style={{ width: 20, height: 20, color: "#B85C5C" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: VET_COLORS.text }}>Emergency Services</p>
                  <p style={{ fontSize: 12, color: VET_COLORS.muted }}>Call 911</p>
                </div>
              </div>
            </a>

            <p style={{ fontSize: 11, color: VET_COLORS.dim, textAlign: "center", lineHeight: 1.6, marginTop: 8 }}>
              You served. Now let others serve you. Reach out.
            </p>
          </div>
        </div>
      )}
    </>
  );
}