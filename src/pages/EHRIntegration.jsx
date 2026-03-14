import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, Upload, Lock, Pill, Calendar, User, Plus, ChevronRight, Loader2, Shield } from "lucide-react";

const RECORD_TYPES = [
  { value: "discharge_plan",       label: "Discharge Plan",       icon: "📋", action: "import_discharge_plan" },
  { value: "medication_reminder",  label: "Medication Reminder",  icon: "💊", action: "import_medication_reminder" },
  { value: "therapy_schedule",     label: "Therapy Schedule",     icon: "📅", action: "import_therapy_schedule" },
  { value: "counselor_contact",    label: "Counselor Contact",    icon: "👤", action: "import_counselor_contact" },
  { value: "progress_report",      label: "Progress Report",      icon: "📈", action: "import_progress_report" },
];

const SOURCE_SYSTEMS = ["Epic", "Cerner", "Athenahealth", "eClinicalWorks", "Manual Entry"];
const ACCESS_LEVELS  = [
  { value: "counselor_only",  label: "Counselor Only" },
  { value: "participant_only", label: "Participant Only" },
  { value: "facility_wide",   label: "Facility Wide" },
];

export default function EHRIntegration() {
  const queryClient = useQueryClient();
  const [showImport, setShowImport] = useState(false);
  const [form, setForm] = useState({ record_type: "", participant_email: "", title: "", content: "", source_system: "Manual Entry", access_level: "counselor_only", next_review_date: "", provider_name: "" });
  const [selectedEmail, setSelectedEmail] = useState(null);

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: profiles = [] } = useQuery({
    queryKey: ["participants-ehr"],
    queryFn: () => base44.entities.ParticipantProfile.list("-created_date", 20),
  });

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["ehr-records", selectedEmail],
    queryFn: () => selectedEmail
      ? base44.entities.EHRRecord.filter({ participant_email: selectedEmail })
      : base44.entities.EHRRecord.list("-created_date", 50),
  });

  const importMutation = useMutation({
    mutationFn: () => {
      const typeInfo = RECORD_TYPES.find(r => r.value === form.record_type);
      return base44.functions.invoke("serviceBridge", {
        module: "ehr", action: typeInfo?.action || "import_progress_report",
        payload: { ...form },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["ehr-records"]);
      setShowImport(false);
      setForm({ record_type: "", participant_email: "", title: "", content: "", source_system: "Manual Entry", access_level: "counselor_only", next_review_date: "", provider_name: "" });
    },
  });

  const isDemo = !user;

  return (
    <div className="min-h-screen pb-28" style={{ background: "#F7F7F8" }}>
      {isDemo && (
        <div style={{ background: "#4A90E2", color: "#FFF", textAlign: "center", padding: "8px 16px", fontSize: 13 }}>
          👁 Demo mode — sign in as a facility admin or counselor to manage EHR records.
        </div>
      )}
      <div className="px-5 pt-8 pb-5" style={{ background: "#FFF", borderBottom: "1px solid #D1D1D6" }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold" style={{ color: "#1E1E1E" }}>EHR Integration</h1>
            <p className="text-sm mt-0.5" style={{ color: "#8E8E93" }}>Import discharge plans, medications, and clinical records</p>
          </div>
          <button onClick={() => setShowImport(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold"
            style={{ background: "#4A90E2", color: "#FFF" }}>
            <Plus className="w-4 h-4" /> Import
          </button>
        </div>
        {/* Security note */}
        <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-xl" style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
          <Shield className="w-4 h-4" style={{ color: "#16A34A" }} />
          <p className="text-xs" style={{ color: "#15803D" }}>All clinical records are encrypted and access-controlled by role.</p>
        </div>
      </div>

      <div className="px-5 py-5 space-y-5">
        {/* Participant filter */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "#8E8E93" }}>Filter by Participant</p>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setSelectedEmail(null)}
              className="px-3 py-1.5 rounded-full text-xs font-medium"
              style={{ background: !selectedEmail ? "#1E1E1E" : "#FFF", color: !selectedEmail ? "#FFF" : "#5A5A5A", border: "1px solid #D1D1D6" }}>
              All Records
            </button>
            {profiles.slice(0, 6).map(p => (
              <button key={p.id} onClick={() => setSelectedEmail(p.participant_email)}
                className="px-3 py-1.5 rounded-full text-xs font-medium"
                style={{ background: selectedEmail === p.participant_email ? "#4A90E2" : "#FFF", color: selectedEmail === p.participant_email ? "#FFF" : "#5A5A5A", border: "1px solid #D1D1D6" }}>
                {p.participant_email.split("@")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Record type summary */}
        <div className="grid grid-cols-3 gap-2">
          {RECORD_TYPES.slice(0, 3).map(rt => {
            const count = records.filter(r => r.record_type === rt.value).length;
            return (
              <div key={rt.value} className="text-center p-3 rounded-2xl" style={{ background: "#FFF", border: "1px solid #E5E7EB" }}>
                <p className="text-2xl mb-1">{rt.icon}</p>
                <p className="text-xl font-bold" style={{ color: "#1E1E1E" }}>{count}</p>
                <p className="text-[10px]" style={{ color: "#8E8E93" }}>{rt.label}</p>
              </div>
            );
          })}
        </div>

        {/* Records list */}
        {isLoading && <div className="text-center py-10"><Loader2 className="w-6 h-6 mx-auto animate-spin opacity-30" /></div>}

        {!isLoading && records.length === 0 && (
          <div className="text-center py-16 rounded-2xl" style={{ background: "#FFF", border: "1px solid #E5E7EB" }}>
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm font-medium" style={{ color: "#1E1E1E" }}>No EHR records imported yet.</p>
            <p className="text-xs mt-1" style={{ color: "#8E8E93" }}>Click "Import" to add clinical data.</p>
          </div>
        )}

        {records.map(record => {
          const rt = RECORD_TYPES.find(r => r.value === record.record_type);
          return (
            <div key={record.id} className="rounded-2xl p-4" style={{ background: "#FFF", border: "1px solid #E5E7EB" }}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: "#F7F7F8" }}>
                  {rt?.icon || "📄"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-sm" style={{ color: "#1E1E1E" }}>{record.title || rt?.label}</p>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#F0F0F3", color: "#5A5A5A" }}>
                      {record.access_level?.replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: "#8E8E93" }}>{record.participant_email}</p>
                  {record.source_system && <p className="text-xs" style={{ color: "#C7C7CC" }}>Source: {record.source_system} · {record.import_date}</p>}
                  {record.content && <p className="text-xs mt-2 line-clamp-2" style={{ color: "#5A5A5A" }}>{record.content}</p>}
                  {record.next_review_date && (
                    <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "#F59E0B" }}>
                      <Calendar className="w-3 h-3" /> Review: {record.next_review_date}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Import modal */}
      {showImport && (
        <div className="fixed inset-0 z-50 flex items-end" style={{ background: "rgba(0,0,0,0.5)" }} onClick={() => setShowImport(false)}>
          <div className="w-full max-w-lg mx-auto rounded-t-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto" style={{ background: "#FFF" }} onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold" style={{ color: "#1E1E1E" }}>Import Clinical Record</h3>

            <div>
              <label className="text-xs font-medium mb-2 block" style={{ color: "#5A5A5A" }}>Record Type</label>
              <div className="grid grid-cols-2 gap-2">
                {RECORD_TYPES.map(rt => (
                  <button key={rt.value} onClick={() => setForm(f => ({ ...f, record_type: rt.value }))}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium"
                    style={{ background: form.record_type === rt.value ? "#EBF5FF" : "#F7F7F8", border: `1.5px solid ${form.record_type === rt.value ? "#4A90E2" : "#E5E7EB"}`, color: form.record_type === rt.value ? "#4A90E2" : "#1E1E1E" }}>
                    <span>{rt.icon}</span>{rt.label}
                  </button>
                ))}
              </div>
            </div>

            {[
              { label: "Participant Email", key: "participant_email", type: "email", placeholder: "participant@email.com" },
              { label: "Title", key: "title", type: "text", placeholder: "e.g. Discharge Plan — March 2026" },
              { label: "Provider Name", key: "provider_name", type: "text", placeholder: "Dr. Rivera" },
              { label: "Next Review Date", key: "next_review_date", type: "date" },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs font-medium mb-1 block" style={{ color: "#5A5A5A" }}>{f.label}</label>
                <input type={f.type} value={form[f.key]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  className="w-full p-3 rounded-xl text-sm" style={{ background: "#F7F7F8", border: "1px solid #D1D1D6", color: "#1E1E1E" }} />
              </div>
            ))}

            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: "#5A5A5A" }}>Clinical Content</label>
              <textarea rows={4} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                placeholder="Paste or type the clinical content here…"
                className="w-full p-3 rounded-xl text-sm resize-none" style={{ background: "#F7F7F8", border: "1px solid #D1D1D6", color: "#1E1E1E" }} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "#5A5A5A" }}>Source System</label>
                <select value={form.source_system} onChange={e => setForm(f => ({ ...f, source_system: e.target.value }))}
                  className="w-full p-3 rounded-xl text-sm" style={{ background: "#F7F7F8", border: "1px solid #D1D1D6", color: "#1E1E1E" }}>
                  {SOURCE_SYSTEMS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: "#5A5A5A" }}>Access Level</label>
                <select value={form.access_level} onChange={e => setForm(f => ({ ...f, access_level: e.target.value }))}
                  className="w-full p-3 rounded-xl text-sm" style={{ background: "#F7F7F8", border: "1px solid #D1D1D6", color: "#1E1E1E" }}>
                  {ACCESS_LEVELS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                </select>
              </div>
            </div>

            <button onClick={() => importMutation.mutate()} disabled={!form.record_type || !form.participant_email || importMutation.isPending}
              className="w-full py-4 rounded-2xl text-base font-bold"
              style={{ background: form.record_type && form.participant_email ? "#4A90E2" : "#E5E7EB", color: "#FFF" }}>
              {importMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Import Record →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}