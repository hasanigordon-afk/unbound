import React, { useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, Search, Loader2, MapPin } from "lucide-react";
import FindHelpCard from "@/components/resources/FindHelpCard";

export default function SavedResources() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: savedResources = [], isLoading: savedLoading } = useQuery({
    queryKey: ["saved-resources", user?.email],
    queryFn: () => base44.entities.SavedResource.filter({ created_by: user.email }, "-created_date"),
    enabled: !!user,
  });

  const { data: allResources = [], isLoading: resourcesLoading } = useQuery({
    queryKey: ["us-recovery-resources"],
    queryFn: () => base44.entities.USRecoveryResource.list(),
  });

  const savedIds = useMemo(() => new Set(savedResources.map((s) => s.resource_id)), [savedResources]);

  // Hydrate saved entries with full resource records, in saved-order
  const fullSavedResources = useMemo(() => {
    const byId = new Map(allResources.map((r) => [r.id, r]));
    return savedResources
      .map((s) => byId.get(s.resource_id))
      .filter(Boolean);
  }, [savedResources, allResources]);

  const categories = useMemo(
    () => [...new Set(fullSavedResources.map((r) => r.resource_category).filter(Boolean))],
    [fullSavedResources]
  );

  const filtered = useMemo(() => {
    return fullSavedResources.filter((r) => {
      if (categoryFilter && r.resource_category !== categoryFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const haystack = `${r.organization_name || ""} ${r.program_name || ""} ${r.city || ""} ${r.resource_category || ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [fullSavedResources, search, categoryFilter]);

  const removeMutation = useMutation({
    mutationFn: async (resource) => {
      const existing = savedResources.find((s) => s.resource_id === resource.id);
      if (existing) await base44.entities.SavedResource.delete(existing.id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["saved-resources"] }),
  });

  const isLoading = savedLoading || resourcesLoading;

  return (
    <div className="min-h-screen pb-24" style={{ background: "#F7F7F8" }}>
      {/* Header */}
      <div className="px-5 pt-6 pb-4" style={{ background: "#FFFFFF", borderBottom: "1px solid #D1D1D6" }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: "transparent", border: "none", padding: 0, cursor: "pointer",
            display: "inline-flex", alignItems: "center", gap: 6,
            color: "#5A5A5A", fontSize: 13, fontWeight: 600, marginBottom: 10,
          }}
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-2 mb-1">
          <Star className="w-5 h-5" style={{ color: "#C8932F" }} fill="#C8932F" strokeWidth={2} />
          <h1 className="text-xl font-semibold" style={{ color: "#1E1E1E" }}>My Saved Resources</h1>
        </div>
        <p className="text-xs" style={{ color: "#8E8E93" }}>
          {savedResources.length} {savedResources.length === 1 ? "resource" : "resources"} saved for quick access
        </p>
      </div>

      {/* Search + category filters (only when there's something saved) */}
      {fullSavedResources.length > 0 && (
        <>
          <div className="px-5 pt-3">
            <div style={{
              background: "#FFFFFF", border: "1px solid #D1D1D6", borderRadius: 10,
              padding: "8px 12px", display: "flex", alignItems: "center", gap: 8,
            }}>
              <Search className="w-4 h-4" style={{ color: "#8E8E93" }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search saved…"
                style={{
                  flex: 1, border: "none", outline: "none", background: "transparent",
                  fontSize: 13, color: "#1E1E1E", padding: 0,
                }}
              />
            </div>
          </div>

          {categories.length > 1 && (
            <div className="px-5 pt-2 flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
              <button
                onClick={() => setCategoryFilter("")}
                className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0"
                style={{
                  background: !categoryFilter ? "#4A90E2" : "#F0F0F3",
                  color: !categoryFilter ? "#FFF" : "#5A5A5A",
                  border: !categoryFilter ? "1px solid #4A90E2" : "1px solid #D1D1D6",
                }}
              >
                All
              </button>
              {categories.map((c) => {
                const active = categoryFilter === c;
                return (
                  <button
                    key={c}
                    onClick={() => setCategoryFilter(active ? "" : c)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0"
                    style={{
                      background: active ? "#4A90E2" : "#F0F0F3",
                      color: active ? "#FFF" : "#5A5A5A",
                      border: active ? "1px solid #4A90E2" : "1px solid #D1D1D6",
                    }}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* List */}
      <div className="px-5 pt-3 flex flex-col gap-3">
        {isLoading ? (
          <div className="text-center py-16" style={{ color: "#8E8E93" }}>
            <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin opacity-40" />
            <p className="text-sm">Loading your saved resources…</p>
          </div>
        ) : fullSavedResources.length === 0 ? (
          <div className="text-center py-16 px-6" style={{ color: "#8E8E93" }}>
            <Star className="w-10 h-10 mx-auto mb-3 opacity-30" strokeWidth={1.5} />
            <p className="text-sm font-semibold" style={{ color: "#1E1E1E" }}>No saved resources yet</p>
            <p className="text-xs mt-1.5 leading-relaxed">
              Tap the ⭐ on any resource in the Support Map to save it here for quick access.
            </p>
            <Link
              to="/FindHelpNow"
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                marginTop: 16, padding: "10px 18px", borderRadius: 999,
                background: "#4A90E2", color: "#FFF", fontSize: 13, fontWeight: 700,
                textDecoration: "none",
              }}
            >
              <MapPin className="w-3.5 h-3.5" /> Open Support Map
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16" style={{ color: "#8E8E93" }}>
            <Search className="w-10 h-10 mx-auto mb-3 opacity-30" strokeWidth={1} />
            <p className="text-sm font-medium">No matches in your saved resources.</p>
            <p className="text-xs mt-1">Try clearing the filters.</p>
          </div>
        ) : (
          filtered.map((resource) => (
            <FindHelpCard
              key={resource.id}
              resource={resource}
              distance={null}
              isSaved={savedIds.has(resource.id)}
              onSave={(r) => removeMutation.mutate(r)}
            />
          ))
        )}
      </div>
    </div>
  );
}