import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Sparkles, MessageCircle, Video, Phone, Loader2, Star, MapPin, Shield, Heart } from "lucide-react";
import TrackToggle from "@/components/home/TrackToggle";

const ROLE_LABELS = {
  peer_mentor: { label: "Peer Mentor", color: "#10B981", bg: "rgba(16,185,129,0.12)" },
  counselor: { label: "Counselor", color: "#3B82F6", bg: "rgba(59,130,246,0.12)" },
  hybrid: { label: "Peer + Counselor", color: "#8B5CF6", bg: "rgba(139,92,246,0.12)" },
  alumni_volunteer: { label: "Alumni Volunteer", color: "#F59E0B", bg: "rgba(245,158,11,0.12)" },
};

const MODE_ICONS = { chat: MessageCircle, voice: Phone, video: Video };

function MentorCard({ mentor, onConnect }) {
  const role = ROLE_LABELS[mentor.role_type] || ROLE_LABELS.peer_mentor;
  return (
    <div style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 18, padding: "18px 16px" }}>
      <div className="flex items-start gap-3 mb-3">
        <div style={{ width: 46, height: 46, borderRadius: "50%", background: role.bg, border: `2px solid ${role.color}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 20 }}>{mentor.role_type === "alumni_volunteer" ? "🦅" : mentor.role_type === "counselor" ? "🎓" : "🤝"}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p style={{ color: "#FFF", fontWeight: 700, fontSize: 15 }}>{mentor.display_name}</p>
            {mentor.facility_verified && <Shield style={{ width: 13, height: 13, color: "#3B82F6" }} />}
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, color: role.color, background: role.bg, borderRadius: 20, padding: "2px 8px", display: "inline-block", marginTop: 2 }}>
            {role.label}
          </span>
        </div>
        {mentor.rating_avg && (
          <div className="flex items-center gap-1" style={{ flexShrink: 0 }}>
            <Star style={{ width: 12, height: 12, color: "#F59E0B", fill: "#F59E0B" }} />
            <span style={{ fontSize: 12, color: "#F59E0B", fontWeight: 700 }}>{mentor.rating_avg.toFixed(1)}</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {mentor.years_in_recovery && (
          <span style={{ fontSize: 11, color: "#10B981", background: "rgba(16,185,129,0.1)", borderRadius: 20, padding: "3px 9px", fontWeight: 600 }}>
            🔥 {mentor.years_in_recovery}yr{mentor.years_in_recovery !== 1 ? "s" : ""} in recovery
          </span>
        )}
        {mentor.time_in_recovery_range && !mentor.years_in_recovery && (
          <span style={{ fontSize: 11, color: "#10B981", background: "rgba(16,185,129,0.1)", borderRadius: 20, padding: "3px 9px", fontWeight: 600 }}>
            🔥 {mentor.time_in_recovery_range} sober
          </span>
        )}
        {(mentor.location_city || mentor.location_state) && (
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", display: "flex", alignItems: "center", gap: 3 }}>
            <MapPin style={{ width: 10, height: 10 }} />{[mentor.location_city, mentor.location_state].filter(Boolean).join(", ")}
          </span>
        )}
      </div>

      {mentor.bio && (
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.5, marginBottom: 12, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {mentor.bio}
        </p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(mentor.communication_modes || []).map(mode => {
            const Icon = MODE_ICONS[mode];
            return Icon ? <Icon key={mode} style={{ width: 15, height: 15, color: "rgba(255,255,255,0.4)" }} /> : null;
          })}
        </div>
        <button
          onClick={() => onConnect(mentor)}
          style={{ background: "#3B82F6", color: "#FFF", border: "none", borderRadius: 12, padding: "8px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
        >
          Connect
        </button>
      </div>
    </div>
  );
}

export default function NetworkDirectory({ user, memberProfile, onConnect }) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [styleFilter, setStyleFilter] = useState("all");
  const [trackFilter, setTrackFilter] = useState("alcohol");
  const [showMatches, setShowMatches] = useState(false);
  const [matches, setMatches] = useState([]);

  const { data: mentors = [], isLoading } = useQuery({
    queryKey: ["mentors-all"],
    queryFn: () => base44.entities.MentorProfile.filter({ onboarding_complete: true }),
  });

  const handleFindMatch = () => {
    if (!memberProfile) return;
    const scored = mentors.map(mentor => {
      let score = 0;
      if (mentor.primary_lived_experience === memberProfile.primary_substance ||
        mentor.specialties_substances?.includes(memberProfile.primary_substance)) score += 3;
      if (mentor.communication_modes?.includes(memberProfile.comm_mode) ||
        mentor.preferred_support_style === memberProfile.comm_mode) score += 2;
      if (mentor.facility_verified) score += 1;
      if (mentor.rating_avg) score += 1;
      if (mentor.is_alumni_volunteer) score += 0.5;
      return { mentor, score };
    });
    scored.sort((a, b) => b.score - a.score);
    setMatches(scored.slice(0, 5).map(s => s.mentor));
    setShowMatches(true);
  };

  const filtered = useMemo(() => {
    let list = showMatches ? matches : mentors;
    if (search) list = list.filter(m =>
      m.display_name?.toLowerCase().includes(search.toLowerCase()) ||
      m.bio?.toLowerCase().includes(search.toLowerCase()) ||
      m.location_city?.toLowerCase().includes(search.toLowerCase())
    );
    if (roleFilter !== "all") list = list.filter(m => m.role_type === roleFilter);
    if (styleFilter !== "all") list = list.filter(m =>
      m.communication_modes?.includes(styleFilter) || m.preferred_support_style === styleFilter
    );
    // Track filter: show mentors that support this track or "both"
    list = list.filter(m =>
      !m.tracks_supported?.length ||
      m.tracks_supported.includes(trackFilter) ||
      m.tracks_supported.includes("both")
    );
    return list;
  }, [mentors, matches, showMatches, search, roleFilter, styleFilter, trackFilter]);

  return (
    <div className="flex flex-col gap-4">
      {/* Track toggle */}
      <TrackToggle activeTrack={trackFilter} onToggle={setTrackFilter} />

      {/* Smart match banner */}
      <button
        onClick={handleFindMatch}
        style={{ background: "linear-gradient(130deg, rgba(16,185,129,0.2), rgba(59,130,246,0.2))", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 16, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, textAlign: "left", cursor: "pointer", width: "100%" }}
      >
        <Sparkles style={{ width: 22, height: 22, color: "#10B981", flexShrink: 0 }} />
        <div>
          <p style={{ color: "#FFF", fontWeight: 700, fontSize: 14 }}>Find My Match</p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 12 }}>Matched to your substance history & communication style</p>
        </div>
        {showMatches && <span style={{ marginLeft: "auto", fontSize: 11, color: "#10B981", fontWeight: 700 }}>Showing top {matches.length}</span>}
      </button>

      {/* Filters */}
      <div style={{ position: "relative" }}>
        <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "rgba(255,255,255,0.3)" }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, city, or experience…"
          style={{ width: "100%", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: "11px 14px 11px 38px", color: "#FFF", fontSize: 14, outline: "none", boxSizing: "border-box" }}
        />
      </div>

      <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none", paddingBottom: 2 }}>
        {[["all", "All"], ["peer_mentor", "Peer"], ["counselor", "Counselor"], ["alumni_volunteer", "Alumni"], ["hybrid", "Hybrid"]].map(([val, label]) => (
          <button key={val} onClick={() => setRoleFilter(val)} style={{ flexShrink: 0, padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, border: "1px solid", background: roleFilter === val ? "#3B82F6" : "transparent", borderColor: roleFilter === val ? "#3B82F6" : "rgba(255,255,255,0.15)", color: roleFilter === val ? "#FFF" : "rgba(255,255,255,0.5)", cursor: "pointer" }}>
            {label}
          </button>
        ))}
        <div style={{ width: 1, background: "rgba(255,255,255,0.1)", margin: "0 4px", flexShrink: 0 }} />
        {[["all", "Any style"], ["chat", "💬 Chat"], ["voice", "📞 Call"], ["video", "📹 Video"]].map(([val, label]) => (
          <button key={val} onClick={() => setStyleFilter(val)} style={{ flexShrink: 0, padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, border: "1px solid", background: styleFilter === val ? "#8B5CF6" : "transparent", borderColor: styleFilter === val ? "#8B5CF6" : "rgba(255,255,255,0.15)", color: styleFilter === val ? "#FFF" : "rgba(255,255,255,0.5)", cursor: "pointer" }}>
            {label}
          </button>
        ))}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="text-center py-12"><Loader2 style={{ width: 28, height: 28, color: "rgba(255,255,255,0.3)" }} className="animate-spin mx-auto" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <Heart style={{ width: 36, height: 36, color: "rgba(255,255,255,0.2)" }} className="mx-auto mb-3" />
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>No mentors found — try adjusting filters</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(m => <MentorCard key={m.id} mentor={m} onConnect={onConnect} />)}
        </div>
      )}
    </div>
  );
}