import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle, Loader2, Star, MapPin, Clock, ChevronDown, ChevronUp } from "lucide-react";

const C = {
  teal: "#3ECFBF",
  muted: "rgba(255,255,255,0.28)",
  slate: "rgba(255,255,255,0.6)",
};

const MENTOR_BADGES = {
  peer_mentor:       { label: "Peer Mentor",           emoji: "🤝", color: "#A78BFA" },
  counselor:         { label: "Counselor",             emoji: "🏥", color: "#3ECFBF" },
  hybrid:            { label: "Peer Support Specialist",emoji: "💙", color: "#60A5FA" },
  alumni_volunteer:  { label: "Alumni Mentor",         emoji: "⭐", color: "#C9A96E" },
};

const PATHWAY_LABELS = {
  MAT:         "MAT",
  inpatient:   "Inpatient",
  outpatient:  "Outpatient",
  "NA/CA":     "NA/CA",
  SMART:       "SMART Recovery",
  faith_based: "Faith-Based",
  other:       "Other",
};

const RECOVERY_RANGE_LABELS = {
  "0-6mo": "< 6 months",
  "6-12mo":"6–12 months",
  "1-3y":  "1–3 years",
  "3-5y":  "3–5 years",
  "5y+":   "5+ years",
};

function MentorCard({ mentor }) {
  const [expanded, setExpanded] = useState(false);
  const [requested, setRequested] = useState(false);
  const badge = MENTOR_BADGES[mentor.role_type] || MENTOR_BADGES.peer_mentor;

  return (
    <div style={{
      background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 18, padding: "16px", marginBottom: 10,
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
        {/* Avatar */}
        <div style={{
          width: 52, height: 52, borderRadius: 16, flexShrink: 0,
          background: `linear-gradient(135deg,${badge.color}40,${badge.color}15)`,
          border: `2px solid ${badge.color}40`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 22,
        }}>
          {badge.emoji}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <p style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>{mentor.display_name}</p>
            {mentor.facility_verified && (
              <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 20,
                background: "rgba(62,207,191,0.15)", color: C.teal }}>
                ✓ Verified
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
              background: `${badge.color}20`, color: badge.color }}>
              {badge.label}
            </span>
            {mentor.time_in_recovery_range && (
              <span style={{ fontSize: 11, color: C.muted }}>
                {RECOVERY_RANGE_LABELS[mentor.time_in_recovery_range] || mentor.time_in_recovery_range} sober
              </span>
            )}
          </div>
        </div>

        {mentor.rating_avg > 0 && (
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <Star style={{ width: 12, height: 12, color: "#FBBF24" }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: "#FBBF24" }}>
                {mentor.rating_avg.toFixed(1)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Bio snippet */}
      {mentor.bio && (
        <p style={{ fontSize: 13, color: C.slate, lineHeight: 1.6, marginBottom: 10,
          display: "-webkit-box", WebkitLineClamp: expanded ? "unset" : 2,
          WebkitBoxOrient: "vertical", overflow: expanded ? "visible" : "hidden" }}>
          {mentor.bio}
        </p>
      )}

      {/* Expanded details */}
      {expanded && (
        <div style={{ marginBottom: 10 }}>
          {mentor.pathways_experienced?.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase",
                letterSpacing: ".06em", marginBottom: 5 }}>Recovery Methods</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {mentor.pathways_experienced.map(p => (
                  <span key={p} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, fontWeight: 600,
                    background: `${badge.color}15`, color: badge.color, border: `1px solid ${badge.color}30` }}>
                    {PATHWAY_LABELS[p] || p}
                  </span>
                ))}
              </div>
            </div>
          )}

          {(mentor.location_city || mentor.location_state) && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <MapPin style={{ width: 12, height: 12, color: C.muted }} />
              <span style={{ fontSize: 12, color: C.muted }}>
                {[mentor.location_city, mentor.location_state].filter(Boolean).join(", ")}
              </span>
            </div>
          )}

          {mentor.communication_modes?.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Clock style={{ width: 12, height: 12, color: C.muted }} />
              <span style={{ fontSize: 12, color: C.muted }}>
                Available via: {mentor.communication_modes.join(", ")}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Actions row */}
      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <button
          onClick={() => setRequested(true)}
          style={{
            flex: 2, padding: "9px 12px", borderRadius: 10, fontSize: 12, fontWeight: 700,
            border: "none", cursor: "pointer",
            background: requested
              ? "rgba(62,207,191,0.12)"
              : `linear-gradient(135deg,${badge.color},${badge.color}CC)`,
            color: requested ? C.teal : "#fff",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
          }}
        >
          <MessageCircle style={{ width: 12, height: 12 }} />
          {requested ? "Request Sent ✓" : "Request Mentorship"}
        </button>
        <button
          onClick={() => setExpanded(v => !v)}
          style={{
            padding: "9px 12px", borderRadius: 10, fontSize: 12, fontWeight: 700,
            cursor: "pointer", background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)", color: C.muted,
            display: "flex", alignItems: "center", gap: 4,
          }}
        >
          {expanded ? <ChevronUp style={{ width: 14, height: 14 }} /> : <ChevronDown style={{ width: 14, height: 14 }} />}
          {expanded ? "Less" : "More"}
        </button>
      </div>
    </div>
  );
}

const FILTER_TYPES = [
  { value: "all",            label: "All Mentors" },
  { value: "peer_mentor",    label: "Peer Mentors" },
  { value: "alumni_volunteer", label: "Alumni" },
  { value: "counselor",      label: "Counselors" },
  { value: "hybrid",         label: "Peer Support" },
];

export default function MentorshipNetwork({ user }) {
  const [filterType, setFilterType] = useState("all");

  const { data: mentors = [], isLoading } = useQuery({
    queryKey: ["mentors", filterType],
    queryFn: () => {
      if (filterType === "all") return base44.entities.MentorProfile.filter({ onboarding_complete: true }, "-rating_avg", 30);
      return base44.entities.MentorProfile.filter({ role_type: filterType, onboarding_complete: true }, "-rating_avg", 30);
    },
  });

  return (
    <div>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg,rgba(167,139,250,0.12),rgba(167,139,250,0.04))",
        border: "1px solid rgba(167,139,250,0.25)", borderRadius: 16,
        padding: "14px 16px", marginBottom: 16,
      }}>
        <p style={{ fontSize: 14, fontWeight: 800, color: "#A78BFA", marginBottom: 4 }}>🌟 Recovery Mentorship Network</p>
        <p style={{ fontSize: 13, color: C.slate, lineHeight: 1.55 }}>
          Connect with verified mentors who've walked this path. Peer mentors, alumni, and licensed counselors ready to guide you.
        </p>
      </div>

      {/* Mentor roles legend */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        {Object.entries(MENTOR_BADGES).map(([key, b]) => (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: 5,
            padding: "4px 10px", borderRadius: 20, background: `${b.color}12`, border: `1px solid ${b.color}25` }}>
            <span style={{ fontSize: 12 }}>{b.emoji}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: b.color }}>{b.label}</span>
          </div>
        ))}
      </div>

      {/* Type filter */}
      <div style={{ display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none", marginBottom: 16, paddingBottom: 2 }}>
        {FILTER_TYPES.map(f => (
          <button
            key={f.value}
            onClick={() => setFilterType(f.value)}
            style={{
              padding: "7px 14px", borderRadius: 20, border: "none", cursor: "pointer", flexShrink: 0,
              background: filterType === f.value ? "#A78BFA" : "rgba(255,255,255,0.07)",
              color: filterType === f.value ? "#fff" : "rgba(255,255,255,0.5)",
              fontWeight: 700, fontSize: 12,
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Become a mentor CTA */}
      {user && (
        <div style={{
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 14, padding: "14px 16px", marginBottom: 16,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Want to be a mentor?</p>
            <p style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Share your recovery experience to help others.</p>
          </div>
          <button style={{
            padding: "8px 14px", borderRadius: 10, border: "none", cursor: "pointer",
            background: "linear-gradient(135deg,#A78BFA,#8B5CF6)",
            color: "#fff", fontWeight: 700, fontSize: 12, flexShrink: 0,
          }}>
            Apply
          </button>
        </div>
      )}

      {isLoading && (
        <div style={{ textAlign: "center", padding: 40 }}>
          <Loader2 style={{ width: 24, height: 24, color: "#A78BFA", margin: "0 auto" }} className="animate-spin" />
        </div>
      )}

      {!isLoading && mentors.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 20px",
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18 }}>
          <p style={{ fontSize: 26, marginBottom: 10 }}>🌟</p>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 6 }}>
            Mentors coming soon
          </p>
          <p style={{ fontSize: 13, color: C.muted }}>
            Be among the first to sign up as a mentor and help others in recovery.
          </p>
        </div>
      )}

      {mentors.map((m, i) => (
        <MentorCard key={m.id || i} mentor={m} />
      ))}
    </div>
  );
}