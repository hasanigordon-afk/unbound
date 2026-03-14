import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit3, Check, X, Trash2, RefreshCw } from "lucide-react";

const HOUSING_TYPES = [
  { value: "sober_living", label: "Sober Living" },
  { value: "halfway_house", label: "Halfway House" },
  { value: "emergency_shelter", label: "Emergency Shelter" },
  { value: "transitional_housing", label: "Transitional Housing" },
  { value: "supportive_housing", label: "Supportive Housing" },
];
const GENDERS = [
  { value: "men", label: "Men Only" },
  { value: "women", label: "Women Only" },
  { value: "coed", label: "Co-ed" },
  { value: "families", label: "Families" },
];
const COUNTIES = ["Atlantic","Bergen","Burlington","Camden","Cape May","Cumberland","Essex","Gloucester","Hudson","Hunterdon","Mercer","Middlesex","Monmouth","Morris","Ocean","Passaic","Salem","Somerset","Sussex","Union","Warren"];
const WAIT_OPTIONS = ["open","limited","full","unknown"];

const BLANK = {
  resource_name: "", address: "", city: "", state: "NJ", zip: "", county: "",
  phone: "", email: "", website: "", housing_type: "sober_living", gender_served: "coed",
  age_restrictions: "", family_friendly: false, veteran_specific: false, reentry_friendly: false,
  recovery_focused: true, medicaid_support: false, voucher_support: false, self_pay_required: false,
  estimated_cost: "", bed_availability: "", waitlist_status: "unknown",
  intake_contact: "", intake_requirements: "", background_limitations: "",
  drug_testing_required: false, curfew_required: false, transportation_help: false,
  description: "", active_status: "active", last_verified: new Date().toISOString().split("T")[0],
};

function FInput({ label, value, onChange, type = "text", placeholder }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: "#8E8E93", textTransform: "uppercase", letterSpacing: ".06em", display: "block", marginBottom: 4 }}>{label}</label>
      <input type={type} value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder || ""}
        style={{ width: "100%", padding: "10px 12px", background: "#F7F8FA", border: "1px solid #E5E7EB",
          borderRadius: 8, fontSize: 13, color: "#1E1E1E", outline: "none", boxSizing: "border-box" }} />
    </div>
  );
}

function FSelect({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: "#8E8E93", textTransform: "uppercase", letterSpacing: ".06em", display: "block", marginBottom: 4 }}>{label}</label>
      <select value={value || ""} onChange={(e) => onChange(e.target.value)}
        style={{ width: "100%", padding: "10px 12px", background: "#F7F8FA", border: "1px solid #E5E7EB",
          borderRadius: 8, fontSize: 13, color: "#1E1E1E", outline: "none", boxSizing: "border-box" }}>
        {options.map((o) => <option key={o.value || o} value={o.value || o}>{o.label || o}</option>)}
      </select>
    </div>
  );
}

function FTextarea({ label, value, onChange, rows = 2 }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: "#8E8E93", textTransform: "uppercase", letterSpacing: ".06em", display: "block", marginBottom: 4 }}>{label}</label>
      <textarea rows={rows} value={value || ""} onChange={(e) => onChange(e.target.value)}
        style={{ width: "100%", padding: "10px 12px", background: "#F7F8FA", border: "1px solid #E5E7EB",
          borderRadius: 8, fontSize: 13, color: "#1E1E1E", outline: "none", resize: "vertical", boxSizing: "border-box", lineHeight: 1.5 }} />
    </div>
  );
}

function FCheck({ label, checked, onChange }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, cursor: "pointer" }}>
      <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)}
        style={{ width: 15, height: 15 }} />
      <span style={{ fontSize: 13, color: "#1E1E1E" }}>{label}</span>
    </label>
  );
}

export default function HousingAdminPanel({ resources, onClose }) {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState("list"); // list | edit | add
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...BLANK });

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editing) return base44.entities.HousingResourceNJ.update(editing.id, form);
      return base44.entities.HousingResourceNJ.create(form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nj-housing"] });
      setMode("list");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.HousingResourceNJ.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["nj-housing"] }),
  });

  const quickUpdate = useMutation({
    mutationFn: ({ id, data }) => base44.entities.HousingResourceNJ.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["nj-housing"] }),
  });

  const startEdit = (r) => {
    setEditing(r);
    setForm({ ...BLANK, ...r });
    setMode("edit");
  };

  const startAdd = () => {
    setEditing(null);
    setForm({ ...BLANK });
    setMode("add");
  };

  if (mode === "edit" || mode === "add") {
    return (
      <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden", border: "1px solid #E5E7EB" }}>
        <div style={{ background: "#1E1E1E", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>{mode === "add" ? "Add New Resource" : "Edit Resource"}</p>
          <button onClick={() => setMode("list")} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.6)" }}>
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>
        <div style={{ padding: "20px", maxHeight: "70vh", overflowY: "auto" }}>
          <FInput label="Resource Name *" value={form.resource_name} onChange={(v) => set("resource_name", v)} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <FSelect label="Housing Type" value={form.housing_type} onChange={(v) => set("housing_type", v)} options={HOUSING_TYPES} />
            <FSelect label="Gender Served" value={form.gender_served} onChange={(v) => set("gender_served", v)} options={GENDERS} />
          </div>
          <FInput label="Address" value={form.address} onChange={(v) => set("address", v)} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <FInput label="City" value={form.city} onChange={(v) => set("city", v)} />
            <FInput label="ZIP" value={form.zip} onChange={(v) => set("zip", v)} />
          </div>
          <FSelect label="County" value={form.county} onChange={(v) => set("county", v)} options={[{ value: "", label: "— Select County —" }, ...COUNTIES.map((c) => ({ value: c, label: c }))]} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <FInput label="Phone" value={form.phone} onChange={(v) => set("phone", v)} />
            <FInput label="Email" value={form.email} onChange={(v) => set("email", v)} />
          </div>
          <FInput label="Website" value={form.website} onChange={(v) => set("website", v)} placeholder="https://..." />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <FInput label="Estimated Cost" value={form.estimated_cost} onChange={(v) => set("estimated_cost", v)} placeholder="$150/wk, free..." />
            <FInput label="Bed Availability" value={form.bed_availability} onChange={(v) => set("bed_availability", v)} placeholder="3 beds, call..." />
          </div>
          <FSelect label="Waitlist Status" value={form.waitlist_status} onChange={(v) => set("waitlist_status", v)} options={WAIT_OPTIONS.map((w) => ({ value: w, label: w.charAt(0).toUpperCase() + w.slice(1) }))} />
          <FSelect label="Active Status" value={form.active_status} onChange={(v) => set("active_status", v)} options={[
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
            { value: "pending_verification", label: "Pending Verification" },
          ]} />
          <FInput label="Age Restrictions" value={form.age_restrictions} onChange={(v) => set("age_restrictions", v)} placeholder="18+, adults only..." />
          <FInput label="Intake Contact" value={form.intake_contact} onChange={(v) => set("intake_contact", v)} />
          <FTextarea label="Intake Requirements" value={form.intake_requirements} onChange={(v) => set("intake_requirements", v)} rows={3} />
          <FTextarea label="Background Check Info" value={form.background_limitations} onChange={(v) => set("background_limitations", v)} />
          <FTextarea label="Description" value={form.description} onChange={(v) => set("description", v)} rows={3} />
          <FInput label="Last Verified Date" value={form.last_verified} onChange={(v) => set("last_verified", v)} type="date" />

          <p style={{ fontSize: 12, fontWeight: 700, color: "#8E8E93", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10, marginTop: 4 }}>Program Features</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
            <FCheck label="Recovery Focused" checked={form.recovery_focused} onChange={(v) => set("recovery_focused", v)} />
            <FCheck label="Reentry Friendly" checked={form.reentry_friendly} onChange={(v) => set("reentry_friendly", v)} />
            <FCheck label="Family Friendly" checked={form.family_friendly} onChange={(v) => set("family_friendly", v)} />
            <FCheck label="Veterans Program" checked={form.veteran_specific} onChange={(v) => set("veteran_specific", v)} />
            <FCheck label="Medicaid Accepted" checked={form.medicaid_support} onChange={(v) => set("medicaid_support", v)} />
            <FCheck label="Vouchers Accepted" checked={form.voucher_support} onChange={(v) => set("voucher_support", v)} />
            <FCheck label="Self-Pay Required" checked={form.self_pay_required} onChange={(v) => set("self_pay_required", v)} />
            <FCheck label="Drug Testing" checked={form.drug_testing_required} onChange={(v) => set("drug_testing_required", v)} />
            <FCheck label="Curfew Required" checked={form.curfew_required} onChange={(v) => set("curfew_required", v)} />
            <FCheck label="Transport Help" checked={form.transportation_help} onChange={(v) => set("transportation_help", v)} />
          </div>

          <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !form.resource_name}
            style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", cursor: "pointer",
              background: "#1E1E1E", color: "#fff", fontWeight: 800, fontSize: 14, marginTop: 12,
              opacity: !form.resource_name ? 0.5 : 1 }}>
            {saveMutation.isPending ? "Saving…" : mode === "add" ? "Add Resource" : "Save Changes"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden", border: "1px solid #E5E7EB" }}>
      <div style={{ background: "#1E1E1E", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>🏠 Housing Admin — {resources.length} records</p>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={startAdd} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
            background: "#3ECFBF", border: "none", borderRadius: 10, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            <Plus style={{ width: 14, height: 14 }} /> Add
          </button>
          {onClose && <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.6)" }}>
            <X style={{ width: 18, height: 18 }} />
          </button>}
        </div>
      </div>
      <div style={{ maxHeight: "65vh", overflowY: "auto" }}>
        {resources.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 20px" }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#8E8E93" }}>No resources yet</p>
            <button onClick={startAdd} style={{ marginTop: 12, padding: "10px 20px", background: "#1E1E1E", border: "none",
              borderRadius: 10, color: "#fff", fontWeight: 700, cursor: "pointer" }}>Add First Resource</button>
          </div>
        ) : resources.map((r) => (
          <div key={r.id} style={{ padding: "14px 20px", borderBottom: "1px solid #F0F0F3", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#1E1E1E" }}>{r.resource_name}</p>
              <p style={{ fontSize: 12, color: "#8E8E93", marginTop: 2 }}>{r.city} · {r.county} County · {r.housing_type?.replace(/_/g, " ")}</p>
            </div>
            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
              {/* Quick waitlist update */}
              <select value={r.waitlist_status || "unknown"}
                onChange={(e) => quickUpdate.mutate({ id: r.id, data: { waitlist_status: e.target.value } })}
                style={{ fontSize: 11, padding: "4px 6px", borderRadius: 8, border: "1px solid #E5E7EB",
                  background: "#F7F8FA", color: "#1E1E1E", cursor: "pointer" }}>
                {["open","limited","full","unknown"].map((w) => <option key={w} value={w}>{w}</option>)}
              </select>
              <button onClick={() => startEdit(r)} style={{ padding: "6px 10px", background: "#F0F7FF",
                border: "1px solid #BFDBFE", borderRadius: 8, color: "#2563EB", cursor: "pointer" }}>
                <Edit3 style={{ width: 13, height: 13 }} />
              </button>
              <button onClick={() => quickUpdate.mutate({ id: r.id, data: { active_status: r.active_status === "active" ? "inactive" : "active" } })}
                style={{ padding: "6px 10px", background: r.active_status === "active" ? "#F0FDF4" : "#FEF2F2",
                  border: `1px solid ${r.active_status === "active" ? "#86EFAC" : "#FCA5A5"}`,
                  borderRadius: 8, color: r.active_status === "active" ? "#16A34A" : "#DC2626", cursor: "pointer" }}>
                {r.active_status === "active" ? <Check style={{ width: 13, height: 13 }} /> : <X style={{ width: 13, height: 13 }} />}
              </button>
              <button onClick={() => quickUpdate.mutate({ id: r.id, data: { last_verified: new Date().toISOString().split("T")[0] } })}
                title="Mark as verified today"
                style={{ padding: "6px 10px", background: "#F5F3FF", border: "1px solid #DDD6FE",
                  borderRadius: 8, color: "#7C3AED", cursor: "pointer" }}>
                <RefreshCw style={{ width: 13, height: 13 }} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}