import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, MessageSquareText, ShieldCheck, UserRound } from "lucide-react";
import CounselorMessages from "../components/participant/CounselorMessages";
import PatientAppointments from "@/components/calendar/PatientAppointments";
import { demoClients, demoMessages } from "@/lib/rehabPilotDemoData";
import { appParams } from "@/lib/app-params";
import { hasBase44AppId } from "@/lib/demoRoutes";
import PilotShell from "@/components/pilot/PilotShell";

const appointmentExamples = ["IOP intake - Tomorrow 10:00 AM", "MAT follow-up - Friday 2:30 PM", "Peer group - Saturday 10:00 AM"];

export default function ParticipantMessages() {
  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
    enabled: hasBase44AppId(appParams.appId),
  });

  const { data: profile } = useQuery({
    queryKey: ["participant-profile"],
    queryFn: async () => {
      const profiles = await base44.entities.ParticipantProfile.filter({ participant_email: user.email });
      return profiles[0];
    },
    enabled: !!user,
  });

  const [tab, setTab] = useState("messages");
  const demoClient = demoClients[0];

  return (
    <PilotShell title="Messages & Appointments" subtitle="Privacy-safe counselor communication with synthetic pilot data.">
      <div className="space-y-5">
        <section className="rounded-[30px] border border-emerald-200/20 bg-emerald-300/12 p-5 shadow-2xl backdrop-blur-2xl">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/12 text-emerald-100">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-100">Demo client</p>
              <h2 className="mt-1 font-sans text-2xl font-black text-white">{demoClient.display_name} - privacy-safe counselor thread</h2>
              <p className="mt-2 text-sm font-bold leading-relaxed text-slate-300">Supporters only see progress fields explicitly approved by the client or counselor. Journal entries, diagnoses, and private notes stay hidden.</p>
            </div>
          </div>
        </section>

        <div className="flex gap-2 rounded-[26px] border border-white/10 bg-white/8 p-2">
          {[{ id: "messages", label: "Messages", icon: MessageSquareText }, { id: "appointments", label: "My Appointments", icon: CalendarDays }].map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            return (
              <button key={id} onClick={() => setTab(id)} className={`flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-2xl text-sm font-black transition ${active ? "bg-white text-slate-950" : "text-slate-300"}`}>
                <Icon className="h-4 w-4" />
                {label}
              </button>
            );
          })}
        </div>

        {tab === "messages" && (
          profile?.facility_id ? (
            <CounselorMessages participantEmail={user?.email} facilityId={profile.facility_id}/>
          ) : (
            <div className="grid gap-3">
              {demoMessages.map((message) => (
                <article key={message.id} className="rounded-[28px] border border-white/10 bg-white/8 p-4 shadow-2xl backdrop-blur-2xl">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-sans text-lg font-black text-white">{message.sender}</p>
                      <p className="mt-1 text-xs font-bold text-slate-400">{message.role} to {message.audience} - {message.timestamp}</p>
                    </div>
                    <span className="rounded-full border border-emerald-200/20 bg-emerald-300/12 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-100">{message.privacy_label}</span>
                  </div>
                  <p className="mt-4 text-sm font-bold leading-relaxed text-slate-300">{message.message}</p>
                </article>
              ))}
            </div>
          )
        )}
        {tab === "appointments" && (user?.email ? <PatientAppointments participantEmail={user.email}/> : (
          <div className="grid gap-3">
            {appointmentExamples.map((appointment) => (
              <div key={appointment} className="flex items-center gap-3 rounded-[26px] border border-white/10 bg-white/8 p-4 font-black text-white">
                <UserRound className="h-5 w-5 text-blue-200" />
                {appointment}
              </div>
            ))}
          </div>
        ))}
      </div>
    </PilotShell>
  );
}