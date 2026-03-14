import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Star, StarOff, Pin, Eye, EyeOff, Shield, Loader2, Search, BookOpen, Users, Flag } from "lucide-react";

const CATEGORIES = ["Recovery","Relapse Prevention","Reentry","Employment","Housing","Mental Health","Motivation","Legal","Community","Life Skills"];

const EMPTY = {
  title: "", slug: "", summary: "", full_content: "", source_name: "", source_url: "", image_url: "",
  category: "Recovery", tags: "", publish_date: new Date().toISOString().split("T")[0],
  featured: false, approved: true, pinned: false, comments_enabled: true,
};

function Toggle({ label, checked, onChange }) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className="flex items-center justify-between w-full py-2"
      style={{ background: "none", border: "none", cursor: "pointer" }}>
      <span className="text-sm" style={{ color: "#1E1E1E" }}>{label}</span>
      <div className="w-10 h-6 rounded-full relative" style={{ background: checked ? "#4A90E2" : "#D1D1D6", transition: "background 0.2s" }}>
        <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all" style={{ left: checked ? "calc(100% - 22px)" : "2px", boxShadow: "0 1px 3px rgba(0,0,0,0.15)" }} />
      </div>
    </button>
  );
}

const inputStyle = { background: "#F7F7F8", border: "1px solid #D1D1D6", color: "#1E1E1E", width: "100%", padding: "10px 12px", borderRadius: 10, fontSize: 14 };

export default function ContentAdmin() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("articles");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY);

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ["admin-articles"],
    queryFn: () => base44.entities.Article.list("-created_date", 200),
  });

  const { data: communityPosts = [] } = useQuery({
    queryKey: ["admin-community-posts"],
    queryFn: () => base44.entities.CommunityPost.list("-created_date", 100),
  });

  const { data: flaggedComments = [] } = useQuery({
    queryKey: ["flagged-comments"],
    queryFn: () => base44.entities.ArticleComment.filter({ status: "reported" }),
  });

  const saveMutation = useMutation({
    mutationFn: () => {
      const data = { ...form, tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [] };
      return editingId ? base44.entities.Article.update(editingId, data) : base44.entities.Article.create(data);
    },
    onSuccess: () => { queryClient.invalidateQueries(["admin-articles"]); queryClient.invalidateQueries(["articles"]); setShowForm(false); setEditingId(null); setForm(EMPTY); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Article.delete(id),
    onSuccess: () => { queryClient.invalidateQueries(["admin-articles"]); queryClient.invalidateQueries(["articles"]); },
  });

  const toggleField = useMutation({
    mutationFn: ({ id, field, value }) => base44.entities.Article.update(id, { [field]: value }),
    onSuccess: () => { queryClient.invalidateQueries(["admin-articles"]); queryClient.invalidateQueries(["articles"]); },
  });

  const moderatePostMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.CommunityPost.update(id, { moderation_status: status }),
    onSuccess: () => queryClient.invalidateQueries(["admin-community-posts"]),
  });

  const moderateCommentMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.ArticleComment.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries(["flagged-comments"]),
  });

  const openEdit = (a) => {
    setForm({ ...EMPTY, ...a, tags: a.tags?.join(", ") || "" });
    setEditingId(a.id); setShowForm(true);
  };
  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const isAdmin = user?.role === "admin";
  const filtered = articles.filter(a => !search || a.title?.toLowerCase().includes(search.toLowerCase()) || a.category?.toLowerCase().includes(search.toLowerCase()));

  if (!isAdmin) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#F7F7F8" }}>
      <div className="text-center p-8">
        <Shield className="w-12 h-12 mx-auto mb-4 opacity-30" />
        <p className="font-bold text-lg" style={{ color: "#1E1E1E" }}>Admin Access Required</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-28" style={{ background: "#F7F7F8" }}>
      <div className="px-5 pt-8 pb-0" style={{ background: "#FFF", borderBottom: "1px solid #D1D1D6" }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#8E8E93" }}>Admin</p>
            <h1 className="text-xl font-bold" style={{ color: "#1E1E1E" }}>Content Manager</h1>
          </div>
          {tab === "articles" && (
            <button onClick={() => { setForm(EMPTY); setEditingId(null); setShowForm(true); }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold"
              style={{ background: "#4A90E2", color: "#FFF" }}>
              <Plus className="w-4 h-4" /> Add Article
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { label: "Total", val: articles.length, color: "#4A90E2" },
            { label: "Published", val: articles.filter(a => a.approved).length, color: "#22C55E" },
            { label: "Featured", val: articles.filter(a => a.featured).length, color: "#F59E0B" },
            { label: "Flagged", val: flaggedComments.length, color: "#EF4444" },
          ].map(s => (
            <div key={s.label} className="text-center p-2.5 rounded-xl" style={{ background: "#F7F7F8" }}>
              <p className="text-xl font-bold" style={{ color: s.color }}>{s.val}</p>
              <p className="text-[10px]" style={{ color: "#8E8E93" }}>{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex border-b" style={{ borderColor: "#E5E7EB" }}>
          {[["articles","Articles",BookOpen],["community","Community",Users],["moderation","Flags",Flag]].map(([id, label, Icon]) => (
            <button key={id} onClick={() => setTab(id)}
              className="flex items-center gap-1.5 px-4 py-3 text-sm font-medium"
              style={{ color: tab === id ? "#4A90E2" : "#8E8E93", background: "none", border: "none", borderBottom: tab === id ? "2px solid #4A90E2" : "2px solid transparent", cursor: "pointer" }}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* Articles tab */}
      {tab === "articles" && (
        <div className="px-5 py-4 space-y-3">
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: "#FFF", border: "1px solid #D1D1D6" }}>
            <Search className="w-4 h-4" style={{ color: "#8E8E93" }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search articles…"
              className="flex-1 text-sm bg-transparent outline-none" style={{ color: "#1E1E1E" }} />
          </div>

          {isLoading ? <div className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin opacity-30 mx-auto" /></div> :
            filtered.map(article => (
              <div key={article.id} className="rounded-2xl p-4" style={{ background: "#FFF", border: "1px solid #E5E7EB" }}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#EBF5FF", color: "#2563EB" }}>{article.category}</span>
                      {article.pinned && <span className="text-[10px]">📌</span>}
                      {article.featured && <span className="text-[10px]">⭐</span>}
                      {!article.approved && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#FEF2F2", color: "#DC2626" }}>Hidden</span>}
                    </div>
                    <p className="font-bold text-sm" style={{ color: "#1E1E1E" }}>{article.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#8E8E93" }}>{article.source_name} · {article.publish_date}</p>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => openEdit(article)} className="flex items-center gap-1 text-xs px-3 py-2 rounded-xl" style={{ background: "#EBF5FF", color: "#2563EB" }}>
                    <Pencil className="w-3 h-3" /> Edit
                  </button>
                  <button onClick={() => toggleField.mutate({ id: article.id, field: "featured", value: !article.featured })}
                    className="flex items-center gap-1 text-xs px-3 py-2 rounded-xl" style={{ background: "#FFF7ED", color: "#D97706" }}>
                    {article.featured ? <StarOff className="w-3 h-3" /> : <Star className="w-3 h-3" />}
                    {article.featured ? "Unfeature" : "Feature"}
                  </button>
                  <button onClick={() => toggleField.mutate({ id: article.id, field: "pinned", value: !article.pinned })}
                    className="flex items-center gap-1 text-xs px-3 py-2 rounded-xl" style={{ background: "#F5F3FF", color: "#7C3AED" }}>
                    <Pin className="w-3 h-3" /> {article.pinned ? "Unpin" : "Pin"}
                  </button>
                  <button onClick={() => toggleField.mutate({ id: article.id, field: "approved", value: !article.approved })}
                    className="flex items-center gap-1 text-xs px-3 py-2 rounded-xl" style={{ background: article.approved ? "#FEF2F2" : "#F0FDF4", color: article.approved ? "#DC2626" : "#16A34A" }}>
                    {article.approved ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    {article.approved ? "Hide" : "Publish"}
                  </button>
                  <button onClick={() => window.confirm("Delete this article?") && deleteMutation.mutate(article.id)}
                    className="flex items-center gap-1 text-xs px-3 py-2 rounded-xl" style={{ background: "#FEF2F2", color: "#DC2626" }}>
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </div>
            ))
          }
        </div>
      )}

      {/* Community tab */}
      {tab === "community" && (
        <div className="px-5 py-4 space-y-3">
          {communityPosts.map(post => (
            <div key={post.id} className="rounded-2xl p-4" style={{ background: "#FFF", border: "1px solid #E5E7EB" }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: post.moderation_status === "approved" ? "#F0FDF4" : post.moderation_status === "flagged" ? "#FEF2F2" : "#FFF7ED", color: post.moderation_status === "approved" ? "#16A34A" : post.moderation_status === "flagged" ? "#DC2626" : "#D97706" }}>
                  {post.moderation_status?.toUpperCase()}
                </span>
                <p className="text-xs" style={{ color: "#8E8E93" }}>{post.created_by?.split("@")[0]} · {new Date(post.created_date).toLocaleDateString()}</p>
              </div>
              <p className="text-sm mb-3" style={{ color: "#1E1E1E" }}>{post.content}</p>
              <div className="flex gap-2">
                <button onClick={() => moderatePostMutation.mutate({ id: post.id, status: "approved" })}
                  className="text-xs px-3 py-2 rounded-xl" style={{ background: "#F0FDF4", color: "#16A34A" }}>✓ Approve</button>
                <button onClick={() => moderatePostMutation.mutate({ id: post.id, status: "flagged" })}
                  className="text-xs px-3 py-2 rounded-xl" style={{ background: "#FEF2F2", color: "#DC2626" }}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Moderation tab */}
      {tab === "moderation" && (
        <div className="px-5 py-4 space-y-3">
          {flaggedComments.length === 0 ? (
            <div className="text-center py-16"><p className="text-sm" style={{ color: "#8E8E93" }}>No flagged comments.</p></div>
          ) : flaggedComments.map(c => (
            <div key={c.id} className="rounded-2xl p-4" style={{ background: "#FFF", border: "1px solid #E5E7EB" }}>
              <p className="text-sm mb-1" style={{ color: "#1E1E1E" }}>{c.content}</p>
              <p className="text-xs mb-3" style={{ color: "#8E8E93" }}>By {c.created_by?.split("@")[0]} · Article {c.article_id?.slice(0, 8)}</p>
              <div className="flex gap-2">
                <button onClick={() => moderateCommentMutation.mutate({ id: c.id, status: "active" })}
                  className="text-xs px-3 py-2 rounded-xl" style={{ background: "#F0FDF4", color: "#16A34A" }}>✓ Restore</button>
                <button onClick={() => moderateCommentMutation.mutate({ id: c.id, status: "removed" })}
                  className="text-xs px-3 py-2 rounded-xl" style={{ background: "#FEF2F2", color: "#DC2626" }}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Article form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: "rgba(0,0,0,0.6)" }}>
          <div className="min-h-screen flex items-end sm:items-center justify-center">
            <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-6 space-y-4 max-h-screen overflow-y-auto" style={{ background: "#FFF" }}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold" style={{ color: "#1E1E1E" }}>{editingId ? "Edit Article" : "Add Article"}</h3>
                <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", color: "#8E8E93", fontSize: 22 }}>✕</button>
              </div>

              <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: "#5A5A5A" }}>Title *</label>
                  <input value={form.title} onChange={e => setField("title", e.target.value)} style={inputStyle} placeholder="Article title" />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: "#5A5A5A" }}>Category *</label>
                  <select value={form.category} onChange={e => setField("category", e.target.value)} style={inputStyle}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: "#5A5A5A" }}>Summary *</label>
                  <textarea value={form.summary} onChange={e => setField("summary", e.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical" }} placeholder="2-3 sentence summary shown on article card" />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: "#5A5A5A" }}>Full Content (optional)</label>
                  <textarea value={form.full_content} onChange={e => setField("full_content", e.target.value)} rows={6} style={{ ...inputStyle, resize: "vertical" }} placeholder="Full in-app article text. Leave empty to redirect to source URL." />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium mb-1 block" style={{ color: "#5A5A5A" }}>Source Name</label>
                    <input value={form.source_name} onChange={e => setField("source_name", e.target.value)} style={inputStyle} placeholder="SAMHSA, NIDA…" />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block" style={{ color: "#5A5A5A" }}>Publish Date</label>
                    <input type="date" value={form.publish_date} onChange={e => setField("publish_date", e.target.value)} style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: "#5A5A5A" }}>Source URL</label>
                  <input value={form.source_url} onChange={e => setField("source_url", e.target.value)} style={inputStyle} placeholder="https://..." />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: "#5A5A5A" }}>Image URL</label>
                  <input value={form.image_url} onChange={e => setField("image_url", e.target.value)} style={inputStyle} placeholder="https://..." />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: "#5A5A5A" }}>Tags (comma separated)</label>
                  <input value={form.tags} onChange={e => setField("tags", e.target.value)} style={inputStyle} placeholder="relapse, coping, NJ, reentry…" />
                </div>
                <div className="rounded-xl p-3 space-y-0.5" style={{ background: "#F7F7F8" }}>
                  <Toggle label="Approved / Published" checked={form.approved} onChange={v => setField("approved", v)} />
                  <Toggle label="Featured Article" checked={form.featured} onChange={v => setField("featured", v)} />
                  <Toggle label="Pinned to Top" checked={form.pinned} onChange={v => setField("pinned", v)} />
                  <Toggle label="Comments Enabled" checked={form.comments_enabled} onChange={v => setField("comments_enabled", v)} />
                </div>
              </div>

              <button onClick={() => saveMutation.mutate()} disabled={!form.title || !form.summary || saveMutation.isPending}
                className="w-full py-4 rounded-2xl text-sm font-bold"
                style={{ background: form.title && form.summary ? "#4A90E2" : "#E5E7EB", color: "#FFF" }}>
                {saveMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : editingId ? "Save Changes →" : "Publish Article →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}