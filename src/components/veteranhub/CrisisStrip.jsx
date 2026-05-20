import React from "react";
import { Phone, MessageSquare, MapPin } from "lucide-react";
import { VH_COLORS as C } from "./vetHubData";

// Pinned, always-visible crisis bar at the top of the hub.
export default function CrisisStrip() {
  const findEmergency = () => {
    if (!navigator.geolocation) {
      window.open("https://www.va.gov/find-locations/?facilityType=health", "_blank");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const url = `https://www.google.com/maps/search/emergency+room+VA+hospital/@${coords.latitude},${coords.longitude},13z`;
        window.open(url, "_blank");
      },
      () => window.open("https://www.va.gov/find-locations/?facilityType=health", "_blank")
    );
  };

  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(248,113,113,.92), rgba(127,29,29,.72), rgba(13,18,32,.86))",
      borderRadius: 24, padding: "15px 16px 13px", color: "#fff",
      boxShadow: "0 0 34px rgba(248,113,113,.24), 0 16px 44px rgba(0,0,0,.36), inset 0 1px 0 rgba(255,255,255,.14)",
      border: "1px solid rgba(255,210,210,.20)", backdropFilter: "blur(24px) saturate(160%)",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase",
          color: "rgba(255,255,255,0.92)" }}>Veterans Crisis Line · 24/7</p>
        <span style={{ fontSize: 11, fontWeight: 700, background: "rgba(255,255,255,0.16)",
          padding: "2px 9px", borderRadius: 999 }}>Free · Confidential</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        <a href="tel:988" style={btn}>
          <Phone style={{ width: 14, height: 14 }} />
          <div style={{ textAlign: "left" }}>
            <p style={{ fontSize: 13, fontWeight: 800, lineHeight: 1 }}>Call 988</p>
            <p style={{ fontSize: 10, opacity: .85 }}>Press 1</p>
          </div>
        </a>
        <a href="sms:838255" style={btn}>
          <MessageSquare style={{ width: 14, height: 14 }} />
          <div style={{ textAlign: "left" }}>
            <p style={{ fontSize: 13, fontWeight: 800, lineHeight: 1 }}>Text</p>
            <p style={{ fontSize: 10, opacity: .85 }}>838255</p>
          </div>
        </a>
        <button onClick={findEmergency} style={{ ...btn, cursor: "pointer", border: "none" }}>
          <MapPin style={{ width: 14, height: 14 }} />
          <div style={{ textAlign: "left" }}>
            <p style={{ fontSize: 13, fontWeight: 800, lineHeight: 1 }}>Nearest ER</p>
            <p style={{ fontSize: 10, opacity: .85 }}>Find now</p>
          </div>
        </button>
      </div>
    </div>
  );
}

const btn = {
  display: "flex", alignItems: "center", gap: 8,
  padding: "10px 10px", borderRadius: 16,
  background: "rgba(255,255,255,0.12)", color: "#fff",
  textDecoration: "none", fontFamily: "'DM Sans', sans-serif",
  border: "1px solid rgba(255,255,255,0.18)",
};