import React from "react";
import { Phone, MapPin, Globe, Bookmark, BookmarkCheck } from "lucide-react";

export default function ResourceNearYouCard({ resource, distance, isSaved, onSave }) {
  const googleMapsUrl = resource.latitude && resource.longitude
    ? `https://www.google.com/maps/dir/?api=1&destination=${resource.latitude},${resource.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([resource.street_address, resource.city, "NJ"].filter(Boolean).join(", "))}`;

  const categoryColors = {
    "Housing": "#4A90E2",
    "Food Pantry": "#22C55E",
    "Soup Kitchen": "#16A34A",
    "Addiction Treatment": "#8B5CF6",
    "Mental Health": "#EC4899",
    "Reentry Services": "#F97316",
    "Employment Assistance": "#0EA5E9",
    "Government Assistance": "#6B7280",
    "Legal Aid": "#DC2626",
    "Transportation": "#CA8A04",
    "Clothing Assistance": "#14B8A6",
    "Peer Support": "#A855F7",
  };

  const color = categoryColors[resource.resource_category] || "#4A90E2";

  return (
    <div style={{ background: "#FFFFFF", border: "1px solid #D1D1D6", borderRadius: "10px", padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: color + "18", color }}>
              {resource.resource_category}
            </span>
            {distance !== null && (
              <span className="text-xs" style={{ color: "#8E8E93" }}>
                {distance < 1 ? `${Math.round(distance * 5280)} ft` : `${distance.toFixed(1)} mi`} away
              </span>
            )}
          </div>
          <p className="font-semibold text-sm leading-tight" style={{ color: "#1E1E1E" }}>{resource.organization_name}</p>
          {resource.program_name && (
            <p className="text-xs mt-0.5" style={{ color: "#5A5A5A" }}>{resource.program_name}</p>
          )}
        </div>
        <button onClick={() => onSave(resource)} className="flex-shrink-0 p-1.5 rounded" style={{ background: isSaved ? "#EBF3FD" : "#F0F0F3" }}>
          {isSaved
            ? <BookmarkCheck className="w-4 h-4" style={{ color: "#4A90E2" }} />
            : <Bookmark className="w-4 h-4" style={{ color: "#8E8E93" }} />
          }
        </button>
      </div>

      {/* Location */}
      {resource.city && (
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#8E8E93" }} strokeWidth={1.5} />
          <span className="text-xs" style={{ color: "#5A5A5A" }}>
            {[resource.street_address, resource.city, resource.county ? `${resource.county} County` : null].filter(Boolean).join(", ")}
          </span>
        </div>
      )}

      {/* Intake method */}
      {resource.intake_method && (
        <div className="flex items-center gap-1.5">
          <span className="text-xs px-2 py-0.5 rounded" style={{ background: "#F0F0F3", color: "#5A5A5A" }}>
            {resource.intake_method}
          </span>
        </div>
      )}

      {/* Description */}
      {resource.description && (
        <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "#5A5A5A" }}>{resource.description}</p>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 flex-wrap pt-1">
        {resource.phone && (
          <a href={`tel:${resource.phone}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium"
            style={{ background: "#4A90E2", color: "#FFF" }}
          >
            <Phone className="w-3.5 h-3.5" strokeWidth={2} />
            Call
          </a>
        )}
        <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium"
          style={{ background: "#F0F0F3", color: "#1E1E1E" }}
        >
          <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
          Directions
        </a>
        {resource.website && (
          <a href={resource.website} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium"
            style={{ background: "#F0F0F3", color: "#1E1E1E" }}
          >
            <Globe className="w-3.5 h-3.5" strokeWidth={1.5} />
            Website
          </a>
        )}
      </div>
    </div>
  );
}