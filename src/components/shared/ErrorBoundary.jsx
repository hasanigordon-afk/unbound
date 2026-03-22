/**
 * ErrorBoundary — catches runtime render errors and shows a clean fallback.
 */
import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        background: "#070D1C", padding: 32, textAlign: "center",
      }}>
        <p style={{ fontSize: 48, marginBottom: 16 }}>⚠️</p>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 8 }}>
          Something went wrong
        </h2>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.6, marginBottom: 28, maxWidth: 320 }}>
          An unexpected error occurred. This has been logged. Try refreshing the page.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: "12px 28px", borderRadius: 12, border: "none",
            background: "rgba(62,207,191,0.15)", border: "1px solid rgba(62,207,191,0.3)",
            color: "#3ECFBF", fontWeight: 700, fontSize: 14, cursor: "pointer",
          }}
        >
          Refresh Page
        </button>
      </div>
    );
  }
}