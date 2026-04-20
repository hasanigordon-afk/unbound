import React from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

/**
 * Reusable donate button/link.
 * variant: "primary" | "ghost" | "pill" | "text"
 */
export default function DonateButton({ variant = "primary", label = "Donate", style = {} }) {
  const base = {
    display: "inline-flex", alignItems: "center", gap: 7,
    textDecoration: "none", cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
    transition: "opacity 0.15s ease",
  };

  const variants = {
    primary: {
      padding: "11px 20px", borderRadius: 50,
      background: "#B8823A", color: "#fff",
      fontSize: 14, border: "none",
    },
    ghost: {
      padding: "10px 18px", borderRadius: 50,
      background: "rgba(184,130,58,0.08)",
      border: "1px solid rgba(184,130,58,0.28)",
      color: "#B8823A", fontSize: 13,
    },
    pill: {
      padding: "6px 14px", borderRadius: 20,
      background: "rgba(184,130,58,0.12)",
      border: "1px solid rgba(184,130,58,0.3)",
      color: "#B8823A", fontSize: 12, fontWeight: 700,
    },
    text: {
      color: "#B8823A", fontSize: 13, fontWeight: 700,
      padding: 0, background: "none", border: "none",
    },
  };

  return (
    <Link to="/Donate" style={{ ...base, ...variants[variant], ...style }}>
      <Heart style={{ width: variant === "pill" ? 12 : 14, height: variant === "pill" ? 12 : 14 }} fill={variant === "primary" ? "#fff" : "none"} />
      {label}
    </Link>
  );
}