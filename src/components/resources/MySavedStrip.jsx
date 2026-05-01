import React from "react";
import { Link } from "react-router-dom";
import { Star, ChevronRight } from "lucide-react";

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

/**
 * Compact "My Saved" preview for the top of Support Map.
 * - Hidden when there are no saved resources.
 * - Shows up to 6 chips, each scrolls the page to that resource on tap.
 * - "View all" links to /SavedResources for full management.
 */
export default function MySavedStrip({ savedResources = [], onChipClick }) {
  if (!savedResources.length) return null;

  const preview = savedResources.slice(0, 6);

  return (
    <div className="px-5 pt-3">
      <div style={{
        background: "#FFFBEB",
        border: "1px solid #FDE68A",
        borderRadius: 12,
        padding: "12px 14px",
      }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4" style={{ color: "#C8932F" }} fill="#C8932F" strokeWidth={2} />
            <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "#C8932F", letterSpacing: ".08em" }}>
              My Saved
            </p>
            <span style={{
              fontSize: 10, fontWeight: 700, color: "#C8932F",
              background: "rgba(200,147,47,0.15)", padding: "2px 7px", borderRadius: 999,
            }}>
              {savedResources.length}
            </span>
          </div>
          <Link to="/SavedResources" className="flex items-center gap-0.5 text-xs font-semibold" style={{ color: "#C8932F" }}>
            View all <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {preview.map((s) => {
            const c = CATEGORY_COLORS[s.resource_category] || "#4A90E2";
            return (
              <button
                key={s.id}
                onClick={() => onChipClick?.(s.resource_id)}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap"
                style={{
                  background: "#FFFFFF",
                  border: `1px solid ${c}40`,
                  color: "#1E1E1E",
                  display: "inline-flex", alignItems: "center", gap: 6,
                  maxWidth: 200,
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: c, flexShrink: 0 }} />
                <span className="truncate">{s.resource_name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}