import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MapPin, List, Map, Loader2, RefreshCw, X, SlidersHorizontal, Navigation, Phone, Globe } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function haversine(lat1, lon1, lat2, lon2) {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Category config ───────────────────────────────────────────────────────
const CATEGORIES = [
  { value: "",                            label: "All",              icon: "🗺️", color: "#4A90E2" },
  { value: "Housing",                     label: "Housing",          icon: "🏠", color: "#8B5CF6" },
  { value: "Emergency Shelter",           label: "Shelter",          icon: "🛏", color: "#F97316" },
  { value: "Employment Assistance",       label: "Jobs",             icon: "💼", color: "#F59E0B" },
  { value: "Food Pantry",                 label: "Food",             icon: "🍽️", color: "#22C55E" },
  { value: "Reentry Services",            label: "ID & Docs",        icon: "🪪", color: "#14B8A6" },
  { value: "Addiction Treatment",         label: "Treatment",        icon: "💊", color: "#EF4444" },
  { value: "Peer Support",                label: "Meetings",         icon: "🤝", color: "#10B981" },
  { value: "Transportation Assistance",   label: "Transport",        icon: "🚌", color: "#0EA5E9" },
];

const CAT_COLOR = Object.fromEntries(CATEGORIES.map(c => [c.value, c.color]));

// ─── Custom map icon per category ─────────────────────────────────────────
function makeIcon(color) {
  return L.divIcon({
    html: `<div style="width:28px;height:28px;border-radius:50% 50% 50% 0;background:${color};border:3px solid #fff;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,0.35)"></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
    className: "",
  });
}

function MapReCenter({ center }) {
  const map = useMap();
  useEffect(() => { if (center) map.setView(center, map.getZoom()); }, [center]);
  return null;
}

// ─── Resource Card ─────────────────────────────────────────────────────────
function ResourceCard({ r, onSave, isSaved }) {
  const color = CAT_COLOR[r.resource_category] || "#4A90E2";
  const catObj = CATEGORIES.find(c => c.value === r.resource_category);
  const mapsUrl = r.latitude && r.longitude
    ? `https://www.google.com/maps/dir/?api=1&destination=${r.latitude},${r.longitude}`
    : r.street_address
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent([r.street_address, r.city, r.state].filter(Boolean).join(", "))}`
    : null;

  return (
    <div style={{ background: "#FFF", borderRadius: 12, overflow: "hidden", border: "1px solid #E5E7EB" }}>
      <div style={{ height: 4, background: color }} />
      <div style={{ padding: "14px 16px" }}>
        {/* Name + distance */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontWeight: 700, fontSize: 14, color: "#1E1E1E", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {r.organization_name}
            </p>
            {r.program_name && (
              <p style={{ fontSize: 12, color: "#5A5A5A", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {r.program_name}
              </p>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            {r.distance !== null && (
              <span style={{ fontSize: 12, fontWeight: 600, color: "#4A90E2", background: "#EBF3FD", borderRadius: 20, padding: "2px 8px" }}>
                {r.distance < 0.1 ? "< 0.1 mi" : `${r.distance.toFixed(1)} mi`}
              </span>
            )}
          </div>
        </div>

        {/* Category + badges */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
          <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: color + "18", color, fontWeight: 600 }}>
            {catObj?.icon} {r.resource_category}
          </span>
          {r.accepts_medicaid && <Badge bg="#F0FDF4" text="#15803D" border="#86EFAC">✓ Medicaid</Badge>}
          {r.accepts_uninsured && <Badge bg="#EFF6FF" text="#1D4ED8" border="#BFDBFE">✓ Free / Uninsured</Badge>}
          {r.felony_friendly && <Badge bg="#FFF7ED" text="#C2410C" border="#FED7AA">✓ Felony Friendly</Badge>}
          {r.emergency_housing && <Badge bg="#FDF4FF" text="#7E22CE" border="#E9D5FF">🚨 Emergency</Badge>}
        </div>

        {/* Address */}
        {(r.city || r.street_address) && (
          <p style={{ fontSize: 12, color: "#8E8E93", display: "flex", alignItems: "center", gap: 4, marginBottom: 6 }}>
            <MapPin style={{ width: 12, height: 12, flexShrink: 0 }} strokeWidth={2} />
            {[r.street_address, r.city, r.state].filter(Boolean).join(", ")}
          </p>
        )}

        {/* Description */}
        {r.description && (
          <p style={{ fontSize: 12, color: "#5A5A5A", lineHeight: 1.5, marginBottom: 10,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {r.description}
          </p>
        )}

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 6 }}>
          {r.phone && (
            <a href={`tel:${r.phone}`} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
              fontSize: 12, fontWeight: 600, padding: "8px 0", borderRadius: 8, background: "#EBF3FD", color: "#4A90E2", textDecoration: "none" }}>
              <Phone style={{ width: 13, height: 13 }} strokeWidth={2} /> Call
            </a>
          )}
          {mapsUrl && (
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
              fontSize: 12, fontWeight: 600, padding: "8px 0", borderRadius: 8, background: "#F0FDF4", color: "#15803D", textDecoration: "none" }}>
              <Navigation style={{ width: 13, height: 13 }} strokeWidth={2} /> Directions
            </a>
          )}
          {r.website && (
            <a href={r.website} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
              fontSize: 12, fontWeight: 600, padding: "8px 12px", borderRadius: 8, background: "#F7F7F8", color: "#5A5A5A", border: "1px solid #E5E7EB", textDecoration: "none" }}>
              <Globe style={{ width: 13, height: 13 }} strokeWidth={2} /> Web
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function Badge({ bg, text, border, children }) {
  return (
    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: bg, color: text, border: `1px solid ${border}`, fontWeight: 600 }}>
      {children}
    </span>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────
const RADIUS_OPTIONS = [5, 10, 25, 50];

export default function SecondChanceMap() {
  const queryClient = useQueryClient();
  const [view, setView] = useState("list"); // "list" | "map"
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [radius, setRadius] = useState(25);
  const [category, setCategory] = useState("");
  const [medicaidOnly, setMedicaidOnly] = useState(false);
  const [felonyFriendly, setFelonyFriendly] = useState(false);
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [freeOnly, setFreeOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: resources = [], isLoading } = useQuery({
    queryKey: ["us-recovery-resources"],
    queryFn: () => base44.entities.USRecoveryResource.list(),
  });

  const { data: savedResources = [] } = useQuery({
    queryKey: ["saved-resources", user?.email],
    queryFn: () => base44.entities.SavedResource.filter({ created_by: user.email }),
    enabled: !!user,
  });

  const saveMutation = useMutation({
    mutationFn: async (r) => {
      const existing = savedResources.find(s => s.resource_id === r.id);
      if (existing) await base44.entities.SavedResource.delete(existing.id);
      else await base44.entities.SavedResource.create({ resource_id: r.id, resource_name: r.organization_name, resource_category: r.resource_category });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["saved-resources"] }),
  });

  const requestLocation = () => {
    setLocationLoading(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLocationLoading(false); },
      () => { setLocationError("Location denied — showing all results."); setLocationLoading(false); },
      { timeout: 10000 }
    );
  };

  useEffect(() => { requestLocation(); }, []);

  const savedIds = useMemo(() => new Set(savedResources.map(s => s.resource_id)), [savedResources]);

  const processed = useMemo(() => {
    let list = resources.map(r => ({
      ...r,
      distance: userLocation && r.latitude && r.longitude
        ? haversine(userLocation.lat, userLocation.lng, r.latitude, r.longitude)
        : null,
    }));

    if (userLocation) list = list.filter(r => r.distance === null || r.distance <= radius);
    if (category)      list = list.filter(r => r.resource_category === category);
    if (medicaidOnly)  list = list.filter(r => r.accepts_medicaid === true);
    if (freeOnly)      list = list.filter(r => r.accepts_uninsured === true);
    if (felonyFriendly) list = list.filter(r => r.felony_friendly === true);
    if (emergencyOnly) list = list.filter(r => r.emergency_housing === true || r.resource_category === "Emergency Shelter");

    list.sort((a, b) => {
      if (a.distance === null && b.distance === null) return 0;
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    });

    return list;
  }, [resources, userLocation, radius, category, medicaidOnly, freeOnly, felonyFriendly, emergencyOnly]);

  const mapCenter = userLocation
    ? [userLocation.lat, userLocation.lng]
    : [39.8283, -98.5795]; // US center

  const hasFilters = category || medicaidOnly || freeOnly || felonyFriendly || emergencyOnly || radius !== 25;
  const clearFilters = () => { setCategory(""); setMedicaidOnly(false); setFreeOnly(false); setFelonyFriendly(false); setEmergencyOnly(false); setRadius(25); };

  return (
    <div style={{ background: "#F7F7F8", minHeight: "100vh", paddingBottom: 100 }}>
      {/* ── Header ── */}
      <div style={{ background: "#FFF", borderBottom: "1px solid #E5E7EB", padding: "20px 20px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1E1E1E" }}>Second Chance Map</h1>
            <p style={{ fontSize: 12, color: "#8E8E93", marginTop: 2 }}>
              Real places helping you rebuild — housing, jobs, food, ID & more
            </p>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={requestLocation} style={{ padding: "7px", borderRadius: 8, background: "#F0F0F3", border: "1px solid #D1D1D6" }}>
              <RefreshCw style={{ width: 15, height: 15, color: "#5A5A5A" }} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{ padding: "7px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 5,
                background: showFilters || hasFilters ? "#EBF3FD" : "#F0F0F3",
                color: showFilters || hasFilters ? "#4A90E2" : "#5A5A5A",
                border: showFilters || hasFilters ? "1px solid #4A90E2" : "1px solid #D1D1D6" }}>
              <SlidersHorizontal style={{ width: 13, height: 13 }} />
              Filters{hasFilters ? " ●" : ""}
            </button>
          </div>
        </div>

        {/* Location status */}
        <div style={{ padding: "8px 0" }}>
          {locationLoading && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#4A90E2" }}>
              <Loader2 style={{ width: 13, height: 13 }} className="animate-spin" /> Finding your location…
            </div>
          )}
          {userLocation && !locationLoading && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#15803D", background: "#F0FDF4", padding: "6px 10px", borderRadius: 8 }}>
              <MapPin style={{ width: 13, height: 13 }} strokeWidth={2} />
              {processed.length} place{processed.length !== 1 ? "s" : ""} within {radius} miles
            </div>
          )}
          {locationError && (
            <p style={{ fontSize: 12, color: "#D97706", background: "#FFFBEB", padding: "6px 10px", borderRadius: 8 }}>{locationError}</p>
          )}
        </div>

        {/* View toggle */}
        <div style={{ display: "flex", gap: 0, marginBottom: 0, borderTop: "1px solid #F0F0F3", paddingTop: 2 }}>
          {[
            { id: "list", icon: <List style={{ width: 14, height: 14 }} />, label: "List" },
            { id: "map",  icon: <Map  style={{ width: 14, height: 14 }} />, label: "Map" },
          ].map(v => (
            <button key={v.id} onClick={() => setView(v.id)} style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              padding: "10px 0", fontSize: 13, fontWeight: 600,
              color: view === v.id ? "#4A90E2" : "#8E8E93",
              borderBottom: view === v.id ? "2px solid #4A90E2" : "2px solid transparent",
              background: "none", border: "none", borderBottom: view === v.id ? "2px solid #4A90E2" : "2px solid transparent",
              cursor: "pointer",
            }}>
              {v.icon}{v.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Filters Panel ── */}
      {showFilters && (
        <div style={{ background: "#FFF", borderBottom: "1px solid #E5E7EB", padding: "16px 20px" }}>
          {/* Distance */}
          <p style={{ fontSize: 11, fontWeight: 700, color: "#8E8E93", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 8 }}>Distance</p>
          <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
            {RADIUS_OPTIONS.map(r => (
              <button key={r} onClick={() => setRadius(r)} style={{
                padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                background: radius === r ? "#1E1E1E" : "#F0F0F3",
                color: radius === r ? "#FFF" : "#5A5A5A",
                border: "1px solid #D1D1D6",
              }}>{r} mi</button>
            ))}
          </div>

          {/* Flags */}
          <p style={{ fontSize: 11, fontWeight: 700, color: "#8E8E93", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 8 }}>Special Filters</p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
            {[
              { label: "✓ Medicaid Accepted",     active: medicaidOnly,   set: setMedicaidOnly,   activeColor: "#15803D", activeBg: "#F0FDF4", activeBorder: "#86EFAC" },
              { label: "✓ Felony Friendly",        active: felonyFriendly, set: setFelonyFriendly, activeColor: "#C2410C", activeBg: "#FFF7ED", activeBorder: "#FED7AA" },
              { label: "🚨 Emergency Housing",     active: emergencyOnly,  set: setEmergencyOnly,  activeColor: "#7E22CE", activeBg: "#FDF4FF", activeBorder: "#E9D5FF" },
              { label: "✓ Free Services",          active: freeOnly,       set: setFreeOnly,       activeColor: "#1D4ED8", activeBg: "#EFF6FF", activeBorder: "#BFDBFE" },
            ].map(f => (
              <button key={f.label} onClick={() => f.set(!f.active)} style={{
                padding: "6px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                background: f.active ? f.activeBg : "#F0F0F3",
                color: f.active ? f.activeColor : "#5A5A5A",
                border: f.active ? `1px solid ${f.activeBorder}` : "1px solid #D1D1D6",
              }}>{f.label}</button>
            ))}
          </div>

          {hasFilters && (
            <button onClick={clearFilters} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#EF4444", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
              <X style={{ width: 12, height: 12 }} /> Clear all filters
            </button>
          )}
        </div>
      )}

      {/* ── Category Pills ── */}
      <div style={{ display: "flex", gap: 8, padding: "12px 20px", overflowX: "auto", scrollbarWidth: "none", background: "#FFF", borderBottom: "1px solid #F0F0F3" }}>
        {CATEGORIES.map(cat => {
          const isActive = category === cat.value;
          return (
            <button key={cat.value} onClick={() => setCategory(isActive ? "" : cat.value)} style={{
              flexShrink: 0, display: "flex", alignItems: "center", gap: 5,
              padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap",
              background: isActive ? cat.color : "#F0F0F3",
              color: isActive ? "#FFF" : "#5A5A5A",
              border: isActive ? `1px solid ${cat.color}` : "1px solid #D1D1D6",
            }}>
              {cat.icon} {cat.label}
            </button>
          );
        })}
      </div>

      {/* ── MAP VIEW ── */}
      {view === "map" && (
        <div style={{ height: "calc(100vh - 280px)", minHeight: 360, position: "relative" }}>
          {isLoading ? (
            <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#8E8E93" }}>
              <Loader2 className="animate-spin" style={{ width: 28, height: 28 }} />
            </div>
          ) : (
            <MapContainer
              center={mapCenter}
              zoom={userLocation ? 12 : 5}
              style={{ height: "100%", width: "100%" }}
              zoomControl
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {userLocation && (
                <Marker
                  position={[userLocation.lat, userLocation.lng]}
                  icon={L.divIcon({
                    html: `<div style="width:16px;height:16px;border-radius:50%;background:#4A90E2;border:3px solid #fff;box-shadow:0 0 0 4px rgba(74,144,226,0.3)"></div>`,
                    iconSize: [16, 16], iconAnchor: [8, 8], className: "",
                  })}
                >
                  <Popup><b>You are here</b></Popup>
                </Marker>
              )}
              {processed.filter(r => r.latitude && r.longitude).map(r => {
                const color = CAT_COLOR[r.resource_category] || "#4A90E2";
                return (
                  <Marker
                    key={r.id}
                    position={[r.latitude, r.longitude]}
                    icon={makeIcon(color)}
                    eventHandlers={{ click: () => setSelectedMarker(r) }}
                  >
                    <Popup>
                      <div style={{ minWidth: 200, maxWidth: 260 }}>
                        <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{r.organization_name}</p>
                        {r.resource_category && (
                          <p style={{ fontSize: 11, color, marginBottom: 4 }}>{r.resource_category}</p>
                        )}
                        {r.description && (
                          <p style={{ fontSize: 12, color: "#5A5A5A", marginBottom: 6 }}>{r.description.slice(0, 100)}…</p>
                        )}
                        <div style={{ display: "flex", gap: 6 }}>
                          {r.phone && (
                            <a href={`tel:${r.phone}`} style={{ flex: 1, textAlign: "center", fontSize: 11, fontWeight: 600, padding: "6px 0", borderRadius: 6, background: "#EBF3FD", color: "#4A90E2", textDecoration: "none" }}>
                              📞 Call
                            </a>
                          )}
                          {r.latitude && r.longitude && (
                            <a href={`https://www.google.com/maps/dir/?api=1&destination=${r.latitude},${r.longitude}`} target="_blank" rel="noopener noreferrer" style={{ flex: 1, textAlign: "center", fontSize: 11, fontWeight: 600, padding: "6px 0", borderRadius: 6, background: "#F0FDF4", color: "#15803D", textDecoration: "none" }}>
                              🗺 Directions
                            </a>
                          )}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
              <MapReCenter center={userLocation ? [userLocation.lat, userLocation.lng] : null} />
            </MapContainer>
          )}
          {/* Result count chip */}
          <div style={{ position: "absolute", top: 10, right: 10, zIndex: 1000, background: "#FFF", borderRadius: 20, padding: "6px 12px", fontSize: 12, fontWeight: 600, color: "#1E1E1E", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
            {processed.filter(r => r.latitude && r.longitude).length} on map
          </div>
        </div>
      )}

      {/* ── LIST VIEW ── */}
      {view === "list" && (
        <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
          {isLoading ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#8E8E93" }}>
              <Loader2 className="animate-spin" style={{ width: 28, height: 28, margin: "0 auto 12px" }} />
              <p style={{ fontSize: 13 }}>Finding places near you…</p>
            </div>
          ) : processed.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#8E8E93" }}>
              <MapPin style={{ width: 36, height: 36, margin: "0 auto 12px", opacity: 0.3 }} strokeWidth={1} />
              <p style={{ fontSize: 14, fontWeight: 600 }}>No results found</p>
              <p style={{ fontSize: 12, marginTop: 4 }}>Try a wider radius or clear a filter.</p>
              {hasFilters && (
                <button onClick={clearFilters} style={{ marginTop: 12, fontSize: 12, color: "#4A90E2", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#8E8E93", textTransform: "uppercase", letterSpacing: "0.8px" }}>
                {processed.length} place{processed.length !== 1 ? "s" : ""} found
              </p>
              {processed.map(r => (
                <ResourceCard
                  key={r.id}
                  r={r}
                  isSaved={savedIds.has(r.id)}
                  onSave={saveMutation.mutate}
                />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}