import React from "react";
import { MapPin, Clock, Video, Users, Star, CheckCircle2, ExternalLink } from "lucide-react";

const NAVY = "#0F1E3D";
const GOLD = "#C8932F";
const TEXT = "#1A1F2C";
const MUTED = "#4A5260";
const DIM = "#6B7280";
const BORDER = "#E4DFD3";
const GREEN = "#34A853";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function fmtTime(t) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  if (isNaN(h)) return t;
  const ampm = h >= 12 ? "pm" : "am";
  const hh = ((h + 11) % 12) + 1;
  return `${hh}:${String(m || 0).padStart(2, "0")}${ampm}`;
}

function FormatPill({ format }) {
  if (!format || format === "unspecified") return null;
  const map = {
    open:   { label: "Open",   bg: "rgba(52,168,83,0.10)",  fg: "#1B7A38", bd: "rgba(52,168,83,0.28)" },
    closed: { label: "Closed", bg: "rgba(15,30,61,0.07)",   fg: NAVY,      bd: "rgba(15,30,61,0.22)" },
    hybrid: { label: "Hybrid", bg: "rgba(200,147,47,0.10)", fg: GOLD,      bd: "rgba(200,147,47,0.32)" },
  };
  const s = map[format];
  if (!s) return null;
  return (
    <span style={{
      fontSize: 10, fontWeight: 800, color: s.fg, letterSpacing: ".06em",
      background: s.bg, border: `1px solid ${s.bd}`,
      padding: "3px 9px", borderRadius: 999, textTransform: "uppercase",
    }}>{s.label}</span>
  );
}

export default function MeetingCard({ meeting, isSaved, isRsvp, onToggleSave, onToggleRsvp }) {
  const isOnline = !meeting.in_person || (!!meeting.url && !meeting.address);
  const day = (meeting.day_of_week ?? null) !== null ? DAYS[meeting.day_of_week] : null;

  return (
    <div style={{
      background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 18,
      padding: "16px 16px 14px", boxShadow: "0 2px 8px rgba(15,30,61,0.04)",
      display: "flex", flexDirection: "column", gap: 10,
    }}>
      {/* Top row: title + save */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 6 }}>
            <span style={{
              fontSize: 10, fontWeight: 800, color: NAVY, letterSpacing: ".08em",
              background: "rgba(15,30,61,0.07)", padding: "3px 9px", borderRadius: 999,
            }}>{meeting.program_type}</span>
            <FormatPill format={meeting.meeting_format} />
            <span style={{
              fontSize: 10, fontWeight: 700, color: isOnline ? "#1E88E5" : MUTED,
              background: isOnline ? "rgba(30,136,229,0.08)" : "rgba(0,0,0,0.04)",
              padding: "3px 9px", borderRadius: 999,
              display: "inline-flex", alignItems: "center", gap: 4,
            }}>
              {isOnline ? <Video style={{ width: 10, height: 10 }} /> : <Users style={{ width: 10, height: 10 }} />}
              {isOnline ? "Online" : "In person"}
            </span>
          </div>
          <p style={{
            fontFamily: "'Lora', Georgia, serif",
            fontSize: 16, fontWeight: 700, color: TEXT, lineHeight: 1.3,
          }}>{meeting.title}</p>
        </div>

        <button
          onClick={() => onToggleSave(meeting)}
          aria-label={isSaved ? "Remove from My Meetings" : "Save to My Meetings"}
          style={{
            background: "transparent", border: "none", cursor: "pointer", padding: 4,
            color: isSaved ? GOLD : DIM,
          }}
        >
          <Star style={{ width: 22, height: 22 }} fill={isSaved ? GOLD : "none"} strokeWidth={1.8} />
        </button>
      </div>

      {/* Meta */}
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {(day || meeting.start_time) && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: MUTED }}>
            <Clock style={{ width: 13, height: 13, color: DIM }} />
            <span>
              {day ? `${day}s` : ""} {meeting.start_time ? fmtTime(meeting.start_time) : ""}
              {meeting.end_time ? ` – ${fmtTime(meeting.end_time)}` : ""}
            </span>
          </div>
        )}
        {(meeting.address || meeting.city) && !isOnline && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: 6, fontSize: 13, color: MUTED }}>
            <MapPin style={{ width: 13, height: 13, color: DIM, marginTop: 2, flexShrink: 0 }} />
            <span>{[meeting.address, meeting.city, meeting.state, meeting.zip].filter(Boolean).join(", ")}</span>
          </div>
        )}
        {isOnline && meeting.url && (
          <a href={meeting.url} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 13, color: "#1E88E5", display: "inline-flex", alignItems: "center", gap: 4, textDecoration: "none" }}>
            <ExternalLink style={{ width: 12, height: 12 }} /> Join online
          </a>
        )}
        {meeting.notes && (
          <p style={{ fontSize: 12.5, color: DIM, lineHeight: 1.55, marginTop: 2 }}>{meeting.notes}</p>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <button
          onClick={() => onToggleRsvp(meeting)}
          style={{
            flex: 1, padding: "10px 12px", borderRadius: 999,
            border: isRsvp ? "none" : `1px solid ${BORDER}`,
            background: isRsvp ? GREEN : "#fff",
            color: isRsvp ? "#fff" : NAVY,
            fontSize: 13, fontWeight: 700, cursor: "pointer",
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <CheckCircle2 style={{ width: 14, height: 14 }} />
          {isRsvp ? "RSVP'd" : "RSVP"}
        </button>
        <button
          onClick={() => onToggleSave(meeting)}
          style={{
            flex: 1, padding: "10px 12px", borderRadius: 999,
            border: `1px solid ${BORDER}`, background: isSaved ? "rgba(200,147,47,0.10)" : "#fff",
            color: isSaved ? GOLD : MUTED,
            fontSize: 13, fontWeight: 700, cursor: "pointer",
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <Star style={{ width: 14, height: 14 }} fill={isSaved ? GOLD : "none"} />
          {isSaved ? "Saved" : "Save"}
        </button>
      </div>
    </div>
  );
}