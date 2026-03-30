import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { MessageCircle, Bell, FileText, Flag, CheckCircle2, Loader2 } from "lucide-react";

const C = { teal: "#2DD4BF", amber: "#F59E0B", emerald: "#10B981", red: "#EF4444", indigo: "#6366F1" };

const ACTIONS = [
  { key: "encourage",     label: "Send Encouragement", icon: MessageCircle, color: C.teal,    noteType: "encouragement_sent"  },
  { key: "checkin",       label: "Request Check-In",   icon: Bell,          color: C.amber,   noteType: "checkin_requested"   },
  { key: "note",          label: "Add Internal Note",  icon: FileText,      color: C.indigo,  noteType: "general"             },
  { key: "followup",      label: "Flag Follow-Up",     icon: Flag,          color: C.red,     noteType: "follow_up"           },
];

export default function StaffActionsPanel({ client, facilityId, staffEmail, staffRole, onClose }) {
  const qc = useQueryClient();
  const [activeAction, setActiveAction] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(null);

  const isProbation = staffRole === "probation_support";

  const handleAction = async (actionKey) => {
    if (actionKey === "note" || actionKey === "encourage" || actionKey === "checkin") {
      setActiveAction(actionKey);
      return;
    }
    // followup — immediate
    setLoading(true);
    await base44.entities.FacilityClientAssignment.filter({ client_email: client.email, facility_id: facilityId })
      .then(async ([assignment]) => {
        if (assignment) await base44.entities.FacilityClientAssignment.update(assignment.id, { follow_up_needed: true });
      }).catch(() => {});
    await base44.entities.StaffNote.create({
      client_email: client.email,
      staff_email: staffEmail,
      facility_id: facilityId,
      note_text: "Follow-up flagged.",
      note_type: "follow_up",
    });
    qc.invalidateQueries({ queryKey: ["facility-staff-notes"] });
    setDone("followup");
    setLoading(false);
    setTimeout(() => setDone(null), 2500);
  };

  const handleSubmit = async () => {
    if (!noteText.trim()) return;
    setLoading(true);
    const action = ACTIONS.find(a => a.key === activeAction);

    await base44.entities.StaffNote.create({
      client_email: client.email,
      staff_email: staffEmail,
      facility_id: facilityId,
      note_text: noteText,
      note_type: action?.noteType || "general",
    });

    if (activeAction === "encourage") {
      await base44.entities.Message.create({
        sender_email: staffEmail,
        recipient_email: client.email,
        content: noteText,
        message_type: "encouragement",
      }).catch(() => {});
    }

    qc.invalidateQueries({ queryKey: ["facility-staff-notes"] });
    setDone(activeAction);
    setActiveAction(null);
    setNoteText("");
    setLoading(false);
    setTimeout(() => setDone(null), 2500);
  };

  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase",
        letterSpacing: "1px", marginBottom: 10 }}>Staff Actions</p>

      {done && (
        <div style={{ borderRadius: 12, padding: "10px 14px", marginBottom: 12,
          background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)",
          display: "flex", alignItems: "center", gap: 8 }}>
          <CheckCircle2 style={{ color: C.emerald, width: 14, height: 14 }} />
          <p style={{ fontSize: 12, fontWeight: 700, color: C.emerald }}>Done ✓</p>
        </div>
      )}

      {/* Action buttons grid */}
      {!activeAction && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {ACTIONS.map(action => {
            const Icon = action.icon;
            // Probation support only sees limited actions
            if (isProbation && (action.key === "note")) return null;
            return (
              <button key={action.key} onClick={() => handleAction(action.key)}
                disabled={loading}
                style={{ padding: "12px 10px", borderRadius: 12, border: `1px solid ${action.color}25`,
                  background: `${action.color}0A`, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 8 }}>
                <Icon style={{ color: action.color, width: 15, height: 15, flexShrink: 0 }} />
                <p style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.7)", textAlign: "left", lineHeight: 1.3 }}>
                  {action.label}
                </p>
                {loading && <Loader2 style={{ width: 12, height: 12, color: action.color }} className="animate-spin ml-auto" />}
              </button>
            );
          })}
        </div>
      )}

      {/* Inline text input for note/encourage/checkin */}
      {activeAction && (
        <div style={{ borderRadius: 14, padding: "16px", background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)" }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 10 }}>
            {ACTIONS.find(a => a.key === activeAction)?.label}
          </p>
          <textarea value={noteText} onChange={e => setNoteText(e.target.value)}
            rows={3} placeholder={
              activeAction === "encourage" ? "Write an encouraging message to send to this client…"
              : activeAction === "checkin"  ? "Add a note about why you're requesting a check-in…"
              : "Internal note (not visible to client)…"
            }
            style={{ width: "100%", padding: "10px 12px", borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)",
              color: "#fff", fontSize: 13, resize: "none", outline: "none",
              boxSizing: "border-box", fontFamily: "inherit", marginBottom: 10 }} />
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handleSubmit} disabled={!noteText.trim() || loading}
              style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", cursor: "pointer",
                background: noteText.trim() ? `linear-gradient(135deg,${C.teal},#22C5B0)` : "rgba(255,255,255,0.06)",
                color: noteText.trim() ? "#07090F" : "rgba(255,255,255,0.3)",
                fontWeight: 800, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              {loading ? <Loader2 style={{ width: 13, height: 13 }} className="animate-spin" /> : null}
              Submit
            </button>
            <button onClick={() => { setActiveAction(null); setNoteText(""); }}
              style={{ padding: "10px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)",
                background: "transparent", color: "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer" }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}