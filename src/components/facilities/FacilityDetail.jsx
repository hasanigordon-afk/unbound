import React from "react";
import { MapPin, Phone, Mail, Globe, Clock, User, Truck, Video, CheckCircle2, XCircle, ArrowLeft, Bookmark, BookmarkCheck, Calendar } from "lucide-react";

const BOOL_ROW = ({ icon: Icon, label, value }) => (
  <div className="flex items-center justify-between py-2.5" style={{ borderBottom: "1px solid #F7F7F8" }}>
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4" style={{ color: "#8E8E93" }} strokeWidth={1.5} />
      <p className="text-sm" style={{ color: "#1E1E1E" }}>{label}</p>
    </div>
    {value
      ? <CheckCircle2 className="w-5 h-5" style={{ color: "#22C55E" }} />
      : <XCircle className="w-5 h-5" style={{ color: "#D1D1D6" }} />}
  </div>
);

const LEVEL_LABELS = { detox: "Detox", inpatient: "Inpatient", residential: "Residential", outpatient: "Outpatient", iop: "IOP", php: "PHP", mat: "MAT" };
const TYPE_LABELS  = { detox: "Detox Center", rehab: "Rehab Facility", outpatient_clinic: "Outpatient Clinic", behavioral_health_center: "Behavioral Health Center", hospital_program: "Hospital-Based Program" };

export default function FacilityDetail({ facility, isSaved, onSave, onBack }) {
  return (
    <div className="min-h-screen pb-28" style={{ background: "#F7F7F8" }}>
      {/* Header */}
      <div className="px-5 pt-6 pb-5" style={{ background: "#FFF", borderBottom: "1px solid #D1D1D6" }}>
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm mb-4" style={{ color: "#4A90E2", background: "none", border: "none" }}>
          <ArrowLeft className="w-4 h-4" /> Back to Results
        </button>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#8E8E93" }}>
              {TYPE_LABELS[facility.facility_type] || facility.facility_type} · {facility.county} County
            </p>
            <h1 className="text-xl font-bold mt-1" style={{ color: "#1E1E1E" }}>{facility.facility_name}</h1>
          </div>
          <button onClick={() => onSave(facility)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold flex-shrink-0"
            style={{ background: isSaved ? "#EBF5FF" : "#F7F7F8", color: isSaved ? "#2563EB" : "#8E8E93", border: "1px solid #E5E7EB" }}>
            {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            {isSaved ? "Saved" : "Save"}
          </button>
        </div>

        {facility.active_status !== "active" && (
          <div className="mt-3 px-3 py-2 rounded-xl" style={{ background: "#FEF3C7", border: "1px solid #FDE68A" }}>
            <p className="text-xs font-semibold" style={{ color: "#92400E" }}>
              ⚠️ {facility.active_status === "inactive" ? "This facility is no longer active." : "Pending verification — call to confirm availability."}
            </p>
          </div>
        )}
      </div>

      <div className="px-5 py-5 space-y-5">
        {/* CTA buttons */}
        <div className="grid grid-cols-2 gap-3">
          {facility.phone && (
            <a href={`tel:${facility.phone}`}
              className="flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-base"
              style={{ background: "#22C55E", color: "#FFF" }}>
              <Phone className="w-5 h-5" /> Call Now
            </a>
          )}
          {facility.website && (
            <a href={facility.website} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-base"
              style={{ background: "#4A90E2", color: "#FFF" }}>
              <Globe className="w-5 h-5" /> Website
            </a>
          )}
        </div>

        {/* Contact info */}
        <div className="rounded-2xl p-4 space-y-3" style={{ background: "#FFF", border: "1px solid #E5E7EB" }}>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#8E8E93" }}>Contact & Location</p>
          {facility.address && (
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#8E8E93" }} />
              <div>
                <p className="text-sm" style={{ color: "#1E1E1E" }}>{facility.address}</p>
                <p className="text-sm" style={{ color: "#1E1E1E" }}>{facility.city}, NJ {facility.zip}</p>
              </div>
            </div>
          )}
          {facility.phone && (
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4" style={{ color: "#8E8E93" }} />
              <a href={`tel:${facility.phone}`} className="text-sm" style={{ color: "#4A90E2" }}>{facility.phone}</a>
            </div>
          )}
          {facility.email && (
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4" style={{ color: "#8E8E93" }} />
              <a href={`mailto:${facility.email}`} className="text-sm" style={{ color: "#4A90E2" }}>{facility.email}</a>
            </div>
          )}
          {facility.admissions_contact && (
            <div className="flex items-center gap-3">
              <User className="w-4 h-4" style={{ color: "#8E8E93" }} />
              <p className="text-sm" style={{ color: "#1E1E1E" }}>Admissions: {facility.admissions_contact}</p>
            </div>
          )}
          {facility.hours_of_operation && (
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4" style={{ color: "#8E8E93" }} />
              <p className="text-sm" style={{ color: "#1E1E1E" }}>{facility.hours_of_operation}</p>
            </div>
          )}
        </div>

        {/* Services */}
        <div className="rounded-2xl p-4" style={{ background: "#FFF", border: "1px solid #E5E7EB" }}>
          <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "#8E8E93" }}>Levels of Care</p>
          {facility.level_of_care?.length > 0 ? (
            <div className="flex gap-2 flex-wrap">
              {facility.level_of_care.map(l => (
                <span key={l} className="px-3 py-1.5 rounded-full text-sm font-semibold" style={{ background: "#EBF5FF", color: "#2563EB" }}>
                  {LEVEL_LABELS[l] || l}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm" style={{ color: "#8E8E93" }}>Contact facility for details.</p>
          )}
        </div>

        {/* Capabilities */}
        <div className="rounded-2xl p-4" style={{ background: "#FFF", border: "1px solid #E5E7EB" }}>
          <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "#8E8E93" }}>Services & Support</p>
          <BOOL_ROW icon={CheckCircle2} label="Detox Available"       value={facility.detox_available} />
          <BOOL_ROW icon={CheckCircle2} label="Inpatient Available"   value={facility.inpatient_available} />
          <BOOL_ROW icon={CheckCircle2} label="IOP Available"         value={facility.iop_available} />
          <BOOL_ROW icon={CheckCircle2} label="PHP Available"         value={facility.php_available} />
          <BOOL_ROW icon={CheckCircle2} label="MAT (Medication)"      value={facility.mat_available} />
          <BOOL_ROW icon={CheckCircle2} label="Dual Diagnosis"        value={facility.dual_diagnosis_support} />
          <BOOL_ROW icon={Video}        label="Telehealth Available"  value={facility.telehealth_available} />
          <BOOL_ROW icon={Truck}        label="Transportation Help"   value={facility.transportation_assistance} />
        </div>

        {/* Insurance */}
        <div className="rounded-2xl p-4" style={{ background: "#FFF", border: "1px solid #E5E7EB" }}>
          <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "#8E8E93" }}>Insurance & Payment</p>
          <BOOL_ROW icon={CheckCircle2} label="Medicaid Accepted"         value={facility.medicaid_accepted} />
          <BOOL_ROW icon={CheckCircle2} label="Private Insurance"         value={facility.private_insurance_accepted} />
          <BOOL_ROW icon={CheckCircle2} label="Self-Pay / Sliding Scale" value={facility.self_pay_accepted} />
        </div>

        {/* Population */}
        {(facility.men_only || facility.women_only || facility.adolescents_served) && (
          <div className="rounded-2xl p-4" style={{ background: "#FFF", border: "1px solid #E5E7EB" }}>
            <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#8E8E93" }}>Who This Facility Serves</p>
            <div className="flex gap-2 flex-wrap">
              {facility.men_only && <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ background: "#EBF5FF", color: "#1D4ED8" }}>Men Only</span>}
              {facility.women_only && <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ background: "#FDF2F8", color: "#9D174D" }}>Women Only</span>}
              {facility.adolescents_served && <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ background: "#FFF7ED", color: "#C2410C" }}>Adolescents</span>}
            </div>
          </div>
        )}

        {/* Description */}
        {facility.description && (
          <div className="rounded-2xl p-4" style={{ background: "#FFF", border: "1px solid #E5E7EB" }}>
            <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#8E8E93" }}>About This Facility</p>
            <p className="text-sm leading-relaxed" style={{ color: "#1E1E1E" }}>{facility.description}</p>
          </div>
        )}

        {/* Tags */}
        {facility.tags?.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {facility.tags.map(t => (
              <span key={t} className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: "#F0F0F3", color: "#5A5A5A" }}>{t}</span>
            ))}
          </div>
        )}

        {/* Last verified */}
        {facility.last_verified && (
          <div className="flex items-center gap-2 text-xs" style={{ color: "#8E8E93" }}>
            <Calendar className="w-3.5 h-3.5" />
            Last verified: {new Date(facility.last_verified).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </div>
        )}

        {/* Referral note */}
        {facility.referral_required && (
          <div className="p-4 rounded-2xl" style={{ background: "#FFF7ED", border: "1px solid #FDE68A" }}>
            <p className="text-sm font-semibold" style={{ color: "#92400E" }}>📋 Referral Required</p>
            <p className="text-xs mt-1" style={{ color: "#78350F" }}>Contact your counselor, doctor, or probation officer to request a referral before calling this facility.</p>
          </div>
        )}
      </div>
    </div>
  );
}