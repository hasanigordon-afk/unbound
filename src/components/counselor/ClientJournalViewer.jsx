import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Lock, Plus, MessageSquare, Loader2 } from "lucide-react";
import moment from "moment";
import { toast } from "sonner";

const TAG_COLORS = {
  craving: "#E85D4C",
  gratitude: "#22c55e",
  trigger: "#FF9800",
  win: "#4A90E2",
  relapse: "#9C6FE4",
  reflection: "#6B7280",
};

const MOOD_LABELS = { 1: "😔 Very Low", 2: "😕 Low", 3: "😐 Neutral", 4: "🙂 Good", 5: "😊 Great" };

const NOTE_TYPES = [
  { value: "progress", label: "Progress", color: "#22C55E" },
  { value: "concern", label: "Concern", color: "#EF4444" },
  { value: "goal", label: "Goal", color: "#4A90E2" },
  { value: "incident", label: "Incident", color: "#F59E0B" },
  { value: "general", label: "General", color: "#8E8E93" },
];

export default function ClientJournalViewer({ clientEmail, authorEmail, authorRole, facilityId }) {
  const qc = useQueryClient();
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [noteForm, setNoteForm] = useState({ content: "", note_type: "general" });
  const [showNoteForm, setShowNoteForm] = useState(false);

  // Shared journal entries for this client
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["client-journal", clientEmail],
    queryFn: () => base44.entities.JournalEntry.filter(
      { shared_with_facility: true, facility_id: facilityId },
      "-created_date",
      50
    ),
    enabled: !!clientEmail && !!facilityId,
    select: (all) => all.filter((e) => e.created_by === clientEmail),
  });

  // Counselor notes linked to this client (using ProgressNote with note_type context)
  const { data: journalNotes = [] } = useQuery({
    queryKey: ["journal-notes", clientEmail],
    queryFn: () => base44.entities.ProgressNote.filter(
      { client_email: clientEmail, author_email: authorEmail },
      "-created_date",
      50
    ),
    enabled: !!clientEmail && !!authorEmail,
    select: (all) => all.filter((n) => n.content?.startsWith("[JOURNAL NOTE]")),
  });

  const addNoteMutation = useMutation({
    mutationFn: () =>
      base44.entities.ProgressNote.create({
        client_email: clientEmail,
        author_email: authorEmail,
        author_role: authorRole,
        note_type: noteForm.note_type,
        content: `[JOURNAL NOTE] Entry: ${selectedEntry?.id?.slice(0, 8)}\n\n${noteForm.content.trim()}`,
        facility_id: facilityId || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["journal-notes", clientEmail] });
      setNoteForm({ content: "", note_type: "general" });
      setShowNoteForm(false);
      toast.success("Private note saved");
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#8E8E93" }} />
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-16" style={{ color: "#8E8E93" }}>
        <Lock className="w-10 h-10 mx-auto mb-3 opacity-30" strokeWidth={1.5} />
        <p className="text-sm font-medium">No shared journal entries</p>
        <p className="text-xs mt-1">The participant hasn't shared any entries with you yet.</p>
      </div>
    );
  }

  // Detail view
  if (selectedEntry) {
    const entryNotes = journalNotes.filter((n) => n.content?.includes(selectedEntry.id?.slice(0, 8)));
    const nt = NOTE_TYPES.find((t) => t.value === noteForm.note_type) || NOTE_TYPES[4];

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <button
          onClick={() => { setSelectedEntry(null); setShowNoteForm(false); }}
          className="flex items-center gap-1 text-sm"
          style={{ color: "#8E8E93", background: "none", border: "none", cursor: "pointer", width: "fit-content" }}
        >
          ← Back to entries
        </button>

        {/* Entry */}
        <div style={{ background: "#FFF", border: "1px solid #D1D1D6", borderRadius: "8px", padding: "20px" }}>
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium" style={{ color: "#1E1E1E" }}>
                {moment(selectedEntry.created_date).format("dddd, MMM D, YYYY")}
              </span>
              {selectedEntry.mood_score && (
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#F7F7F8", color: "#5A5A5A" }}>
                  {MOOD_LABELS[selectedEntry.mood_score]}
                </span>
              )}
            </div>
            <span
              className="flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium"
              style={{ background: "#EFF6FF", color: "#3B82F6" }}
            >
              <BookOpen className="w-3 h-3" strokeWidth={1.5} />
              Shared by participant
            </span>
          </div>

          {selectedEntry.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {selectedEntry.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] px-2 py-0.5 rounded-full capitalize font-medium"
                  style={{ background: `${TAG_COLORS[tag]}20`, color: TAG_COLORS[tag] }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "#374151" }}>
            {selectedEntry.content}
          </p>
        </div>

        {/* Private Notes Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-wide font-semibold" style={{ color: "#8E8E93" }}>
              Your Private Notes ({entryNotes.length})
            </p>
            <button
              onClick={() => setShowNoteForm(!showNoteForm)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded font-medium"
              style={{
                background: showNoteForm ? "#F5F5F7" : "#4A90E2",
                color: showNoteForm ? "#5A5A5A" : "#FFF",
                border: showNoteForm ? "1px solid #D1D1D6" : "none",
                cursor: "pointer",
              }}
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={2} />
              {showNoteForm ? "Cancel" : "Add Note"}
            </button>
          </div>

          {showNoteForm && (
            <div style={{ background: "#FFF", border: "1px solid #D1D1D6", borderRadius: "8px", padding: "16px", marginBottom: "12px" }}>
              <div className="flex flex-wrap gap-2 mb-3">
                {NOTE_TYPES.map((n) => (
                  <button
                    key={n.value}
                    onClick={() => setNoteForm({ ...noteForm, note_type: n.value })}
                    className="text-xs px-3 py-1.5 rounded-full font-medium"
                    style={{
                      background: noteForm.note_type === n.value ? n.color : "#F5F5F7",
                      color: noteForm.note_type === n.value ? "#FFF" : "#5A5A5A",
                      border: noteForm.note_type === n.value ? "none" : "1px solid #D1D1D6",
                      cursor: "pointer",
                    }}
                  >
                    {n.label}
                  </button>
                ))}
              </div>
              <textarea
                placeholder="Private clinical note on this journal entry (not visible to participant)..."
                value={noteForm.content}
                onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 text-sm mb-3"
                style={{ background: "#F7F7F8", border: "1px solid #D1D1D6", borderRadius: "6px", color: "#1E1E1E", resize: "vertical" }}
              />
              <div className="flex items-center gap-2 p-2 rounded mb-3" style={{ background: "#FFF9C4", border: "1px solid #F59E0B" }}>
                <Lock className="w-3 h-3 flex-shrink-0" style={{ color: "#92400E" }} strokeWidth={2} />
                <p className="text-xs" style={{ color: "#92400E" }}>This note is private — the participant cannot see it.</p>
              </div>
              <button
                onClick={() => addNoteMutation.mutate()}
                disabled={!noteForm.content.trim() || addNoteMutation.isPending}
                className="px-4 py-2 text-sm font-medium rounded w-full"
                style={{
                  background: !noteForm.content.trim() ? "#E5E7EB" : "#4A90E2",
                  color: !noteForm.content.trim() ? "#9CA3AF" : "#FFF",
                  border: "none",
                  cursor: !noteForm.content.trim() ? "not-allowed" : "pointer",
                }}
              >
                {addNoteMutation.isPending ? "Saving..." : "Save Private Note"}
              </button>
            </div>
          )}

          {entryNotes.length === 0 && !showNoteForm && (
            <p className="text-sm text-center py-6" style={{ color: "#8E8E93" }}>No notes for this entry yet.</p>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {entryNotes.map((note) => {
              const noteType = NOTE_TYPES.find((t) => t.value === note.note_type) || NOTE_TYPES[4];
              // Strip prefix for display
              const displayContent = note.content.replace(/\[JOURNAL NOTE\] Entry: [a-f0-9]+\n\n/, "");
              return (
                <div
                  key={note.id}
                  style={{
                    background: "#FFF",
                    border: "1px solid #E5E7EB",
                    borderLeft: `3px solid ${noteType.color}`,
                    borderRadius: "8px",
                    padding: "14px 16px",
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded uppercase"
                      style={{ background: `${noteType.color}15`, color: noteType.color }}
                    >
                      {noteType.label}
                    </span>
                    <span className="text-xs" style={{ color: "#8E8E93" }}>
                      {moment(note.created_date).format("MMM D, YYYY · h:mm A")}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "#374151" }}>
                    {displayContent}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Entry list
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <p className="text-xs uppercase tracking-wide font-semibold" style={{ color: "#8E8E93" }}>
        {entries.length} Shared Journal Entr{entries.length === 1 ? "y" : "ies"}
      </p>
      <div className="flex items-start gap-2 p-3 rounded-lg" style={{ background: "#EFF6FF", border: "1px solid #BFDBFE" }}>
        <Lock className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: "#3B82F6" }} strokeWidth={2} />
        <p className="text-xs" style={{ color: "#1D4ED8" }}>
          Only entries the participant has chosen to share are visible here. You can add private clinical notes to each entry.
        </p>
      </div>
      {entries.map((entry) => {
        const entryNotes = journalNotes.filter((n) => n.content?.includes(entry.id?.slice(0, 8)));
        return (
          <button
            key={entry.id}
            onClick={() => setSelectedEntry(entry)}
            style={{
              background: "#FFF",
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              padding: "16px",
              textAlign: "left",
              cursor: "pointer",
              width: "100%",
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium" style={{ color: "#1E1E1E" }}>
                  {moment(entry.created_date).format("MMM D, YYYY")}
                </span>
                {entry.mood_score && (
                  <span className="text-xs" style={{ color: "#8E8E93" }}>
                    {["", "😔", "😕", "😐", "🙂", "😊"][entry.mood_score]}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {entryNotes.length > 0 && (
                  <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: "#F0F4FA", color: "#4A90E2" }}>
                    <MessageSquare className="w-3 h-3" strokeWidth={1.5} />
                    {entryNotes.length} note{entryNotes.length !== 1 ? "s" : ""}
                  </span>
                )}
                <span className="text-xs" style={{ color: "#8E8E93" }}>→</span>
              </div>
            </div>
            {entry.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {entry.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-2 py-0.5 rounded-full capitalize font-medium"
                    style={{ background: `${TAG_COLORS[tag]}20`, color: TAG_COLORS[tag] }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <p className="text-sm line-clamp-2 leading-relaxed" style={{ color: "#6B7280" }}>
              {entry.content}
            </p>
          </button>
        );
      })}
    </div>
  );
}