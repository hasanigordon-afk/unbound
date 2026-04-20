import React, { useState, useMemo } from "react";
import { Phone, MapPin, Check, Search } from "lucide-react";
import { VET_COLORS, RESOURCE_CATEGORIES, getCategory } from "./veteransData";

export default function VeteransResources({ resources, profileZip }) {
  const [category, setCategory] = useState("all");
  const [zip, setZip] = useState(profileZip || "");

  const filtered = useMemo(() => {
    let list = resources;
    if (category !== "all") list = list.filter(r => r.category === category);
    if (zip) list = list.filter(r => (r.zip || "").startsWith(zip.slice(0, 3)) || (r.zip === zip));
    return list;
  }, [resources, category, zip]);

  return (
    <div style={{ padding: "20px 16px 40px" }}>
      <p style={{ fontFamily: "'Lora', serif", fontSize: 22, fontWeight: 600, color: VET_COLORS.text, marginBottom: 4 }}>
        Resources Near You
      </p>
      <p style={{ fontSize: 13, color: VET_COLORS.muted, marginBottom: 18, lineHeight: 1.5 }}>
        Verified support — from VA hospitals to legal aid.
      </p>

      {/* Zip search */}
      <div style={{
        background: VET_COLORS.surface, border: `1px solid ${VET_COLORS.border}`,
        borderRadius: 12, padding: "10px 14px", marginBottom: 12,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <Search style={{ width: 16, height: 16, color: VET_COLORS.dim }} />
        <input
          value={zip}
          onChange={e => setZip(e.target.value.slice(0, 5))}
          placeholder="Enter zip to filter"
          style={{
            flex: 1, border: "none", background: "transparent", outline: "none",
            fontSize: 14, color: VET_COLORS.text,
          }}
        />
        {zip && (
          <button onClick={() => setZip("")} style={{ background: "none", border: "none", cursor: "pointer", color: VET_COLORS.dim, fontSize: 12, fontWeight: 600 }}>
            Clear
          </button>
        )}
      </div>

      {/* Category chips */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 16, paddingBottom: 4, scrollbarWidth: "none" }}>
        {[{ key: "all", label: "All", emoji: "📋" }, ...RESOURCE_CATEGORIES].map(c => {
          const sel = category === c.key;
          return (
            <button key={c.key} onClick={() => setCategory(c.key)} style={{
              padding: "8px 14px", borderRadius: 20, cursor: "pointer", flexShrink: 0,
              background: sel ? VET_COLORS.olive : VET_COLORS.surface,
              border: `1px solid ${sel ? VET_COLORS.olive : VET_COLORS.border}`,
              color: sel ? "#fff" : VET_COLORS.muted,
              fontWeight: 600, fontSize: 12,
              display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap",
            }}>
              <span>{c.emoji}</span>
              {c.label}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ padding: "40px 20px", textAlign: "center" }}>
          <p style={{ fontSize: 13, color: VET_COLORS.dim, lineHeight: 1.6 }}>
            No resources match this filter yet.<br/>Try a different category or zip.
          </p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map(r => {
          const cat = getCategory(r.category);
          const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(r.address || r.name + " " + (r.city || ""))}`;
          return (
            <div key={r.id} style={{
              background: VET_COLORS.surface, border: `1px solid ${VET_COLORS.border}`,
              borderRadius: 14, padding: "14px 16px",
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                  background: VET_COLORS.oliveDim,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
                }}>
                  {cat.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2, flexWrap: "wrap" }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: VET_COLORS.text }}>{r.name}</p>
                    {r.verified && (
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 3,
                        fontSize: 9, fontWeight: 700, color: VET_COLORS.olive,
                        background: VET_COLORS.oliveDim, padding: "2px 7px", borderRadius: 20,
                        letterSpacing: ".05em", textTransform: "uppercase",
                      }}>
                        <Check style={{ width: 10, height: 10 }} strokeWidth={3} />
                        Verified
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 11, color: VET_COLORS.dim }}>{cat.label}</p>
                </div>
              </div>

              {(r.address || r.city) && (
                <p style={{ fontSize: 12, color: VET_COLORS.muted, marginBottom: 10, lineHeight: 1.5 }}>
                  {[r.address, r.city, r.state, r.zip].filter(Boolean).join(", ")}
                </p>
              )}

              <div style={{ display: "flex", gap: 8 }}>
                {r.phone && (
                  <a href={`tel:${r.phone}`} style={{ flex: 1, textDecoration: "none" }}>
                    <div style={{
                      padding: "9px", borderRadius: 10, textAlign: "center",
                      background: VET_COLORS.navyDim, border: `1px solid ${VET_COLORS.navy}30`,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    }}>
                      <Phone style={{ width: 13, height: 13, color: VET_COLORS.navy }} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: VET_COLORS.navy }}>Call</span>
                    </div>
                  </a>
                )}
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={{ flex: 1, textDecoration: "none" }}>
                  <div style={{
                    padding: "9px", borderRadius: 10, textAlign: "center",
                    background: VET_COLORS.oliveDim, border: `1px solid ${VET_COLORS.olive}30`,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  }}>
                    <MapPin style={{ width: 13, height: 13, color: VET_COLORS.olive }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: VET_COLORS.olive }}>Directions</span>
                  </div>
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}