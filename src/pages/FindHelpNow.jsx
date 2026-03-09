import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { MapPin, Loader2, RefreshCw, X, Search } from "lucide-react";
import FindHelpCard from "@/components/resources/FindHelpCard";

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const RADIUS_OPTIONS = [5, 10, 25, 50];

const CATEGORY_FILTERS = [
  { label: "All", value: "" },
  { label: "🏠 Housing", value: "Housing" },
  { label: "🛏 Shelter Tonight", value: "Emergency Shelter" },
  { label: "🍽 Food", value: "Food Pantry" },
  { label: "💼 Jobs", value: "Employment Assistance" },
  { label: "🧠 Mental Health", value: "Mental Health" },
  { label: "💊 Treatment", value: "Detox" },
  { label: "🪪 Benefits & ID", value: "Reentry Services" },
  { label: "🤝 Peer Support", value: "Peer Support" },
];

const SORT_OPTIONS = [
  { label: "Nearest", value: "nearest" },
  { label: "Medicaid Accepted", value: "medicaid" },
];

export default function FindHelpNow() {
  const queryClient = useQueryClient();
  const location = useLocation();
  const urlCategory = new URLSearchParams(location.search).get("category") || "";
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [radius, setRadius] = useState(25);
  const [categoryFilter, setCategoryFilter] = useState(urlCategory);
  const [sortBy, setSortBy] = useState("nearest");
  const [medicaidOnly, setMedicaidOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: resources = [], isLoading: resourcesLoading } = useQuery({
    queryKey: ["us-recovery-resources"],
    queryFn: () => base44.entities.USRecoveryResource.list(),
  });

  const { data: savedResources = [] } = useQuery({
    queryKey: ["saved-resources", user?.email],
    queryFn: () => base44.entities.SavedResource.filter({ created_by: user.email }),
    enabled: !!user,
  });

  const saveMutation = useMutation({
    mutationFn: async (resource) => {
      const existing = savedResources.find((s) => s.resource_id === resource.id);
      if (existing) {
        await base44.entities.SavedResource.delete(existing.id);
      } else {
        await base44.entities.SavedResource.create({
          resource_id: resource.id,
          resource_name: resource.organization_name,
          resource_category: resource.resource_category,
        });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["saved-resources"] }),
  });

  const requestLocation = () => {
    setLocationLoading(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationLoading(false);
      },
      () => {
        setLocationError("Location access denied. Showing all available resources.");
        setLocationLoading(false);
      },
      { timeout: 10000 }
    );
  };

  useEffect(() => { requestLocation(); }, []);

  const savedIds = useMemo(() => new Set(savedResources.map((s) => s.resource_id)), [savedResources]);

  const processedResources = useMemo(() => {
    let list = resources.map((r) => ({
      ...r,
      distance: userLocation && r.latitude && r.longitude
        ? haversineDistance(userLocation.lat, userLocation.lng, r.latitude, r.longitude)
        : null,
    }));

    // Radius filter (only when location is available)
    if (userLocation) {
      list = list.filter((r) => r.distance === null || r.distance <= radius);
    }

    // Category filter
    if (categoryFilter) {
      list = list.filter((r) => r.resource_category === categoryFilter);
    }

    // Medicaid filter
    if (medicaidOnly) {
      list = list.filter((r) => r.accepts_medicaid === true);
    }

    // Sort
    if (sortBy === "nearest") {
      list.sort((a, b) => {
        if (a.distance === null && b.distance === null) return 0;
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });
    } else if (sortBy === "medicaid") {
      list.sort((a, b) => (b.accepts_medicaid ? 1 : 0) - (a.accepts_medicaid ? 1 : 0));
    }

    return list;
  }, [resources, userLocation, radius, categoryFilter, medicaidOnly, sortBy]);

  const hasFilters = categoryFilter || medicaidOnly || radius !== 25;

  return (
    <div className="min-h-screen pb-24" style={{ background: "#F7F7F8" }}>
      {/* Header */}
      <div className="px-5 pt-6 pb-4" style={{ background: "#FFFFFF", borderBottom: "1px solid #D1D1D6" }}>
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-xl font-semibold" style={{ color: "#1E1E1E" }}>Help Near Me</h1>
            <p className="text-xs mt-0.5" style={{ color: "#8E8E93" }}>Housing, food, jobs, meetings & more near you</p>
          </div>
          <button onClick={requestLocation} className="p-1.5 rounded" style={{ background: "#F0F0F3" }}>
            <RefreshCw className="w-4 h-4" style={{ color: "#5A5A5A" }} strokeWidth={1.5} />
          </button>
        </div>

        {locationLoading && (
          <div className="flex items-center gap-1.5 text-xs mt-2" style={{ color: "#8E8E93" }}>
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Detecting your location…
          </div>
        )}
        {userLocation && !locationLoading && (
          <div className="flex items-center gap-1.5 text-xs mt-2" style={{ color: "#22C55E" }}>
            <MapPin className="w-3.5 h-3.5" strokeWidth={2} />
            Location found — {processedResources.length} resource{processedResources.length !== 1 ? "s" : ""} within {radius} miles
          </div>
        )}
        {locationError && (
          <p className="text-xs mt-2" style={{ color: "#8E8E93" }}>{locationError}</p>
        )}
      </div>

      {/* Emergency Help Buttons */}
      <div className="px-5 pt-4 pb-2">
        <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#8E8E93" }}>Need help right now?</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => { setCategoryFilter("Emergency Shelter"); setRadius(25); setSortBy("nearest"); }}
            className="flex flex-col items-center justify-center gap-1.5 py-4 rounded-lg font-semibold text-sm"
            style={{ background: "#8B5CF6", color: "#FFF", borderRadius: "8px" }}
          >
            <span className="text-2xl">🛏</span>
            <span>Find Shelter Tonight</span>
          </button>
          <button
            onClick={() => { setCategoryFilter("Detox"); setRadius(25); setSortBy("nearest"); }}
            className="flex flex-col items-center justify-center gap-1.5 py-4 rounded-lg font-semibold text-sm"
            style={{ background: "#EF4444", color: "#FFF", borderRadius: "8px" }}
          >
            <span className="text-2xl">💊</span>
            <span>Find Treatment</span>
          </button>
          <button
            onClick={() => { setCategoryFilter("Food Pantry"); setRadius(25); setSortBy("nearest"); }}
            className="flex flex-col items-center justify-center gap-1.5 py-4 rounded-lg font-semibold text-sm"
            style={{ background: "#22C55E", color: "#FFF", borderRadius: "8px" }}
          >
            <span className="text-2xl">🍽️</span>
            <span>Find Food Nearby</span>
          </button>
          <a
            href="tel:211"
            className="flex flex-col items-center justify-center gap-1.5 py-4 rounded-lg font-semibold text-sm"
            style={{ background: "#4A90E2", color: "#FFF", borderRadius: "8px" }}
          >
            <span className="text-2xl">📞</span>
            <span>Call 211</span>
          </a>
        </div>
      </div>

      {/* Category Pills */}
      <div className="px-5 pt-2 pb-2 flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
        {CATEGORY_FILTERS.map((cat) => {
          const isActive = categoryFilter === cat.value;
          return (
            <button
              key={cat.value}
              onClick={() => setCategoryFilter(isActive ? "" : cat.value)}
              className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0"
              style={{
                background: isActive ? "#4A90E2" : "#F0F0F3",
                color: isActive ? "#FFF" : "#5A5A5A",
                border: isActive ? "1px solid #4A90E2" : "1px solid #D1D1D6",
              }}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Filter Bar */}
      <div className="px-5 py-2 flex items-center gap-2 flex-wrap">
        {/* Radius */}
        <div className="flex items-center gap-1 flex-wrap">
          {RADIUS_OPTIONS.map((r) => (
            <button
              key={r}
              onClick={() => setRadius(r)}
              className="px-2.5 py-1 rounded text-xs font-medium"
              style={{
                background: radius === r ? "#1E1E1E" : "#F0F0F3",
                color: radius === r ? "#FFF" : "#5A5A5A",
                border: "1px solid #D1D1D6",
              }}
            >
              {r}mi
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="text-xs px-2 py-1.5 rounded"
          style={{ background: "#F0F0F3", border: "1px solid #D1D1D6", color: "#1E1E1E" }}
        >
          {SORT_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>

        {/* Medicaid toggle */}
        <button
          onClick={() => setMedicaidOnly(!medicaidOnly)}
          className="px-2.5 py-1 rounded text-xs font-medium"
          style={{
            background: medicaidOnly ? "#22C55E" : "#F0F0F3",
            color: medicaidOnly ? "#FFF" : "#5A5A5A",
            border: "1px solid #D1D1D6",
          }}
        >
          ✓ Medicaid
        </button>

        {hasFilters && (
          <button
            onClick={() => { setCategoryFilter(""); setMedicaidOnly(false); setRadius(25); setSortBy("nearest"); }}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded"
            style={{ background: "#FEF2F2", color: "#EF4444", border: "1px solid #FCA5A5" }}
          >
            <X className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      {/* Results */}
      <div className="px-5 pt-2 flex flex-col gap-3">
        {resourcesLoading ? (
          <div className="text-center py-16" style={{ color: "#8E8E93" }}>
            <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin opacity-40" strokeWidth={1.5} />
            <p className="text-sm">Loading resources…</p>
          </div>
        ) : processedResources.length === 0 ? (
          <div className="text-center py-16" style={{ color: "#8E8E93" }}>
            <Search className="w-10 h-10 mx-auto mb-3 opacity-30" strokeWidth={1} />
            <p className="text-sm font-medium">No resources found</p>
            <p className="text-xs mt-1">Try increasing the radius or adjusting filters</p>
          </div>
        ) : (
          processedResources.map((resource) => (
            <FindHelpCard
              key={resource.id}
              resource={resource}
              distance={resource.distance}
              isSaved={savedIds.has(resource.id)}
              onSave={(r) => saveMutation.mutate(r)}
            />
          ))
        )}
      </div>
    </div>
  );
}