import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MapPin, Phone, ExternalLink, Navigation, Search, Heart, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const FILTER_CHIPS = [
  { value: "all", label: "All" },
  { value: "id", label: "ID (DMV/MVC)" },
  { value: "social_security", label: "Social Security" },
  { value: "benefits", label: "Benefits (SNAP/Medicaid/WFNJ)" },
  { value: "housing", label: "Housing" },
  { value: "employment", label: "Employment" },
  { value: "reentry", label: "Reentry Support" },
  { value: "saved", label: "Saved" }
];

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function isOpenNow(hoursJson) {
  if (!hoursJson) return { isOpen: false, opensAt: null };
  
  const now = new Date();
  const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const dayKey = dayNames[now.getDay()];
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  const dayHours = hoursJson[dayKey];
  if (!dayHours || dayHours.length === 0) {
    return { isOpen: false, opensAt: null };
  }
  
  for (const period of dayHours) {
    const [openHour, openMin] = period.open.split(':').map(Number);
    const [closeHour, closeMin] = period.close.split(':').map(Number);
    const openTime = openHour * 60 + openMin;
    const closeTime = closeHour * 60 + closeMin;
    
    if (currentTime >= openTime && currentTime < closeTime) {
      return { isOpen: true, opensAt: null };
    }
    
    if (currentTime < openTime) {
      return { isOpen: false, opensAt: period.open };
    }
  }
  
  return { isOpen: false, opensAt: null };
}

function ResourceCard({ resource, userLocation, isSaved, onToggleSave }) {
  const distance = userLocation && resource.latitude && resource.longitude
    ? calculateDistance(userLocation.lat, userLocation.lng, resource.latitude, resource.longitude)
    : null;
  
  const { isOpen, opensAt } = isOpenNow(resource.hours_json);
  
  const openDirections = () => {
    if (resource.latitude && resource.longitude) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${resource.latitude},${resource.longitude}`, '_blank');
    } else {
      const query = encodeURIComponent(`${resource.address}, ${resource.city}, ${resource.state}`);
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    }
  };
  
  return (
    <div className="glass-card p-4 relative">
      <button
        onClick={() => onToggleSave(resource)}
        className="absolute top-3 right-3 p-2 rounded-full hover:bg-white/10 transition-colors"
      >
        <Heart 
          className={`w-5 h-5 ${isSaved ? 'fill-red-500 text-red-500' : 'text-white/40'}`}
        />
      </button>
      
      <div className="pr-10">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-semibold mb-1" style={{ color: '#FFFFFF' }}>
              {resource.name}
            </h3>
            <Badge className="text-xs mb-2" style={{ background: 'rgba(47,243,224,0.15)', color: '#2FF3E0', border: 'none' }}>
              {resource.category}
            </Badge>
          </div>
        </div>
        
        {distance && (
          <Badge variant="outline" className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
            {distance.toFixed(1)} mi away
          </Badge>
        )}
        
        {resource.hours_json && (
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-3 h-3" style={{ color: isOpen ? '#2FF3E0' : 'rgba(255,255,255,0.5)' }} />
            {isOpen ? (
              <span className="text-xs font-medium" style={{ color: '#2FF3E0' }}>Open Now</span>
            ) : opensAt ? (
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Opens at {opensAt}</span>
            ) : (
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Closed</span>
            )}
          </div>
        )}
        
        <div className="flex items-start gap-2 mb-2">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.5)' }} />
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
            {resource.address}<br />
            {resource.city}, {resource.state} {resource.zip}
          </p>
        </div>
        
        {resource.phone && (
          <div className="flex items-center gap-2 mb-3">
            <Phone className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.5)' }} />
            <a href={`tel:${resource.phone}`} className="text-sm" style={{ color: '#2FF3E0' }}>
              {resource.phone}
            </a>
          </div>
        )}
        
        {resource.tags && resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {resource.tags.slice(0, 3).map((tag, i) => (
              <Badge key={i} variant="outline" className="text-xs" style={{ color: 'rgba(255,255,255,0.6)', borderColor: 'rgba(255,255,255,0.2)' }}>
                {tag}
              </Badge>
            ))}
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
    </div>
  );
}

export default function ResourceFinder() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [locationRequested, setLocationRequested] = useState(false);
  
  const queryClient = useQueryClient();
  
  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
  });
  
  const { data: resources = [], isLoading } = useQuery({
    queryKey: ["all-resources"],
    queryFn: () => base44.entities.Resource.list(),
  });
  
  const { data: savedResources = [] } = useQuery({
    queryKey: ["saved-resources", user?.email],
    queryFn: () => base44.entities.SavedResource.filter({ created_by: user.email }),
    enabled: !!user,
  });
  
  const saveMutation = useMutation({
    mutationFn: (resource) => base44.entities.SavedResource.create({
      resource_id: resource.id,
      resource_name: resource.name,
      resource_category: resource.category
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-resources"] });
    },
  });
  
  const unsaveMutation = useMutation({
    mutationFn: (resourceId) => {
      const saved = savedResources.find(s => s.resource_id === resourceId);
      if (saved) {
        return base44.entities.SavedResource.delete(saved.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-resources"] });
    },
  });
  
  useEffect(() => {
    if (!locationRequested && navigator.geolocation) {
      setLocationRequested(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied');
        }
      );
    }
  }, [locationRequested]);
  
  const savedResourceIds = new Set(savedResources.map(s => s.resource_id));
  
  const filteredResources = resources
    .filter(r => {
      // Filter logic
      let filterMatch = true;
      
      if (activeFilter === "id") {
        filterMatch = r.category === "ID";
      } else if (activeFilter === "social_security") {
        filterMatch = r.name?.toLowerCase().includes('social security');
      } else if (activeFilter === "benefits") {
        filterMatch = r.category === "Benefits" || 
                      r.name?.toLowerCase().includes('snap') ||
                      r.name?.toLowerCase().includes('medicaid') ||
                      r.name?.toLowerCase().includes('wfnj');
      } else if (activeFilter === "housing") {
        filterMatch = r.category === "Housing";
      } else if (activeFilter === "employment") {
        filterMatch = r.category === "Employment";
      } else if (activeFilter === "reentry") {
        filterMatch = r.category === "Reentry";
      } else if (activeFilter === "saved") {
        filterMatch = savedResourceIds.has(r.id);
      }
      
      // Search logic
      const searchMatch = searchQuery === "" ||
        r.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.zip?.includes(searchQuery) ||
        r.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return filterMatch && searchMatch;
    })
    .map(r => ({
      ...r,
      distance: userLocation && r.latitude && r.longitude
        ? calculateDistance(userLocation.lat, userLocation.lng, r.latitude, r.longitude)
        : null
    }))
    .sort((a, b) => {
      if (a.distance !== null && b.distance !== null) {
        return a.distance - b.distance;
      }
      if (a.distance !== null) return -1;
      if (b.distance !== null) return 1;
      return 0;
    });
  
  const nearest5 = userLocation ? filteredResources.slice(0, 5) : [];
  const remaining = userLocation ? filteredResources.slice(5) : filteredResources;
  
  const toggleSave = (resource) => {
    if (savedResourceIds.has(resource.id)) {
      unsaveMutation.mutate(resource.id);
    } else {
      saveMutation.mutate(resource);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="glass-card p-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.5)' }} />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, city, zip, or tags..."
            className="pl-10 bg-transparent border-white/20 text-white"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          {FILTER_CHIPS.map(chip => (
            <button
              key={chip.value}
              onClick={() => setActiveFilter(chip.value)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={{
                background: activeFilter === chip.value ? '#2FF3E0' : 'rgba(255,255,255,0.1)',
                color: activeFilter === chip.value ? '#0B0F1F' : '#FFFFFF'
              }}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>
      
      {isLoading ? (
        <div className="glass-card p-8 text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto" style={{ color: '#2FF3E0' }} />
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <MapPin className="w-10 h-10 mx-auto mb-3" style={{ color: 'rgba(255,255,255,0.3)' }} />
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
            No resources found
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {nearest5.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3 px-2" style={{ color: '#2FF3E0' }}>
                Nearest 5
              </h3>
              <div className="space-y-3">
                {nearest5.map(resource => (
                  <ResourceCard 
                    key={resource.id} 
                    resource={resource}
                    userLocation={userLocation}
                    isSaved={savedResourceIds.has(resource.id)}
                    onToggleSave={toggleSave}
                  />
                ))}
              </div>
            </div>
          )}
          
          {remaining.length > 0 && (
            <div>
              {nearest5.length > 0 && (
                <h3 className="text-sm font-semibold mb-3 px-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  More Resources
                </h3>
              )}
              <div className="space-y-3">
                {remaining.map(resource => (
                  <ResourceCard 
                    key={resource.id} 
                    resource={resource}
                    userLocation={userLocation}
                    isSaved={savedResourceIds.has(resource.id)}
                    onToggleSave={toggleSave}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}