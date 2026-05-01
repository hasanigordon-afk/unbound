import React from "react";
import { Search } from "lucide-react";

const NAVY = "#0F1E3D";
const GOLD = "#C8932F";
const BORDER = "#E4DFD3";
const MUTED = "#4A5260";

const TIME_OPTIONS = [
  { value: "all",     label: "Any time"        },
  { value: "morning", label: "Morning · 5–12"  },
  { value: "midday",  label: "Midday · 12–5"   },
  { value: "evening", label: "Evening · 5–9"   },
  { value: "night",   label: "Night · 9–5am"   },
];

const TYPE_OPTIONS = ["AA", "NA", "SMART", "CA", "GA", "Other"];
const FORMAT_OPTIONS = [
  { value: "all",    label: "All formats" },
  { value: "open",   label: "Open"        },
  { value: "closed", label: "Closed"      },
  { value: "hybrid", label: "Hybrid"      },
];
const LOCATION_OPTIONS = [
  { value: "all",     label: "All"       },
  { value: "inperson",label: "In person" },
  { value: "online",  label: "Online"    },
];

function Pills({ value, options, onChange }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {options.map((opt) => {
        const v = typeof opt === "string" ? opt : opt.value;
        const label = typeof opt === "string" ? opt : opt.label;
        const active = value === v;
        return (
          <button
            key={v}
            onClick={() => onChange(v)}
            style={{
              padding: "7px 12px", borderRadius: 999,
              border: `1px solid ${active ? NAVY : BORDER}`,
              background: active ? NAVY : "#fff",
              color: active ? "#fff" : MUTED,
              fontSize: 12, fontWeight: 700, cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function Section({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <p style={{
        fontSize: 10, fontWeight: 800, color: MUTED, letterSpacing: ".1em",
        textTransform: "uppercase", marginBottom: 6,
      }}>{label}</p>
      {children}
    </div>
  );
}

export default function MeetingFilters({ filters, setFilters }) {
  const update = (k, v) => setFilters((f) => ({ ...f, [k]: v }));

  return (
    <div style={{
      background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 18,
      padding: 14, marginBottom: 14,
    }}>
      {/* Search */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8, padding: "10px 12px",
        borderRadius: 12, background: "#F6F4EF", marginBottom: 12,
        border: `1px solid ${BORDER}`,
      }}>
        <Search style={{ width: 15, height: 15, color: MUTED }} />
        <input
          value={filters.search}
          onChange={(e) => update("search", e.target.value)}
          placeholder="Search by name, city, or zip"
          style={{
            flex: 1, border: "none", outline: "none", background: "transparent",
            fontSize: 14, color: NAVY, fontFamily: "inherit", padding: 0,
          }}
        />
      </div>

      <Section label="Time of day"><Pills value={filters.time}     options={TIME_OPTIONS}     onChange={(v) => update("time", v)} /></Section>
      <Section label="Program">    <Pills value={filters.type}     options={["all", ...TYPE_OPTIONS].map(v => ({ value: v, label: v === "all" ? "All" : v }))} onChange={(v) => update("type", v)} /></Section>
      <Section label="Format">     <Pills value={filters.format}   options={FORMAT_OPTIONS}   onChange={(v) => update("format", v)} /></Section>
      <Section label="Location">   <Pills value={filters.location} options={LOCATION_OPTIONS} onChange={(v) => update("location", v)} /></Section>
    </div>
  );
}