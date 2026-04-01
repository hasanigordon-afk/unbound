import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, CheckCircle2, Circle, Clock, MapPin, Phone, Loader2 } from "lucide-react";

const C = {
  teal:    "#3ECFBF",
  gold:    "#C9A96E",
  emerald: "#10B981",
  amber:   "#F59E0B",
  red:     "#EF4444",
  indigo:  "#6366F1",
  purple:  "#8B5CF6",
  muted:   "rgba(255,255,255,0.35)",
  glass:   { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14 },
};

const EVENT_TYPES = [
  { value: "meeting",             label: "Recovery Meeting",   emoji: "🤝", color: C.teal    },
  { value: "job_interview",       label: "Job Interview",      emoji: "💼", color: C.gold    },
  { value: "job_shift",           label: "Work / Job Shift",   emoji: "👷", color: C.amber   },
  { value: "probation_reporting", label: "Probation Check-In", emoji: "⚖️", color: C.red     },
  { value: "medical",             label: "Medical Appt.",      emoji: "🩺", color: C.emerald },
  { value: "housing",             label: "Housing / Move-In",  emoji: "🏠", color: C.indigo  },
  { value: "transport",           label: "Transportation",     emoji: "🚗", color: C.muted   },
  { value: "court",               label: "Court Appearance",   emoji: "🏛️", color: C.red     },
  { value: "other",               label: "Other",              emoji: "📌", color: C.purple  },
];

const EMPTY_EVENT = {
  id: "", time: "", title: "", location: "", contact: "", phone: "", notes: "",
  event_type: "meeting", confirmed: false,
};

function getTypeConfig(type) {
  return EVENT_TYPES.find(t => t.value === type) || EVENT_TYPES[EVENT_TYPES.length - 1];
}

function EventCard({ event, idx, onChange, onRemove, finalized }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = getTypeConfig(event.event_type);

  return (
    <div style={{ ...C.glass, overflow: "hidden", marginBottom: 10 }}>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px",
        background: event.confirmed ? "rgba(16,185,129,0.06)" : "rgba(255,255,255,0.02)",
        cursor: "pointer" }} onClick={() => setExpanded(!expanded)}>
        <span style={{ fontSize: 18, flexShrink: 0 }}>{cfg.emoji}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 800, color: "#fff",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {event.title || cfg.label}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
            {event.time && (
              <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                <Clock style={{ width: 10, height: 10, color: C.muted }} />
                <span style={{ fontSize: 11, color: C.muted }}>{event.time}</span>
              </div>
            )}
            {event.location && (
              <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                <MapPin style={{ width: 10, height: 10, color: C.muted }} />
                <span style={{ fontSize: 11, color: C.muted,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 120 }}>
                  {event.location}
                </span>
              </div>
            )}
          </div>
        </div>
        {event.confirmed
          ? <CheckCircle2 style={{ color: C.emerald, width: 16, height: 16, flexShrink: 0 }} />
          : <div style={{ width: 8, height: 8, borderRadius: "50%", background: cfg.color, flexShrink: 0 }} />}
        {!finalized && (
          <button onClick={e => { e.stopPropagation(); onRemove(); }}
            style={{ background: "none", border: "none", cursor: "pointer", color: C.red, padding: 4, flexShrink: 0 }}>
            <Trash2 style={{ width: 13, height: 13 }} />
          </button>
        )}
      </div>

      {/* Expanded edit form */}
      {expanded && (
        <div style={{ padding: "14px 14px 16px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
            <Field label="Time" value={event.time} onChange={v => onChange("time", v)} type="time" disabled={finalized} />
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase",
                letterSpacing: ".07em", marginBottom: 4 }}>Type</p>
              <select value={event.event_type} onChange={e => onChange("event_type", e.target.value)}
                disabled={finalized}
                style={{ width: "100%", padding: "8px 10px", borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.1)", background: "#1A2235",
                  color: "#fff", fontSize: 12, outline: "none" }}>
                {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>)}
              </select>
            </div>
          </div>
          <Field label="Event Title" value={event.title} onChange={v => onChange("title", v)} disabled={finalized} />
          <Field label="Location / Address" value={event.location} onChange={v => onChange("location", v)} disabled={finalized} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
            <Field label="Contact Name" value={event.contact} onChange={v => onChange("contact", v)} disabled={finalized} />
            <Field label="Phone" value={event.phone} onChange={v => onChange("phone", v)} disabled={finalized} />
          </div>
          <Field label="Notes" value={event.notes} onChange={v => onChange("notes", v)} disabled={finalized} />
          {!finalized && (
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginTop: 4 }}>
              <input type="checkbox" checked={!!event.confirmed}
                onChange={e => onChange("confirmed", e.target.checked)}
                style={{ width: 15, height: 15 }} />
              <span style={{ fontSize: 12, color: C.muted }}>Confirmed with client</span>
            </label>
          )}
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = "text", disabled }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <p style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase",
        letterSpacing: ".07em", marginBottom: 4 }}>{label}</p>
      <input type={type} value={value || ""} onChange={e => onChange(e.target.value)} disabled={disabled}
        style={{ width: "100%", padding: "8px 10px", borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.1)", background: disabled ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.07)",
          color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
    </div>
  );
}

export default function DischargeDayItinerary({ planId, clientEmail, dischargeDate, staffEmail, finalized }) {
  const qc = useQueryClient();
  const [events, setEvents] = useState([]);
  const [generalNotes, setGeneralNotes] = useState("");
  const [itineraryId, setItineraryId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const { data: existing } = useQuery({
    queryKey: ["discharge-itinerary", planId],
    queryFn: () => base44.entities.DischargeItinerary.filter({ plan_id: planId }),
    enabled: !!planId,
    select: d => d[0] || null,
  });

  useEffect(() => {
    if (existing) {
      setItineraryId(existing.id);
      setEvents(existing.events || []);
      setGeneralNotes(existing.general_notes || "");
    }
  }, [existing]);

  const addEvent = () => {
    setEvents(prev => [...prev, { ...EMPTY_EVENT, id: Date.now().toString() }]);
  };

  const updateEvent = (idx, field, val) => {
    setEvents(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: val };
      return next;
    });
  };

  const removeEvent = (idx) => {
    setEvents(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    setSaving(true);
    const sorted = [...events].sort((a, b) => (a.time || "").localeCompare(b.time || ""));
    const payload = { plan_id: planId, client_email: clientEmail, discharge_date: dischargeDate,
      events: sorted, general_notes: generalNotes };
    if (itineraryId) {
      await base44.entities.DischargeItinerary.update(itineraryId, payload);
    } else {
      const created = await base44.entities.DischargeItinerary.create(payload);
      setItineraryId(created.id);
    }
    qc.invalidateQueries({ queryKey: ["discharge-itinerary"] });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const confirmedCount = events.filter(e => e.confirmed).length;

  return (
    <div>
      <div style={{ background: "rgba(201,169,110,0.07)", border: "1px solid rgba(201,169,110,0.2)",
        borderRadius: 12, padding: "12px 16px", marginBottom: 20 }}>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>
          Build the client's schedule for <strong style={{ color: C.gold }}>discharge day</strong>.
          Add meetings, appointments, job schedules, probation check-ins, and any other events they need to make it to.
        </p>
        {dischargeDate && (
          <p style={{ fontSize: 12, fontWeight: 800, color: C.gold, marginTop: 6 }}>
            📅 Discharge Date: {dischargeDate}
          </p>
        )}
      </div>

      {/* Progress */}
      {events.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16,
          padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)" }}>
          <CheckCircle2 style={{ color: confirmedCount === events.length ? C.emerald : C.amber, width: 14, height: 14 }} />
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>
            {confirmedCount}/{events.length} events confirmed with client
          </p>
        </div>
      )}

      {/* Quick-add type buttons */}
      {!finalized && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
          {EVENT_TYPES.slice(0, 6).map(t => (
            <button key={t.value} onClick={() => {
              setEvents(prev => [...prev, { ...EMPTY_EVENT, id: Date.now().toString(), event_type: t.value }]);
            }} style={{ padding: "5px 10px", borderRadius: 20, border: `1px solid ${t.color}30`,
              background: `${t.color}0A`, color: t.color, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
              {t.emoji} {t.label}
            </button>
          ))}
          <button onClick={addEvent}
            style={{ padding: "5px 10px", borderRadius: 20, border: "1px dashed rgba(255,255,255,0.15)",
              background: "transparent", color: C.muted, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
            + Other
          </button>
        </div>
      )}

      {/* Event list */}
      {events.length === 0 ? (
        <div style={{ borderRadius: 14, padding: "32px 20px", textAlign: "center",
          background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.08)" }}>
          <p style={{ fontSize: 14, color: C.muted }}>No events yet.</p>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", marginTop: 4 }}>
            Use the quick-add buttons above to start building the itinerary.
          </p>
        </div>
      ) : (
        events.map((evt, idx) => (
          <EventCard key={evt.id || idx} event={evt} idx={idx}
            onChange={(field, val) => updateEvent(idx, field, val)}
            onRemove={() => removeEvent(idx)}
            finalized={finalized} />
        ))
      )}

      {/* General notes */}
      <div style={{ marginTop: 16 }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase",
          letterSpacing: ".07em", marginBottom: 6 }}>General Itinerary Notes</p>
        <textarea value={generalNotes} onChange={e => setGeneralNotes(e.target.value)}
          disabled={finalized} rows={3} placeholder="Transport arrangements, day-of reminders, backup contacts if they miss an appointment…"
          style={{ width: "100%", padding: "12px 14px", borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)",
            color: "#fff", fontSize: 13, resize: "vertical", outline: "none",
            boxSizing: "border-box", lineHeight: 1.6, opacity: finalized ? 0.6 : 1 }} />
      </div>

      {!finalized && (
        <button onClick={handleSave} disabled={saving}
          style={{ width: "100%", marginTop: 14, padding: "13px", borderRadius: 12, border: "none",
            cursor: "pointer", background: `linear-gradient(135deg,${C.teal},#2CB8AE)`,
            color: "#fff", fontWeight: 800, fontSize: 14,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            boxShadow: "0 6px 20px rgba(62,207,191,0.2)" }}>
          {saving ? <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" /> : null}
          {saved ? "Saved ✓" : "Save Itinerary"}
        </button>
      )}
    </div>
  );
}