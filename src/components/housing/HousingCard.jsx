import React from "react";
import { Phone, MapPin, ChevronRight } from "lucide-react";

const TYPE_META = {
  sober_living:        { label: "Sober Living",         color: "#3ECFBF" },
  halfway_house:       { label: "Halfway House",         color: "#C9A96E" },
  emergency_shelter:   { label: "Emergency Shelter",     color: "#F87171" },
  transitional_housing:{ label: "Transitional Housing",  color: "#818CF8" },
  supportive_housing:  { label: "Supportive Housing",    color: "#34D399" },
};

const WAIT_META = {
  open:    { label: "Open",    color: "#34D399" },
  limited: { label: "Limited", color: "#FBBF24" },
  full:    { label: "Full",    color: "#F87171" },
  unknown: { label: "Call",    color: "#94A3B8" },
};

export default function HousingCard({ resource, onClick, isSaved }) {
  const type = TYPE_META[resource.housing_type] || { label: resource.housing_type, color: "#94A3B8" };
  const wait = WAIT_META[resource.waitlist_status] || WAIT_META.unknown;

  const flags = [
    resource.reentry_friendly && "Reentry OK",
    resource.recovery_focused && "Recovery",
    resource.medicaid_support && "Medicaid",
    resource.family_friendly && "Families",
    resource.veteran_specific && "Veterans",
    resource.transportation_help && "Transport",
  ].filter(Boolean);

  return (
    <button onClick={onClick} style={{
      width: "100%", textAlign: "left", background: "#fff",
      borderRadius: 16, border: "1px solid #E5E7EB",
      borderLeft: `4px solid ${type.color}`,
      padding: "16px 16px", cursor: "pointer",
      boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: 10,
      transition: "box-shadow 0.15s",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 800, padding: "3px 9px", borderRadius: 20,
              background: `${type.color}18`, color: type.color }}>
              {type.label}
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 20,
              background: `${wait.color}15`, color: wait.color }}>
              ● {wait.label}
            </span>
            {isSaved && <span style={{ fontSize: 14 }}>❤️</span>}
          </div>
          <p style={{ fontSize: 15, fontWeight: 800, color: "#1E1E1E", lineHeight: 1.3, marginBottom: 4 }}>
            {resource.resource_name}
          </p>
          {(resource.city || resource.county) && (
            <p style={{ fontSize: 12, color: "#8E8E93", display: "flex", alignItems: "center", gap: 4 }}>
              <MapPin style={{ width: 11, height: 11 }} />
              {[resource.city, resource.county ? `${resource.county} County` : null].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
        <ChevronRight style={{ width: 18, height: 18, color: "#C7C7CC", flexShrink: 0 }} />
      </div>

      {/* Cost & gender row */}
      <div style={{ display: "flex", gap: 8, marginBottom: flags.length > 0 ? 10 : 0, flexWrap: "wrap" }}>
        {resource.estimated_cost && (
          <span style={{ fontSize: 12, fontWeight: 700, color: "#D97706",
            background: "rgba(217,119,6,0.08)", padding: "4px 10px", borderRadius: 20 }}>
            💰 {resource.estimated_cost}
          </span>
        )}
        {resource.gender_served && (
          <span style={{ fontSize: 12, fontWeight: 600, color: "#5A5A5A",
            background: "#F5F5F7", padding: "4px 10px", borderRadius: 20 }}>
            {resource.gender_served.charAt(0).toUpperCase() + resource.gender_served.slice(1)}
          </span>
        )}
        {resource.phone && (
          <span style={{ fontSize: 12, fontWeight: 600, color: "#4A90E2",
            background: "rgba(74,144,226,0.08)", padding: "4px 10px", borderRadius: 20,
            display: "flex", alignItems: "center", gap: 4 }}>
            <Phone style={{ width: 10, height: 10 }} /> {resource.phone}
          </span>
        )}
      </div>

      {flags.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {flags.map((f) => (
            <span key={f} style={{ fontSize: 11, color: "#8E8E93", background: "#F5F5F7",
              padding: "3px 8px", borderRadius: 20 }}>
              {f}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}