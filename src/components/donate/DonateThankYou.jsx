import React from "react";
import { Link } from "react-router-dom";
import { Heart, CheckCircle2 } from "lucide-react";

export default function DonateThankYou({ settings, donationInfo }) {
  return (
    <div style={{ padding: "32px 24px", textAlign: "center" }}>
      <div style={{
        width: 72, height: 72, borderRadius: 20,
        background: "rgba(122,158,126,0.12)",
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 20px",
      }}>
        <CheckCircle2 style={{ width: 36, height: 36, color: "#7A9E7E" }} strokeWidth={1.8} />
      </div>

      <h1 style={{
        fontFamily: "'Lora', Georgia, serif",
        fontSize: 26, fontWeight: 600, color: "#1C1410",
        marginBottom: 10, lineHeight: 1.25,
      }}>
        Thank you{donationInfo?.name && !donationInfo.anonymous ? `, ${donationInfo.name.split(" ")[0]}` : ""}.
      </h1>

      {donationInfo?.amount && (
        <p style={{
          fontSize: 15, fontWeight: 700, color: "#B8823A",
          marginBottom: 18,
        }}>
          ${donationInfo.amount} pledged
        </p>
      )}

      <p style={{
        fontSize: 15, color: "#4A3F35", lineHeight: 1.7,
        maxWidth: 380, margin: "0 auto 28px",
      }}>
        {settings.thank_you_message}
      </p>

      <div style={{
        padding: "20px", borderRadius: 16, marginBottom: 24,
        background: "rgba(184,130,58,0.07)",
        border: "1px solid rgba(184,130,58,0.2)",
      }}>
        <Heart style={{ width: 20, height: 20, color: "#B8823A", margin: "0 auto 8px", display: "block" }} fill="#B8823A" />
        <p style={{ fontSize: 13, color: "#4A3F35", lineHeight: 1.6, fontStyle: "italic" }}>
          "Every dollar becomes another person supported, another story told, another day someone stays the course."
        </p>
      </div>

      <Link to="/" style={{ textDecoration: "none" }}>
        <div style={{
          padding: "13px 24px", borderRadius: 50,
          background: "#B8823A", color: "#fff",
          fontWeight: 700, fontSize: 14,
          display: "inline-block",
        }}>
          Back to Home
        </div>
      </Link>
    </div>
  );
}