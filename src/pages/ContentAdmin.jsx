import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Star, Eye, EyeOff, Pin, Loader2, Shield, Search, Flag } from "lucide-react";

const CATEGORIES = ["Recovery","Relapse Prevention","Reentry","Employment","Housing","Mental Health","Motivation","Legal & Probation","Life Skills","Community Support"];

const EMPTY = {
  title: "", slug: "", summary: "", full_content: "", source_name: "", source_url: "",
  image_url: "", category: "Recovery", tags: "", publish_date: new Date().toISOString().split("T")[0],
  featured: false, pinned: false, approved: true, comments_enabled: true,
};

function ToggleRow({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-2">
      <p className="text-sm" style={{ color: "#1E1E1E" }}>{label}</p>
      <button type="button" onClick={() => onChange(!checked)}
        className="w-10 h-6 rounded-full relative"
        style={{ background: checked ? "#4A90E2" : "#D1D1D6" }}>
        <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all"
          style={{ left: checked ? "calc(100% - 22px)" : "2px", boxShadow: "0 1px 3px rgba(0,0,0,0.15)" }} />
      </button>
    </div>
  );
}

const inputStyle = { background: "#F7F7F8", border: "1px solid #D1D1D6", color: "#1E1E1E", width: "100%", padding: "10px 12px", borderRadius: 10, fontSize: 14 };

export default function ContentAdmin() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("articles");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY);

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ["articles-admin"],
    queryFn: () => base44.entities.Article.list("-publish_date", 100),
  });

  const { data: reports = [] } = useQuery({
    queryKey: ["reports"],
    queryFn: () => base44.entities.ContentReport.filter({ status: "pending" }),
    enabled: activeTab === "moderation",
  });

  const { data: communityPosts = [] } = useQuery({
    queryKey: ["community-posts-admin"],
    queryFn: () => base44.entities.CommunityPost.list("-created_date", 50),
    enabled: activeTab === "community",
  });

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const saveMutation = useMutation({
    mutationFn: async () => {
      const data = { ...form, tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [] };
      delete data.id;
      if (editingId) return base44.entities.Article.update(editingId, data);
      return base44.entities.Article.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["articles-admin"]);
      queryClient.invalidateQueries(["articles"]);
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Article.delete(id),
    onSuccess: () => queryClient.invalidateQueries(["articles-admin"]),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, field, val }) => base44.entities.Article.update(id, { [field]: val }),
    onSuccess: () => queryClient.invalidateQueries(["articles-admin"]),
  });

  const resolveReport = useMutation({
    mutationFn: (id) => base44.entities.ContentReport.update(id, { status: "resolved" }),
    onSuccess: () => queryClient.invalidateQueries(["reports"]),
  });

  const moderatePost = useMutation({
    mutationFn: ({ id, status }) => base44.entities.CommunityPost.update(id, { moderation_status: status }),
    onSuccess: () => queryClient.invalidateQueries(["community-posts-admin"]),
  });

  const openEdit = (a) => {
    setForm({ ...EMPTY, ...a, tags: a.tags?.join(", ") || "" });
    setEditingId(a.id);
    setShowForm(true);
  };

  const isAdmin = user?.role === "admin";

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F7F7F8" }}>
        <div className="text-center p-8">
          <Shield className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="font-bold text-lg mb-2">Admin Access Required</p>
        </div>
      </div>
    );
  }

  const filteredArticles = articles.filter(a => !search || a.title?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen pb-28" style={{ background: "#F7F7F8" }}>
      <div className="px-5 pt-8 pb-4" style={{ background: "#FFF", borderBottom: "1px solid #D1D1D6" }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#8E8E93" }}>Admin</p>
            <h1 className="text-xl font-bold" style={{ color: "#1E1E1E" }}>Content Manager</h1>
          </div>
          {activeTab === "articles" && (
            <button onClick={() => { setForm(EMPTY); setEditingId(null); setShowForm(true); }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold"
              style={{ background: "#4A90E2", color: "#FFF" }}>
              <Plus className="w-4 h-4" /> Add Article
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1">
          {[
            { id: "articles", label: "Articles" },
            { id: "community", label: "Community", badge: communityPosts.filter(p => p.moderation_status === "pending").length },
            { id: "moderation", label: "Reports", badge: reports.length },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium"
              style={{ background: activeTab === t.id ? "#1E1E1E" : "#F0F0F3", color: activeTab === t.id ? "#FFF" : "#5A5A5A" }}>
              {t.label}
              {t.badge > 0 && (
                <span className="text-xs font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#EF4444", color: "#FFF" }}>{t.badge}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 py-5">
        {/* Articles tab */}
        {activeTab === "articles" && (
          <>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl mb-4" style={{ background: "#FFF", border: "1px solid #D1D1D6" }}>
              <Search className="w-4 h-4" style={{ color: "#8E8E93" }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search articles…"
                className="flex-1 text-sm bg-transparent outline-none" style={{ color: "#1E1E1E" }} />
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { label: "Total", val: articles.length, color: "#4A90E2" },
                { label: "Published", val: articles.filter(a => a.approved).length, color: "#22C55E" },
                { label: "Featured", val: articles.filter(a => a.featured).length, color: "#D97706" },
              ].map(s => (
                <div key={s.label} className="text-center p-3 rounded-2xl" style={{ background: "#FFF", border: "1px solid #E5E7EB" }}>
                  <p className="text-xl font-bold" style={{ color: s.color }}>{s.val}</p>
                  <p className="text-xs" style={{ color: "#8E8E93" }}>{s.label}</p>
                </div>
              ))}
            </div>

            {isLoading && <div className="text-center py-10"><Loader2 className="w-5 h-5 mx-auto animate-spin opacity-30" /></div>}

            <div className="space-y-3">
              {filteredArticles.map(a => (
                <div key={a.id} className="rounded-2xl p-4" style={{ background: "#FFF", border: "1px solid #E5E7EB" }}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        {a.featured && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#FFFBEB", color: "#D97706" }}>⭐ Featured</span>}
                        {a.pinned && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#F5F3FF", color: "#7C3AED" }}>📌 Pinned</span>}
                        {!a.approved && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#FEF2F2", color: "#DC2626" }}>Hidden</span>}
                        <span className="text-[10px] font-semibold" style={{ color: "#8E8E93" }}>{a.category}</span>
                      </div>
                      <p className="text-sm font-bold line-clamp-2" style={{ color: "#1E1E1E" }}>{a.title}</p>
                      {a.source_name && <p className="text-xs mt-0.5" style={{ color: "#4A90E2" }}>{a.source_name}</p>}
                    </div>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    <button onClick={() => openEdit(a)} className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-xl" style={{ background: "#EBF5FF", color: "#2563EB" }}>
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                    <button onClick={() => toggleMutation.mutate({ id: a.id, field: "featured", val: !a.featured })}
                      className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-xl"
                      style={{ background: a.featured ? "#FFFBEB" : "#F7F7F8", color: a.featured ? "#D97706" : "#5A5A5A" }}>
                      <Star className="w-3 h-3" /> {a.featured ? "Unfeature" : "Feature"}
                    </button>
                    <button onClick={() => toggleMutation.mutate({ id: a.id, field: "pinned", val: !a.pinned })}
                      className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-xl"
                      style={{ background: "#F7F7F8", color: "#5A5A5A" }}>
                      <Pin className="w-3 h-3" /> {a.pinned ? "Unpin" : "Pin"}
                    </button>
                    <button onClick={() => toggleMutation.mutate({ id: a.id, field: "approved", val: !a.approved })}
                      className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-xl"
                      style={{ background: "#F7F7F8", color: "#5A5A5A" }}>
                      {a.approved ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      {a.approved ? "Hide" : "Show"}
                    </button>
                    <button onClick={() => { if (confirm("Delete this article?")) deleteMutation.mutate(a.id); }}
                      className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-xl" style={{ background: "#FEF2F2", color: "#DC2626" }}>
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Community moderation tab */}
        {activeTab === "community" && (
          <div className="space-y-3">
            {communityPosts.map(post => (
              <div key={post.id} className="rounded-2xl p-4" style={{ background: "#FFF", border: "1px solid #E5E7EB" }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full`}
                    style={{
                      background: post.moderation_status === "approved" ? "#F0FDF4" : post.moderation_status === "flagged" ? "#FEF2F2" : "#FFF7ED",
                      color: post.moderation_status === "approved" ? "#16A34A" : post.moderation_status === "flagged" ? "#DC2626" : "#D97706",
                    }}>
                    {post.moderation_status?.toUpperCase()}
                  </span>
                  <span className="text-xs" style={{ color: "#8E8E93" }}>{post.category}</span>
                </div>
                <p className="text-sm line-clamp-3 mb-3" style={{ color: "#1E1E1E" }}>{post.content}</p>
                <div className="flex gap-2">
                  <button onClick={() => moderatePost.mutate({ id: post.id, status: "approved" })}
                    className="text-xs px-3 py-1.5 rounded-xl font-semibold" style={{ background: "#F0FDF4", color: "#16A34A" }}>
                    ✓ Approve
                  </button>
                  <button onClick={() => moderatePost.mutate({ id: post.id, status: "flagged" })}
                    className="text-xs px-3 py-1.5 rounded-xl font-semibold" style={{ background: "#FEF2F2", color: "#DC2626" }}>
                    🚩 Flag
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reports tab */}
        {activeTab === "moderation" && (
          <div className="space-y-3">
            {reports.length === 0 && (
              <div className="text-center py-16 rounded-2xl" style={{ background: "#FFF", border: "1px solid #E5E7EB" }}>
                <Flag className="w-8 h-8 mx-auto mb-3 opacity-20" />
                <p className="text-sm" style={{ color: "#8E8E93" }}>No pending reports.</p>
              </div>
            )}
            {reports.map(r => (
              <div key={r.id} className="rounded-2xl p-4" style={{ background: "#FFF", border: "1px solid #E5E7EB" }}>
                <p className="text-xs font-bold mb-1" style={{ color: "#DC2626" }}>{r.reason?.replace(/_/g, " ").toUpperCase()}</p>
                <p className="text-xs mb-1" style={{ color: "#8E8E93" }}>Type: {r.content_type} · ID: {r.content_id?.slice(0, 8)}…</p>
                {r.notes && <p className="text-xs mb-2" style={{ color: "#1E1E1E" }}>{r.notes}</p>}
                <button onClick={() => resolveReport.mutate(r.id)}
                  className="text-xs px-3 py-1.5 rounded-xl font-semibold" style={{ background: "#F0FDF4", color: "#16A34A" }}>
                  Mark Resolved
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Article Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: "rgba(0,0,0,0.6)" }}>
          <div className="min-h-screen flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-6" style={{ background: "#FFF" }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">{editingId ? "Edit Article" : "Add New Article"}</h3>
                <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", fontSize: 22, color: "#8E8E93" }}>✕</button>
              </div>

              <div className="space-y-3 max-h-[75vh] overflow-y-auto pr-1">
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: "#5A5A5A" }}>Title *</label>
                  <input value={form.title} onChange={e => setField("title", e.target.value)} style={inputStyle} placeholder="Article title" />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: "#5A5A5A" }}>Category *</label>
                  <select value={form.category} onChange={e => setField("category", e.target.value)} style={inputStyle}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: "#5A5A5A" }}>Summary (shown on card)</label>
                  <textarea value={form.summary} onChange={e => setField("summary", e.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical" }} placeholder="2-3 sentence overview…" />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: "#5A5A5A" }}>Full Content (Markdown supported)</label>
                  <textarea value={form.full_content} onChange={e => setField("full_content", e.target.value)} rows={6} style={{ ...inputStyle, resize: "vertical" }} placeholder="Full article content. Supports **bold**, ## headers, - lists…" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium block mb-1" style={{ color: "#5A5A5A" }}>Source Name</label>
                    <input value={form.source_name} onChange={e => setField("source_name", e.target.value)} style={inputStyle} placeholder="e.g. SAMHSA" />
                  </div>
                  <div>
                    <label className="text-xs font-medium block mb-1" style={{ color: "#5A5A5A" }}>Publish Date</label>
                    <input type="date" value={form.publish_date} onChange={e => setField("publish_date", e.target.value)} style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: "#5A5A5A" }}>Source URL</label>
                  <input value={form.source_url} onChange={e => setField("source_url", e.target.value)} style={inputStyle} placeholder="https://original-source.org/article" />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: "#5A5A5A" }}>Image URL (optional)</label>
                  <input value={form.image_url} onChange={e => setField("image_url", e.target.value)} style={inputStyle} placeholder="https://…/image.jpg" />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: "#5A5A5A" }}>Tags (comma separated)</label>
                  <input value={form.tags} onChange={e => setField("tags", e.target.value)} style={inputStyle} placeholder="recovery, reentry, housing" />
                </div>

                <div className="rounded-2xl p-4" style={{ background: "#F7F7F8" }}>
                  <ToggleRow label="Published / Approved" checked={form.approved} onChange={v => setField("approved", v)} />
                  <ToggleRow label="Featured Article" checked={form.featured} onChange={v => setField("featured", v)} />
                  <ToggleRow label="Pinned to Top" checked={form.pinned} onChange={v => setField("pinned", v)} />
                  <ToggleRow label="Comments Enabled" checked={form.comments_enabled} onChange={v => setField("comments_enabled", v)} />
                </div>
              </div>

              <button onClick={() => saveMutation.mutate()} disabled={!form.title || saveMutation.isPending}
                className="w-full mt-4 py-4 rounded-2xl font-bold text-base"
                style={{ background: form.title ? "#4A90E2" : "#E5E7EB", color: "#FFF" }}>
                {saveMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : editingId ? "Save Changes →" : "Publish Article →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}