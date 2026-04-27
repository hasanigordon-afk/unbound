import React, { useState } from "react";
import { MapPin, Loader2, Check } from "lucide-react";

const BG_SEL = "rgba(184,130,58,0.10)";
const BORDER_SEL = "2px solid #B8823A";
const BORDER_DEF = "2px solid #E8E2D9";
const ACCENT = "#B8823A";
const TEXT = "#1C1410";
const TEXT_MUTED = "#4A3F35";
const TEXT_DIM = "#9B8E83";
const CARD = "#FDFAF6";

/**
 * Asks for browser geolocation, with manual ZIP entry as a fallback.
 * Calls onChange({ latitude, longitude, zip, granted }) when location is captured.
 */
export default function LocationStep({ value, onChange }) {
  const [status, setStatus] = useState("idle"); // idle | requesting | granted | denied | manual
  const [zip, setZip] = useState(value?.zip || "");
  const [error, setError] = useState("");

  const requestGeolocation = () => {
    setError("");
    if (!navigator.geolocation) {
      setStatus("manual");
      setError("Your browser doesn't support location. Enter your ZIP code instead.");
      return;
    }
    setStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setStatus("granted");
        onChange({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          zip: zip || "",
          granted: true,
        });
      },
      (err) => {
        setStatus("denied");
        setError(
          err.code === 1
            ? "Location permission denied. You can enter your ZIP code instead."
            : "Couldn't get your location. Enter your ZIP code instead."
        );
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleZipChange = (val) => {
    setZip(val);
    if (val.length === 5) {
      onChange({
        latitude: null,
        longitude: null,
        zip: val,
        granted: false,
      });
    }
  };

  const granted = status === "granted";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Use my location card */}
      <button
        onClick={requestGeolocation}
        disabled={status === "requesting" || granted}
        style={{
          width: "100%", textAlign: "left", padding: "16px 18px",
          borderRadius: 14,
          cursor: status === "requesting" || granted ? "default" : "pointer",
          background: granted ? BG_SEL : CARD,
          border: granted ? BORDER_SEL : BORDER_DEF,
          display: "flex", alignItems: "center", gap: 14,
          transition: "all 0.15s",
        }}
      >
        <div style={{
          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
          background: "rgba(184,130,58,0.12)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {status === "requesting"
            ? <Loader2 className="w-5 h-5 animate-spin" style={{ color: ACCENT }} />
            : <MapPin className="w-5 h-5" style={{ color: ACCENT }} />}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ color: TEXT, fontWeight: 700, fontSize: 15, marginBottom: 3 }}>
            {granted ? "Location shared ✓" : "Use my current location"}
          </p>
          <p style={{ color: TEXT_DIM, fontSize: 12, lineHeight: 1.5 }}>
            {granted
              ? "We'll show meetings and resources closest to you."
              : "Allow your browser to share your location so we can find meetings near you."}
          </p>
        </div>
        {granted && <Check className="w-5 h-5 flex-shrink-0" style={{ color: ACCENT }} />}
      </button>

      {error && (
        <p style={{ fontSize: 12, color: "#A32D2D", marginTop: -4 }}>{error}</p>
      )}

      {/* ZIP code fallback */}
      <div style={{
        background: CARD, border: `1px solid #E8E2D9`, borderRadius: 14, padding: "16px 18px",
      }}>
        <p style={{ color: TEXT, fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
          Or enter your ZIP code
        </p>
        <p style={{ color: TEXT_DIM, fontSize: 12, marginBottom: 10, lineHeight: 1.5 }}>
          Don't want to share your location? Just type your ZIP and we'll do the rest.
        </p>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={5}
          placeholder="e.g. 80202"
          value={zip}
          onChange={(e) => handleZipChange(e.target.value.replace(/\D/g, ""))}
          style={{
            width: "100%", padding: "12px 14px", fontSize: 16,
            borderRadius: 10, border: "1.5px solid #E8E2D9",
            background: "#fff", color: TEXT, outline: "none",
            fontFamily: "inherit", boxSizing: "border-box",
            letterSpacing: "0.1em",
          }}
        />
      </div>

      <p style={{ fontSize: 11, color: TEXT_DIM, textAlign: "center", lineHeight: 1.6, marginTop: 4 }}>
        We only use this to show meetings and resources near you. You can change it later.
      </p>
    </div>
  );
}