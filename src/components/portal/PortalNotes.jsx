import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Search } from "lucide-react";

const NOTE_TYPES = ["general","progress","concern","appointment","compliance","resource_referral","sponsor_update","probation_update"];
const NOTE_COLORS = {
  general: "#EFF6FF", progress: "#F0FDF4", concern: "#FEF2F2", appointment: "#FFFBEB",
  compliance: "#F5F3FF", resource_referral: "#ECFDF5", sponsor_update: "#FFF7ED", probation_update: "#F0F9FF",
};

export default function PortalNotes({ user, counselorProfile, facilityId, participants }) {
  const [noteText, setNoteText] = useState("");
  const [noteType, setNoteType] = useState("general");
  const [selectedEmail, setSelectedEmail] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [search, setSearch] = useState("");

  const { data: notes = [], refetch } = useQuery({
    queryKey: ["portal-all-notes", facilityId],
    queryFn: async () => {
      const all = await base44.entities.ProgressNote.list("-created_date", 200);
      const emails = new Set(participants.map(p => p.participant_email));
      return all.filter(n => emails.has(n.client_email));
    },
    enabled: participants.length > 0,
  });

  const addNote = useMutation({
    mutationFn: () => base44.entities.ProgressNote.create({
      client_email: selectedEmail || participants[0]?.participant_email,
      author_email: user.email,
      author_role: counselorProfile?.role_type === "probation_officer" ? "probation_officer" : "counselor",
      note_type: noteType,
      content: noteText,
      facility_id: facilityId,
    }),
    onSuccess: () => { setNoteText(""); refetch(); },
  });

  const clientMap = Object.fromEntries(participants.map(p => [p.participant_email, p.displayName]));

  const filtered = notes.filter(n => {
    const matchType = filterType === "all" || n.note_type === filterType;
    const matchSearch = !search || n.content?.toLowerCase().includes(search.toLowerCase()) ||
      clientMap[n.client_email]?.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div style={{ padding: "28px 28px 40px", maxWidth: 880, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0F172A", marginBottom: 4 }}>Notes</h1>
        <p style={{ color: "#64748B", fontSize: 14 }}>Case notes, progress notes, and follow-up reminders.</p>
      </div>

      {/* Add Note Form */}
      <div style={{ background: "#FFF", border: "1px solid #E2E8F0", borderRadius: 14, padding: "20px 24px", marginBottom: 28 }}>
        <p style={{ fontWeight: 700, fontSize: 15, color: "#0F172A", marginBottom: 16 }}>Add a Note</p>
        <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
          <select value={selectedEmail} onChange={e => setSelectedEmail(e.target.value)}
            style={{ flex: 1, minWidth: 180, height: 38, border: "1px solid #E2E8F0", borderRadius: 8, padding: "0 12px", fontSize: 13, color: "#1E293B", background: "#F8FAFC", outline: "none" }}>
            <option value="">Select a client…</option>
            {participants.map(p => <option key={p.id} value={p.participant_email}>{p.displayName}</option>)}
          </select>
          <select value={noteType} onChange={e => setNoteType(e.target.value)}
            style={{ flex: 1, minWidth: 160, height: 38, border: "1px solid #E2E8F0", borderRadius: 8, padding: "0 12px", fontSize: 13, color: "#1E293B", background: "#F8FAFC", outline: "none" }}>
            {NOTE_TYPES.map(t => (
              <option key={t} value={t}>{t.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</option>
            ))}
          </select>
        </div>
        <textarea value={noteText} onChange={e => setNoteText(e.target.value)} rows={4}
          placeholder="Write your case note here…"
          style={{ width: "100%", border: "1px solid #E2E8F0", borderRadius: 8, padding: "12px", fontSize: 13, resize: "vertical", fontFamily: "inherit", outline: "none", boxSizing: "border-box", lineHeight: 1.6 }} />
        <div style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <p style={{ fontSize: 12, color: "#94A3B8" }}>Notes are private and visible only to your team.</p>
          <button onClick={() => addNote.mutate()} disabled={!noteText.trim() || addNote.isPending}
            style={{ background: noteText.trim() ? "#3B82F6" : "#E2E8F0", color: noteText.trim() ? "#FFF" : "#94A3B8", border: "none", borderRadius: 8, padding: "9px 20px", fontSize: 13, fontWeight: 600, cursor: noteText.trim() ? "pointer" : "default" }}>
            {addNote.isPending ? "Saving…" : "Save Note"}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search className="w-4 h-4" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notes…"
            style={{ width: "100%", paddingLeft: 32, height: 36, border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 13, color: "#1E293B", outline: "none", boxSizing: "border-box" }} />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          style={{ height: 36, border: "1px solid #E2E8F0", borderRadius: 8, padding: "0 12px", fontSize: 13, color: "#1E293B", background: "#FFF", outline: "none" }}>
          <option value="all">All Types</option>
          {NOTE_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</option>)}
        </select>
      </div>

      {/* Notes list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map(n => (
          <div key={n.id} style={{ background: NOTE_COLORS[n.note_type] || "#FFF", border: "1px solid #E2E8F0", borderRadius: 12, padding: "16px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
              <div style={{ display: "flex", align: "center", gap: 8 }}>
                <p style={{ fontWeight: 700, fontSize: 14, color: "#0F172A" }}>{clientMap[n.client_email] || n.client_email}</p>
                <span style={{ background: "#FFF", border: "1px solid #E2E8F0", color: "#475569", borderRadius: 20, padding: "2px 9px", fontSize: 11, fontWeight: 600, marginLeft: 6 }}>
                  {n.note_type?.replace(/_/g, " ")}
                </span>
              </div>
              <span style={{ fontSize: 11, color: "#94A3B8", flexShrink: 0 }}>{new Date(n.created_date).toLocaleDateString()}</span>
            </div>
            <p style={{ fontSize: 13, color: "#1E293B", lineHeight: 1.65 }}>{n.content}</p>
            <p style={{ fontSize: 11, color: "#94A3B8", marginTop: 8 }}>by {n.author_email}</p>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ background: "#FFF", border: "1px solid #E2E8F0", borderRadius: 12, padding: 48, textAlign: "center" }}>
            <p style={{ color: "#94A3B8", fontSize: 14 }}>No notes yet. Add one above.</p>
          </div>
        )}
      </div>
    </div>
  );
}