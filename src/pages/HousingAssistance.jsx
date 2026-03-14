import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Home, MapPin, Phone, Globe, Bookmark, BookmarkCheck, Filter, Loader2, Search, ExternalLink } from "lucide-react";

const HOUSING_CATEGORIES = [
  { label: "All", value: "" },
  { label: "🏠 Sober Living", value: "Housing" },
  { label: "🛏 Emergency Shelter", value: "Emergency Shelter" },
  { label: "🔄 Transitional", value: "Transitional Housing" },
  { label: "🤝 Supportive", value: "Peer Support" },
];

const INTAKE_COLORS = { "Walk-In": "#22C55E", "Phone": "#4A90E2", "Online Application": "#8B5CF6", "Referral Required": "#F59E0B", "Appointment Required": "#F97316" };

export default function HousingAssistance() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [medicaidOnly, setMedicaidOnly] = useState(false);
  const [uninsuredOnly, setUninsuredOnly] = useState(false);

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: resources = [], isLoading } = useQuery({
    queryKey: ["housing-resources"],
    queryFn: () => base44.entities.USRecoveryResource.list("-created_date", 200),
  });

  const { data: savedResources = [] } = useQuery({
    queryKey: ["saved-resources", user?.email],
    queryFn: () => base44.entities.SavedResource.filter({ created_by: user.email }),
    enabled: !!user,
  });

  const savedIds = useMemo(() => new Set(savedResources.map(s => s.resource_id)), [savedResources]);

  const saveMutation = useMutation({
    mutationFn: async (r) => {
      const existing = savedResources.find(s => s.resource_id === r.id);
      if (existing) await base44.entities.SavedResource.delete(existing.id);
      else await base44.entities.SavedResource.create({ resource_id: r.id, resource_name: r.organization_name, resource_category: r.resource_category });
    },
    onSuccess: () => queryClient.invalidateQueries(["saved-resources"]),
  });

  const housingResources = resources.filter(r =>
    ["Housing", "Emergency Shelter", "Transitional Housing", "Peer Support"].includes(r.resource_category)
  );

  const filtered = useMemo(() => {
    return housingResources.filter(r => {
      const q = search.toLowerCase();
      const matchSearch = !search || r.organization_name?.toLowerCase().includes(q) || r.city?.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q);
      const matchCat = !category || r.resource_category === category;
      const matchMedicaid = !medicaidOnly || r.accepts_medicaid;
      const matchUninsured = !uninsuredOnly || r.accepts_uninsured;
      return matchSearch && matchCat && matchMedicaid && matchUninsured;
    });
  }, [housingResources, search, category, medicaidOnly, uninsuredOnly]);

  return (
    <div className="min-h-screen pb-28" style={{ background: "#F7F7F8" }}>
      <div className="px-5 pt-8 pb-5" style={{ background: "#FFF", borderBottom: "1px solid #D1D1D6" }}>
        <h1 className="text-xl font-bold" style={{ color: "#1E1E1E" }}>Housing Assistance</h1>
        <p className="text-sm mt-0.5" style={{ color: "#8E8E93" }}>Safe housing and shelter resources near you</p>
        <div className="mt-4 flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: "#F7F7F8", border: "1px solid #D1D1D6" }}>
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: "#8E8E93" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or city…"
            className="flex-1 text-sm bg-transparent outline-none" style={{ color: "#1E1E1E" }} />
        </div>
      </div>

      {/* Emergency strip */}
      <div className="mx-5 mt-4 p-4 rounded-2xl flex items-center gap-4" style={{ background: "#7C3AED", color: "#FFF" }}>
        <span className="text-3xl">🆘</span>
        <div>
          <p className="font-bold text-sm">Need shelter tonight?</p>
          <p className="text-xs opacity-80">Call 211 — free, 24/7, connects you to local shelters</p>
        </div>
        <a href="tel:211" className="ml-auto px-4 py-2 rounded-xl font-bold text-sm flex-shrink-0" style={{ background: "#FFF", color: "#7C3AED" }}>
          Call 211
        </a>
      </div>

      {/* Category filters */}
      <div className="flex gap-2 px-5 py-3 overflow-x-auto">
        {HOUSING_CATEGORIES.map(c => (
          <button key={c.value} onClick={() => setCategory(c.value)}
            className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0"
            style={{ background: category === c.value ? "#1E1E1E" : "#FFF", color: category === c.value ? "#FFF" : "#5A5A5A", border: "1px solid #D1D1D6" }}>
            {c.label}
          </button>
        ))}
      </div>

      {/* Toggle filters */}
      <div className="flex gap-2 px-5 pb-3">
        <button onClick={() => setMedicaidOnly(!medicaidOnly)}
          className="px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{ background: medicaidOnly ? "#22C55E" : "#FFF", color: medicaidOnly ? "#FFF" : "#5A5A5A", border: "1px solid #D1D1D6" }}>
          ✓ Medicaid OK
        </button>
        <button onClick={() => setUninsuredOnly(!uninsuredOnly)}
          className="px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{ background: uninsuredOnly ? "#4A90E2" : "#FFF", color: uninsuredOnly ? "#FFF" : "#5A5A5A", border: "1px solid #D1D1D6" }}>
          ✓ Uninsured OK
        </button>
      </div>

      <div className="px-5 space-y-3">
        {isLoading && <div className="py-16 text-center"><Loader2 className="w-7 h-7 mx-auto animate-spin opacity-30" /></div>}

        {!isLoading && filtered.length === 0 && (
          <div className="py-16 text-center rounded-2xl" style={{ background: "#FFF", border: "1px solid #E5E7EB" }}>
            <Home className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm font-medium" style={{ color: "#1E1E1E" }}>No housing resources found.</p>
            <p className="text-xs mt-1" style={{ color: "#8E8E93" }}>Try clearing your filters or call 211.</p>
          </div>
        )}

        {filtered.map(r => (
          <div key={r.id} className="rounded-2xl p-4" style={{ background: "#FFF", border: "1px solid #E5E7EB" }}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-base" style={{ color: "#1E1E1E" }}>{r.organization_name}</p>
                {r.program_name && <p className="text-sm mt-0.5" style={{ color: "#4A90E2" }}>{r.program_name}</p>}
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#F0F0F3", color: "#5A5A5A" }}>{r.resource_category}</span>
                  {r.accepts_medicaid && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#F0FDF4", color: "#16A34A" }}>Medicaid</span>}
                  {r.accepts_uninsured && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#EFF6FF", color: "#1D4ED8" }}>Uninsured OK</span>}
                  {r.intake_method && (
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${INTAKE_COLORS[r.intake_method] || "#8B5CF6"}15`, color: INTAKE_COLORS[r.intake_method] || "#8B5CF6" }}>
                      {r.intake_method}
                    </span>
                  )}
                </div>
                {r.city && <p className="text-xs mt-2 flex items-center gap-1" style={{ color: "#8E8E93" }}><MapPin className="w-3 h-3" />{r.street_address ? `${r.street_address}, ` : ""}{r.city}, {r.state}</p>}
                {r.description && <p className="text-xs mt-2 line-clamp-2" style={{ color: "#5A5A5A" }}>{r.description}</p>}
              </div>
              <button onClick={() => saveMutation.mutate(r)} className="flex-shrink-0 mt-0.5">
                {savedIds.has(r.id)
                  ? <BookmarkCheck className="w-5 h-5" style={{ color: "#4A90E2" }} />
                  : <Bookmark className="w-5 h-5" style={{ color: "#C7C7CC" }} />}
              </button>
            </div>
            <div className="flex gap-2 mt-3 pt-3 flex-wrap" style={{ borderTop: "1px solid #F0F0F3" }}>
              {r.phone && (
                <a href={`tel:${r.phone}`} className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl font-semibold" style={{ background: "#F0FDF4", color: "#16A34A" }}>
                  <Phone className="w-3.5 h-3.5" /> Call
                </a>
              )}
              {r.website && (
                <a href={r.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl font-semibold" style={{ background: "#EBF5FF", color: "#4A90E2" }}>
                  <Globe className="w-3.5 h-3.5" /> Website
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}