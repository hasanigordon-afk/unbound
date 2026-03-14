import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, ChevronDown, ExternalLink, Phone, CheckCircle2, Circle } from "lucide-react";

const PROGRAM_TYPES = [
  { type: "medicaid",        label: "Medicaid",          icon: "🏥", color: "#4A90E2",  desc: "Free or low-cost health insurance" },
  { type: "snap",            label: "SNAP / Food",       icon: "🍽️", color: "#22C55E",  desc: "Monthly food assistance benefits" },
  { type: "state_id",        label: "State ID / License",icon: "🪪", color: "#8B5CF6",  desc: "Get or replace your ID documents" },
  { type: "social_security", label: "Social Security",   icon: "🏛️", color: "#F59E0B",  desc: "SSI/SSDI disability benefits" },
  { type: "housing_voucher", label: "Housing Vouchers",  icon: "🏠", color: "#EC4899",  desc: "Section 8 and affordable housing" },
  { type: "reentry_grant",   label: "Reentry Programs",  icon: "🔓", color: "#EF4444",  desc: "Grants and support for reentry" },
  { type: "local_program",   label: "Local Assistance",  icon: "📍", color: "#6B7280",  desc: "City and county programs" },
];

// Built-in guide cards shown when no seeded data
const BUILT_IN_GUIDES = {
  medicaid: {
    steps: ["Go to your state's Medicaid website or HealthCare.gov", "Click 'Apply for Coverage'", "Enter your income, household size, and address", "Submit your application — decisions usually take 1–45 days", "If approved, your coverage starts immediately or on the 1st of the month"],
    documents_required: ["Proof of identity (ID or birth certificate)", "Proof of residency (utility bill, lease)", "Proof of income (pay stubs or unemployment letter)", "Social Security Number (if available)"],
    phone: "1-800-318-2596",
    apply_url: "https://www.healthcare.gov/medicaid-chip/getting-medicaid-chip/",
    processing_time: "1–45 days",
  },
  snap: {
    steps: ["Visit your state's SNAP office or apply online at benefits.gov", "Fill out the application form with household and income info", "Attend a brief interview (phone or in-person)", "Receive your EBT card in the mail within 30 days", "Benefits are reloaded monthly — use at any grocery store"],
    documents_required: ["Photo ID", "Proof of address", "Proof of income or unemployment status", "Social Security Number"],
    phone: "1-800-221-5689",
    apply_url: "https://www.benefits.gov/benefit/361",
    processing_time: "7–30 days",
  },
  state_id: {
    steps: ["Contact your state's DMV to learn what documents are needed", "Gather proof of identity, residence, and Social Security Number", "Go to a DMV office in person (walk-in or appointment)", "Pay the fee or ask about a fee waiver if you have low income", "Your card will arrive by mail in 1–3 weeks"],
    documents_required: ["Birth certificate", "Social Security card", "Proof of current address (bill, lease)", "Court documents if name has changed"],
    phone: "Contact your state DMV",
    apply_url: "https://www.usa.gov/replace-vital-documents",
    processing_time: "1–3 weeks after visit",
  },
  social_security: {
    steps: ["Visit SSA.gov or call 1-800-772-1213 to start your application", "Explain how your disability prevents you from working", "Gather medical records from your treatment providers", "A decision can take 3–6 months — persistence is key", "If denied, you have the right to appeal — seek legal help"],
    documents_required: ["Medical records and diagnoses", "Work history for the last 15 years", "Birth certificate", "Social Security card"],
    phone: "1-800-772-1213",
    apply_url: "https://www.ssa.gov/benefits/disability/",
    processing_time: "3–6 months",
  },
  housing_voucher: {
    steps: ["Contact your local Public Housing Authority (PHA)", "Apply for the Housing Choice Voucher (Section 8) waitlist", "Waitlists can be long — apply as early as possible", "When selected, find a participating landlord", "PHA will pay a portion of your rent directly to the landlord"],
    documents_required: ["Government-issued ID", "Proof of income", "Social Security Number", "Rental history"],
    phone: "HUD: 1-800-569-4287",
    apply_url: "https://www.hud.gov/topics/housing_choice_voucher_program_section_8",
    processing_time: "Waitlists vary by location",
  },
  reentry_grant: {
    steps: ["Contact your local reentry services office or probation officer", "Search NJ ReEntry Services or your state's Second Chance Act programs", "Ask your counselor about facility-specific reentry funds", "Apply for emergency assistance through community organizations", "Keep documentation of your needs (housing, food, ID) to support applications"],
    documents_required: ["Release papers or supervision documents", "Photo ID", "Proof of need (housing, food, etc.)", "Letters from counselor or support worker"],
    phone: "SAMHSA: 1-800-662-4357",
    apply_url: "https://www.benefits.gov",
    processing_time: "Varies by program",
  },
  local_program: {
    steps: ["Call 211 to find local programs in your area", "Ask your counselor for community resource referrals", "Visit a local community action agency", "Check your county government website for emergency assistance", "Keep asking — there are more resources than most people know about"],
    documents_required: ["Photo ID", "Proof of address", "Proof of income or need"],
    phone: "211",
    apply_url: "https://www.211.org",
    processing_time: "Varies",
  },
};

export default function BenefitsAssistance() {
  const [selectedType, setSelectedType] = useState(null);
  const [completedSteps, setCompletedSteps] = useState({});

  const { data: programs = [] } = useQuery({
    queryKey: ["benefits-programs"],
    queryFn: () => base44.entities.BenefitsProgram.list(),
  });

  const activePrograms = programs.filter(p => selectedType ? p.program_type === selectedType : true);

  const toggleStep = (key) => setCompletedSteps(prev => ({ ...prev, [key]: !prev[key] }));

  const getGuide = (type) => {
    const seeded = programs.find(p => p.program_type === type);
    if (seeded?.steps?.length) return { steps: seeded.steps, documents_required: seeded.documents_required || [], apply_url: seeded.apply_url, phone: seeded.phone, processing_time: seeded.processing_time };
    return BUILT_IN_GUIDES[type] || null;
  };

  if (selectedType) {
    const typeInfo = PROGRAM_TYPES.find(t => t.type === selectedType);
    const guide = getGuide(selectedType);

    return (
      <div className="min-h-screen pb-28" style={{ background: "#F7F7F8" }}>
        <div className="px-5 pt-8 pb-5" style={{ background: "#FFF", borderBottom: "1px solid #D1D1D6" }}>
          <button onClick={() => setSelectedType(null)} className="flex items-center gap-1.5 text-sm mb-4" style={{ color: "#4A90E2" }}>
            ← Back to Benefits
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ background: `${typeInfo.color}15` }}>
              {typeInfo.icon}
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: "#1E1E1E" }}>{typeInfo.label}</h1>
              <p className="text-sm" style={{ color: "#8E8E93" }}>{typeInfo.desc}</p>
            </div>
          </div>
        </div>

        <div className="px-5 py-5 space-y-5">
          {guide?.processing_time && (
            <div className="flex items-center gap-3 p-4 rounded-2xl" style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}>
              <span className="text-2xl">⏱</span>
              <div>
                <p className="text-sm font-semibold" style={{ color: "#92400E" }}>Typical Processing Time</p>
                <p className="text-sm" style={{ color: "#78350F" }}>{guide.processing_time}</p>
              </div>
            </div>
          )}

          {guide?.steps?.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "#8E8E93" }}>Step-by-Step Guide</p>
              <div className="space-y-3">
                {guide.steps.map((step, i) => {
                  const key = `${selectedType}-${i}`;
                  const done = completedSteps[key];
                  return (
                    <button key={i} onClick={() => toggleStep(key)}
                      className="w-full flex items-start gap-3 p-4 rounded-2xl text-left"
                      style={{ background: done ? "#F0FDF4" : "#FFF", border: `1.5px solid ${done ? "#BBF7D0" : "#E5E7EB"}` }}>
                      {done
                        ? <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#22C55E" }} />
                        : <div className="w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5" style={{ borderColor: "#D1D1D6" }}><span className="sr-only">{i + 1}</span></div>}
                      <div>
                        <span className="text-xs font-bold mr-2" style={{ color: done ? "#22C55E" : typeInfo.color }}>Step {i + 1}</span>
                        <span className="text-sm" style={{ color: done ? "#15803D" : "#1E1E1E" }}>{step}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {guide?.documents_required?.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "#8E8E93" }}>Documents You'll Need</p>
              <div className="p-4 rounded-2xl space-y-2" style={{ background: "#FFF", border: "1px solid #E5E7EB" }}>
                {guide.documents_required.map((doc, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-sm">📄</span>
                    <p className="text-sm" style={{ color: "#1E1E1E" }}>{doc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            {guide?.phone && (
              <a href={`tel:${guide.phone.replace(/[^\d+]/g, "")}`}
                className="flex items-center justify-center gap-2 py-4 rounded-2xl text-base font-bold"
                style={{ background: "#22C55E", color: "#FFF" }}>
                <Phone className="w-5 h-5" /> Call for Help · {guide.phone}
              </a>
            )}
            {guide?.apply_url && (
              <a href={guide.apply_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-4 rounded-2xl text-base font-bold"
                style={{ background: typeInfo.color, color: "#FFF" }}>
                <ExternalLink className="w-5 h-5" /> Apply Online →
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28" style={{ background: "#F7F7F8" }}>
      <div className="px-5 pt-8 pb-5" style={{ background: "#FFF", borderBottom: "1px solid #D1D1D6" }}>
        <h1 className="text-xl font-bold" style={{ color: "#1E1E1E" }}>Benefits Assistance</h1>
        <p className="text-sm mt-0.5" style={{ color: "#8E8E93" }}>Step-by-step help applying for essential services</p>
      </div>

      <div className="px-5 py-5">
        <p className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: "#8E8E93" }}>Choose a program to get started</p>
        <div className="space-y-3">
          {PROGRAM_TYPES.map(t => (
            <button key={t.type} onClick={() => setSelectedType(t.type)}
              className="w-full flex items-center gap-4 p-4 rounded-2xl text-left"
              style={{ background: "#FFF", border: "1px solid #E5E7EB" }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: `${t.color}12` }}>
                {t.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-base" style={{ color: "#1E1E1E" }}>{t.label}</p>
                <p className="text-sm mt-0.5" style={{ color: "#8E8E93" }}>{t.desc}</p>
              </div>
              <ChevronRight className="w-5 h-5 flex-shrink-0" style={{ color: "#C7C7CC" }} />
            </button>
          ))}
        </div>

        <div className="mt-6 p-5 rounded-2xl" style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
          <p className="font-bold text-sm mb-2" style={{ color: "#15803D" }}>📞 Can't find what you need?</p>
          <p className="text-sm mb-3" style={{ color: "#16A34A" }}>Call 211 — free information and referrals to local programs, 24/7.</p>
          <a href="tel:211" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm" style={{ background: "#22C55E", color: "#FFF" }}>
            <Phone className="w-4 h-4" /> Call 211
          </a>
        </div>
      </div>
    </div>
  );
}