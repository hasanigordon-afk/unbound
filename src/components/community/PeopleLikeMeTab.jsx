import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle, UserPlus, Loader2, Search } from "lucide-react";

const C = {
  teal: "#3ECFBF",
  muted: "rgba(255,255,255,0.28)",
  slate: "rgba(255,255,255,0.6)",
};

const MATCH_ATTRIBUTES = [
  { key: "program_type",     label: "Program",      weight: 3 },
  { key: "location_state",   label: "State",        weight: 2 },
  { key: "sobriety_stage",   label: "Recovery Stage", weight: 3 },
];

function daysSince(dateStr) {
  if (!dateStr) return null;
  return Math.floor((Date.now() - new Date(dateStr)) / 86400000);
}

function sobrietyStage(days) {
  if (!days && days !== 0) return null;
  if (days <= 7)   return "first_week";
  if (days <= 30)  return "first_month";
  if (days <= 90)  return "first_90_days";
  if (days <= 365) return "first_year";
  return "long_term";
}

const STAGE_LABELS = {
  first_week:    "First Week",
  first_month:   "First Month",
  first_90_days: "First 90 Days",
  first_year:    "First Year",
  long_term:     "Long-Term Recovery",
};

const STAGE_COLORS = {
  first_week:    "#F87171",
  first_month:   "#FB923C",
  first_90_days: "#FBBF24",
  first_year:    "#34D399",
  long_term:     "#3ECFBF",
};

const PROGRAM_LABELS = {
  post_treatment:     "Post-Treatment",
  post_incarceration: "Reentry",
  housing_transition: "Housing Transition",
};

function scoreMatch(me, other) {
  let score = 0;
  const myDays = daysSince(me.sobriety_start_date);
  const otherDays = daysSince(other.sobriety_start_date);
  const myStage = sobrietyStage(myDays);
  const otherStage = sobrietyStage(otherDays);

  if (myStage && otherStage && myStage === otherStage) score += 3;
  if (me.program_type && me.program_type === other.program_type) score += 3;
  if (me.location_state && me.location_state === other.location_state) score += 2;
  if (me.location_city && me.location_city === other.location_city) score += 1;
  if (me.engagement_mode && me.engagement_mode === other.engagement_mode) score += 1;
  return score;
}

function getDisplayName(email) {
  if (!email) return "Anonymous";
  const prefix = email.split("@")[0];
  // Capitalize first letter, limit length
  return prefix.charAt(0).toUpperCase() + prefix.slice(1, 10) + (prefix.length > 10 ? "…" : "");
}

function PeerCard({ profile, commonScore, onConnect }) {
  const days = daysSince(profile.sobriety_start_date);
  const stage = sobrietyStage(days);
  const stageColor = STAGE_COLORS[stage] || C.teal;
  const [connected, setConnected] = useState(false);

  const tags = [];
  if (profile.program_type) tags.push(PROGRAM_LABELS[profile.program_type] || profile.program_type);
  if (stage) tags.push(STAGE_LABELS[stage]);
  if (profile.location_city && profile.location_state)
    tags.push(`${profile.location_city}, ${profile.location_state}`);
  else if (profile.location_state) tags.push(profile.location_state);

  const matchBars = Math.min(5, Math.ceil(commonScore / 2));

  return (
    <div style={{
      background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 18, padding: "16px", marginBottom: 10,
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
        {/* Avatar + name */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 46, height: 46, borderRadius: "50%",
            background: `linear-gradient(135deg,${stageColor}40,${stageColor}20)`,
            border: `2px solid ${stageColor}50`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, fontWeight: 900, color: stageColor, flexShrink: 0,
          }}>
            {getDisplayName(profile.participant_email).charAt(0)}
          </div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>
              {getDisplayName(profile.participant_email)}
            </p>
            {days !== null && (
              <p style={{ fontSize: 12, color: stageColor, fontWeight: 700 }}>
                🔥 {days} days sober
              </p>
            )}
          </div>
        </div>

        {/* Match score */}
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 4 }}>
            Match
          </p>
          <div style={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
            {[1,2,3,4,5].map(i => (
              <div key={i} style={{
                width: 6, height: 6, borderRadius: "50%",
                background: i <= matchBars ? C.teal : "rgba(255,255,255,0.1)",
              }} />
            ))}
          </div>
        </div>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
          {tags.map(t => (
            <span key={t} style={{
              fontSize: 11, padding: "3px 9px", borderRadius: 20, fontWeight: 600,
              background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.5)",
            }}>
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={() => setConnected(true)}
          style={{
            flex: 1, padding: "9px", borderRadius: 10, fontSize: 12, fontWeight: 700,
            cursor: "pointer", border: "none",
            background: connected
              ? "rgba(62,207,191,0.12)"
              : "linear-gradient(135deg,#3ECFBF,#2CB8AE)",
            color: connected ? C.teal : "#fff",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
          }}
        >
          <UserPlus style={{ width: 12, height: 12 }} />
          {connected ? "Connected ✓" : "Connect"}
        </button>
        <button style={{
          flex: 1, padding: "9px", borderRadius: 10, fontSize: 12, fontWeight: 700,
          cursor: "pointer", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
          color: "rgba(255,255,255,0.6)",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
        }}>
          <MessageCircle style={{ width: 12, height: 12 }} />
          Message
        </button>
      </div>
    </div>
  );
}

export default function PeopleLikeMeTab({ user }) {
  const [search, setSearch] = useState("");

  const { data: myProfile } = useQuery({
    queryKey: ["my-profile", user?.email],
    queryFn: () => base44.entities.ParticipantProfile.filter({ participant_email: user.email }),
    enabled: !!user?.email,
    select: data => data?.[0],
  });

  const { data: allProfiles = [], isLoading } = useQuery({
    queryKey: ["peer-profiles"],
    queryFn: () => base44.entities.ParticipantProfile.list("-created_date", 80),
    enabled: !!user,
  });

  const rankedPeers = useMemo(() => {
    if (!allProfiles.length) return [];
    const others = allProfiles.filter(p => p.participant_email !== user?.email);
    return others
      .map(p => ({ ...p, _score: myProfile ? scoreMatch(myProfile, p) : 0 }))
      .sort((a, b) => b._score - a._score)
      .filter(p => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          (p.participant_email || "").toLowerCase().includes(q) ||
          (p.location_city || "").toLowerCase().includes(q) ||
          (p.location_state || "").toLowerCase().includes(q) ||
          (p.program_type || "").toLowerCase().includes(q)
        );
      });
  }, [allProfiles, myProfile, user, search]);

  if (!user) {
    return (
      <div style={{ textAlign: "center", padding: "48px 20px",
        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18 }}>
        <p style={{ fontSize: 28, marginBottom: 10 }}>👥</p>
        <p style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Sign in to find peers</p>
        <button onClick={() => base44.auth.redirectToLogin()} style={{
          padding: "10px 24px", borderRadius: 12,
          background: "linear-gradient(135deg,#3ECFBF,#2CB8AE)",
          border: "none", color: "#fff", fontWeight: 800, cursor: "pointer",
        }}>Sign In</button>
      </div>
    );
  }

  return (
    <div>
      {/* Header banner */}
      <div style={{
        background: "linear-gradient(135deg,rgba(62,207,191,0.12),rgba(62,207,191,0.04))",
        border: "1px solid rgba(62,207,191,0.25)", borderRadius: 16,
        padding: "14px 16px", marginBottom: 16,
      }}>
        <p style={{ fontSize: 14, fontWeight: 800, color: C.teal, marginBottom: 4 }}>👥 People Like Me</p>
        <p style={{ fontSize: 13, color: C.slate, lineHeight: 1.55 }}>
          Peers matched by recovery stage, program type, and location. Connect with people on a similar path.
        </p>
      </div>

      {/* My profile stage */}
      {myProfile?.sobriety_start_date && (() => {
        const d = daysSince(myProfile.sobriety_start_date);
        const stage = sobrietyStage(d);
        const col = STAGE_COLORS[stage] || C.teal;
        return (
          <div style={{
            background: `${col}0F`, border: `1px solid ${col}30`, borderRadius: 12,
            padding: "10px 14px", marginBottom: 14,
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${col}25`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
              🔥
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: col }}>Your Stage: {STAGE_LABELS[stage]}</p>
              <p style={{ fontSize: 11, color: C.muted }}>{d} days sober · Showing peers in same stage first</p>
            </div>
          </div>
        );
      })()}

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 16 }}>
        <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
          width: 14, height: 14, color: C.muted }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by location, program…"
          style={{
            width: "100%", padding: "10px 12px 10px 34px",
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12, color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box",
          }}
        />
      </div>

      {isLoading && (
        <div style={{ textAlign: "center", padding: 40 }}>
          <Loader2 style={{ width: 24, height: 24, color: C.teal, margin: "0 auto" }} className="animate-spin" />
        </div>
      )}

      {!isLoading && rankedPeers.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 20px",
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18 }}>
          <p style={{ fontSize: 26, marginBottom: 10 }}>🌱</p>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 6 }}>
            Community is growing
          </p>
          <p style={{ fontSize: 13, color: C.muted }}>
            No peers found yet. As more people join, matches will appear here.
          </p>
        </div>
      )}

      {/* Peer count */}
      {rankedPeers.length > 0 && (
        <p style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 12 }}>
          {rankedPeers.length} peers · sorted by compatibility
        </p>
      )}

      {rankedPeers.map((p, i) => (
        <PeerCard key={p.id || i} profile={p} commonScore={p._score} />
      ))}
    </div>
  );
}