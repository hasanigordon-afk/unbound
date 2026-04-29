import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Heart, Users, Sparkles, Shield } from "lucide-react";
import { getCampaignSettings } from "@/lib/campaignSettings";
import DonationForm from "@/components/donate/DonationForm";
import DonateThankYou from "@/components/donate/DonateThankYou";

const IMPACT_ITEMS = [
  { icon: Users,     title: "Expand Access",       text: "Reach more people fighting addiction in communities that need it most." },
  { icon: Heart,     title: "Fuel Support",        text: "Fund outreach, recovery tools, and real human connection." },
  { icon: Sparkles,  title: "Build Hope",          text: "Power new features, stories, and encouragement for the journey." },
  { icon: Shield,    title: "Strengthen Recovery", text: "Help us support facilities, mentors, and accountability partners." },
];

export default function Donate() {
  const [donationInfo, setDonationInfo] = useState(null);

  const { data: settings, isLoading } = useQuery({
    queryKey: ["campaign-settings"],
    queryFn: getCampaignSettings,
  });

  if (isLoading || !settings) {
    return (
      <div style={{ background: "#F7F3EE", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#9B8E83", fontSize: 13 }}>Loading…</div>
      </div>
    );
  }

  if (!settings.donation_enabled) {
    return (
      <div style={{ background: "#F7F3EE", minHeight: "100vh", padding: "60px 24px", textAlign: "center" }}>
        <p style={{ fontSize: 15, color: "#4A3F35", lineHeight: 1.7 }}>
          Donations are not currently being accepted. Please check back soon.
        </p>
        <Link to="/" style={{ textDecoration: "none", color: "#B8823A", fontWeight: 700, fontSize: 14, marginTop: 20, display: "inline-block" }}>
          ← Back to Home
        </Link>
      </div>
    );
  }

  if (donationInfo) {
    return (
      <div style={{ background: "#F7F3EE", minHeight: "100vh", paddingBottom: 120 }}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <DonateThankYou settings={settings} donationInfo={donationInfo} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#F7F3EE", minHeight: "100vh", paddingBottom: 120 }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>

        {/* Back nav */}
        <div style={{ padding: "20px 20px 0" }}>
          <Link to="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, color: "#4A3F35", fontSize: 13, fontWeight: 600 }}>
            <ArrowLeft style={{ width: 15, height: 15 }} />
            Back
          </Link>
        </div>

        {/* Hero */}
        <div style={{
          padding: "28px 24px 32px",
          textAlign: "center",
          position: "relative",
        }}>
          {settings.banner_image_url && (
            <div style={{
              width: "100%", height: 160, borderRadius: 16, overflow: "hidden", marginBottom: 20,
              background: `url(${settings.banner_image_url}) center/cover`,
            }} />
          )}

          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: "rgba(184,130,58,0.12)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
          }}>
            <Heart style={{ width: 28, height: 28, color: "#B8823A" }} fill="#B8823A" />
          </div>

          <h1 style={{
            fontFamily: "'Lora', Georgia, serif",
            fontSize: 28, fontWeight: 600, color: "#1C1410",
            lineHeight: 1.2, marginBottom: 12,
          }}>
            {settings.donation_headline}
          </h1>

          <p style={{
            fontSize: 15, color: "#4A3F35", lineHeight: 1.65,
            maxWidth: 400, margin: "0 auto",
          }}>
            {settings.donation_subheadline}
          </p>
        </div>

        {/* Total raised counter + thank-you note */}
        <div style={{ padding: "0 20px 24px" }}>
          <div style={{
            background: "#FDFAF6", border: "1px solid #E8E2D9",
            borderRadius: 16, padding: "20px 20px",
            textAlign: "center",
          }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#9B8E83", textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 6 }}>
              Total Raised
            </p>
            <p style={{
              fontFamily: "'Lora', Georgia, serif",
              fontSize: 32, fontWeight: 700, color: "#B8823A",
              lineHeight: 1.1, marginBottom: 14,
            }}>
              ${(settings.donation_raised || 0).toLocaleString()}
            </p>

            <div style={{ height: 1, background: "#E8E2D9", margin: "0 auto 14px", maxWidth: 80 }} />

            <Heart style={{ width: 18, height: 18, color: "#B8823A", margin: "0 auto 8px", display: "block" }} fill="#B8823A" />
            <p style={{ fontSize: 14, fontWeight: 700, color: "#1C1410", marginBottom: 6, fontFamily: "'Lora', Georgia, serif" }}>
              Thank you — every penny counts.
            </p>
            <p style={{ fontSize: 12, color: "#4A3F35", lineHeight: 1.65 }}>
              No gift is too small. Every dollar, every dime is appreciated and goes toward supporting people in recovery.
            </p>
          </div>
        </div>

        {/* Mission */}
        <div style={{ padding: "0 20px 24px" }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "#9B8E83", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 12 }}>
            Our Mission
          </p>
          <div style={{
            background: "#FDFAF6", border: "1px solid #E8E2D9",
            borderRadius: 16, padding: "20px 22px",
          }}>
            <p style={{ fontSize: 14, color: "#4A3F35", lineHeight: 1.75 }}>
              {settings.mission_statement}
            </p>
          </div>
        </div>

        {/* Impact */}
        <div style={{ padding: "0 20px 28px" }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "#9B8E83", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 12 }}>
            Your Impact
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {IMPACT_ITEMS.map(({ icon: Icon, title, text }) => (
              <div key={title} style={{
                background: "#FDFAF6", border: "1px solid #E8E2D9",
                borderRadius: 14, padding: "14px 14px",
              }}>
                <Icon style={{ width: 18, height: 18, color: "#B8823A", marginBottom: 8 }} strokeWidth={1.8} />
                <p style={{ fontSize: 13, fontWeight: 700, color: "#1C1410", marginBottom: 4 }}>{title}</p>
                <p style={{ fontSize: 11, color: "#9B8E83", lineHeight: 1.5 }}>{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Donation form */}
        <div style={{ padding: "0 20px" }}>
          <div style={{
            background: "#FDFAF6", border: "1px solid #E8E2D9",
            borderRadius: 18, padding: "24px 22px",
          }}>
            <h2 style={{
              fontFamily: "'Lora', Georgia, serif",
              fontSize: 20, fontWeight: 600, color: "#1C1410",
              marginBottom: 20, textAlign: "center",
            }}>
              Make Your Gift
            </h2>
            <DonationForm settings={settings} onSuccess={setDonationInfo} />
          </div>
        </div>

        {/* Footer note */}
        <p style={{
          textAlign: "center", fontSize: 11, color: "#9B8E83",
          padding: "20px 32px 8px", lineHeight: 1.7,
        }}>
          Thank you for being part of this movement. Recovery is possible — and it happens together.
        </p>
      </div>
    </div>
  );
}