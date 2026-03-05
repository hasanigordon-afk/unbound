import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MapPin, Phone, Filter, X, Loader2, RefreshCw } from "lucide-react";
import ResourceNearYouCard from "@/components/resources/ResourceNearYouCard";

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 3958.8; // miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const QUICK_BUTTONS = [
  { label: "Call 211", icon: "📞", action: () => (window.location.href = "tel:211"), color: "#4A90E2" },
  { label: "Find Shelter", icon: "🏠", filter: "Housing", color: "#8B5CF6" },
  { label: "Find Food", icon: "🍽️", filter: "Food Pantry", color: "#22C55E" },
  { label: "Find Treatment", icon: "💊", filter: "Addiction Treatment", color: "#EC4899" },
];

const CATEGORIES = [
  "Housing", "Food Pantry", "Soup Kitchen", "Addiction Treatment",
  "Mental Health", "Reentry Services", "Employment Assistance",
  "Government Assistance", "Legal Aid", "Transportation", "Clothing Assistance", "Peer Support"
];

export default function ResourcesNearYou() {
  const queryClient = useQueryClient();
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterCounty, setFilterCounty] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: resources = [] } = useQuery({
    queryKey: ["nj-state-resources"],
    queryFn: () => base44.entities.NJStateResource.list(),
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
        setLocationError("Location access denied. Showing all resources.");
        setLocationLoading(false);
      },
      { timeout: 10000 }
    );
  };

  useEffect(() => { requestLocation(); }, []);

  const savedIds = useMemo(() => new Set(savedResources.map((s) => s.resource_id)), [savedResources]);

  const counties = useMemo(() => [...new Set(resources.map((r) => r.county).filter(Boolean))].sort(), [resources]);
  const cities = useMemo(() => [...new Set(resources.map((r) => r.city).filter(Boolean))].sort(), [resources]);

  const processedResources = useMemo(() => {
    let list = resources.map((r) => ({
      ...r,
      distance: userLocation && r.latitude && r.longitude
        ? haversineDistance(userLocation.lat, userLocation.lng, r.latitude, r.longitude)
        : null,
    }));

    if (filterCategory) list = list.filter((r) => r.resource_category === filterCategory);
    if (filterCounty) list = list.filter((r) => r.county === filterCounty);
    if (filterCity) list = list.filter((r) => r.city === filterCity);

    list.sort((a, b) => {
      if (a.distance === null && b.distance === null) return 0;
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    });

    return list;
  }, [resources, userLocation, filterCategory, filterCounty, filterCity]);

  const handleQuickButton = (btn) => {
    if (btn.action) { btn.action(); return; }
    setFilterCategory(filterCategory === btn.filter ? "" : btn.filter);
  };

  const hasFilters = filterCategory || filterCounty || filterCity;

  return (
    <div className="min-h-screen" style={{ background: "#F7F7F8" }}>
      {/* Header */}
      <div className="px-5 pt-6 pb-4" style={{ background: "#FFFFFF", borderBottom: "1px solid #D1D1D6" }}>
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-xl font-semibold" style={{ color: "#1E1E1E" }}>Resources Near You</h1>
          <button onClick={requestLocation} className="p-1.5 rounded" style={{ background: "#F0F0F3" }}>
            <RefreshCw className="w-4 h-4" style={{ color: "#5A5A5A" }} strokeWidth={1.5} />
          </button>
        </div>
        {locationLoading && (
          <div className="flex items-center gap-1.5 text-xs" style={{ color: "#8E8E93" }}>
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Detecting location…
          </div>
        )}
        {userLocation && !locationLoading && (
          <div className="flex items-center gap-1.5 text-xs" style={{ color: "#22C55E" }}>
            <MapPin className="w-3.5 h-3.5" strokeWidth={2} /> Location found — showing {processedResources.length} resources
          </div>
        )}
        {locationError && (
          <p className="text-xs" style={{ color: "#8E8E93" }}>{locationError}</p>
        )}
      </div>

      {/* Quick Action Buttons */}
      <div className="px-5 pt-4 pb-2 flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
        {QUICK_BUTTONS.map((btn) => (
          <button
            key={btn.label}
            onClick={() => handleQuickButton(btn)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap flex-shrink-0"
            style={{
              background: btn.filter && filterCategory === btn.filter ? btn.color : btn.color + "18",
              color: btn.filter && filterCategory === btn.filter ? "#FFF" : btn.color,
              border: `1px solid ${btn.color}40`,
            }}
          >
            <span>{btn.icon}</span>
            {btn.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="px-5 py-3 flex items-center gap-2">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium"
          style={{ background: hasFilters ? "#4A90E2" : "#F0F0F3", color: hasFilters ? "#FFF" : "#1E1E1E", border: "1px solid #D1D1D6" }}
        >
          <Filter className="w-3.5 h-3.5" strokeWidth={1.5} />
          Filters {hasFilters ? `(${[filterCategory, filterCounty, filterCity].filter(Boolean).length})` : ""}
        </button>
        {hasFilters && (
          <button onClick={() => { setFilterCategory(""); setFilterCounty(""); setFilterCity(""); }}
            className="flex items-center gap-1 text-xs px-2 py-1.5 rounded"
            style={{ background: "#FEF2F2", color: "#EF4444", border: "1px solid #FCA5A5" }}
          >
            <X className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      {showFilters && (
        <div className="mx-5 mb-3 p-4 rounded-lg flex flex-col gap-3" style={{ background: "#FFF", border: "1px solid #D1D1D6" }}>
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: "#5A5A5A" }}>Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded border"
              style={{ background: "#F7F7F8", border: "1px solid #D1D1D6", color: "#1E1E1E" }}
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: "#5A5A5A" }}>County</label>
            <select
              value={filterCounty}
              onChange={(e) => setFilterCounty(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded border"
              style={{ background: "#F7F7F8", border: "1px solid #D1D1D6", color: "#1E1E1E" }}
            >
              <option value="">All Counties</option>
              {counties.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: "#5A5A5A" }}>City</label>
            <select
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded border"
              style={{ background: "#F7F7F8", border: "1px solid #D1D1D6", color: "#1E1E1E" }}
            >
              <option value="">All Cities</option>
              {cities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="px-5 pb-24 flex flex-col gap-3">
        {processedResources.length === 0 ? (
          <div className="text-center py-16" style={{ color: "#8E8E93" }}>
            <MapPin className="w-10 h-10 mx-auto mb-3 opacity-30" strokeWidth={1} />
            <p className="text-sm font-medium">No resources found</p>
            <p className="text-xs mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          processedResources.map((resource) => (
            <ResourceNearYouCard
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