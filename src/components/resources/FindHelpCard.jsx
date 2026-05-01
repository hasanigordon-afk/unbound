import React from "react";
import { Phone, Navigation, Star } from "lucide-react";

const CATEGORY_COLORS = {
  "Housing": "#8B5CF6",
  "Emergency Shelter": "#F97316",
  "Transitional Housing": "#8B5CF6",
  "Addiction Treatment": "#EC4899",
  "Detox": "#EF4444",
  "Inpatient Rehab": "#EC4899",
  "Outpatient Rehab": "#EC4899",
  "Medication Assisted Treatment": "#EC4899",
  "Mental Health": "#3B82F6",
  "Food Pantry": "#22C55E",
  "Soup Kitchen": "#22C55E",
  "Employment Assistance": "#F59E0B",
  "Reentry Services": "#14B8A6",
  "Legal Aid": "#6366F1",
  "Transportation": "#0EA5E9",
  "Clothing Assistance": "#D97706",
  "Peer Support": "#10B981",
};

export default function FindHelpCard({ resource, distance, isSaved, onSave }) {
  const color = CATEGORY_COLORS[resource.resource_category] || "#4A90E2";

  const mapsUrl = resource.latitude && resource.longitude
    ? `https://www.google.com/maps/dir/?api=1&destination=${resource.latitude},${resource.longitude}`
    : resource.street_address
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent([resource.street_address, resource.city, resource.state].filter(Boolean).join(", "))}`
    : null;

  return (
    <div style={{ background: "#FFF", border: "1px solid #D1D1D6", borderRadius: "8px", overflow: "hidden" }}>
      {/* Top accent bar */}
      <div style={{ height: "3px", background: color }} />
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate" style={{ color: "#1E1E1E" }}>{resource.organization_name}</p>
            {resource.program_name && (
              <p className="text-xs mt-0.5 truncate" style={{ color: "#5A5A5A" }}>{resource.program_name}</p>
            )}
          </div>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSave(resource); }}
            className="flex-shrink-0 p-1.5 rounded-full"
            aria-label={isSaved ? "Remove from saved" : "Save to My Saved"}
            style={{ background: isSaved ? color + "18" : "transparent", transition: "background .15s" }}
          >
            <Star
              className="w-[18px] h-[18px]"
              style={{ color: isSaved ? color : "#8E8E93" }}
              fill={isSaved ? color : "transparent"}
              strokeWidth={isSaved ? 2 : 1.6}
            />
          </button>
        </div>

        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: color + "18", color }}>
            {resource.resource_category}
          </span>
          {distance !== null && (
            <span className="text-xs" style={{ color: "#8E8E93" }}>
              {distance < 0.1 ? "Nearby" : `${distance.toFixed(1)} mi away`}
            </span>
          )}
          {resource.city && resource.state && (
            <span className="text-xs" style={{ color: "#8E8E93" }}>{resource.city}, {resource.state}</span>
          )}
        </div>

        {/* Badges */}
        <div className="flex gap-2 mb-3 flex-wrap">
          {resource.accepts_medicaid && (
            <span className="text-xs px-2 py-0.5 rounded" style={{ background: "#F0FDF4", color: "#15803D", border: "1px solid #86EFAC" }}>✓ Medicaid</span>
          )}
          {resource.accepts_uninsured && (
            <span className="text-xs px-2 py-0.5 rounded" style={{ background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE" }}>✓ Uninsured OK</span>
          )}
          {resource.intake_method && (
            <span className="text-xs px-2 py-0.5 rounded" style={{ background: "#F7F7F8", color: "#5A5A5A", border: "1px solid #D1D1D6" }}>{resource.intake_method}</span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {resource.phone && (
            <a href={`tel:${resource.phone}`}
              className="flex items-center gap-1.5 px-3 py-2 rounded text-xs font-medium flex-1 justify-center"
              style={{ background: "#EBF3FD", color: "#4A90E2", border: "1px solid #BFDBFE" }}
            >
              <Phone className="w-3.5 h-3.5" strokeWidth={2} /> Call
            </a>
          )}
          {mapsUrl && (
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded text-xs font-medium flex-1 justify-center"
              style={{ background: "#F0FDF4", color: "#15803D", border: "1px solid #86EFAC" }}
            >
              <Navigation className="w-3.5 h-3.5" strokeWidth={2} /> Directions
            </a>
          )}
          {resource.website && (
            <a href={resource.website} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded text-xs font-medium flex-shrink-0"
              style={{ background: "#F7F7F8", color: "#5A5A5A", border: "1px solid #D1D1D6" }}
            >
              Web
            </a>
          )}
        </div>
      </div>
    </div>
  );
}