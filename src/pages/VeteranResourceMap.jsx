import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MapPin, Loader2, Phone, Navigation, ListFilter } from "lucide-react";

import ResourceMap from "@/components/veteranhub/ResourceMap";
import { distanceMiles, getBrowserLocation, geocodeZip } from "@/components/veterans/resourceUtils";

const NAVY = "#0F1E3D";
const GOLD = "#C8932F";
const CREAM = "#F6F4EF";
const BORDER = "#E4DFD3";
const TEXT = "#1A1F2C";
const MUTED = "#4A5260";
const DIM = "#6B7280";

const CATEGORIES = [
  { key: "all",             label: "All",            emoji: "🗺️" },
  { key: "va_hospital",     label: "VA Hospitals",   emoji: "🏥" },
  { key: "mental_health",   label: "Mental Health",  emoji: "🧠" },
  { key: "substance_abuse", label: "Recovery",       emoji: "🌿" },
  { key: "housing",         label: "Housing",        emoji: "🏠" },
  { key: "employment",      label: "Jobs",           emoji: "💼" },
  { key: "food_emergency",  label: "Food",           emoji: "🥫" },
  { key: "legal",           label: "Legal",          emoji: "⚖️" },
  { key: "crisis",          label: "Crisis",         emoji: "🆘" },
];

const RADIUS_OPTIONS = [10, 25, 50, 100, 250];

export default function VeteranResourceMap() {
  const navigate = useNavigate();

  const [category, setCategory] = useState("all");
  const [radius, setRadius] = useState(50);
  const [location, setLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [zipInput, setZipInput] = useState("");
  const [zipError, setZipError] = useState("");

  const { data: resources = [], isLoading } = useQuery({
    queryKey: ["veteran-resources-map"],
    queryFn: () => base44.entities.VeteranResource.list("-priority_score", 500),
  });

  // Auto-request browser location on mount
  useEffect(() => {
    (async () => {
      setLocating(true);
      try {
        const loc = await getBrowserLocation();
        setLocation(loc);
      } catch {
        // user denied or unsupported — silent fallback
      } finally {
        setLocating(false);
      }
    })();
  }, []);

  const handleUseLocation = async () => {
    setLocating(true);
    setZipError("");
    try {
      const loc = await getBrowserLocation();
      setLocation(loc);
    } catch (err) {
      setZipError("Couldn't get your location. Try entering a ZIP code.");
    } finally {
      setLocating(false);
    }
  };

  const handleZipSubmit = async (e) => {
    e.preventDefault();
    if (!zipInput) return;
    setLocating(true);
    setZipError("");
    const loc = await geocodeZip(zipInput);
    setLocating(false);
    if (loc) setLocation(loc);
    else setZipError("ZIP not found. Check and try again.");
  };

  // Compute distances + filter
  const filtered = useMemo(() => {
    let list = resources.filter((r) => r.latitude && r.longitude);

    if (category !== "all") {
      list = list.filter((r) => r.category === category);
    }

    if (location) {
      list = list.map((r) => ({
        ...r,
        distanceMi: distanceMiles(location.lat, location.lon, r.latitude, r.longitude),
      }));

      list = list.filter((r) => r.distanceMi != null && r.distanceMi <= radius);
      list.sort((a, b) => (a.distanceMi ?? 9e9) - (b.distanceMi ?? 9e9));
    }

    return list;
  }, [resources, category, location, radius]);

  return (
    <div style={{ background: CREAM, minHeight: "100vh", paddingBottom: 130 }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ padding: "44px 20px 14px", background: "#fff", borderBottom: `1px solid ${BORDER}` }}>
          <button onClick={() => navigate("/VeteranSupportHub")}
            style={{
              background: "transparent", border: "none", padding: 0, cursor: "pointer",
              display: "inline-flex", alignItems: "center", gap: 6,
              color: MUTED, fontSize: 13, fontWeight: 600, marginBottom: 12,
            }}>
            <ArrowLeft style={{ width: 15, height: 15 }} /> Veteran Support Hub
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: "rgba(15,30,61,0.08)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <MapPin style={{ width: 22, height: 22, color: NAVY }} />
            </div>
            <div>
              <h1 style={{ fontFamily: "'Lora',Georgia,serif",
                fontSize: 24, fontWeight: 700, color: NAVY, lineHeight: 1.1 }}>
                Resources <span style={{ color: GOLD }}>Near You</span>
              </h1>
              <p style={{ fontSize: 12.5, color: DIM, marginTop: 3 }}>
                VA hospitals, shelters, jobs, and more on the map.
              </p>
            </div>
          </div>
        </div>

        <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Location controls */}
          <div style={{
            background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 14,
            padding: 12,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <button onClick={handleUseLocation} disabled={locating}
                style={{
                  flex: 1, padding: "9px 12px", borderRadius: 999,
                  border: `1px solid ${location ? "#5B6E48" : BORDER}`,
                  background: location ? "rgba(91,110,72,0.10)" : "#fff",
                  color: location ? "#5B6E48" : MUTED,
                  fontSize: 12.5, fontWeight: 700, cursor: locating ? "wait" : "pointer",
                  fontFamily: "'DM Sans',sans-serif",
                  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
                }}>
                {locating
                  ? <Loader2 className="animate-spin" style={{ width: 13, height: 13 }} />
                  : <MapPin style={{ width: 13, height: 13 }} />}
                {location ? "Location set ✓" : "Use my location"}
              </button>
            </div>

            <form onSubmit={handleZipSubmit} style={{ display: "flex", gap: 6 }}>
              <input
                value={zipInput}
                onChange={(e) => setZipInput(e.target.value.replace(/\D/g, "").slice(0, 5))}
                placeholder="Or enter ZIP code"
                inputMode="numeric"
                style={{
                  flex: 1, padding: "9px 12px", borderRadius: 10,
                  border: `1px solid ${BORDER}`, background: "#FBFAF6",
                  fontSize: 13, color: TEXT, outline: "none",
                  fontFamily: "'DM Sans',sans-serif",
                }}
              />
              <button type="submit"
                style={{
                  padding: "9px 16px", borderRadius: 10, border: "none",
                  background: NAVY, color: "#fff",
                  fontSize: 12.5, fontWeight: 700, cursor: "pointer",
                  fontFamily: "'DM Sans',sans-serif",
                }}>
                Go
              </button>
            </form>
            {zipError && <p style={{ fontSize: 11, color: "#B5483D", marginTop: 6 }}>{zipError}</p>}
          </div>

          {/* Category pills */}
          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
            {CATEGORIES.map((c) => {
              const active = category === c.key;
              return (
                <button key={c.key} onClick={() => setCategory(c.key)}
                  style={{
                    flexShrink: 0,
                    padding: "7px 12px", borderRadius: 999,
                    border: `1px solid ${active ? NAVY : BORDER}`,
                    background: active ? NAVY : "#fff",
                    color: active ? "#fff" : MUTED,
                    fontSize: 12, fontWeight: 700, cursor: "pointer",
                    whiteSpace: "nowrap",
                    fontFamily: "'DM Sans',sans-serif",
                  }}>
                  {c.emoji} {c.label}
                </button>
              );
            })}
          </div>

          {/* Radius pills (only when location set) */}
          {location && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: DIM,
                textTransform: "uppercase", letterSpacing: ".08em" }}>Radius</span>
              {RADIUS_OPTIONS.map((r) => {
                const active = radius === r;
                return (
                  <button key={r} onClick={() => setRadius(r)}
                    style={{
                      padding: "5px 11px", borderRadius: 999,
                      border: `1px solid ${active ? GOLD : BORDER}`,
                      background: active ? "rgba(200,147,47,0.14)" : "#fff",
                      color: active ? GOLD : MUTED,
                      fontSize: 11.5, fontWeight: 700, cursor: "pointer",
                      fontFamily: "'DM Sans',sans-serif",
                    }}>
                    {r} mi
                  </button>
                );
              })}
            </div>
          )}

          {/* Map */}
          {isLoading ? (
            <div style={{
              height: 360, borderRadius: 16, background: "#fff",
              border: `1px solid ${BORDER}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Loader2 className="animate-spin" style={{ width: 22, height: 22, color: NAVY }} />
            </div>
          ) : (
            <ResourceMap
              resources={filtered}
              userLocation={location}
              radiusMiles={location ? radius : 0}
            />
          )}

          {/* Result count */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 4px" }}>
            <p style={{ fontSize: 12.5, fontWeight: 700, color: TEXT }}>
              {filtered.length} {filtered.length === 1 ? "resource" : "resources"}
              {location && ` within ${radius} mi`}
            </p>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: DIM }}>
              <ListFilter style={{ width: 11, height: 11 }} />
              {category === "all" ? "All categories" : CATEGORIES.find(c => c.key === category)?.label}
            </span>
          </div>

          {/* List below map */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered.length === 0 && !isLoading ? (
              <div style={{
                background: "#fff", border: `1px dashed ${BORDER}`,
                borderRadius: 14, padding: "26px 16px", textAlign: "center",
              }}>
                <p style={{ fontSize: 13.5, fontWeight: 700, color: TEXT, marginBottom: 4 }}>
                  No resources found
                </p>
                <p style={{ fontSize: 12, color: DIM, lineHeight: 1.55 }}>
                  {location
                    ? "Try expanding the radius or changing the category."
                    : "Set your location to see resources near you."}
                </p>
              </div>
            ) : (
              filtered.slice(0, 50).map((r) => (
                <div key={r.id} style={{
                  background: "#fff", border: `1px solid ${BORDER}`,
                  borderRadius: 12, padding: "11px 13px",
                  display: "flex", alignItems: "center", gap: 10,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13.5, fontWeight: 700, color: TEXT, lineHeight: 1.3 }}>
                      {r.name}
                    </p>
                    <p style={{ fontSize: 11, color: DIM, marginTop: 2 }}>
                      {[r.city, r.state].filter(Boolean).join(", ")}
                      {r.distanceMi != null && ` · ${r.distanceMi.toFixed(1)} mi`}
                    </p>
                  </div>
                  {r.phone && (
                    <a href={`tel:${r.phone}`} aria-label="Call"
                      style={iconBtn("#0F1E3D")}>
                      <Phone style={{ width: 13, height: 13 }} />
                    </a>
                  )}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${r.latitude},${r.longitude}`}
                    target="_blank" rel="noopener noreferrer" aria-label="Directions"
                    style={iconBtn("#5B6E48")}
                  >
                    <Navigation style={{ width: 13, height: 13 }} />
                  </a>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const iconBtn = (bg) => ({
  width: 32, height: 32, borderRadius: 999,
  background: bg, color: "#fff",
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  textDecoration: "none", flexShrink: 0,
});