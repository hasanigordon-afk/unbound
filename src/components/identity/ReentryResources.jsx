import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Phone, ExternalLink, Navigation, Clock, FileText, Search, Filter, Map as MapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const REENTRY_CATEGORIES = [
  { value: "all", label: "All Services" },
  { value: "job_training", label: "Job Training" },
  { value: "employment", label: "Employment Services" },
  { value: "housing", label: "Housing Support" },
  { value: "legal_aid", label: "Legal Aid" },
  { value: "mental_health", label: "Mental Health" },
  { value: "substance_abuse", label: "Substance Abuse Treatment" },
  { value: "education", label: "Education & GED" },
  { value: "financial", label: "Financial Assistance" },
  { value: "family_services", label: "Family Services" }
];

const RADIUS_OPTIONS = [
  { value: "5", label: "5 miles" },
  { value: "10", label: "10 miles" },
  { value: "25", label: "25 miles" },
  { value: "50", label: "50 miles" },
  { value: "all", label: "All locations" }
];

function ResourceDetailCard({ resource, userLocation }) {
  const [showDetails, setShowDetails] = useState(false);

  const openDirections = () => {
    if (resource.location_lat && resource.location_lng) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${resource.location_lat},${resource.location_lng}`, '_blank');
    } else {
      const query = encodeURIComponent(`${resource.address}, ${resource.city}, ${resource.state}`);
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    }
  };

  const calculateDistance = () => {
    if (!userLocation || !resource.location_lat || !resource.location_lng) return null;
    
    const R = 3959; // Earth's radius in miles
    const dLat = (resource.location_lat - userLocation.lat) * Math.PI / 180;
    const dLon = (resource.location_lng - userLocation.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(userLocation.lat * Math.PI / 180) * Math.cos(resource.location_lat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  };

  const distance = calculateDistance();

  return (
    <div className="glass-card p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="font-semibold mb-1" style={{ color: '#FFFFFF' }}>
            {resource.name}
          </h3>
          <Badge className="text-xs mb-2" style={{ background: 'rgba(47,243,224,0.15)', color: '#2FF3E0', border: 'none' }}>
            {resource.category?.replace(/_/g, " ")}
          </Badge>
        </div>
        {distance && (
          <Badge variant="outline" className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
            {distance} mi
          </Badge>
        )}
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.5)' }} />
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
            {resource.address}<br />
            {resource.city}, {resource.state} {resource.zip}
          </p>
        </div>

        {resource.phone && (
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.5)' }} />
            <a href={`tel:${resource.phone}`} className="text-sm" style={{ color: '#2FF3E0' }}>
              {resource.phone}
            </a>
          </div>
        )}

        {resource.hours && (
          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.5)' }} />
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
              {typeof resource.hours === 'object' ? JSON.stringify(resource.hours) : resource.hours}
            </p>
          </div>
        )}
      </div>

      {resource.tags && resource.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {resource.tags.map((tag, i) => (
            <Badge key={i} variant="outline" className="text-xs" style={{ color: 'rgba(255,255,255,0.6)', borderColor: 'rgba(255,255,255,0.2)' }}>
              {tag.replace(/_/g, " ")}
            </Badge>
          ))}
        </div>
      )}

      <Button
        onClick={() => setShowDetails(!showDetails)}
        variant="ghost"
        size="sm"
        className="w-full mb-2 text-xs"
        style={{ color: '#2FF3E0' }}
      >
        <FileText className="w-3 h-3 mr-2" />
        {showDetails ? 'Hide' : 'Show'} Details
      </Button>

      {showDetails && (
        <div className="p-3 rounded-lg mb-3 space-y-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
          {resource.eligibility_criteria && (
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: '#2FF3E0' }}>Eligibility:</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
                {resource.eligibility_criteria}
              </p>
            </div>
          )}
          {resource.application_process && (
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: '#2FF3E0' }}>How to Apply:</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
                {resource.application_process}
              </p>
            </div>
          )}
          {resource.notes && (
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: '#2FF3E0' }}>Additional Info:</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
                {resource.notes}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <Button
          onClick={openDirections}
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
            style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#FFFFFF' }}
          >
            <ExternalLink className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  );
}

export default function ReentryResources() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [radiusFilter, setRadiusFilter] = useState("25");
  const [viewMode, setViewMode] = useState("list");

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

  const { data: resources = [], isLoading } = useQuery({
    queryKey: ["reentry-resources"],
    queryFn: () => base44.entities.Resource.list(),
  });

  const userLocation = profile?.location_lat && profile?.location_lng 
    ? { lat: profile.location_lat, lng: profile.location_lng }
    : null;

  const calculateDistance = (resource) => {
    if (!userLocation || !resource.location_lat || !resource.location_lng) return null;
    
    const R = 3959; // Earth's radius in miles
    const dLat = (resource.location_lat - userLocation.lat) * Math.PI / 180;
    const dLon = (resource.location_lng - userLocation.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(userLocation.lat * Math.PI / 180) * Math.cos(resource.location_lat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const filteredResources = resources
    .filter(r => {
      const categoryMatch = categoryFilter === "all" || r.category === categoryFilter;
      const searchMatch = searchQuery === "" || 
        r.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.notes?.toLowerCase().includes(searchQuery.toLowerCase());
      
      let radiusMatch = true;
      if (radiusFilter !== "all" && userLocation) {
        const distance = calculateDistance(r);
        radiusMatch = distance !== null && distance <= parseInt(radiusFilter);
      }

      return categoryMatch && searchMatch && radiusMatch;
    })
    .sort((a, b) => {
      if (!userLocation) return 0;
      const distA = calculateDistance(a) || Infinity;
      const distB = calculateDistance(b) || Infinity;
      return distA - distB;
    });

  const openMapView = () => {
    if (filteredResources.length === 0) return;
    
    // Create a multi-destination map URL
    const destinations = filteredResources
      .filter(r => r.location_lat && r.location_lng)
      .slice(0, 10) // Limit to first 10 for URL length
      .map(r => `${r.location_lat},${r.location_lng}`)
      .join('|');
    
    if (userLocation) {
      window.open(`https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${destinations}`, '_blank');
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(filteredResources[0].name)}`, '_blank');
    }
  };

  return (
    <div className="space-y-4">
      <div className="glass-card p-4">
        <h2 className="text-lg font-bold mb-4" style={{ color: '#FFFFFF' }}>
          Reentry Resources
        </h2>

        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.5)' }} />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search resources..."
              className="pl-10 bg-transparent border-white/20 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs mb-1 block" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Category
              </label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="bg-transparent border-white/20 text-white text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REENTRY_CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs mb-1 block" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Radius
              </label>
              <Select value={radiusFilter} onValueChange={setRadiusFilter}>
                <SelectTrigger className="bg-transparent border-white/20 text-white text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RADIUS_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredResources.length > 0 && (
            <Button
              onClick={openMapView}
              variant="outline"
              size="sm"
              className="w-full"
              style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#FFFFFF' }}
            >
              <MapIcon className="w-4 h-4 mr-2" />
              View All on Map
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="glass-card p-8 text-center">
          <div className="w-6 h-6 border-2 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <MapPin className="w-10 h-10 mx-auto mb-3" style={{ color: 'rgba(255,255,255,0.3)' }} />
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
            No resources found matching your criteria
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm px-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Found {filteredResources.length} resource{filteredResources.length !== 1 ? 's' : ''}
          </p>
          {filteredResources.map(resource => (
            <ResourceDetailCard 
              key={resource.id} 
              resource={resource} 
              userLocation={userLocation}
            />
          ))}
        </div>
      )}
    </div>
  );
}