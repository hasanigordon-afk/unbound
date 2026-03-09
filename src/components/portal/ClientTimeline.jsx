import React, { useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarCheck, MessageSquare, FileText, Target,
  TrendingDown, TrendingUp, AlertTriangle, Bookmark
} from "lucide-react";

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getDaysBetween(dateStr) {
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = Math.round((now - d) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return `${diff}d ago`;
}

function MoodDot({ rating }) {
  const colors = { 1: "#EF4444", 2: "#F97316", 3: "#EAB308", 4: "#22C55E", 5: "#16A34A" };
  const labels = { 1: "Very low", 2: "Struggling", 3: "Getting by", 4: "Okay", 5: "Good" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: colors[rating] || "#94A3B8", display: "inline-block" }} />
      <span style={{ fontSize: 12, color: "#475569" }}>{labels[rating] || "—"}</span>
    </span>
  );
}

function TimelineEntry({ item }) {
  const { type, date, data, alert } = item;

  const configs = {
    checkin: {
      icon: CalendarCheck,
      iconBg: alert ? "#FEF2F2" : "#EFF6FF",
      iconColor: alert ? "#DC2626" : "#3B82F6",
      borderLeft: alert ? "3px solid #EF4444" : "3px solid #3B82F6",
    },
    message: {
      icon: MessageSquare,
      iconBg: "#F0FDF4",
      iconColor: "#16A34A",
      borderLeft: "3px solid #22C55E",
    },
    note: {
      icon: FileText,
      iconBg: "#FEFCE8",
      iconColor: "#CA8A04",
      borderLeft: "3px solid #EAB308",
    },
    milestone: {
      icon: Target,
      iconBg: "#F5F3FF",
      iconColor: "#7C3AED",
      borderLeft: "3px solid #7C3AED",
    },
    saved_resource: {
      icon: Bookmark,
      iconBg: "#FFF7ED",
      iconColor: "#EA580C",
      borderLeft: "3px solid #F97316",
    },
    missed_checkin: {
      icon: AlertTriangle,
      iconBg: "#FEF2F2",
      iconColor: "#DC2626",
      borderLeft: "3px solid #EF4444",
    },
  };

  const cfg = configs[type] || configs.checkin;
  const Icon = cfg.icon;

  return (
    <div style={{
      display: "flex", gap: 14, padding: "14px 18px",
      background: "#FFF",
      border: "1px solid #E2E8F0",
      borderLeft: cfg.borderLeft,
      borderRadius: 10,
      alignItems: "flex-start",
    }}>
      <div style={{ width: 34, height: 34, borderRadius: 8, background: cfg.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon className="w-4 h-4" style={{ color: cfg.iconColor }} strokeWidth={2} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {type === "checkin" && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
              <span style={{ fontWeight: 700, fontSize: 13, color: "#0F172A" }}>Check-In</span>
              {data.needs_help && (
                <span style={{ background: "#FEF2F2", color: "#DC2626", borderRadius: 20, padding: "1px 8px", fontSize: 10, fontWeight: 700 }}>
                  Requested Help
                </span>
              )}
              {alert && (
                <span style={{ background: "#FFF7ED", color: "#C2410C", borderRadius: 20, padding: "1px 8px", fontSize: 10, fontWeight: 700 }}>
                  ⚠ Flag
                </span>
              )}
            </div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: "#64748B" }}>Mood: <MoodDot rating={data.mood_rating} /></span>
              <span style={{ fontSize: 12, color: "#64748B" }}>Craving: <strong style={{ color: data.craving_level >= 4 ? "#EF4444" : "#0F172A" }}>{data.craving_level || 0}/5</strong></span>
              <span style={{ fontSize: 12, color: "#64748B" }}>Meeting: <strong>{data.attended_meeting ? "✓ Yes" : "No"}</strong></span>
              <span style={{ fontSize: 12, color: "#64748B" }}>Sponsor: <strong>{data.connected_with_sponsor ? "✓ Yes" : "No"}</strong></span>
            </div>
            {data.notes && <p style={{ fontSize: 12, color: "#64748B", marginTop: 6, fontStyle: "italic" }}>"{data.notes}"</p>}
          </>
        )}

        {type === "missed_checkin" && (
          <>
            <span style={{ fontWeight: 700, fontSize: 13, color: "#DC2626" }}>Missed Check-In</span>
            <p style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>No check-in recorded on this day.</p>
          </>
        )}

        {type === "message" && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontWeight: 700, fontSize: 13, color: "#0F172A" }}>Message</span>
              <span style={{ fontSize: 11, color: "#94A3B8" }}>from {data.counselor_email?.split("@")[0]}</span>
            </div>
            <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.5 }}>{data.message}</p>
          </>
        )}

        {type === "note" && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontWeight: 700, fontSize: 13, color: "#0F172A" }}>Staff Note</span>
              <span style={{ background: "#FEFCE8", color: "#A16207", borderRadius: 20, padding: "1px 8px", fontSize: 10, fontWeight: 700 }}>
                {data.note_type?.replace(/_/g, " ")}
              </span>
            </div>
            <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.5 }}>{data.content}</p>
          </>
        )}

        {type === "milestone" && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontWeight: 700, fontSize: 13, color: "#0F172A" }}>Goal Completed ✓</span>
            </div>
            <p style={{ fontSize: 13, color: "#475569" }}>{data.milestone_text}</p>
          </>
        )}

        {type === "saved_resource" && (
          <>
            <span style={{ fontWeight: 700, fontSize: 13, color: "#0F172A" }}>Saved a Resource</span>
            {data.resource_name && <p style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>{data.resource_name}</p>}
          </>
        )}
      </div>

      <div style={{ flexShrink: 0, textAlign: "right" }}>
        <p style={{ fontSize: 11, color: "#94A3B8", fontWeight: 500 }}>{getDaysBetween(date)}</p>
        <p style={{ fontSize: 10, color: "#CBD5E1", marginTop: 2 }}>{formatDate(date)}</p>
      </div>
    </div>
  );
}

function TrendBanner({ checkIns }) {
  if (checkIns.length < 4) return null;
  const recent4 = checkIns.slice(0, 4);
  const older4 = checkIns.slice(4, 8);
  if (older4.length < 2) return null;

  const avgMoodRecent = recent4.reduce((s, c) => s + (c.mood_rating || 3), 0) / recent4.length;
  const avgMoodOlder = older4.reduce((s, c) => s + (c.mood_rating || 3), 0) / older4.length;
  const diff = avgMoodRecent - avgMoodOlder;

  if (Math.abs(diff) < 0.5) return null;

  const isPositive = diff > 0;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10, padding: "12px 16px",
      background: isPositive ? "#F0FDF4" : "#FEF2F2",
      border: `1px solid ${isPositive ? "#86EFAC" : "#FECACA"}`,
      borderRadius: 10, marginBottom: 16,
    }}>
      {isPositive
        ? <TrendingUp className="w-4 h-4" style={{ color: "#16A34A" }} />
        : <TrendingDown className="w-4 h-4" style={{ color: "#DC2626" }} />}
      <p style={{ fontSize: 13, fontWeight: 600, color: isPositive ? "#15803D" : "#DC2626" }}>
        {isPositive
          ? `Mood trending up — avg mood improved from ${avgMoodOlder.toFixed(1)} to ${avgMoodRecent.toFixed(1)} over last 8 check-ins.`
          : `Mood trending down — avg mood dropped from ${avgMoodOlder.toFixed(1)} to ${avgMoodRecent.toFixed(1)} over last 8 check-ins.`}
      </p>
    </div>
  );
}

export default function ClientTimeline({ client, allCheckIns, facilityId, user }) {
  const email = client.participant_email;

  const clientCheckIns = useMemo(() =>
    allCheckIns.filter(c => c.participant_email === email)
      .sort((a, b) => new Date(b.check_in_date) - new Date(a.check_in_date)),
    [allCheckIns, email]
  );

  const { data: notes = [] } = useQuery({
    queryKey: ["timeline-notes", email],
    queryFn: () => base44.entities.ProgressNote.filter({ client_email: email }, "-created_date", 50),
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["timeline-messages", email, facilityId],
    queryFn: () => base44.entities.CounselorMessage.filter({ participant_email: email, facility_id: facilityId }, "-created_date", 50),
  });

  const { data: milestones = [] } = useQuery({
    queryKey: ["timeline-milestones", email],
    queryFn: () => base44.entities.ForwardPlanMilestone.filter({ participant_email: email }),
  });

  const { data: savedResources = [] } = useQuery({
    queryKey: ["timeline-saved", email],
    queryFn: () => base44.entities.SavedResource.filter({ created_by: email }, "-created_date", 30),
  });

  // Build merged timeline with missed check-in gaps
  const timelineItems = useMemo(() => {
    const items = [];

    // Check-ins + missed day detection
    const sortedCheckIns = [...clientCheckIns];
    sortedCheckIns.forEach((ci, idx) => {
      const isAlert = ci.needs_help || ci.mood_rating <= 2 || ci.craving_level >= 4;
      items.push({ type: "checkin", date: ci.check_in_date, data: ci, alert: isAlert, sortKey: new Date(ci.check_in_date).getTime() });

      // Detect gaps > 2 days between consecutive check-ins (within last 30 days)
      const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      if (idx < sortedCheckIns.length - 1) {
        const thisDate = new Date(ci.check_in_date);
        const nextDate = new Date(sortedCheckIns[idx + 1].check_in_date);
        const gapDays = Math.round((thisDate - nextDate) / 86400000);
        if (gapDays > 2 && thisDate >= thirtyDaysAgo) {
          // Insert one missed-checkin marker in the middle of the gap
          const midDate = new Date(nextDate.getTime() + (thisDate - nextDate) / 2);
          items.push({ type: "missed_checkin", date: midDate.toISOString().split("T")[0], data: {}, alert: true, sortKey: midDate.getTime() });
        }
      }
    });

    // Messages
    messages.forEach(m => {
      items.push({ type: "message", date: m.created_date, data: m, alert: false, sortKey: new Date(m.created_date).getTime() });
    });

    // Notes
    notes.forEach(n => {
      items.push({ type: "note", date: n.created_date, data: n, alert: false, sortKey: new Date(n.created_date).getTime() });
    });

    // Completed milestones
    milestones.filter(m => m.completed && m.completed_date).forEach(m => {
      items.push({ type: "milestone", date: m.completed_date, data: m, alert: false, sortKey: new Date(m.completed_date).getTime() });
    });

    // Saved resources
    savedResources.forEach(r => {
      items.push({ type: "saved_resource", date: r.created_date, data: r, alert: false, sortKey: new Date(r.created_date).getTime() });
    });

    return items.sort((a, b) => b.sortKey - a.sortKey).slice(0, 60);
  }, [clientCheckIns, messages, notes, milestones, savedResources]);

  // Group by relative date label
  const grouped = useMemo(() => {
    const groups = {};
    timelineItems.forEach(item => {
      const d = new Date(item.date);
      d.setHours(0, 0, 0, 0);
      const now = new Date(); now.setHours(0, 0, 0, 0);
      const diff = Math.round((now - d) / 86400000);
      let label;
      if (diff === 0) label = "Today";
      else if (diff === 1) label = "Yesterday";
      else if (diff <= 7) label = "This Week";
      else if (diff <= 14) label = "Last Week";
      else if (diff <= 30) label = "This Month";
      else label = "Older";
      if (!groups[label]) groups[label] = [];
      groups[label].push(item);
    });
    return groups;
  }, [timelineItems]);

  const ORDER = ["Today", "Yesterday", "This Week", "Last Week", "This Month", "Older"];

  return (
    <div>
      <TrendBanner checkIns={clientCheckIns} />

      {timelineItems.length === 0 && (
        <div style={{ background: "#FFF", border: "1px solid #E2E8F0", borderRadius: 10, padding: 40, textAlign: "center" }}>
          <p style={{ color: "#94A3B8", fontSize: 14 }}>No activity recorded yet for this client.</p>
        </div>
      )}

      {ORDER.filter(g => grouped[g]).map(groupLabel => (
        <div key={groupLabel} style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 10 }}>
            {groupLabel}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {grouped[groupLabel].map((item, i) => (
              <TimelineEntry key={`${item.type}-${item.sortKey}-${i}`} item={item} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}