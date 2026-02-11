import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MapPin, Search, Loader2, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AnimatePresence } from "framer-motion";
import ResourceCard from "../components/resources/ResourceCard";
import ResourceDetail from "../components/resources/ResourceDetail";
import { toast } from "sonner";

const CATEGORIES = [
  "all",
  "detox",
  "inpatient",
  "outpatient_iop",
  "sober_living",
  "shelters",
  "food_pantries",
  "harm_reduction",
  "free_clinics",
  "meetings_alcohol",
  "meetings_substances",
];

export default function Resources() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [trackFilter, setTrackFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    open_now: false,
    free_or_medicaid: false,
    walk_in: false,
    same_day_intake: false,
    men: false,
    women: false,
    family: false,
  });
  const [selectedResource, setSelectedResource] = useState(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: () => base44.auth.me(),
  });

  const { data: profile } = useQuery({
    queryKey: ["my-profile"],
    queryFn: async () => {
      const u = await base44.auth.me();
      const profiles = await base44.entities.MemberProfile.filter({ created_by: u.email });
      return profiles[0];
    },
  });

  const { data: resources = [], isLoading } = useQuery({
    queryKey: ["resources", profile?.location_city],
    queryFn: () => {
      if (profile?.location_city) {
        return base44.entities.Resource.filter({ city: profile.location_city });
      }
      return base44.entities.Resource.list();
    },
  });

  const saveMutation = useMutation({
    mutationFn: (resourceId) =>
      base44.entities.SavedResource.create({ resource_id: resourceId }),
    onSuccess: () => {
      toast.success("Resource saved");
      queryClient.invalidateQueries(["saved-resources"]);
    },
  });

  const reportMutation = useMutation({
    mutationFn: (resourceId) =>
      base44.entities.ResourceReport.create({
        resource_id: resourceId,
        reason: "Inaccurate information",
      }),
    onSuccess: () => {
      toast.success("Report submitted");
      setSelectedResource(null);
    },
  });

  const isOpenNow = (resource) => {
    if (!resource.hours || typeof resource.hours !== 'object') return false;
    const now = new Date();
    const day = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
    const hours = resource.hours[day];
    if (!hours || hours === 'closed') return false;
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [open, close] = hours.split('-').map(t => {
      const [h, m] = t.trim().replace(/am|pm/i, '').split(':').map(Number);
      const isPM = /pm/i.test(t);
      return (isPM && h !== 12 ? h + 12 : h) * 60 + (m || 0);
    });
    return currentTime >= open && currentTime <= close;
  };

  const filteredResources = resources.filter(r => {
    const matchesSearch = r.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.category?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || r.category === categoryFilter;
    const matchesTrack = trackFilter === "all" || r.track === trackFilter || r.track === "both";
    
    if (filters.open_now && !isOpenNow(r)) return false;
    if (filters.free_or_medicaid && !r.tags?.includes("free_or_medicaid")) return false;
    if (filters.walk_in && !r.tags?.includes("walk_in")) return false;
    if (filters.same_day_intake && !r.tags?.includes("same_day_intake")) return false;
    if (filters.men && !r.tags?.includes("men")) return false;
    if (filters.women && !r.tags?.includes("women")) return false;
    if (filters.family && !r.tags?.includes("family")) return false;
    
    return matchesSearch && matchesCategory && matchesTrack;
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="px-5 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Resources</h1>
        <p className="text-slate-500 text-sm mb-6">Find local support services</p>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search resources..."
            className="pl-10 h-12 rounded-xl bg-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                categoryFilter === cat
                  ? "bg-teal-600 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
              }`}
            >
              {cat === "all" ? "All" : cat.replace(/_/g, " ")}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? "bg-teal-50 border-teal-200" : ""}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          
          <div className="flex gap-2 overflow-x-auto pb-1">
            {["all", "alcohol", "substances"].map(track => (
              <button
                key={track}
                onClick={() => setTrackFilter(track)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                  trackFilter === track
                    ? "bg-purple-100 text-purple-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {track === "all" ? "All Tracks" : track}
              </button>
            ))}
          </div>
        </div>

        {showFilters && (
          <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.open_now}
                  onChange={(e) => setFilters({...filters, open_now: e.target.checked})}
                  className="rounded border-slate-300"
                />
                Open Now
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.free_or_medicaid}
                  onChange={(e) => setFilters({...filters, free_or_medicaid: e.target.checked})}
                  className="rounded border-slate-300"
                />
                Free/Medicaid
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.walk_in}
                  onChange={(e) => setFilters({...filters, walk_in: e.target.checked})}
                  className="rounded border-slate-300"
                />
                Walk-In
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.same_day_intake}
                  onChange={(e) => setFilters({...filters, same_day_intake: e.target.checked})}
                  className="rounded border-slate-300"
                />
                Same Day
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.men}
                  onChange={(e) => setFilters({...filters, men: e.target.checked})}
                  className="rounded border-slate-300"
                />
                Men
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.women}
                  onChange={(e) => setFilters({...filters, women: e.target.checked})}
                  className="rounded border-slate-300"
                />
                Women
              </label>
              <label className="flex items-center gap-2 text-sm col-span-2">
                <input
                  type="checkbox"
                  checked={filters.family}
                  onChange={(e) => setFilters({...filters, family: e.target.checked})}
                  className="rounded border-slate-300"
                />
                Family Friendly
              </label>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
          </div>
        ) : (
          <div className="space-y-4">
            {filteredResources.map(resource => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                onSave={(r) => saveMutation.mutate(r.id)}
                onReport={(r) => reportMutation.mutate(r.id)}
                onViewDetails={setSelectedResource}
              />
            ))}
            {filteredResources.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-400">No resources found</p>
              </div>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedResource && (
          <ResourceDetail
            resource={selectedResource}
            onClose={() => setSelectedResource(null)}
            onSave={(r) => saveMutation.mutate(r.id)}
            onReport={(r) => reportMutation.mutate(r.id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}