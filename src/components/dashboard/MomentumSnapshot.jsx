import React from "react";
import { Link } from "react-router-dom";
import { Flame } from "lucide-react";

export default function MomentumSnapshot({ streak, stage }) {
  return (
    <Link to="/OutcomesProgress" style={{ textDecoration: "none" }}>
      <div className="card" style={{ padding: 22, minHeight: 180, color: "var(--text)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <div>
            <p style={{ color: "var(--text-dim)", fontSize: 11, fontWeight: 900, letterSpacing: ".12em", textTransform: "uppercase" }}>Recovery Streak</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 8 }}>
              <span style={{ fontSize: 56, fontWeight: 950, letterSpacing: "-.05em" }}>{streak}</span>
              <span style={{ color: "var(--text-muted)", fontWeight: 800 }}>days</span>
            </div>
          </div>
          <div style={{ width: 54, height: 54, borderRadius: 20, display: "grid", placeItems: "center", background: "var(--gold-dim)", border: "1px solid var(--gold-border)", color: "var(--gold)" }}>
            <Flame style={{ width: 25, height: 25 }} />
          </div>
        </div>
        <p style={{ color: "var(--text-muted)", fontSize: 13, lineHeight: 1.6, marginTop: 10 }}>Current stage: <b style={{ color: "var(--gold)" }}>{stage?.name || "Ember"}</b>. Tap for deeper progress.</p>
      </div>
    </Link>
  );
}