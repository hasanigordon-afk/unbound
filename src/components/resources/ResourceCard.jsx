import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Globe, MapPin, Clock } from "lucide-react";

export default function ResourceCard({ resource, onSave, onReport, onViewDetails }) {
  const categoryLabels = {
    detox: "Detox",
    inpatient: "Inpatient",
    outpatient_iop: "Outpatient/IOP",
    sober_living: "Sober Living",
    shelters: "Shelter",
    food_pantries: "Food Pantry",
    harm_reduction: "Harm Reduction",
    free_clinics: "Free Clinic",
    transportation: "Transportation",
    meetings_alcohol: "AA Meetings",
    meetings_substances: "NA/CA Meetings",
  };

  return (
    <div className="glass-card p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold mb-1" style={{ color: '#FFFFFF' }}>{resource.name}</h3>
          <Badge className="mb-2" style={{ background: 'rgba(47,243,224,0.15)', color: '#2FF3E0' }}>
            {categoryLabels[resource.category]}
          </Badge>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {resource.address && (
          <div className="flex items-start gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.5)' }} />
            <span>{resource.address}, {resource.city}, {resource.state} {resource.zip}</span>
          </div>
        )}
        {resource.phone && (
          <div className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>
            <Phone className="w-4 h-4 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.5)' }} />
            <a href={`tel:${resource.phone}`} className="hover:opacity-80" style={{ color: '#2FF3E0' }}>
              {resource.phone}
            </a>
          </div>
        )}
        {resource.website && (
          <div className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>
            <Globe className="w-4 h-4 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.5)' }} />
            <a href={resource.website} target="_blank" rel="noopener noreferrer" className="hover:opacity-80" style={{ color: '#2FF3E0' }}>
              Visit Website
            </a>
          </div>
        )}
      </div>

      {resource.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {resource.tags.map((tag, i) => (
            <span key={i} className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.75)' }}>
              {tag.replace(/_/g, " ")}
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Button onClick={() => onViewDetails(resource)} className="flex-1 font-medium" style={{ background: '#2FF3E0', color: '#0B0F1F' }}>
          View Details
        </Button>
        <Button onClick={() => onSave(resource)} variant="outline" size="sm" style={{ border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: '#FFFFFF' }}>
          Save
        </Button>
      </div>
    </div>
  );
}