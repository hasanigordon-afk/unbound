import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, CheckCircle2, XCircle, RefreshCw, Loader2, Shield, Search } from "lucide-react";

const NJ_COUNTIES = ["Atlantic","Bergen","Burlington","Camden","Cape May","Cumberland","Essex","Gloucester","Hudson","Hunterdon","Mercer","Middlesex","Monmouth","Morris","Ocean","Passaic","Salem","Somerset","Sussex","Union","Warren"];
const FACILITY_TYPES = [
  { value: "detox",                    label: "Detox Center" },
  { value: "rehab",                    label: "Rehab Facility" },
  { value: "outpatient_clinic",        label: "Outpatient Clinic" },
  { value: "behavioral_health_center", label: "Behavioral Health Center" },
  { value: "hospital_program",         label: "Hospital-Based Program" },
];
const LOC_OPTIONS = ["detox","inpatient","residential","outpatient","iop","php","mat"];

const EMPTY_FORM = {
  facility_name: "", address: "", city: "", zip: "", county: "", phone: "", email: "", website: "",
  admissions_contact: "", facility_type: "outpatient_clinic", level_of_care: [],
  detox_available: false, inpatient_available: false, outpatient_available: false, iop_available: false,
  php_available: false, mat_available: false, dual_diagnosis_support: false,
  medicaid_accepted: false, private_insurance_accepted: false, self_pay_accepted: false,
  men_only: false, women_only: false, adolescents_served: false,
  transportation_assistance: false, telehealth_available: false, referral_required: false,
  hours_of_operation: "", description: "", tags: "",
  active_status: "active", last_verified: new Date().toISOString().split("T")[0],
};

function Toggle({ label, checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between w-full py-2.5"
      style={{ borderBottom: "1px solid #F7F7F8", background: "none", border: "none" }}
    >
      <span className="text-sm" style={{ color: "#1E1E1E" }}>{label}</span>
      <div className="w-10 h-6 rounded-full relative flex-shrink-0" style={{ background: checked ? "#4A90E2" : "#D1D1D6", transition: "background 0.2s" }}>
        <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all" style={{ left: checked ? "calc(100% - 22px)" : "2px", boxShadow: "0 1px 3px rgba(0,0,0,0.15)" }} />
      </div>
    </button>
  );
}

function FormField({ label, children }) {
  return (
    <div>
      <label className="text-xs font-medium mb-1 block" style={{ color: "#5A5A5A" }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = { background: "#F7F7F8", border: "1px solid #D1D1D6", color: "#1E1E1E", width: "100%", padding: "10px 12px", borderRadius: 10, fontSize: 14 };

export default function FacilityAdmin() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: facilities = [], isLoading } = useQuery({
    queryKey: ["nj-facilities-admin"],
    queryFn: () => base44.entities.NJTreatmentFacility.list("-created_date", 100),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const data = {
        ...form,
        state: "NJ",
        tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
        level_of_care: form.level_of_care || [],
      };
      if (editingId) return base44.entities.NJTreatmentFacility.update(editingId, data);
      return base44.entities.NJTreatmentFacility.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["nj-facilities-admin"]);
      queryClient.invalidateQueries(["nj-treatment-facilities"]);
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.NJTreatmentFacility.update(id, { active_status: status }),
    onSuccess: () => queryClient.invalidateQueries(["nj-facilities-admin"]),
  });

  const verifyMutation = useMutation({
    mutationFn: (id) => base44.entities.NJTreatmentFacility.update(id, { last_verified: new Date().toISOString().split("T")[0] }),
    onSuccess: () => queryClient.invalidateQueries(["nj-facilities-admin"]),
  });

  const openEdit = (facility) => {
    setForm({ ...EMPTY_FORM, ...facility, tags: facility.tags?.join(", ") || "" });
    setEditingId(facility.id);
    setShowForm(true);
  };

  const setField = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const toggleLOC = (val) => setForm(f => ({
    ...f,
    level_of_care: f.level_of_care.includes(val) ? f.level_of_care.filter(x => x !== val) : [...f.level_of_care, val],
  }));

  const isAdmin = user?.role === "admin";
  const filtered = facilities.filter(f =>
    !search || f.facility_name?.toLowerCase().includes(search.toLowerCase()) || f.city?.toLowerCase().includes(search.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F7F7F8" }}>
        <div className="text-center p-8 max-w-sm">
          <Shield className="w-12 h-12 mx-auto mb-4 opacity-30" style={{ color: "#8E8E93" }} />
          <p className="font-bold text-lg mb-2" style={{ color: "#1E1E1E" }}>Admin Access Required</p>
          <p className="text-sm" style={{ color: "#8E8E93" }}>You must be signed in as an Unbound admin to manage facilities.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28" style={{ background: "#F7F7F8" }}>
      <div className="px-5 pt-8 pb-5" style={{ background: "#FFF", borderBottom: "1px solid #D1D1D6" }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#8E8E93" }}>Admin Panel</p>
            <h1 className="text-xl font-bold" style={{ color: "#1E1E1E" }}>Manage NJ Facilities</h1>
          </div>
          <button
            onClick={() => { setForm(EMPTY_FORM); setEditingId(null); setShowForm(true); }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold"
            style={{ background: "#4A90E2", color: "#FFF" }}>
            <Plus className="w-4 h-4" /> Add Facility
          </button>
        </div>
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: "#F7F7F8", border: "1px solid #D1D1D6" }}>
          <Search className="w-4 h-4" style={{ color: "#8E8E93" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search facilities…"
            className="flex-1 text-sm bg-transparent outline-none" style={{ color: "#1E1E1E" }} />
        </div>
      </div>

      {/* Stats */}
      <div className="px-5 py-4 grid grid-cols-3 gap-3">
        {[
          { label: "Total", value: facilities.length, color: "#4A90E2" },
          { label: "Active", value: facilities.filter(f => f.active_status === "active").length, color: "#22C55E" },
          { label: "Pending", value: facilities.filter(f => f.active_status === "pending_verification").length, color: "#F59E0B" },
        ].map(s => (
          <div key={s.label} className="text-center p-3 rounded-2xl" style={{ background: "#FFF", border: "1px solid #E5E7EB" }}>
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs" style={{ color: "#8E8E93" }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="px-5 space-y-3">
        {isLoading && <div className="text-center py-10"><Loader2 className="w-6 h-6 mx-auto animate-spin opacity-30" /></div>}

        {filtered.map(facility => (
          <div key={facility.id} className="rounded-2xl p-4" style={{ background: "#FFF", border: "1px solid #E5E7EB" }}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-sm" style={{ color: "#1E1E1E" }}>{facility.facility_name}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full`}
                    style={{
                      background: facility.active_status === "active" ? "#F0FDF4" : facility.active_status === "inactive" ? "#FEF2F2" : "#FFF7ED",
                      color: facility.active_status === "active" ? "#16A34A" : facility.active_status === "inactive" ? "#DC2626" : "#D97706",
                    }}>
                    {facility.active_status?.replace("_", " ").toUpperCase()}
                  </span>
                </div>
                <p className="text-xs" style={{ color: "#8E8E93" }}>{facility.city}, NJ · {facility.county} County</p>
                {facility.last_verified && <p className="text-xs" style={{ color: "#C7C7CC" }}>Verified: {facility.last_verified}</p>}
              </div>
            </div>

            <div className="flex gap-2 mt-3 pt-3 flex-wrap" style={{ borderTop: "1px solid #F7F7F8" }}>
              <button onClick={() => openEdit(facility)}
                className="flex items-center gap-1 text-xs px-3 py-2 rounded-xl font-semibold"
                style={{ background: "#EBF5FF", color: "#2563EB" }}>
                <Pencil className="w-3.5 h-3.5" /> Edit
              </button>
              <button onClick={() => verifyMutation.mutate(facility.id)}
                className="flex items-center gap-1 text-xs px-3 py-2 rounded-xl font-semibold"
                style={{ background: "#F0FDF4", color: "#16A34A" }}>
                <RefreshCw className="w-3.5 h-3.5" /> Verify
              </button>
              {facility.active_status === "active" ? (
                <button onClick={() => updateStatusMutation.mutate({ id: facility.id, status: "inactive" })}
                  className="flex items-center gap-1 text-xs px-3 py-2 rounded-xl font-semibold"
                  style={{ background: "#FEF2F2", color: "#DC2626" }}>
                  <XCircle className="w-3.5 h-3.5" /> Deactivate
                </button>
              ) : (
                <button onClick={() => updateStatusMutation.mutate({ id: facility.id, status: "active" })}
                  className="flex items-center gap-1 text-xs px-3 py-2 rounded-xl font-semibold"
                  style={{ background: "#F0FDF4", color: "#16A34A" }}>
                  <CheckCircle2 className="w-3.5 h-3.5" /> Activate
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: "rgba(0,0,0,0.6)" }}>
          <div className="min-h-screen flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-6 space-y-4" style={{ background: "#FFF" }}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold" style={{ color: "#1E1E1E" }}>{editingId ? "Edit Facility" : "Add New Facility"}</h3>
                <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", color: "#8E8E93", fontSize: 22 }}>✕</button>
              </div>

              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                <FormField label="Facility Name *">
                  <input value={form.facility_name} onChange={e => setField("facility_name", e.target.value)} style={inputStyle} placeholder="e.g. Integrity Recovery Center" />
                </FormField>

                <div className="grid grid-cols-2 gap-3">
                  <FormField label="City *">
                    <input value={form.city} onChange={e => setField("city", e.target.value)} style={inputStyle} placeholder="City" />
                  </FormField>
                  <FormField label="ZIP">
                    <input value={form.zip} onChange={e => setField("zip", e.target.value)} style={inputStyle} placeholder="ZIP" />
                  </FormField>
                </div>

                <FormField label="County *">
                  <select value={form.county} onChange={e => setField("county", e.target.value)} style={inputStyle}>
                    <option value="">Select county…</option>
                    {NJ_COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </FormField>

                <FormField label="Street Address">
                  <input value={form.address} onChange={e => setField("address", e.target.value)} style={inputStyle} placeholder="123 Main St" />
                </FormField>

                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Phone">
                    <input value={form.phone} onChange={e => setField("phone", e.target.value)} style={inputStyle} placeholder="(609) 000-0000" />
                  </FormField>
                  <FormField label="Email">
                    <input value={form.email} onChange={e => setField("email", e.target.value)} style={inputStyle} placeholder="info@facility.org" />
                  </FormField>
                </div>

                <FormField label="Website">
                  <input value={form.website} onChange={e => setField("website", e.target.value)} style={inputStyle} placeholder="https://..." />
                </FormField>

                <FormField label="Admissions Contact">
                  <input value={form.admissions_contact} onChange={e => setField("admissions_contact", e.target.value)} style={inputStyle} placeholder="Name or phone" />
                </FormField>

                <FormField label="Facility Type">
                  <select value={form.facility_type} onChange={e => setField("facility_type", e.target.value)} style={inputStyle}>
                    {FACILITY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </FormField>

                <FormField label="Levels of Care">
                  <div className="flex gap-2 flex-wrap mt-1">
                    {LOC_OPTIONS.map(l => (
                      <button key={l} type="button" onClick={() => toggleLOC(l)}
                        className="px-3 py-1.5 rounded-full text-xs font-semibold"
                        style={{ background: form.level_of_care.includes(l) ? "#4A90E2" : "#F7F7F8", color: form.level_of_care.includes(l) ? "#FFF" : "#5A5A5A", border: "1px solid #D1D1D6" }}>
                        {l.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </FormField>

                <FormField label="Hours of Operation">
                  <input value={form.hours_of_operation} onChange={e => setField("hours_of_operation", e.target.value)} style={inputStyle} placeholder="e.g. Mon–Fri 8am–5pm, 24/7 Detox" />
                </FormField>

                <FormField label="Description">
                  <textarea value={form.description} onChange={e => setField("description", e.target.value)} rows={3}
                    style={{ ...inputStyle, resize: "vertical" }} placeholder="Brief description of services…" />
                </FormField>

                <FormField label="Tags (comma separated)">
                  <input value={form.tags} onChange={e => setField("tags", e.target.value)} style={inputStyle} placeholder="e.g. opioid, veterans, spanish-speaking" />
                </FormField>

                <div className="rounded-2xl p-4 space-y-1" style={{ background: "#F7F7F8", border: "1px solid #E5E7EB" }}>
                  <p className="text-xs font-semibold mb-2" style={{ color: "#8E8E93" }}>Services Available</p>
                  {[
                    ["detox_available", "Detox"],
                    ["inpatient_available", "Inpatient"],
                    ["outpatient_available", "Outpatient"],
                    ["iop_available", "IOP"],
                    ["php_available", "PHP"],
                    ["mat_available", "MAT"],
                    ["dual_diagnosis_support", "Dual Diagnosis"],
                    ["telehealth_available", "Telehealth"],
                    ["transportation_assistance", "Transportation Help"],
                    ["referral_required", "Referral Required"],
                  ].map(([key, label]) => (
                    <Toggle key={key} label={label} checked={form[key]} onChange={val => setField(key, val)} />
                  ))}
                </div>

                <div className="rounded-2xl p-4 space-y-1" style={{ background: "#F7F7F8", border: "1px solid #E5E7EB" }}>
                  <p className="text-xs font-semibold mb-2" style={{ color: "#8E8E93" }}>Insurance & Population</p>
                  {[
                    ["medicaid_accepted", "Medicaid Accepted"],
                    ["private_insurance_accepted", "Private Insurance"],
                    ["self_pay_accepted", "Self-Pay / Sliding Scale"],
                    ["men_only", "Men Only"],
                    ["women_only", "Women Only"],
                    ["adolescents_served", "Adolescents Served"],
                  ].map(([key, label]) => (
                    <Toggle key={key} label={label} checked={form[key]} onChange={val => setField(key, val)} />
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Status">
                    <select value={form.active_status} onChange={e => setField("active_status", e.target.value)} style={inputStyle}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="pending_verification">Pending Verification</option>
                    </select>
                  </FormField>
                  <FormField label="Last Verified">
                    <input type="date" value={form.last_verified} onChange={e => setField("last_verified", e.target.value)} style={inputStyle} />
                  </FormField>
                </div>
              </div>

              <button
                onClick={() => saveMutation.mutate()}
                disabled={!form.facility_name || !form.city || !form.county || saveMutation.isPending}
                className="w-full py-4 rounded-2xl text-base font-bold"
                style={{ background: form.facility_name && form.city && form.county ? "#4A90E2" : "#E5E7EB", color: "#FFF" }}>
                {saveMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : editingId ? "Save Changes →" : "Add Facility →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}