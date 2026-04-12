import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Bookmark, TrendingUp, Star, Search, X } from "lucide-react";
import FeaturedArticleBanner from "@/components/truth/FeaturedArticleBanner";
import TruthArticleCard from "@/components/truth/TruthArticleCard";
import ArticleDetailModal from "@/components/truth/ArticleDetailModal";

const TABS = [
  { value: "all",                   label: "All",              emoji: "📰" },
  { value: "relapse_reality",       label: "Relapse Reality",  emoji: "📊" },
  { value: "rehab_fraud",           label: "Rehab Fraud",      emoji: "🚨" },
  { value: "success_story",         label: "Success Stories",  emoji: "🌟" },
  { value: "what_helps",            label: "What Helps",       emoji: "💡" },
  { value: "facility_accountability", label: "Accountability", emoji: "🔍" },
  { value: "hope_inspiration",      label: "Hope",             emoji: "🙏" },
  { value: "saved",                 label: "Saved",            emoji: "🔖" },
];

const RED_FLAGS = [
  "Promises 100% success rates — no legitimate program can guarantee that.",
  "Charges per patient referral — this is called patient brokering and is illegal.",
  "Won't share licensing or accreditation info upfront.",
  "Discourages family contact during treatment.",
  "Pushes you to commit before you've toured the facility.",
  "Doesn't discuss an aftercare or discharge plan.",
  "Has reviews that all sound the same or overly promotional.",
  "Cannot clearly explain what a typical day looks like.",
];

export default function TruthAboutRecovery() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [search, setSearch] = useState("");
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showRedFlags, setShowRedFlags] = useState(false);

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ["truth-articles"],
    queryFn: () => base44.entities.TruthArticle.filter({ approved: true }, "-publish_date", 100),
  });

  const { data: savedArticles = [] } = useQuery({
    queryKey: ["saved-truth-articles", user?.email],
    queryFn: () => base44.entities.SavedTruthArticle.filter({ created_by: user.email }),
    enabled: !!user,
  });

  const savedIds = useMemo(() => new Set(savedArticles.map(s => s.article_id)), [savedArticles]);

  const saveMutation = useMutation({
    mutationFn: async (article) => {
      const existing = savedArticles.find(s => s.article_id === article.id);
      if (existing) {
        await base44.entities.SavedTruthArticle.delete(existing.id);
      } else {
        await base44.entities.SavedTruthArticle.create({ article_id: article.id, article_title: article.title });
      }
    },
    onSuccess: () => queryClient.invalidateQueries(["saved-truth-articles"]),
  });

  const reactMutation = useMutation({
    mutationFn: ({ article, key }) =>
      base44.entities.TruthArticle.update(article.id, { [key]: (article[key] || 0) + 1 }),
    onSuccess: () => queryClient.invalidateQueries(["truth-articles"]),
  });

  const featuredArticle = useMemo(() => articles.find(a => a.is_featured || a.is_article_of_day) || articles[0], [articles]);
  const editorsPicks = useMemo(() => articles.filter(a => a.is_editors_pick).slice(0, 3), [articles]);

  const filtered = useMemo(() => {
    let list = [...articles];

    if (activeTab === "saved") {
      list = list.filter(a => savedIds.has(a.id));
    } else if (activeTab !== "all") {
      list = list.filter(a => a.category === activeTab);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(a =>
        a.title?.toLowerCase().includes(q) ||
        a.summary?.toLowerCase().includes(q) ||
        a.source_name?.toLowerCase().includes(q) ||
        a.tags?.some(t => t.toLowerCase().includes(q))
      );
    }

    if (sortBy === "most_read") list.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
    else list.sort((a, b) => new Date(b.publish_date || b.created_date || 0) - new Date(a.publish_date || a.created_date || 0));

    // Don't show featured at top of the general list
    return list;
  }, [articles, activeTab, search, sortBy, savedIds]);

  return (
    <div style={{ background: "#F7F3EE", minHeight: "100vh", paddingBottom: 100 }}>

      {/* Header */}
      <div style={{ background: "#FDFAF6", borderBottom: "1px solid #E8E2D9", padding: "24px 16px 0" }}>
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "#9B8E83", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 5 }}>
            Unbound Editorial
          </p>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: "#1C1410", lineHeight: 1.2, marginBottom: 6, fontFamily: "'Lora', Georgia, serif" }}>
            The Truth About<br />Addiction Recovery
          </h1>
          <p style={{ fontSize: 13, color: "#4A3F35", lineHeight: 1.6, fontStyle: "italic" }}>
            Real stories. Real outcomes. Real lessons.
          </p>
        </div>

        {/* Editorial note */}
        <div style={{
          background: "rgba(184,130,58,0.06)", border: "1px solid rgba(184,130,58,0.18)",
          borderRadius: 12, padding: "12px 14px", marginBottom: 16,
        }}>
          <p style={{ fontSize: 12, color: "#4A3F35", lineHeight: 1.65 }}>
            The truth about recovery is bigger than slogans. Some people find healing. Some relapse. Some treatment centers save lives. Others fail the people they promise to help.{" "}
            <span style={{ color: "#1C1410", fontWeight: 700 }}>This section exists to give our community honest information, real stories, and practical hope.</span>
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 12 }}>
          {TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              style={{
                flexShrink: 0, padding: "7px 13px",
                borderRadius: 20, border: activeTab === tab.value ? "1px solid #B8823A" : "1px solid #E8E2D9",
                cursor: "pointer", minHeight: 36,
                background: activeTab === tab.value ? "#B8823A" : "#FDFAF6",
                color: activeTab === tab.value ? "#fff" : "#9B8E83",
                fontSize: 11, fontWeight: activeTab === tab.value ? 700 : 500,
                transition: "all 0.15s ease",
              }}
            >
              {tab.emoji} {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "16px 16px 0" }}>

        {/* Search + sort */}
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <div style={{
            flex: 1, display: "flex", alignItems: "center", gap: 7,
            background: "#FDFAF6", border: "1px solid #E8E2D9", borderRadius: 10, padding: "9px 12px",
          }}>
            <Search style={{ width: 13, height: 13, color: "#9B8E83", flexShrink: 0 }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search articles…"
              style={{ flex: 1, border: "none", outline: "none", fontSize: 13, color: "#1C1410", background: "none" }}
            />
            {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}><X style={{ width: 11, height: 11, color: "#9B8E83" }} /></button>}
          </div>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{ padding: "9px 10px", borderRadius: 10, border: "1px solid #E8E2D9", background: "#FDFAF6", color: "#4A3F35", fontSize: 12, fontWeight: 600, outline: "none" }}
          >
            <option value="recent">Most Recent</option>
            <option value="most_read">Most Read</option>
          </select>
        </div>

        {isLoading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#8E8E93" }}>
            <Loader2 style={{ width: 24, height: 24, margin: "0 auto 8px" }} className="animate-spin" />
            <p style={{ fontSize: 13 }}>Loading articles…</p>
          </div>
        ) : (
          <>
            {/* Featured (only on All tab with no search) */}
            {activeTab === "all" && !search && featuredArticle && (
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: "#8E8E93", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>
                  ⭐ Featured Story
                </p>
                <FeaturedArticleBanner article={featuredArticle} onOpen={setSelectedArticle} />
              </div>
            )}

            {/* Know the Red Flags */}
            {(activeTab === "all" || activeTab === "rehab_fraud" || activeTab === "facility_accountability") && !search && (
              <div style={{ marginBottom: 20 }}>
                <button
                  onClick={() => setShowRedFlags(f => !f)}
                  style={{
                    width: "100%", padding: "13px 16px", borderRadius: 14, border: "none", cursor: "pointer",
                    background: "linear-gradient(135deg,#FFF1F2,#FEE2E2)",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    textAlign: "left",
                  }}
                >
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 800, color: "#991B1B" }}>🚩 Know the Red Flags</p>
                    <p style={{ fontSize: 11, color: "#B91C1C", marginTop: 2 }}>Warning signs of a questionable rehab facility</p>
                  </div>
                  <span style={{ fontSize: 14, color: "#EF4444" }}>{showRedFlags ? "▲" : "▼"}</span>
                </button>
                {showRedFlags && (
                  <div style={{ background: "#fff", border: "1px solid #FCA5A5", borderTop: "none", borderRadius: "0 0 14px 14px", padding: "12px 16px" }}>
                    {RED_FLAGS.map((flag, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, paddingBottom: 8, marginBottom: 8, borderBottom: i < RED_FLAGS.length - 1 ? "1px solid #FEE2E2" : "none" }}>
                        <span style={{ color: "#EF4444", flexShrink: 0, fontWeight: 700 }}>{i + 1}.</span>
                        <p style={{ fontSize: 12, color: "#374151", lineHeight: 1.5 }}>{flag}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Editor's picks strip (all tab, no search) */}
            {activeTab === "all" && !search && editorsPicks.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: "#8E8E93", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10 }}>
                  ✏️ Editor's Picks
                </p>
                <div style={{ display: "flex", gap: 10, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 4 }}>
                  {editorsPicks.map(article => {
                    const COLORS = { relapse_reality: "#F59E0B", rehab_fraud: "#EF4444", success_story: "#10B981", what_helps: "#4A90E2", facility_accountability: "#8B5CF6", hope_inspiration: "#F97316" };
                    const color = COLORS[article.category] || "#4A90E2";
                    return (
                      <div
                        key={article.id}
                        onClick={() => setSelectedArticle(article)}
                        style={{
                          flexShrink: 0, minWidth: 200, borderRadius: 14, overflow: "hidden",
                          border: "1px solid #E5E7EB", background: "#fff", cursor: "pointer",
                        }}
                      >
                        {article.image_url ? (
                          <img src={article.image_url} alt="" style={{ width: "100%", height: 100, objectFit: "cover", display: "block" }} />
                        ) : (
                          <div style={{ height: 70, background: color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30 }}>
                            {({ relapse_reality: "📊", rehab_fraud: "🚨", success_story: "🌟", what_helps: "💡", facility_accountability: "🔍", hope_inspiration: "🙏" })[article.category]}
                          </div>
                        )}
                        <div style={{ padding: "10px 12px" }}>
                          <p style={{ fontSize: 12, fontWeight: 700, color: "#1E1E1E", lineHeight: 1.3 }}>
                            {article.title?.slice(0, 60)}{article.title?.length > 60 ? "…" : ""}
                          </p>
                          <p style={{ fontSize: 10, color: "#9CA3AF", marginTop: 3 }}>{article.source_name}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Articles list */}
            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 20px", background: "#fff", borderRadius: 16 }}>
                <p style={{ fontSize: 32, marginBottom: 10 }}>{activeTab === "saved" ? "🔖" : "📰"}</p>
                <p style={{ fontSize: 15, fontWeight: 700, color: "#1E1E1E", marginBottom: 6 }}>
                  {activeTab === "saved" ? "No saved articles yet" : "No articles found"}
                </p>
                <p style={{ fontSize: 12, color: "#8E8E93" }}>
                  {activeTab === "saved"
                    ? "Bookmark articles to read them later."
                    : "Try a different filter or check back soon."}
                </p>
              </div>
            ) : (
              <>
                <p style={{ fontSize: 11, color: "#8E8E93", fontWeight: 600, marginBottom: 12 }}>
                  {filtered.length} article{filtered.length !== 1 ? "s" : ""}
                </p>
                {filtered.map(article => (
                  <TruthArticleCard
                    key={article.id}
                    article={article}
                    isSaved={savedIds.has(article.id)}
                    onSave={() => saveMutation.mutate(article)}
                    onReact={(a, key) => reactMutation.mutate({ article: a, key })}
                    onOpen={setSelectedArticle}
                  />
                ))}
              </>
            )}
          </>
        )}
      </div>

      {selectedArticle && (
        <ArticleDetailModal
          article={selectedArticle}
          isSaved={savedIds.has(selectedArticle.id)}
          onSave={() => saveMutation.mutate(selectedArticle)}
          onClose={() => setSelectedArticle(null)}
        />
      )}
    </div>
  );
}