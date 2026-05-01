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
              border: `1px solid ${active ? C.navy : C.border}`,
              background: active ? C.navy : "#fff",
              color: active ? "#fff" : C.muted,
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
      <p style={{ fontSize: 10, fontWeight: 800, color: C.muted,
        letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 6 }}>{label}</p>
      {children}
    </div>
  );
}

export default function SmartFilters({ filters, setFilters, location, onLocate, locating }) {
  const update = (k, v) => setFilters((f) => ({ ...f, [k]: v }));

  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 18, padding: 14, marginBottom: 14,
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
            border: `1px solid ${location ? C.olive : C.border}`,
            background: location ? "rgba(91,110,72,0.10)" : "#fff",
            color: location ? C.olive : C.muted,
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