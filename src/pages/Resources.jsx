import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MapPin, Search, Loader2, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AnimatePresence } from "framer-motion";
import ResourceCard from "../components/resources/ResourceCard";
import ResourceDetail from "../components/resources/ResourceDetail";
import PersonalizedFeed from "../components/resources/PersonalizedFeed";
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

  const { data: progressData = [] } = useQuery({
    queryKey: ["user-progress", user?.email],
    queryFn: () => base44.entities.UserProgress.filter({ created_by: user.email }),
    enabled: !!user,
  });

  const saveMutation = useMutation({
    mutationFn: async (resourceId) => {
      await base44.entities.SavedResource.create({ resource_id: resourceId });
      
      const progress = progressData[0];
      const points = 5;
      const newResourcesSaved = (progress?.resources_saved || 0) + 1;
      const newTotalPoints = (progress?.total_points || 0) + points;
      const newLevel = Math.floor(newTotalPoints / 100) + 1;

      const updateData = {
        total_points: newTotalPoints,
        level: newLevel,
        resources_saved: newResourcesSaved,
      };

      if (progress?.id) {
        await base44.entities.UserProgress.update(progress.id, updateData);
      } else {
        await base44.entities.UserProgress.create({ 
          ...updateData, 
          current_streak: 0, 
          longest_streak: 0, 
          total_checkins: 0,
          resources_viewed: 0,
          journal_entries: 0
        });
      }

      return points;
    },
    onSuccess: (points) => {
      toast.success(`Resource saved! +${points} XP`);
      queryClient.invalidateQueries(["saved-resources"]);
      queryClient.invalidateQueries(["user-progress"]);
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
    <div className="min-h-screen pb-24" style={{ background: 'var(--bg-primary)' }}>
      <div className="px-5 pt-8 pb-4">
        <h1 style={{ color: 'var(--text-primary)', marginBottom: '4px' }}>Resources</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-section)' }}>Local support services and contacts</p>

        {profile && (
          <div style={{ marginBottom: 'var(--spacing-section)' }}>
            <PersonalizedFeed profile={profile} />
          </div>
        )}

        <div className="h-px" style={{ background: 'var(--border)', marginBottom: 'var(--spacing-section)' }} />

        <div className="relative" style={{ marginBottom: '16px' }}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} strokeWidth={2} />
          <Input
            placeholder="Search resources..."
            className="pl-10 h-12"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: 'var(--radius)' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2" style={{ marginBottom: '16px' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className="px-4 py-2 text-sm font-medium whitespace-nowrap"
              style={{
                background: categoryFilter === cat ? 'var(--primary)' : 'transparent',
                color: categoryFilter === cat ? 'var(--bg-primary)' : 'var(--text-secondary)',
                border: `1px solid ${categoryFilter === cat ? 'var(--primary)' : 'var(--border)'}`,
                borderRadius: 'var(--radius)'
              }}
            >
              {cat === "all" ? "All Categories" : cat.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2" style={{ marginBottom: '16px' }}>
          <Button
            className="btn-secondary"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" strokeWidth={2} />
            Filters
          </Button>
          
          <div className="flex gap-2 overflow-x-auto pb-1">
            {["all", "alcohol", "substances"].map(track => (
              <button
                key={track}
                onClick={() => setTrackFilter(track)}
                className="px-3 py-1 text-xs font-medium whitespace-nowrap"
                style={{
                  background: trackFilter === track ? 'rgba(123,92,255,0.2)' : 'transparent',
                  color: trackFilter === track ? 'var(--secondary)' : 'var(--text-secondary)',
                  border: `1px solid ${trackFilter === track ? 'var(--secondary)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius)'
                }}
              >
                {track === "all" ? "All" : track.charAt(0).toUpperCase() + track.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {showFilters && (
          <div className="card" style={{ marginBottom: '16px' }}>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-primary)' }}>
                <input
                  type="checkbox"
                  checked={filters.open_now}
                  onChange={(e) => setFilters({...filters, open_now: e.target.checked})}
                  className="rounded"
                  style={{ borderColor: 'var(--border)' }}
                />
                Open Now
              </label>
              <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-primary)' }}>
                <input type="checkbox" checked={filters.free_or_medicaid} onChange={(e) => setFilters({...filters, free_or_medicaid: e.target.checked})} className="rounded" style={{ borderColor: 'var(--border)' }} />
                Free/Medicaid
              </label>
              <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-primary)' }}>
                <input type="checkbox" checked={filters.walk_in} onChange={(e) => setFilters({...filters, walk_in: e.target.checked})} className="rounded" style={{ borderColor: 'var(--border)' }} />
                Walk-In
              </label>
              <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-primary)' }}>
                <input type="checkbox" checked={filters.same_day_intake} onChange={(e) => setFilters({...filters, same_day_intake: e.target.checked})} className="rounded" style={{ borderColor: 'var(--border)' }} />
                Same-Day Intake
              </label>
              <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-primary)' }}>
                <input type="checkbox" checked={filters.men} onChange={(e) => setFilters({...filters, men: e.target.checked})} className="rounded" style={{ borderColor: 'var(--border)' }} />
                Men
              </label>
              <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-primary)' }}>
                <input type="checkbox" checked={filters.women} onChange={(e) => setFilters({...filters, women: e.target.checked})} className="rounded" style={{ borderColor: 'var(--border)' }} />
                Women
              </label>
              <label className="flex items-center gap-2 text-sm col-span-2" style={{ color: 'var(--text-primary)' }}>
                <input type="checkbox" checked={filters.family} onChange={(e) => setFilters({...filters, family: e.target.checked})} className="rounded" style={{ borderColor: 'var(--border)' }} />
                Family-Friendly
              </label>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6" style={{ color: 'var(--primary)' }} />
          </div>
        ) : (
          <div className="space-y-3">
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
                <p style={{ color: 'var(--text-muted)' }}>No resources found</p>
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