import React from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

/**
 * Persistent, understated "Support Ah Ha" donate button — sits above the bottom nav
 * on every page (paired alongside EmergencyFAB). Inspired by Craigslist's quiet ask.
 */
export default function DonateFAB() {
  return (
    <Link
      to="/Donate"
      aria-label="Support Re-siliant — Donate"
      style={{
        position: "fixed",
        left: 18,
        bottom: "calc(86px + env(safe-area-inset-bottom, 0px))",
        zIndex: 60,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "10px 14px",
        borderRadius: 999,
        background: "#FFFFFF",
        border: "1px solid rgba(200,147,47,0.32)",
        color: "#C8932F",
        textDecoration: "none",
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: "0.02em",
        boxShadow: "0 6px 18px rgba(15,30,61,0.10), 0 2px 6px rgba(15,30,61,0.06)",
      }}
    >
      <Heart style={{ width: 13, height: 13, color: "#C8932F" }} fill="#C8932F" />
      Support
    </Link>
  );
}