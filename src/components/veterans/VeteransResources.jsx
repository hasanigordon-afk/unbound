import React, { useState, useMemo, useEffect } from "react";
import { Phone, MapPin, Check, Search, Navigation, Heart, Loader2, AlertTriangle } from "lucide-react";
import { VET_COLORS, RESOURCE_CATEGORIES, getCategory } from "./veteransData";
import { distanceMiles, getBrowserLocation, geocodeZip } from "./resourceUtils";

function ResourceCard({ resource, distance, isFavorite, onToggleFavorite, favoritePending }) {
  const cat = getCategory(resource.category);
  const isCrisis = resource.category === "crisis";
  const mapsUrl = resource.latitude && resource.longitude
    ? `https://maps.google.com/?q=${resource.latitude},${resource.longitude}`
    : `https://maps.google.com/?q=${encodeURIComponent([resource.name, resource.address, resource.city, resource.state].filter(Boolean).join(", "))}`;

  const accent = isCrisis ? "#B85C5C" : VET_COLORS.olive;
  const accentBg = isCrisis ? "rgba(184,92,92,0.08)" : VET_COLORS.oliveDim;

  return (
    <div style={{
      background: isCrisis ? "rgba(184,92,92,0.04)" : VET_COLORS.surface,
      border: `1px solid ${isCrisis ? "rgba(184,92,92,0.35)" : VET_COLORS.border}`,
      borderRadius: 14, padding: "14px 16px",
      position: "relative",
    }}>
      {isCrisis && (
        <div style={{
          position: "absolute", top: -1, left: 12, right: 12, height: 3,
          background: "#B85C5C", borderRadius: "0 0 3px 3px",
        }} />
      )}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 9, flexShrink: 0,
          background: accentBg,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
        }}>
          {cat.emoji}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2, flexWrap: "wrap" }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: VET_COLORS.text }}>{resource.name}</p>
            {isCrisis && (
              <span style={{
                fontSize: 9, fontWeight: 800, color: "#fff",
                background: "#B85C5C", padding: "2px 7px", borderRadius: 20,
                letterSpacing: ".06em", textTransform: "uppercase",
              }}>
                Crisis
              </span>
            )}
            {resource.verified && (
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
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <p style={{ fontSize: 11, color: accent, fontWeight: 600 }}>{cat.label}</p>
            {distance != null && (
              <>
                <span style={{ color: VET_COLORS.dim, fontSize: 10 }}>·</span>
                <p style={{ fontSize: 11, color: VET_COLORS.dim, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 3 }}>
                  <Navigation style={{ width: 10, height: 10 }} />
                  {distance.toFixed(1)} mi
                </p>
              </>
            )}
          </div>
        </div>
        <button
          onClick={() => onToggleFavorite(resource)}
          disabled={favoritePending}
          title={isFavorite ? "Remove from favorites" : "Save to favorites"}
          style={{
            background: "none", border: "none", cursor: favoritePending ? "default" : "pointer",
            color: isFavorite ? "#B85C5C" : VET_COLORS.dim, padding: 4, flexShrink: 0,
          }}
        >
          <Heart style={{ width: 18, height: 18 }} fill={isFavorite ? "#B85C5C" : "none"} strokeWidth={1.8} />
        </button>
      </div>

      {(resource.address || resource.city) && (
        <p style={{ fontSize: 12, color: VET_COLORS.muted, marginBottom: 10, lineHeight: 1.5 }}>
          {[resource.address, resource.city, resource.state, resource.zip].filter(Boolean).join(", ")}
        </p>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        {resource.phone && (
          <a href={`tel:${resource.phone}`} style={{ flex: 1, textDecoration: "none" }}>
            <div style={{
              padding: "9px", borderRadius: 10, textAlign: "center",
              background: isCrisis ? "rgba(184,92,92,0.12)" : VET_COLORS.navyDim,
              border: `1px solid ${isCrisis ? "rgba(184,92,92,0.35)" : VET_COLORS.navy + "30"}`,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}>
              <Phone style={{ width: 13, height: 13, color: isCrisis ? "#B85C5C" : VET_COLORS.navy }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: isCrisis ? "#B85C5C" : VET_COLORS.navy }}>Call</span>
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
}

export default function VeteransResources({ resources, profileZip, favorites, onToggleFavorite, favoritePending }) {
  const [category, setCategory] = useState("all");
  const [showFavorites, setShowFavorites] = useState(false);
  const [zip, setZip] = useState(profileZip || "");
  const [userCoords, setUserCoords] = useState(null);
  const [locStatus, setLocStatus] = useState("idle"); // idle | locating | ok | error
  const [locError, setLocError] = useState("");

  const favoriteSet = useMemo(
    () => new Set((favorites || []).map(f => f.resource_id)),
    [favorites]
  );

  // Try to geocode from profile zip on mount
  useEffect(() => {
    if (profileZip && !userCoords) {
      geocodeZip(profileZip).then(c => { if (c) setUserCoords(c); });
    }
  }, [profileZip]); // eslint-disable-line

  const useMyLocation = async () => {
    setLocStatus("locating");
    setLocError("");
    try {
      const c = await getBrowserLocation();
      setUserCoords(c);
      setLocStatus("ok");
    } catch (err) {
      setLocError(err.message || "Couldn't get your location");
      setLocStatus("error");
    }
  };

  const applyZip = async () => {
    if (zip.length < 5) return;
    setLocStatus("locating");
    const c = await geocodeZip(zip);
    if (c) { setUserCoords(c); setLocStatus("ok"); }
    else { setLocError("Zip not found"); setLocStatus("error"); }
  };

  const decorated = useMemo(() => {
    return resources.map(r => {
      const dist = userCoords && r.latitude && r.longitude
        ? distanceMiles(userCoords.lat, userCoords.lon, r.latitude, r.longitude)
        : null;
      return { ...r, _distance: dist };
    });
  }, [resources, userCoords]);

  const filtered = useMemo(() => {
    let list = decorated;
    if (showFavorites) list = list.filter(r => favoriteSet.has(r.id));
    if (category !== "all") list = list.filter(r => r.category === category);

    // Sort: crisis first, then by distance ascending (unknown distance goes last)
    return [...list].sort((a, b) => {
      if (a.category === "crisis" && b.category !== "crisis") return -1;
      if (b.category === "crisis" && a.category !== "crisis") return 1;
      const da = a._distance == null ? Infinity : a._distance;
      const db = b._distance == null ? Infinity : b._distance;
      return da - db;
    });
  }, [decorated, category, showFavorites, favoriteSet]);

  return (
    <div style={{ padding: "20px 16px 40px" }}>
      <p style={{ fontFamily: "'Lora', serif", fontSize: 22, fontWeight: 600, color: VET_COLORS.text, marginBottom: 4 }}>
        Resources Near You
      </p>
      <p style={{ fontSize: 13, color: VET_COLORS.muted, marginBottom: 16, lineHeight: 1.5 }}>
        Verified support, sorted by closest first.
      </p>

      {/* Location block */}
      <div style={{
        background: VET_COLORS.surface, border: `1px solid ${VET_COLORS.border}`,
        borderRadius: 14, padding: "12px 14px", marginBottom: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <Navigation style={{ width: 14, height: 14, color: userCoords ? VET_COLORS.olive : VET_COLORS.dim }} />
          <p style={{ fontSize: 11, fontWeight: 700, color: VET_COLORS.dim, textTransform: "uppercase", letterSpacing: ".08em", flex: 1 }}>
            {userCoords ? "Location set" : "Set your location"}
          </p>
          {userCoords && (
            <button onClick={() => { setUserCoords(null); setLocStatus("idle"); }} style={{
              background: "none", border: "none", color: VET_COLORS.dim, fontSize: 11, fontWeight: 600, cursor: "pointer",
            }}>Clear</button>
          )}
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{
            flex: 1, display: "flex", alignItems: "center", gap: 8,
            background: VET_COLORS.bg, border: `1px solid ${VET_COLORS.border}`, borderRadius: 10,
            padding: "8px 12px",
          }}>
            <Search style={{ width: 14, height: 14, color: VET_COLORS.dim }} />
            <input
              value={zip}
              onChange={e => setZip(e.target.value.slice(0, 5).replace(/\D/g, ""))}
              onKeyDown={e => e.key === "Enter" && applyZip()}
              placeholder="Zip code"
              inputMode="numeric"
              style={{
                flex: 1, border: "none", background: "transparent", outline: "none",
                fontSize: 14, color: VET_COLORS.text,
              }}
            />
            {zip.length === 5 && (
              <button onClick={applyZip} style={{
                background: VET_COLORS.olive, color: "#fff", border: "none",
                padding: "4px 10px", borderRadius: 50, fontSize: 11, fontWeight: 700, cursor: "pointer",
              }}>Go</button>
            )}
          </div>
          <button onClick={useMyLocation} disabled={locStatus === "locating"} style={{
            background: VET_COLORS.oliveDim, border: `1px solid ${VET_COLORS.olive}30`,
            padding: "8px 12px", borderRadius: 10, cursor: "pointer",
            display: "inline-flex", alignItems: "center", gap: 5,
            color: VET_COLORS.olive, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap",
          }}>
            {locStatus === "locating"
              ? <Loader2 style={{ width: 12, height: 12 }} className="animate-spin" />
              : <Navigation style={{ width: 12, height: 12 }} />}
            Use GPS
          </button>
        </div>

        {locStatus === "error" && (
          <p style={{ fontSize: 11, color: "#B85C5C", marginTop: 8, display: "flex", alignItems: "center", gap: 4 }}>
            <AlertTriangle style={{ width: 11, height: 11 }} /> {locError}
          </p>
        )}
      </div>

      {/* Favorites toggle */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button onClick={() => setShowFavorites(false)} style={{
          flex: 1, padding: "9px 12px", borderRadius: 10, cursor: "pointer",
          background: !showFavorites ? VET_COLORS.navyDim : VET_COLORS.surface,
          border: `1px solid ${!showFavorites ? VET_COLORS.navy + "40" : VET_COLORS.border}`,
          color: !showFavorites ? VET_COLORS.navy : VET_COLORS.muted,
          fontWeight: 700, fontSize: 12,
        }}>All Resources</button>
        <button onClick={() => setShowFavorites(true)} style={{
          flex: 1, padding: "9px 12px", borderRadius: 10, cursor: "pointer",
          background: showFavorites ? "rgba(184,92,92,0.08)" : VET_COLORS.surface,
          border: `1px solid ${showFavorites ? "rgba(184,92,92,0.35)" : VET_COLORS.border}`,
          color: showFavorites ? "#B85C5C" : VET_COLORS.muted,
          fontWeight: 700, fontSize: 12,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
        }}>
          <Heart style={{ width: 12, height: 12 }} fill={showFavorites ? "#B85C5C" : "none"} />
          Favorites {favoriteSet.size > 0 && `(${favoriteSet.size})`}
        </button>
      </div>

      {/* Category chips */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 16, paddingBottom: 4, scrollbarWidth: "none" }}>
        {[{ key: "all", label: "All", emoji: "📋" }, ...RESOURCE_CATEGORIES].map(c => {
          const sel = category === c.key;
          const isCrisis = c.key === "crisis";
          return (
            <button key={c.key} onClick={() => setCategory(c.key)} style={{
              padding: "8px 14px", borderRadius: 20, cursor: "pointer", flexShrink: 0,
              background: sel ? (isCrisis ? "#B85C5C" : VET_COLORS.olive) : VET_COLORS.surface,
              border: `1px solid ${sel ? (isCrisis ? "#B85C5C" : VET_COLORS.olive) : VET_COLORS.border}`,
              color: sel ? "#fff" : (isCrisis ? "#B85C5C" : VET_COLORS.muted),
              fontWeight: 700, fontSize: 12,
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
            {showFavorites
              ? "No favorites yet. Tap the heart on any resource to save it."
              : "No resources match this filter yet."}
          </p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map(r => (
          <ResourceCard
            key={r.id}
            resource={r}
            distance={r._distance}
            isFavorite={favoriteSet.has(r.id)}
            favoritePending={favoritePending}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    </div>
  );
}