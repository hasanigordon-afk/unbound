import React, { useState } from "react";
import { AlertTriangle, Phone, MessageSquare, Check } from "lucide-react";

export default function CrisisAlertButton({ contacts = [], crisisMessage = "", onClose }) {
  const [sent, setSent] = useState([]);
  const [confirmed, setConfirmed] = useState(false);

  const notifyContacts = contacts.filter(c => c.notify_on_crisis && c.phone);
  const allContacts = contacts.filter(c => c.phone);

  const defaultMsg = crisisMessage ||
    "I am reaching out because I am struggling right now and need support. Please call or text me as soon as you can.";

  const handleSendSMS = (contact) => {
    const encoded = encodeURIComponent(defaultMsg);
    window.open(`sms:${contact.phone.replace(/\D/g, "")}?body=${encoded}`, "_blank");
    setSent(s => [...s, contact.phone]);
  };

  const handleCallAll = () => {
    setConfirmed(true);
    notifyContacts.forEach((c, i) => {
      setTimeout(() => {
        const encoded = encodeURIComponent(defaultMsg);
        window.open(`sms:${c.phone.replace(/\D/g, "")}?body=${encoded}`, "_blank");
        setSent(s => [...s, c.phone]);
      }, i * 300);
    });
  };

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 70, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "flex-end" }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 540, margin: "0 auto", background: "#fff", borderRadius: "24px 24px 0 0", overflow: "hidden" }}
      >
        {/* Red header */}
        <div style={{ background: "linear-gradient(135deg,#7F1D1D,#DC2626)", padding: "20px 20px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <AlertTriangle style={{ width: 22, height: 22, color: "#fff" }} />
            <p style={{ fontSize: 18, fontWeight: 900, color: "#fff" }}>Crisis Alert</p>
          </div>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", lineHeight: 1.5 }}>
            Send an alert to your support contacts. They will receive a text message asking them to reach out to you immediately.
          </p>
        </div>

        <div style={{ padding: "20px 20px 36px" }}>

          {/* Crisis lines always first */}
          <p style={{ fontSize: 11, fontWeight: 700, color: "#8E8E93", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>
            Immediate crisis lines
          </p>
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            <a href="tel:988" style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "12px 8px",
              background: "#FEF2F2", borderRadius: 12, textDecoration: "none", border: "1px solid #FCA5A5",
            }}>
              <Phone style={{ width: 18, height: 18, color: "#DC2626", marginBottom: 4 }} />
              <p style={{ fontWeight: 800, color: "#DC2626", fontSize: 17 }}>988</p>
              <p style={{ fontSize: 10, color: "#B91C1C", fontWeight: 600 }}>Crisis Line</p>
            </a>
            <a href="tel:911" style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "12px 8px",
              background: "#FFF7ED", borderRadius: 12, textDecoration: "none", border: "1px solid #FED7AA",
            }}>
              <Phone style={{ width: 18, height: 18, color: "#EA580C", marginBottom: 4 }} />
              <p style={{ fontWeight: 800, color: "#EA580C", fontSize: 17 }}>911</p>
              <p style={{ fontSize: 10, color: "#C2410C", fontWeight: 600 }}>Emergency</p>
            </a>
            <a href="sms:741741" style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "12px 8px",
              background: "#EFF6FF", borderRadius: 12, textDecoration: "none", border: "1px solid #BFDBFE",
            }}>
              <MessageSquare style={{ width: 18, height: 18, color: "#2563EB", marginBottom: 4 }} />
              <p style={{ fontWeight: 700, color: "#2563EB", fontSize: 11, textAlign: "center", lineHeight: 1.3 }}>Text HOME</p>
              <p style={{ fontSize: 10, color: "#1D4ED8", fontWeight: 600 }}>to 741741</p>
            </a>
          </div>

          {/* Alert message preview */}
          <p style={{ fontSize: 11, fontWeight: 700, color: "#8E8E93", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>
            Message preview
          </p>
          <div style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 10, padding: "10px 12px", marginBottom: 16, fontSize: 12, color: "#374151", lineHeight: 1.6 }}>
            "{defaultMsg}"
          </div>

          {/* Auto-notify contacts */}
          {notifyContacts.length > 0 && (
            <>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#8E8E93", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>
                Auto-notify contacts ({notifyContacts.length})
              </p>
              <div style={{ marginBottom: 14, display: "flex", flexDirection: "column", gap: 6 }}>
                {notifyContacts.map((c, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px 12px", borderRadius: 10,
                    background: sent.includes(c.phone) ? "#F0FDF4" : "#F9FAFB",
                    border: `1px solid ${sent.includes(c.phone) ? "#86EFAC" : "#E5E7EB"}`,
                  }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#1E1E1E" }}>{c.name}</p>
                      <p style={{ fontSize: 11, color: "#8E8E93" }}>{c.relationship} · {c.phone}</p>
                    </div>
                    {sent.includes(c.phone)
                      ? <Check style={{ width: 16, height: 16, color: "#16A34A" }} />
                      : <span style={{ fontSize: 11, color: "#4A90E2", fontWeight: 600 }}>pending</span>
                    }
                  </div>
                ))}
              </div>
              <button
                onClick={handleCallAll}
                disabled={confirmed}
                style={{
                  width: "100%", padding: "14px", borderRadius: 12, border: "none",
                  background: confirmed ? "#F0FDF4" : "linear-gradient(135deg,#DC2626,#991B1B)",
                  color: confirmed ? "#16A34A" : "#fff",
                  fontWeight: 800, fontSize: 15, cursor: confirmed ? "default" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  marginBottom: 12,
                }}
              >
                {confirmed
                  ? <><Check style={{ width: 16, height: 16 }} /> Messages Opened</>
                  : <><AlertTriangle style={{ width: 16, height: 16 }} /> Alert All {notifyContacts.length} Contact{notifyContacts.length > 1 ? "s" : ""}</>
                }
              </button>
            </>
          )}

          {/* Individual contacts */}
          {allContacts.length > 0 && (
            <>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#8E8E93", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>
                Text individually
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {allContacts.map((c, i) => (
                  <div key={i} style={{ display: "flex", gap: 8 }}>
                    <a
                      href={`tel:${c.phone.replace(/\D/g, "")}`}
                      style={{
                        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: "#F0FDF4", border: "1px solid #86EFAC", textDecoration: "none",
                      }}
                    >
                      <Phone style={{ width: 15, height: 15, color: "#16A34A" }} />
                    </a>
                    <button
                      onClick={() => handleSendSMS(c)}
                      style={{
                        flex: 1, padding: "10px 12px", borderRadius: 10, cursor: "pointer",
                        border: `1px solid ${sent.includes(c.phone) ? "#86EFAC" : "#E5E7EB"}`,
                        background: sent.includes(c.phone) ? "#F0FDF4" : "#F9FAFB",
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        textAlign: "left",
                      }}
                    >
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "#1E1E1E" }}>{c.name}</p>
                        <p style={{ fontSize: 11, color: "#8E8E93" }}>{c.relationship}</p>
                      </div>
                      {sent.includes(c.phone)
                        ? <Check style={{ width: 14, height: 14, color: "#16A34A" }} />
                        : <MessageSquare style={{ width: 14, height: 14, color: "#4A90E2" }} />
                      }
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {allContacts.length === 0 && notifyContacts.length === 0 && (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <p style={{ fontSize: 13, color: "#5A5A5A" }}>
                No support contacts added yet.{" "}
                <button onClick={onClose} style={{ color: "#4A90E2", background: "none", border: "none", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
                  Add contacts →
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}