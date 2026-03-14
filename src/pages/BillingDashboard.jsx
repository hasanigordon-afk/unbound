import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DollarSign, FileText, CheckCircle2, Clock, XCircle, Plus, Loader2, Building2 } from "lucide-react";

const CLAIM_STATUS_CONFIG = {
  pending:   { color: "#F59E0B", label: "Pending",   icon: Clock },
  submitted: { color: "#4A90E2", label: "Submitted", icon: FileText },
  approved:  { color: "#22C55E", label: "Approved",  icon: CheckCircle2 },
  denied:    { color: "#EF4444", label: "Denied",    icon: XCircle },
  paid:      { color: "#16A34A", label: "Paid",      icon: DollarSign },
};

const SERVICE_TYPES = [
  { value: "telehealth_counseling",    label: "Telehealth Counseling",   code: "90834" },
  { value: "peer_recovery_coaching",   label: "Peer Recovery Coaching",  code: "H0038" },
  { value: "aftercare_monitoring",     label: "Aftercare Monitoring",    code: "T1016" },
  { value: "virtual_therapy",          label: "Virtual Therapy",         code: "90837" },
  { value: "group_session",            label: "Group Session",           code: "90853" },
  { value: "medication_management",    label: "Medication Management",   code: "99213" },
];

const DEMO_FACILITY_ID = "69b4c0a624652291a34b228b";

export default function BillingDashboard() {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ participant_email: "", service_type: "", duration_minutes: 50, amount_billed: "", insurance_provider: "", member_id: "", notes: "" });

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: counselorProfile } = useQuery({
    queryKey: ["counselor-profile", user?.email],
    queryFn: async () => { const r = await base44.entities.CounselorProfile.filter({ counselor_email: user.email }); return r[0]; },
    enabled: !!user,
  });
  const facilityId = counselorProfile?.facility_id || DEMO_FACILITY_ID;

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["billing-records", facilityId],
    queryFn: () => base44.entities.BillingRecord.filter({ facility_id: facilityId }),
    enabled: !!facilityId,
  });

  const addMutation = useMutation({
    mutationFn: () => base44.functions.invoke("serviceBridge", {
      module: "billing", action: "create_record",
      payload: { ...form, facility_id: facilityId, billing_code: SERVICE_TYPES.find(s => s.value === form.service_type)?.code, service_date: new Date().toISOString().split("T")[0] },
    }),
    onSuccess: () => { queryClient.invalidateQueries(["billing-records"]); setShowAdd(false); setForm({ participant_email: "", service_type: "", duration_minutes: 50, amount_billed: "", insurance_provider: "", member_id: "", notes: "" }); },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.functions.invoke("serviceBridge", { module: "billing", action: "update_claim_status", payload: { record_id: id, status } }),
    onSuccess: () => queryClient.invalidateQueries(["billing-records"]),
  });

  const total = records.reduce((s, r) => s + (r.amount_billed || 0), 0);
  const paid = records.filter(r => r.claim_status === "paid").reduce((s, r) => s + (r.amount_billed || 0), 0);
  const pending = records.filter(r => r.claim_status === "pending").length;
  const isDemo = !user;

  return (
    <div className="min-h-screen pb-28" style={{ background: "#F7F7F8" }}>
      {isDemo && (
        <div style={{ background: "#4A90E2", color: "#FFF", textAlign: "center", padding: "8px 16px", fontSize: 13 }}>
          👁 Demo mode — sign in as a facility admin to manage real billing records.
        </div>
      )}
      <div className="px-5 pt-8 pb-5" style={{ background: "#FFF", borderBottom: "1px solid #D1D1D6" }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold" style={{ color: "#1E1E1E" }}>Billing Dashboard</h1>
            <p className="text-sm mt-0.5" style={{ color: "#8E8E93" }}>Insurance claims and session billing</p>
          </div>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold"
            style={{ background: "#4A90E2", color: "#FFF" }}>
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </div>

      <div className="px-5 py-5 space-y-5">
        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Billed", value: `$${total.toLocaleString()}`, color: "#4A90E2" },
            { label: "Paid Out",     value: `$${paid.toLocaleString()}`,  color: "#22C55E" },
            { label: "Pending",      value: pending,                      color: "#F59E0B" },
          ].map(s => (
            <div key={s.label} className="p-4 rounded-2xl text-center" style={{ background: "#FFF", border: "1px solid #E5E7EB" }}>
              <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs mt-1" style={{ color: "#8E8E93" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Status filter pills */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "#8E8E93" }}>By Claim Status</p>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(CLAIM_STATUS_CONFIG).map(([status, cfg]) => {
              const count = records.filter(r => r.claim_status === status).length;
              if (count === 0) return null;
              return (
                <div key={status} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: `${cfg.color}15`, border: `1px solid ${cfg.color}30` }}>
                  <cfg.icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                  <span className="text-xs font-semibold" style={{ color: cfg.color }}>{cfg.label} · {count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Records list */}
        {isLoading && <div className="text-center py-10"><Loader2 className="w-6 h-6 mx-auto animate-spin opacity-30" /></div>}

        {!isLoading && records.length === 0 && (
          <div className="text-center py-16 rounded-2xl" style={{ background: "#FFF", border: "1px solid #E5E7EB" }}>
            <DollarSign className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm font-medium" style={{ color: "#1E1E1E" }}>No billing records yet.</p>
            <p className="text-xs mt-1" style={{ color: "#8E8E93" }}>Click "Add" to create your first claim.</p>
          </div>
        )}

        {records.map(record => {
          const cfg = CLAIM_STATUS_CONFIG[record.claim_status] || CLAIM_STATUS_CONFIG.pending;
          const svc = SERVICE_TYPES.find(s => s.value === record.service_type);
          return (
            <div key={record.id} className="rounded-2xl p-4" style={{ background: "#FFF", border: "1px solid #E5E7EB" }}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-sm" style={{ color: "#1E1E1E" }}>{svc?.label || record.service_type}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#8E8E93" }}>{record.participant_email}</p>
                  {record.service_date && <p className="text-xs" style={{ color: "#8E8E93" }}>{new Date(record.service_date).toLocaleDateString()}{record.duration_minutes ? ` · ${record.duration_minutes} min` : ""}</p>}
                  {record.billing_code && <p className="text-xs mt-0.5" style={{ color: "#C7C7CC" }}>Code: {record.billing_code}</p>}
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold" style={{ color: "#1E1E1E" }}>${record.amount_billed || "—"}</p>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${cfg.color}20`, color: cfg.color }}>
                    {cfg.label}
                  </span>
                </div>
              </div>

              {record.insurance_provider && (
                <p className="text-xs mt-2" style={{ color: "#5A5A5A" }}>Insurance: {record.insurance_provider}{record.member_id ? ` · ID: ${record.member_id}` : ""}</p>
              )}

              {(record.claim_status === "pending" || record.claim_status === "submitted") && (
                <div className="flex gap-2 mt-3 pt-3" style={{ borderTop: "1px solid #F0F0F3" }}>
                  {record.claim_status === "pending" && (
                    <button onClick={() => updateStatusMutation.mutate({ id: record.id, status: "submitted" })}
                      className="text-xs px-3 py-2 rounded-xl font-semibold"
                      style={{ background: "#EBF5FF", color: "#4A90E2" }}>Submit Claim</button>
                  )}
                  <button onClick={() => updateStatusMutation.mutate({ id: record.id, status: "paid" })}
                    className="text-xs px-3 py-2 rounded-xl font-semibold"
                    style={{ background: "#F0FDF4", color: "#22C55E" }}>Mark Paid</button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end" style={{ background: "rgba(0,0,0,0.5)" }} onClick={() => setShowAdd(false)}>
          <div className="w-full max-w-lg mx-auto rounded-t-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto" style={{ background: "#FFF" }} onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold" style={{ color: "#1E1E1E" }}>Add Billing Record</h3>

            {[
              { label: "Participant Email", key: "participant_email", type: "email", placeholder: "participant@email.com" },
              { label: "Insurance Provider", key: "insurance_provider", type: "text", placeholder: "e.g. Horizon NJ Health" },
              { label: "Member ID", key: "member_id", type: "text", placeholder: "Member/Policy ID" },
              { label: "Amount Billed ($)", key: "amount_billed", type: "number", placeholder: "0.00" },
              { label: "Duration (minutes)", key: "duration_minutes", type: "number", placeholder: "50" },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs font-medium mb-1 block" style={{ color: "#5A5A5A" }}>{f.label}</label>
                <input type={f.type} value={form[f.key]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  className="w-full p-3 rounded-xl text-sm" style={{ background: "#F7F7F8", border: "1px solid #D1D1D6", color: "#1E1E1E" }} />
              </div>
            ))}

            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: "#5A5A5A" }}>Service Type</label>
              <select value={form.service_type} onChange={e => setForm(f => ({ ...f, service_type: e.target.value }))}
                className="w-full p-3 rounded-xl text-sm" style={{ background: "#F7F7F8", border: "1px solid #D1D1D6", color: "#1E1E1E" }}>
                <option value="">Select service…</option>
                {SERVICE_TYPES.map(s => <option key={s.value} value={s.value}>{s.label} (CPT {s.code})</option>)}
              </select>
            </div>

            <button onClick={() => addMutation.mutate()} disabled={!form.participant_email || !form.service_type || addMutation.isPending}
              className="w-full py-4 rounded-2xl text-base font-bold"
              style={{ background: form.participant_email && form.service_type ? "#4A90E2" : "#E5E7EB", color: "#FFF" }}>
              {addMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Save Record →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}