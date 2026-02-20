import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Phone, Globe, Search, Briefcase } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const CATEGORIES = ["all", "jobs", "housing", "food", "benefits", "meetings", "transportation", "counseling"];

export default function ResourceDirectory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

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

  const { data: facilityResources = [] } = useQuery({
    queryKey: ["facility-resources", profile?.facility_id],
    queryFn: () => base44.entities.FacilityResource.filter({ facility_id: profile.facility_id, is_active: true }),
    enabled: !!profile?.facility_id,
  });

  const { data: generalResources = [] } = useQuery({
    queryKey: ["general-resources"],
    queryFn: () => base44.entities.Resource.list(),
  });

  const allResources = [...facilityResources, ...generalResources];

  const filteredResources = allResources.filter(r => {
    const matchesSearch = r.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || r.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen pb-24" style={{ background: '#1a1f3a' }}>
      <div className="px-6 pt-8 pb-6" style={{ background: '#0f1628', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <h1 className="text-2xl font-bold mb-1" style={{ color: '#ffffff' }}>Resource Directory</h1>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Find local services and support</p>
      </div>

      <div className="px-6 py-6 space-y-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.5)' }} />
          <Input
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            style={{ background: '#0f1628', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff' }}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap"
              style={{
                background: categoryFilter === cat ? '#fbbf24' : '#0f1628',
                color: categoryFilter === cat ? '#0f1628' : '#ffffff',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {facilityResources.length > 0 && categoryFilter === "all" && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold" style={{ color: '#fbbf24' }}>Facility Resources</h3>
            {facilityResources.slice(0, 3).map(resource => (
              <div key={resource.id} className="p-5 rounded-xl" style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)' }}>
                <h4 className="font-semibold mb-2" style={{ color: '#ffffff' }}>{resource.name}</h4>
                <Badge className="mb-3">{resource.category}</Badge>
                {resource.description && (
                  <p className="text-sm mb-3" style={{ color: 'rgba(255,255,255,0.7)' }}>{resource.description}</p>
                )}
                <div className="space-y-2 text-sm">
                  {resource.address && (
                    <p className="flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      <MapPin className="w-4 h-4" />
                      {resource.address}, {resource.city}, {resource.state}
                    </p>
                  )}
                  {resource.phone && (
                    <a href={`tel:${resource.phone}`} className="flex items-center gap-2 hover:opacity-80" style={{ color: '#60a5fa' }}>
                      <Phone className="w-4 h-4" />
                      {resource.phone}
                    </a>
                  )}
                  {resource.website && (
                    <a href={resource.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:opacity-80" style={{ color: '#60a5fa' }}>
                      <Globe className="w-4 h-4" />
                      Visit Website
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-3">
          <h3 className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>
            {categoryFilter === "all" ? "All Resources" : categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1)}
          </h3>
          {filteredResources.map(resource => (
            <div key={resource.id} className="p-5 rounded-xl" style={{ background: '#0f1628', border: '1px solid rgba(255,255,255,0.1)' }}>
              <h4 className="font-semibold mb-2" style={{ color: '#ffffff' }}>{resource.name}</h4>
              <Badge className="mb-3">{resource.category}</Badge>
              <div className="space-y-2 text-sm">
                {(resource.address || resource.city) && (
                  <p className="flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    <MapPin className="w-4 h-4" />
                    {resource.address ? `${resource.address}, ` : ''}{resource.city}, {resource.state}
                  </p>
                )}
                {resource.phone && (
                  <a href={`tel:${resource.phone}`} className="flex items-center gap-2 hover:opacity-80" style={{ color: '#60a5fa' }}>
                    <Phone className="w-4 h-4" />
                    {resource.phone}
                  </a>
                )}
                {resource.website && (
                  <a href={resource.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:opacity-80" style={{ color: '#60a5fa' }}>
                    <Globe className="w-4 h-4" />
                    Visit Website
                  </a>
                )}
              </div>
            </div>
          ))}
          {filteredResources.length === 0 && (
            <div className="text-center py-12">
              <p style={{ color: 'rgba(255,255,255,0.5)' }}>No resources found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}