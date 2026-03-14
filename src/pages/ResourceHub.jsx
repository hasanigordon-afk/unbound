import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, X, Loader2, BookOpen, Star, TrendingUp } from "lucide-react";
import ArticleCard from "@/components/content/ArticleCard";
import ArticleDetail from "@/components/content/ArticleDetail";
import ShareSheet from "@/components/content/ShareSheet";

const CATEGORIES = ["All", "Recovery", "Relapse Prevention", "Reentry", "Employment", "Housing", "Mental Health", "Motivation", "Legal & Probation", "Life Skills", "Community Support"];

export default function ResourceHub() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [sharing, setSharing] = useState(null);

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ["articles"],
    queryFn: () => base44.entities.Article.filter({ approved: true }, "-publish_date", 50),
  });

  const { data: savedItems = [] } = useQuery({
    queryKey: ["saved-articles", user?.email],
    queryFn: () => base44.entities.SavedResource.filter({ created_by: user.email, resource_category: "Recovery" }),
    enabled: !!user,
  });

  const savedIds = useMemo(() => new Set(savedItems.map(s => s.resource_id)), [savedItems]);

  const saveMutation = useMutation({
    mutationFn: async (article) => {
      const existing = savedItems.find(s => s.resource_id === article.id);
      if (existing) await base44.entities.SavedResource.delete(existing.id);
      else await base44.entities.SavedResource.create({ resource_id: article.id, resource_name: article.title, resource_category: "Recovery" });
    },
    onSuccess: () => queryClient.invalidateQueries(["saved-articles"]),
  });

  const featured = articles.filter(a => a.featured || a.pinned);
  const trending = [...articles].sort((a, b) => (b.like_count || 0) - (a.like_count || 0)).slice(0, 3);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return articles.filter(a => {
      const matchCat = activeCategory === "All" || a.category === activeCategory;
      const matchSearch = !search || a.title?.toLowerCase().includes(q) || a.summary?.toLowerCase().includes(q) || a.source_name?.toLowerCase().includes(q) || a.tags?.some(t => t.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [articles, search, activeCategory]);

  if (selectedArticle) {
    return (
      <ArticleDetail
        article={selectedArticle}
        user={user}
        isSaved={savedIds.has(selectedArticle.id)}
        onSave={() => saveMutation.mutate(selectedArticle)}
        onShare={() => setSharing(selectedArticle)}
        onBack={() => setSelectedArticle(null)}
      />
    );
  }

  return (
    <div className="min-h-screen pb-28" style={{ background: "#F7F7F8" }}>
      {/* Header */}
      <div className="px-5 pt-8 pb-4" style={{ background: "#FFF", borderBottom: "1px solid #D1D1D6" }}>
        <div className="flex items-center gap-3 mb-1">
          <BookOpen className="w-6 h-6" style={{ color: "#4A90E2" }} />
          <h1 className="text-xl font-bold" style={{ color: "#1E1E1E" }}>Recovery + Reentry Hub</h1>
        </div>
        <p className="text-sm mb-4" style={{ color: "#8E8E93" }}>Real information to support your journey</p>

        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl mb-3" style={{ background: "#F7F7F8", border: "1px solid #D1D1D6" }}>
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: "#8E8E93" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search articles, topics…"
            className="flex-1 text-sm bg-transparent outline-none" style={{ color: "#1E1E1E" }} />
          {search && <button onClick={() => setSearch("")}><X className="w-4 h-4" style={{ color: "#8E8E93" }} /></button>}
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0"
              style={{
                background: activeCategory === cat ? "#1E1E1E" : "#F0F0F3",
                color: activeCategory === cat ? "#FFF" : "#5A5A5A",
                border: "1px solid #D1D1D6",
              }}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 py-5 space-y-6">
        {/* Featured banner */}
        {activeCategory === "All" && !search && featured.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4" style={{ color: "#D97706" }} />
              <p className="text-sm font-bold" style={{ color: "#1E1E1E" }}>Featured</p>
            </div>
            <div className="space-y-3">
              {featured.slice(0, 2).map(a => (
                <ArticleCard key={a.id} article={a} isSaved={savedIds.has(a.id)}
                  onSave={saveMutation.mutate} onShare={setSharing} onClick={() => setSelectedArticle(a)} />
              ))}
            </div>
          </div>
        )}

        {/* Trending strip */}
        {activeCategory === "All" && !search && trending.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4" style={{ color: "#EF4444" }} />
              <p className="text-sm font-bold" style={{ color: "#1E1E1E" }}>Trending</p>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
              {trending.map(a => (
                <button key={a.id} onClick={() => setSelectedArticle(a)}
                  className="flex-shrink-0 w-56 text-left p-3 rounded-2xl"
                  style={{ background: "#FFF", border: "1px solid #E5E7EB" }}>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#FEF2F2", color: "#DC2626" }}>
                    {a.category}
                  </span>
                  <p className="text-sm font-bold mt-2 leading-tight line-clamp-2" style={{ color: "#1E1E1E" }}>{a.title}</p>
                  <p className="text-xs mt-1" style={{ color: "#8E8E93" }}>{a.source_name}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* All articles */}
        <div>
          {(search || activeCategory !== "All") && (
            <p className="text-xs font-semibold mb-3" style={{ color: "#8E8E93" }}>
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
              {activeCategory !== "All" ? ` in ${activeCategory}` : ""}
            </p>
          )}

          {isLoading && (
            <div className="text-center py-16">
              <Loader2 className="w-7 h-7 mx-auto animate-spin opacity-30" />
              <p className="text-sm mt-3" style={{ color: "#8E8E93" }}>Loading articles…</p>
            </div>
          )}

          {!isLoading && filtered.length === 0 && (
            <div className="text-center py-16 rounded-2xl" style={{ background: "#FFF", border: "1px solid #E5E7EB" }}>
              <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium" style={{ color: "#1E1E1E" }}>No articles found.</p>
              <p className="text-xs mt-1" style={{ color: "#8E8E93" }}>Try a different category or search term.</p>
            </div>
          )}

          <div className="space-y-3">
            {filtered.map(a => (
              <ArticleCard key={a.id} article={a} isSaved={savedIds.has(a.id)}
                onSave={saveMutation.mutate} onShare={setSharing} onClick={() => setSelectedArticle(a)} />
            ))}
          </div>
        </div>
      </div>

      {sharing && <ShareSheet title={sharing.title} summary={sharing.summary} onClose={() => setSharing(null)} />}
    </div>
  );
}