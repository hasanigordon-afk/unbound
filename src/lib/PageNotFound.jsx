import React from "react";
import { Link } from "react-router-dom";

export default function PageNotFound() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg,#070D1C 0%,#0B1424 100%)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "40px 24px", textAlign: "center",
    }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🔍</div>
      <h1 style={{ fontSize: 28, fontWeight: 900, color: "#fff", marginBottom: 8 }}>
        Page Not Found
      </h1>
      <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", marginBottom: 32, maxWidth: 320, lineHeight: 1.6 }}>
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Link to="/" style={{ textDecoration: "none" }}>
        <button style={{
          background: "linear-gradient(135deg,#3ECFBF,#2CB8AE)",
          border: "none", borderRadius: 14, padding: "14px 32px",
          color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer",
          boxShadow: "0 8px 24px rgba(62,207,191,0.25)",
        }}>
          Back to Home
        </button>
      </Link>
    </div>
  );
}