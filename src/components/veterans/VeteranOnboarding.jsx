import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { BRANCHES, VET_COLORS } from "./veteransData";

export default function VeteranOnboarding({ onSubmit, saving }) {
  const [branch, setBranch] = useState(null);
  const [serviceYears, setServiceYears] = useState("");
  const [zip, setZip] = useState("");
  const [displayMode, setDisplayMode] = useState("anonymous");
  const [firstName, setFirstName] = useState("");

  const canSubmit = !!branch;

  return (
    <div style={{ padding: "24px 16px 40px" }}>
      <div style={{
        background: `linear-gradient(135deg, ${VET_COLORS.oliveDim}, ${VET_COLORS.navyDim})`,
        border: `1px solid ${VET_COLORS.olive}35`,
        borderRadius: 18, padding: "28px 22px", marginBottom: 20, textAlign: "center",
      }}>
        <p style={{ fontSize: 46, marginBottom: 10 }}>🇺🇸</p>
        <p style={{ fontSize: 11, fontWeight: 700, color: VET_COLORS.olive, textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 6 }}>
          Welcome, Veteran
        </p>
        <h1 style={{ fontFamily: "'Lora', serif", fontSize: 24, fontWeight: 600, color: VET_COLORS.text, lineHeight: 1.2, marginBottom: 8 }}>
          Thank you for your service.
        </h1>
        <p style={{ fontSize: 13, color: VET_COLORS.muted, lineHeight: 1.6 }}>
          Tell us a little about your service so we can connect you with the right resources and community.
        </p>
      </div>

      <p style={{ fontSize: 10, fontWeight: 700, color: VET_COLORS.dim, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 12 }}>
        Branch of service
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
        {BRANCHES.map(b => {
          const sel = branch === b.key;
          return (
            <button key={b.key} onClick={() => setBranch(b.key)} style={{
              padding: "14px 10px", borderRadius: 12, cursor: "pointer",
              background: sel ? VET_COLORS.oliveDim : VET_COLORS.surface,
              border: `1.5px solid ${sel ? VET_COLORS.olive : VET_COLORS.border}`,
              display: "flex", alignItems: "center", gap: 8,
              textAlign: "left",
            }}>
              <span style={{ fontSize: 18 }}>{b.emoji}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: sel ? VET_COLORS.olive : VET_COLORS.text }}>
                {b.label}
              </span>
            </button>
          );
        })}
      </div>

      <p style={{ fontSize: 10, fontWeight: 700, color: VET_COLORS.dim, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 12 }}>
        Years of service <span style={{ textTransform: "none", fontWeight: 400 }}>(optional)</span>
      </p>
      <input
        value={serviceYears}
        onChange={e => setServiceYears(e.target.value)}
        placeholder="e.g. 2008–2014"
        style={{
          width: "100%", padding: "12px 14px", borderRadius: 12,
          border: `1px solid ${VET_COLORS.border}`, background: VET_COLORS.surface,
          fontSize: 14, marginBottom: 16, boxSizing: "border-box", outline: "none",
        }}
      />

      <p style={{ fontSize: 10, fontWeight: 700, color: VET_COLORS.dim, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 12 }}>
        Zip code <span style={{ textTransform: "none", fontWeight: 400 }}>(for nearby resources)</span>
      </p>
      <input
        value={zip}
        onChange={e => setZip(e.target.value.slice(0, 10))}
        placeholder="e.g. 07001"
        style={{
          width: "100%", padding: "12px 14px", borderRadius: 12,
          border: `1px solid ${VET_COLORS.border}`, background: VET_COLORS.surface,
          fontSize: 14, marginBottom: 16, boxSizing: "border-box", outline: "none",
        }}
      />

      <p style={{ fontSize: 10, fontWeight: 700, color: VET_COLORS.dim, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 12 }}>
        Display name in community
      </p>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {[
          { v: "anonymous",  label: "Anonymous" },
          { v: "first_name", label: "First name" },
        ].map(o => {
          const sel = displayMode === o.v;
          return (
            <button key={o.v} onClick={() => setDisplayMode(o.v)} style={{
              flex: 1, padding: "12px", borderRadius: 12, cursor: "pointer",
              background: sel ? VET_COLORS.oliveDim : VET_COLORS.surface,
              border: `1.5px solid ${sel ? VET_COLORS.olive : VET_COLORS.border}`,
              fontWeight: 700, fontSize: 13,
              color: sel ? VET_COLORS.olive : VET_COLORS.muted,
            }}>{o.label}</button>
          );
        })}
      </div>
      {displayMode === "first_name" && (
        <input
          value={firstName}
          onChange={e => setFirstName(e.target.value.slice(0, 30))}
          placeholder="First name"
          style={{
            width: "100%", padding: "12px 14px", borderRadius: 12,
            border: `1px solid ${VET_COLORS.border}`, background: VET_COLORS.surface,
            fontSize: 14, marginBottom: 16, boxSizing: "border-box", outline: "none",
          }}
        />
      )}

      <button
        onClick={() => onSubmit({
          branch,
          service_years: serviceYears || null,
          zip_code: zip || null,
          display_mode: displayMode,
          first_name: displayMode === "first_name" ? firstName : null,
        })}
        disabled={!canSubmit || saving}
        style={{
          width: "100%", padding: 15, borderRadius: 50, border: "none",
          background: canSubmit ? VET_COLORS.olive : VET_COLORS.border,
          color: canSubmit ? "#fff" : VET_COLORS.dim,
          fontWeight: 700, fontSize: 15,
          cursor: canSubmit ? "pointer" : "default", marginTop: 8,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}
      >
        {saving && <Loader2 style={{ width: 15, height: 15 }} className="animate-spin" />}
        Enter Veterans Hub →
      </button>

      <p style={{ fontSize: 11, color: VET_COLORS.dim, textAlign: "center", marginTop: 14, lineHeight: 1.5 }}>
        You can change these settings anytime.
      </p>
    </div>
  );
}