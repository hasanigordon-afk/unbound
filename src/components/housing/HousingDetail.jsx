import React from "react";
import { ArrowLeft, Phone, Globe, MapPin, Clock, Users, Shield, Bus, CheckCircle2, AlertTriangle, ExternalLink } from "lucide-react";

const C = {
  teal: "#3ECFBF",
  gold: "#C9A96E",
  navy: "#0B1220",
  slate: "rgba(255,255,255,0.65)",
  muted: "rgba(255,255,255,0.3)",
};

const TYPE_META = {
  sober_living:       { label: "Sober Living",         color: "#3ECFBF", bg: "rgba(62,207,191,0.1)"  },
  halfway_house:      { label: "Halfway House",         color: "#C9A96E", bg: "rgba(201,169,110,0.1)" },
  emergency_shelter:  { label: "Emergency Shelter",     color: "#F87171", bg: "rgba(248,113,113,0.1)" },
  transitional_housing:{ label: "Transitional Housing", color: "#818CF8", bg: "rgba(129,140,248,0.1)" },
  supportive_housing: { label: "Supportive Housing",    color: "#34D399", bg: "rgba(52,211,153,0.1)"  },
};

const WAIT_META = {
  open:    { label: "Open — Beds Available", color: "#34D399", bg: "rgba(52,211,153,0.1)"  },
  limited: { label: "Limited Availability",  color: "#FBBF24", bg: "rgba(251,191,36,0.1)"  },
  full:    { label: "Currently Full",        color: "#F87171", bg: "rgba(248,113,113,0.1)" },
  unknown: { label: "Call to Check",         color: "#94A3B8", bg: "rgba(148,163,184,0.1)" },
};

function Pill({ icon, label, color, bg }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700,
      padding: "5px 11px", borderRadius: 20, background: bg, color }}>
      {icon && <span>{icon}</span>}{label}
    </span>
  );
}

function InfoRow({ icon: IconComp, label, value, color }) {
  if (!value) return null;
  return (
    <div style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <IconComp style={{ width: 15, height: 15, color: color || C.muted }} />
      </div>
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: ".06em" }}>{label}</p>
        <p style={{ fontSize: 14, color: C.slate, marginTop: 2, lineHeight: 1.6 }}>{value}</p>
      </div>
    </div>
  );
}

export default function HousingDetail({ resource, onBack, isSaved, onToggleSave }) {
  const type = TYPE_META[resource.housing_type] || TYPE_META.supportive_housing;
  const wait = WAIT_META[resource.waitlist_status] || WAIT_META.unknown;

  const flags = [
    resource.recovery_focused  && { label: "Recovery Focused", icon: "🛡️", color: C.teal, bg: "rgba(62,207,191,0.08)" },
    resource.reentry_friendly  && { label: "Reentry Friendly",  icon: "🔑", color: "#818CF8", bg: "rgba(129,140,248,0.08)" },
    resource.family_friendly   && { label: "Family Friendly",   icon: "👨‍👩‍👧", color: C.gold, bg: "rgba(201,169,110,0.08)" },
    resource.veteran_specific  && { label: "Veterans",          icon: "⭐", color: "#60A5FA", bg: "rgba(96,165,250,0.08)" },
    resource.medicaid_support  && { label: "Medicaid OK",        icon: "💙", color: "#34D399", bg: "rgba(52,211,153,0.08)" },
    resource.voucher_support   && { label: "Vouchers Accepted",  icon: "🎫", color: "#FBBF24", bg: "rgba(251,191,36,0.08)" },
    resource.transportation_help && { label: "Transport Help",   icon: "🚌", color: "#A78BFA", bg: "rgba(167,139,250,0.08)" },
  ].filter(Boolean);

  const rules = [
    resource.drug_testing_required && "Drug testing required",
    resource.curfew_required && "Curfew in effect",
    resource.self_pay_required && "Self-pay required",
  ].filter(Boolean);

  return (
    <div style={{ background: "linear-gradient(170deg,#070D1C,#0B1424)", minHeight: "100vh", paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(155deg,#0E1D3A,#081426)", padding: "52px 20px 24px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 240, height: 240, borderRadius: "50%",
          background: `radial-gradient(circle,${type.color}18 0%,transparent 70%)`, pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none",
            color: C.teal, fontSize: 13, fontWeight: 700, cursor: "pointer", marginBottom: 16, padding: 0 }}>
            <ArrowLeft style={{ width: 15, height: 15 }} /> Back to Search
          </button>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 12, fontWeight: 800, padding: "4px 10px", borderRadius: 20,
                background: type.bg, color: type.color, marginBottom: 10, display: "inline-block" }}>
                {type.label}
              </span>
              <h1 style={{ fontSize: 22, fontWeight: 900, color: "#fff", lineHeight: 1.2, marginBottom: 6, marginTop: 8 }}>
                {resource.resource_name}
              </h1>
              {(resource.city || resource.county) && (
                <p style={{ fontSize: 13, color: C.muted, display: "flex", alignItems: "center", gap: 4 }}>
                  <MapPin style={{ width: 12, height: 12 }} />
                  {[resource.city, resource.county ? `${resource.county} County` : null, "NJ"].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>
            <button onClick={onToggleSave} style={{
              padding: "10px 14px", borderRadius: 12, border: `1px solid ${isSaved ? "rgba(248,113,113,0.4)" : "rgba(255,255,255,0.15)"}`,
              background: isSaved ? "rgba(248,113,113,0.1)" : "rgba(255,255,255,0.05)",
              color: isSaved ? "#F87171" : C.muted, fontSize: 18, cursor: "pointer", flexShrink: 0,
            }}>
              {isSaved ? "❤️" : "🤍"}
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: "16px 20px", maxWidth: 560, margin: "0 auto" }}>
        {/* Availability status */}
        <div style={{
          background: wait.bg, border: `1px solid ${wait.color}40`, borderRadius: 14,
          padding: "14px 18px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12,
        }}>
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: wait.color, flexShrink: 0,
            boxShadow: `0 0 8px ${wait.color}` }} />
          <div>
            <p style={{ fontSize: 14, fontWeight: 800, color: wait.color }}>{wait.label}</p>
            {resource.bed_availability && (
              <p style={{ fontSize: 12, color: C.slate, marginTop: 2 }}>{resource.bed_availability}</p>
            )}
          </div>
        </div>

        {/* Quick action buttons */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          {resource.phone && (
            <a href={`tel:${resource.phone}`} style={{ flex: 1, textDecoration: "none" }}>
              <button style={{
                width: "100%", padding: "13px", borderRadius: 12,
                background: `linear-gradient(135deg,${C.teal},#2CB8AE)`,
                border: "none", color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: "0 6px 20px rgba(62,207,191,0.25)",
              }}>
                <Phone style={{ width: 15, height: 15 }} /> Call Now
              </button>
            </a>
          )}
          {resource.website && (
            <a href={resource.website.startsWith("http") ? resource.website : `https://${resource.website}`}
              target="_blank" rel="noopener noreferrer" style={{ flex: 1, textDecoration: "none" }}>
              <button style={{
                width: "100%", padding: "13px", borderRadius: 12,
                background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
                color: C.slate, fontWeight: 700, fontSize: 14, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}>
                <Globe style={{ width: 15, height: 15 }} /> Website <ExternalLink style={{ width: 12, height: 12 }} />
              </button>
            </a>
          )}
        </div>

        {/* Cost */}
        {resource.estimated_cost && (
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 14, padding: "16px 18px", marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 6 }}>Estimated Cost</p>
            <p style={{ fontSize: 22, fontWeight: 900, color: C.gold }}>{resource.estimated_cost}</p>
          </div>
        )}

        {/* Feature flags */}
        {flags.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
            {flags.map((f) => <Pill key={f.label} icon={f.icon} label={f.label} color={f.color} bg={f.bg} />)}
          </div>
        )}

        {/* Description */}
        {resource.description && (
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 14, padding: "16px 18px", marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 10 }}>About This Program</p>
            <p style={{ fontSize: 14, color: C.slate, lineHeight: 1.7 }}>{resource.description}</p>
          </div>
        )}

        {/* Details */}
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 14, padding: "0 16px", marginBottom: 16 }}>
          <InfoRow icon={Users} label="Gender Served" value={resource.gender_served ? resource.gender_served.charAt(0).toUpperCase() + resource.gender_served.slice(1) : null} color={C.teal} />
          <InfoRow icon={Shield} label="Age Requirements" value={resource.age_restrictions} color={C.gold} />
          <InfoRow icon={MapPin} label="Address" value={[resource.address, resource.city, resource.zip].filter(Boolean).join(", ")} color={C.muted} />
          <InfoRow icon={Phone} label="Phone" value={resource.phone} color={C.teal} />
          <InfoRow icon={Clock} label="Intake Contact" value={resource.intake_contact} color={C.gold} />
          <InfoRow icon={Bus} label="Transportation" value={resource.transportation_help ? "Transportation assistance available" : null} color="#A78BFA" />
        </div>

        {/* Intake requirements */}
        {resource.intake_requirements && (
          <div style={{ background: "rgba(201,169,110,0.06)", border: "1px solid rgba(201,169,110,0.2)", borderRadius: 14, padding: "16px 18px", marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: C.gold, textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 10 }}>How to Apply / Intake Requirements</p>
            <p style={{ fontSize: 14, color: C.slate, lineHeight: 1.7 }}>{resource.intake_requirements}</p>
          </div>
        )}

        {/* Background / limitations */}
        {resource.background_limitations && (
          <div style={{ background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 14, padding: "16px 18px", marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#F87171", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 10 }}>Background Check Info</p>
            <p style={{ fontSize: 14, color: C.slate, lineHeight: 1.7 }}>{resource.background_limitations}</p>
          </div>
        )}

        {/* Rules */}
        {rules.length > 0 && (
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "16px 18px", marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 10 }}>House Rules</p>
            {rules.map((r) => (
              <div key={r} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <AlertTriangle style={{ width: 13, height: 13, color: "#FBBF24", flexShrink: 0 }} />
                <p style={{ fontSize: 13, color: C.slate }}>{r}</p>
              </div>
            ))}
          </div>
        )}

        {/* Last verified */}
        {resource.last_verified && (
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", textAlign: "center", marginTop: 12 }}>
            ✓ Last verified: {resource.last_verified}
          </p>
        )}
      </div>
    </div>
  );
}