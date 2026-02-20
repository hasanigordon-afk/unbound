import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Search, Globe, Map, Navigation, Edit2, ExternalLink, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const CATEGORY_LABELS = {
  employment: "Employment Services",
  federal_assistance: "Federal Assistance",
  crisis: "Crisis Support",
  veteran_services: "Veteran Services",
  medicaid: "Medicaid",
  state_benefits: "State Benefits",
  dmv: "DMV Services",
  reentry: "Reentry Programs",
  workforce: "Workforce Development",
  shelter: "Shelters",
  food_pantry: "Food Pantries",
  rehab: "Treatment Centers",
  health_center: "Health Centers",
  transportation: "Transportation",
  legal: "Legal Services",
  housing: "Housing Assistance",
};

const LEVEL_CONFIG = {
  national: {
    label: "National Resources",
    icon: Globe,
    description: "Available nationwide",
    color: "#4A90E2",
  },
  state: {
    label: "State Resources",
    icon: Map,
    description: "State-specific services",
    color: "#D4A574",
  },
  local: {
    label: "Local Resources",
    icon: Navigation,
    description: "Community-based services",
    color: "#22c55e",
  },
};

export default function ResourceDirectory() {
  const [userZip, setUserZip] = useState("");
  const [userState, setUserState] = useState("");
  const [editLocation, setEditLocation] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: profile } = useQuery({
    queryKey: ["participant-profile"],
    queryFn: async () => {
      const profiles = await base44.entities.ParticipantProfile.filter({ participant_email: user.email });
      return profiles[0];
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (profile) {
      setUserZip(profile.location_zip || "");
      setUserState(profile.location_state || "");
    }
  }, [profile]);

  const { data: allResources = [] } = useQuery({
    queryKey: ["resources"],
    queryFn: () => base44.entities.Resource.filter({ is_active: true }),
  });

  const getFilteredResources = () => {
    let filtered = allResources;

    // Filter by level and location
    filtered = filtered.filter(r => {
      if (r.level === "national") return true;
      if (r.level === "state" && userState) {
        return r.state === userState;
      }
      if (r.level === "local" && userZip) {
        return r.zip_codes?.includes(userZip) || r.state === userState;
      }
      return false;
    });

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(r =>
        r.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (categoryFilter !== "all") {
      filtered = filtered.filter(r => r.category === categoryFilter);
    }

    // Filter by level
    if (levelFilter !== "all") {
      filtered = filtered.filter(r => r.level === levelFilter);
    }

    return filtered;
  };

  const filteredResources = getFilteredResources();

  const handleLocationUpdate = async () => {
    if (profile?.id && userZip && userState) {
      await base44.entities.ParticipantProfile.update(profile.id, {
        location_zip: userZip,
        location_state: userState,
      });
      setEditLocation(false);
    }
  };

  const groupedResources = {
    national: filteredResources.filter(r => r.level === "national"),
    state: filteredResources.filter(r => r.level === "state"),
    local: filteredResources.filter(r => r.level === "local"),
  };

  const categories = [...new Set(allResources.map(r => r.category))];

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--bg-primary)' }}>
      <div className="px-6 pt-8 pb-6" style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
        <h1 style={{ marginBottom: '4px' }}>Resource Directory</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Employment, housing, and support services
        </p>
      </div>

      <div className="px-6 py-6" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-section)' }}>
        {/* Location */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5" style={{ color: 'var(--primary)' }} strokeWidth={1.5} />
              <h3>Location</h3>
            </div>
            <Button
              onClick={() => setEditLocation(!editLocation)}
              className="btn-secondary"
              size="sm"
            >
              <Edit2 className="w-3 h-3 mr-2" strokeWidth={1.5} />
              {editLocation ? "Cancel" : "Change"}
            </Button>
          </div>

          {editLocation ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>
                  Zip Code
                </label>
                <Input
                  value={userZip}
                  onChange={(e) => setUserZip(e.target.value)}
                  placeholder="Enter zip code"
                  maxLength={5}
                  style={{
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                  }}
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>
                  State
                </label>
                <Input
                  value={userState}
                  onChange={(e) => setUserState(e.target.value.toUpperCase())}
                  placeholder="State code (e.g., CA)"
                  maxLength={2}
                  style={{
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                  }}
                />
              </div>
              <Button onClick={handleLocationUpdate} className="btn-primary">
                Update Location
              </Button>
            </div>
          ) : (
            <div>
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                {userZip && userState ? (
                  <>
                    <span className="font-medium">{userZip}</span>, <span className="font-medium">{userState}</span>
                  </>
                ) : (
                  <span style={{ color: 'var(--text-muted)' }}>No location set</span>
                )}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Location determines state and local resources
              </p>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} strokeWidth={1.5} />
          <Input
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
            }}
          />
        </div>

        {/* Filters */}
        <div className="card">
          <h4 className="mb-3">Filters</h4>
          
          <div className="mb-4">
            <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>
              Resource Level
            </label>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {["all", "national", "state", "local"].map(level => (
                <button
                  key={level}
                  onClick={() => setLevelFilter(level)}
                  className="px-3 py-1.5 text-sm font-medium whitespace-nowrap"
                  style={{
                    background: levelFilter === level ? 'var(--primary)' : 'transparent',
                    color: levelFilter === level ? '#FFFFFF' : 'var(--text-secondary)',
                    border: `1px solid ${levelFilter === level ? 'var(--primary)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius)',
                  }}
                >
                  {level === "all" ? "All Levels" : LEVEL_CONFIG[level]?.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>
              Category
            </label>
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setCategoryFilter("all")}
                className="px-3 py-1.5 text-sm font-medium whitespace-nowrap"
                style={{
                  background: categoryFilter === "all" ? 'var(--primary)' : 'transparent',
                  color: categoryFilter === "all" ? '#FFFFFF' : 'var(--text-secondary)',
                  border: `1px solid ${categoryFilter === "all" ? 'var(--primary)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius)',
                }}
              >
                All Categories
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className="px-3 py-1.5 text-sm font-medium whitespace-nowrap"
                  style={{
                    background: categoryFilter === cat ? 'var(--primary)' : 'transparent',
                    color: categoryFilter === cat ? '#FFFFFF' : 'var(--text-secondary)',
                    border: `1px solid ${categoryFilter === cat ? 'var(--primary)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius)',
                  }}
                >
                  {CATEGORY_LABELS[cat] || cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Resources by Level */}
        {["national", "state", "local"].map(level => {
          const resources = groupedResources[level];
          if (resources.length === 0) return null;
          
          const config = LEVEL_CONFIG[level];
          const Icon = config.icon;

          return (
            <div key={level}>
              <div className="flex items-center gap-2 mb-4">
                <Icon className="w-5 h-5" style={{ color: config.color }} strokeWidth={1.5} />
                <h3>{config.label}</h3>
                <span className="text-xs px-2 py-1" style={{ 
                  background: `${config.color}15`, 
                  color: config.color,
                  borderRadius: 'var(--radius)' 
                }}>
                  {resources.length}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {resources.map(resource => (
                  <div key={resource.id} className="card">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="mb-1">{resource.name}</h4>
                        <Badge 
                          variant="outline" 
                          className="text-[10px] mb-2"
                          style={{ 
                            borderColor: config.color, 
                            color: config.color 
                          }}
                        >
                          {CATEGORY_LABELS[resource.category] || resource.category}
                        </Badge>
                      </div>
                    </div>

                    {resource.description && (
                      <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                        {resource.description}
                      </p>
                    )}

                    {resource.address && (
                      <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                        📍 {resource.address}, {resource.city}, {resource.state}
                      </p>
                    )}

                    {resource.phone && (
                      <a 
                        href={`tel:${resource.phone}`} 
                        className="text-xs flex items-center gap-1 mb-1"
                        style={{ color: 'var(--primary)' }}
                      >
                        <Phone className="w-3 h-3" strokeWidth={1.5} />
                        {resource.phone}
                      </a>
                    )}

                    {resource.website && (
                      <a 
                        href={resource.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs flex items-center gap-1"
                        style={{ color: 'var(--primary)' }}
                      >
                        <ExternalLink className="w-3 h-3" strokeWidth={1.5} />
                        Visit Website
                      </a>
                    )}

                    {resource.hours && (
                      <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                        Hours: {resource.hours}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {filteredResources.length === 0 && (
          <div className="text-center py-12">
            <p style={{ color: 'var(--text-muted)' }}>No resources found</p>
            {!userZip && !userState && (
              <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                Set your location to view state and local resources
              </p>
            )}
          </div>
        )}

        {/* Footer Info */}
        <div className="p-4 text-xs" style={{ 
          background: 'rgba(74,144,226,0.1)', 
          border: '1px solid rgba(74,144,226,0.3)', 
          borderRadius: 'var(--radius)', 
          color: 'var(--text-secondary)' 
        }}>
          <p className="text-center">
            Resources are organized by geographic scope. National resources are always visible. 
            State and local resources require location information.
          </p>
        </div>
      </div>
    </div>
  );
}