import React, { useState } from "react";
import { Shield, ChevronDown, ChevronUp, CheckCircle2, AlertTriangle } from "lucide-react";

const GUIDELINES = [
  {
    category: "Check-Ins & Reporting",
    icon: "📋",
    color: "#4A90E2",
    rules: [
      "Complete your daily digital check-in every day without exception.",
      "Report any change of address or phone number to your officer within 24 hours.",
      "Attend all scheduled in-person meetings with your probation/parole officer.",
      "Respond promptly to any communication from your officer.",
    ],
  },
  {
    category: "Substance Use",
    icon: "🚫",
    color: "#EF4444",
    rules: [
      "Do not use, possess, or purchase any illegal drugs or controlled substances.",
      "Do not consume alcohol unless specifically permitted by your court order.",
      "Submit to drug and alcohol testing whenever requested by your officer.",
      "Notify your officer immediately if you are prescribed any new medication.",
    ],
  },
  {
    category: "Treatment & Programs",
    icon: "🏥",
    color: "#22C55E",
    rules: [
      "Attend all court-ordered treatment, counseling, or support group sessions.",
      "Do not miss scheduled appointments without prior approval from your officer.",
      "Actively participate in and complete all required programs.",
      "Provide proof of attendance when requested.",
    ],
  },
  {
    category: "Employment & Education",
    icon: "💼",
    color: "#F59E0B",
    rules: [
      "Maintain lawful employment, schooling, or an approved vocational program.",
      "Notify your officer within 72 hours if you lose or change your job.",
      "Do not quit employment without first consulting your officer.",
    ],
  },
  {
    category: "Associations & Travel",
    icon: "🗺️",
    color: "#8B5CF6",
    rules: [
      "Do not associate with anyone who has a criminal record without prior approval.",
      "Do not leave the county/state without written permission from your officer.",
      "Avoid places where illegal activity is known to occur.",
      "Obtain written permission before traveling overnight.",
    ],
  },
  {
    category: "Legal & Financial",
    icon: "⚖️",
    color: "#D97706",
    rules: [
      "Do not commit any new criminal offense.",
      "Pay all court-ordered fines, fees, and restitution on schedule.",
      "Notify your officer immediately if you are arrested or cited for any reason.",
      "Do not possess any firearms, weapons, or dangerous instruments.",
    ],
  },
];

function GuidelineCard({ section }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ background: "#FFF", border: "1px solid #D1D1D6", borderRadius: "8px", overflow: "hidden" }}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-4"
        style={{ background: "none", cursor: "pointer" }}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{section.icon}</span>
          <p className="text-sm font-semibold text-left" style={{ color: "#1E1E1E" }}>{section.category}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: section.color + "18", color: section.color }}>
            {section.rules.length} rules
          </span>
          {expanded ? <ChevronUp className="w-4 h-4" style={{ color: "#8E8E93" }} /> : <ChevronDown className="w-4 h-4" style={{ color: "#8E8E93" }} />}
        </div>
      </button>

      {expanded && (
        <div style={{ borderTop: "1px solid #F0F0F3" }}>
          {section.rules.map((rule, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3" style={{ borderTop: i > 0 ? "1px solid #F7F7F8" : "none" }}>
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: section.color }} strokeWidth={1.5} />
              <p className="text-sm leading-relaxed" style={{ color: "#374151" }}>{rule}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CourtGuidelinesReminder() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Warning Banner */}
      <div className="flex items-start gap-3 p-4 rounded-lg" style={{ background: "#FEF3C7", border: "1px solid #FCD34D" }}>
        <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#D97706" }} strokeWidth={1.5} />
        <div>
          <p className="text-sm font-semibold" style={{ color: "#92400E" }}>Court-Ordered Compliance Required</p>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: "#78350F" }}>
            These are standard court supervision guidelines. Your specific conditions may vary — always refer to your official court documents and speak with your officer if you have any questions.
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 px-1">
        <Shield className="w-5 h-5" style={{ color: "#4A90E2" }} strokeWidth={1.5} />
        <div>
          <p className="text-sm font-semibold" style={{ color: "#1E1E1E" }}>Your Compliance Guidelines</p>
          <p className="text-xs" style={{ color: "#8E8E93" }}>Tap each category to expand rules</p>
        </div>
      </div>

      {/* Guidelines Cards */}
      {GUIDELINES.map((section) => (
        <GuidelineCard key={section.category} section={section} />
      ))}

      {/* Footer Note */}
      <div className="text-center px-4 pb-2">
        <p className="text-xs leading-relaxed" style={{ color: "#8E8E93" }}>
          When in doubt, always ask your officer before taking action. Staying informed keeps you free.
        </p>
      </div>
    </div>
  );
}