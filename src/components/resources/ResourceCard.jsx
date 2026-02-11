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
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900 mb-1">{resource.name}</h3>
          <Badge className="bg-teal-100 text-teal-700 mb-2">
            {categoryLabels[resource.category]}
          </Badge>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {resource.address && (
          <div className="flex items-start gap-2 text-sm text-slate-600">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{resource.address}, {resource.city}, {resource.state} {resource.zip}</span>
          </div>
        )}
        {resource.phone && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Phone className="w-4 h-4 flex-shrink-0" />
            <a href={`tel:${resource.phone}`} className="text-teal-600 hover:text-teal-700">
              {resource.phone}
            </a>
          </div>
        )}
        {resource.website && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Globe className="w-4 h-4 flex-shrink-0" />
            <a href={resource.website} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:text-teal-700">
              Visit Website
            </a>
          </div>
        )}
      </div>

      {resource.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {resource.tags.map((tag, i) => (
            <span key={i} className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
              {tag.replace(/_/g, " ")}
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Button onClick={() => onViewDetails(resource)} className="flex-1 bg-teal-600 hover:bg-teal-700">
          View Details
        </Button>
        <Button onClick={() => onSave(resource)} variant="outline" size="sm">
          Save
        </Button>
      </div>
    </div>
  );
}