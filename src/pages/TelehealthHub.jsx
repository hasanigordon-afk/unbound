import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Video, Calendar, Phone, Users, Plus, Loader2, CheckCircle2, Clock, X } from "lucide-react";

const SESSION_TYPES = [
  { value: "individual_counseling", label: "1-on-1 Counseling", icon: "🧠", color: "#4A90E2" },
  { value: "group_meeting",         label: "Group Meeting",    icon: "👥", color: "#8B5CF6" },
  { value: "sponsor_call",          label: "Call My Sponsor",  icon: "📞", color: "#22C55E" },
  { value: "peer_support",          label: "Peer Support",     icon: "🤝", color: "#F59E0B" },
  { value: "medication_check",      label: "Med Check-In",     icon: "💊", color: "#EC4899" },
];

const STATUS_COLOR = { scheduled: "#F59E0B", completed: "#22C55E", cancelled: "#EF4444", in_progress: "#4A90E2", no_show: "#6B7280" };

export default function TelehealthHub() {
  const queryClient = useQueryClient();
  const [showSchedule, setShowSchedule] = useState(false);
  const [form, setForm] = useState({ session_type: "", scheduled_date: "", scheduled_time: "", provider_email: "", notes: "" });

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["telehealth-sessions", user?.email],
    queryFn: () => base44.entities.TelehealthSession.filter({ participant_email: user?.email }),
    enabled: !!user,
  });

  const scheduleMutation = useMutation({
    mutationFn: () => base44.functions.invoke("serviceBridge", {
      module: "telehealth", action: "schedule_session",
      payload: { ...form, participant_email: user.email },
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(["telehealth-sessions"]);
      setShowSchedule(false);
      setForm({ session_type: "", scheduled_date: "", scheduled_time: "", provider_email: "", notes: "" });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id) => base44.functions.invoke("serviceBridge", {
      module: "telehealth", action: "cancel_session", payload: { session_id: id },
    }),
    onSuccess: () => queryClient.invalidateQueries(["telehealth-sessions"]),
  });

  const today = new Date().toISOString().split("T")[0];
  const upcoming = sessions.filter(s => s.scheduled_date >= today && s.status !== "cancelled").sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date));
  const past = sessions.filter(s => s.scheduled_date < today || s.status === "completed" || s.status === "cancelled").slice(0, 5);

  return (
    <div className="min-h-screen pb-28" style={{ background: "#F7F7F8" }}>
      <div className="px-5 pt-8 pb-5" style={{ background: "#FFF", borderBottom: "1px solid #D1D1D6" }}>
        <h1 className="text-xl font-bold" style={{ color: "#1E1E1E" }}>Telehealth</h1>
        <p className="text-sm mt-0.5" style={{ color: "#8E8E93" }}>Virtual sessions, group meetings, and sponsor calls</p>
      </div>

      <div className="px-5 py-5 space-y-6">
        {/* Quick Actions */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "#8E8E93" }}>Quick Connect</p>
          <div className="grid grid-cols-2 gap-3">
            {SESSION_TYPES.map(t => (
              <button key={t.value}
                onClick={() => { setForm(f => ({ ...f, session_type: t.value })); setShowSchedule(true); }}
                className="flex flex-col items-center gap-2 py-5 rounded-2xl"
                style={{ background: "#FFF", border: `1px solid ${t.color}30` }}>
                <span className="text-3xl">{t.icon}</span>
                <p className="text-sm font-semibold text-center" style={{ color: "#1E1E1E" }}>{t.label}</p>
              </button>
            ))}
            <button onClick={() => setShowSchedule(true)}
              className="flex flex-col items-center justify-center gap-2 py-5 rounded-2xl"
              style={{ background: "#4A90E2", border: "none" }}>
              <Plus className="w-6 h-6 text-white" />
              <p className="text-sm font-semibold text-white">Schedule New</p>
            </button>
          </div>
        </div>

        {/* Upcoming Sessions */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "#8E8E93" }}>
            Upcoming ({upcoming.length})
          </p>
          {isLoading ? (
            <div className="text-center py-8"><Loader2 className="w-6 h-6 mx-auto animate-spin opacity-30" /></div>
          ) : upcoming.length === 0 ? (
            <div className="text-center py-10 rounded-2xl" style={{ background: "#FFF", border: "1px solid #E5E7EB" }}>
              <Video className="w-8 h-8 mx-auto mb-2 opacity-20" />
              <p className="text-sm" style={{ color: "#8E8E93" }}>No upcoming sessions scheduled.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map(s => {
                const typeInfo = SESSION_TYPES.find(t => t.value === s.session_type);
                return (
                  <div key={s.id} className="rounded-2xl p-4" style={{ background: "#FFF", border: "1px solid #E5E7EB" }}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: `${typeInfo?.color}15` }}>
                          {typeInfo?.icon || "📅"}
                        </div>
                        <div>
                          <p className="font-semibold text-sm" style={{ color: "#1E1E1E" }}>{typeInfo?.label || s.session_type}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Calendar className="w-3 h-3" style={{ color: "#8E8E93" }} />
                            <p className="text-xs" style={{ color: "#8E8E93" }}>
                              {new Date(s.scheduled_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} at {s.scheduled_time}
                            </p>
                          </div>
                          {s.provider_name && <p className="text-xs mt-0.5" style={{ color: "#8E8E93" }}>with {s.provider_name}</p>}
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{ background: `${STATUS_COLOR[s.status]}20`, color: STATUS_COLOR[s.status] }}>
                        {s.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-4 pt-3" style={{ borderTop: "1px solid #F0F0F3" }}>
                      {s.meeting_url && (
                        <a href={s.meeting_url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg font-semibold"
                          style={{ background: "#4A90E2", color: "#FFF" }}>
                          <Video className="w-3.5 h-3.5" /> Join Session
                        </a>
                      )}
                      <button onClick={() => cancelMutation.mutate(s.id)}
                        className="flex items-center gap-1 text-xs px-3 py-2 rounded-lg"
                        style={{ background: "#FEF2F2", color: "#EF4444" }}>
                        <X className="w-3.5 h-3.5" /> Cancel
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Past Sessions */}
        {past.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "#8E8E93" }}>Past Sessions</p>
            <div className="space-y-2">
              {past.map(s => {
                const typeInfo = SESSION_TYPES.find(t => t.value === s.session_type);
                return (
                  <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "#FFF", border: "1px solid #E5E7EB" }}>
                    <span className="text-lg">{typeInfo?.icon || "📅"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium" style={{ color: "#1E1E1E" }}>{typeInfo?.label}</p>
                      <p className="text-xs" style={{ color: "#8E8E93" }}>{new Date(s.scheduled_date).toLocaleDateString()}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: `${STATUS_COLOR[s.status]}20`, color: STATUS_COLOR[s.status] }}>
                      {s.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Schedule Modal */}
      {showSchedule && (
        <div className="fixed inset-0 z-50 flex items-end" style={{ background: "rgba(0,0,0,0.5)" }} onClick={() => setShowSchedule(false)}>
          <div className="w-full max-w-lg mx-auto rounded-t-3xl p-6 space-y-4" style={{ background: "#FFF" }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold" style={{ color: "#1E1E1E" }}>Schedule Session</h3>
              <button onClick={() => setShowSchedule(false)}><X className="w-5 h-5" style={{ color: "#8E8E93" }} /></button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {SESSION_TYPES.map(t => (
                <button key={t.value} onClick={() => setForm(f => ({ ...f, session_type: t.value }))}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium"
                  style={{ background: form.session_type === t.value ? `${t.color}15` : "#F7F7F8", border: `1.5px solid ${form.session_type === t.value ? t.color : "#E5E7EB"}`, color: form.session_type === t.value ? t.color : "#1E1E1E" }}>
                  <span>{t.icon}</span>{t.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "#5A5A5A" }}>Date</label>
                <input type="date" min={today} value={form.scheduled_date} onChange={e => setForm(f => ({ ...f, scheduled_date: e.target.value }))}
                  className="w-full p-3 rounded-xl text-sm" style={{ background: "#F7F7F8", border: "1px solid #D1D1D6", color: "#1E1E1E" }} />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "#5A5A5A" }}>Time</label>
                <input type="time" value={form.scheduled_time} onChange={e => setForm(f => ({ ...f, scheduled_time: e.target.value }))}
                  className="w-full p-3 rounded-xl text-sm" style={{ background: "#F7F7F8", border: "1px solid #D1D1D6", color: "#1E1E1E" }} />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: "#5A5A5A" }}>Provider / Counselor Email (optional)</label>
              <input type="email" value={form.provider_email} onChange={e => setForm(f => ({ ...f, provider_email: e.target.value }))}
                placeholder="counselor@facility.org"
                className="w-full p-3 rounded-xl text-sm" style={{ background: "#F7F7F8", border: "1px solid #D1D1D6", color: "#1E1E1E" }} />
            </div>

            <button
              onClick={() => scheduleMutation.mutate()}
              disabled={!form.session_type || !form.scheduled_date || !form.scheduled_time || scheduleMutation.isPending}
              className="w-full py-4 rounded-2xl text-base font-bold"
              style={{ background: form.session_type && form.scheduled_date && form.scheduled_time ? "#4A90E2" : "#E5E7EB", color: "#FFF" }}>
              {scheduleMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Schedule Session →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}