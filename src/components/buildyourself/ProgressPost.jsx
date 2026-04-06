import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Image as ImageIcon, X } from "lucide-react";
import { INTERESTS } from "./InterestSelector";

const POST_TYPES = [
  { id: "share",       label: "Share",       emoji: "💬" },
  { id: "milestone",   label: "Milestone",   emoji: "🏆" },
  { id: "work",        label: "Show Work",   emoji: "🎨" },
  { id: "goal",        label: "Goal",        emoji: "🎯" },
  { id: "reflection",  label: "Reflection",  emoji: "💭" },
];

export default function ProgressPost({ userInterests, displayName, userEmail, onPosted }) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState("share");
  const [tags, setTags] = useState(userInterests.slice(0, 1));
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleImage = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
  };

  const handlePost = async () => {
    setSaving(true);
    let image_url = null;
    if (imageFile) {
      const res = await base44.integrations.Core.UploadFile({ file: imageFile });
      image_url = res.file_url;
    }
    await base44.entities.BuildYourselfPost.create({
      user_email: userEmail, display_name: displayName,
      content: content.trim(), post_type: postType,
      interest_tags: tags, image_url, is_public: true,
    });
    setContent(""); setImageFile(null); setImagePreview(null); setOpen(false);
    setSaving(false);
    onPosted?.();
  };

  const toggleTag = (id) => setTags(t => t.includes(id) ? t.filter(x => x !== id) : [...t, id]);

  if (!open) return (
    <button onClick={() => setOpen(true)}
      style={{ width: "100%", padding: "14px 18px", borderRadius: 16, border: "none", cursor: "pointer",
        background: "rgba(255,255,255,0.05)", border: "1.5px dashed rgba(255,255,255,0.1)",
        color: "rgba(255,255,255,0.4)", fontSize: 14, fontWeight: 600, textAlign: "left" }}>
      ✏️ Share your progress, a goal, or anything you're building…
    </button>
  );

  return (
    <div style={{ borderRadius: 20, padding: "20px", background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.1)" }}>

      {/* Post type */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        {POST_TYPES.map(pt => (
          <button key={pt.id} onClick={() => setPostType(pt.id)}
            style={{ padding: "6px 12px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 12,
              background: postType === pt.id ? "rgba(45,212,191,0.15)" : "rgba(255,255,255,0.05)",
              border: `1.5px solid ${postType === pt.id ? "rgba(45,212,191,0.4)" : "rgba(255,255,255,0.08)"}`,
              color: postType === pt.id ? "#2DD4BF" : "rgba(255,255,255,0.45)", fontWeight: 700 }}>
            {pt.emoji} {pt.label}
          </button>
        ))}
      </div>

      <textarea value={content} onChange={e => setContent(e.target.value)}
        placeholder="What are you building today? Share a win, a challenge, or just where you're at…"
        rows={4}
        style={{ width: "100%", padding: "12px 14px", borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)",
          color: "#fff", fontSize: 14, resize: "none", outline: "none",
          boxSizing: "border-box", lineHeight: 1.6, marginBottom: 12 }} />

      {/* Image upload */}
      {imagePreview ? (
        <div style={{ position: "relative", marginBottom: 12 }}>
          <img src={imagePreview} alt="preview"
            style={{ width: "100%", borderRadius: 12, maxHeight: 200, objectFit: "cover" }} />
          <button onClick={() => { setImageFile(null); setImagePreview(null); }}
            style={{ position: "absolute", top: 8, right: 8, width: 28, height: 28, borderRadius: "50%",
              background: "rgba(0,0,0,0.6)", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X style={{ color: "#fff", width: 14, height: 14 }} />
          </button>
        </div>
      ) : (
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
          padding: "9px 14px", borderRadius: 10, border: "1px dashed rgba(255,255,255,0.1)",
          background: "rgba(255,255,255,0.03)", marginBottom: 12, width: "fit-content" }}>
          <ImageIcon style={{ color: "rgba(255,255,255,0.3)", width: 14, height: 14 }} />
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontWeight: 600 }}>Add photo</span>
          <input type="file" accept="image/*" onChange={handleImage} style={{ display: "none" }} />
        </label>
      )}

      {/* Tags from user interests */}
      {userInterests.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 8, fontWeight: 600 }}>Tag an interest:</p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {userInterests.map(iid => {
              const int = INTERESTS.find(x => x.id === iid);
              if (!int) return null;
              const active = tags.includes(iid);
              return (
                <button key={iid} onClick={() => toggleTag(iid)}
                  style={{ padding: "5px 10px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 11,
                    background: active ? int.color + "20" : "rgba(255,255,255,0.05)",
                    border: `1.5px solid ${active ? int.color + "50" : "rgba(255,255,255,0.07)"}`,
                    color: active ? int.color : "rgba(255,255,255,0.4)", fontWeight: 700 }}>
                  {int.emoji} {int.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => setOpen(false)}
          style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)",
            background: "transparent", color: "rgba(255,255,255,0.4)", fontWeight: 700, cursor: "pointer" }}>
          Cancel
        </button>
        <button onClick={handlePost} disabled={!content.trim() || saving}
          style={{ flex: 2, padding: "12px", borderRadius: 12, border: "none", cursor: "pointer",
            background: content.trim() ? "linear-gradient(135deg,#2DD4BF,#22C5B0)" : "rgba(255,255,255,0.07)",
            color: content.trim() ? "#07090F" : "rgba(255,255,255,0.3)",
            fontWeight: 800, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {saving ? <Loader2 style={{ width: 15, height: 15 }} className="animate-spin" /> : null}
          Post
        </button>
      </div>
    </div>
  );
}