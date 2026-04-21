import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { VM } from "../vmData";

const TABS = ["Stories", "Wins", "Advice", "Anonymous"];

export default function VMDCommunityPreview() {
  const [tab, setTab] = useState("Stories");

  return (
    <div style={{
      background: VM.surface, border: `1px solid ${VM.border}`,
      borderRadius: 14, padding: "16px 18px",
    }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: VM.dim, textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 12 }}>
        Veteran Community
      </p>

      <div style={{ display: "flex", gap: 4, marginBottom: 14, overflowX: "auto", scrollbarWidth: "none" }}>
        {TABS.map(t => {
          const sel = tab === t;
          return (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "6px 12px", borderRadius: 20, cursor: "pointer", flexShrink: 0,
              background: sel ? VM.oliveSoft : "transparent",
              border: `1px solid ${sel ? VM.olive : VM.border}`,
              color: sel ? VM.olive : VM.muted,
              fontSize: 11, fontWeight: 700, fontFamily: "inherit",
            }}>
              {t}
            </button>
          );
        })}
      </div>

      <Link to="/VeteransDashboard" style={{ textDecoration: "none" }}>
        <div style={{
          padding: "14px 14px", borderRadius: 10,
          background: VM.bg, border: `1px dashed ${VM.border}`,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 12, color: VM.muted, fontStyle: "italic", lineHeight: 1.5 }}>
              Share something real — a win, a struggle, or something that helped.
            </p>
          </div>
          <ArrowRight style={{ width: 14, height: 14, color: VM.olive, flexShrink: 0 }} />
        </div>
      </Link>
    </div>
  );
}