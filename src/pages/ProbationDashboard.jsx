/**
 * ProbationDashboard — Probation/Parole Officer Portal
 * Compliance-focused. No access to journals, private recovery content.
 * Shows only: appointments, milestones, program attendance, court-relevant compliance.
 */
import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  Shield, CheckCircle2, AlertTriangle, Calendar, Clock,
  User, FileText, Phone, ChevronRight, Info, Lock, Loader2,
  TrendingUp, XCircle
} from "lucide-react";

const C = {
  navy:   "#0F172A",
  blue:   "#3B82F6",
  green:  "#10B981",
  amber:  "#F59E0B",
  red:    "#EF4444",
  slate:  "#64748B",
  muted:  "#94A3B8",
  border: "#E2E8F0",
  bg:     "#F8FAFC",
  white:  "#FFFFFF",
};

function ComplianceTag({ status }) {
  const cfg = {
    compliant:    { bg: "#F0FDF4", color: C.green, border: "#BBF7D0", label: "Compliant",     icon: "✓" },
    at_risk:      { bg: "#FFFBEB", color: C.amber, border: "#FDE68A", label: "At Risk",        icon: "!" },
    non_compliant:{ bg: "#FEF2F2", color: C.red,   border: "#FECACA", label: "Non-Compliant",  icon: "✗" },
    unknown:      { bg: "#F1F5F9", color: C.slate,  border: C.border,  label: "Pending",        icon: "?" },
  }[status] || { bg: "#F1F5F9", color: C.slate, border: C.border, label: "Unknown", icon: "?" };

  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 12px",
      borderRadius: 20, background: cfg.bg, color: cfg.color,
      border: `1px solid ${cfg.border}`, fontSize: 12, fontWeight: 700,
    }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

function StatBlock({ label, value, sub, color = C.blue, icon: Icon }) {
  return (
    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: C.slate, textTransform: "uppercase", letterSpacing: ".06em" }}>{label}</p>
        {Icon && <Icon style={{ width: 15, height: 15, color }} strokeWidth={1.5} />}
      </div>
      <p style={{ fontSize: 28, fontWeight: 900, color: C.navy, lineHeight: 1, marginBottom: 3 }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: C.muted }}>{sub}</p>}
    </div>
  );
}

function ClientRow({ participant, checkIns, sessions, onClick }) {
  const today = new Date();
  const sevenAgo = new Date(); sevenAgo.setDate(sevenAgo.getDate() - 7);
  const thirtyAgo = new Date(); thirtyAgo.setDate(thirtyAgo.getDate() - 30);

  const myCheckIns = checkIns.filter(c => c.participant_email === participant.participant_email);
  const recent = myCheckIns.filter(c => new Date(c.check_in_date) >= sevenAgo);
  const monthly = myCheckIns.filter(c => new Date(c.check_in_date) >= thirtyAgo);
  const weeklyMeetings = recent.filter(c => c.attended_meeting).length;
  const lastCI = myCheckIns.sort((a,b) => new Date(b.check_in_date) - new Date(a.check_in_date))[0];
  const daysSince = lastCI ? Math.floor((today - new Date(lastCI.check_in_date)) / 86400000) : 99;

  const mySessions = sessions.filter(s =>
    s.participant_email === participant.participant_email || s.group_participant_emails?.includes(participant.participant_email)
  );
  const upcomingSessions = mySessions.filter(s => s.status === "scheduled" && new Date(s.scheduled_date) >= today);
  const completedSessions = mySessions.filter(s => s.status === "completed").length;

  const complianceStatus =
    daysSince > 10 ? "non_compliant" :
    daysSince > 5 || weeklyMeetings === 0 ? "at_risk" :
    recent.length >= 5 ? "compliant" : "unknown";

  return (
    <div onClick={onClick} style={{
      background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 18px",
      cursor: "pointer", transition: "box-shadow .15s ease",
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.07)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "#EFF6FF", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center" }}>
            <User style={{ width: 18, height: 18, color: C.blue }} />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>
              {participant.participant_email?.split("@")[0] || "Participant"}
            </p>
            <p style={{ fontSize: 11, color: C.muted }}>{participant.program_type?.replace(/_/g, " ") || "Program not set"}</p>
          </div>
        </div>
        <ComplianceTag status={complianceStatus} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "6px 8px" }}>
        {[
          { label: "Last Check-In", value: daysSince === 99 ? "Never" : daysSince === 0 ? "Today" : `${daysSince}d ago`, urgent: daysSince > 5 },
          { label: "7-Day Check-Ins", value: `${recent.length}/7` },
          { label: "Meetings (7d)", value: weeklyMeetings },
          { label: "Sessions", value: completedSessions },
        ].map(stat => (
          <div key={stat.label}>
            <p style={{ fontSize: 10, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 1 }}>{stat.label}</p>
            <p style={{ fontSize: 13, fontWeight: 700, color: stat.urgent ? C.red : C.navy }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {upcomingSessions.length > 0 && (
        <div style={{ marginTop: 10, padding: "8px 10px", borderRadius: 8, background: "#EFF6FF",
          border: "1px solid #BFDBFE", display: "flex", alignItems: "center", gap: 8 }}>
          <Calendar style={{ width: 13, height: 13, color: C.blue, flexShrink: 0 }} />
          <p style={{ fontSize: 12, color: C.blue, fontWeight: 600 }}>
            Next: {upcomingSessions[0].scheduled_date} at {upcomingSessions[0].scheduled_time}
          </p>
        </div>
      )}
    </div>
  );
}

function ParticipantDetail({ participant, checkIns, sessions, onBack }) {
  const today = new Date();
  const thirtyAgo = new Date(); thirtyAgo.setDate(thirtyAgo.getDate() - 30);
  const sevenAgo = new Date(); sevenAgo.setDate(sevenAgo.getDate() - 7);

  const myCheckIns = checkIns
    .filter(c => c.participant_email === participant.participant_email)
    .sort((a, b) => new Date(b.check_in_date) - new Date(a.check_in_date));

  const monthly = myCheckIns.filter(c => new Date(c.check_in_date) >= thirtyAgo);
  const recent7 = myCheckIns.filter(c => new Date(c.check_in_date) >= sevenAgo);
  const meetings = monthly.filter(c => c.attended_meeting).length;
  const sponsorContacts = monthly.filter(c => c.connected_with_sponsor).length;

  const mySessions = sessions.filter(s =>
    s.participant_email === participant.participant_email ||
    s.group_participant_emails?.includes(participant.participant_email)
  ).sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date));

  const upcoming = mySessions.filter(s => s.status === "scheduled" && new Date(s.scheduled_date) >= today);
  const completed = mySessions.filter(s => s.status === "completed");

  const completionRate = myCheckIns.length > 0
    ? Math.round((monthly.length / 30) * 100)
    : 0;

  return (
    <div>
      <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6,
        background: "none", border: "none", color: C.slate, cursor: "pointer", fontSize: 13, marginBottom: 20, padding: 0 }}>
        ← Back to Caseload
      </button>

      {/* Header */}
      <div style={{ background: C.navy, borderRadius: 16, padding: "20px", marginBottom: 20, color: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(59,130,246,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center" }}>
            <User style={{ width: 22, height: 22, color: C.blue }} />
          </div>
          <div>
            <p style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>
              {participant.participant_email?.split("@")[0]}
            </p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
              {participant.program_type?.replace(/_/g, " ")} · {participant.location_city || "Location not set"}
            </p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {[
            { label: "30-Day Check-Ins", value: monthly.length, max: 30 },
            { label: "Meetings (30d)", value: meetings },
            { label: "Sessions Done", value: completed.length },
          ].map(s => (
            <div key={s.label} style={{ background: "rgba(255,255,255,0.07)", borderRadius: 10, padding: "12px" }}>
              <p style={{ fontSize: 22, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{s.value}{s.max ? `/${s.max}` : ""}</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 3 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy notice */}
      <div style={{ background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 12, padding: "12px 16px", marginBottom: 20,
        display: "flex", gap: 10 }}>
        <Lock style={{ width: 15, height: 15, color: C.amber, flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: 12, color: "#92400E", lineHeight: 1.55 }}>
          <strong>Access limited:</strong> Journals, private recovery notes, and therapy session content are not visible to supervision officers.
          Only compliance-relevant data is shown here.
        </p>
      </div>

      {/* Attendance compliance summary */}
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 20px", marginBottom: 16 }}>
        <p style={{ fontSize: 14, fontWeight: 800, color: C.navy, marginBottom: 14 }}>Attendance Compliance (30 Days)</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { label: "Program Check-Ins", value: monthly.length, total: 30, target: 20, color: C.blue },
            { label: "Meeting Attendance", value: meetings, total: 30, target: 10, color: C.green },
            { label: "Support Contacts", value: sponsorContacts, total: 30, target: 8, color: "#8B5CF6" },
          ].map(m => {
            const pct = Math.min(Math.round((m.value / m.total) * 100), 100);
            const targetPct = Math.round((m.target / m.total) * 100);
            const onTrack = m.value >= m.target;
            return (
              <div key={m.label}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{m.label}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: onTrack ? C.green : C.red }}>
                      {m.value}/{m.total}
                    </p>
                    {onTrack
                      ? <CheckCircle2 style={{ width: 13, height: 13, color: C.green }} />
                      : <XCircle style={{ width: 13, height: 13, color: C.red }} />
                    }
                  </div>
                </div>
                <div style={{ position: "relative", height: 8, borderRadius: 4, background: "#F1F5F9", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, height: "100%", borderRadius: 4, width: `${pct}%`, background: m.color }} />
                  {/* Target line */}
                  <div style={{ position: "absolute", top: 0, bottom: 0, left: `${targetPct}%`, width: 2, background: C.amber, opacity: 0.7 }} />
                </div>
                <p style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>Target: {m.target} · {onTrack ? "On track" : "Below target"}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming sessions */}
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 20px", marginBottom: 16 }}>
        <p style={{ fontSize: 14, fontWeight: 800, color: C.navy, marginBottom: 12 }}>Upcoming Appointments</p>
        {upcoming.length === 0 ? (
          <p style={{ fontSize: 13, color: C.muted, textAlign: "center", padding: "16px 0" }}>No upcoming appointments scheduled</p>
        ) : upcoming.map(s => (
          <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0",
            borderBottom: "1px solid #F1F5F9" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#EFF6FF",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Calendar style={{ width: 16, height: 16, color: C.blue }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>
                {s.title || s.session_type?.replace(/_/g, " ")}
              </p>
              <p style={{ fontSize: 12, color: C.muted }}>{s.scheduled_date} · {s.scheduled_time} · {s.duration_minutes || 50}min</p>
            </div>
            <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "#EFF6FF", color: C.blue, fontWeight: 700 }}>
              {s.status}
            </span>
          </div>
        ))}
      </div>

      {/* 30-day check-in log */}
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 20px" }}>
        <p style={{ fontSize: 14, fontWeight: 800, color: C.navy, marginBottom: 12 }}>Check-In Log (Last 14 Days)</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {myCheckIns.slice(0, 14).length === 0 ? (
            <p style={{ fontSize: 13, color: C.muted }}>No check-ins on record</p>
          ) : myCheckIns.slice(0, 14).map(ci => (
            <div key={ci.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0",
              borderBottom: "1px solid #F8FAFC" }}>
              <CheckCircle2 style={{ width: 14, height: 14, color: C.green, flexShrink: 0 }} />
              <p style={{ fontSize: 13, color: C.navy, flex: 1 }}>{ci.check_in_date}</p>
              <div style={{ display: "flex", gap: 6 }}>
                {ci.attended_meeting && (
                  <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: "#F0FDF4", color: C.green, fontWeight: 700 }}>Meeting</span>
                )}
                {ci.connected_with_sponsor && (
                  <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: "#F0F9FF", color: C.blue, fontWeight: 700 }}>Sponsor</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProbationDashboard() {
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["user"], queryFn: () => base44.auth.me(),
  });

  const { data: profiles = [], isLoading: profilesLoading } = useQuery({
    queryKey: ["probation-profiles"],
    queryFn: () => base44.entities.ParticipantProfile.list("-created_date", 100),
    enabled: !!user,
  });

  const { data: checkIns = [] } = useQuery({
    queryKey: ["probation-checkins"],
    queryFn: () => base44.entities.DailyCheckIn.list("-check_in_date", 500),
    enabled: !!user && profiles.length > 0,
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ["probation-sessions"],
    queryFn: () => base44.entities.TelehealthSession.list("-scheduled_date", 200),
    enabled: !!user,
  });

  const participantsWithStatus = useMemo(() => {
    const today = new Date();
    const sevenAgo = new Date(); sevenAgo.setDate(sevenAgo.getDate() - 7);

    return profiles.map(p => {
      const pCheckIns = checkIns.filter(c => c.participant_email === p.participant_email);
      const recent = pCheckIns.filter(c => new Date(c.check_in_date) >= sevenAgo);
      const last = pCheckIns.sort((a,b) => new Date(b.check_in_date) - new Date(a.check_in_date))[0];
      const daysSince = last ? Math.floor((today - new Date(last.check_in_date)) / 86400000) : 99;
      const meetings7 = recent.filter(c => c.attended_meeting).length;

      const status =
        daysSince > 10 ? "non_compliant" :
        daysSince > 5 || meetings7 === 0 ? "at_risk" :
        recent.length >= 5 ? "compliant" : "unknown";

      return { ...p, _status: status };
    });
  }, [profiles, checkIns]);

  const filtered = useMemo(() => {
    return participantsWithStatus.filter(p => {
      const matchSearch = !searchQuery || p.participant_email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = filterStatus === "all" || p._status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [participantsWithStatus, searchQuery, filterStatus]);

  const compliantCount = participantsWithStatus.filter(p => p._status === "compliant").length;
  const atRiskCount = participantsWithStatus.filter(p => p._status === "at_risk").length;
  const nonCompliantCount = participantsWithStatus.filter(p => p._status === "non_compliant").length;

  if (userLoading) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Loader2 style={{ width: 28, height: 28, color: C.blue }} className="animate-spin" />
    </div>
  );

  if (selectedParticipant) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, paddingBottom: 80 }}>
        <div style={{ maxWidth: 700, margin: "0 auto", padding: "32px 20px" }}>
          <ParticipantDetail
            participant={selectedParticipant}
            checkIns={checkIns}
            sessions={sessions}
            onBack={() => setSelectedParticipant(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ background: C.navy, color: "#fff", padding: "40px 24px 28px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(96,165,250,0.8)", textTransform: "uppercase",
            letterSpacing: ".1em", marginBottom: 4 }}>UNBOUND · Supervision Portal</p>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: "#fff", marginBottom: 3 }}>
            Compliance Dashboard
          </h1>
          {user && <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{user.full_name} · {user.email}</p>}

          <div style={{ marginTop: 6, display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px",
            borderRadius: 20, background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)" }}>
            <Lock style={{ width: 12, height: 12, color: C.amber }} />
            <p style={{ fontSize: 11, fontWeight: 700, color: C.amber }}>Compliance-only view • Private health data restricted</p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 20px" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 24 }}>
          <StatBlock label="Total Supervised" value={profiles.length} sub="active participants" color={C.blue} icon={User} />
          <StatBlock label="Compliant" value={compliantCount} sub="on track this week" color={C.green} icon={CheckCircle2} />
          <StatBlock label="At Risk" value={atRiskCount} sub="attendance concerns" color={C.amber} icon={AlertTriangle} />
          <StatBlock label="Non-Compliant" value={nonCompliantCount} sub="require follow-up" color={C.red} icon={XCircle} />
        </div>

        {/* Non-compliant alert banner */}
        {nonCompliantCount > 0 && (
          <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 14, padding: "16px 20px", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <AlertTriangle style={{ width: 16, height: 16, color: C.red }} />
              <p style={{ fontSize: 14, fontWeight: 800, color: C.red }}>
                {nonCompliantCount} participant{nonCompliantCount > 1 ? "s" : ""} require immediate follow-up
              </p>
            </div>
            <p style={{ fontSize: 12, color: "#991B1B" }}>No check-in recorded in 10+ days. Review compliance status and initiate contact per your case protocols.</p>
          </div>
        )}

        {/* Search & filter */}
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 16px",
          display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginBottom: 16 }}>
          <input
            placeholder="Search participant…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ flex: "1 1 200px", padding: "8px 12px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, color: C.navy, background: C.bg, outline: "none" }}
          />
          <div style={{ display: "flex", gap: 6 }}>
            {["all", "compliant", "at_risk", "non_compliant"].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)} style={{
                padding: "7px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: "pointer",
                background: filterStatus === s ? C.navy : C.bg,
                color: filterStatus === s ? "#fff" : C.slate,
                border: `1px solid ${filterStatus === s ? C.navy : C.border}`,
              }}>
                {s === "all" ? "All" : s === "at_risk" ? "At Risk" : s === "non_compliant" ? "Non-Compliant" : "Compliant"}
              </button>
            ))}
          </div>
          <p style={{ fontSize: 12, color: C.muted }}>{filtered.length} results</p>
        </div>

        {/* Participant list */}
        {profilesLoading ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <Loader2 style={{ width: 24, height: 24, color: C.blue, margin: "0 auto 10px", display: "block" }} className="animate-spin" />
            <p style={{ fontSize: 13, color: C.muted }}>Loading caseload…</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map(p => (
              <ClientRow
                key={p.id}
                participant={p}
                checkIns={checkIns}
                sessions={sessions}
                onClick={() => setSelectedParticipant(p)}
              />
            ))}
            {filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 0", background: C.white, borderRadius: 14, border: `1px solid ${C.border}` }}>
                <p style={{ fontSize: 30, marginBottom: 10 }}>🔍</p>
                <p style={{ fontSize: 15, fontWeight: 700, color: C.navy }}>No participants match that filter</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}