import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Circle, Lock, Loader2 } from "lucide-react";

const C = {
  teal:    "#3ECFBF",
  emerald: "#10B981",
  amber:   "#F59E0B",
  muted:   "rgba(255,255,255,0.35)",
};

const SIGNOFF_ITEMS = [
  { id: "id_docs",         label: "ID Documents Provided",            category: "Admin",    required: true  },
  { id: "insurance_card",  label: "Insurance Card / Benefits Info",   category: "Admin",    required: true  },
  { id: "medications",     label: "Medications & Prescriptions Given", category: "Medical",  required: true  },
  { id: "aftercare_appt",  label: "First Aftercare Appointment Set",   category: "Medical",  required: true  },
  { id: "pcp_referral",    label: "PCP Referral / Appointment Made",   category: "Medical",  required: false },
  { id: "housing_confirm", label: "Housing Destination Confirmed",     category: "Housing",  required: true  },
  { id: "housing_contact", label: "Housing Contact Notified",          category: "Housing",  required: false },
  { id: "sponsor_intro",   label: "Sponsor / Mentor Introduction Made",category: "Recovery", required: false },
  { id: "safetyplan",      label: "Safety Plan Reviewed With Client",  category: "Recovery", required: true  },
  { id: "relapse_plan",    label: "Relapse Prevention Plan Reviewed",  category: "Recovery", required: true  },
  { id: "crisis_numbers",  label: "Crisis Numbers Given (988, etc.)",  category: "Recovery", required: true  },
  { id: "legal_confirm",   label: "Legal / Probation Obligations Confirmed", category: "Legal", required: false },
  { id: "transport",       label: "Transportation to Discharge Arranged",   category: "Logistics", required: true },
  { id: "belongings",      label: "Client Belongings Returned",        category: "Logistics", required: true  },
  { id: "consent_signed",  label: "Consent & Release Forms Signed",   category: "Admin",    required: true  },
  { id: "copy_of_plan",    label: "Copy of Discharge Plan Given to Client", category: "Admin", required: true },
  { id: "staff_signoff",   label: "Staff Supervisor Sign-Off",        category: "Admin",    required: true  },
];

const CATEGORIES = ["Admin", "Medical", "Housing", "Recovery", "Legal", "Logistics"];

export default function DischargeSignoffChecklist({ planId, staffEmail, finalized }) {
  const qc = useQueryClient();
  const [checked, setChecked] = useState({});
  const [notes, setNotes] = useState({});

  const storageKey = `signoff_${planId}`;

  // Load saved state from localStorage (lightweight, no entity needed)
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
      if (saved.checked) setChecked(saved.checked);
      if (saved.notes)   setNotes(saved.notes);
    } catch {}
  }, [storageKey]);

  const save = (newChecked, newNotes) => {
    localStorage.setItem(storageKey, JSON.stringify({ checked: newChecked, notes: newNotes }));
  };

  const toggle = (id) => {
    if (finalized) return;
    const next = { ...checked, [id]: !checked[id] };
    setChecked(next);
    save(next, notes);
  };

  const setNote = (id, val) => {
    const next = { ...notes, [id]: val };
    setNotes(next);
    save(checked, next);
  };

  const totalRequired = SIGNOFF_ITEMS.filter(i => i.required).length;
  const completedRequired = SIGNOFF_ITEMS.filter(i => i.required && checked[i.id]).length;
  const totalAll = SIGNOFF_ITEMS.length;
  const completedAll = SIGNOFF_ITEMS.filter(i => checked[i.id]).length;
  const allRequiredDone = completedRequired === totalRequired;

  return (
    <div>
      {/* Progress summary */}
      <div style={{ background: allRequiredDone ? "rgba(16,185,129,0.07)" : "rgba(245,158,11,0.06)",
        border: `1px solid ${allRequiredDone ? "rgba(16,185,129,0.2)" : "rgba(245,158,11,0.2)"}`,
        borderRadius: 12, padding: "14px 16px", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <p style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>Sign-Off Progress</p>
          <p style={{ fontSize: 13, fontWeight: 900, color: allRequiredDone ? C.emerald : C.amber }}>
            {completedRequired}/{totalRequired} required
          </p>
        </div>
        <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: 4, height: 6, overflow: "hidden" }}>
          <div style={{
            width: `${(completedRequired / totalRequired) * 100}%`, height: "100%", borderRadius: 4,
            background: allRequiredDone ? C.emerald : C.amber,
            transition: "width 0.3s ease",
          }} />
        </div>
        <p style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>
          {completedAll}/{totalAll} total items completed
          {allRequiredDone && " · ✅ Ready for final sign-off"}
        </p>
      </div>

      {CATEGORIES.map(cat => {
        const items = SIGNOFF_ITEMS.filter(i => i.category === cat);
        const catDone = items.filter(i => checked[i.id]).length;
        return (
          <div key={cat} style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <p style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: ".08em" }}>{cat}</p>
              <p style={{ fontSize: 11, color: catDone === items.length ? C.emerald : C.muted, fontWeight: 700 }}>{catDone}/{items.length}</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {items.map(item => {
                const done = !!checked[item.id];
                return (
                  <div key={item.id}>
                    <div onClick={() => toggle(item.id)}
                      style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
                        borderRadius: 12, cursor: finalized ? "default" : "pointer",
                        background: done ? "rgba(16,185,129,0.07)" : "rgba(255,255,255,0.03)",
                        border: `1px solid ${done ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.07)"}` }}>
                      {done
                        ? <CheckCircle2 style={{ color: C.emerald, width: 18, height: 18, flexShrink: 0 }} />
                        : <Circle style={{ color: "rgba(255,255,255,0.2)", width: 18, height: 18, flexShrink: 0 }} />}
                      <p style={{ flex: 1, fontSize: 13, fontWeight: 700,
                        color: done ? C.emerald : "#fff" }}>{item.label}</p>
                      {item.required && !done && (
                        <span style={{ fontSize: 9, fontWeight: 800, color: C.amber, textTransform: "uppercase",
                          letterSpacing: ".06em", background: "rgba(245,158,11,0.12)", padding: "2px 7px",
                          borderRadius: 10, flexShrink: 0 }}>Required</span>
                      )}
                    </div>
                    {/* Optional note field when checked */}
                    {done && !finalized && (
                      <input value={notes[item.id] || ""} onChange={e => setNote(item.id, e.target.value)}
                        placeholder="Add a note (optional)…"
                        style={{ width: "100%", padding: "8px 12px", marginTop: 4, borderRadius: 8,
                          border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.03)",
                          color: "rgba(255,255,255,0.5)", fontSize: 12, outline: "none",
                          boxSizing: "border-box" }} />
                    )}
                    {done && notes[item.id] && finalized && (
                      <p style={{ fontSize: 11, color: C.muted, padding: "4px 14px", fontStyle: "italic" }}>{notes[item.id]}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {finalized && (
        <div style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)",
          borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
          <Lock style={{ color: C.emerald, width: 16, height: 16, flexShrink: 0 }} />
          <p style={{ fontSize: 13, color: C.emerald, fontWeight: 600 }}>Plan finalized — checklist is locked.</p>
        </div>
      )}
    </div>
  );
}