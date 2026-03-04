import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, AlertTriangle, CheckCircle2, Clock, MapPin, User, Trash2 } from "lucide-react";
import { toast } from "sonner";
import moment from "moment";

const APPT_TYPES = [
  { value: "probation_check_in", label: "Probation Check-In", color: "#4A90E2" },
  { value: "parole_check_in", label: "Parole Check-In", color: "#9C6FE4" },
  { value: "drug_test", label: "Drug Test", color: "#EF4444" },
  { value: "community_service", label: "Community Service", color: "#F59E0B" },
  { value: "counseling", label: "Counseling Session", color: "#22C55E" },
  { value: "court_date", label: "Court Date", color: "#1E1E1E" },
  { value: "other", label: "Other", color: "#8E8E93" },
];

const STATUS_CONFIG = {
  scheduled: { label: "Scheduled", color: "#4A90E2", bg: "#EEF4FD" },
  attended: { label: "Attended", color: "#22C55E", bg: "#DCFCE7" },
  missed: { label: "Missed", color: "#EF4444", bg: "#FEE2E2" },
  rescheduled: { label: "Rescheduled", color: "#F59E0B", bg: "#FEF3C7" },
};

export default function ProbationCalendar({ user }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [activeFilter, setActiveFilter] = useState("upcoming");
  const [form, setForm] = useState({
    title: "",
    appointment_type: "probation_check_in",
    appointment_date: "",
    appointment_time: "",
    officer_name: "",
    location: "",
    notes: "",
    is_recurring: false,
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ["probation-appointments", user?.email],
    queryFn: () => base44.entities.ProbationAppointment.filter({ participant_email: user.email }, "-appointment_date", 100),
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: () => base44.entities.ProbationAppointment.create({
      ...form,
      participant_email: user.email,
      status: "scheduled",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(["probation-appointments"]);
      setShowForm(false);
      setForm({ title: "", appointment_type: "probation_check_in", appointment_date: "", appointment_time: "", officer_name: "", location: "", notes: "", is_recurring: false });
      toast.success("Appointment added!");
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.ProbationAppointment.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries(["probation-appointments"]),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ProbationAppointment.delete(id),
    onSuccess: () => queryClient.invalidateQueries(["probation-appointments"]),
  });

  const today = moment().format("YYYY-MM-DD");

  const filtered = appointments.filter(a => {
    if (activeFilter === "upcoming") return a.appointment_date >= today && a.status === "scheduled";
    if (activeFilter === "past") return a.appointment_date < today || a.status !== "scheduled";
    return true;
  }).sort((a, b) => a.appointment_date.localeCompare(b.appointment_date));

  const upcoming = appointments.filter(a => a.appointment_date >= today && a.status === "scheduled");
  const nextAppt = upcoming.sort((a, b) => a.appointment_date.localeCompare(b.appointment_date))[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Next appointment banner */}
      {nextAppt && (
        <div style={{ background: "#EEF4FD", border: "1px solid #C7D7F0", borderRadius: "10px", padding: "16px 18px" }}>
          <p className="text-[11px] font-semibold uppercase tracking-wide mb-1" style={{ color: "#4A90E2" }}>Next Appointment</p>
          <p className="font-semibold text-sm" style={{ color: "#1E1E1E" }}>{nextAppt.title}</p>
          <p className="text-xs mt-1" style={{ color: "#5A5A5A" }}>
            {moment(nextAppt.appointment_date).format("dddd, MMMM D, YYYY")}
            {nextAppt.appointment_time && ` at ${nextAppt.appointment_time}`}
          </p>
          {nextAppt.location && (
            <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: "#8E8E93" }}>
              <MapPin className="w-3 h-3" strokeWidth={1.5} /> {nextAppt.location}
            </p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {["upcoming", "past", "all"].map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className="text-xs px-3 py-1.5 rounded-full font-medium capitalize"
              style={{
                background: activeFilter === f ? "#4A90E2" : "#F5F5F7",
                color: activeFilter === f ? "#FFF" : "#5A5A5A",
                border: activeFilter === f ? "none" : "1px solid #D1D1D6",
                cursor: "pointer",
              }}
            >
              {f}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 text-xs px-3 py-2 rounded font-medium"
          style={{ background: showForm ? "#F5F5F7" : "#4A90E2", color: showForm ? "#5A5A5A" : "#FFF", border: showForm ? "1px solid #D1D1D6" : "none", cursor: "pointer" }}
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={2} />
          {showForm ? "Cancel" : "Add"}
        </button>
      </div>

      {showForm && (
        <div style={{ background: "#FFF", border: "1px solid #D1D1D6", borderRadius: "8px", padding: "20px" }}>
          <p className="text-xs uppercase tracking-wide font-semibold mb-4" style={{ color: "#8E8E93" }}>New Appointment</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "#5A5A5A" }}>Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g., Monthly check-in with Officer Smith"
                className="w-full px-3 py-2 text-sm"
                style={{ background: "#F7F7F8", border: "1px solid #D1D1D6", borderRadius: "6px", color: "#1E1E1E" }}
              />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "#5A5A5A" }}>Type</label>
              <select
                value={form.appointment_type}
                onChange={e => setForm(f => ({ ...f, appointment_type: e.target.value }))}
                className="w-full px-3 py-2 text-sm"
                style={{ background: "#F7F7F8", border: "1px solid #D1D1D6", borderRadius: "6px", color: "#1E1E1E" }}
              >
                {APPT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "#5A5A5A" }}>Date *</label>
                <input
                  type="date"
                  value={form.appointment_date}
                  onChange={e => setForm(f => ({ ...f, appointment_date: e.target.value }))}
                  className="w-full px-3 py-2 text-sm"
                  style={{ background: "#F7F7F8", border: "1px solid #D1D1D6", borderRadius: "6px", color: "#1E1E1E" }}
                />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: "#5A5A5A" }}>Time</label>
                <input
                  type="time"
                  value={form.appointment_time}
                  onChange={e => setForm(f => ({ ...f, appointment_time: e.target.value }))}
                  className="w-full px-3 py-2 text-sm"
                  style={{ background: "#F7F7F8", border: "1px solid #D1D1D6", borderRadius: "6px", color: "#1E1E1E" }}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "#5A5A5A" }}>Officer / Supervisor Name</label>
              <input
                type="text"
                value={form.officer_name}
                onChange={e => setForm(f => ({ ...f, officer_name: e.target.value }))}
                placeholder="Name of officer"
                className="w-full px-3 py-2 text-sm"
                style={{ background: "#F7F7F8", border: "1px solid #D1D1D6", borderRadius: "6px", color: "#1E1E1E" }}
              />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "#5A5A5A" }}>Location / Office</label>
              <input
                type="text"
                value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                placeholder="123 Main St, Suite 4"
                className="w-full px-3 py-2 text-sm"
                style={{ background: "#F7F7F8", border: "1px solid #D1D1D6", borderRadius: "6px", color: "#1E1E1E" }}
              />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "#5A5A5A" }}>Notes</label>
              <textarea
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Documents needed, outcome, requirements..."
                rows={2}
                className="w-full px-3 py-2 text-sm"
                style={{ background: "#F7F7F8", border: "1px solid #D1D1D6", borderRadius: "6px", color: "#1E1E1E", resize: "none" }}
              />
            </div>
            <button
              onClick={() => createMutation.mutate()}
              disabled={!form.title.trim() || !form.appointment_date || createMutation.isPending}
              className="px-4 py-2.5 text-sm font-medium rounded"
              style={{
                background: (!form.title.trim() || !form.appointment_date) ? "#E5E7EB" : "#4A90E2",
                color: (!form.title.trim() || !form.appointment_date) ? "#9CA3AF" : "#FFF",
                border: "none", borderRadius: "6px",
                cursor: (!form.title.trim() || !form.appointment_date) ? "not-allowed" : "pointer",
              }}
            >
              {createMutation.isPending ? "Saving..." : "Add Appointment"}
            </button>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-12" style={{ color: "#8E8E93" }}>
          <Clock className="w-10 h-10 mx-auto mb-3" strokeWidth={1.5} style={{ color: "#D1D1D6" }} />
          <p className="text-sm">No {activeFilter === "upcoming" ? "upcoming" : activeFilter === "past" ? "past" : ""} appointments.</p>
        </div>
      ) : (
        filtered.map(appt => {
          const typeConfig = APPT_TYPES.find(t => t.value === appt.appointment_type) || APPT_TYPES[6];
          const statusConfig = STATUS_CONFIG[appt.status] || STATUS_CONFIG.scheduled;
          const isPast = appt.appointment_date < today;
          return (
            <div key={appt.id} style={{ background: "#FFF", border: "1px solid #D1D1D6", borderRadius: "8px", padding: "16px 18px", borderLeft: `3px solid ${typeConfig.color}` }}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <p className="font-semibold text-sm" style={{ color: "#1E1E1E" }}>{appt.title}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: `${typeConfig.color}15`, color: typeConfig.color }}>
                      {typeConfig.label}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: statusConfig.bg, color: statusConfig.color }}>
                      {statusConfig.label}
                    </span>
                  </div>
                </div>
                <button onClick={() => deleteMutation.mutate(appt.id)} className="flex-shrink-0 p-1.5 rounded" style={{ background: "#F5F5F7", border: "none", cursor: "pointer" }}>
                  <Trash2 className="w-3.5 h-3.5" style={{ color: "#8E8E93" }} strokeWidth={2} />
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <p className="text-xs flex items-center gap-1.5" style={{ color: "#5A5A5A" }}>
                  <Clock className="w-3 h-3" strokeWidth={1.5} />
                  {moment(appt.appointment_date).format("ddd, MMMM D, YYYY")}
                  {appt.appointment_time && ` at ${appt.appointment_time}`}
                </p>
                {appt.officer_name && (
                  <p className="text-xs flex items-center gap-1.5" style={{ color: "#5A5A5A" }}>
                    <User className="w-3 h-3" strokeWidth={1.5} /> {appt.officer_name}
                  </p>
                )}
                {appt.location && (
                  <p className="text-xs flex items-center gap-1.5" style={{ color: "#5A5A5A" }}>
                    <MapPin className="w-3 h-3" strokeWidth={1.5} /> {appt.location}
                  </p>
                )}
                {appt.notes && (
                  <p className="text-xs mt-1" style={{ color: "#8E8E93" }}>{appt.notes}</p>
                )}
              </div>

              {appt.status === "scheduled" && (
                <div className="flex gap-2 mt-3 pt-3" style={{ borderTop: "1px solid #F0F0F3" }}>
                  <button
                    onClick={() => updateStatusMutation.mutate({ id: appt.id, status: "attended" })}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded font-medium"
                    style={{ background: "#DCFCE7", color: "#16A34A", border: "none", cursor: "pointer" }}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} /> Mark Attended
                  </button>
                  <button
                    onClick={() => updateStatusMutation.mutate({ id: appt.id, status: "missed" })}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded font-medium"
                    style={{ background: "#FEE2E2", color: "#EF4444", border: "none", cursor: "pointer" }}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" strokeWidth={2} /> Missed
                  </button>
                  <button
                    onClick={() => updateStatusMutation.mutate({ id: appt.id, status: "rescheduled" })}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded font-medium"
                    style={{ background: "#FEF3C7", color: "#D97706", border: "none", cursor: "pointer" }}
                  >
                    Rescheduled
                  </button>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}