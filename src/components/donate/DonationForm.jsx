import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Heart, Loader2, Lock } from "lucide-react";

export default function DonationForm({ settings, onSuccess }) {
  const amounts = settings.donation_amounts?.length ? settings.donation_amounts : [5, 10, 25, 50, 100];
  const [selectedAmount, setSelectedAmount] = useState(amounts[2] || 25);
  const [customAmount, setCustomAmount] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const finalAmount = isCustom ? parseFloat(customAmount) : selectedAmount;
  const canSubmit = name.trim() && email.trim() && finalAmount > 0 && !submitting;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!canSubmit) return;
    setSubmitting(true);
    await base44.entities.Donation.create({
      donor_name: anonymous ? "Anonymous" : name.trim(),
      donor_email: email.trim(),
      amount: finalAmount,
      message: message.trim() || null,
      is_anonymous: anonymous,
      status: "pledged",
    });
    setSubmitting(false);
    onSuccess({ amount: finalAmount, name: name.trim(), anonymous });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Amount selector */}
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#9B8E83", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10 }}>
          Choose an amount
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 10 }}>
          {amounts.map((a) => {
            const sel = !isCustom && selectedAmount === a;
            return (
              <button
                key={a}
                type="button"
                onClick={() => { setIsCustom(false); setSelectedAmount(a); }}
                style={{
                  padding: "14px 8px", borderRadius: 12, cursor: "pointer",
                  background: sel ? "#B8823A" : "#FDFAF6",
                  border: `1.5px solid ${sel ? "#B8823A" : "#E8E2D9"}`,
                  color: sel ? "#fff" : "#1C1410",
                  fontWeight: 700, fontSize: 15,
                  transition: "all 0.15s ease",
                }}
              >
                ${a}
              </button>
            );
          })}
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px 14px", borderRadius: 12,
          background: isCustom ? "rgba(184,130,58,0.06)" : "#FDFAF6",
          border: `1.5px solid ${isCustom ? "#B8823A" : "#E8E2D9"}`,
        }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#4A3F35" }}>$</span>
          <input
            type="number"
            min="1"
            step="0.01"
            value={customAmount}
            onFocus={() => setIsCustom(true)}
            onChange={(e) => { setIsCustom(true); setCustomAmount(e.target.value); }}
            placeholder="Custom amount"
            style={{
              flex: 1, border: "none", background: "transparent",
              fontSize: 15, color: "#1C1410", outline: "none", padding: 0,
            }}
          />
        </div>
      </div>

      {/* Name */}
      <div>
        <label style={{ fontSize: 12, fontWeight: 600, color: "#4A3F35", marginBottom: 6, display: "block" }}>
          Full name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          required
          style={{ width: "100%", padding: "11px 14px", borderRadius: 10, boxSizing: "border-box", border: "1px solid #E8E2D9", background: "#FDFAF6", fontSize: 14, outline: "none" }}
        />
      </div>

      {/* Email */}
      <div>
        <label style={{ fontSize: 12, fontWeight: 600, color: "#4A3F35", marginBottom: 6, display: "block" }}>
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          style={{ width: "100%", padding: "11px 14px", borderRadius: 10, boxSizing: "border-box", border: "1px solid #E8E2D9", background: "#FDFAF6", fontSize: 14, outline: "none" }}
        />
      </div>

      {/* Message */}
      <div>
        <label style={{ fontSize: 12, fontWeight: 600, color: "#4A3F35", marginBottom: 6, display: "block" }}>
          Message of support <span style={{ color: "#9B8E83", fontWeight: 400 }}>(optional)</span>
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          placeholder="Share a word of encouragement…"
          style={{ width: "100%", padding: "11px 14px", borderRadius: 10, boxSizing: "border-box", border: "1px solid #E8E2D9", background: "#FDFAF6", fontSize: 14, outline: "none", resize: "none", fontFamily: "inherit", lineHeight: 1.55 }}
        />
      </div>

      {/* Anonymous */}
      <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "10px 0" }}>
        <input
          type="checkbox"
          checked={anonymous}
          onChange={(e) => setAnonymous(e.target.checked)}
          style={{ width: 16, height: 16, accentColor: "#B8823A", cursor: "pointer" }}
        />
        <span style={{ fontSize: 13, color: "#4A3F35", fontWeight: 500 }}>
          Make this donation anonymous
        </span>
      </label>

      {error && (
        <p style={{ fontSize: 13, color: "#B85C5C", textAlign: "center" }}>{error}</p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={!canSubmit}
        style={{
          width: "100%", padding: "15px", borderRadius: 50, border: "none",
          background: canSubmit ? "#B8823A" : "#E8E2D9",
          color: canSubmit ? "#fff" : "#9B8E83",
          fontWeight: 700, fontSize: 15,
          cursor: canSubmit ? "pointer" : "not-allowed",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          fontFamily: "'DM Sans', sans-serif",
          marginTop: 4,
        }}
      >
        {submitting ? (
          <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" />
        ) : (
          <Heart style={{ width: 16, height: 16 }} fill="#fff" />
        )}
        {submitting ? "Processing…" : `Give Hope Today${finalAmount > 0 ? ` — $${finalAmount}` : ""}`}
      </button>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 4 }}>
        <Lock style={{ width: 11, height: 11, color: "#9B8E83" }} />
        <p style={{ fontSize: 11, color: "#9B8E83" }}>
          Your information is kept private and secure.
        </p>
      </div>
    </form>
  );
}