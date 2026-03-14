import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Filter, X, Loader2, Building2, SlidersHorizontal } from "lucide-react";
import FacilityCard from "@/components/facilities/FacilityCard";
import FacilityDetail from "@/components/facilities/FacilityDetail";

const NJ_COUNTIES = ["Atlantic","Bergen","Burlington","Camden","Cape May","Cumberland","Essex","Gloucester","Hudson","Hunterdon","Mercer","Middlesex","Monmouth","Morris","Ocean","Passaic","Salem","Somerset","Sussex","Union","Warren"];

const FILTERS = [
  { key: "detox_available",          label: "Detox" },
  { key: "inpatient_available",      label: "Inpatient" },
  { key: "outpatient_available",     label: "Outpatient" },
  { key: "iop_available",            label: "IOP" },
  { key: "mat_available",            label: "MAT" },
  { key: "medicaid_accepted",        label: "Medicaid" },
  { key: "telehealth_available",     label: "Telehealth" },
  { key: "dual_diagnosis_support",   label: "Dual Diagnosis" },
  { key: "transportation_assistance",label: "Transport Help" },
  { key: "men_only",                 label: "Men Only" },
  { key: "women_only",               label: "Women Only" },
];

export default function NJTreatmentFacilities() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedCounty, setSelectedCounty] = useState("");
  const [activeFilters, setActiveFilters] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: facilities = [], isLoading } = useQuery({
    queryKey: ["nj-treatment-facilities"],
    queryFn: () => base44.entities.NJTreatmentFacility.filter({ active_status: "active" }),
  });

  const { data: savedResources = [] } = useQuery({
    queryKey: ["saved-facilities", user?.email],
    queryFn: () => base44.entities.SavedResource.filter({ created_by: user.email, resource_category: "Addiction Treatment" }),
    enabled: !!user,
  });

  const savedIds = useMemo(() => new Set(savedResources.map(s => s.resource_id)), [savedResources]);

  const saveMutation = useMutation({
    mutationFn: async (facility) => {
      const existing = savedResources.find(s => s.resource_id === facility.id);
      if (existing) await base44.entities.SavedResource.delete(existing.id);
      else await base44.entities.SavedResource.create({ resource_id: facility.id, resource_name: facility.facility_name, resource_category: "Addiction Treatment" });
    },
    onSuccess: () => queryClient.invalidateQueries(["saved-facilities"]),
  });

  const toggleFilter = (key) => setActiveFilters(prev => prev.includes(key) ? prev.filter(f => f !== key) : [...prev, key]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return facilities.filter(f => {
      const matchSearch = !search || f.facility_name?.toLowerCase().includes(q) || f.city?.toLowerCase().includes(q) || f.zip?.includes(q) || f.county?.toLowerCase().includes(q) || f.description?.toLowerCase().includes(q);
      const matchCounty = !selectedCounty || f.county === selectedCounty;
      const matchFilters = activeFilters.every(key => f[key] === true);
      return matchSearch && matchCounty && matchFilters;
    });
  }, [facilities, search, selectedCounty, activeFilters]);

  if (selectedFacility) {
    return (
      <FacilityDetail
        facility={selectedFacility}
        isSaved={savedIds.has(selectedFacility.id)}
        onSave={(f) => saveMutation.mutate(f)}
        onBack={() => setSelectedFacility(null)}
      />
    );
  }

  return (
    <div className="min-h-screen pb-28" style={{ background: "#F7F7F8" }}>
      {/* Header */}
      <div className="px-5 pt-8 pb-4" style={{ background: "#FFF", borderBottom: "1px solid #D1D1D6" }}>
        <h1 className="text-xl font-bold" style={{ color: "#1E1E1E" }}>NJ Treatment Facilities</h1>
        <p className="text-sm mt-0.5 mb-4" style={{ color: "#8E8E93" }}>Find addiction treatment across New Jersey</p>

        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl mb-3" style={{ background: "#F7F7F8", border: "1px solid #D1D1D6" }}>
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: "#8E8E93" }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by city, zip, name…"
            className="flex-1 text-sm bg-transparent outline-none"
            style={{ color: "#1E1E1E" }}
          />
          {search && <button onClick={() => setSearch("")}><X className="w-4 h-4" style={{ color: "#8E8E93" }} /></button>}
        </div>

        {/* County + Filter row */}
        <div className="flex gap-2">
          <select
            value={selectedCounty}
            onChange={e => setSelectedCounty(e.target.value)}
            className="flex-1 text-sm px-3 py-2.5 rounded-xl"
            style={{ background: "#F7F7F8", border: "1px solid #D1D1D6", color: selectedCounty ? "#1E1E1E" : "#8E8E93" }}
          >
            <option value="">All Counties</option>
            {NJ_COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: activeFilters.length > 0 ? "#4A90E2" : "#F7F7F8", color: activeFilters.length > 0 ? "#FFF" : "#5A5A5A", border: "1px solid #D1D1D6" }}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters{activeFilters.length > 0 ? ` (${activeFilters.length})` : ""}
          </button>
        </div>

        {/* Filter chips */}
        {showFilters && (
          <div className="mt-3 flex gap-2 flex-wrap">
            {FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => toggleFilter(f.key)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: activeFilters.includes(f.key) ? "#1E1E1E" : "#F7F7F8", color: activeFilters.includes(f.key) ? "#FFF" : "#5A5A5A", border: "1px solid #D1D1D6" }}
              >
                {f.label}
              </button>
            ))}
            {activeFilters.length > 0 && (
              <button onClick={() => setActiveFilters([])} className="px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: "#FEF2F2", color: "#EF4444", border: "1px solid #FCA5A5" }}>
                Clear All
              </button>
            )}
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="px-5 py-3 flex items-center justify-between" style={{ background: "#F7F7F8" }}>
        <p className="text-xs font-semibold" style={{ color: "#8E8E93" }}>
          {isLoading ? "Loading…" : `${filtered.length} facilit${filtered.length !== 1 ? "ies" : "y"} found`}
        </p>
        {(search || selectedCounty || activeFilters.length > 0) && (
          <button
            onClick={() => { setSearch(""); setSelectedCounty(""); setActiveFilters([]); }}
            className="text-xs font-semibold"
            style={{ color: "#EF4444", background: "none", border: "none" }}
          >
            Clear all
          </button>
        )}
      </div>

      {/* Results */}
      <div className="px-5 pb-5 space-y-3">
        {isLoading && (
          <div className="text-center py-16">
            <Loader2 className="w-7 h-7 mx-auto animate-spin opacity-30" />
            <p className="text-sm mt-3" style={{ color: "#8E8E93" }}>Finding treatment options…</p>
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-16 rounded-2xl mt-2" style={{ background: "#FFF", border: "1px solid #E5E7EB" }}>
            <Building2 className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm font-medium" style={{ color: "#1E1E1E" }}>No facilities match your search.</p>
            <p className="text-xs mt-1" style={{ color: "#8E8E93" }}>Try a different city, zip code, or clear your filters.</p>
            <p className="text-xs mt-3 font-semibold" style={{ color: "#4A90E2" }}>Call 1-800-662-4357 (SAMHSA) for immediate help.</p>
          </div>
        )}

        {filtered.map(facility => (
          <FacilityCard
            key={facility.id}
            facility={facility}
            isSaved={savedIds.has(facility.id)}
            onSave={(f) => saveMutation.mutate(f)}
            onClick={() => setSelectedFacility(facility)}
          />
        ))}
      </div>

      {/* Bottom crisis strip */}
      {!isLoading && (
        <div className="mx-5 mb-6 p-4 rounded-2xl" style={{ background: "#FEF2F2", border: "1px solid #FCA5A5" }}>
          <p className="text-sm font-bold" style={{ color: "#DC2626" }}>Need help right now?</p>
          <p className="text-xs mt-0.5 mb-3" style={{ color: "#7F1D1D" }}>SAMHSA helpline connects you to treatment 24/7 — free and confidential.</p>
          <a href="tel:18006624357" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm" style={{ background: "#DC2626", color: "#FFF" }}>
            📞 1-800-662-4357
          </a>
        </div>
      )}
    </div>
  );
}