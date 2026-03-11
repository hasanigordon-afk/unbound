import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Plus, ChevronDown, ChevronUp } from "lucide-react";

const MOOD_OPTIONS = [
  { v: 1, e: "😢", l: "Low" }, { v: 2, e: "😕", l: "Struggling" },
  { v: 3, e: "😐", l: "Okay" }, { v: 4, e: "🙂", l: "Good" }, { v: 5, e: "😊", l: "Great" },
];

function EntryCard({ entry }) {
  const [open, setOpen] = useState(false);
  const mood = MOOD_OPTIONS.find(m => m.v === entry.mood_rating);
  const date = new Date(entry.created_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
  return (
    <div style={{ background: "#FFF", border: "1px solid #E5E7EB", borderRadius: 16, overflow: "hidden" }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: "100%", background: "none", border: "none", padding: "16px 18px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", textAlign: "left" }}>
        <span style={{ fontSize: 24, flexShrink: 0 }}>{mood?.e || "😐"}</span>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#1A3C2E" }}>{date}</p>
          <p style={{ fontSize: 12, color: "#9CA3AF" }}>{entry.content?.substring(0, 55)}{entry.content?.length > 55 ? "..." : ""}</p>
        </div>
        {entry.craving_intensity != null && (
          <span style={{ fontSize: 11, fontWeight: 700, color: entry.craving_intensity >= 7 ? "#DC2626" : "#6B7280", background: "#F3F4F6", borderRadius: 8, padding: "3px 8px" }}>
            Craving: {entry.craving_intensity}/10
          </span>
        )}
        {open ? <ChevronUp className="w-4 h-4" style={{ color: "#9CA3AF" }} /> : <ChevronDown className="w-4 h-4" style={{ color: "#9CA3AF" }} />}
      </button>
      {open && (
        <div style={{ padding: "0 18px 18px", borderTop: "1px solid #F3F4F6" }}>
          <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, paddingTop: 14, whiteSpace: "pre-wrap" }}>{entry.content}</p>
        </div>
      )}
    </div>
  );
}

export default function JournalSection() {
  const [writing, setWriting] = useState(false);
  const [mood, setMood] = useState(3);
  const [craving, setCraving] = useState(null);
  const [showCraving, setShowCraving] = useState(false);
  const [content, setContent] = useState("");
  const qc = useQueryClient();

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: entries = [] } = useQuery({
    queryKey: ["journal-entries", user?.email],
    queryFn: () => base44.entities.JournalEntry.filter({ created_by: user.email }, "-created_date", 50),
    enabled: !!user,
  });

  const saveMutation = useMutation({
    mutationFn: () => base44.entities.JournalEntry.create({
      content,
      mood_rating: mood,
      craving_intensity: showCraving ? craving : null,
    }),
    onSuccess: () => {
      qc.invalidateQueries(["journal-entries"]);
      setContent(""); setMood(3); setCraving(null); setShowCraving(false); setWriting(false);
    },
  });

  return (
    <div style={{ padding: "24px 20px", maxWidth: 560, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1A3C2E", marginBottom: 2 }}>📓 Recovery Journal</h2>
          <p style={{ fontSize: 13, color: "#9CA3AF" }}>{entries.length} private entries</p>
        </div>
        {!writing && (
          <button onClick={() => setWriting(true)} style={{ background: "#2E7D5E", color: "#FFF", border: "none", borderRadius: 12, padding: "10px 18px", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <Plus className="w-4 h-4" /> New Entry
          </button>
        )}
      </div>

      {writing && (
        <div style={{ background: "#FFF", border: "1px solid #D4EAE1", borderRadius: 20, padding: "22px", marginBottom: 20 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#1A3C2E", marginBottom: 12 }}>How are you feeling?</p>
          <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
            {MOOD_OPTIONS.map(m => (
              <button key={m.v} onClick={() => setMood(m.v)} style={{ flex: 1, background: mood === m.v ? "#E8F5E9" : "#F9FAFB", border: `2px solid ${mood === m.v ? "#2E7D5E" : "#E5E7EB"}`, borderRadius: 12, padding: "10px 4px", cursor: "pointer", textAlign: "center" }}>
                <p style={{ fontSize: 22 }}>{m.e}</p>
                <p style={{ fontSize: 10, fontWeight: 600, color: mood === m.v ? "#2E7D5E" : "#9CA3AF" }}>{m.l}</p>
              </button>
            ))}
          </div>

          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="What's on your mind? This is a safe, private space..."
            rows={5}
            style={{ width: "100%", background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 12, padding: "14px", fontSize: 14, color: "#374151", resize: "vertical", fontFamily: "inherit", outline: "none", boxSizing: "border-box", lineHeight: 1.6 }}
          />

          <div style={{ marginTop: 14 }}>
            <button onClick={() => setShowCraving(s => !s)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#6B7280", fontWeight: 600, padding: 0 }}>
              {showCraving ? "▾ Hide" : "▸ Track"} craving intensity (optional)
            </button>
            {showCraving && (
              <div style={{ marginTop: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <p style={{ fontSize: 13, color: "#374151" }}>Craving intensity: <strong>{craving ?? 3}/10</strong></p>
                </div>
                <input type="range" min="0" max="10" value={craving ?? 3} onChange={e => setCraving(parseInt(e.target.value))}
                  style={{ width: "100%", accentColor: "#2E7D5E" }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9CA3AF" }}>
                  <span>None</span><span>Overwhelming</span>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            <button onClick={() => { setWriting(false); setContent(""); }} style={{ flex: 1, background: "none", border: "1px solid #E5E7EB", borderRadius: 12, padding: 12, color: "#6B7280", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              Cancel
            </button>
            <button onClick={() => saveMutation.mutate()} disabled={!content.trim() || saveMutation.isPending} style={{ flex: 2, background: "#2E7D5E", color: "#FFF", border: "none", borderRadius: 12, padding: 12, fontSize: 14, fontWeight: 700, cursor: content.trim() ? "pointer" : "not-allowed", opacity: content.trim() ? 1 : 0.5 }}>
              {saveMutation.isPending ? "Saving..." : "Save Entry"}
            </button>
          </div>
        </div>
      )}

      {entries.length === 0 && !writing && (
        <div style={{ textAlign: "center", padding: "48px 24px", background: "#FFF", borderRadius: 20, border: "1px dashed #D4EAE1" }}>
          <BookOpen className="w-10 h-10" style={{ color: "#A3B5AD", margin: "0 auto 12px" }} strokeWidth={1} />
          <p style={{ color: "#9CA3AF", fontSize: 15 }}>Your journal is empty. Start writing — no one else can see this.</p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {entries.map(e => <EntryCard key={e.id} entry={e} />)}
      </div>
    </div>
  );
}