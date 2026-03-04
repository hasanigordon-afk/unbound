import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Clock, MapPin, Calendar } from "lucide-react";
import { toast } from "sonner";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const PROGRAM_COLORS = { AA: "#4A90E2", NA: "#9C6FE4", SMART: "#22c55e", Other: "#FF9800" };

function WeekView({ planned }) {
  const byDay = Array.from({ length: 7 }, (_, i) => ({
    day: i,
    label: DAYS[i],
    items: planned.filter(p => p.day_of_week === i),
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {byDay.map(({ day, label, items }) => (
        <div key={day} style={{ background: "#FFF", border: "1px solid #D1D1D6", borderRadius: "8px", overflow: "hidden" }}>
          <div className="flex items-center justify-between px-4 py-2" style={{ background: items.length > 0 ? "#EEF4FD" : "#F7F7F8", borderBottom: items.length > 0 ? "1px solid #C7D7F0" : "none" }}>
            <p className="text-xs font-semibold" style={{ color: items.length > 0 ? "#4A90E2" : "#8E8E93" }}>{label}</p>
            {items.length > 0 && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#4A90E2", color: "#FFF" }}>
                {items.length}
              </span>
            )}
          </div>
          {items.length > 0 && (
            <div className="px-4 py-2" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {items.map(p => (
                <div key={p.id} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: PROGRAM_COLORS[p.meeting_program_type] || "#8E8E93" }} />
                  <p className="text-sm font-medium flex-1" style={{ color: "#1E1E1E" }}>{p.meeting_title}</p>
                  {p.start_time && (
                    <p className="text-xs" style={{ color: "#8E8E93" }}>{p.start_time}</p>
                  )}
                </div>
              ))}
            </div>
          )}
          {items.length === 0 && (
            <div className="px-4 py-2">
              <p className="text-xs" style={{ color: "#C0C0C6" }}>No meetings planned</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function MyPlanTab({ user, meetings = [] }) {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ meeting_id: "", meeting_title: "", meeting_program_type: "", day_of_week: 0, start_time: "", location_text: "", notes: "" });

  const { data: planned = [] } = useQuery({
    queryKey: ["planned-meetings", user?.email],
    queryFn: () => base44.entities.PlannedMeeting.filter({ participant_email: user.email }),
    enabled: !!user,
  });

  const addMutation = useMutation({
    mutationFn: () => base44.entities.PlannedMeeting.create({
      ...form,
      day_of_week: parseInt(form.day_of_week),
      participant_email: user.email,
      meeting_id: form.meeting_id || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(["planned-meetings"]);
      setShowAdd(false);
      setForm({ meeting_id: "", meeting_title: "", meeting_program_type: "", day_of_week: 0, start_time: "", location_text: "", notes: "" });
      toast.success("Added to your plan!");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PlannedMeeting.delete(id),
    onSuccess: () => queryClient.invalidateQueries(["planned-meetings"]),
  });

  const handleMeetingSelect = (e) => {
    const id = e.target.value;
    if (id === "__custom__") {
      setForm(f => ({ ...f, meeting_id: "", meeting_title: "", meeting_program_type: "", start_time: "" }));
      return;
    }
    const m = meetings.find(m => m.id === id);
    if (m) {
      setForm(f => ({
        ...f,
        meeting_id: m.id,
        meeting_title: m.title,
        meeting_program_type: m.program_type,
        day_of_week: m.day_of_week ?? f.day_of_week,
        start_time: m.start_time || "",
        location_text: m.address ? `${m.address}, ${m.city}` : (m.url || ""),
      }));
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide font-semibold" style={{ color: "#8E8E93" }}>Weekly Plan</p>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1.5 text-xs px-3 py-2 rounded font-medium"
          style={{ background: showAdd ? "#F5F5F7" : "#4A90E2", color: showAdd ? "#5A5A5A" : "#FFF", border: showAdd ? "1px solid #D1D1D6" : "none", cursor: "pointer" }}
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={2} />
          {showAdd ? "Cancel" : "Add Meeting"}
        </button>
      </div>

      {showAdd && (
        <div style={{ background: "#FFF", border: "1px solid #D1D1D6", borderRadius: "8px", padding: "20px" }}>
          <p className="text-xs uppercase tracking-wide font-semibold mb-4" style={{ color: "#8E8E93" }}>Schedule a Meeting</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "#5A5A5A" }}>Choose from Meeting Directory</label>
              <select
                onChange={handleMeetingSelect}
                className="w-full px-3 py-2 text-sm"
                style={{ background: "#F7F7F8", border: "1px solid #D1D1D6", borderRadius: "6px", color: "#1E1E1E" }}
              >
                <option value="__custom__">— Enter custom meeting —</option>
                {meetings.map(m => (
                  <option key={m.id} value={m.id}>{m.title} · {DAYS[m.day_of_week]} {m.start_time}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "#5A5A5A" }}>Meeting Name *</label>
              <input
                type="text"
                value={form.meeting_title}
                onChange={e => setForm(f => ({ ...f, meeting_title: e.target.value }))}
                placeholder="e.g., Monday Night AA"
                className="w-full px-3 py-2 text-sm"
                style={{ background: "#F7F7F8", border: "1px solid #D1D1D6", borderRadius: "6px", color: "#1E1E1E" }}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "#5A5A5A" }}>Day of Week *</label>
                <select
                  value={form.day_of_week}
                  onChange={e => setForm(f => ({ ...f, day_of_week: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 text-sm"
                  style={{ background: "#F7F7F8", border: "1px solid #D1D1D6", borderRadius: "6px", color: "#1E1E1E" }}
                >
                  {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "#5A5A5A" }}>Time</label>
                <input
                  type="time"
                  value={form.start_time}
                  onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))}
                  className="w-full px-3 py-2 text-sm"
                  style={{ background: "#F7F7F8", border: "1px solid #D1D1D6", borderRadius: "6px", color: "#1E1E1E" }}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "#5A5A5A" }}>Location / Link</label>
              <input
                type="text"
                value={form.location_text}
                onChange={e => setForm(f => ({ ...f, location_text: e.target.value }))}
                placeholder="Address or online link"
                className="w-full px-3 py-2 text-sm"
                style={{ background: "#F7F7F8", border: "1px solid #D1D1D6", borderRadius: "6px", color: "#1E1E1E" }}
              />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "#5A5A5A" }}>Notes</label>
              <textarea
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Personal reminders, contact info..."
                rows={2}
                className="w-full px-3 py-2 text-sm"
                style={{ background: "#F7F7F8", border: "1px solid #D1D1D6", borderRadius: "6px", color: "#1E1E1E", resize: "none" }}
              />
            </div>
            <button
              onClick={() => addMutation.mutate()}
              disabled={!form.meeting_title.trim() || addMutation.isPending}
              className="px-4 py-2.5 text-sm font-medium rounded"
              style={{
                background: !form.meeting_title.trim() ? "#E5E7EB" : "#4A90E2",
                color: !form.meeting_title.trim() ? "#9CA3AF" : "#FFF",
                border: "none", borderRadius: "6px",
                cursor: !form.meeting_title.trim() ? "not-allowed" : "pointer",
              }}
            >
              {addMutation.isPending ? "Saving..." : "Add to My Plan"}
            </button>
          </div>
        </div>
      )}

      <WeekView planned={planned} />

      {planned.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-wide font-semibold mb-3" style={{ color: "#8E8E93" }}>All Planned Meetings</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {planned.sort((a, b) => a.day_of_week - b.day_of_week).map(p => (
              <div key={p.id} style={{ background: "#FFF", border: "1px solid #D1D1D6", borderRadius: "8px", padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px" }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#EEF4FD" }}>
                  <p className="text-xs font-bold" style={{ color: "#4A90E2" }}>{DAYS[p.day_of_week]}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: "#1E1E1E" }}>{p.meeting_title}</p>
                  <p className="text-xs" style={{ color: "#8E8E93" }}>
                    {p.start_time && `${p.start_time} · `}
                    {p.location_text || "No location"}
                  </p>
                </div>
                <button onClick={() => deleteMutation.mutate(p.id)} className="flex-shrink-0 p-1.5 rounded" style={{ background: "#FEE2E2", border: "none", cursor: "pointer" }}>
                  <Trash2 className="w-3.5 h-3.5" style={{ color: "#EF4444" }} strokeWidth={2} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}