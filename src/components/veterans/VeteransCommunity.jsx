import React, { useState, useMemo } from "react";
import { Plus, Send, Loader2 } from "lucide-react";
import { VET_COLORS, BRANCHES, POST_TAGS, getBranch } from "./veteransData";

function Reaction({ emoji, label, count, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "5px 10px", borderRadius: 20, cursor: "pointer",
      background: active ? VET_COLORS.oliveDim : VET_COLORS.bg,
      border: `1px solid ${active ? VET_COLORS.olive + "40" : VET_COLORS.border}`,
      color: active ? VET_COLORS.olive : VET_COLORS.muted,
      fontSize: 11, fontWeight: 700,
    }}>
      <span>{emoji}</span>
      <span>{label}</span>
      {count > 0 && <span>· {count}</span>}
    </button>
  );
}

function ComposeSheet({ profile, onSubmit, onClose, saving }) {
  const [content, setContent] = useState("");
  const [isAnon, setIsAnon] = useState(true);
  const [tags, setTags] = useState([]);

  const toggleTag = (k) => setTags(t => t.includes(k) ? t.filter(x => x !== k) : [...t, k]);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(28,20,16,0.6)", display: "flex", alignItems: "flex-end" }}>
      <div style={{ background: VET_COLORS.surface, width: "100%", maxWidth: 480, margin: "0 auto", borderRadius: "20px 20px 0 0", padding: "24px 20px 32px", maxHeight: "92vh", overflowY: "auto" }}>
        <h3 style={{ fontFamily: "'Lora', serif", fontSize: 20, fontWeight: 600, color: VET_COLORS.text, marginBottom: 14 }}>
          Share with the squad
        </h3>

        <textarea
          value={content}
          onChange={e => setContent(e.target.value.slice(0, 1000))}
          rows={5}
          placeholder="What's on your mind, brother/sister?"
          style={{
            width: "100%", padding: "12px 14px", borderRadius: 12,
            border: `1px solid ${VET_COLORS.border}`, background: VET_COLORS.bg,
            fontSize: 14, outline: "none", resize: "none",
            boxSizing: "border-box", fontFamily: "inherit", lineHeight: 1.55, marginBottom: 14,
          }}
        />

        <p style={{ fontSize: 10, fontWeight: 700, color: VET_COLORS.dim, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 8 }}>
          Tags <span style={{ fontWeight: 400, textTransform: "none" }}>(optional)</span>
        </p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
          {POST_TAGS.map(t => {
            const sel = tags.includes(t.key);
            return (
              <button key={t.key} onClick={() => toggleTag(t.key)} style={{
                padding: "5px 12px", borderRadius: 20, cursor: "pointer", fontSize: 11, fontWeight: 600,
                background: sel ? VET_COLORS.oliveDim : VET_COLORS.bg,
                border: `1px solid ${sel ? VET_COLORS.olive : VET_COLORS.border}`,
                color: sel ? VET_COLORS.olive : VET_COLORS.muted,
              }}>
                {t.label}
              </button>
            );
          })}
        </div>

        <button onClick={() => setIsAnon(v => !v)} style={{
          width: "100%", background: VET_COLORS.bg, border: `1px solid ${VET_COLORS.border}`,
          borderRadius: 12, padding: "12px 14px", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16,
        }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: VET_COLORS.text }}>
            {isAnon ? "Post anonymously" : `Post as ${profile?.first_name || "you"}`}
          </span>
          <div style={{
            width: 34, height: 20, borderRadius: 10,
            background: isAnon ? VET_COLORS.olive : VET_COLORS.border,
            position: "relative", transition: "background 0.2s",
          }}>
            <div style={{
              position: "absolute", top: 2, left: isAnon ? 16 : 2,
              width: 16, height: 16, borderRadius: "50%",
              background: "#fff", transition: "left 0.2s",
            }} />
          </div>
        </button>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: 13, borderRadius: 50, border: `1px solid ${VET_COLORS.border}`,
            background: VET_COLORS.surface, color: VET_COLORS.muted, fontWeight: 700, fontSize: 14, cursor: "pointer",
          }}>Cancel</button>
          <button
            onClick={() => onSubmit({ content: content.trim(), is_anonymous: isAnon, tags })}
            disabled={!content.trim() || saving}
            style={{
              flex: 2, padding: 13, borderRadius: 50, border: "none",
              background: content.trim() ? VET_COLORS.olive : VET_COLORS.border,
              color: "#fff", fontWeight: 700, fontSize: 14,
              cursor: content.trim() ? "pointer" : "default",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            {saving ? <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" /> : <Send style={{ width: 14, height: 14 }} />}
            Post
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VeteransCommunity({ posts, profile, myReactions, onCreate, onReact, creating }) {
  const [filter, setFilter] = useState("all");
  const [composeOpen, setComposeOpen] = useState(false);

  const filtered = useMemo(() => {
    if (filter === "mine") return posts.filter(p => p.branch === profile?.branch);
    if (filter === "recent") return [...posts].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 50);
    return posts;
  }, [posts, filter, profile]);

  const formatTime = (d) => {
    const diff = Math.floor((Date.now() - new Date(d)) / 60000);
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  return (
    <div style={{ padding: "20px 16px 40px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <p style={{ fontFamily: "'Lora', serif", fontSize: 22, fontWeight: 600, color: VET_COLORS.text, marginBottom: 2 }}>
            Veteran Community
          </p>
          <p style={{ fontSize: 12, color: VET_COLORS.muted }}>Connect. No pressure.</p>
        </div>
        <button onClick={() => setComposeOpen(true)} style={{
          background: VET_COLORS.olive, color: "#fff", border: "none",
          padding: "10px 14px", borderRadius: 50, cursor: "pointer",
          fontWeight: 700, fontSize: 12,
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <Plus style={{ width: 14, height: 14 }} strokeWidth={2.5} />
          Post
        </button>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {[
          { k: "all", label: "All Veterans" },
          { k: "mine", label: "My Branch" },
          { k: "recent", label: "Recently Active" },
        ].map(f => {
          const sel = filter === f.k;
          return (
            <button key={f.k} onClick={() => setFilter(f.k)} style={{
              padding: "7px 12px", borderRadius: 20, cursor: "pointer",
              background: sel ? VET_COLORS.navyDim : VET_COLORS.surface,
              border: `1px solid ${sel ? VET_COLORS.navy + "40" : VET_COLORS.border}`,
              color: sel ? VET_COLORS.navy : VET_COLORS.muted,
              fontWeight: 700, fontSize: 12,
            }}>{f.label}</button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ padding: "40px 20px", textAlign: "center" }}>
          <p style={{ fontSize: 13, color: VET_COLORS.dim, lineHeight: 1.6 }}>
            No posts yet. Be the first to share.
          </p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map(p => {
          const branch = getBranch(p.branch);
          const name = p.is_anonymous ? "Anonymous Veteran" : (p.display_name || "Veteran");
          const myRx = myReactions[p.id];
          return (
            <div key={p.id} style={{
              background: VET_COLORS.surface, border: `1px solid ${VET_COLORS.border}`,
              borderRadius: 14, padding: "14px 16px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: VET_COLORS.oliveDim,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
                }}>
                  {branch.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: VET_COLORS.text }}>{name}</p>
                  <p style={{ fontSize: 11, color: VET_COLORS.dim }}>
                    {branch.label} · {formatTime(p.created_date)}
                  </p>
                </div>
              </div>

              <p style={{ fontSize: 14, color: VET_COLORS.text, lineHeight: 1.6, marginBottom: 10, whiteSpace: "pre-wrap" }}>
                {p.content}
              </p>

              {p.tags?.length > 0 && (
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
                  {p.tags.map(t => {
                    const tag = POST_TAGS.find(x => x.key === t);
                    return tag ? (
                      <span key={t} style={{
                        fontSize: 10, fontWeight: 600, color: VET_COLORS.olive,
                        background: VET_COLORS.oliveDim, padding: "2px 8px", borderRadius: 20,
                      }}>{tag.label}</span>
                    ) : null;
                  })}
                </div>
              )}

              <div style={{ display: "flex", gap: 6 }}>
                <Reaction emoji="🫡" label="Salute"   count={p.reaction_salute   || 0} active={myRx === "salute"}   onClick={() => onReact(p, "salute")} />
                <Reaction emoji="💪" label="Strength" count={p.reaction_strength || 0} active={myRx === "strength"} onClick={() => onReact(p, "strength")} />
                <Reaction emoji="🎖️" label="Respect"  count={p.reaction_respect  || 0} active={myRx === "respect"}  onClick={() => onReact(p, "respect")} />
              </div>
            </div>
          );
        })}
      </div>

      {composeOpen && (
        <ComposeSheet
          profile={profile}
          saving={creating}
          onClose={() => setComposeOpen(false)}
          onSubmit={(data) => { onCreate(data); setComposeOpen(false); }}
        />
      )}
    </div>
  );
}