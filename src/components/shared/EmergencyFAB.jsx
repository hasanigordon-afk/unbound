import React, { useState, useEffect } from "react";
import { LifeBuoy, X, Phone, MessageSquare, Globe } from "lucide-react";

const RESOURCES = [
  {
    section: "Immediate Crisis",
    items: [
      { name: "911", sub: "Life-threatening emergency", action: "tel:911", type: "phone", urgent: true },
      { name: "988 Suicide & Crisis Lifeline", sub: "24/7 free & confidential", action: "tel:988", type: "phone", urgent: true },
      { name: "Crisis Text Line", sub: "Text HOME to 741741", action: "sms:741741?body=HOME", type: "text", urgent: true },
    ],
  },
  {
    section: "Veterans Support",
    items: [
      { name: "Veterans Crisis Line", sub: "Dial 988, then press 1", action: "tel:988", type: "phone" },
      { name: "Veterans Text Support", sub: "Text 838255", action: "sms:838255", type: "text" },
      { name: "VA Caregiver Support", sub: "1-855-260-3274", action: "tel:18552603274", type: "phone" },
      { name: "Vet Center Combat Call", sub: "1-877-927-8387 · 24/7", action: "tel:18779278387", type: "phone" },
    ],
  },
  {
    section: "Recovery & Substance Use",
    items: [
      { name: "SAMHSA National Helpline", sub: "1-800-662-4357 · 24/7 free", action: "tel:18006624357", type: "phone" },
      { name: "AA 24-Hour Hotline", sub: "1-800-839-1686", action: "tel:18008391686", type: "phone" },
      { name: "Narcotics Anonymous", sub: "Find a meeting now", action: "https://www.na.org/meetingsearch/", type: "web" },
      { name: "SMART Recovery", sub: "Online & in-person meetings", action: "https://meetings.smartrecovery.org/", type: "web" },
    ],
  },
  {
    section: "Mental Health Support",
    items: [
      { name: "NAMI HelpLine", sub: "1-800-950-6264 · M–F 10am–10pm ET", action: "tel:18009506264", type: "phone" },
      { name: "Trans Lifeline", sub: "1-877-565-8860", action: "tel:18775658860", type: "phone" },
      { name: "Domestic Violence Hotline", sub: "1-800-799-7233", action: "tel:18007997233", type: "phone" },
    ],
  },
];

const ICON_BY_TYPE = {
  phone: Phone,
  text: MessageSquare,
  web: Globe,
};

export default function EmergencyFAB() {
  const [open, setOpen] = useState(false);

  // Lock body scroll when sheet is open
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [open]);

  return (
    <>
      {/* Floating action button — sits above bottom nav */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Emergency Support"
        style={{
          position: "fixed",
          right: 18,
          bottom: "calc(86px + env(safe-area-inset-bottom, 0px))",
          zIndex: 60,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "#E07A6C",
          border: "3px solid #FFFFFF",
          boxShadow: "0 8px 24px rgba(224,122,108,0.45), 0 2px 8px rgba(31,41,51,0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          padding: 0,
          animation: "pulse-emergency 2.4s ease-in-out infinite",
        }}
      >
        <LifeBuoy style={{ width: 24, height: 24, color: "#FFFFFF" }} strokeWidth={2.2} />
      </button>

      <style>{`
        @keyframes pulse-emergency {
          0%, 100% { box-shadow: 0 8px 24px rgba(224,122,108,0.45), 0 2px 8px rgba(31,41,51,0.12); }
          50%      { box-shadow: 0 8px 28px rgba(224,122,108,0.65), 0 0 0 8px rgba(224,122,108,0.10); }
        }
        @keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      {/* Modal sheet */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 100,
            background: "rgba(31,41,51,0.55)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            display: "flex", alignItems: "flex-end", justifyContent: "center",
            animation: "fade-in 0.2s ease-out",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%", maxWidth: 480,
              background: "#FFFFFF",
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              maxHeight: "88vh",
              overflowY: "auto",
              paddingBottom: "calc(20px + env(safe-area-inset-bottom, 0px))",
              animation: "slide-up 0.28s cubic-bezier(.22,1,.36,1)",
              boxShadow: "0 -8px 40px rgba(31,41,51,0.18)",
            }}
          >
            {/* Drag handle */}
            <div style={{ display: "flex", justifyContent: "center", paddingTop: 10 }}>
              <div style={{ width: 38, height: 4, borderRadius: 2, background: "#E5EEF1" }} />
            </div>

            {/* Header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "18px 24px 12px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 12,
                  background: "rgba(224,122,108,0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <LifeBuoy style={{ width: 18, height: 18, color: "#E07A6C" }} strokeWidth={2.2} />
                </div>
                <div>
                  <h2 style={{
                    fontFamily: "'Lora', Georgia, serif", fontSize: 20,
                    fontWeight: 600, color: "#1F2933", lineHeight: 1.2,
                  }}>
                    Emergency Support
                  </h2>
                  <p style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
                    Help is available right now. You're not alone.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                style={{
                  width: 34, height: 34, borderRadius: "50%",
                  background: "#F7FAFC", border: "1px solid #E5EEF1",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", flexShrink: 0,
                }}
              >
                <X style={{ width: 16, height: 16, color: "#4A5763" }} />
              </button>
            </div>

            {/* Sections */}
            <div style={{ padding: "8px 16px 8px" }}>
              {RESOURCES.map((section) => (
                <div key={section.section} style={{ marginBottom: 18 }}>
                  <p style={{
                    fontSize: 10, fontWeight: 700, color: "#6B7280",
                    textTransform: "uppercase", letterSpacing: ".1em",
                    padding: "0 8px 8px",
                  }}>
                    {section.section}
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {section.items.map((item) => {
                      const Icon = ICON_BY_TYPE[item.type] || Phone;
                      const isExternal = item.type === "web";
                      return (
                        <a
                          key={item.name}
                          href={item.action}
                          target={isExternal ? "_blank" : undefined}
                          rel={isExternal ? "noopener noreferrer" : undefined}
                          style={{
                            display: "flex", alignItems: "center", gap: 14,
                            padding: "14px 16px",
                            borderRadius: 16,
                            background: item.urgent ? "#FFF7ED" : "#FFFFFF",
                            border: `1px solid ${item.urgent ? "rgba(224,122,108,0.28)" : "#E5EEF1"}`,
                            textDecoration: "none",
                            boxShadow: "0 1px 3px rgba(31,41,51,0.03)",
                          }}
                        >
                          <div style={{
                            width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                            background: item.urgent ? "rgba(224,122,108,0.14)" : "rgba(46,125,122,0.10)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            <Icon
                              style={{
                                width: 17, height: 17,
                                color: item.urgent ? "#E07A6C" : "#2E7D7A",
                              }}
                              strokeWidth={2}
                            />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{
                              fontSize: 14, fontWeight: 700, color: "#1F2933",
                              marginBottom: 2,
                            }}>
                              {item.name}
                            </p>
                            <p style={{ fontSize: 12, color: "#4A5763", lineHeight: 1.4 }}>
                              {item.sub}
                            </p>
                          </div>
                          <span style={{ color: "#6B7280", fontSize: 18, flexShrink: 0 }}>›</span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer disclaimer */}
            <div style={{
              padding: "12px 24px 8px", borderTop: "1px solid #EEF4F6",
            }}>
              <p style={{
                fontSize: 11, color: "#6B7280", lineHeight: 1.6, textAlign: "center",
              }}>
                Ah Ha is a support tool, not a medical provider.<br />
                In a life-threatening emergency, always call 911.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}