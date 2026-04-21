import React, { useState, useMemo } from "react";
import { Phone, Navigation, Bookmark } from "lucide-react";
import { VM } from "../vmData";

const CHIPS = [
  { key: "all",        label: "All",         matches: null },
  { key: "health",     label: "Health",      matches: ["va_hospital"] },
  { key: "counseling", label: "Counseling",  matches: ["mental_health", "substance_abuse"] },
  { key: "housing",    label: "Housing",     matches: ["housing"] },
  { key: "jobs",       label: "Jobs",        matches: ["employment", "jobs"] },
  { key: "crisis",     label: "Crisis",      matches: ["crisis"] },
];

function ResourceRow({ r, saved, onSave }) {
  const mapsUrl = r.latitude && r.longitude
    ? `https://maps.google.com/?q=${r.latitude},${r.longitude}`
    : `https://maps.google.com/?q=${encodeURIComponent([r.name, r.address, r.city, r.state].filter(Boolean).join(", "))}`;

  return (
    <div style={{
      background: VM.surface, border: `1px solid ${VM.border}`,
      borderRadius: 12, padding: "12px 14px",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: VM.text, marginBottom: 2 }}>{r.name}</p>
          <p style={{ fontSize: 11, color: VM.muted }}>
            <span style={{ color: VM.olive, fontWeight: 600 }}>{r.category?.replace(/_/g, " ")}</span>
            {r.city && <> · {r.city}</>}
          </p>
        </div>
        <button onClick={() => onSave(r)} style={{
          background: "none", border: "none", cursor: "pointer",
          color: saved ? VM.gold : VM.dim, padding: 2, flexShrink: 0,
        }}>
          <Bookmark style={{ width: 16, height: 16 }} fill={saved ? VM.gold : "none"} strokeWidth={1.8} />
        </button>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {r.phone && (
          <a href={`tel:${r.phone}`} style={{ flex: 1, textDecoration: "none" }}>
            <div style={{
              padding: "8px", borderRadius: 8, textAlign: "center",
              background: VM.oliveSoft, border: `1px solid ${VM.olive}40`,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
            }}>
              <Phone style={{ width: 12, height: 12, color: VM.olive }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: VM.olive }}>Call</span>
            </div>
          </a>
        )}
        <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={{ flex: 1, textDecoration: "none" }}>
          <div style={{
            padding: "8px", borderRadius: 8, textAlign: "center",
            background: "transparent", border: `1px solid ${VM.border}`,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
          }}>
            <Navigation style={{ width: 12, height: 12, color: VM.muted }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: VM.muted }}>Directions</span>
          </div>
        </a>
      </div>
    </div>
  );
}

export default function VMDNearbyResources({ resources, savedIds, onSave }) {
  const [chip, setChip] = useState("all");

  const filtered = useMemo(() => {
    const picked = CHIPS.find(c => c.key === chip);
    if (!picked || !picked.matches) return resources.slice(0, 5);
    return resources.filter(r => picked.matches.includes(r.category)).slice(0, 5);
  }, [resources, chip]);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: VM.dim, textTransform: "uppercase", letterSpacing: ".12em" }}>
          Nearby Veteran Resources
        </p>
      </div>

      {/* Chips */}
      <div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 12, paddingBottom: 4, scrollbarWidth: "none" }}>
        {CHIPS.map(c => {
          const sel = chip === c.key;
          return (
            <button key={c.key} onClick={() => setChip(c.key)} style={{
              padding: "6px 12px", borderRadius: 20, cursor: "pointer", flexShrink: 0,
              background: sel ? VM.olive : "transparent",
              border: `1px solid ${sel ? VM.olive : VM.border}`,
              color: sel ? "#12140F" : VM.muted,
              fontSize: 11, fontWeight: 700, fontFamily: "inherit", whiteSpace: "nowrap",
            }}>
              {c.label}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div style={{ padding: "24px 16px", textAlign: "center", background: VM.surface, border: `1px solid ${VM.border}`, borderRadius: 12 }}>
          <p style={{ fontSize: 12, color: VM.dim }}>No resources in this category yet.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map(r => (
            <ResourceRow key={r.id} r={r} saved={savedIds.has(r.id)} onSave={onSave} />
          ))}
        </div>
      )}
    </div>
  );
}