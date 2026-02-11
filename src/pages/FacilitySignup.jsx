import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Building2, CheckCircle } from "lucide-react";
import { createPageUrl } from "./utils";

const FACILITY_TYPES = ["rehab", "detox", "IOP", "OP", "sober_living", "community_org", "clinic"];

export default function FacilitySignup() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    facility_name: "",
    facility_type: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await base44.entities.Facility.create({
      ...formData,
      addresses: { main: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zip}` },
      verification_status: "pending",
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Application Submitted!</h2>
          <p className="text-slate-600 mb-6">
            We'll review your facility application and contact you at {formData.contact_email} within 2-3 business days.
          </p>
          <Button onClick={() => window.location.href = createPageUrl("Home")} className="bg-teal-600 hover:bg-teal-700">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Facility Signup</h1>
              <p className="text-sm text-slate-500">Join RecoveryLink's network</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Facility Name *</label>
            <Input
              value={formData.facility_name}
              onChange={(e) => setFormData({ ...formData, facility_name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Facility Type *</label>
            <select
              value={formData.facility_type}
              onChange={(e) => setFormData({ ...formData, facility_type: e.target.value })}
              className="w-full h-10 px-3 border border-slate-200 rounded-lg"
              required
            >
              <option value="">Select type...</option>
              {FACILITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Address *</label>
            <Input
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">City *</label>
              <Input
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">State *</label>
              <Input
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">ZIP Code *</label>
            <Input
              value={formData.zip}
              onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Contact Name *</label>
            <Input
              value={formData.contact_name}
              onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Contact Email *</label>
            <Input
              type="email"
              value={formData.contact_email}
              onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Contact Phone *</label>
            <Input
              type="tel"
              value={formData.contact_phone}
              onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
              required
            />
          </div>

          <Button type="submit" className="w-full h-12 bg-teal-600 hover:bg-teal-700">
            Submit Application
          </Button>
        </form>
      </div>
    </div>
  );
}