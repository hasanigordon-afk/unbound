import React from "react";
import { MapPin, Loader2 } from "lucide-react";
import { BRANCHES } from "@/components/veterans/veteransData";
import { NEED_OPTIONS, VH_COLORS as C } from "./vetHubData";

function Pills({ value, options, onChange, getKey, getLabel, getEmoji }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {options.map((opt) => {
        const k = getKey(opt);
        const active = value === k;
        return (
          <button key={k} onClick={() => onChange(k)}
            style={{
              padding: "7px 11px", borderRadius: 999,
              border: active ? "1px solid rgba(34,211,238,.42)" : "1px solid rgba(255,255,255,.12)",
              background: active ? "linear-gradient(135deg, rgba(91,141,239,.94), rgba(34,211,238,.62))" : "rgba(255,255,255,.06)",
              color: active ? "#fff" : "var(--text-muted)",
              fontSize: 12, fontWeight: 700, cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              display: "inline-flex", alignItems: "center", gap: 5,
            }}>
            {getEmoji && getEmoji(opt) && <span>{getEmoji(opt)}</span>}
            {getLabel(opt)}
          </button>
        );
      })}
    </div>
  );
}

function Section({ label, children }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <p style={{ fontSize: 10, fontWeight: 900, color: "var(--text-dim)",
       letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 8 }}>{label}</p>
      {children}
    </div>
  );
}

export default function SmartFilters({ filters, setFilters, location, onLocate, locating }) {
  const update = (k, v) => setFilters((f) => ({ ...f, [k]: v }));

  return (
    <div style={{
      background: "linear-gradient(145deg, rgba(255,255,255,.10), rgba(13,18,32,.74))", border: "1px solid rgba(190,225,255,.15)",
      borderRadius: 26, padding: 18, marginBottom: 14,
      boxShadow: "0 20px 54px rgba(0,0,0,.28), inset 0 1px 0 rgba(255,255,255,.10)", backdropFilter: "blur(24px) saturate(160%)",
    }}>
      <Section label="What do you need?">
        <Pills
          value={filters.need}
          options={NEED_OPTIONS}
          onChange={(v) => update("need", v)}
          getKey={(o) => o.key}
          getLabel={(o) => o.label}
        />
      </Section>

      <Section label="Branch (optional)">
        <Pills
          value={filters.branch}
          options={[{ key: "all", label: "All branches", emoji: "🇺🇸" }, ...BRANCHES]}
          onChange={(v) => update("branch", v)}
          getKey={(o) => o.key}
          getLabel={(o) => o.label}
          getEmoji={(o) => o.emoji}
        />
      </Section>

      <Section label="Location">
        <button onClick={onLocate} disabled={locating}
          style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            padding: "9px 14px", borderRadius: 999,
            border: location ? "1px solid rgba(52,211,153,.34)" : "1px solid rgba(255,255,255,.12)",
            background: location ? "rgba(52,211,153,.12)" : "rgba(255,255,255,.06)",
            color: location ? "#34D399" : "var(--text-muted)",
            fontSize: 12.5, fontWeight: 700, cursor: locating ? "wait" : "pointer",
            fontFamily: "'DM Sans', sans-serif",
          }}>
          {locating
            ? <Loader2 className="animate-spin" style={{ width: 13, height: 13 }} />
            : <MapPin style={{ width: 13, height: 13 }} />}
          {location ? "Location set ✓" : "Use my location"}
        </button>
      </Section>
    </div>
  );
}