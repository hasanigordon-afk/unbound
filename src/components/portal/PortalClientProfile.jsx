import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, MessageSquare, FileText } from "lucide-react";
import ClientTimeline from "./ClientTimeline";

const STATUS_CONFIG = {
  at_risk:         { label: "At Risk",         bg: "#FEF2F2", border: "#FECACA", text: "#DC2626" },
  needs_attention: { label: "Needs Attention", bg: "#FFFBEB", border: "#FDE68A", text: "#92400E" },
  stable:          { label: "Stable",          bg: "#F0FDF4", border: "#BBF7D0", text: "#166534" },
  new:             { label: "New",             bg: "#EFF6FF", border: "#BFDBFE", text: "#1D4ED8" },
  inactive:        { label: "Inactive",        bg: "#F8FAFC", border: "#E2E8F0", text: "#475569" },
};

const TABS = [
  { id: "timeline",  label: "Timeline" },
  { id: "overview",  label: "Overview" },
  { id: "checkins",  label: "Check-Ins" },
  { id: "notes",     label: "Notes" },
  { id: "messages",  label: "Messages" },
  { id: "progress",  label: "Progress" },
];

export default function PortalClientProfile({ client, user, counselorProfile, facilityId, allCheckIns, onBack }) {
  const [activeTab, setActiveTab] = useState(client?._openTab || "overview");
  const [noteText, setNoteText] = useState("");
  const [noteType, setNoteType] = useState("general");
  const [messageText, setMessageText] = useState("");

  const cfg = STATUS_CONFIG[client.status] || STATUS_CONFIG.stable;
  const email = client.participant_email;

  const clientCheckIns = allCheckIns
    .filter(c => c.participant_email === email)
    .sort((a, b) => new Date(b.check_in_date) - new Date(a.check_in_date));

  const { data: notes = [], refetch: refetchNotes } = useQuery({
    queryKey: ["portal-client-notes", email],
    queryFn: () => base44.entities.ProgressNote.filter({ client_email: email }, "-created_date", 50),
  });

  const { data: messages = [], refetch: refetchMessages } = useQuery({
    queryKey: ["portal-client-messages", email, facilityId],
    queryFn: () => base44.entities.CounselorMessage.filter({ participant_email: email, facility_id: facilityId }, "-created_date", 50),
  });

  const addNoteMutation = useMutation({
    mutationFn: () => base44.entities.ProgressNote.create({
      client_email: email,
      author_email: user.email,
      author_role: counselorProfile?.role_type === "probation_officer" ? "probation_officer" : "counselor",
      note_type: noteType,
      content: noteText,
      facility_id: facilityId,
    }),
    onSuccess: () => { setNoteText(""); refetchNotes(); },
  });

  const sendMessageMutation = useMutation({
    mutationFn: () => base44.entities.CounselorMessage.create({
      facility_id: facilityId,
      counselor_email: user.email,
      participant_email: email,
      message: messageText,
      message_type: "message",
    }),
    onSuccess: () => { setMessageText(""); refetchMessages(); },
  });

  const lastSeen = client.lastCheckIn
    ? `${Math.floor((new Date() - new Date(client.lastCheckIn)) / 86400000)} days ago`
    : "Never";

  return (
    <div style={{ padding: "20px 28px 40px", maxWidth: 880, margin: "0 auto" }}>
      <button onClick={onBack}
        style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "#64748B", fontSize: 13, fontWeight: 600, marginBottom: 20, padding: 0 }}>
        <ArrowLeft className="w-4 h-4" /> Back to Clients
      </button>

      <div style={{ background: "#FFF", border: "1px solid #E2E8F0", borderRadius: 14, padding: "24px", marginBottom: 20, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontWeight: 800, fontSize: 22, color: "#3B82F6" }}>{client.displayName.charAt(0).toUpperCase()}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0F172A" }}>{client.displayName}</h2>
            <span style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.text, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>
              {cfg.label}
            </span>
          </div>
          <p style={{ color: "#64748B", fontSize: 13 }}>
            {client.participant_email} · Last check-in: {lastSeen} · {client.totalCheckIns} total check-ins
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setActiveTab("messages")}
            style={{ background: "#3B82F6", color: "#FFF", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <MessageSquare className="w-4 h-4" /> Message
          </button>
          <button onClick={() => setActiveTab("notes")}
            style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", color: "#475569", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <FileText className="w-4 h-4" /> Note
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "2px solid #E2E8F0", marginBottom: 24, gap: 4, overflowX: "auto" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{ padding: "10px 18px", border: "none", background: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
              color: activeTab === t.id ? "#3B82F6" : "#64748B",
              borderBottom: activeTab === t.id ? "2px solid #3B82F6" : "2px solid transparent",
              marginBottom: -2, whiteSpace: "nowrap",
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
          <InfoCard label="Check-In Rate (7d)" value={`${client.engagement}%`} color={client.engagement >= 70 ? "#22C55E" : client.engagement >= 40 ? "#F59E0B" : "#EF4444"} />
          <InfoCard label="Avg Mood (7d)" value={client.avgMood ? client.avgMood.toFixed(1) + " / 5" : "—"} color="#3B82F6" />
          <InfoCard label="Avg Craving (7d)" value={client.avgCraving ? client.avgCraving.toFixed(1) + " / 5" : "—"} color={client.avgCraving >= 4 ? "#EF4444" : "#22C55E"} />
          <InfoCard label="Total Check-Ins" value={client.totalCheckIns} color="#6366F1" />
          <InfoCard label="Program Type" value={client.program_type?.replace(/_/g, " ") || "—"} color="#0F172A" isText />
          <InfoCard label="Location" value={client.location_city ? `${client.location_city}, ${client.location_state}` : "—"} color="#0F172A" isText />
        </div>
      )}

      {activeTab === "checkins" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {clientCheckIns.slice(0, 30).map(ci => (
            <div key={ci.id} style={{ background: "#FFF", border: "1px solid #E2E8F0", borderRadius: 10, padding: "14px 18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <p style={{ fontWeight: 600, fontSize: 14, color: "#0F172A" }}>{ci.check_in_date}</p>
                {ci.needs_help && <span style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>Needed Help</span>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 8 }}>
                <Stat label="Mood" value={`${ci.mood_rating}/5`} />
                <Stat label="Craving" value={`${ci.craving_level || 0}/5`} />
                <Stat label="Meeting" value={ci.attended_meeting ? "Yes" : "No"} />
                <Stat label="Sponsor Contact" value={ci.connected_with_sponsor ? "Yes" : "No"} />
              </div>
              {ci.notes && <p style={{ fontSize: 12, color: "#64748B", marginTop: 8, fontStyle: "italic" }}>"{ci.notes}"</p>}
            </div>
          ))}
          {clientCheckIns.length === 0 && <EmptyState text="No check-ins recorded yet." />}
        </div>
      )}

      {activeTab === "notes" && (
        <div>
          <div style={{ background: "#FFF", border: "1px solid #E2E8F0", borderRadius: 12, padding: 20, marginBottom: 20 }}>
            <p style={{ fontWeight: 700, fontSize: 14, color: "#0F172A", marginBottom: 14 }}>Add a Note</p>
            <select value={noteType} onChange={e => setNoteType(e.target.value)}
              style={{ border: "1px solid #E2E8F0", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#1E293B", background: "#F8FAFC", outline: "none", marginBottom: 10 }}>
              {["general","progress","concern","appointment","compliance","resource_referral","sponsor_update","probation_update"].map(t => (
                <option key={t} value={t}>{t.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</option>
              ))}
            </select>
            <textarea value={noteText} onChange={e => setNoteText(e.target.value)} rows={3}
              placeholder="Write your note here…"
              style={{ width: "100%", border: "1px solid #E2E8F0", borderRadius: 8, padding: 12, fontSize: 13, color: "#1E293B", resize: "vertical", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
            <button onClick={() => addNoteMutation.mutate()} disabled={!noteText.trim() || addNoteMutation.isPending}
              style={{ marginTop: 10, background: "#3B82F6", color: "#FFF", border: "none", borderRadius: 8, padding: "9px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              {addNoteMutation.isPending ? "Saving…" : "Save Note"}
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {notes.map(n => (
              <div key={n.id} style={{ background: "#FFF", border: "1px solid #E2E8F0", borderRadius: 10, padding: "14px 18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ background: "#EFF6FF", color: "#3B82F6", borderRadius: 20, padding: "2px 9px", fontSize: 11, fontWeight: 700 }}>
                    {n.note_type?.replace(/_/g, " ")}
                  </span>
                  <span style={{ fontSize: 11, color: "#94A3B8" }}>{new Date(n.created_date).toLocaleDateString()}</span>
                </div>
                <p style={{ fontSize: 13, color: "#1E293B", lineHeight: 1.6 }}>{n.content}</p>
              </div>
            ))}
            {notes.length === 0 && <EmptyState text="No notes yet. Add one above." />}
          </div>
        </div>
      )}

      {activeTab === "messages" && (
        <div>
          <div style={{ background: "#FFF", border: "1px solid #E2E8F0", borderRadius: 12, padding: 20, marginBottom: 20 }}>
            <p style={{ fontWeight: 700, fontSize: 14, color: "#0F172A", marginBottom: 12 }}>Send a Message</p>
            <textarea value={messageText} onChange={e => setMessageText(e.target.value)} rows={3}
              placeholder="Type your message…"
              style={{ width: "100%", border: "1px solid #E2E8F0", borderRadius: 8, padding: 12, fontSize: 13, resize: "vertical", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
            <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["Checking in on you today.", "Don't forget your appointment.", "Keep going — you're doing great.", "Haven't heard from you. Please reach out."].map(t => (
                <button key={t} onClick={() => setMessageText(t)}
                  style={{ background: "#F1F5F9", border: "1px solid #E2E8F0", borderRadius: 20, padding: "4px 12px", fontSize: 11, fontWeight: 600, color: "#475569", cursor: "pointer" }}>
                  {t.length > 28 ? t.slice(0, 28) + "…" : t}
                </button>
              ))}
            </div>
            <button onClick={() => sendMessageMutation.mutate()} disabled={!messageText.trim() || sendMessageMutation.isPending}
              style={{ marginTop: 12, background: "#3B82F6", color: "#FFF", border: "none", borderRadius: 8, padding: "9px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              {sendMessageMutation.isPending ? "Sending…" : "Send Message"}
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[...messages].reverse().map(m => {
              const isMe = m.counselor_email === user?.email;
              return (
                <div key={m.id} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start" }}>
                  <div style={{ background: isMe ? "#3B82F6" : "#F1F5F9", borderRadius: 12, padding: "10px 16px", maxWidth: "75%" }}>
                    <p style={{ fontSize: 13, color: isMe ? "#FFF" : "#1E293B", lineHeight: 1.5 }}>{m.message}</p>
                    <p style={{ fontSize: 10, color: isMe ? "rgba(255,255,255,0.7)" : "#94A3B8", marginTop: 4 }}>
                      {new Date(m.created_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })}
            {messages.length === 0 && <EmptyState text="No messages yet." />}
          </div>
        </div>
      )}

      {activeTab === "progress" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <ProgressBlock label="Check-In Rate (7 days)" value={client.engagement} color="#3B82F6" />
          <ProgressBlock label="Average Mood" value={Math.round((client.avgMood / 5) * 100)} color="#22C55E" />
          <ProgressBlock label="Craving Stability (higher = more stable)" value={100 - Math.round((client.avgCraving / 5) * 100)} color="#F59E0B" />
        </div>
      )}
    </div>
  );
}

function InfoCard({ label, value, color, isText }) {
  return (
    <div style={{ background: "#FFF", border: "1px solid #E2E8F0", borderRadius: 10, padding: "16px 18px" }}>
      <p style={{ fontSize: 11, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: isText ? 14 : 24, fontWeight: isText ? 600 : 800, color, lineHeight: 1.2 }}>{value}</p>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <span style={{ fontSize: 11, color: "#94A3B8" }}>{label}: </span>
      <span style={{ fontSize: 12, fontWeight: 600, color: "#1E293B" }}>{value}</span>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div style={{ background: "#FFF", border: "1px solid #E2E8F0", borderRadius: 10, padding: 40, textAlign: "center" }}>
      <p style={{ color: "#94A3B8", fontSize: 14 }}>{text}</p>
    </div>
  );
}

function ProgressBlock({ label, value, color }) {
  return (
    <div style={{ background: "#FFF", border: "1px solid #E2E8F0", borderRadius: 12, padding: "18px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>{label}</p>
        <p style={{ fontSize: 14, fontWeight: 700, color }}>{value}%</p>
      </div>
      <div style={{ background: "#F1F5F9", borderRadius: 8, height: 10, overflow: "hidden" }}>
        <div style={{ background: color, width: `${Math.min(value, 100)}%`, height: "100%", borderRadius: 8 }} />
      </div>
    </div>
  );
}