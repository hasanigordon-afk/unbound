import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, AlertTriangle, MessageSquare, FileText, Plus, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import moment from "moment";

const NOTE_TYPES = [
  { value: "progress", label: "Progress", color: "#22C55E" },
  { value: "concern", label: "Concern", color: "#EF4444" },
  { value: "goal", label: "Goal", color: "#4A90E2" },
  { value: "incident", label: "Incident", color: "#F59E0B" },
  { value: "general", label: "General", color: "#8E8E93" },
];

const MESSAGE_TYPES = [
  { value: "check_in", label: "Check-In" },
  { value: "compliance_update", label: "Compliance Update" },
  { value: "appointment_reminder", label: "Appointment Reminder" },
  { value: "document_request", label: "Document Request" },
  { value: "progress_note", label: "Progress Note" },
  { value: "general_message", label: "General Message" },
];

const TAG_COLORS = {
  required: { bg: "#FEE2E2", color: "#EF4444" },
  informational: { bg: "#EFF6FF", color: "#3B82F6" },
  follow_up: { bg: "#FEF3C7", color: "#D97706" },
};

function MetricBox({ label, value, valueColor }) {
  return (
    <div style={{ background: "#F7F7F8", borderRadius: "6px", padding: "14px 16px" }}>
      <p className="text-[11px] uppercase tracking-wide font-semibold mb-1" style={{ color: "#8E8E93" }}>{label}</p>
      <p className="text-xl font-bold" style={{ color: valueColor || "#1E1E1E" }}>{value}</p>
    </div>
  );
}

export default function ClientView({ client, authorEmail, authorRole, channel, facilityId, onBack }) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteForm, setNoteForm] = useState({ content: "", note_type: "general" });
  const [msgForm, setMsgForm] = useState({ message_type: "general_message", subject: "", body: "", status_tag: "", required_response: false });

  const clientEmail = client.participant_email;

  // Metrics
  const { data: checkIns = [] } = useQuery({
    queryKey: ["client-checkins", clientEmail],
    queryFn: () => base44.entities.DailyCheckIn.filter({ participant_email: clientEmail }, "-check_in_date", 30),
  });

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentCheckIns = checkIns.filter(c => new Date(c.check_in_date) >= sevenDaysAgo);
  const compliance = Math.round((recentCheckIns.length / 7) * 100);
  const sorted = [...checkIns].sort((a, b) => new Date(b.check_in_date) - new Date(a.check_in_date));
  const lastCheckIn = sorted[0]?.check_in_date || null;
  const daysSince = lastCheckIn ? Math.floor((new Date() - new Date(lastCheckIn)) / 86400000) : 999;
  const risk = compliance < 40 || daysSince >= 3 ? "high" : compliance < 70 ? "medium" : "low";

  // Messages
  const { data: messages = [] } = useQuery({
    queryKey: ["client-messages", channel, clientEmail],
    queryFn: async () => {
      const sent = await base44.entities.Message.filter({ channel, sender_email: authorEmail, receiver_email: clientEmail });
      const received = await base44.entities.Message.filter({ channel, sender_email: clientEmail, receiver_email: authorEmail });
      return [...sent, ...received].sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    },
    refetchInterval: 20000,
  });

  // Progress Notes
  const { data: notes = [] } = useQuery({
    queryKey: ["progress-notes", clientEmail],
    queryFn: () => base44.entities.ProgressNote.filter({ client_email: clientEmail }, "-created_date", 50),
  });

  const sendMessageMutation = useMutation({
    mutationFn: () => base44.entities.Message.create({
      sender_email: authorEmail,
      sender_role: authorRole,
      receiver_email: clientEmail,
      receiver_role: "patient",
      channel,
      message_type: msgForm.message_type,
      subject: msgForm.subject.trim(),
      body: msgForm.body.trim(),
      status_tag: msgForm.status_tag || undefined,
      required_response: msgForm.required_response,
      is_read: false,
      facility_id: facilityId || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(["client-messages"]);
      setMsgForm({ message_type: "general_message", subject: "", body: "", status_tag: "", required_response: false });
      toast.success("Message sent");
    },
  });

  const addNoteMutation = useMutation({
    mutationFn: () => base44.entities.ProgressNote.create({
      client_email: clientEmail,
      author_email: authorEmail,
      author_role: authorRole,
      note_type: noteForm.note_type,
      content: noteForm.content.trim(),
      facility_id: facilityId || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(["progress-notes"]);
      setNoteForm({ content: "", note_type: "general" });
      setShowNoteForm(false);
      toast.success("Note saved");
    },
  });

  const TABS = [
    { id: "overview", label: "Overview" },
    { id: "messages", label: "Messages" },
    { id: "notes", label: "Progress Notes" },
  ];

  return (
    <div style={{ background: "#F7F7F8", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: "#FFF", borderBottom: "1px solid #D1D1D6", padding: "20px 24px 0" }}>
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm mb-4"
          style={{ color: "#8E8E93", background: "none", border: "none", cursor: "pointer" }}
        >
          <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
          Back to List
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm" style={{ background: "#E8F0FE", color: "#4A90E2" }}>
            {clientEmail[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate" style={{ color: "#1E1E1E" }}>{clientEmail}</p>
            <div className="flex items-center gap-2 mt-0.5">
              {risk === "high" && (
                <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded" style={{ background: "#FEE2E2", color: "#EF4444" }}>
                  <AlertTriangle className="w-3 h-3" strokeWidth={2} /> HIGH RISK
                </span>
              )}
              {risk === "medium" && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded" style={{ background: "#FEF3C7", color: "#D97706" }}>MEDIUM RISK</span>
              )}
              {risk === "low" && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded" style={{ background: "#DCFCE7", color: "#16A34A" }}>LOW RISK</span>
              )}
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className="px-4 py-3 text-sm font-medium"
              style={{
                color: activeTab === t.id ? "#4A90E2" : "#8E8E93",
                borderBottom: activeTab === t.id ? "2px solid #4A90E2" : "2px solid transparent",
                background: "none",
                border: "none",
                borderBottom: activeTab === t.id ? "2px solid #4A90E2" : "2px solid transparent",
                cursor: "pointer",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 py-6 max-w-2xl mx-auto">
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="grid grid-cols-3 gap-3">
              <MetricBox
                label="7-Day Compliance"
                value={`${Math.min(compliance, 100)}%`}
                valueColor={compliance >= 70 ? "#22C55E" : compliance >= 40 ? "#F59E0B" : "#EF4444"}
              />
              <MetricBox
                label="Last Check-In"
                value={lastCheckIn ? moment(lastCheckIn).format("MMM D") : "Never"}
                valueColor={daysSince >= 3 ? "#EF4444" : "#1E1E1E"}
              />
              <MetricBox
                label="Days Since"
                value={daysSince === 999 ? "—" : `${daysSince}d`}
                valueColor={daysSince >= 3 ? "#EF4444" : "#1E1E1E"}
              />
            </div>

            <div style={{ background: "#FFF", border: "1px solid #D1D1D6", borderRadius: "8px", padding: "20px" }}>
              <p className="text-xs uppercase tracking-wide font-semibold mb-3" style={{ color: "#8E8E93" }}>Recent Check-Ins</p>
              {checkIns.length === 0 ? (
                <p className="text-sm" style={{ color: "#8E8E93" }}>No check-ins recorded.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {checkIns.slice(0, 7).map(c => (
                    <div key={c.id} className="flex items-center justify-between" style={{ borderBottom: "1px solid #F0F0F3", paddingBottom: "8px" }}>
                      <p className="text-sm font-medium" style={{ color: "#1E1E1E" }}>
                        {moment(c.check_in_date).format("ddd, MMM D")}
                      </p>
                      <div className="flex items-center gap-2">
                        {c.attended_meeting && (
                          <span className="text-[10px] px-2 py-0.5 rounded font-medium" style={{ background: "#EFF6FF", color: "#3B82F6" }}>Meeting</span>
                        )}
                        <CheckCircle2 className="w-4 h-4" style={{ color: "#22C55E" }} strokeWidth={2} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {notes.length > 0 && (
              <div style={{ background: "#FFF", border: "1px solid #D1D1D6", borderRadius: "8px", padding: "20px" }}>
                <p className="text-xs uppercase tracking-wide font-semibold mb-3" style={{ color: "#8E8E93" }}>Latest Note</p>
                <p className="text-sm leading-relaxed" style={{ color: "#374151" }}>{notes[0].content}</p>
                <p className="text-xs mt-2" style={{ color: "#8E8E93" }}>{moment(notes[0].created_date).format("MMM D, YYYY")}</p>
              </div>
            )}
          </div>
        )}

        {/* MESSAGES TAB */}
        {activeTab === "messages" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Compose */}
            <div style={{ background: "#FFF", border: "1px solid #D1D1D6", borderRadius: "8px", padding: "20px" }}>
              <p className="text-xs uppercase tracking-wide font-semibold mb-4" style={{ color: "#8E8E93" }}>New Message</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium block mb-1" style={{ color: "#5A5A5A" }}>Type</label>
                    <select
                      value={msgForm.message_type}
                      onChange={e => setMsgForm({ ...msgForm, message_type: e.target.value })}
                      className="w-full px-3 py-2 text-sm"
                      style={{ background: "#F7F7F8", border: "1px solid #D1D1D6", borderRadius: "6px", color: "#1E1E1E" }}
                    >
                      {MESSAGE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium block mb-1" style={{ color: "#5A5A5A" }}>Status Tag</label>
                    <select
                      value={msgForm.status_tag}
                      onChange={e => setMsgForm({ ...msgForm, status_tag: e.target.value })}
                      className="w-full px-3 py-2 text-sm"
                      style={{ background: "#F7F7F8", border: "1px solid #D1D1D6", borderRadius: "6px", color: "#1E1E1E" }}
                    >
                      <option value="">No Tag</option>
                      <option value="required">Required</option>
                      <option value="informational">Informational</option>
                      <option value="follow_up">Follow-Up</option>
                    </select>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Subject *"
                  value={msgForm.subject}
                  onChange={e => setMsgForm({ ...msgForm, subject: e.target.value })}
                  className="w-full px-3 py-2 text-sm"
                  style={{ background: "#F7F7F8", border: "1px solid #D1D1D6", borderRadius: "6px", color: "#1E1E1E" }}
                />
                <textarea
                  placeholder="Message body *"
                  value={msgForm.body}
                  onChange={e => setMsgForm({ ...msgForm, body: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 text-sm"
                  style={{ background: "#F7F7F8", border: "1px solid #D1D1D6", borderRadius: "6px", color: "#1E1E1E", resize: "vertical" }}
                />
                <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "#1E1E1E" }}>
                  <input type="checkbox" checked={msgForm.required_response} onChange={e => setMsgForm({ ...msgForm, required_response: e.target.checked })} />
                  Requires Response
                </label>
                <button
                  onClick={() => sendMessageMutation.mutate()}
                  disabled={!msgForm.subject.trim() || !msgForm.body.trim() || sendMessageMutation.isPending}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded"
                  style={{
                    background: !msgForm.subject.trim() || !msgForm.body.trim() ? "#E5E7EB" : "#4A90E2",
                    color: !msgForm.subject.trim() || !msgForm.body.trim() ? "#9CA3AF" : "#FFF",
                    border: "none",
                    borderRadius: "6px",
                    cursor: !msgForm.subject.trim() || !msgForm.body.trim() ? "not-allowed" : "pointer",
                  }}
                >
                  <Send className="w-4 h-4" strokeWidth={1.5} />
                  {sendMessageMutation.isPending ? "Sending..." : "Send Message"}
                </button>
              </div>
            </div>

            {/* Thread */}
            <div>
              <p className="text-xs uppercase tracking-wide font-semibold mb-3" style={{ color: "#8E8E93" }}>
                Message Thread ({messages.length})
              </p>
              {messages.length === 0 ? (
                <div className="text-center py-10 text-sm" style={{ color: "#8E8E93" }}>No messages yet.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {messages.map(msg => {
                    const isFromMe = msg.sender_email === authorEmail;
                    const tag = msg.status_tag;
                    const tagStyle = tag ? TAG_COLORS[tag] : null;
                    return (
                      <div
                        key={msg.id}
                        style={{
                          background: "#FFF",
                          border: "1px solid #E5E7EB",
                          borderRadius: "8px",
                          padding: "14px 16px",
                          borderLeft: isFromMe ? "3px solid #4A90E2" : "3px solid #E5E7EB",
                        }}
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-semibold px-2 py-0.5 rounded" style={{ background: "#F0F4FA", color: "#4A90E2" }}>
                              {msg.message_type?.replace(/_/g, " ")}
                            </span>
                            {tagStyle && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded uppercase" style={{ background: tagStyle.bg, color: tagStyle.color }}>
                                {tag.replace("_", " ")}
                              </span>
                            )}
                          </div>
                          <span className="text-xs whitespace-nowrap" style={{ color: "#8E8E93" }}>
                            {moment(msg.created_date).format("MMM D, h:mm A")}
                          </span>
                        </div>
                        {msg.subject && <p className="text-sm font-semibold mb-1" style={{ color: "#1E1E1E" }}>{msg.subject}</p>}
                        <p className="text-sm leading-relaxed" style={{ color: "#374151" }}>{msg.body}</p>
                        <p className="text-xs mt-2" style={{ color: "#8E8E93" }}>
                          {isFromMe ? "You" : msg.sender_email} · {msg.is_read ? "Read" : "Unread"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PROGRESS NOTES TAB */}
        {activeTab === "notes" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wide font-semibold" style={{ color: "#8E8E93" }}>
                {notes.length} Progress Note{notes.length !== 1 ? "s" : ""}
              </p>
              <button
                onClick={() => setShowNoteForm(!showNoteForm)}
                className="flex items-center gap-1.5 text-xs px-3 py-2 rounded font-medium"
                style={{ background: showNoteForm ? "#F5F5F7" : "#4A90E2", color: showNoteForm ? "#5A5A5A" : "#FFF", border: showNoteForm ? "1px solid #D1D1D6" : "none", cursor: "pointer" }}
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={2} />
                {showNoteForm ? "Cancel" : "Add Note"}
              </button>
            </div>

            {showNoteForm && (
              <div style={{ background: "#FFF", border: "1px solid #D1D1D6", borderRadius: "8px", padding: "20px" }}>
                <p className="text-xs uppercase tracking-wide font-semibold mb-4" style={{ color: "#8E8E93" }}>New Progress Note</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div>
                    <label className="text-xs font-medium block mb-2" style={{ color: "#5A5A5A" }}>Note Type</label>
                    <div className="flex flex-wrap gap-2">
                      {NOTE_TYPES.map(nt => (
                        <button
                          key={nt.value}
                          onClick={() => setNoteForm({ ...noteForm, note_type: nt.value })}
                          className="text-xs px-3 py-1.5 rounded-full font-medium"
                          style={{
                            background: noteForm.note_type === nt.value ? nt.color : "#F5F5F7",
                            color: noteForm.note_type === nt.value ? "#FFF" : "#5A5A5A",
                            border: noteForm.note_type === nt.value ? "none" : "1px solid #D1D1D6",
                            cursor: "pointer",
                          }}
                        >
                          {nt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    placeholder="Enter your progress note..."
                    value={noteForm.content}
                    onChange={e => setNoteForm({ ...noteForm, content: e.target.value })}
                    rows={5}
                    className="w-full px-3 py-2 text-sm"
                    style={{ background: "#F7F7F8", border: "1px solid #D1D1D6", borderRadius: "6px", color: "#1E1E1E", resize: "vertical" }}
                  />
                  <button
                    onClick={() => addNoteMutation.mutate()}
                    disabled={!noteForm.content.trim() || addNoteMutation.isPending}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded"
                    style={{
                      background: !noteForm.content.trim() ? "#E5E7EB" : "#4A90E2",
                      color: !noteForm.content.trim() ? "#9CA3AF" : "#FFF",
                      border: "none",
                      borderRadius: "6px",
                      cursor: !noteForm.content.trim() ? "not-allowed" : "pointer",
                    }}
                  >
                    {addNoteMutation.isPending ? "Saving..." : "Save Note"}
                  </button>
                </div>
              </div>
            )}

            {notes.length === 0 && !showNoteForm ? (
              <div className="text-center py-16 text-sm" style={{ color: "#8E8E93" }}>No progress notes yet. Add the first one.</div>
            ) : (
              notes.map(note => {
                const nt = NOTE_TYPES.find(t => t.value === note.note_type) || NOTE_TYPES[4];
                return (
                  <div key={note.id} style={{ background: "#FFF", border: "1px solid #E5E7EB", borderRadius: "8px", padding: "16px", borderLeft: `3px solid ${nt.color}` }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded uppercase" style={{ background: `${nt.color}15`, color: nt.color }}>
                        {nt.label}
                      </span>
                      <span className="text-xs" style={{ color: "#8E8E93" }}>{moment(note.created_date).format("MMM D, YYYY · h:mm A")}</span>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "#374151" }}>{note.content}</p>
                    <p className="text-xs mt-2" style={{ color: "#8E8E93" }}>{note.author_email}</p>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}