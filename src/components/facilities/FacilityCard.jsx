import React from "react";
import { MapPin, Phone, Globe, Bookmark, BookmarkCheck, ChevronRight } from "lucide-react";

const TYPE_COLORS = {
  detox: { bg: "#FEF2F2", color: "#DC2626", label: "Detox" },
  rehab: { bg: "#EBF5FF", color: "#2563EB", label: "Rehab" },
  outpatient_clinic: { bg: "#F0FDF4", color: "#16A34A", label: "Outpatient" },
  behavioral_health_center: { bg: "#F5F3FF", color: "#7C3AED", label: "Behavioral Health" },
  hospital_program: { bg: "#FFF7ED", color: "#D97706", label: "Hospital Program" },
};

const SERVICE_BADGES = [
  { key: "detox_available",     label: "Detox",    color: "#DC2626", bg: "#FEF2F2" },
  { key: "inpatient_available", label: "Inpatient", color: "#2563EB", bg: "#EBF5FF" },
  { key: "iop_available",       label: "IOP",       color: "#7C3AED", bg: "#F5F3FF" },
  { key: "php_available",       label: "PHP",       color: "#D97706", bg: "#FFF7ED" },
  { key: "mat_available",       label: "MAT",       color: "#0891B2", bg: "#ECFEFF" },
  { key: "telehealth_available",label: "Telehealth",color: "#16A34A", bg: "#F0FDF4" },
];

export default function FacilityCard({ facility, isSaved, onSave, onClick }) {
  const typeInfo = TYPE_COLORS[facility.facility_type] || { bg: "#F7F7F8", color: "#5A5A5A", label: facility.facility_type };

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#FFF", border: "1px solid #E5E7EB" }}>
      <button className="w-full text-left p-4" onClick={onClick}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: typeInfo.bg, color: typeInfo.color }}>
                {typeInfo.label}
              </span>
              {facility.medicaid_accepted && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#F0FDF4", color: "#16A34A" }}>
                  ✓ Medicaid
                </span>
              )}
              {(facility.men_only || facility.women_only) && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#FFF7ED", color: "#D97706" }}>
                  {facility.men_only ? "Men Only" : "Women Only"}
                </span>
              )}
            </div>
            <p className="font-bold text-base leading-tight" style={{ color: "#1E1E1E" }}>{facility.facility_name}</p>
            <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "#8E8E93" }}>
              <MapPin className="w-3 h-3 flex-shrink-0" />
              {facility.address ? `${facility.address}, ` : ""}{facility.city}, NJ {facility.zip}
            </p>
            {facility.phone && (
              <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: "#8E8E93" }}>
                <Phone className="w-3 h-3 flex-shrink-0" />{facility.phone}
              </p>
            )}
          </div>
          <ChevronRight className="w-5 h-5 flex-shrink-0 mt-1" style={{ color: "#C7C7CC" }} />
        </div>

        {/* Service badges */}
        <div className="flex gap-1.5 flex-wrap mt-3">
          {SERVICE_BADGES.filter(b => facility[b.key]).map(b => (
            <span key={b.key} className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: b.bg, color: b.color }}>
              {b.label}
            </span>
          ))}
          {facility.dual_diagnosis_support && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#F5F3FF", color: "#7C3AED" }}>
              Dual Diagnosis
            </span>
          )}
        </div>
      </button>

      <div className="px-4 pb-4 flex gap-2" style={{ borderTop: "1px solid #F7F7F8" }}>
        {facility.phone && (
          <a href={`tel:${facility.phone}`} onClick={e => e.stopPropagation()}
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl font-semibold"
            style={{ background: "#F0FDF4", color: "#16A34A" }}>
            <Phone className="w-3.5 h-3.5" /> Call
          </a>
        )}
        {facility.website && (
          <a href={facility.website} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl font-semibold"
            style={{ background: "#EBF5FF", color: "#2563EB" }}>
            <Globe className="w-3.5 h-3.5" /> Website
          </a>
        )}
        <button onClick={e => { e.stopPropagation(); onSave(facility); }}
          className="ml-auto flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl"
          style={{ background: isSaved ? "#EBF5FF" : "#F7F7F8", color: isSaved ? "#2563EB" : "#8E8E93" }}>
          {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          {isSaved ? "Saved" : "Save"}
        </button>
      </div>
    </div>
  );
}