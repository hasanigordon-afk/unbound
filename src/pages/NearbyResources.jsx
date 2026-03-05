import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Loader2, RefreshCw, X, Search, SlidersHorizontal } from "lucide-react";

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const RADIUS_OPTIONS = [5, 10, 25, 50];

const CATEGORIES = [
  "Housing",
  "Emergency Shelter",
  "Transitional Housing",
  "Rapid Rehousing",
  "Food Pantry",
  "Soup Kitchen",
  "Addiction Treatment",
  "Detox",
  "Inpatient Rehab",
  "Outpatient Rehab",
  "Medication Assisted Treatment",
  "Mental Health Services",
  "Employment Assistance",
  "Reentry Services",
  "Legal Aid",
  "Transportation Assistance",
  "Clothing Assistance",
  "Peer Support",
];

const CATEGORY_COLORS = {
  "Housing": "#8B5CF6",
  "Emergency Shelter": "#7C3AED",
  "Transitional Housing": "#6D28D9",
  "Rapid Rehousing": "#9333EA",
  "Food Pantry": "#22C55E",
  "Soup Kitchen": "#16A34A",
  "Addiction Treatment": "#EF4444",
  "Detox": "#DC2626",
  "Inpatient Rehab": "#B91C1C",
  "Outpatient Rehab": "#F97316",
  "Medication Assisted Treatment": "#F59E0B",
  "Mental Health Services": "#3B82F6",
  "Employment Assistance": "#0EA5E9",
  "Reentry Services": "#6366F1",
  "Legal Aid": "#64748B",
  "Transportation Assistance": "#14B8A6",
  "Clothing Assistance": "#EC4899",
  "Peer Support": "#84CC16",
};

function ResourceCard({ resource, distance }) {
  const color = CATEGORY_COLORS[resource.resource_category] || "#4A90E2";
  return (
    <div
      className="p-4 rounded-xl"
      style={{ background: "#FFF", border: "1px solid #E5E7EB", borderRadius: "12px" }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate" style={{ color: "#1E1E1E" }}>
            {resource.organization_name}
          </p>
          {resource.program_name && (
            <p className="text-xs truncate" style={{ color: "#5A5A5A" }}>{resource.program_name}</p>
          )}
        </div>
        {distance !== null && (
          <span className="text-xs font-semibold flex-shrink-0 px-2 py-0.5 rounded-full" style={{ background: "#F0F4FA", color: "#4A90E2" }}>
            {distance.toFixed(1)} mi
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap mb-3">
        {resource.resource_category && (
          <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: color + "20", color }}>
            {resource.resource_category}
          </span>
        )}
        {resource.accepts_medicaid && (
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#DCFCE7", color: "#16A34A" }}>
            Medicaid OK
          </span>
        )}
        {resource.accepts_uninsured && (
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#DBEAFE", color: "#2563EB" }}>
            Uninsured OK
          </span>
        )}
        {resource.intake_method && (
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#F3F4F6", color: "#6B7280" }}>
            {resource.intake_method}
          </span>
        )}
      </div>

      {resource.city && (
        <p className="text-xs flex items-center gap-1 mb-2" style={{ color: "#8E8E93" }}>
          <MapPin className="w-3 h-3" strokeWidth={1.5} />
          {[resource.street_address, resource.city, resource.state].filter(Boolean).join(", ")}
        </p>
      )}

      {resource.description && (
        <p className="text-xs line-clamp-2" style={{ color: "#5A5A5A" }}>{resource.description}</p>
      )}

      <div className="flex gap-2 mt-3">
        {resource.phone && (
          <a
            href={`tel:${resource.phone}`}
            className="flex-1 text-center text-xs font-medium py-2 rounded-lg"
            style={{ background: "#EBF3FD", color: "#4A90E2" }}
          >
            📞 Call
          </a>
        )}
        {resource.website && (
          <a
            href={resource.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center text-xs font-medium py-2 rounded-lg"
            style={{ background: "#F3F4F6", color: "#1E1E1E" }}
          >
            🌐 Website
          </a>
        )}
        {resource.latitude && resource.longitude && (
          <a
            href={`https://maps.google.com/?q=${resource.latitude},${resource.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center text-xs font-medium py-2 rounded-lg"
            style={{ background: "#F0FDF4", color: "#16A34A" }}
          >
            🗺 Directions
          </a>
        )}
      </div>
    </div>
  );
}

export default function NearbyResources() {
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationAsked, setLocationAsked] = useState(false);

  const [radius, setRadius] = useState(25);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [medicaidOnly, setMedicaidOnly] = useState(false);
  const [uninsuredOnly, setUninsuredOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const { data: resources = [], isLoading: resourcesLoading } = useQuery({
    queryKey: ["us-recovery-resources"],
    queryFn: () => base44.entities.USRecoveryResource.list(),
  });

  const requestLocation = () => {
    setLocationLoading(true);
    setLocationError(null);
    setLocationAsked(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationLoading(false);
      },
      () => {
        setLocationError("Location access denied. Showing all resources.");
        setLocationLoading(false);
      },
      { timeout: 10000 }
    );
  };

  const processedResources = useMemo(() => {
    let list = resources.map((r) => ({
      ...r,
      distance:
        userLocation && r.latitude && r.longitude
          ? haversineDistance(userLocation.lat, userLocation.lng, r.latitude, r.longitude)
          : null,
    }));

    if (userLocation) {
      list = list.filter((r) => r.distance === null || r.distance <= radius);
    }

    if (categoryFilter) {
      list = list.filter((r) => r.resource_category === categoryFilter);
    }

    if (medicaidOnly) {
      list = list.filter((r) => r.accepts_medicaid === true);
    }

    if (uninsuredOnly) {
      list = list.filter((r) => r.accepts_uninsured === true);
    }

    list.sort((a, b) => {
      if (a.distance === null && b.distance === null) return 0;
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    });

    return list;
  }, [resources, userLocation, radius, categoryFilter, medicaidOnly, uninsuredOnly]);

  const hasFilters = categoryFilter || medicaidOnly || uninsuredOnly || radius !== 25;

  const clearFilters = () => {
    setCategoryFilter("");
    setMedicaidOnly(false);
    setUninsuredOnly(false);
    setRadius(25);
  };

  return (
    <div className="min-h-screen pb-24" style={{ background: "#F7F7F8" }}>
      {/* Header */}
      <div className="px-5 pt-6 pb-4" style={{ background: "#FFF", borderBottom: "1px solid #E5E7EB" }}>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-xl font-semibold" style={{ color: "#1E1E1E" }}>Nearby Resources</h1>
            <p className="text-xs mt-0.5" style={{ color: "#8E8E93" }}>
              Recovery support sorted by distance
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
              style={{
                background: showFilters ? "#EBF3FD" : "#F0F0F3",
                color: showFilters ? "#4A90E2" : "#5A5A5A",
                border: showFilters ? "1px solid #4A90E2" : "1px solid #D1D1D6",
              }}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters {hasFilters ? "●" : ""}
            </button>
            <button
              onClick={requestLocation}
              className="p-1.5 rounded-lg"
              style={{ background: "#F0F0F3", border: "1px solid #D1D1D6" }}
              title="Refresh location"
            >
              <RefreshCw className="w-4 h-4" style={{ color: "#5A5A5A" }} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Location status */}
        {locationLoading && (
          <div className="flex items-center gap-1.5 text-xs py-2 px-3 rounded-lg" style={{ background: "#F0F4FA", color: "#4A90E2" }}>
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Detecting your location…
          </div>
        )}
        {userLocation && !locationLoading && (
          <div className="flex items-center gap-1.5 text-xs py-2 px-3 rounded-lg" style={{ background: "#F0FDF4", color: "#16A34A" }}>
            <MapPin className="w-3.5 h-3.5" strokeWidth={2} />
            Location found — showing {processedResources.length} resource{processedResources.length !== 1 ? "s" : ""} within {radius} miles
          </div>
        )}
        {locationError && (
          <div className="text-xs py-2 px-3 rounded-lg" style={{ background: "#FFF7ED", color: "#D97706" }}>
            {locationError}
          </div>
        )}
        {!locationAsked && !locationLoading && !userLocation && (
          <button
            onClick={requestLocation}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold mt-1"
            style={{ background: "#4A90E2", color: "#FFF", borderRadius: "10px" }}
          >
            <MapPin className="w-4 h-4" strokeWidth={2} />
            Allow Location to Find Nearest Resources
          </button>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="px-5 py-4 space-y-4" style={{ background: "#FFF", borderBottom: "1px solid #E5E7EB" }}>
          {/* Radius */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#8E8E93" }}>Distance Radius</p>
            <div className="flex gap-2">
              {RADIUS_OPTIONS.map((r) => (
                <button
                  key={r}
                  onClick={() => setRadius(r)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={{
                    background: radius === r ? "#1E1E1E" : "#F0F0F3",
                    color: radius === r ? "#FFF" : "#5A5A5A",
                    border: "1px solid #D1D1D6",
                  }}
                >
                  {r} miles
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#8E8E93" }}>Resource Category</p>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-lg"
              style={{ background: "#F0F0F3", border: "1px solid #D1D1D6", color: "#1E1E1E" }}
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Insurance toggles */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#8E8E93" }}>Insurance</p>
            <div className="flex gap-2">
              <button
                onClick={() => setMedicaidOnly(!medicaidOnly)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium"
                style={{
                  background: medicaidOnly ? "#DCFCE7" : "#F0F0F3",
                  color: medicaidOnly ? "#16A34A" : "#5A5A5A",
                  border: medicaidOnly ? "1px solid #86EFAC" : "1px solid #D1D1D6",
                }}
              >
                {medicaidOnly ? "✓" : ""} Accepts Medicaid
              </button>
              <button
                onClick={() => setUninsuredOnly(!uninsuredOnly)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium"
                style={{
                  background: uninsuredOnly ? "#DBEAFE" : "#F0F0F3",
                  color: uninsuredOnly ? "#2563EB" : "#5A5A5A",
                  border: uninsuredOnly ? "1px solid #93C5FD" : "1px solid #D1D1D6",
                }}
              >
                {uninsuredOnly ? "✓" : ""} Accepts Uninsured
              </button>
            </div>
          </div>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 text-xs font-medium"
              style={{ color: "#EF4444" }}
            >
              <X className="w-3.5 h-3.5" /> Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Results */}
      <div className="px-5 pt-4 flex flex-col gap-3">
        {resourcesLoading ? (
          <div className="text-center py-20" style={{ color: "#8E8E93" }}>
            <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin opacity-40" strokeWidth={1.5} />
            <p className="text-sm">Loading resources…</p>
          </div>
        ) : processedResources.length === 0 ? (
          <div className="text-center py-20" style={{ color: "#8E8E93" }}>
            <Search className="w-10 h-10 mx-auto mb-3 opacity-30" strokeWidth={1} />
            <p className="text-sm font-medium">No resources found</p>
            <p className="text-xs mt-1">Try expanding the radius or adjusting filters</p>
          </div>
        ) : (
          processedResources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} distance={resource.distance} />
          ))
        )}
      </div>
    </div>
  );
}