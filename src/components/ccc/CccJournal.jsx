import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, BookOpen } from "lucide-react";

const MOOD_OPTIONS = [
  { val: 1, emoji: "😢", label: "Struggling" },
  { val: 2, emoji: "😕", label: "Low" },
  { val: 3, emoji: "😐", label: "Okay" },
  { val: 4, emoji: "🙂", label: "Good" },
  { val: 5, emoji: "😊", label: "Great" },
];

export default function CccJournal({ user }) {
  const queryClient = useQueryClient();
  const [view, setView] = useState("write"); // "write" | "history"
  const [content, setContent] = useState("");
  const [mood, setMood] = useState(null);
  const [craving, setCraving] = useState(0);
  const [saved, setSaved] = useState(false);

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["ccc-journal", user?.email],
    queryFn: () => base44.entities.JournalEntry.filter({ created_by: user.email }, "-created_date", 20),
    enabled: !!user,
  });

  const saveMutation = useMutation({
    mutationFn: () => base44.entities.JournalEntry.create({
      content,
      mood_rating: mood,
      craving_intensity: craving,
      entry_type: "personal",
      is_private: true,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(["ccc-journal"]);
      setContent("");
      setMood(null);
      setCraving(0);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1E3A5F", marginBottom: 4 }}>Journal</h2>
      <p style={{ color: "#5A7A9A", fontSize: 14, marginBottom: 20 }}>Private space. Write what you feel. No judgment here.</p>

      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {["write", "history"].map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            style={{
              padding: "8px 18px",
              borderRadius: 20,
              border: "1px solid #CBD5E1",
              background: view === v ? "#1E4A72" : "#FFFFFF",
              color: view === v ? "#FFFFFF" : "#475569",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            {v === "write" ? "✏️ Write" : "📖 History"}
          </button>
        ))}
      </div>

      {view === "write" && (
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 10 }}>How are you feeling right now?</p>
          <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
            {MOOD_OPTIONS.map(m => (
              <button
                key={m.val}
                onClick={() => setMood(m.val)}
                style={{
                  flex: 1,
                  padding: "10px 4px",
                  borderRadius: 12,
                  border: `2px solid ${mood === m.val ? "#3B82F6" : "#E2E8F0"}`,
                  background: mood === m.val ? "#EFF6FF" : "#FFFFFF",
                  cursor: "pointer",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 22 }}>{m.emoji}</div>
                <div style={{ fontSize: 10, color: "#64748B", marginTop: 3, fontWeight: 600 }}>{m.label}</div>
              </button>
            ))}
          </div>

          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
              Craving intensity: {craving}/10
            </p>
            <input
              type="range"
              min={0}
              max={10}
              value={craving}
              onChange={e => setCraving(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#3B82F6" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94A3B8", marginTop: 2 }}>
              <span>None</span>
              <span>Severe</span>
            </div>
          </div>

          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="What's on your mind? What happened today? How are you coping?..."
            rows={6}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: 14,
              border: "1px solid #CBD5E1",
              background: "#FFFFFF",
              fontSize: 14,
              color: "#1E293B",
              lineHeight: 1.7,
              resize: "vertical",
              fontFamily: "inherit",
              outline: "none",
              boxSizing: "border-box",
              marginBottom: 14,
            }}
          />

          {saved && (
            <div style={{ background: "#F0FDF4", border: "1px solid #86EFAC", borderRadius: 12, padding: "12px 16px", marginBottom: 12, textAlign: "center" }}>
              <p style={{ color: "#15803D", fontWeight: 700, fontSize: 14 }}>Entry saved ✓</p>
            </div>
          )}

          <button
            onClick={() => saveMutation.mutate()}
            disabled={!content.trim() || saveMutation.isPending}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: 12,
              border: "none",
              background: content.trim() ? "#1E4A72" : "#E2E8F0",
              color: content.trim() ? "#FFFFFF" : "#94A3B8",
              fontWeight: 700,
              fontSize: 15,
              cursor: content.trim() ? "pointer" : "default",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Entry"}
          </button>
        </div>
      )}

      {view === "history" && (
        <div>
          {isLoading && <div style={{ textAlign: "center", padding: 40 }}><Loader2 className="w-5 h-5 animate-spin" style={{ color: "#3B82F6" }} /></div>}
          {!isLoading && entries.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px 24px" }}>
              <BookOpen className="w-10 h-10" style={{ color: "#CBD5E1", margin: "0 auto 12px" }} />
              <p style={{ color: "#94A3B8", fontSize: 14 }}>No entries yet. Write your first one.</p>
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {entries.map(e => {
              const mood = MOOD_OPTIONS.find(m => m.val === e.mood_rating);
              return (
                <div key={e.id} style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 14, padding: "18px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    {mood && <span style={{ fontSize: 20 }}>{mood.emoji}</span>}
                    <p style={{ fontSize: 12, color: "#94A3B8" }}>
                      {new Date(e.created_date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                    {e.craving_intensity > 0 && (
                      <span style={{ marginLeft: "auto", fontSize: 11, color: "#EF4444", fontWeight: 600, background: "#FEF2F2", padding: "2px 8px", borderRadius: 20 }}>
                        Craving: {e.craving_intensity}/10
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.6 }}>{e.content}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}