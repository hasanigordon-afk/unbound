import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Phone, ExternalLink, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const RESOURCE_TYPES = [
  { value: "all", label: "All Resources" },
  { value: "dmv", label: "DMV Offices" },
  { value: "social_security", label: "Social Security Offices" },
  { value: "snap", label: "SNAP Offices" },
  { value: "medicaid", label: "Medicaid Offices" },
  { value: "housing", label: "Housing Assistance" },
  { value: "employment", label: "Employment Services" }
];

export default function ResourceFinder() {
  const [typeFilter, setTypeFilter] = useState("all");

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: profile } = useQuery({
    queryKey: ["my-profile"],
    queryFn: async () => {
      const profiles = await base44.entities.MemberProfile.filter({ created_by: user.email });
      return profiles[0];
    },
    enabled: !!user,
  });

  const { data: resources = [] } = useQuery({
    queryKey: ["identity-resources"],
    queryFn: () => base44.entities.IdentityResource.list(),
  });

  const filteredResources = resources.filter(r => {
    const typeMatch = typeFilter === "all" || r.type === typeFilter;
    const cityMatch = !profile?.location_city || r.city === profile.location_city;
    return typeMatch && cityMatch;
  });

  const openDirections = (resource) => {
    if (resource.location_lat && resource.location_lng) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${resource.location_lat},${resource.location_lng}`, '_blank');
    } else {
      const query = encodeURIComponent(`${resource.address}, ${resource.city}, ${resource.state}`);
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    }
  };

  return (
    <div className="space-y-4">
      <div className="glass-card p-4">
        <label className="text-sm mb-2 block" style={{ color: 'rgba(255,255,255,0.7)' }}>
          Filter by Type
        </label>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="bg-transparent border-white/20 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RESOURCE_TYPES.map(type => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredResources.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <MapPin className="w-10 h-10 mx-auto mb-3" style={{ color: 'rgba(255,255,255,0.3)' }} />
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
            No resources found in your area
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredResources.map(resource => (
            <div key={resource.id} className="glass-card p-4">
              <h3 className="font-semibold mb-1" style={{ color: '#FFFFFF' }}>
                {resource.name}
              </h3>
              <div className="flex items-start gap-1 mb-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.5)' }} />
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  {resource.address}<br />
                  {resource.city}, {resource.state} {resource.zip}
                </p>
              </div>
              {resource.phone && (
                <div className="flex items-center gap-1 mb-2">
                  <Phone className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.5)' }} />
                  <a href={`tel:${resource.phone}`} className="text-sm" style={{ color: '#2FF3E0' }}>
                    {resource.phone}
                  </a>
                </div>
              )}
              {resource.hours && (
                <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Hours: {resource.hours}
                </p>
              )}
              <div className="flex gap-2">
                <Button
                  onClick={() => openDirections(resource)}
                  size="sm"
                  className="flex-1"
                  style={{ background: '#2FF3E0', color: '#0B0F1F' }}
                >
                  <Navigation className="w-3 h-3 mr-2" />
                  Directions
                </Button>
                {resource.website && (
                  <Button
                    onClick={() => window.open(resource.website.startsWith('http') ? resource.website : `https://${resource.website}`, '_blank')}
                    size="sm"
                    variant="outline"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}