import React, { useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { CheckCircle2, MessageSquare, Send, Users } from "lucide-react";
import PilotShell from "@/components/pilot/PilotShell";

const fallbackParticipants = [
  { participant_email: "marcus.johnson@example.com", full_name: "Marcus Johnson", risk_level: "Moderate" },
  { participant_email: "tanya.rivera@example.com", full_name: "Tanya Rivera", risk_level: "Low" },
  { participant_email: "david.miller@example.com", full_name: "David Miller", risk_level: "High" },
];

const fallbackMessages = [
  {
    id: "seed-message-checkin",
    sender_email: "marcus.johnson@example.com",
    receiver_email: "counselor@rezilient.app",
    subject: "Tonight's NA meeting",
    body: "I have the 7 PM NA meeting on my calendar and need a bus route reminder.",
    message_type: "appointment_reminder",
    status_tag: "follow_up",
    created_date: new Date().toISOString(),
    is_read: false,
  },
  {
    id: "seed-message-support",
    sender_email: "counselor@rezilient.app",
    receiver_email: "tanya.rivera@example.com",
    subject: "Proud of your check-in streak",
    body: "You have checked in five days in a row. Keep protecting the routine that is working.",
    message_type: "motivational",
    status_tag: "informational",
    created_date: new Date(Date.now() - 86400000).toISOString(),
    is_read: true,
  },
];

export default function CounselorMessaging() {
  const qc = useQueryClient();
  const [selectedRecipient, setSelectedRecipient] = useState(fallbackParticipants[0].participant_email);
  const [form, setForm] = useState({
    subject: "Checking in on today's plan",
    body: "I am checking in on today's roadmap. Reply with the one thing you need before your next appointment.",
    message_type: "check_in",
  });

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: participants = fallbackParticipants } = useQuery({
    queryKey: ["messaging-participants"],
    queryFn: async () => {
      const [profiles, clients] = await Promise.allSettled([
        base44.entities.ParticipantProfile.list("-updated_date", 20),
        base44.entities.Clients.list("-updated_date", 20),
      ]);
      const rows = [
        ...(profiles.status === "fulfilled" ? profiles.value : []),
        ...(clients.status === "fulfilled" ? clients.value.map((client) => ({ participant_email: client.participant_email || client.email, full_name: client.full_name, risk_level: client.risk_level })) : []),
      ].filter((item) => item.participant_email);
      return rows.length ? rows : fallbackParticipants;
    },
  });

  const { data: messages = fallbackMessages } = useQuery({
    queryKey: ["counselor-messages", user?.email],
    queryFn: async () => {
      if (!user?.email) return fallbackMessages;
      const [sent, received] = await Promise.all([
        base44.entities.Message.filter({ sender_email: user.email }),
        base44.entities.Message.filter({ receiver_email: user.email }),
      ]);
      const rows = [...sent, ...received].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
      return rows.length ? rows : fallbackMessages;
    },
    enabled: true,
  });

  const threadList = useMemo(() => messages.slice(0, 8), [messages]);

  const sendMutation = useMutation({
    mutationFn: () => {
      if (!user?.email) throw new Error("Sign in as staff before sending client messages.");
      return base44.entities.Message.create({
        sender_email: user.email,
        sender_role: user.role || "counselor",
        receiver_email: selectedRecipient,
        receiver_role: "patient",
        channel: "counselor_patient",
        message_type: form.message_type,
        subject: form.subject,
        body: form.body,
        status_tag: "follow_up",
        required_response: true,
        is_read: false,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["counselor-messages"] }),
  });

  return (
    <PilotShell title="Client Communications" subtitle="Counselor messaging connected to clients, check-ins, resources, and follow-up tasks.">
      <div className="space-y-5">
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[30px] border border-white/12 bg-white/10 p-5 shadow-xl backdrop-blur-2xl">
            <Users className="h-6 w-6 text-blue-200" />
            <p className="mt-3 text-3xl font-black text-white">{participants.length}</p>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-300">Active clients</p>
          </div>
          <div className="rounded-[30px] border border-white/12 bg-white/10 p-5 shadow-xl backdrop-blur-2xl">
            <MessageSquare className="h-6 w-6 text-amber-200" />
            <p className="mt-3 text-3xl font-black text-white">{threadList.length}</p>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-300">Care messages</p>
          </div>
          <Link to="/SEESuperAgent" className="rounded-[30px] border border-white/12 bg-white/10 p-5 shadow-xl backdrop-blur-2xl">
            <CheckCircle2 className="h-6 w-6 text-emerald-200" />
            <p className="mt-3 text-lg font-black text-white">Attach to S.E.E. plan</p>
            <p className="text-xs font-bold text-slate-300">Use messages to follow up on roadmap tasks.</p>
          </Link>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_.9fr]">
          <div className="rounded-[34px] border border-white/12 bg-white/10 p-5 shadow-2xl backdrop-blur-2xl">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-200/70">Inbox</p>
            <div className="mt-4 grid gap-3">
              {threadList.map((message) => (
                <button key={message.id} onClick={() => setSelectedRecipient(message.sender_email === user?.email ? message.receiver_email : message.sender_email)} className="rounded-3xl border border-white/10 bg-white/8 p-4 text-left">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-black text-white">{message.subject}</p>
                    <span className="rounded-full bg-amber-300/15 px-3 py-1 text-xs font-black text-amber-100">{message.status_tag?.replace("_", " ") || message.message_type}</span>
                  </div>
                  <p className="mt-2 text-sm font-bold text-slate-300">{message.body}</p>
                  <p className="mt-2 text-xs font-bold text-slate-500">{message.sender_email} → {message.receiver_email}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[34px] border border-white/12 bg-white/10 p-5 shadow-2xl backdrop-blur-2xl">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-200/80">Send follow-up</p>
            <div className="mt-4 space-y-3">
              <select value={selectedRecipient} onChange={(event) => setSelectedRecipient(event.target.value)} className="w-full">
                {participants.map((participant) => <option key={participant.participant_email} value={participant.participant_email}>{participant.full_name || participant.participant_email} · {participant.risk_level || "Active"}</option>)}
              </select>
              <select value={form.message_type} onChange={(event) => setForm({ ...form, message_type: event.target.value })} className="w-full">
                <option value="check_in">Check-in request</option>
                <option value="appointment_reminder">Appointment reminder</option>
                <option value="resource_share">Share resource</option>
                <option value="motivational">Encouragement</option>
              </select>
              <input value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} placeholder="Subject" className="w-full" />
              <textarea value={form.body} onChange={(event) => setForm({ ...form, body: event.target.value })} placeholder="Write a direct support message..." className="min-h-[150px] w-full" />
              <button onClick={() => sendMutation.mutate()} disabled={!user?.email || !selectedRecipient || !form.subject || !form.body || sendMutation.isPending} className="btn-primary inline-flex w-full items-center justify-center gap-2 disabled:opacity-60">
                <Send className="h-4 w-4" /> {sendMutation.isPending ? "Sending..." : "Send message"}
              </button>
              {sendMutation.isSuccess && <p className="rounded-2xl border border-emerald-300/30 bg-emerald-400/10 p-3 text-sm font-black text-emerald-100">Message saved to the client communication thread.</p>}
              {sendMutation.isError && <p className="rounded-2xl border border-rose-300/30 bg-rose-400/10 p-3 text-sm font-black text-rose-100">{sendMutation.error.message}</p>}
            </div>
          </div>
        </section>
      </div>
    </PilotShell>
  );
}