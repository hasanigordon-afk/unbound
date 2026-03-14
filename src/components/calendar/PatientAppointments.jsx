import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Calendar } from "lucide-react";
import { SessionCard } from "./CounselorCalendar";

function fmt(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
}

export default function PatientAppointments({ participantEmail }) {
  const queryClient = useQueryClient();
  const today = fmt(new Date());

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["patient-sessions", participantEmail],
    queryFn: () => base44.entities.TelehealthSession.filter({ participant_email: participantEmail }, "scheduled_date", 50),
    enabled: !!participantEmail,
    refetchInterval: 30000,
  });

  const confirmMutation = useMutation({
    mutationFn: (id) => base44.entities.TelehealthSession.update(id, { attendance_status:"confirmed" }),
    onSuccess: () => queryClient.invalidateQueries(["patient-sessions"]),
  });

  const rescheduleMutation = useMutation({
    mutationFn: ({ id, note }) => base44.entities.TelehealthSession.update(id, {
      attendance_status:"reschedule_requested",
      reschedule_note: note,
    }),
    onSuccess: () => queryClient.invalidateQueries(["patient-sessions"]),
  });

  if (isLoading) return (
    <div style={{ textAlign:"center", padding:40 }}>
      <Loader2 className="animate-spin" style={{ width:28, height:28, color:"#3ECFBF", margin:"0 auto" }}/>
    </div>
  );

  const upcoming = sessions
    .filter(s => s.status !== "cancelled" && s.scheduled_date >= today)
    .sort((a,b) => a.scheduled_date.localeCompare(b.scheduled_date) || a.scheduled_time.localeCompare(b.scheduled_time));

  const past = sessions
    .filter(s => s.scheduled_date < today || s.status === "cancelled")
    .sort((a,b) => b.scheduled_date.localeCompare(a.scheduled_date))
    .slice(0,5);

  if (upcoming.length === 0 && past.length === 0) {
    return (
      <div style={{ textAlign:"center", padding:"52px 20px",
        background:"rgba(255,255,255,0.04)", borderRadius:20, border:"1px solid rgba(255,255,255,0.09)" }}>
        <Calendar style={{ width:36, height:36, color:"rgba(255,255,255,0.2)", margin:"0 auto 12px", display:"block" }}/>
        <p style={{ fontSize:15, fontWeight:700, color:"rgba(255,255,255,0.7)", marginBottom:6 }}>No appointments yet</p>
        <p style={{ fontSize:13, color:"rgba(255,255,255,0.3)" }}>Your counselor will schedule sessions here.</p>
      </div>
    );
  }

  return (
    <div>
      {upcoming.length > 0 && (
        <>
          <p style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.3)",
            textTransform:"uppercase", letterSpacing:".09em", marginBottom:10 }}>
            Upcoming ({upcoming.length})
          </p>
          <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:20 }}>
            {upcoming.map(s => (
              <SessionCard
                key={s.id}
                session={s}
                mode="patient"
                onConfirm={(id) => confirmMutation.mutate(id)}
                onReschedule={(id, note) => rescheduleMutation.mutate({ id, note })}
              />
            ))}
          </div>
        </>
      )}

      {past.length > 0 && (
        <>
          <p style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.3)",
            textTransform:"uppercase", letterSpacing:".09em", marginBottom:10 }}>
            Past Sessions
          </p>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {past.map(s => (
              <SessionCard key={s.id} session={s} mode="patient" dimmed/>
            ))}
          </div>
        </>
      )}
    </div>
  );
}