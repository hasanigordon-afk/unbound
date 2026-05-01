import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Star, Trash2, Loader2, X, Save } from "lucide-react";
import FiveWsResponse from "@/components/fivews/FiveWsResponse";
import { generateFiveWsResponse } from "@/components/fivews/fiveWsAI";

const NAVY = "#0F1E3D";
const GOLD = "#C8932F";
const CREAM = "#F6F4EF";
const TEXT = "#1A1F2C";
const MUTED = "#4A5260";
const DIM = "#6B7280";
const BORDER = "#E4DFD3";

export default function FiveWsHistory() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch]     = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [moodFilter, setMoodFilter] = useState("");
  const [favOnly, setFavOnly]   = useState(false);
  const [openEntry, setOpenEntry] = useState(null);
  const [editingNote, setEditingNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["fivews-entries", user?.email],
    queryFn: () => base44.entities.FiveWsEntry.filter({ user_email: user.email }, "-created_date", 200),
    enabled: !!user?.email,
  });

  const allTags  = useMemo(() => [...new Set(entries.flatMap(e => e.ai_tags || []))], [entries]);
  const allMoods = useMemo(() => [...new Set(entries.map(e => e.mood_tag).filter(Boolean))], [entries]);

  const filtered = useMemo(() => {
    return entries.filter(e => {
      if (favOnly && !e.is_favorite) return false;
      if (tagFilter && !(e.ai_tags || []).includes(tagFilter)) return false;
      if (moodFilter && e.mood_tag !== moodFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const haystack = `${e.user_input} ${e.ai_response} ${e.ai_takeaway || ""} ${(e.ai_tags || []).join(" ")}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [entries, search, tagFilter, moodFilter, favOnly]);

  const toggleFav = useMutation({
    mutationFn: ({ id, is_favorite }) => base44.entities.FiveWsEntry.update(id, { is_favorite }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["fivews-entries"] }),
  });

  const deleteEntry = useMutation({
    mutationFn: (id) => base44.entities.FiveWsEntry.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fivews-entries"] });
      setOpenEntry(null);
    },
  });

  const saveNote = async () => {
    if (!openEntry) return;
    setSavingNote(true);
    await base44.entities.FiveWsEntry.update(openEntry.id, { user_note: editingNote });
    setSavingNote(false);
    setOpenEntry({ ...openEntry, user_note: editingNote });
    queryClient.invalidateQueries({ queryKey: ["fivews-entries"] });
  };

  const handleFollowUpInDetail = async (followUpInput) => {
    if (!openEntry) return;
    const history = [
      { user_input: openEntry.user_input, ai_response: openEntry.ai_response },
      ...(openEntry.follow_ups || []).map(f => ({ user_input: f.user_input, ai_response: f.ai_response })),
    ];
    const result = await generateFiveWsResponse({ userInput: followUpInput, history });
    const newFollowUp = {
      user_input: followUpInput,
      ai_response: result.response,
      timestamp: new Date().toISOString(),
    };
    const updatedFollowUps = [...(openEntry.follow_ups || []), newFollowUp];
    await base44.entities.FiveWsEntry.update(openEntry.id, { follow_ups: updatedFollowUps });
    setOpenEntry({ ...openEntry, follow_ups: updatedFollowUps });
    queryClient.invalidateQueries({ queryKey: ["fivews-entries"] });
  };

  /* ── Detail view ─────────────────────────────────────────────────────── */
  if (openEntry) {
    return (
      <div style={{ background: CREAM, minHeight: "100vh", paddingBottom: 120 }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <div style={{ padding: "44px 20px 18px", background: "#fff", borderBottom: `1px solid ${BORDER}` }}>
            <button onClick={() => setOpenEntry(null)}
              style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer",
                display: "inline-flex", alignItems: "center", gap: 6,
                color: MUTED, fontSize: 13, fontWeight: 600, marginBottom: 10 }}>
              <ArrowLeft style={{ width: 15, height: 15 }} /> Back to history
            </button>
            <p style={{ fontSize: 12, color: DIM }}>
              {new Date(openEntry.created_date).toLocaleString()}
            </p>
          </div>

          <div style={{ padding: "20px 16px" }}>
            <FiveWsResponse
              userInput={openEntry.user_input}
              aiResponse={openEntry.ai_response}
              aiSummary={openEntry.ai_summary}
              aiTakeaway={openEntry.ai_takeaway}
              tags={openEntry.ai_tags || []}
              mood={openEntry.mood_tag}
              followUps={openEntry.follow_ups || []}
              isFavorite={openEntry.is_favorite}
              onToggleFavorite={() => {
                toggleFav.mutate({ id: openEntry.id, is_favorite: !openEntry.is_favorite });
                setOpenEntry({ ...openEntry, is_favorite: !openEntry.is_favorite });
              }}
              onAskFollowUp={handleFollowUpInDetail}
              inHistoryView
            />

            {/* User note */}
            <div style={{ marginTop: 18, background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16, padding: "16px" }}>
              <p style={{ fontSize: 11, fontWeight: 800, color: NAVY,
                textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 8 }}>
                My reflection
              </p>
              <textarea
                value={editingNote || openEntry.user_note || ""}
                onChange={(e) => setEditingNote(e.target.value)}
                placeholder="Add a note or reflection for future-you…"
                rows={3}
                style={{
                  width: "100%", border: `1px solid ${BORDER}`, outline: "none", resize: "none",
                  background: CREAM, color: TEXT, fontSize: 14, padding: "10px 12px",
                  borderRadius: 10, fontFamily: "inherit", lineHeight: 1.55, boxSizing: "border-box",
                }}
              />
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                <button onClick={saveNote} disabled={savingNote}
                  style={{
                    background: NAVY, color: "#fff", border: "none",
                    padding: "8px 16px", borderRadius: 999, fontSize: 13, fontWeight: 700,
                    cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
                  }}>
                  {savingNote ? <Loader2 className="animate-spin" style={{ width: 13, height: 13 }} /> : <Save style={{ width: 13, height: 13 }} />}
                  Save note
                </button>
              </div>
            </div>

            {/* Delete */}
            <button
              onClick={() => { if (confirm("Delete this entry? This can't be undone.")) deleteEntry.mutate(openEntry.id); }}
              style={{
                marginTop: 16, background: "transparent",
                border: "1px solid rgba(181,72,61,0.3)",
                color: "#B5483D", padding: "10px 16px", borderRadius: 999,
                fontSize: 13, fontWeight: 600, cursor: "pointer",
                display: "inline-flex", alignItems: "center", gap: 6,
              }}>
              <Trash2 style={{ width: 13, height: 13 }} /> Delete entry
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── List view ───────────────────────────────────────────────────────── */
  return (
    <div style={{ background: CREAM, minHeight: "100vh", paddingBottom: 120 }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <div style={{ padding: "44px 20px 18px", background: "#fff", borderBottom: `1px solid ${BORDER}` }}>
          <button onClick={() => navigate("/FiveWs")}
            style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer",
              display: "inline-flex", alignItems: "center", gap: 6,
              color: MUTED, fontSize: 13, fontWeight: 600, marginBottom: 10 }}>
            <ArrowLeft style={{ width: 15, height: 15 }} /> Back to 5 Ws
          </button>
          <h1 style={{
            fontFamily: "'Lora', Georgia, serif",
            fontSize: 26, fontWeight: 600, color: TEXT, lineHeight: 1.2, marginBottom: 4,
          }}>
            My 5 Ws History
          </h1>
          <p style={{ fontSize: 13, color: DIM }}>
            {entries.length} {entries.length === 1 ? "entry" : "entries"} saved
          </p>
        </div>

        <div style={{ padding: "16px" }}>
          {/* Search */}
          <div style={{
            background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12,
            padding: "10px 14px", display: "flex", alignItems: "center", gap: 8, marginBottom: 12,
          }}>
            <Search style={{ width: 15, height: 15, color: DIM }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your entries…"
              style={{
                flex: 1, border: "none", outline: "none", background: "transparent",
                fontSize: 14, color: TEXT, padding: 0,
              }}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ background: "transparent", border: "none", cursor: "pointer", padding: 0 }}>
                <X style={{ width: 14, height: 14, color: DIM }} />
              </button>
            )}
          </div>

          {/* Filter pills */}
          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 6, marginBottom: 16 }}>
            <FilterPill label="All" active={!favOnly && !tagFilter && !moodFilter}
              onClick={() => { setFavOnly(false); setTagFilter(""); setMoodFilter(""); }} />
            <FilterPill label="⭐ Favorites" active={favOnly}
              onClick={() => { setFavOnly(!favOnly); }} />
            {allTags.slice(0, 12).map(t => (
              <FilterPill key={t} label={`#${t}`} active={tagFilter === t}
                onClick={() => setTagFilter(tagFilter === t ? "" : t)} />
            ))}
            {allMoods.slice(0, 8).map(m => (
              <FilterPill key={m} label={m} active={moodFilter === m}
                onClick={() => setMoodFilter(moodFilter === m ? "" : m)} />
            ))}
          </div>

          {/* List */}
          {isLoading ? (
            <div style={{ textAlign: "center", padding: 40 }}>
              <Loader2 className="animate-spin" style={{ width: 22, height: 22, color: GOLD }} />
            </div>
          ) : filtered.length === 0 ? (
            <div style={{
              background: "#fff", border: `1px dashed ${BORDER}`, borderRadius: 16,
              padding: "32px 20px", textAlign: "center",
            }}>
              <p style={{ fontSize: 14, color: TEXT, fontWeight: 600, marginBottom: 6 }}>
                {entries.length === 0 ? "No entries yet" : "No matches"}
              </p>
              <p style={{ fontSize: 12.5, color: DIM, lineHeight: 1.6 }}>
                {entries.length === 0
                  ? "Start a 5 Ws conversation and save it to see it here."
                  : "Try clearing your filters."}
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filtered.map(e => (
                <button key={e.id} onClick={() => { setOpenEntry(e); setEditingNote(e.user_note || ""); }}
                  style={{
                    textAlign: "left", background: "#fff", border: `1px solid ${BORDER}`,
                    borderRadius: 14, padding: "14px 16px", cursor: "pointer", width: "100%",
                    fontFamily: "'DM Sans', sans-serif",
                  }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <p style={{ fontSize: 11, color: DIM }}>
                      {new Date(e.created_date).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                    {e.is_favorite && <Star style={{ width: 13, height: 13, color: GOLD }} fill={GOLD} />}
                  </div>
                  <p style={{
                    fontSize: 14, color: TEXT, lineHeight: 1.5, fontWeight: 600, marginBottom: 6,
                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}>
                    {e.user_input}
                  </p>
                  {(e.ai_tags?.length > 0 || e.mood_tag) && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {e.mood_tag && (
                        <span style={tagStyle(NAVY)}>{e.mood_tag}</span>
                      )}
                      {(e.ai_tags || []).slice(0, 3).map(t => (
                        <span key={t} style={tagStyle(GOLD)}>#{t}</span>
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterPill({ label, active, onClick }) {
  return (
    <button onClick={onClick}
      style={{
        flexShrink: 0, padding: "6px 13px", borderRadius: 999,
        background: active ? NAVY : "#fff",
        border: `1px solid ${active ? NAVY : BORDER}`,
        color: active ? "#fff" : MUTED,
        fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
        fontFamily: "'DM Sans', sans-serif",
      }}>
      {label}
    </button>
  );
}

function tagStyle(color) {
  return {
    fontSize: 10.5, fontWeight: 600, color,
    background: color === GOLD ? "rgba(200,147,47,0.10)" : "rgba(15,30,61,0.07)",
    border: `1px solid ${color === GOLD ? "rgba(200,147,47,0.24)" : "rgba(15,30,61,0.14)"}`,
    padding: "2px 8px", borderRadius: 999,
  };
}