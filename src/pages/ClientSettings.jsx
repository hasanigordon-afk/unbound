import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { LogOut, Phone, User, Shield, Bell, Heart, Bookmark, ChevronRight } from "lucide-react";

const QUICK_LINKS = [
  { icon: "🔖", label: "Saved Resources", page: "SavedResources" },
  { icon: "📋", label: "My Plan & Goals", page: "ForwardPlan" },
  { icon: "🆘", label: "Get Help Now", page: "UrgentHelp" },
];

const STAGE_LABELS = {
  using_currently:    "Still using",
  trying_to_stop:     "Want to stop",
  detox_last_14_days: "Just stopped",
  early_recovery_15_90: "Early recovery",
  recovery_3_12_months: "A few months in",
  long_term_1_year_plus: "Over a year strong",
  relapsed_recently:  "Getting back up",
};

export default function ClientSettings() {
  const queryClient = useQueryClient();
  const { data: user } = useQuery({ queryKey: ["user"], queryFn: () => base44.auth.me() });

  const { data: profiles } = useQuery({
    queryKey: ["my-profile", user?.email],
    queryFn: () => base44.entities.MemberProfile.filter({ created_by: user.email }),
    enabled: !!user,
  });

  const profile = profiles?.[0];
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [saved, setSaved] = useState(false);

  return (
    <div style={{ background: "#F5F5F7", minHeight: "100vh", paddingBottom: 100 }}>

      {/* Header */}
      <div style={{ background: "#FFF", padding: "32px 20px 24px", borderBottom: "1px solid #E5E7EB" }}>
        <p style={{ fontSize: 13, color: "#8E8E93", fontWeight: 500, marginBottom: 4 }}>Your account</p>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1E1E1E" }}>Settings</h1>
      </div>

      <div style={{ padding: "20px", maxWidth: 480, margin: "0 auto", display: "flex", flexDirection: "column", gap: 14 }}>

        {/* Profile card */}
        <div style={{ background: "#FFF", border: "1px solid #E2E8F0", borderRadius: 18, padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: profile ? 16 : 0 }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <User className="w-6 h-6" style={{ color: "#4A90E2" }} strokeWidth={1.5} />
            </div>
            <div>
              <p style={{ fontSize: 17, fontWeight: 700, color: "#1E1E1E" }}>{user?.full_name || "You"}</p>
              <p style={{ fontSize: 13, color: "#94A3B8" }}>{user?.email}</p>
            </div>
          </div>
          {profile?.stage && (
            <div style={{ background: "#F0FDF4", border: "1px solid #86EFAC", borderRadius: 10, padding: "10px 14px" }}>
              <p style={{ fontSize: 13, color: "#15803D", fontWeight: 600 }}>
                {STAGE_LABELS[profile.stage] || profile.stage}
              </p>
              {profile.location_city && (
                <p style={{ fontSize: 12, color: "#16A34A", marginTop: 2 }}>
                  📍 {profile.location_city}{profile.location_state ? `, ${profile.location_state}` : ""}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Quick links */}
        <div style={{ background: "#FFF", border: "1px solid #E2E8F0", borderRadius: 18, overflow: "hidden" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#8E8E93", textTransform: "uppercase", letterSpacing: "0.6px", padding: "14px 20px 8px" }}>Quick Access</p>
          {QUICK_LINKS.map((l, i) => (
            <Link key={l.page} to={createPageUrl(l.page)} style={{ textDecoration: "none" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 14, padding: "14px 20px",
                borderTop: i > 0 ? "1px solid #F1F5F9" : "none",
              }}>
                <span style={{ fontSize: 20 }}>{l.icon}</span>
                <p style={{ flex: 1, fontSize: 15, fontWeight: 600, color: "#1E1E1E" }}>{l.label}</p>
                <ChevronRight className="w-4 h-4" style={{ color: "#CBD5E1" }} strokeWidth={1.5} />
              </div>
            </Link>
          ))}
        </div>

        {/* Crisis numbers */}
        <div style={{ background: "#FFF", border: "1px solid #E2E8F0", borderRadius: 18, padding: "20px" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#8E8E93", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 14 }}>Crisis & Support</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <a href="tel:988" style={{ display: "flex", alignItems: "center", gap: 14, background: "#FEF2F2", borderRadius: 12, padding: "14px 16px", textDecoration: "none" }}>
              <Phone className="w-5 h-5" style={{ color: "#DC2626", flexShrink: 0 }} strokeWidth={1.5} />
              <div>
                <p style={{ fontWeight: 700, fontSize: 15, color: "#DC2626" }}>988 — Crisis Lifeline</p>
                <p style={{ fontSize: 12, color: "#991B1B" }}>Call or text, 24/7, free</p>
              </div>
            </a>
            <a href="sms:741741" style={{ display: "flex", alignItems: "center", gap: 14, background: "#EFF6FF", borderRadius: 12, padding: "14px 16px", textDecoration: "none" }}>
              <Phone className="w-5 h-5" style={{ color: "#2563EB", flexShrink: 0 }} strokeWidth={1.5} />
              <div>
                <p style={{ fontWeight: 700, fontSize: 15, color: "#2563EB" }}>Text HOME to 741741</p>
                <p style={{ fontSize: 12, color: "#1D4ED8" }}>Crisis Text Line</p>
              </div>
            </a>
            <a href="tel:18006624357" style={{ display: "flex", alignItems: "center", gap: 14, background: "#FFF7ED", borderRadius: 12, padding: "14px 16px", textDecoration: "none" }}>
              <Phone className="w-5 h-5" style={{ color: "#EA580C", flexShrink: 0 }} strokeWidth={1.5} />
              <div>
                <p style={{ fontWeight: 700, fontSize: 15, color: "#EA580C" }}>1-800-662-4357</p>
                <p style={{ fontSize: 12, color: "#C2410C" }}>SAMHSA Treatment Helpline</p>
              </div>
            </a>
          </div>
        </div>

        {/* Privacy note */}
        <div style={{ background: "#F0FDF4", border: "1px solid #86EFAC", borderRadius: 14, padding: "14px 18px", display: "flex", gap: 12, alignItems: "flex-start" }}>
          <Shield className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#16A34A" }} strokeWidth={1.5} />
          <p style={{ fontSize: 13, color: "#15803D", lineHeight: 1.55 }}>
            Your check-ins and notes are private. Only your assigned support team can see your progress if you're enrolled in a facility program.
          </p>
        </div>

        {/* Sign out */}
        <button
          onClick={() => base44.auth.logout()}
          style={{
            background: "#FFF", border: "1px solid #FECACA", borderRadius: 14,
            padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "center",
            gap: 10, fontSize: 15, fontWeight: 600, color: "#DC2626", cursor: "pointer", width: "100%",
          }}
        >
          <LogOut className="w-5 h-5" strokeWidth={1.5} />
          Sign Out
        </button>

        <p style={{ fontSize: 11, color: "#94A3B8", textAlign: "center", lineHeight: 1.6 }}>
          Unbound is a support tool, not a medical provider.{"\n"}In an emergency, call 911.
        </p>
      </div>
    </div>
  );
}