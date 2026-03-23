import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/pages/utils";

export default function PageNotFound() {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "linear-gradient(170deg,#070D1C 0%,#0B1424 100%)",
      padding: 32, textAlign: "center",
    }}>
      <p style={{ fontSize: 72, marginBottom: 8, lineHeight: 1 }}>🔍</p>
      <h1 style={{ fontSize: 28, fontWeight: 900, color: "#fff", marginBottom: 10, lineHeight: 1.2 }}>
        Page Not Found
      </h1>
      <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", lineHeight: 1.6, marginBottom: 32, maxWidth: 320 }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <Link to={createPageUrl("Home")} style={{ textDecoration: "none" }}>
          <button style={{
            padding: "13px 28px", borderRadius: 12, border: "none",
            background: "linear-gradient(135deg,#3ECFBF,#2CB8AE)",
            color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer",
          }}>
            Go Home
          </button>
        </Link>
        <button
          onClick={() => window.history.back()}
          style={{
            padding: "13px 28px", borderRadius: 12,
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.5)", fontWeight: 700, fontSize: 14, cursor: "pointer",
          }}
        >
          Go Back
        </button>
      </div>
    </div>
  );
}