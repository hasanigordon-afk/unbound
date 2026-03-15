import React, { useState } from "react";
import { X, Upload, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const CATEGORIES = [
  { value: "artwork",    label: "Artwork",     emoji: "🎨" },
  { value: "clothing",   label: "Clothing",    emoji: "👕" },
  { value: "poetry",     label: "Poetry",      emoji: "📝" },
  { value: "music",      label: "Music",       emoji: "🎵" },
  { value: "photography",label: "Photography", emoji: "📷" },
  { value: "crafts",     label: "Crafts",      emoji: "🧶" },
  { value: "motivation", label: "Motivation",  emoji: "🔥" },
  { value: "skills",     label: "Skills",      emoji: "⚡" },
  { value: "services",   label: "Services",    emoji: "🤝" },
  { value: "other",      label: "Other",       emoji: "✨" },
];

export default function PostTalentModal({ user, onClose }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ title: "", description: "", category: "", tags: "", image_url: "" });
  const [uploading, setUploading] = useState(false);

  const mutation = useMutation({
    mutationFn: async (data) => {
      // Ensure creator profile exists
      const profiles = await base44.entities.CreatorProfile.filter({ user_email: user.email });
      if (profiles.length === 0) {
        await base44.entities.CreatorProfile.create({
          user_email: user.email,
          display_name: user.full_name || "Creator",
        });
      }
      return base44.entities.TalentPost.create({
        ...data,
        creator_email: user.email,
        creator_name: user.full_name || "Creator",
        tags: data.tags ? data.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
        like_count: 0, comment_count: 0, save_count: 0,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["talent-posts"] });
      onClose();
    },
  });

  const handleImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, image_url: file_url }));
    setUploading(false);
  };

  const canSubmit = form.title && form.category && !mutation.isPending;

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 60,
      background: "rgba(0,0,0,0.75)", display: "flex",
      alignItems: "flex-end", justifyContent: "center",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "100%", maxWidth: 520,
        background: "linear-gradient(170deg,#1A0A2E,#0D1A2E)",
        border: "1px solid rgba(168,85,247,0.2)",
        borderRadius: "24px 24px 0 0",
        padding: "20px 20px 40px", maxHeight: "90vh", overflowY: "auto",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div>
            <p style={{ fontSize: 11, color: "#A855F7", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em" }}>
              Share Your Gift
            </p>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: "#fff" }}>Post Your Talent</h3>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)" }}>
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {/* Category select */}
        <p style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>Category *</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => setForm(f => ({ ...f, category: cat.value }))}
              style={{
                padding: "7px 12px", borderRadius: 20, border: "none", cursor: "pointer",
                background: form.category === cat.value ? "rgba(168,85,247,0.25)" : "rgba(255,255,255,0.06)",
                border: `1px solid ${form.category === cat.value ? "rgba(168,85,247,0.5)" : "transparent"}`,
                color: form.category === cat.value ? "#C084FC" : "rgba(255,255,255,0.4)",
                fontSize: 12, fontWeight: 700,
              }}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>

        {/* Title */}
        <p style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>Title *</p>
        <input
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          placeholder="Give your post a title..."
          style={{
            width: "100%", padding: "12px 14px", borderRadius: 12, marginBottom: 12,
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
            color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box",
          }}
        />

        {/* Description */}
        <p style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>Description</p>
        <textarea
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          placeholder="Tell the community about your work..."
          rows={3}
          style={{
            width: "100%", padding: "12px 14px", borderRadius: 12, marginBottom: 12,
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
            color: "#fff", fontSize: 13, outline: "none", resize: "none", boxSizing: "border-box",
          }}
        />

        {/* Tags */}
        <p style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>Tags (comma-separated)</p>
        <input
          value={form.tags}
          onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
          placeholder="art, recovery, handmade..."
          style={{
            width: "100%", padding: "12px 14px", borderRadius: 12, marginBottom: 12,
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
            color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box",
          }}
        />

        {/* Image upload */}
        <p style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>Image (optional)</p>
        {form.image_url ? (
          <div style={{ position: "relative", marginBottom: 16 }}>
            <img src={form.image_url} alt="" style={{ width: "100%", height: 160, objectFit: "cover", borderRadius: 12 }} />
            <button
              onClick={() => setForm(f => ({ ...f, image_url: "" }))}
              style={{ position: "absolute", top: 8, right: 8, width: 26, height: 26, borderRadius: "50%",
                background: "rgba(0,0,0,0.6)", border: "none", cursor: "pointer", color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <X style={{ width: 12, height: 12 }} />
            </button>
          </div>
        ) : (
          <label style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            padding: "16px", borderRadius: 12, marginBottom: 16,
            background: "rgba(255,255,255,0.03)", border: "2px dashed rgba(255,255,255,0.12)",
            cursor: "pointer", color: "rgba(255,255,255,0.35)", fontSize: 13,
          }}>
            {uploading ? <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" /> : <Upload style={{ width: 16, height: 16 }} />}
            {uploading ? "Uploading…" : "Upload an image"}
            <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleImage} />
          </label>
        )}

        <button
          onClick={() => mutation.mutate(form)}
          disabled={!canSubmit}
          style={{
            width: "100%", padding: "14px", borderRadius: 14,
            background: canSubmit ? "linear-gradient(135deg,#A855F7,#7C3AED)" : "rgba(255,255,255,0.08)",
            border: "none", color: canSubmit ? "#fff" : "rgba(255,255,255,0.3)",
            fontWeight: 800, fontSize: 15, cursor: canSubmit ? "pointer" : "not-allowed",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
        >
          {mutation.isPending ? <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" /> : "✨ Share Your Gift"}
        </button>
      </div>
    </div>
  );
}