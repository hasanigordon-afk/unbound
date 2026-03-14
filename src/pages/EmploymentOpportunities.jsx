import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Briefcase, MapPin, Bookmark, BookmarkCheck, ExternalLink, Filter, Star, Loader2, Search } from "lucide-react";

const JOB_TYPE_LABELS = { full_time: "Full Time", part_time: "Part Time", temporary: "Temp", apprenticeship: "Apprenticeship", contract: "Contract" };

export default function EmploymentOpportunities() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [secondChanceOnly, setSecondChanceOnly] = useState(false);

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ["employment-listings"],
    queryFn: () => base44.entities.EmploymentListing.filter({ is_active: true }),
  });

  const { data: savedJobs = [] } = useQuery({
    queryKey: ["saved-jobs", user?.email],
    queryFn: () => base44.entities.SavedResource.filter({ created_by: user.email, resource_category: "Employment Assistance" }),
    enabled: !!user,
  });

  const savedIds = useMemo(() => new Set(savedJobs.map(s => s.resource_id)), [savedJobs]);

  const saveMutation = useMutation({
    mutationFn: async (job) => {
      const existing = savedJobs.find(s => s.resource_id === job.id);
      if (existing) await base44.entities.SavedResource.delete(existing.id);
      else await base44.entities.SavedResource.create({ resource_id: job.id, resource_name: `${job.job_title} at ${job.employer_name}`, resource_category: "Employment Assistance" });
    },
    onSuccess: () => queryClient.invalidateQueries(["saved-jobs"]),
  });

  const filtered = useMemo(() => {
    return listings.filter(j => {
      const q = search.toLowerCase();
      const matchSearch = !search || j.job_title?.toLowerCase().includes(q) || j.employer_name?.toLowerCase().includes(q) || j.location_city?.toLowerCase().includes(q);
      const matchType = filterType === "all" || j.job_type === filterType;
      const matchSC = !secondChanceOnly || j.second_chance_employer;
      return matchSearch && matchType && matchSC;
    });
  }, [listings, search, filterType, secondChanceOnly]);

  const secondChanceCount = listings.filter(j => j.second_chance_employer).length;

  return (
    <div className="min-h-screen pb-28" style={{ background: "#F7F7F8" }}>
      <div className="px-5 pt-8 pb-5" style={{ background: "#FFF", borderBottom: "1px solid #D1D1D6" }}>
        <h1 className="text-xl font-bold" style={{ color: "#1E1E1E" }}>Employment Opportunities</h1>
        <p className="text-sm mt-0.5" style={{ color: "#8E8E93" }}>Jobs that welcome second chances</p>

        {/* Search */}
        <div className="mt-4 flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: "#F7F7F8", border: "1px solid #D1D1D6" }}>
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: "#8E8E93" }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search jobs, employers, cities…"
            className="flex-1 text-sm bg-transparent outline-none" style={{ color: "#1E1E1E" }} />
        </div>
      </div>

      {/* Stats strip */}
      <div className="flex gap-3 px-5 py-3 overflow-x-auto" style={{ borderBottom: "1px solid #E5E7EB", background: "#FFF" }}>
        <div className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: "#EBF5FF", color: "#4A90E2" }}>
          {listings.length} Total Jobs
        </div>
        <div className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: "#F0FDF4", color: "#16A34A" }}>
          ⭐ {secondChanceCount} Second Chance
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 px-5 py-3 overflow-x-auto">
        {["all", "full_time", "part_time", "temporary", "apprenticeship"].map(t => (
          <button key={t} onClick={() => setFilterType(t)}
            className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0"
            style={{ background: filterType === t ? "#1E1E1E" : "#FFF", color: filterType === t ? "#FFF" : "#5A5A5A", border: "1px solid #D1D1D6" }}>
            {t === "all" ? "All Types" : JOB_TYPE_LABELS[t]}
          </button>
        ))}
        <button onClick={() => setSecondChanceOnly(!secondChanceOnly)}
          className="px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 whitespace-nowrap flex-shrink-0"
          style={{ background: secondChanceOnly ? "#F59E0B" : "#FFF", color: secondChanceOnly ? "#FFF" : "#5A5A5A", border: "1px solid #D1D1D6" }}>
          <Star className="w-3 h-3" /> Second Chance Only
        </button>
      </div>

      <div className="px-5 space-y-3">
        {isLoading && <div className="py-16 text-center"><Loader2 className="w-7 h-7 mx-auto animate-spin opacity-30" /></div>}

        {!isLoading && filtered.length === 0 && (
          <div className="py-16 text-center rounded-2xl" style={{ background: "#FFF", border: "1px solid #E5E7EB" }}>
            <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm font-medium" style={{ color: "#1E1E1E" }}>No listings found.</p>
            <p className="text-xs mt-1" style={{ color: "#8E8E93" }}>Try clearing filters or check back soon.</p>
          </div>
        )}

        {filtered.map(job => (
          <div key={job.id} className="rounded-2xl p-4" style={{ background: "#FFF", border: "1px solid #E5E7EB" }}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <p className="font-bold text-base" style={{ color: "#1E1E1E" }}>{job.job_title}</p>
                  {job.second_chance_employer && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#FEF3C7", color: "#D97706" }}>
                      ⭐ SECOND CHANCE
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium mb-1" style={{ color: "#4A90E2" }}>{job.employer_name}</p>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="flex items-center gap-1 text-xs" style={{ color: "#8E8E93" }}>
                    <MapPin className="w-3 h-3" />{job.location_city}, {job.location_state}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#F0F0F3", color: "#5A5A5A" }}>
                    {JOB_TYPE_LABELS[job.job_type] || job.job_type}
                  </span>
                  {job.pay_range_min && (
                    <span className="text-xs font-semibold" style={{ color: "#22C55E" }}>
                      ${job.pay_range_min}{job.pay_range_max ? `–$${job.pay_range_max}` : "+"}/hr
                    </span>
                  )}
                </div>
                {job.description && <p className="text-xs mt-2 line-clamp-2" style={{ color: "#5A5A5A" }}>{job.description}</p>}
                {job.benefits?.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap mt-2">
                    {job.benefits.map(b => <span key={b} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "#F0FDF4", color: "#16A34A" }}>{b}</span>)}
                  </div>
                )}
              </div>
              <button onClick={() => saveMutation.mutate(job)} className="flex-shrink-0 mt-0.5">
                {savedIds.has(job.id)
                  ? <BookmarkCheck className="w-5 h-5" style={{ color: "#4A90E2" }} />
                  : <Bookmark className="w-5 h-5" style={{ color: "#C7C7CC" }} />}
              </button>
            </div>
            {job.apply_url && (
              <a href={job.apply_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 mt-3 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: "#4A90E2", color: "#FFF" }}>
                <ExternalLink className="w-4 h-4" /> Quick Apply
              </a>
            )}
          </div>
        ))}
      </div>

      {/* Resume tips card */}
      <div className="mx-5 mt-5 p-5 rounded-2xl" style={{ background: "#EBF5FF", border: "1px solid #BFDBFE" }}>
        <p className="font-bold text-sm mb-2" style={{ color: "#1E40AF" }}>💡 Resume Building Tips</p>
        <ul className="text-xs space-y-1.5" style={{ color: "#1D4ED8" }}>
          {["Focus on skills, not gaps in work history.", "Be honest about your background — many employers value honesty.", "Highlight volunteer work, recovery programs, and community involvement.", "Contact your counselor for referral letters."].map(tip => (
            <li key={tip} className="flex items-start gap-2"><span className="mt-0.5">→</span>{tip}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}