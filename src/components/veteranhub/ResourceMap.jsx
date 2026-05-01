import React, { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Phone, Navigation, Globe } from "lucide-react";

// Re-create default Leaflet icons (Vite doesn't bundle the default URLs)
const defaultIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const CATEGORY_COLORS = {
  va_hospital:     "#0F1E3D",
  mental_health:   "#6B5B8E",
  substance_abuse: "#5B6E48",
  housing:         "#C8932F",
  employment:      "#5B6E48",
  jobs:            "#5B6E48",
  food_emergency:  "#B85C5C",
  food:            "#B85C5C",
  legal:           "#3A3A3A",
  crisis:          "#B5483D",
  fitness:         "#1E88E5",
};

// Colored pin (SVG, no external deps)
const coloredIcon = (color) => L.divIcon({
  className: "vh-pin",
  html: `<svg viewBox="0 0 24 36" width="24" height="36" xmlns="http://www.w3.org/2000/svg">
    <path fill="${color}" stroke="#fff" stroke-width="1.5" d="M12 0C5.4 0 0 5.4 0 12c0 8.5 12 24 12 24s12-15.5 12-24C24 5.4 18.6 0 12 0z"/>
    <circle cx="12" cy="12" r="4.5" fill="#fff"/>
  </svg>`,
  iconSize: [24, 36],
  iconAnchor: [12, 36],
  popupAnchor: [0, -32],
});

const userIcon = L.divIcon({
  className: "vh-user-pin",
  html: `<div style="width:18px;height:18px;border-radius:50%;background:#1E88E5;border:3px solid #fff;box-shadow:0 0 0 3px rgba(30,136,229,0.32)"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function FitBounds({ resources, userLocation }) {
  const map = useMap();
  useEffect(() => {
    const points = [];
    if (userLocation) points.push([userLocation.lat, userLocation.lon]);
    resources.forEach((r) => {
      if (r.latitude && r.longitude) points.push([r.latitude, r.longitude]);
    });
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 12);
    } else {
      map.fitBounds(points, { padding: [40, 40], maxZoom: 13 });
    }
  }, [map, resources, userLocation]);
  return null;
}

export default function ResourceMap({ resources, userLocation, radiusMiles }) {
  const center = useMemo(() => {
    if (userLocation) return [userLocation.lat, userLocation.lon];
    const first = resources.find((r) => r.latitude && r.longitude);
    return first ? [first.latitude, first.longitude] : [39.8283, -98.5795]; // US center
  }, [userLocation, resources]);

  const radiusMeters = radiusMiles ? radiusMiles * 1609.34 : 0;

  return (
    <MapContainer
      center={center}
      zoom={6}
      scrollWheelZoom
      style={{ height: 360, width: "100%", borderRadius: 16 }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap'
      />

      <FitBounds resources={resources} userLocation={userLocation} />

      {userLocation && (
        <>
          <Marker position={[userLocation.lat, userLocation.lon]} icon={userIcon}>
            <Popup>You are here</Popup>
          </Marker>
          {radiusMeters > 0 && (
            <Circle
              center={[userLocation.lat, userLocation.lon]}
              radius={radiusMeters}
              pathOptions={{ color: "#1E88E5", fillColor: "#1E88E5", fillOpacity: 0.06, weight: 1 }}
            />
          )}
        </>
      )}

      {resources
        .filter((r) => r.latitude && r.longitude)
        .map((r) => {
          const color = CATEGORY_COLORS[r.category] || "#0F1E3D";
          return (
            <Marker
              key={r.id}
              position={[r.latitude, r.longitude]}
              icon={coloredIcon(color)}
            >
              <Popup>
                <div style={{ minWidth: 200, fontFamily: "'DM Sans',sans-serif" }}>
                  <p style={{ fontSize: 13, fontWeight: 800, color: "#1A1F2C", marginBottom: 4 }}>
                    {r.name}
                  </p>
                  {r.subcategory && (
                    <p style={{ fontSize: 10.5, fontWeight: 700, color, textTransform: "uppercase",
                      letterSpacing: ".06em", marginBottom: 6 }}>{r.subcategory}</p>
                  )}
                  {(r.address || r.city) && (
                    <p style={{ fontSize: 11.5, color: "#4A5260", marginBottom: 6, lineHeight: 1.45 }}>
                      {[r.address, r.city, r.state, r.zip].filter(Boolean).join(", ")}
                    </p>
                  )}
                  {r.distanceMi != null && (
                    <p style={{ fontSize: 11, color: "#6B7280", marginBottom: 8 }}>
                      📍 {r.distanceMi.toFixed(1)} mi away
                    </p>
                  )}
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {r.phone && (
                      <a href={`tel:${r.phone}`} style={popupBtn("#0F1E3D")}>
                        <Phone style={{ width: 11, height: 11 }} /> Call
                      </a>
                    )}
                    {r.latitude && (
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${r.latitude},${r.longitude}`}
                        target="_blank" rel="noopener noreferrer"
                        style={popupBtn("#5B6E48")}
                      >
                        <Navigation style={{ width: 11, height: 11 }} /> Directions
                      </a>
                    )}
                    {r.website && (
                      <a href={r.website} target="_blank" rel="noopener noreferrer" style={popupBtn("#1E88E5")}>
                        <Globe style={{ width: 11, height: 11 }} /> Site
                      </a>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
    </MapContainer>
  );
}

const popupBtn = (bg) => ({
  display: "inline-flex", alignItems: "center", gap: 4,
  padding: "5px 9px", borderRadius: 999, background: bg, color: "#fff",
  fontSize: 11, fontWeight: 700, textDecoration: "none",
});