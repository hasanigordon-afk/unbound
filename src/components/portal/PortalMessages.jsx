import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Search, Send } from "lucide-react";

const TEMPLATES = [
  "Just checking in on you — how are things going?",
  "Reminder: you have an appointment coming up. Please confirm.",
  "You're doing great. Keep going.",
  "We haven't heard from you in a few days. Please reach out when you can.",
  "Have you been able to connect with your support contact recently?",
  "Please call or message me when you get a chance.",
  "Reminder: stay current with your program requirements.",
  "Have you been making it to meetings? Let me know how it's going.",
];

export default function PortalMessages({ participants, user, facilityId }) {
  const [selectedClient, setSelectedClient] = useState(participants[0] || null);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  const email = selectedClient?.participant_email;

  const { data: thread = [], refetch } = useQuery({
    queryKey: ["portal-thread", email, facilityId],
    queryFn: () => base44.entities.CounselorMessage.filter(
      { participant_email: email, facility_id: facilityId }, "-created_date", 50
    ),
    enabled: !!email && !!facilityId,
    refetchInterval: 15000,
  });

  const sendMutation = useMutation({
    mutationFn: (text) => base44.entities.CounselorMessage.create({
      facility_id: facilityId,
      counselor_email: user.email,
      participant_email: email,
      message: text,
      message_type: "message",
    }),
    onSuccess: () => { setMessage(""); refetch(); },
  });

  const filteredClients = participants.filter(p =>
    p.displayName.toLowerCase().includes(search.toLowerCase()) ||
    p.participant_email.toLowerCase().includes(search.toLowerCase())
  );

  const STATUS_COLOR = { at_risk: "#EF4444", needs_attention: "#F59E0B", stable: "#22C55E", new: "#3B82F6", inactive: "#94A3B8" };

  return (
    <div style={{ display: "flex", height: "calc(100vh - 57px)", overflow: "hidden" }} className="lg:h-[calc(100vh-0px)]">
      {/* Client list sidebar */}
      <div style={{ width: 260, borderRight: "1px solid #E2E8F0", background: "#FFF", display: "flex", flexDirection: "column", flexShrink: 0 }}
        className="hidden md:flex">
        <div style={{ padding: "16px", borderBottom: "1px solid #E2E8F0" }}>
          <p style={{ fontWeight: 700, fontSize: 15, color: "#0F172A", marginBottom: 10 }}>Messages</p>
          <div style={{ position: "relative" }}>
            <Search className="w-4 h-4" style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
              style={{ width: "100%", paddingLeft: 28, height: 34, border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 12, color: "#1E293B", outline: "none", boxSizing: "border-box" }} />
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {filteredClients.map(c => (
            <button key={c.id} onClick={() => setSelectedClient(c)}
              style={{
                display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "12px 16px",
                background: selectedClient?.id === c.id ? "#EFF6FF" : "none",
                border: "none", borderLeft: selectedClient?.id === c.id ? "3px solid #3B82F6" : "3px solid transparent",
                cursor: "pointer", textAlign: "left",
              }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative" }}>
                <span style={{ fontWeight: 700, fontSize: 12, color: "#3B82F6" }}>{c.displayName.charAt(0).toUpperCase()}</span>
                <span style={{ position: "absolute", bottom: 0, right: 0, width: 8, height: 8, borderRadius: "50%", background: STATUS_COLOR[c.status] || "#94A3B8", border: "1.5px solid #FFF" }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.displayName}</p>
                <p style={{ fontSize: 11, color: "#94A3B8" }}>{c.engagement}% check-ins</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Message thread */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#F8FAFC", minWidth: 0 }}>
        {selectedClient ? (
          <>
            {/* Thread header */}
            <div style={{ background: "#FFF", borderBottom: "1px solid #E2E8F0", padding: "14px 20px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontWeight: 700, fontSize: 15, color: "#3B82F6" }}>{selectedClient.displayName.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 15, color: "#0F172A" }}>{selectedClient.displayName}</p>
                <p style={{ fontSize: 12, color: "#94A3B8" }}>{selectedClient.participant_email}</p>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
              {[...thread].reverse().map(m => {
                const isMe = m.counselor_email === user?.email;
                return (
                  <div key={m.id} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start" }}>
                    <div style={{ background: isMe ? "#3B82F6" : "#FFF", border: isMe ? "none" : "1px solid #E2E8F0", borderRadius: 14, padding: "10px 16px", maxWidth: "70%" }}>
                      <p style={{ fontSize: 13, color: isMe ? "#FFF" : "#1E293B", lineHeight: 1.55 }}>{m.message}</p>
                      <p style={{ fontSize: 10, color: isMe ? "rgba(255,255,255,0.6)" : "#94A3B8", marginTop: 4 }}>
                        {new Date(m.created_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })}
              {thread.length === 0 && (
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <p style={{ color: "#94A3B8", fontSize: 14 }}>No messages yet. Start the conversation.</p>
                </div>
              )}
            </div>

            {/* Templates */}
            <div style={{ padding: "8px 20px", borderTop: "1px solid #E2E8F0", background: "#FFF" }}>
              <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
                {TEMPLATES.slice(0, 4).map(t => (
                  <button key={t} onClick={() => setMessage(t)}
                    style={{ background: "#F1F5F9", border: "1px solid #E2E8F0", borderRadius: 20, padding: "4px 12px", fontSize: 11, fontWeight: 600, color: "#475569", cursor: "pointer", whiteSpace: "nowrap" }}>
                    {t.length > 24 ? t.slice(0, 24) + "…" : t}
                  </button>
                ))}
              </div>
            </div>

            {/* Compose */}
            <div style={{ padding: "12px 20px", background: "#FFF", borderTop: "1px solid #E2E8F0", display: "flex", gap: 10, alignItems: "flex-end" }}>
              <textarea value={message} onChange={e => setMessage(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && message.trim()) { e.preventDefault(); sendMutation.mutate(message); } }}
                placeholder="Type a message…" rows={2}
                style={{ flex: 1, border: "1px solid #E2E8F0", borderRadius: 10, padding: 10, fontSize: 13, resize: "none", fontFamily: "inherit", outline: "none" }} />
              <button onClick={() => sendMutation.mutate(message)} disabled={!message.trim() || sendMutation.isPending}
                style={{ background: "#3B82F6", border: "none", borderRadius: 10, padding: "10px 14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Send className="w-4 h-4" style={{ color: "#FFF" }} />
              </button>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ color: "#94A3B8", fontSize: 14 }}>Select a client to view their messages.</p>
          </div>
        )}
      </div>
    </div>
  );
}