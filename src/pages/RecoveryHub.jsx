import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, X, Loader2, BookOpen, Users, TrendingUp, Star, MapPin, Briefcase, Home, ChevronRight } from "lucide-react";
import ArticleCard from "@/components/content/ArticleCard";
import ArticleDetail from "@/components/content/ArticleDetail";
import ShareMenu from "@/components/content/ShareMenu";
import CommunityPostCard from "@/components/content/CommunityPostCard";

const CATEGORIES = ["All", "Recovery", "Relapse Prevention", "Reentry", "Employment", "Housing", "Mental Health", "Motivation", "Legal", "Life Skills", "Community"];
const TABS = [
  { id: "articles",   label: "Articles",  icon: BookOpen },
  { id: "resources",  label: "Resources", icon: MapPin },
  { id: "community",  label: "Community", icon: Users },
  { id: "featured",   label: "Featured",  icon: Star },
];

const RESOURCE_TYPES = ["All", "Facilities", "Employment", "Housing"];

const RESOURCE_TYPE_META = {
  facility:   { icon: MapPin,     color: "#6366F1", bg: "rgba(99,102,241,0.1)",  label: "Facility"    },
  employment: { icon: Briefcase,  color: "#F59E0B", bg: "rgba(245,158,11,0.1)",  label: "Job"         },
  housing:    { icon: Home,       color: "#10B981", bg: "rgba(16,185,129,0.1)",   label: "Housing"     },
};

export default function RecoveryHub() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("articles");
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [shareTarget, setShareTarget] = useState(null);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostCategory, setNewPostCategory] = useState("support");

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });
  const [resourceType, setResourceType] = useState("All");

  const { data: articles = [], isLoading: articlesLoading } = useQuery({
    queryKey: ["articles"],
    queryFn: () => base44.entities.Article.filter({ approved: true }, "-pinned", 100),
  });

  const { data: communityPosts = [], isLoading: postsLoading } = useQuery({
    queryKey: ["community-posts"],
    queryFn: () => base44.entities.CommunityPost.filter({ moderation_status: "approved" }, "-created_date", 50),
  });

  const { data: savedArticles = [] } = useQuery({
    queryKey: ["saved-articles", user?.email],
    queryFn: () => base44.entities.ArticleLike.filter({ created_by: user.email, target_type: "article_save" }),
    enabled: !!user,
  });

  const { data: likedArticles = [] } = useQuery({
    queryKey: ["liked-articles", user?.email],
    queryFn: () => base44.entities.ArticleLike.filter({ created_by: user.email, target_type: "article_like" }),
    enabled: !!user,
  });

  const { data: likedPosts = [] } = useQuery({
    queryKey: ["liked-posts", user?.email],
    queryFn: () => base44.entities.ArticleLike.filter({ created_by: user.email, target_type: "community_like" }),
    enabled: !!user,
  });

  const savedIds = useMemo(() => new Set(savedArticles.map(l => l.target_id)), [savedArticles]);
  const likedArticleIds = useMemo(() => new Set(likedArticles.map(l => l.target_id)), [likedArticles]);
  const likedPostIds = useMemo(() => new Set(likedPosts.map(l => l.target_id)), [likedPosts]);

  const articleInteractMutation = useMutation({
    mutationFn: async ({ article, action }) => {
      const existing = (action === "save" ? savedArticles : likedArticles).find(l => l.target_id === article.id);
      const type = action === "save" ? "article_save" : "article_like";
      if (existing) {
        await base44.entities.ArticleLike.delete(existing.id);
        if (action === "like") await base44.entities.Article.update(article.id, { like_count: Math.max(0, (article.like_count || 0) - 1) });
      } else {
        await base44.entities.ArticleLike.create({ target_id: article.id, target_type: type });
        if (action === "like") await base44.entities.Article.update(article.id, { like_count: (article.like_count || 0) + 1 });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["saved-articles"]);
      queryClient.invalidateQueries(["liked-articles"]);
      queryClient.invalidateQueries(["articles"]);
    },
  });

  const likePostMutation = useMutation({
    mutationFn: async (post) => {
      const existing = likedPosts.find(l => l.target_id === post.id);
      if (existing) {
        await base44.entities.ArticleLike.delete(existing.id);
        await base44.entities.CommunityPost.update(post.id, { like_count: Math.max(0, (post.like_count || 0) - 1) });
      } else {
        await base44.entities.ArticleLike.create({ target_id: post.id, target_type: "community_like" });
        await base44.entities.CommunityPost.update(post.id, { like_count: (post.like_count || 0) + 1 });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["liked-posts"]);
      queryClient.invalidateQueries(["community-posts"]);
    },
  });

  const createPostMutation = useMutation({
    mutationFn: () => base44.entities.CommunityPost.create({
      content: newPostContent,
      category: newPostCategory,
      is_anonymous: true,
      moderation_status: "approved",
      like_count: 0,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(["community-posts"]);
      setShowNewPost(false); setNewPostContent("");
    },
  });

  const reportPostMutation = useMutation({
    mutationFn: (post) => base44.entities.CommunityPost.update(post.id, { moderation_status: "flagged" }),
  });

  const filteredArticles = useMemo(() => {
    const q = search.toLowerCase();
    return articles
      .filter(a => category === "All" || a.category === category)
      .filter(a => !search || a.title?.toLowerCase().includes(q) || a.summary?.toLowerCase().includes(q) || a.tags?.some(t => t.toLowerCase().includes(q)))
      .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  }, [articles, category, search]);

  const featuredArticles = useMemo(() => articles.filter(a => a.featured), [articles]);

  const { data: facilities = [], isLoading: facilitiesLoading } = useQuery({
    queryKey: ["us-recovery-resources"],
    queryFn: () => base44.entities.USRecoveryResource.list("-created_date", 200),
    enabled: tab === "resources",
  });

  const { data: jobs = [], isLoading: jobsLoading } = useQuery({
    queryKey: ["employment-listings"],
    queryFn: () => base44.entities.EmploymentListing.list("-created_date", 200),
    enabled: tab === "resources",
  });

  const { data: housing = [], isLoading: housingLoading } = useQuery({
    queryKey: ["nj-housing-resources"],
    queryFn: () => base44.entities.NJHousingResource.list("-created_date", 200),
    enabled: tab === "resources",
  });

  const allResources = useMemo(() => [
    ...facilities.map(r => ({ ...r, _type: "facility",   _name: r.name || r.facility_name || r.title, _desc: r.description || r.services, _tags: r.tags || [], _category: r.category || r.service_type })),
    ...jobs.map(r =>        ({ ...r, _type: "employment", _name: r.title || r.company,                  _desc: r.description || r.requirements, _tags: r.tags || [], _category: r.category || r.job_type })),
    ...housing.map(r =>     ({ ...r, _type: "housing",    _name: r.name || r.facility_name || r.title,  _desc: r.description || r.address,     _tags: r.tags || [], _category: r.housing_type || r.category })),
  ], [facilities, jobs, housing]);

  const filteredResources = useMemo(() => {
    const q = search.toLowerCase();
    return allResources.filter(r => {
      const typeMatch = resourceType === "All"
        || (resourceType === "Facilities"  && r._type === "facility")
        || (resourceType === "Employment"  && r._type === "employment")
        || (resourceType === "Housing"     && r._type === "housing");
      if (!typeMatch) return false;
      if (!q) return true;
      return (
        r._name?.toLowerCase().includes(q) ||
        r._desc?.toLowerCase().includes(q) ||
        r._category?.toLowerCase().includes(q) ||
        r._tags?.some(t => t.toLowerCase().includes(q))
      );
    });
  }, [allResources, search, resourceType]);

  const resourcesLoading = tab === "resources" && (facilitiesLoading || jobsLoading || housingLoading);

  if (selectedArticle) {
    return (
      <ArticleDetail
        article={selectedArticle}
        user={user}
        isSaved={savedIds.has(selectedArticle.id)}
        isLiked={likedArticleIds.has(selectedArticle.id)}
        onSave={() => articleInteractMutation.mutate({ article: selectedArticle, action: "save" })}
        onLike={() => articleInteractMutation.mutate({ article: selectedArticle, action: "like" })}
        onBack={() => setSelectedArticle(null)}
      />
    );
  }

  return (
    <div className="min-h-screen pb-28" style={{ background: "#F7F7F8" }}>
      {shareTarget && (
        <ShareMenu title={shareTarget.title || shareTarget.content} url={shareTarget.source_url || window.location.href} onClose={() => setShareTarget(null)} />
      )}

      {/* Header */}
      <div className="px-5 pt-8 pb-0" style={{ background: "#FFF", borderBottom: "1px solid #D1D1D6" }}>
        <h1 className="text-xl font-bold" style={{ color: "#1E1E1E" }}>Recovery + Reentry Hub</h1>
        <p className="text-sm mt-0.5 mb-4" style={{ color: "#8E8E93" }}>Real information. Real support. Built for your journey.</p>

        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl mb-4" style={{ background: "#F7F7F8", border: "1px solid #D1D1D6" }}>
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: "#8E8E93" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search articles, topics…"
            className="flex-1 text-sm bg-transparent outline-none" style={{ color: "#1E1E1E" }} />
          {search && <button onClick={() => setSearch("")}><X className="w-4 h-4" style={{ color: "#8E8E93" }} /></button>}
        </div>

        {/* Tabs */}
        <div className="flex">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex items-center gap-1.5 px-4 py-3 text-sm font-medium flex-shrink-0"
              style={{ color: tab === t.id ? "#4A90E2" : "#8E8E93", background: "none", border: "none", borderBottom: tab === t.id ? "2px solid #4A90E2" : "2px solid transparent", cursor: "pointer" }}>
              <t.icon className="w-4 h-4" strokeWidth={1.5} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Tab */}
      {tab === "articles" && (
        <>
          {/* Category pills */}
          <div className="px-5 py-3 flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap"
                style={{ background: category === c ? "#1E1E1E" : "#F7F7F8", color: category === c ? "#FFF" : "#5A5A5A", border: "1px solid #E5E7EB", flexShrink: 0 }}>
                {c}
              </button>
            ))}
          </div>

          <div className="px-5 pb-4 space-y-4">
            {articlesLoading ? (
              <div className="text-center py-16"><Loader2 className="w-7 h-7 mx-auto animate-spin opacity-30" /></div>
            ) : filteredArticles.length === 0 ? (
              <div className="text-center py-16 rounded-2xl" style={{ background: "#FFF", border: "1px solid #E5E7EB" }}>
                <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="text-sm font-medium" style={{ color: "#1E1E1E" }}>No articles found.</p>
              </div>
            ) : (
              filteredArticles.map(article => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  isSaved={savedIds.has(article.id)}
                  isLiked={likedArticleIds.has(article.id)}
                  onSave={() => articleInteractMutation.mutate({ article, action: "save" })}
                  onLike={() => articleInteractMutation.mutate({ article, action: "like" })}
                  onShare={() => setShareTarget(article)}
                  onClick={() => setSelectedArticle(article)}
                />
              ))
            )}
          </div>
        </>
      )}

      {/* Resources Tab */}
      {tab === "resources" && (
        <div className="pb-4">
          {/* Resource type filter */}
          <div className="px-5 py-3 flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            {RESOURCE_TYPES.map(t => (
              <button key={t} onClick={() => setResourceType(t)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0"
                style={{ background: resourceType === t ? "#1E1E1E" : "#F7F7F8", color: resourceType === t ? "#FFF" : "#5A5A5A", border: "1px solid #E5E7EB" }}>
                {t}
              </button>
            ))}
          </div>

          {/* Results count */}
          {!resourcesLoading && (
            <p className="px-5 pb-2 text-xs" style={{ color: "#8E8E93" }}>
              {filteredResources.length} result{filteredResources.length !== 1 ? "s" : ""}
              {search ? ` for "${search}"` : ""}
            </p>
          )}

          <div className="px-5 space-y-3">
            {resourcesLoading ? (
              <div className="text-center py-16"><Loader2 className="w-7 h-7 mx-auto animate-spin opacity-30" /></div>
            ) : filteredResources.length === 0 ? (
              <div className="text-center py-16 rounded-2xl" style={{ background: "#FFF", border: "1px solid #E5E7EB" }}>
                <Search className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="text-sm font-medium" style={{ color: "#1E1E1E" }}>No resources found.</p>
                <p className="text-xs mt-1" style={{ color: "#8E8E93" }}>Try a different search or filter.</p>
              </div>
            ) : (
              filteredResources.map(r => {
                const meta = RESOURCE_TYPE_META[r._type];
                const Icon = meta.icon;
                const city = r.city || r.location_city || "";
                const state = r.state || r.location_state || r.state_name || "";
                const location = [city, state].filter(Boolean).join(", ");
                return (
                  <div key={`${r._type}-${r.id}`}
                    className="rounded-2xl p-4"
                    style={{ background: "#FFF", border: "1px solid #E5E7EB" }}>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center" style={{ background: meta.bg }}>
                        <Icon className="w-5 h-5" style={{ color: meta.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: meta.bg, color: meta.color }}>
                            {meta.label}
                          </span>
                          {r._category && (
                            <span className="text-xs" style={{ color: "#8E8E93" }}>{r._category}</span>
                          )}
                        </div>
                        <p className="text-sm font-bold mb-1" style={{ color: "#1E1E1E" }}>{r._name || "—"}</p>
                        {r._desc && (
                          <p className="text-xs mb-2" style={{ color: "#5A5A5A", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                            {r._desc}
                          </p>
                        )}
                        <div className="flex items-center gap-3 flex-wrap">
                          {location && (
                            <span className="text-xs flex items-center gap-1" style={{ color: "#8E8E93" }}>
                              <MapPin className="w-3 h-3" /> {location}
                            </span>
                          )}
                          {r._tags?.slice(0, 3).map(tag => (
                            <span key={tag} className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#F7F7F8", color: "#5A5A5A", border: "1px solid #E5E7EB" }}>{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Community Tab */}
      {tab === "community" && (
        <div className="px-5 py-4 space-y-3">
          {/* New post CTA */}
          {user ? (
            <button onClick={() => setShowNewPost(true)}
              className="w-full px-4 py-4 rounded-2xl text-sm font-semibold text-left"
              style={{ background: "#FFF", border: "2px dashed #D1D1D6", color: "#8E8E93" }}>
              💭 Share your thoughts with the community…
            </button>
          ) : (
            <div className="px-4 py-4 rounded-2xl text-sm text-center" style={{ background: "#FFF", border: "1px solid #E5E7EB" }}>
              <button onClick={() => base44.auth.redirectToLogin()} style={{ color: "#4A90E2", fontWeight: 700, background: "none", border: "none" }}>Sign in</button> to post to the community.
            </div>
          )}

          {postsLoading ? (
            <div className="text-center py-10"><Loader2 className="w-6 h-6 mx-auto animate-spin opacity-30" /></div>
          ) : communityPosts.length === 0 ? (
            <div className="text-center py-16 rounded-2xl" style={{ background: "#FFF", border: "1px solid #E5E7EB" }}>
              <Users className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium" style={{ color: "#1E1E1E" }}>No posts yet. Be the first!</p>
            </div>
          ) : (
            communityPosts.map(post => (
              <CommunityPostCard
                key={post.id}
                post={post}
                user={user}
                isLiked={likedPostIds.has(post.id)}
                likeCount={post.like_count || 0}
                onLike={() => user ? likePostMutation.mutate(post) : base44.auth.redirectToLogin()}
                onShare={() => setShareTarget(post)}
                onReport={() => reportPostMutation.mutate(post)}
              />
            ))
          )}
        </div>
      )}

      {/* Featured Tab */}
      {tab === "featured" && (
        <div className="px-5 py-4 space-y-4">
          {featuredArticles.length === 0 ? (
            <div className="text-center py-16"><p className="text-sm" style={{ color: "#8E8E93" }}>No featured articles yet.</p></div>
          ) : (
            featuredArticles.map(article => (
              <ArticleCard
                key={article.id}
                article={article}
                isSaved={savedIds.has(article.id)}
                isLiked={likedArticleIds.has(article.id)}
                onSave={() => articleInteractMutation.mutate({ article, action: "save" })}
                onLike={() => articleInteractMutation.mutate({ article, action: "like" })}
                onShare={() => setShareTarget(article)}
                onClick={() => setSelectedArticle(article)}
              />
            ))
          )}
        </div>
      )}

      {/* New Post Modal */}
      {showNewPost && (
        <div className="fixed inset-0 z-50 flex items-end" style={{ background: "rgba(0,0,0,0.5)" }} onClick={() => setShowNewPost(false)}>
          <div className="w-full max-w-lg mx-auto rounded-t-3xl p-6 space-y-4" style={{ background: "#FFF" }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <p className="font-bold text-base" style={{ color: "#1E1E1E" }}>Share with the Community</p>
              <button onClick={() => setShowNewPost(false)} style={{ background: "none", border: "none", color: "#8E8E93", fontSize: 22 }}>✕</button>
            </div>
            <select value={newPostCategory} onChange={e => setNewPostCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-sm"
              style={{ background: "#F7F7F8", border: "1px solid #D1D1D6", color: "#1E1E1E" }}>
              <option value="support">🤝 Support / Encouragement</option>
              <option value="milestone">🏆 Progress / Milestone</option>
              <option value="advice">💡 Advice for Others</option>
              <option value="question">❓ Question</option>
            </select>
            <textarea
              value={newPostContent}
              onChange={e => setNewPostContent(e.target.value)}
              placeholder="What's on your mind? Share your journey, your wins, or your words of encouragement…"
              rows={5}
              className="w-full px-3 py-3 rounded-xl text-sm"
              style={{ background: "#F7F7F8", border: "1px solid #D1D1D6", color: "#1E1E1E", resize: "none" }}
            />
            <p className="text-xs" style={{ color: "#8E8E93" }}>Your post will be shared anonymously and reviewed before being visible.</p>
            <button
              onClick={() => createPostMutation.mutate()}
              disabled={!newPostContent.trim() || createPostMutation.isPending}
              className="w-full py-4 rounded-2xl text-sm font-bold"
              style={{ background: newPostContent.trim() ? "#4A90E2" : "#E5E7EB", color: "#FFF" }}>
              {createPostMutation.isPending ? "Posting…" : "Post to Community →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}