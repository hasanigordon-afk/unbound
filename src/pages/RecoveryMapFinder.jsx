import React, { useState, useEffect, useMemo, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapPin, List, Map, Loader2, X, RefreshCw, Phone, Globe, Navigation,
  Star, Clock, Heart, ChevronDown, ChevronUp, Search
} from "lucide-react";

// Fix leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

function haversine(lat1, lon1, lat2, lon2) {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const TYPE_FILTERS = [
  { value: "all",       label: "All",          emoji: "🔍", color: "#4A90E2" },
  { value: "meetings",  label: "Meetings",     emoji: "🤝", color: "#10B981" },
  { value: "treatment", label: "Treatment",    emoji: "💊", color: "#EF4444" },
  { value: "support",   label: "Support",      emoji: "🧠", color: "#8B5CF6" },
  { value: "urgent",    label: "Urgent Care",  emoji: "🚨", color: "#F59E0B" },
  { value: "housing",   label: "Housing",      emoji: "🏠", color: "#6366F1" },
];

const CATEGORY_TO_TYPE = {
  "Peer Support": "meetings",
  "Addiction Treatment": "treatment",
  "Detox": "treatment",
  "Inpatient Rehab": "treatment",
  "Outpatient Rehab": "treatment",
  "Medication Assisted Treatment": "treatment",
  "Mental Health": "support",
  "Mental Health Services": "support",
  "Emergency Shelter": "urgent",
  "Housing": "housing",
  "Transitional Housing": "housing",
  "Rapid Rehousing": "housing",
};

const TYPE_COLORS = {
  meetings:  "#10B981",
  treatment: "#EF4444",
  support:   "#8B5CF6",
  urgent:    "#F59E0B",
  housing:   "#6366F1",
  default:   "#4A90E2",
};

function getType(cat) {
  return CATEGORY_TO_TYPE[cat] || "support";
}
function getColor(cat) {
  return TYPE_COLORS[getType(cat)] || TYPE_COLORS.default;
}

function createColoredIcon(color) {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:28px;height:28px;border-radius:50% 50% 50% 0;
      background:${color};border:2px solid #fff;
      transform:rotate(-45deg);
      box-shadow:0 2px 8px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -30],
  });
}

function MapRecenter({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, zoom || map.getZoom());
  }, [center]);
  return null;
}

function ResourceListCard({ resource, isSelected, onClick }) {
  const color = getColor(resource.resource_category);
  const type = getType(resource.resource_category);
  const typeLabel = TYPE_FILTERS.find(t => t.value === type)?.label || "Resource";

  return (
    <div
      onClick={onClick}
      style={{
        background: isSelected ? "#F0F7FF" : "#fff",
        border: `1px solid ${isSelected ? "#4A90E2" : "#E5E7EB"}`,
        borderRadius: 14,
        padding: "14px",
        cursor: "pointer",
        transition: "all 0.15s ease",
        boxShadow: isSelected ? "0 0 0 2px rgba(74,144,226,0.2)" : "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
        {/* Color dot */}
        <div style={{
          width: 10, height: 10, borderRadius: "50%", background: color,
          flexShrink: 0, marginTop: 4,
        }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#1E1E1E", lineHeight: 1.3 }}>
            {resource.organization_name}
          </p>
          {resource.program_name && (
            <p style={{ fontSize: 11, color: "#5A5A5A", marginTop: 1 }}>{resource.program_name}</p>
          )}
        </div>
        {resource.distance !== null && resource.distance !== undefined && (
          <span style={{
            fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
            background: "#EBF3FD", color: "#4A90E2", flexShrink: 0,
          }}>
            {resource.distance.toFixed(1)} mi
          </span>
        )}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 }}>
        <span style={{
          fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20,
          background: color + "18", color,
        }}>
          {resource.resource_category || typeLabel}
        </span>
        {resource.accepts_medicaid && (
          <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: "#DCFCE7", color: "#16A34A" }}>
            Medicaid OK
          </span>
        )}
        {resource.accepts_uninsured && (
          <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: "#DBEAFE", color: "#2563EB" }}>
            Uninsured OK
          </span>
        )}
      </div>

      {resource.city && (
        <p style={{ fontSize: 11, color: "#8E8E93", display: "flex", alignItems: "center", gap: 4, marginBottom: 8 }}>
          <MapPin style={{ width: 11, height: 11 }} />
          {[resource.street_address, resource.city, resource.state].filter(Boolean).join(", ")}
        </p>
      )}

      <div style={{ display: "flex", gap: 6 }}>
        {resource.phone && (
          <a
            href={`tel:${resource.phone}`}
            onClick={e => e.stopPropagation()}
            style={{
              flex: 1, textAlign: "center", fontSize: 11, fontWeight: 600,
              padding: "7px 0", borderRadius: 8,
              background: "#EBF3FD", color: "#4A90E2", textDecoration: "none",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
            }}
          >
            <Phone style={{ width: 10, height: 10 }} /> Call
          </a>
        )}
        {resource.latitude && resource.longitude && (
          <a
            href={`https://maps.google.com/?q=${resource.latitude},${resource.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            style={{
              flex: 1, textAlign: "center", fontSize: 11, fontWeight: 600,
              padding: "7px 0", borderRadius: 8,
              background: "#F0FDF4", color: "#16A34A", textDecoration: "none",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
            }}
          >
            <Navigation style={{ width: 10, height: 10 }} /> Go
          </a>
        )}
        {resource.website && (
          <a
            href={resource.website}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            style={{
              flex: 1, textAlign: "center", fontSize: 11, fontWeight: 600,
              padding: "7px 0", borderRadius: 8,
              background: "#F9FAFB", color: "#6B7280", textDecoration: "none",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
            }}
          >
            <Globe style={{ width: 10, height: 10 }} /> Web
          </a>
        )}
      </div>
    </div>
  );
}

const RADIUS_OPTIONS = [5, 10, 25, 50];

export default function RecoveryMapFinder() {
  const [view, setView] = useState("split"); // "split" | "map" | "list"
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [typeFilter, setTypeFilter] = useState("all");
  const [radius, setRadius] = useState(25);
  const [medicaidOnly, setMedicaidOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [mapCenter, setMapCenter] = useState([39.8283, -98.5795]); // US center
  const [mapZoom, setMapZoom] = useState(4);
  const [showFilterBar, setShowFilterBar] = useState(false);

  const { data: resources = [], isLoading } = useQuery({
    queryKey: ["us-recovery-resources"],
    queryFn: () => base44.entities.USRecoveryResource.list(),
  });

  const { data: meetings = [] } = useQuery({
    queryKey: ["meetings-map"],
    queryFn: () => base44.entities.Meeting.filter({ is_active: true }),
  });

  const requestLocation = () => {
    setLocationLoading(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        setMapCenter([loc.lat, loc.lng]);
        setMapZoom(11);
        setLocationLoading(false);
      },
      () => {
        setLocationError("Location access denied. Showing all resources.");
        setLocationLoading(false);
      },
      { timeout: 10000 }
    );
  };

  useEffect(() => { requestLocation(); }, []);

  // Combine resources + meetings into unified list
  const allItems = useMemo(() => {
    const resourceItems = resources.map(r => ({
      ...r,
      _kind: "resource",
      distance: userLocation && r.latitude && r.longitude
        ? haversine(userLocation.lat, userLocation.lng, r.latitude, r.longitude)
        : null,
    }));

    const meetingItems = meetings
      .filter(m => m.latitude && m.longitude)
      .map(m => ({
        id: m.id,
        _kind: "meeting",
        organization_name: m.title,
        program_name: `${m.program_type} Meeting`,
        resource_category: "Peer Support",
        city: m.city,
        state: m.state,
        latitude: m.latitude,
        longitude: m.longitude,
        phone: null,
        website: m.url,
        accepts_medicaid: false,
        accepts_uninsured: true,
        distance: userLocation
          ? haversine(userLocation.lat, userLocation.lng, m.latitude, m.longitude)
          : null,
      }));

    return [...resourceItems, ...meetingItems];
  }, [resources, meetings, userLocation]);

  const filtered = useMemo(() => {
    let list = allItems;

    if (userLocation) {
      list = list.filter(r => r.distance === null || r.distance <= radius);
    }

    if (typeFilter !== "all") {
      list = list.filter(r => getType(r.resource_category) === typeFilter);
    }

    if (medicaidOnly) {
      list = list.filter(r => r.accepts_medicaid === true);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(r =>
        r.organization_name?.toLowerCase().includes(q) ||
        r.city?.toLowerCase().includes(q) ||
        r.resource_category?.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      if (a.distance === null && b.distance === null) return 0;
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    });

    return list;
  }, [allItems, userLocation, radius, typeFilter, medicaidOnly, search]);

  const mapItems = filtered.filter(r => r.latitude && r.longitude);
  const selectedItem = filtered.find(r => r.id === selectedId);

  const handleSelectItem = (item) => {
    setSelectedId(item.id);
    if (item.latitude && item.longitude) {
      setMapCenter([item.latitude, item.longitude]);
      setMapZoom(14);
    }
  };

  const hasFilters = typeFilter !== "all" || medicaidOnly || radius !== 25 || search;

  return (
    <div style={{ background: "#F7F7F8", minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #E5E7EB", padding: "16px 16px 0", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: "#1E1E1E" }}>Recovery Finder</h1>
            <p style={{ fontSize: 11, color: "#8E8E93", marginTop: 1 }}>
              {locationLoading ? "Finding your location…" :
               userLocation ? `${filtered.length} places within ${radius} mi` :
               `${filtered.length} resources nationwide`}
            </p>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {/* View toggle */}
            <div style={{ display: "flex", background: "#F0F0F3", borderRadius: 8, padding: 2, border: "1px solid #D1D1D6" }}>
              {[
                { v: "list", icon: List },
                { v: "split", icon: MapPin },
                { v: "map",  icon: Map },
              ].map(({ v, icon: Icon }) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  style={{
                    padding: "5px 8px", borderRadius: 6, border: "none", cursor: "pointer",
                    background: view === v ? "#fff" : "transparent",
                    color: view === v ? "#1E1E1E" : "#8E8E93",
                    boxShadow: view === v ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                  }}
                >
                  <Icon style={{ width: 13, height: 13 }} />
                </button>
              ))}
            </div>
            <button
              onClick={requestLocation}
              style={{ padding: "6px 8px", borderRadius: 8, background: "#F0F0F3", border: "1px solid #D1D1D6", cursor: "pointer" }}
            >
              {locationLoading
                ? <Loader2 style={{ width: 13, height: 13, color: "#4A90E2" }} className="animate-spin" />
                : <RefreshCw style={{ width: 13, height: 13, color: "#5A5A5A" }} />}
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "#F7F7F8", border: "1px solid #E5E7EB", borderRadius: 10,
          padding: "8px 12px", marginBottom: 10,
        }}>
          <Search style={{ width: 14, height: 14, color: "#8E8E93", flexShrink: 0 }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, city, or type…"
            style={{ flex: 1, background: "none", border: "none", outline: "none", fontSize: 13, color: "#1E1E1E" }}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
              <X style={{ width: 12, height: 12, color: "#8E8E93" }} />
            </button>
          )}
        </div>

        {/* Type filter pills */}
        <div style={{ display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 10 }}>
          {TYPE_FILTERS.map(t => (
            <button
              key={t.value}
              onClick={() => setTypeFilter(t.value)}
              style={{
                display: "flex", alignItems: "center", gap: 4, flexShrink: 0,
                padding: "6px 12px", borderRadius: 20, border: "none", cursor: "pointer",
                background: typeFilter === t.value ? t.color : "#F0F0F3",
                color: typeFilter === t.value ? "#fff" : "#5A5A5A",
                fontSize: 11, fontWeight: 700,
              }}
            >
              <span>{t.emoji}</span> {t.label}
            </button>
          ))}
        </div>

        {/* Filter row */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, paddingBottom: 10, overflowX: "auto", scrollbarWidth: "none" }}>
          {RADIUS_OPTIONS.map(r => (
            <button
              key={r}
              onClick={() => setRadius(r)}
              style={{
                padding: "4px 10px", borderRadius: 8, border: "1px solid #D1D1D6",
                background: radius === r ? "#1E1E1E" : "#F0F0F3",
                color: radius === r ? "#fff" : "#5A5A5A",
                fontSize: 11, fontWeight: 600, cursor: "pointer", flexShrink: 0,
              }}
            >
              {r} mi
            </button>
          ))}
          <button
            onClick={() => setMedicaidOnly(!medicaidOnly)}
            style={{
              padding: "4px 10px", borderRadius: 8, border: "1px solid #D1D1D6",
              background: medicaidOnly ? "#DCFCE7" : "#F0F0F3",
              color: medicaidOnly ? "#16A34A" : "#5A5A5A",
              fontSize: 11, fontWeight: 600, cursor: "pointer", flexShrink: 0,
            }}
          >
            {medicaidOnly ? "✓ " : ""}Medicaid
          </button>
          {hasFilters && (
            <button
              onClick={() => { setTypeFilter("all"); setRadius(25); setMedicaidOnly(false); setSearch(""); }}
              style={{
                padding: "4px 10px", borderRadius: 8,
                background: "#FEF2F2", color: "#EF4444",
                border: "1px solid #FCA5A5", fontSize: 11, fontWeight: 600, cursor: "pointer", flexShrink: 0,
                display: "flex", alignItems: "center", gap: 4,
              }}
            >
              <X style={{ width: 10, height: 10 }} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Location error banner */}
      {locationError && (
        <div style={{ background: "#FFFBEB", borderBottom: "1px solid #FDE68A", padding: "8px 16px" }}>
          <p style={{ fontSize: 11, color: "#D97706" }}>{locationError}</p>
        </div>
      )}

      {/* Main content area */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>

        {/* MAP */}
        {(view === "map" || view === "split") && (
          <div style={{
            flex: view === "map" ? 1 : "0 0 55%",
            position: "relative",
            minHeight: view === "map" ? "calc(100vh - 220px)" : 400,
          }}>
            {isLoading && (
              <div style={{
                position: "absolute", inset: 0, zIndex: 10,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(255,255,255,0.7)",
              }}>
                <Loader2 style={{ width: 24, height: 24, color: "#4A90E2" }} className="animate-spin" />
              </div>
            )}
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              style={{ height: "100%", width: "100%", minHeight: 380 }}
              zoomControl={false}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              <MapRecenter center={mapCenter} zoom={mapZoom} />

              {/* User location dot */}
              {userLocation && (
                <Marker
                  position={[userLocation.lat, userLocation.lng]}
                  icon={L.divIcon({
                    className: "",
                    html: `<div style="
                      width:16px;height:16px;border-radius:50%;
                      background:#4A90E2;border:3px solid #fff;
                      box-shadow:0 0 0 3px rgba(74,144,226,0.3);
                    "></div>`,
                    iconSize: [16, 16],
                    iconAnchor: [8, 8],
                  })}
                >
                  <Popup><strong>You are here</strong></Popup>
                </Marker>
              )}

              {/* Resource markers */}
              {mapItems.map(item => (
                <Marker
                  key={item.id}
                  position={[item.latitude, item.longitude]}
                  icon={createColoredIcon(
                    item.id === selectedId ? "#1E1E1E" : getColor(item.resource_category)
                  )}
                  eventHandlers={{ click: () => handleSelectItem(item) }}
                >
                  <Popup>
                    <div style={{ minWidth: 160 }}>
                      <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 3 }}>{item.organization_name}</p>
                      {item.resource_category && (
                        <p style={{ fontSize: 11, color: "#5A5A5A", marginBottom: 4 }}>{item.resource_category}</p>
                      )}
                      {item.distance != null && (
                        <p style={{ fontSize: 11, color: "#4A90E2", marginBottom: 4 }}>{item.distance.toFixed(1)} miles away</p>
                      )}
                      <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                        {item.phone && (
                          <a href={`tel:${item.phone}`} style={{ fontSize: 11, color: "#4A90E2", fontWeight: 600 }}>📞 Call</a>
                        )}
                        {item.latitude && item.longitude && (
                          <a href={`https://maps.google.com/?q=${item.latitude},${item.longitude}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "#16A34A", fontWeight: 600 }}>🗺 Directions</a>
                        )}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>

            {/* Map overlay count */}
            <div style={{
              position: "absolute", bottom: 12, left: 12, zIndex: 1000,
              background: "rgba(255,255,255,0.92)", borderRadius: 8, padding: "5px 10px",
              fontSize: 11, fontWeight: 600, color: "#1E1E1E",
              boxShadow: "0 1px 6px rgba(0,0,0,0.15)", backdropFilter: "blur(4px)",
            }}>
              {mapItems.length} on map
            </div>

            {/* Legend */}
            <div style={{
              position: "absolute", top: 12, right: 12, zIndex: 1000,
              background: "rgba(255,255,255,0.92)", borderRadius: 10, padding: "8px 10px",
              fontSize: 10, boxShadow: "0 1px 8px rgba(0,0,0,0.12)", backdropFilter: "blur(4px)",
            }}>
              {TYPE_FILTERS.filter(t => t.value !== "all").map(t => (
                <div key={t.value} style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: t.color }} />
                  <span style={{ color: "#1E1E1E", fontWeight: 500 }}>{t.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LIST */}
        {(view === "list" || view === "split") && (
          <div style={{
            flex: 1,
            overflowY: "auto",
            padding: "12px 12px 80px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            minWidth: 0,
          }}>
            {isLoading ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#8E8E93" }}>
                <Loader2 style={{ width: 24, height: 24, margin: "0 auto 8px" }} className="animate-spin" />
                <p style={{ fontSize: 13 }}>Finding resources…</p>
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#8E8E93" }}>
                <Search style={{ width: 32, height: 32, margin: "0 auto 8px", opacity: 0.3 }} />
                <p style={{ fontSize: 13, fontWeight: 600 }}>No results found</p>
                <p style={{ fontSize: 11, marginTop: 4 }}>Try a wider radius or different filters</p>
              </div>
            ) : (
              filtered.map(item => (
                <ResourceListCard
                  key={item.id}
                  resource={item}
                  isSelected={item.id === selectedId}
                  onClick={() => handleSelectItem(item)}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* Urgent help strip */}
      <div style={{
        background: "#fff", borderTop: "1px solid #E5E7EB",
        padding: "10px 12px", display: "flex", gap: 8,
        flexShrink: 0, overflowX: "auto", scrollbarWidth: "none",
      }}>
        {[
          { label: "Crisis Line", sub: "Call 988", href: "tel:988", color: "#EF4444", emoji: "🆘" },
          { label: "SAMHSA",     sub: "1-800-662-4357", href: "tel:18006624357", color: "#8B5CF6", emoji: "💊" },
          { label: "211 Help",   sub: "Local services", href: "tel:211", color: "#4A90E2", emoji: "📞" },
          { label: "AA Hotline", sub: "Find a meeting", href: "tel:18005625722", color: "#10B981", emoji: "🤝" },
        ].map(item => (
          <a
            key={item.label}
            href={item.href}
            style={{
              flexShrink: 0, textDecoration: "none",
              background: item.color + "12",
              border: `1px solid ${item.color}30`,
              borderRadius: 10, padding: "8px 12px",
              display: "flex", alignItems: "center", gap: 8,
            }}
          >
            <span style={{ fontSize: 18 }}>{item.emoji}</span>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: item.color }}>{item.label}</p>
              <p style={{ fontSize: 10, color: "#8E8E93" }}>{item.sub}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}