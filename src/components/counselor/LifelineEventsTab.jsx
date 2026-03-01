import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Phone, AlertTriangle, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import moment from "moment";

const REASON_LABELS = {
  about_to_use: "About to Use",
  already_used: "Already Used",
  anxious_panicking: "Anxious / Panicking",
  need_meeting: "Needs Meeting",
  need_food_shelter: "Needs Food/Shelter",
  need_to_talk: "Needs to Talk",
  other: "Other",
};

const REASON_COLORS = {
  about_to_use: "#E85D4C",
  already_used: "#E85D4C",
  anxious_panicking: "#FF9800",
  need_meeting: "#4A90E2",
  need_food_shelter: "#9C6FE4",
  need_to_talk: "#22c55e",
  other: "#6B7280",
};

const ROUTE_LABELS = {
  support_team: "Support Team",
  peer_support: "Peer Support",
  facility: "Facility",
  crisis: "Crisis Help",
};

export default function LifelineEventsTab({ facilityId, participants }) {
  const [reasonFilter, setReasonFilter] = useState("all");

  const { data: lifelineEvents = [] } = useQuery({
    queryKey: ["lifeline-events", facilityId],
    queryFn: async () => {
      const events = await base44.entities.LifelineEvent.filter({ facility_id: facilityId });
      return events.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
    enabled: !!facilityId,
  });

  // Flag at-risk participants: 2+ high-risk Lifeline events in 7 days
  const getAtRiskParticipants = () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentHighRisk = lifelineEvents.filter(e =>
      ["about_to_use", "already_used"].includes(e.reason) &&
      new Date(e.created_date) >= sevenDaysAgo
    );
    const countByEmail = {};
    recentHighRisk.forEach(e => {
      countByEmail[e.participant_email] = (countByEmail[e.participant_email] || 0) + 1;
    });
    return Object.entries(countByEmail).filter(([, count]) => count >= 2).map(([email]) => email);
  };

  const atRiskEmails = getAtRiskParticipants();

  const filtered = lifelineEvents.filter(e =>
    reasonFilter === "all" || e.reason === reasonFilter
  );

  return (
    <div>
      {/* At-Risk Banner */}
      {atRiskEmails.length > 0 && (
        <div className="mb-6 p-4 rounded-lg" style={{ background: 'rgba(232,93,76,0.1)', border: '1px solid rgba(232,93,76,0.3)' }}>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4" style={{ color: '#E85D4C' }} strokeWidth={1.5} />
            <p className="font-semibold text-sm" style={{ color: '#E85D4C' }}>High-Risk Alert</p>
          </div>
          <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
            {atRiskEmails.length} participant(s) triggered Lifeline 2+ times this week for active use:
          </p>
          {atRiskEmails.map(email => (
            <Badge key={email} className="mr-2 text-xs" style={{ background: '#E85D4C', color: '#FFF' }}>
              {email}
            </Badge>
          ))}
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 flex-wrap mb-4">
        {["all", ...Object.keys(REASON_LABELS)].map(r => (
          <button
            key={r}
            onClick={() => setReasonFilter(r)}
            className="text-xs px-3 py-1.5 rounded-full capitalize font-medium"
            style={{
              background: reasonFilter === r ? (REASON_COLORS[r] || 'var(--primary)') : 'var(--bg-primary)',
              color: reasonFilter === r ? '#FFF' : 'var(--text-secondary)',
              border: `1px solid ${reasonFilter === r ? 'transparent' : 'var(--border)'}`
            }}
          >
            {r === "all" ? "All" : REASON_LABELS[r]}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="card text-center">
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{lifelineEvents.length}</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Events</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold" style={{ color: '#E85D4C' }}>
            {lifelineEvents.filter(e => ["about_to_use", "already_used"].includes(e.reason)).length}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>High-Risk</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold" style={{ color: atRiskEmails.length > 0 ? '#E85D4C' : 'var(--text-primary)' }}>
            {atRiskEmails.length}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>At-Risk This Week</p>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="card text-center py-12">
            <Phone className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} strokeWidth={1.5} />
            <p style={{ color: 'var(--text-muted)' }}>No Lifeline events</p>
          </div>
        ) : (
          filtered.map(event => (
            <div key={event.id} className="card">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Badge
                      className="text-[10px] px-2 py-0.5"
                      style={{ background: `${REASON_COLORS[event.reason] || '#6B7280'}20`, color: REASON_COLORS[event.reason] || '#6B7280' }}
                    >
                      {REASON_LABELS[event.reason] || event.reason}
                    </Badge>
                    {event.route && (
                      <Badge variant="outline" className="text-[10px] px-2 py-0.5">
                        {ROUTE_LABELS[event.route] || event.route}
                      </Badge>
                    )}
                    {event.silent_mode_used && (
                      <Badge variant="outline" className="text-[10px] px-2 py-0.5">Silent Mode</Badge>
                    )}
                    {atRiskEmails.includes(event.participant_email) && (
                      <Badge className="text-[10px] px-2 py-0.5" style={{ background: '#E85D4C', color: '#FFF' }}>
                        AT-RISK
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{event.participant_email}</p>
                  {event.silent_message && (
                    <p className="text-xs mt-1 italic" style={{ color: 'var(--text-muted)' }}>"{event.silent_message}"</p>
                  )}
                  {event.outcome && (
                    <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Outcome: {event.outcome}</p>
                  )}
                </div>
                <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                  {moment(event.created_date).fromNow()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}