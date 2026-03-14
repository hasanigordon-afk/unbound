import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, SlidersHorizontal, X, Home, MapPin, Loader2, Settings } from "lucide-react";
import HousingCard from "@/components/housing/HousingCard";
import HousingDetail from "@/components/housing/HousingDetail";
import HousingAdminPanel from "@/components/housing/HousingAdminPanel";

const COUNTIES = ["Atlantic","Bergen","Burlington","Camden","Cape May","Cumberland","Essex","Gloucester","Hudson","Hunterdon","Mercer","Middlesex","Monmouth","Morris","Ocean","Passaic","Salem","Somerset","Sussex","Union","Warren"];

const QUICK_FILTERS = [
  { key: "all",        label: "All",           test: () => true },
  { key: "sober",      label: "Sober Living",  test: (r) => r.housing_type === "sober_living" },
  { key: "shelter",    label: "Shelters",      test: (r) => r.housing_type === "emergency_shelter" },
  { key: "transitional",label:"Transitional",  test: (r) => r.housing_type === "transitional_housing" },
  { key: "reentry",    label: "Reentry OK",    test: (r) => r.reentry_friendly },
  { key: "men",        label: "Men",           test: (r) => r.gender_served === "men" || r.gender_served === "coed" },
  { key: "women",      label: "Women",         test: (r) => r.gender_served === "women" || r.gender_served === "coed" },
  { key: "families",   label: "Families",      test: (r) => r.family_friendly || r.gender_served === "families" },
  { key: "medicaid",   label: "Medicaid",      test: (r) => r.medicaid_support },
  { key: "free",       label: "Low Cost/Free", test: (r) => r.estimated_cost && (r.estimated_cost.toLowerCase().includes("free") || r.estimated_cost.includes("0")) },
  { key: "open",       label: "Open Now",      test: (r) => r.waitlist_status === "open" },
];

export default function NJHousingSearch() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedCounty, setSelectedCounty] = useState("");
  const [quickFilter, setQuickFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [savedIds, setSavedIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem("nj_housing_saved") || "[]"); } catch { return []; }
  });

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });
  const isAdmin = user?.role === "admin";

  const { data: resources = [], isLoading } = useQuery({
    queryKey: ["nj-housing"],
    queryFn: () => base44.entities.HousingResourceNJ.filter({ active_status: "active" }, "resource_name", 200),
    staleTime: 60_000,
  });

  const toggleSave = (id) => {
    setSavedIds((prev) => {
      const updated = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem("nj_housing_saved", JSON.stringify(updated));
      return updated;
    });
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const filterFn = QUICK_FILTERS.find((f) => f.key === quickFilter)?.test || (() => true);
    return resources.filter((r) => {
      const matchSearch = !q || [r.resource_name, r.city, r.zip, r.county, r.address, r.description]
        .some((v) => v && v.toLowerCase().includes(q));
      const matchCounty = !selectedCounty || r.county === selectedCounty;
      return matchSearch && matchCounty && filterFn(r);
    });
  }, [resources, search, selectedCounty, quickFilter]);

  if (selected) {
    const resource = resources.find((r) => r.id === selected);
    if (resource) return (
      <HousingDetail
        resource={resource}
        onBack={() => setSelected(null)}
        isSaved={savedIds.includes(resource.id)}
        onToggleSave={() => toggleSave(resource.id)}
      />
    );
  }

  if (showAdmin && isAdmin) {
    return (
      <div style={{ background: "#F0F2F5", minHeight: "100vh", padding: "60px 16px 40px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <HousingAdminPanel resources={resources} onClose={() => setShowAdmin(false)} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#F0F2F5", minHeight: "100vh", paddingBottom: 80 }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(155deg,#0E1D3A,#081426)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 260, height: 260, borderRadius: "50%",
          background: "radial-gradient(circle,rgba(62,207,191,0.1) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div style={{ padding: "52px 20px 20px", position: "relative", zIndex: 1, maxWidth: 640, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(62,207,191,0.8)", textTransform: "uppercase",
                letterSpacing: ".1em", marginBottom: 4 }}>New Jersey</p>
              <h1 style={{ fontSize: 24, fontWeight: 900, color: "#fff", lineHeight: 1.2, marginBottom: 4 }}>
                Housing Resources
              </h1>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 16 }}>
                {resources.length} programs · Sober living, shelters & transitional housing
              </p>
            </div>
            {isAdmin && (
              <button onClick={() => setShowAdmin(true)} style={{ padding: "8px 12px", background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, color: "rgba(255,255,255,0.6)",
                cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700 }}>
                <Settings style={{ width: 13, height: 13 }} /> Admin
              </button>
            )}
          </div>

          {/* Search */}
          <div style={{ position: "relative", marginBottom: 12 }}>
            <Search style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
              width: 16, height: 16, color: "rgba(255,255,255,0.4)" }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by city, zip, county, or name…"
              style={{ width: "100%", padding: "13px 14px 13px 42px",
                background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 12, color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
            {search && (
              <button onClick={() => setSearch("")} style={{ position: "absolute", right: 12, top: "50%",
                transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer",
                color: "rgba(255,255,255,0.4)", padding: 4 }}>
                <X style={{ width: 14, height: 14 }} />
              </button>
            )}
          </div>

          {/* County filter */}
          <select value={selectedCounty} onChange={(e) => setSelectedCounty(e.target.value)}
            style={{ width: "100%", padding: "11px 14px", background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, color: selectedCounty ? "#fff" : "rgba(255,255,255,0.4)",
              fontSize: 13, outline: "none", marginBottom: 16 }}>
            <option value="">All Counties</option>
            {COUNTIES.map((c) => <option key={c} value={c}>{c} County</option>)}
          </select>
        </div>

        {/* Quick filters */}
        <div style={{ display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none",
          padding: "0 20px 16px", maxWidth: 640, margin: "0 auto" }}>
          {QUICK_FILTERS.map((f) => (
            <button key={f.key} onClick={() => setQuickFilter(f.key)} style={{
              padding: "7px 14px", borderRadius: 20, border: "none", cursor: "pointer", whiteSpace: "nowrap",
              background: quickFilter === f.key ? "#3ECFBF" : "rgba(255,255,255,0.08)",
              color: quickFilter === f.key ? "#fff" : "rgba(255,255,255,0.5)",
              fontWeight: 700, fontSize: 12, flexShrink: 0,
              boxShadow: quickFilter === f.key ? "0 4px 14px rgba(62,207,191,0.3)" : "none",
            }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div style={{ padding: "16px", maxWidth: 640, margin: "0 auto" }}>
        {/* Summary bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#5A5A5A" }}>
            {isLoading ? "Loading…" : `${filtered.length} result${filtered.length !== 1 ? "s" : ""}`}
            {selectedCounty && ` in ${selectedCounty} County`}
          </p>
          {savedIds.length > 0 && (
            <button onClick={() => setQuickFilter(quickFilter === "saved" ? "all" : "saved")} style={{
              fontSize: 12, fontWeight: 700, color: "#EF4444", background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)", padding: "5px 12px", borderRadius: 20, cursor: "pointer",
            }}>
              ❤️ {savedIds.length} saved
            </button>
          )}
        </div>

        {isLoading ? (
          <div style={{ textAlign: "center", paddingTop: 60 }}>
            <Loader2 style={{ width: 30, height: 30, color: "#3ECFBF", margin: "0 auto 12px", display: "block" }} className="animate-spin" />
            <p style={{ fontSize: 13, color: "#8E8E93" }}>Loading housing resources…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px 20px", background: "#fff", borderRadius: 20, border: "1px solid #E5E7EB" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🏠</div>
            <p style={{ fontSize: 16, fontWeight: 700, color: "#1E1E1E", marginBottom: 6 }}>No results found</p>
            <p style={{ fontSize: 13, color: "#8E8E93" }}>Try adjusting your search or filters.</p>
            {(search || selectedCounty || quickFilter !== "all") && (
              <button onClick={() => { setSearch(""); setSelectedCounty(""); setQuickFilter("all"); }}
                style={{ marginTop: 14, padding: "10px 20px", background: "#1E1E1E", border: "none",
                  borderRadius: 10, color: "#fff", fontWeight: 700, cursor: "pointer" }}>
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Saved section first if any */}
            {savedIds.some((id) => filtered.find((r) => r.id === id)) && quickFilter !== "all" ? null : (
              <>
                {savedIds.length > 0 && (
                  <div style={{ marginBottom: 6 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "#8E8E93", textTransform: "uppercase",
                      letterSpacing: ".07em", marginBottom: 8 }}>❤️ Saved</p>
                    {filtered.filter((r) => savedIds.includes(r.id)).map((r) => (
                      <HousingCard key={r.id} resource={r} onClick={() => setSelected(r.id)} isSaved />
                    ))}
                    <p style={{ fontSize: 11, fontWeight: 700, color: "#8E8E93", textTransform: "uppercase",
                      letterSpacing: ".07em", marginBottom: 8, marginTop: 16 }}>All Results</p>
                  </div>
                )}
                {filtered.filter((r) => !savedIds.includes(r.id)).map((r) => (
                  <HousingCard key={r.id} resource={r} onClick={() => setSelected(r.id)} isSaved={false} />
                ))}
              </>
            )}
            {quickFilter !== "all" && filtered.map((r) => (
              <HousingCard key={r.id} resource={r} onClick={() => setSelected(r.id)} isSaved={savedIds.includes(r.id)} />
            ))}
          </>
        )}

        {/* Crisis info */}
        <div style={{ marginTop: 20, background: "#fff", borderRadius: 16, border: "1px solid #E5E7EB", padding: "16px 18px" }}>
          <p style={{ fontSize: 13, fontWeight: 800, color: "#1E1E1E", marginBottom: 8 }}>🚨 Need Immediate Shelter?</p>
          <div style={{ display: "flex", gap: 10 }}>
            <a href="tel:211" style={{ flex: 1, textDecoration: "none" }}>
              <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 10, padding: "10px", textAlign: "center" }}>
                <p style={{ fontSize: 16, fontWeight: 900, color: "#EF4444" }}>Call 211</p>
                <p style={{ fontSize: 11, color: "#DC2626" }}>NJ Crisis Hotline</p>
              </div>
            </a>
            <a href="tel:18003316347" style={{ flex: 1, textDecoration: "none" }}>
              <div style={{ background: "#EBF3FD", border: "1px solid #BFDBFE", borderRadius: 10, padding: "10px", textAlign: "center" }}>
                <p style={{ fontSize: 14, fontWeight: 900, color: "#2563EB" }}>NJ HMIS</p>
                <p style={{ fontSize: 11, color: "#1D4ED8" }}>Coordinated Entry</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}