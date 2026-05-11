import React, { useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Upload, Link as LinkIcon, Star, Eye, EyeOff, Loader2, Film, Trash2 } from "lucide-react";

const CATEGORIES = [
  ["motivation", "Motivation"],
  ["recovery", "Recovery"],
  ["veterans", "Veterans"],
  ["reentry", "Reentry"],
  ["mental_health", "Mental Health"],
  ["fitness_health", "Fitness & Health"],
  ["discipline", "Discipline"],
  ["celebrity_comebacks", "Celebrity Comebacks"],
  ["inspirational_stories", "Inspirational Stories"],
  ["ah_ha_moments", "Ah Ha Moments"],
  ["faith_hope", "Faith & Hope"],
  ["music_for_strength", "Music For Strength"],
  ["educational", "Educational"],
  ["ai_technology", "AI & Technology"],
  ["community_stories", "Community Stories"],
];

const initialForm = {
  title: "",
  description: "",
  category: "motivation",
  tags: "",
  source_type: "upload",
  source_url: "",
  inspirational_quote: "",
  featured: false,
  published: true,
};

function getYouTubeEmbed(url) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^&?/]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
}

function getEmbedUrl(type, url) {
  if (!url) return "";
  if (type === "youtube") return getYouTubeEmbed(url);
  if (type === "tiktok") return url.includes("/embed") ? url : url;
  if (type === "instagram") return url.includes("/embed") ? url : `${url.replace(/\/$/, "")}/embed`;
  return url;
}

export default function VideoAdmin() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(initialForm);
  const [videoFile, setVideoFile] = useState(null);
  const [thumbFile, setThumbFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const { data: videos = [], isLoading } = useQuery({
    queryKey: ["admin-video-content"],
    queryFn: () => base44.entities.VideoContent.list("-created_date", 80),
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      let videoUrl = form.source_url;
      let thumbnailUrl = "";

      if (videoFile) {
        const uploaded = await base44.integrations.Core.UploadFile({ file: videoFile });
        videoUrl = uploaded.file_url;
      }
      if (thumbFile) {
        const uploadedThumb = await base44.integrations.Core.UploadFile({ file: thumbFile });
        thumbnailUrl = uploadedThumb.file_url;
      }

      return base44.entities.VideoContent.create({
        title: form.title,
        description: form.description,
        category: form.category,
        tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
        source_type: form.source_type,
        video_url: videoUrl,
        embed_url: form.source_type === "upload" ? "" : getEmbedUrl(form.source_type, videoUrl),
        thumbnail_url: thumbnailUrl,
        inspirational_quote: form.inspirational_quote,
        featured: form.featured,
        published: form.published,
        review_status: "approved",
        upload_origin: "admin",
      });
    },
    onSuccess: () => {
      setForm(initialForm);
      setVideoFile(null);
      setThumbFile(null);
      queryClient.invalidateQueries({ queryKey: ["admin-video-content"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.VideoContent.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-video-content"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.VideoContent.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-video-content"] }),
  });

  const stats = useMemo(() => ({
    total: videos.length,
    published: videos.filter(v => v.published).length,
    featured: videos.filter(v => v.featured).length,
  }), [videos]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) setVideoFile(file);
  };

  const canSubmit = form.title && (videoFile || form.source_url);

  return (
    <div style={{ minHeight: "100vh", color: "var(--text)", padding: "24px 18px 140px" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <div className="card-glow" style={{ padding: 24, marginBottom: 18, background: "linear-gradient(135deg, rgba(91,141,239,0.16), rgba(240,183,83,0.10))" }}>
          <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ width: 54, height: 54, borderRadius: 18, background: "linear-gradient(135deg, var(--accent), var(--purple))", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--glow)" }}>
              <Film size={26} />
            </div>
            <div style={{ flex: 1 }}>
              <p className="section-label" style={{ margin: 0, color: "var(--gold)" }}>Admin Media Portal</p>
              <h1 style={{ fontSize: 34, margin: "4px 0 6px" }}>Fill Re-silient with hope</h1>
              <p style={{ color: "var(--text-muted)", maxWidth: 680 }}>Upload curated videos, import social embeds, publish featured stories, and build a cinematic library of motivation, recovery, and transformation.</p>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12, marginBottom: 18 }}>
          <Stat label="Total Videos" value={stats.total} />
          <Stat label="Published" value={stats.published} />
          <Stat label="Featured" value={stats.featured} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.1fr) minmax(320px, .9fr)", gap: 18 }} className="video-admin-grid">
          <form className="card" onSubmit={(e) => { e.preventDefault(); if (canSubmit) uploadMutation.mutate(); }} style={{ padding: 20 }}>
            <h2 style={{ fontSize: 22, marginBottom: 14 }}>Upload / Import Video</h2>

            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              style={{
                border: `1px dashed ${dragActive ? "var(--gold)" : "var(--border-glow)"}`,
                borderRadius: 22,
                padding: 22,
                textAlign: "center",
                background: dragActive ? "var(--gold-dim)" : "rgba(255,255,255,0.03)",
                marginBottom: 14,
              }}
            >
              <Upload style={{ margin: "0 auto 10px", color: "var(--gold)" }} />
              <p style={{ fontWeight: 800 }}>Drag & drop a video file</p>
              <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "5px 0 14px" }}>or choose a file from your device</p>
              <input type="file" accept="video/*,audio/*" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} />
              {videoFile && <p style={{ marginTop: 10, color: "var(--gold)", fontSize: 13 }}>{videoFile.name}</p>}
            </div>

            <Field label="Title"><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="A comeback story that needs to be seen" /></Field>
            <Field label="Description"><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What this video helps people feel, learn, or remember..." rows={4} /></Field>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Category">
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                </select>
              </Field>
              <Field label="Source">
                <select value={form.source_type} onChange={(e) => setForm({ ...form, source_type: e.target.value })}>
                  <option value="upload">File Upload</option>
                  <option value="youtube">YouTube URL</option>
                  <option value="tiktok">TikTok Embed/URL</option>
                  <option value="instagram">Instagram Embed/URL</option>
                  <option value="external_embed">Other Embed</option>
                </select>
              </Field>
            </div>

            {form.source_type !== "upload" && (
              <Field label="Video URL / Embed">
                <div style={{ position: "relative" }}>
                  <LinkIcon size={16} style={{ position: "absolute", left: 12, top: 14, color: "var(--text-dim)" }} />
                  <input style={{ paddingLeft: 36 }} value={form.source_url} onChange={(e) => setForm({ ...form, source_url: e.target.value })} placeholder="Paste YouTube, TikTok, Instagram, or embed URL" />
                </div>
              </Field>
            )}

            <Field label="Tags"><input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="recovery, veteran, discipline, hope" /></Field>
            <Field label="Quote Overlay"><input value={form.inspirational_quote} onChange={(e) => setForm({ ...form, inspirational_quote: e.target.value })} placeholder="One line of hope shown over the video" /></Field>
            <Field label="Thumbnail"><input type="file" accept="image/*" onChange={(e) => setThumbFile(e.target.files?.[0] || null)} /></Field>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", margin: "14px 0" }}>
              <Toggle active={form.featured} onClick={() => setForm({ ...form, featured: !form.featured })} label="Featured" icon={Star} />
              <Toggle active={form.published} onClick={() => setForm({ ...form, published: !form.published })} label={form.published ? "Published" : "Unpublished"} icon={form.published ? Eye : EyeOff} />
            </div>

            <button className="btn-primary" type="submit" disabled={!canSubmit || uploadMutation.isPending} style={{ width: "100%", opacity: !canSubmit ? .55 : 1 }}>
              {uploadMutation.isPending ? "Uploading..." : "Publish Video"}
            </button>
          </form>

          <div className="card" style={{ padding: 20 }}>
            <h2 style={{ fontSize: 22, marginBottom: 14 }}>Video Library</h2>
            {isLoading ? (
              <Loader2 className="animate-spin" style={{ color: "var(--accent)" }} />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: 760, overflow: "auto", paddingRight: 4 }}>
                {videos.map(video => (
                  <div key={video.id} style={{ border: "1px solid var(--border)", borderRadius: 18, padding: 12, background: "rgba(255,255,255,0.03)" }}>
                    <div style={{ display: "flex", gap: 12 }}>
                      <div style={{ width: 92, height: 62, borderRadius: 12, background: video.thumbnail_url ? `url(${video.thumbnail_url}) center/cover` : "var(--surface)", flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{video.title}</p>
                        <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>{CATEGORIES.find(c => c[0] === video.category)?.[1] || video.category}</p>
                        <div style={{ display: "flex", gap: 7, marginTop: 8, flexWrap: "wrap" }}>
                          <SmallButton onClick={() => updateMutation.mutate({ id: video.id, data: { featured: !video.featured } })}>{video.featured ? "Unfeature" : "Feature"}</SmallButton>
                          <SmallButton onClick={() => updateMutation.mutate({ id: video.id, data: { published: !video.published } })}>{video.published ? "Unpublish" : "Publish"}</SmallButton>
                          <button onClick={() => deleteMutation.mutate(video.id)} style={{ border: "1px solid rgba(248,113,113,.35)", color: "var(--red)", background: "transparent", borderRadius: 999, padding: "6px 9px", cursor: "pointer" }}><Trash2 size={13} /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {!videos.length && <p style={{ color: "var(--text-muted)", textAlign: "center", padding: 30 }}>No videos uploaded yet.</p>}
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`@media (max-width: 860px) { .video-admin-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}

function Field({ label, children }) {
  return <label style={{ display: "grid", gap: 7, marginBottom: 12 }}><span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".08em" }}>{label}</span>{children}</label>;
}

function Toggle({ active, onClick, label, icon: Icon }) {
  return <button type="button" onClick={onClick} style={{ display: "inline-flex", alignItems: "center", gap: 7, borderRadius: 999, padding: "9px 13px", border: active ? "1px solid var(--gold)" : "1px solid var(--border)", background: active ? "var(--gold-dim)" : "var(--surface)", color: active ? "var(--gold)" : "var(--text-muted)", cursor: "pointer", fontWeight: 800 }}><Icon size={15} />{label}</button>;
}

function SmallButton({ children, onClick }) {
  return <button onClick={onClick} style={{ border: "1px solid var(--border)", color: "var(--text-muted)", background: "var(--surface)", borderRadius: 999, padding: "6px 10px", fontSize: 12, cursor: "pointer", fontWeight: 800 }}>{children}</button>;
}

function Stat({ label, value }) {
  return <div className="card-soft" style={{ padding: 16 }}><p style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".1em" }}>{label}</p><p style={{ fontSize: 28, fontWeight: 900, color: "var(--text)", marginTop: 4 }}>{value}</p></div>;
}