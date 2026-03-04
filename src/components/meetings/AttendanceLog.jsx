import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, CheckCircle2, BookOpen } from "lucide-react";
import { toast } from "sonner";
import moment from "moment";

export default function AttendanceLog({ user, meetings = [] }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ meeting_id: "", meeting_name_text: "", attended_at: new Date().toISOString().split('T')[0], notes: "" });

  const { data: attendance = [] } = useQuery({
    queryKey: ["meeting-attendance-log", user?.email],
    queryFn: () => base44.entities.MeetingAttendance.filter({ participant_email: user.email }, "-attended_at", 60),
    enabled: !!user,
  });

  const logMutation = useMutation({
    mutationFn: () => {
      const selected = meetings.find(m => m.id === form.meeting_id);
      return base44.entities.MeetingAttendance.create({
        meeting_id: form.meeting_id || undefined,
        meeting_name_text: form.meeting_id ? (selected?.title || "") : form.meeting_name_text.trim(),
        attended_at: form.attended_at,
        notes: form.notes.trim(),
        participant_email: user.email,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["meeting-attendance"]);
      queryClient.invalidateQueries(["meeting-attendance-log"]);
      setShowForm(false);
      setForm({ meeting_id: "", meeting_name_text: "", attended_at: new Date().toISOString().split('T')[0], notes: "" });
      toast.success("Attendance logged!");
    },
  });

  // Group by month
  const grouped = attendance.reduce((acc, a) => {
    const key = moment(a.attended_at).format("MMMM YYYY");
    if (!acc[key]) acc[key] = [];
    acc[key].push(a);
    return acc;
  }, {});

  const totalThisMonth = attendance.filter(a => moment(a.attended_at).isSame(moment(), "month")).length;
  const totalThisWeek = attendance.filter(a => moment(a.attended_at).isSame(moment(), "week")).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div style={{ background: "#FFF", border: "1px solid #D1D1D6", borderRadius: "8px", padding: "16px 18px" }}>
          <p className="text-[11px] uppercase tracking-wide font-semibold mb-1" style={{ color: "#8E8E93" }}>This Week</p>
          <p className="text-2xl font-bold" style={{ color: "#4A90E2" }}>{totalThisWeek}</p>
          <p className="text-xs" style={{ color: "#8E8E93" }}>meeting{totalThisWeek !== 1 ? "s" : ""} attended</p>
        </div>
        <div style={{ background: "#FFF", border: "1px solid #D1D1D6", borderRadius: "8px", padding: "16px 18px" }}>
          <p className="text-[11px] uppercase tracking-wide font-semibold mb-1" style={{ color: "#8E8E93" }}>This Month</p>
          <p className="text-2xl font-bold" style={{ color: "#22C55E" }}>{totalThisMonth}</p>
          <p className="text-xs" style={{ color: "#8E8E93" }}>meeting{totalThisMonth !== 1 ? "s" : ""} attended</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide font-semibold" style={{ color: "#8E8E93" }}>Attendance History</p>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 text-xs px-3 py-2 rounded font-medium"
          style={{ background: showForm ? "#F5F5F7" : "#4A90E2", color: showForm ? "#5A5A5A" : "#FFF", border: showForm ? "1px solid #D1D1D6" : "none", cursor: "pointer" }}
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={2} />
          {showForm ? "Cancel" : "Log Attendance"}
        </button>
      </div>

      {showForm && (
        <div style={{ background: "#FFF", border: "1px solid #D1D1D6", borderRadius: "8px", padding: "20px" }}>
          <p className="text-xs uppercase tracking-wide font-semibold mb-4" style={{ color: "#8E8E93" }}>Log a Meeting</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "#5A5A5A" }}>Select from Directory (optional)</label>
              <select
                value={form.meeting_id}
                onChange={e => setForm(f => ({ ...f, meeting_id: e.target.value, meeting_name_text: "" }))}
                className="w-full px-3 py-2 text-sm"
                style={{ background: "#F7F7F8", border: "1px solid #D1D1D6", borderRadius: "6px", color: "#1E1E1E" }}
              >
                <option value="">— Custom / not in directory —</option>
                {meetings.map(m => (
                  <option key={m.id} value={m.id}>{m.title}</option>
                ))}
              </select>
            </div>
            {!form.meeting_id && (
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "#5A5A5A" }}>Meeting Name *</label>
                <input
                  type="text"
                  value={form.meeting_name_text}
                  onChange={e => setForm(f => ({ ...f, meeting_name_text: e.target.value }))}
                  placeholder="e.g., Tuesday Morning NA"
                  className="w-full px-3 py-2 text-sm"
                  style={{ background: "#F7F7F8", border: "1px solid #D1D1D6", borderRadius: "6px", color: "#1E1E1E" }}
                />
              </div>
            )}
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "#5A5A5A" }}>Date *</label>
              <input
                type="date"
                value={form.attended_at}
                onChange={e => setForm(f => ({ ...f, attended_at: e.target.value }))}
                className="w-full px-3 py-2 text-sm"
                style={{ background: "#F7F7F8", border: "1px solid #D1D1D6", borderRadius: "6px", color: "#1E1E1E" }}
              />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "#5A5A5A" }}>Notes</label>
              <textarea
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Speaker topic, how you felt, takeaways..."
                rows={2}
                className="w-full px-3 py-2 text-sm"
                style={{ background: "#F7F7F8", border: "1px solid #D1D1D6", borderRadius: "6px", color: "#1E1E1E", resize: "none" }}
              />
            </div>
            <button
              onClick={() => logMutation.mutate()}
              disabled={(!form.meeting_id && !form.meeting_name_text.trim()) || logMutation.isPending}
              className="px-4 py-2.5 text-sm font-medium rounded"
              style={{
                background: (!form.meeting_id && !form.meeting_name_text.trim()) ? "#E5E7EB" : "#4A90E2",
                color: (!form.meeting_id && !form.meeting_name_text.trim()) ? "#9CA3AF" : "#FFF",
                border: "none", borderRadius: "6px",
                cursor: (!form.meeting_id && !form.meeting_name_text.trim()) ? "not-allowed" : "pointer",
              }}
            >
              {logMutation.isPending ? "Saving..." : "Log Attendance"}
            </button>
          </div>
        </div>
      )}

      {attendance.length === 0 ? (
        <div className="text-center py-12" style={{ color: "#8E8E93" }}>
          <BookOpen className="w-10 h-10 mx-auto mb-3" strokeWidth={1.5} style={{ color: "#D1D1D6" }} />
          <p className="text-sm">No attendance logged yet.</p>
          <p className="text-xs mt-1">Tap "Log Attendance" to get started.</p>
        </div>
      ) : (
        Object.entries(grouped).map(([month, entries]) => (
          <div key={month}>
            <p className="text-xs uppercase tracking-wide font-semibold mb-2" style={{ color: "#8E8E93" }}>
              {month} <span style={{ color: "#C0C0C6", fontWeight: 400 }}>· {entries.length} meeting{entries.length !== 1 ? "s" : ""}</span>
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {entries.map(a => (
                <div key={a.id} style={{ background: "#FFF", border: "1px solid #D1D1D6", borderRadius: "8px", padding: "12px 16px", display: "flex", alignItems: "center", gap: "12px" }}>
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: "#22C55E" }} strokeWidth={2} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "#1E1E1E" }}>{a.meeting_name_text || "Meeting"}</p>
                    {a.notes && <p className="text-xs truncate" style={{ color: "#8E8E93" }}>{a.notes}</p>}
                  </div>
                  <p className="text-xs flex-shrink-0" style={{ color: "#8E8E93" }}>{moment(a.attended_at).format("MMM D")}</p>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}