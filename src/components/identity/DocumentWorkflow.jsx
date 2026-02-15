import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, CheckCircle2, MapPin, ExternalLink, Phone } from "lucide-react";
import { toast } from "sonner";

const WORKFLOWS = {
  birth_certificate: {
    title: "Obtain Birth Certificate",
    importance: "Your birth certificate is the foundation document needed to get other forms of ID.",
    required: ["Photo ID (if available)", "Proof of identity (utility bill, lease, etc.)", "Application fee ($10-$30)"],
    steps: [
      "Visit your state's vital records office website or in person",
      "Fill out the birth certificate application form",
      "Provide required identification documents",
      "Pay the processing fee (usually $10-$30)",
      "Wait 2-4 weeks for mail delivery or pay extra for expedited service"
    ],
    applyUrl: "https://www.cdc.gov/nchs/w2w/index.htm"
  },
  social_security_card: {
    title: "Obtain Social Security Card",
    importance: "Your Social Security card is essential for employment, benefits, and opening bank accounts.",
    required: ["Birth certificate", "Photo ID or two forms of identification", "Application form SS-5"],
    steps: [
      "Download and complete Form SS-5 from ssa.gov",
      "Gather required documents (original or certified copies only)",
      "Visit your local Social Security office in person",
      "Submit application and documents",
      "Receive your card by mail in 10-14 business days"
    ],
    applyUrl: "https://www.ssa.gov/number-card/"
  },
  state_id: {
    title: "Obtain State ID",
    importance: "A state ID is your primary form of identification for daily activities.",
    required: ["Birth certificate", "Social Security card", "Proof of residency", "Application fee ($5-$50)"],
    steps: [
      "Locate your nearest DMV office",
      "Bring all required documents",
      "Fill out state ID application",
      "Have your photo taken",
      "Pay the fee and receive temporary ID",
      "Receive permanent ID by mail in 2-3 weeks"
    ],
    applyUrl: "https://www.dmv.org/"
  },
  drivers_license: {
    title: "Obtain Driver's License",
    importance: "A driver's license serves as both identification and driving authorization.",
    required: ["Birth certificate", "Social Security card", "Proof of residency", "Application fee ($20-$90)", "Vision test", "Written test", "Road test"],
    steps: [
      "Study your state's driver's manual",
      "Visit your local DMV with required documents",
      "Pass vision screening",
      "Pass written knowledge test",
      "Schedule and pass road skills test",
      "Pay licensing fee and have photo taken",
      "Receive temporary license and wait for permanent one by mail"
    ],
    applyUrl: "https://www.dmv.org/drivers-license.php"
  },
  snap: {
    title: "Apply for SNAP Benefits (Food Assistance)",
    importance: "SNAP provides monthly benefits to help you afford nutritious food. Most people qualify if income is below certain limits.",
    required: ["Photo ID or birth certificate", "Social Security number", "Proof of income (pay stubs, if any)", "Proof of expenses (rent/mortgage, utilities)", "Proof of assets (bank statements, if any)"],
    steps: [
      "Apply online at your state's SNAP portal or visit local office",
      "Complete application with household size, income, and expenses",
      "Gather and submit all required documents",
      "Attend eligibility interview (phone or in-person)",
      "Receive decision within 30 days (7 days for expedited cases)",
      "If approved, receive EBT card and monthly benefits"
    ],
    applyUrl: "https://www.fns.usda.gov/snap/state-directory"
  },
  medicaid: {
    title: "Apply for Medicaid (Health Insurance)",
    importance: "Medicaid provides free or low-cost health coverage including doctor visits, prescriptions, and hospital care.",
    required: ["Photo ID or birth certificate", "Social Security number", "Proof of income (if any)", "Proof of residency", "Proof of citizenship or legal status"],
    steps: [
      "Apply at Healthcare.gov, your state's Medicaid office, or local hospital",
      "Complete application with personal and income information",
      "Submit required documents (can often upload online)",
      "Wait for eligibility determination (usually 45-90 days)",
      "If approved, receive Medicaid card and choose a health plan",
      "Schedule preventive care and needed medical appointments"
    ],
    applyUrl: "https://www.medicaid.gov/medicaid/index.html"
  },
  housing_assistance: {
    title: "Apply for Housing Assistance",
    importance: "Housing assistance programs help cover rent costs, find affordable housing, or provide emergency shelter.",
    required: ["Photo ID", "Social Security number", "Proof of income (if any)", "Proof of homelessness or housing instability", "Birth certificates for all household members"],
    steps: [
      "Contact your local Public Housing Authority (PHA) office",
      "Complete preliminary application for waiting list",
      "Gather required documentation",
      "Attend eligibility interview when called from waiting list",
      "Submit verification documents (income, assets, family composition)",
      "Receive housing voucher or placement if approved",
      "Work with case manager to find approved housing"
    ],
    applyUrl: "https://www.hud.gov/program_offices/public_indian_housing"
  }
};

export default function DocumentWorkflow({ item, onBack }) {
  const [notes, setNotes] = useState(item.notes || "");
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: profile } = useQuery({
    queryKey: ["my-profile"],
    queryFn: async () => {
      const profiles = await base44.entities.MemberProfile.filter({ created_by: user.email });
      return profiles[0];
    },
    enabled: !!user,
  });

  const { data: resources = [] } = useQuery({
    queryKey: ["identity-resources", item.document_type],
    queryFn: () => {
      const typeMap = {
        birth_certificate: "vital_records",
        social_security_card: "social_security",
        state_id: "dmv",
        drivers_license: "dmv",
        snap: "snap",
        medicaid: "medicaid",
        housing_assistance: "housing"
      };
      const resourceType = typeMap[item.document_type];
      if (!resourceType) return [];
      return base44.entities.IdentityResource.filter({ type: resourceType });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.IdentityChecklistItem.update(item.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["identity-checklist"] });
      toast.success("Progress updated!");
    }
  });

  const workflow = WORKFLOWS[item.document_type] || {
    title: item.document_type.replace(/_/g, " "),
    importance: "This document is important for your identity.",
    required: [],
    steps: [],
    applyUrl: null
  };

  const handleStatusChange = (newStatus) => {
    updateMutation.mutate({ status: newStatus, notes });
  };

  const nearbyResources = resources.filter(r => 
    !profile?.location_city || r.city === profile.location_city
  ).slice(0, 3);

  return (
    <div className="space-y-4">
      <Button
        onClick={onBack}
        variant="ghost"
        className="mb-2"
        style={{ color: '#2FF3E0' }}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Checklist
      </Button>

      <div className="glass-card p-5">
        <h2 className="text-lg font-bold mb-3" style={{ color: '#FFFFFF' }}>
          {workflow.title}
        </h2>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold mb-2" style={{ color: '#2FF3E0' }}>
              Why This Matters
            </h3>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
              {workflow.importance}
            </p>
          </div>

          {workflow.required.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-2" style={{ color: '#2FF3E0' }}>
                What You'll Need
              </h3>
              <ul className="space-y-1">
                {workflow.required.map((req, i) => (
                  <li key={i} className="text-sm flex items-start gap-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    <span className="text-teal-400">•</span>
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {workflow.steps.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-2" style={{ color: '#2FF3E0' }}>
                Step-by-Step Instructions
              </h3>
              <ol className="space-y-2">
                {workflow.steps.map((step, i) => (
                  <li key={i} className="text-sm flex gap-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    <span className="font-semibold" style={{ color: '#2FF3E0' }}>{i + 1}.</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {workflow.applyUrl && (
            <Button
              onClick={() => window.open(workflow.applyUrl, '_blank')}
              className="w-full"
              style={{ background: '#7B5CFF', color: '#FFFFFF' }}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Apply Online
            </Button>
          )}
        </div>
      </div>

      {nearbyResources.length > 0 && (
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4" style={{ color: '#2FF3E0' }} />
            <h3 className="font-semibold" style={{ color: '#FFFFFF' }}>Nearby Offices</h3>
          </div>
          <div className="space-y-3">
            {nearbyResources.map(resource => (
              <div key={resource.id} className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <p className="font-medium text-sm mb-1" style={{ color: '#FFFFFF' }}>{resource.name}</p>
                <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {resource.address}, {resource.city}, {resource.state}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {resource.phone && (
                    <a href={`tel:${resource.phone}`} className="text-xs flex items-center gap-1" style={{ color: '#2FF3E0' }}>
                      <Phone className="w-3 h-3" />
                      Call
                    </a>
                  )}
                  {resource.location_lat && resource.location_lng && (
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${resource.location_lat},${resource.location_lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs flex items-center gap-1"
                      style={{ color: '#2FF3E0' }}
                    >
                      <MapPin className="w-3 h-3" />
                      Directions
                    </a>
                  )}
                  {resource.website && (
                    <a
                      href={resource.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs flex items-center gap-1"
                      style={{ color: '#2FF3E0' }}
                    >
                      <ExternalLink className="w-3 h-3" />
                      Website
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold mb-2" style={{ color: '#FFFFFF' }}>Notes</h3>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes about your progress..."
          className="bg-transparent border-white/20 text-white mb-3"
        />

        <div className="flex gap-2">
          {item.status !== "in_progress" && (
            <Button
              onClick={() => handleStatusChange("in_progress")}
              disabled={updateMutation.isPending}
              className="flex-1"
              style={{ background: '#FFB800', color: '#0B0F1F' }}
            >
              Mark In Progress
            </Button>
          )}
          {item.status !== "completed" && (
            <Button
              onClick={() => handleStatusChange("completed")}
              disabled={updateMutation.isPending}
              className="flex-1"
              style={{ background: '#2FF3E0', color: '#0B0F1F' }}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Mark Complete
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}